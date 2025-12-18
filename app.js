/* ================= CONFIG ================= */

const TARGET_DATE = new Date("2026-03-31");
const START_DATE = new Date("2025-12-18");

const BASE_SLEEP_HOURS = 8;

/* ================= UTIL ================= */

function todayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function nowIST() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

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

/* ================= INIT ================= */

function init() {
  const now = new Date();

  todayDate.innerText = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  targetDate.innerText = TARGET_DATE.toDateString();
  dayCount.innerText = `Day ${Math.floor((now - START_DATE) / 86400000)}`;

  plannedSleep.value = localStorage.getItem("plannedSleep") || "";
  plannedWake.value = localStorage.getItem("plannedWake") || "";

  renderSleepStatus();
  renderAnalysis();
  renderHistory();
  renderTomorrowPlan();
}

init();

/* ================= TABS ================= */

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-page").forEach(p => p.classList.remove("active"));
  document.querySelector(`[onclick*="${tabId}"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");

  if (tabId === "analysis") renderAnalysis();
  if (tabId === "history") renderHistory();
  if (tabId === "tomorrow") renderTomorrowPlan();
}

/* ================= SLEEP LOGIC ================= */

function savePlannedSleep() {
  localStorage.setItem("plannedSleep", plannedSleep.value);
  pulse();
}

function savePlannedWake() {
  localStorage.setItem("plannedWake", plannedWake.value);
  pulse();
}

function logSleep() {
  localStorage.setItem(`sleep-${todayKey()}`, new Date().toISOString());
  renderSleepStatus();
  pulse();
}

function logWake() {
  localStorage.setItem(`wake-${todayKey()}`, new Date().toISOString());
  renderSleepStatus();
  pulse();
}

function renderSleepStatus() {
  const sleep = localStorage.getItem(`sleep-${todayKey()}`);
  const wake = localStorage.getItem(`wake-${todayKey()}`);

  sleepDisplay.innerText = sleep ? `Sleep: ${new Date(sleep).toLocaleTimeString("en-IN")}` : "Sleep: –";
  wakeDisplay.innerText = wake ? `Wake: ${new Date(wake).toLocaleTimeString("en-IN")}` : "Wake: –";

  if (sleep && wake) {
    const duration =
      (new Date(wake) - new Date(sleep)) / 3600000;

    const kpi = {
      date: todayKey(),
      sleep_hours: Number(duration.toFixed(2)),
      sleep_debt: Number((BASE_SLEEP_HOURS - duration).toFixed(2))
    };

    localStorage.setItem(`kpi-${todayKey()}`, JSON.stringify(kpi));
  }
}

/* ================= ANALYSIS ================= */

function renderAnalysis() {
  const el = document.getElementById("analysis");
  const kpi = JSON.parse(localStorage.getItem(`kpi-${todayKey()}`) || "{}");

  el.innerHTML = `
    <div class="card">
      <h2>Analysis</h2>
      <p><strong>Sleep Duration:</strong> ${kpi.sleep_hours || "–"} hrs</p>
      <p><strong>Sleep Debt:</strong> ${kpi.sleep_debt || "–"} hrs</p>
    </div>
  `;
}

/* ================= HISTORY ================= */

function renderHistory() {
  const el = document.getElementById("history");
  let html = `<div class="card"><h2>History</h2>`;

  Object.keys(localStorage)
    .filter(k => k.startsWith("kpi-"))
    .sort()
    .forEach(key => {
      const kpi = JSON.parse(localStorage.getItem(key));
      html += `<div>${kpi.date} — Sleep: ${kpi.sleep_hours}h</div>`;
    });

  html += `</div>`;
  el.innerHTML = html;
}

/* ================= TOMORROW ================= */

function renderTomorrowPlan() {
  const el = document.getElementById("tomorrow");
  const kpi = JSON.parse(localStorage.getItem(`kpi-${todayKey()}`) || {});

  const note =
    kpi.sleep_debt > 1
      ? "Reduce workout intensity slightly"
      : "Proceed with planned intensity";

  el.innerHTML = `
    <div class="card">
      <h2>Tomorrow’s Plan</h2>
      <p><strong>Sleep-based adjustment:</strong> ${note}</p>
    </div>
  `;
}
