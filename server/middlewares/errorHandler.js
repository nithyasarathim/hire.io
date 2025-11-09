import logger from "../utilities/logger.js";
import APIError from "../utilities/APIError.js";

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    if (error.isOperational) {
        logger.warn(`Operational Error: ${error.message}`, { path: req.path, method: req.method, statusCode: error.statusCode });
    } else {
        logger.error(`Critical Error: ${error.message}`, error);
    }
    
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new APIError(404, message);
    }

    if (err.code === 11000) {
        const value = Object.values(err.keyValue).join(', ');
        const message = `Duplicate field value entered: ${value}`;
        error = new APIError(400, message);
    }

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        const message = messages.join('. ');
        error = new APIError(400, message);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
    });
};

export default errorHandler;