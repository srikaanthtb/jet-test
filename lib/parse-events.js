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
      status: 'active',
      onboardingStatus: null,
      active: true
    };

    // Determine if this is an employeeId or globalCourierId
    if (courierId.startsWith('SC-')) {
      profile.employeeId = courierId;
      profile.globalCourierId = idMapping[courierId] || null;
    } else if (courierId.startsWith('GC-')) {
      profile.globalCourierId = courierId;
      // Find employeeId from id-mapping
      const employeeId = Object.keys(idMapping).find(key => idMapping[key] === courierId);
      profile.employeeId = employeeId || null;
    }

    // Process events in order
    courierEvents.forEach(event => {
      // Apply "latest timestamp wins" rule for each field
      const timestamp = new Date(event.timestamp);
      switch (event.type) {
        // handle courier registration with latest timestamp wins
        case 'CourierRegistered':
          profile.employeeId = timestamp > profile.employeeId ? event.courierId : profile.employeeId;
          profile.globalCourierId = timestamp > profile.globalCourierId ? idMapping[event.courierId] : profile.globalCourierId;
          profile.name = timestamp > profile.name ? event.data.name : profile.name;
          profile.city = timestamp > profile.city ? event.data.city : profile.city;
          profile.vehicle = timestamp > profile.vehicle ? event.data.vehicle : profile.vehicle;
          break;
        
        case 'CourierProfileUpdated':
          if (event.data.city) profile.city = event.data.city;
          if (event.data.vehicle) profile.vehicle = event.data.vehicle;
          break;
        
        case 'CourierStatusUpdated':
          profile.status = event.data.status;
          break;
        
        case 'CourierDeleted':
          profile.status = 'deleted';
          break;
      }
    });

    profiles[courierId] = profile;
  });

  return profiles;
}


if (require.main === module) {
  console.log(`Successfully parsed ${events.length} events`);
  console.log('First event:', JSON.stringify(events[0], null, 2));
}

// Export for testing
module.exports = { events, idMapping, reconcileEvents };
