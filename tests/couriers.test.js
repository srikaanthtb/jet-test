const request = require('supertest');
const app = require('../app');

test('GET /couriers returns all active couriers', async () => {
  const response = await request(app).get('/couriers');
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
  expect(response.body.length).toBeGreaterThan(0);
});

test('GET /couriers/:id with valid employeeId returns courier', async () => {
  const response = await request(app).get('/couriers/SC-1001');
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('employeeId', 'SC-1001');
  expect(response.body).toHaveProperty('globalCourierId');
  expect(response.body).toHaveProperty('name');
});

test('GET /couriers/:id with valid globalCourierId returns courier', async () => {
  const response = await request(app).get('/couriers/GC-9001');
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('globalCourierId', 'GC-9001');
  expect(response.body).toHaveProperty('employeeId');
});

test('GET /couriers/:id with invalid id returns 404', async () => {
  const response = await request(app).get('/couriers/INVALID-ID');
  expect(response.status).toBe(404);
  expect(response.body).toHaveProperty('error');
});
