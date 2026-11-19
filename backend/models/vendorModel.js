
const db = require('../config/db');

// Get all vendors
const getAllVendors = async () => {
    const [rows] = await db.query(
        'SELECT * FROM Vendors ORDER BY vendor_id DESC'
    );
    return rows;
};

// Add a vendor
const addVendor = async (vendor) => {
    const {
        vendor_name,
        phone_number,
        location,
        registration_date
    } = vendor;

    const [result] = await db.query(
        `INSERT INTO Vendors
        (vendor_name, phone_number, location, registration_date)
        VALUES (?, ?, ?, ?)`,
        [vendor_name, phone_number, location, registration_date]
    );

    return result.insertId;
};

// Update a vendor
const updateVendor = async (id, vendor) => {
    const {
        vendor_name,
        phone_number,
        location,
        registration_date
    } = vendor;

    const [result] = await db.query(
        `UPDATE Vendors
        SET vendor_name = ?, phone_number = ?,
            location = ?, registration_date = ?
        WHERE vendor_id = ?`,
        [vendor_name, phone_number, location, registration_date, id]
    );

    return result.affectedRows;
};

// Delete a vendor
const deleteVendor = async (id) => {
    const [result] = await db.query(
        'DELETE FROM Vendors WHERE vendor_id = ?',
        [id]
    );

    return result.affectedRows;
};

module.exports = {
    getAllVendors,
    addVendor,
    updateVendor,
    deleteVendor
};
