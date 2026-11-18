package com.miritmo;

import java.util.Calendar;

final class MiRitmoDates {
    private MiRitmoDates() { }

    static String today() {
        Calendar calendar = Calendar.getInstance();
        return dateKey(calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH) + 1, calendar.get(Calendar.DAY_OF_MONTH));
    }

    static String dateKey(int year, int month, int day) {
        return four(year) + "-" + two(month) + "-" + two(day);
    }

    static int[] parseDate(String value) {
        String[] parts = value.split("-");
        if (parts.length != 3) throw new IllegalArgumentException("La fecha debe tener formato AAAA-MM-DD.");
        int year = Integer.parseInt(parts[0]);
        int month = Integer.parseInt(parts[1]);
        int day = Integer.parseInt(parts[2]);
        if (month < 1 || month > 12 || day < 1 || day > 31) throw new IllegalArgumentException("La fecha no es válida.");
        Calendar calendar = Calendar.getInstance();
        calendar.setLenient(false);
        calendar.set(year, month - 1, day, 12, 0, 0);
        calendar.getTime();
        return new int[] { year, month, day };
    }

    static String monthLabel(int year, int month) {
        String[] months = {
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        };
        return months[month - 1] + " " + year;
    }

    static String displayDate(String value) {
        try {
            int[] parts = parseDate(value);
            return two(parts[2]) + " " + monthLabel(parts[0], parts[1]);
        } catch (Exception ignored) {
            return value;
        }
    }

    private static String two(int value) {
        return value < 10 ? "0" + value : String.valueOf(value);
    }

    private static String four(int value) {
        if (value < 10) return "000" + value;
        if (value < 100) return "00" + value;
        if (value < 1000) return "0" + value;
        return String.valueOf(value);
    }
}
