package policy.mandatory;

import policy.exceptions.SubjectNotFoundException;

import java.io.*;
import java.nio.file.Path;
import java.util.*;

public class MandatoryTable {
    public static final List<String> SUBJECT_NAMES = List.of("Maksim", "Nikolay",
            "Nikita", "Anton", "Kirill");
    private static final String FILES_FOLDER_PATH = "D:\\DSTU\\DataSecurity\\labs\\security-labs\\security-policy\\files";
    public static final int OBJECT_COUNT = 6;
    private final SecurityMode[] objectsMandatory;
    private final Map<String, SecurityMode> subjectsMandatory;

    public enum SecurityMode {
        OPEN("Открытые данные", 0),
        SECRET("Секретно", 1),
        SUPER_SECRET("Совершенно секретно", 2);
        public final String verbal;
        public final int level;
        SecurityMode(String verbal, int level) {
            this.verbal = verbal;
            this.level = level;
        }
    }
    public enum AccessMode {
        READ, WRITE
    }
    public MandatoryTable() {
        var random = new Random(52L);
        // Вектор конфиденциальности объектов
        this.objectsMandatory = new SecurityMode[OBJECT_COUNT];
        for (int i = 0; i < OBJECT_COUNT; i++) {
            this.objectsMandatory[i] = SecurityMode.values()[random.nextInt(3)];
        }
        // Вектор конфиденциальности субъектов
        this.subjectsMandatory = new HashMap<>();
        for (int i = 0; i < SUBJECT_NAMES.size(); i++) {
            this.subjectsMandatory.put(SUBJECT_NAMES.get(i), SecurityMode.values()[random.nextInt(3)]);
        }
        for (int i = 0; i < OBJECT_COUNT; i++) {
            try {
                File file = new File(FILES_FOLDER_PATH, "object_" + i + ".txt");
                file.createNewFile();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }
    public boolean subjectExists(String subjectName) {
        return subjectsMandatory.containsKey(subjectName);
    }
    public void printObjectsMandatory() {
        for (int i = 0; i < objectsMandatory.length; i++) {
            System.out.printf("Объект %d: %s%n", i, objectsMandatory[i].verbal);
        }
    }
    public SecurityMode getSubjectMode(String subjectName) {
        if (!subjectExists(subjectName)) {
            throw new SubjectNotFoundException(subjectName);
        }
        return subjectsMandatory.get(subjectName);
    }
    public List<Integer> getAccessibleObjects(String subjectName, AccessMode accessMode) {
        if (!subjectExists(subjectName)) {
            throw new SubjectNotFoundException(subjectName);
        }
        SecurityMode subjectMode = subjectsMandatory.get(subjectName);
        List<Integer> readableObjects = new ArrayList<>();
        for (int i = 0; i < objectsMandatory.length; i++) {
            if (accessMode == AccessMode.READ) {
                if (objectsMandatory[i].level <= subjectMode.level) {
                    readableObjects.add(i);
                }
            }
            else {
                if (objectsMandatory[i].level >= subjectMode.level) {
                    readableObjects.add(i);
                }
            }
        }
        return readableObjects;
    }
    public void printAccessibleObjects(String subjectName, AccessMode accessMode) {
        var objects = getAccessibleObjects(subjectName, accessMode);
        for (Integer object : objects) {
            System.out.printf("Объект %d: %s%n", object, objectsMandatory[object].verbal);
        }
    }
    public void readObject(String subjectName, int objectId) {
        if (!isAccessible(subjectName, objectId, AccessMode.READ)) {
            System.out.println("Отказ в выполнении операции. У вас нет прав для ее осуществления");
            return;
        }
        Path filePath = Path.of(FILES_FOLDER_PATH, "object_" + objectId + ".txt");
        try (BufferedReader input = new BufferedReader(new FileReader(filePath.toString()))) {
            System.out.printf("Данные объекта %d: %s%n", objectId, input.readLine());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        System.out.printf("Операция чтения успешно выполнена на объекте %d%n", objectId);
    }
    public void writeObject(String subjectName, int objectId, Scanner scanner) {
        if (!isAccessible(subjectName, objectId, AccessMode.WRITE)) {
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
        System.out.printf("Операция записи успешно выполнена на объекте %d%n", objectId);
    }
    private boolean isAccessible(String subjectName, int objectId, AccessMode accessMode) {
        if (objectId < 0 || objectId > OBJECT_COUNT - 1) {
            throw new IllegalArgumentException();
        }
        List<Integer> accessibleObjects = getAccessibleObjects(subjectName, accessMode);
        return accessibleObjects.contains(objectId);
    }
}