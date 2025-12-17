console.log("Fitness AI Coach loaded");

/* ===============================
   CONSTANTS + STATE
================================ */
const TARGET_DATE = new Date("2026-03-31");
const split = ["Push", "Pull", "Legs"];
const workoutTemplates = {
  Push: ["Bench Press", "Overhead Press", "Triceps Pushdown"],
  Pull: ["Pull Ups", "Barbell Row", "Biceps Curl"],
  Legs: ["Squat", "Leg Press", "Hamstring Curl"]
};

let sessionLog = {
  start: null,
  end: null,
  sets: []
};

/* ===============================
   RENDER INITIAL UI
================================ */
function init() {
  renderDates();
  generateWorkoutUI();
}

function renderDates() {
  const today = new Date();
  document.getElementById("todayDate").innerText = 
    today.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata"
    });

  document.getElementById("targetDate").innerText =
    TARGET_DATE.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
}

function generateWorkoutUI() {
  const dayType = split[new Date().getDate() % split.length];
  document.getElementById("workoutType").innerText = `${dayType} Day`;

  const form = document.getElementById("workoutForm");
  form.innerHTML = "";

  const exercises = workoutTemplates[dayType];
  exercises.forEach((ex, idx) => {
    for (let s = 1; s <= 3; s++) {
      const row = document.createElement("div");
      row.className = "set-row";
      row.innerHTML = `
        <label>${ex} S${s}</label>
        <input type="number" min="0" placeholder="reps" 
          onchange="recordSet(${idx}, ${s}, this)">
      `;
      form.appendChild(row);
    }
  });
}

/* ===============================
   LOGIC — WORKOUT TRACKING
================================ */
function recordSet(exIdx, setNum, inputEl) {
  const reps = Number(inputEl.value);
  if (!sessionLog.start && reps > 0) {
    sessionLog.start = new Date();
  }

  if (reps <= 0) return; // ignore clears

  const now = new Date();
  sessionLog.sets.push({
    exerciseIndex: exIdx,
    set: setNum,
    reps: reps,
    loggedAt: now.toISOString()
  });

  sessionLog.end = now;

  renderSessionInfo();
}

function renderSessionInfo() {
  if (!sessionLog.start) return;

  document.getElementById("startTime").innerText =
    new Date(sessionLog.start).toLocaleTimeString("en-IN", {timeZone:"Asia/Kolkata"});

  if (sessionLog.end) {
    document.getElementById("endTime").innerText =
      new Date(sessionLog.end).toLocaleTimeString("en-IN", {timeZone:"Asia/Kolkata"});

    const diff = new Date(sessionLog.end) - new Date(sessionLog.start);
    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);
    document.getElementById("duration").innerText =
      `${min} min ${sec} sec`;

    renderAvgRest();
  }

  generateAIFeedback();
}

function renderAvgRest() {
  if (sessionLog.sets.length < 2) {
    document.getElementById("avgRest").innerText = "–";
    return;
  }

  let totalRest = 0, count = 0;
  for (let i = 1; i < sessionLog.sets.length; i++) {
    const prev = new Date(sessionLog.sets[i-1].loggedAt);
    const cur = new Date(sessionLog.sets[i].loggedAt);
    totalRest += (cur - prev);
    count++;
  }
  const avgMs = totalRest / count;
  const avgMin = Math.floor(avgMs / 60000);
  const avgSec = Math.floor((avgMs % 60000) / 1000);
  document.getElementById("avgRest").innerText =
    `${avgMin}m ${avgSec}s`;
}

/* ===============================
   MOCK AI FEEDBACK
================================ */
function generateAIFeedback() {
  const list = document.getElementById("aiFeedback");
  list.innerHTML = "";

  const notes = [];

  if (!sessionLog.start) {
    notes.push("Start logging your sets to begin analysis.");
  } else {
    const totalReps = sessionLog.sets.reduce((a,b) => a + b.reps, 0);
    if (totalReps < 30) {
      notes.push("Your volume is low — consider pacing up gradually.");
    }
    if (sessionLog.sets.length > 0) {
      notes.push("Keep consistent rest between sets for better performance.");
    }
  }

  notes.push("Recommendations will improve when backend AI is integrated.");

  notes.forEach(text => {
    const li = document.createElement("li");
    li.innerText = text;
    list.appendChild(li);
  });
}

/* ===============================
   SUBMIT BUTTON
================================ */
function submitWorkout() {
  alert("Workout logged locally. Future steps will save this to backend.");
}

init();
