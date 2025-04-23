package policy.exceptions;

public class SubjectNotFoundException extends RuntimeException {
  public SubjectNotFoundException(String subjectName) {
    super("Субъект " + subjectName + " не найден");
  }
}
