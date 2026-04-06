import express from 'express';
import applicationController from '../controllers/applicationController.js';
import jobController from '../controllers/jobController.js';
import { authenticate, isCompanyOrAdmin, isStudent } from '../middlewares/auth.js';

const router = express.Router();

router.get('/me', authenticate, isStudent, applicationController.getMyApplications);
router.get('/company/:companyId', authenticate, isCompanyOrAdmin, applicationController.getCompanyApplications);
router.post('/jobs/:id/apply', authenticate, isStudent, jobController.applyToJob);
router.patch('/:applicationId/status', authenticate, isCompanyOrAdmin, jobController.updateApplicationStatus);
router.post('/jobs/:jobId/students/:studentId/view', authenticate, isCompanyOrAdmin, applicationController.markProfileViewed);
router.post('/jobs/:jobId/students/:studentId/contact', authenticate, isCompanyOrAdmin, applicationController.markContacted);

export default router;
