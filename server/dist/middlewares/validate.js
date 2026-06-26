import { AppError } from "../utils/app-error.js";
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Validate request body
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            // Validate query params
            if (schema.query) {
                req.query = await schema.query.parseAsync(req.query);
            }
            // Validate route params
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params);
            }
            next();
        }
        catch (error) {
            if (error.errors && Array.isArray(error.errors)) {
                const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(". ");
                next(new AppError(`Validation constraints failed: ${errorMessages}`, 400));
            }
            else {
                next(new AppError("Failed to parse request payload parameters.", 400));
            }
        }
    };
};
//# sourceMappingURL=validate.js.map