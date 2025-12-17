console.log("Fitness AI Coach loaded");

/* ===============================
   GLOBAL CONSTANTS & STATE
================================ */
const TARGET_DATE = new Date("2026-03-31");

const state = {
  // Workout
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

/* ===============================
   DATE RENDERING
================================ */
function renderDates() {
  const today = new Date();

  document.getElementById("todayDate").innerText =
    "Today: " + today.toDateString();

  document.getElementById("targetDate").innerText =
    TARGET_DATE.toDateString();
}

/* ===============================
   WORKOUT PLAN ENGINE
================================ */
const split = ["Push", "Pull", "Legs"];

const workoutTemplates = {
  Push: ["Bench Press", "Overhead Press", "Triceps Pushdown"],
  Pull: ["Pull Ups", "Barbell Row", "Biceps Curl"],
  Legs: ["Squat", "Leg Press", "Hamstring Curl"]
};

function generateWorkoutPlan() {
  const dayType = split[state.dayIndex % split.length];
  const list = document.getElementById("workoutPlan");
  list.innerHTML = "";

  workoutTemplates[dayType].forEach(exercise => {
    const li = document.createElement("li");
    li.innerText = `${exercise} — 3 sets × 15 reps`;
    list.appendChild(li);
  });
}

/* ===============================
   DIET ENGINE
================================ */
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

  meals.forEach(meal => {
    const calories = Math.round(state.baseCalories * meal.pct);
    const li = document.createElement("li");
    li.innerText = `${meal.name}: ${calories} kcal`;
    list.appendChild(li);
  });
}

function logCalories() {
  const input = document.getElementById("calorieInput");
  const value = Number(input.value);

  if (!value) return;

  state.caloriesConsumed += value;
  input.value = "";

  const diff = state.caloriesConsumed - state.baseCalories;

  document.getElementById("calorieStatus").innerText =
    diff >= 0
      ? `Surplus: +${diff} kcal`
      : `Deficit: ${diff} kcal`;

  generateAIRecommendations();
}

/* ===============================
   WATER ENGINE
================================ */
function calculateWaterTarget() {
  let target = state.bodyWeightKg * 35;

  if (state.workoutStartedAt && state.workoutEndedAt) {
    const durationMin =
      (state.workoutEndedAt - state.workoutStartedAt) / 60000;

    if (durationMin > 45) target += 500;
  }

  document.getElementById("waterTarget").innerText = target;
}

function logWater() {
  state.waterConsumed += 250;
  document.getElementById("waterConsumed").innerText =
    state.waterConsumed;

  generateAIRecommendations();
}

/* ===============================
   WORKOUT SESSION TRACKING
================================ */
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

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  document.getElementById("duration").innerText =
    `${minutes} min ${seconds} sec`;
}

/* ===============================
   MOCK LLM RECOMMENDATIONS
================================ */
function generateAIRecommendations() {
  const list = document.getElementById("aiRecommendations");
  list.innerHTML = "";

  const recommendations = [];

  if (state.caloriesConsumed < state.baseCalories) {
    recommendations.push(
      "You are below your calorie target. Increase portion size in the next meal."
    );
  }

  const waterTarget = state.bodyWeightKg * 35;
  if (state.waterConsumed < 0.7 * waterTarget) {
    recommendations.push(
      "Hydration is low. Increase water intake to support recovery."
    );
  }

  if (state.workoutStartedAt && state.workoutEndedAt) {
    const duration =
      (state.workoutEndedAt - state.workoutStartedAt) / 60000;

    if (duration < 30) {
      recommendations.push(
        "Workout duration is short. Consider increasing rest or volume."
      );
    }
  }

  recommendations.push(
    "If fatigue is high tomorrow, reduce training volume by 5–10%."
  );

  recommendations.forEach(text => {
    const li = document.createElement("li");
    li.innerText = text;
    list.appendChild(li);
  });
}

/* ===============================
   INIT
================================ */
renderDates();
generateWorkoutPlan();
generateDietPlan();
calculateWaterTarget();
generateAIRecommendations();
