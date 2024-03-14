export const errorMiddleware = (err, req, res, next) => {
    err.message || (err.message = "Internal Server Error");
    err.statusCode || (err.statusCode = 500);
    if (err.name == "CastError") {
        err.message = "Invalid ID";
        err.statusCode = 400;
    }
    if (err.name == "ValidationError") {
        err.message = "Invalid Data Type";
        err.statusCode = 400;
    }
    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
export const TryCatch = (func) => (req, res, next) => {
    return Promise.resolve(func(req, res, next)).catch(next);
};
//# sourceMappingURL=error.js.map