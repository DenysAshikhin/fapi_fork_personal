import React, { useState, useEffect, useRef } from 'react';
import MouseOverPopover from "./tooltip";
import FarmingPlant from './FarmPlant';
import helper from "./util/helper.js"
import './FarmingLanding.css';
import ReactGA from "react-ga4";

const FarmerWorker = new Worker(new URL('./farmingWorker.js', import.meta.url))
// const FarmerWorker = new Worker('./farmingWorker.js', { type: "module" })
const FarmerWorker1 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker2 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker3 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker4 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker5 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const workers = [FarmerWorker, FarmerWorker1, FarmerWorker2, FarmerWorker3, FarmerWorker4, FarmerWorker5];

function generateCombinations(objects, people) {
    const result = [];

    function backtrack(index, remainingObjects, currentCombination) {
        if (index === people) {
            if (remainingObjects === 0) {
                result.push([...currentCombination]);
            }
            return;
        }

        for (let i = 0; i <= remainingObjects; i++) {
            currentCombination[index] = i;
            backtrack(index + 1, remainingObjects - i, currentCombination);
        }
    }

    backtrack(0, objects, []);

    return result;
}

function splitArray(arr, x) {
    if (x <= 0) {
        return "Invalid value for x";
    }

    const n = arr.length;
    if (n < x) {
        return "Array size is smaller than x";
    }

    const chunkSize = Math.floor(n / x);
    const remainder = n % x;

    const result = [];
    let start = 0;
    for (let i = 0; i < x; i++) {
        const end = start + chunkSize + (i < remainder ? 1 : 0);
        result.push(arr.slice(start, end));
        start = end;
    }

    return result;
}

function splitArrayIndices(arr, x) {
    if (x <= 0) {
        return "Invalid value for x";
    }

    const n = arr.length;
    if (n < x) {
        return "Array size is smaller than x";
    }

    const chunkSize = Math.floor(n / x);
    const remainder = n % x;

    const indices = [];
    let start = 0;
    for (let i = 0; i < x; i++) {
        const end = start + chunkSize + (i < remainder ? 1 : 0);
        indices.push([start, end - 1]);
        start = end;
    }

    return indices;
}

const FarmingLanding = ({ data }) => {

    const [customMultipliers, setCustomMultipliers] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    const [futureTime, setFutureTime] = useState(0.01);
    // const [numAuto, setNumAuto] = useState(1);
    const [password, setPassword] = useState('');
    const [futureGrasshopper, setFutureGrasshopper] = useState(1);
    const [plantAutos, setPlantAutos] = useState([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    const secondsHour = 3600;
    const farmCalcStarted = useRef({});
    const farmTotals = useRef([]);
    const [numThreads, setNumThreads] = useState(6);

    useEffect(() => {

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
        let assemblyPlantExp = 1;

        if (data?.AssemblerCollection[0].BonusList[1].StartingLevel <= data?.AssemblerCollection[0].Level) {
            assemblyPlantExp += data?.AssemblerCollection[0].BonusList[1].Gain * (data?.AssemblerCollection[0].Level - data?.AssemblerCollection[0].BonusList[1].StartingLevel);
        }

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
            soulPlantEXP: soulPlantEXP,
            assemblyPlantExp: assemblyPlantExp,
            expBonus: shopRankEXP * soulPlantEXP * contagionPlantEXP * assemblyPlantExp
        }


        let newArr = [];
        let smallestGrowth = -1;
        for (let i = 0; i < data.PlantCollection.length; i++) {
            let plant = data.PlantCollection[i];
            plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * modifiers.shopGrowingSpeed) / modifiers.petPlantCombo / modifiers.contagionPlantGrowth)
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
    let contagionPlantProd = 1;

    if (data.GrasshopperCollection[2].Locked > 0) {
        let base = helper.calcPOW(data.GrasshopperCollection[2].BaseBonus);
        let level = helper.calcPOW(data.GrasshopperCollection[2].Level);
        contagionPlantEXP = Math.pow(1 + base * 0.01, level);
    }
    if (data.GrasshopperCollection[3].Locked > 0) {
        let base = helper.calcPOW(data.GrasshopperCollection[3].BaseBonus);
        let level = helper.calcPOW(data.GrasshopperCollection[3].Level);
        contagionPlantProd = Math.pow(1 + base * 0.01, level);
    }
    if (data.GrasshopperCollection[4].Locked > 0) {
        let base = helper.calcPOW(data.GrasshopperCollection[4].BaseBonus);
        let level = helper.calcPOW(data.GrasshopperCollection[4].Level);
        contagionPlantGrowth = Math.pow(1 + base * 0.01, level);
    }


    let soulPlantEXP = 1 + (0.25 * data.SoulLeafTreatment);

    let shopGrowingSpeed = data.FarmingShopPlantGrowingSpeed;
    let manualHarvestFormula = data.FarmingShopPlantManualHarvestFormula;
    let shopProdBonus = Math.pow(1.25, data.FarmingShopPlantTotalProduction)
    let shopRankEXP = 1 + data.FarmingShopPlantRankExpEarned * 0.1;
    let picPlants = data.FarmingShopPlantImprovement;
    let plants = data.PlantCollection;
    let finalPlants = [];
    let assemblyPlantExp = 1;

    if (data?.AssemblerCollection[0].BonusList[1].StartingLevel <= data?.AssemblerCollection[0].Level) {
        assemblyPlantExp += data?.AssemblerCollection[0].BonusList[1].Gain * (data?.AssemblerCollection[0].Level - data?.AssemblerCollection[0].BonusList[1].StartingLevel);
    }

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
        soulPlantEXP: soulPlantEXP,
        assemblyPlantExp: assemblyPlantExp,
        shopProdBonus: shopProdBonus,
        contagionPlantProd: contagionPlantProd,
        expBonus: shopRankEXP * soulPlantEXP * contagionPlantEXP * assemblyPlantExp
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
        plant.totalMade = plant.TotalCreated.mantissa * (Math.pow(10, plant.TotalCreated.exponent));

        plant.perHarvest = helper.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
        plant.curExp = plant.CurrentExp.mantissa * (Math.pow(10, plant.CurrentExp.exponent));
        plant.reqExp = plant.ExpNeeded.mantissa * (Math.pow(10, plant.ExpNeeded.exponent));
        //plant.timeToLevel = (plant.reqExp - plant.curExp) / plant.perHarvest * plant.growthTime;
        plant.timeToLevel = (plant.reqExp - plant.curExp) / (plant.prestigeBonus * shopRankEXP * modifiers.contagionPlantEXP * soulPlantEXP) * plant.growthTime;
        plant.currMult = Math.pow((1 + 0.05 * (1 + manualHarvestFormula * 0.02)), helper.calculateLogarithm(1.25, plant.created));


        if (plant.timeToLevel <= timeTillNextLevel) {
            timeTillNextLevel = plant.timeToLevel;
        }
        let prod = helper.calcProdOutput(plant, modifiers);
        plant.production = prod;
        plant.elapsedTime = 0;

        finalPlants.push(plant);
    }


    // for (let i = 0; i < finalPlants.length; i++) {
    //     let newPlant = helper.calcFutureMult(finalPlants[i], { ...modifiers, time: timeTillNextLevel })
    //     futurePlants.push(newPlant);
    // }

    // let futureT0 = helper.calcFutureMult(finalPlants[0], { ...modifiers, time: secondsHour * 1.2 })
    // let futureT1 = helper.calcFutureMult(finalPlants[0], { ...modifiers, time: secondsHour * 2 })

    let bestAddPlant;
    let bestMultPlant;

    let customFuturePlants = [];
    let futurePlants = [];

    for (let i = finalPlants.length - 1; i >= 0; i--) {
        let curr = JSON.parse(JSON.stringify(finalPlants[i]));
        let toAdd = i === finalPlants.length - 1 ? 0 : futurePlants[0].production * secondsHour * futureTime
        curr.totalMade += toAdd;
        let newPlant = helper.calcFutureMult(curr, { ...modifiers, time: secondsHour * futureTime, numAuto: plantAutos[i] });
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

        if (newPlant.overalMult > highestOverallMult) {
            highestOverallMult = newPlant.overalMult;
            bestMultPlant = newPlant;
        }
        if (newPlant.overalMultMine > highestOverallMultMine) {
            highestOverallMultMine = newPlant.overalMultMine;
            bestAddPlant = newPlant;
        }

        customFuturePlants.unshift(newPlant);
        futurePlants.unshift(newPlant);
    }

    const [farmCalcProgress, setFarmCalcProgress] = useState({ current: 0, max: 0 })
    const [bestPlantCombo, setBestPlantCombo] = useState([])

    useEffect(() => {

        const findBest = () => {
            let finished = true;
            for (let i = 0; i < 6; i++) {
                if (farmCalcStarted.current[i]) {
                    finished = false;
                }
            }
            if (finished) {

                console.log(`Time end: ` + (new Date()).getTime())
                setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current = 100;
                    newAmount.max = 100;
                    return newAmount;
                })
                console.log(`ready to find best`);

                let bestProd = { prod: 0 };
                let bestPot = { pot: 0 };
                for (let i = 0; i < farmTotals.current.length; i++) {
                    let cur = farmTotals.current[i];
                    if (cur.bestProdCombo.result.potatoeProduction > bestProd.prod) {
                        bestProd = { prod: cur.bestProdCombo.result.potatoeProduction, result: cur.bestProdCombo }
                    }
                    if (cur.totalPotCombo.result.totalPotatoes > bestPot.pot) {
                        bestPot = { pot: cur.totalPotCombo.result.totalPotatoes, result: cur.totalPotCombo }
                    }
                }
                console.log(`best potatoe combo:`);
                console.log(bestPot)
                console.log(`best production combo:`);
                console.log(bestProd)
                setBestPlantCombo({ prod: bestProd.result.combo, pot: bestPot.result.combo })
            }
        }

        FarmerWorker.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
                    return newAmount;
                })
            }
            console.log(`get sm back`)
            farmCalcStarted.current[0] = false;
            farmTotals.current.push(response);
            findBest();
        })

        FarmerWorker1.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
                    return newAmount;
                })
            }
            console.log(`get sm1 back`)
            farmCalcStarted.current[1] = false;
            farmTotals.current.push(response);
            findBest();
        })
        FarmerWorker2.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
                    return newAmount;
                })
            }
            console.log(`get sm2 back`)
            farmCalcStarted.current[2] = false;
            farmTotals.current.push(response);
            findBest();
        })
        FarmerWorker3.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
                    return newAmount;
                })
            }

            console.log(`get sm3 back`)
            farmCalcStarted.current[3] = false;
            farmTotals.current.push(response);
            findBest();
        })
        FarmerWorker4.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
                    return newAmount;
                })
            }

            console.log(`get sm4 back`)
            farmCalcStarted.current[4] = false;
            farmTotals.current.push(response);
            findBest();
        })
        FarmerWorker5.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
                    return newAmount;
                })
            }

            console.log(`get sm5 back`)
            farmCalcStarted.current[5] = false;
            farmTotals.current.push(response);
            findBest();
        })


    }, [])


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
                {/* grasshopper */}
                <div style={{ display: 'flex', position: 'relative', margin: '0 24px 0 12px' }}>
                    <div style={{ display: 'flex', maxHeight: '24px' }}>
                        <div style={{ margin: '0 6px 0 0' }}>{`Next grasshopper breakpoint ${helper.roundInt(dataGrassHopper)} +`}</div>
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
                        <div style={{ margin: '0 0 0 5px' }}>{` = ${helper.roundInt(dataGrassHopper + futureGrasshopper)}`}</div>
                    </div>
                    <div style={{ position: 'absolute', top: '24px', height: `90%`, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <img style={{ height: '88.9%' }} src={`/fapi_fork_personal/farming/grasshopper.png`} />
                        <div style={{
                            position: 'absolute',
                            // border: '1px solid white',
                            color: 'white', bottom: `16%`, left: 0,
                            width: '100%', display: 'flex', justifyContent: 'center',
                            fontSize: '12px'
                        }}> +{(grassHopperAmount - currFries).toExponential(2)} ({grassHopperAmount.toExponential(2)})</div>
                    </div>
                    {/* <div>Grasshopper Amount: +{helper.roundTwoDecimal(grassHopperAmount - currFries)} ({helper.roundTwoDecimal(grassHopperAmount)})</div> */}
                </div>
                {/* Contagion */}
                <div style={{ minWidth: '160px', display: 'flex', margin: '0 24px 0 0' }}>
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


                {/* Assembly */}
                <div style={{ width: '340px', background: '#c9c9c9', zIndex: '-2', borderRadius: '6px' }}>

                    <div style={{ position: 'relative', height: '36px', width: '235px', borderRadius: '6px', marginBottom: '6px' }}>
                        <img style={{
                            height: '100%',
                            position: 'absolute',
                            zIndex: '-1',
                            borderRadius: '6px'
                        }} src={`/fapi_fork_personal/farming/assembly_bg.png`} />

                        <div className='strokeBlack' style={{ position: 'absolute', left: '48px', top: '-1px', color: 'white', fontWeight: 'bold', fontSize: '24px', height: '100%', }} >
                            Assembly
                        </div>
                    </div>


                    <div style={{ position: 'relative', height: '33px', width: 'calc(100% - 12px)', margin: '0 6px 0 6px' }}>

                        <img style={{
                            // height: '100%',
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            zIndex: '-1'
                        }} src={`/fapi_fork_personal/farming/assembly_plant_rank_exp.png`} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', width: '100%', height: '48px', top: '0px' }}>
                            <div className='strokeBlack' style={{ color: 'white', fontWeight: 'bold', fontSize: '22px', marginLeft: '42px' }}>
                                Plant Rank EXP:
                            </div>
                            <div className='strokeBlack' style={{ color: 'white', fontWeight: 'bold', fontSize: '22px', marginRight: '8px' }}>
                                x{helper.roundTwoDecimal(assemblyPlantExp)}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}  >
                {finalPlants.map((val, index) => {
                    return <FarmingPlant
                        data={{
                            setPlantAutos: setPlantAutos, plantAutos: plantAutos, plant: val, index: index, customMultipliers: customMultipliers, setCustomMultipliers: setCustomMultipliers, allowSetMultipliers: false, allowSetMultipliers: true,
                            modifiers: modifiers
                        }} />
                })}
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

                {/* Future plants */}
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

                {/* Best Plants */}
                <div
                    style={{ display: 'flex', width: '1800px' }}
                >
                    {/* Best plant Multiplicative */}
                    {/* <MouseOverPopover tooltip={
                        <div>
                            <div>The multiplicative total of all plants' multipliers</div>
                            <div>Calculated as THIS plants future Mult. {`(${helper.roundTwoDecimal(bestMultPlant.futureMult)})`} * all the others plant current multiplier</div>
                        </div>
                    }>
                        <div style={{ border: '1px solid black', margin: '6px', padding: '0 6px 0 0', width: '365px', height: '48px' }}>
                            <div
                                style={{ display: 'flex' }}
                            >
                                <div>
                                    {`Best Multiplicative (short-term) Total Mutliplier:`}
                                </div>
                                <div style={{ marginLeft: '6px', color: 'purple', fontWeight: 'bold' }}>
                                    {` P${bestMultPlant.ID}`}
                                </div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ marginRight: '6px' }}>
                                    {`Additive Multiplier Total:`}
                                </div>


                                <div>
                                    <div style={{ color: bestMultPlant.overalMult === highestOverallMult ? 'red' : '', margin: '0 6px 0 6px' }}> {`${helper.roundTwoDecimal(bestMultPlant.overalMult).toExponential(3)} `}</div>
                                </div>

                            </div>
                        </div>
                    </MouseOverPopover> */}

                    {/* Best plant Additive */}
                    {/* <MouseOverPopover tooltip={
                        <div>
                            <div>The additive total of all plants' multipliers</div>
                            <div>Calculated as THIS plants future Mult. {`(${helper.roundTwoDecimal(bestAddPlant.futureMult)})`} * `Weight` THEN + all the others plant current multiplier * their `Weight`</div>
                        </div>
                    }>
                        <div style={{ border: '1px solid black', margin: '6px', padding: '0 6px 0 0', width: '325px', height: '48px' }}>
                            <div
                                style={{ display: 'flex' }}
                            >
                                <div>
                                    {`Best Additive (long-term) Total Mutliplier:`}
                                </div>
                                <div style={{ marginLeft: '6px', color: 'purple', fontWeight: 'bold' }}>
                                    {` P${bestAddPlant.ID}`}
                                </div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ marginRight: '6px' }}>
                                    {`Additive Multiplier Total:`}
                                </div>


                                <div>
                                    <div style={{ color: bestAddPlant.overalMultMine === highestOverallMultMine ? 'blue' : '' }}> {`(${helper.roundTwoDecimal(bestAddPlant.overalMultMine).toExponential(3)}) `}</div>
                                </div>

                            </div>
                        </div>
                    </MouseOverPopover> */}

                    <div style={{ display: 'flex' }}>
                        <div style={{ color: 'black' }}>
                            <div style={{ display: 'flex' }}>

                                <div>
                                    <div>

                                        WIP - Calculate best auto placements
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <div>
                                            Num threads to use for calculating
                                        </div>
                                        <select
                                            style={{ maxWidth: '144px' }}
                                            onChange={
                                                (e) => {
                                                    setNumThreads(Number(e.target.value))
                                                }
                                            }
                                            defaultValue={numThreads + ''}
                                        >
                                            <option
                                                value="1">1</option>
                                            <option
                                                value="2">2</option>
                                            <option
                                                value="3">3</option>
                                            <option
                                                value="4">4</option>
                                            <option
                                                value="5">5</option>
                                            <option
                                                value="6">6</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <button onClick={(e) => {
                                        console.log(`Time start: ` + (new Date()).getTime())
                                        ReactGA.event({
                                            category: "farming_interaction",
                                            action: `clicked_optomise_auto`,
                                            label: `${futureTime}`,
                                            value: futureTime
                                        })

                                        const combinations = generateCombinations(data.FarmingShopAutoPlotBought, finalPlants.length);
                                        // const combinations = generateCombinations(3, finalPlants.length);
                                        const splitArraysIndicies = splitArrayIndices(combinations, numThreads);
                                        farmTotals.current = [];
                                        setFarmCalcProgress((cur) => {
                                            let temp = { ...cur };
                                            temp.max = combinations.length;
                                            temp.current = 0;
                                            return temp;
                                        })
                                        for (let i = 0; i < numThreads; i++) {
                                            if (farmCalcStarted.current[i]) {
                                                continue;
                                            }
                                            let worker = workers[i];
                                            worker.postMessage({
                                                data: {
                                                    combinations: combinations,
                                                    start: splitArraysIndicies[i][0],
                                                    end: splitArraysIndicies[i][1],
                                                    time: futureTime,
                                                    modifiers: { ...modifiers, },
                                                    finalPlants: finalPlants,
                                                },
                                                id: i
                                            })
                                            farmCalcStarted.current[i] = true;
                                        }
                                    }}>Click</button>
                                </div>
                            </div>
                            <div>
                                {`${helper.roundTwoDecimal(farmCalcProgress.current / farmCalcProgress.max * 100)}%`}
                            </div>
                            {(farmCalcProgress.current === farmCalcProgress.max && farmCalcProgress.current !== 0 && bestPlantCombo.prod) && (
                                <div style={{ display: 'flex' }}>
                                    <div style={{ marginRight: '24px' }}>
                                        <div>
                                            Most Potatoe/s
                                        </div>
                                        {bestPlantCombo.prod.map((val, index) => {
                                            // if (val === 0) {
                                            //     return;
                                            // }
                                            return <div>{`P${index + 1}: ${val} autos`} </div>
                                        })}
                                    </div>
                                    <div>
                                        <div>
                                            Most Potatoe Total Made
                                        </div>
                                        {bestPlantCombo.pot.map((val, index) => {
                                            // if (val === 0) {
                                            //     return;
                                            // }
                                            return <div>{`P${index + 1}: ${val} autos`} </div>
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* <div>
                                {`mult (short)` + bestUptomisedMult.toString()}
                            </div>
                            <div>
                                {`add (long): ` + bestUptomisedAdd.toString()}
                            </div> */}

                        </div>

                    </div>


                </div>

            </div >


            {/* Explanation */}
            < div style={{ display: 'flex' }}>
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
                                Multiplicative Total:
                            </div>
                            <div>
                                Your best `short-term` multiplier gain (calculated as all plants final multipler x each other)
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div style={{ color: 'blue', marginRight: '6px' }}>
                                Additive Total:
                            </div>
                            <div>
                                Your best `long-term` multiplier gain (calculated as a plants' final multipler x their weight + other plants final multipler * their weight)
                            </div>
                        </div>
                        {/* <div style={{ display: 'flex' }}>
                            <div style={{ color: 'Purple', marginRight: '6px' }}>
                                Weighted Mult Increase:
                            </div>
                            <div>
                                Your best single-plant (sort-of long term) multiplier gain (calculated as a plants' final multipler gain x their weight)
                            </div>
                        </div> */}
                    </div>
                </div>

            </div >
        </div >
    );
};

export default FarmingLanding;