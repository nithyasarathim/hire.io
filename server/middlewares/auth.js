import jwt from 'jsonwebtoken';
import Student from '../models/studentModel.js';
import Company from '../models/companyModel.js';
import Admin from '../models/adminModel.js';
import APIError from '../utilities/APIError.js';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

const getModelByRole = (role) => {
  switch (role) {
    case 'student': return Student;
    case 'company': return Company;
    case 'admin': return Admin;
    default: throw new APIError(401, 'Invalid token role');
  }
};

export const authenticate = async (req, res, next) => {
  let token;
  console.log("aaa")

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const Model = getModelByRole(decoded.role);
      const user = await Model.findById(decoded.id).select('-password'); 
      if (!user) {
        throw new APIError(401, 'User not found or token invalid');
      }

      req.user = user;
      req.role = decoded.role;
      
      next();
    } catch (error) {
      if (error instanceof APIError) return next(error);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return next(new APIError(401, 'Not authorized, token invalid or expired'));
      }
      next(new APIError(401, 'Not authorized, access denied'));
    }
  }

  if (!token) {
    next(new APIError(401, 'Not authorized, no token provided'));
  }
};

export const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!roles.includes(req.role)) {
            return next(new APIError(403, `User role ${req.role} is not authorized to access this route`));
        }
        next();
    };
};