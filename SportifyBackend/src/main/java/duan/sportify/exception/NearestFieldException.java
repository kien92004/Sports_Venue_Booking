package duan.sportify.exception;

public class NearestFieldException extends RuntimeException {
    public NearestFieldException(String message) {
        super(message);
    }

    public NearestFieldException(String message, Throwable cause) {
        super(message, cause);
    }
}
