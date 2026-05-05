import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import campaignsRoutes from './routes/campaigns';
import utmRoutes from './routes/utm';
import postsRoutes from './routes/posts';
import bioRoutes from './routes/bio';
import templatesRoutes from './routes/templates';
import webhooksRoutes from './routes/webhooks';
import calendarRoutes from './routes/calendar';
import { scheduledTasksService } from './services/scheduled-tasks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// Webhooks need raw body - must be before json middleware
app.use('/api/webhooks', webhooksRoutes);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// CORS with explicit allowed origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
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
app.get('/health', (_req, res) => {
  res.json({ ok: true });
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
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message || 'Unknown error');
  res.status(err.status || 500).json({
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Marketing & Growth API running on port ${PORT}`);
  scheduledTasksService.start();
});

export default app;
