import { Router } from 'express';
import {
  getPendingVideos,
  approveVideo,
  rejectVideo,
  createTag,
  updateTag,
  deleteTag,
  getPendingReports,
  resolveReport,
  getAllUsers,
  updateUserRole,
  updateVideo,
  createVideo,
  deleteVideo,
} from '../controllers/admin';
import { authenticate, requireAdmin } from '../middleware/auth';
import { adminRateLimit } from '../middleware/rateLimit';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);
router.use(adminRateLimit);

// Videos
router.get('/videos/pending', getPendingVideos);
router.put('/videos/:id/approve', approveVideo);
router.put('/videos/:id/reject', rejectVideo);
router.post('/videos', createVideo);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);

// Tags
router.post('/tags', createTag);
router.put('/tags/:id', updateTag);
router.delete('/tags/:id', deleteTag);

// Reports
router.get('/reports/pending', getPendingReports);
router.put('/reports/:id/resolve', resolveReport);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

export default router;
