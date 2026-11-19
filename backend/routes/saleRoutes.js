const express = require('express');
const router = express.Router();

const {
    getAllSales,
    addSale
} = require('../controllers/saleController');

// Get all sales
router.get('/', getAllSales);

// Add a new sale
router.post('/', addSale);

module.exports = router;