
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const fruitRoutes = require('./routes/fruitRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const saleRoutes = require('./routes/saleRoutes');
const stockRoutes = require('./routes/stockRoutes');



const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/fruits', fruitRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/stock', stockRoutes);


// Homepage
app.get('/', (req, res) => {
    res.send('Batloung Farm Backend is running!');
});

// Test MySQL connection
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT DATABASE() AS databaseName'
        );

        res.json({
            message: 'MySQL Database Connected Successfully!',
            database: rows[0].databaseName
        });

    } catch (error) {
        console.error('Database connection error:', error.message);

        res.status(500).json({
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
