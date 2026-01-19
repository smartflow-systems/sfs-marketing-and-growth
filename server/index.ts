import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import campaignsRoutes from './routes/campaigns';
import utmRoutes from './routes/utm';
import postsRoutes from './routes/posts';
import bioRoutes from './routes/bio';
import templatesRoutes from './routes/templates';
import webhooksRoutes from './routes/webhooks';
import calendarRoutes from './routes/calendar';
import { scheduledTasksService } from './services/scheduled-tasks';

// Load and validate environment variables
dotenv.config();

// CRITICAL: Validate required environment variables on startup
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ FATAL: Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease set these variables in your .env file');
  process.exit(1);
}

// Validate JWT secret strength in production
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('❌ FATAL: JWT_SECRET must be at least 32 characters in production');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Webhooks need raw body - must be before json middleware
app.use('/api/webhooks', webhooksRoutes);

// PERFORMANCE: Enable gzip/brotli compression for all responses
app.use(compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  // Compression level (6 is a good balance between speed and compression)
  level: 6,
  // Filter which responses to compress
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// SECURITY: Enhanced security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Stripe iframe
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Middleware
// Security: Configure CORS with explicit allowed origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/utm', utmRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/bio', bioRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/calendar', calendarRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Marketing & Growth API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);

  // Start scheduled tasks (post reminders, weekly digests)
  scheduledTasksService.start();
});

export default app;
