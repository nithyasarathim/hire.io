import express from 'express';
import jobController from '../controllers/jobController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(jobController.getJobs)
  .post(authenticate, authorize(['company']), jobController.createJob);

router.route('/:id')
  .get(jobController.getJobById)
  .put(authenticate, authorize(['company', 'admin']), jobController.updateJob)
  .delete(authenticate, authorize(['admin']), jobController.deleteJob);

export default router;