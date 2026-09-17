// V3.1 WISHLIST MODULE
// This is the only new game feature in V3.1.
// It uses state.wishlist, which already existed in the stable V3 save schema.

function escapeHTML(value){
 return String(value ?? "")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;");
}

function uid(){
 if(window.crypto?.randomUUID)return crypto.randomUUID();
 return "wish_"+Date.now()+"_"+Math.random().toString(36).slice(2,9);
}

function normalizeWishlist(){
 if(!Array.isArray(state.wishlist))state.wishlist=[];
 state.wishlist=state.wishlist.map(w=>({
  id:w?.id || uid(),
  name:String(w?.name || "Untitled reward"),
  cost:Math.max(1,Number(w?.cost || w?.price || 1)),
  category:String(w?.category || "Other"),
  rarity:String(w?.rarity || "Common"),
  unlock:String(w?.unlock || w?.condition || ""),
  image:typeof w?.image==="string" ? w.image : "",
  status:w?.status==="claimed" ? "claimed" : "active",
  createdAt:w?.createdAt || new Date().toISOString(),
  claimedAt:w?.claimedAt || null
 }));
}

function renderWishlist(){
 const grid=document.getElementById("wishlistGrid");
 const count=document.getElementById("wishlistCount");
 if(!grid || !count)return;
 normalizeWishlist();
 count.textContent=state.wishlist.length+" ITEM"+(state.wishlist.length===1?"":"S");
 if(!state.wishlist.length){
  grid.innerHTML='<div class="empty">No wishlist items yet. Add the first real-life reward above.</div>';
  return;
 }
 grid.innerHTML=state.wishlist.map(w=>{
  const affordable=state.coins>=w.cost;
  const pct=Math.max(0,Math.min(100,Math.round((state.coins/w.cost)*100)));
  const image=w.image
   ? `<img class="wish-img" src="${w.image}" alt="${escapeHTML(w.name)}">`
   : '<div class="wish-placeholder">🎁</div>';
  const claimed=w.status==="claimed";
  return `<article class="wish-card ${claimed?'claimed':''}">
   ${image}
   <div>
    <div class="wish-name">${escapeHTML(w.name)}</div>
    <div class="wish-meta">${escapeHTML(w.category)} · ${escapeHTML(w.rarity)} · 🪙 ${w.cost}</div>
    ${w.unlock?`<div class="wish-meta">Unlock: ${escapeHTML(w.unlock)}</div>`:""}
    ${claimed?'<div class="rewards">CLAIMED ✓</div>':`<div class="wish-progress"><i style="width:${pct}%"></i></div><div class="wish-meta">${affordable?'Affordable now':`${pct}% funded · ${Math.max(0,w.cost-state.coins)} coins to go`}</div>`}
    <div class="wish-actions">
     ${claimed?'':`<button class="btn gold" type="button" onclick="claimWishlistItem('${w.id}')" ${affordable?'':'disabled'}>CLAIM</button>`}
     <button class="btn" type="button" onclick="removeWishlistItem('${w.id}')">REMOVE</button>
    </div>
   </div>
  </article>`;
 }).join("");
}

async function handleWishlistSubmit(event){
 event.preventDefault();
 const name=document.getElementById("wishName").value.trim();
 const cost=Math.floor(Number(document.getElementById("wishCost").value));
 const category=document.getElementById("wishCategory").value;
 const rarity=document.getElementById("wishRarity").value;
 const unlock=document.getElementById("wishUnlock").value.trim();
 const file=document.getElementById("wishImage").files?.[0] || null;
 if(!name){toast("Give the reward a name.");return}
 if(!Number.isFinite(cost) || cost<1){toast("Coin cost must be at least 1.");return}
 let image="";
 if(file){
  try{image=await compressWishlistImage(file)}
  catch(err){console.warn(err);toast("Image could not be processed. Item was not added.");return}
 }
 state.wishlist.unshift({id:uid(),name,cost,category,rarity,unlock,image,status:"active",createdAt:new Date().toISOString(),claimedAt:null});
 log("WISHLIST ADDED · "+name+" · "+cost+" 🪙");
 clearWishlistForm();
 saveAndRender();
 toast("Added to Wishlist 🎁");
}

function claimWishlistItem(id){
 normalizeWishlist();
 const item=state.wishlist.find(w=>w.id===id);
 if(!item || item.status==="claimed")return;
 if(state.coins<item.cost){toast("Not enough Coins.");return}
 state.coins-=item.cost;
 item.status="claimed";
 item.claimedAt=new Date().toISOString();
 log("WISHLIST CLAIMED · "+item.name+" · -"+item.cost+" 🪙");
 saveAndRender();
 toast("Wishlist reward claimed 🎁");
}

function removeWishlistItem(id){
 normalizeWishlist();
 const item=state.wishlist.find(w=>w.id===id);
 if(!item)return;
 if(!confirm('Remove "'+item.name+'" from Wishlist?'))return;
 state.wishlist=state.wishlist.filter(w=>w.id!==id);
 log("WISHLIST REMOVED · "+item.name);
 saveAndRender();
 toast("Wishlist item removed.");
}

function clearWishlistForm(){
 const form=document.getElementById("wishlistForm");
 if(form)form.reset();
 const preview=document.getElementById("wishPreview");
 if(preview){preview.removeAttribute("src");preview.style.display="none"}
}

function previewWishlistImage(){
 const file=document.getElementById("wishImage")?.files?.[0];
 const preview=document.getElementById("wishPreview");
 if(!preview)return;
 if(!file){preview.removeAttribute("src");preview.style.display="none";return}
 if(!file.type.startsWith("image/")){toast("Please choose an image file.");document.getElementById("wishImage").value="";return}
 const reader=new FileReader();
 reader.onload=()=>{preview.src=reader.result;preview.style.display="block"};
 reader.readAsDataURL(file);
}

function compressWishlistImage(file){
 return new Promise((resolve,reject)=>{
  if(!file.type.startsWith("image/")){reject(new Error("Not an image"));return}
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error("File read failed"));
  reader.onload=()=>{
   const img=new Image();
   img.onerror=()=>reject(new Error("Image decode failed"));
   img.onload=()=>{
    const max=480;
    const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
    const width=Math.max(1,Math.round(img.naturalWidth*scale));
    const height=Math.max(1,Math.round(img.naturalHeight*scale));
    const canvas=document.createElement("canvas");
    canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext("2d");
    ctx.drawImage(img,0,0,width,height);
    resolve(canvas.toDataURL("image/jpeg",0.72));
   };
   img.src=reader.result;
  };
  reader.readAsDataURL(file);
 });
}
