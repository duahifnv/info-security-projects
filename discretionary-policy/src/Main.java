import discretionary.DiscretionaryTable;

import java.nio.file.Path;
import java.util.Scanner;

/**
 * @author fizalise
 */
public class Main {
    public static void main(String[] args) {
        System.out.printf("""
                            ------------------------------------------------------------------
                            Система с дискреционной политикой безопасности v.1.0 by fizalise
                            Исходные данные:
                                Имена субъектов: %s
                                Число объектов: %d
                            ------------------------------------------------------------------
                            """, String.join(", ", DiscretionaryTable.SUBJECT_NAMES),
                DiscretionaryTable.OBJECT_COUNT);
        var scanner = new Scanner(System.in);
        var table = new DiscretionaryTable();
        while (true) {
            String subjectName = input("Идентифицируйте себя", scanner);
            if (subjectName.equals("quit")) break;
            if (!table.subjectExists(subjectName)) {
                System.out.println("Не найдено субъекта с именем " + subjectName);
                continue;
            }
            System.out.println("Идентификация прошла успешно, добро пожаловать в систему, " + subjectName);
            System.out.println("Перечень ваших прав:");
            printSubjectRights(table, subjectName);
            startAuthorizedUI(table, subjectName, scanner);
        }
    }
    private static void printSubjectRights(DiscretionaryTable table, String subjectName) {
        int[] rights = table.getRights(subjectName);
        for (int i = 0; i < rights.length; i++) {
            System.out.printf("Объект %d: %s%n", i, DiscretionaryTable.toString(rights[i]));
        }
    }
    private static void startAuthorizedUI(DiscretionaryTable table, String subjectName, Scanner scanner) {
        while (true) {
            String command = input("Жду ваших указаний (help для списка команд)", scanner);
            switch (command) {
                case "read" -> table.readObject(subjectName, objectIdInput(scanner));
                case "write" -> table.writeObject(subjectName, objectIdInput(scanner), scanner);
                case "grant" -> {
                    int objectId = objectIdInput(scanner);
                    String recipientName = input("Какому пользователю передается право?", scanner);
                    String accessType = input("Какое право передается?", scanner);
                    table.grantAccess(subjectName, recipientName, objectId,
                            DiscretionaryTable.AccessType.getByVerbal(accessType));
                }
                case "help" -> System.out.print("""
                        Список команд:
                        read - Операция чтения
                        write - Операция записи
                        grant - Операция передачи прав
                        rights - Получить права на каждый объект
                        quit - Выход из системы
                        """);
                case "rights" -> printSubjectRights(table, subjectName);
                case "quit" -> {
                    System.out.printf("Работа субъекта %s завершена. До свидания%n", subjectName);
                    return;
                }
            }
        }
    }
    private static int objectIdInput(Scanner scanner) {
        while (true) {
            try {
                String input = input("Над каким объектом производится операция?", scanner);
                return Integer.parseInt(input);
            } catch (NumberFormatException ignored) {}
        }
    }
    private static String input(String message, Scanner scanner) {
        System.out.print(message + "\n$ ");
        return scanner.nextLine();
    }
}
