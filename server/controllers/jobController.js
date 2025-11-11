import jobService from '../services/jobService.js';
import baseController from './baseController.js';
import APIError from '../utilities/APIError.js';

const createJob = async (req, res, next) => {
    try {
        if (req.role !== 'company' || req.user._id.toString() !== req.body.company) { 
            return next(new APIError(403, 'Unauthorized to create job for this company'));
        }
        const job = await jobService.createJob(req.user._id, req.body);
        res.status(201).json(job);
    } catch (error) {
        next(error);
    }
};

const updateJob = async (req, res, next) => {
    try {
        const job = await jobService.findById(req.params.id);
        
        if (!job) {
            return next(new APIError(404, 'Job not found'));
        }
        
        if (req.role !== 'admin' && job.company.toString() !== req.user._id.toString()) {
            return next(new APIError(403, 'Not authorized to update this job'));
        }
        
        const updatedJob = await jobService.updateById(req.params.id, req.body);
        res.status(200).json(updatedJob);
    } catch (error) {
        next(error);
    }
};

const getJobs = async (req, res, next) => {
    try {
        const jobs = await jobService.findOpenJobs();
        res.status(200).json(jobs);
    } catch (error) {
        next(error);
    }
};

const matchCandidates = async (req, res, next) => {
    try {
        const jobId = req.params.id;
        
        const job = await jobService.findById(jobId);
        if (!job) {
            return next(new APIError(404, 'Job not found'));
        }
        if (req.role !== 'admin' && job.company.toString() !== req.user._id.toString()) {
            return next(new APIError(403, 'Not authorized to match candidates for this job'));
        }

        const matchedCandidates = await jobService.matchCandidates(jobId);

        res.status(200).json(matchedCandidates);
    } catch (error) {
        next(error);
    }
};

export default {
    getJobs,
    createJob,
    getJobById: baseController.getOne(jobService, 'company candidate'),
    updateJob,
    deleteJob: baseController.deleteOne(jobService),
    matchCandidates,
};