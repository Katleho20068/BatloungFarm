
const db = require('../config/db');

const getDashboardStats = async () => {
    const queries = await Promise.all([
        db.query('SELECT COUNT(*) AS total FROM Fruits'),
        db.query('SELECT COUNT(*) AS total FROM Suppliers'),
        db.query('SELECT COUNT(*) AS total FROM Vendors'),
        db.query('SELECT COUNT(*) AS total FROM Purchases'),
        db.query('SELECT COUNT(*) AS total FROM Sales'),
        db.query('SELECT COUNT(*) AS total FROM Stock')
    ]);

    return {
        totalFruits: queries[0][0][0].total,
        totalSuppliers: queries[1][0][0].total,
        totalVendors: queries[2][0][0].total,
        totalPurchases: queries[3][0][0].total,
        totalSales: queries[4][0][0].total,
        totalStockRecords: queries[5][0][0].total
    };
};

module.exports = {
    getDashboardStats
};
