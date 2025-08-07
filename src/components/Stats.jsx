import React, {useState, useEffect, useRef} from "react";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';



export default function Stats({locations, projects, lands, roads, mode, target}){
    const [chartData, setChartData] = useState(null);

    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

    useEffect(() => {
        if (mode) {
            console.log(mode);
        }
    }, [mode]);


    useEffect(() => {

    }, [locations])

    useEffect(() => {
    // Example: Fetch data from a custom API
        if (target.name === 'posts') {
            setChartData({
                labels : ['Red', 'Blue', 'Yellow', 'Green'],
                datasets: [
                    {
                    label: 'Data - Posts',
                    data: locations,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    }
                ]
            });
        } else if (target.name === 'projects') {

        } else if (target.name === 'lands') {
            setChartData({
                labels : ['Red', 'Blue', 'Yellow', 'Green'],
                datasets: [
                    {
                    label: 'Data - Lands',
                    data: lands,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    }
                ]
            });
        } else if (target.name === 'roads') {

        } else if (target.name === 'none') {
            setChartData(null);
        }
    }, [target]);


    if (!chartData) return <p>Statistics</p>;
    
    return (
        <>
        <p>Statistics</p>
        <Bar data={chartData} />
        </>
    )
}