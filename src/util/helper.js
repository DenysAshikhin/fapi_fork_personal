var helper = {
    roundTwoDecimal: function (number) {
        return Math.round((number + Number.EPSILON) * 100) / 100;
    },
    roundThreeDecimal: function (number) {
        return Math.round((number + Number.EPSILON) * 1000) / 1000;
    },
    roundInt: function (num) {
        return Math.round((num + Number.EPSILON) * 1) / 1;
    },
    calculateLogarithm: function (base, x) {
        var a = Math.log(x);
        var b = Math.log(base);
        return a / b;
    },
    calcPOW: function (val) {
        return val.mantissa * Math.pow(10, val.exponent);
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
            this.calculateLogarithm(1.25, ManuallyCreated)
        )
        let output = TotalCreated * plantMult * PlantTotalProductionBonus * Math.pow(1.02, prestige);


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
                    this.calculateLogarithm(1.25, plant.created)
                );

                if (rankIncrease) {
                    plant.Rank++;
                    plant.curExp = 0;
                    plant.perHarvest = this.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
                    plant.reqExp = 10 + 5 * plant.Rank * Math.pow(1.05, plant.Rank);
                }
                else {
                    let gainedEXP = numHarvests * expTick;
                    plant.curExp += gainedEXP;

                    if (plant.curExp > plant.reqExp) {
                        plant.Rank++;
                        plant.curExp = 0;
                        plant.perHarvest = this.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
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
    calcPerHarvest: function (plant) {
        return this.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige)
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
            let timeTillPrestige = (remainingHarvests / (plant.perHarvest * numAutos)) * plant.growthTime;

            if (timeTillPrestige < 0) {
                prestiged = true
            }
            else if (timeTillPrestige > timeToLevel) {
                plant.elapsedTime += timeToLevel;
                let ticks = Math.floor(plant.elapsedTime / plant.growthTime);

                plant.created += ((ticks) * plant.perHarvest) * numAutos;
                plant.totalMade += ((ticks) * plant.perHarvest) * numAutos;
                plant.Rank++;
                plant.curExp = 0;
                plant.perHarvest = this.calcPerHarvest(plant);
                totalTime += timeToLevel;
                plant.elapsedTime = plant.elapsedTime % plant.growthTime;
            }
            else {
                prestiged = true;
                plant.elapsedTime += timeTillPrestige;
                plant.created += ((timeTillPrestige / plant.growthTime) * plant.perHarvest) * numAutos;
                totalTime += timeTillPrestige;
                plant.elapsedTime = plant.elapsedTime % plant.growthTime;
            }
        }
        return totalTime;
    },
    calcHPProd: function (plants_input, modifiers_input) {
        let plants = JSON.parse(JSON.stringify(plants_input));
        let modifiers = JSON.parse(JSON.stringify(modifiers_input));
        let numAutos = modifiers.numAutos;
        let time = modifiers.time;//time in seconds

        let totalPotatoes = 0;

        //Iterate over each second
        for (let i = 0; i < time; i++) {
            //Calculate new values for each plant
            for (let j = plants.length - 1; j >= 0; j--) {
                let curr = plants[j];
                let toAdd = j === plants.length - 1 ? 0 : plants[j + 1].production * 1;
                curr.totalMade += toAdd;
                let res = helper.calcFutureMult(curr, { ...modifiers, time: 1, numAuto: numAutos[j], string: false });
                plants[j] = res;
            }
            totalPotatoes += plants[0].production;
        }
        // console.log(`plant 2 final prod: ${plants[1].production}`)
        return { totalPotatoes: totalPotatoes, potatoeProduction: plants[0].production, plants: plants };
    },
    secondsToStringWithS: function (seconds) {
        let string = ``;
        let numHours = 0;
        let numMinutes = 0;
        let numSeconds = 0;

        numHours = Math.floor(seconds / 3600);
        numMinutes = Math.floor((seconds % 3600) / 60);
        numSeconds = this.roundInt((seconds % 3600) % 60);
        if (numHours > 0) {
            string = string + `${numHours < 10 ? `0` + numHours : numHours}h:`
        }
        if (numMinutes > 0) {
            string = string + `${numMinutes < 10 ? `0` + numMinutes : numMinutes}m:`
        }
        if (numSeconds > 0) {
            string = string + `${numSeconds < 10 ? `0` + numSeconds : numSeconds}s`
        }
        else {
            string = string + '0s';
        }

        return string;
    },
    secondsToString: function (seconds) {
        let string = ``;
        let numHours = 0;
        let numMinutes = 0;

        numHours = Math.floor(seconds / 3600);
        numMinutes = this.roundInt((seconds % 3600) / 60);

        if (numHours > 0) {
            string = string + `${numHours < 10 ? `0` + numHours : numHours}h:`
        }
        if (numMinutes > 0) {
            string = string + `${numMinutes < 10 ? `0` + numMinutes : numMinutes}m`
        }
        else {
            string = string + `0s`;
        }

        return string;
    },
    bonusColorMap: {
        1001: { color: 'maroon' },
        1002: { color: 'orange' },
        1003: { color: 'purple' },
        1009: { color: 'cyan' },
        1012: { color: 'yellow' },
        1013: { color: 'red' },
        1014: { color: 'blue' },
        1015: { color: 'gray' },
        1016: { color: 'green' }
    }
}


export default helper;