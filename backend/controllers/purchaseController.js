
const purchaseModel = require('../models/purchaseModel');

// Get all purchases
const getAllPurchases = async (req, res) => {
    try {
        const purchases = await purchaseModel.getAllPurchases();

        res.status(200).json({
            success: true,
            data: purchases
        });
    } catch (error) {
        console.error('Error fetching purchases:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch purchases',
            error: error.message
        });
    }
};

// Add a new purchase
const addPurchase = async (req, res) => {
    try {
        const result = await purchaseModel.addPurchase(req.body);

        res.status(201).json({
            success: true,
            message: 'Purchase recorded successfully',
            data: result
        });
    } catch (error) {
        console.error('Error adding purchase:', error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllPurchases,
    addPurchase
};
