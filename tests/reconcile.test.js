const { reconcileEvents, events, idMapping } = require('../lib/parse-events');

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

test('deactivated couriers are filtered out', () => {
  const result = reconcileEvents(events, idMapping);
  result.forEach(profile => {
    expect(profile.active).toBe(true);
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
