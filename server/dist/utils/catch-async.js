/**
 * server/src/utils/catch-async.ts — Wraps async route handlers to forward promise rejections to the error handler middleware.
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
//# sourceMappingURL=catch-async.js.map