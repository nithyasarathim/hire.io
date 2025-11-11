import logger from "../utilities/logger.js";

const requestLogger = (req, res, next) => {
    logger.info(`Incoming Request`, {
        method: req.method,
        path: req.path,
        ip: req.ip,
    });
    next();
};

export default requestLogger;