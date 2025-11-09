import Student from '../models/studentModel.js';
import BaseService from './baseService.js';

class StudentService extends BaseService {
  constructor() {
    super(Student);
  }
}

export default new StudentService();