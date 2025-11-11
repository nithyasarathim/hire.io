import express from 'express';
import multer from 'multer';
import studentController from '../controllers/studentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(authenticate, authorize(['admin', 'company']), studentController.getAllStudents)
  .post(authenticate, authorize(['admin']), studentController.createStudent);

router.route('/:id')
  .get(authenticate, authorize(['student', 'admin', 'company']), studentController.getStudentById)
  .patch(authenticate, authorize(['student', 'admin']), studentController.updateStudent)
  .delete(authenticate, authorize(['admin']), studentController.deleteStudent);

router.route('/:id/resume')
  .put(
    authenticate,
    authorize(['student', 'admin']),
    upload.single('resume'),   
    studentController.uploadResume
  );

router.route('/:id/match/jobs')
  .get(authenticate, authorize(['student', 'admin']), studentController.matchJobs);

export default router;
