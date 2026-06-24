const fs = require('fs');
const path = require('path');

// Read and parse events.json
const eventsPath = path.join(__dirname, '/../events.json');
const eventsData = fs.readFileSync(eventsPath, 'utf8');
const events = JSON.parse(eventsData);

// Read and parse id-mapping.json
const idMappingPath = path.join(__dirname, '/../id-mapping.json');
const idMappingData = fs.readFileSync(idMappingPath, 'utf8');
const idMapping = JSON.parse(idMappingData);

function reconcileEvents(events, idMapping) {
  // Group events by courierId
  const eventsByCourier = {};
  
  events.forEach(event => {
    const courierId = event.courierId;
    if (!eventsByCourier[courierId]) {
      eventsByCourier[courierId] = [];
    }
    eventsByCourier[courierId].push(event);
  });

  // Build profiles for each courier
  const profiles = {};

  Object.keys(eventsByCourier).forEach(courierId => {
    const courierEvents = eventsByCourier[courierId];
    const profile = {
      employeeId: null,
      globalCourierId: null,
      name: null,
      city: null,
      vehicle: null,
      status: 'active'
    };
    profiles[courierId] = profile;
  });
  
  return profiles;
}


if (require.main === module) {
  console.log(`Successfully parsed ${events.length} events`);
  console.log('First event:', JSON.stringify(events[0], null, 2));
}

// Export for testing
module.exports = { events, idMapping };
