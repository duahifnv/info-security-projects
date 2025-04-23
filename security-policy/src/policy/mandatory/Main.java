package policy.mandatory;

import policy.discretionary.DiscretionaryTable;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.printf("""
                            ------------------------------------------------------------------
                            Система с мандатной политикой безопасности v.1.0 by fizalise
                            Исходные данные:
                                Имена субъектов: %s
                                Число объектов: %d
                            ------------------------------------------------------------------
                            """, String.join(", ", DiscretionaryTable.SUBJECT_NAMES),
                DiscretionaryTable.OBJECT_COUNT);
        var scanner = new Scanner(System.in);
        var table = new MandatoryTable();
        while (true) {
            String subjectName = input("Идентифицируйте себя", scanner);
            if (subjectName.equals("quit")) break;
            if (!table.subjectExists(subjectName)) {
                System.out.println("Не найдено субъекта с именем " + subjectName);
                continue;
            }
            System.out.println("Идентификация прошла успешно, добро пожаловать в систему, " + subjectName);
            System.out.println("Ваш уровень конфиденциальности: " + table.getSubjectMode(subjectName).verbal);
            printAccessibleObjects(table, subjectName);
            startAuthorizedUI(table, subjectName, scanner);
        }
    }
    private static void printAccessibleObjects(MandatoryTable table, String subjectName) {
        System.out.println("Перечень объектов, доступных на чтение");
        table.printAccessibleObjects(subjectName, MandatoryTable.AccessMode.READ);
        System.out.println("Перечень объектов, доступных на запись");
        table.printAccessibleObjects(subjectName, MandatoryTable.AccessMode.WRITE);
    }
    private static void startAuthorizedUI(MandatoryTable table, String subjectName, Scanner scanner) {
        while (true) {
            String command = input("Жду ваших указаний (help для списка команд)", scanner);
            switch (command) {
                case "read" -> table.readObject(subjectName, objectIdInput(scanner));
                case "write" -> table.writeObject(subjectName, objectIdInput(scanner), scanner);
                case "objects" -> printAccessibleObjects(table, subjectName);
                case "help" -> System.out.print("""
                        Список команд:
                        read - Операция чтения
                        write - Операция записи
                        objects - Получить перечень доступных обхектов
                        quit - Выход из системы
                        """);
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
