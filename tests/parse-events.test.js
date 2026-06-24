const { reconcileEvents } = require('../reconcile');
const { events } = require('../lib/parse-events');
const idMapping = require('../id-mapping.json');

test('parses events.json and returns an array', () => {
  expect(Array.isArray(events)).toBe(true);
});

test('events array is not empty', () => {
  expect(events.length).toBeGreaterThan(0);
});

test('each event has required fields', () => {
  events.forEach(event => {
    expect(event).toHaveProperty('eventId');
    expect(event).toHaveProperty('type');
    expect(event).toHaveProperty('courierId');
    expect(event).toHaveProperty('timestamp');
    expect(event).toHaveProperty('data');
  });
});

test('each profile has required fields', () => {
  const result = reconcileEvents(events, idMapping);
  result.forEach(profile => {
    expect(profile).toHaveProperty('employeeId');
    expect(profile).toHaveProperty('globalCourierId');
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('city');
    expect(profile).toHaveProperty('vehicle');
    expect(profile).toHaveProperty('onboardingStatus');
    expect(profile).toHaveProperty('active');
  });
});

