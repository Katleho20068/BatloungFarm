const db = require('../config/db');

// Get all sales with vendor and fruit details
const getAllSales = async () => {
    const [rows] = await db.query(`
        SELECT
            s.sale_id,
            s.vendor_id,
            v.vendor_name,
            s.sale_date,
            s.payment_method,
            s.payment_status,
            s.total_amount,
            s.amount_paid,
            sd.sales_detail_id,
            sd.fruit_id,
            f.fruit_name,
            sd.packaging_size,
            sd.quantity,
            sd.unit_price
        FROM Sales s
        JOIN Vendors v ON s.vendor_id = v.vendor_id
        LEFT JOIN Sales_details sd ON s.sale_id = sd.sale_id
        LEFT JOIN Fruits f ON sd.fruit_id = f.fruit_id
        ORDER BY s.sale_id DESC
    `);

    return rows;
};

// Add a new sale and reduce stock
const addSale = async (saleData) => {
    const {
        vendor_id,
        sale_date,
        payment_method,
        amount_paid,
        items
    } = saleData;

    if (
        !vendor_id ||
        !sale_date ||
        !['Cash', 'Mobile Money', 'Credit'].includes(payment_method) ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        throw new Error('Please provide valid sale details and at least one fruit');
    }

    const paidAmount = Number(amount_paid);

    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
        throw new Error('Amount paid must be zero or greater');
    }

    for (const item of items) {
        if (
            !item.fruit_id ||
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) <= 0 ||
            !Number.isFinite(Number(item.unit_price)) ||
            Number(item.unit_price) <= 0 ||
            !['Small', 'Medium', 'Large'].includes(item.packaging_size)
        ) {
            throw new Error('Invalid sale item details');
        }
    }

    console.log('SALE DATA RECEIVED:', saleData);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let totalAmount = 0;

        for (const item of items) {
            totalAmount += Number(item.quantity) * Number(item.unit_price);
        }

        if (paidAmount > totalAmount) {
            throw new Error('Amount paid cannot exceed the total sale amount');
        }

        let paymentStatus = 'UNPAID';

        if (paidAmount >= totalAmount) {
            paymentStatus = 'PAID';
        } else if (paidAmount > 0) {
            paymentStatus = 'PARTIALLY_PAID';
        }

        // Create the sale record
        const [saleResult] = await connection.execute(
            `INSERT INTO Sales
             (vendor_id, sale_date, payment_method, payment_status, total_amount, amount_paid)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                vendor_id,
                sale_date,
                payment_method,
                paymentStatus,
                totalAmount,
                paidAmount
            ]
        );

        const saleId = saleResult.insertId;

        // Save sale details and reduce stock
        for (const item of items) {
            const quantity = Number(item.quantity);

            // Check available stock and lock the stock record
            const [stockRows] = await connection.execute(
                `SELECT available_quantity
                 FROM Stock
                 WHERE fruit_id = ?
                 AND packaging_size = ?
                 FOR UPDATE`,
                [item.fruit_id, item.packaging_size]
            );

            if (
                stockRows.length === 0 ||
                Number(stockRows[0].available_quantity) < quantity
            ) {
                throw new Error(
                    `Insufficient stock for fruit ID ${item.fruit_id} (${item.packaging_size})`
                );
            }

            // Save the sale item
            await connection.execute(
                `INSERT INTO Sales_details
                 (sale_id, fruit_id, packaging_size, quantity, unit_price)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    saleId,
                    item.fruit_id,
                    item.packaging_size,
                    quantity,
                    Number(item.unit_price)
                ]
            );

            // Subtract sold quantity from stock
            await connection.execute(
                `UPDATE Stock
                 SET available_quantity = available_quantity - ?
                 WHERE fruit_id = ?
                 AND packaging_size = ?`,
                [quantity, item.fruit_id, item.packaging_size]
            );
        }

        await connection.commit();

        return {
            sale_id: saleId,
            total_amount: totalAmount,
            amount_paid: paidAmount,
            payment_status: paymentStatus
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    getAllSales,
    addSale
};