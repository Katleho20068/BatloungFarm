const express = require('express');
const router = express.Router();

const {
    getAllStock
} = require('../controllers/stockController');

router.get('/', getAllStock);

module.exports = router;
