import jwt from 'jsonwebtoken';
import APIError from '../utilities/APIError.js';
import Student from '../models/studentModel.js';
import Company from '../models/companyModel.js';
import Admin from '../models/adminModel.js';
import authService from '../services/authService.js';

const roleToModel = {
  student: Student,
  company: Company,
  admin: Admin,
};

const ssoStudent = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return next(new APIError(400, 'Both name and email are required for SSO.'));
    }
    if (typeof name !== 'string' || typeof email !== 'string') {
      return next(new APIError(400, 'Name and email must be strings.'));
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return next(new APIError(400, 'Invalid email format.'));
    }    

    let user = await Student.findOne({ email: trimmedEmail });

    if (!user) {
      user = new Student({
        student_name: trimmedName,
        email: trimmedEmail,
        skills: [],
        student_description: '',
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        student_name: user.student_name,
        email: user.email,
        role: 'student',
        student_description: user.student_description || '',
        skills: user.skills || [],
        resumeId: user.resumeId || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { role, ...userData } = req.body;

    if (!role || !['company', 'admin'].includes(role.toLowerCase())) {
      return next(new APIError(400, 'Role is required and must be company or admin'));
    }

    const result = await authService.registerUser(role.toLowerCase(), userData);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return next(new APIError(400, 'Email, password, and role are required'));
    }

    if (role.toLowerCase() === 'student') {
      return next(new APIError(400, 'Students must log in via SSO'));
    }

    if (!['company', 'admin'].includes(role.toLowerCase())) {
      return next(new APIError(400, 'Invalid role'));
    }

    const result = await authService.loginUser(role.toLowerCase(), email, password);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return next(new APIError(401, 'No token provided'));

    const token = authHeader.split(' ')[1];
    if (!token) return next(new APIError(401, 'Malformed token'));

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new APIError(401, 'Invalid or expired token'));
    }
    const { id, role } = decoded;
    if (!id || !role) return next(new APIError(401, 'Token missing claims'));
    const roleKey = role.toLowerCase();
    const Model = roleToModel[roleKey];
    if (!Model) return next(new APIError(401, 'Invalid role'));
    const user = await Model.findById(id).select('-password');
    if (!user) return next(new APIError(401, 'User not found'));
    const base = { id: user._id, email: user.email || '' };
    if (roleKey === 'student') {
      Object.assign(base, {
        name: user.student_name || '',
        student_description: user.student_description || '',
        skills: user.skills || [],
        resumeId: user.resumeId || null,
      });
    } else if (roleKey === 'company') {
      Object.assign(base, {
        name: user.company_name || '',
        company_description: user.company_description || '',
        company_website: user.company_website || '',
        location: user.location || '',
        jobs: user.jobs || [],
      });
    } else if (roleKey === 'admin') {
      Object.assign(base, { name: 'Admin' });
    }
    res.status(200).json({
      success: true,
      user: base,
      role: roleKey,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Critical] profile error:', msg);
    next(new APIError(500, msg));
  }
};

export default {
  register,
  login,
  profile,
  ssoStudent,
};
