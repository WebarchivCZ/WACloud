package cz.inqool.nkp.api.exception;

public class SearchStoppedException extends RuntimeException {

    public SearchStoppedException() {
        super("This job was stopped.");
    }

    public SearchStoppedException(String message) {
        super(message);
    }

}
