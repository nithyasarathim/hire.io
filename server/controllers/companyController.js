import companyService from '../services/companyService.js';
import baseController from './baseController.js';

export default {
    createCompany: baseController.createOne(companyService),
    getCompanyById: baseController.getOne(companyService, 'jobs'),
    getAllCompanies: baseController.getAll(companyService),
    updateCompany: baseController.updateOne(companyService),
    deleteCompany: baseController.deleteOne(companyService),
};