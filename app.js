const TARGET_DATE = new Date("2026-03-31");
const START_DATE = new Date("2025-12-18");

const exercises = ["Bench Press", "Overhead Press", "Triceps Pushdown"];
let workoutStartedAt = null;
let workoutEndedAt = null;

/* PROGRESS BAR */
function startProgress() {
  const bar = document.getElementById("progressBar");
  bar.style.opacity = "1";
  bar.style.width = "70%";
}

function endProgress() {
  const bar = document.getElementById("progressBar");
  bar.style.width = "100%";
  setTimeout(() => {
    bar.style.opacity = "0";
    bar.style.width = "0%";
  }, 400);
}

/* INIT */
function init() {
  renderDates();
  renderWorkout();
  renderAI();
}

function renderDates() {
  const today = new Date();
  document.getElementById("todayDate").innerText =
    today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata"
    });

  document.getElementById("targetDate").innerText =
    TARGET_DATE.toDateString();

  const days =
    Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24));

  document.getElementById("dayCount").innerText =
    `Day ${days}`;
}

function renderWorkout() {
  const area = document.getElementById("workoutArea");
  area.innerHTML = "";

  exercises.forEach(ex => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>${ex} · 3 × 15</span>
      <input placeholder="Set 1 reps" onchange="logSet()" />
    `;
    area.appendChild(row);
  });
}

function logSet() {
  if (!workoutStartedAt) {
    workoutStartedAt = new Date();
    document.getElementById("startTime").innerText =
      workoutStartedAt.toLocaleTimeString("en-IN");
    startProgress();
  }
  workoutEndedAt = new Date();
  document.getElementById("endTime").innerText =
    workoutEndedAt.toLocaleTimeString("en-IN");

  const diff = workoutEndedAt - workoutStartedAt;
  document.getElementById("duration").innerText =
    Math.floor(diff / 60000) + " min";

  endProgress();
}

function logWater() {
  startProgress();
  setTimeout(endProgress, 600);
}

function renderAI() {
  const ul = document.getElementById("aiInsights");
  ul.innerHTML = "";
  [
    "Focus on controlled reps today.",
    "Hydration will impact endurance.",
    "Ensure calorie surplus by dinner."
  ].forEach(t => {
    const li = document.createElement("li");
    li.innerText = t;
    ul.appendChild(li);
  });
}

init();
