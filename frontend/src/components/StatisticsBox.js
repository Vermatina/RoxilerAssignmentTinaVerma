import React, { useState, useEffect } from 'react';
import axios from 'axios';


const StatisticsBox = ({ month }) => {
    const [statistics, setStatistics] = useState({ totalSales: 0, soldItems: 0, unsoldItems: 0 });

    const fetchStatistics = async () => {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/statistics`, {
            params: { month }
        });
        setStatistics(data);
    };

    useEffect(() => {
        fetchStatistics();
    }, [month]);

    return (
        <div className="statistics-box">
            <div>Total Sales: ${statistics.totalSales}</div>
            <div>Sold Items: {statistics.soldItems}</div>
            <div>Unsold Items: {statistics.unsoldItems}</div>
        </div>
    );
};

export default StatisticsBox;
