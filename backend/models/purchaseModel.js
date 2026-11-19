
const db = require('../config/db');

// Get all purchases with supplier and fruit details
const getAllPurchases = async () => {
    const [rows] = await db.query(`
        SELECT
            p.purchase_id,
            p.supplier_id,
            s.business_name,
            p.purchase_date,
            p.total_amount,
            pd.purchase_detail_id,
            pd.fruit_id,
            f.fruit_name,
            pd.quantity,
            pd.unit_cost,
            pd.packaging_size
        FROM Purchases p
        JOIN Suppliers s ON p.supplier_id = s.supplier_id
        LEFT JOIN Purchase_details pd ON p.purchase_id = pd.purchase_id
        LEFT JOIN Fruits f ON pd.fruit_id = f.fruit_id
        ORDER BY p.purchase_id DESC
    `);

    return rows;
};

// Add a new purchase and update stock
const addPurchase = async (purchaseData) => {
    const { supplier_id, purchase_date, items } = purchaseData;

    if (!supplier_id || !purchase_date || !Array.isArray(items) || items.length === 0) {
        throw new Error('Supplier, purchase date and at least one fruit are required');
    }

    for (const item of items) {
        if (
            !item.fruit_id ||
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) <= 0 ||
            !Number.isFinite(Number(item.unit_cost)) ||
            Number(item.unit_cost) < 0 ||
            !['Small', 'Medium', 'Large'].includes(item.packaging_size)
        ) {
            throw new Error('Invalid purchase item details');
        }
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let totalAmount = 0;

        for (const item of items) {
            totalAmount += Number(item.quantity) * Number(item.unit_cost);
        }

        // Create the purchase record
        const [purchaseResult] = await connection.execute(
            `INSERT INTO Purchases (supplier_id, purchase_date, total_amount)
             VALUES (?, ?, ?)`,
            [supplier_id, purchase_date, totalAmount]
        );

        const purchaseId = purchaseResult.insertId;

        // Save each fruit and update its stock
        for (const item of items) {
            const quantity = Number(item.quantity);
            const unitCost = Number(item.unit_cost);

            await connection.execute(
                `INSERT INTO Purchase_details
                 (purchase_id, fruit_id, quantity, unit_cost, packaging_size)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    purchaseId,
                    item.fruit_id,
                    quantity,
                    unitCost,
                    item.packaging_size
                ]
            );

            // Add quantity to stock, or create the stock record if missing
            await connection.execute(
                `INSERT INTO Stock
                 (fruit_id, packaging_size, available_quantity)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 available_quantity = available_quantity + ?`,
                [
                    item.fruit_id,
                    item.packaging_size,
                    quantity,
                    quantity
                ]
            );
        }

        await connection.commit();

        return {
            purchase_id: purchaseId,
            total_amount: totalAmount
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    getAllPurchases,
    addPurchase
};
