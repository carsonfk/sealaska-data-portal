import React, {useState, useEffect, useRef} from "react";
//import { getTimestampAK } from "../functions";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';




export default function Stats({locations, projects, lands, roads, mode, target}){
    const [chartData, setChartData] = useState(null);
    const [monthsAggregated, setMonthsAggregated] = useState(null);
    const [areaAggregated, setAreaAggregated] = useState(null);

    const months = ['Jan', 'Feb', 'Mar', 'Apr',
                    'May', 'Jun', 'Jul', 'Aug',
                    'Sep', 'Oct', 'Nov', 'Dec'];

    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

    useEffect(() => {
        if (mode) {
            console.log(mode);
        }
    }, [mode]);

    useEffect(() => {
        if (locations) {
            console.log('hi!');
            let properties = locations.map(locations => locations.properties);
            let aggregated = properties.reduce((acc, item) => {
                let temp = months[item.timestamp.date.split('/')[0] - 1]
                if (acc[temp]) {
                    acc[temp]++;
                } else {
                    acc[temp] = 1;
                }
                return acc;
            }, {});
            setMonthsAggregated(aggregated);
        }
    }, [locations])

    useEffect(() => {
        if (lands) {
            let properties = lands.map(land => land.properties);
            for (let i = 0; i < properties.length; i++) {
                if (properties[i].OwnCategor === 'Native Allotme*') {
                    properties[i].OwnCategor = "Private";
                }
            }
            let aggregated = properties.reduce((acc, item) => {
                acc[item.OwnCategor] = (acc[item.OwnCategor] || 0) + Math.floor(item.AreaAcres);
                return acc;
            }, {});
            setAreaAggregated(aggregated);
        }
    }, [lands])

    useEffect(() => {
    // Example: Fetch data from a custom API
        if (target.name === 'posts') {
            setChartData({
                labels : months,
                datasets: [
                    {
                    label: '# of Posts',
                    data: monthsAggregated,
                    backgroundColor: 'rgb(75, 192, 192)',
                    }
                ]
            });
        } else if (target.name === 'projects') {

        } else if (target.name === 'lands') {
            setChartData({
                labels: [],
                datasets: [
                    {
                    label: 'Area (Acres)',
                    data: areaAggregated,
                    backgroundColor: ['rgb(250, 100, 100)',
                                      'rgb(200, 100, 250)',
                                      'rgb(255, 255, 255)',
                                      'rgb(100, 250, 100)',
                                      'rgb(250, 250, 100)',
                                      'rgb(100, 150, 250)']
                    }
                ]
            });

            //add pie chart for native land ownership pcts
        } else if (target.name === 'roads') {

        } else if (target.name === 'none') {
            setChartData(null);
        }
    }, [target, monthsAggregated, areaAggregated]);


    if (!chartData) return <p>Return to View mode for statistics</p>;
    
    return (
        <>
        <p>Statistics</p>
        <Bar data={chartData}/>
        </>
    )
}