import helper from './helper.js';

var farmingHelper = {

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
    calcFutureMult: function (plant_input, modifiers_input) {


        let plant = modifiers_input.string === false ? plant_input : JSON.parse(JSON.stringify(plant_input));
        let modifiers = modifiers_input.string === false ? modifiers_input : JSON.parse(JSON.stringify(modifiers_input));
        let remainingTime = modifiers.time;
        let numAutos = modifiers.numAuto || modifiers?.numAuto === 0 ? modifiers.numAuto : 1;

        let x = 0;
        let numLoops = 0;
        let expTick = plant.prestigeBonus * modifiers.expBonus * numAutos;
        // plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * modifiers.shopGrowingSpeed) / modifiers.petPlantCombo / modifiers.contagionPlantGrowth);
        // if (plant.growthTime < 10) {
        //     plant.growthTime = 10;
        // }

        while (remainingTime > 0) {

            plant.timeToLevel = Math.ceil((plant.reqExp - plant.curExp) / expTick) * plant.growthTime;

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
                    plant.Rank++;
                    plant.curExp = 0;
                    // plant.perHarvest = helper.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
                    plant.perHarvest = this.calcPlantHarvest(plant, modifiers);
                    plant.reqExp = 10 + 5 * plant.Rank * Math.pow(1.05, plant.Rank);
                }
                else {
                    let gainedEXP = numHarvests * expTick;
                    plant.curExp += gainedEXP;

                    if (plant.curExp > plant.reqExp) {
                        plant.Rank++;
                        plant.curExp = 0;
                        // plant.perHarvest = helper.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
                        plant.perHarvest = this.calcPlantHarvest(plant, modifiers);
                        plant.reqExp = 10 + 5 * plant.Rank * Math.pow(1.05, plant.Rank);
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


        prodCost = 100000000 * Math.pow(100, prodLevel);
        growthCost = 10000000000 * Math.pow(500, growthLevel);
        expCost = 1000000000000000 * Math.pow(250, expLevel);
        return { prodCost, growthCost, expCost };
    },
    calcTimeTillPrestige: function (plant_input, modifiers_input) {
        let plant = JSON.parse(JSON.stringify(plant_input));
        let modifiers = JSON.parse(JSON.stringify(modifiers_input));
        let numAutos = modifiers.numAuto || modifiers?.numAuto === 0 ? modifiers.numAuto : 1;
        let prestiged = false;
        let totalTime = 0;

        while (!prestiged) {
            let timeToLevel = this.calcTimeTillLevel(plant, modifiers).timeToLevel;
            let requiredHarvests = 10 * Math.pow(2, plant.prestige);
            let remainingHarvests = requiredHarvests - plant.created;
            let timeTillPrestige = Math.ceil((remainingHarvests / (plant.perHarvest * numAutos))) * plant.growthTime;

            if (timeTillPrestige <= 0) {
                prestiged = true;

                if (totalTime <= 0) {
                    plant.prestige++;
                    prestiged = false;
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
        let time = modifiers.time;//time in seconds

        let totalPotatoes = modifiers.totalPotatoes;
        let currPotatoes = modifiers.curPotatoes;

        //Iterate over each second
        for (let i = 0; i < time; i++) {
            //Calculate new values for each plant
            for (let j = plants.length - 1; j >= 0; j--) {
                let curr = plants[j];
                let toAdd = j === plants.length - 1 ? 0 : plants[j + 1].production * 1;
                curr.totalMade += toAdd;
                let res = this.calcFutureMult(curr, { ...modifiers, time: 1, numAuto: numAutos[j], string: false });
                plants[j] = res;
            }
            totalPotatoes += plants[0].production;
            currPotatoes += plants[0].production;

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

        }
        // console.log(`plant 2 final prod: ${plants[1].production}`)
        return { totalPotatoes: totalPotatoes, potatoeProduction: plants[0].production, plants: plants, nextCosts: modifiers.nextCosts };
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
        /*
        2. (1 + GM.PD.FrenchFriesTotal * (0.1 + 0.01 * (double)GM.PD.FarmingShopFriesHealthyBonus) * GM.GHLM.GetBonus(5))

        */

        let bonus = 1;
        let assemblyHP = this.calcAssemblyHP(data);
        bonus *= assemblyHP;

        let contagionHP = this.calcContagionBonus(data, 0);
        bonus *= contagionHP;

        let soulBonus = Math.pow(1.25, data.SoulFertilizer);
        bonus *= soulBonus;

        let expeditionBonus = this.calcExpeditionHP(data);
        bonus *= expeditionBonus;

        let FarmingShopPlantHealthyPotatoEarning = Math.pow(1.1, data.FarmingShopPlantHealthyPotatoEarning);
        bonus *= FarmingShopPlantHealthyPotatoEarning;

        let uniqueHPBonus = this.calcUniqueHPBonus(data);
        bonus *= uniqueHPBonus;

        let fryHPBonus = this.calcFriesHPBonus(data);
        bonus *= fryHPBonus;

        let petHPBonus = this.calcPetHPBonus(data);
        bonus *= petHPBonus;

        let residueHPBonus = Math.pow(1.05, data.CowShopHealthyPotato ? data.CowShopHealthyPotato : 0);
        bonus *= residueHPBonus;

        // let milkHPBonus = helper.calcPOW(data.BoostHealthyPotatoMilkBD);
        // bonus *= milkHPBonus;

        let legitBonus = helper.calcPOW(data.HealthyPotatoBonus);
        return bonus;
    }
}

export default farmingHelper;