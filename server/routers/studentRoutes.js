import express from 'express';
import studentController from '../controllers/studentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(authenticate, authorize(['admin', 'company']), studentController.getAllStudents)
  .post(authenticate, authorize(['admin']), studentController.createStudent);

router.route('/:id')
  .get(authenticate, authorize(['student', 'admin', 'company']), studentController.getStudentById)
  .put(authenticate, authorize(['student', 'admin']), studentController.updateStudent)
  .delete(authenticate, authorize(['admin']), studentController.deleteStudent);

export default router;