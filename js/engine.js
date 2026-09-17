// V3.1 ENGINE MODULE
// Stable V3 calendar, quest, reward, persistence and game logic. No behavior changes.

let cloud=null,cloudUser=null,cloudReady=false;
try{
 if(window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey){
  cloud=supabase.createClient(window.SUPABASE_CONFIG.url,window.SUPABASE_CONFIG.anonKey);cloudReady=true;
 }
}catch(e){console.warn(e)}

function clone(o){return JSON.parse(JSON.stringify(o))}
function localISO(){
 const d=new Date(), y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
 return `${y}-${m}-${day}`;
}
function dateDiff(a,b){const A=new Date(a+"T00:00:00"),B=new Date(b+"T00:00:00");return Math.floor((B-A)/86400000)}
function calcDay(date=localISO()){return Math.max(1,dateDiff(START_DATE,date)+1)}
function seeded(day, salt=0){let x=(day*9301+49297+salt*233)%233280;return ()=>{x=(x*9301+49297)%233280;return x/233280}}
function pick(arr,rng){return arr[Math.floor(rng()*arr.length)]}

function questClone(q,day,type){return {...clone(q),key:`${type}_${q.id}_${day}`,type}}
function generateRoute(day){
 const rng=seeded(day);
 const mainPool=[...QUESTS.main],sidePool=[...QUESTS.side],microPool=[...QUESTS.micro];
 const main=[];
 // Two main quests with deterministic rotation.
 const m1=mainPool[(day-1)%mainPool.length],m2=mainPool[(day+1)%mainPool.length];
 main.push(questClone(m1,day,"main"),questClone(m2,day,"main"));
 const side=[];
 while(side.length<3){const q=pick(sidePool,rng);if(!side.some(x=>x.id===q.id))side.push(questClone(q,day,"side"))}
 const micro=[];
 while(micro.length<2){const q=pick(microPool,rng);if(!micro.some(x=>x.id===q.id))micro.push(questClone(q,day,"micro"))}
 return [...main,...side,...micro];
}

function eventForDay(day){
 const events=[
  {title:"LUCKY BREAK",desc:"A small pocket of time appeared. One quest costs 20% less Energy today.",effect:"energyDiscount"},
  {title:"SOCIAL INVITATION",desc:"Plans changed. One quest can be adapted without losing Momentum.",effect:"social"},
  {title:"ACADEMIC CRISIS",desc:"A deadline is near. Your Scholar's Hour becomes a priority, but adaptation remains available.",effect:"academic"},
  {title:"LOW BATTERY",desc:"Energy is limited. Recovery actions are worth slightly more Momentum.",effect:"low"},
  {title:"CLEAR WEATHER",desc:"The route feels lighter. Completing 3 quests grants a bonus.",effect:"bonus"},
  {title:"QUIET WINDOW",desc:"You found a calm hour. Reading or language work grants +10% XP.",effect:"focus"}
 ];
 return events[(day*7+3)%events.length];
}

function chapterForDay(d){
 if(d<=14)return ["AWAKENING","The system has come online. Build the foundation.","Awakening"];
 if(d<=31)return ["FOUNDATION","Turn isolated actions into a lifestyle.","Foundation"];
 if(d<=61)return ["ASCENSION","Raise the ceiling. Skills start to compound.","Ascension"];
 return ["TRANSFORMATION","The old operating system is losing control.","Transformation"];
}

function migrate(raw){
 const s=clone(initialState);
 if(!raw)return s;
 Object.assign(s,raw);
 s.version=3;
 s.skills=Object.assign({...SKILLS},raw.skills||{});
 s.done=raw.done||{};
 s.logs=raw.logs||[];
 s.events=raw.events||[];
 s.history=raw.history||[];
 s.stats=Object.assign({...initialState.stats},raw.stats||{});
 s.stats.totalAdapted=s.stats.totalAdapted??s.stats.adapted??0;
 s.stats.adapted=s.stats.adapted??s.stats.totalAdapted??0;
 s.stats.questsByDay=s.stats.questsByDay||{};
 s.achievements=raw.achievements||[];
 s.purchased=raw.purchased||[];
 s.wishlist=raw.wishlist||[];
 return s;
}

let state=migrate(null);

function loadLocal(){
 try{
  const raw=localStorage.getItem(STORAGE_KEY);
  if(raw)return migrate(JSON.parse(raw));
  // One-time migration from V1.1/V2 browser cache if present.
  const old=localStorage.getItem("WINTER_ARC_SYSTEM_V1_1");
  if(old){
   const s=migrate(JSON.parse(old));
   s.logs.unshift(time()+" — MIGRATED FROM V2 · V3 ENGINE ONLINE");
   return s;
  }
 }catch(e){}
 return migrate(null);
}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){toast("Local save unavailable — use Export Save.")}}
function time(){return new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
function log(t){state.logs.unshift(time()+" — "+t);state.logs=state.logs.slice(0,80)}
function nextXP(){return 100+state.level*35}

function ensureDay(s=state){
 const today=localISO(), target=calcDay(today);
 if(!s.lastDate){
  s.lastDate=today;s.day=target;s.energy=100;s.todayQuests=generateRoute(target);s.currentEvent=eventForDay(target);
  log("SYSTEM ONLINE · DAY "+String(target).padStart(2,"0")+" GENERATED");
  persist();return true;
 }
 if(s.lastDate===today && s.todayQuests?.length)return false;

 // Archive the previous route.
 const prevDone=Object.keys(s.done||{}).length;
 s.history=s.history||[];
 s.history.unshift({date:s.lastDate,day:s.day,quests:s.todayQuests||[],done:s.done||{},completed:prevDone});
 s.history=s.history.slice(0,60);

 s.day=target;s.lastDate=today;s.energy=100;s.done={};
 s.todayQuests=generateRoute(target);s.currentEvent=eventForDay(target);
 s.bossProgress=0;s.bossCleared=false;
 s.momentum=Math.max(0,Math.min(100,(s.momentum||50)+(prevDone>=4?5:-2)));
 log("NEW DAY GENERATED · "+today+" · DAY "+String(target).padStart(2,"0"));
 persist();
 return true;
}

function saveAndRender(sync=true){
 persist();checkAchievements();render();
 if(sync && cloudUser)syncNow(true);
}

function rewardStats(q, factor=1){
 Object.entries(q.stats||{}).forEach(([k,v])=>{state.skills[k]=(state.skills[k]||0)+Math.ceil(v*factor)});
}
function completeQuest(key){
 const q=state.todayQuests.find(x=>x.key===key);if(!q||state.done[key])return;
 let energy=q.energy;
 if(state.currentEvent?.effect==="energyDiscount")energy=Math.ceil(energy*.8);
 if(state.energy<energy){toast("Not enough Energy · use ADAPT or a Micro quest.");return}
 state.done[key]="completed";
 let xp=q.xp, coin=q.coin;
 if(state.currentEvent?.effect==="focus" && (q.id==="eng30"||q.id==="chi"||q.id==="read"))xp+=10;
 state.xp+=xp;state.coins+=coin;state.energy=Math.max(0,state.energy-energy);
 state.momentum=Math.min(100,state.momentum+(q.type==="main"?10:6));
 rewardStats(q,1);
 state.stats.totalCompleted++;
 state.stats.questsByDay[state.day]=(state.stats.questsByDay[state.day]||0)+1;
 if(state.day%7===0 && q.type!=="micro")state.bossProgress=Math.min(100,state.bossProgress+25);
 let leveled=false;
 while(state.xp>=nextXP()){state.xp-=nextXP();state.level++;leveled=true}
 if(state.currentEvent?.effect==="bonus" && Object.keys(state.done).length===3){state.xp+=25;state.coins+=10;log("DAILY EVENT BONUS · +25 XP · +10 🪙")}
 log(q.title+" COMPLETE · +"+xp+" XP · +"+coin+" 🪙");
 if(leveled)log("LEVEL UP → LV."+state.level);
 if(state.day%7===0 && state.bossProgress>=100 && !state.bossCleared){state.bossCleared=true;state.stats.bossesCleared++;state.xp+=100;state.coins+=50;log("WEEKLY BOSS CLEARED · +100 XP · +50 🪙");}
 saveAndRender();toast("QUEST CLEARED · +"+xp+" XP");
}
function adaptQuest(key){
 const q=state.todayQuests.find(x=>x.key===key);if(!q||state.done[key])return;
 state.done[key]="adapted";
 const xp=Math.ceil(q.xp*.45),coin=Math.ceil(q.coin*.5);
 state.xp+=xp;state.coins+=coin;state.momentum=Math.min(100,state.momentum+3);
 rewardStats(q,.4);
 state.stats.adapted++;state.stats.totalAdapted++;
 log(q.title+" ADAPTED · progress preserved");
 saveAndRender();toast("ADAPTED · progress preserved");
}

function checkAchievements(){
 ACHIEVEMENTS.forEach(a=>{
  if(!state.achievements.includes(a.id) && a.check(state)){
   state.achievements.push(a.id);state.coins+=30;log("ACHIEVEMENT UNLOCKED · "+a.name+" · +30 🪙");
  }
 });
}
function bossAvailable(){return state.day%7===0}
function bossName(){return "THE WEEKLY WALL · DAY "+state.day}
function clearBoss(){if(!bossAvailable())return;if(state.bossProgress<100){toast("Boss not cleared yet — complete main quests.");return}state.bossCleared=true;saveAndRender();}

function buy(id){
 const item=SHOP.find(x=>x.id===id);if(!item)return;
 if(state.coins<item.price){toast("Not enough Coins.");return}
 state.coins-=item.price;state.purchased.unshift({id,date:localISO(),day:state.day});log("REWARD CLAIMED · "+item.name+" · -"+item.price+" 🪙");saveAndRender();toast("Reward unlocked 🎁");
}
