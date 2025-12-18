/************************************************************
 * FITNESS OS — CANONICAL CORE + FIXED PLANS
 * QA-SAFE · STATE-SAFE · LLM-SAFE
 * Timezone: IST (Asia/Kolkata)
 ************************************************************/

/* ================= CONSTANTS ================= */

const TZ = "Asia/Kolkata";
const BASE_SLEEP_HOURS = 8;
const STORAGE_PREFIX = "day:";
const START_DATE = "2025-12-18";

/* ================= FIXED PLANS ================= */

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

/* ================= UTIL ================= */

function todayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

function dayIndex(dateStr) {
  return Math.floor((new Date(dateStr) - new Date(START_DATE)) / 86400000);
}

function getWorkoutTypeForDay(dateStr) {
  return ["push", "pull", "legs", "push", "pull", "legs", "recovery"][
    dayIndex(dateStr) % 7
  ];
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

/* ================= DAY MODEL ================= */

function createEmptyDay(date) {
  return {
    meta: {
      date,
      timezone: TZ,
      state: "IDLE",
      created_at: nowISO(),
      last_updated_at: nowISO()
    },

    plan: {},

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
        windows: {},
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
    }
  };
}

/* ================= STORAGE ================= */

function loadDay(date) {
  const raw = localStorage.getItem(STORAGE_PREFIX + date);

  let day;
  if (raw) {
    day = JSON.parse(raw);
  } else {
    day = createEmptyDay(date);
  }

  // 🔒 ALWAYS ensure plans exist
  injectFixedPlan(day);

  saveDay(day);
  return day;
}

function saveDay(day) {
  day.meta.last_updated_at = nowISO();
  localStorage.setItem(STORAGE_PREFIX + day.meta.date, JSON.stringify(day));
}

/* ================= PLAN INJECTION ================= */

function injectFixedPlan(day) {
  const type = getWorkoutTypeForDay(day.meta.date);

  day.plan.workout = {
    type,
    exercises: WORKOUT_PLANS[type]
  };

  day.plan.nutrition = {
    planned_calories: MEAL_PLAN.reduce((a, m) => a + m.kcal, 0),
    meals: MEAL_PLAN
  };

  day.plan.hydration = {
    planned_total_ml: HYDRATION_PLAN.reduce((a, w) => a + w.ml, 0),
    windows: HYDRATION_PLAN
  };

  HYDRATION_PLAN.forEach(w => {
    day.actuals.hydration.windows[w.id] = {
      actual_ml: 0,
      logged_at: null,
      status: "missed"
    };
  });
}

/* ================= STATE GUARDS ================= */

function canLogSleep(day) {
  return day.meta.state === "PLANNED";
}
function canLogWake(day) {
  return day.meta.state === "SLEEPING";
}
function canLogWeight(day) {
  return day.actuals.weight.value_kg === null;
}
function canLogHydration(day, id) {
  return day.actuals.hydration.windows[id].status !== "completed";
}

/* ================= INIT ================= */

let DAY = loadDay(todayKey());

function init() {
  renderAll();
}
init();

/* ================= SLEEP ================= */

function savePlannedSleep(val) {
  DAY.plan.sleep = DAY.plan.sleep || {};
  DAY.plan.sleep.planned_sleep_time = val || null;
  DAY.meta.state = "PLANNED";
  saveDay(DAY);
  pulse();
}

function savePlannedWake(val) {
  DAY.plan.sleep = DAY.plan.sleep || {};
  DAY.plan.sleep.planned_wake_time = val || null;
  DAY.meta.state = "PLANNED";
  saveDay(DAY);
  pulse();
}

function logSleep() {
  if (!canLogSleep(DAY)) return;
  DAY.actuals.sleep.sleep_logged_at = nowISO();
  DAY.meta.state = "SLEEPING";
  saveDay(DAY);
  renderAll();
  pulse();
}

function logWake() {
  if (!canLogWake(DAY)) return;
  DAY.actuals.sleep.wake_logged_at = nowISO();

  const start = new Date(DAY.actuals.sleep.sleep_logged_at);
  const end = new Date(DAY.actuals.sleep.wake_logged_at);
  const hrs = Math.max(0, (end - start) / 36e5);

  DAY.actuals.sleep.sleep_duration_hours = +hrs.toFixed(2);
  DAY.actuals.sleep.sleep_debt_hours = Math.max(0, BASE_SLEEP_HOURS - hrs);
  DAY.meta.state = "AWAKE";

  saveDay(DAY);
  renderAll();
  pulse();
}

/* ================= WEIGHT ================= */

function logWeight(val) {
  if (!canLogWeight(DAY)) return;

  const re = /^(?:[3-9][0-9]|1[0-9]{2})(?:\.[0-9])?$/;
  if (!re.test(val)) return;

  DAY.actuals.weight.value_kg = Number(val);
  DAY.actuals.weight.logged_at = nowISO();
  saveDay(DAY);
  renderAll();
  pulse();
}

/* ================= HYDRATION ================= */

function logHydration(id) {
  if (!canLogHydration(DAY, id)) return;

  const plan = DAY.plan.hydration.windows.find(w => w.id === id);
  DAY.actuals.hydration.windows[id] = {
    actual_ml: plan.ml,
    logged_at: nowISO(),
    status: "completed"
  };

  DAY.actuals.hydration.total_ml = Object.values(
    DAY.actuals.hydration.windows
  ).reduce((a, w) => a + w.actual_ml, 0);

  saveDay(DAY);
  renderAll();
  pulse();
}

/* ================= RENDER ================= */

function renderAll() {
  renderWorkout();
  renderMeals();
  renderHydration();
  renderSleep();
  renderWeight();
}

function renderWorkout() {
  const el = document.getElementById("workoutArea");
  if (!el || !DAY.plan || !DAY.plan.workout) return;

  el.innerHTML = "";

  const exercises = DAY.plan.workout.exercises || [];
  if (!exercises.length) {
    el.innerHTML = "<div class='row'>Recovery Day</div>";
    return;
  }

  exercises.forEach(ex => {
    const d = document.createElement("div");
    d.className = "row";
    d.innerHTML = `
      <span>${ex.exercise}</span>
      <span>${ex.sets} × ${ex.reps}</span>
    `;
    el.appendChild(d);
  });
}

function renderMeals() {
  const el = document.getElementById("nutritionRows");
  if (!el) return;
  el.innerHTML = "";
  DAY.plan.nutrition.meals.forEach(m => {
    const d = document.createElement("div");
    d.className = "row";
    d.innerHTML = `<span>${m.label} (${m.time})</span><span>${m.kcal} kcal</span>`;
    el.appendChild(d);
  });
}

function renderHydration() {
  const el = document.getElementById("waterArea");
  if (!el) return;
  el.innerHTML = "";
  DAY.plan.hydration.windows.forEach(w => {
    const a = DAY.actuals.hydration.windows[w.id];
    const btn =
      a.status === "completed"
        ? "✓"
        : `<button onclick="logHydration('${w.id}')">Done</button>`;
    const d = document.createElement("div");
    d.className = "row";
    d.innerHTML = `<span>${w.label}</span><span>${w.ml} ml</span>${btn}`;
    el.appendChild(d);
  });
}

function renderSleep() {
  const s = DAY.actuals.sleep;
  if (document.getElementById("sleepDisplay"))
    document.getElementById("sleepDisplay").innerText =
      s.sleep_logged_at ? "Sleep logged" : "Sleep: –";
  if (document.getElementById("wakeDisplay"))
    document.getElementById("wakeDisplay").innerText =
      s.wake_logged_at ? "Wake logged" : "Wake: –";
}

function renderWeight() {
  if (!document.getElementById("weightDisplay")) return;
  document.getElementById("weightDisplay").innerText =
    DAY.actuals.weight.value_kg === null
      ? "Weight: –"
      : `Weight: ${DAY.actuals.weight.value_kg} kg`;
}

/* ================= EXPORT ================= */

function exportCSV() {
  const rows = [["date", "weight_kg", "sleep_hours", "hydration_ml"]];
  Object.keys(localStorage)
    .filter(k => k.startsWith(STORAGE_PREFIX))
    .sort()
    .forEach(k => {
      const d = JSON.parse(localStorage.getItem(k));
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
