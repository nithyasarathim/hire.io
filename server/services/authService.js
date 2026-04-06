import bcrypt from 'bcryptjs';
import Student from '../models/studentModel.js';
import Company from '../models/companyModel.js';
import Admin from '../models/adminModel.js';
import APIError from '../utilities/APIError.js';
import generateToken from '../utilities/generateToken.js';

const getModelByRole = (role) => {
  switch (role) {
    case 'student': return Student;
    case 'company': return Company;
    case 'admin': return Admin;
    default: throw new APIError(400, 'Invalid registration role');
  }
};

const normalizeUserData = (role, userData) => {
  if (role === 'student') {
    return {
      ...userData,
      student_name: userData.student_name || userData.name,
      portfolio_url: userData.portfolio_url || '',
    };
  }

  return userData;
};

const registerUser = async (role, userData) => {
  const Model = getModelByRole(role);
  const normalizedUserData = normalizeUserData(role, userData);

  if (!normalizedUserData.email || !normalizedUserData.password) {
    throw new APIError(400, 'Email and password are required');
  }

  if (role === 'student' && !normalizedUserData.student_name) {
    throw new APIError(400, 'Student name is required');
  }
  
  const salt = await bcrypt.genSalt(10);
  normalizedUserData.password = await bcrypt.hash(normalizedUserData.password, salt);
  try {
    const user = await Model.create(normalizedUserData);
    const userPayload = user.toObject();
    delete userPayload.password;
    return {
      user: userPayload,
      token: generateToken(user._id, role),
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new APIError(400, 'User with this email already exists');
    }
    throw error;
  }
};

const loginUser = async (role, email, password) => {
  const Model = getModelByRole(role);

  const user = await Model.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
  
  if (user && (await bcrypt.compare(password, user.password))) {
    const userPayload = user.toObject();
    delete userPayload.password;
    return {
      user: userPayload,
      token: generateToken(user._id, role),
    };
  } else {
    throw new APIError(401, 'Invalid credentials');
  }
};

export default { registerUser, loginUser };
