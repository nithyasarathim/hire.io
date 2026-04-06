import applicationService from '../services/applicationService.js';
import APIError from '../utilities/APIError.js';

const getMyApplications = async (req, res, next) => {
  try {
    if (req.role !== 'student') {
      return next(new APIError(403, 'Only students can view their applications'));
    }

    const applications = await applicationService.getStudentApplications(req.user._id);
    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

const getCompanyApplications = async (req, res, next) => {
  try {
    if (req.role !== 'admin' && req.user._id.toString() !== req.params.companyId) {
      return next(new APIError(403, 'Not authorized to view these applications'));
    }

    const applications = await applicationService.getCompanyApplications(req.params.companyId);
    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyApplications,
  getCompanyApplications,
};
