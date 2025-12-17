console.log("Fitness AI Coach loaded");

/* ---------- STATE ---------- */
const TARGET_DATE = new Date("2026-03-31");

const state = {
  workoutStartedAt: null,
  workoutEndedAt: null,
  sets: [],
  dayIndex: 0,

  // Nutrition
  baseCalories: 3300,
  caloriesConsumed: 0,

  // Water
  bodyWeightKg: 50,
  waterConsumed: 0
};

/* ---------- DATE ---------- */
function renderDate() {
  document.getElementById("todayDate").innerText =
    "Today: " + new Date().toDateString();
}

/* ---------- WORKOUT ENGINE ---------- */
const split = ["Push", "Pull", "Legs"];
const workoutTemplates = {
  Push: ["Bench Press", "Overhead Press", "Triceps Pushdown"],
  Pull: ["Pull Ups", "Barbell Row", "Biceps Curl"],
  Legs: ["Squat", "Leg Press", "Hamstring Curl"]
};

function generateWorkoutPlan() {
  const dayType = split[state.dayIndex % 3];
  const list = document.getElementById("workoutPlan");
  list.innerHTML = "";

  workoutTemplates[dayType].forEach(ex => {
    const li = document.createElement("li");
    li.innerText = `${ex} — 3 x 15`;
    list.appendChild(li);
  });
}

/* ---------- DIET ENGINE ---------- */
function generateDietPlan() {
  const meals = [
    { name: "Breakfast", pct: 0.25 },
    { name: "Lunch", pct: 0.35 },
    { name: "Dinner", pct: 0.40 }
  ];

  document.getElementById("calorieTarget").innerText =
    state.baseCalories;

  const list = document.getElementById("dietPlan");
  list.innerHTML = "";

  meals.forEach(m => {
    const calories = Math.round(state.baseCalories * m.pct);
    const li = document.createElement("li");
    li.innerText = `${m.name}: ${calories} kcal`;
    list.appendChild(li);
  });
}

function logCalories() {
  const val = Number(document.getElementById("calorieInput").value);
  if (!val) return;

  state.caloriesConsumed += val;

  const diff = state.caloriesConsumed - state.baseCalories;
  const status =
    diff >= 0
      ? `Surplus: +${diff} kcal`
      : `Deficit: ${diff} kcal`;

  document.getElementById("calorieStatus").innerText = status;

  generateAIRecommendations();
}

/* ---------- WATER ENGINE ---------- */
function calculateWaterTarget() {
  let target = state.bodyWeightKg * 35;

  const durationMin =
    state.workoutStartedAt && state.workoutEndedAt
      ? (state.workoutEndedAt - state.workoutStartedAt) / 60000
      : 0;

  if (durationMin > 45) target += 500;

  document.getElementById("waterTarget").innerText = target;
}

function logWater() {
  state.waterConsumed += 250;
  document.getElementById("waterConsumed").innerText =
    state.waterConsumed;

  generateAIRecommendations();
}

/* ---------- WORKOUT SESSION ---------- */
function logSet() {
  const now = new Date();

  if (!state.workoutStartedAt) {
    state.workoutStartedAt = now;
    document.getElementById("startTime").innerText =
      now.toLocaleTimeString();
  }

  state.sets.push(now);
  state.workoutEndedAt = now;

  document.getElementById("endTime").innerText =
    now.toLocaleTimeString();

  updateDuration();
  calculateWaterTarget();
  generateAIRecommendations();
}

function updateDuration() {
  const diff =
    state.workoutEndedAt - state.workoutStartedAt;

  const min = Math.floor(diff / 60000);
  const sec = Math.floor((diff % 60000) / 1000);

  document.getElementById("duration").innerText =
    `${min} min ${sec} sec`;
}

/* ---------- MOCK LLM RECOMMENDATIONS ---------- */
function generateAIRecommendations() {
  const list = document.getElementById("aiRecommendations");
  list.innerHTML = "";

  const recs = [];

  if (state.caloriesConsumed < state.baseCalories) {
    recs.push(
      "You are under target calories. Increase portion size in next meal."
    );
  }

  if (state.waterConsumed < 0.7 * state.bodyWeightKg * 35) {
    recs.push(
      "Hydration is low. Increase water intake to support recovery."
    );
  }

  recs.push(
    "If fatigue is high tomorrow, reduce volume by 5–10%."
  );

  recs.forEach(r => {
    const li = document.createElement("li");
    li.innerText = r;
    list.appendChild(li);
  });
}

/* ---------- INIT ---------- */
renderDate();
generateWorkoutPlan();
generateDietPlan();
calculateWaterTarget();
generateAIRecommendations();
