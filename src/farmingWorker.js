import helper from './util/farmingHelper.js';



// eslint-disable-next-line no-restricted-globals
self.onmessage = ({ data: { data, id, data1 } }) => {

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
        let bestPIC = 0;
        let bestPicCombo = { potatoeProduction: 0 };
        let bestPICPerc = 0;
        let bestPICPercCombo = { potatoeProduction: 0 }
        let dataObj = { ...modifiers, time: secondsHour * futureTime };

        let top10DataPointsPotatoes = [];
        let top10DataPointsFries = [];

        for (let i = data.start; i <= data.end; i++) {
            // console.log(`calculating loop: ${i} / ${combinations.length} <------> ${data.start}  == ${data.end}`);
            let combo = combinations[i];
            dataObj.numAutos = combo;

            let result = helper.calcHPProd(finalPlants, dataObj);

            let picGained = 0;
            let picPercent = 0;

            for (let j = 0; j < result.plants.length; j++) {
                let picIncrease = helper.calcMaxPrestige(result.plants[j]);
                picGained += picIncrease;
                picPercent += (Math.pow(1.02, result.plants[j].prestige + picIncrease) - Math.pow(1.02, result.plants[j].prestige));
                result.plants[j].picIncrease = picIncrease;
            }

            if (result.totalPotatoes > totalPot) {
                totalPot = result.totalPotatoes;
                totalPotCombo = { combo: combo, result: result, plants: result.plants }
            }
            if (result.potatoeProduction > bestProd) {
                bestProd = result.potatoeProduction;
                bestProdCombo = { combo: combo, result: result, plants: result.plants }

                top10DataPointsPotatoes.unshift({ data: result.dataPointsPotatoes, result: bestProd });
                if(top10DataPointsPotatoes.length > 10) {
                    top10DataPointsPotatoes.pop();
                }
                top10DataPointsFries.unshift({ data: result.dataPointsFries, result: bestProd });
                if(top10DataPointsFries.length > 10) {
                    top10DataPointsFries.pop();
                }
            }

            if (picGained > bestPIC) {
                let temp = { combo: combo, result: result, plants: result.plants, potatoeProduction: result.potatoeProduction, picGain: picGained, picStats: { picLevel: picGained, picPercent: picPercent } };
                bestPIC = picGained;
                bestPicCombo = temp;
            }
            else if (picGained === bestPIC) {
                if (result.potatoeProduction > bestPicCombo.potatoeProduction) {
                    let temp = { combo: combo, result: result, plants: result.plants, potatoeProduction: result.potatoeProduction, picGain: picGained, picStats: { picLevel: picGained, picPercent: picPercent } };
                    bestPIC = picGained;
                    bestPicCombo = temp;
                }
            }
            if (picPercent > bestPICPerc) {
                let temp = { combo: combo, result: result, plants: result.plants, potatoeProduction: result.potatoeProduction, picGain: picPercent, picStats: { picLevel: picGained, picPercent: picPercent } };

                bestPICPerc = picPercent;
                bestPICPercCombo = temp;
            }
            else if (picPercent === bestPICPerc) {
                if (result.potatoeProduction > bestPICPercCombo.potatoeProduction) {
                    let temp = { combo: combo, result: result, plants: result.plants, potatoeProduction: result.potatoeProduction, picGain: picPercent, picStats: { picLevel: picGained, picPercent: picPercent } };

                    bestPICPerc = picPercent;
                    bestPICPercCombo = temp;
                }
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
            bestProdCombo: bestProdCombo,
            bestPicCombo: bestPicCombo,
            bestPICPercCombo: bestPICPercCombo,
            top10DataPointsPotatoes: top10DataPointsPotatoes,
            top10DataPointsFries: top10DataPointsFries
        })
    }
    catch (err) {
        console.log(err);
    }
}