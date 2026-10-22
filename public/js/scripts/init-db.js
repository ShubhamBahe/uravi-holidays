'use strict';
/* Creates the database (data/uravi.db, or $DATA_DIR/uravi.db) with all tables and prints a summary.
   The server does this automatically on first start; run it yourself with:  npm run db:init  */
const db = require('../db');
const i = db.info();
console.log('Database ready: ' + i.file);
console.log('Schema version: ' + i.version);
console.log('Tables: ' + i.tables.join(', '));
console.log('Enquiries: ' + i.enquiries.total + ' (new ' + i.enquiries.new + ', contacted ' + i.enquiries.contacted + ', booked ' + i.enquiries.booked + ', closed ' + i.enquiries.closed + ')');
db.close();
