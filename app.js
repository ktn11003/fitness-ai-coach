console.log("APP.JS LOADED");

const STORAGE_KEY = "fitness_day";
const START_DATE = "2025-12-18";

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

const MEALS = [
  { label: "Breakfast", time: "08:00", kcal: 550 },
  { label: "Lunch", time: "13:00", kcal: 700 },
  { label: "Dinner", time: "20:00", kcal: 750 }
];

const HYDRATION = [
  { id: "morning", label: "Morning", ml: 500 },
  { id: "afternoon", label: "Afternoon", ml: 750 },
  { id: "evening", label: "Evening", ml: 750 }
];

function getWorkoutType() {
  const diff =
    Math.floor((new Date() - new Date(START_DATE)) / 86400000) % 7;
  return ["push", "pull", "legs", "push", "pull", "legs", "recovery"][diff];
}

function loadDay() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);

  return {
    sleep: null,
    wake: null,
    weight: null,
    hydration: {},
  };
}

let DAY = loadDay();

function saveDay() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DAY));
}

function init() {
  document.getElementById("todayDate").innerText =
    new Date().toDateString();

  renderWorkout();
  renderMeals();
  renderHydration();
  renderSleep();
  renderWeight();
}

function renderWorkout() {
  const el = document.getElementById("workoutArea");
  const type = getWorkoutType();
  const plan = WORKOUT_PLANS[type];

  el.innerHTML = "";

  if (!plan.length) {
    el.innerHTML = "<div class='row'>Recovery Day</div>";
    return;
  }

  plan.forEach(ex => {
    el.innerHTML += `<div class="row">
      <span>${ex.exercise}</span>
      <span>${ex.sets} × ${ex.reps}</span>
    </div>`;
  });
}

function renderMeals() {
  const el = document.getElementById("nutritionRows");
  el.innerHTML = "";
  MEALS.forEach(m => {
    el.innerHTML += `<div class="row">
      <span>${m.label} (${m.time})</span>
      <span>${m.kcal} kcal</span>
    </div>`;
  });
}

function renderHydration() {
  const el = document.getElementById("waterArea");
  el.innerHTML = "";
  HYDRATION.forEach(w => {
    const done = DAY.hydration[w.id];
    el.innerHTML += `<div class="row">
      <span>${w.label}</span>
      <span>${w.ml} ml</span>
      ${
        done
          ? "✓"
          : `<button onclick="logHydration('${w.id}')">Done</button>`
      }
    </div>`;
  });
}

function logHydration(id) {
  DAY.hydration[id] = true;
  saveDay();
  renderHydration();
}

function logSleep() {
  if (!DAY.sleep) DAY.sleep = new Date().toISOString();
  saveDay();
  renderSleep();
}

function logWake() {
  if (!DAY.sleep || DAY.wake) return;
  DAY.wake = new Date().toISOString();
  saveDay();
  renderSleep();
}

function renderSleep() {
  document.getElementById("sleepDisplay").innerText =
    DAY.sleep ? "Sleep logged" : "Sleep: –";
  document.getElementById("wakeDisplay").innerText =
    DAY.wake ? "Wake logged" : "Wake: –";
}

function logWeight(val) {
  if (DAY.weight) return;
  DAY.weight = Number(val);
  saveDay();
  renderWeight();
}

function renderWeight() {
  document.getElementById("weightDisplay").innerText =
    DAY.weight ? `Weight: ${DAY.weight} kg` : "Weight: –";
}

function exportCSV() {
  const csv = `date,weight\n${new Date().toDateString()},${DAY.weight ?? ""}`;
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "fitness.csv";
  a.click();
}

init();
