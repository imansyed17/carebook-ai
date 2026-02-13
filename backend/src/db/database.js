const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'carebook.db');

let db = null;

async function getDatabase() {
    if (!db) {
        await initializeDatabase();
    }
    return db;
}

function getDbSync() {
    if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
    return db;
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

async function initializeDatabase() {
    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Run schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    db.run(schema);

    // Check if seed data exists
    const result = db.exec('SELECT COUNT(*) as count FROM providers');
    const count = result.length > 0 ? result[0].values[0][0] : 0;

    if (count === 0) {
        console.log('No providers found, running seed data...');
        seedDatabase(db);
        saveDatabase();
    }

    // Auto-save every 30 seconds
    setInterval(saveDatabase, 30000);

    return db;
}

function seedDatabase(database) {
    // Seed appointment types
    const appointmentTypes = [
        { name: 'Annual Physical', description: 'Comprehensive yearly health examination', duration_minutes: 60, category: 'Preventive' },
        { name: 'Sick Visit', description: 'Visit for acute illness or symptoms', duration_minutes: 20, category: 'Acute' },
        { name: 'Follow-up Visit', description: 'Follow-up on previous treatment or condition', duration_minutes: 20, category: 'Follow-up' },
        { name: 'New Patient Consultation', description: 'Initial visit for new patients', duration_minutes: 45, category: 'New Patient' },
        { name: 'Specialist Referral', description: 'Visit referred by another physician', duration_minutes: 30, category: 'Specialist' },
        { name: 'Preventive Screening', description: 'Routine screening tests and evaluations', duration_minutes: 30, category: 'Preventive' },
        { name: 'Vaccination', description: 'Immunization and vaccine administration', duration_minutes: 15, category: 'Preventive' },
        { name: 'Telehealth Visit', description: 'Virtual appointment via video call', duration_minutes: 20, category: 'Virtual' },
        { name: 'Urgent Care', description: 'Same-day visit for urgent health needs', duration_minutes: 30, category: 'Acute' },
        { name: 'Lab Work / Blood Draw', description: 'Laboratory testing and blood work', duration_minutes: 15, category: 'Diagnostic' }
    ];

    const insertType = database.prepare(
        'INSERT OR IGNORE INTO appointment_types (name, description, duration_minutes, category) VALUES (?, ?, ?, ?)'
    );
    for (const type of appointmentTypes) {
        insertType.run([type.name, type.description, type.duration_minutes, type.category]);
    }
    insertType.free();

    // Seed providers
    const providers = [
        {
            first_name: 'Sarah', last_name: 'Johnson', specialty: 'Family Medicine', title: 'MD',
            phone: '(555) 234-5678', email: 'sarah.johnson@carebook.com',
            location: 'Downtown Medical Center', address: '100 Health Blvd, Suite 200, Indianapolis, IN 46204',
            bio: 'Dr. Sarah Johnson is a board-certified family medicine physician with over 15 years of experience. She is passionate about preventive care and building lasting relationships with her patients.',
            rating: 4.9, review_count: 234, accepting_new_patients: 1,
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ&backgroundColor=0F766E'
        },
        {
            first_name: 'Michael', last_name: 'Chen', specialty: 'Cardiology', title: 'MD',
            phone: '(555) 345-6789', email: 'michael.chen@carebook.com',
            location: 'Heart & Vascular Institute', address: '250 Cardiac Way, Suite 400, Indianapolis, IN 46240',
            bio: 'Dr. Michael Chen specializes in interventional cardiology and has performed over 5,000 cardiac procedures. He focuses on minimally invasive techniques for heart disease treatment.',
            rating: 4.8, review_count: 187, accepting_new_patients: 1,
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=MC&backgroundColor=0E7490'
        },
        {
            first_name: 'Emily', last_name: 'Rodriguez', specialty: 'Dermatology', title: 'MD',
            phone: '(555) 456-7890', email: 'emily.rodriguez@carebook.com',
            location: 'Skin Health Clinic', address: '75 Derma Drive, Suite 150, Indianapolis, IN 46220',
            bio: 'Dr. Emily Rodriguez is a fellowship-trained dermatologist specializing in medical and cosmetic dermatology. She treats conditions ranging from acne to skin cancer.',
            rating: 4.7, review_count: 156, accepting_new_patients: 1,
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=ER&backgroundColor=7C3AED'
        },
        {
            first_name: 'James', last_name: 'Wilson', specialty: 'Orthopedics', title: 'DO',
            phone: '(555) 567-8901', email: 'james.wilson@carebook.com',
            location: 'Bone & Joint Center', address: '300 Ortho Ave, Suite 500, Indianapolis, IN 46250',
            bio: 'Dr. James Wilson is an orthopedic surgeon specializing in sports medicine and joint replacement. He has worked with professional athletes and weekend warriors alike.',
            rating: 4.6, review_count: 198, accepting_new_patients: 1,
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=JW&backgroundColor=DC2626'
        },
        {
            first_name: 'Priya', last_name: 'Patel', specialty: 'Pediatrics', title: 'MD',
            phone: '(555) 678-9012', email: 'priya.patel@carebook.com',
            location: "Children's Wellness Center", address: '450 Kids Lane, Suite 100, Indianapolis, IN 46260',
            bio: 'Dr. Priya Patel is a compassionate pediatrician who has been caring for children from birth through adolescence for over 12 years. She believes in a whole-child approach to healthcare.',
            rating: 4.9, review_count: 312, accepting_new_patients: 1,
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=PP&backgroundColor=EC4899'
        },
        {
            first_name: 'David', last_name: 'Kim', specialty: 'Internal Medicine', title: 'MD',
            phone: '(555) 789-0123', email: 'david.kim@carebook.com',
            location: 'Internal Medicine Associates', address: '600 Medical Park Dr, Suite 300, Indianapolis, IN 46202',
            bio: 'Dr. David Kim is an internist with expertise in managing complex medical conditions. He takes a comprehensive approach to adult healthcare, focusing on disease prevention and management.',
            rating: 4.5, review_count: 143, accepting_new_patients: 1,
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=DK&backgroundColor=2563EB'
        },
        {
            first_name: 'Lisa', last_name: 'Thompson', specialty: 'OB/GYN', title: 'MD',
            phone: '(555) 890-1234', email: 'lisa.thompson@carebook.com',
            location: "Women's Health Pavilion", address: "800 Women's Way, Suite 200, Indianapolis, IN 46208",
            bio: "Dr. Lisa Thompson provides comprehensive women's healthcare including prenatal care, gynecological surgery, and family planning. She is passionate about empowering women through health education.",
            rating: 4.8, review_count: 267, accepting_new_patients: 0,
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=LT&backgroundColor=F59E0B'
        },
        {
            first_name: 'Robert', last_name: 'Harris', specialty: 'Neurology', title: 'MD',
            phone: '(555) 901-2345', email: 'robert.harris@carebook.com',
            location: 'Neuroscience Center', address: '950 Brain Blvd, Suite 600, Indianapolis, IN 46278',
            bio: 'Dr. Robert Harris is a board-certified neurologist specializing in headache medicine, epilepsy, and neurodegenerative disorders. He combines cutting-edge treatments with compassionate patient care.',
            rating: 4.7, review_count: 128, accepting_new_patients: 1,
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=RH&backgroundColor=059669'
        }
    ];

    const insertProvider = database.prepare(`
    INSERT OR IGNORE INTO providers (first_name, last_name, specialty, title, phone, email, location, address, bio, rating, review_count, accepting_new_patients, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    for (const p of providers) {
        insertProvider.run([p.first_name, p.last_name, p.specialty, p.title, p.phone, p.email, p.location, p.address, p.bio, p.rating, p.review_count, p.accepting_new_patients, p.avatar_url]);
    }
    insertProvider.free();

    // Link providers to appointment types
    const allTypes = database.exec('SELECT id FROM appointment_types');
    const allProviders = database.exec('SELECT id FROM providers');

    if (allTypes.length > 0 && allProviders.length > 0) {
        const insertLink = database.prepare(
            'INSERT OR IGNORE INTO provider_appointment_types (provider_id, appointment_type_id) VALUES (?, ?)'
        );
        for (const providerRow of allProviders[0].values) {
            for (const typeRow of allTypes[0].values) {
                insertLink.run([providerRow[0], typeRow[0]]);
            }
        }
        insertLink.free();
    }

    // Generate time slots for the next 90 days
    const slotTimes = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30'
    ];

    const insertSlot = database.prepare(
        'INSERT OR IGNORE INTO time_slots (provider_id, slot_date, slot_time, is_available) VALUES (?, ?, ?, ?)'
    );

    const today = new Date();
    const providerIds = allProviders.length > 0 ? allProviders[0].values.map(r => r[0]) : [];

    for (const providerId of providerIds) {
        for (let day = 1; day <= 90; day++) {
            const date = new Date(today);
            date.setDate(date.getDate() + day);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            const dateStr = date.toISOString().split('T')[0];

            for (const time of slotTimes) {
                const isAvailable = Math.random() > 0.2 ? 1 : 0;
                insertSlot.run([providerId, dateStr, time, isAvailable]);
            }
        }
    }
    insertSlot.free();

    console.log('✅ Database seeded successfully!');
    console.log(`   - ${providers.length} providers`);
    console.log(`   - ${appointmentTypes.length} appointment types`);
    console.log('   - Time slots generated for next 90 days');
}

module.exports = { getDatabase, getDbSync, initializeDatabase, saveDatabase };
