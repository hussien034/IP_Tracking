import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildIpGeoUrl,
  isValidIpAddress,
  normalizeSearchInput,
} from '../js/ipTrackerUtils.js'

test('validates IPv4 addresses correctly', () => {
  assert.equal(isValidIpAddress('8.8.8.8'), true)
  assert.equal(isValidIpAddress('999.1.1.1'), false)
  assert.equal(isValidIpAddress('example.com'), false)
  assert.equal(isValidIpAddress('   1.2.3.4  '), true)
})

test('normalizes user search input', () => {
  assert.equal(normalizeSearchInput('  example.com  '), 'example.com')
  assert.equal(normalizeSearchInput('8.8.8.8'), '8.8.8.8')
})

test('builds a valid GEO API URL for IP lookup', () => {
  const url = buildIpGeoUrl('demo-key', '8.8.8.8')
  assert.equal(
    url,
    'https://api.ipgeolocation.io/ipgeo?apiKey=demo-key&ip=8.8.8.8',
  )
})
