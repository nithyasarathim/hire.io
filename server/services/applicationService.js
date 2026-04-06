import mongoose from 'mongoose';
import Application from '../models/applicationModel.js';
import BaseService from './baseService.js';
import APIError from '../utilities/APIError.js';
import jobService from './jobService.js';

class ApplicationService extends BaseService {
  constructor() {
    super(Application);
  }

  async applyToJob(studentId, job) {
    if (job.opening_status !== 'open') {
      throw new APIError(400, 'Applications are closed for this job');
    }

    const StudentModel = mongoose.model('Student');
    const student = await StudentModel.findById(studentId);

    if (!student) {
      throw new APIError(404, 'Student not found');
    }

    if (!student.resumeId) {
      throw new APIError(400, 'Please upload your resume before applying');
    }

    const existing = await this.Model.findOne({ student: studentId, job: job._id });
    if (existing) {
      throw new APIError(400, 'You have already applied to this job');
    }

    const matches = await jobService.matchCandidates(job._id, 100);
    const candidateMatch = (matches.candidates || []).find(
      (candidate) => candidate.student_id === studentId.toString()
    );

    return this.Model.create({
      student: studentId,
      job: job._id,
      company: job.company,
      match_score: candidateMatch?.accuracy || 0,
      matched_skills: candidateMatch?.matched_skills || [],
      missing_skills: candidateMatch?.missing_skills || [],
    });
  }

  async updateStatus(applicationId, currentUser, role, status) {
    const application = await this.Model.findById(applicationId).populate('job');

    if (!application) {
      throw new APIError(404, 'Application not found');
    }

    if (role !== 'admin' && application.company.toString() !== currentUser._id.toString()) {
      throw new APIError(403, 'Not authorized to update this application');
    }

    application.status = status;
    await application.save();
    return application;
  }

  async getStudentApplications(studentId) {
    return this.Model.find({ student: studentId }).populate('job company', 'job_name company_name');
  }

  async getCompanyApplications(companyId) {
    return this.Model.find({ company: companyId }).populate('job student', 'job_name student_name email');
  }

  async getCompanyAverageMatchScore(companyId) {
    const result = await this.Model.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: '$company',
          averageMatchScore: { $avg: '$match_score' },
          totalApplications: { $sum: 1 },
        },
      },
    ]);

    return {
      average_match_score: result[0]?.averageMatchScore || 0,
      total_applications: result[0]?.totalApplications || 0,
    };
  }
}

export default new ApplicationService();
