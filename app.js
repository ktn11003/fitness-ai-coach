/* =========================
   CONFIG
========================= */

const TARGET_DATE = new Date("2026-03-31");
const START_DATE = new Date("2025-12-18");

const WORKOUT = {
  type: "Push Day",
  focus: "Controlled volume",
  exercises: [
    { name: "Bench Press", sets: 3, targetReps: 15 },
    { name: "Overhead Press", sets: 3, targetReps: 15 },
    { name: "Triceps Pushdown", sets: 3, targetReps: 15 }
  ]
};

/* =========================
   STATE
========================= */

let workoutSession = {
  startedAt: null,
  endedAt: null,
  sets: [] // { exercise, set, reps, time }
};

/* =========================
   PROGRESS BAR
========================= */

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

/* =========================
   INIT
========================= */

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

/* =========================
   WORKOUT RENDER
========================= */

function renderWorkout() {
  const area = document.getElementById("workoutArea");
  area.innerHTML = "";

  WORKOUT.exercises.forEach((ex, exIndex) => {
    const block = document.createElement("div");
    block.style.marginBottom = "16px";

    const title = document.createElement("div");
    title.innerHTML = `<strong>${ex.name}</strong> · ${ex.sets} × ${ex.targetReps}`;
    title.style.marginBottom = "6px";
    area.appendChild(title);

    for (let s = 1; s <= ex.sets; s++) {
      const row = document.createElement("div");
      row.className = "row";

      row.innerHTML = `
        <span>Set ${s}</span>
        <input 
          type="number"
          min="0"
          placeholder="Reps"
          onchange="logSet(${exIndex}, ${s}, this.value)"
        />
      `;

      area.appendChild(row);
    }
  });
}

/* =========================
   LOGIC
========================= */

function logSet(exIndex, setNumber, reps) {
  if (!reps || reps <= 0) return;

  const now = new Date();

  // Auto start workout
  if (!workoutSession.startedAt) {
    workoutSession.startedAt = now;
    document.getElementById("startTime").innerText =
      now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
    startProgress();
  }

  workoutSession.sets.push({
    exercise: WORKOUT.exercises[exIndex].name,
    set: setNumber,
    reps: Number(reps),
    time: now.toISOString()
  });

  workoutSession.endedAt = now;

  updateWorkoutMeta();
  endProgress();
}

function updateWorkoutMeta() {
  if (!workoutSession.startedAt || !workoutSession.endedAt) return;

  const start = workoutSession.startedAt;
  const end = workoutSession.endedAt;

  document.getElementById("endTime").innerText =
    end.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });

  const diff = end - start;
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  document.getElementById("duration").innerText =
    `${mins} min ${secs} sec`;
}

/* =========================
   AI (PLACEHOLDER, INTENTIONAL)
========================= */

function renderAI() {
  const ul = document.getElementById("aiInsights");
  ul.innerHTML = "";

  [
    "Begin with controlled tempo on compound lifts.",
    "If reps drop significantly, extend rest slightly.",
    "Ensure calorie surplus is maintained post-workout."
  ].forEach(text => {
    const li = document.createElement("li");
    li.innerText = text;
    ul.appendChild(li);
  });
}

init();
