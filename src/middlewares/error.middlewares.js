import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

export const globalErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
            errors: err.errors || [],
        });
    }
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message || "Internal Server Error" });
};
