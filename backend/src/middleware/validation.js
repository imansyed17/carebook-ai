const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Appointment booking validation rules
const bookAppointmentRules = [
    body('provider_id')
        .isInt({ min: 1 })
        .withMessage('Valid provider ID is required'),
    body('appointment_type_id')
        .isInt({ min: 1 })
        .withMessage('Valid appointment type is required'),
    body('patient_first_name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name is required (max 100 characters)')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    body('patient_last_name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Last name is required (max 100 characters)')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    body('patient_email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email address is required'),
    body('patient_phone')
        .matches(/^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/)
        .withMessage('Valid phone number is required (e.g., (555) 123-4567)'),
    body('appointment_date')
        .isDate({ format: 'YYYY-MM-DD' })
        .withMessage('Valid appointment date is required (YYYY-MM-DD)')
        .custom((value) => {
            const appointmentDate = new Date(value + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (appointmentDate <= today) {
                throw new Error('Appointment date must be in the future');
            }
            return true;
        }),
    body('appointment_time')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Valid appointment time is required (HH:MM)'),
    body('interpreter_needed')
        .optional()
        .isBoolean()
        .withMessage('Interpreter needed must be true or false'),
    body('interpreter_language')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Language must be max 50 characters'),
    body('reason_for_visit')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Reason for visit must be max 500 characters'),
    body('notification_preference')
        .optional()
        .isIn(['email', 'sms', 'both'])
        .withMessage('Notification preference must be email, sms, or both'),
    body('patient_dob')
        .optional()
        .isDate({ format: 'YYYY-MM-DD' })
        .withMessage('Valid date of birth is required (YYYY-MM-DD)')
];

// Reschedule validation rules
const rescheduleRules = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid appointment ID is required'),
    body('appointment_date')
        .isDate({ format: 'YYYY-MM-DD' })
        .withMessage('Valid new date is required (YYYY-MM-DD)')
        .custom((value) => {
            const appointmentDate = new Date(value + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (appointmentDate <= today) {
                throw new Error('New appointment date must be in the future');
            }
            return true;
        }),
    body('appointment_time')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Valid new appointment time is required (HH:MM)')
];

// Cancel validation rules
const cancelRules = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid appointment ID is required'),
    body('cancel_reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Cancel reason must be max 500 characters')
];

// Search validation
const searchRules = [
    query('q')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Search query must be max 200 characters')
];

module.exports = {
    validate,
    bookAppointmentRules,
    rescheduleRules,
    cancelRules,
    searchRules
};
