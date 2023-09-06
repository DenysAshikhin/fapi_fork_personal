import React, { useState, useEffect, useRef, useMemo } from 'react';
import MouseOverPopover from "../tooltip";
import FarmingPlant from './FarmPlant';
import helper from "../util/helper.js";
import farmingHelper from "../util/farmingHelper.js";
import mathHelper from '../util/math.js';
import './FarmingLanding.css';
import ReactGA from "react-ga4";
import Graph from './graph.jsx';

const FarmerWorker = new Worker(new URL('./farmingWorker.js', import.meta.url))
// const FarmerWorker = new Worker('./farmingWorker.js', { type: "module" })
const FarmerWorker1 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker2 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker3 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker4 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker5 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker6 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker7 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker8 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker9 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker10 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const FarmerWorker11 = new Worker(new URL('./farmingWorker.js', import.meta.url))
const workers = [FarmerWorker, FarmerWorker1, FarmerWorker2, FarmerWorker3, FarmerWorker4, FarmerWorker5, FarmerWorker6, FarmerWorker7, FarmerWorker8, FarmerWorker9, FarmerWorker10, FarmerWorker11];

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
    const [numThreads, setNumThreads] = useState(8);
    const [yScale, setYScale] = useState('auto');
    const [calcedFutureTime, setCalcedFutureTime] = useState(futureTime);//Used to lock in for pic displaying what future time what used when calculating

    const [numSimulatedAutos, setNumSimulatedAutos] = useState(data.FarmingShopAutoPlotBought);


    const [farmCalcProgress, setFarmCalcProgress] = useState({ current: 0, max: 0 });
    const [bestPlantCombo, setBestPlantCombo] = useState([]);//holds the best production, total made, pic and pic% after a calculation
    const [bestRunningCombo, setBestRunningCombo] = useState({});//same as above, but used to make the graph update during the loading
    const [forceGraphUpdate, setForceGraphUpdate] = useState(false);
    const [autoBuyPBC, setAutoBuyPBC] = useState(data.ASCFarmingShopAutoPage1 === 1);
    const [lockCustomAuto, setLockCustomAuto] = useState(false);
    const [calcAFK, setCalcAFK] = useState(false);
    const [calcStep, setCalcStep] = useState(false);

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


        let soulPlantEXP = Math.pow(1.25, data.SoulLeafTreatment);

        let shopGrowingSpeed = data.FarmingShopPlantGrowingSpeed;
        let manualHarvestFormula = data.FarmingShopPlantManualHarvestFormula;
        let shopRankEXP = 1 + data.FarmingShopPlantRankExpEarned * 0.1;
        let picPlants = data.FarmingShopPlantImprovement;
        let plants = data.PlantCollection;
        let assemblyPlantExp = 1;
        let assemblyProduction = 1;
        let assemblyPlantharvest = 1;


        if (data?.AssemblerCollection[0].BonusList[1].StartingLevel <= data?.AssemblerCollection[0].Level) {
            assemblyPlantExp *= farmingHelper.calcAssembly(data, 0, 1);
        }
        if (data?.AssemblerCollection[3].BonusList[2].StartingLevel <= data?.AssemblerCollection[3].Level) {
            assemblyProduction *= farmingHelper.calcAssembly(data, 3, 2);
        }
        if (data?.AssemblerCollection[7].BonusList[1].StartingLevel <= data?.AssemblerCollection[7].Level) {
            assemblyProduction *= farmingHelper.calcAssembly(data, 7, 1);
        }
        if (data?.AssemblerCollection[7].BonusList[0].StartingLevel <= data?.AssemblerCollection[7].Level) {
            assemblyPlantharvest *= farmingHelper.calcAssembly(data, 7, 0);
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
    let contagionHarvest = 1;

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
    if (data.GrasshopperCollection[6].Locked > 0) {
        let base = helper.calcPOW(data.GrasshopperCollection[6].BaseBonus);
        let level = helper.calcPOW(data.GrasshopperCollection[6].Level);
        contagionHarvest = Math.pow(1 + base * 0.01, level);
    }

    //data.FarmingShopUniqueHealthy -> each index is a multiplier of x(1 + arr[i])

    let currentHPBonus = helper.calcPOW(data.HealthyPotatoBonus);
    let tempCalcBonus = mathHelper.createDecimal(data.HealthyPotatoBonus);
    // let calcedBonus = farmingHelper.calcHPBonus(data);
    let calcedBonus = mathHelper.createDecimal(data.HealthyPotatoBonus);
    let currHP = helper.calcPOW(data.HealthyPotatoCurrent);
    let totalHP = helper.calcPOW(data.HealthyPotatoTotal);


    let soulPlantEXP = Math.pow(1.25, data.SoulLeafTreatment);

    let shopGrowingSpeed = data.FarmingShopPlantGrowingSpeed;
    let manualHarvestFormula = data.FarmingShopPlantManualHarvestFormula;
    // let shopProdBonus = Math.pow(1.25, data.FarmingShopPlantTotalProduction);
    let shopRankEXP = 1 + data.FarmingShopPlantRankExpEarned * 0.1;
    let shopRankLevel = data.FarmingShopPlantRankExpEarned;
    let picPlants = data.FarmingShopPlantImprovement;
    let plants = data.PlantCollection;

    let assemblyPlantExp = 1;
    let assemblyProduction = 1;
    if (data?.AssemblerCollection[0].BonusList[1].StartingLevel <= data?.AssemblerCollection[0].Level) {
        assemblyPlantExp *= farmingHelper.calcAssembly(data, 0, 1);
    }
    if (data?.AssemblerCollection[3].BonusList[2].StartingLevel <= data?.AssemblerCollection[3].Level) {
        assemblyProduction *= farmingHelper.calcAssembly(data, 3, 2);
    }
    if (data?.AssemblerCollection[7].BonusList[1].StartingLevel <= data?.AssemblerCollection[7].Level) {
        assemblyProduction *= farmingHelper.calcAssembly(data, 7, 1);
    }

    let assemblyPlantharvest = 1;
    if (data?.AssemblerCollection[7].BonusList[0].StartingLevel <= data?.AssemblerCollection[7].Level) {
        assemblyPlantharvest *= farmingHelper.calcAssembly(data, 7, 0);
    }

    const currFries = helper.calcPOW(data.FrenchFriesTotal);

    let timeTillNextLevel = Number.MAX_SAFE_INTEGER;

    let highestOverallMult = 0;
    let highestOverallMultMine = 0;

    for (let i = 0; i < data.PetsSpecial.length; i++) {
        let t = data.PetsSpecial[i];
        if (t.BonusID === 5015 && t.Active === 1) {
            petPlantCombo += t.BonusPower / 100;
        }
    }

    const modifiers = useMemo(() => {
        console.log(`setin modif`);
        return {
            time: 0,
            // numAuto: numAuto,
            shopGrowingSpeed: shopGrowingSpeed,
            manualHarvestFormula: manualHarvestFormula,
            contagionHarvest: contagionHarvest,
            shopRankEXP: shopRankEXP,
            shopRankLevel: shopRankLevel,
            picPlants: picPlants,
            petPlantCombo: Number(petPlantCombo),
            contagionPlantEXP: contagionPlantEXP,
            contagionPlantGrowth: contagionPlantGrowth,
            soulPlantEXP: soulPlantEXP,
            assemblyPlantExp: assemblyPlantExp,
            assemblyProduction: assemblyProduction,
            assemblyPlantharvest: assemblyPlantharvest,
            shopProdBonus: mathHelper.pow(1.25, data.FarmingShopPlantTotalProduction),
            shopProdLevel: data.FarmingShopPlantTotalProduction,
            contagionPlantProd: contagionPlantProd,
            hpBonus: mathHelper.createDecimal(data.HealthyPotatoBonus),
            nextCosts: farmingHelper.getNextShopCosts(data),
            curPotatoes: mathHelper.createDecimal(data.HealthyPotatoCurrent),
            totalPotatoes: mathHelper.createDecimal(data.HealthyPotatoTotal),
            expBonus: shopRankEXP * soulPlantEXP * contagionPlantEXP * assemblyPlantExp,
            autoBuyPBC: autoBuyPBC,
            // tickRate: Math.floor((futureTime * secondsHour) * 0.0015) < 1 ? 1 : Math.floor((futureTime * secondsHour) * 0.0015),
            tickRate: Math.floor((futureTime * secondsHour) * 0.01) < 1 ? 1 : Math.floor((futureTime * secondsHour) * 0.01),
        }
    },
        [
            shopGrowingSpeed, manualHarvestFormula, contagionHarvest, shopRankEXP, shopRankLevel, picPlants, Number(petPlantCombo),
            contagionPlantEXP, contagionPlantGrowth, soulPlantEXP, assemblyPlantExp, assemblyProduction, contagionPlantProd, assemblyPlantharvest,
            data, currHP, totalHP, autoBuyPBC, futureTime
        ]
    )

    const finalPlants = useMemo(() => {
        console.log(`generating inter plants`);
        let tempArr = [];

        for (let i = 0; i < plants.length; i++) {
            let plant = plants[i];
            if (plant.Locked === 0) continue;

            plant.prestige = picPlants[i];
            plant.prestigeBonus = Math.pow(1.02, plant.prestige)
            plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * shopGrowingSpeed) / petPlantCombo / contagionPlantGrowth);
            if (plant.growthTime < 10) {
                plant.growthTime = 10;
            }

            plant.created = mathHelper.createDecimal(plant.ManuallyCreated);
            plant.totalMade = mathHelper.createDecimal(plant.TotalCreated);

            plant.perHarvest = farmingHelper.calcPlantHarvest(plant, modifiers);
            plant.curExp = plant.CurrentExp.mantissa * (Math.pow(10, plant.CurrentExp.exponent));
            plant.reqExp = plant.ExpNeeded.mantissa * (Math.pow(10, plant.ExpNeeded.exponent));
            //plant.timeToLevel = (plant.reqExp - plant.curExp) / plant.perHarvest * plant.growthTime;

            plant.futureMult = farmingHelper.futureMultBD(plant, modifiers);
            let prod = farmingHelper.calcProdOutput(plant, modifiers);
            plant.production = prod;
            plant.timeToLevel = farmingHelper.calcTimeTillLevel(plant, { ...modifiers, numAuto: plantAutos[i] });

            if (plant.timeToLevel <= timeTillNextLevel) {
                timeTillNextLevel = plant.timeToLevel;
            }

            plant.elapsedTime = 0;
            plant.originalRank = plant.Rank;
            tempArr.push(plant);
        }
        return tempArr;
    }, [modifiers, plantAutos, shopGrowingSpeed, petPlantCombo, contagionPlantGrowth])


    const [calcDone, setCalcDone] = useState(true);
    const [expDiff, setExpDiff] = useState(0);

    let tempFuture = useMemo(() => {
        console.log(`calcing`);
        let result = farmingHelper.calcHPProd(finalPlants, { ...modifiers, time: secondsHour * futureTime, numAutos: plantAutos });
        for (let i = 0; i < result.dataPointsPotatoes.length; i++) {
            let cur = result.dataPointsPotatoes[i];
            cur.time = helper.roundInt(cur.time);
            cur.originalProduction = mathHelper.createDecimal(cur.production.toString());
        }

        return result;
    },
        [finalPlants, modifiers, futureTime, plantAutos, secondsHour]);

    //Go through all datapoints, find highest exp, and reduce it for all equally if necessary so JS doesn't break
    const graphObjects = useMemo(() => {
        console.log(`updating EXPDIFF`);

        const maxExp = 300;
        let currMaxExp = 0;
        let diff_exp = 0;

        // Go over all the custom input data points first
        for (let i = 0; i < tempFuture.dataPointsPotatoes.length; i++) {
            let cur = tempFuture.dataPointsPotatoes[i];
            if (cur.originalProduction.exponent > currMaxExp) {
                currMaxExp = cur.originalProduction.exponent;
            }
        }

        if (bestPlantCombo.top10DataPointsPotatoes) {
            // Go over all the top 1 results
            for (let i = 0; i < bestPlantCombo.top10DataPointsPotatoes.length; i++) {
                if (i > 0) break;
                let cur = bestPlantCombo.top10DataPointsPotatoes[i];
                for (let j = 0; j < cur.data.length; j++) {
                    let cur_iner = cur.data[j];
                    if (cur_iner.originalProduction.exponent > currMaxExp) {
                        currMaxExp = cur_iner.originalProduction.exponent;
                    }
                }
            }

            // go over the best PIC
            for (let i = 0; i < bestPlantCombo.bestPic.result.result.dataPointsPotatoes.length; i++) {
                let cur = bestPlantCombo.bestPic.result.result.dataPointsPotatoes[i];
                if (cur.originalProduction.exponent > currMaxExp) {
                    currMaxExp = cur.originalProduction.exponent;
                }
            }
            // go over the best PIC %
            for (let i = 0; i < bestPlantCombo.bestPicPerc.result.result.dataPointsPotatoes.length; i++) {
                let cur = bestPlantCombo.bestPicPerc.result.result.dataPointsPotatoes[i];
                if (cur.originalProduction.exponent > currMaxExp) {
                    currMaxExp = cur.originalProduction.exponent;
                }
            }
        }


        diff_exp = currMaxExp > maxExp ? currMaxExp - maxExp : 0;

        // Reduce all the exponents for custom input first
        for (let i = 0; i < tempFuture.dataPointsPotatoes.length; i++) {
            let cur = tempFuture.dataPointsPotatoes[i];
            cur.production = mathHelper.createDecimal(cur.originalProduction.toString());
            cur.production.exponent -= diff_exp;
            cur.production = cur.production.toNumber();
        }

        if (bestPlantCombo.top10DataPointsPotatoes) {
            // Go over all the top 1 results
            for (let i = 0; i < bestPlantCombo.top10DataPointsPotatoes.length; i++) {
                if (i > 0) break;
                let cur = bestPlantCombo.top10DataPointsPotatoes[i];
                for (let j = 0; j < cur.data.length; j++) {
                    let cur_iner = cur.data[j];
                    cur_iner.production = mathHelper.createDecimal(cur_iner.originalProduction.toString());
                    cur_iner.production.exponent -= diff_exp;
                    cur_iner.production = cur_iner.production.toNumber();
                }
            }

            // go over the best PIC
            for (let i = 0; i < bestPlantCombo.bestPic.result.result.dataPointsPotatoes.length; i++) {
                let cur = bestPlantCombo.bestPic.result.result.dataPointsPotatoes[i];
                cur.production = mathHelper.createDecimal(cur.originalProduction.toString());
                cur.production.exponent -= diff_exp;
                cur.production = cur.production.toNumber();
            }
            // go over the best PIC %
            for (let i = 0; i < bestPlantCombo.bestPicPerc.result.result.dataPointsPotatoes.length; i++) {
                let cur = bestPlantCombo.bestPicPerc.result.result.dataPointsPotatoes[i];
                cur.production = mathHelper.createDecimal(cur.originalProduction.toString());
                cur.production.exponent -= diff_exp;
                cur.production = cur.production.toNumber();
            }
        }

        if (expDiff !== diff_exp) {
            setExpDiff(diff_exp);
        }

        return {
            customProduction: tempFuture,
            top10Potatoes: bestPlantCombo.top10DataPointsPotatoes,
            bestPic: bestPlantCombo?.bestPic?.result?.result?.dataPointsPotatoes,
            bestPicPerc: bestPlantCombo?.bestPicPerc?.result?.result?.dataPointsPotatoes,
        }

    }, [tempFuture, expDiff, bestPlantCombo])

    const runningGraphObjects = useMemo(() => {
        console.log(`updating running EXPDIFF`);

        const maxExp = 300;
        let currMaxExp = 0;
        let diff_exp = 0;

        let runProd = bestRunningCombo.runningProd;

        if (runProd) {
            for (let i = 0; i < runProd.result.result.dataPointsPotatoes.length; i++) {
                let cur_iner = runProd.result.result.dataPointsPotatoes[i];
                if (cur_iner.originalProduction.exponent > currMaxExp) {
                    currMaxExp = cur_iner.originalProduction.exponent;
                }
            }


            diff_exp = currMaxExp > maxExp ? currMaxExp - maxExp : 0;

            for (let i = 0; i < runProd.result.result.dataPointsPotatoes.length; i++) {
                let cur_iner = runProd.result.result.dataPointsPotatoes[i];
                cur_iner.production = mathHelper.createDecimal(cur_iner.originalProduction.toString());
                cur_iner.production.exponent -= diff_exp;
                cur_iner.production = cur_iner.production.toNumber();
            }


        }


        return {
            runningProd: runProd
            // customProduction: tempFuture,
            // top10Potatoes: bestPlantCombo.top10DataPointsPotatoes,
            // bestPic: bestPlantCombo?.bestPic?.result?.result?.dataPointsPotatoes,
            // bestPicPerc: bestPlantCombo?.bestPicPerc?.result?.result?.dataPointsPotatoes,
        }
            ;
        if (bestPlantCombo.top10DataPointsPotatoes) {
            // Go over all the top 1 results
            for (let i = 0; i < bestPlantCombo.top10DataPointsPotatoes.length; i++) {
                if (i > 0) break;
                let cur = bestPlantCombo.top10DataPointsPotatoes[i];
                for (let j = 0; j < cur.data.length; j++) {
                    let cur_iner = cur.data[j];
                    if (cur_iner.originalProduction.exponent > currMaxExp) {
                        currMaxExp = cur_iner.originalProduction.exponent;
                    }
                }
            }

            // go over the best PIC
            for (let i = 0; i < bestPlantCombo.bestPic.result.result.dataPointsPotatoes.length; i++) {
                let cur = bestPlantCombo.bestPic.result.result.dataPointsPotatoes[i];
                if (cur.originalProduction.exponent > currMaxExp) {
                    currMaxExp = cur.originalProduction.exponent;
                }
            }
            // go over the best PIC %
            for (let i = 0; i < bestPlantCombo.bestPicPerc.result.result.dataPointsPotatoes.length; i++) {
                let cur = bestPlantCombo.bestPicPerc.result.result.dataPointsPotatoes[i];
                if (cur.originalProduction.exponent > currMaxExp) {
                    currMaxExp = cur.originalProduction.exponent;
                }
            }
        }


        diff_exp = currMaxExp > maxExp ? currMaxExp - maxExp : 0;

        // Reduce all the exponents for custom input first
        for (let i = 0; i < tempFuture.dataPointsPotatoes.length; i++) {
            let cur = tempFuture.dataPointsPotatoes[i];
            cur.production = mathHelper.createDecimal(cur.originalProduction.toString());
            cur.production.exponent -= diff_exp;
            cur.production = cur.production.toNumber();
        }

        if (bestPlantCombo.top10DataPointsPotatoes) {
            // Go over all the top 1 results
            for (let i = 0; i < bestPlantCombo.top10DataPointsPotatoes.length; i++) {
                if (i > 0) break;
                let cur = bestPlantCombo.top10DataPointsPotatoes[i];
                for (let j = 0; j < cur.data.length; j++) {
                    let cur_iner = cur.data[j];
                    cur_iner.production = mathHelper.createDecimal(cur_iner.originalProduction.toString());
                    cur_iner.production.exponent -= diff_exp;
                    cur_iner.production = cur_iner.production.toNumber();
                }
            }

            // go over the best PIC
            for (let i = 0; i < bestPlantCombo.bestPic.result.result.dataPointsPotatoes.length; i++) {
                let cur = bestPlantCombo.bestPic.result.result.dataPointsPotatoes[i];
                cur.production = mathHelper.createDecimal(cur.originalProduction.toString());
                cur.production.exponent -= diff_exp;
                cur.production = cur.production.toNumber();
            }
            // go over the best PIC %
            for (let i = 0; i < bestPlantCombo.bestPicPerc.result.result.dataPointsPotatoes.length; i++) {
                let cur = bestPlantCombo.bestPicPerc.result.result.dataPointsPotatoes[i];
                cur.production = mathHelper.createDecimal(cur.originalProduction.toString());
                cur.production.exponent -= diff_exp;
                cur.production = cur.production.toNumber();
            }
        }

        if (expDiff !== diff_exp) {
            setExpDiff(diff_exp);
        }

        return {
            customProduction: tempFuture,
            top10Potatoes: bestPlantCombo.top10DataPointsPotatoes,
            bestPic: bestPlantCombo?.bestPic?.result?.result?.dataPointsPotatoes,
            bestPicPerc: bestPlantCombo?.bestPicPerc?.result?.result?.dataPointsPotatoes,
        }

    }, [expDiff, bestRunningCombo])




    let customFuturePlants = [];
    let futurePlants = [];
    for (let i = 0; i < tempFuture.plants.length; i++) {
        let newPlant = tempFuture.plants[i];
        let prestigeTimings = farmingHelper.calcTimeTillPrestige(newPlant, { ...modifiers, time: secondsHour * futureTime, numAuto: plantAutos[i] });

        newPlant.nextPrestige = prestigeTimings.prestige;
        newPlant.timeToPrestige = prestigeTimings.remainingTime;

        customFuturePlants.push(newPlant);
        futurePlants.push(newPlant);
    }


    useEffect(() => {

        const findBest = () => {
            let finished = true;
            for (let i = 0; i < 6; i++) {
                if (farmCalcStarted.current[i]) {
                    finished = false;
                }
            }
            if (finished) {

                setBestPlantCombo((currBestCombo) => {
                    console.log(`Time end: ` + (new Date()).getTime())
                    setFarmCalcProgress((curr) => {
                        let newAmount = { ...curr };
                        newAmount.current = 100;
                        newAmount.max = 100;
                        return newAmount;
                    })
                    console.log(`ready to find best`);

                    let bestProd = { prod: mathHelper.createDecimal(0) };
                    let bestPot = { pot: mathHelper.createDecimal(0) };
                    let bestPic = { pic: 0, prod: mathHelper.createDecimal(0) }
                    let bestPicPerc = { pic: 0, prod: mathHelper.createDecimal(0) }

                    let top10DataPointsPotatoes = [];
                    let top10DataPointsFries = [];

                    for (let i = 0; i < farmTotals.current.length; i++) {
                        let cur = farmTotals.current[i];


                        if (!cur.totalPotCombo.result) {
                            continue;
                        }


                        //Have to reset potatoe values again
                        cur.bestPicCombo.potatoeProduction = cur.bestPicCombo.potatoeProduction ? mathHelper.createDecimal(cur.bestPicCombo.potatoeProduction) : cur.bestPicCombo.potatoeProduction;
                        cur.bestPicCombo.result.potatoeProduction = cur.bestPicCombo.result.potatoeProduction ? mathHelper.createDecimal(cur.bestPicCombo.result.potatoeProduction) : cur.bestPicCombo.result.potatoeProduction;
                        cur.bestPicCombo.result.totalPotatoes = cur.bestPicCombo.result.totalPotatoes ? mathHelper.createDecimal(cur.bestPicCombo.result.totalPotatoes) : cur.bestPicCombo.result.totalPotatoes;
                        cur.bestPICPercCombo.potatoeProduction = cur.bestPICPercCombo.potatoeProduction ? mathHelper.createDecimal(cur.bestPICPercCombo.potatoeProduction) : cur.bestPICPercCombo.potatoeProduction;
                        cur.bestPICPercCombo.result.potatoeProduction = cur.bestPICPercCombo.result.potatoeProduction ? mathHelper.createDecimal(cur.bestPICPercCombo.result.potatoeProduction) : cur.bestPICPercCombo.result.potatoeProduction;
                        cur.bestPICPercCombo.result.totalPotatoes = cur.bestPICPercCombo.result.totalPotatoes ? mathHelper.createDecimal(cur.bestPICPercCombo.result.totalPotatoes) : cur.bestPICPercCombo.result.totalPotatoes;
                        cur.bestProdCombo.result.potatoeProduction = cur.bestProdCombo.result.potatoeProduction ? mathHelper.createDecimal(cur.bestProdCombo.result.potatoeProduction) : cur.bestProdCombo.result.potatoeProduction;
                        cur.bestProdCombo.result.totalPotatoes = cur.bestProdCombo.result.totalPotatoes ? mathHelper.createDecimal(cur.bestProdCombo.result.totalPotatoes) : cur.bestProdCombo.result.totalPotatoes;
                        cur.totalPotCombo.result.totalPotatoes = cur.totalPotCombo.result.totalPotatoes ? mathHelper.createDecimal(cur.totalPotCombo.result.totalPotatoes) : cur.totalPotCombo.result.totalPotatoes;
                        cur.totalPotCombo.result.potatoeProduction = cur.totalPotCombo.result.potatoeProduction ? mathHelper.createDecimal(cur.totalPotCombo.result.potatoeProduction) : cur.totalPotCombo.result.potatoeProduction;



                        for (let j = 0; j < cur.top10DataPointsPotatoes.length; j++) {

                            let cur_top = cur.top10DataPointsPotatoes[j];
                            cur_top.result = mathHelper.createDecimal(cur_top.result);

                            for (let k = 0; k < cur_top.data.length; k++) {
                                let cur_data = cur_top.data[k];
                                cur_data.production = mathHelper.createDecimal(cur_data.production);
                                cur_data.time = helper.roundInt(cur_data.time);
                            }
                        }

                        for (let j = 0; j < cur.top10DataPointsFries.length; j++) {

                            let cur_top = cur.top10DataPointsFries[j];
                            cur_top.result = mathHelper.createDecimal(cur_top.result);

                            for (let k = 0; k < cur_top.data.length; k++) {
                                let cur_data = cur_top.data[k];
                                cur_data.fries = mathHelper.createDecimal(cur_data.fries);
                                cur_data.time = helper.roundInt(cur_data.time);
                            }
                        }


                        for (let j = 0; j < cur.bestPicCombo.result.dataPointsPotatoes.length; j++) {
                            let cur_data = cur.bestPicCombo.result.dataPointsPotatoes[j];
                            cur_data.production = mathHelper.createDecimal(cur_data.production);
                            cur_data.time = helper.roundInt(cur_data.time);
                        }
                        for (let j = 0; j < cur.bestPicCombo.result.dataPointsFries.length; j++) {
                            let cur_data = cur.bestPicCombo.result.dataPointsFries[j];
                            cur_data.fries = mathHelper.createDecimal(cur_data.fries);
                            cur_data.time = helper.roundInt(cur_data.time);
                        }
                        for (let j = 0; j < cur.bestPICPercCombo.result.dataPointsPotatoes.length; j++) {
                            let cur_data = cur.bestPICPercCombo.result.dataPointsPotatoes[j];
                            cur_data.production = mathHelper.createDecimal(cur_data.production);
                            cur_data.time = helper.roundInt(cur_data.time);
                        }
                        for (let j = 0; j < cur.bestPICPercCombo.result.dataPointsFries.length; j++) {
                            let cur_data = cur.bestPICPercCombo.result.dataPointsFries[j];
                            cur_data.fries = mathHelper.createDecimal(cur_data.fries);
                            cur_data.time = helper.roundInt(cur_data.time);
                        }


                        top10DataPointsPotatoes.push(...cur.top10DataPointsPotatoes);
                        top10DataPointsFries.push(...cur.top10DataPointsFries);
                        if (cur.bestPicCombo.picGain > bestPic.pic) {
                            bestPic = { pic: cur.bestPicCombo.picGain, result: cur.bestPicCombo, prod: cur.bestPicCombo.potatoeProduction }
                        }
                        else if (cur.bestPicCombo.picGain === bestPic.pic) {
                            if (cur.bestPicCombo.potatoeProduction.greaterThan(bestPic.prod)) {
                                bestPic = { pic: cur.bestPicCombo.picGain, result: cur.bestPicCombo, prod: cur.bestPicCombo.potatoeProduction }
                            }
                        }

                        if (cur.bestPICPercCombo.picGain > bestPicPerc.pic) {
                            bestPicPerc = { pic: cur.bestPICPercCombo.picGain, result: cur.bestPICPercCombo, prod: cur.bestPICPercCombo.potatoeProduction }
                        }
                        else if (cur.bestPICPercCombo.picGain === bestPicPerc.pic) {
                            if (cur.bestPICPercCombo.potatoeProduction.greaterThan(bestPicPerc.prod)) {
                                bestPicPerc = { pic: cur.bestPICPercCombo.picGain, result: cur.bestPICPercCombo, prod: cur.bestPICPercCombo.potatoeProduction }
                            }
                        }


                        if (cur.bestProdCombo.result.potatoeProduction.greaterThan(bestProd.prod)) {
                            bestProd = { prod: cur.bestProdCombo.result.potatoeProduction, result: cur.bestProdCombo }

                        }
                        if (cur.totalPotCombo.result.totalPotatoes.greaterThan(bestPot.pot)) {
                            bestPot = { pot: cur.totalPotCombo.result.totalPotatoes, result: cur.totalPotCombo }
                        }

                        for (let j = 0; j < cur.top10DataPointsPotatoes.length; j++) {
                            cur.top10DataPointsPotatoes[j].obj = cur.totalPotCombo;
                        }

                    }

                    top10DataPointsPotatoes = top10DataPointsPotatoes.sort((a, b) => b.result.compare(a.result)).slice(0, 10);
                    top10DataPointsFries = top10DataPointsFries.sort((a, b) => b.result.compare(a.result)).slice(0, 10);
                    // top10DataPointsFries =[]


                    for (let i = 0; i < top10DataPointsPotatoes.length; i++) {

                        let cur = top10DataPointsPotatoes[i];
                        for (let j = 0; j < cur.data.length; j++) {
                            cur.data[j].time = helper.roundInt(cur.data[j].time);
                            cur.data[j].originalProduction = mathHelper.createDecimal(cur.data[j].production.toString());
                        }
                    }

                    for (let i = 0; i < bestPic.result.result.dataPointsPotatoes.length; i++) {
                        let cur = bestPic.result.result.dataPointsPotatoes[i];
                        cur.time = helper.roundInt(cur.time);
                        cur.originalProduction = mathHelper.createDecimal(cur.production.toString());
                    }
                    for (let i = 0; i < bestPicPerc.result.result.dataPointsPotatoes.length; i++) {
                        let cur = bestPicPerc.result.result.dataPointsPotatoes[i];
                        cur.time = helper.roundInt(cur.time);
                        cur.originalProduction = mathHelper.createDecimal(cur.production.toString());
                    }

                    if (bestProd.result) {
                        bestProd.finalFry = farmingHelper.calcFryOutput(bestProd.result.result.totalPotatoes);
                        bestPot.finalFry = farmingHelper.calcFryOutput(bestPot.result.result.totalPotatoes);
                        bestPic.finalFry = farmingHelper.calcFryOutput(bestPic.result.result.totalPotatoes);
                        bestPicPerc.finalFry = farmingHelper.calcFryOutput(bestPicPerc.result.result.totalPotatoes);

                        for (let i = 0; i < bestPic.result.plants.length; i++) {

                            bestPic.result.plants[i].created = mathHelper.createDecimal(`${bestPic.result.plants[i].created.mantissa}e${bestPic.result.plants[i].created.exponent}`);
                            bestPic.result.plants[i].totalMade = mathHelper.createDecimal(`${bestPic.result.plants[i].totalMade.mantissa}e${bestPic.result.plants[i].totalMade.exponent}`);
                            bestPic.result.plants[i].production = mathHelper.createDecimal(`${bestPic.result.plants[i].production.mantissa}e${bestPic.result.plants[i].production.exponent}`);

                            bestPicPerc.result.plants[i].created = mathHelper.createDecimal(`${bestPicPerc.result.plants[i].created.mantissa}e${bestPicPerc.result.plants[i].created.exponent}`);
                            bestPicPerc.result.plants[i].totalMade = mathHelper.createDecimal(`${bestPicPerc.result.plants[i].totalMade.mantissa}e${bestPicPerc.result.plants[i].totalMade.exponent}`);
                            bestPicPerc.result.plants[i].production = mathHelper.createDecimal(`${bestPicPerc.result.plants[i].production.mantissa}e${bestPicPerc.result.plants[i].production.exponent}`);

                            bestProd.result.plants[i].created = mathHelper.createDecimal(`${bestProd.result.plants[i].created.mantissa}e${bestProd.result.plants[i].created.exponent}`);
                            bestProd.result.plants[i].totalMade = mathHelper.createDecimal(`${bestProd.result.plants[i].totalMade.mantissa}e${bestProd.result.plants[i].totalMade.exponent}`);
                            bestProd.result.plants[i].production = mathHelper.createDecimal(`${bestProd.result.plants[i].production.mantissa}e${bestProd.result.plants[i].production.exponent}`);

                            bestPot.result.plants[i].created = mathHelper.createDecimal(`${bestPot.result.plants[i].created.mantissa}e${bestPot.result.plants[i].created.exponent}`);
                            bestPot.result.plants[i].totalMade = mathHelper.createDecimal(`${bestPot.result.plants[i].totalMade.mantissa}e${bestPot.result.plants[i].totalMade.exponent}`);
                            bestPot.result.plants[i].production = mathHelper.createDecimal(`${bestPot.result.plants[i].production.mantissa}e${bestPot.result.plants[i].production.exponent}`);
                        }


                        let finalBests = {
                            bestProd: bestProd,
                            prod: bestProd.result.combo,
                            bestPot: bestPot,
                            pot: bestPot.result.combo,
                            bestPic: bestPic,
                            pic: bestPic.result.combo,
                            bestPicPerc: bestPicPerc,
                            picPerc: bestPicPerc.result.combo,
                            top10DataPointsPotatoes: top10DataPointsPotatoes,
                            top10DataPointsFries: top10DataPointsFries
                        }
                        console.log(`Best:`);
                        console.log(finalBests);



                        setCalcDone(true);
                        return finalBests;
                    }
                })
            }
        }

        const updateRunningBest = ({ bestProduction }) => {
            //sounded like a good idea, leads to very jerky graphs
            return;
            setBestRunningCombo((currBestCombo) => {
                let bestProd = currBestCombo.prod ? currBestCombo : { prod: mathHelper.createDecimal(0) };
                let runningProd = { prod: mathHelper.createDecimal(bestProduction.result.potatoeProduction), result: bestProduction };


                if (runningProd.prod.greaterThan(bestProd.prod)) {

                    setForceGraphUpdate(true);
                    runningProd.prod = mathHelper.createDecimal(runningProd.prod);
                    runningProd.result.result.potatoeProduction = mathHelper.createDecimal(runningProd.result.result.potatoeProduction);
                    runningProd.result.result.totalPotatoes = mathHelper.createDecimal(runningProd.result.result.totalPotatoes);

                    for (let i = 0; i < runningProd.result.result.dataPointsPotatoes.length; i++) {
                        let cur = runningProd.result.result.dataPointsPotatoes[i];
                        cur.originalProduction = mathHelper.createDecimal(cur.production);
                        cur.production = mathHelper.createDecimal(cur.production);
                        cur.time = helper.roundInt(cur.time);
                    }


                    return { ...currBestCombo, runningProd: runningProd };
                }

                return currBestCombo;


                let bestPot = { pot: mathHelper.createDecimal(0) };
                let bestPic = { pic: 0, prod: mathHelper.createDecimal(0) }
                let bestPicPerc = { pic: 0, prod: mathHelper.createDecimal(0) }

                let top10DataPointsPotatoes = [];
                let top10DataPointsFries = [];

                for (let i = 0; i < farmTotals.current.length; i++) {
                    let cur = farmTotals.current[i];


                    if (!cur.totalPotCombo.result) {
                        continue;
                    }


                    //Have to reset potatoe values again
                    cur.bestPicCombo.potatoeProduction = cur.bestPicCombo.potatoeProduction ? mathHelper.createDecimal(cur.bestPicCombo.potatoeProduction) : cur.bestPicCombo.potatoeProduction;
                    cur.bestPicCombo.result.potatoeProduction = cur.bestPicCombo.result.potatoeProduction ? mathHelper.createDecimal(cur.bestPicCombo.result.potatoeProduction) : cur.bestPicCombo.result.potatoeProduction;
                    cur.bestPicCombo.result.totalPotatoes = cur.bestPicCombo.result.totalPotatoes ? mathHelper.createDecimal(cur.bestPicCombo.result.totalPotatoes) : cur.bestPicCombo.result.totalPotatoes;
                    cur.bestPICPercCombo.potatoeProduction = cur.bestPICPercCombo.potatoeProduction ? mathHelper.createDecimal(cur.bestPICPercCombo.potatoeProduction) : cur.bestPICPercCombo.potatoeProduction;
                    cur.bestPICPercCombo.result.potatoeProduction = cur.bestPICPercCombo.result.potatoeProduction ? mathHelper.createDecimal(cur.bestPICPercCombo.result.potatoeProduction) : cur.bestPICPercCombo.result.potatoeProduction;
                    cur.bestPICPercCombo.result.totalPotatoes = cur.bestPICPercCombo.result.totalPotatoes ? mathHelper.createDecimal(cur.bestPICPercCombo.result.totalPotatoes) : cur.bestPICPercCombo.result.totalPotatoes;
                    cur.bestProdCombo.result.potatoeProduction = cur.bestProdCombo.result.potatoeProduction ? mathHelper.createDecimal(cur.bestProdCombo.result.potatoeProduction) : cur.bestProdCombo.result.potatoeProduction;
                    cur.bestProdCombo.result.totalPotatoes = cur.bestProdCombo.result.totalPotatoes ? mathHelper.createDecimal(cur.bestProdCombo.result.totalPotatoes) : cur.bestProdCombo.result.totalPotatoes;
                    cur.totalPotCombo.result.totalPotatoes = cur.totalPotCombo.result.totalPotatoes ? mathHelper.createDecimal(cur.totalPotCombo.result.totalPotatoes) : cur.totalPotCombo.result.totalPotatoes;
                    cur.totalPotCombo.result.potatoeProduction = cur.totalPotCombo.result.potatoeProduction ? mathHelper.createDecimal(cur.totalPotCombo.result.potatoeProduction) : cur.totalPotCombo.result.potatoeProduction;



                    for (let j = 0; j < cur.top10DataPointsPotatoes.length; j++) {

                        let cur_top = cur.top10DataPointsPotatoes[j];
                        cur_top.result = mathHelper.createDecimal(cur_top.result);

                        for (let k = 0; k < cur_top.data.length; k++) {
                            let cur_data = cur_top.data[k];
                            cur_data.production = mathHelper.createDecimal(cur_data.production);
                            cur_data.time = helper.roundInt(cur_data.time);
                        }
                    }

                    for (let j = 0; j < cur.top10DataPointsFries.length; j++) {

                        let cur_top = cur.top10DataPointsFries[j];
                        cur_top.result = mathHelper.createDecimal(cur_top.result);

                        for (let k = 0; k < cur_top.data.length; k++) {
                            let cur_data = cur_top.data[k];
                            cur_data.fries = mathHelper.createDecimal(cur_data.fries);
                            cur_data.time = helper.roundInt(cur_data.time);
                        }
                    }


                    for (let j = 0; j < cur.bestPicCombo.result.dataPointsPotatoes.length; j++) {
                        let cur_data = cur.bestPicCombo.result.dataPointsPotatoes[j];
                        cur_data.production = mathHelper.createDecimal(cur_data.production);
                        cur_data.time = helper.roundInt(cur_data.time);
                    }
                    for (let j = 0; j < cur.bestPicCombo.result.dataPointsFries.length; j++) {
                        let cur_data = cur.bestPicCombo.result.dataPointsFries[j];
                        cur_data.fries = mathHelper.createDecimal(cur_data.fries);
                        cur_data.time = helper.roundInt(cur_data.time);
                    }
                    for (let j = 0; j < cur.bestPICPercCombo.result.dataPointsPotatoes.length; j++) {
                        let cur_data = cur.bestPICPercCombo.result.dataPointsPotatoes[j];
                        cur_data.production = mathHelper.createDecimal(cur_data.production);
                        cur_data.time = helper.roundInt(cur_data.time);
                    }
                    for (let j = 0; j < cur.bestPICPercCombo.result.dataPointsFries.length; j++) {
                        let cur_data = cur.bestPICPercCombo.result.dataPointsFries[j];
                        cur_data.fries = mathHelper.createDecimal(cur_data.fries);
                        cur_data.time = helper.roundInt(cur_data.time);
                    }


                    top10DataPointsPotatoes.push(...cur.top10DataPointsPotatoes);
                    top10DataPointsFries.push(...cur.top10DataPointsFries);
                    if (cur.bestPicCombo.picGain > bestPic.pic) {
                        bestPic = { pic: cur.bestPicCombo.picGain, result: cur.bestPicCombo, prod: cur.bestPicCombo.potatoeProduction }
                    }
                    else if (cur.bestPicCombo.picGain === bestPic.pic) {
                        if (cur.bestPicCombo.potatoeProduction.greaterThan(bestPic.prod)) {
                            bestPic = { pic: cur.bestPicCombo.picGain, result: cur.bestPicCombo, prod: cur.bestPicCombo.potatoeProduction }
                        }
                    }

                    if (cur.bestPICPercCombo.picGain > bestPicPerc.pic) {
                        bestPicPerc = { pic: cur.bestPICPercCombo.picGain, result: cur.bestPICPercCombo, prod: cur.bestPICPercCombo.potatoeProduction }
                    }
                    else if (cur.bestPICPercCombo.picGain === bestPicPerc.pic) {
                        if (cur.bestPICPercCombo.potatoeProduction.greaterThan(bestPicPerc.prod)) {
                            bestPicPerc = { pic: cur.bestPICPercCombo.picGain, result: cur.bestPICPercCombo, prod: cur.bestPICPercCombo.potatoeProduction }
                        }
                    }


                    if (cur.bestProdCombo.result.potatoeProduction.greaterThan(bestProd.prod)) {
                        bestProd = { prod: cur.bestProdCombo.result.potatoeProduction, result: cur.bestProdCombo }

                    }
                    if (cur.totalPotCombo.result.totalPotatoes.greaterThan(bestPot.pot)) {
                        bestPot = { pot: cur.totalPotCombo.result.totalPotatoes, result: cur.totalPotCombo }
                    }

                    for (let j = 0; j < cur.top10DataPointsPotatoes.length; j++) {
                        cur.top10DataPointsPotatoes[j].obj = cur.totalPotCombo;
                    }

                }

                top10DataPointsPotatoes = top10DataPointsPotatoes.sort((a, b) => b.result.compare(a.result)).slice(0, 10);
                top10DataPointsFries = top10DataPointsFries.sort((a, b) => b.result.compare(a.result)).slice(0, 10);
                // top10DataPointsFries =[]


                for (let i = 0; i < top10DataPointsPotatoes.length; i++) {

                    let cur = top10DataPointsPotatoes[i];
                    for (let j = 0; j < cur.data.length; j++) {
                        cur.data[j].time = helper.roundInt(cur.data[j].time);
                        cur.data[j].originalProduction = mathHelper.createDecimal(cur.data[j].production.toString());
                    }
                }

                for (let i = 0; i < bestPic.result.result.dataPointsPotatoes.length; i++) {
                    let cur = bestPic.result.result.dataPointsPotatoes[i];
                    cur.time = helper.roundInt(cur.time);
                    cur.originalProduction = mathHelper.createDecimal(cur.production.toString());
                }
                for (let i = 0; i < bestPicPerc.result.result.dataPointsPotatoes.length; i++) {
                    let cur = bestPicPerc.result.result.dataPointsPotatoes[i];
                    cur.time = helper.roundInt(cur.time);
                    cur.originalProduction = mathHelper.createDecimal(cur.production.toString());
                }

                if (bestProd.result) {
                    bestProd.finalFry = farmingHelper.calcFryOutput(bestProd.result.result.totalPotatoes);
                    bestPot.finalFry = farmingHelper.calcFryOutput(bestPot.result.result.totalPotatoes);
                    bestPic.finalFry = farmingHelper.calcFryOutput(bestPic.result.result.totalPotatoes);
                    bestPicPerc.finalFry = farmingHelper.calcFryOutput(bestPicPerc.result.result.totalPotatoes);

                    for (let i = 0; i < bestPic.result.plants.length; i++) {

                        bestPic.result.plants[i].created = mathHelper.createDecimal(`${bestPic.result.plants[i].created.mantissa}e${bestPic.result.plants[i].created.exponent}`);
                        bestPic.result.plants[i].totalMade = mathHelper.createDecimal(`${bestPic.result.plants[i].totalMade.mantissa}e${bestPic.result.plants[i].totalMade.exponent}`);
                        bestPic.result.plants[i].production = mathHelper.createDecimal(`${bestPic.result.plants[i].production.mantissa}e${bestPic.result.plants[i].production.exponent}`);

                        bestPicPerc.result.plants[i].created = mathHelper.createDecimal(`${bestPicPerc.result.plants[i].created.mantissa}e${bestPicPerc.result.plants[i].created.exponent}`);
                        bestPicPerc.result.plants[i].totalMade = mathHelper.createDecimal(`${bestPicPerc.result.plants[i].totalMade.mantissa}e${bestPicPerc.result.plants[i].totalMade.exponent}`);
                        bestPicPerc.result.plants[i].production = mathHelper.createDecimal(`${bestPicPerc.result.plants[i].production.mantissa}e${bestPicPerc.result.plants[i].production.exponent}`);

                        bestProd.result.plants[i].created = mathHelper.createDecimal(`${bestProd.result.plants[i].created.mantissa}e${bestProd.result.plants[i].created.exponent}`);
                        bestProd.result.plants[i].totalMade = mathHelper.createDecimal(`${bestProd.result.plants[i].totalMade.mantissa}e${bestProd.result.plants[i].totalMade.exponent}`);
                        bestProd.result.plants[i].production = mathHelper.createDecimal(`${bestProd.result.plants[i].production.mantissa}e${bestProd.result.plants[i].production.exponent}`);

                        bestPot.result.plants[i].created = mathHelper.createDecimal(`${bestPot.result.plants[i].created.mantissa}e${bestPot.result.plants[i].created.exponent}`);
                        bestPot.result.plants[i].totalMade = mathHelper.createDecimal(`${bestPot.result.plants[i].totalMade.mantissa}e${bestPot.result.plants[i].totalMade.exponent}`);
                        bestPot.result.plants[i].production = mathHelper.createDecimal(`${bestPot.result.plants[i].production.mantissa}e${bestPot.result.plants[i].production.exponent}`);
                    }


                    let finalBests = {
                        bestProd: bestProd,
                        prod: bestProd.result.combo,
                        bestPot: bestPot,
                        pot: bestPot.result.combo,
                        bestPic: bestPic,
                        pic: bestPic.result.combo,
                        bestPicPerc: bestPicPerc,
                        picPerc: bestPicPerc.result.combo,
                        top10DataPointsPotatoes: top10DataPointsPotatoes,
                        top10DataPointsFries: top10DataPointsFries
                    }
                    console.log(`Best:`);
                    console.log(finalBests);



                    setCalcDone(true);
                    return finalBests;
                }
            })

        }


        FarmerWorker.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
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
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
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
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
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
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
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
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
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
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
                    return newAmount;
                })
            }

            console.log(`get sm5 back`)
            farmCalcStarted.current[5] = false;
            farmTotals.current.push(response);
            findBest();
        })
        FarmerWorker6.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
                    return newAmount;
                })
            }

            console.log(`get sm6 back`)
            farmCalcStarted.current[6] = false;
            farmTotals.current.push(response);
            findBest();
        })
        FarmerWorker7.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
                    return newAmount;
                })
            }

            console.log(`get sm7 back`)
            farmCalcStarted.current[7] = false;
            farmTotals.current.push(response);
            findBest();
        })
        FarmerWorker8.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
                    return newAmount;
                })
            }

            console.log(`get sm8 back`)
            farmCalcStarted.current[8] = false;
            farmTotals.current.push(response);
            findBest();
        })
        FarmerWorker9.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
                    return newAmount;
                })
            }

            console.log(`get sm9 back`)
            farmCalcStarted.current[9] = false;
            farmTotals.current.push(response);
            findBest();
        })
        FarmerWorker10.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
                    return newAmount;
                })
            }

            console.log(`get sm10 back`)
            farmCalcStarted.current[10] = false;
            farmTotals.current.push(response);
            findBest();
        })
        FarmerWorker11.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                if (response.temp) {
                    updateRunningBest({ bestProduction: response.temp })
                }
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    // newAmount.current++;
                    // return newAmount;
                    newAmount.current += response.updateAmount;
                    return newAmount;
                })
            }

            console.log(`get sm11 back`)
            farmCalcStarted.current[11] = false;
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


    let notEnoughAuto = false;

    if (lockCustomAuto) {
        let tempTotal = 0
        for (let i = 0; i < finalPlants.length; i++) {
            tempTotal += plantAutos[i];
        }
        if (tempTotal > numSimulatedAutos) {
            ReactGA.event({
                category: "farming_interaction",
                action: `not_enough_autos`,
                label: `${tempTotal - numSimulatedAutos}`,
                value: tempTotal - numSimulatedAutos
            });
            notEnoughAuto = true;
        }
    }

    let displayPicPerc = bestPlantCombo.pic != bestPlantCombo.picPerc;

    // console.log(`exp compare: ${modifiers.expBonus} VS ${helper.calcPOW(data.PlantRankExpBonus)}`)




    return (
        <div style={{ height: '100%', display: 'flex', flex: 1, flexDirection: 'column' }}>

            {/* <div style={{ display: 'flex', height: '148px' }}> */}
            {/* <div style={{ minWidth: '256px' }}>
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
                </div> */}
            {/* grasshopper */}
            {/* 
            <div style={{ display: 'flex', position: 'relative', margin: '0 24px 0 12px' }}>
                <div>
                    <FarmingPlant data={{ fake: true }} />
                </div>
                {/* <div style={{ display: 'flex', maxHeight: '24px' }}>
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
                    </div> */}
            {/* <div>Grasshopper Amount: +{helper.roundTwoDecimal(grassHopperAmount - currFries)} ({helper.roundTwoDecimal(grassHopperAmount)})</div> 
            </div> */}

            {/* Contagion */}

            {/* <div style={{ minWidth: '160px', display: 'flex', margin: '0 24px 0 0' }}>
                    <div style={{ position: 'relative', display: 'flex', width: '160px' }}>
                        <img style={{ height: '95%', position: 'absolute' }} src={`/fapi_fork_personal/farming/contagion.png`} />

                        {/* Rank EXP */}
            {/* <div style={{ position: 'absolute', height: '40%', width: '100%' }}>
                            <img style={{ position: 'absolute', height: '60%', left: '3%', top: '9%' }} src={`/fapi_fork_personal/farming/rank3.png`} />
                            <div style={{ position: 'absolute', color: 'white', background: 'black', borderRadius: '6px', height: '12px', fontSize: '12px', top: '60%', left: '4%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 3px 0 3px' }}>
                                x{helper.roundTwoDecimal(contagionPlantEXP)}
                            </div>
                        </div> */}
            {/* Growth  */}
            {/* <div style={{ position: 'absolute', height: '40%', width: '70%', bottom: '1px' }}>
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
                        </div> */}

            {/* Shovel 
                        <div style={{ position: 'absolute', height: '40%', width: '100%' }}>
                            <img style={{ position: 'absolute', height: '60%', right: '3%', top: '9%' }} src={`/fapi_fork_personal/farming/shovel.png`} />
                            <div style={{ position: 'absolute', color: 'white', background: 'black', borderRadius: '6px', height: '12px', fontSize: '12px', top: '60%', right: '4.75%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 3px 0 3px' }}>
                                x{helper.roundTwoDecimal(contagionHarvest)}
                            </div>
                        </div>
                    </div>
                    <div>
                    </div>

                </div> */}
            {/* Assembly */}
            {/* <div style={{ width: '340px', background: '#c9c9c9', zIndex: '-2', borderRadius: '6px' }}>

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
                </div> */}
            {/* </div> */}

            {/* current plants */}
            {/* <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}  >
                {finalPlants.map((val, index) => {
                    return <FarmingPlant
                        key={'top' + index}
                        data={{
                            setPlantAutos: setPlantAutos, plantAutos: plantAutos, plant: val, index: index, customMultipliers: customMultipliers, setCustomMultipliers: setCustomMultipliers, allowSetMultipliers: false, allowSetMultipliers: true,
                            modifiers: modifiers
                        }} />
                })}
            </div> */}


            <div style={{
                display: 'flex', flex: 1, flexDirection: 'column', width: '100%'
            }}>
                <h3 style={{ margin: '12px 0' }}>Future Calculations</h3>
                <div style={{ display: 'flex' }}>

                    {/* Hours to calc */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
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

                    {/* Max autos */}
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '12px' }}>
                        <MouseOverPopover tooltip={
                            <div>
                                How many autos to consider for calculations as the max
                            </div>
                        }>
                            <div style={{ marginRight: '6px' }}>Max Autos</div>
                        </MouseOverPopover>

                        <input
                            style={{
                                // width: '48px'
                                // , WebkitAppearance: 'none' 
                            }}
                            type='number'
                            className='prepNumber'
                            value={numSimulatedAutos}
                            onChange={
                                (e) => {
                                    try {
                                        let x = Number(e.target.value);
                                        // x = Math.floor(x);
                                        if (x < 0 || x > 12) {
                                            return;
                                        }
                                        setNumSimulatedAutos(x);

                                        ReactGA.event({
                                            category: "farming_interaction",
                                            action: `changed_maxAutos`,
                                            label: `${x}`,
                                            value: x
                                        })

                                    }
                                    catch (err) {
                                        console.log(err);
                                    }
                                }}
                            placeholder={numSimulatedAutos + ''}
                            min="1"
                            max="12"
                        />
                    </div>

                    {/* Max all autos */}
                    <div style={{ display: 'flex', alignItems: 'center', margin: '0 12px' }}>
                        {/* <div>Max All Autos</div> */}
                        <button onClick={(e) => {
                            let temp = Array(20).fill(numSimulatedAutos);
                            setPlantAutos(temp);
                            ReactGA.event({
                                category: "farming_interaction",
                                action: `max_auto`,
                                label: `max_auto`,
                            })
                        }}>Max Autos</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* <div>Clear All Autos</div> */}
                        <button onClick={(e) => {
                            let temp = Array(20).fill(0);
                            setPlantAutos(temp);
                            ReactGA.event({
                                category: "farming_interaction",
                                action: `clear_auto`,
                                label: `clear_auto`,
                            })
                        }}>Clear Autos</button>
                    </div>
                </div>


                {/* Future plants */}
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {/* <FarmingPlant data={{ fake: true }} /> */}
                    {customFuturePlants.map((plant, index) => {
                        return <FarmingPlant key={'future' + index} data={
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


                <div style={{
                    display: 'flex', width: '100%',
                    flex: 1,
                    // backgroundColor: 'yellow'
                    // height: '100%'
                    //  height: '-webkit-fill-available' 
                }}>
                    <div style={{ color: 'black', width: '650px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex' }}>

                            <div>
                                <MouseOverPopover tooltip={
                                    <div style={{ padding: '6px' }}>
                                        Calculates the best auto distribution for desired time into the future
                                    </div>
                                }>
                                    <div>
                                        Calculate best auto placements
                                    </div>
                                </MouseOverPopover>



                                <div style={{ display: 'flex' }}>

                                    <MouseOverPopover tooltip={
                                        <div style={{ padding: '6px' }}>
                                            How many parallel simulations to run, higher number means more CPU usage but quicker result (diminishing returns with more threads)
                                        </div>
                                    }>
                                        <div>
                                            Num threads to use for calculating
                                        </div>
                                    </MouseOverPopover>



                                    <select
                                        style={{ maxWidth: '144px', marginLeft: '12px' }}
                                        onChange={
                                            (e) => {
                                                setNumThreads(Number(e.target.value));
                                                ReactGA.event({
                                                    category: "farming_interaction",
                                                    action: `changed_num_threads`,
                                                    label: `${e.target.value}`,
                                                    value: Number(e.target.value)
                                                })
                                            }
                                        }
                                        defaultValue={numThreads + ''}
                                    >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                        <option value="10">10</option>
                                        <option value="11">11</option>
                                        <option value="12">12</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex' }}>

                                    <MouseOverPopover tooltip={
                                        <div style={{ padding: '6px' }}>
                                            Whether the simulation should automatically buy Farming Shop page 1 (Plant Boost Corner) upgrades. (This is an ascencion perk)
                                        </div>
                                    }>
                                        <div>
                                            Auto purchase Page 1 Upgrades (PBC)
                                        </div>
                                    </MouseOverPopover>


                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            setAutoBuyPBC(e.target.checked ? 1 : 0);
                                            ReactGA.event({
                                                category: "farming_interaction",
                                                action: `changed_auto_pbc`,
                                                label: `${e.target.checked}`,
                                            })
                                        }}
                                        checked={!!autoBuyPBC}
                                        value={!!autoBuyPBC}
                                    />
                                </div>
                                <div style={{ display: 'flex' }}>

                                    <MouseOverPopover tooltip={
                                        <div style={{ padding: '6px' }}>
                                            If checked, generates only possible auto distributions from your `Num Autos` selected above. If there are more autos assigned than you have purchased, then it will be disabled
                                        </div>
                                    }>
                                        <div>
                                            Lock in above `Num Autos`
                                        </div>
                                    </MouseOverPopover>


                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            setLockCustomAuto(e.target.checked ? 1 : 0);
                                            ReactGA.event({
                                                category: "farming_interaction",
                                                action: `changed_lock_auto`,
                                                label: `${e.target.checked}`,
                                            })
                                        }}
                                        checked={!!lockCustomAuto}
                                        value={!!lockCustomAuto}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', }}>
                                    <div style={{ marginRight: '6px' }}>
                                        Y-Axis Scale
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            setYScale(yScale === 'auto' ? `log` : 'auto')
                                        }}
                                    >
                                        {yScale === 'auto' ? `Log` : 'Default'}
                                    </button>

                                </div>
                            </div>


                            <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>

                                <div style={{ display: 'flex', flex: '1' }}>

                                    <div style={{
                                        maxWidth: '50%', margin: '0 6px',
                                        border: notEnoughAuto ? '1px solid black' : '',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <button
                                            disabled={notEnoughAuto || !calcDone}
                                            onClick={(e) => {
                                                setCalcDone(false);
                                                setCalcedFutureTime(futureTime);
                                                console.log(`Time start: ` + (new Date()).getTime())
                                                ReactGA.event({
                                                    category: "farming_interaction",
                                                    action: `clicked_optomise_auto`,
                                                    label: `${futureTime}`,
                                                    value: futureTime
                                                })

                                                let combinations = generateCombinations(numSimulatedAutos, finalPlants.length);
                                                setCalcAFK(true);
                                                setCalcStep(false);
                                                if (lockCustomAuto) {
                                                    let finalCombo = [];
                                                    for (let i = 0; i < combinations.length; i++) {
                                                        let curr = combinations[i];
                                                        let matches = true;
                                                        for (let j = 0; j < finalPlants.length; j++) {
                                                            //Meaning there is not enough assigned to match user's preference
                                                            if (plantAutos[j] > curr[j]) {
                                                                matches = false;
                                                                break;
                                                            }
                                                        }
                                                        if (matches) {
                                                            finalCombo.push(curr);
                                                        }
                                                    }
                                                    combinations = finalCombo;
                                                }

                                                // const combinations = generateCombinations(3, finalPlants.length);
                                                let splitArraysIndicies = splitArrayIndices(combinations, numThreads);
                                                if (combinations.length < numThreads) {
                                                    splitArraysIndicies = [[0, combinations.length - 1], [], [], [], [], []];
                                                }
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
                                                    if (splitArraysIndicies[i].length === 0) continue;
                                                    let worker = workers[i];
                                                    worker.postMessage({
                                                        data: {
                                                            combinations: combinations,
                                                            start: splitArraysIndicies[i][0],
                                                            end: splitArraysIndicies[i][1],
                                                            time: futureTime,
                                                            modifiers: { ...modifiers, },
                                                            finalPlants: finalPlants,
                                                            mode: 'afk',
                                                        },
                                                        id: i
                                                    })
                                                    farmCalcStarted.current[i] = true;
                                                }
                                            }}>Calculate AFK
                                        </button>
                                        {notEnoughAuto && (
                                            <div>
                                                Not enough autos remaining!
                                            </div>
                                        )}
                                    </div>


                                    <div style={{
                                        maxWidth: '50%', margin: '0 6px',
                                        border: futureTime < 1 ? '1px solid black' : '',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <button

                                            disabled={futureTime < 1 || !calcDone}
                                            onClick={(e) => {
                                                setCalcDone(false);
                                                setCalcedFutureTime(futureTime);
                                                console.log(`Time start: ` + (new Date()).getTime())
                                                ReactGA.event({
                                                    category: "farming_interaction",
                                                    action: `clicked_optomise_step`,
                                                    label: `${futureTime}`,
                                                    value: futureTime
                                                })

                                                setCalcAFK(false);
                                                setCalcStep(true);


                                                let min = 0.94;
                                                let max = secondsHour * futureTime;
                                                let step_max = 0.009 * finalPlants.length;

                                                let nums = [];
                                                let red = Math.floor(step_max * max);
                                                for (let i = 0; i < finalPlants.length; i++) {
                                                    let timer = farmingHelper.calcGrowthTime(finalPlants[i], modifiers);
                                                    if (timer < red) {
                                                        timer = red;
                                                    }
                                                    nums.push(timer);
                                                }

                                                nums.reverse();
                                                let combinations = farmingHelper.findMultipliersWithMinPercentage(max, nums, min);

                                                console.log(`num combinations: ${combinations.length}`);

                                                let splitArraysIndicies = splitArrayIndices(combinations, numThreads);
                                                if (combinations.length < numThreads) {
                                                    splitArraysIndicies = Array(12).fill([]);
                                                    splitArraysIndicies[0] = [0, combinations.length - 1];
                                                }
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
                                                    if (splitArraysIndicies[i].length === 0) continue;
                                                    let worker = workers[i];
                                                    worker.postMessage({
                                                        data: {
                                                            baseTimers: nums,
                                                            combinations: combinations,
                                                            start: splitArraysIndicies[i][0],
                                                            end: splitArraysIndicies[i][1],
                                                            time: futureTime,
                                                            modifiers: { ...modifiers, },
                                                            finalPlants: finalPlants,
                                                            mode: 'step',
                                                            numSimulatedAutos: numSimulatedAutos
                                                        },
                                                        id: i
                                                    })
                                                    farmCalcStarted.current[i] = true;
                                                }


                                            }}>Calculate Step</button>
                                        {futureTime < 1 && false && (
                                            <div>
                                                Minimum 1 future hour!
                                            </div>
                                        )}
                                    </div>
                                </div>



                                {/* monte carlo */}
                                {/* <div style={{
                                    maxWidth: '50%', margin: '0 6px',
                                    border: futureTime < 1 ? '1px solid black' : '',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <button

                                        // disabled={futureTime < 1 || !calcDone}
                                        onClick={(e) => {

                                            let numSimulations = 75000;
                                            let numSteps = 10;
                                            let sims = [];
                                            const maxTime = futureTime * secondsHour;



                                            //     steps.push({
                                            //         time: runTime,
                                            //         autos: autos
                                            //     })
                                            // }
                                            // result = helper.calcStepHPProd(finalPlants, { ...dataObj, steps: steps });
                                            // break;

                                            for (let i = 0; i < numSimulations; i++) {
                                                //create references to each object, so its the same obj
                                                // let steps = Array(numSteps).fill({ time: 0, autos: Array(numSimulatedAutos).fill(0) });
                                                let steps = [];
                                                for (let j = 0; j < numSteps; j++) {
                                                    steps.push({ time: 0, autos: Array(numSimulatedAutos).fill(0) })
                                                }


                                                //populate plant autos first
                                                for (let k = 0; k < numSteps; k++) {
                                                    let remainingAuto = numSimulatedAutos;
                                                    while (remainingAuto > 0) {
                                                        // let numAuto = Math.floor(Math.random() * remainingAuto);
                                                        let numAuto = 1;
                                                        let index = Math.floor(Math.random() * finalPlants.length);
                                                        steps[k].autos[index] += numAuto;
                                                        remainingAuto -= numAuto;
                                                    }
                                                }


                                                //Generate timings for each step
                                                let curTime = maxTime;
                                                let step = 0.01 * maxTime;

                                                while (curTime > 0) {
                                                    let index = Math.floor(Math.random() * numSteps);
                                                    steps[index].time += step;
                                                    curTime -= step;
                                                }
                                                sims.push(steps);
                                            }


                                            setCalcDone(false);
                                            setCalcedFutureTime(futureTime);
                                            console.log(`Time start: ` + (new Date()).getTime())
                                            ReactGA.event({
                                                category: "farming_interaction",
                                                action: `clicked_optomise_carlo`,
                                                label: `${futureTime}`,
                                                value: futureTime
                                            })

                                            setCalcAFK(false);
                                            setCalcStep(false);


                                            let splitArraysIndicies = splitArrayIndices(sims, numThreads);
                                            if (sims.length < numThreads) {
                                                splitArraysIndicies = Array(12).fill([]);
                                                splitArraysIndicies[0] = [0, sims.length - 1];
                                            }
                                            farmTotals.current = [];
                                            setFarmCalcProgress((cur) => {
                                                let temp = { ...cur };
                                                temp.max = sims.length;
                                                temp.current = 0;
                                                return temp;
                                            })
                                            for (let i = 0; i < numThreads; i++) {
                                                if (farmCalcStarted.current[i]) {
                                                    continue;
                                                }
                                                if (splitArraysIndicies[i].length === 0) continue;
                                                let worker = workers[i];
                                                worker.postMessage({
                                                    data: {
                                                        combinations: sims,
                                                        start: splitArraysIndicies[i][0],
                                                        end: splitArraysIndicies[i][1],
                                                        time: futureTime,
                                                        modifiers: { ...modifiers, },
                                                        finalPlants: finalPlants,
                                                        mode: 'carlo',
                                                        numSimulatedAutos: numSimulatedAutos
                                                    },
                                                    id: i
                                                })
                                                farmCalcStarted.current[i] = true;
                                            }


                                        }}>Calculate Monte Carlo</button>
                                    {futureTime < 1 && false && (
                                        <div>
                                            Minimum 1 future hour!
                                        </div>
                                    )}
                                </div> */}


                            </div>
                            {(farmCalcProgress.current > 0) && (
                                <div>
                                    {`${helper.roundTwoDecimal(farmCalcProgress.current / farmCalcProgress.max * 100)}%`}
                                </div>
                            )}
                        </div>

                        {/* Explanation */}
                        < div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>

                            <h3 style={{ margin: '0' }}>How to use</h3>
                            <div style={{ marginTop: '6px' }} >
                                <div className='outerExplanation'>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className='explanationLeft'>
                                            <div className="dot" ></div>
                                            <div className='innerExplanationShort'>
                                                Hours to calculate
                                            </div>
                                        </div>
                                        <div className='explanationInner'>
                                            how far into the future to calculate best auto distributions, as well as future PIC/Levels for plants
                                        </div>
                                    </div>
                                </div>
                                <div className='outerExplanation'>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className='explanationLeft'>
                                            <div className="dot" ></div>
                                            <div className='innerExplanationShort'>
                                                Calculate best auto placements
                                            </div>
                                        </div>
                                        <div className='explanationInner'>
                                            <div>
                                                Calculate AFK: Best `set-and-forget` distibution
                                            </div>
                                            <div>
                                                Calculate Step: Best possible timing switches of each plant (much more active)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='outerExplanation'>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className='explanationLeft'>
                                            <div className="dot" ></div>
                                            <div className='innerExplanationShort'>
                                                Num threads to use for calculating
                                            </div>
                                        </div>
                                        <div className='explanationInner'>
                                            How many parallel simulations to run, higher number means more CPU usage but quicker result (diminishing returns with more threads)
                                        </div>
                                    </div>
                                </div>
                                <div className='outerExplanation'>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className='explanationLeft'>
                                            <div className="dot" ></div>
                                            <div className='innerExplanationShort'>
                                                Auto purchase Page 1 Upgrades (PBC)
                                            </div>
                                        </div>
                                        <div className='explanationInner'>
                                            Whether the simulation should automatically buy Farming Shop page 1 (Plant Boost Corner) upgrades. (This is an ascencion perk)
                                        </div>
                                    </div>
                                </div>
                                <div className='outerExplanation'>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className='explanationLeft'>
                                            <div className="dot" ></div>
                                            <div className='innerExplanationShort'>
                                                Lock in above `Num Autos`
                                            </div>
                                        </div>
                                        <div className='explanationInner'>
                                            If checked, generates only possible auto distributions from your `Num Autos` selected above. If there are more autos assigned than you have purchased, then it will be disabled
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div >
                    </div>


                    <div style={{
                        width: 'calc(100% - 655px)',

                        display: 'flex',
                        flex: 1,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        // backgroundColor: 'red',
                        // height: '-webkit-fill-available'
                    }}>

                        {(farmCalcProgress.current === farmCalcProgress.max && farmCalcProgress.current !== 0 && bestPlantCombo.prod && calcDone) && (
                            <>
                                {/* best potato */}
                                {calcAFK && (
                                    <div className='calcResult'>
                                        <>
                                            <div style={{ display: 'flex' }}>
                                                {/* style={{ marginRight: '24px', display: 'flex', alignItems: 'center' }}> */}
                                                <div style={{ minWidth: '270px', display: 'flex', justifyContent: 'flex-end', marginRight: '2px' }}>
                                                    Best Potatoe Generation, {`${100}% Fries`}:
                                                </div>
                                                {bestPlantCombo.pot.map((val, index) => {
                                                    return <div className='bestSuggestion'>{`P${index + 1}: ${val} autos`} </div>
                                                })}
                                            </div>
                                            {/* best raw pic levels */}
                                            <div style={{ display: 'flex', marginTop: '6px', alignItems: 'center' }}>
                                                <div style={{ minWidth: '270px' }}>
                                                    <div className='calcInfo' >
                                                        <div>
                                                            Most PIC (+{`${bestPlantCombo.bestPic.result.picStats.picLevel} -> ${helper.roundTwoDecimal(bestPlantCombo.bestPic.result.picStats.picPercent * 100)}%`})
                                                        </div>
                                                        <div>
                                                            {` ${helper.roundTwoDecimal(
                                                                mathHelper.divideDecimal(bestPlantCombo.bestPic.finalFry, bestPlantCombo.bestProd.finalFry).toNumber()
                                                                * 100)
                                                                }% Fries`}
                                                        </div>
                                                    </div>
                                                    <div className='futurePicExplanation'>
                                                        <div>
                                                            Next PIC after {calcedFutureTime} hours + x hours
                                                        </div>
                                                        <div>
                                                            with {numSimulatedAutos} autos per plant
                                                        </div>
                                                    </div>
                                                </div>
                                                {bestPlantCombo.pic.map((val, index) => {
                                                    return (

                                                        <MouseOverPopover key={'popover' + index} tooltip={
                                                            <div>
                                                                <div>
                                                                    <div>
                                                                        Show how many PIC levels are gained (if any) and the time to hit the NEXT pic with your MAX num autos used
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }>
                                                            <div className='suggestionHolder'>
                                                                <div className='autoPicSuggestion'>
                                                                    <div>
                                                                        {`P${index + 1}: ${val} autos`}
                                                                    </div>
                                                                    {bestPlantCombo.bestPic.result.plants[index].picIncrease > 0 && (
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>

                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                            <div> {bestPlantCombo.bestPic.result.plants[index].prestige}</div>
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/right_arrow.svg`} />
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                            <div> {bestPlantCombo.bestPic.result.plants[index].prestige + bestPlantCombo.bestPic.result.plants[index].picIncrease}</div>
                                                                        </div>
                                                                    )}

                                                                </div>

                                                                <div className='futurePicHolder'>
                                                                    {`${helper.secondsToStringWithS(farmingHelper.calcTimeTillPrestige(
                                                                        bestPlantCombo.bestPic.result.plants[index],
                                                                        {
                                                                            ...bestPlantCombo.bestPic.result.result.finalModifiers,
                                                                            // numAuto: bestPlantCombo.bestPic.result.combo[index]
                                                                            numAuto: numSimulatedAutos
                                                                        }
                                                                    ).remainingTime)
                                                                        }`}
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                        <div> {bestPlantCombo.bestPic.result.plants[index].prestige + bestPlantCombo.bestPic.result.plants[index].picIncrease}</div>
                                                                        <img style={{ height: '24px' }} src={`/fapi_fork_personal/right_arrow.svg`} />
                                                                        <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                        <div> {bestPlantCombo.bestPic.result.plants[index].prestige + bestPlantCombo.bestPic.result.plants[index].picIncrease + 1}</div>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </MouseOverPopover>
                                                    )
                                                })}
                                            </div>
                                            {/* best pic % increase */}
                                            {displayPicPerc && (
                                                <div style={{ display: 'flex', marginTop: '6px', alignItems: 'center' }}>
                                                    <div style={{ minWidth: '270px' }}>
                                                        <div className='calcInfo' >
                                                            <div>
                                                                Most PIC %
                                                                (+{`${bestPlantCombo.bestPicPerc.result.picStats.picLevel} -> ${helper.roundTwoDecimal(bestPlantCombo.bestPicPerc.result.picStats.picPercent * 100)}%`})
                                                            </div>
                                                            <div>
                                                                {` ${helper.roundTwoDecimal(
                                                                    mathHelper.divideDecimal(bestPlantCombo.bestPicPerc.finalFry, bestPlantCombo.bestProd.finalFry).toNumber()
                                                                    * 100)
                                                                    }% Fries`}
                                                            </div>
                                                        </div>
                                                        <div className='futurePicExplanation'>
                                                            <div>
                                                                Next PIC after {calcedFutureTime} hours
                                                            </div>
                                                            <div>
                                                                with {numSimulatedAutos} autos per plant
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {bestPlantCombo.picPerc.map((val, index) => {
                                                        return (
                                                            <MouseOverPopover key={'picPercPopover' + index} tooltip={
                                                                <div>
                                                                    <div>
                                                                        <div>
                                                                            Show how many PIC levels are gained (if any) and the time to hit the NEXT pic with your MAX num autos used
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }>
                                                                <div className='suggestionHolder'>
                                                                    <div className='autoPicSuggestion'>
                                                                        <div>
                                                                            {`P${index + 1}: ${val} autos`}
                                                                        </div>

                                                                        {bestPlantCombo.bestPicPerc.result.plants[index].picIncrease > 0 && (
                                                                            <div style={{ display: 'flex', alignItems: 'center' }}>

                                                                                <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                                <div> {bestPlantCombo.bestPicPerc.result.plants[index].prestige}</div>
                                                                                <img style={{ height: '24px' }} src={`/fapi_fork_personal/right_arrow.svg`} />
                                                                                <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                                <div> {bestPlantCombo.bestPicPerc.result.plants[index].prestige + bestPlantCombo.bestPicPerc.result.plants[index].picIncrease}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className='futurePicHolder'>
                                                                        {`${helper.secondsToStringWithS(farmingHelper.calcTimeTillPrestige(
                                                                            bestPlantCombo.bestPicPerc.result.plants[index],
                                                                            {
                                                                                ...bestPlantCombo.bestPicPerc.result.result.finalModifiers,
                                                                                // numAuto: bestPlantCombo.bestPic.result.combo[index]
                                                                                numAuto: numSimulatedAutos
                                                                            }
                                                                        ).remainingTime)
                                                                            }`}
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                            <div> {bestPlantCombo.bestPicPerc.result.plants[index].prestige + bestPlantCombo.bestPicPerc.result.plants[index].picIncrease}</div>
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/right_arrow.svg`} />
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                            <div> {bestPlantCombo.bestPicPerc.result.plants[index].prestige + bestPlantCombo.bestPicPerc.result.plants[index].picIncrease + 1}</div>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </MouseOverPopover>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    </div>
                                )}


                                {/* Best step by step breakdown */}
                                {calcStep && (
                                    <div className='calcResult'>
                                        <>
                                            <div style={{ display: 'flex' }}>

                                                <div style={{ minWidth: '270px', display: 'flex', justifyContent: 'flex-end' }}>Best order, 100% Fries</div>
                                                {bestPlantCombo.bestPot.result.result.steps.map((val, index) => {

                                                    return <div className='bestSuggestion' >{
                                                        `P${bestPlantCombo.bestPot.result.result.steps.length - index} for ${val.time > secondsHour ? helper.secondsToString(val.time) : helper.secondsToStringWithS(val.time)}`
                                                    }</div>

                                                })}
                                            </div>

                                            {/* Best PIC */}
                                            {bestPlantCombo.bestPic.pic > 0 && (
                                                <div style={{ display: 'flex', marginTop: '6px', alignItems: 'center' }}>
                                                    <div style={{ minWidth: '270px' }}>
                                                        <div className='calcInfo' >
                                                            <div>
                                                                Most PIC (+{`${bestPlantCombo.bestPic.result.picStats.picLevel} -> ${helper.roundTwoDecimal(bestPlantCombo.bestPic.result.picStats.picPercent * 100)}%`})
                                                            </div>
                                                            <div>
                                                                {` ${helper.roundTwoDecimal(
                                                                    mathHelper.divideDecimal(bestPlantCombo.bestPic.finalFry, bestPlantCombo.bestProd.finalFry).toNumber()
                                                                    * 100)
                                                                    }% Fries`}:
                                                            </div>
                                                        </div>

                                                        <div className='futurePicExplanation'>
                                                            <div>
                                                                Next PIC after {calcedFutureTime} hours + x hours
                                                            </div>
                                                            <div>
                                                                with {numSimulatedAutos} autos per plant
                                                            </div>
                                                        </div>

                                                    </div>
                                                    {bestPlantCombo.bestPic.result.result.steps.map((val, index) => {

                                                        return (
                                                            <MouseOverPopover key={'popover' + index} tooltip={
                                                                <div>
                                                                    <div>
                                                                        <div>
                                                                            Show how many PIC levels are gained (if any) and the time to hit the NEXT pic with your MAX num autos used
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }>
                                                                <div className='suggestionHolder'>
                                                                    <div className='autoPicSuggestion'>
                                                                        {
                                                                            `P${bestPlantCombo.bestPic.result.result.steps.length - index} for ${val.time > secondsHour ? helper.secondsToString(val.time) : helper.secondsToStringWithS(val.time)}`
                                                                        }
                                                                        {bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].picIncrease > 0 && (
                                                                            <div style={{ display: 'flex', alignItems: 'center' }}>

                                                                                <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                                <div> {bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].prestige}</div>
                                                                                <img style={{ height: '24px' }} src={`/fapi_fork_personal/right_arrow.svg`} />
                                                                                <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                                <div> {bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].prestige + bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].picIncrease}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>


                                                                    <div className='futurePicHolder'>
                                                                        {`${helper.secondsToStringWithS(farmingHelper.calcTimeTillPrestige(
                                                                            bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index],
                                                                            {
                                                                                ...bestPlantCombo.bestPic.result.result.finalModifiers,
                                                                                // numAuto: bestPlantCombo.bestPic.result.combo[bestPlantCombo.bestPic.result.plants.length - 1 - index]
                                                                                numAuto: numSimulatedAutos
                                                                            }
                                                                        ).remainingTime)
                                                                            }`}

                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                            <div> {bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].prestige + bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].picIncrease}</div>
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/right_arrow.svg`} />
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                            <div> {bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].prestige + bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].picIncrease + 1}</div>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </MouseOverPopover>
                                                        )
                                                    })}
                                                </div>
                                            )}


                                            {/* Best PIC Percentage */}
                                            {displayPicPerc > 0 && (
                                                <div style={{ display: 'flex', marginTop: '6px', alignItems: 'center' }}>
                                                    <div style={{ minWidth: '270px' }}>


                                                        <div className='calcInfo' >
                                                            <div>
                                                                Most PIC % (+{`${bestPlantCombo.bestPicPerc.result.picStats.picLevel} -> ${helper.roundTwoDecimal(bestPlantCombo.bestPicPerc.result.picStats.picPercent * 100)}%`})
                                                            </div>
                                                            <div>
                                                                {` ${helper.roundTwoDecimal(
                                                                    mathHelper.divideDecimal(bestPlantCombo.bestPicPerc.finalFry, bestPlantCombo.bestProd.finalFry).toNumber()
                                                                    * 100)
                                                                    }% Fries`}:
                                                            </div>
                                                        </div>
                                                        <div className='futurePicExplanation'>
                                                            <div>
                                                                Next PIC after {calcedFutureTime} hours
                                                            </div>
                                                            <div>
                                                                with {numSimulatedAutos} autos per plant
                                                            </div>
                                                        </div>


                                                    </div>
                                                    {bestPlantCombo.bestPicPerc.result.result.steps.map((val, index) => {

                                                        return (

                                                            <MouseOverPopover key={'popover' + index} tooltip={
                                                                <div>
                                                                    <div>
                                                                        <div>
                                                                            Show how many PIC levels are gained (if any) and the time to hit the NEXT pic with your MAX num autos used
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }>
                                                                <div className='suggestionHolder'>
                                                                    <div className='autoPicSuggestion'>
                                                                        <div>

                                                                            {`P${bestPlantCombo.bestPicPerc.result.result.steps.length - index} for ${val.time > secondsHour ? helper.secondsToString(val.time) : helper.secondsToStringWithS(val.time)}`}
                                                                        </div>
                                                                        {bestPlantCombo.bestPicPerc.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].picIncrease > 0 && (
                                                                            <div style={{ display: 'flex', alignItems: 'center' }}>

                                                                                <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                                <div> {bestPlantCombo.bestPicPerc.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].prestige}</div>
                                                                                <img style={{ height: '24px' }} src={`/fapi_fork_personal/right_arrow.svg`} />
                                                                                <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                                <div> {bestPlantCombo.bestPicPerc.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].prestige + bestPlantCombo.bestPicPerc.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].picIncrease}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className='futurePicHolder'>
                                                                        {`${helper.secondsToStringWithS(farmingHelper.calcTimeTillPrestige(
                                                                            bestPlantCombo.bestPicPerc.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index],
                                                                            {
                                                                                ...bestPlantCombo.bestPicPerc.result.result.finalModifiers,
                                                                                // numAuto: bestPlantCombo.bestPicPerc.result.combo[bestPlantCombo.bestPic.result.plants.length - 1 - index]
                                                                                numAuto: numSimulatedAutos
                                                                            }
                                                                        ).remainingTime)
                                                                            }`}
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                            <div> {bestPlantCombo.bestPicPerc.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].prestige + bestPlantCombo.bestPicPerc.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].picIncrease}</div>
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/right_arrow.svg`} />
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                            <div> {bestPlantCombo.bestPicPerc.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].prestige + bestPlantCombo.bestPicPerc.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].picIncrease + 1}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </MouseOverPopover>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </>

                                    </div>
                                )}
                                {/* <div style={{ display: 'flex', marginTop: '1px' }}>
                                        <div>
                                            Most Potatoe Total Made:
                                        </div>
                                        {bestPlantCombo.pot.map((val, index) => {
                                            return <div style={{ marginLeft: '12px', border: '1px solid black', padding: '0 6px 0 6px' }}>{`P${index + 1}: ${val} autos`} </div>
                                        })}
                                    </div> */}


                            </>
                        )}

                        <div style={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            position: 'relative',
                            minHeight: '400px',
                            width: '100%'
                        }}>


                            {/* Graph stuff */}
                            <div style={{
                                display: 'flex',
                                flex: 1,
                                position: 'absolute',
                                height: '99%',
                                width: '100%'
                            }}>
                                <Graph
                                    graphObjects={graphObjects}
                                    runningGraphObjects={runningGraphObjects}
                                    showCalc={(farmCalcProgress.current === farmCalcProgress.max && farmCalcProgress.current !== 0 && bestPlantCombo.prod && calcDone)}
                                    yScale={yScale}
                                    bestPic={!!bestPlantCombo?.bestPic?.pic}
                                    expDiff={expDiff}
                                    displayPicPerc={displayPicPerc}
                                    calcDone={calcDone}
                                    calcAFK={calcAFK}
                                />
                            </div>
                        </div>

                    </div>
                </div>

            </div >


        </div >
    );
};

export default FarmingLanding;