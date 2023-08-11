import helper from './util/helper.js';



// eslint-disable-next-line no-restricted-globals
self.onmessage = ({ data: { data, id, data1 } }) => {

    const roundInt = function (num) {
        return Math.round((num + Number.EPSILON) * 1) / 1;
    }

    const calculateLogarithm = function (base, x) {
        var a = Math.log(x);
        var b = Math.log(base);
        return a / b;
    }
    const calcPOW = function (val) {
        return val.mantissa * Math.pow(10, val.exponent);
    }
    const calcProdOutput = function (plant_input, modifiers_input) {


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
            calculateLogarithm(1.25, ManuallyCreated)
        )
        let output = TotalCreated * plantMult * PlantTotalProductionBonus * Math.pow(1.02, prestige);


        return output;
    }
    const calcFutureMult = function (plant_input, modifiers_input) {

        let plant = JSON.parse(JSON.stringify(plant_input));
        let modifiers = JSON.parse(JSON.stringify(modifiers_input));
        let remainingTime = modifiers.time;
        let numAutos = modifiers.numAuto || modifiers?.numAuto === 0 ? modifiers.numAuto : 1;

        let x = 0;
        while (remainingTime > 0) {
            plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * modifiers.shopGrowingSpeed) / modifiers.petPlantCombo / modifiers.contagionPlantGrowth);
            if (plant.growthTime < 10) {
                plant.growthTime = 10;
            }
            plant.reqExp = 10 + 5 * plant.Rank * Math.pow(1.05, plant.Rank)
            plant.timeToLevel = (plant.reqExp - plant.curExp) / (plant.prestigeBonus * modifiers.expBonus * numAutos) * plant.growthTime;

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

            // plant.created = this.calcPOW(plant.ManuallyCreated);
            plant.perHarvest = roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
            let toCreate = plant.perHarvest * (elapsedTime / plant.growthTime) * numAutos;
            plant.futureMult = Math.pow(
                (1 + 0.05 * (1 + modifiers.manualHarvestFormula * 0.02)),
                calculateLogarithm(1.25, plant.created + toCreate)
            );
            plant.created += toCreate;
            plant.totalMade += toCreate;

            if (rankIncrease) {
                plant.Rank++;
                plant.curExp = 0;
            }
            else {
                let gainedEXP = (elapsedTime / plant.growthTime) * (plant.prestigeBonus * modifiers.expBonus * numAutos);
                plant.curExp += gainedEXP;
            }

            let newOutPut = calcProdOutput(plant, modifiers);
            plant.production = newOutPut;
        }
        return plant;
    }
    const calcTimeTillLevel = function (plant_input, modifiers_input) {

        let plant = JSON.parse(JSON.stringify(plant_input));
        let modifiers = JSON.parse(JSON.stringify(modifiers_input));
        let numAutos = modifiers.numAuto || modifiers?.numAuto === 0 ? modifiers.numAuto : 1;
        if (plant.ID === 5) {
            let x = 0;
        }

        plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * modifiers.shopGrowingSpeed) / modifiers.petPlantCombo / modifiers.contagionPlantGrowth);
        if (plant.growthTime < 10) {
            plant.growthTime = 10;
        }
        plant.reqExp = 10 + 5 * plant.Rank * Math.pow(1.05, plant.Rank);
        let remExp = plant.reqExp - plant.curExp;
        let expBonus = plant.prestigeBonus * modifiers.expBonus * numAutos;

        plant.timeToLevel = (remExp / expBonus) * plant.growthTime;
        return plant;
    }
    const calcPerHarvest = function (plant) {
        return roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige)
    }
    const calcHPProd = function (plants_input, modifiers_input) {
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
                let res = calcFutureMult(curr, { ...modifiers, time: 1, numAuto: numAutos[j] });
                plants[j] = res;
            }
            console.log(plants[0].production)
            totalPotatoes += plants[0].production;
        }
        // console.log(`plant 2 final prod: ${plants[1].production}`)
        return { totalPotatoes: totalPotatoes, potatoeProduction: plants[0].production };
    }

    try {
        let finalPlants = data.finalPlants;
        let modifiers = data.modifiers;
        const secondsHour = 3600;
        let futureTime = data.time;
        // let totalNumAutos = data.FarmingShopAutoPlotBought;
        // let numPlants = finalPlants.length;
        let combinations = data.combinations;


        let totalPot = 0;
        let totalPotCombo = {};
        let bestProd = 0;
        let bestProdCombo = {};

        for (let i = data.start; i <= data.end; i++) {
            // console.log(`calculating loop: ${i} / ${combinations.length} <------> ${data.start}  == ${data.end}`);
            let combo = combinations[i];
            let tempPlants = [];

            let result = helper.calcHPProd(finalPlants, { ...modifiers, numAutos: combo, time: secondsHour * futureTime })


            if (result.totalPotatoes > totalPot) {
                totalPot = result.totalPotatoes;
                totalPotCombo = { combo: combo, result: result, plants: result.plants }
            }
            if (result.potatoeProduction > bestProd) {
                bestProd = result.potatoeProduction;
                bestProdCombo = { combo: combo, result: result, plants: result.plants }
            }

            // eslint-disable-next-line no-restricted-globals
            self.postMessage({
                update: true
            })
        }

        // eslint-disable-next-line no-restricted-globals
        self.postMessage({
            success: true,
            totalPotCombo: totalPotCombo,
            bestProdCombo: bestProdCombo
        })
    }
    catch (err) {
        console.log(err);
    }


}