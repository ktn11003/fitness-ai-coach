/* =====================================================
   CONFIG — DAY 0 LOCKED
===================================================== */

const TARGET_DATE = new Date("2026-03-31");
const START_DATE = new Date("2025-12-18");

const WORKOUT_PLAN = [
  { name: "Bench Press", sets: 3, reps: 15 },
  { name: "Overhead Press", sets: 3, reps: 15 },
  { name: "Triceps Pushdown", sets: 3, reps: 15 }
];

const WATER_PLAN = [
  { id: 1, label: "Morning", time: "7–9", amount: 500 },
  { id: 2, label: "Late morning", time: "9–12", amount: 750 },
  { id: 3, label: "Afternoon", time: "12–16", amount: 750 },
  { id: 4, label: "Workout window", time: "16–19", amount: 750 },
  { id: 5, label: "Evening", time: "19–22", amount: 450 }
];

/* =====================================================
   STATE
===================================================== */

let workoutState = { start: null, end: null };
let mealLogs = {};
let waterLogs = JSON.parse(localStorage.getItem("waterLogs") || "[]");
let weightLogs = JSON.parse(localStorage.getItem("weightLogs") || "[]");
let baselineWeight = localStorage.getItem("baselineWeight");

/* =====================================================
   UTIL
===================================================== */

function pulse() {
  const bar = document.getElementById("progressBar");
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

function nowIST() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/* =====================================================
   INIT
===================================================== */

function init() {
  const now = new Date();

  todayDate.innerText = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  targetDate.innerText = TARGET_DATE.toDateString();

  const dayDiff = Math.floor((now - START_DATE) / 86400000);
  dayCount.innerText = `Day ${dayDiff}`;

  renderWorkout();
  renderWater();
  renderWeight();
  renderTodayAI();
  renderAnalysis();
}

init();

/* =====================================================
   TABS
===================================================== */

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-page").forEach(p => p.classList.remove("active"));

  document.querySelector(`.tab[onclick*="${tabId}"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");

  if (tabId === "analysis") renderAnalysis();
}

/* =====================================================
   WORKOUT
===================================================== */

function renderWorkout() {
  workoutArea.innerHTML = "";

  WORKOUT_PLAN.forEach(ex => {
    const block = document.createElement("div");
    block.className = "exercise";
    block.innerHTML = `<div class="exercise-title">${ex.name} · ${ex.sets} × ${ex.reps}</div>`;

    for (let i = 1; i <= ex.sets; i++) {
      block.innerHTML += `
        <div class="set-row">
          <span>Set ${i}</span>
          <input placeholder="reps" onchange="logSet()" />
        </div>
      `;
    }
    workoutArea.appendChild(block);
  });
}

function logSet() {
  const now = new Date();

  if (!workoutState.start) {
    workoutState.start = now;
    startTime.innerText = nowIST();
  }

  workoutState.end = now;
  endTime.innerText = nowIST();

  const mins = Math.floor((workoutState.end - workoutState.start) / 60000);
  duration.innerText = `${mins} min`;

  pulse();
}

/* =====================================================
   NUTRITION
===================================================== */

function logMeal(meal, kcal) {
  if (!kcal) return;
  mealLogs[meal] = Number(kcal);

  const total = Object.values(mealLogs).reduce((a, b) => a + b, 0);
  nutritionStatus.innerText = `Consumed ${total} kcal`;

  localStorage.setItem("meals-" + todayKey(), JSON.stringify(mealLogs));
  pulse();
}

/* =====================================================
   HYDRATION
===================================================== */

function renderWater() {
  waterArea.innerHTML = "";
  let total = 0;

  WATER_PLAN.forEach(w => {
    const done = waterLogs.find(x => x.id === w.id && x.date === todayKey());
    if (done) total += w.amount;

    waterArea.innerHTML += `
      <div class="row">
        <span>${w.label} <span class="badge">${w.time}</span></span>
        <span class="meta">${w.amount} ml</span>
        ${
          done
            ? `<span class="meta">✓</span>`
            : `<button class="btn-secondary" onclick="logWater(${w.id})">Done</button>`
        }
      </div>
    `;
  });

  waterStatus.innerText = `Consumed ${total} ml`;
}

function logWater(id) {
  waterLogs.push({ id, date: todayKey(), time: new Date().toISOString() });
  localStorage.setItem("waterLogs", JSON.stringify(waterLogs));
  renderWater();
  pulse();
}

/* =====================================================
   SLEEP
===================================================== */

function logWake() {
  wakeDisplay.innerText = `Wake: ${nowIST()}`;
  localStorage.setItem("wake-" + todayKey(), nowIST());
  pulse();
}

function logSleep() {
  sleepDisplay.innerText = `Sleep: ${nowIST()}`;
  localStorage.setItem("sleep-" + todayKey(), nowIST());
  pulse();
}

/* =====================================================
   WEIGHT
===================================================== */

function logWeight() {
  const value = prompt("Enter morning body weight (kg)");
  if (!value) return;

  weightLogs.push({ weight: Number(value), date: todayKey() });
  localStorage.setItem("weightLogs", JSON.stringify(weightLogs));

  if (!baselineWeight) {
    baselineWeight = value;
    localStorage.setItem("baselineWeight", value);
  }

  renderWeight();
  pulse();
}

function renderWeight() {
  if (!weightLogs.length) return;

  const latest = weightLogs.at(-1).weight;
  weightDisplay.innerText = `Weight: ${latest} kg`;

  if (baselineWeight) {
    weightMeta.innerText = `Δ ${(latest - baselineWeight).toFixed(1)} kg`;
  }
}

/* =====================================================
   TODAY AI (STATIC FOR NOW)
===================================================== */

function renderTodayAI() {
  aiInsights.innerHTML = `
    <li>Hit all hydration windows</li>
    <li>Eat all 6 meals</li>
    <li>Track morning weight</li>
  `;
}

/* =====================================================
   ANALYSIS TAB — LOGIC ONLY
===================================================== */

function renderAnalysis() {
  const el = document.getElementById("analysis");
  if (!el) return;

  let output = `<div class="card"><h2>Analysis</h2>`;

  /* Weight trend */
  if (weightLogs.length >= 2) {
    const last7 = weightLogs.slice(-7);
    const avg =
      last7.reduce((a, b) => a + b.weight, 0) / last7.length;
    output += `<p><strong>7-day avg weight:</strong> ${avg.toFixed(2)} kg</p>`;
  } else {
    output += `<p><strong>Weight:</strong> Not enough data yet</p>`;
  }

  /* Calories */
  const mealsToday = JSON.parse(localStorage.getItem("meals-" + todayKey()) || "{}");
  const calories = Object.values(mealsToday).reduce((a, b) => a + b, 0);
  output += `<p><strong>Calories today:</strong> ${calories || 0} kcal</p>`;

  /* Hydration */
  const waterToday = waterLogs
    .filter(w => w.date === todayKey())
    .reduce((a, b) => {
      const plan = WATER_PLAN.find(p => p.id === b.id);
      return a + (plan ? plan.amount : 0);
    }, 0);

  output += `<p><strong>Hydration today:</strong> ${waterToday} ml</p>`;

  /* Sleep */
  const wake = localStorage.getItem("wake-" + todayKey());
  const sleep = localStorage.getItem("sleep-" + todayKey());
  output += `<p><strong>Wake:</strong> ${wake || "–"}</p>`;
  output += `<p><strong>Sleep:</strong> ${sleep || "–"}</p>`;

  output += `</div>`;
  el.innerHTML = output;
}
