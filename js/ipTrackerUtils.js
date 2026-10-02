export function normalizeSearchInput(value = '') {
  return String(value).trim()
}

export function isValidIpAddress(input = '') {
  const normalized = normalizeSearchInput(input)

  if (!normalized) {
    return false
  }

  return /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(normalized)
}

export function isValidDomainName(input = '') {
  const normalized = normalizeSearchInput(input)

  if (!normalized) {
    return false
  }

  return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(normalized)
}

export function buildIpGeoUrl(apiKey = '', query = '') {
  const cleanApiKey = String(apiKey).split('&')[0].trim()
  const normalizedQuery = normalizeSearchInput(query)

  if (!normalizedQuery) {
    return `https://api.ipgeolocation.io/ipgeo?apiKey=${cleanApiKey}`
  }

  return `https://api.ipgeolocation.io/ipgeo?apiKey=${cleanApiKey}&ip=${encodeURIComponent(normalizedQuery)}`
}
