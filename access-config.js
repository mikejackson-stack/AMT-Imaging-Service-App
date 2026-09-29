// Single access list for the AMT field app.
// scripts/gen-firestore-rules.js copies WRITERS and READERS into firestore.rules.
// Emails are stored lowercase and compared case-insensitively.
const ACCESS_CONFIG = {
  WRITERS: [
    'antonio@amtimagingsolutions.com',
    'tito@amtimagingsolutions.com',
    'mike.jackson@amtimagingsolutions.com',
    'misemilyoliveros@icloud.com',
    'mjackson212@gmail.com'
  ],
  READERS: [],
  STAFF: [
    {id:'michael', name:'Michael Jackson', emails:['mike.jackson@amtimagingsolutions.com','mjackson212@gmail.com']},
    {id:'antonio', name:'Antonio Jackson', emails:['antonio@amtimagingsolutions.com']},
    {id:'candelario', name:'Candelario Juarez', emails:['tito@amtimagingsolutions.com']},
    {id:'emily', name:'Emily Oliveros', emails:['misemilyoliveros@icloud.com']}
  ],
  PIN_ITERATIONS: 100000,
  PIN_CACHE_KEY: 'amt_pin_hashes_v43',
  PIN_LOCK_KEY: 'amt_pin_lock_v43',
  PIN_MAX_FAILS: 5,
  PIN_LOCK_BASE_MS: 15 * 60 * 1000
};
