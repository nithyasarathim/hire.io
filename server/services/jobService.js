import Job from '../models/jobModel.js';
import BaseService from './baseService.js';
import APIError from '../utilities/APIError.js';
import mongoose from 'mongoose';
import axios from 'axios';
import FormData from 'form-data';
import "dotenv/config";

const NEURON_SERVER_API = process.env.NEURON_SERVER_API;

class JobService extends BaseService {
  constructor() {
    super(Job);
  }

  async findOpenJobs() {
    return this.Model.find({ opening_status: 'open' }).populate('company'); 
  }
  
  async createJob(companyId, jobData) {
      const CompanyModel = mongoose.model('Company');
      const company = await CompanyModel.findById(companyId);
      if (!company) {
          throw new APIError(404, 'Company not found.');
      }

      const externalJobApiUrl = `${NEURON_SERVER_API}/upload/jobs`;
      
      const formData = new FormData();
      formData.append('company', company.company_name);
      formData.append('job_title', jobData.job_name);
      formData.append('description', jobData.job_description);
      formData.append('location', jobData.location);
      formData.append('job_type', jobData.job_type);
      formData.append('salary_start', String(jobData.salary_start));
      formData.append('salary_end', String(jobData.salary_end));
      formData.append('salary_currency', jobData.salary_currency);
      formData.append('experience_level', jobData.experience_level);
      formData.append('skills_required', JSON.stringify(jobData.skills_required || []));

      try {
          const response = await axios.post(externalJobApiUrl, formData, {
              headers: formData.getHeaders(),
          });
          const result = response.data;
          const mockJobId = result.job_id;
          
      const newJobData = {
              ...jobData,
              skills_required: jobData.skills_required || [],
              job_id: mockJobId,
              company: companyId 
          };
          
          const job = await this.Model.create(newJobData);

          company.jobs.push(job._id);
          await company.save();
          
          return job;
      } catch (error) {
          if (error instanceof APIError) throw error;
          throw new APIError(500, `Failed to communicate with Neuron Server: ${error.message}`);
      }
  }
  
  async matchCandidates(jobId, count = 5) {
      const job = await this.Model.findById(jobId, 'job_id candidate opening_status company');
      if (!job) {
          throw new APIError(404, 'Job not found.');
      }

      if (job.opening_status !== 'open') {
          throw new APIError(400, 'Cannot match candidates: Job is not open.');
      }
      
      if (job.candidate) {
          throw new APIError(400, 'Cannot match candidates: Job already has a candidate assigned.');
      }
      
      const params = new URLSearchParams({
          jobid: job.job_id,
          count: count.toString()
      });
      
      const externalMatchApiUrl = `${NEURON_SERVER_API}/match/candidates?${params.toString()}`;

      try {
          const response = await axios.get(externalMatchApiUrl);
          const externalMatchedCandidates = response.data;
          
          const StudentModel = mongoose.model('Student');
          const ApplicationModel = mongoose.model('Application');
          
          const matchedCandidates = [];
          for (const externalCandidate of externalMatchedCandidates.candidates || []) {
              const student = await StudentModel.findById(externalCandidate.user_id);
              if (student) {
                  const application = await ApplicationModel.findOne({
                      company: job.company,
                      job: job._id,
                      student: student._id
                  }).select('status company_viewed_profile_at company_contacted_at engagement_type');
                  const finalCandidate = {
                      ...externalCandidate,
                      student_id: student._id.toString(),
                      student_email: student.email,
                      portfolio_url: student.portfolio_url || '',
                      skills: student.skills || [],
                      application_status: application?.status || null,
                      company_viewed_profile_at: application?.company_viewed_profile_at || null,
                      company_contacted_at: application?.company_contacted_at || null,
                      engagement_type: application?.engagement_type || null
                  };
                  matchedCandidates.push(finalCandidate);
              }
          }

          return {
              ...externalMatchedCandidates,
              candidates: matchedCandidates
          };
      } catch (error) {
          if (error instanceof APIError) throw error;
          const message = error.response?.data?.detail || error.message;
          throw new APIError(error.response?.status || 500, `Failed to communicate with Neuron Server: ${message}`);
      }
  }
}

export default new JobService();
