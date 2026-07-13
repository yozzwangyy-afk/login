// =========================================
// UTIL: Format respons API yang konsisten
// =========================================
function success(res, statusCode, message, data = null) {
  return res.status(statusCode).json({ success: true, message, data });
}

function fail(res, statusCode, message, errorCode = 'UNKNOWN_ERROR') {
  return res.status(statusCode).json({ success: false, message, errorCode });
}

module.exports = { success, fail };
