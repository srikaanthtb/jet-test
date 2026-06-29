var express = require('express');
var router = express.Router();
const { reconciledProfiles } = require('../lib/parse-events');

/* GET all couriers */
router.get('/', function(req, res, next) {
  res.json(reconciledProfiles);
});

/* GET single courier by id (employeeId or globalCourierId) */
router.get('/:id', function(req, res, next) {
  const id = req.params.id;
  const courier = reconciledProfiles.find(p => 
    p.employeeId?.toLowerCase() === id.toLowerCase() || 
    p.globalCourierId?.toLowerCase() === id.toLowerCase()
  );
  
  if (!courier) {
    return res.status(404).json({ error: 'Courier not found' });
  }
  
  res.json(courier);
});

module.exports = router;
