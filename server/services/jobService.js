import Job from '../models/jobModel.js';
import BaseService from './baseService.js';

class JobService extends BaseService {
  constructor() {
    super(Job);
  }
  
  async findOpenJobs() {
    return this.Model.find({ opening_status: 'open' }).populate('company_id'); 
  }
}

export default new JobService();