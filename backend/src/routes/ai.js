const express = require('express');
const router = express.Router();

/**
 * AI-Assisted Intent Parser for Appointment Type Suggestions
 * 
 * This is a mock AI function that analyzes user input (symptoms, concerns, etc.)
 * and suggests appropriate appointment types with confidence scores.
 * 
 * In production, this would connect to an NLP/LLM service.
 */

const symptomKeywords = {
    'Annual Physical': {
        keywords: ['annual', 'physical', 'checkup', 'check-up', 'yearly', 'routine', 'wellness', 'health check', 'preventive'],
        weight: 1.0
    },
    'Sick Visit': {
        keywords: ['sick', 'cold', 'flu', 'fever', 'cough', 'sore throat', 'nausea', 'vomiting', 'diarrhea', 'infection', 'feeling bad', 'not feeling well', 'ill', 'pain', 'ache', 'hurt'],
        weight: 0.9
    },
    'Follow-up Visit': {
        keywords: ['follow-up', 'follow up', 'followup', 'recheck', 're-check', 'results', 'lab results', 'test results', 'after surgery', 'post-op'],
        weight: 0.85
    },
    'New Patient Consultation': {
        keywords: ['new patient', 'first visit', 'first time', 'new to', 'initial', 'consultation', 'never been', 'new doctor'],
        weight: 0.95
    },
    'Specialist Referral': {
        keywords: ['referral', 'specialist', 'referred', 'second opinion', 'specific doctor', 'expert'],
        weight: 0.8
    },
    'Preventive Screening': {
        keywords: ['screening', 'mammogram', 'colonoscopy', 'cancer screening', 'blood pressure', 'cholesterol', 'diabetes check', 'preventive'],
        weight: 0.85
    },
    'Vaccination': {
        keywords: ['vaccine', 'vaccination', 'immunization', 'shot', 'flu shot', 'covid', 'booster', 'tetanus', 'hpv', 'shingles'],
        weight: 0.95
    },
    'Telehealth Visit': {
        keywords: ['telehealth', 'virtual', 'video', 'online', 'remote', 'phone appointment', 'virtual visit', 'from home'],
        weight: 0.9
    },
    'Urgent Care': {
        keywords: ['urgent', 'emergency', 'asap', 'today', 'same day', 'right away', 'immediate', 'can\'t wait', 'serious'],
        weight: 0.85
    },
    'Lab Work / Blood Draw': {
        keywords: ['lab', 'blood work', 'blood draw', 'blood test', 'labs', 'test', 'panel', 'cbc', 'metabolic'],
        weight: 0.9
    }
};

const specialtyKeywords = {
    'Family Medicine': ['family', 'general', 'primary care', 'pcp', 'family doctor'],
    'Cardiology': ['heart', 'cardiac', 'chest pain', 'blood pressure', 'hypertension', 'cholesterol', 'palpitations', 'heart attack'],
    'Dermatology': ['skin', 'rash', 'acne', 'mole', 'eczema', 'psoriasis', 'dermatitis', 'skin cancer', 'itching', 'hives'],
    'Orthopedics': ['bone', 'joint', 'knee', 'hip', 'shoulder', 'back pain', 'spine', 'fracture', 'sports injury', 'muscle', 'arthritis'],
    'Pediatrics': ['child', 'kid', 'baby', 'infant', 'toddler', 'pediatric', 'children', 'son', 'daughter'],
    'Internal Medicine': ['internal', 'chronic', 'diabetes', 'thyroid', 'metabolic', 'adult medicine'],
    'OB/GYN': ['pregnancy', 'pregnant', 'gynecology', 'women', 'prenatal', 'pap smear', 'birth control', 'menstrual', 'reproductive'],
    'Neurology': ['headache', 'migraine', 'seizure', 'numbness', 'tingling', 'dizziness', 'memory', 'neurological', 'brain', 'nerve']
};

function analyzeIntent(userInput) {
    const input = userInput.toLowerCase().trim();

    if (!input || input.length < 2) {
        return {
            suggestions: [],
            specialties: [],
            message: 'Please describe your symptoms or reason for visit.'
        };
    }

    // Score appointment types
    const typeScores = [];
    for (const [typeName, { keywords, weight }] of Object.entries(symptomKeywords)) {
        let score = 0;
        let matchedKeywords = [];

        for (const keyword of keywords) {
            if (input.includes(keyword)) {
                score += weight * (keyword.length / input.length + 0.5);
                matchedKeywords.push(keyword);
            }
        }

        if (score > 0) {
            typeScores.push({
                appointment_type: typeName,
                confidence: Math.min(score, 0.99),
                matched_keywords: matchedKeywords
            });
        }
    }

    // Score specialties
    const specialtyScores = [];
    for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
        let score = 0;
        let matchedKeywords = [];

        for (const keyword of keywords) {
            if (input.includes(keyword)) {
                score += (keyword.length / input.length + 0.5);
                matchedKeywords.push(keyword);
            }
        }

        if (score > 0) {
            specialtyScores.push({
                specialty,
                confidence: Math.min(score, 0.99),
                matched_keywords: matchedKeywords
            });
        }
    }

    // Sort by confidence
    typeScores.sort((a, b) => b.confidence - a.confidence);
    specialtyScores.sort((a, b) => b.confidence - a.confidence);

    // Default suggestion if no matches
    if (typeScores.length === 0) {
        typeScores.push({
            appointment_type: 'New Patient Consultation',
            confidence: 0.3,
            matched_keywords: []
        });
    }

    return {
        suggestions: typeScores.slice(0, 3),
        specialties: specialtyScores.slice(0, 3),
        message: typeScores.length > 0
            ? `Based on your description, we recommend: ${typeScores[0].appointment_type}`
            : 'We suggest starting with a general consultation.',
        ai_powered: true,
        disclaimer: 'These suggestions are AI-assisted and should not replace professional medical advice.'
    };
}

// POST /api/ai/suggest - Get AI-powered appointment suggestions
router.post('/suggest', (req, res) => {
    try {
        const { description } = req.body;

        if (!description || typeof description !== 'string') {
            return res.status(400).json({ error: 'Please provide a description of your symptoms or reason for visit.' });
        }

        if (description.length > 1000) {
            return res.status(400).json({ error: 'Description is too long. Please keep it under 1000 characters.' });
        }

        // SECURITY: Strip any HTML/script tags from user input
        const sanitizedDescription = description.replace(/<[^>]*>/g, '').trim();

        // Simulate AI processing delay
        const result = analyzeIntent(sanitizedDescription);

        res.json(result);
    } catch (error) {
        console.error('AI suggestion error:', error);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

module.exports = router;
