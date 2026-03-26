import cron from 'node-cron';
import dotenv from 'dotenv';
import * as YouTubeCrawler from './youtube';
import * as BilibiliCrawler from './bilibili';
import pool from '../config/database';

dotenv.config();

const SCHEDULE = process.env.CRAWLER_SCHEDULE || '0 * * * *';

interface Keyword {
  id: number;
  keyword: string;
  platform: string;
  enabled: boolean;
}

export const getEnabledKeywords = async (): Promise<Keyword[]> => {
  const result = await pool.query(
    'SELECT * FROM keywords WHERE enabled = true ORDER BY last_crawled_at ASC NULLS FIRST LIMIT 10'
  );
  return result.rows;
};

export const updateKeywordLastCrawled = async (id: number): Promise<void> => {
  await pool.query(
    'UPDATE keywords SET last_crawled_at = NOW(), crawl_count = crawl_count + 1 WHERE id = $1',
    [id]
  );
};

export const crawlKeyword = async (keyword: Keyword): Promise<number> => {
  let imported = 0;

  try {
    if (keyword.platform === 'youtube') {
      const result = await YouTubeCrawler.searchYouTube({ keyword: keyword.keyword, maxResults: 20 });
      
      for (const item of result.items || []) {
        try {
          const videoId = item.id.videoId;
          await YouTubeCrawler.importYouTubeVideo(videoId);
          imported++;
          console.log(`Imported YouTube video ${videoId} for keyword "${keyword.keyword}"`);
        } catch (error) {
          console.debug(`Skipping video for "${keyword.keyword}":`, (error as Error).message);
        }
      }
    } else if (keyword.platform === 'bilibili') {
      const result = await BilibiliCrawler.searchBilibili({ keyword: keyword.keyword, pageSize: 20 });
      
      for (const item of result.items || []) {
        try {
          const bvid = item.bvid;
          await BilibiliCrawler.importBilibiliVideo(bvid);
          imported++;
          console.log(`Imported Bilibili video ${bvid} for keyword "${keyword.keyword}"`);
        } catch (error) {
          console.debug(`Skipping video for "${keyword.keyword}":`, (error as Error).message);
        }
      }
    }

    await updateKeywordLastCrawled(keyword.id);
    console.log(`Completed crawling for "${keyword.keyword}", imported ${imported} videos`);
  } catch (error) {
    console.error(`Error crawling keyword "${keyword.keyword}":`, error);
  }

  return imported;
};

export const runCrawler = async (): Promise<void> => {
  console.log('Starting scheduled crawl...');
  
  const keywords = await getEnabledKeywords();
  let totalImported = 0;

  for (const keyword of keywords) {
    const imported = await crawlKeyword(keyword);
    totalImported += imported;
  }

  console.log(`Scheduled crawl completed, total imported: ${totalImported}`);
};

export const startScheduler = (): void => {
  // Bilibili 不需要 API Key，可以直接运行；YouTube 需要 API Key
  console.log('Starting crawler scheduler (Bilibili ready, YouTube requires API key)');

  const tableCheck = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS keywords (
          id SERIAL PRIMARY KEY,
          keyword VARCHAR(100) NOT NULL,
          platform VARCHAR(20) NOT NULL,
          enabled BOOLEAN DEFAULT true,
          crawl_count INT DEFAULT 0,
          last_crawled_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
    } catch (error) {
      console.error('Error creating keywords table:', error);
    }
  };

  tableCheck();

  cron.schedule(SCHEDULE, async () => {
    await runCrawler();
  });

  console.log(`Crawler scheduler started, running: ${SCHEDULE}`);

  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: running crawler immediately...');
    setTimeout(runCrawler, 5000);
  }
};

export default {
  startScheduler,
  runCrawler,
  crawlKeyword,
  getEnabledKeywords,
};
