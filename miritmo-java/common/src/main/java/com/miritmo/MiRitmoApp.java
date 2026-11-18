package com.miritmo;

import com.codename1.ui.Form;

final class MiRitmoApp {
    final MiRitmoStore store = new MiRitmoStore();
    final DiaryVault diary = new DiaryVault();
    final MiRitmoState state = new MiRitmoState();
    final MiRitmoLayout layout = new MiRitmoLayout(this);
    final MiRitmoControls controls = new MiRitmoControls(this);
    final MiRitmoSupport support = new MiRitmoSupport(this);
    final HomeScreen home = new HomeScreen(this);
    final TasksScreen tasks = new TasksScreen(this);
    final HabitsScreen habits = new HabitsScreen(this);
    final WorkoutsScreen workouts = new WorkoutsScreen(this);
    final WorkoutEditor workoutEditor = new WorkoutEditor(this);
    final ExpensesScreen expenses = new ExpensesScreen(this);
    final FocusScreen focus = new FocusScreen(this);
    final DiaryHistory diaryHistory = new DiaryHistory(this);
    final DiaryCalendar diaryCalendar = new DiaryCalendar(this);
    final DiaryMoodEditor diaryMoodEditor = new DiaryMoodEditor(this);
    final DiaryScreen diaryScreen = new DiaryScreen(this);
    final DiaryAccess diaryAccess = new DiaryAccess(this);

    void showHome() { home.show(); }
    void showTasks() { tasks.show(); }
    void showHabits() { habits.show(); }
    void showWorkouts() { workouts.show(); }
    void showExpenses() { expenses.show(); }
    void showFocus() { focus.show(); }
    void showDiary() { diaryScreen.show(); }
    void showDiaryLock() { diaryAccess.show(); }

    Form newScreen(String title) { return layout.newScreen(title); }

    void stop() {
        if (state.focusTimer != null) state.focusTimer.cancel();
        state.focusRunning = false;
        diary.lock();
    }
}
