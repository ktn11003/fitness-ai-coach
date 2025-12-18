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
  renderHistory();
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
  if (tabId === "history") renderHistory();
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
   TODAY AI (STATIC)
===================================================== */

function renderTodayAI() {
  aiInsights.innerHTML = `
    <li>Hit all hydration windows</li>
    <li>Eat all 6 meals</li>
    <li>Track weight daily</li>
  `;
}

/* =====================================================
   ANALYSIS TAB
===================================================== */

function renderAnalysis() {
  const el = document.getElementById("analysis");
  if (!el) return;

  let html = `<div class="card"><h2>Analysis</h2>`;

  if (weightLogs.length >= 2) {
    const last7 = weightLogs.slice(-7);
    const avg = last7.reduce((a, b) => a + b.weight, 0) / last7.length;
    html += `<p><strong>7-day avg weight:</strong> ${avg.toFixed(2)} kg</p>`;
  }

  const mealsToday = JSON.parse(localStorage.getItem("meals-" + todayKey()) || "{}");
  const calories = Object.values(mealsToday).reduce((a, b) => a + b, 0);
  html += `<p><strong>Calories today:</strong> ${calories} kcal</p>`;

  const waterToday = waterLogs
    .filter(w => w.date === todayKey())
    .reduce((a, b) => {
      const plan = WATER_PLAN.find(p => p.id === b.id);
      return a + (plan ? plan.amount : 0);
    }, 0);

  html += `<p><strong>Hydration today:</strong> ${waterToday} ml</p>`;

  html += `<p><strong>Wake:</strong> ${localStorage.getItem("wake-" + todayKey()) || "–"}</p>`;
  html += `<p><strong>Sleep:</strong> ${localStorage.getItem("sleep-" + todayKey()) || "–"}</p>`;

  html += `</div>`;
  el.innerHTML = html;
}

/* =====================================================
   HISTORY TAB — LOGS + CSV
===================================================== */

function renderHistory() {
  const el = document.getElementById("history");
  if (!el) return;

  let html = `<div class="card"><h2>History</h2>`;

  html += `<button class="btn-secondary" onclick="exportCSV()">Export CSV</button>`;
  html += `<div style="margin-top:12px;font-size:13px;">`;

  weightLogs.forEach(w => {
    html += `<div>${w.date} — ${w.weight} kg</div>`;
  });

  html += `</div></div>`;
  el.innerHTML = html;
}

function exportCSV() {
  let csv = "date,weight\n";
  weightLogs.forEach(w => {
    csv += `${w.date},${w.weight}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "fitness_history.csv";
  a.click();

  URL.revokeObjectURL(url);
}
