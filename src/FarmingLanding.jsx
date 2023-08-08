import React, { useState, useEffect } from 'react';
import MouseOverPopover from "./tooltip";
import FarmingPlant from './FarmPlant';
import helper from "./util/helper.js"

import ReactGA from "react-ga4";

const FarmingLanding = ({ data }) => {

    const [customMultipliers, setCustomMultipliers] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    const [futureTime, setFutureTime] = useState(0.0001);
    // const [numAuto, setNumAuto] = useState(1);
    const [password, setPassword] = useState('');
    const [futureGrasshopper, setFutureGrasshopper] = useState(1);
    const [plantAutos, setPlantAutos] = useState([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
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
    let contagionPlantGrowth = 1;

    if (data.GrasshopperCollection[2].Locked > 0) {
        let base = helper.calcPOW(data.GrasshopperCollection[2].BaseBonus);
        let level = helper.calcPOW(data.GrasshopperCollection[2].Level);
        contagionPlantEXP = Math.pow(1 + base * 0.01, level);
    }

    if (data.GrasshopperCollection[4].Locked > 0) {
        let base = helper.calcPOW(data.GrasshopperCollection[4].BaseBonus);
        let level = helper.calcPOW(data.GrasshopperCollection[4].Level);
        contagionPlantGrowth = Math.pow(1 + base * 0.01, level);
    }


    let soulPlantEXP = 1 + (0.25 * data.SoulLeafTreatment);

    let shopGrowingSpeed = data.FarmingShopPlantGrowingSpeed;
    let manualHarvestFormula = data.FarmingShopPlantManualHarvestFormula;
    let shopRankEXP = 1 + data.FarmingShopPlantRankExpEarned * 0.1;
    let picPlants = data.FarmingShopPlantImprovement;
    let plants = data.PlantCollection;
    let finalPlants = [];
    const currFries = helper.calcPOW(data.FrenchFriesTotal);

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

    const modifiers = {
        time: 0,
        // numAuto: numAuto,
        shopGrowingSpeed: shopGrowingSpeed,
        manualHarvestFormula: manualHarvestFormula,
        shopRankEXP: shopRankEXP, picPlants: picPlants,
        petPlantCombo: Number(petPlantCombo),
        contagionPlantEXP: contagionPlantEXP,
        contagionPlantGrowth: contagionPlantGrowth,
        soulPlantEXP: soulPlantEXP
    }

    for (let i = 0; i < plants.length; i++) {
        let plant = plants[i];
        if (plant.Locked === 0) continue;

        plant.prestige = picPlants[i];
        plant.prestigeBonus = Math.pow(1.02, plant.prestige)
        plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * shopGrowingSpeed) / petPlantCombo / contagionPlantGrowth);
        if (plant.growthTime < 10) {
            plant.growthTime = 10;
        }
        plant.created = plant.ManuallyCreated.mantissa * (Math.pow(10, plant.ManuallyCreated.exponent));

        plant.perHarvest = helper.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
        plant.curExp = plant.CurrentExp.mantissa * (Math.pow(10, plant.CurrentExp.exponent));
        plant.reqExp = plant.ExpNeeded.mantissa * (Math.pow(10, plant.ExpNeeded.exponent));
        //plant.timeToLevel = (plant.reqExp - plant.curExp) / plant.perHarvest * plant.growthTime;
        plant.timeToLevel = (plant.reqExp - plant.curExp) / (plant.prestigeBonus * shopRankEXP * modifiers.contagionPlantEXP * soulPlantEXP) * plant.growthTime;
        plant.currMult = Math.pow((1 + 0.05 * (1 + manualHarvestFormula * 0.02)), helper.calculateLogarithm(1.25, plant.created));
        finalPlants.push(plant);

        if (plant.timeToLevel <= timeTillNextLevel) {
            timeTillNextLevel = plant.timeToLevel;
        }
    }


    // for (let i = 0; i < finalPlants.length; i++) {
    //     let newPlant = helper.calcFutureMult(finalPlants[i], { ...modifiers, time: timeTillNextLevel })
    //     futurePlants.push(newPlant);
    // }

    let futureT0 = helper.calcFutureMult(finalPlants[0], { ...modifiers, time: secondsHour * 1.2 })
    let futureT1 = helper.calcFutureMult(finalPlants[0], { ...modifiers, time: secondsHour * 2 })

    let customFuturePlants = [];
    let futurePlants = [];
    for (let i = 0; i < finalPlants.length; i++) {
        let newPlant = helper.calcFutureMult(finalPlants[i], { ...modifiers, time: secondsHour * futureTime, numAuto: plantAutos[i] });
        newPlant.futureMultMine = newPlant.futureMult * (customMultipliers[i]);
        newPlant.multIncrease = newPlant.futureMult - newPlant.currMult;
        newPlant.multIncreaseMine = newPlant.futureMultMine - newPlant.currMult * (customMultipliers[i]);
        newPlant.weightedMultIncrease = newPlant.multIncrease * (customMultipliers[i]);
        newPlant.weightedMultIncreaseMine = newPlant.multIncreaseMine;

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
        customFuturePlants.push(newPlant);
        futurePlants.push(newPlant);
    }

    // if (password !== 'cheese_needed_this')
    //     return <div>
    //         <input type='string' value={password} onChange={(e) => { setPassword(e.target.value) }} />
    //     </div>

    const dataGrassHopper = helper.calcPOW(data.GrasshopperTotal);
    const level = dataGrassHopper + (futureGrasshopper - 1);
    let grassHopperAmount = helper.roundInt(2250 + (level + 1) * (level + 2) / 2 * 250 * Math.pow(1.025, level));

    return (
        <div>
            <div style={{ display: 'flex', height: '148px' }}>
                <div style={{ minWidth: '256px' }}>
                    <div>Shop Growing Speed: x{helper.roundTwoDecimal(Math.pow(1.05, shopGrowingSpeed))}</div>
                    <div>Shop Rank EXP: x{helper.roundTwoDecimal(shopRankEXP)}</div>
                    <div>Soul Shop Rank EXP: x{helper.roundTwoDecimal(soulPlantEXP)}</div>
                    <div>Improve Harvest Formula: x{helper.roundTwoDecimal(1 + manualHarvestFormula * 0.02)}</div>
                    <div>Pet Plant Growth Combo: x{helper.roundTwoDecimal(petPlantCombo)}</div>

                    <div style={{ margin: '0 12px 0 0', display: 'flex', alignContent: 'center' }}>
                        <img style={{ height: '36px', margin: '0 6px 0 0' }} src={`/fapi_fork_personal/farming/fries.png`} />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {currFries.toExponential(3)}
                        </div>
                    </div>
                </div>

                {/* Contagion */}
                <div style={{ minWidth: '160px', display: 'flex' }}>
                    <div style={{ position: 'relative', display: 'flex', width: '160px' }}>
                        <img style={{ height: '95%', position: 'absolute' }} src={`/fapi_fork_personal/farming/contagion.png`} />

                        <div style={{ position: 'absolute', height: '40%', width: '100%' }}>
                            <img style={{ position: 'absolute', height: '60%', left: '3%', top: '9%' }} src={`/fapi_fork_personal/farming/rank3.png`} />
                            <div style={{ position: 'absolute', color: 'white', background: 'black', borderRadius: '6px', height: '12px', fontSize: '12px', top: '60%', left: '5.5%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 3px 0 3px' }}>x{helper.roundTwoDecimal(contagionPlantEXP)} </div>
                        </div>
                        <div style={{ position: 'absolute', height: '40%', width: '70%', bottom: '1px' }}>
                            <img style={{ position: 'absolute', height: '70%', bottom: '15%' }} src={`/fapi_fork_personal/farming/growth.png`} />
                            <div style={{
                                position: 'absolute',
                                background: 'black',
                                borderRadius: '6px',
                                height: '12px',
                                bottom: '15%',
                                left: '8%',
                                color: 'white',
                                fontSize: '12px',
                                display: 'flex',
                                justifyContent: 'center', alignItems: 'center', width: 'calc(40% - 10px)'
                            }}>x{helper.roundTwoDecimal(contagionPlantGrowth)} </div>
                        </div>
                    </div>
                    <div>
                    </div>

                </div>
                {/* grasshopper */}
                <div style={{ display: 'flex', position: 'relative', margin: '0 0 0 12px' }}>
                    <div style={{ display: 'flex', maxHeight: '24px' }}>
                        <div style={{ margin: '0 6px 0 0' }}>{`Next grasshopper breakpoint ${dataGrassHopper} +`}</div>
                        <input
                            style={{
                                width: '30px'
                                // , WebkitAppearance: 'none' 
                            }}
                            step={`1`}
                            type='number'
                            className='prepNumber'
                            value={futureGrasshopper}
                            onChange={
                                (e) => {
                                    try {
                                        let x = Number(e.target.value);
                                        x = Math.floor(x);
                                        if (x < 0 || x > 99999999) {
                                            return;
                                        }


                                        ReactGA.event({
                                            category: "farming_interaction",
                                            action: `changed_grassHopper`,
                                            label: `${x}`,
                                            value: x
                                        })

                                        setFutureGrasshopper(x);
                                    }
                                    catch (err) {
                                        console.log(err);
                                    }
                                }}
                            placeholder={futureGrasshopper + ''}
                            min="0"
                            max="99999999"
                        />
                        <div style={{ margin: '0 0 0 5px' }}>{` = ${dataGrassHopper + futureGrasshopper}`}</div>
                    </div>
                    <div style={{ position: 'absolute', top: '24px', height: `90%`, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <img style={{ height: '88.9%' }} src={`/fapi_fork_personal/farming/grasshopper.png`} />
                        <div style={{
                            position: 'absolute',
                            // border: '1px solid white',
                            color: 'white', bottom: `16%`, left: 0,
                            width: '100%', display: 'flex', justifyContent: 'center',
                            fontSize: '13px'
                        }}> +{(grassHopperAmount - currFries) < 100000 ? helper.roundTwoDecimal(grassHopperAmount - currFries) : (grassHopperAmount - currFries).toExponential(2)} ({grassHopperAmount < 100000 ? helper.roundTwoDecimal(grassHopperAmount) : grassHopperAmount.toExponential(2)})</div>
                    </div>
                    {/* <div>Grasshopper Amount: +{helper.roundTwoDecimal(grassHopperAmount - currFries)} ({helper.roundTwoDecimal(grassHopperAmount)})</div> */}
                </div>

                {/* Explanation */}
                <div style={{ marginLeft: '24px' }}>
                    <h3 style={{ margin: '0' }}>How to use</h3>
                    <div>
                        <div>
                            Time to prestige: The red/orange arrow displays time until the plant hits its next PIC level (affected by Num Autos + future hours)
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div style={{ color: 'red', marginRight: '6px' }}>
                                Total Mult:
                            </div>
                            <div>
                                Your best `short-term` multiplier gain (calculated as all plants final multipler x each other)
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div style={{ color: 'blue', marginRight: '6px' }}>
                                Total Mult:
                            </div>
                            <div>
                                Your best `long-term` multiplier gain (calculated as a plants' final multipler x their weight + other plants final multipler * their weight)
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div style={{ color: 'Purple', marginRight: '6px' }}>
                                Weighted Mult Increase:
                            </div>
                            <div>
                                Your best single-plant (sort-of long term) multiplier gain (calculated as a plants' final multipler gain x their weight)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}  >
                {finalPlants.map((val, index) => { return <FarmingPlant data={{ setPlantAutos: setPlantAutos, plantAutos: plantAutos, plant: val, index: index, customMultipliers: customMultipliers, setCustomMultipliers: setCustomMultipliers, allowSetMultipliers: false, allowSetMultipliers: true }} /> })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>Future Calculations</h3>
                <div style={{ display: 'flex' }}>
                    <MouseOverPopover tooltip={
                        <div>
                            How many hours into the future to calculate for each plant
                        </div>
                    }>
                        <div>Hours to calculate</div>

                    </MouseOverPopover>

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
                                    if (x < 0.01 || x > 99999999) {
                                        return;
                                    }
                                    setFutureTime(x);

                                    ReactGA.event({
                                        category: "farming_interaction",
                                        action: `changed_futureHours`,
                                        label: `${x}`,
                                        value: x
                                    })

                                }
                                catch (err) {
                                    console.log(err);
                                }
                            }}
                        placeholder={futureTime + ''}
                        min="0.01"
                        max="99999999"
                    />
                </div>


                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {customFuturePlants.map((plant, index) => {
                        return <FarmingPlant data={
                            {
                                setPlantAutos: setPlantAutos, plantAutos: plantAutos,
                                plant: plant,
                                index: index,
                                customMultipliers: customMultipliers,
                                setCustomMultipliers: setCustomMultipliers,
                                allowSetMultipliers: false,
                                useFutureValues: true,
                                modifiers: modifiers
                            }
                        } />
                    }
                    )}
                </div>


                <div>
                    {`Net multiplier ${helper.roundTwoDecimal(futurePlants.reduce((prevVal, curVal, index) => { return prevVal * (curVal.futureMult) }, 1)).toExponential(2)} (${helper.roundTwoDecimal(futurePlants.reduce((prevVal, curVal, index) => { return prevVal * (curVal.futureMult * (customMultipliers[index])) }, 1)).toExponential(2)})`}
                </div>
                {/* <div>
                    {`Time till fastest level ${helper.roundTwoDecimal(timeTillNextLevel / 60)} minutes`}
                </div> */}
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {futurePlants.map((plant, index) => {

                        return (
                            <div style={{ border: '1px solid black', margin: '6px', padding: '0 6px 0 0', width: '305px' }}>
                                <div style={{ display: 'flex' }}>
                                    <div>{`P${index + 1} mult after ${helper.roundTwoDecimal(futureTime)} hours:`}</div>
                                    <div style={{ margin: '0 6px 0 6px' }}>  {`x${helper.roundTwoDecimal(plant.futureMult)}`}</div>
                                    <div>  {`(${helper.roundTwoDecimal(plant.futureMultMine)})`}</div>

                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div> {`Total Mult:`}</div>

                                    <MouseOverPopover tooltip={
                                        <div>
                                            <div>The multiplicative total of all plants' multipliers</div>
                                            <div>Calculated as THIS plants future Mult. {`(${helper.roundTwoDecimal(plant.futureMult)})`} * all the others plant current multiplier</div>
                                        </div>
                                    }>
                                        <div>
                                            <div style={{ color: plant.overalMult === highestOverallMult ? 'red' : '', margin: '0 6px 0 6px' }}> {`${helper.roundTwoDecimal(plant.overalMult).toExponential(3)} `}</div>
                                        </div>

                                    </MouseOverPopover>

                                    <MouseOverPopover tooltip={
                                        <div>
                                            <div>The additive total of all plants' multipliers</div>
                                            <div>Calculated as THIS plants future Mult. {`(${helper.roundTwoDecimal(plant.futureMult)})`} * `Weight` THEN + all the others plant current multiplier * their `Weight`</div>
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
                                            <div>The increase in multiplier TIMES the `Weight`</div>
                                            <div>Calculated as THIS plants future mult. - THIS plants current mult. {`(${helper.roundTwoDecimal(plant.futureMult - plant.currMult)})`} * {helper.roundTwoDecimal(customMultipliers[index])}</div>
                                        </div>
                                    }>
                                        <div style={{ color: plant.weightedMultIncreaseMine === highestWeightedMultIncreaseMine ? 'purple' : '', margin: '0 6px 0 6px' }}> {`${helper.roundTwoDecimal(plant.weightedMultIncreaseMine).toExponential(3)} `}</div>
                                    </MouseOverPopover>



                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>


            {/* Explanation */}
            <div style={{ display: 'flex' }}>
                <div>
                    <FarmingPlant data={{ fake: true }} />
                </div>
                <div style={{ marginLeft: '24px' }}>
                    <h3 style={{ margin: '0' }}>How to use</h3>
                    <div>
                        <div>
                            Time to prestige: The red/orange arrow displays time until the plant hits its next PIC level (affected by Num Autos + future hours)
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div style={{ color: 'red', marginRight: '6px' }}>
                                Total Mult:
                            </div>
                            <div>
                                Your best `short-term` multiplier gain (calculated as all plants final multipler x each other)
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div style={{ color: 'blue', marginRight: '6px' }}>
                                Total Mult:
                            </div>
                            <div>
                                Your best `long-term` multiplier gain (calculated as a plants' final multipler x their weight + other plants final multipler * their weight)
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div style={{ color: 'Purple', marginRight: '6px' }}>
                                Weighted Mult Increase:
                            </div>
                            <div>
                                Your best single-plant (sort-of long term) multiplier gain (calculated as a plants' final multipler gain x their weight)
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
};

export default FarmingLanding;