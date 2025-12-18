const TARGET_DATE = new Date("2026-03-31");
const START_DATE = new Date("2025-12-18");

const exercises = [
  { name: "Bench Press", sets: 3 },
  { name: "Overhead Press", sets: 3 },
  { name: "Triceps Pushdown", sets: 3 }
];

let session = { start: null, end: null };

/* PROGRESS */
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

/* INIT */
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

  const days =
    Math.floor((now - START_DATE) / 86400000);

  document.getElementById("dayCount").innerText =
    `Day ${days}`;
}

function renderWorkout() {
  const area = document.getElementById("workoutArea");
  area.innerHTML = "";

  exercises.forEach((ex, i) => {
    const block = document.createElement("div");
    block.innerHTML = `<strong>${ex.name}</strong>`;
    area.appendChild(block);

    for (let s = 1; s <= ex.sets; s++) {
      const input = document.createElement("input");
      input.className = "full";
      input.placeholder = `Set ${s} reps`;
      input.onchange = () => logSet();
      area.appendChild(input);
    }
  });
}

function logSet() {
  const now = new Date();

  if (!session.start) {
    session.start = now;
    document.getElementById("startTime").innerText =
      now.toLocaleTimeString("en-IN");
  }

  session.end = now;
  document.getElementById("endTime").innerText =
    now.toLocaleTimeString("en-IN");

  const diff = session.end - session.start;
  document.getElementById("duration").innerText =
    Math.floor(diff / 60000) + " min";

  pulse();
}

function logWater() {
  pulse();
}

function renderAI() {
  const ul = document.getElementById("aiInsights");
  ul.innerHTML = "";

  [
    "Keep rest consistent across sets.",
    "Hydrate before the next session.",
    "Ensure calorie surplus by dinner."
  ].forEach(t => {
    const li = document.createElement("li");
    li.innerText = t;
    ul.appendChild(li);
  });
}

init();
