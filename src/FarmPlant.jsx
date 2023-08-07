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
    let fake = data.fake;
    let plantAutos = data.plantAutos;
    let setPlantAutos = data.setPlantAutos

    if (plantAutos && modifiers?.numAuto) {
        modifiers.numAuto = plantAutos[index]
    }

    if (fake) {
        plant = { created: 1 };
        customMultipliers = []
        index = 0;
        useFutureValues = true;
    }

    let plantTitle = `P${index + 1}`;
    let harvestTime = `${helper.secondsToStringWithS(plant.growthTime)}`;
    let harvestAmount = `${helper.roundTwoDecimal(plant.perHarvest)}`;
    let totalHarvest = `${plant.created.toExponential(3)}`;
    let outMult = `x ${helper.roundTwoDecimal(useFutureValues ? plant.futureMult : plant.currMult)}`;
    let pic = `${plant.prestige}`;
    let picTime = useFutureValues && !fake ? `${helper.secondsToString(helper.calcTimeTillPrestige(plant, modifiers))}` : ``;
    let rank = `${plant.Rank}`;
    let rankTime = `${useFutureValues && !fake ?
        helper.secondsToString(helper.calcTimeTillLevel(plant, modifiers).timeToLevel) :
        helper.secondsToString(plant.timeToLevel)}`;
    let futureMult = `(${helper.roundTwoDecimal(useFutureValues ? plant.futureMult * (customMultipliers[index]) : plant.currMult * (customMultipliers[index]))})`;

    if (fake) {
        plantTitle = `Plant`;
        harvestTime = `Harvest Time`;
        harvestAmount = `Harvest Amount`;
        totalHarvest = `Total Harvested`;
        outMult = `Output Multiplier`;
        pic = `PIC Level`;
        picTime = useFutureValues ? `Time to hit PIC level + 'Hours to calculate'` : ``;
        rank = `Rank`;
        rankTime = `Time to Rank`;
        futureMult = `'Custom Weight' (Base Mult. * 'Custom Weight')`;
    }



    return <div style={{
        border: '1px solid black', margin: '6px',
        padding: '0 0 0 0',
        display: 'flex',
        height: fake ? '234px' : useFutureValues ? '224px' : '200px',
        width: fake ? '264px' : ''
        // maxHeight:'128px' 
    }}>
        <div style={{ height: '214px', width: '214px', position: 'relative' }}>
            <img style={{ height: '214px', width: '214px', position: 'absolute', bottom: '0', left: '0', zIndex: '-1' }} src={`/fapi_fork_personal/farming/plants/P${index + 1}.png`} />


            <div style={{ background: 'black', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', padding: '0 1px 0 1px', color: 'white', top: '0%', left: fake ? `35%` : '43%', display: 'flex', position: 'absolute' }}>
                {plantTitle}
            </div>

            <div style={{ background: 'black', borderRadius: '6px', fontSize: '12px', padding: '0 1px 0 1px', color: 'white', top: '12%', left: '2%', display: 'flex', position: 'absolute' }}>
                {harvestTime}
            </div>


            <div style={{ background: 'black', borderRadius: '6px', padding: '0 1px 0 1px', color: 'white', top: '1%', right: '1%', display: 'flex', position: 'absolute' }}>
                <MouseOverPopover tooltip={
                    <div>
                        <div>Harvest Amount</div>
                    </div>
                }>
                    <div style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
                        {harvestAmount}
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
                        {totalHarvest}
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
                        {outMult}
                    </div>
                </MouseOverPopover>
            </div>


            {/* Rank */}
            <div style={{ fontSize: '12px', padding: '0 1px 0 1px', color: 'white', bottom: '18%', left: '25%', display: 'flex', position: 'absolute' }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ background: 'black', borderRadius: '6px', padding: '0 3px 0 3px' }}>
                        {rank}
                    </div>
                    <img
                        style={{ height: '16px', width: '24px', zIndex: '-1' }}
                        src={`/fapi_fork_personal/up_arrow.svg`}
                    />
                    <div style={{ background: 'black', borderRadius: '6px', fontSize: '12px', padding: '0 1px 0 1px', color: 'white', display: 'flex', padding: '0 3px 0 3px' }}>
                        {rankTime}
                    </div>
                </div>
            </div>

            {/* PIC */}
            <div style={{ fontSize: '12px', padding: '0 1px 0 1px', color: 'white', bottom: '30%', left: fake ? '10%' : '14.9%', display: 'flex', position: 'absolute' }}>
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
                                {pic}
                            </div>
                        </div>
                    </MouseOverPopover>

                    {useFutureValues && (
                        <MouseOverPopover tooltip={
                            <div>
                                <div>Time to reach next PIC threshold (after your `hours to calculate` above)</div>
                            </div>
                        }>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img
                                    style={{ height: '16px', width: '16px', zIndex: '-1' }}
                                    src={`/fapi_fork_personal/up_arrow_yellow.svg`}
                                />
                                <div style={{ background: 'black', borderRadius: '6px', fontSize: '12px', padding: '0 1px 0 1px', color: 'white', display: 'flex', padding: '0 3px 0 3px' }}>
                                    {picTime}
                                </div>
                            </div>
                        </MouseOverPopover>

                    )}

                </div>
            </div>

            {/* Weight */}
            <div style={{ fontSize: '12px', marginTop: '0px', height: '12px', padding: '0 1px 0 1px', color: 'black', bottom: fake ? '7%' : '7%', left: '1%', display: 'flex', position: 'absolute' }}>
                <div style={{
                    display: 'flex',
                    alignItems: fake ? '' : 'center',
                    fontSize: '12px', fontFamily: 'sans-serif'
                }}>
                    <MouseOverPopover tooltip={
                        <div>
                            <div>Used to give more weight to this plant for the (Total Mult Additive) and `Weighted Mult Increase`</div>
                        </div>
                    }>
                        <div style={{ width: fake ? '66px' : '' }}>{`Weight: x`}</div>
                    </MouseOverPopover>


                    {allowSetMultipliers && (<input id='prepFormInput'
                        style={{
                            width: fake ? '128px' : '48px',
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
                                        action: `changed_plant_${index}_weight`,
                                        label: `${x}`,
                                        value: x
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
                        <div style={{ width: fake ? '164px' : '' }}>
                            {futureMult}
                        </div>
                    </MouseOverPopover>

                </div>
            </div>

            {/* Num Auto */}
            {!fake && useFutureValues && (
                <div style={{ fontSize: '12px', marginTop: '0px', height: '12px', padding: '0 1px 0 1px', color: 'black', bottom: fake ? '7%' : '-2%', left: '1%', display: 'flex', position: 'absolute' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: fake ? '' : 'center',
                        fontSize: '12px', fontFamily: 'sans-serif'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <MouseOverPopover tooltip={
                                <div>
                                    How many autos will be running for this plant for `Hours to calculate` duration
                                </div>
                            }>
                                <div>Num Autos</div>

                            </MouseOverPopover>

                            <input
                                style={{
                                    // width: '48px'
                                    // , WebkitAppearance: 'none' 
                                    height: '12px'
                                }}
                                type='number'
                                className='prepNumber'
                                value={plantAutos[index]}
                                onChange={
                                    (e) => {
                                        try {
                                            let x = Number(e.target.value);
                                            x = Math.floor(x);
                                            if (x < 0 || x > 8) {
                                                return;
                                            }

                                            let newArr = [...plantAutos];
                                            newArr[index] = x;

                                            ReactGA.event({
                                                category: "farming_interaction",
                                                action: `changed_plant_${index}_auto`,
                                                label: `${x}`,
                                                value: x
                                            })
                                            setPlantAutos(newArr);
                                        }
                                        catch (err) {
                                            console.log(err);
                                        }
                                    }}
                                placeholder={plantAutos[index] + ''}
                                min="0"
                                max="8"
                            />
                        </div>

                    </div>
                </div>
            )}


        </div>
    </div >
}


export default FarmingPlant;