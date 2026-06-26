const { reconcileEvents, events, idMapping } = require('../lib/parse-events');

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

test('event processing: registration and updates', () => {
  const testEvents = [
    {
      eventId: 'test-1',
      type: 'CourierRegistered',
      courierId: 'SC-9999',
      timestamp: '2026-06-15T09:00:00Z',
      data: {
        name: 'Test Courier',
        city: 'Berlin',
        vehicle: 'bike'
      }
    },
    {
      eventId: 'test-2',
      type: 'CourierProfileUpdated',
      courierId: 'SC-9999',
      timestamp: '2026-06-15T10:00:00Z',
      data: {
        city: 'Munich',
        vehicle: 'ebike'
      }
    },
    {
      eventId: 'test-3',
      type: 'OnboardingStatusChanged',
      courierId: 'SC-9999',
      timestamp: '2026-06-15T11:00:00Z',
      data: {
        status: 'verified'
      }
    }
  ];
  const testIdMapping = { 'SC-9999': 'GC-9999' };
  const result = reconcileEvents(testEvents, testIdMapping);
  
  expect(result.length).toBeGreaterThan(0);
  const profile = result[0];
  expect(profile.employeeId).toBe('SC-9999');
  expect(profile.globalCourierId).toBe('GC-9999');
  expect(profile.name).toBe('Test Courier');
  expect(profile.city).toBe('Munich');
  expect(profile.vehicle).toBe('ebike');
  expect(profile.onboardingStatus).toBe('verified');
  expect(profile.active).toBe(true);
});
