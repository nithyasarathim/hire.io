class BaseService {
    constructor(model) {
      this.Model = model;
    }
  
    async create(data) {
      return this.Model.create(data);
    }
  
    async findById(id, populate = '') {
      return this.Model.findById(id).populate(populate);
    }
  
    async findAll(filter = {}, populate = '') {
      return this.Model.find(filter).populate(populate);
    }
  
    async updateById(id, update) {
      return this.Model.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    }
  
    async deleteById(id) {
      return this.Model.findByIdAndDelete(id);
    }
  }
  
  export default BaseService;