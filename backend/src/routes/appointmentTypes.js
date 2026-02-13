const express = require('express');
const router = express.Router();
const { getDbSync } = require('../db/database');

// Helper
function toObjects(result) {
    if (!result || result.length === 0) return [];
    const { columns, values } = result[0];
    return values.map(row => {
        const obj = {};
        columns.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
    });
}

// GET /api/appointment-types
router.get('/', (req, res) => {
    try {
        const db = getDbSync();
        const result = db.exec('SELECT * FROM appointment_types ORDER BY name');
        res.json(toObjects(result));
    } catch (error) {
        console.error('Error fetching appointment types:', error);
        res.status(500).json({ error: 'Failed to fetch appointment types' });
    }
});

module.exports = router;
