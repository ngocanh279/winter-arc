// V3.1 DATA MODULE
// Copied from the stable V3. Game data and save schema are intentionally unchanged.

const START_DATE="2026-09-17";
const STORAGE_KEY="WINTER_ARC_SYSTEM_V3";
const SKILLS={Body:0,English:0,Chinese:0,Academic:0,Knowledge:0,Lifestyle:0,Appearance:0,Career:0,Finance:0,Discipline:0,Communication:0,Reading:0};

const QUESTS={
 main:[
  {id:"eng30",icon:"🇬🇧",title:"LANGUAGE AWAKENING",desc:"English speaking / shadowing — 30 min",xp:50,coin:20,energy:20,stats:{English:30}},
  {id:"workout",icon:"🏋🏻",title:"BODY FORGE",desc:"Complete today's workout or 30 min movement",xp:60,coin:25,energy:30,stats:{Body:35}},
  {id:"academic",icon:"🎓",title:"SCHOLAR'S HOUR",desc:"Focused academic work — 45 min",xp:55,coin:22,energy:25,stats:{Academic:30,Knowledge:10}},
  {id:"career",icon:"💼",title:"CAREER MOVE",desc:"One concrete career / CV / opportunity action",xp:45,coin:20,energy:18,stats:{Career:28,Communication:8}}
 ],
 side:[
  {id:"chi",icon:"🇨🇳",title:"MANDARIN MOMENT",desc:"Chinese — 20 min",xp:20,coin:10,energy:10,stats:{Chinese:20}},
  {id:"ir",icon:"🌐",title:"DIPLOMAT'S EYE",desc:"Read 1 IR / foreign-policy piece + 3 takeaways",xp:25,coin:12,energy:12,stats:{Knowledge:20,Reading:10}},
  {id:"read",icon:"📖",title:"PAGE TURNER",desc:"Read 15 pages of a chosen book",xp:20,coin:10,energy:8,stats:{Reading:18}},
  {id:"space",icon:"✨",title:"LIFE RESET",desc:"10-minute reset + prepare tomorrow",xp:10,coin:5,energy:5,stats:{Lifestyle:10,Discipline:5}},
  {id:"finance",icon:"💰",title:"MONEY AWARENESS",desc:"Track spending / budget for 10 min",xp:15,coin:8,energy:5,stats:{Finance:15}},
  {id:"appear",icon:"🪞",title:"POLISHED SELF",desc:"Complete one intentional appearance / skincare action",xp:15,coin:8,energy:4,stats:{Appearance:15}},
  {id:"comm",icon:"🗣️",title:"SOCIAL REP",desc:"One meaningful conversation or communication rep",xp:18,coin:9,energy:7,stats:{Communication:18}},
  {id:"water",icon:"💧",title:"HYDRATE",desc:"Hit your water target",xp:5,coin:2,energy:0,stats:{Lifestyle:5}},
  {id:"sleep",icon:"🌙",title:"SLEEP PROTOCOL",desc:"Start bedtime routine on time",xp:10,coin:5,energy:0,stats:{Lifestyle:10,Discipline:5}}
],
micro:[
  {id:"water",icon:"💧",title:"HYDRATE",desc:"Drink a full glass of water now",xp:5,coin:2,energy:0,stats:{Lifestyle:5}},
  {id:"stretch",icon:"🧘",title:"RESET BREATH",desc:"5 min stretch / breathing",xp:8,coin:3,energy:2,stats:{Lifestyle:6,Body:2}},
  {id:"desk",icon:"🗂️",title:"CLEAR ONE THING",desc:"Put away 5 items / close one tiny loop",xp:6,coin:2,energy:1,stats:{Discipline:6,Lifestyle:3}},
  {id:"vocab",icon:"📝",title:"WORD DROP",desc:"Learn 5 English or Chinese words",xp:7,coin:3,energy:2,stats:{English:4,Chinese:4}},
  {id:"journal",icon:"✍️",title:"SYSTEM CHECK-IN",desc:"Write 3 lines: win / lesson / next move",xp:8,coin:3,energy:1,stats:{Discipline:5,Communication:3}}
]};

const SHOP=[
 {id:"common",icon:"☕",name:"Small Treat",desc:"Coffee, matcha, dessert or a small comfort",price:80},
 {id:"selfdate",icon:"🎬",name:"Self-Date",desc:"Movie, café, museum or solo outing",price:180},
 {id:"fashion",icon:"👗",name:"Wishlist Fashion",desc:"One item from your approved wishlist",price:350},
 {id:"beauty",icon:"✨",name:"Beauty Drop",desc:"Skincare / hair / beauty item from your wishlist",price:300},
 {id:"rare",icon:"🎁",name:"Rare Reward",desc:"A deliberately chosen reward you really want",price:600},
 {id:"legendary",icon:"❄️",name:"Legendary Reward",desc:"Major end-of-chapter reward",price:1200}
];

const ACHIEVEMENTS=[
 {id:"first",name:"FIRST BLOOD",desc:"Complete your first quest",check:s=>s.stats.totalCompleted>=1},
 {id:"five",name:"GETTING SERIOUS",desc:"Complete 5 quests",check:s=>s.stats.totalCompleted>=5},
 {id:"ten",name:"DOUBLE DIGITS",desc:"Complete 10 quests",check:s=>s.stats.totalCompleted>=10},
 {id:"comeback",name:"COMEBACK",desc:"Use Adaptation after an interruption",check:s=>s.stats.adapted>=1},
 {id:"week",name:"ONE WEEK ONLINE",desc:"Reach Day 7",check:s=>s.day>=7},
 {id:"level5",name:"LEVEL 05",desc:"Reach Level 5",check:s=>s.level>=5},
 {id:"coins500",name:"TREASURE HUNTER",desc:"Hold 500 coins",check:s=>s.coins>=500},
 {id:"skill100",name:"SPECIALIST",desc:"Reach 100 in any skill",check:s=>Object.values(s.skills).some(v=>v>=100)},
 {id:"boss",name:"BOSS BREAKER",desc:"Clear a weekly boss",check:s=>s.stats.bossesCleared>=1},
 {id:"adapt3",name:"MASTER OF ADAPTATION",desc:"Adapt 3 quests",check:s=>s.stats.adapted>=3},
 {id:"day14",name:"FORTNIGHT",desc:"Reach Day 14",check:s=>s.day>=14},
 {id:"day30",name:"THE ARC IS REAL",desc:"Reach Day 30",check:s=>s.day>=30}
];

const initialState={
 version:3,startDate:START_DATE,lastDate:null,day:1,level:1,xp:0,momentum:50,energy:100,coins:0,class:"UNDEFINED",
 todayQuests:[],done:{},skills:{...SKILLS},logs:[],events:[],history:[],
 stats:{totalCompleted:0,totalAdapted:0,adapted:0,bossesCleared:0,questsByDay:{}},
 achievements:[],purchased:[],wishlist:[],
 currentEvent:null,bossProgress:0,bossCleared:false
};
