const fs = require('fs');
const path = require('path');

// Read and parse events.json
const eventsPath = path.join(__dirname, 'events.json');
const eventsData = fs.readFileSync(eventsPath, 'utf8');
const events = JSON.parse(eventsData);

// Export for testing
module.exports = { events };

// Log when run directly
if (require.main === module) {
  console.log(`Successfully parsed ${events.length} events`);
  console.log('First event:', JSON.stringify(events[0], null, 2));
}
