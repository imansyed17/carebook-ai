const express = require('express');
const router = express.Router();
const { getDbSync } = require('../db/database');

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

// POST /api/auth/login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = getDbSync();
        
        const stmt = db.prepare('SELECT * FROM members WHERE email = ? AND password = ?');
        stmt.bind([email, password]);
        
        let foundMember = null;
        if (stmt.step()) {
            const row = stmt.get();
            const columns = stmt.getColumnNames();
            foundMember = {};
            columns.forEach((col, i) => {
                foundMember[col] = row[i];
            });
        }
        stmt.free();

        if (foundMember) {
            // Remove password from response
            delete foundMember.password;
            
            // Map db columns to frontend expectations
            const mappedMember = {
                id: foundMember.id.toString(),
                firstName: foundMember.first_name,
                lastName: foundMember.last_name,
                email: foundMember.email,
                phone: foundMember.phone,
                memberId: foundMember.member_id,
                groupNumber: foundMember.group_number,
                planName: foundMember.plan_name,
                planNetwork: foundMember.plan_network,
                communicationPreference: foundMember.communication_preference,
                requiresInterpreter: foundMember.requires_interpreter === 1,
                interpreterLanguage: foundMember.interpreter_language
            };
            
            res.json({ member: mappedMember });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
