import helper from "./util/helper.js"



const FarmingPlant = ({ data }) => {
    let plant = data.plant;
    let index = data.index;
    let customMultipliers = data.customMultipliers;
    let setCustomMultipliers = data.setCustomMultipliers;
    let allowSetMultipliers = data.allowSetMultipliers;
    let useFutureValues = data.useFutureValues;

    return <div style={{
        border: '1px solid black', margin: '6px', padding: '6px', display: 'flex',
        // maxHeight:'128px' 
    }}>
        <div style={{ zIndex: '-1' }}>
            <img style={{ height: '100%', width: '100%' }} src={`/fapi_fork_personal/plants/t${index}_plant.png`} />
        </div>

        <div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div >{`Rank ${plant.Rank}`}</div>
                <div>{`Prestige: ${plant.prestige} (x${helper.roundTwoDecimal(plant.prestigeBonus)})`}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>{`Growth ${plant.growthTime}s`}</div>
                <div>{`Level Up: ${helper.roundTwoDecimal(plant.timeToLevel / 60)} min`}</div>
            </div>
         

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>{`Harvest ${helper.roundTwoDecimal(plant.perHarvest)}`}</div>
                <div>{`Harvested: ${plant.created.toExponential(3)}`}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div
                // style={{ marginRight: 'clamp(6px, 8px, 12px)' }}
                >
                    {`Multiplier: ${helper.roundTwoDecimal(useFutureValues ? plant.futureMult : plant.currMult)}`}
                </div>
            </div>
            <div style={{ display: 'flex' }}>
                <div>{`My modifier: x`}</div>
                {allowSetMultipliers && (<input id='prepFormInput'
                    style={{
                        width: '48px'
                        // , WebkitAppearance: 'none' 
                    }}
                    step={`0.01`}
                    type='number'
                    className='prepNumber'
                    value={customMultipliers[index]}
                    onChange={
                        (e) => {
                            try {
                                let x = Number(e.target.value);
                                // x = Math.floor(x);
                                if (x < 0.0001 || x > 99999999) {
                                    return;
                                }
                                let newArr = [...customMultipliers];
                                newArr[index] = x;
                                setCustomMultipliers(newArr);

                            }
                            catch (err) {
                                console.log(err);
                            }
                            // console.log(`pressed: ${e.target.value}`)

                        }}
                    placeholder={customMultipliers[index] + ''}
                    min="0.0001"
                    max="99999999"
                />)}
                <div> {`(${helper.roundTwoDecimal(plant.currMult * (customMultipliers[index]))})`}</div></div>

        </div>
    </div>
}


export default FarmingPlant;