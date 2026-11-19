
const express = require('express');
const router = express.Router();

const supplierController = require('../controllers/supplierController');

router.get('/', supplierController.getSuppliers);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.editSupplier);
router.delete('/:id', supplierController.removeSupplier);

module.exports = router;
