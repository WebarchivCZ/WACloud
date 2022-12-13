package cz.inqool.nkp.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AppExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExceptionResponse> handleValidationExceptions(MethodArgumentNotValidException e) {
        ObjectError error = e.getBindingResult().getAllErrors().stream().findFirst().get();
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ExceptionResponse("Error in field '"+((FieldError) error).getField()+"': "+error.getDefaultMessage(), 400));
    }

    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<ExceptionResponse> handleException(ServiceException e) {
        return ResponseEntity
                .status(e.getStatus())
                .body(new ExceptionResponse(e.getMessage(), e.getStatus().value()));
    }

    public static class ExceptionResponse {

        private final String message;
        public String getMessage() { return message; }

        private final Integer code;
        public Integer getCode() { return code; }

        public ExceptionResponse(String message, Integer code) {
            this.message = message;
            this.code = code;
        }

    }

}