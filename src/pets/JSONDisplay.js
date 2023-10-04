import React, { useState, useEffect } from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import useLocalStorage from "use-local-storage";
import './JSONDisplay.css'; // Add this line to import the CSS file
import { BonusMap, petNameArray, petNames } from '../itemMapping';
import PetItem from './PetItem';
import ItemSelection from "./ItemSelection";
import MouseOverPopover from "../tooltip";
import Typography from "@mui/material/Typography";

import helper from '../util/helper.js'
import xIcon from "../assets/images/x_icon.svg"
import pinIcon from "../assets/images/pin-line-icon.svg"
import trashIcon from "../assets/images/trash-can-icon.svg"
import infoIcon from '../assets/images/info.svg';
import infoIconRed from '../assets/images/info_red.svg';
import infoIconGreen from '../assets/images/info_green.svg';

import ReactGA from "react-ga4";
import SearchBox from '../util/search.jsx';
import petHelper from '../util/petHelper.js';




function ScoreSection({ data, group, totalScore, defaultRank }) {
    const { baseGroupScore, dmgCount, timeCount, synergyBonus } = petHelper.calculateGroupScore(group, defaultRank);
    return (
        <React.Fragment>
            <ul>
                <li key="totalScore">
                    {Number(totalScore).toExponential(2)}&nbsp;~=&nbsp; 5 *
                </li>
                <li key="baseGroupScore">
                    Group Base: {Number(baseGroupScore).toExponential(2)}
                </li>
                <li key="damageBonus">
                    Dmg Bonus: {Number(1 + dmgCount * petHelper.EXP_DMG_MOD).toFixed(2)}x
                </li>
                <li key="timeBonus">
                    Time Bonus: {Number(1 + timeCount * petHelper.EXP_TIME_MOD).toFixed(2)}x
                </li>
                <li key="synergyBonus">
                    Synergy: {Number(synergyBonus).toFixed(2)}x
                </li>
                <li key="petDamageBonus">
                    PetDmgMod: {Number(data?.PetDamageBonuses).toExponential(2)}
                </li>
            </ul>
        </React.Fragment>
    );
}

const JSONDisplay = ({
    data,
    originalPets,
    refreshGroups,
    comboSelector,
    setComboSelector,
    groups,
    selectedItems,
    handleItemSelected,
    weightMap,
    setDefaultRank,
    defaultRank,
    groupRankCritera,
    setGroupRankCriteria,
    numTeams,
    setNumTeams,
    tokenDamageBias,
    setTokenDamageBias,
    availableCustomBonuses,
    setAvailableCustomBonuses,
    activeCustomBonuses,
    setActiveCustomBonuses,
    deleteActiveCustomBonuses,
    selectedPets,
    failedFilters,
    petWhiteList,
    setPetWhiteList,
    setRefreshGroups
}) => {

    const [tokenSelections, setTokenSelections] = useState({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    const [hoveredBonus, setHoveredBonus] = useState(0);
    // const [enabledBonusHighlight, setEnabledBonusHighlight] = useState({});
    const [enabledBonusHighlight, setEnabledBonusHighlight] = useLocalStorage("enabledBonusHighlight", {});
    // const [showAllBonusTally, setShowAllBonusTally] = useState(false);
    const [showAllBonusTally, setShowAllBonusTally] = useLocalStorage("showAllBonusTally", false);
    const [activePet, setActivePet] = useState(-1);

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: "/expeditions", title: "Expedition Calculator Page" });
    }, [])

    if (!!data === false || !!data.PetsCollection === false) {
        return <div>Loading...</div>; // You can replace this with null or another element if you prefer
    }

    let totalTokensHR = 0;
    let damageTotal = 0;

    let bonusTotals = {
        // 1001: 0, //potatoe gain
        // 1002: 0, //class exp gain
        // 1003: 0, //skull gain
        1009: 0, // residue gain
        1010: 0, //card power gain
        1011: 0, // expedition reward
        1012: 0, //dungeon time gain
        1013: 0, //dungeon damage
        1014: 0, //card exp
        1015: 0, //reinc pts gain
        1016: 0 // token gain
    };
    let bonusPets = {};
    let totalMessages = [];

    let relWhiteListMap = {};

    for (let i = 0; i < petWhiteList.length; i++) {
        let cur = petWhiteList[i];
        if (cur.placement === `rel`) {
            relWhiteListMap[cur.id] = { ...cur };
        }
    }


    // if (groups && groupRankCritera === 2)
    if (groups.length > 0)
        groups.map((group, index) => {
            damageTotal += (petHelper.calculateGroupScore(group, defaultRank).groupScore) * 5 * data.PetDamageBonuses;
            group.forEach((pet) => {

                if (pet.ID in relWhiteListMap) {
                    relWhiteListMap[pet.ID].finalGroup = index;
                }

                pet.BonusList.forEach((bon) => {
                    if (bon.ID in bonusTotals) bonusTotals[bon.ID]++;
                })
            })


            const groupBests = petHelper.calculateBestHours(group, null, { clover: data.SoulGoldenClover, residueToken: data.CowShopExpeditionToken, data: data }, comboSelector)[tokenSelections[index]];
            // totalTokensHR += groupBests.tokenHR;
            // totalTokensHR += groupBests.totalTokens / groupBests.hours;
            totalTokensHR += groupBests.tokenHR / groupBests.hours;
        })

    if (selectedPets) {
        for (let i = 0; i < selectedPets.length; i++) {
            selectedPets[i].BonusList.forEach((bonus) => {
                if (!bonusPets[bonus.ID]) {
                    bonusPets[bonus.ID] = { total: 0, pets: [] }
                }
                bonusPets[bonus.ID].total++;
                bonusPets[bonus.ID].pets.push(selectedPets[i])
            })
        }
    }

    for (const [key, value] of Object.entries(bonusTotals)) {
        if (activeCustomBonuses.find((a) => a.id === Number(key)) || showAllBonusTally)
            totalMessages.push({ text: `${BonusMap[key].label}: ${value}/${bonusPets[key] ? bonusPets[key].total : 0} pets`, bonus: key })
    }


    let filterablePets = [];
    if (groupRankCritera === 1) {
        selectedPets.map((pet) => {
            let found;
            try {

                //Awful way to do it, but need to check we haven't already added pet to table
                found = petWhiteList.find((a) => a.id === pet.ID);
            }
            catch (err) {
                console.log(err);
            }

            if (found) return;
            try {
                if (pet.ID > 0)
                    filterablePets.push({ id: pet.ID, label: petNames[pet.ID].name })
            }
            catch (err) {
                console.log(err);
                let x = 0;
            }
        })
    }

    return (
        <div
            className="grid-container"
            style={{
                gridTemplateColumns: '4fr 4fr 4fr',
                columnGap: '12px'
            }}
        >
            <div
                className="grid-left"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '300px'
                    // width: '100%'
                }}
            >
                <div>
                    <Typography variant={"h5"} >Best Teams {` || Total tokens/hr: ${helper.roundThreeDecimal(totalTokensHR)} || Total Damage: ${damageTotal.toExponential(3)}`}</Typography>
                </div>

                {groups.reduce((accum, group, index) => {
                    let groupLabel = ``;

                    const groupTotal = petHelper.calculateGroupScore(group, defaultRank);
                    if (index === 0) {
                        console.log(groupTotal)
                    }
                    // let tokenScore = groupTotal.tokenMult * (Math.pow(1 + petHelper.SOUL_CLOVER_STEP, data.SoulGoldenClover)) * (1 + 0.05 * data.SoulGoldenClover) * comboSelector;s
                    // let tokenScore = groupTotal.tokenMult * (Math.pow(1 + petHelper.SOUL_CLOVER_STEP, data.SoulGoldenClover)) * comboSelector * data.ExpeditionTokenBonuses;
                    // tokenScore = tokenScore.toExponential(3);
                    let tempTokenScore = petHelper.calculateBestHours(group, null, { clover: data.SoulGoldenClover, residueToken: data.CowShopExpeditionToken, data: data }, comboSelector)[tokenSelections[index]]
                    let tokenScore = (tempTokenScore.tokenHR / tempTokenScore.hours).toExponential(3);
                    const score = groupTotal.groupScore;
                    const displayedDamage = (score * 5 * data.PetDamageBonuses).toExponential(3);

                    let tokenInfo = ``;


                    switch (groupRankCritera) {
                        case 1://damage
                            groupLabel = `Group ${index + 1} Damage: ${displayedDamage} || Token/hr: ${tokenScore}`;
                            tokenInfo = petHelper.calculateBestHours(group, null, { clover: data.SoulGoldenClover, residueToken: data.CowShopExpeditionToken, data: data }, comboSelector);
                            break;
                        case 2://token
                            groupLabel = `Group ${index + 1} Token/hr: ${tokenScore} || Damage: ${displayedDamage}`;
                            tokenInfo = petHelper.calculateBestHours(group, null, { clover: data.SoulGoldenClover, residueToken: data.CowShopExpeditionToken, data: data }, comboSelector);
                            break;
                        case 3://Advanced
                            groupLabel = `Group ${index + 1} Damage: ${displayedDamage}`;
                            tokenInfo = petHelper.calculateBestHours(group, null, { clover: data.SoulGoldenClover, residueToken: data.CowShopExpeditionToken, data: data }, comboSelector);
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

                    let GroupTitle = <div
                        className="grid-row"
                        key={(1 + index) * 9001}
                        style={{
                            // height: '1px'
                            // marginTop: '12px',
                            marginBottom: '6px'
                        }}
                    >
                        <MouseOverPopover tooltip={groupTooltip}>
                            {groupLabel}
                        </MouseOverPopover>

                        {/* {groupRankCritera === 2 && ( */}
                        {/* best hours */}
                        {/* <div style={{ display: "flex" }}>
                            <div style={{ marginRight: '12px' }}>Best hours:</div>
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
                                    return <option value={indexInner} key={indexInner}>
                                       
                                        {`${value.hours} hours creating ${value.floored} (${helper.roundTwoDecimal(value.totalTokens)}) tokens wasting ${helper.roundThreeDecimal(value.wastedHR)}/hr`}
                                    </option>
                                })}
                            </select>
                        </div> */}
                        {/* )} */}
                    </div>


                    let GroupIcons =
                        <div
                            style={{
                                display: 'flex',
                            }}
                        >
                            {!!group && group.map((petData, idx) => {
                                const { ID } = petData;
                                let staticPetData = petNameArray.find(staticPetDatum => staticPetDatum.petId === ID)

                                if (!staticPetData) {
                                    staticPetData = {
                                        img: '/fapi_fork_personal/pets/missing.png',
                                        location: '??-??',
                                        name: 'Unknown',
                                        petId: ID
                                    }
                                }

                                return (
                                    <div
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            flex: '1',
                                            width: 'auto',
                                            height: 'auto',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <PetItem
                                            key={ID}
                                            petData={staticPetData}
                                            fullPetData={petData}
                                            data={data}
                                            isSelected={true}
                                            onClick={() => { }}
                                            weightMap={weightMap}
                                            defaultRank={defaultRank}
                                            borderActive={petData.BonusList.find((a) => a.ID === hoveredBonus) || ID === activePet}
                                            enabledBonusHighlight={enabledBonusHighlight}
                                        />
                                        <div
                                            className="hover"
                                            style={{
                                                position: 'absolute', top: '0', right: '0',
                                                // width: '20px',
                                                // height: '20px'
                                            }}
                                            onClick={(e) => {

                                                setPetWhiteList((curr) => {
                                                    let temp = [...curr];

                                                    let pet_inner = temp.find((sample_pet) => sample_pet.id === petData.ID);
                                                    if (!pet_inner) {
                                                        temp.push({ label: staticPetData.name, id: staticPetData.petId, placement: 'team', parameters: { team: index, damageBias: 17 } });
                                                    }
                                                    else {
                                                        pet_inner.placement = 'team';
                                                        pet_inner.parameters = { team: index }
                                                    }


                                                    return temp;
                                                })

                                                setRefreshGroups(true);
                                                return;

                                            }}
                                        >

                                            <img
                                                style={{ width: '20px' }}
                                                src={pinIcon} />
                                        </div>
                                        <div
                                            className="hover"
                                            style={{
                                                position: 'absolute', bottom: '0', right: '0',
                                                // width: '20px',
                                                // height: '20px'
                                            }}
                                            onClick={(e) => {

                                                setPetWhiteList((curr) => {
                                                    let temp = [...curr];

                                                    let pet_inner = temp.find((sample_pet) => sample_pet.id === petData.ID);
                                                    if (!pet_inner) {
                                                        temp.push({ label: staticPetData.name, id: staticPetData.petId, placement: 'blacklist', parameters: { team: 0, damageBias: 17 } });
                                                    }
                                                    else {
                                                        pet_inner.placement = 'blacklist';
                                                        pet_inner.parameters = { team: 0 }
                                                    }

                                                    return temp;
                                                })

                                                setRefreshGroups(true);
                                                return;

                                            }}
                                        >

                                            <img
                                                style={{ width: '20px' }}
                                                src={trashIcon} />
                                        </div>
                                    </div>

                                );
                            })}
                        </div>
                    let finalRow = <div
                        key={'group' + index}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            border: groupRankCritera === 2 && groupTotal.tokenRewardCount > 0 ? '1px black solid' : 'none'
                        }}>
                        {GroupTitle}
                        {GroupIcons}
                    </div>
                    accum.push(finalRow);

                    return accum;
                }, [])}
            </div>
            <div className="grid-center"
                style={{
                    border: '1px black solid',
                    marginRight: '6px',
                    padding: '0 12px 0 12px'
                }}>
                <Typography variant={"h4"} >{`If you have a large number of pets, please be patient`}</Typography>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex' }}>
                        <div
                            style={{
                                marginRight: '12px',
                                color: 'blue',
                                fontWeight: 'bold'
                            }}
                        >Filter</div>
                        <select
                            style={{ maxWidth: '144px' }}
                            disabled={refreshGroups}
                            onChange={async (e) => {


                                ReactGA.event({
                                    category: "expedition_filter",
                                    action: 'changed_filter',
                                    label: 'expedition'
                                })

                                switch (e.target.value) {
                                    case 'damage':

                                        ReactGA.event({
                                            category: "expedition_filter",
                                            action: 'filter_damage',
                                            label: 'expedition'
                                        })
                                        setGroupRankCriteria(1);
                                        break;
                                    case 'token':

                                        ReactGA.event({
                                            category: "expedition_filter",
                                            action: 'filter_token',
                                            label: 'expedition'
                                        })
                                        setGroupRankCriteria(2);
                                        break;
                                    case 'advanced':

                                        ReactGA.event({
                                            category: "expedition_filter",
                                            action: 'filter_advanced',
                                            label: 'expedition'
                                        })
                                        setGroupRankCriteria(3);
                                        break;
                                    default:
                                        throw new Error('invalid dropdown selector');
                                }
                            }}
                            value={groupRankCritera === 1 ? 'damage' : 'token'}
                        >
                            <option value="damage">Max Damage</option>
                            <option value="token">Max Tokens {`->`} Damage</option>
                            {/* <option value="advanced">Advanced</option> */}
                        </select>
                    </div>
                    <div style={{ display: 'flex' }}>

                        <div>{`Ignore Pets Rank`}</div>
                        <input
                            disabled={refreshGroups}
                            type="checkbox"
                            onChange={(e) => {
                                setDefaultRank(e.target.checked ? 1 : 0)
                            }}
                            checked={!!defaultRank}
                            value={!!defaultRank}
                        />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div style={{ marginRight: '12px' }}>

                            {`Golden Clover Level: ${data.SoulGoldenClover}`}
                        </div>
                        <div>

                            {`Token Bonuses: ${helper.roundTwoDecimal(data.ExpeditionTokenBonuses)}`}
                        </div>
                    </div>
                    <div style={{ display: 'flex', }}>

                        <MouseOverPopover tooltip={
                            <div>
                                Expedition reward from active pets special combo (0, 10%, 20%)
                            </div>
                        }>
                            <div style={{ marginRight: '12px' }}>
                                Expedition Reward Combo
                            </div>
                        </MouseOverPopover>



                        <select
                            style={{ maxWidth: '144px' }}
                            disabled={refreshGroups}
                            onChange={
                                (e) => {
                                    setComboSelector(Number(e.target.value))
                                }
                            }
                            defaultValue={comboSelector + ''}
                        >
                            <option
                                value="1">1.0</option>
                            <option
                                value="1.1">1.1</option>
                            <option
                                value="1.2">1.2</option>
                        </select>

                    </div>
                </div>
                <div
                    style={{
                        display: 'flex'
                    }}
                >
                    <div
                        style={{
                            marginRight: '12px'
                        }}>
                        Number of teams:
                    </div>
                    <input id='prepFormInput'
                        type='number'
                        className='prepNumber'
                        value={numTeams}
                        onChange={
                            (e) => {
                                try {
                                    let x = Number(e.target.value);
                                    x = Math.floor(x);
                                    if (x < 1 || x > 7) {
                                        return;
                                    }
                                    setNumTeams(e.target.value);
                                }
                                catch (err) {
                                    console.log(err);
                                }
                                // console.log(`pressed: ${e.target.value}`)

                            }}
                        placeholder={numTeams + ''}
                        min="1"
                        max="7"
                    />
                </div>


                {/* Damage Bias */}
                {groupRankCritera === 2 && (
                    <div
                        style={{
                            display: 'flex'
                        }}
                    >
                        <MouseOverPopover tooltip={
                            <div>
                                <div>
                                    Importance of token teams' damage priority
                                </div>
                                <div>
                                    Higher value means higher generated damage (by giving higher damage pets to token teams)
                                </div>
                                <div>
                                    Recommended range: 5-40
                                </div>
                            </div>
                        }>
                            <div
                                style={{
                                    marginRight: '12px',
                                    color: 'red'
                                }}>
                                Token Team Damage Bias:
                            </div>
                        </MouseOverPopover>

                        <input id='prepFormInput'
                            type='number'
                            className='prepNumber'
                            value={tokenDamageBias}
                            onChange={
                                (e) => {
                                    try {
                                        let x = Number(e.target.value);
                                        x = Math.floor(x);
                                        if (x < 1 || x > 100) {
                                            return;
                                        }
                                        setTokenDamageBias(x);
                                    }
                                    catch (err) {
                                        console.log(err);
                                    }
                                    // console.log(`pressed: ${e.target.value}`)

                                }}
                            placeholder={tokenDamageBias + ''}
                            min="0"
                            max="100"
                            step={5}

                        />
                    </div>



                )}
                {groupRankCritera === 1 && (
                    <div style={{ display: 'flex', marginTop: '12px' }}>

                        <div>{`Show all bonus totals`}</div>
                        <input disabled={refreshGroups} type="checkbox" onChange={(e) => {
                            setShowAllBonusTally(e.target.checked ? true : false)
                        }} />
                    </div>
                )}
                {/* Advanced filter table */}
                {groupRankCritera === 1 && (
                    <div
                        style={{
                            margin: '0px 0 12px 0',
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1',
                            border: 'black 1px solid',
                            // padding:'6px 6px 0 6px'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                margin: '6px 0 6px 0',
                                paddingLeft: '6px'
                            }}
                        >
                            {/* <div>
                                Custom Bonuses
                            </div> */}


                            <div
                                style={{
                                    // margin: '6px 12px 0 12px'
                                    marginRight: '6px'
                                }}
                            >
                                Available bonuses:
                            </div>
                            <select
                                style={{ maxWidth: '144px' }}
                                disabled={refreshGroups}
                                onChange={
                                    (e) => {
                                        if (e.target.value.length > 0) {
                                            setAvailableCustomBonuses(e.target.value);

                                        }
                                    }
                                }
                                value={''}
                            >
                                {
                                    [<option value='' selected>Select Bonus</option>, ...availableCustomBonuses.map((e) => {
                                        return <option value={e.id} key={e.id}> {e.label}</option>
                                    })]
                                }
                                {/* <option
                                    value="1">1.0</option>
                                <option
                                    value="1.1">1.1</option>
                                <option
                                    value="1.2">1.2</option> */}
                            </select>
                        </div>

                        {/* Bonus headers */}
                        <div
                            style={{
                                display: 'flex',
                                boxShadow: `0 0 0 1px #ecf0f5`,
                                backgroundColor: '#fbfafc',
                                margin: '6px 1px 0 1px'
                            }}
                        >
                            <div
                                style={{
                                    // background: 'red',
                                    width: '20%',
                                    display: 'flex',
                                    boxShadow: `0 0 0 1px #ecf0f5`,
                                    backgroundColor: '#fbfafc',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                Bonus
                            </div>
                            <div
                                style={{
                                    // background: 'blue',
                                    width: '20%',
                                    display: 'flex',
                                    boxShadow: `0 0 0 1px #ecf0f5`,
                                    backgroundColor: '#fbfafc',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                Amount
                            </div>
                            <div
                                style={{
                                    // background: 'green',
                                    width: '20%',
                                    display: 'flex',
                                    boxShadow: `0 0 0 1px #ecf0f5`,
                                    backgroundColor: '#fbfafc',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                Equation
                            </div>

                            <div
                                style={{
                                    // background: 'yellow',
                                    width: '20%',
                                    display: 'flex',
                                    boxShadow: `0 0 0 1px #ecf0f5`,
                                    backgroundColor: '#fbfafc',
                                    justifyContent: 'center'
                                }}
                            >
                                <MouseOverPopover tooltip={
                                    <div style={{ padding: '6px' }}>
                                        <div>

                                            Determines the order in which the pets are slotted in:
                                        </div>
                                        <div>
                                            Top: attempts to fill the top teams while satisfying each criteria first
                                        </div>
                                        <div>
                                            Bottom: Will precalculate and reserve the minimum number of pets for the bottom teams, without affecting tops teams
                                        </div>
                                        <div>
                                            Relative: Will dynamically place pets based on the damage bias, higher bias means the pets will be slotted in more aggresively.
                                            This is based on the strongest team at each step vs how much damage is lost by slotting the `relative` pets
                                        </div>
                                    </div>
                                }>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div>
                                            Placement
                                        </div>
                                        <img style={{ height: '16px', marginLeft: '6px' }} src={infoIcon} />
                                    </div>
                                </MouseOverPopover>

                            </div>

                            <div
                                style={{
                                    // background: 'gray',
                                    width: '20%',
                                    display: 'flex',
                                    boxShadow: `0 0 0 1px #ecf0f5`,
                                    backgroundColor: '#fbfafc',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                Total Max
                            </div>
                        </div>

                        {/* Active bonuses list */}
                        {activeCustomBonuses.map((e) => {

                            let bonusName = e.label;
                            let currentBonus = activeCustomBonuses.find((a) => a.id === e.id);

                            switch (e.id) {
                                case 1016:
                                    bonusName = 'Token Gain'
                            }

                            return <div
                                key={e.id}
                                style={{
                                    display: 'flex',
                                    borderBottom: '1px solid black'
                                }}

                                onMouseEnter={(e_inner) => {
                                    setHoveredBonus(e.id)
                                }}
                                onMouseLeave={(e_inner) => {
                                    setHoveredBonus(-1);
                                }}
                            >
                                <div
                                    style={{
                                        // background: 'red',
                                        width: '20%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        {bonusName}
                                    </div>
                                    <img
                                        style={{
                                            maxHeight: '12px',
                                            margin: '0 6px 0 auto'
                                        }}
                                        onClick={() => {
                                            deleteActiveCustomBonuses(e);
                                            setHoveredBonus(-1);
                                            // setActiveCustomBonuses(activeCustomBonuses.filter((bonus) => bonus.id === e.id));
                                            // setAvailableCustomBonuses([...availableCustomBonuses, e])
                                        }}
                                        src={xIcon}
                                    />
                                </div>

                                <div
                                    style={{
                                        // background: 'blue',
                                        width: '20%',
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <input
                                        type='number'
                                        className='prepNumber'
                                        value={currentBonus.amount}
                                        style={{
                                            maxWidth: `calc(100% - 30px)`
                                        }}
                                        onChange={
                                            (num) => {
                                                try {
                                                    let x = Number(num.target.value);
                                                    x = Math.floor(x);
                                                    if (x < 1 || x > 4) {
                                                        return;
                                                    };

                                                    setActiveCustomBonuses((bonuses) => {
                                                        let newBonuses = [...bonuses];
                                                        let bonus = newBonuses.find((a) => a.id === e.id);
                                                        bonus.amount = x;
                                                        return newBonuses;
                                                    })
                                                }
                                                catch (err) {
                                                    console.log(err);
                                                }
                                            }}
                                        placeholder={1 + ''}
                                        min="1"
                                        max="4"

                                    />
                                </div>
                                <div
                                    style={{
                                        // background: 'green',
                                        width: '20%',
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <select
                                        style={{ maxWidth: '144px' }}
                                        disabled={currentBonus.placement === 'rel'}
                                        value={currentBonus.equation}
                                        onChange={
                                            (choice) => {
                                                setActiveCustomBonuses((bonuses) => {
                                                    let newBonuses = [...bonuses];
                                                    let bonus = newBonuses.find((a) => a.id === e.id);
                                                    bonus.equation = choice.target.value;
                                                    return newBonuses;
                                                })
                                            }
                                        }
                                    >
                                        <option value={'min'}> Minimum</option>
                                        <option value={'eq'} > Exactly</option>
                                        <option value={'max'} disabled>Maximum</option>
                                    </select>
                                </div>
                                <div
                                    style={{
                                        // background: 'yellow',
                                        width: '20%',
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <select
                                        style={{ maxWidth: '144px' }}
                                        disabled={refreshGroups}
                                        onChange={
                                            (choice) => {
                                                setActiveCustomBonuses((bonuses) => {
                                                    let newBonuses = [...bonuses];
                                                    let bonus = newBonuses.find((a) => a.id === e.id);
                                                    bonus.placement = choice.target.value;

                                                    if (choice.target.value === 'rel') {
                                                        bonus.equation = 'max';
                                                        bonus.amount = 4;
                                                    }

                                                    return newBonuses;
                                                })
                                            }
                                        }
                                    >
                                        <option value={'top'}> Top</option>
                                        <option value={'mid'} disabled> Middle</option>
                                        <option value={'bottom'} >Bottom</option>
                                        <option value={'rel'}>Relative</option>

                                    </select>
                                </div>
                                <div
                                    style={{
                                        // background: 'blue',
                                        width: '20%',
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <input
                                        type='number'
                                        className='prepNumber'
                                        disabled
                                        onChange={
                                            (num) => {
                                                try {
                                                    let x = Number(num.target.value);
                                                    x = Math.floor(x);
                                                    if (x < 0 || x > 24) {
                                                        return;
                                                    };

                                                    setActiveCustomBonuses((bonuses) => {
                                                        let newBonuses = [...bonuses];
                                                        let bonus = newBonuses.find((a) => a.id === e.id);
                                                        bonus.totalMax = x;
                                                        return newBonuses;
                                                    })
                                                }
                                                catch (err) {
                                                    console.log(err);
                                                }
                                            }}
                                        placeholder={24 + ''}
                                        min="0"
                                        max="24"

                                    />
                                </div>
                            </div>
                        })}



                        {/* Total bonuses pet amounts */}
                        <div
                            style={{
                                margin: '6px 0 6px 0',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                            {totalMessages.map((e, index) => {
                                if (index % 2 !== 0 && index > 0) return;

                                let firstDmgBias = Number(e.bonus);
                                let secondDmgBias = (index + 1) < totalMessages.length ? Number(totalMessages[index + 1].bonus) : null;

                                let firstFailMsg = failedFilters[e.bonus];
                                let secondFailMsg = secondDmgBias ? failedFilters[totalMessages[index + 1].bonus] : null;

                                if (firstFailMsg) {
                                    console.log(`aaa`)
                                }

                                activeCustomBonuses.forEach((active_bon) => {
                                    if (active_bon.placement !== 'rel') return null;
                                    // return;
                                    if (active_bon.id === firstDmgBias) {
                                        firstDmgBias = <div
                                            style={{
                                                // margin: '6px 0 6px 0',
                                                display: 'flex'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    marginRight: '12px'
                                                }}
                                            >
                                                {`damage bias`}
                                            </div>
                                            <input
                                                type='number'
                                                className='prepNumber'
                                                value={active_bon.relThresh}
                                                onChange={
                                                    (num) => {
                                                        try {
                                                            let x = Number(num.target.value);
                                                            x = Math.floor(x);
                                                            if (x < 0 || x > 100) {
                                                                return;
                                                            };

                                                            setActiveCustomBonuses((bonuses) => {
                                                                let newBonuses = [...bonuses];
                                                                let bonus = newBonuses.find((a) => a.id === active_bon.id);
                                                                bonus.relThresh = x;
                                                                return newBonuses;
                                                            })
                                                        }
                                                        catch (err) {
                                                            console.log(err);
                                                        }
                                                    }}
                                                placeholder={1 + ''}
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    }
                                    if (active_bon.id === secondDmgBias) {
                                        secondDmgBias = <div
                                            style={{
                                                // margin: '6px 0 6px 0',
                                                display: 'flex'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    marginRight: '12px'
                                                }}
                                            >
                                                {`damage bias`}
                                            </div>
                                            <input
                                                type='number'
                                                className='prepNumber'
                                                value={active_bon.relThresh}
                                                onChange={
                                                    (num) => {
                                                        try {
                                                            let x = Number(num.target.value);
                                                            x = Math.floor(x);
                                                            if (x < 0 || x > 100) {
                                                                return;
                                                            };

                                                            setActiveCustomBonuses((bonuses) => {
                                                                let newBonuses = [...bonuses];
                                                                let bonus = newBonuses.find((a) => a.id === active_bon.id);
                                                                bonus.relThresh = x;
                                                                return newBonuses;
                                                            })
                                                        }
                                                        catch (err) {
                                                            console.log(err);
                                                        }
                                                    }}
                                                placeholder={1 + ''}
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    }
                                })

                                return (
                                    <div
                                        key={e.bonus}
                                        style={{
                                            display: 'flex'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '50%'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    // margin: '6px 0 6px 0'
                                                    // color: helper.bonusColorMap[e.bonus].color
                                                }}
                                                onMouseEnter={(e_inner) => {
                                                    setHoveredBonus(Number(e.bonus))
                                                }}
                                                onMouseLeave={(e_inner) => {
                                                    setHoveredBonus(-1);
                                                }}

                                            >
                                                {totalMessages[index].text}
                                                <div>
                                                    <div style={{ display: 'flex' }}>
                                                        <div>{`Enable highlight`}</div>
                                                        <input
                                                            type="checkbox"
                                                            onChange={(e_inner) => {
                                                                setEnabledBonusHighlight({ ...enabledBonusHighlight, [e.bonus]: e_inner.target.checked ? 1 : 0 })
                                                            }}
                                                            checked={enabledBonusHighlight[e.bonus]}
                                                        />
                                                        <div
                                                            style={{
                                                                width: '24px',
                                                                background: helper.bonusColorMap[e.bonus].color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="dmgBias">
                                                    {isNaN(firstDmgBias) &&


                                                        <MouseOverPopover tooltip={
                                                            <div>
                                                                <div>
                                                                    How aggressively to slot in these pets
                                                                </div>
                                                                <div>
                                                                    Higher value means these pets need to be stronger to considered, lower means smaller threshold to slot them in
                                                                </div>
                                                                <div>
                                                                    This is based on the best team at each step without these pets, vs with it.
                                                                </div>
                                                            </div>
                                                        }>
                                                            {firstDmgBias}
                                                        </MouseOverPopover>



                                                    }
                                                </div>
                                                {!!firstFailMsg &&
                                                    <div
                                                        style={{ color: 'red' }}>
                                                        {firstFailMsg}
                                                    </div>
                                                }

                                            </div>
                                        </div>
                                        {(index + 1 < totalMessages.length) && (
                                            <div
                                                key={totalMessages[index + 1].bonus}
                                                style={{
                                                    width: '50%'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        // margin: '6px 0 6px 0'
                                                    }}
                                                    onMouseEnter={(e_inner) => {
                                                        setHoveredBonus(Number(totalMessages[index + 1].bonus))
                                                    }}
                                                    onMouseLeave={(e_inner) => {
                                                        setHoveredBonus(-1);
                                                    }}
                                                >
                                                    {totalMessages[index + 1].text}
                                                    <div>
                                                        <div style={{ display: 'flex' }}>
                                                            <div>{`Enable highlight`}</div>
                                                            <input
                                                                type="checkbox"
                                                                onChange={(e_inner) => {
                                                                    setEnabledBonusHighlight({ ...enabledBonusHighlight, [totalMessages[index + 1].bonus]: e_inner.target.checked ? 1 : 0 })
                                                                }}
                                                                checked={enabledBonusHighlight[totalMessages[index + 1].bonus]}
                                                            />
                                                            <div
                                                                style={{
                                                                    width: '24px',
                                                                    background: helper.bonusColorMap[totalMessages[index + 1].bonus].color
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='dmgBias'>

                                                        {isNaN(secondDmgBias) && secondDmgBias}
                                                    </div>
                                                    {!!secondFailMsg &&
                                                        <div
                                                            style={{ color: 'red' }}>
                                                            {secondFailMsg}
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )


                            })}
                        </div>

                        {/* Pet whitelist stuff */}
                        <div style={{ margin: '24px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '36px' }}>
                            <SearchBox data={{
                                list: filterablePets
                            }}
                                onSelect={(e) => {
                                    setPetWhiteList((curr) => {
                                        let temp = [...curr];
                                        temp.push({ ...e, placement: 'blacklist', parameters: { team: 0, damageBias: 17 } });
                                        return temp;
                                    })
                                    setRefreshGroups(true);
                                }}
                            />
                            <div
                                style={{ display: 'flex' }}
                            >
                                <div
                                    style={{ marginRight: '6px' }}
                                >
                                    Team Presets
                                </div>
                                <select
                                    style={{ maxWidth: '144px', }}
                                    onChange={
                                        (e) => {

                                            let selectedTeam = data.PetsLoadout[Number(e.target.value)]
                                            console.log(selectedTeam);

                                            setPetWhiteList((curr) => {
                                                let temp = [...curr];
                                                // temp.push({ ...e, placement: 'blacklist', parameters: { team: 0, damageBias: 17 } });

                                                for (let x = 0; x < selectedTeam.IDs.length; x++) {
                                                    let selected = selectedTeam.IDs[x];
                                                    if (selected > 0) {
                                                        let base = { id: selected, label: petNames[selected].name, placement: 'rel', parameters: { team: 0, damageBias: 17 } }
                                                        if (!temp.find((inner_find) => inner_find.id === base.id)) {
                                                            temp.push(base);
                                                        }
                                                    }
                                                }
                                                return temp;
                                            })
                                            setRefreshGroups(true);

                                        }
                                    }
                                    value={''}
                                >
                                    {
                                        [<option value='' selected>Select Team</option>, ...data.PetsLoadout.map((cur, index) => {

                                            if (cur.Locked === 0) return;

                                            return (
                                                <option
                                                    value={index}>{cur.Name}</option>
                                            )
                                        })]
                                    }
                                </select>
                            </div>
                        </div>
                        {/* Pet white/black list */}
                        <div
                            style={{
                                display: 'flex',
                                boxShadow: `0 0 0 1px #ecf0f5`,
                                backgroundColor: '#fbfafc',
                                margin: '12px 1px 0 1px'
                            }}
                        >
                            <div
                                style={{
                                    // background: 'red',
                                    width: '40%',
                                    display: 'flex',
                                    // boxShadow: `0 2px 1px -1px #ecf0f5`,
                                    // boxShadow: `0 0 0 1px #ecf0f5`,
                                    backgroundColor: '#fbfafc',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                Pet
                            </div>

                            {/* placement */}
                            <div
                                style={{
                                    // background: 'yellow',
                                    width: '30%',
                                    display: 'flex',
                                    boxShadow: `0 0 0 1px #ecf0f5`,
                                    backgroundColor: '#fbfafc',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <MouseOverPopover tooltip={
                                    <div style={{ padding: '6px' }}>
                                        <div>
                                            Determines the order in which the pets are slotted in:
                                        </div>
                                        <div>
                                            Blacklist: Omits this pet from any group
                                        </div>
                                        <div>
                                            Group: Forces the pet to go into a certain group
                                        </div>
                                        <div>
                                            Relative: Tries to find optimal placement automatically based on `damage bias`
                                        </div>
                                    </div>
                                }>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div>
                                            Placement
                                        </div>
                                        <img style={{ height: '16px', marginLeft: '6px' }} src={infoIcon} />
                                    </div>
                                </MouseOverPopover>

                            </div>
                            {/* Parameters */}
                            <div
                                style={{
                                    // background: 'blue',
                                    width: '30%',
                                    display: 'flex',
                                    // boxShadow: `0 0 0 1px #ecf0f5`,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <MouseOverPopover tooltip={
                                    <div style={{ padding: '6px' }}>
                                        <div>
                                            <div>
                                                In Placement=Group, determines which group the pet is placed in
                                            </div>
                                            <div>
                                                In Placement=Relative, determines which group the pet is placed in based on the bias number (higher means more damage necessary to placed in)
                                            </div>
                                        </div>
                                    </div>
                                }>

                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div>
                                            Parameters
                                        </div>
                                        <img style={{ height: '16px', marginLeft: '6px' }} src={infoIcon} />
                                    </div>
                                </MouseOverPopover>
                            </div>
                        </div>
                        <div style={{ margin: '0 1px 0 1px', boxShadow: `0 0 0 1px #ecf0f5`, }}>
                            {petWhiteList.map((pet, index) => {
                                let petLabel = pet.label;
                                let petGroup = ``
                                if (pet.id in relWhiteListMap) {
                                    // petLabel += ` (Group: ${relWhiteListMap[pet.id].finalGroup + 1})`
                                    petGroup += `(Group: ${relWhiteListMap[pet.id].finalGroup + 1})`
                                }

                                let showRed = false;//Too high
                                let showGreen = false;// Too low
                                let hoverMsg = ``;

                                //Check whether this pet is placed too low or too high
                                if (pet.placement !== `blacklist`) {
                                    let bigsad = -1;//

                                    let group_index = groups.findIndex((temp_e) => {
                                        return temp_e.find((temp_e2) => temp_e2.ID === pet.id)
                                    });

                                    if (group_index > -1) {

                                        //Check if this pet got put in too high

                                        let group = groups[group_index];

                                        try {
                                            //Can only check if not on bottom
                                            if (group_index !== (groups.length - 1)) {
                                                //By default only need to check twice (2gnd or 2air)
                                                const maxChecks = 2;
                                                let originalGroupScore = petHelper.calculateGroupScore(group, defaultRank).groupScore;
                                                let tempGroup = [];
                                                let triedPets = {};

                                                for (let i = 0; i < maxChecks; i++) {//
                                                    let foundNew = false;

                                                    for (let j = 0; j < groups[group_index + 1].length; j++) {

                                                        let temp_pet = groups[group_index + 1][j];
                                                        if (temp_pet.Type === pet.pet.Type) {
                                                            let bigsad = -1;
                                                            if (!(temp_pet.ID in triedPets) && !foundNew) {
                                                                triedPets[temp_pet.ID] = true;
                                                                foundNew = true;
                                                                tempGroup = [...group];
                                                                let ind = tempGroup.findIndex((temp_repl) => temp_repl.ID === pet.pet.ID)
                                                                tempGroup[ind] = temp_pet;
                                                            }
                                                        }
                                                    }

                                                    let newGroupScore = petHelper.calculateGroupScore(tempGroup, defaultRank).groupScore;

                                                    if (newGroupScore > originalGroupScore) {
                                                        showRed = true;
                                                        hoverMsg = `${petLabel} might be too high, try ${pet.placement === 'rel' ? `increase` : `lowering`} the value to drop them to a lower team`
                                                    }
                                                    tempGroup = [];
                                                }
                                            }
                                        }
                                        catch (err) {
                                            let temppp = group_index;
                                            console.log(err);
                                        }
                                        try {
                                            //If they are not too high, check if they are too low (except for team 1)
                                            if (!showRed && group_index > 0) {
                                                //By default only need to check twice (2gnd or 2air)
                                                const maxChecks = 2;
                                                let originalGroupScore = petHelper.calculateGroupScore(groups[group_index - 1], defaultRank).groupScore;
                                                let tempGroup = [];
                                                let triedPets = {};

                                                for (let i = 0; i < maxChecks; i++) {//
                                                    let foundNew = false;

                                                    for (let j = 0; j < groups[group_index - 1].length; j++) {

                                                        let temp_pet = groups[group_index - 1][j];
                                                        if (temp_pet.Type === pet.pet.Type) {
                                                            let bigsad = -1;
                                                            if (!(temp_pet.ID in triedPets) && !foundNew) {
                                                                triedPets[temp_pet.ID] = true;
                                                                foundNew = true;
                                                                tempGroup = [...groups[group_index - 1]];
                                                                let ind = tempGroup.findIndex((temp_repl) => temp_repl.ID === temp_pet.ID)
                                                                tempGroup[ind] = pet.pet;
                                                            }
                                                        }
                                                    }

                                                    let newGroupScore = petHelper.calculateGroupScore(tempGroup, defaultRank).groupScore;

                                                    if (newGroupScore > originalGroupScore) {
                                                        showGreen = true;
                                                        hoverMsg = ` ${petLabel} might be too low, try ${pet.placement === 'rel' ? `lowering` : `increasing`} the value to bump them to a higher team`
                                                    }
                                                    tempGroup = [];
                                                }
                                            }
                                        }
                                        catch (err) {
                                            let tempy = group_index;
                                            console.log(err);
                                        }
                                    }
                                    //Has a nan placement -> suggest decreasing the rel value
                                    else {
                                        hoverMsg = `Try lowering this value until ${petLabel} is put in`;
                                        showGreen = true;
                                    }

                                }


                                return (
                                    <div
                                        key={pet.label}
                                        style={{
                                            boxShadow: `0 2px 1px -1px #ecf0f5`,
                                            display: 'flex',
                                            width: '100%'
                                        }}
                                    >
                                        {/* Pet name + delete */}
                                        <div style={{
                                            width: 'calc(40% - 1px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                                            boxShadow: `2px 0 2px -1px #ecf0f5`
                                        }}
                                            onMouseEnter={() => {
                                                setActivePet(pet.id)
                                            }}
                                            onMouseLeave={() => {
                                                setActivePet(-1);
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    // alignContent: 'space-between',
                                                    zIndex: '-1'
                                                }}

                                            >
                                                <div
                                                    style={{
                                                        marginLeft: '6px'
                                                    }}
                                                >
                                                    {petLabel}
                                                </div>
                                                <div
                                                    style={{
                                                        marginRight: '34px'
                                                    }}
                                                >
                                                    {petGroup}
                                                </div>
                                            </div>
                                            <img
                                                style={{
                                                    maxHeight: '12px',
                                                    margin: '0 12px 0 auto'
                                                }}
                                                onClick={(e) => {
                                                    setPetWhiteList((curr) => {
                                                        let temp = [...curr];
                                                        temp = temp.filter((inner_pet) => {
                                                            return inner_pet.id !== pet.id
                                                        });
                                                        return temp;
                                                    })
                                                    setRefreshGroups(true);
                                                }}
                                                src={xIcon}
                                            />
                                        </div>
                                        {/* Pet Placement */}
                                        <div style={{ width: 'calc(30% + 1px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `2px 0 2px -1px #ecf0f5`, }}>

                                            <select
                                                style={{ maxWidth: '144px' }}
                                                value={pet.placement}
                                                onChange={
                                                    (choice) => {
                                                        console.log(choice);
                                                        setPetWhiteList((curr) => {
                                                            let temp = [...curr];
                                                            let tempPet = temp.find((inner_pet) => inner_pet.id === pet.id);
                                                            tempPet.placement = choice.target.value;
                                                            return temp;
                                                        })
                                                        setRefreshGroups(true);
                                                    }
                                                }
                                            >
                                                <option value={'blacklist'}>Blacklist</option>
                                                <option value={'team'}>Group</option>
                                                <option value={`rel`}>Relative</option>
                                            </select>

                                        </div>
                                        {/* parameters */}
                                        <div
                                            disabled={pet.placement === 'blacklist'}
                                            style={{ width: '30%', opacity: pet.placement === 'blacklist' ? '0.4' : '', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                        >
                                            {pet.placement === 'team' && (
                                                <div>
                                                    <select
                                                        style={{ maxWidth: '144px' }}
                                                        value={pet.parameters.team}
                                                        onChange={
                                                            (choice) => {
                                                                setPetWhiteList((curr) => {
                                                                    let temp = [...curr];
                                                                    let tempPet = temp.find((inner_pet) => inner_pet.id === pet.id);
                                                                    tempPet.parameters.team = Number(choice.target.value);
                                                                    return temp;
                                                                })
                                                                setRefreshGroups(true);
                                                            }
                                                        }
                                                    >
                                                        {Array(numTeams).fill(numTeams).map((e, index) => {
                                                            return <option value={index}>{index + 1}</option>
                                                        })}


                                                    </select>

                                                </div>
                                            )}
                                            {pet.placement === `rel` && (
                                                <div

                                                >
                                                    <input
                                                        style={{ maxWidth: '36px' }}
                                                        type='number'
                                                        // className='prepNumber'
                                                        value={pet.parameters.damageBias}
                                                        onChange={
                                                            (e) => {
                                                                try {
                                                                    let x = Number(e.target.value);
                                                                    x = Math.floor(x);
                                                                    if (x < 0 || x > 100) {
                                                                        return;
                                                                    }

                                                                    setPetWhiteList((curr) => {
                                                                        let temp = [...curr];
                                                                        let tempPet = temp.find((inner_pet) => inner_pet.id === pet.id);
                                                                        tempPet.parameters.damageBias = Number(x);
                                                                        return temp;
                                                                    })
                                                                    setRefreshGroups(true);
                                                                }
                                                                catch (err) {
                                                                    console.log(err);
                                                                }
                                                            }}
                                                        placeholder={pet.parameters.damageBias + ''}
                                                        min="0"
                                                        max="100"
                                                    />
                                                </div>
                                            )}
                                            {pet.placement === 'blacklist' && (
                                                <>Unavailable</>
                                            )}
                                            {(showGreen || showRed) && (

                                                <MouseOverPopover muiHeight={'18px'} tooltip={<div>{hoverMsg}</div>} style={{ display: 'flex', alignItems: 'center', height: '18px' }}>
                                                    <img style={{ height: '18px', marginLeft: '6px', marginTop: '2px' }} src={showGreen ? infoIconGreen : infoIconRed} />
                                                </MouseOverPopover>

                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>


                        {/* Alerting overall impossible filters combinations */}
                        {failedFilters['generic'] && (
                            <div
                                style={{ fontWeight: 'bold', color: 'red', display: 'flex', width: '100%', justifyContent: 'center' }}

                            >
                                {failedFilters['generic']}
                            </div>
                        )}

                        {false && (
                            <div
                                style={{ display: 'flex', width: '100%', justifyContent: "center" }}
                            >

                                <div>
                                    Leftover Pets
                                </div>
                            </div>
                        )}



                    </div>
                )

                }

            </div>
            <div className="grid-right">
                <div style={{ display: 'flex' }}>
                    <Typography variant={"h5"} style={{ marginRight: '12px' }}>Click a pet to enable/disable</Typography>
                    <div style={{ display: 'flex' }}>
                        <button
                            onClick={(e) => {
                                ReactGA.event({
                                    category: "expedition_pets",
                                    action: 'enabled_all',
                                    label: 'expedition'
                                })
                                if (data.PetsCollection) {
                                    let petArr = [];
                                    for (let i = 1; i < data.PetsCollection.length; i++) {
                                        petArr.push(data.PetsCollection[i].ID)
                                    }
                                    handleItemSelected(petArr);
                                }

                            }}
                        >Enable All</button>
                        <button
                            onClick={(e) => {
                                ReactGA.event({
                                    category: "expedition_pets",
                                    action: 'disabled_all',
                                    label: 'expedition'
                                })
                                if (data.PetsCollection) {
                                    handleItemSelected([]);
                                }

                            }}
                        >Disable All</button>
                        <button
                            onClick={(e) => {
                                ReactGA.event({
                                    category: "expedition_pets",
                                    action: 'reset_all',
                                    label: 'expedition'
                                })
                                if (data.PetsCollection) {
                                    let petArr = [];
                                    for (let i = 0; i < originalPets.length; i++) {
                                        petArr.push(originalPets[i].ID)
                                    }
                                    handleItemSelected(petArr);
                                }

                            }}
                        >Reset</button>
                    </div>
                </div>
                <ItemSelection
                    weightMap={weightMap}
                    data={data}
                    selectedItems={selectedItems}
                    onItemSelected={handleItemSelected}
                    defaultRank={defaultRank}
                />
            </div>
        </div >
    );
};
export default JSONDisplay;
