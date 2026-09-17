// V3.1 UI MODULE
// Stable V3 rendering, with one isolated Wishlist render hook.

function render(){
 const d=state.day, chapter=chapterForDay(d);
 document.getElementById("headerDay").textContent=new Date(state.lastDate+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()+" · DAY "+String(d).padStart(2,"0");
 document.getElementById("level").textContent="LV."+String(state.level).padStart(2,"0");
 document.getElementById("xp").textContent=state.xp;document.getElementById("nextxp").textContent=nextXP();
 document.getElementById("xpbar").style.width=Math.min(100,state.xp/nextXP()*100)+"%";
 document.getElementById("momentum").textContent=state.momentum;document.getElementById("mbar").style.width=state.momentum+"%";
 document.getElementById("energy").textContent=state.energy;document.getElementById("coins").textContent=state.coins;
 document.getElementById("questsDone").textContent=Object.keys(state.done).length+"/7";
 document.getElementById("class").textContent=state.class;
 document.getElementById("chapter").textContent=chapter[0];document.getElementById("chapterDesc").textContent=chapter[1];
 document.getElementById("route").textContent="DAY "+String(d).padStart(2,"0");
 document.getElementById("questBoardDay").textContent="DAY "+String(d).padStart(2,"0");
 document.getElementById("timelineDay").textContent="DAY "+d;
 document.getElementById("dailyBrief").textContent=`${chapter[2].toUpperCase()} ROUTE · ${state.lastDate} · Generated from the real calendar.`;
 const qhtml=state.todayQuests.map(q=>questHTML(q)).join("");
 document.getElementById("dashboardQuests").innerHTML=qhtml;
 document.getElementById("allQuests").innerHTML=qhtml;
 renderEvent();renderSkills();renderShop();renderAchievements();renderProgress();renderSystem();renderLog();updateAuthUI();
}
function questHTML(q){
 const st=state.done[q.key];
 return `<div class="quest ${q.type==='boss'?'boss':''}">
  <div class="quest-main"><div class="icon">${q.icon}</div><div><div class="qtitle">${q.title}</div><div class="qmeta">${q.desc}</div><div class="rewards">+${q.xp} XP · +${q.coin} 🪙 · −${q.energy} Energy · ${q.type.toUpperCase()}</div></div></div>
  <div>${st?`<span class="status ${st==='adapted'?'adapt':'done'}">${st.toUpperCase()}</span>`:`<span class="status">AVAILABLE</span><div class="actions"><button class="btn primary" onclick="completeQuest('${q.key}')">COMPLETE</button><button class="btn" onclick="adaptQuest('${q.key}')">ADAPT</button></div>`}</div>
 </div>`;
}
function renderEvent(){
 const e=state.currentEvent||eventForDay(state.day);
 document.getElementById("eventBox").innerHTML=`<div class="event"><b>${e.title}</b><p>${e.desc}</p></div>`;
}
function renderSkills(){
 const order=["Body","English","Chinese","Academic","Knowledge","Lifestyle","Appearance","Career","Finance","Discipline","Communication","Reading"];
 document.getElementById("skillSnapshot").innerHTML=order.slice(0,6).map(s=>skillHTML(s)).join("");
 document.getElementById("allSkills").innerHTML=order.map(s=>skillHTML(s)).join("");
}
function skillHTML(s){const v=state.skills[s]||0;return `<div class="skill"><div class="skilltop"><span>${s}</span><b>${v}</b></div><div class="skillbar"><i style="width:${Math.min(100,v)}%"></i></div></div>`}
function renderShop(){
 document.getElementById("shopCoins").textContent=state.coins;
 document.getElementById("shopGrid").innerHTML=SHOP.map(x=>`<div class="item"><div style="font-size:22px">${x.icon}</div><h3>${x.name}</h3><p>${x.desc}</p><div class="price">🪙 ${x.price}</div><div class="actions"><button class="btn gold" onclick="buy('${x.id}')">CLAIM REWARD</button></div></div>`).join("");
 renderWishlist();
}
function renderAchievements(){
 const unlocked=state.achievements.length;
 document.getElementById("achievementCount").textContent=unlocked+"/"+ACHIEVEMENTS.length+" UNLOCKED";
 document.getElementById("achievementList").innerHTML=ACHIEVEMENTS.map(a=>{
  const ok=state.achievements.includes(a.id);
  return `<div class="achievement ${ok?'':'locked'}"><div><b>${ok?'🏆':'○'} ${a.name}</b><br><span>${a.desc}</span></div><span>${ok?'UNLOCKED':'LOCKED'}</span></div>`;
 }).join("");
}
function renderProgress(){
 const chapter=chapterForDay(state.day);
 document.getElementById("timeline").innerHTML=[
  ["17 Sep","Awakening",state.day>=1],["1 Oct","Foundation",state.day>=15],["1 Nov","Ascension",state.day>=46],["1 Dec","Transformation",state.day>=76]
 ].map(x=>`<div style="padding:10px 0;border-bottom:1px solid var(--line);font-size:10px;opacity:${x[2]?1:.45}"><b>${x[0]}</b> · ${x[1]}</div>`).join("");
 document.getElementById("bossStatus").textContent=bossAvailable()?"BOSS DAY":"NEXT AT DAY "+(Math.floor(state.day/7)*7+7);
 const bp=bossAvailable()?state.bossProgress:0;
 document.getElementById("bossCard").innerHTML=`<div class="event"><b>⚔ ${bossAvailable()?bossName():"WEEKLY BOSS LOCKED"}</b><p>${bossAvailable()?"Complete meaningful quests today to fill the boss bar.":"Every 7th day becomes a boss encounter."}</p><div style="margin-top:10px;height:9px;background:#e6e3da;border-radius:99px"><div style="height:100%;width:${bp}%;background:var(--gold);border-radius:99px"></div></div><div style="font-size:9px;color:var(--muted);margin-top:5px">${bp}% complete</div>${bossAvailable()&&bp>=100&&!state.bossCleared?'<div class="actions"><button class="btn gold" onclick="clearBoss()">CLEAR BOSS</button></div>':''}${state.bossCleared?'<div class="rewards" style="margin-top:7px">BOSS CLEARED · +100 XP · +50 🪙</div>':''}</div>`;
 const order=["Body","English","Chinese","Academic","Knowledge","Lifestyle","Appearance","Career","Finance","Discipline","Communication","Reading"];
 document.getElementById("progressStats").innerHTML=order.map(s=>`<div class="progress-row"><span>${s}</span><div class="progressbar"><i style="width:${Math.min(100,state.skills[s]||0)}%"></i></div><b>${state.skills[s]||0}</b></div>`).join("");
}
function renderSystem(){
 document.getElementById("systemInfo").innerHTML=[
  ["ENGINE","V3 · Calendar + Quest + Cloud"],
  ["REAL DATE",state.lastDate],
  ["ARC DAY","Day "+state.day],
  ["TODAY ROUTE",state.todayQuests.length+" quests"],
  ["CLOUD",cloudUser?"CONNECTED":"NOT CONNECTED"],
  ["LOCAL CACHE","ACTIVE"],
  ["ACHIEVEMENTS",state.achievements.length+" unlocked"],
  ["HISTORY",state.history.length+" archived days"]
 ].map(x=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:10px"><span style="color:var(--muted)">${x[0]}</span><b>${x[1]}</b></div>`).join("");
}
function renderLog(){document.getElementById("log").innerHTML=state.logs.length?state.logs.map(x=>`<p>${x}</p>`).join(""):'<div class="empty">No events yet.</div>'}
