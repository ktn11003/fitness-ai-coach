/* =========================================================
   FITNESS TRACKER — QA HARDENED CORE
   ========================================================= */

/* -------------------------
   CONSTANTS
-------------------------- */

const STORAGE_KEY = "fitness_day_v1";
const TARGET_DATE = "2026-03-31";
const START_DATE = "2025-12-18";

/* -------------------------
   UTILITIES
-------------------------- */

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nowIST() {
  return new Date().toISOString();
}

function daysSinceStart() {
  const a = new Date(START_DATE);
  const b = new Date(todayISO());
  return Math.floor((b - a) / 86400000);
}

/* -------------------------
   FIXED DAY-0 PLANS (LOCKED)
-------------------------- */

const WORKOUT_SPLIT = ["push", "pull", "legs", "push", "pull", "legs", "rest"];

const WORKOUT_PLANS = {
  push: [
    { name: "Bench Press", sets: 3, reps: 15 },
    { name: "Overhead Press", sets: 3, reps: 15 },
    { name: "Triceps Pushdown", sets: 3, reps: 15 }
  ],
  pull: [
    { name: "Lat Pulldown", sets: 3, reps: 15 },
    { name: "Seated Row", sets: 3, reps: 15 },
    { name: "Biceps Curl", sets: 3, reps: 15 }
  ],
  legs: [
    { name: "Squat", sets: 3, reps: 15 },
    { name: "Leg Press", sets: 3, reps: 15 },
    { name: "Ham Curl", sets: 3, reps: 15 }
  ],
  rest: []
};

const MEAL_PLAN = [
  { id: "breakfast", label: "Breakfast", time: "08:00", kcal: 550 },
  { id: "mid", label: "Mid-Morning", time: "11:00", kcal: 400 },
  { id: "lunch", label: "Lunch", time: "13:30", kcal: 700 },
  { id: "prewo", label: "Pre-Workout", time: "16:30", kcal: 350 },
  { id: "dinner", label: "Dinner", time: "19:30", kcal: 750 },
  { id: "presleep", label: "Pre-Sleep", time: "22:30", kcal: 350 }
];

const HYDRATION_WINDOWS = [
  { id: "morning", label: "Morning", ml: 750 },
  { id: "afternoon", label: "Afternoon", ml: 1250 },
  { id: "evening", label: "Evening", ml: 1200 }
];

/* -------------------------
   STATE FACTORY
-------------------------- */

function createEmptyDay() {
  return {
    date: todayISO(),
    dayIndex: daysSinceStart(),
    weight: null,            // null = not logged (never 0)
    sleep: null,             // ISO timestamp
    wake: null,              // ISO timestamp
    workout: {
      start: null,
      end: null
    },
    meals: {},               // keyed by meal id
    hydration: {},           // keyed by window id
  };
}

/* -------------------------
   LOAD / SAVE (MIGRATION SAFE)
-------------------------- */

function loadDay() {
  const raw = localStorage.getItem(STORAGE_KEY);
  let day = raw ? JSON.parse(raw) : createEmptyDay();

  // Hard guarantee required fields
  day.meals ||= {};
  day.hydration ||= {};
  day.workout ||= { start: null, end: null };

  saveDay(day);
  return day;
}

function saveDay(day) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(day));
}

let DAY = loadDay();

/* -------------------------
   RENDER HELPERS
-------------------------- */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

/* -------------------------
   HEADER
-------------------------- */

function renderHeader() {
  setText("todayDate", new Date().toDateString());
  setText("targetDate", `Target: ${TARGET_DATE}`);
}

/* -------------------------
   WORKOUT
-------------------------- */

function currentWorkoutPlan() {
  const split = WORKOUT_SPLIT[DAY.dayIndex % 7];
  return WORKOUT_PLANS[split];
}

function renderWorkout() {
  const el = document.getElementById("workoutArea");
  if (!el) return;
  el.innerHTML = "";

  const plan = currentWorkoutPlan();

  if (!plan.length) {
    el.innerHTML = "<div class='row'>Recovery Day</div>";
    return;
  }

  plan.forEach(ex => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<span>${ex.name}</span><span>${ex.sets} × ${ex.reps}</span>`;
    el.appendChild(row);
  });

  setText("workoutStart", `Start: ${DAY.workout.start ?? "—"}`);
  setText("workoutEnd", `End: ${DAY.workout.end ?? "—"}`);
  setText("workoutDuration", "Duration: —");
}

/* -------------------------
   NUTRITION
-------------------------- */

function renderNutrition() {
  const el = document.getElementById("nutritionRows");
  if (!el) return;
  el.innerHTML = "";

  setText("nutritionTarget", "Target: 3400–3600 kcal");

  MEAL_PLAN.forEach(m => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<span>${m.label} (${m.time})</span><span>${m.kcal} kcal</span>`;
    el.appendChild(row);
  });
}

/* -------------------------
   HYDRATION
-------------------------- */

function renderHydration() {
  const el = document.getElementById("waterArea");
  if (!el) return;
  el.innerHTML = "";

  setText("hydrationTarget", "Target: 3.2 L");

  HYDRATION_WINDOWS.forEach(w => {
    const done = DAY.hydration[w.id];
    const row = document.createElement("div");
    row.className = "row";

    if (done) {
      row.innerHTML = `<span>${w.label} ${w.ml} ml</span><span>✓</span>`;
    } else {
      row.innerHTML = `
        <span>${w.label} ${w.ml} ml</span>
        <button onclick="logHydration('${w.id}')">Done</button>
      `;
    }

    el.appendChild(row);
  });
}

function logHydration(id) {
  if (DAY.hydration[id]) return;
  DAY.hydration[id] = {
    ml: HYDRATION_WINDOWS.find(w => w.id === id).ml,
    loggedAt: nowIST()
  };
  saveDay(DAY);
  renderHydration();
}

/* -------------------------
   SLEEP (STATE MACHINE)
-------------------------- */

function renderSleep() {
  setText("sleepDisplay", DAY.sleep ? DAY.sleep : "—");
  setText("wakeDisplay", DAY.wake ? DAY.wake : "—");
}

function logSleep() {
  if (DAY.sleep) return;
  DAY.sleep = nowIST();
  saveDay(DAY);
  renderSleep();
}

function logWake() {
  if (!DAY.sleep || DAY.wake) return;
  DAY.wake = nowIST();
  saveDay(DAY);
  renderSleep();
}

/* -------------------------
   WEIGHT
-------------------------- */

function renderWeight() {
  setText("weightDisplay", DAY.weight !== null ? `${DAY.weight} kg` : "—");
}

function logWeight(val) {
  const n = Number(val);
  if (!n || n <= 0 || DAY.weight !== null) return;
  DAY.weight = n;
  saveDay(DAY);
  renderWeight();
}

/* -------------------------
   EXPORT (GROUND TRUTH)
-------------------------- */

function exportCSV() {
  const rows = [
    ["date", DAY.date],
    ["weight", DAY.weight ?? ""],
    ["sleep", DAY.sleep ?? ""],
    ["wake", DAY.wake ?? ""]
  ];

  HYDRATION_WINDOWS.forEach(w => {
    rows.push([
      `hydration_${w.id}`,
      DAY.hydration[w.id]?.ml ?? 0
    ]);
  });

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "fitness_day.csv";
  a.click();
}

/* -------------------------
   INIT
-------------------------- */

function init() {
  renderHeader();
  renderWorkout();
  renderNutrition();
  renderHydration();
  renderSleep();
  renderWeight();

  document.getElementById("sleepBtn").onclick = logSleep;
  document.getElementById("wakeBtn").onclick = logWake;
  document.getElementById("weightLogBtn").onclick = () =>
    logWeight(document.getElementById("weightInput").value);
  document.getElementById("exportBtn").onclick = exportCSV;
}

init();
