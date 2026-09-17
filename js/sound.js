// V3.2.1 SOUND EFFECTS MODULE
// Self-contained Web Audio UI feedback. No music, no external audio files, no copyrighted assets.
(function(){
  'use strict';

  const PREF_KEY = 'WINTER_ARC_SOUND_ENABLED';
  let ctx = null;
  let enabled = localStorage.getItem(PREF_KEY) !== 'false';

  function getContext(){
    if(!ctx){
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if(!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if(ctx.state === 'suspended') ctx.resume().catch(()=>{});
    return ctx;
  }

  function tone(freq, duration, gain, type='sine', delay=0){
    if(!enabled) return;
    const ac = getContext();
    if(!ac) return;
    const now = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002,gain), now + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function play(kind='click'){
    if(!enabled) return;
    try{
      if(kind === 'success'){
        tone(620, .10, .035, 'sine', 0);
        tone(880, .13, .03, 'sine', .07);
      } else if(kind === 'reward'){
        tone(520, .09, .03, 'triangle', 0);
        tone(660, .10, .028, 'triangle', .055);
        tone(990, .15, .025, 'triangle', .11);
      } else if(kind === 'soft'){
        tone(360, .07, .018, 'sine', 0);
      } else {
        tone(470, .055, .022, 'sine', 0);
      }
    } catch(_e) {
      // Sound must never be able to break the game.
    }
  }

  function classify(el){
    const text = (el.textContent || '').trim().toUpperCase();
    const action = (el.getAttribute('onclick') || '').toUpperCase();
    if(/COMPLETE|CLEAR BOSS|CLAIM REWARD/.test(text) || /COMPLETEQUEST|COMPLETEBONUSQUEST|CLEARBOSS/.test(action)) return 'success';
    if(/CLAIM|REWARD|BUY/.test(text) || /BUY\(/.test(action)) return 'reward';
    if(el.classList && el.classList.contains('tab')) return 'soft';
    return 'click';
  }

  // Event delegation means newly-rendered buttons automatically receive sound.
  document.addEventListener('pointerdown', function(e){
    const el = e.target.closest('button, .tab');
    if(!el || el.id === 'winterArcSoundToggle') return;
    play(classify(el));
  }, {passive:true});

  function updateToggle(){
    const btn = document.getElementById('winterArcSoundToggle');
    if(!btn) return;
    btn.textContent = enabled ? '🔊 SOUND ON' : '🔇 SOUND OFF';
    btn.setAttribute('aria-pressed', String(enabled));
    btn.title = enabled ? 'Turn sound effects off' : 'Turn sound effects on';
  }

  function toggleSound(){
    enabled = !enabled;
    localStorage.setItem(PREF_KEY, String(enabled));
    updateToggle();
    if(enabled) play('success');
  }

  function installToggle(){
    if(document.getElementById('winterArcSoundToggle')) return;
    const btn = document.createElement('button');
    btn.id = 'winterArcSoundToggle';
    btn.type = 'button';
    btn.setAttribute('aria-label','Toggle sound effects');
    btn.style.cssText = [
      'position:fixed','right:14px','bottom:14px','z-index:9998',
      'border:1px solid rgba(20,45,36,.18)','background:rgba(250,248,241,.94)',
      'color:#18362c','border-radius:999px','padding:8px 11px',
      'font:700 9px/1.1 system-ui,-apple-system,Segoe UI,sans-serif',
      'letter-spacing:.08em','box-shadow:0 5px 18px rgba(0,0,0,.08)',
      'cursor:pointer','backdrop-filter:blur(8px)'
    ].join(';');
    btn.addEventListener('click', toggleSound);
    document.body.appendChild(btn);
    updateToggle();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installToggle);
  else installToggle();

  // Expose only a tiny public API for future modules; current game logic is untouched.
  window.WinterArcSound = { play, isEnabled:()=>enabled, toggle:toggleSound };
})();
