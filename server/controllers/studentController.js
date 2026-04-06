import studentService from '../services/studentService.js';
import baseController from './baseController.js';
import APIError from '../utilities/APIError.js';
import axios from 'axios';
import FormData from 'form-data';

const NEURON_API = process.env.NEURON_SERVER_API;

const uploadResume = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    if (req.role !== 'admin' && req.user._id.toString() !== studentId) {
      return next(new APIError(403, 'Not authorized to upload a resume for this student'));
    }

    const student = await studentService.findById(studentId);
    if (!student) return next(new APIError(404, 'Student not found'));

    if (!req.file?.buffer) {
      return next(new APIError(400, 'Resume file (PDF format) is required.'));
    }

    const formData = new FormData();
    formData.append('user_id', student._id.toString());
    formData.append('username', student.student_name);
    formData.append('skills', JSON.stringify(student.skills || []));
    formData.append('resume', req.file.buffer, {
      filename: 'resume.pdf',
      contentType: 'application/pdf'
    });

    const neuronResponse = await axios.post(
      `${NEURON_API}/upload/resume`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    const resumeId = neuronResponse.data.resume_id;

    await studentService.uploadResume(student._id, resumeId);

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and processed successfully.',
      resumeId
    });
  } catch (error) {
    next(error);
  }
};

const matchJobs = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    if (req.role !== 'admin' && req.user._id.toString() !== studentId) {
      return next(new APIError(403, 'Not authorized to view matches for this student'));
    }

    const count = parseInt(req.query.count, 10) || 5;
    const student = await studentService.findById(studentId);
    if (!student) return next(new APIError(404, 'Student not found'));
    if (!student.resumeId) return next(new APIError(400, 'Please upload your resume first.'));
    const matchedJobs = await studentService.matchJobs(student.resumeId, count, req.query);

    res.status(200).json({
      success: true,
      data: matchedJobs
    });
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    if (req.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return next(new APIError(403, 'Not authorized to update this student'));
    }

    const updateData = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updateData, 'name')) {
      updateData.student_name = updateData.name;
      delete updateData.name;
    }

    const student = await studentService.updateById(req.params.id, updateData);
    if (!student) {
      return next(new APIError(404, 'Student not found'));
    }

    res.status(200).json({
      _id: student._id,
      id: student._id,
      name: student.student_name,
      email: student.email,
      student_description: student.student_description || '',
      skills: student.skills || [],
      resumeId: student.resumeId || null,
      portfolio_url: student.portfolio_url || '',
    });
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    if (req.role === 'student' && req.user._id.toString() !== req.params.id) {
      return next(new APIError(403, 'Not authorized to view this student'));
    }

    const student = await studentService.findById(req.params.id);
    if (!student) {
      return next(new APIError(404, 'Student not found'));
    }

    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};


export default {
  createStudent: baseController.createOne(studentService),
  getStudentById,
  getAllStudents: baseController.getAll(studentService),
  updateStudent,
  deleteStudent: baseController.deleteOne(studentService),
  uploadResume,
  matchJobs,
};
