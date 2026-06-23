document.addEventListener("DOMContentLoaded", function () {
  // panel ustawień
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");

  // Przełączanie panelu ustawień
  settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
    settingsPanel.setAttribute("aria-hidden", !settingsPanel.classList.contains("open"));
  });

  // zakładki
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.add("hidden"));

      tab.classList.add("active");
      const tabId = tab.dataset.tab + "Tab";
      document.getElementById(tabId).classList.remove("hidden");
    });
  });

  // Elementy zegara
  const clockElement = document.getElementById("clock");
  const timeFormatSelect = document.getElementById("timeFormat");
  const dateFormatSelect = document.getElementById("dateFormat");
  const clockContentSelect = document.getElementById("clockContent");
  const timerElement = document.getElementById("timer");
  const stopwatchElement = document.getElementById("stopwatch");

  // Funkcje formatowania
  function formatDate(date, format) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const shortMonth = date.toLocaleString("pl-PL", { month: "short" });
    const longMonth = date.toLocaleString("pl-PL", { month: "long" });
    const weekdayShort = date.toLocaleString("pl-PL", { weekday: "short" });
    const weekdayLong = date.toLocaleString("pl-PL", { weekday: "long" });

    switch (format) {
      case "dd-mm-yyyy":
        return `${day}-${month}-${year}`;
      case "yyyy-mm-dd":
        return `${year}-${month}-${day}`;
      case "yyyy-dd-mm":
        return `${year}-${day}-${month}`;
      case "weekday-dd-mmm":
        return `${weekdayShort}, ${day} ${shortMonth}`;
      case "weekday-full":
        return `${weekdayLong}, ${day} ${longMonth} ${year}`;
      default:
        return "";
    }
  }

  function formatTime(date, use12Hour) {
    return date.toLocaleTimeString("pl-PL", { hour12: use12Hour });
  }

  // Aktualizacja wyświetlania zegara
  function updateClock() {
    const now = new Date();
    const use12Hour = timeFormatSelect?.value === "12";
    const clockContent = clockContentSelect?.value || "time";
    const dateFormat = dateFormatSelect?.value || "dd-mm-yyyy";

    let display = "";

    if (clockContent === "time") {
      display = formatTime(now, use12Hour);
    } else if (clockContent === "date") {
      display = formatDate(now, dateFormat);
    } else if (clockContent === "timeDate") {
      display = formatTime(now, use12Hour) + "<br>" + formatDate(now, dateFormat);
    }

    clockElement.innerHTML = display;
  }

  setInterval(updateClock, 500);
  // updateClock();

  // Minutnik
  const timerHours = document.getElementById("timerHours");
  const timerMinutes = document.getElementById("timerMinutes");
  const timerSeconds = document.getElementById("timerSeconds");
  const startTimerBtn = document.getElementById("startTimer");
  const resetTimerBtn = document.getElementById("resetTimer");

  let timerInterval = null;
  let timerStart, timerTarget;

  function updateTimerDisplay(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    timerElement.textContent = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  startTimerBtn.addEventListener("click", () => {
    if (timerInterval) return; // już działa

    const h = parseInt(timerHours.value, 10) || 0;
    const m = parseInt(timerMinutes.value, 10) || 0;
    const s = parseInt(timerSeconds.value, 10) || 0;

    const totalSeconds = h * 3600 + m * 60 + s;
    if (totalSeconds <= 0) return;

    timerStart = Date.now();
    timerTarget = timerStart + totalSeconds * 1000;

    timerInterval = setInterval(() => {
      const now = Date.now();
      const remainingMs = timerTarget - now;

      if (remainingMs <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        updateTimerDisplay(0);
        flashTimer();
        playNotificationSound();
        triggerExternalNotification("Koniec odliczania!", "Minutnik zakończył odliczanie czasu.");
        return;
      }

      const remainingSeconds = Math.ceil(remainingMs / 1000);
      updateTimerDisplay(remainingSeconds);
    }, 500);
    startTimerBtn.disabled = true;
    resetTimerBtn.disabled = false;
  });

  resetTimerBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    clearInterval(interval);
    timerInterval = null;
    interval = null;
    startTimerBtn.disabled = false;
    resetTimerBtn.disabled = true;
    updateTimerDisplay(0);
    document.body.classList.remove("flash");
    stopNotificationSound();
  });

  let interval = null;

  function flashTimer() {
    let flashing = false;
    const body = document.querySelector("body");
    interval = setInterval(() => {
      flashing ? document.body.classList.remove("flash") : document.body.classList.add("flash");
      flashing = !flashing;
    }, 500);
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        interval = null;
        document.body.classList.remove("flash");
        stopNotificationSound();
      }
    }, 10000);
  }

  // Stoper
  const startStopwatchBtn = document.getElementById("startStopwatch");
  const stopStopwatchBtn = document.getElementById("stopStopwatch");
  const resetStopwatchBtn = document.getElementById("resetStopwatch");
  const lapStopwatchBtn = document.getElementById("lapStopwatch");
  const lapsList = document.getElementById("lapsList");

  let stopwatchStart = null;
  let stopwatchElapsed = 0;
  let stopwatchInterval = null;

  function formatStopwatchTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
  }

  function updateStopwatch() {
    stopwatchElapsed = Date.now() - stopwatchStart;
    stopwatchElement.textContent = formatStopwatchTime(stopwatchElapsed);
  }

  startStopwatchBtn.addEventListener("click", () => {
    if (stopwatchInterval) return;

    stopwatchStart = Date.now() - stopwatchElapsed;
    stopwatchInterval = setInterval(updateStopwatch, 10);

    startStopwatchBtn.disabled = true;
    stopStopwatchBtn.disabled = false;
    resetStopwatchBtn.disabled = true;
    lapStopwatchBtn.disabled = false;
  });

  stopStopwatchBtn.addEventListener("click", () => {
    if (!stopwatchInterval) return;

    clearInterval(stopwatchInterval);
    stopwatchInterval = null;

    startStopwatchBtn.disabled = false;
    stopStopwatchBtn.disabled = true;
    resetStopwatchBtn.disabled = false;
    lapStopwatchBtn.disabled = true;
  });

  resetStopwatchBtn.addEventListener("click", () => {
    stopwatchElapsed = 0;
    stopwatchElement.textContent = "00:00:00.00";
    lapsList.innerHTML = "";

    resetStopwatchBtn.disabled = true;
  });

  lapStopwatchBtn.addEventListener("click", () => {
    const lapTime = formatStopwatchTime(stopwatchElapsed);
    const li = document.createElement("li");
    li.textContent = lapTime;
    lapsList.prepend(li);
  });

  // --- ALARMY ---
  let alarms = [];

  function loadAlarms() {
    const stored = localStorage.getItem("alarms");
    if (stored) {
      try {
        alarms = JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing alarms:", e);
        alarms = [];
      }
    }
  }

  function saveAlarms() {
    localStorage.setItem("alarms", JSON.stringify(alarms));
  }

  const alarmElement = document.getElementById("alarm");
  const alarmsList = document.getElementById("alarmsList");
  const alarmTimeInput = document.getElementById("alarmTime");
  const alarmCyclicInput = document.getElementById("alarmCyclic");
  const alarmCyclicOptions = document.getElementById("alarmCyclicOptions");
  const alarmCycleType = document.getElementById("alarmCycleType");
  const alarmDaysOption = document.getElementById("alarmDaysOption");
  const alarmWeekdaysOption = document.getElementById("alarmWeekdaysOption");
  const alarmLabelInput = document.getElementById("alarmLabel");
  const addAlarmBtn = document.getElementById("addAlarm");

  // Pokaż/ukryj opcje cykliczności w zależności od checkboxa
  if (alarmCyclicInput) {
    alarmCyclicInput.addEventListener("change", () => {
      if (alarmCyclicInput.checked) {
        alarmCyclicOptions.classList.remove("hidden");
      } else {
        alarmCyclicOptions.classList.add("hidden");
      }
    });
  }

  if (alarmCycleType) {
    alarmCycleType.addEventListener("change", () => {
      const type = alarmCycleType.value;
      if (type === "daily") {
        alarmDaysOption.classList.add("hidden");
        alarmWeekdaysOption.classList.add("hidden");
      } else if (type === "days") {
        alarmDaysOption.classList.remove("hidden");
        alarmWeekdaysOption.classList.add("hidden");
      } else if (type === "weekdays") {
        alarmDaysOption.classList.add("hidden");
        alarmWeekdaysOption.classList.remove("hidden");
      }
    });
  }

  function renderAlarms() {
    if (!alarmsList) return;
    alarmsList.innerHTML = "";

    alarms.sort((a, b) => a.time.localeCompare(b.time));

    alarms.forEach((alarm) => {
      const li = document.createElement("li");
      if (!alarm.active) {
        li.classList.add("inactive");
      }

      const infoSpan = document.createElement("span");
      let cycleText = "";
      if (alarm.cyclic && alarm.recurrence) {
        if (alarm.recurrence.type === "daily") {
          cycleText = "🔄 Codziennie";
        } else if (alarm.recurrence.type === "days") {
          cycleText = `🔄 Co ${alarm.recurrence.interval} dni`;
        } else if (alarm.recurrence.type === "weekdays") {
          const wNames = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
          const activeDays = alarm.recurrence.weekdays.map(d => wNames[d]).join(",");
          cycleText = `🔄 Dni: ${activeDays}`;
        }
      }
      
      infoSpan.textContent = `${alarm.time} ${alarm.label ? `(${alarm.label})` : ""} ${cycleText}`;

      const actionsDiv = document.createElement("div");
      actionsDiv.style.display = "flex";
      actionsDiv.style.gap = "4px";
      actionsDiv.style.alignItems = "center";

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = alarm.active ? "On" : "Off";
      toggleBtn.className = "alarm-toggle-btn" + (alarm.active ? " active" : "");
      toggleBtn.addEventListener("click", () => {
        alarm.active = !alarm.active;
        saveAlarms();
        renderAlarms();
        updateAlarmModeDisplay();
      });

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.className = "alarm-edit-btn";
      editBtn.addEventListener("click", () => {
        startEditingAlarm(alarm);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.className = "alarm-delete-btn";
      deleteBtn.addEventListener("click", () => {
        alarms = alarms.filter((a) => a.id !== alarm.id);
        saveAlarms();
        renderAlarms();
        updateAlarmModeDisplay();
      });

      actionsDiv.appendChild(toggleBtn);
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(infoSpan);
      li.appendChild(actionsDiv);

      alarmsList.appendChild(li);
    });
  }

  const cancelEditAlarmBtn = document.getElementById("cancelEditAlarm");
  let editingAlarmId = null;

  function startEditingAlarm(alarm) {
    editingAlarmId = alarm.id;
    alarmTimeInput.value = alarm.time;
    alarmCyclicInput.checked = alarm.cyclic;

    if (alarm.cyclic) {
      alarmCyclicOptions.classList.remove("hidden");
      const rec = alarm.recurrence || { type: "daily" };
      alarmCycleType.value = rec.type;

      if (rec.type === "daily") {
        alarmDaysOption.classList.add("hidden");
        alarmWeekdaysOption.classList.add("hidden");
      } else if (rec.type === "days") {
        alarmDaysOption.classList.remove("hidden");
        alarmWeekdaysOption.classList.add("hidden");
        document.getElementById("alarmDaysInterval").value = rec.interval || 1;
      } else if (rec.type === "weekdays") {
        alarmDaysOption.classList.add("hidden");
        alarmWeekdaysOption.classList.remove("hidden");

        const wDays = (rec.weekdays || []).map(Number);
        document.querySelectorAll('input[name="alarmWeekday"]').forEach((cb) => {
          cb.checked = wDays.includes(parseInt(cb.value, 10));
        });
      }
    } else {
      alarmCyclicOptions.classList.add("hidden");
    }

    alarmLabelInput.value = alarm.label || "";
    addAlarmBtn.textContent = "Zapisz alarm";
    cancelEditAlarmBtn.classList.remove("hidden");
  }

  function cancelEditing() {
    editingAlarmId = null;
    alarmTimeInput.value = "";
    alarmCyclicInput.checked = false;
    alarmCyclicOptions.classList.add("hidden");
    alarmLabelInput.value = "";
    document.querySelectorAll('input[name="alarmWeekday"]').forEach(cb => cb.checked = false);
    addAlarmBtn.textContent = "Dodaj alarm";
    cancelEditAlarmBtn.classList.add("hidden");
  }

  if (cancelEditAlarmBtn) {
    cancelEditAlarmBtn.addEventListener("click", cancelEditing);
  }

  function getNextOccurrence(alarm, now) {
    const [alarmH, alarmM] = alarm.time.split(":").map(Number);
    let testDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), alarmH, alarmM, 0, 0);

    if (testDate <= now) {
      testDate.setDate(testDate.getDate() + 1);
    }

    if (!alarm.cyclic) {
      return testDate;
    }

    const rec = alarm.recurrence || { type: "daily" };

    for (let i = 0; i < 366; i++) {
      let matches = false;

      if (rec.type === "daily") {
        matches = true;
      } else if (rec.type === "weekdays") {
        const day = testDate.getDay();
        const wDays = (rec.weekdays || []).map(Number);
        matches = wDays.includes(day);
      } else if (rec.type === "days") {
        const start = new Date(rec.startDate);
        const date1 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const date2 = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        matches = (diffDays % (rec.interval || 1) === 0);
      }

      if (matches) {
        return testDate;
      }

      testDate.setDate(testDate.getDate() + 1);
    }

    return null;
  }

  function updateAlarmModeDisplay() {
    if (!alarmElement) return;
    const activeAlarms = alarms.filter((a) => a.active);
    if (activeAlarms.length === 0) {
      alarmElement.textContent = "Alarm";
      return;
    }

    const now = new Date();
    let nextAlarm = null;
    let minTime = Infinity;

    activeAlarms.forEach((alarm) => {
      const nextTime = getNextOccurrence(alarm, now);
      if (nextTime && nextTime.getTime() < minTime) {
        minTime = nextTime.getTime();
        nextAlarm = alarm;
      }
    });

    if (nextAlarm) {
      const nextTime = getNextOccurrence(nextAlarm, now);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const alarmDate = new Date(nextTime.getFullYear(), nextTime.getMonth(), nextTime.getDate());
      const diffDays = Math.round((alarmDate - today) / (1000 * 60 * 60 * 24));

      let dayLabel = "";
      if (diffDays === 0) {
        dayLabel = "Dziś";
      } else if (diffDays === 1) {
        dayLabel = "Jutro";
      } else {
        const weekdaysNames = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
        dayLabel = weekdaysNames[nextTime.getDay()];
      }

      alarmElement.innerHTML = `Alarm (${dayLabel})<br>${nextAlarm.time}${nextAlarm.label ? `<br>(${nextAlarm.label})` : ""}`;
    } else {
      alarmElement.textContent = "Alarm";
    }
  }

  if (addAlarmBtn) {
    addAlarmBtn.addEventListener("click", () => {
      const time = alarmTimeInput.value;
      if (!time) return;
      const isCyclic = alarmCyclicInput.checked;
      const label = alarmLabelInput.value.trim();

      let recurrence = null;
      if (isCyclic) {
        const type = alarmCycleType.value;
        const interval = parseInt(document.getElementById("alarmDaysInterval").value, 10) || 1;
        
        const weekdays = [];
        document.querySelectorAll('input[name="alarmWeekday"]:checked').forEach((cb) => {
          weekdays.push(parseInt(cb.value, 10));
        });

        recurrence = {
          type: type,
          interval: interval,
          weekdays: weekdays,
          startDate: new Date().toISOString().split("T")[0]
        };
      }

      if (editingAlarmId) {
        const alarm = alarms.find(a => a.id === editingAlarmId);
        if (alarm) {
          alarm.time = time;
          alarm.cyclic = isCyclic;
          alarm.recurrence = recurrence;
          alarm.label = label;
          alarm.active = true;
        }
        editingAlarmId = null;
        addAlarmBtn.textContent = "Dodaj alarm";
        cancelEditAlarmBtn.classList.add("hidden");
      } else {
        const newAlarm = {
          id: Date.now().toString(),
          time: time,
          cyclic: isCyclic,
          recurrence: recurrence,
          label: label,
          active: true,
        };
        alarms.push(newAlarm);
      }

      saveAlarms();
      renderAlarms();
      updateAlarmModeDisplay();

      alarmTimeInput.value = "";
      alarmCyclicInput.checked = false;
      alarmCyclicOptions.classList.add("hidden");
      alarmLabelInput.value = "";
      document.querySelectorAll('input[name="alarmWeekday"]').forEach(cb => cb.checked = false);
    });
  }

  let alarmFlashInterval = null;
  let lastTriggeredMinute = "";

  function flashAlarm(labelText) {
    if (alarmFlashInterval) {
      clearInterval(alarmFlashInterval);
      document.body.classList.remove("flash");
    }

    alarmElement.innerHTML = `ALARM!<br>${labelText}`;

    let flashing = false;
    alarmFlashInterval = setInterval(() => {
      flashing ? document.body.classList.remove("flash") : document.body.classList.add("flash");
      flashing = !flashing;
    }, 500);

    playNotificationSound();

    setTimeout(() => {
      if (alarmFlashInterval) {
        clearInterval(alarmFlashInterval);
        alarmFlashInterval = null;
        document.body.classList.remove("flash");
        stopNotificationSound();
        updateAlarmModeDisplay();
      }
    }, 10000);
  }

  if (alarmElement) {
    alarmElement.addEventListener("click", () => {
      if (alarmFlashInterval) {
        clearInterval(alarmFlashInterval);
        alarmFlashInterval = null;
        document.body.classList.remove("flash");
        stopNotificationSound();
        updateAlarmModeDisplay();
      }
    });
  }

  function checkAlarms() {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const currentTimeStr = `${hh}:${mm}`;

    if (currentTimeStr === lastTriggeredMinute) return;

    let triggeredAny = false;
    let triggeredLabels = [];

    alarms.forEach((alarm) => {
      const isTimeMatch = (alarm.active && alarm.time === currentTimeStr);
      if (isTimeMatch) {
        let isToday = false;
        if (!alarm.cyclic) {
          isToday = true;
        } else {
          const rec = alarm.recurrence || { type: "daily" };
          if (rec.type === "daily") {
            isToday = true;
          } else if (rec.type === "weekdays") {
            const todayDay = now.getDay();
            const wDays = (rec.weekdays || []).map(Number);
            isToday = wDays.includes(todayDay);
          } else if (rec.type === "days") {
            const start = new Date(rec.startDate);
            const date1 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const date2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const diffTime = Math.abs(date2 - date1);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            isToday = (diffDays % (rec.interval || 1) === 0);
          }
        }

        if (isToday) {
          triggeredAny = true;
          if (alarm.label) {
            triggeredLabels.push(alarm.label);
          } else {
            triggeredLabels.push(alarm.time);
          }

          if (!alarm.cyclic) {
            alarm.active = false;
          }
        }
      }
    });

    if (triggeredAny) {
      lastTriggeredMinute = currentTimeStr;
      saveAlarms();
      renderAlarms();
      updateAlarmModeDisplay();
      flashAlarm(triggeredLabels.join(", "));
      triggerExternalNotification("Alarm!", `Uruchomił się alarm: ${triggeredLabels.join(", ")}`);
    }
  }

  // --- DŹWIĘKI POWIADOMIEŃ (Web Audio API) ---
  let audioCtx = null;
  let soundInterval = null;

  function stopNotificationSound() {
    if (soundInterval) {
      clearInterval(soundInterval);
      soundInterval = null;
    }
  }

  function playNotificationSound() {
    stopNotificationSound();
    
    const enabled = document.getElementById("soundEnabled")?.checked;
    if (!enabled) return;

    const soundType = document.getElementById("soundType")?.value || "beep";

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    function playTone(freq, type, duration) {
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    }

    if (soundType === "beep") {
      soundInterval = setInterval(() => {
        playTone(880, "sine", 0.15);
        setTimeout(() => playTone(880, "sine", 0.15), 200);
      }, 1000);
    } else if (soundType === "bell") {
      soundInterval = setInterval(() => {
        playTone(587.33, "triangle", 0.8);
        setTimeout(() => playTone(880, "triangle", 0.6), 250);
      }, 1500);
    } else if (soundType === "synth") {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      let step = 0;
      soundInterval = setInterval(() => {
        playTone(notes[step % notes.length], "sawtooth", 0.2);
        step++;
      }, 250);
    }
  }

  // --- TYTUŁ KARTY (Title Mirroring) ---
  function updateTitle() {
    const titleMirroring = document.getElementById("titleMirroring")?.checked;
    if (!titleMirroring) {
      document.title = "Tik Tak";
      return;
    }

    if (alarmFlashInterval) {
      document.title = "⏰ [ALARM!] Tik Tak";
      return;
    }
    if (interval) {
      document.title = "⏳ [KONIEC!] Tik Tak";
      return;
    }

    const activeMode = document.querySelector('input[name="mode"]:checked')?.value;
    if (activeMode === "clock") {
      const cleanTime = clockElement.innerText.replace(/\n/g, " | ");
      document.title = `🕒 [${cleanTime}] Tik Tak`;
    } else if (activeMode === "timer") {
      document.title = `⏳ [${timerElement.textContent}] Tik Tak`;
    } else if (activeMode === "stopwatch") {
      const timeParts = stopwatchElement.textContent.split(".");
      document.title = `⏱️ [${timeParts[0]}] Tik Tak`;
    } else if (activeMode === "alarm") {
      const cleanAlarm = alarmElement.innerText.replace(/\n/g, " | ");
      document.title = `⏰ [${cleanAlarm}] Tik Tak`;
    } else {
      document.title = "Tik Tak";
    }
  }

  // --- SKRÓTY KLAWISZOWE ---
  const defaultShortcuts = {
    shortcutStartStop: "s",
    shortcutReset: "r",
    shortcutDismiss: "Escape"
  };
  const shortcuts = {};

  function loadShortcuts() {
    ["shortcutStartStop", "shortcutReset", "shortcutDismiss"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const stored = localStorage.getItem(id) || defaultShortcuts[id];
      shortcuts[id] = stored;
      el.value = stored;
    });
  }

  ["shortcutStartStop", "shortcutReset", "shortcutDismiss"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("keydown", (e) => {
      e.preventDefault();
      const key = e.key;
      el.value = key;
      shortcuts[id] = key;
      localStorage.setItem(id, key);
    });
  });

  window.addEventListener("keydown", (e) => {
    if (document.activeElement.tagName === "INPUT" && document.activeElement.type === "text") {
      return;
    }

    const key = e.key;

    if (key === shortcuts.shortcutDismiss) {
      let dismissed = false;
      if (alarmFlashInterval) {
        clearInterval(alarmFlashInterval);
        alarmFlashInterval = null;
        document.body.classList.remove("flash");
        stopNotificationSound();
        updateAlarmModeDisplay();
        dismissed = true;
      }
      if (interval) {
        clearInterval(interval);
        interval = null;
        document.body.classList.remove("flash");
        stopNotificationSound();
        updateTimerDisplay(0);
        dismissed = true;
      }
      if (dismissed) {
        e.preventDefault();
      }
    } else if (key === shortcuts.shortcutStartStop) {
      e.preventDefault();
      const activeMode = document.querySelector('input[name="mode"]:checked')?.value;
      if (activeMode === "timer") {
        startTimerBtn.click();
      } else if (activeMode === "stopwatch") {
        if (stopwatchInterval) {
          stopStopwatchBtn.click();
        } else {
          startStopwatchBtn.click();
        }
      }
    } else if (key === shortcuts.shortcutReset) {
      e.preventDefault();
      const activeMode = document.querySelector('input[name="mode"]:checked')?.value;
      if (activeMode === "timer") {
        resetTimerBtn.click();
      } else if (activeMode === "stopwatch") {
        resetStopwatchBtn.click();
      }
    }
  });

  // --- INNE (Trwałość ustawień) ---
  const soundEnabledEl = document.getElementById("soundEnabled");
  const soundTypeEl = document.getElementById("soundType");
  const titleMirroringEl = document.getElementById("titleMirroring");
  const nativeNotificationsEl = document.getElementById("nativeNotifications");
  const teamsEnabledEl = document.getElementById("teamsEnabled");
  const teamsWebhookUrlEl = document.getElementById("teamsWebhookUrl");

  if (soundEnabledEl) {
    soundEnabledEl.checked = localStorage.getItem("soundEnabled") !== "false";
    soundEnabledEl.addEventListener("change", () => {
      localStorage.setItem("soundEnabled", soundEnabledEl.checked);
    });
  }
  if (soundTypeEl) {
    soundTypeEl.value = localStorage.getItem("soundType") || "beep";
    soundTypeEl.addEventListener("change", () => {
      localStorage.setItem("soundType", soundTypeEl.value);
    });
  }
  if (titleMirroringEl) {
    titleMirroringEl.checked = localStorage.getItem("titleMirroring") === "true";
    titleMirroringEl.addEventListener("change", () => {
      localStorage.setItem("titleMirroring", titleMirroringEl.checked);
      updateTitle();
    });
  }

  if (nativeNotificationsEl) {
    nativeNotificationsEl.checked = localStorage.getItem("nativeNotifications") === "true";
    nativeNotificationsEl.addEventListener("change", () => {
      if (nativeNotificationsEl.checked) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then(permission => {
            if (permission !== "granted") {
              nativeNotificationsEl.checked = false;
              localStorage.setItem("nativeNotifications", "false");
            } else {
              localStorage.setItem("nativeNotifications", "true");
            }
          });
        } else if (Notification.permission === "denied") {
          alert("Uprawnienia do powiadomień zostały zablokowane w przeglądarce. Odblokuj je w ustawieniach strony.");
          nativeNotificationsEl.checked = false;
          localStorage.setItem("nativeNotifications", "false");
        } else {
          localStorage.setItem("nativeNotifications", "true");
        }
      } else {
        localStorage.setItem("nativeNotifications", "false");
      }
    });
  }

  if (teamsEnabledEl) {
    teamsEnabledEl.checked = localStorage.getItem("teamsEnabled") === "true";
    teamsEnabledEl.addEventListener("change", () => {
      localStorage.setItem("teamsEnabled", teamsEnabledEl.checked);
    });
  }

  if (teamsWebhookUrlEl) {
    teamsWebhookUrlEl.value = localStorage.getItem("teamsWebhookUrl") || "";
    teamsWebhookUrlEl.addEventListener("input", () => {
      localStorage.setItem("teamsWebhookUrl", teamsWebhookUrlEl.value.trim());
    });
  }

  // --- DYSPOZYTOR POWIADOMIEŃ ZEWNĘTRZNYCH ---
  function triggerExternalNotification(title, message) {
    const nativeEnabled = localStorage.getItem("nativeNotifications") === "true";
    if (nativeEnabled && Notification.permission === "granted") {
      new Notification(title, {
        body: message
      });
    }

    const teamsEnabled = localStorage.getItem("teamsEnabled") === "true";
    const teamsUrl = localStorage.getItem("teamsWebhookUrl");
    if (teamsEnabled && teamsUrl) {
      const payload = {
        "title": title,
        "text": message,
        "message": message,
        "summary": title,
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0078D7",
        "sections": [{
          "activityTitle": title,
          "activitySubtitle": "Tik Tak App",
          "text": message
        }]
      };

      fetch(teamsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }).catch(err => {
        console.error("Error sending Teams notification:", err);
      });
    }
  }

  // Uruchomienie obsługi alarmów
  loadAlarms();
  renderAlarms();
  updateAlarmModeDisplay();
  loadShortcuts();
  setInterval(checkAlarms, 1000);
  setInterval(updateTitle, 500);
});
