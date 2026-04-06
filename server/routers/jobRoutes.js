import express from 'express';
import jobController from '../controllers/jobController.js';
import { authenticate, isCompany, isCompanyOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(jobController.getJobs)
  .post(authenticate, isCompany, jobController.createJob);

router.route('/:id')
  .get(jobController.getJobById)
  .put(authenticate, isCompanyOrAdmin, jobController.updateJob)
  .delete(authenticate, isCompanyOrAdmin, jobController.deleteJob);
  
router.route('/:id/match/candidates')
  .get(authenticate, isCompanyOrAdmin, jobController.matchCandidates);

export default router;
