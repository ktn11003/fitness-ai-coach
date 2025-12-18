/* ================= CONFIG ================= */

const TARGET_DATE = new Date("2026-03-31");
const START_DATE = new Date("2025-12-18");

const WORKOUT = [
  { name: "Bench Press", sets: 3, target: 15 },
  { name: "Overhead Press", sets: 3, target: 15 },
  { name: "Triceps Pushdown", sets: 3, target: 15 }
];

/* ================= STATE ================= */

let workoutSession = {
  start: null,
  end: null,
  logs: [] // { exercise, set, reps, time }
};

let meals = {};
let sleep = {};

/* ================= PROGRESS ================= */

function pulse() {
  const bar = document.getElementById("progressBar");
  bar.style.opacity = "1";
  bar.style.width = "80%";
  setTimeout(() => {
    bar.style.width = "100%";
    setTimeout(() => {
      bar.style.opacity = "0";
      bar.style.width = "0%";
    }, 300);
  }, 300);
}

/* ================= INIT ================= */

function init() {
  renderDates();
  renderWorkout();
  renderAI();
}

function renderDates() {
  const now = new Date();

  document.getElementById("todayDate").innerText =
    now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata"
    });

  document.getElementById("targetDate").innerText =
    TARGET_DATE.toDateString();

  const days = Math.floor((now - START_DATE) / 86400000);
  document.getElementById("dayCount").innerText = `Day ${days}`;
}

/* ================= WORKOUT ================= */

function renderWorkout() {
  const area = document.getElementById("workoutArea");
  area.innerHTML = "";

  WORKOUT.forEach((ex, exIdx) => {
    const wrap = document.createElement("div");
    wrap.className = "exercise";

    const title = document.createElement("div");
    title.className = "exercise-title";
    title.innerText = `${ex.name} · ${ex.sets}×${ex.target}`;
    wrap.appendChild(title);

    for (let s = 1; s <= ex.sets; s++) {
      const row = document.createElement("div");
      row.className = "set-row";
      row.innerHTML = `
        <span>Set ${s} (target ${ex.target})</span>
        <input type="number" placeholder="reps"
          onchange="logSet(${exIdx}, ${s}, this.value)" />
      `;
      wrap.appendChild(row);
    }

    area.appendChild(wrap);
  });
}

function logSet(exIdx, setNo, reps) {
  if (!reps || reps <= 0) return;

  const now = new Date();

  if (!workoutSession.start) {
    workoutSession.start = now;
    document.getElementById("startTime").innerText =
      now.toLocaleTimeString("en-IN");
  }

  workoutSession.logs.push({
    exercise: WORKOUT[exIdx].name,
    set: setNo,
    reps: Number(reps),
    time: now
  });

  workoutSession.end = now;
  updateWorkoutMeta();
  pulse();
}

function updateWorkoutMeta() {
  const { start, end } = workoutSession;
  if (!start || !end) return;

  document.getElementById("endTime").innerText =
    end.toLocaleTimeString("en-IN");

  const diff = end - start;
  document.getElementById("duration").innerText =
    Math.floor(diff / 60000) + " min";
}

/* ================= NUTRITION ================= */

function logMeal(meal, kcal) {
  if (!kcal || kcal <= 0) return;

  meals[meal] = {
    kcal: Number(kcal),
    time: new Date()
  };

  const total = Object.values(meals)
    .reduce((a, b) => a + b.kcal, 0);

  document.getElementById("nutritionStatus").innerText =
    `Consumed: ${total} kcal`;

  pulse();
}

/* ================= HYDRATION ================= */

function logWater() {
  pulse();
}

/* ================= SLEEP ================= */

function logSleep(type) {
  const now = new Date();

  sleep[type] = now;

  if (type === "off") {
    document.getElementById("sleepOff").innerText =
      `Off: ${now.toLocaleTimeString("en-IN")}`;
  } else {
    document.getElementById("sleepWake").innerText =
      `Wake: ${now.toLocaleTimeString("en-IN")}`;
  }

  pulse();
}

/* ================= AI ================= */

function renderAI() {
  const ul = document.getElementById("aiInsights");
  ul.innerHTML = "";

  [
    "Aim to hit target reps across all sets.",
    "If reps drop, extend rest slightly.",
    "Meal timing consistency improves recovery."
  ].forEach(t => {
    const li = document.createElement("li");
    li.innerText = t;
    ul.appendChild(li);
  });
}

init();
