import React, { useState, useEffect } from 'react';
import MouseOverPopover from "./tooltip";



const roundTwoDecimal = function (num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}
const roundInt = function (num) {
    return Math.round((num + Number.EPSILON) * 1) / 1;
}

function calculateLogarithm(base, x) {
    var a = Math.log(x);
    var b = Math.log(base);

    return a / b;
}

const FarmingLanding = ({ data }) => {

    const [customMultipliers, setCustomMultipliers] = useState([1, 2, 3, 4, 5, 6, 7, 8]);

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

    for (let i = 0; i < plants.length; i++) {
        let plant = plants[i];
        if (plant.Locked === 0) continue;

        plant.prestige = picPlants[i];
        plant.prestigeBonus = Math.pow(1.02, plant.prestige)
        plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * shopGrowingSpeed) / petPlantCombo);
        plant.created = plant.ManuallyCreated.mantissa * (Math.pow(10, plant.ManuallyCreated.exponent));
        plant.perHarvest = roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
        plant.curExp = plant.CurrentExp.mantissa * (Math.pow(10, plant.CurrentExp.exponent));
        plant.reqExp = plant.ExpNeeded.mantissa * (Math.pow(10, plant.ExpNeeded.exponent));
        //plant.timeToLevel = (plant.reqExp - plant.curExp) / plant.perHarvest * plant.growthTime;
        plant.timeToLevel = (plant.reqExp - plant.curExp) / (plant.prestigeBonus * shopRankEXP) * plant.growthTime;
        plant.currMult = Math.pow((1 + 0.05 * (1 + manualHarvestFormula * 0.02)), calculateLogarithm(1.25, plant.created));
        finalPlants.push(plant);

        if (plant.timeToLevel <= timeTillNextLevel) {
            timeTillNextLevel = plant.timeToLevel;
        }
    }

    let futurePlants = [];
    for (let i = 0; i < finalPlants.length; i++) {
        let newPlant = JSON.parse(JSON.stringify(finalPlants[i]));
        newPlant.futureMult = Math.pow(
            (1 + 0.05 * (1 + manualHarvestFormula * 0.02)),
            calculateLogarithm(1.25, newPlant.created + (newPlant.perHarvest * (timeTillNextLevel / newPlant.growthTime)))
        );
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


    return (
        <div>
            Farming goes here
            <div>Shop Growing Speed: x{roundTwoDecimal(Math.pow(1.05, shopGrowingSpeed))}</div>
            <div>Shop Rank EXP: x{roundTwoDecimal(shopRankEXP)}</div>
            <div>Improve Harvest Formula: x{roundTwoDecimal(1 + manualHarvestFormula * 0.02)}</div>
            <div>Pet Plant Growth Combo: x{roundTwoDecimal(petPlantCombo)}</div>
            <div
                style={{ display: 'flex', flexDirection: 'row' }}
            >
                {finalPlants.map((val, index) => {
                    return (
                        <div style={{ border: '1px solid black', margin: '12px', padding: '6px' }}>
                            <div style={{ display: 'flex' }}>
                                <div style={{ marginRight: 'auto' }}> {`Plant t${index}`}</div>
                                <div>{`Harvest ${roundTwoDecimal(val.perHarvest)}`}</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ marginRight: 'auto' }}>{`Rank ${val.Rank}`}</div>
                                <div>{`Prestige: ${val.prestige} (${roundTwoDecimal(val.prestigeBonus)})`}</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ marginRight: '24px' }}>{`Growth ${val.growthTime}s`}</div>
                                <div>{`Till level ${roundTwoDecimal(val.timeToLevel / 60)} minutes`}</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ marginRight: 'clamp(6px, 8px, 12px)' }}>
                                    {`Multiplier: ${roundTwoDecimal(val.currMult)}`}
                                </div>
                                <div>{`My modifier: x`}</div>

                                <input id='prepFormInput'
                                    style={{
                                        width: '36px'
                                        // , WebkitAppearance: 'none' 
                                    }}
                                    type='number'
                                    className='prepNumber'
                                    value={customMultipliers[index]}
                                    onChange={
                                        (e) => {
                                            try {
                                                let x = Number(e.target.value);
                                                // x = Math.floor(x);
                                                if (x < 0.0001 || x > 99999999) {
                                                    return;
                                                }
                                                let newArr = [...customMultipliers];
                                                newArr[index] = x;
                                                setCustomMultipliers(newArr);

                                            }
                                            catch (err) {
                                                console.log(err);
                                            }
                                            // console.log(`pressed: ${e.target.value}`)

                                        }}
                                    placeholder={customMultipliers[index] + ''}
                                    min="0.0001"
                                    max="99999999"
                                />
                                <div>    {`(${roundTwoDecimal(val.currMult * (customMultipliers[index]))})`}</div>
                            </div>

                        </div>
                    )

                })}

            </div>
            <div>
                {`Net multiplier ${roundTwoDecimal(finalPlants.reduce((prevVal, curVal, index) => { return prevVal * (curVal.currMult) }, 1)).toExponential(2)} (${roundTwoDecimal(finalPlants.reduce((prevVal, curVal, index) => { return prevVal * (curVal.currMult * (customMultipliers[index])) }, 1)).toExponential(2)})`}
            </div>
            <div>
                {`Time till fastest level ${roundTwoDecimal(timeTillNextLevel / 60)} minutes`}
            </div>
            <div style={{ display: 'flex' }}>
                {futurePlants.map((plant, index) => {

                    return (
                        <div style={{ border: '1px solid black', margin: '12px', padding: '6px' }}>
                            <div style={{ display: 'flex' }}>
                                <div>{`T${index} mult after ${roundTwoDecimal(timeTillNextLevel / 60)} minutes:`}</div>
                                <div style={{ margin: '0 6px 0 6px' }}>  {`x${roundTwoDecimal(plant.futureMult)}`}</div>
                                <div>  {`(${roundTwoDecimal(plant.futureMultMine)})`}</div>

                            </div>
                            <div style={{ display: 'flex' }}>
                                <div> {`Total Mult:`}</div>

                                <MouseOverPopover tooltip={
                                    <div>
                                        <div>The multiplicative total of all plants' multipliers</div>
                                        <div>Calculated as THIS plants future value {`(${roundTwoDecimal(plant.futureMult)})`} * all the others plant current multiplier</div>
                                    </div>
                                }>
                                    <div>
                                        <div style={{ color: plant.overalMult === highestOverallMult ? 'red' : '', margin: '0 6px 0 6px' }}> {`${roundTwoDecimal(plant.overalMult).toExponential(3)} `}</div>
                                    </div>

                                </MouseOverPopover>

                                <MouseOverPopover tooltip={
                                    <div>
                                        <div>The additive total of all plants' multipliers</div>
                                        <div>Calculated as THIS plants future value {`(${roundTwoDecimal(plant.futureMult)})`} + all the others plant current multiplier</div>
                                    </div>
                                }>
                                    <div>
                                        <div style={{ color: plant.overalMultMine === highestOverallMultMine ? 'blue' : '' }}> {`(${roundTwoDecimal(plant.overalMultMine).toExponential(3)}) `}</div>
                                    </div>

                                </MouseOverPopover>


                            </div>
                            <div style={{ display: 'flex' }}>
                                <div> {`Weighted Mult Increase:`}</div>
                                {/* <div style={{ color: plant.weightedMultIncrease === highestWeightedMultIncrease ? 'green' : '', margin: '0 6px 0 6px' }}> {`${roundTwoDecimal(plant.weightedMultIncrease).toExponential(3)} `}</div> */}

                                <MouseOverPopover tooltip={
                                    <div>
                                        <div>The increase in multiplier TIMES the `My Modifier`</div>
                                        <div>Calculated as THIS plants future value {`(${roundTwoDecimal(plant.futureMult - plant.currMult)})`} * {roundTwoDecimal(customMultipliers[index])}</div>
                                    </div>
                                }>
                                    <div style={{ color: plant.weightedMultIncreaseMine === highestWeightedMultIncreaseMine ? 'purple' : '', margin: '0 6px 0 6px' }}> {`${roundTwoDecimal(plant.weightedMultIncreaseMine).toExponential(3)} `}</div>
                                </MouseOverPopover>



                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default FarmingLanding;