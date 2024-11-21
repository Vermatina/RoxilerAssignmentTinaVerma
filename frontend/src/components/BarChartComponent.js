import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const BarChartComponent = ({ month }) => {
    const [data, setData] = useState([]);

    const fetchBarChartData = async () => {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/bar-chart`, {
            params: { month }
        });
        setData(data);
    };

    useEffect(() => {
        fetchBarChartData();
    }, [month]);

    return (
        <BarChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
    );
};

export default BarChartComponent;
