document.addEventListener("DOMContentLoaded", function () {
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const settingsSections = {
    clock: document.getElementById("mode-clock"),
    timer: document.getElementById("mode-timer"),
    stopwatch: document.getElementById("mode-stopwatch"),
  };
  const modeSections = {
    clock: document.getElementById("clock"),
    timer: document.getElementById("timer"),
    stopwatch: document.getElementById("stopwatch"),
  };

  function updateVisibility() {
    Object.values(settingsSections).forEach((section) => section.classList.add("hidden"));
    const selected = document.querySelector('input[name="mode"]:checked').value;
    settingsSections[selected].classList.remove("hidden");
    Object.values(modeSections).forEach((section) => section.classList.remove("center"));
    modeSections[selected].classList.add("center");
  }

  modeRadios.forEach((radio) => radio.addEventListener("change", updateVisibility));

  updateVisibility();

  Object.entries(modeSections).forEach(([mode, section]) => {
    section.addEventListener("click", () => {
      const radio = document.querySelector(`input[name="mode"][value="${mode}"]`);
      if (!radio.checked) {
        radio.checked = true;
        updateVisibility();
      }
    });
  });

  // zapisywanie i odczytywanie danych z pamięci
  const root = document.documentElement;

  const settings = {
    backgroundColor: {
      el: document.getElementById("backgroundColorPicker"),
      cssVar: "--background-color",
      default: "#111111",
    },
    clockColor: {
      el: document.getElementById("clockColorPicker"),
      cssVar: "--clock-color",
      default: "#00ff00",
    },
    backgroundFlashColor: {
      el: document.getElementById("backgroundFlashColorPicker"),
      cssVar: "--background-flash-color",
      default: "#00ff00",
    },
    clockFlashColor: {
      el: document.getElementById("clockFlashColorPicker"),
      cssVar: "--clock-flash-color",
      default: "#111111",
    },
    clockSize: {
      el: document.getElementById("clockSizeRange"),
      cssVar: "--clock-size",
      default: "5em",
      unit: "em",
    },
    clockContent: {
      el: document.getElementById("clockContent"),
      default: "time",
    },
    timeFormat: {
      el: document.getElementById("timeFormat"),
      default: "24",
    },
    dateFormat: {
      el: document.getElementById("dateFormat"),
      default: "dd-mm-yyyy",
    },
    // Możesz dodać więcej pól tutaj
  };

  // Odczyt ustawień
  Object.entries(settings).forEach(([key, { el, cssVar, default: def, unit = "" }]) => {
    const stored = localStorage.getItem(key);
    const value = stored ?? def;

    if (el.tagName === "SELECT") {
      el.value = value;
    } else {
      el.value = stored?.replace(unit, "") || def.replace(unit, "");
      if (cssVar) root.style.setProperty(cssVar, `${el.value}${unit}`);
    }

    el.addEventListener("input", (e) => {
      const newValue = `${e.target.value}${unit}`;
      if (cssVar) root.style.setProperty(cssVar, newValue);
      localStorage.setItem(key, newValue);
    });

    // selecty czasami wymagają „change”, zamiast „input”
    el.addEventListener("change", (e) => {
      localStorage.setItem(key, e.target.value);
    });
  });
});
