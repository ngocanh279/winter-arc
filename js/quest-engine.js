// V3.2 QUEST ENGINE MODULE — Wave 1
// Isolated addition on top of the stable V3.1 build.
// Responsibilities: richer quest pool, deterministic Daily Route, Quest Board, Surprise Me.
// It does NOT touch auth, cloud sync, wishlist, achievements, level math, or calendar logic.

const QuestEngine = (() => {
  const EXTRA = {
    main: [
      {id:"eng_speak20",icon:"🇬🇧",title:"SPEAKING SPRINT",desc:"Speak English for 20 focused minutes",xp:42,coin:18,energy:16,stats:{English:24,Communication:8},skill:"English",difficulty:"STANDARD",duration:20},
      {id:"eng_shadow30",icon:"🎧",title:"SHADOW & FLOW",desc:"30 min English shadowing + 2 min spoken recap",xp:52,coin:21,energy:20,stats:{English:28,Communication:8},skill:"English",difficulty:"STANDARD",duration:30},
      {id:"chi_focus25",icon:"🇨🇳",title:"MANDARIN TRIAL",desc:"25 min Chinese study with active recall",xp:45,coin:19,energy:18,stats:{Chinese:28,Discipline:5},skill:"Chinese",difficulty:"STANDARD",duration:25},
      {id:"body_strength",icon:"🏋🏻",title:"STRENGTH SESSION",desc:"Complete a focused strength workout",xp:58,coin:24,energy:28,stats:{Body:34,Discipline:7},skill:"Body",difficulty:"STANDARD",duration:45},
      {id:"body_cardio",icon:"👟",title:"MOVE THE BODY",desc:"30 min brisk walk, cardio, or active movement",xp:44,coin:18,energy:18,stats:{Body:26,Lifestyle:6},skill:"Body",difficulty:"STANDARD",duration:30},
      {id:"academic45",icon:"🎓",title:"DEEP STUDY BLOCK",desc:"45 min distraction-free academic focus",xp:56,coin:22,energy:25,stats:{Academic:30,Discipline:8},skill:"Academic",difficulty:"STANDARD",duration:45},
      {id:"policy_deep",icon:"🌐",title:"DIPLOMAT'S BRIEF",desc:"Study one IR issue and write a 5-point brief",xp:50,coin:20,energy:22,stats:{Knowledge:24,Academic:12,Reading:8},skill:"Knowledge",difficulty:"STANDARD",duration:35},
      {id:"career_action",icon:"💼",title:"ONE CAREER MOVE",desc:"Finish one concrete CV, application, networking, or portfolio action",xp:46,coin:20,energy:18,stats:{Career:26,Communication:8},skill:"Career",difficulty:"STANDARD",duration:30}
    ],
    side: [
      {id:"eng_voice",icon:"🎙️",title:"VOICE NOTE",desc:"Record a 3-minute English voice diary",xp:20,coin:9,energy:7,stats:{English:14,Communication:8},skill:"English",difficulty:"SAFE",duration:10},
      {id:"eng_vocab",icon:"🗣️",title:"VOCAB IN MOTION",desc:"Learn 10 English words and use each in a sentence",xp:22,coin:10,energy:8,stats:{English:18},skill:"English",difficulty:"SAFE",duration:15},
      {id:"chi_vocab",icon:"🀄",title:"HSK WORD RUN",desc:"Learn and actively recall 12 Chinese words",xp:22,coin:10,energy:8,stats:{Chinese:18},skill:"Chinese",difficulty:"SAFE",duration:15},
      {id:"chi_speak",icon:"💬",title:"MANDARIN OUT LOUD",desc:"Speak Chinese aloud for 10 minutes using familiar vocabulary",xp:24,coin:11,energy:9,stats:{Chinese:18,Communication:5},skill:"Chinese",difficulty:"SAFE",duration:10},
      {id:"read10",icon:"📖",title:"TEN-PAGE RUN",desc:"Read 10 focused pages",xp:16,coin:7,energy:6,stats:{Reading:14},skill:"Reading",difficulty:"SAFE",duration:15},
      {id:"ir_takeaway",icon:"📰",title:"WORLD IN 15",desc:"Read one IR/news analysis and save 3 takeaways",xp:24,coin:11,energy:10,stats:{Knowledge:17,Reading:8},skill:"Knowledge",difficulty:"STANDARD",duration:20},
      {id:"review_notes",icon:"📝",title:"KNOWLEDGE LOCK-IN",desc:"Review one class topic and write a mini summary",xp:24,coin:11,energy:10,stats:{Academic:16,Discipline:5},skill:"Academic",difficulty:"STANDARD",duration:20},
      {id:"plan_tomorrow",icon:"🗓️",title:"TOMORROW, CONTROLLED",desc:"Plan tomorrow's top 3 priorities",xp:14,coin:7,energy:4,stats:{Lifestyle:9,Discipline:8},skill:"Lifestyle",difficulty:"SAFE",duration:10},
      {id:"skincare",icon:"✨",title:"POLISHED ROUTINE",desc:"Complete your intentional skincare / grooming routine",xp:14,coin:7,energy:3,stats:{Appearance:14,Lifestyle:4},skill:"Appearance",difficulty:"SAFE",duration:10},
      {id:"money_check",icon:"💰",title:"MONEY CHECK",desc:"Log today's spending and inspect one money decision",xp:14,coin:7,energy:4,stats:{Finance:14,Discipline:3},skill:"Finance",difficulty:"SAFE",duration:10},
      {id:"reach_out",icon:"🤝",title:"SOCIAL COURAGE",desc:"Initiate one meaningful message or conversation",xp:18,coin:9,energy:6,stats:{Communication:16},skill:"Communication",difficulty:"SAFE",duration:10},
      {id:"career_read",icon:"🧭",title:"CAREER SCOUT",desc:"Research one role, organization, scholarship, or opportunity",xp:20,coin:9,energy:8,stats:{Career:16,Knowledge:4},skill:"Career",difficulty:"SAFE",duration:15}
    ],
    micro: [
      {id:"water_now",icon:"💧",title:"WATER CHECK",desc:"Drink one full glass of water",xp:5,coin:2,energy:0,stats:{Lifestyle:5},skill:"Lifestyle",difficulty:"SAFE",duration:2},
      {id:"stretch5",icon:"🧘",title:"FIVE-MINUTE RESET",desc:"Stretch for 5 minutes",xp:7,coin:3,energy:2,stats:{Body:3,Lifestyle:5},skill:"Lifestyle",difficulty:"SAFE",duration:5},
      {id:"desk5",icon:"🗂️",title:"CLEAR THE FIELD",desc:"Reset your desk for 5 minutes",xp:6,coin:2,energy:1,stats:{Discipline:5,Lifestyle:3},skill:"Discipline",difficulty:"SAFE",duration:5},
      {id:"vocab5eng",icon:"🔤",title:"FIVE ENGLISH WORDS",desc:"Learn or review 5 English words",xp:6,coin:3,energy:1,stats:{English:6},skill:"English",difficulty:"SAFE",duration:5},
      {id:"vocab5chi",icon:"汉",title:"FIVE CHINESE WORDS",desc:"Learn or review 5 Chinese words",xp:6,coin:3,energy:1,stats:{Chinese:6},skill:"Chinese",difficulty:"SAFE",duration:5},
      {id:"read5",icon:"📚",title:"FIVE-MINUTE READ",desc:"Read for 5 uninterrupted minutes",xp:6,coin:2,energy:1,stats:{Reading:6},skill:"Reading",difficulty:"SAFE",duration:5},
      {id:"breath3",icon:"🌿",title:"THREE QUIET MINUTES",desc:"Breathe, reset, and do nothing else for 3 minutes",xp:5,coin:2,energy:0,stats:{Lifestyle:4,Discipline:2},skill:"Lifestyle",difficulty:"SAFE",duration:3},
      {id:"quick_note",icon:"✍️",title:"ONE-LINE CHECK-IN",desc:"Write one win and one next move",xp:6,coin:2,energy:1,stats:{Discipline:4,Communication:2},skill:"Discipline",difficulty:"SAFE",duration:3}
    ]
  };

  function enrich(q,type){
    const primary=q.skill || Object.keys(q.stats||{})[0] || "Lifestyle";
    return {...clone(q), type, skill:primary, difficulty:q.difficulty||"STANDARD", duration:q.duration||estimateDuration(q)};
  }
  function estimateDuration(q){
    if(q.energy<=2)return 5;
    if(q.energy<=8)return 15;
    if(q.energy<=18)return 25;
    return 40;
  }
  function fullPool(type){
    const legacy=(QUESTS[type]||[]).map(q=>enrich(q,type));
    const extra=(EXTRA[type]||[]).map(q=>enrich(q,type));
    const seen=new Set();
    return [...legacy,...extra].filter(q=>{const k=type+":"+q.id;if(seen.has(k))return false;seen.add(k);return true});
  }
  function recentIds(s,days=2){
    const min=calcDay(localISO())-days;
    const out=new Set();
    (s?.questHistory||[]).forEach(h=>{if((h.day||0)>=min)out.add(h.questId)});
    return out;
  }
  function recentSkillCounts(s,days=4){
    const min=calcDay(localISO())-days, counts={};
    (s?.questHistory||[]).forEach(h=>{if((h.day||0)>=min && h.skill)counts[h.skill]=(counts[h.skill]||0)+1});
    return counts;
  }
  function scoreQuest(q,s,day,salt){
    const recent=recentIds(s,2), counts=recentSkillCounts(s,4);
    let score=100;
    score-= (counts[q.skill]||0)*6;          // gentle balance bonus for neglected skills
    if(recent.has(q.id))score-=28;           // cooldown penalty, never a lock
    if(["Body","English","Chinese","Academic","Lifestyle"].includes(q.skill))score+=10;
    const rng=seeded(day,salt+hash(q.id));
    score+=rng()*24;                          // controlled deterministic variety
    return score;
  }
  function hash(str){let h=0;for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))>>>0;return h%997;}
  function choose(pool,count,s,day,salt,used=new Set()){
    return pool
      .filter(q=>!used.has(q.id))
      .map(q=>({q,score:scoreQuest(q,s,day,salt)}))
      .sort((a,b)=>b.score-a.score)
      .slice(0,count)
      .map(x=>x.q);
  }
  function routeClone(q,day,type,role){
    return {...clone(q),key:`${type}_${q.id}_${day}`,type,role,engineV:"3.2"};
  }
  function generateDailyRoute(day,s){
    const used=new Set();
    const mains=choose(fullPool("main"),2,s,day,11,used); mains.forEach(q=>used.add(q.id));
    const sides=choose(fullPool("side"),3,s,day,29,used); sides.forEach(q=>used.add(q.id));
    const micros=choose(fullPool("micro"),2,s,day,47,used);
    return [
      ...mains.map(q=>routeClone(q,day,"main","PRIORITY")),
      ...sides.slice(0,2).map(q=>routeClone(q,day,"side","BALANCE")),
      ...sides.slice(2).map(q=>routeClone(q,day,"side","SURPRISE")),
      ...micros.map(q=>routeClone(q,day,"micro","MAINTENANCE"))
    ];
  }
  function board(s){
    const routeIds=new Set((s.todayQuests||[]).map(q=>q.id));
    const all=[...fullPool("main"),...fullPool("side"),...fullPool("micro")];
    return all
      .filter(q=>!routeIds.has(q.id))
      .map(q=>({...q,boardScore:scoreQuest(q,s,s.day||1,71)}))
      .sort((a,b)=>b.boardScore-a.boardScore)
      .slice(0,10);
  }
  function findById(id){
    return [...fullPool("main"),...fullPool("side"),...fullPool("micro")].find(q=>q.id===id) || null;
  }
  function bonusFactor(s){
    const count=(s.questHistory||[]).filter(h=>h.date===localISO() && h.kind==="bonus" && h.status==="completed").length;
    if(count<3)return 1;
    if(count<6)return .75;
    return .5;
  }
  function surprise(s){
    const list=board(s);
    if(!list.length)return null;
    return list[Math.floor(Math.random()*list.length)];
  }
  return {generateDailyRoute,board,findById,bonusFactor,surprise};
})();
window.QuestEngine=QuestEngine;
