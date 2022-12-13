package cz.inqool.nkp.api.exception;

import org.springframework.http.HttpStatus;

public class InvalidInputException extends ServiceException {
    public InvalidInputException() {
        super("An invalid input.");
    }

    public InvalidInputException(String message) {
        super(message);
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.BAD_REQUEST;
    }
}
