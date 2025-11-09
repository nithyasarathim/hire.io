import studentService from '../services/studentService.js';
import baseController from './baseController.js';

export default {
    createStudent: baseController.createOne(studentService),
    getStudentById: baseController.getOne(studentService),
    getAllStudents: baseController.getAll(studentService),
    updateStudent: baseController.updateOne(studentService),
    deleteStudent: baseController.deleteOne(studentService),
};