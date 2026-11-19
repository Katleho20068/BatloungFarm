
const fruitModel = require('../models/fruitModel');

// Get all fruits
const getFruits = async (req, res) => {
    try {
        const fruits = await fruitModel.getAllFruits();

        res.status(200).json({
            success: true,
            data: fruits
        });
    } catch (error) {
        console.error('Error fetching fruits:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve fruits'
        });
    }
};

// Add a new fruit
const createFruit = async (req, res) => {
    try {
        const { fruit_name, description, status } = req.body;

        if (!fruit_name || !description || !status) {
            return res.status(400).json({
                success: false,
                message: 'Please provide fruit name, description and status'
            });
        }

        const fruitId = await fruitModel.addFruit({
            fruit_name,
            description,
            status
        });

        res.status(201).json({
            success: true,
            message: 'Fruit added successfully',
            fruit_id: fruitId
        });
    } catch (error) {
        console.error('Error adding fruit:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to add fruit'
        });
    }
};

// Update a fruit
const editFruit = async (req, res) => {
    try {
        const { fruit_name, description, status } = req.body;

        if (!fruit_name || !description || !status) {
            return res.status(400).json({
                success: false,
                message: 'Please provide fruit name, description and status'
            });
        }

        const affectedRows = await fruitModel.updateFruit(req.params.id, {
            fruit_name,
            description,
            status
        });

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Fruit not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fruit updated successfully'
        });
    } catch (error) {
        console.error('Error updating fruit:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update fruit'
        });
    }
};

// Delete a fruit
const removeFruit = async (req, res) => {
    try {
        const affectedRows = await fruitModel.deleteFruit(req.params.id);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Fruit not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fruit deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting fruit:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete fruit. It may be linked to existing purchases, sales or stock records.'
        });
    }
};

module.exports = {
    getFruits,
    createFruit,
    editFruit,
    removeFruit
};
