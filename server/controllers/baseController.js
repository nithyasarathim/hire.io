import APIError from '../utilities/APIError.js';

const createOne = (service) => async (req, res, next) => {
    try {
        const doc = await service.create(req.body);
        res.status(201).json(doc);
    } catch (error) {
        next(error);
    }
};

const getOne = (service, populate) => async (req, res, next) => {
    try {
        const doc = await service.findById(req.params.id, populate);
        if (!doc) {
            return next(new APIError(404, 'Resource not found'));
        }
        res.status(200).json(doc);
    } catch (error) {
        next(error);
    }
};

const getAll = (service, populate) => async (req, res, next) => {
    try {
        const docs = await service.findAll(req.query.filter, populate);
        res.status(200).json(docs);
    } catch (error) {
        next(error);
    }
};

const updateOne = (service) => async (req, res, next) => {
    try {
        const doc = await service.updateById(req.params.id, req.body);
        if (!doc) {
            return next(new APIError(404, 'Resource not found'));
        }
        res.status(200).json(doc);
    } catch (error) {
        next(error);
    }
};

const deleteOne = (service) => async (req, res, next) => {
    try {
        const doc = await service.deleteById(req.params.id);
        if (!doc) {
            return next(new APIError(404, 'Resource not found'));
        }
        res.status(204).json({ message: 'Resource deleted' });
    } catch (error) {
        next(error);
    }
};

export default { createOne, getOne, getAll, updateOne, deleteOne };