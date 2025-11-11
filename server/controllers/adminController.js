import adminService from '../services/adminService.js';
import baseController from './baseController.js';

const getAnalytics = async (req, res, next) => {
    try {
        const analyticsData = await adminService.getAnalyticsData();
        res.status(200).json(analyticsData);
    } catch (error) {
        next(error);
    }
};

export default {
    createAdmin: baseController.createOne(adminService),
    getAdminById: baseController.getOne(adminService),
    getAllAdmins: baseController.getAll(adminService),
    updateAdmin: baseController.updateOne(adminService),
    deleteAdmin: baseController.deleteOne(adminService),
    getAnalytics,
};