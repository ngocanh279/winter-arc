// V3.1 CLOUD MODULE
// Stable V3 Supabase authentication and sync logic, unchanged.

function updateAuthUI(){
 const st=document.getElementById("cloudStatus"),n=document.getElementById("authNotice"),f=document.getElementById("authForm"),u=document.getElementById("userPanel");
 if(!cloudReady){st.textContent="LOCAL MODE";n.innerHTML="Cloud chưa được cấu hình. Thêm Supabase vào <b>config.js</b>.";f.style.display="block";u.style.display="none";return}
 if(cloudUser){st.textContent="CLOUD CONNECTED";n.className="notice cloud-ok";n.textContent="Tiến trình đang được lưu trên cloud.";f.style.display="none";u.style.display="block";document.getElementById("userEmail").textContent=cloudUser.email||"Signed in";}
 else{st.textContent="READY";n.className="notice";n.textContent="Đăng nhập để đồng bộ tiến trình giữa laptop và điện thoại.";f.style.display="block";u.style.display="none";}
}
async function signUp(){
 if(!cloudReady){toast("Cloud chưa được cấu hình");return}
 const email=document.getElementById("email").value.trim(),password=document.getElementById("password").value;
 if(!email||password.length<6){toast("Nhập email và mật khẩu ≥ 6 ký tự");return}
 const {data,error}=await cloud.auth.signUp({email,password});
 if(error){toast(error.message);return}
 if(data.session){
  cloudUser=data.user;ensureDay();await syncNow(true);updateAuthUI();toast("☁ Account created · Cloud connected");
 }else toast("Tài khoản đã tạo. Nếu yêu cầu xác nhận email, hãy kiểm tra inbox.");
}
async function signIn(){
 if(!cloudReady){toast("Cloud chưa được cấu hình");return}
 const email=document.getElementById("email").value.trim(),password=document.getElementById("password").value;
 if(!email||!password){toast("Nhập email và mật khẩu");return}
 const {data,error}=await cloud.auth.signInWithPassword({email,password});
 if(error){toast(error.message);return}
 cloudUser=data.user;await pullCloud();updateAuthUI();toast("☁ Cloud save connected");
}
async function pullCloud(){
 if(!cloudUser)return;
 const {data,error}=await cloud.from("game_saves").select("save").eq("user_id",cloudUser.id).maybeSingle();
 if(error){console.warn(error);toast("Cloud read lỗi: "+error.message);return}
 if(data?.save){
  state=migrate(data.save);
  const changed=ensureDay(state);
  if(changed)await syncNow(true);
  persist();render();
 }else{
  ensureDay(state);await syncNow(true);render();
 }
}
async function syncNow(silent=false){
 if(!cloudUser)return;
 const {error}=await cloud.from("game_saves").upsert({user_id:cloudUser.id,save:state,updated_at:new Date().toISOString()},{onConflict:"user_id"});
 if(error){if(!silent)toast("Sync lỗi: "+error.message);console.warn(error)}
 else if(!silent)toast("☁ Đã lưu cloud");
}
async function signOutUser(){if(cloud)await cloud.auth.signOut();cloudUser=null;updateAuthUI();render();toast("Đã đăng xuất · Local cache vẫn còn")}
