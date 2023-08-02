import helper from "./util/helper.js"
import MouseOverPopover from "./tooltip";
import ReactGA from "react-ga4";

const FarmingPlant = ({ data }) => {
    let plant = data.plant;
    let index = data.index;
    let customMultipliers = data.customMultipliers;
    let setCustomMultipliers = data.setCustomMultipliers;
    let allowSetMultipliers = data.allowSetMultipliers;
    let useFutureValues = data.useFutureValues;
    let modifiers = data.modifiers;

    return <div style={{
        border: '1px solid black', margin: '6px',
        padding: '0 0 0 0',
        display: 'flex',
        height: '200px'
        // width: '360px'
        // maxHeight:'128px' 
    }}>
        <div style={{ height: '214px', width: '214px', position: 'relative' }}>
            <img style={{ height: '214px', width: '214px', position: 'absolute', bottom: '0', left: '0', zIndex: '-1' }} src={`/fapi_fork_personal/farming/plants/P${index + 1}.png`} />


            <div style={{ background: 'black', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', padding: '0 1px 0 1px', color: 'white', top: '0%', left: '43%', display: 'flex', position: 'absolute' }}>
                {`P${index + 1}`}
            </div>

            <div style={{ background: 'black', borderRadius: '6px', fontSize: '12px', padding: '0 1px 0 1px', color: 'white', top: '12%', left: '2%', display: 'flex', position: 'absolute' }}>
                {`${plant.growthTime}s`}
            </div>


            <div style={{ background: 'black', borderRadius: '6px', padding: '0 1px 0 1px', color: 'white', top: '1%', right: '1%', display: 'flex', position: 'absolute' }}>
                <MouseOverPopover tooltip={
                    <div>
                        <div>Harvest Amount</div>
                    </div>
                }>
                    <div style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
                        {`${helper.roundTwoDecimal(plant.perHarvest)}`}
                    </div>
                </MouseOverPopover>
            </div>
            <div style={{ background: 'black', borderRadius: '6px', fontSize: '12px', padding: '0 1px 0 1px', color: 'white', top: '10%', right: '1%', display: 'flex', position: 'absolute' }}>

                <MouseOverPopover tooltip={
                    <div>
                        <div>Total Harvest</div>
                    </div>
                }>
                    <div style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
                        {`${plant.created.toExponential(3)}`}
                    </div>
                </MouseOverPopover>
            </div>


            <div style={{ background: 'black', borderRadius: '6px', fontSize: '12px', padding: '0 1px 0 1px', color: 'white', top: '20%', right: '3%', display: 'flex', position: 'absolute' }}>

                <MouseOverPopover tooltip={
                    <div>
                        <div>Output multiplier</div>
                    </div>
                }>
                    <div style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
                        {`x ${helper.roundTwoDecimal(useFutureValues ? plant.futureMult : plant.currMult)}`}
                    </div>
                </MouseOverPopover>
            </div>


            <div style={{ fontSize: '12px', padding: '0 1px 0 1px', color: 'white', bottom: '18%', left: '25%', display: 'flex', position: 'absolute' }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ background: 'black', borderRadius: '6px', padding: '0 3px 0 3px' }}>
                        {`${plant.Rank}`}
                    </div>
                    <img
                        style={{ height: '16px', width: '24px', zIndex: '-1' }}
                        src={`/fapi_fork_personal/up_arrow.svg`}
                    />
                    <div style={{ background: 'black', borderRadius: '6px', fontSize: '12px', padding: '0 1px 0 1px', color: 'white', display: 'flex', padding: '0 3px 0 3px' }}>
                        {`${useFutureValues ? helper.roundTwoDecimal(helper.calcTimeTillLevel(plant, modifiers).timeToLevel / 60) : helper.roundTwoDecimal(plant.timeToLevel / 60)} min`}
                    </div>
                </div>
            </div>

            <div style={{ fontSize: '12px', padding: '0 1px 0 1px', color: 'white', bottom: '30%', left: '14.9%', display: 'flex', position: 'absolute' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MouseOverPopover tooltip={
                        <div>
                            <div>PIC Level</div>
                        </div>
                    }>
                        <div style={{ display: 'flex', alignItems: 'center' }}>

                            <img
                                style={{
                                    height: '16px', width: '16px', zIndex: '-1'
                                }}
                                src={`/fapi_fork_personal/farming/prestige_star.png`}
                            />
                            <div style={{ background: 'black', borderRadius: '6px', padding: '0 3px 0 3px' }}>
                                {`${plant.prestige}`}
                            </div>
                        </div>
                    </MouseOverPopover>

                    {useFutureValues && (
                        <MouseOverPopover tooltip={
                            <div>
                                <div>Time to reach next PIC threshold</div>
                            </div>
                        }>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img
                                    style={{ height: '16px', width: '16px', zIndex: '-1' }}
                                    src={`/fapi_fork_personal/up_arrow_yellow.svg`}
                                />
                                <div style={{ background: 'black', borderRadius: '6px', fontSize: '12px', padding: '0 1px 0 1px', color: 'white', display: 'flex', padding: '0 3px 0 3px' }}>
                                    {`${helper.roundThreeDecimal(helper.calcTimeTillPrestige(plant, modifiers) / 3600)} hours`}
                                </div>
                            </div>
                        </MouseOverPopover>

                    )}

                </div>
            </div>

            <div style={{ fontSize: '12px', marginTop: '0px', height: '12px', padding: '0 1px 0 1px', color: 'black', bottom: '7%', left: '1%', display: 'flex', position: 'absolute' }}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontFamily: 'sans-serif' }}>
                    <MouseOverPopover tooltip={
                        <div>
                            <div>Used to give more weight to this plant for the (Total Mult Additive) and `Weighted Mult Increase`</div>
                        </div>
                    }>
                        <div>{`Weight: x`}</div>
                    </MouseOverPopover>


                    {allowSetMultipliers && (<input id='prepFormInput'
                        style={{
                            width: '48px',
                            height: '10px',
                            display: 'flex',
                            alignContent: 'center'
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

                                    ReactGA.event({
                                        category: "farming_interaction",
                                        action: `changed_plantWeight_${x}`,
                                        label: `${x}`
                                    })
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


                    <MouseOverPopover tooltip={
                        <div>
                            <div>Used to give more weight to this plant for the (Total Mult Additive) and `Weighted Mult Increase`</div>
                        </div>
                    }>
                        <div> {`(${helper.roundTwoDecimal(useFutureValues ? plant.futureMult * (customMultipliers[index]) : plant.currMult * (customMultipliers[index]))})`}</div>
                    </MouseOverPopover>

                </div>
            </div>
        </div>
    </div>
}


export default FarmingPlant;