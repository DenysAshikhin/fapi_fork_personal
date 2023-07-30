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
    calcFutureMult: function (plant_input, modifiers_input) {

        let plant = JSON.parse(JSON.stringify(plant_input));
        let modifiers = JSON.parse(JSON.stringify(modifiers_input));
        let remainingTime = modifiers.time;
        let numAutos = modifiers.numAuto ? modifiers.numAuto : 1;

        while (remainingTime > 0) {
            plant.growthTime = Math.floor(plant.TimeNeeded / plant.prestigeBonus / (1 + 0.05 * modifiers.shopGrowingSpeed) / modifiers.petPlantCombo);
            if (plant.growthTime < 10) {
                plant.growthTime = 10;
            }
            plant.reqExp = 10 + 5 * plant.Rank * Math.pow(1.05, plant.Rank)
            plant.timeToLevel = (plant.reqExp - plant.curExp) / (plant.prestigeBonus * modifiers.shopRankEXP * modifiers.contagionPlantEXP * numAutos) * plant.growthTime;

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
            plant.perHarvest = this.roundInt((1 + plant.Rank) * Math.pow(1.05, plant.Rank)) * Math.pow(1.02, plant.prestige);
            let toCreate = plant.perHarvest * (elapsedTime / plant.growthTime) * numAutos;
            plant.futureMult = Math.pow(
                (1 + 0.05 * (1 + modifiers.manualHarvestFormula * 0.02)),
                this.calculateLogarithm(1.25, plant.created + toCreate)
            );
            plant.created += toCreate;

            if (rankIncrease) {
                plant.Rank++;
                plant.curExp = 0;
                rankIncrease = false;
            }
        }
        return plant;
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