import React, { useState, useEffect } from 'react';
import MouseOverPopover from "./tooltip";
import FarmingPlant from './FarmPlant';
import helper from "./util/helper.js"

import ReactGA from "react-ga4";

const FarmingLanding = ({ data }) => {

    const [customMultipliers, setCustomMultipliers] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
    const [futureTime, setFutureTime] = useState(2);
    const [numAuto, setNumAuto] = useState(1);
    const [password, setPassword] = useState('');
    const secondsHour = 3600;

    useEffect(() => {

        let petPlantCombo = 1;
        let shopGrowingSpeed = data.FarmingShopPlantGrowingSpeed;
        let manualHarvestFormula = data.FarmingShopPlantManualHarvestFormula;
        let shopRankEXP = 1 + data.FarmingShopPlantRankExpEarned * 0.1;
        let picPlants = data.FarmingShopPlantImprovement;
        let plants = data.PlantCollection;
        let finalPlants = [];

        let timeTillNextLevel = Number.MAX_SAFE_INTEGER;

        let highestOverallMult = 0;
        let highestOverallMultMine = 0;
        let highestWeightedMultIncrease = 0;
        let highestWeightedMultIncreaseMine = 0;


        for (let i = 0; i < data.PetsSpecial.length; i++) {
            let t = data.PetsSpecial[i];
            if (t.BonusID === 5015 && t.Active === 1) {
                petPlantCombo += t.BonusPower / 100;
            }
        }


        let newArr = [];
        let smallestGrowth = -1;
        for (let i = 0; i < data.PlantCollection.length; i++) {
            let plant = data.PlantCollection[i];
            // plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * shopGrowingSpeed) / petPlantCombo);
            plant.growthTime = plant.TimeNeeded;
            if (plant.growthTime < 10) {
                plant.growthTime = 10;
            }

            if (smallestGrowth === -1)
                smallestGrowth = plant.growthTime;
            else if (plant.growthTime < smallestGrowth)
                smallestGrowth = plant.growthTime;

            newArr.push(plant);
        }

        for (let i = 0; i < newArr.length; i++) {
            newArr[i] = newArr[i].growthTime / smallestGrowth;
        }

        setCustomMultipliers(newArr);

    }, [data])

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: "/farming", title: "Farming Calculator Page" });
    }, [])

    let petPlantCombo = 1;
    let contagionPlantEXP = 1;

    if (data.GrasshopperCollection[2].Locked > 0) {
        let base = helper.calcPOW(data.GrasshopperCollection[2].BaseBonus);
        let level = helper.calcPOW(data.GrasshopperCollection[2].Level);
        contagionPlantEXP = Math.pow(1 + base * 0.01, level);
    }

    let shopGrowingSpeed = data.FarmingShopPlantGrowingSpeed;
    let manualHarvestFormula = data.FarmingShopPlantManualHarvestFormula;
    let shopRankEXP = 1 + data.FarmingShopPlantRankExpEarned * 0.1;
    let picPlants = data.FarmingShopPlantImprovement;
    let plants = data.PlantCollection;
    let finalPlants = [];

    let modifiers = { time: 0, numAuto: numAuto, shopGrowingSpeed: shopGrowingSpeed, manualHarvestFormula: manualHarvestFormula, shopRankEXP: shopRankEXP, picPlants: picPlants, petPlantCombo: petPlantCombo, contagionPlantEXP: contagionPlantEXP }


    let timeTillNextLevel = Number.MAX_SAFE_INTEGER;

    let highestOverallMult = 0;
    let highestOverallMultMine = 0;
    let highestWeightedMultIncrease = 0;
    let highestWeightedMultIncreaseMine = 0;


    for (let i = 0; i < data.PetsSpecial.length; i++) {
        let t = data.PetsSpecial[i];
        if (t.BonusID === 5015 && t.Active === 1) {
            petPlantCombo += t.BonusPower / 100;
        }
    }

    for (let i = 0; i < plants.length; i++) {
        let plant = plants[i];
        if (plant.Locked === 0) continue;

        plant.prestige = picPlants[i];
        plant.prestigeBonus = Math.pow(1.02, plant.prestige)
        plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * shopGrowingSpeed) / petPlantCombo);
        if (plant.growthTime < 10) {
            plant.growthTime = 10;
        }
        plant.created = plant.ManuallyCreated.mantissa * (Math.pow(10, plant.ManuallyCreated.exponent));

        plant.perHarvest = helper.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
        plant.curExp = plant.CurrentExp.mantissa * (Math.pow(10, plant.CurrentExp.exponent));
        plant.reqExp = plant.ExpNeeded.mantissa * (Math.pow(10, plant.ExpNeeded.exponent));
        //plant.timeToLevel = (plant.reqExp - plant.curExp) / plant.perHarvest * plant.growthTime;
        plant.timeToLevel = (plant.reqExp - plant.curExp) / (plant.prestigeBonus * shopRankEXP * modifiers.contagionPlantEXP) * plant.growthTime;
        plant.currMult = Math.pow((1 + 0.05 * (1 + manualHarvestFormula * 0.02)), helper.calculateLogarithm(1.25, plant.created));
        finalPlants.push(plant);

        if (plant.timeToLevel <= timeTillNextLevel) {
            timeTillNextLevel = plant.timeToLevel;
        }
    }

    let futurePlants = [];
    for (let i = 0; i < finalPlants.length; i++) {
        // let newPlant = JSON.parse(JSON.stringify(finalPlants[i]));
        // newPlant.futureMult = Math.pow(
        //     (1 + 0.05 * (1 + manualHarvestFormula * 0.02)),
        //     calculateLogarithm(1.25, newPlant.created + (newPlant.perHarvest * (timeTillNextLevel / newPlant.growthTime)))
        // );

        let newPlant = helper.calcFutureMult(finalPlants[i], { ...modifiers, time: timeTillNextLevel })
        newPlant.futureMultMine = newPlant.futureMult * (customMultipliers[i]);
        newPlant.multIncrease = newPlant.futureMult - newPlant.currMult;
        newPlant.multIncreaseMine = newPlant.futureMultMine - newPlant.currMult * (customMultipliers[i]);
        newPlant.weightedMultIncrease = newPlant.multIncrease * (customMultipliers[i]);
        newPlant.weightedMultIncreaseMine = newPlant.multIncreaseMine;


        // for (let j = i - 1; j >= 0; j--) {
        //     // newPlant.weightedMultIncrease *= finalPlants[j].currMult
        //     newPlant.weightedMultIncrease *= 1.1;
        //     newPlant.weightedMultIncreaseMine *= 1.25;
        // }

        newPlant.overalMult = 1;
        newPlant.overalMultMine = 1;

        for (let j = 0; j < finalPlants.length; j++) {
            if (i !== j) {
                newPlant.overalMult *= finalPlants[j].currMult;
                newPlant.overalMultMine += finalPlants[j].currMult * customMultipliers[j];
            }
            else {
                newPlant.overalMult *= newPlant.futureMult;
                newPlant.overalMultMine += newPlant.futureMult * customMultipliers[j];
            }
        }


        if (newPlant.overalMult > highestOverallMult)
            highestOverallMult = newPlant.overalMult;
        if (newPlant.overalMultMine > highestOverallMultMine)
            highestOverallMultMine = newPlant.overalMultMine;
        if (newPlant.weightedMultIncrease > highestWeightedMultIncrease) {
            highestWeightedMultIncrease = newPlant.weightedMultIncrease;
        }
        if (newPlant.weightedMultIncreaseMine > highestWeightedMultIncreaseMine) {
            highestWeightedMultIncreaseMine = newPlant.weightedMultIncreaseMine;
        }

        futurePlants.push(newPlant);
    }

    let futureT0 = helper.calcFutureMult(finalPlants[0], { ...modifiers, time: secondsHour * 1.2 })
    let futureT1 = helper.calcFutureMult(finalPlants[0], { ...modifiers, time: secondsHour * 2 })

    let customFuturePlants = [];

    for (let i = 0; i < finalPlants.length; i++) {
        let newFuture = helper.calcFutureMult(finalPlants[i], { ...modifiers, time: secondsHour * futureTime });
        customFuturePlants.push(newFuture);
    }

    // if (password !== 'cheese_needed_this')
    //     return <div>
    //         <input type='string' value={password} onChange={(e) => { setPassword(e.target.value) }} />
    //     </div>

    return (
        <div>
            <div>Shop Growing Speed: x{helper.roundTwoDecimal(Math.pow(1.05, shopGrowingSpeed))}</div>
            <div>Shop Rank EXP: x{helper.roundTwoDecimal(shopRankEXP)}</div>
            <div>Improve Harvest Formula: x{helper.roundTwoDecimal(1 + manualHarvestFormula * 0.02)}</div>
            <div>Pet Plant Growth Combo: x{helper.roundTwoDecimal(petPlantCombo)}</div>
            <div>Contagion Rank EXP: x{helper.roundTwoDecimal(contagionPlantEXP)}</div>
            <div
                style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}
            >
                {finalPlants.map((val, index) => { return <FarmingPlant data={{ plant: val, index: index, customMultipliers: customMultipliers, setCustomMultipliers: setCustomMultipliers, allowSetMultipliers: false, allowSetMultipliers: true }} /> })}

            </div>
            <div>
                {`Net multiplier ${helper.roundTwoDecimal(finalPlants.reduce((prevVal, curVal, index) => { return prevVal * (curVal.currMult) }, 1)).toExponential(2)} (${helper.roundTwoDecimal(finalPlants.reduce((prevVal, curVal, index) => { return prevVal * (curVal.currMult * (customMultipliers[index])) }, 1)).toExponential(2)})`}
            </div>
            <div>
                {`Time till fastest level ${helper.roundTwoDecimal(timeTillNextLevel / 60)} minutes`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {futurePlants.map((plant, index) => {

                    return (
                        <div style={{ border: '1px solid black', margin: '12px', padding: '6px' }}>
                            <div style={{ display: 'flex' }}>
                                <div>{`T${index} mult after ${helper.roundTwoDecimal(timeTillNextLevel / 60)} minutes:`}</div>
                                <div style={{ margin: '0 6px 0 6px' }}>  {`x${helper.roundTwoDecimal(plant.futureMult)}`}</div>
                                <div>  {`(${helper.roundTwoDecimal(plant.futureMultMine)})`}</div>

                            </div>
                            <div style={{ display: 'flex' }}>
                                <div> {`Total Mult:`}</div>

                                <MouseOverPopover tooltip={
                                    <div>
                                        <div>The multiplicative total of all plants' multipliers</div>
                                        <div>Calculated as THIS plants future value {`(${helper.roundTwoDecimal(plant.futureMult)})`} * all the others plant current multiplier</div>
                                    </div>
                                }>
                                    <div>
                                        <div style={{ color: plant.overalMult === highestOverallMult ? 'red' : '', margin: '0 6px 0 6px' }}> {`${helper.roundTwoDecimal(plant.overalMult).toExponential(3)} `}</div>
                                    </div>

                                </MouseOverPopover>

                                <MouseOverPopover tooltip={
                                    <div>
                                        <div>The additive total of all plants' multipliers</div>
                                        <div>Calculated as THIS plants future value {`(${helper.roundTwoDecimal(plant.futureMult)})`} + all the others plant current multiplier</div>
                                    </div>
                                }>
                                    <div>
                                        <div style={{ color: plant.overalMultMine === highestOverallMultMine ? 'blue' : '' }}> {`(${helper.roundTwoDecimal(plant.overalMultMine).toExponential(3)}) `}</div>
                                    </div>

                                </MouseOverPopover>


                            </div>
                            <div style={{ display: 'flex' }}>
                                <div> {`Weighted Mult Increase:`}</div>
                                {/* <div style={{ color: plant.weightedMultIncrease === highestWeightedMultIncrease ? 'green' : '', margin: '0 6px 0 6px' }}> {`${helper.roundTwoDecimal(plant.weightedMultIncrease).toExponential(3)} `}</div> */}

                                <MouseOverPopover tooltip={
                                    <div>
                                        <div>The increase in multiplier TIMES the `My Modifier`</div>
                                        <div>Calculated as THIS plants future value {`(${helper.roundTwoDecimal(plant.futureMult - plant.currMult)})`} * {helper.roundTwoDecimal(customMultipliers[index])}</div>
                                    </div>
                                }>
                                    <div style={{ color: plant.weightedMultIncreaseMine === highestWeightedMultIncreaseMine ? 'purple' : '', margin: '0 6px 0 6px' }}> {`${helper.roundTwoDecimal(plant.weightedMultIncreaseMine).toExponential(3)} `}</div>
                                </MouseOverPopover>



                            </div>
                        </div>
                    )
                })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>Future Calculations</h3>
                <div style={{ display: 'flex' }}>

                    <div>Hours to calculate</div>
                    <input
                        style={{
                            // width: '48px'
                            // , WebkitAppearance: 'none' 
                        }}
                        type='number'
                        className='prepNumber'
                        value={futureTime}
                        onChange={
                            (e) => {
                                try {
                                    let x = Number(e.target.value);
                                    // x = Math.floor(x);
                                    if (x < 0.0001 || x > 99999999) {
                                        return;
                                    }
                                    setFutureTime(x);
                                }
                                catch (err) {
                                    console.log(err);
                                }
                            }}
                        placeholder={futureTime + ''}
                        min="0.0001"
                        max="99999999"
                    />
                </div>
                <div style={{ display: 'flex' }}>

                    <div>Num Autos</div>
                    <input
                        style={{
                            // width: '48px'
                            // , WebkitAppearance: 'none' 
                        }}
                        type='number'
                        className='prepNumber'
                        value={numAuto}
                        onChange={
                            (e) => {
                                try {
                                    let x = Number(e.target.value);
                                    x = Math.floor(x);
                                    if (x < 1 || x > 8) {
                                        return;
                                    }
                                    setNumAuto(x);
                                }
                                catch (err) {
                                    console.log(err);
                                }
                            }}
                        placeholder={numAuto + ''}
                        min="1"
                        max="8"
                    />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {customFuturePlants.map((plant, index) => {
                        return <FarmingPlant data={
                            {
                                plant: plant,
                                index: index,
                                customMultipliers: customMultipliers,
                                setCustomMultipliers: setCustomMultipliers,
                                allowSetMultipliers: false,
                                useFutureValues: true
                            }
                        } />
                    }
                    )}

                </div>
            </div>
        </div>
    );
};

export default FarmingLanding;