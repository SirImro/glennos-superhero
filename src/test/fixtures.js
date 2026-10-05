// Test-only fixtures, never imported by the application.
export function makeHero(id = '70', name = 'Batman', overrides = {}) {
  return {
    response: 'success', id: String(id), name,
    image: { url: `https://images.example.test/${id}.jpg` },
    biography: {
      'full-name': 'Bruce Wayne', publisher: 'DC Comics', alignment: 'good',
      'place-of-birth': 'Gotham City', 'first-appearance': 'Detective Comics #27',
    },
    powerstats: { intelligence: '100', strength: '26', speed: '27', durability: '50', power: '47', combat: '100' },
    appearance: { race: 'Human' }, work: { occupation: 'Businessperson' },
    connections: { 'group-affiliation': 'Justice League' },
    ...overrides,
  }
}
