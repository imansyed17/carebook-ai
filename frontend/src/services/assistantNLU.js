/**
 * CareBook AI — Client-side Natural Language Understanding
 * 
 * Detects user intent and extracts scheduling constraints from natural language.
 * Uses keyword/pattern matching consistent with the existing backend ai.js approach.
 */

// ─── Intent Detection ──────────────────────────────────────────────────────────

const INTENT_PATTERNS = {
  book: {
    keywords: ['book', 'schedule', 'make an appointment', 'make appointment', 'set up', 'earliest', 'next available', 'need an appointment', 'need appointment', 'want to see', 'get an appointment'],
    weight: 1.0
  },
  search: {
    keywords: ['find', 'search', 'looking for', 'who', 'available', 'show me', 'list', 'any providers', 'recommend a', 'suggest a', 'need a doctor', 'need a provider'],
    weight: 0.9
  },
  reschedule: {
    keywords: ['reschedule', 'move my', 'change my appointment', 'different time', 'different day', 'change the time', 'change the date', 'move appointment', 'switch to'],
    weight: 1.0
  },
  cancel: {
    keywords: ['cancel', 'remove', 'delete my appointment', 'cancel my', 'don\'t need', 'no longer need', 'call off'],
    weight: 1.0
  },
  status: {
    keywords: ['status', 'check my', 'upcoming', 'do i have', 'my appointments', 'when is my', 'what appointments', 'show my appointments', 'view my'],
    weight: 0.9
  }
}

// ─── Specialty Keywords ─────────────────────────────────────────────────────────

const SPECIALTY_MAP = {
  'Family Medicine': ['family medicine', 'family doctor', 'family', 'general', 'primary care', 'pcp', 'general practitioner', 'gp'],
  'Cardiology': ['cardiology', 'cardiologist', 'heart', 'cardiac', 'chest pain', 'blood pressure', 'hypertension'],
  'Dermatology': ['dermatology', 'dermatologist', 'skin', 'rash', 'acne', 'mole', 'eczema'],
  'Orthopedics': ['orthopedics', 'orthopedic', 'bone', 'joint', 'knee', 'hip', 'shoulder', 'back pain', 'spine', 'sports injury'],
  'Pediatrics': ['pediatrics', 'pediatrician', 'child', 'kid', 'baby', 'infant', 'children'],
  'Internal Medicine': ['internal medicine', 'internist', 'chronic', 'diabetes', 'thyroid'],
  'OB/GYN': ['ob/gyn', 'obgyn', 'gynecology', 'gynecologist', 'pregnancy', 'pregnant', 'prenatal', 'women\'s health'],
  'Neurology': ['neurology', 'neurologist', 'headache', 'migraine', 'seizure', 'numbness', 'dizziness'],
  'Behavioral Health': ['behavioral health', 'mental health', 'therapy', 'therapist', 'counseling', 'counselor', 'psychologist', 'psychiatrist', 'anxiety', 'depression', 'stress']
}

// ─── Time-of-Day Keywords ───────────────────────────────────────────────────────

const TIME_OF_DAY_MAP = {
  morning: ['morning', 'am', 'early', 'before noon', 'before lunch'],
  afternoon: ['afternoon', 'after lunch', 'midday', 'pm'],
  evening: ['evening', 'after work', 'after 5', 'after five', 'late afternoon', 'end of day']
}

// ─── Date Keywords ──────────────────────────────────────────────────────────────

const DATE_PATTERNS = [
  { pattern: /\btoday\b/i, value: 'today' },
  { pattern: /\btomorrow\b/i, value: 'tomorrow' },
  { pattern: /\bthis week\b/i, value: 'this_week' },
  { pattern: /\bnext week\b/i, value: 'next_week' },
  { pattern: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, value: (m) => `next_${m[1].toLowerCase()}` },
  { pattern: /\bthis\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, value: (m) => `this_${m[1].toLowerCase()}` },
  { pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, value: (m) => `next_${m[1].toLowerCase()}` },
  { pattern: /\basap\b/i, value: 'asap' },
  { pattern: /\bas soon as possible\b/i, value: 'asap' },
  { pattern: /\bearliest\b/i, value: 'asap' },
  { pattern: /\bsoon\b/i, value: 'this_week' }
]

// ─── Modality Keywords ──────────────────────────────────────────────────────────

const MODALITY_MAP = {
  virtual: ['virtual', 'telehealth', 'video', 'online', 'remote', 'phone', 'from home'],
  'in-person': ['in-person', 'in person', 'in office', 'in-office', 'face to face', 'on site', 'on-site', 'walk in']
}

// ─── Main NLU Functions ─────────────────────────────────────────────────────────

export function detectIntent(input) {
  const text = input.toLowerCase().trim()
  if (!text) return null

  let bestIntent = null
  let bestScore = 0

  for (const [intent, { keywords, weight }] of Object.entries(INTENT_PATTERNS)) {
    let score = 0
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += weight * (keyword.split(' ').length) // multi-word phrases score higher
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent
    }
  }

  return bestIntent
}

export function extractConstraints(input) {
  const text = input.toLowerCase().trim()
  const constraints = {}

  // Extract specialty
  for (const [specialty, keywords] of Object.entries(SPECIALTY_MAP)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        constraints.specialty = specialty
        break
      }
    }
    if (constraints.specialty) break
  }

  // Extract time of day
  for (const [timeOfDay, keywords] of Object.entries(TIME_OF_DAY_MAP)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        constraints.timeOfDay = timeOfDay
        break
      }
    }
    if (constraints.timeOfDay) break
  }

  // Extract date preference
  for (const { pattern, value } of DATE_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      constraints.datePreference = typeof value === 'function' ? value(match) : value
      break
    }
  }

  // Extract modality
  for (const [modality, keywords] of Object.entries(MODALITY_MAP)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        constraints.modality = modality
        break
      }
    }
    if (constraints.modality) break
  }

  // Extract interpreter need
  if (/\b(interpreter|translator|translation|language assist|speak\s+\w+)\b/i.test(text)) {
    constraints.interpreterNeed = true
  }

  // Extract email (for appointment lookup)
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)
  if (emailMatch) {
    constraints.email = emailMatch[0]
  }

  // Extract confirmation number pattern (e.g., CB-XXXXXX)
  const confMatch = text.match(/\b(CB-[A-Z0-9]+)\b/i)
  if (confMatch) {
    constraints.confirmationNumber = confMatch[1].toUpperCase()
  }

  return constraints
}

/**
 * Determine which fields are still needed for a given workflow
 */
export function getMissingFields(intent, constraints, member = null) {
  const missing = []

  if (intent === 'book' || intent === 'search') {
    if (!constraints.specialty) missing.push('specialty')
  }

  if (intent === 'book') {
    if (!constraints.datePreference) missing.push('datePreference')
    if (!constraints.timeOfDay) missing.push('timeOfDay')
  }

  if (intent === 'reschedule' || intent === 'cancel' || intent === 'status') {
    if (!constraints.email && !constraints.confirmationNumber && !member) {
      missing.push('identification')
    }
  }

  return missing
}

/**
 * Generate a human-friendly clarification question for a missing field
 */
export function getClarificationQuestion(field) {
  const questions = {
    specialty: "What type of provider are you looking for? (e.g., Family Medicine, Cardiology, Dermatology, Behavioral Health)",
    datePreference: "When would you like your appointment? (e.g., this week, next Tuesday, as soon as possible)",
    timeOfDay: "Do you have a time preference? (morning, afternoon, or evening)",
    identification: "I can look that up for you! Could you share your email address or confirmation number?",
    modality: "Would you prefer an in-person or virtual (telehealth) visit?",
  }
  return questions[field] || `Could you provide your ${field}?`
}

/**
 * Parse a date preference string into an actual date range
 */
export function resolveDateRange(datePreference) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const formatDate = (d) => d.toISOString().split('T')[0]

  const dayIndex = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }

  if (!datePreference) {
    // Default: next 30 days
    const end = new Date(today)
    end.setDate(end.getDate() + 30)
    return { startDate: formatDate(today), endDate: formatDate(end) }
  }

  if (datePreference === 'today') {
    return { startDate: formatDate(today), endDate: formatDate(today) }
  }

  if (datePreference === 'tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return { startDate: formatDate(tomorrow), endDate: formatDate(tomorrow) }
  }

  if (datePreference === 'this_week') {
    const endOfWeek = new Date(today)
    const daysUntilSunday = 7 - today.getDay()
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday)
    return { startDate: formatDate(today), endDate: formatDate(endOfWeek) }
  }

  if (datePreference === 'next_week') {
    const startOfNext = new Date(today)
    const daysUntilNextMon = ((1 - today.getDay()) + 7) % 7 || 7
    startOfNext.setDate(startOfNext.getDate() + daysUntilNextMon)
    const endOfNext = new Date(startOfNext)
    endOfNext.setDate(endOfNext.getDate() + 6)
    return { startDate: formatDate(startOfNext), endDate: formatDate(endOfNext) }
  }

  if (datePreference === 'asap') {
    const end = new Date(today)
    end.setDate(end.getDate() + 14)
    return { startDate: formatDate(today), endDate: formatDate(end) }
  }

  // Handle "next_monday", "this_tuesday", etc.
  const dayMatch = datePreference.match(/^(next|this)_(\w+)$/)
  if (dayMatch) {
    const [, prefix, dayName] = dayMatch
    const targetDay = dayIndex[dayName]
    if (targetDay !== undefined) {
      const target = new Date(today)
      let diff = (targetDay - today.getDay() + 7) % 7
      if (prefix === 'next' && diff === 0) diff = 7
      if (prefix === 'next' && diff <= today.getDay()) diff += 7
      target.setDate(target.getDate() + diff)
      return { startDate: formatDate(target), endDate: formatDate(target) }
    }
  }

  // Default fallback
  const end = new Date(today)
  end.setDate(end.getDate() + 30)
  return { startDate: formatDate(today), endDate: formatDate(end) }
}
