import AppError from "./AppError";

export default function (err, req, res, next) {
  console.log("Error:", err.message);

  if (typeof err === typeof AppError) {
    const appError: AppError = err;
    return res.status(appError.statusCode)
      .json({ status: appError.statusCode, message: appError});
  }

  if (err.status) {
    return res.status(err.status).json(err);
  }

  return res.status(500).json({ status: 500, message: err.message });
}