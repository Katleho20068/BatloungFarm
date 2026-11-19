
const express = require('express');
const router = express.Router();

const fruitController = require('../controllers/fruitController');

// Get all fruits
router.get('/', fruitController.getFruits);

// Add a new fruit
router.post('/', fruitController.createFruit);

// Update a fruit
router.put('/:id', fruitController.editFruit);

// Delete a fruit
router.delete('/:id', fruitController.removeFruit);

module.exports = router;
