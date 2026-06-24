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




if (require.main === module) {
  console.log(`Successfully parsed ${events.length} events`);
  console.log('First event:', JSON.stringify(events[0], null, 2));
}

// Export for testing
module.exports = { events, idMapping };
