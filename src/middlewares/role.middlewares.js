import { ApiError } from "../utils/ApiError.js";

export const requireRoles = (...roles) => (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
        throw new ApiError(403, `Required roles: ${roles.join(', ')}`);
    }
    next();
};
