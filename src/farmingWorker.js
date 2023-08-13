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
        let dataObj = { ...modifiers, time: secondsHour * futureTime };

        for (let i = data.start; i <= data.end; i++) {
            // console.log(`calculating loop: ${i} / ${combinations.length} <------> ${data.start}  == ${data.end}`);
            let combo = combinations[i];
            dataObj.numAutos = combo;

            let result = helper.calcHPProd(finalPlants, dataObj);


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