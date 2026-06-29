const { reconcileEvents, events, idMapping } = require('../lib/parse-events');

// Event parsing tests
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

// Reconciliation logic tests
test('reconcileEvents returns an array', () => {
  const result = reconcileEvents(events, idMapping);
  expect(Array.isArray(result)).toBe(true);
});

test('reconciled profiles are not empty', () => {
  const result = reconcileEvents(events, idMapping);
  expect(result.length).toBeGreaterThan(0);
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

test('latest timestamp wins for city field', () => {
  // GC-9005 has two CourierProfileUpdated events for city:
  // 12:00:00Z -> Hamburg
  // 14:00:00Z -> Munich
  // Munich should win
  const result = reconcileEvents(events, idMapping);
  const gc9005 = result.find(p => p.globalCourierId === 'GC-9005');
  expect(gc9005).toBeDefined();
  expect(gc9005.city).toBe('Munich');
});

test('latest timestamp wins for onboarding status', () => {
  // SC-1002 has OnboardingStatusChanged at 15:00:00Z -> pending
  const result = reconcileEvents(events, idMapping);
  const sc1002 = result.find(p => p.employeeId === 'SC-1002');
  expect(sc1002).toBeDefined();
  expect(sc1002.onboardingStatus).toBe('pending');
});

test('employeeId and globalCourierId mapping works', () => {
  const result = reconcileEvents(events, idMapping);
  const sc1001 = result.find(p => p.employeeId === 'SC-1001');
  expect(sc1001).toBeDefined();
  expect(sc1001.globalCourierId).toBe('GC-9001');
});

test('courier with only globalCourierId is included', () => {
  const result = reconcileEvents(events, idMapping);
  const gc9003 = result.find(p => p.globalCourierId === 'GC-9003');
  expect(gc9003).toBeDefined();
  expect(gc9003.name).toBe('Amara Okafor');
});

//same test again but with mock data
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

test('duplicate detection: identical timestamps keeps one', () => {
  const testEvents = [
    {
      eventId: 'dup-1',
      type: 'CourierRegistered',
      courierId: 'SC-8888',
      timestamp: '2026-06-15T09:00:00Z',
      data: {
        name: 'Duplicate Test',
        city: 'Berlin',
        vehicle: 'bike'
      }
    },
    {
      eventId: 'dup-1',
      type: 'CourierRegistered',
      courierId: 'SC-8888',
      timestamp: '2026-06-15T09:00:00Z',
      data: {
        name: 'Duplicate Test',
        city: 'Berlin',
        vehicle: 'bike'
      }
    }
  ];
  const testIdMapping = { 'SC-8888': 'GC-8888' };
  const result = reconcileEvents(testEvents, testIdMapping);
  
  expect(result.length).toBe(1);
  expect(result[0].employeeId).toBe('SC-8888');
});

test('duplicate detection: different timestamps keeps newest', () => {
  const testEvents = [
    {
      eventId: 'dup-2',
      type: 'CourierProfileUpdated',
      courierId: 'SC-7777',
      timestamp: '2026-06-15T09:00:00Z',
      data: {
        city: 'Berlin'
      }
    },
    {
      eventId: 'dup-2',
      type: 'CourierProfileUpdated',
      courierId: 'SC-7777',
      timestamp: '2026-06-15T10:00:00Z',
      data: {
        city: 'Munich'
      }
    }
  ];
  const testIdMapping = { 'SC-7777': 'GC-7777' };
  const result = reconcileEvents(testEvents, testIdMapping);
  
  expect(result.length).toBe(1);
  expect(result[0].city).toBe('Munich');
});

test('duplicate detection: actual duplicate in events.json is handled', () => {
  const result = reconcileEvents(events, idMapping);
  // The duplicate eventId df48d18c-5a0d-4de3-9fc9-b00aa7111be8 appears twice
  // Should be deduplicated and GC-9005 should still have correct city (Munich from 14:00:00Z)
  const gc9005 = result.find(p => p.globalCourierId === 'GC-9005');
  expect(gc9005).toBeDefined();
  expect(gc9005.city).toBe('Munich');
});

test('duplicate detection does not break existing reconciliation logic', () => {
  const testEvents = [
    {
      eventId: 'test-4',
      type: 'CourierRegistered',
      courierId: 'SC-6666',
      timestamp: '2026-06-15T09:00:00Z',
      data: {
        name: 'Integration Test',
        city: 'Berlin',
        vehicle: 'bike'
      }
    },
    {
      eventId: 'test-5',
      type: 'CourierProfileUpdated',
      courierId: 'SC-6666',
      timestamp: '2026-06-15T10:00:00Z',
      data: {
        city: 'Munich'
      }
    },
    {
      eventId: 'test-6',
      type: 'OnboardingStatusChanged',
      courierId: 'SC-6666',
      timestamp: '2026-06-15T11:00:00Z',
      data: {
        status: 'verified'
      }
    }
  ];
  const testIdMapping = { 'SC-6666': 'GC-6666' };
  const result = reconcileEvents(testEvents, testIdMapping);
  
  expect(result.length).toBe(1);
  expect(result[0].name).toBe('Integration Test');
  expect(result[0].city).toBe('Munich');
  expect(result[0].vehicle).toBe('bike');
  expect(result[0].onboardingStatus).toBe('verified');
});