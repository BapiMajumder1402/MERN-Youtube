class ApiError extends Error {
    constructor(statusCode, message = "Something Went Wrong", errors = []) {
        super(message);
        this.statusCode = statusCode
        // this.message=message
        this.errors = errors
        this.data = null
        this.success = false
    }
};

export { ApiError }