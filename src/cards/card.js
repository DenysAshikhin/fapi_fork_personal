import './card.css';
import React, { useState, useEffect } from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import petHelper from '../util/petHelper.js';
import ReactGA from "react-ga4";

import mathHelper from '../util/math.js';
import helper from '../util/helper.js';

const PREFIX = 'card';

const classes = {
    card: `${PREFIX}-card`,
    content: `${PREFIX}-content`,
    positiveChargeResult: `${PREFIX}-positiveChargeResult`,
    negativeChargeResult: `${PREFIX}-negativeChargeResult`
};


const POTATO = 1;
const CLASSEXP = 2;
const SKULL = 3;
const CONFECTIONEXP = 4;
const REINCARNATIONEXP = 5;
const ITEMRATING = 6;
const POOPBONUS = 7;
const MILKBONUS = 8;
const WHACKSCORE = 9;
const BREWINGEXP = 10;
const CALCIUMEXP = 11;
const FERMENTINGEXP = 12;
const RESIDUEBONUS = 13;
const WORMQTY = 14;
const LARVAQTY = 15;
const LARVAEFF = 16;
const ATTACKHP = 17;
const PETDMG = 18;
const PETLEVELEXP = 19;
const PETRANKEXP = 20;
const CARDPOWERB = 21;
const CARDEXPB = 22;
const cardIDMap = {
    [POTATO]: { id: POTATO, label: "Potatoes", icon: "", },
    [CLASSEXP]: { id: CLASSEXP, label: "Class Exp", icon: "", },
    [SKULL]: { id: SKULL, label: "Skulls", icon: "", },
    [CONFECTIONEXP]: { id: CONFECTIONEXP, label: "Confection", icon: "", },
    [REINCARNATIONEXP]: { id: REINCARNATIONEXP, label: "Reinc.", icon: "", },
    [ITEMRATING]: { id: ITEMRATING, label: "Item R.", icon: "", },
    [POOPBONUS]: { id: POOPBONUS, label: "Poop Qty", icon: "", },
    [MILKBONUS]: { id: MILKBONUS, label: "Milk", icon: "", },
    [WHACKSCORE]: { id: WHACKSCORE, label: "Whack", icon: "", },
    [BREWINGEXP]: { id: BREWINGEXP, label: "Brewing", icon: "", },
    [CALCIUMEXP]: { id: CALCIUMEXP, label: "Calcium", icon: "", },
    [FERMENTINGEXP]: { id: FERMENTINGEXP, label: "Ferment.", icon: "", },
    [RESIDUEBONUS]: { id: RESIDUEBONUS, label: "Residue", icon: "", },
    [WORMQTY]: { id: WORMQTY, label: "Worm Qty", icon: "", },
    [LARVAQTY]: { id: LARVAQTY, label: "Larve Qty", icon: "", },
    [LARVAEFF]: { id: LARVAEFF, label: "Larve Eff.", icon: "", },
    [ATTACKHP]: { id: ATTACKHP, label: "Att. + Hp.", icon: "", },
    [PETDMG]: { id: PETDMG, label: "Pet Dmg", icon: "", },
    [PETLEVELEXP]: { id: PETLEVELEXP, label: "Pet Level", icon: "", },
    [PETRANKEXP]: { id: PETRANKEXP, label: "Pet Rank", icon: "", },
    [CARDPOWERB]: { id: CARDPOWERB, label: "Card Power", icon: "", },
    [CARDEXPB]: { id: CARDEXPB, label: "Card Exp", icon: "", },
}


const Decimal = require('decimal.js');

function powerFormula(Pow, logBase, customConstant, isPerm = false) {

    let result = mathHelper.pow(
        1.2,
        mathHelper.logDecimal(Pow, logBase)
    );
    result = mathHelper.multiplyDecimal(result, customConstant);

    result = isPerm ? mathHelper.multiplyDecimal(result, 0.5) : result;
    result = mathHelper.addDecimal(result, 1);
    return result;
}
const tempPowerBonusFormula = {
    17: (Pow) => powerFormula(Pow, 1.5, 0.015),
    1: (Pow) => powerFormula(Pow, 1.3, 0.018),
    2: (Pow) => powerFormula(Pow, 1.35, 0.016),
    3: (Pow) => powerFormula(Pow, 1.325, 0.015),
    5: (Pow) => powerFormula(Pow, 1.55, 0.001),
    6: (Pow) => powerFormula(Pow, 1.525, 0.002),
    9: (Pow) => powerFormula(Pow, 1.325, 0.02),
    7: (Pow) => powerFormula(Pow, 1.325, 0.016),
    4: (Pow) => powerFormula(Pow, 1.3, 0.016),
    8: (Pow) => powerFormula(Pow, 1.35, 0.012),
    10: (Pow) => powerFormula(Pow, 1.325, 0.011),
    11: (Pow) => powerFormula(Pow, 1.325, 0.01),
    12: (Pow) => powerFormula(Pow, 1.4, 0.008),
    13: (Pow) => powerFormula(Pow, 1.525, 0.002),
    14: (Pow) => powerFormula(Pow, 1.4, 0.01),
    15: (Pow) => powerFormula(Pow, 1.3, 0.015),
    16: (Pow) => powerFormula(Pow, 1.3, 0.02),
    18: (Pow) => powerFormula(Pow, 1.525, 0.003),
    19: (Pow) => powerFormula(Pow, 1.5, 0.002),
    20: (Pow) => powerFormula(Pow, 1.55, 0.001),
    _: (Pow) => 1.0
};
const permPowerBonusFormula = {
    17: (Pow) => powerFormula(Pow, 1.5, 0.015, true),
    1: (Pow) => powerFormula(Pow, 1.3, 0.018, true),
    2: (Pow) => powerFormula(Pow, 1.35, 0.016, true),
    3: (Pow) => powerFormula(Pow, 1.325, 0.015, true),
    5: (Pow) => powerFormula(Pow, 1.55, 0.001, true),
    6: (Pow) => powerFormula(Pow, 1.525, 0.002, true),
    9: (Pow) => powerFormula(Pow, 1.325, 0.02, true),
    7: (Pow) => powerFormula(Pow, 1.325, 0.016, true),
    4: (Pow) => powerFormula(Pow, 1.3, 0.016, true),
    8: (Pow) => powerFormula(Pow, 1.35, 0.012, true),
    10: (Pow) => powerFormula(Pow, 1.325, 0.011, true),
    11: (Pow) => powerFormula(Pow, 1.325, 0.01, true),
    12: (Pow) => powerFormula(Pow, 1.4, 0.008, true),
    13: (Pow) => powerFormula(Pow, 1.525, 0.002, true),
    14: (Pow) => powerFormula(Pow, 1.4, 0.01, true),
    15: (Pow) => powerFormula(Pow, 1.3, 0.015, true),
    16: (Pow) => powerFormula(Pow, 1.3, 0.02, true),
    18: (Pow) => powerFormula(Pow, 1.525, 0.003, true),
    19: (Pow) => powerFormula(Pow, 1.5, 0.002, true),
    20: (Pow) => powerFormula(Pow, 1.55, 0.001, true),
    _: (Pow) => new Decimal(1.0)
};

const CARD_DISPLAY_IDS = [
    17, 1, 2, 3, 9,
    7, 4, 14, 15, 16,
    8, 10, 11, 12, 13,
    6, 5, 19, 18, 20
];

const CardCard = ({ vertical, displayMode, data, card, weightMap, i, applyWeights, cardMap, setCardMap }) => {
    const {
        CurrentExp,
        ExpNeeded,
        Found,
        ID,
        Level,
        PowerPerma,
        PowerPermaBD,
        PowerTemp,
        PowerTempBD,
    } = card;
    const { ChargeTransfertPowerPerma, ChargeTransfertPowerTemp } = data;

    const permValueBefore = mathHelper.createDecimal(PowerPermaBD);
    const tempValueBefore = mathHelper.createDecimal(PowerTempBD);

    let permValueAfter = mathHelper.addDecimal(permValueBefore,
        mathHelper.multiplyDecimal(tempValueBefore, ChargeTransfertPowerPerma)
    );
    let tempValueAfter = mathHelper.multiplyDecimal(tempValueBefore, (1 - ChargeTransfertPowerTemp));

    let tempBonusBefore = tempPowerBonusFormula[ID](tempValueBefore);
    let permBonusBefore = permPowerBonusFormula[ID](permValueBefore);

    let finalBefore = mathHelper.multiplyDecimal(
        mathHelper.subtractDecimal(
            mathHelper.multiplyDecimal(tempBonusBefore, permBonusBefore),
            1
        ),
        ((1.0 + Level * 0.02) * 100)
    )

    let temp1 = tempPowerBonusFormula[ID](mathHelper.multiplyDecimal(tempValueBefore, (1.0 - ChargeTransfertPowerTemp)))
    let temp2 = permPowerBonusFormula[ID](
        mathHelper.addDecimal(permValueBefore, mathHelper.multiplyDecimal(tempValueBefore, ChargeTransfertPowerPerma))
    )
    let finalAfter =
        mathHelper.multiplyDecimal(
            mathHelper.subtractDecimal(mathHelper.multiplyDecimal(temp1, temp2), 1),
            (1.0 + Level * 0.02) * 100)

    if (!(ID in cardMap)) {
        setCardMap((e) => {
            let tempy = { ...e };
            tempy[ID] = { ID: ID, finalAfter: finalAfter, percIncrease: mathHelper.divideDecimal(finalAfter, finalBefore), flatIncrease: mathHelper.subtractDecimal(finalAfter, finalBefore) };
            return tempy;
        })
    }
    else if (!cardMap[ID].finalAfter.equals(finalAfter)) {
        setCardMap((e) => {
            let tempy = { ...e };
            tempy[ID] = { ID: ID, finalAfter: finalAfter, percIncrease: mathHelper.divideDecimal(finalAfter, finalBefore), flatIncrease: mathHelper.subtractDecimal(finalAfter, finalBefore) };
            return tempy;
        })
    }

    let displayTotalsRatio = 0;
    let isPositiveChargeRatio = finalAfter.greaterThan(finalBefore);

    let middleCard = false;
    let num = i + 1;

    if (Math.floor(num / 5) % 2 === 0) {
        middleCard = (num > 1) && (num % 2 === 0) && (num % 5 !== 0)
    }
    else {
        middleCard = (num > 1) && (num % 2 === 1) && (num % 5 !== 0)
    }


    let margin = ``;
    if (vertical) {
        margin = num % 2 === 0 && num + 1 ? '6px 0' : ''
    }
    else {
        margin = middleCard ? `0 6px ${num > 1 && num % 5 === 0 ? '12px' : ''} 6px` : '';
    }

    let extraText = `(+${mathHelper.subtractDecimal(finalAfter, finalBefore).toExponential(2)})`;
    if (displayMode === 'perc') {
        let tempy = helper.roundTwoDecimal(mathHelper.divideDecimal(finalAfter, finalBefore).toNumber() * 100);
        extraText = `(${tempy}%)`
    }
    else if (displayMode === 'flat') {
        let tempy = mathHelper.subtractDecimal(finalAfter, finalBefore).toExponential(2).toString();
        extraText = `(+${tempy})`
    }
    return (
        <div
            key={i}
            style={{
                border: isPositiveChargeRatio ? '2px solid green' : '1px solid black',
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '140px',
                width: '90px',
                // height: '190px',
                // width: '195px',
                padding: '3px',
                margin: margin,
                boxSizing: 'border-box'
            }}
        >
            <div style={{ fontWeight: 'bold' }}>
                {cardIDMap[ID].label}
            </div>
            <img style={{ height: '75px' }} src={`/fapi_fork_personal/cards/card${ID}.png`} />

            <div
                style={{ color: isPositiveChargeRatio ? 'green' : 'red', }}
            >
                {`${finalAfter.toExponential(2)}`}
            </div>
            {isPositiveChargeRatio && (
                <div
                    style={{}}
                >
                    {extraText}
                </div>
            )}


        </div>
    );
}

export function ExpeditionCardComponent({ data, weightMap, applyWeights, defaultRank }) {
    // data.ExpeditionsCollection: {ID: 0, Room: 1, BaseHP: 0, CardFound:[...], ...}
    // data.PetsSpecial (?combos)
    // data.ExpeditionTeam

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: "/cards", title: "Card Calculator Page" });
    }, [])

    if (!data.ExpeditionTeam) return <div></div>;

    const activeTeams = data.ExpeditionTeam
        .filter(team => team.InExpedition && team.WhichExpedition)
        .map((team) => {
            const teamPetIds = [...team.ExpeditionTeamID]
                .filter(id => id)
                .map(id => data.PetsCollection[id]);
            const score = petHelper.calculateGroupScore(teamPetIds, defaultRank);
            return {
                ...team, ...score
            }
        })

    return (
        <Grid2 container >
            <Grid2 xs={12}><Typography variant={"h2"}>Current Power/XP Card Gains</Typography></Grid2>
            {activeTeams.map((team, i) => {
                const {
                    TeamName, CardExpGain, CardPowerGain, synergyBonus, cardPowerCount, expRewardCount, cardXpCount, rpRewardCount, tokenRewardCount
                } = team;
                const tmpPower = CardPowerGain * (1.0 + cardPowerCount * 0.025) * (1.0 + expRewardCount * 0.05) * synergyBonus;
                const totalXpGain = CardExpGain * (1.0 + cardXpCount * 0.025);
                const expeditionRewardBonus = data.ExpeditionResourceBonuses

                const rpHighest = .0005 * data.ReincarnationPointHighest;
                const timeFactor = (Math.min(team.TimePassed, team.ExpeditionLenght) + 1) / 3600;
                const rpGain = expeditionRewardBonus * rpHighest * timeFactor * synergyBonus * (1 + rpRewardCount * .025);
                const tokenGain = expeditionRewardBonus * timeFactor * synergyBonus * (1 + tokenRewardCount * .005)

                return (
                    <Grid2 xs={6} key={i} className={"expCardContainer"}>
                        <div className="tooltip">
                            <div className="tooltip-content">
                                <Grid2 container spacing={0}>
                                    <Grid2 xs={12}>
                                        <h3>
                                            {TeamName}
                                        </h3>
                                    </Grid2>
                                    <Grid2 xs={6}>
                                        <Typography variant={"body"}>PWR+=&nbsp;{Number(tmpPower).toExponential(3)}</Typography>
                                    </Grid2>
                                    <Grid2 xs={6}>
                                        <Typography variant={"body"}>XP&nbsp;+=&nbsp;{Number(totalXpGain).toExponential(3)}</Typography>
                                    </Grid2>
                                    <Grid2 xs={6}>
                                        <Typography variant={"body"}>Base={Number(CardPowerGain).toExponential(3)}</Typography>
                                    </Grid2>
                                    <Grid2 xs={6}>
                                        <Typography variant={"body"}>Base={Number(CardExpGain).toExponential(3)}</Typography>
                                    </Grid2>
                                    <Grid2 xs={6}>
                                        <Typography variant={"body"}>Exp. Power*=&nbsp;{Number((1.0 + cardPowerCount * 0.025)).toExponential(3)}</Typography>
                                    </Grid2>
                                    <Grid2 xs={6}>
                                        <Typography variant={"body"}>Exp. Exper*=&nbsp;{Number((1.0 + cardXpCount * 0.025)).toExponential(3)}</Typography>
                                    </Grid2>
                                    <Grid2 xs={6}>
                                        <Typography variant={"body"}>Exp. Reward*=&nbsp;{Number((1.0 + expRewardCount * 0.05)).toExponential(3)}</Typography>
                                    </Grid2>
                                    <Grid2 xs={6}>

                                    </Grid2>
                                    <Grid2 xs={6}>
                                        <Typography variant={"body"}>Exp. Synergy*=&nbsp;{Number(synergyBonus).toExponential(3)}</Typography>
                                    </Grid2>
                                    <Grid2 xs={6}>

                                    </Grid2>
                                </Grid2>
                            </div>
                        </div>
                        <Grid2 container spacing={5}>
                            <Grid2 xs={12}>
                                <div><Typography variant={"body"}>
                                    {TeamName}
                                </Typography>
                                </div>
                            </Grid2>
                            <Grid2 xs={12}>
                                <img src={`/fapi_fork_personal/cards/cardPower.png`} className={"statIcon"} />:&nbsp;{tmpPower.toExponential(2)}
                            </Grid2>
                            <Grid2 xs={12}>
                                <img src={`/fapi_fork_personal/cards/CardExp.png`} className={"statIcon"} />:&nbsp;{totalXpGain.toExponential(2)}
                            </Grid2>
                            <Grid2 xs={12}>
                                <img src={`/fapi_fork_personal/cards/rp.png`} className={"statIcon"} />&nbsp;{rpGain.toExponential(2)}
                            </Grid2>
                            <Grid2 xs={12}>
                                <img src={`/fapi_fork_personal/cards/exp_token.png`} className={"statIcon"} />&nbsp;{tokenGain.toFixed(0)}
                            </Grid2>
                        </Grid2>
                    </Grid2>
                );
            })}
        </Grid2>
    );
}

export default function CardComponent({ data, weightMap, applyWeights }) {

    const [cardMap, setCardMap] = useState({})

    if (!!data === false) return <div></div>;

    const { CardsCollection } = data;

    // const foundCards = CardsCollection.filter(card => card.Found === 1);
    const cardsById = CardsCollection.reduce((accum, card) => {
        accum[card.ID] = card;
        return accum;
    }, {});

    let weightedCardInfo = [];

    for (let i = 0; i < CARD_DISPLAY_IDS.length; i++) {
        weightedCardInfo.push(
            <CardCard cardMap={cardMap} setCardMap={setCardMap} data={data} i={i} card={cardsById[CARD_DISPLAY_IDS[i]]} weightMap={weightMap} classes={classes} applyWeights={true} key={`${i}-orig`}></CardCard>
        )
    }

    let baseCardArr = [];
    Object.values(cardMap).forEach((inner_card) => {
        baseCardArr.push(inner_card);
    })
    let topPercIncrease = baseCardArr.sort((a, b) => {
        let res = b.percIncrease.greaterThan(a.percIncrease) ? 1 : -1;
        return res;
    });

    let finalPercIncrease = topPercIncrease.slice(0, 5).map((value, index, arr) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div style={{ fontSize: '36px', margin: '0 6px 0 0', }}>
                    {index + 1}
                </div>
                <CardCard displayMode='perc' vertical={true} cardMap={cardMap} setCardMap={setCardMap} data={data} i={index} card={cardsById[value.ID]} weightMap={weightMap} classes={classes} key={`${index}-perc`}></CardCard>
            </div>
        )
    }, []);

    let flatIncrease = baseCardArr.sort((a, b) => {
        let res = b.flatIncrease.greaterThan(a.flatIncrease) ? 1 : -1;
        return res;
    });
    let finalFlatIncrease = flatIncrease.slice(0, 5).map((value, index, arr) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div style={{ fontSize: '36px', margin: '0 6px 0 0', }}>
                    {index + 1}
                </div>
                <CardCard displayMode='flat' vertical={true} cardMap={cardMap} setCardMap={setCardMap} data={data} i={index} card={cardsById[value.ID]} weightMap={weightMap} classes={classes} key={`${index}-perc`}></CardCard>
            </div>
        )
    }, []);



    //s
    console.log(topPercIncrease.slice(0, 5));

    return (
        <div
            style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
            }}
        >
            <div
                style={{ display: 'flex', marginBottom: '12px' }}
            >
                <div
                    style={{ display: 'flex', alignItems: 'center', fontSize: '48px' }}
                >
                    {data?.CurrentCardCharge}
                </div>
                <img src={`/fapi_fork_personal/cards/charge.png`} />
            </div>
            <div
                style={{
                    display: 'flex'
                }}
            >
                {/* Original Cards */}
                <div
                    style={{
                        maxWidth: '474px',
                        // maxWidth: '1050px',
                        // height: '605px',
                        padding: '6px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignContent: 'flex-start',
                        border: '1px solid black',
                        borderRadius: '6px'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'center'
                        }}
                    >

                        <h3
                            style={{ marginTop: '-3px', marginBottom: '6px' }}
                        >Current Cards</h3>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignContent: 'flex-start'
                        }}
                    >
                        {weightedCardInfo}
                    </div>
                </div>
                {/* Top 5 % increase */}
                <div
                    style={{
                        maxWidth: '474px',
                        // maxWidth: '1050px',
                        // height: '605px',
                        padding: '6px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignContent: 'flex-start',
                        border: '1px solid black',
                        borderRadius: '6px',
                        margin: '0 12px'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >

                        <h3
                            style={{ marginTop: '-3px', marginBottom: '6px' }}
                        >Best % Increase</h3>

                        {finalPercIncrease}
                    </div>

                </div>
                {/* Top 5 FLAT increase */}
                <div
                    style={{
                        maxWidth: '474px',
                        // maxWidth: '1050px',
                        // height: '605px',
                        padding: '6px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignContent: 'flex-start',
                        border: '1px solid black',
                        borderRadius: '6px',
                        // margin: '0 12px'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >

                        <h3
                            style={{ marginTop: '-3px', marginBottom: '6px' }}
                        >Best Raw Increase</h3>

                        {finalFlatIncrease}
                    </div>

                </div>
            </div>

        </div>
    );
}
