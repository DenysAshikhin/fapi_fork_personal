import React, { useState, useEffect, useRef, useMemo } from 'react';
import MouseOverPopover from "./tooltip";
import FarmingPlant from './FarmPlant';
import helper from "./util/helper.js";
import farmingHelper from "./util/farmingHelper.js";
import './FarmingLanding.css';
import ReactGA from "react-ga4";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    const [numThreads, setNumThreads] = useState(6);


    const [farmCalcProgress, setFarmCalcProgress] = useState({ current: 0, max: 0 });
    const [bestPlantCombo, setBestPlantCombo] = useState([]);
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
    let calcedBonus = farmingHelper.calcHPBonus(data);
    let currHP = helper.calcPOW(data.HealthyPotatoCurrent);
    let totalHP = helper.calcPOW(data.HealthyPotatoTotal);

    let nextCosts = farmingHelper.getNextShopCosts(data);


    let soulPlantEXP = 1 + (0.25 * data.SoulLeafTreatment);

    let shopGrowingSpeed = data.FarmingShopPlantGrowingSpeed;
    let manualHarvestFormula = data.FarmingShopPlantManualHarvestFormula;
    let shopProdBonus = Math.pow(1.25, data.FarmingShopPlantTotalProduction);
    let shopProdLevel = data.FarmingShopPlantTotalProduction;
    let shopRankEXP = 1 + data.FarmingShopPlantRankExpEarned * 0.1;
    let shopRankLevel = data.FarmingShopPlantRankExpEarned;
    let picPlants = data.FarmingShopPlantImprovement;
    let plants = data.PlantCollection;

    let assemblyPlantExp = 1;

    if (data?.AssemblerCollection[0].BonusList[1].StartingLevel <= data?.AssemblerCollection[0].Level) {
        assemblyPlantExp = Math.pow(1 + data?.AssemblerCollection[0].BonusList[1].Gain, data?.AssemblerCollection[0].Level - data?.AssemblerCollection[0].BonusList[1].StartingLevel);
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
        console.log(`setin modif`)
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
            shopProdBonus: shopProdBonus,
            shopProdLevel: shopProdLevel,
            contagionPlantProd: contagionPlantProd,
            hpBonus: calcedBonus,
            nextCosts: nextCosts,
            curPotatoes: currHP,
            totalPotatoes: totalHP,
            expBonus: shopRankEXP * soulPlantEXP * contagionPlantEXP * assemblyPlantExp,
            autoBuyPBC: autoBuyPBC,
            tickRate: Math.floor((futureTime * secondsHour) * 0.0015) < 1 ? 1 : Math.floor((futureTime * secondsHour) * 0.0015),
        }
    }, [
        shopGrowingSpeed, manualHarvestFormula, contagionHarvest, shopRankEXP, shopRankLevel, picPlants, Number(petPlantCombo),
        contagionPlantEXP, contagionPlantGrowth, soulPlantEXP, assemblyPlantExp, shopProdBonus, shopProdBonus, shopProdLevel,
        contagionPlantProd, calcedBonus, nextCosts.expCost, nextCosts.growthCost, nextCosts.prodCost, currHP, totalHP, autoBuyPBC, futureTime
    ])

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
            plant.created = plant.ManuallyCreated.mantissa * (Math.pow(10, plant.ManuallyCreated.exponent));
            plant.totalMade = plant.TotalCreated.mantissa * (Math.pow(10, plant.TotalCreated.exponent));

            plant.perHarvest = helper.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
            plant.perHarvest = farmingHelper.calcPlantHarvest(plant, modifiers);
            plant.curExp = plant.CurrentExp.mantissa * (Math.pow(10, plant.CurrentExp.exponent));
            plant.reqExp = plant.ExpNeeded.mantissa * (Math.pow(10, plant.ExpNeeded.exponent));
            //plant.timeToLevel = (plant.reqExp - plant.curExp) / plant.perHarvest * plant.growthTime;
            plant.timeToLevel = farmingHelper.calcTimeTillLevel(plant, { ...modifiers, numAuto: plantAutos[i] }).timeToLevel;
            plant.currMult = Math.pow((1 + 0.05 * (1 + manualHarvestFormula * 0.02)), helper.calculateLogarithm(1.25, plant.created));


            if (plant.timeToLevel <= timeTillNextLevel) {
                timeTillNextLevel = plant.timeToLevel;
            }
            let prod = farmingHelper.calcProdOutput(plant, modifiers);
            plant.production = prod;
            plant.elapsedTime = 0;
            plant.originalRank = plant.Rank;

            tempArr.push(plant);
        }
        return tempArr;
    }, [modifiers, plantAutos, shopGrowingSpeed, petPlantCombo, contagionPlantGrowth])


    const [customLines, setCustomLines] = useState([]);


    let tempFuture = useMemo(() => {
        console.log(`calcing`)
        return farmingHelper.calcHPProd(finalPlants, { ...modifiers, time: secondsHour * futureTime, numAutos: plantAutos })
    },
        [finalPlants, modifiers, futureTime, plantAutos, secondsHour]);
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
                let bestPic = { pic: 0, prod: 0 }
                let bestPicPerc = { pic: 0, prod: 0 }

                let top10DataPointsPotatoes = [];
                let top10DataPointsFries = [];

                for (let i = 0; i < farmTotals.current.length; i++) {
                    let cur = farmTotals.current[i];



                    if (!cur.totalPotCombo.result) {
                        continue;
                    }
                    top10DataPointsPotatoes.push(...cur.top10DataPointsPotatoes);
                    top10DataPointsFries.push(...cur.top10DataPointsFries);
                    if (cur.bestPicCombo.picGain > bestPic.pic) {
                        bestPic = { pic: cur.bestPicCombo.picGain, result: cur.bestPicCombo, prod: cur.bestPicCombo.potatoeProduction }
                    }
                    else if (cur.bestPicCombo.picGain === bestPic.pic) {
                        if (cur.bestPicCombo.potatoeProduction > bestPic.prod) {
                            bestPic = { pic: cur.bestPicCombo.picGain, result: cur.bestPicCombo, prod: cur.bestPicCombo.potatoeProduction }
                        }
                    }

                    if (cur.bestPICPercCombo.picGain > bestPicPerc.pic) {
                        bestPicPerc = { pic: cur.bestPICPercCombo.picGain, result: cur.bestPICPercCombo, prod: cur.bestPICPercCombo.potatoeProduction }
                    }
                    else if (cur.bestPICPercCombo.picGain === bestPicPerc.pic) {
                        if (cur.bestPICPercCombo.potatoeProduction > bestPicPerc.prod) {
                            bestPicPerc = { pic: cur.bestPICPercCombo.picGain, result: cur.bestPICPercCombo, prod: cur.bestPICPercCombo.potatoeProduction }
                        }
                    }


                    if (cur.bestProdCombo.result.potatoeProduction > bestProd.prod) {
                        bestProd = { prod: cur.bestProdCombo.result.potatoeProduction, result: cur.bestProdCombo }

                    }
                    if (cur.totalPotCombo.result.totalPotatoes > bestPot.pot) {
                        bestPot = { pot: cur.totalPotCombo.result.totalPotatoes, result: cur.totalPotCombo }
                    }

                    for (let j = 0; j < cur.top10DataPointsPotatoes.length; j++) {
                        cur.top10DataPointsPotatoes[j].obj = cur.totalPotCombo;
                    }

                }

                top10DataPointsPotatoes = top10DataPointsPotatoes.sort((a, b) => b.result - a.result).slice(0, 10);
                top10DataPointsFries = top10DataPointsFries.sort((a, b) => b.result - a.result).slice(0, 10);

                //Might not need this anymore? bigsad = -1
                let longest = 0;

                for (let i = 0; i < top10DataPointsPotatoes.length; i++) {
                    longest = top10DataPointsPotatoes[i].data.length;
                }
                console.log(`longest: ${longest}`)
                for (let i = 0; i < top10DataPointsPotatoes.length; i++) {

                    let cur = top10DataPointsPotatoes[i];

                    if (top10DataPointsPotatoes[i].data.length < longest) {
                        let increase = cur.data[cur.data.length - 1].production - cur.data[cur.data.length - 2].production;
                        let timeIncrease = cur.data[cur.data.length - 1].time - cur.data[cur.data.length - 2].time;
                        let newObj = { time: cur.data[cur.data.length - 1].time + timeIncrease, production: cur.data[cur.data.length - 1].production + increase };
                        cur.data.push(newObj);
                    }
                }

                if (bestProd.result) {
                    bestProd.finalFry = farmingHelper.calcFryOutput(bestProd.result.result.totalPotatoes)
                    bestPic.finalFry = farmingHelper.calcFryOutput(bestPic.result.result.totalPotatoes)
                    bestPicPerc.finalFry = farmingHelper.calcFryOutput(bestPicPerc.result.result.totalPotatoes)

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




                    setBestPlantCombo(finalBests)
                }
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
        FarmerWorker6.addEventListener('message', (event) => {
            let response = event.data;
            if (response.update) {
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
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
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
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
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
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
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
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
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
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
                return setFarmCalcProgress((curr) => {
                    let newAmount = { ...curr };
                    newAmount.current++;
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
    let numSimulatedAutos = data.FarmingShopAutoPlotBought;

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

    let dataList = [];
    let tempList2 = tempFuture.dataPointsPotatoes;
    function mergeAndCombine(list1, list2, customKey) {

        let combinedList = [];
        customKey = customKey ? customKey : 'value1';
        let map1 = {};
        for (let i = 0; i < list1.length; i++) {
            map1[list1[i].time] = { ...list1[i] };
            map1[list1[i].time].time = list1[i].time;
            map1[list1[i].time].custom = list1[i].production;
            map1[list1[i].time][customKey] = null;
        }



        for (let i = 0; i < list2.length; i++) {
            if (list2[i].time in map1) {
                map1[list2[i].time][customKey] = list2[i].production
            }
            else {
                map1[list2[i].time] = { ...list2[i] };
                map1[list2[i].time].time = list2[i].time;
                map1[list2[i].time].custom = null;
                map1[list2[i].time][customKey] = list2[i].production;
                delete map1[list2[i].time].production;
            }
        }

        combinedList = Object.values(map1)

        return combinedList;
    }
    function interpolateAndExtrapolate(arr, customKey) {

        let data = [];
        let missing_custom_index = [];
        let missing_value2_index = [];
        let prev_custom = -1;
        let prev_value2 = -1;
        customKey = customKey ? customKey : 'value1';


        for (let i = 0; i < arr.length; i++) {
            let custom = arr[i].custom;
            let value2 = arr[i][customKey];

            if (prev_custom === -1) {
                prev_custom = custom;
            }
            if (prev_value2 === -1) {
                prev_value2 = value2;
            }

            if (custom) {
                //interpolate previous values
                if (missing_custom_index.length > 0) {
                    let increase = (custom - prev_custom) / (missing_custom_index.length + 1);
                    for (let j = 0; j < missing_custom_index.length; j++) {
                        arr[missing_custom_index[j]].custom = prev_custom + increase * (j + 1);
                    }
                    missing_custom_index = [];
                }
                prev_custom = custom;
            }
            else {
                missing_custom_index.push(i);
            }

            if (value2) {
                //interpolate previous values
                if (missing_value2_index.length > 0) {
                    let increase = (value2 - prev_value2) / (missing_value2_index.length + 1);
                    for (let j = 0; j < missing_value2_index.length; j++) {
                        arr[missing_value2_index[j]][customKey] = prev_value2 + increase * (j + 1);
                    }
                    missing_value2_index = [];
                }
                prev_value2 = value2;
            }
            else {
                missing_value2_index.push(i);
            }
        }

        //extropolate the ends
        if (!arr[arr.length - 1].custom) {
            let missing_indexes = [];
            for (let i = arr.length - 1; i >= 0; i--) {
                if (arr[i].custom) {
                    let diff = (arr[i].custom - arr[i - 1].custom);
                    missing_indexes.reverse();
                    for (let j = 0; j < missing_indexes.length; j++) {
                        arr[missing_indexes[j]].custom = arr[i].custom + diff * (j + 1);
                    }
                    break;
                }
                else {
                    missing_indexes.push(i);
                }
            }
        }

        if (!arr[arr.length - 1][customKey]) {
            let missing_indexes = [];
            for (let i = arr.length - 1; i >= 0; i--) {
                if (arr[i][customKey]) {
                    let diff = (arr[i][customKey] - arr[i - 1][customKey]);
                    missing_indexes.reverse();
                    for (let j = 0; j < missing_indexes.length; j++) {
                        arr[missing_indexes[j]][customKey] = arr[i][customKey] + diff * (j + 1)
                    }
                    break;
                }
                else {
                    missing_indexes.push(i);
                }
            }
        }

        for (let i = 0; i < arr.length; i++) {
            arr[i].production = arr[i].custom;
        }

        return arr;
    }

    // if ((farmCalcProgress.current === farmCalcProgress.max && farmCalcProgress.current !== 0 && bestPlantCombo.prod)) {
    //     dataList = tempList2;
    //     let topPotatoe = bestPlantCombo.top10DataPointsPotatoes[0].data;
    //     let topPotatoeLast = bestPlantCombo.top10DataPointsPotatoes[9].data;
    //     let combined = mergeAndCombine(tempList2, topPotatoe, 'value2');
    //     let smoothed = interpolateAndExtrapolate(combined, 'value2')
    //     dataList = smoothed;

    //     // combined = mergeAndCombine(smoothed, topPotatoeLast, 'value11');
    //     // smoothed = interpolateAndExtrapolate(combined, 'value11')
    //     // dataList = smoothed;
    //     let x = 0;

    // }
    // else {
    //     dataList = mergeAndCombine(tempList2, []);
    // }


    // console.log(tempFuture)

    return (
        <div style={{ height: '100%', display: 'flex', flex: 1, flexDirection: 'column' }}>
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
                    {/* <div>Grasshopper Amount: +{helper.roundTwoDecimal(grassHopperAmount - currFries)} ({helper.roundTwoDecimal(grassHopperAmount)})</div> */}
                </div>
                {/* Contagion */}
                <div style={{ minWidth: '160px', display: 'flex', margin: '0 24px 0 0' }}>
                    <div style={{ position: 'relative', display: 'flex', width: '160px' }}>
                        <img style={{ height: '95%', position: 'absolute' }} src={`/fapi_fork_personal/farming/contagion.png`} />

                        {/* Rank EXP */}
                        <div style={{ position: 'absolute', height: '40%', width: '100%' }}>
                            <img style={{ position: 'absolute', height: '60%', left: '3%', top: '9%' }} src={`/fapi_fork_personal/farming/rank3.png`} />
                            <div style={{ position: 'absolute', color: 'white', background: 'black', borderRadius: '6px', height: '12px', fontSize: '12px', top: '60%', left: '4%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 3px 0 3px' }}>
                                x{helper.roundTwoDecimal(contagionPlantEXP)}
                            </div>
                        </div>
                        {/* Growth  */}
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

                        {/* Shovel */}
                        <div style={{ position: 'absolute', height: '40%', width: '100%' }}>
                            <img style={{ position: 'absolute', height: '60%', right: '3%', top: '9%' }} src={`/fapi_fork_personal/farming/shovel.png`} />
                            <div style={{ position: 'absolute', color: 'white', background: 'black', borderRadius: '6px', height: '12px', fontSize: '12px', top: '60%', right: '4.75%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 3px 0 3px' }}>
                                x{helper.roundTwoDecimal(contagionHarvest)}
                            </div>
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
                display: 'flex', flex: 1, flexDirection: 'column', width: '100%',
                // height: '-webkit-fill-available'
            }}>
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
                                        style={{ maxWidth: '144px' }}
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
                            </div>


                            <div style={{ display: 'flex', height: '100%' }}>
                                <div style={{
                                    maxWidth: '50%', margin: '0 6px',
                                    border: notEnoughAuto ? '1px solid black' : '',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <button
                                        disabled={notEnoughAuto}
                                        onClick={(e) => {

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

                                        disabled={futureTime < 1}
                                        onClick={(e) => {

                                            console.log(`Time start: ` + (new Date()).getTime())
                                            ReactGA.event({
                                                category: "farming_interaction",
                                                action: `clicked_optomise_step`,
                                                label: `${futureTime}`,
                                                value: futureTime
                                            })

                                            setCalcAFK(false);
                                            setCalcStep(true);


                                            let min = 0.95;
                                            let max = secondsHour * futureTime;
                                            let nums = [];
                                            let red = 0.05 * max;
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
                                            // return;

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
                                                        mode: 'step'
                                                    },
                                                    id: i
                                                })
                                                farmCalcStarted.current[i] = true;
                                            }


                                        }}>Calculate Step</button>
                                    {futureTime < 1 && (
                                        <div>
                                            Minimum 1 future hour!
                                        </div>
                                    )}
                                </div>


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
                        flexDirection: 'column'
                        // backgroundColor: 'red',
                        // height: '-webkit-fill-available'
                    }}>
                        {(farmCalcProgress.current === farmCalcProgress.max && farmCalcProgress.current !== 0 && bestPlantCombo.prod) && (
                            <>
                                {/* best potato */}
                                {calcAFK && (
                                    <div className='calcResult'>
                                        <>
                                            <div style={{
                                                display: 'flex'
                                            }}>
                                                {/* style={{ marginRight: '24px', display: 'flex', alignItems: 'center' }}> */}
                                                <div style={{ minWidth: '310px' }}>
                                                    Best Potatoe Generation
                                                    , {`${100}% Fries`}:
                                                </div>
                                                {bestPlantCombo.pot.map((val, index) => {
                                                    return <div style={{ marginLeft: '12px', border: '1px solid black', padding: '0 6px 0 6px' }}>{`P${index + 1}: ${val} autos`} </div>
                                                })}
                                            </div>



                                            {/* best raw pic levels */}
                                            <div style={{ display: 'flex', marginTop: '6px', alignItems: 'center' }}>
                                                <div style={{ minWidth: '310px' }}>
                                                    Most PIC (+{`${bestPlantCombo.bestPic.result.picStats.picLevel} -> ${helper.roundTwoDecimal(bestPlantCombo.bestPic.result.picStats.picPercent * 100)}%`})
                                                    , {`${helper.roundTwoDecimal(bestPlantCombo.bestPic.finalFry / bestPlantCombo.bestProd.finalFry * 100)}% Fries`}:
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
                                                            <div style={{ marginLeft: '12px', border: '1px solid black', padding: '0 6px 0 6px' }}>
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

                                                                <div>
                                                                    {`Next prestige: ${helper.secondsToStringWithS(farmingHelper.calcTimeTillPrestige(
                                                                        bestPlantCombo.bestPic.result.plants[index],
                                                                        {
                                                                            ...modifiers,
                                                                            // numAuto: bestPlantCombo.bestPic.result.combo[index]
                                                                            numAuto: data.FarmingShopAutoPlotBought
                                                                        }
                                                                    ).remainingTime)
                                                                        }`}
                                                                </div>
                                                            </div>
                                                        </MouseOverPopover>
                                                    )
                                                })}
                                            </div>
                                            {/* best pic % increase */}
                                            {displayPicPerc && (
                                                <div style={{ display: 'flex', marginTop: '6px', alignItems: 'center' }}>
                                                    <div style={{ minWidth: '310px' }}>
                                                        Most PIC %
                                                        (+{`${bestPlantCombo.bestPicPerc.result.picStats.picLevel} -> ${helper.roundTwoDecimal(bestPlantCombo.bestPicPerc.result.picStats.picPercent * 100)}%`})
                                                        , {`${helper.roundTwoDecimal(bestPlantCombo.bestPicPerc.finalFry / bestPlantCombo.bestProd.finalFry * 100)}% Fries`}:
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
                                                                <div style={{ marginLeft: '12px', border: '1px solid black', padding: '0 6px 0 6px' }}>

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

                                                                    <div>
                                                                        {`Next prestige: ${helper.secondsToStringWithS(farmingHelper.calcTimeTillPrestige(
                                                                            bestPlantCombo.bestPicPerc.result.plants[index],
                                                                            {
                                                                                ...modifiers,
                                                                                // numAuto: bestPlantCombo.bestPic.result.combo[index]
                                                                                numAuto: data.FarmingShopAutoPlotBought
                                                                            }
                                                                        ).remainingTime)
                                                                            }`}
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

                                                <div style={{ minWidth: '310px' }}>Best order:</div>
                                                {bestPlantCombo.bestPot.result.result.steps.map((val, index) => {

                                                    return <div style={{ margin: '0 3px' }}>{
                                                        `P${bestPlantCombo.bestPot.result.result.steps.length - index} for ${val.time > secondsHour ? helper.secondsToString(val.time) : helper.secondsToStringWithS(val.time)}`
                                                        + (index !== bestPlantCombo.bestPot.result.result.steps.length - 1 ? ', ' : '')
                                                    }</div>

                                                })}
                                            </div>

                                            {/* Best PIC */}
                                            {bestPlantCombo.bestPic.pic > 0 && (
                                                <div style={{ display: 'flex', marginTop: '6px', alignItems: 'center' }}>
                                                    <div style={{ minWidth: '310px' }}>
                                                        Most PIC (+{`${bestPlantCombo.bestPic.result.picStats.picLevel} -> ${helper.roundTwoDecimal(bestPlantCombo.bestPic.result.picStats.picPercent * 100)}%`})
                                                        , {`${helper.roundTwoDecimal(bestPlantCombo.bestPic.finalFry / bestPlantCombo.bestProd.finalFry * 100)}% Fries`}:
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
                                                                <div style={{ marginLeft: '12px', border: '1px solid black', padding: '0 6px 0 6px' }}>

                                                                    <div style={{ margin: '0 3px' }}>
                                                                        {
                                                                            `P${bestPlantCombo.bestPic.result.result.steps.length - index} for ${val.time > secondsHour ? helper.secondsToString(val.time) : helper.secondsToStringWithS(val.time)}`
                                                                            + (index !== bestPlantCombo.bestPot.result.result.steps.length - 1 ? ', ' : '')
                                                                        }
                                                                    </div>

                                                                    {bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].picIncrease > 0 && (
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>

                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                            <div> {bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].prestige}</div>
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/right_arrow.svg`} />
                                                                            <img style={{ height: '24px' }} src={`/fapi_fork_personal/farming/prestige_star.png`} />
                                                                            <div> {bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].prestige + bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index].picIncrease}</div>
                                                                        </div>
                                                                    )}

                                                                    <div>
                                                                        {`Next prestige: ${helper.secondsToStringWithS(farmingHelper.calcTimeTillPrestige(
                                                                            bestPlantCombo.bestPic.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index],
                                                                            {
                                                                                ...modifiers,
                                                                                // numAuto: bestPlantCombo.bestPic.result.combo[bestPlantCombo.bestPic.result.plants.length - 1 - index]
                                                                                numAuto: data.FarmingShopAutoPlotBought
                                                                            }
                                                                        ).remainingTime)
                                                                            }`}
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
                                                    <div style={{ minWidth: '310px' }}>
                                                        Most PIC (+{`${bestPlantCombo.bestPicPerc.result.picStats.picLevel} -> ${helper.roundTwoDecimal(bestPlantCombo.bestPicPerc.result.picStats.picPercent * 100)}%`})
                                                        , {`${helper.roundTwoDecimal(bestPlantCombo.bestPicPerc.finalFry / bestPlantCombo.bestProd.finalFry * 100)}% Fries`}:
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
                                                                <div style={{ marginLeft: '12px', border: '1px solid black', padding: '0 6px 0 6px' }}>

                                                                    <div style={{ margin: '0 3px' }}>
                                                                        {
                                                                            `P${bestPlantCombo.bestPicPerc.result.result.steps.length - index} for ${val.time > secondsHour ? helper.secondsToString(val.time) : helper.secondsToStringWithS(val.time)}`
                                                                            + (index !== bestPlantCombo.bestPot.result.result.steps.length - 1 ? ', ' : '')
                                                                        }
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

                                                                    <div>
                                                                        {`Next prestige: ${helper.secondsToStringWithS(farmingHelper.calcTimeTillPrestige(
                                                                            bestPlantCombo.bestPicPerc.result.plants[bestPlantCombo.bestPic.result.plants.length - 1 - index],
                                                                            {
                                                                                ...modifiers,
                                                                                // numAuto: bestPlantCombo.bestPicPerc.result.combo[bestPlantCombo.bestPic.result.plants.length - 1 - index]
                                                                                numAuto: data.FarmingShopAutoPlotBought
                                                                            }
                                                                        ).remainingTime)
                                                                            }`}
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
                            minHeight: '400px'
                            // minHeight: '-webkit-fill-available',
                            // height: '-webkit-fill-available'
                            // height: '100%'
                            // display: 'flex', flex: '1', flexDirection: 'column', height: '-webkit-fill-available'
                            //  minHeight: '600px',
                            //   minWidth: '600px' 
                        }}>


                            {/* Graph stuff */}
                            <div style={{
                                display: 'flex',
                                flex: 1,
                                position: 'absolute',
                                height: '99%',
                                width: '100%'
                                // height: '100%',
                                // height: '-webkit-fill-available',
                                // background: 'gray'
                                // display: 'flex', marginTop: '6px', alignItems: 'center',
                                // minHeight: '600px'

                            }}>
                                <ResponsiveContainer width="100%" height="100%"
                                //  minHeight="400px"
                                >
                                    <LineChart
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    // data={dataList}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" xAxisId="mainTime" name="time in seconds" />
                                        <YAxis yAxisId="potatoes" />
                                        {/*<YAxis yAxisId="fries" orientation="right" />*/}
                                        <Tooltip
                                            formatter={(value, name, props) => {
                                                return [value.toExponential(3), name];
                                            }}
                                        />
                                        <Legend />

                                        {(farmCalcProgress.current === farmCalcProgress.max && farmCalcProgress.current !== 0 && bestPlantCombo.prod) && (
                                            <>

                                                {/* <Line
                                                        type="monotone"
                                                        xAxisId={"mainTime"}
                                                        yAxisId="potatoes"
                                                        dataKey="value2"
                                                        name={`Top ${1} production`}
                                                        stroke="#8884d8"
                                                        activeDot={{ r: 8 }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        xAxisId={"mainTime"}
                                                        yAxisId="potatoes"
                                                        dataKey="value11"
                                                        name={`Top ${10} production`}
                                                        stroke="red"
                                                        activeDot={{ r: 8 }}
                                            /> */}


                                                {/* {calcStep && ( */}
                                                <>
                                                    {bestPlantCombo.bestPic.pic > 0 && (
                                                        <>
                                                            <XAxis dataKey="time" hide={true} xAxisId={"bestPIC"} name="time in seconds" />
                                                            <Line
                                                                type="monotone"
                                                                xAxisId={"bestPIC"}
                                                                // xAxisId={"mainTime"}
                                                                yAxisId="potatoes"
                                                                data={bestPlantCombo.bestPic.result.result.dataPointsPotatoes}
                                                                dataKey="production"
                                                                // dataKey="value2"
                                                                name={`Most PIC`}
                                                                stroke="orange"
                                                                activeDot={{ r: 8 }}
                                                            />
                                                        </>
                                                    )}
                                                    {displayPicPerc && (
                                                        <>
                                                            <XAxis dataKey="time" hide={true} xAxisId={"bestPICPerc"} name="time in seconds" />
                                                            <Line
                                                                type="monotone"
                                                                xAxisId={"bestPICPerc"}
                                                                // xAxisId={"mainTime"}
                                                                yAxisId="potatoes"
                                                                data={bestPlantCombo.bestPicPerc.result.result.dataPointsPotatoes}
                                                                dataKey="production"
                                                                // dataKey="value2"
                                                                name={`Most PIC %`}
                                                                // stroke="#8884d8"
                                                                stroke="red"
                                                                activeDot={{ r: 8 }}
                                                            />
                                                        </>
                                                    )}
                                                </>
                                                {/* )} */}

                                                {bestPlantCombo.top10DataPointsPotatoes.map((val, index) => {
                                                    if (index > 0) return;
                                                    return (<XAxis dataKey="time" hide={true} xAxisId={"potatoXAxis" + index} name="time in seconds" />)
                                                })
                                                }

                                                {bestPlantCombo.top10DataPointsPotatoes.map((val, index) => {
                                                    if (index > 0) return;
                                                    return (
                                                        <Line
                                                            type="monotone"
                                                            xAxisId={"potatoXAxis" + index}
                                                            // xAxisId={"mainTime"}
                                                            yAxisId="potatoes"
                                                            data={val.data}
                                                            dataKey="production"
                                                            // dataKey="value2"
                                                            name={`Top ${index + 1} production`}
                                                            stroke="#8884d8"
                                                            activeDot={{ r: 8 }}
                                                        />
                                                    )
                                                })
                                                }
                                            </>
                                        )}

                                        <Line
                                            type="monotone"
                                            xAxisId="mainTime"
                                            yAxisId="potatoes"
                                            data={tempFuture.dataPointsPotatoes}
                                            dataKey="production"
                                            // dataKey="custom"
                                            name="Currently selected production"
                                            stroke="#82ca9d"
                                            strokeWidth={2}
                                            activeDot={{ r: 8 }}
                                        />
                                        {/* {customLines.length > 0 && (
                                                customLines.map((e, index) => {
                                                    return (
                                                        <Line
                                                            type="monotone"
                                                            xAxisId="mainTime"
                                                            yAxisId="potatoes"
                                                            data={e}
                                                            dataKey="production"
                                                            name={`Custom Line ${index}`}
                                                            stroke="#8884d8"
                                                            strokeWidth={2}
                                                            activeDot={{ r: 8 }}
                                                        />
                                                    )
                                                })
                                            )} *
                                {/*bestPlantCombo.top10DataPointsPotatoes.map((val, index) => {
                                                    return (<XAxis dataKey="time" hide={true} xAxisId={"fryXAxis" + index} name="time in seconds"/>)})
                                                }
                                                {bestPlantCombo.top10DataPointsFries.map((val, index) => {
                                                    return (
                                                        <Line
                                                            type="monotone"
                                                            xAxisId={"fryXAxis" + index}
                                                            yAxisId="fries"
                                                            data={val.data}
                                                            dataKey="fries"
                                                            name={`Top ${index + 1} fries`}
                                                            stroke="#82ca9d"
                                                            activeDot={{ r: 5 }}
                                                        />
                                                    )})
                                                    */}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>

            </div >


        </div >
    );
};

export default FarmingLanding;