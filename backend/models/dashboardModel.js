const db = require('../config/db');

const getDashboardStats = async () => {
    const tables = [
        'fruits',
        'suppliers',
        'vendors',
        'purchases',
        'sales',
        'stock'
    ];

    const results = await Promise.all(
        tables.map(async (table) => {
            const [rows] = await db.query(
                `SELECT COUNT(*) AS total FROM ${table}`
            );
            return rows[0].total;
        })
    );

    return {
        totalFruits: results[0],
        totalSuppliers: results[1],
        totalVendors: results[2],
        totalPurchases: results[3],
        totalSales: results[4],
        totalStockRecords: results[5]
    };
};

module.exports = { getDashboardStats };
