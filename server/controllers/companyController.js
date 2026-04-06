import companyService from '../services/companyService.js';
import baseController from './baseController.js';
import applicationService from '../services/applicationService.js';
import APIError from '../utilities/APIError.js';

const getApplicantAnalytics = async (req, res, next) => {
    try {
        if (req.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return next(new APIError(403, 'Not authorized to view company analytics'));
        }

        const analytics = await applicationService.getCompanyAverageMatchScore(req.params.id);
        res.status(200).json({ success: true, analytics });
    } catch (error) {
        next(error);
    }
};

const updateCompany = async (req, res, next) => {
    try {
        if (req.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return next(new APIError(403, 'Not authorized to update this company'));
        }

        const company = await companyService.updateById(req.params.id, req.body);
        if (!company) {
            return next(new APIError(404, 'Company not found'));
        }

        res.status(200).json(company);
    } catch (error) {
        next(error);
    }
};

export default {
    createCompany: baseController.createOne(companyService),
    getCompanyById: baseController.getOne(companyService, 'jobs'),
    getAllCompanies: baseController.getAll(companyService),
    updateCompany,
    deleteCompany: baseController.deleteOne(companyService),
    getApplicantAnalytics,
};
