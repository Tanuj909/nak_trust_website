export const categoryDisplayMap = {
  A: {
    hi: 'संवर्ग A (Government)',
    en: 'Category A (Government)',
  },
  B: {
    hi: 'संवर्ग B (Private)',
    en: 'Category B (Private)',
  },
  C: {
    hi: 'संवर्ग C (Professional)',
    en: 'Category C (Professional)',
  },
  D: {
    hi: 'संवर्ग D (Others)',
    en: 'Category D (Others)',
  },
}

export function formatCategory(category, isHindi = true) {
  if (!category) return '—'
  const raw = String(category).trim()
  const code = raw.toUpperCase()
  if (categoryDisplayMap[code]) {
    return isHindi ? categoryDisplayMap[code].hi : categoryDisplayMap[code].en
  }
  // If raw already contains descriptive parens
  if (raw.includes('(')) {
    return raw
  }
  // Match single letter A-D even if prefixed with संवर्ग/Category
  const match = raw.match(/[A-D]/i)
  if (match && categoryDisplayMap[match[0].toUpperCase()]) {
    return isHindi ? categoryDisplayMap[match[0].toUpperCase()].hi : categoryDisplayMap[match[0].toUpperCase()].en
  }
  return isHindi ? `संवर्ग ${raw}` : `Category ${raw}`
}

export function getCategoryBadge(category, isHindi = true) {
  return {
    label: formatCategory(category, isHindi),
    bg: '#dbeafe',
    color: '#1e40af',
  }
}

