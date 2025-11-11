import Job from '../models/jobModel.js';
import BaseService from './baseService.js';
import APIError from '../utilities/APIError.js';
import mongoose from 'mongoose';
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

      try {
          const response = await fetch(externalJobApiUrl, {
              method: 'POST',
              body: formData,
          });

          if (!response.ok) {
              const errorBody = await response.json();
              throw new APIError(response.status, errorBody.message || 'Neuron API failed to upload job');
          }

          const result = await response.json();
          const mockJobId = result.job_id;
          
          const newJobData = {
              ...jobData,
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
      const job = await this.Model.findById(jobId, 'job_id candidate');
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
          const response = await fetch(externalMatchApiUrl);

          if (!response.ok) {
              const errorBody = await response.json();
              throw new APIError(response.status, errorBody.message || 'Neuron API failed to match candidates');
          }
          
          const externalMatchedCandidates = await response.json();
          
          const StudentModel = mongoose.model('Student');
          
          const matchedCandidates = [];
          for (const externalCandidate of externalMatchedCandidates) {
              const student = await StudentModel.findById(externalCandidate.user_id);
              if (student) {
                  const finalCandidate = {
                      ...externalCandidate,
                      student_id: student._id.toString(),
                      student_email: student.email
                  };
                  matchedCandidates.push(finalCandidate);
              }
          }
          
          return matchedCandidates;
      } catch (error) {
          if (error instanceof APIError) throw error;
          throw new APIError(500, `Failed to communicate with Neuron Server: ${error.message}`);
      }
  }
}

export default new JobService();