
const db = require('../config/db');

// Get all suppliers
const getAllSuppliers = async () => {
    const [rows] = await db.query(
        'SELECT * FROM suppliers ORDER BY supplier_id DESC'
    );
    return rows;
};

// Add a supplier
const addSupplier = async (supplier) => {
    const {
        business_name,
        contact_person,
        phone,
        province,
        address
    } = supplier;

    const [result] = await db.query(
        `INSERT INTO suppliers
        (business_name, contact_person, phone, province, address)
        VALUES (?, ?, ?, ?, ?)`,
        [business_name, contact_person, phone, province, address]
    );

    return result.insertId;
};

// Update a supplier
const updateSupplier = async (id, supplier) => {
    const {
        business_name,
        contact_person,
        phone,
        province,
        address
    } = supplier;

    const [result] = await db.query(
        `UPDATE suppliers
        SET business_name = ?, contact_person = ?, phone = ?,
            province = ?, address = ?
        WHERE supplier_id = ?`,
        [business_name, contact_person, phone, province, address, id]
    );

    return result.affectedRows;
};

// Delete a supplier
const deleteSupplier = async (id) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [supplierRows] = await connection.execute(
            'SELECT supplier_id FROM suppliers WHERE supplier_id = ? FOR UPDATE',
            [id]
        );

        if (supplierRows.length === 0) {
            await connection.commit();
            return 0;
        }

        const [purchaseRows] = await connection.execute(
            'SELECT purchase_id FROM purchases WHERE supplier_id = ? FOR UPDATE',
            [id]
        );

        const purchaseIds = purchaseRows.map(
            (purchase) => purchase.purchase_id
        );

        if (purchaseIds.length > 0) {
            const placeholders = purchaseIds.map(() => '?').join(', ');

            await connection.execute(
                `DELETE FROM purchase_details WHERE purchase_id IN (${placeholders})`,
                purchaseIds
            );

            await connection.execute(
                `DELETE FROM purchases WHERE purchase_id IN (${placeholders})`,
                purchaseIds
            );
        }

        const [result] = await connection.execute(
            'DELETE FROM suppliers WHERE supplier_id = ?',
            [id]
        );

        await connection.commit();
        return result.affectedRows;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier
};
