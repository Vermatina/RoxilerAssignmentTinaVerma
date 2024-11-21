require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const ProductTransaction = require('./models/ProductTransaction');

const app = express();
app.use(cors());
app.use(bodyParser.json());




mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));


// API 1: Initialize Database
app.post('/api/init-database', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = response.data;

        await ProductTransaction.deleteMany(); // Clear existing data
        await ProductTransaction.insertMany(data);

        res.status(200).json({ message: 'Database initialized successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// API 2: List Transactions
app.get('/api/transactions', async (req, res) => {
    const { month, search = '', page = 1, perPage = 10 } = req.query;
    const monthIndex = new Date(`${month} 1, 2020`).getMonth();

    const filter = {
        $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] }
    };

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { price: parseFloat(search) || -1 }
        ];
    }

    const transactions = await ProductTransaction.find(filter)
        .skip((page - 1) * perPage)
        .limit(parseInt(perPage));
    const total = await ProductTransaction.countDocuments(filter);

    res.json({ transactions, total });
});



// API 3: Statistics
app.get('/api/statistics', async (req, res) => {
    const { month } = req.query;
    const monthIndex = new Date(`${month} 1, 2020`).getMonth();

    const totalSales = await ProductTransaction.aggregate([
        { $match: { $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] } } },
        { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const soldItems = await ProductTransaction.countDocuments({
        sold: true,
        $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] }
    });

    const unsoldItems = await ProductTransaction.countDocuments({
        sold: false,
        $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] }
    });

    res.json({
        totalSales: totalSales[0]?.total || 0,
        soldItems,
        unsoldItems
    });
});



// API 4: Bar Chart
app.get('/api/bar-chart', async (req, res) => {
    const { month } = req.query;
    const monthIndex = new Date(`${month} 1, 2020`).getMonth();

    const ranges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity }
    ];

    const result = await Promise.all(
        ranges.map(async ({ range, min, max }) => {
            const count = await ProductTransaction.countDocuments({
                $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] },
                price: { $gte: min, $lt: max }
            });
            return { range, count };
        })
    );

    res.json(result);
});



// API 5: Pie Chart
app.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query;
    const monthIndex = new Date(`${month} 1, 2020`).getMonth();

    const result = await ProductTransaction.aggregate([
        { $match: { $expr: { $eq: [{ $month: '$dateOfSale' }, monthIndex + 1] } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json(result.map(item => ({ category: item._id, count: item.count })));
});



// API 6: Combined Data
app.get('/api/combined-data', async (req, res) => {
    const { month } = req.query;

    const [statistics, barChart, pieChart] = await Promise.all([
        axios.get(`http://localhost:5000/api/statistics?month=${month}`),
        axios.get(`http://localhost:5000/api/bar-chart?month=${month}`),
        axios.get(`http://localhost:5000/api/pie-chart?month=${month}`)
    ]);

    res.json({
        statistics: statistics.data,
        barChart: barChart.data,
        pieChart: pieChart.data
    });
});



// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
