// V3.2 APP MODULE — stable V3.1 boot unchanged
// Stable V3 save controls + boot. Only addition: bind Wishlist form events.

function exportSave(){
 const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download="winter-arc-v3-day-"+state.day+".json";a.click();URL.revokeObjectURL(a.href);toast("Save exported.");
}
function importSave(e){
 const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{try{state=migrate(JSON.parse(r.result));ensureDay(state);saveAndRender();toast("Save imported.");}catch(err){toast("Invalid save file.")}};
 r.readAsText(f);
}
function resetToday(){if(confirm("Reset today's route only? XP, skills and coins stay safe.")){state.done={};state.energy=100;log("TODAY RESET BY PLAYER");saveAndRender();toast("Today's route reset.")}}
function resetAll(){if(confirm("Erase ALL V3 progress? Export a backup first.")){localStorage.removeItem(STORAGE_KEY);location.reload()}}
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2000)}
function showSystem(){openModal("SYSTEM INFO",`<p style="font-size:11px;color:var(--muted)">Today is <b>${state.lastDate}</b>, Winter Arc Day <b>${state.day}</b>. The V3 engine uses the real calendar date and generates a deterministic route for each day, so the same account sees the same daily route on laptop and phone.</p>`)}
function openModal(title,body){document.getElementById("modalTitle").textContent=title;document.getElementById("modalBody").innerHTML=body;document.getElementById("modal").classList.add("show")}
function closeModal(){document.getElementById("modal").classList.remove("show")}


function bindWishlistUI(){
 const form=document.getElementById("wishlistForm");
 const image=document.getElementById("wishImage");
 if(form)form.addEventListener("submit",handleWishlistSubmit);
 if(image)image.addEventListener("change",previewWishlistImage);
}


document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById(btn.dataset.page).classList.add("active");
}));

bindWishlistUI();

state=loadLocal();
ensureDay(state);
checkAchievements();
persist();
render();

if(cloudReady){
 cloud.auth.getSession().then(async ({data})=>{
  cloudUser=data.session?.user||null;updateAuthUI();
  if(cloudUser)await pullCloud();
 });
 cloud.auth.onAuthStateChange((_event,session)=>{
  cloudUser=session?.user||null;updateAuthUI();
 });
}
