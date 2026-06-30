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
  // Deduplicate events by eventId, keeping newest timestamp
  const eventMap = new Map();
  let duplicateCount = 0;
  
  events.forEach(event => {
    if (eventMap.has(event.eventId)) {
      duplicateCount++;
      const existing = eventMap.get(event.eventId);
      const existingTime = new Date(existing.timestamp);
      const newTime = new Date(event.timestamp);
      
      if (newTime > existingTime) {
        eventMap.set(event.eventId, event);
      }
    } else {
      eventMap.set(event.eventId, event);
    }
  });
  
  const deduplicatedEvents = Array.from(eventMap.values());
  
  // Group deduplicated events by courierId
  const eventsByCourier = {};
  
  deduplicatedEvents.forEach(event => {
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

    // Apply "latest timestamp wins" rule for each field
    courierEvents.forEach(event => {
      const timestamp = new Date(event.timestamp);
      
      // Handle CourierRegistered
      if (event.type === 'CourierRegistered') {
        if (!profile.nameTimestamp || timestamp > new Date(profile.nameTimestamp)) {
          profile.name = event.data.name;
          profile.nameTimestamp = event.timestamp;
        }
        if (!profile.cityTimestamp || timestamp > new Date(profile.cityTimestamp)) {
          profile.city = event.data.city;
          profile.cityTimestamp = event.timestamp;
        }
        if (!profile.vehicleTimestamp || timestamp > new Date(profile.vehicleTimestamp)) {
          profile.vehicle = event.data.vehicle;
          profile.vehicleTimestamp = event.timestamp;
        }
      }

      // Handle CourierProfileUpdated
      if (event.type === 'CourierProfileUpdated') {
        for (const [field, value] of Object.entries(event.data)) {
          const timestampKey = `${field}Timestamp`;
          if (!profile[timestampKey] || timestamp > new Date(profile[timestampKey])) {
            profile[field] = value;
            profile[timestampKey] = event.timestamp;
          }
        }
      }

      // Handle OnboardingStatusChanged
      if (event.type === 'OnboardingStatusChanged') {
        if (!profile.onboardingStatusTimestamp || timestamp > new Date(profile.onboardingStatusTimestamp)) {
          profile.onboardingStatus = event.data.status;
          profile.onboardingStatusTimestamp = event.timestamp;
        }
      }

      // Handle CourierDeactivated
      if (event.type === 'CourierDeactivated') {
        profile.active = false;
      }
    });

    // Clean up timestamp fields
    delete profile.nameTimestamp;
    delete profile.cityTimestamp;
    delete profile.vehicleTimestamp;
    delete profile.onboardingStatusTimestamp;
    Object.keys(profile).forEach(key => {
      if (key.endsWith('Timestamp')) {
        delete profile[key];
      }
    });

    profiles[courierId] = profile;
  });

  // Merge profiles that have both employeeId and globalCourierId
  const mergedProfiles = {};
  Object.values(profiles).forEach(profile => {
    const key = profile.employeeId || profile.globalCourierId;
    if (!mergedProfiles[key]) {
      mergedProfiles[key] = profile;
    } else {
      // Merge with existing profile, preferring non-null values
      const existing = mergedProfiles[key];
      if (!existing.employeeId && profile.employeeId) existing.employeeId = profile.employeeId;
      if (!existing.globalCourierId && profile.globalCourierId) existing.globalCourierId = profile.globalCourierId;
      if (!existing.name && profile.name) existing.name = profile.name;
      if (!existing.city && profile.city) existing.city = profile.city;
      if (!existing.vehicle && profile.vehicle) existing.vehicle = profile.vehicle;
      if (!existing.onboardingStatus && profile.onboardingStatus) existing.onboardingStatus = profile.onboardingStatus;
      if (!profile.active) existing.active = false;
    }
  });

  // Filter to only active couriers
  const activeProfiles = Object.values(mergedProfiles).filter(p => p.active);

  return activeProfiles;
}


// Compute reconciled profiles
const reconciledProfiles = reconcileEvents(events, idMapping);

if (require.main === module) {
  console.log(`Successfully parsed ${events.length} events`);
  console.log(`Reconciled ${reconciledProfiles.length} active courier profiles`);
  console.log('Sample profile:', JSON.stringify(reconciledProfiles[0], null, 2));
}

// Export for testing
module.exports = { events, idMapping, reconcileEvents, reconciledProfiles };
