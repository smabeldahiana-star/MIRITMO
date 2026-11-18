package com.miritmo;

import com.codename1.ui.Form;
import com.codename1.ui.Label;
import com.codename1.ui.util.UITimer;

final class MiRitmoState {
    Form currentForm;
    Label focusDisplay;
    String currentScreen = "Resumen";
    String selectedDiaryDate = MiRitmoStore.today();
    String selectedDiaryMood = "";
    int focusSeconds = 25 * 60;
    int focusDuration = 25;
    boolean focusRunning;
    UITimer focusTimer;
}
