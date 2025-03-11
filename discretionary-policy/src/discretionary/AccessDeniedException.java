package discretionary;

public class AccessDeniedException extends RuntimeException {
  public AccessDeniedException(String subjectName, DiscretionaryTable.AccessType accessType,
                               int objectId) {
    super("Субъект %s не имеет права %s на объект %d".formatted(subjectName, accessType.name(),
            objectId));
  }
}
