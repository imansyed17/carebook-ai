const express = require('express');
const router = express.Router();
const { getDbSync } = require('../db/database');
const { searchRules, validate } = require('../middleware/validation');

// Helper to convert sql.js result to array of objects
function toObjects(result) {
    if (!result || result.length === 0) return [];
    const { columns, values } = result[0];
    return values.map(row => {
        const obj = {};
        columns.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
    });
}

// GET /api/providers - List all providers with optional search
router.get('/', searchRules, validate, (req, res) => {
    try {
        const db = getDbSync();
        const { q, specialty, network, zip_code } = req.query;

        let query = `
      SELECT p.*, 
        GROUP_CONCAT(DISTINCT at.name) as appointment_types
      FROM providers p
      LEFT JOIN provider_appointment_types pat ON p.id = pat.provider_id
      LEFT JOIN appointment_types at ON pat.appointment_type_id = at.id
    `;

        const conditions = [];
        const params = [];

        if (q) {
            conditions.push(`(
        p.first_name LIKE ? OR 
        p.last_name LIKE ? OR 
        p.specialty LIKE ? OR 
        p.location LIKE ?
      )`);
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (specialty) {
            conditions.push('p.specialty = ?');
            params.push(specialty);
        }

        if (network) {
            conditions.push('p.accepted_networks LIKE ?');
            params.push(`%${network}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY p.id ORDER BY p.rating DESC';

        let providers = [];
        if (params.length > 0) {
            const stmt = db.prepare(query);
            stmt.bind(params);
            const rows = [];
            while (stmt.step()) {
                rows.push(stmt.getAsObject());
            }
            stmt.free();
            providers = rows;
        } else {
            const result = db.exec(query);
            providers = toObjects(result);
        }

        const formatted = providers.map(p => {
            // Mock a realistic distance calculation based on ZIP code match
            let distance = (Math.random() * 15 + 1).toFixed(1);
            if (zip_code && p.zip_code === zip_code) {
                distance = (Math.random() * 3 + 0.5).toFixed(1); // 0.5 - 3.5 miles if same ZIP
            }

            return {
                ...p,
                distance: parseFloat(distance),
                accepting_new_patients: Boolean(p.accepting_new_patients),
                online_booking_enabled: Boolean(p.online_booking_enabled),
                appointment_types: p.appointment_types ? p.appointment_types.split(',') : [],
                accepted_networks: p.accepted_networks ? p.accepted_networks.split(',') : []
            };
        });

        // Optionally sort by distance if a zip code was provided
        if (zip_code) {
            formatted.sort((a, b) => a.distance - b.distance);
        }

        res.json({ providers: formatted, total: formatted.length });
    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
});

// GET /api/providers/specialties - List unique specialties
router.get('/specialties', (req, res) => {
    try {
        const db = getDbSync();
        const result = db.exec('SELECT DISTINCT specialty FROM providers ORDER BY specialty');
        const specialties = toObjects(result).map(s => s.specialty);
        res.json(specialties);
    } catch (error) {
        console.error('Error fetching specialties:', error);
        res.status(500).json({ error: 'Failed to fetch specialties' });
    }
});

// GET /api/providers/:id - Get single provider
router.get('/:id', (req, res) => {
    try {
        const db = getDbSync();
        const stmt = db.prepare(`
      SELECT p.*, 
        GROUP_CONCAT(DISTINCT at.name) as appointment_types
      FROM providers p
      LEFT JOIN provider_appointment_types pat ON p.id = pat.provider_id
      LEFT JOIN appointment_types at ON pat.appointment_type_id = at.id
      WHERE p.id = ?
      GROUP BY p.id
    `);
        stmt.bind([parseInt(req.params.id)]);

        if (!stmt.step()) {
            stmt.free();
            return res.status(404).json({ error: 'Provider not found' });
        }

        const provider = stmt.getAsObject();
        stmt.free();

        provider.accepting_new_patients = Boolean(provider.accepting_new_patients);
        provider.appointment_types = provider.appointment_types ? provider.appointment_types.split(',') : [];

        res.json(provider);
    } catch (error) {
        console.error('Error fetching provider:', error);
        res.status(500).json({ error: 'Failed to fetch provider' });
    }
});

// GET /api/providers/:id/slots - Get available time slots
router.get('/:id/slots', (req, res) => {
    try {
        const db = getDbSync();
        const { date, month } = req.query;

        let query = `
      SELECT slot_date, slot_time, is_available
      FROM time_slots
      WHERE provider_id = ? AND is_available = 1
    `;
        const params = [parseInt(req.params.id)];

        if (date) {
            query += ' AND slot_date = ?';
            params.push(date);
        } else if (month) {
            query += ' AND slot_date LIKE ?';
            params.push(`${month}%`);
        } else {
            const today = new Date().toISOString().split('T')[0];
            query += ' AND slot_date >= ?';
            params.push(today);
        }

        query += ' ORDER BY slot_date, slot_time';

        const stmt = db.prepare(query);
        stmt.bind(params);
        const slots = [];
        while (stmt.step()) {
            slots.push(stmt.getAsObject());
        }
        stmt.free();

        // Group by date
        const groupedSlots = {};
        for (const slot of slots) {
            if (!groupedSlots[slot.slot_date]) {
                groupedSlots[slot.slot_date] = [];
            }
            groupedSlots[slot.slot_date].push(slot.slot_time);
        }

        res.json({
            provider_id: parseInt(req.params.id),
            slots: groupedSlots,
            total_available: slots.length
        });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ error: 'Failed to fetch time slots' });
    }
});

module.exports = router;
