const TARGET_DATE = new Date("2026-03-31");
const START_DATE = new Date("2025-12-18");

const WORKOUT = [
  { name:"Bench Press", sets:3, target:15 },
  { name:"Overhead Press", sets:3, target:15 },
  { name:"Triceps Pushdown", sets:3, target:15 }
];

const WATER_PLAN = [
  { id:1, label:"Morning", time:"7–9", amount:500 },
  { id:2, label:"Late morning", time:"9–12", amount:750 },
  { id:3, label:"Afternoon", time:"12–16", amount:750 },
  { id:4, label:"Workout", time:"16–19", amount:750 },
  { id:5, label:"Evening", time:"19–22", amount:450 }
];

let workout={start:null,end:null};
let meals={}, waterLogs=[];
let weightLogs=JSON.parse(localStorage.getItem("weights")||"[]");
let baselineWeight=localStorage.getItem("baselineWeight");

function pulse(){
  const b=progressBar;
  b.style.opacity=1; b.style.width="90%";
  setTimeout(()=>{ b.style.width="100%";
    setTimeout(()=>{ b.style.opacity=0; b.style.width="0%"; },300);
  },200);
}

function init(){
  const now=new Date();
  todayDate.innerText=now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  targetDate.innerText=TARGET_DATE.toDateString();
  dayCount.innerText=`Day ${Math.floor((now-START_DATE)/86400000)}`;
  renderWorkout(); renderWater(); renderWeight(); renderAI();
}

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

function logMeal(m,k){ if(!k)return; meals[m]=Number(k); pulse(); }

function renderWater(){
  waterArea.innerHTML="";
  let total=0;
  WATER_PLAN.forEach(w=>{
    const done=waterLogs.find(x=>x.id===w.id);
    if(done) total+=w.amount;
    waterArea.innerHTML+=`
      <div class="row">
        <span>${w.label} <span class="badge">${w.time}</span></span>
        <span class="meta">${w.amount} ml</span>
        ${done ? "<span class='meta'>✓</span>" : `<button class="btn-secondary" onclick="logWater(${w.id})">Done</button>`}
      </div>`;
  });
  waterStatus.innerText=`Consumed ${total} ml`;
}

function logWater(id){
  waterLogs.push({id,time:new Date().toISOString()});
  renderWater(); pulse();
}

function logWake(){ wakeDisplay.innerText=`Wake: ${new Date().toLocaleTimeString("en-IN")}`; pulse(); }
function logSleep(){ sleepDisplay.innerText=`Sleep: ${new Date().toLocaleTimeString("en-IN")}`; pulse(); }

function logWeight(){
  const w=prompt("Morning weight (kg)");
  if(!w)return;
  weightLogs.push({w:Number(w),t:new Date().toISOString()});
  localStorage.setItem("weights",JSON.stringify(weightLogs));
  if(!baselineWeight){ baselineWeight=w; localStorage.setItem("baselineWeight",w); }
  renderWeight(); pulse();
}

function renderWeight(){
  if(!weightLogs.length)return;
  const latest=weightLogs.at(-1).w;
  weightDisplay.innerText=`Weight: ${latest} kg`;
  if(baselineWeight){
    weightMeta.innerText=`Δ ${(latest-baselineWeight).toFixed(1)} kg`;
  }
}

function renderAI(){
  aiInsights.innerHTML=`
    <li>Complete all hydration windows</li>
    <li>Hit meal timings for best recovery</li>
    <li>Track weight daily on waking</li>
  `;
}

init();
