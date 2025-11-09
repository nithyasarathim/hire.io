import Company from '../models/companyModel.js';
import BaseService from './baseService.js';

class CompanyService extends BaseService {
  constructor() {
    super(Company);
  }
}

export default new CompanyService();