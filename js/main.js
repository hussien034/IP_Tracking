const ipAddressField = document.querySelector('.ipAddressField')
const timezoneInput = document.querySelector('.timezoneInput')
const countryLocationInput = document.querySelector('.locationInput')
const ispInput = document.querySelector('.ispInput')
const submitBtn = document.querySelector('.submit-btn')
const inputField = document.querySelector('.input-field')
const searchForm = document.querySelector('#ip-search-form')
const searchFeedback = document.querySelector('#search-feedback')

let map = L.map('map').setView([20, 0], 2)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map)

const isValidIpAddress = (value) => {
  const normalizedValue = value.trim()
  return /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(normalizedValue)
}

const isValidDomainName = (value) => {
  const normalizedValue = value.trim()
  return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(normalizedValue)
}

const setFeedback = (message, isError = false) => {
  searchFeedback.textContent = message
  searchFeedback.classList.toggle('error', isError)
}

const updateLocationData = (response) => {
  const ipAddress = response.ip || 'N/A'
  const timeZone = response.timezone || response.utc_offset || 'N/A'
  const countryLocation = response.country_name || response.country || 'Unknown'
  const cityLocation = response.city || 'Unknown'
  const regionLocation = response.region || ''
  const postalCode = response.postal || ''
  const isp = response.org || response.isp || 'N/A'
  const lat = response.latitude || 0
  const lng = response.longitude || 0

  ipAddressField.textContent = ipAddress
  timezoneInput.textContent = timeZone
  countryLocationInput.textContent = [countryLocation, cityLocation, regionLocation, postalCode]
    .filter(Boolean)
    .join(', ')
  ispInput.textContent = isp

  if (lat && lng) {
    mapLocation(lat, lng)
  }
}

const resolveDomainToIp = async (domain) => {
  const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}`)

  if (!response.ok) {
    throw new Error('Unable to resolve domain')
  }

  const data = await response.json()
  const answerRecord = (data.Answer || []).find((item) => item.type === 'A')

  if (!answerRecord) {
    throw new Error('No A record found for this domain')
  }

  return answerRecord.data
}

const fetchGeoData = async (query) => {
  const normalizedQuery = query.trim()

  try {
    let targetQuery = normalizedQuery

    if (isValidDomainName(normalizedQuery)) {
      targetQuery = await resolveDomainToIp(normalizedQuery)
    }

    const url = targetQuery
      ? `https://ipapi.co/${encodeURIComponent(targetQuery)}/json/`
      : 'https://ipapi.co/json/'

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Request failed')
    }

    const data = await response.json()
    updateLocationData(data)

    if (normalizedQuery) {
      setFeedback('Location updated successfully.')
    }
  } catch (error) {
    setFeedback('Unable to fetch data for that query. Please try again.', true)
  }
}

const mapLocation = (lat, lng) => {
  const markerIcon = L.icon({
    iconUrl: 'image/icon-location.svg',
    iconSize: [46, 56],
    iconAnchor: [23, 55],
  })

  if (window.currentMarker) {
    map.removeLayer(window.currentMarker)
  }

  map.setView([lat, lng], 12)
  window.currentMarker = L.marker([lat, lng], { icon: markerIcon }).addTo(map)
}

fetchGeoData('')

searchForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const query = inputField.value.trim()

  if (!query) {
    setFeedback('Please enter an IP address or domain to search.', true)
    inputField.focus()
    return
  }

  if (!isValidIpAddress(query) && !isValidDomainName(query)) {
    setFeedback('You have entered an invalid IP address or domain.', true)
    inputField.focus()
    return
  }

  fetchGeoData(query)
})

submitBtn.addEventListener('click', (event) => {
  event.preventDefault()
  searchForm.requestSubmit()
})
