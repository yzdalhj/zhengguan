import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import videoRoutes from './routes/videos';
import tagRoutes from './routes/tags';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    seo: {
      title: '影视分镜参考库 API',
      description: '影视分镜参考库后端API服务',
    },
  });
});

app.get('/api/sitemap', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, updated_at FROM videos WHERE status = \'approved\' ORDER BY updated_at DESC');
    const baseUrl = process.env.BASE_URL || CORS_ORIGIN;
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/tags</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

    result.rows.forEach((video: any) => {
      sitemap += `  <url>
    <loc>${baseUrl}/video/${video.id}</loc>
    <lastmod>${video.updated_at.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    sitemap += '</urlset>';

    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate sitemap' });
  }
});

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

const startServer = async () => {
  try {
    await connectRedis();
    await pool.connect();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS origin: ${CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
