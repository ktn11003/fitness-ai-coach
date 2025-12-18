const TARGET_DATE = new Date("2026-03-31");
const START_DATE = new Date("2025-12-18");

const exercises = [
  "Bench Press",
  "Overhead Press",
  "Triceps Pushdown"
];

const session = {
  start: null,
  end: null
};

function init() {
  renderDates();
  renderWorkout();
  renderAINotes();
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

  const dayCount = Math.floor(
    (today - START_DATE) / (1000 * 60 * 60 * 24)
  );

  document.getElementById("dayCount").innerText =
    `Day ${dayCount} of 104`;
}

function renderWorkout() {
  const container = document.getElementById("workoutCards");
  container.innerHTML = "";

  exercises.forEach(ex => {
    const card = document.createElement("div");
    card.className = "exercise-card";
    card.innerHTML = `
      <strong>${ex}</strong>
      <p class="muted">3 × 15 reps</p>
    `;
    container.appendChild(card);
  });
}

function renderAINotes() {
  const notes = document.getElementById("aiNotes");
  notes.innerHTML = "";

  [
    "Prioritize form over intensity today.",
    "Hydration will influence your endurance.",
    "Consistent sleep tonight will improve tomorrow’s output."
  ].forEach(text => {
    const li = document.createElement("li");
    li.innerText = text;
    notes.appendChild(li);
  });
}

init();
