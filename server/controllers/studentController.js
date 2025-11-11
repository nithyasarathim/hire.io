import studentService from '../services/studentService.js';
import baseController from './baseController.js';
import APIError from '../utilities/APIError.js';
import axios from 'axios';
import FormData from 'form-data';

const NEURON_API = process.env.NEURON_SERVER_API;

const uploadResume = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    const student = await studentService.findById(studentId);
    if (!student) return next(new APIError(404, 'Student not found'));

    if (!req.file?.buffer) {
      return next(new APIError(400, 'Resume file (PDF format) is required.'));
    }

    const formData = new FormData();
    formData.append('user_id', student._id.toString());
    formData.append('username', student.student_name);
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

    const count = parseInt(req.query.count, 10) || 5;
    const student = await studentService.findById(studentId);
    if (!student) return next(new APIError(404, 'Student not found'));
    if (!student.resumeId) return next(new APIError(400, 'Please upload your resume first.'));
    console.log(student)
    const matchedJobs = await studentService.matchJobs(student.resumeId, count);

    res.status(200).json({
      success: true,
      data: matchedJobs
    });
  } catch (error) {
    next(error);
  }
};


export default {
  createStudent: baseController.createOne(studentService),
  getStudentById: baseController.getOne(studentService),
  getAllStudents: baseController.getAll(studentService),
  updateStudent: baseController.updateOne(studentService),
  deleteStudent: baseController.deleteOne(studentService),
  uploadResume,
  matchJobs,
};