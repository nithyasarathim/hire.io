import express from 'express';
import companyController from '../controllers/companyController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(authenticate, authorize(['admin']), companyController.getAllCompanies)
  .post(authenticate, authorize(['admin']), companyController.createCompany);

router.route('/:id')
  .get(companyController.getCompanyById)
  .put(authenticate, authorize(['company', 'admin']), companyController.updateCompany)
  .delete(authenticate, authorize(['admin']), companyController.deleteCompany);

export default router;