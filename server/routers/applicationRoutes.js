import express from 'express';
import applicationController from '../controllers/applicationController.js';
import jobController from '../controllers/jobController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/me', authenticate, authorize(['student']), applicationController.getMyApplications);
router.get('/company/:companyId', authenticate, authorize(['company', 'admin']), applicationController.getCompanyApplications);
router.post('/jobs/:id/apply', authenticate, authorize(['student']), jobController.applyToJob);
router.patch('/:applicationId/status', authenticate, authorize(['company', 'admin']), jobController.updateApplicationStatus);

export default router;
