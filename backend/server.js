require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    const rawUri = process.env.MONGODB_URI;
    if (!rawUri) {
      console.error('❌ MONGODB_URI is not set in environment. Please add it to your .env');
      process.exit(1);
    }
    const uri = rawUri.trim();

    // Log only the host portion to avoid leaking credentials
    let hostInfo = uri;
    try {
      // Convert SRV-style URI to a parseable URL for extracting host
      const hostParse = new URL(uri.replace('mongodb+srv://', 'http://'));
      hostInfo = hostParse.host;
    } catch (e) {
      // ignore parsing errors, keep raw
    }
    console.log('Connecting to MongoDB host:', hostInfo);

    // Force a known working DNS resolver for SRV lookups when necessary.
    try {
      const dns = require('dns');
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('Using DNS servers:', dns.getServers());
    } catch (dnsErr) {
      console.warn('Could not set DNS servers for SRV lookup:', dnsErr.message);
    }

    // If using SRV, do a DNS SRV check first and give clearer guidance on failure
    if (uri.startsWith('mongodb+srv://')) {
      const dns = require('dns').promises;
      const srvName = `_mongodb._tcp.${hostInfo.split(':')[0]}`;
      try {
        await dns.resolveSrv(srvName);
      } catch (dnsErr) {
        console.error(`DNS SRV resolution failed for ${srvName}:`, dnsErr.message);
        console.error('This often means DNS lookups for SRV records are blocked (VPN, corporate DNS, or firewall).');
        console.error('Workarounds: disable VPN/proxy, allow SRV DNS, or use the standard (non-SRV) connection string from Atlas.');
      }
    }

    // Connect without deprecated options (mongoose v6+ ignores them)
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
};

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/income', require('./routes/income'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 FinPulse API running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
});
