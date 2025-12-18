/* ================= FIXED DAY 0–7 PLANS ================= */

const WORKOUT_PLANS = {
  push: [
    { exercise: "Bench Press", sets: 3, reps: 15 },
    { exercise: "Overhead Press", sets: 3, reps: 15 },
    { exercise: "Triceps Pushdown", sets: 3, reps: 15 }
  ],
  pull: [
    { exercise: "Lat Pulldown", sets: 3, reps: 15 },
    { exercise: "Seated Row", sets: 3, reps: 15 },
    { exercise: "Biceps Curl", sets: 3, reps: 15 }
  ],
  legs: [
    { exercise: "Squats", sets: 3, reps: 15 },
    { exercise: "Leg Press", sets: 3, reps: 15 },
    { exercise: "Hamstring Curl", sets: 3, reps: 15 }
  ],
  recovery: []
};

const MEAL_PLAN = [
  { id: "breakfast", label: "Breakfast", time: "08:00", kcal: 550 },
  { id: "mid_morning", label: "Mid-Morning", time: "11:00", kcal: 400 },
  { id: "lunch", label: "Lunch", time: "14:00", kcal: 700 },
  { id: "pre_workout", label: "Pre-Workout", time: "17:00", kcal: 350 },
  { id: "dinner", label: "Dinner", time: "20:00", kcal: 750 },
  { id: "pre_sleep", label: "Pre-Sleep", time: "22:30", kcal: 350 }
];

const HYDRATION_PLAN = [
  { id: "morning", label: "Morning", ml: 500 },
  { id: "late_morning", label: "Late Morning", ml: 750 },
  { id: "afternoon", label: "Afternoon", ml: 750 },
  { id: "workout", label: "Workout Window", ml: 750 },
  { id: "evening", label: "Evening", ml: 450 }
];

function getWorkoutTypeForDay(dateStr) {
  const dayIndex =
    Math.floor(
      (new Date(dateStr) - new Date("2025-12-18")) / 86400000
    ) % 7;

  return ["push", "pull", "legs", "push", "pull", "legs", "recovery"][dayIndex];
}
/************************************************************
 * FITNESS OS — CANONICAL CORE (QA-SAFE, LLM-SAFE)
 * Timezone: IST (Asia/Kolkata)
 ************************************************************/

/* ================= CONSTANTS ================= */

const TZ = "Asia/Kolkata";
const BASE_SLEEP_HOURS = 8;
const STORAGE_PREFIX = "day:";

/* ================= UTILITIES ================= */

function todayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

function pulse() {
  const bar = document.getElementById("progressBar");
  if (!bar) return;
  bar.style.opacity = 1;
  bar.style.width = "90%";
  setTimeout(() => {
    bar.style.width = "100%";
    setTimeout(() => {
      bar.style.opacity = 0;
      bar.style.width = "0%";
    }, 300);
  }, 200);
}

/* ================= DAY RECORD ================= */

function createEmptyDay(date) {
  return {
    meta: {
      date,
      timezone: TZ,
      state: "IDLE",
      created_at: nowISO(),
      last_updated_at: nowISO()
    },

    plan: {
      sleep: {
        planned_sleep_time: null,
        planned_wake_time: null
      }
    },

    actuals: {
      sleep: {
        sleep_logged_at: null,
        wake_logged_at: null,
        sleep_duration_hours: 0,
        sleep_debt_hours: 0
      },

      weight: {
        value_kg: null,
        logged_at: null
      },

      hydration: {
        windows: {
          morning: { actual_ml: 0, logged_at: null, status: "missed" },
          late_morning: { actual_ml: 0, logged_at: null, status: "missed" },
          afternoon: { actual_ml: 0, logged_at: null, status: "missed" },
          workout: { actual_ml: 0, logged_at: null, status: "missed" },
          evening: { actual_ml: 0, logged_at: null, status: "missed" }
        },
        total_ml: 0
      },

      nutrition: {
        meals: {},
        total_calories: 0
      },

      workout: {
        sets: [],
        started_at: null,
        ended_at: null,
        duration_minutes: 0
      }
    },

    kpis: {},
    confidence: {
      overall: "low",
      reasons: []
    }
  };
}

/* ================= STORAGE ================= */

function loadDay(date) {
  const key = STORAGE_PREFIX + date;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  const day = createEmptyDay(date);
  saveDay(day);
  return day;
}

function saveDay(day) {
  day.meta.last_updated_at = nowISO();
  localStorage.setItem(STORAGE_PREFIX + day.meta.date, JSON.stringify(day));
}

/* ================= STATE MACHINE GUARDS ================= */

function canLogSleep(day) {
  return day.meta.state === "PLANNED";
}

function canLogWake(day) {
  return day.meta.state === "SLEEPING";
}

function canLogWeight(day) {
  return day.actuals.weight.value_kg === null;
}

function canLogHydration(day, windowId) {
  return day.actuals.hydration.windows[windowId].status !== "completed";
}

/* ================= INIT ================= */

let DAY = loadDay(todayKey());

function init() {
  renderSleep();
  renderWeight();
}

init();

/* ================= SLEEP ================= */

function savePlannedSleep(time) {
  DAY.plan.sleep.planned_sleep_time = time || null;
  DAY.meta.state = "PLANNED";
  saveDay(DAY);
  pulse();
}

function savePlannedWake(time) {
  DAY.plan.sleep.planned_wake_time = time || null;
  DAY.meta.state = "PLANNED";
  saveDay(DAY);
  pulse();
}

function logSleep() {
  if (!canLogSleep(DAY)) return;

  DAY.actuals.sleep.sleep_logged_at = nowISO();
  DAY.meta.state = "SLEEPING";
  saveDay(DAY);
  renderSleep();
  pulse();
}

function logWake() {
  if (!canLogWake(DAY)) return;

  DAY.actuals.sleep.wake_logged_at = nowISO();

  const start = new Date(DAY.actuals.sleep.sleep_logged_at);
  const end = new Date(DAY.actuals.sleep.wake_logged_at);

  const hours = Math.max(0, (end - start) / 36e5);
  DAY.actuals.sleep.sleep_duration_hours = Number(hours.toFixed(2));
  DAY.actuals.sleep.sleep_debt_hours = Math.max(
    0,
    BASE_SLEEP_HOURS - DAY.actuals.sleep.sleep_duration_hours
  );

  DAY.meta.state = "AWAKE";
  saveDay(DAY);
  renderSleep();
  pulse();
}

function renderSleep() {
  const s = DAY.actuals.sleep;
  if (document.getElementById("sleepDisplay")) {
    document.getElementById("sleepDisplay").innerText =
      s.sleep_logged_at ? "Sleep logged" : "Sleep: –";
  }
  if (document.getElementById("wakeDisplay")) {
    document.getElementById("wakeDisplay").innerText =
      s.wake_logged_at ? "Wake logged" : "Wake: –";
  }
}

/* ================= WEIGHT ================= */

function logWeight(value) {
  if (!canLogWeight(DAY)) return;

  const regex = /^(?:[3-9][0-9]|1[0-9]{2})(?:\.[0-9])?$/;
  if (!regex.test(value)) return;

  DAY.actuals.weight.value_kg = Number(value);
  DAY.actuals.weight.logged_at = nowISO();
  saveDay(DAY);
  renderWeight();
  pulse();
}

function renderWeight() {
  const w = DAY.actuals.weight;
  if (!document.getElementById("weightDisplay")) return;
  document.getElementById("weightDisplay").innerText =
    w.value_kg !== null ? `Weight: ${w.value_kg} kg` : "Weight: –";
}

/* ================= HYDRATION ================= */

function logHydration(windowId, ml) {
  if (!canLogHydration(DAY, windowId)) return;

  DAY.actuals.hydration.windows[windowId] = {
    actual_ml: ml,
    logged_at: nowISO(),
    status: "completed"
  };

  DAY.actuals.hydration.total_ml = Object.values(
    DAY.actuals.hydration.windows
  ).reduce((a, w) => a + w.actual_ml, 0);

  saveDay(DAY);
  pulse();
}

/* ================= EXPORT ================= */

function exportCSV() {
  const rows = [["date", "weight_kg", "sleep_hours", "hydration_ml"]];

  Object.keys(localStorage)
    .filter(k => k.startsWith(STORAGE_PREFIX))
    .sort()
    .forEach(key => {
      const d = JSON.parse(localStorage.getItem(key));
      rows.push([
        d.meta.date,
        d.actuals.weight.value_kg ?? "",
        d.actuals.sleep.sleep_duration_hours,
        d.actuals.hydration.total_ml
      ]);
    });

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "fitness_ground_truth.csv";
  a.click();

  URL.revokeObjectURL(url);
}
