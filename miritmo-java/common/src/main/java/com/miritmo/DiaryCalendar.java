package com.miritmo;

import com.codename1.ui.Button;
import com.codename1.ui.Container;
import com.codename1.ui.Label;
import com.codename1.ui.layouts.BoxLayout;
import com.codename1.ui.layouts.GridLayout;
import java.util.Calendar;
import java.util.Map;

final class DiaryCalendar {
    private final MiRitmoApp app;

    DiaryCalendar(MiRitmoApp app) { this.app = app; }

    Container render(int year, int month) {
        Container calendar = new Container(BoxLayout.y());
        addWeekdays(calendar);
        Calendar first = Calendar.getInstance();
        first.set(year, month - 1, 1, 12, 0, 0);
        int offset = (first.get(Calendar.DAY_OF_WEEK) + 5) % 7;
        int days = first.getActualMaximum(Calendar.DAY_OF_MONTH);
        Container grid = new Container(new GridLayout((offset + days + 6) / 7, 7));
        for (int i = 0; i < offset; i++) grid.add(new Label(" "));
        for (int day = 1; day <= days; day++) addDay(grid, year, month, day);
        calendar.add(grid);
        return calendar;
    }

    private void addWeekdays(Container calendar) {
        Container weekdays = new Container(new GridLayout(1, 7));
        for (String day : new String[] { "L", "M", "X", "J", "V", "S", "D" }) {
            weekdays.add(app.layout.centered(day));
        }
        calendar.add(weekdays);
    }

    private void addDay(Container grid, int year, int month, int day) {
        String key = MiRitmoStore.dateKey(year, month, day);
        Map<String, Object> entry = app.diaryHistory.findEntry(key);
        String text = String.valueOf(day);
        if (entry != null) text += "\n" + app.diaryHistory.moodFace(
                MiRitmoStore.string(entry, "mood"));
        Button cell = new Button(text);
        cell.setUIID(key.equals(app.state.selectedDiaryDate)
                ? "DiaryDaySelected" : "DiaryDay");
        if (key.compareTo(MiRitmoStore.today()) > 0) {
            cell.setEnabled(false);
        } else {
            cell.addActionListener(event -> selectDate(key));
        }
        grid.add(cell);
    }

    private void selectDate(String day) {
        app.state.selectedDiaryDate = day;
        app.showDiary();
    }
}
