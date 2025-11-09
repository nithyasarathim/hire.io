import Admin from '../models/adminModel.js';
import BaseService from './baseService.js';

class AdminService extends BaseService {
  constructor() {
    super(Admin);
  }
}

export default new AdminService();