import adminService from '../services/adminService.js';
import baseController from './baseController.js';

export default {
    createAdmin: baseController.createOne(adminService),
    getAdminById: baseController.getOne(adminService),
    getAllAdmins: baseController.getAll(adminService),
    updateAdmin: baseController.updateOne(adminService),
    deleteAdmin: baseController.deleteOne(adminService),
};