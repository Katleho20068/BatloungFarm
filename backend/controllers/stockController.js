const stockModel = require('../models/stockModel');

const getAllStock = async (req, res) => {
    try {
        const stock = await stockModel.getAllStock();

        res.status(200).json({
            success: true,
            data: stock
        });
    } catch (error) {
        console.error('Error fetching stock:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock',
            error: error.message
        });
    }
};

module.exports = {
    getAllStock
};
