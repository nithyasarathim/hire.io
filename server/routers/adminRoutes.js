import express from 'express';
import adminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(authenticate, authorize(['admin']), adminController.getAllAdmins)
  .post(adminController.createAdmin);

router.route('/analytics')
    .get(authenticate, authorize(['admin']), adminController.getAnalytics);

router.route('/:id')
  .get(authenticate, authorize(['admin']), adminController.getAdminById)
  .put(authenticate, authorize(['admin']), adminController.updateAdmin)
  .delete(authenticate, authorize(['admin']), adminController.deleteAdmin);

export default router;