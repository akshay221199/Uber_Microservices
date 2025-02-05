class ApiResponse{
    constructor(statusCode, message, data){
        this.statusCode = statusCode,
        this.message = message,
        this.data = data
        this.statusCode = statusCode < 400
    }
};

export  {ApiResponse};