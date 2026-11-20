
const db = require('../config/db');

// Get all fruits
const getAllFruits = async () => {
    const [rows] = await db.query(
        'SELECT * FROM fruits ORDER BY fruit_id DESC'
    );
    return rows;
};

// Add a new fruit
const addFruit = async (fruit) => {
    const { fruit_name, description, status } = fruit;

    const [result] = await db.query(
        'INSERT INTO fruits (fruit_name, description, status) VALUES (?, ?, ?)',
        [fruit_name, description, status]
    );

    return result.insertId;
};

// Update a fruit
const updateFruit = async (id, fruit) => {
    const { fruit_name, description, status } = fruit;

    const [result] = await db.query(
        'UPDATE fruits SET fruit_name = ?, description = ?, status = ? WHERE fruit_id = ?',
        [fruit_name, description, status, id]
    );

    return result.affectedRows;
};

// Delete a fruit
const deleteFruit = async (id) => {
    const [result] = await db.query(
        'DELETE FROM fruits WHERE fruit_id = ?',
        [id]
    );

    return result.affectedRows;
};

module.exports = {
    getAllFruits,
    addFruit,
    updateFruit,
    deleteFruit
};
