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
  });

  let interval = null;

  function flashTimer() {
    let flashing = false;
    const body = document.querySelector("body");
    interval = setInterval(() => {
      flashing ? document.body.classList.remove("flash") : document.body.classList.add("flash");
      flashing = !flashing;
    }, 500);
    setTimeout(() => clearInterval(interval), 10000);
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
});
