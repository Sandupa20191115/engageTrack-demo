import React from "react";
import {ResponsiveLine} from "@nivo/line";
import {Typography, useTheme} from "@mui/material";
import {tokens} from "../theme";

const calculateTickValues = (data) => {
    const maxTicks = 5; // Maximum number of ticks you want to display
    const interval = Math.ceil(data.length / maxTicks); // Calculate interval
    return data.reduce((acc, _, index) => {
        if (index % interval === 0) acc.push(index); // Add tick value every 'interval' data points
        return acc;
    }, []);
};

const LineChartCustom = ({ data, isCustomLineColors = false, isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Convert the provided data array to fit the required structure for the line chart
    const chartData = [
        {
            id: "line",
            color: colors.greenAccent[500],
            data: data.map((value, index) => ({ x: index, y: value })),
        },
    ];

    return (
        <ResponsiveLine
            data={chartData}
            theme={{
                axis: {
                    domain: {
                        line: {
                            stroke: colors.grey[100],
                        },
                    },
                    legend: {
                        text: {
                            fill: colors.grey[100],
                            fontSize: "125%",
                            marginBottom: 10
                        },
                    },
                    ticks: {
                        line: {
                            stroke: colors.grey[100],
                            strokeWidth: 1,
                        },
                        text: {
                            fill: colors.grey[100],
                            fontSize: "125%",
                        },
                    },
                },
                legends: {
                    text: {
                        fill: colors.greenAccent[100],
                    },
                },
                tooltip: {
                    container: {
                        color: colors.greenAccent[500],
                    },
                },
            }}
            margin={{ top: 50, right: 110, bottom: 60, left: 70 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: 1, stacked: false, reverse: false ,clamp:true}}
            yFormat=" >-.2f"
            axisBottom={{
                orient: "bottom",
                tickSize: 0,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : "Set of Frames",
                legendOffset: data === [] ? 25 : 35,
                legendPosition: "middle",
                tickValues : calculateTickValues(data),
            }}
            axisLeft={{
                orient: "left",
                tickValues: [0, 0.25, 0.5, 0.75, 1], // Adjust as needed
                tickSize: 3,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : "Engagement Level",
                legendOffset: -60,
                legendPosition: "middle",
            }}
            enableGridX={false}
            enableGridY={false}
            enablePoints={false}
            // useMesh={true}
            legends={[
                {
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: "left-to-right",
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 15,
                    symbolShape: "circle",
                    symbolBorderColor: "rgba(0, 0, 0, .5)",
                    effects: [
                        {
                            on: "hover",
                            style: {
                                itemBackground: "rgba(0, 0, 0, .03)",
                                itemOpacity: 1,
                            },
                        },
                    ],
                    itemTextColor: colors.grey[500], // Set text color
                    itemComponent: ({ text }) => (
                        <Typography variant="h4" color={colors.grey[500]}>
                            {text}
                        </Typography>
                    ),
                },
            ]}
        />
    );
};

export default LineChartCustom;
