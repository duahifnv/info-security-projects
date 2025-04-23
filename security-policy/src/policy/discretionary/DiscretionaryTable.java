package policy.discretionary;

import policy.exceptions.SubjectNotFoundException;

import java.io.*;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

public class DiscretionaryTable {
    public static final List<String> SUBJECT_NAMES = List.of("Maksim", "Nikolay",
            "Nikita", "Anton", "Kirill");
    private static final String FILES_FOLDER_PATH = "D:\\DSTU\\DataSecurity\\labs\\security-labs\\security-policy\\files";
    public static final int OBJECT_COUNT = 6;
    private final Map<String, int[]> discretionaryTable;

    public enum AccessType {
        READ(2, "Чтение"),
        WRITE(1, "Запись"),
        GRANTING(0, "Передача прав");
        public final int accessBit;
        public final String verbal;
        AccessType(int accessBit, String verbal) {
            this.accessBit = accessBit;
            this.verbal = verbal;
        }
        public static AccessType getByVerbal(String verbal) {
            return switch (verbal) {
                case "read" -> READ;
                case "write" -> WRITE;
                case "grant" -> GRANTING;
                default -> throw new IllegalArgumentException();
            };
        }
    }
    public DiscretionaryTable() {
        var discretionaryTable = SUBJECT_NAMES.stream()
                .collect(Collectors.toMap(
                        k -> k,
                        v -> new Random().ints(OBJECT_COUNT, 0, 7 + 1).toArray())
                );
        int[] fullAccess = new int[OBJECT_COUNT];
        Arrays.fill(fullAccess, 7);
        discretionaryTable.put("Maksim", fullAccess);
        for (int i = 0; i < OBJECT_COUNT; i++) {
            try {
                File file = new File(FILES_FOLDER_PATH, "object_" + i + ".txt");
                file.createNewFile();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        this.discretionaryTable = discretionaryTable;
    }
    public boolean subjectExists(String subjectName) {
        return discretionaryTable.containsKey(subjectName);
    }
    public int[] getRights(String subjectName) {
        return Optional.ofNullable(
                    discretionaryTable.get(subjectName)
                ).orElseThrow(() -> new SubjectNotFoundException(subjectName));
    }
    public boolean isAccessible(String subjectName, int objectId, AccessType accessType) {
        if (objectId < 0 || objectId > OBJECT_COUNT - 1) {
            throw new IllegalArgumentException();
        }
        int[] rights = getRights(subjectName);
        return isAccessibleBit(rights[objectId], accessType);
    }
    public void readObject(String subjectName, int objectId) {
        if (!isAccessible(subjectName, objectId, AccessType.READ)) {
            System.out.println("Отказ в выполнении операции. У вас нет прав для ее осуществления");
            return;
        }
        Path filePath = Path.of(FILES_FOLDER_PATH, "object_" + objectId + ".txt");
        try (BufferedReader input = new BufferedReader(new FileReader(filePath.toString()))) {
            System.out.printf("Данные объекта %d: %s%n", objectId, input.readLine());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        System.out.printf("Операция %s успешно выполнена на объекте %d%n", AccessType.READ.verbal,
                objectId);
    }
    public void writeObject(String subjectName, int objectId, Scanner scanner) {
        if (!isAccessible(subjectName, objectId, AccessType.WRITE)) {
            System.out.println("Отказ в выполнении операции. У вас нет прав для ее осуществления");
            return;
        }
        Path filePath = Path.of(FILES_FOLDER_PATH, "object_" + objectId + ".txt");
        try (Writer output = new FileWriter(filePath.toString(), true)) {
            System.out.printf("Запись данных в объект %d: ", objectId);
            output.append(scanner.nextLine());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        System.out.printf("Операция %s успешно выполнена на объекте %d%n", AccessType.WRITE.verbal,
                objectId);
    }
    public void grantAccess(String issuerName, String recipientName, int objectId, AccessType accessType) {
        if (!isAccessible(issuerName, objectId, AccessType.GRANTING)) {
            System.out.println("Отказ в выполнении операции. У вас нет прав для ее осуществления");
            return;
        }
        int[] rights = getRights(recipientName);
        rights[objectId] = rights[objectId] | (1 << accessType.accessBit);
        discretionaryTable.put(recipientName, rights);
        System.out.printf("Операция %s успешно выполнена на объекте %d%n", AccessType.GRANTING.verbal,
                objectId);
    }
    public static String toString(int right) {
        if (right == 0) return "Нет доступа";
        if (right == 7) return "Полный доступ";
        return Arrays.stream(AccessType.values())
            .filter(x -> isAccessibleBit(right, x))
            .map(x -> x.verbal)
            .collect(Collectors.joining(", "));
    }
    private static boolean isAccessibleBit(int right, AccessType accessType) {
        return ((right >> accessType.accessBit) & 1) == 1;
    }
}