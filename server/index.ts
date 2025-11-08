import express from 'express';
import cors from 'cors';
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

// Webhooks need raw body - must be before json middleware
app.use('/api/webhooks', webhooksRoutes);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
