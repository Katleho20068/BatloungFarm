
const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchaseController');

// Get all purchases
router.get('/', purchaseController.getAllPurchases);

// Record a new purchase
router.post('/', purchaseController.addPurchase);

module.exports = router;
