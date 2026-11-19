
const vendorModel = require('../models/vendorModel');

// Get all vendors
const getVendors = async (req, res) => {
    try {
        const vendors = await vendorModel.getAllVendors();

        res.status(200).json({
            success: true,
            data: vendors
        });
    } catch (error) {
        console.error('Error fetching vendors:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve vendors'
        });
    }
};

// Add a vendor
const createVendor = async (req, res) => {
    try {
        const {
            vendor_name,
            phone_number,
            location,
            registration_date
        } = req.body;

        if (!vendor_name || !phone_number || !location || !registration_date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all vendor details'
            });
        }

        const vendorId = await vendorModel.addVendor({
            vendor_name,
            phone_number,
            location,
            registration_date
        });

        res.status(201).json({
            success: true,
            message: 'Vendor added successfully',
            vendor_id: vendorId
        });
    } catch (error) {
        console.error('Error adding vendor:', error.message);

        res.status(500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'This phone number is already registered'
                : 'Failed to add vendor'
        });
    }
};

// Update a vendor
const editVendor = async (req, res) => {
    try {
        const {
            vendor_name,
            phone_number,
            location,
            registration_date
        } = req.body;

        if (!vendor_name || !phone_number || !location || !registration_date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all vendor details'
            });
        }

        const affectedRows = await vendorModel.updateVendor(
            req.params.id,
            {
                vendor_name,
                phone_number,
                location,
                registration_date
            }
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vendor updated successfully'
        });
    } catch (error) {
        console.error('Error updating vendor:', error.message);

        res.status(500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'This phone number is already registered'
                : 'Failed to update vendor'
        });
    }
};

// Delete a vendor
const removeVendor = async (req, res) => {
    try {
        const affectedRows = await vendorModel.deleteVendor(req.params.id);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vendor deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting vendor:', error.message);

        res.status(500).json({
            success: false,
            message: 'Unable to delete vendor. It may be linked to existing sales.'
        });
    }
};

module.exports = {
    getVendors,
    createVendor,
    editVendor,
    removeVendor
};
