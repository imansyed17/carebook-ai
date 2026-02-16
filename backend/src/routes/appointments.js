const express = require('express');
const router = express.Router();
const { getDbSync, saveDatabase } = require('../db/database');
const { bookAppointmentRules, rescheduleRules, cancelRules, validate } = require('../middleware/validation');
const { generateConfirmationNumber, simulateEmailConfirmation, simulateSmsConfirmation } = require('../utils/helpers');

// ─── SECURITY: Sanitize text input to prevent stored XSS ────────────────────
function sanitizeText(str) {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/[<>"'&]/g, (char) => {
        const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
        return map[char];
    }).trim();
}

// Helper to get one object from a prepared statement
function getOne(db, query, params) {
    const stmt = db.prepare(query);
    stmt.bind(params);
    let result = null;
    if (stmt.step()) {
        result = stmt.getAsObject();
    }
    stmt.free();
    return result;
}

// Helper to get multiple objects
function getAll(db, query, params) {
    const stmt = db.prepare(query);
    if (params && params.length > 0) stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

// POST /api/appointments - Book a new appointment
router.post('/', bookAppointmentRules, validate, (req, res) => {
    try {
        const db = getDbSync();
        const {
            provider_id,
            appointment_type_id,
            patient_first_name,
            patient_last_name,
            patient_email,
            patient_phone,
            patient_dob,
            appointment_date,
            appointment_time,
            interpreter_needed,
            interpreter_language,
            reason_for_visit,
            notification_preference
        } = req.body;

        // Verify provider
        const provider = getOne(db, 'SELECT * FROM providers WHERE id = ?', [provider_id]);
        if (!provider) return res.status(404).json({ error: 'Provider not found' });

        // Verify appointment type
        const appointmentType = getOne(db, 'SELECT * FROM appointment_types WHERE id = ?', [appointment_type_id]);
        if (!appointmentType) return res.status(404).json({ error: 'Appointment type not found' });

        // Check slot availability
        const slot = getOne(db,
            'SELECT * FROM time_slots WHERE provider_id = ? AND slot_date = ? AND slot_time = ? AND is_available = 1',
            [provider_id, appointment_date, appointment_time]
        );
        if (!slot) return res.status(409).json({ error: 'This time slot is no longer available. Please choose another time.' });

        const confirmation_number = generateConfirmationNumber();

        // Transaction: mark slot unavailable + insert appointment
        db.run('BEGIN TRANSACTION');
        try {
            db.run(
                'UPDATE time_slots SET is_available = 0 WHERE provider_id = ? AND slot_date = ? AND slot_time = ?',
                [provider_id, appointment_date, appointment_time]
            );

            db.run(`
        INSERT INTO appointments (
          confirmation_number, provider_id, appointment_type_id,
          patient_first_name, patient_last_name, patient_email, patient_phone, patient_dob,
          appointment_date, appointment_time,
          interpreter_needed, interpreter_language,
          reason_for_visit, notification_preference, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
      `, [
                confirmation_number, provider_id, appointment_type_id,
                sanitizeText(patient_first_name), sanitizeText(patient_last_name), patient_email, patient_phone, patient_dob || null,
                appointment_date, appointment_time,
                interpreter_needed ? 1 : 0, sanitizeText(interpreter_language) || null,
                sanitizeText(reason_for_visit) || null, notification_preference || 'email'
            ]);

            db.run('COMMIT');
        } catch (txErr) {
            db.run('ROLLBACK');
            throw txErr;
        }

        // Get the created appointment
        const appointment = getOne(db,
            'SELECT * FROM appointments WHERE confirmation_number = ?',
            [confirmation_number]
        );

        // Save to disk
        saveDatabase();

        // Simulate notifications
        const notifPref = notification_preference || 'email';
        const notifications = [];
        if (notifPref === 'email' || notifPref === 'both') {
            notifications.push(simulateEmailConfirmation(appointment, provider));
        }
        if (notifPref === 'sms' || notifPref === 'both') {
            notifications.push(simulateSmsConfirmation(appointment, provider));
        }

        res.status(201).json({
            message: 'Appointment booked successfully!',
            appointment: {
                ...appointment,
                interpreter_needed: Boolean(appointment.interpreter_needed),
                provider_name: `Dr. ${provider.first_name} ${provider.last_name}, ${provider.title}`,
                provider_location: provider.location,
                provider_address: provider.address,
                appointment_type_name: appointmentType.name
            },
            notifications_sent: notifications.length
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// GET /api/appointments - Get appointments by email or confirmation number
router.get('/', (req, res) => {
    try {
        const db = getDbSync();
        const { email, confirmation_number } = req.query;

        if (!email && !confirmation_number) {
            return res.status(400).json({ error: 'Email or confirmation number is required' });
        }

        let query = `
      SELECT a.*, 
        p.first_name as provider_first_name, 
        p.last_name as provider_last_name,
        p.title as provider_title,
        p.specialty as provider_specialty,
        p.location as provider_location,
        p.address as provider_address,
        p.phone as provider_phone,
        at.name as appointment_type_name,
        at.duration_minutes
      FROM appointments a
      JOIN providers p ON a.provider_id = p.id
      JOIN appointment_types at ON a.appointment_type_id = at.id
    `;

        let params;
        if (confirmation_number) {
            query += ' WHERE a.confirmation_number = ?';
            params = [confirmation_number];
        } else {
            query += ' WHERE a.patient_email = ?';
            params = [email];
        }

        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

        const appointments = getAll(db, query, params);

        const result = appointments.map(a => ({
            ...a,
            interpreter_needed: Boolean(a.interpreter_needed),
            provider_name: `Dr. ${a.provider_first_name} ${a.provider_last_name}, ${a.provider_title}`
        }));

        res.json({ appointments: result, total: result.length });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// GET /api/appointments/:id - Get single appointment
router.get('/:id', (req, res) => {
    try {
        const db = getDbSync();
        const appointment = getOne(db, `
      SELECT a.*, 
        p.first_name as provider_first_name, 
        p.last_name as provider_last_name,
        p.title as provider_title,
        p.specialty as provider_specialty,
        p.location as provider_location,
        p.address as provider_address,
        p.phone as provider_phone,
        p.avatar_url as provider_avatar,
        at.name as appointment_type_name,
        at.duration_minutes
      FROM appointments a
      JOIN providers p ON a.provider_id = p.id
      JOIN appointment_types at ON a.appointment_type_id = at.id
      WHERE a.id = ?
    `, [parseInt(req.params.id)]);

        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

        appointment.interpreter_needed = Boolean(appointment.interpreter_needed);
        appointment.provider_name = `Dr. ${appointment.provider_first_name} ${appointment.provider_last_name}, ${appointment.provider_title}`;

        res.json(appointment);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ error: 'Failed to fetch appointment' });
    }
});

// PATCH /api/appointments/:id/cancel
router.patch('/:id/cancel', cancelRules, validate, (req, res) => {
    try {
        const db = getDbSync();
        const cancel_reason = sanitizeText(req.body.cancel_reason);

        const appointment = getOne(db, 'SELECT * FROM appointments WHERE id = ?', [parseInt(req.params.id)]);
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
        if (appointment.status === 'cancelled') return res.status(400).json({ error: 'Appointment is already cancelled' });

        db.run('BEGIN TRANSACTION');
        try {
            db.run(`
        UPDATE appointments 
        SET status = 'cancelled', cancelled_at = datetime('now'), cancel_reason = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [cancel_reason || null, parseInt(req.params.id)]);

            db.run(`
        UPDATE time_slots SET is_available = 1 
        WHERE provider_id = ? AND slot_date = ? AND slot_time = ?
      `, [appointment.provider_id, appointment.appointment_date, appointment.appointment_time]);

            db.run('COMMIT');
        } catch (txErr) {
            db.run('ROLLBACK');
            throw txErr;
        }

        saveDatabase();

        const updated = getOne(db, 'SELECT * FROM appointments WHERE id = ?', [parseInt(req.params.id)]);

        res.json({
            message: 'Appointment cancelled successfully',
            appointment: { ...updated, interpreter_needed: Boolean(updated.interpreter_needed) }
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});

// PATCH /api/appointments/:id/reschedule
router.patch('/:id/reschedule', rescheduleRules, validate, (req, res) => {
    try {
        const db = getDbSync();
        const { appointment_date, appointment_time } = req.body;

        const appointment = getOne(db, 'SELECT * FROM appointments WHERE id = ?', [parseInt(req.params.id)]);
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
        if (appointment.status === 'cancelled') return res.status(400).json({ error: 'Cannot reschedule a cancelled appointment' });

        const newSlot = getOne(db,
            'SELECT * FROM time_slots WHERE provider_id = ? AND slot_date = ? AND slot_time = ? AND is_available = 1',
            [appointment.provider_id, appointment_date, appointment_time]
        );
        if (!newSlot) return res.status(409).json({ error: 'The selected time slot is not available' });

        db.run('BEGIN TRANSACTION');
        try {
            // Free old slot
            db.run('UPDATE time_slots SET is_available = 1 WHERE provider_id = ? AND slot_date = ? AND slot_time = ?',
                [appointment.provider_id, appointment.appointment_date, appointment.appointment_time]);
            // Book new slot
            db.run('UPDATE time_slots SET is_available = 0 WHERE provider_id = ? AND slot_date = ? AND slot_time = ?',
                [appointment.provider_id, appointment_date, appointment_time]);
            // Update appointment
            db.run(`UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = 'rescheduled', updated_at = datetime('now') WHERE id = ?`,
                [appointment_date, appointment_time, parseInt(req.params.id)]);
            db.run('COMMIT');
        } catch (txErr) {
            db.run('ROLLBACK');
            throw txErr;
        }

        saveDatabase();

        const updated = getOne(db, `
      SELECT a.*, 
        p.first_name as provider_first_name, 
        p.last_name as provider_last_name,
        p.title as provider_title,
        p.location as provider_location,
        at.name as appointment_type_name
      FROM appointments a
      JOIN providers p ON a.provider_id = p.id
      JOIN appointment_types at ON a.appointment_type_id = at.id
      WHERE a.id = ?
    `, [parseInt(req.params.id)]);

        const provider = getOne(db, 'SELECT * FROM providers WHERE id = ?', [appointment.provider_id]);
        simulateEmailConfirmation(updated, provider);

        res.json({
            message: 'Appointment rescheduled successfully',
            appointment: {
                ...updated,
                interpreter_needed: Boolean(updated.interpreter_needed),
                provider_name: `Dr. ${updated.provider_first_name} ${updated.provider_last_name}, ${updated.provider_title}`
            }
        });
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        res.status(500).json({ error: 'Failed to reschedule appointment' });
    }
});

module.exports = router;
