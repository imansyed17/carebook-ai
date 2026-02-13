const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique confirmation number
 * Format: CB-XXXXXXXX (CB prefix + 8 char UUID segment)
 */
function generateConfirmationNumber() {
    const segment = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    return `CB-${segment}`;
}

/**
 * Format date string to readable format
 */
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format time string to 12-hour format
 */
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Simulate sending email confirmation
 */
function simulateEmailConfirmation(appointment, provider) {
    const emailData = {
        to: appointment.patient_email,
        subject: `Appointment Confirmation - ${appointment.confirmation_number}`,
        body: `
      Dear ${appointment.patient_first_name} ${appointment.patient_last_name},

      Your appointment has been confirmed!

      📋 Confirmation Number: ${appointment.confirmation_number}
      👨‍⚕️ Provider: Dr. ${provider.first_name} ${provider.last_name}, ${provider.title}
      🏥 Location: ${provider.location}
      📅 Date: ${formatDate(appointment.appointment_date)}
      🕐 Time: ${formatTime(appointment.appointment_time)}

      Please arrive 15 minutes early for check-in.
      
      To cancel or reschedule, visit your CareBook AI portal.

      Thank you for choosing CareBook AI!
    `.trim()
    };

    console.log('\n📧 EMAIL CONFIRMATION SIMULATED:');
    console.log(`   To: ${emailData.to}`);
    console.log(`   Subject: ${emailData.subject}`);
    console.log(`   Status: ✅ Sent successfully\n`);

    return emailData;
}

/**
 * Simulate sending SMS confirmation
 */
function simulateSmsConfirmation(appointment, provider) {
    const smsData = {
        to: appointment.patient_phone,
        message: `CareBook AI: Appointment confirmed! Ref: ${appointment.confirmation_number}. Dr. ${provider.last_name} on ${formatDate(appointment.appointment_date)} at ${formatTime(appointment.appointment_time)}. Location: ${provider.location}.`
    };

    console.log('📱 SMS CONFIRMATION SIMULATED:');
    console.log(`   To: ${smsData.to}`);
    console.log(`   Status: ✅ Sent successfully\n`);

    return smsData;
}

module.exports = {
    generateConfirmationNumber,
    formatDate,
    formatTime,
    simulateEmailConfirmation,
    simulateSmsConfirmation
};
