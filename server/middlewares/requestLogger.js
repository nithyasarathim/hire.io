import logger from "../utilities/logger.js";

const requestLogger = (req, res, next) => {
    logger.info(`Incoming Request`, {
        method: req.method,
        path: req.path,
        ip: req.ip,
        body: Object.keys(req.body).length ? 'present' : 'empty' 
    });
    next();
};

export default requestLogger;