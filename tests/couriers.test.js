const couriersRouter = require('../routes/couriers');
// Mock api call with jest
function mockReqRes(params = {}) {
  const req = {
    params,
    method: 'GET',
    url: params.id ? `/couriers/${params.id}` : '/couriers',
    path: params.id ? '/couriers/:id' : '/couriers',
    query: {},
    body: {},
    headers: {}
  };
  let statusCode = 200;
  let jsonData = null;
  
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonData = data;
      return res;
    }
  };
  
  return { req, res, getResponse: () => ({ statusCode, jsonData }) };
}

test('GET /couriers returns all active couriers', () => {
  const { req, res, getResponse } = mockReqRes();
  couriersRouter.stack[0].handle(req, res);
  const response = getResponse();
  
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.jsonData)).toBe(true);
  expect(response.jsonData.length).toBeGreaterThan(0);
});

test('GET /couriers/:id with valid employeeId returns courier', () => {
  const { req, res, getResponse } = mockReqRes({ id: 'SC-1001' });
  couriersRouter.stack[1].handle(req, res);
  const response = getResponse();
  
  expect(response.statusCode).toBe(200);
  expect(response.jsonData).toHaveProperty('employeeId', 'SC-1001');
  expect(response.jsonData).toHaveProperty('globalCourierId');
  expect(response.jsonData).toHaveProperty('name');
});

test('GET /couriers/:id with valid globalCourierId returns courier', () => {
  const { req, res, getResponse } = mockReqRes({ id: 'GC-9001' });
  couriersRouter.stack[1].handle(req, res);
  const response = getResponse();
  
  expect(response.statusCode).toBe(200);
  expect(response.jsonData).toHaveProperty('globalCourierId', 'GC-9001');
  expect(response.jsonData).toHaveProperty('employeeId');
});

test('GET /couriers/:id with invalid id returns 404', () => {
  const { req, res, getResponse } = mockReqRes({ id: 'INVALID-ID' });
  couriersRouter.stack[1].handle(req, res);
  const response = getResponse();
  
  expect(response.statusCode).toBe(404);
  expect(response.jsonData).toHaveProperty('error');
});
