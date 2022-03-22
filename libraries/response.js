const statusType = {
    success: 200,
    error: 400
};

export default function (message = []) {

    let response = {
        status: statusType.success,
        message: message,
        result: null
    }

    response.isSuccess = function() {
        return (this.status == statusType.success);
    }

    response.setStatus = function(status) {
        this.status = status;
    }

    response.addResult = function(result) {
        this.result = result;
    }

    response.addError = function(message = '', result = false) {
        this.result = result;
        this.message.push(message);
        this.status = statusType.error;
    }

    response.appendMessage = function(message) {
        this.message.push(message);
    }

    response.getResult = function() {
        return this.result;
    }

    response.getMessage = function() {
        return this.message.toString();
    }

    response.getStatus = function() {
        return this.status;
    }

    response.getObjectJson = function() {
        return {
            status: this.status,
            message: this.message.toString(),
            result: this.result
        };
    }

    return response;

}