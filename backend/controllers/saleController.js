const saleModel = require('../models/saleModel');

// Get all sales
const getAllSales = async (req, res) => {
    try {
        const sales = await saleModel.getAllSales();

        res.status(200).json({
            success: true,
            data: sales
        });
    } catch (error) {
        console.error('Error fetching sales:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch sales',
            error: error.message
        });
    }
};

// Add a new sale
const addSale = async (req, res) => {
    try {
        const result = await saleModel.addSale(req.body);

        res.status(201).json({
            success: true,
            message: 'Sale recorded successfully',
            data: result
        });
    } catch (error) {
        console.error('Error adding sale:', error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllSales,
    addSale
};