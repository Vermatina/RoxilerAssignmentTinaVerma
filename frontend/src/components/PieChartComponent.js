import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PieChartComponent = ({ month }) => {
    const [data, setData] = useState([]);

    const fetchPieChartData = async () => {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/pie-chart`, {
            params: { month }
        });
        setData(data);
    };

    useEffect(() => {
        fetchPieChartData();
    }, [month]);

    return (
        <PieChart width={400} height={400}>
            <Pie
                data={data}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
        </PieChart>
    );
};

export default PieChartComponent;
