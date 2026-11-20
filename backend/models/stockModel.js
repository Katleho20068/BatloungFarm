
const db = require('../config/db');

const getAllStock = async () => {
    const [rows] = await db.query(`
        SELECT
            s.stock_id,
            s.fruit_id,
            f.fruit_name,
            s.packaging_size,
            s.available_quantity
        FROM stock s
        JOIN fruits f ON s.fruit_id = f.fruit_id
        ORDER BY f.fruit_name ASC, s.packaging_size ASC
    `);

    return rows;
};

module.exports = {
    getAllStock
};
