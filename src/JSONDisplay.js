import React, { useState, useEffect } from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';

import './JSONDisplay.css'; // Add this line to import the CSS file
import { BonusMap, petNameArray } from './itemMapping';
import PetItem from './PetItem';
import ItemSelection from "./ItemSelection";
import MouseOverPopover from "./tooltip";
import Typography from "@mui/material/Typography";
import { calculateGroupScore, calculatePetBaseDamage, SOUL_CLOVER_STEP, calculateBestHours, EXP_DMG_MOD, EXP_TIME_MOD } from "./App";
import helper from './util/helper.js'

function ScoreSection({ data, group, totalScore, defaultRank }) {
    const { baseGroupScore, dmgCount, timeCount, synergyBonus } = calculateGroupScore(group, defaultRank);
    return (
        <React.Fragment>
            <ul>
                <li>
                    {Number(totalScore).toExponential(2)}&nbsp;~=&nbsp; 5 *
                </li>
                <li>
                    Group Base: {Number(baseGroupScore).toExponential(2)}
                </li>
                <li>
                    Dmg Bonus: {Number(1 + dmgCount * EXP_DMG_MOD).toFixed(2)}x
                </li>
                <li>
                    Time Bonus: {Number(1 + timeCount * EXP_TIME_MOD).toFixed(2)}x
                </li>
                <li>
                    Synergy: {Number(synergyBonus).toFixed(2)}x
                </li>
                <li>
                    PetDmgMod: {Number(data?.PetDamageBonuses).toExponential(2)}
                </li>
            </ul>
        </React.Fragment>
    );
}

const JSONDisplay = ({ data, refreshGroups, groups, selectedItems, handleItemSelected, weightMap, setDefaultRank, defaultRank, groupRankCritera, setGroupRankCriteria }) => {

    const [tokenSelections, setTokenSelections] = useState({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });


    if (!!data === false || !!data.PetsCollection === false) {
        return <div>Loading...</div>; // You can replace this with null or another element if you prefer
    }

    let totalTokensHR = 0;

    if (groups && groupRankCritera === 2)
        if (groups.length > 0)
            groups.map((group, index) => {
                // const groupTotal = calculateGroupScore(group, defaultRank);
                // totalTokensHR += groupTotal.tokenMult * (Math.pow(1 + SOUL_CLOVER_STEP, data.SoulGoldenClover));

                const groupBests = calculateBestHours(group, null, data.SoulGoldenClover)[tokenSelections[index]];

                totalTokensHR += groupBests.floored / groupBests.hours;
            })

    return (
        <div className="grid-container">
            <div className="grid-left">
                <div>
                    <Typography variant={"h4"} >{`If you have a large number of pets, please be patient`}</Typography>
                    <Typography variant={"h5"} >Best Teams {groupRankCritera === 2 ? ` || Total tokens/hr: ${helper.roundThreeDecimal(totalTokensHR)}` : ''}</Typography>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>

                        <select
                            style={{ maxWidth: '144px' }}
                            disabled={refreshGroups}
                            onChange={(e) => {
                                switch (e.target.value) {
                                    case 'damage':
                                        setGroupRankCriteria(1);
                                        break;
                                    case 'token':
                                        setGroupRankCriteria(2);
                                        break;
                                    default:
                                        throw new Error('invalid dropdown selector');
                                }
                            }}
                        >
                            <option value="damage">Max Damage</option>
                            <option value="token">Max Tokens {`->`} Damage</option>
                        </select>
                        <div style={{ display: 'flex' }}>

                            <div>{`Ignore Pets Rank`}</div>
                            <input disabled={refreshGroups} type="checkbox" onChange={(e) => {
                                setDefaultRank(e.target.checked ? 1 : 0)
                            }} />
                        </div>
                        {groupRankCritera === 2 && (
                            <div>
                                {`Golden Clover Level: ${data.SoulGoldenClover}`}
                            </div>
                        )}

                    </div>
                </div>

                {groups.reduce((accum, group, index) => {
                    let groupLabel = ``;

                    const groupTotal = calculateGroupScore(group, defaultRank);
                    let tokenScore = groupTotal.tokenMult * (Math.pow(1 + SOUL_CLOVER_STEP, data.SoulGoldenClover));
                    tokenScore = tokenScore.toExponential(3);
                    const score = groupTotal.groupScore;
                    const displayedDamage = (score * 5 * data.PetDamageBonuses).toExponential(3);

                    let tokenInfo = ``;



                    switch (groupRankCritera) {
                        case 1://damage
                            groupLabel = `Group ${index + 1} Damage: ${displayedDamage} || Token: ${tokenScore}`
                            break;
                        case 2://token
                            groupLabel = `Group ${index + 1} Token: ${tokenScore} || Damage: ${displayedDamage}`
                            tokenInfo = calculateBestHours(group, null, data.SoulGoldenClover);
                            break;
                        default:
                            break;

                    }

                    const totalScore = Number(Number(data?.PetDamageBonuses) * score * 5).toExponential(3);
                    const groupTooltip = (
                        <div className="groups-tooltip">
                            <span className="groups-tooltip-content">
                                <h3>Group Score ({totalScore})</h3>
                                <ScoreSection data={data} group={group} totalScore={totalScore} defaultRank={defaultRank} />
                            </span>
                        </div>
                    );
                    accum.push(
                        <div className="grid-row" key={(1 + index) * 9001}>
                            <MouseOverPopover tooltip={groupTooltip}>
                                <div>
                                    {groupLabel}
                                </div>

                            </MouseOverPopover>
                            {groupRankCritera === 2 && (
                                <div style={{ display: "flex" }}>
                                    <div>Best hours:</div>
                                    <select
                                        style={{ maxWidth: '312px' }}
                                        onChange={
                                            (e) => {
                                                setTokenSelections((current) => {
                                                    let temp = { ...current };
                                                    let select = Number(e.target.value)
                                                    temp[index] = select;
                                                    return temp;
                                                })
                                            }
                                        }
                                    >
                                        {tokenInfo.map((value, indexInner) => {
                                            return <option value={indexInner}>
                                                {/* {`${value.hours} hours creating ${value.floored} (${value.totalTokens}) tokens at ${helper.roundTwoDecimal(value.effeciency * 100)}%`} */}
                                                {`${value.hours} hours creating ${value.floored} (${helper.roundTwoDecimal(value.totalTokens)}) tokens wasting ${helper.roundTwoDecimal(value.wasted)} tokens`}
                                            </option>
                                        })}
                                    </select>
                                </div>
                            )}
                        </div>
                    )
                    accum.push(
                        <Grid2 container spacing={1} key={index}>
                            {!!group && group.map((petData, idx) => {
                                const { ID } = petData;
                                const staticPetData = petNameArray.find(staticPetDatum => staticPetDatum.petId === ID)

                                return (
                                    <Grid2 xs={3} key={idx}>
                                        <PetItem
                                            key={ID}
                                            petData={staticPetData}
                                            data={data}
                                            isSelected={true}
                                            onClick={() => { }}
                                            weightMap={weightMap}
                                            defaultRank={defaultRank}
                                        />
                                    </Grid2>
                                );
                            })}
                        </Grid2>
                    );
                    return accum;
                }, [])}
            </div>
            <div className="grid-right">
                <Typography variant={"h5"}>Highlighted: {'>'}0 rank pets (clickable)</Typography>
                <ItemSelection
                    weightMap={weightMap}
                    data={data}
                    selectedItems={selectedItems}
                    onItemSelected={handleItemSelected}
                    defaultRank={defaultRank}
                />
            </div>
        </div>
    );
};
export default JSONDisplay;
