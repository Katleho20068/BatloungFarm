
const supplierModel = require('../models/supplierModel');

// Get all suppliers
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierModel.getAllSuppliers();

        res.status(200).json({
            success: true,
            data: suppliers
        });
    } catch (error) {
        console.error('Error fetching suppliers:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve suppliers'
        });
    }
};

// Add a supplier
const createSupplier = async (req, res) => {
    try {
        const {
            business_name,
            contact_person,
            phone,
            province,
            address
        } = req.body;

        if (!business_name || !contact_person || !phone || !province || !address) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all supplier details'
            });
        }

        const supplierId = await supplierModel.addSupplier({
            business_name,
            contact_person,
            phone,
            province,
            address
        });

        res.status(201).json({
            success: true,
            message: 'Supplier added successfully',
            supplier_id: supplierId
        });
    } catch (error) {
        console.error('Error adding supplier:', error.message);

        res.status(500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'This phone number is already registered'
                : 'Failed to add supplier'
        });
    }
};

// Update a supplier
const editSupplier = async (req, res) => {
    try {
        const {
            business_name,
            contact_person,
            phone,
            province,
            address
        } = req.body;

        if (!business_name || !contact_person || !phone || !province || !address) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all supplier details'
            });
        }

        const affectedRows = await supplierModel.updateSupplier(
            req.params.id,
            {
                business_name,
                contact_person,
                phone,
                province,
                address
            }
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Supplier updated successfully'
        });
    } catch (error) {
        console.error('Error updating supplier:', error.message);

        res.status(500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'This phone number is already registered'
                : 'Failed to update supplier'
        });
    }
};

// Delete a supplier
const removeSupplier = async (req, res) => {
    try {
        const affectedRows = await supplierModel.deleteSupplier(req.params.id);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Supplier and its purchase history deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting supplier:', error.message);

        res.status(500).json({
            success: false,
            message: 'Unable to delete supplier and its purchase history'
        });
    }
};

module.exports = {
    getSuppliers,
    createSupplier,
    editSupplier,
    removeSupplier
};
