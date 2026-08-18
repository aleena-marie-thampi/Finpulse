require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

(async () => {
  try {
    console.log('Attempting to connect to:', uri.replace(/:\/\/.*@/, '://<creds>@'));

    // Try forcing public DNS servers for SRV resolution (helps when local DNS blocks SRV)
    try {
      const dns = require('dns');
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('Using DNS servers:', dns.getServers());
    } catch (dnsErr) {
      console.warn('Could not set DNS servers:', dnsErr.message);
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected');
  } catch (err) {
    console.error('Connection error (full):', err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch(e){}
  }
})();
