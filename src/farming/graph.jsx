import helper from '../util/helper.js';
import mathHelper from '../util/math.js';
import { memo } from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
function Graph({
    graphObjects,
    yScale,
    expDiff,
    showCalc,
    bestPic,
    displayPicPerc
}) {

    return (
        <ResponsiveContainer width="100%" height="100%"  >
            <LineChart
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="time"
                    xAxisId="mainTime"
                    name="time in seconds"
                    tickFormatter={(e, index) => {
                        return (helper.secondsToString(e));
                    }}
                    minTickGap={7}
                />

                <YAxis
                    yAxisId="potatoes"
                    scale={yScale}
                    domain={['auto', 'auto']}
                    tickFormatter={(e, index, payload) => {
                        let temp = mathHelper.createDecimal(e);
                        temp.exponent += expDiff;
                        return temp.toPrecision(3).toString();
                    }}
                    width={95}
                >

                    <Label
                        value="Total HP Made"
                        position="insideLeft"
                        angle={-90}
                        style={{ textAnchor: 'middle' }}
                    />

                </YAxis >
                {/*<YAxis yAxisId="fries" orientation="right" />*/}
                <Tooltip
                    formatter={(value, name, props) => {
                        return [props.payload.originalProduction.toPrecision(3).toString(), name];
                    }}
                    labelFormatter={(label, payload) => {
                        return helper.secondsToString(label);
                    }}

                />
                <Legend />

                {showCalc && (
                    <>

                        {/* <Line
                        type="monotone"
                        xAxisId={"mainTime"}
                        yAxisId="potatoes"
                        dataKey="value2"
                        name={`Top ${1} production`}
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                    />
                    <Line
                        type="monotone"
                        xAxisId={"mainTime"}
                        yAxisId="potatoes"
                        dataKey="value11"
                        name={`Top ${10} production`}
                        stroke="red"
                        activeDot={{ r: 8 }}
            /> */}


                        {/* {calcStep && ( */}
                        <>
                            {bestPic > 0 && (
                                <>
                                    <XAxis dataKey="time" hide={true} xAxisId={"bestPIC"} name="time in seconds" />
                                    <Line
                                        type="monotone"
                                        xAxisId={"bestPIC"}
                                        // xAxisId={"mainTime"}
                                        yAxisId="potatoes"
                                        data={graphObjects.bestPic}
                                        dataKey="production"
                                        // dataKey="value2"
                                        name={`Most PIC`}
                                        stroke="orange"
                                        activeDot={{ r: 8 }}
                                    />
                                </>
                            )}
                            {displayPicPerc && (
                                <>
                                    <XAxis dataKey="time" hide={true} xAxisId={"bestPICPerc"} name="time in seconds" />
                                    <Line
                                        type="monotone"
                                        xAxisId={"bestPICPerc"}
                                        // xAxisId={"mainTime"}
                                        yAxisId="potatoes"
                                        data={graphObjects.bestPicPerc}
                                        dataKey="production"
                                        // dataKey="value2"
                                        name={`Most PIC %`}
                                        // stroke="#8884d8"
                                        stroke="red"
                                        activeDot={{ r: 8 }}
                                    />
                                </>
                            )}
                        </>
                        {/* )} */}

                        {graphObjects.top10Potatoes.map((val, index) => {
                            if (index > 0) return;
                            return (<XAxis key={`xAxis${index}`} dataKey="time" hide={true} xAxisId={"potatoXAxis" + index} name="time in seconds" />)
                        })
                        }

                        {graphObjects.top10Potatoes.map((val, index) => {
                            if (index > 0) return;
                            return (
                                <Line
                                    key={`line${index}`}
                                    type="monotone"
                                    xAxisId={"potatoXAxis" + index}
                                    // xAxisId={"mainTime"}
                                    yAxisId="potatoes"
                                    data={val.data}
                                    dataKey="production"
                                    // dataKey="value2"
                                    name={`Top ${index + 1} production`}
                                    stroke="#8884d8"
                                    activeDot={{ r: 8 }}
                                />
                            )
                        })
                        }
                    </>
                )}

                <Line
                    type="monotone"
                    xAxisId="mainTime"
                    yAxisId="potatoes"
                    data={graphObjects.customProduction.dataPointsPotatoes}
                    dataKey="production"
                    // dataKey="custom"
                    name="Currently selected production"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                />
                {/* {customLines.length > 0 && (
                customLines.map((e, index) => {
                    return (
                        <Line
                            type="monotone"
                            xAxisId="mainTime"
                            yAxisId="potatoes"
                            data={e}
                            dataKey="production"
                            name={`Custom Line ${index}`}
                            stroke="#8884d8"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                        />
                    )
                })
            )} *
{/*bestPlantCombo.top10DataPointsPotatoes.map((val, index) => {
                    return (<XAxis dataKey="time" hide={true} xAxisId={"fryXAxis" + index} name="time in seconds"/>)})
                }
                {bestPlantCombo.top10DataPointsFries.map((val, index) => {
                    return (
                        <Line
                            type="monotone"
                            xAxisId={"fryXAxis" + index}
                            yAxisId="fries"
                            data={val.data}
                            dataKey="fries"
                            name={`Top ${index + 1} fries`}
                            stroke="#82ca9d"
                            activeDot={{ r: 5 }}
                        />
                    )})
                    */}
            </LineChart>
        </ResponsiveContainer>
    )
}
export default memo(Graph, function (prev, current) {

    let isEqual = true;

    //to avoid checking every single datapoint, we can be a bit smarter
    //if the graph was recalulcated, or calculating, update graph
    if (prev.showCalc !== current.showCalc) return false

    //Otherwise, if the user's total potatoes changed (meaning they updated something else) update graph
    else if (prev.graphObjects.customProduction.totalPotatoes.toNumber() !== current.graphObjects.customProduction.totalPotatoes.toNumber()) return false;
    //or if the y-axis scale is changed
    else if (prev.yScale !== current.yScale) return false;
    return isEqual;
});