// src/services/studentService.js
import Student from '../models/studentModel.js';
import Job from '../models/jobModel.js';
import BaseService from './baseService.js';
import APIError from '../utilities/APIError.js';
import Application from '../models/applicationModel.js';
import "dotenv/config";

const NEURON_SERVER_API = process.env.NEURON_SERVER_API;  

class StudentService extends BaseService {
  constructor() {
    super(Student);
  }

  async uploadResume(studentId, resumeId) {
    try {
      const updatedStudent = await this.Model.findByIdAndUpdate(
        studentId,
        { resumeId },
        { new: true, runValidators: true }
      );
      if (!updatedStudent) {
        throw new APIError(404, 'Student not found after resume upload');
      }
      return resumeId;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(500, `Database update failed: ${error.message}`);
    }
  }
  async matchJobs(resumeId, count = 5) {
    if (!resumeId) {
      throw new APIError(400, 'resumeId is required for job matching.');
    }
    const params = new URLSearchParams({
      resumeId: resumeId.toString(),
      count: count.toString(),
    });
    const url = `${NEURON_SERVER_API}/match/jobs?${params.toString()}`;
    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (netErr) {
      throw new APIError(
        502,
        `Network error while contacting Neuron server: ${netErr.message}`
      );
    }
    if (!response.ok) {
      let msg = 'Neuron API failed to match jobs';
      try {
        const errBody = await response.json();
        msg = errBody.message || msg;
      } catch {
      }
      throw new APIError(response.status, msg);
    }
    try {
      const jobs = await response.json();
      const student = await this.Model.findOne({ resumeId }, '_id');
      const applications = student
        ? await Application.find({ student: student._id }).select('job status')
        : [];

      const applicationMap = new Map(
        applications.map((application) => [application.job.toString(), application.status])
      );

      const learningPath = Array.from(
        new Set(
          (jobs.matches || [])
            .slice(0, 5)
            .flatMap((job) => job.missing_skills || [])
        )
      );

      const matchedJobIds = (jobs.matches || []).map((job) => job.job_id);
      const mongoJobs = await Job.find({ job_id: { $in: matchedJobIds } }).select('_id job_id');
      const jobIdMap = new Map(
        mongoJobs.map((job) => [job.job_id, job._id.toString()])
      );

      return {
        ...jobs,
        learning_path: learningPath,
        matches: (jobs.matches || []).map((job) => ({
          ...job,
          mongo_job_id: jobIdMap.get(job.job_id) || null,
          application_status: applicationMap.get(jobIdMap.get(job.job_id)) || null,
        })),
      };
    } catch (jsonErr) {
      throw new APIError(500, `Failed to parse Neuron response: ${jsonErr.message}`);
    }
  }
}
export default new StudentService();
