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
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/* =====================================================
   INIT
===================================================== */

function init() {
  const now = new Date();

  document.getElementById("todayDate").innerText =
    now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  document.getElementById("targetDate").innerText =
    TARGET_DATE.toDateString();

  const dayDiff = Math.floor((now - START_DATE) / 86400000);
  document.getElementById("dayCount").innerText = `Day ${dayDiff}`;

  renderWorkout();
  renderWater();
  renderWeight();
  renderAI();
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
}

/* =====================================================
   WORKOUT
===================================================== */

function renderWorkout() {
  const container = document.getElementById("workoutArea");
  container.innerHTML = "";

  WORKOUT_PLAN.forEach(ex => {
    const block = document.createElement("div");
    block.className = "exercise";

    block.innerHTML = `
      <div class="exercise-title">${ex.name} · ${ex.sets} × ${ex.reps}</div>
    `;

    for (let i = 1; i <= ex.sets; i++) {
      const row = document.createElement("div");
      row.className = "set-row";
      row.innerHTML = `
        <span>Set ${i}</span>
        <input placeholder="reps" onchange="logSet()" />
      `;
      block.appendChild(row);
    }

    container.appendChild(block);
  });
}

function logSet() {
  const now = new Date();

  if (!workoutState.start) {
    workoutState.start = now;
    document.getElementById("startTime").innerText = nowIST();
  }

  workoutState.end = now;
  document.getElementById("endTime").innerText = nowIST();

  const mins = Math.floor((workoutState.end - workoutState.start) / 60000);
  document.getElementById("duration").innerText = `${mins} min`;

  pulse();
}

/* =====================================================
   NUTRITION
===================================================== */

function logMeal(meal, kcal) {
  if (!kcal) return;
  mealLogs[meal] = Number(kcal);

  const total = Object.values(mealLogs).reduce((a, b) => a + b, 0);
  document.getElementById("nutritionStatus").innerText =
    `Consumed ${total} kcal`;

  pulse();
}

/* =====================================================
   HYDRATION
===================================================== */

function renderWater() {
  const container = document.getElementById("waterArea");
  container.innerHTML = "";

  let total = 0;

  WATER_PLAN.forEach(w => {
    const done = waterLogs.find(x => x.id === w.id);
    if (done) total += w.amount;

    const row = document.createElement("div");
    row.className = "row";

    row.innerHTML = `
      <span>${w.label} <span class="badge">${w.time}</span></span>
      <span class="meta">${w.amount} ml</span>
      ${
        done
          ? `<span class="meta">✓</span>`
          : `<button class="btn-secondary" onclick="logWater(${w.id})">Done</button>`
      }
    `;

    container.appendChild(row);
  });

  document.getElementById("waterStatus").innerText =
    `Consumed ${total} ml`;
}

function logWater(id) {
  waterLogs.push({
    id,
    time: new Date().toISOString()
  });

  localStorage.setItem("waterLogs", JSON.stringify(waterLogs));
  renderWater();
  pulse();
}

/* =====================================================
   SLEEP
===================================================== */

function logWake() {
  document.getElementById("wakeDisplay").innerText =
    `Wake: ${nowIST()}`;
  pulse();
}

function logSleep() {
  document.getElementById("sleepDisplay").innerText =
    `Sleep: ${nowIST()}`;
  pulse();
}

/* =====================================================
   WEIGHT
===================================================== */

function logWeight() {
  const value = prompt("Enter morning body weight (kg)");
  if (!value) return;

  const entry = {
    weight: Number(value),
    time: new Date().toISOString()
  };

  weightLogs.push(entry);
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

  const latest = weightLogs[weightLogs.length - 1].weight;
  document.getElementById("weightDisplay").innerText =
    `Weight: ${latest} kg`;

  if (baselineWeight) {
    const delta = (latest - baselineWeight).toFixed(1);
    document.getElementById("weightMeta").innerText =
      `Δ ${delta} kg`;
  }
}

/* =====================================================
   AI PLACEHOLDER (TODAY)
===================================================== */

function renderAI() {
  const ul = document.getElementById("aiInsights");
  ul.innerHTML = `
    <li>Complete all hydration windows</li>
    <li>Eat all 6 meals on time</li>
    <li>Track weight daily on waking</li>
  `;
}
