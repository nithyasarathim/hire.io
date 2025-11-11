import Admin from '../models/adminModel.js';
import Student from '../models/studentModel.js';
import Company from '../models/companyModel.js';
import Job from '../models/jobModel.js';
import BaseService from './baseService.js';

class AdminService extends BaseService {
  constructor() {
    super(Admin);
  }
  
  async getAnalyticsData() {
      const studentCount = await Student.countDocuments();
      const companyCount = await Company.countDocuments();
      const jobCount = await Job.countDocuments();
      const openJobCount = await Job.countDocuments({ opening_status: 'open' });
      const closedJobCount = await Job.countDocuments({ opening_status: 'closed' });
      
      const students = await Student.find({});
      const companies = await Company.find({}).select('-password');
      const jobs = await Job.find({}).populate('company candidate');

      return {
          overview: {
              totalStudents: studentCount,
              totalCompanies: companyCount,
              totalJobs: jobCount,
              openJobs: openJobCount,
              closedJobs: closedJobCount
          },
          students: students,
          companies: companies,
          jobs: jobs
      };
  }
}

export default new AdminService();