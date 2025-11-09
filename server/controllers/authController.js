import authService from '../services/authService.js';
import APIError from '../utilities/APIError.js';

const register = async (req, res, next) => {
  try {
    const { role, ...userData } = req.body; 
    if (!role || !['student', 'company', 'admin'].includes(role.toLowerCase())) {
        return next(new APIError(400, 'Role is required and must be student, company, or admin'));
    }
    const result = await authService.registerUser(role.toLowerCase(), userData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return next(new APIError(400, 'Please provide email, password, and role'));
    }
    const result = await authService.loginUser(role.toLowerCase(), email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const profile = (req, res) => {
  res.status(200).json({
    user: req.user,
    role: req.role,
  });
};

export default { register, login, profile };