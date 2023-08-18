import helper from './helper.js';

var farmingHelper = {
    findMultipliersWithMinPercentage: function (sum, numbers, minPercentage) {
        const multipliers = [];
        let count = 0;

        function backtrack(index, currentSum, currentMultipliers) {
            count++;

            if (index === numbers.length) {
                const productSum = currentMultipliers.reduce((acc, multiplier, i) => acc + multiplier * numbers[i], 0);
                if (productSum >= minPercentage * sum) {
                    multipliers.push([...currentMultipliers]);
                }
                return;
            }
            let max = Math.floor((sum - currentSum) / numbers[index]);
            for (let multiplier = 0; multiplier <= max; multiplier++) {
                currentMultipliers[index] = multiplier;
                let tempSum = currentSum + multiplier * numbers[index];
                if (tempSum < sum) {
                    backtrack(index + 1, currentSum + multiplier * numbers[index], currentMultipliers);
                }
            }
        }

        backtrack(0, 0, []);
        console.log(count);
        return multipliers;
    },
    calcGrowthTime: function (plant, modifiers) {
        let num = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * modifiers.shopGrowingSpeed) / modifiers.petPlantCombo / modifiers.contagionPlantGrowth);
        return num < 10 ? 10 : num;
    },
    calcPlantHarvest: function (plant, modifiers) {
        return helper.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige) * modifiers.contagionHarvest;
    },
    calcProdOutput: function (plant_input, modifiers_input) {


        let TotalCreated = plant_input.totalMade;
        let ManuallyCreated = plant_input.created;
        let shovel = modifiers_input.manualHarvestFormula;
        let shopProdBonus = modifiers_input.shopProdBonus;
        const assemblyBonus = 1;
        let prestige = plant_input.prestige;
        // GM.PD.PlantTotalProductionBonus = 1 * BigDouble.Pow(1.25, GM.PD.FarmingShopPlantTotalProduction) * GM.ASMA.GetAssemblerBonus(26) * GM.GHLM.GetBonus(3) * Math.Pow(1.01, Math.Max(0, GM.PD.CurrentEventPoint - 75));
        let PlantTotalProductionBonus = 1 * shopProdBonus * assemblyBonus * modifiers_input.contagionPlantProd;

        const Max = function (a, b) {
            return a > b ? a : b;
        }
        let plantMult = Math.pow(
            (1 + 0.05 * (1 + shovel * 0.02)),
            helper.calculateLogarithm(1.25, ManuallyCreated)
        )
        let output = TotalCreated * plantMult * PlantTotalProductionBonus * Math.pow(1.02, prestige);
        if (plant_input.ID === 1) {
            output *= modifiers_input.hpBonus;
        }

        return output;
    },
    calcFryOutput: function (potatoes) {

        // BigDouble.Round((BigDouble.Log(GM.PD.HealthyPotatoTotal, 10.0) - 15.75) * (20 - BigDouble.Min(BigDouble.Log(GM.PD.HealthyPotatoTotal, 10.0), 31) + 16) * BigDouble.Pow(1.15, BigDouble.Log(GM.PD.HealthyPotatoTotal, 10.0) - 16.0) * GM.PD.FrenchFriesBonus * GM.PD.TimerFriesPrestigeBonuses);
        // BigDouble.Round(step1 * step2 * step3  * GM.PD.FrenchFriesBonus * GM.PD.TimerFriesPrestigeBonuses);
        let step1 = (helper.calculateLogarithm(10.0, potatoes) - 15.75);
        let step2 = (20 - Math.min(helper.calculateLogarithm(10.0, potatoes), 31) + 16);
        let step3 = Math.pow(1.15, helper.calculateLogarithm(10.0, potatoes) - 16.0);
        return step1 * step2 * step3;
    },
    calcCarryOverEXP: function ({ plant, numAutos, expTick }) {

        let leftOver = 0;
        let numLevels = 1;
        if (numAutos > 1) {
            let individualEXP = expTick / numAutos;
            let ticksNeededEXP = Math.ceil((plant.reqExp - plant.curExp) / individualEXP);
            if (numAutos > ticksNeededEXP) {
                leftOver = (numAutos - ticksNeededEXP) * individualEXP;
                let futureReq = 10 + 5 * (plant.Rank + numLevels) * Math.pow(1.05, (plant.Rank + numLevels));
                while (leftOver > futureReq) {
                    leftOver -= futureReq;
                    numLevels++;
                    futureReq = 10 + 5 * (plant.Rank + numLevels) * Math.pow(1.05, (plant.Rank + numLevels));
                }
            }
            else {
                leftOver = 0;
            }
        }
        else {

            leftOver = 0;
        }
        return { leftOver, numLevels };
    },
    calcFutureMult: function (plant_input, modifiers_input) {

        // console.log(`calcing future mult${plant_input.ID}`)
        let plant = modifiers_input.string === false ? plant_input : JSON.parse(JSON.stringify(plant_input));
        let modifiers = modifiers_input.string === false ? modifiers_input : JSON.parse(JSON.stringify(modifiers_input));
        let remainingTime = modifiers.time;
        let numAutos = modifiers.numAuto || modifiers?.numAuto === 0 ? modifiers.numAuto : 1;

        let x = 0;
        let numLoops = 0;
        let expTick = plant.prestigeBonus * modifiers.expBonus * numAutos;
        plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * modifiers.shopGrowingSpeed) / modifiers.petPlantCombo / modifiers.contagionPlantGrowth);
        if (plant.growthTime < 10) {
            plant.growthTime = 10;
        }

        while (remainingTime > 0) {

            plant.timeToLevel = Math.ceil((plant.reqExp - plant.curExp) / expTick) * plant.growthTime;

            if (plant.ID === 1) {
                let ss = 0;
            }

            let elapsedTime = 0;

            let rankIncrease = false;
            if (plant.timeToLevel >= remainingTime) {
                elapsedTime = remainingTime;
            }
            else {
                elapsedTime = plant.timeToLevel;
                rankIncrease = true;
            }

            remainingTime -= elapsedTime;
            plant.elapsedTime += elapsedTime;

            let numHarvests = 0;
            if (plant.elapsedTime >= plant.growthTime) {
                numHarvests = Math.floor(plant.elapsedTime / plant.growthTime);

                let toCreate = plant.perHarvest * numHarvests * numAutos;
                plant.created += toCreate;
                plant.totalMade += toCreate;

                plant.futureMult = Math.pow(
                    (1 + 0.05 * (1 + modifiers.manualHarvestFormula * 0.02)),
                    helper.calculateLogarithm(1.25, plant.created)
                );

                if (rankIncrease) {

                    let leftOver = this.calcCarryOverEXP({ plant, expTick, numAutos });
                    plant.curExp = leftOver.leftOver;
                    plant.Rank += leftOver.numLevels;
                    // plant.perHarvest = helper.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
                    plant.perHarvest = this.calcPlantHarvest(plant, modifiers);
                    plant.reqExp = 10 + 5 * plant.Rank * Math.pow(1.05, plant.Rank);
                }
                else {
                    let gainedEXP = numHarvests * expTick;
                    // plant.curExp += gainedEXP;
                    let totalExp = plant.curExp + gainedEXP;

                    if (totalExp > plant.reqExp) {
                        let leftOver = this.calcCarryOverEXP({ plant, expTick, numAutos });
                        plant.curExp = leftOver.leftOver;
                        plant.Rank += leftOver.numLevels;
                        // plant.perHarvest = helper.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
                        plant.perHarvest = this.calcPlantHarvest(plant, modifiers);
                        plant.reqExp = 10 + 5 * plant.Rank * Math.pow(1.05, plant.Rank);
                    }
                    else {
                        plant.curExp = totalExp;
                    }
                }

                plant.elapsedTime = plant.elapsedTime % plant.growthTime;
            }
            let newOutPut = this.calcProdOutput(plant, modifiers);
            plant.production = newOutPut;
        }
        return plant;
    },
    calcTimeTillLevel: function (plant_input, modifiers_input) {

        let plant = JSON.parse(JSON.stringify(plant_input));
        let modifiers = JSON.parse(JSON.stringify(modifiers_input));
        let numAutos = modifiers.numAuto || modifiers?.numAuto === 0 ? modifiers.numAuto : 1;


        plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * modifiers.shopGrowingSpeed) / modifiers.petPlantCombo / modifiers.contagionPlantGrowth);
        if (plant.growthTime < 10) {
            plant.growthTime = 10;
        }
        plant.reqExp = 10 + 5 * plant.Rank * Math.pow(1.05, plant.Rank);
        let remExp = plant.reqExp - plant.curExp;
        let expBonus = plant.prestigeBonus * modifiers.expBonus * numAutos;
        let ticksTillLevel = Math.ceil((remExp) / expBonus);

        plant.timeToLevel = ticksTillLevel * plant.growthTime;



        // plant.timeToLevel = (remExp / expBonus) * plant.growthTime;
        return plant;
    },
    getNextShopCosts: function (data) {

        let prodCost = 1;
        let prodLevel = data.FarmingShopPlantTotalProduction ? data.FarmingShopPlantTotalProduction : data.shopProdLevel;
        let growthCost = 1;
        let growthLevel = data.FarmingShopPlantGrowingSpeed ? data.FarmingShopPlantGrowingSpeed : data.shopGrowingSpeed;
        let expCost = 1;
        let expLevel = data.FarmingShopPlantRankExpEarned ? data.FarmingShopPlantRankExpEarned : data.shopRankLevel;


        prodCost = prodLevel > 50 ? 100000000.0 * Math.pow(100 * Math.pow(1.05, prodLevel - 50), prodLevel)
            :
            100000000 * Math.pow(100, prodLevel);
        growthCost = 10000000000 * Math.pow(500, growthLevel);
        expCost = 1000000000000000 * Math.pow(250, expLevel);
        return { prodCost, growthCost, expCost };
    },
    calcMaxPrestige: function (plant_input) {

        let start = plant_input.prestige;
        let runningHarvests = 0;
        let flag = true;
        while (flag) {
            let requiredHarvests = runningHarvests + (10 * Math.pow(2, start));
            if (plant_input.created >= requiredHarvests) {
                start++;
                runningHarvests += requiredHarvests;
            }
            else {
                flag = false;
            }
        }
        return start - plant_input.prestige;
    },
    calcTimeTillPrestige: function (plant_input, modifiers_input) {
        let plant = JSON.parse(JSON.stringify(plant_input));
        let modifiers = JSON.parse(JSON.stringify(modifiers_input));
        let numAutos = modifiers.numAuto || modifiers?.numAuto === 0 ? modifiers.numAuto : 1;
        let prestiged = false;
        let totalTime = 0;
        let runningHarvests = 0;

        while (!prestiged) {
            let timeToLevel = this.calcTimeTillLevel(plant, modifiers).timeToLevel;
            let requiredHarvests = runningHarvests + (10 * Math.pow(2, plant.prestige));
            let remainingHarvests = requiredHarvests - plant.created;
            let timeTillPrestige = Math.ceil((remainingHarvests / (plant.perHarvest * numAutos))) * plant.growthTime;

            if (timeTillPrestige <= 0) {
                prestiged = true;

                if (totalTime <= 0) {
                    plant.prestige++;
                    prestiged = false;
                    runningHarvests += requiredHarvests;
                }

            }
            else if (timeTillPrestige > timeToLevel) {
                plant.elapsedTime += timeToLevel;
                let ticks = Math.floor(plant.elapsedTime / plant.growthTime);

                plant.created += ((ticks) * plant.perHarvest) * numAutos;
                plant.totalMade += ((ticks) * plant.perHarvest) * numAutos;
                plant.Rank++;
                plant.curExp = 0;
                plant.perHarvest = this.calcPlantHarvest(plant, modifiers);
                totalTime += timeToLevel;
                plant.elapsedTime = plant.elapsedTime % plant.growthTime;
            }
            else {
                prestiged = true;
                plant.elapsedTime += timeTillPrestige;
                let ticks = Math.floor(plant.elapsedTime / plant.growthTime);
                plant.created += ((ticks) * plant.perHarvest) * numAutos;
                plant.totalMade += ((ticks) * plant.perHarvest) * numAutos;
                totalTime += timeTillPrestige;
                plant.elapsedTime = plant.elapsedTime % plant.growthTime;
            }
        }
        return { remainingTime: totalTime, prestige: plant.prestige, prestiged: prestiged }
    },
    calcHPProd: function (plants_input, modifiers_input) {
        let plants = JSON.parse(JSON.stringify(plants_input));
        let modifiers = JSON.parse(JSON.stringify(modifiers_input));
        let numAutos = modifiers.numAutos;
        let simulationTime = modifiers.time; //time in seconds

        const dataPointsMax = modifiers.maxSteps ? modifiers.maxSteps : 100;

        let tickRate = 60 * 0.1;
        let dataPointThreshold = (simulationTime / tickRate )< dataPointsMax ? 1 : helper.roundInt(simulationTime / dataPointsMax);
        let dataPointsPotatoes = [];
        let dataPointsFries = [];

        let totalPotatoes = modifiers.totalPotatoes;
        let currPotatoes = modifiers.curPotatoes;
        let prevPlantsProd = Array(plants.length).fill(0);
        for (let i = 0; i < plants.length; i++) {
            prevPlantsProd[i] = plants[i].production;
        }
        //Iterate over each second
        for (let i = 0; i < simulationTime / tickRate; i++) {
            //Calculate new values for each plant
            for (let j = plants.length - 1; j >= 0; j--) {
                let curr = plants[j];
                let toAdd = j === plants.length - 1 ? 0 :
                    // plants[j + 1].production * tickRate
                tickRate > 1 ?
                    //Some basic calculus to find total assuming linear growth
                    0.5 * (prevPlantsProd[j + 1] + plants[j + 1].production) * tickRate : plants[j + 1].production * tickRate;
                curr.totalMade += toAdd;
                let res = this.calcFutureMult(curr, { ...modifiers, time: tickRate, numAuto: numAutos[j], string: false });
                plants[j] = res;
                prevPlantsProd[j] = plants[j].production;
            }
            totalPotatoes += plants[0].production * tickRate;
            currPotatoes += plants[0].production * tickRate;

            if (modifiers.autoBuyPBC) {
                let updateCosts = false;
                if (currPotatoes >= modifiers.nextCosts.prodCost) {
                    currPotatoes -= modifiers.nextCosts.prodCost;
                    modifiers.shopProdLevel++;
                    modifiers.shopProdBonus = Math.pow(1.25, modifiers.shopProdLevel);
                    updateCosts = true;
                }
                if (currPotatoes >= modifiers.nextCosts.growthCost) {
                    currPotatoes -= modifiers.nextCosts.growthCost;
                    modifiers.shopGrowingSpeed++;
                    updateCosts = true;
                }
                if (currPotatoes >= modifiers.nextCosts.expCost) {
                    currPotatoes -= modifiers.nextCosts.expCost;
                    modifiers.shopRankLevel++;
                    modifiers.shopRankEXP = 1 + modifiers.shopRankLevel * 0.1;
                    updateCosts = true;
                }
                if (updateCosts) {

                    let nextCosts = this.getNextShopCosts(modifiers);
                    modifiers.nextCosts = nextCosts
                }
            }

            if (i % dataPointThreshold == 0 || i === simulationTime - 1) {
                dataPointsPotatoes.push({ "time": i, "production": totalPotatoes })
                dataPointsFries.push({ "time": i, "fries": farmingHelper.calcFryOutput(totalPotatoes) })
            }
        }

        return {
            totalPotatoes: totalPotatoes,
            potatoeProduction: plants[0].production,
            plants: plants,
            nextCosts: modifiers.nextCosts,
            dataPointsPotatoes: dataPointsPotatoes,
            dataPointsFries: dataPointsFries,
            finalModifiers: modifiers,
        };
    },
    calcStepHPProd: function (plants_input, modifiers_input) {
        let plants = JSON.parse(JSON.stringify(plants_input));
        let modifiers = JSON.parse(JSON.stringify(modifiers_input));
        let steps = modifiers.steps;
        let res = -1;
        let potatoeSteps = [];
        for (let i = 0; i < steps.length; i++) {
            res = this.calcHPProd(plants, { ...modifiers, numAutos: steps[i].autos, time: steps[i].time, maxSteps: 100 / (modifiers_input.numSteps) });
            modifiers = res.finalModifiers;
            modifiers.totalPotatoes = res.totalPotatoes;
            plants = res.plants;
            potatoeSteps = potatoeSteps.concat(res.dataPointsPotatoes);
            steps[i].obj = { text: `P${steps.length - i} for ${steps[i].time}`, numAutos: steps[i].autos, time: steps[i].time }

        }
        for (let i = 0; i < potatoeSteps.length; i++) {
            potatoeSteps[i].time = i;
        }
        res.dataPointsPotatoes = potatoeSteps;
        res.steps = steps;

        return res;
    },
    calcAssemblyHP: function (data) {
        let bonus = 1;

        if (data?.AssemblerCollection[0].BonusList[0].StartingLevel <= data?.AssemblerCollection[0].Level) {
            let gain = data?.AssemblerCollection[0].BonusList[0].Gain;
            let level = (data?.AssemblerCollection[0].Level - data?.AssemblerCollection[0].BonusList[0].StartingLevel)
            bonus = Math.pow(1 + gain, level);
        }

        return bonus;
    },
    calcContagionBonus: function (data, index) {
        let bonus = 1;

        if (data.GrasshopperCollection[index].Locked > 0) {
            let base = helper.calcPOW(data.GrasshopperCollection[index].BaseBonus);
            let level = helper.calcPOW(data.GrasshopperCollection[index].Level);
            bonus *= Math.pow(1 + base * 0.01, level);
        }
        return bonus;
    },
    calcExpeditionHP: function (data) {
        let bonus = 1;

        if (data.ExpeditionsCollection[16].Locked > 0) {
            let temp = data.ExpeditionsCollection[16];
            let res = Math.pow(1 + temp.BonusPower, temp.Room - 1);
            bonus = res;
        }
        return bonus;
    },
    calcUniqueHPBonus: function (data) {
        let bonus = 1;

        for (let i = 0; i < data.FarmingShopUniqueHealthy.length; i++) {
            bonus *= (data.FarmingShopUniqueHealthy[i] + 1);
        }
        return bonus;
    },
    calcFriesHPBonus: function (data) {
        let bonus = 1;

        let totalFries = helper.calcPOW(data.FrenchFriesTotal);
        let shopFryBonus = 0.01 * data.FarmingShopFriesHealthyBonus + 0.1;
        let contagionFryBonus = this.calcContagionBonus(data, 5);
        let fryBonus = shopFryBonus * contagionFryBonus;
        bonus *= 1 + totalFries * fryBonus;
        return bonus;
    },
    calcPetHPBonus: function (data) {
        let bonus = 1;

        let activePets = data.EquipedPetID;
        let allPets = data.PetsCollection;

        let neededMap = {};
        for (let i = 0; i < activePets.length; i++) {
            if (activePets[i] > 0) {
                neededMap[activePets[i]] = true;
            }
        }

        for (let i = 0; i < allPets.length; i++) {
            let curr = allPets[i];
            if (curr.ID in neededMap) {
                let rank = curr.Rank;
                let bonusInner = 0;

                for (let j = 0; j < curr.BonusList.length; j++) {
                    let bonusInner = curr.BonusList[j];
                    if (bonusInner.ID === 23) {

                        //public double GetPetBonus(int Bonus)
                        //(Math.Pow(1.0 + petDataBonus.Gain, petData.Level) - 1.0 + Math.Max(0.0, (Math.Log(petData.Level + 1, 1.0125) * 0.005 - 1.0) * 0.5)) * (1.0 + Math.Log(petData.Rank + 1, 1.075) * 0.005) * 0.5
                        //(x1                                                     + x3) * (x5) * 0.5


                        // (
                        //     Math.Pow(1.0 + petDataBonus.Gain, petData.Level)
                        //     - 1.0
                        //     + Math.Max(
                        //         0.0, 
                        //         (Math.Log(petData.Level + 1, 1.0125) * 0.005 - 1.0) * 0.5)
                        // )

                        let x1 = Math.pow(1.0 + bonusInner.Gain, curr.Level) - 1.0;
                        let x2 = helper.calculateLogarithm(1.0125, curr.Level + 1);
                        let x3 = Math.max(0.0, (x2 * 0.005 - 1.0) * 0.5);
                        let x4 = helper.calculateLogarithm(1.075, curr.Rank + 1);
                        let x5 = 1.0 + x4 * 0.005;

                        let tot1 = (x1 + x3);
                        let tot2 = tot1 * x5;
                        let tot3 = tot2 * 0.5;

                        bonus += tot3;
                    }
                }
            }
        }

        return bonus;
    },
    calcHPBonus: function (data) {


        // let bonus = 1;
        // let assemblyHP = this.calcAssemblyHP(data);
        // bonus *= assemblyHP;

        // let contagionHP = this.calcContagionBonus(data, 0);
        // bonus *= contagionHP;

        // let soulBonus = Math.pow(1.25, data.SoulFertilizer);
        // bonus *= soulBonus;

        // let expeditionBonus = this.calcExpeditionHP(data);
        // bonus *= expeditionBonus;

        // let FarmingShopPlantHealthyPotatoEarning = Math.pow(1.1, data.FarmingShopPlantHealthyPotatoEarning);
        // bonus *= FarmingShopPlantHealthyPotatoEarning;

        // let uniqueHPBonus = this.calcUniqueHPBonus(data);
        // bonus *= uniqueHPBonus;

        // let fryHPBonus = this.calcFriesHPBonus(data);
        // bonus *= fryHPBonus;

        // let petHPBonus = this.calcPetHPBonus(data);
        // bonus *= petHPBonus;

        // let residueHPBonus = Math.pow(1.05, data.CowShopHealthyPotato ? data.CowShopHealthyPotato : 0);
        // bonus *= residueHPBonus;

        // //(1 + 
        // // milk: 
        // let step1 = Math.max(0,
        //     helper.calcPOW(data.BoostHealthyPotatoMilkBD) >= 1E+20 ?
        //         helper.calculateLogarithm(Math.max(1.001, helper.calculateLogarithm(helper.calcPOW(data.BoostHealthyPotatoMilkBD) + 1, 1.001) - 10.0), helper.calcPOW(data.BoostHealthyPotatoMilkBD) + 1)
        //         :
        //         0
        // );


        // let temp2 = (1.0 + data.BrewingHealthyPotatoLevel * 0.005) * ((helper.calcPOW(data.BoostHealthyPotatoCalciumBD) >= 1E+20)
        //     ? (Math.pow(1.05, helper.calculateLogarithm(Math.max(1.001, helper.calculateLogarithm(1.001, helper.calcPOW(data.BoostHealthyPotatoCalciumBD) + 1) - 10.0), helper.calcPOW(data.BoostHealthyPotatoCalciumBD) + 1)) - 0.228)
        //     : 1)
        // let tempy = (Math.pow(1.05, helper.calculateLogarithm(helper.calcPOW(Math.max(1.001, helper.calculateLogarithm(1.001, helper.calcPOW(data.BoostHealthyPotatoCalciumBD) + 1) - 10.0), data.BoostHealthyPotatoCalciumBD) + 1)) - 0.228);

        // let temp3 = helper.calculateLogarithm(data.BoostHealthyPotatoMilkBD + 1, 1.001)
        // //brewing:  
        // //fermenting: (1.0 + GM.PD.HealthyPotatoPetRankExpFermentingLevel * 0.0025)))
        // let milkHPBonus = helper.calcPOW(data.BoostHealthyPotatoMilkBD);
        // // bonus *= milkHPBonus;

        let legitBonus = helper.calcPOW(data.HealthyPotatoBonus);
        return legitBonus;
    }
}

export default farmingHelper;