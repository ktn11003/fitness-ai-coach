/* ========= CONFIG ========= */

const TARGET_DATE = new Date("2026-03-31");
const START_DATE = new Date("2025-12-18");

const WORKOUT = [
  { name:"Bench Press", sets:4, target:12 },
  { name:"Incline DB Press", sets:3, target:12 },
  { name:"Overhead Press", sets:3, target:10 },
  { name:"Triceps Pushdown", sets:4, target:12 },
  { name:"Lateral Raises", sets:4, target:15 }
];

/* ========= STATE ========= */

let workout = { start:null, end:null };
let meals = {};
let weightLogs = JSON.parse(localStorage.getItem("weights") || "[]");
let baselineWeight = localStorage.getItem("baselineWeight");

/* ========= UTIL ========= */

function pulse(){
  const b=document.getElementById("progressBar");
  b.style.opacity=1; b.style.width="90%";
  setTimeout(()=>{ b.style.width="100%";
    setTimeout(()=>{ b.style.opacity=0; b.style.width="0%"; },300);
  },200);
}

/* ========= INIT ========= */

function init(){
  const now=new Date();

  todayDate.innerText = now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  targetDate.innerText = TARGET_DATE.toDateString();
  dayCount.innerText = `Day ${Math.floor((now-START_DATE)/86400000)}`;

  renderWorkout();
  renderWeight();
  renderAI();
}

init();

/* ========= WORKOUT ========= */

function renderWorkout(){
  workoutArea.innerHTML="";
  WORKOUT.forEach(ex=>{
    const d=document.createElement("div");
    d.className="exercise";
    d.innerHTML=`<div class="exercise-title">${ex.name} · ${ex.sets}×${ex.target}</div>`;
    for(let i=1;i<=ex.sets;i++){
      d.innerHTML+=`<div class="set-row">Set ${i}<input onchange="logSet()" /></div>`;
    }
    workoutArea.appendChild(d);
  });
}

function logSet(){
  const now=new Date();
  if(!workout.start){
    workout.start=now;
    startTime.innerText=now.toLocaleTimeString("en-IN");
  }
  workout.end=now;
  endTime.innerText=now.toLocaleTimeString("en-IN");
  duration.innerText=Math.floor((workout.end-workout.start)/60000)+" min";
  pulse();
}

/* ========= NUTRITION ========= */

function logMeal(meal,kcal){
  if(!kcal) return;
  meals[meal]=Number(kcal);
  const total=Object.values(meals).reduce((a,b)=>a+b,0);
  nutritionStatus.innerText=`Consumed ${total} kcal`;
  pulse();
}

/* ========= HYDRATION ========= */

function logWater(){ pulse(); }
/* ========= HYDRATION (DAY 0 LOGIC) ========= */

const WATER_PLAN = [
  { id:1, label:"Morning", time:"7–9", amount:500 },
  { id:2, label:"Late morning", time:"9–12", amount:750 },
  { id:3, label:"Afternoon", time:"12–16", amount:750 },
  { id:4, label:"Workout window", time:"16–19", amount:750 },
  { id:5, label:"Evening", time:"19–22", amount:450 }
];

let waterLogs = [];

function renderWater(){
  waterArea.innerHTML="";
  let total=0;

  WATER_PLAN.forEach(w=>{
    const done = waterLogs.find(x=>x.id===w.id);
    if(done) total+=w.amount;

    const row=document.createElement("div");
    row.className="water-row";
    row.innerHTML=`
      <span>${w.label} <span class="badge">${w.time}</span></span>
      <span class="muted">${w.amount} ml</span>
      ${
        done
          ? `<span class="muted">✓</span>`
          : `<button class="mini" onclick="logWater(${w.id})">Done</button>`
      }
    `;
    waterArea.appendChild(row);
  });

  waterStatus.innerText = `Consumed ${total} ml`;
}

function logWater(id){
  waterLogs.push({
    id,
    time:new Date().toISOString()
  });
  renderWater();
  pulse();
}

/* call this inside init() */
renderWater();


/* ========= SLEEP ========= */

function logWake(){
  wakeDisplay.innerText=`Wake: ${new Date().toLocaleTimeString("en-IN")}`;
  pulse();
}
function logSleep(){
  sleepDisplay.innerText=`Sleep: ${new Date().toLocaleTimeString("en-IN")}`;
  pulse();
}

/* ========= WEIGHT ========= */

function logWeight(){
  const w=prompt("Enter morning body weight (kg)");
  if(!w) return;

  const entry={ weight:Number(w), date:new Date().toISOString() };
  weightLogs.push(entry);
  localStorage.setItem("weights",JSON.stringify(weightLogs));

  if(!baselineWeight){
    baselineWeight=w;
    localStorage.setItem("baselineWeight",w);
  }
  renderWeight();
  pulse();
}

function renderWeight(){
  if(weightLogs.length===0) return;

  const latest=weightLogs[weightLogs.length-1].weight;
  weightDisplay.innerText=`Weight: ${latest} kg`;

  if(baselineWeight){
    const diff=(latest-baselineWeight).toFixed(1);
    weightMeta.innerText=`Δ ${diff} kg`;
  }
}

/* ========= AI ========= */

function renderAI(){
  aiInsights.innerHTML=`
    <li>Hit all target sets today</li>
    <li>Eat all 6 meals on time</li>
    <li>Track morning weight daily</li>
  `;
}
