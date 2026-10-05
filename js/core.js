'use strict';
// ===== базовые утилиты, экран, ввод, звук =====
const VW=1280, VH=720;
// Сцена рисуется в offscreen-канвас (ctx) и проходит через WebGL2-постобработку (post.js).
// Интерфейс рисуется поверх в отдельный чёткий канвас (U).
const screenCv=document.getElementById('game'); const uiCv=document.getElementById('ui');
const scv=document.createElement('canvas'); const ctx=scv.getContext('2d',{alpha:true,desynchronized:true});
const U=uiCv.getContext('2d');
let SCALE=1, DPR=1, RS=1;
// Качество: максимальный масштаб внутреннего рендера (логическое 1280x720 × RS). DYN — авто-понижение при низком FPS.
const QUAL={ultra:1.5,high:1.25,low:0.85,min:0.5}; let DYN=1;
// предел размера итогового (GPU) канваса: на слабых видеокартах финальные проходы считаются в меньшем разрешении
const OUTCAP={ultra:2560,high:2560,low:1600,min:1280};
const PARTCAP={ultra:1400,high:1400,low:700,min:360};
function qualRS(){ try{ return QUAL[SETTINGS.fx]||1.25; }catch(e){ return 1.25; } }
function resize(){ DPR=Math.min(window.devicePixelRatio||1,2); const w=innerWidth,h=innerHeight; SCALE=Math.min(w/VW,h/VH);
  let pw=Math.round(VW*SCALE*DPR), ph=Math.round(VH*SCALE*DPR); if(pw>2560){ ph=Math.round(ph*2560/pw); pw=2560; }
  RS=Math.max(0.5,Math.min(Math.max(pw/VW,0.75),qualRS())*DYN); scv.width=Math.round(VW*RS); scv.height=Math.round(VH*RS);
  let cap=2560; try{ cap=OUTCAP[SETTINGS.fx]||2560; }catch(e){} let ow=pw, oh=ph; if(ow>cap){ oh=Math.round(oh*cap/ow); ow=cap; }
  for(const c of [screenCv,uiCv]){ const g=c===screenCv; c.width=g?ow:pw; c.height=g?oh:ph; c.style.width=Math.round(VW*SCALE)+'px'; c.style.height=Math.round(VH*SCALE)+'px'; }
  UIK=ph/VH;
  if(typeof POST!=='undefined'&&POST.ok)POST.resize(); }
let UIK=1;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, rnd=(a,b)=>a+Math.random()*(b-a);
addEventListener('resize',()=>resize()); resize();
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function mixHex(a,b,t){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);
  const r=lerp(pa>>16,pb>>16,t)|0,g=lerp((pa>>8)&255,(pb>>8)&255,t)|0,bl=lerp(pa&255,pb&255,t)|0; return `rgb(${r},${g},${bl})`;}
function rgba(hex,a){const p=parseInt(hex.slice(1),16);return `rgba(${p>>16},${(p>>8)&255},${p&255},${a})`;}
function seeded(s){return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;}}
const FONT_T="'Tektur', 'Exo 2', Arial, sans-serif", FONT_U="'Exo 2', Arial, sans-serif";

// ----- настройки и сохранение
const SETTINGS=Object.assign({music:7,voice:9,sfx:8,subs:true,shake:true,assist:false,autoQ:true},JSON.parse(localStorage.getItem('lz_settings')||'{}'));
function saveSettings(){localStorage.setItem('lz_settings',JSON.stringify(SETTINGS));AUD.applyVolumes();}
function getSave(){try{return JSON.parse(localStorage.getItem('lz_save')||'null')}catch(e){return null}}
function setSave(o){localStorage.setItem('lz_save',JSON.stringify(o))}

// ----- изображения
const IMG={}; const IMG_LIST=['cover','city','planet','crash','fault','bg_hot','bg_cold','ending','hero','sky1','sky2','sky3','tex1','tex2','tex3','tex4','p_irma','p_avram','p_sola','sola_full','recv'];
function loadImages(){return Promise.all(IMG_LIST.map(n=>new Promise(r=>{const i=new Image();i.onload=()=>{IMG[n]=i;r()};i.onerror=()=>r();i.src=(window.ASSETS_IMG&&ASSETS_IMG[n])||('img/'+n+'.jpg');}))).then(()=>{ if(IMG.bg_hot&&!IMG.sky4)IMG.sky4=IMG.bg_hot; });}
function drawCover(img,x,y,w,h,zoom=1,px=0.5,py=0.5,c=ctx){ if(!img)return; const s=Math.max(w/img.width,h/img.height)*zoom;
  const dw=img.width*s,dh=img.height*s; c.drawImage(img,x+(w-dw)*px,y+(h-dh)*py,dw,dh);}

// ----- спрайты свечения
function makeGlow(col,size=128,hard=0){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');
  const gr=g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);gr.addColorStop(0,col);gr.addColorStop(hard||0.25,rgba(col.length>7?'#ffffff':col,0.45));gr.addColorStop(1,rgba(col.length>7?'#ffffff':col,0));
  g.fillStyle=gr;g.fillRect(0,0,size,size);return c;}
const GLOW={warm:makeGlow('#ffb35a'),hot:makeGlow('#ff7a2a'),white:makeGlow('#fff4dc'),cold:makeGlow('#8fd0ff'),teal:makeGlow('#6fe0d0'),red:makeGlow('#ff3b1f')};
function softSprite(col){const s=64,c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d');const gr=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  gr.addColorStop(0,rgba(col,1));gr.addColorStop(.5,rgba(col,.35));gr.addColorStop(1,rgba(col,0));g.fillStyle=gr;g.fillRect(0,0,s,s);return c;}
const SOFT={smoke:softSprite('#2a2420'),steam:softSprite('#e8e6e0'),snow:softSprite('#eaf6ff'),dust:softSprite('#9a8470'),ash:softSprite('#1a1512'),frost:softSprite('#cfeaff')};
function glow(spr,x,y,r,a=1){ctx.globalAlpha=a;ctx.drawImage(spr,x-r,y-r,r*2,r*2);ctx.globalAlpha=1;}
// зерно плёнки
const GRAIN=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const d=g.createImageData(256,256);
  for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}g.putImageData(d,0,0);return c;})();


// ----- ввод
const KEYS={}, PREV={}, TAP={}; let anyKey=false; const MOUSE={x:0,y:0,down:false,click:false,moved:false};
const BIND={left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],jump:['Space','KeyW','ArrowUp'],
  grapple:['KeyE','KeyJ'],dash:['ShiftLeft','ShiftRight','KeyK'],warm:['KeyQ','KeyL'],pause:['Escape','KeyP'],confirm:['Enter','Space','NumpadEnter'],back:['Escape','Backspace']};
addEventListener('keydown',e=>{ if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();
  if(e.code==='F11'){e.preventDefault();toggleFullscreen();return;} if(!e.repeat)TAP[e.code]=true; KEYS[e.code]=true; anyKey=true; INPUT.lastDevice='kb';});
addEventListener('keyup',e=>{KEYS[e.code]=false;});
addEventListener('blur',()=>{for(const k in KEYS)KEYS[k]=false;});
function toVirt(e){const r=uiCv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*VW,(e.clientY-r.top)/r.height*VH];}
addEventListener('mousemove',e=>{[MOUSE.x,MOUSE.y]=toVirt(e);MOUSE.moved=true;});
addEventListener('mousedown',e=>{[MOUSE.x,MOUSE.y]=toVirt(e);MOUSE.down=true;MOUSE.click=true;anyKey=true;});
addEventListener('mouseup',()=>{MOUSE.down=false;});
addEventListener('contextmenu',e=>e.preventDefault());
function toggleFullscreen(){ if(document.fullscreenElement)document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(()=>{}); }
const INPUT={cur:{},prev:{},ax:0,lastDevice:'kb',pad:null,
  poll(){ this.prev=this.cur; const c={}; const tp={}; for(const a in BIND){ tp[a]=BIND[a].some(k=>TAP[k]); c[a]=tp[a]||BIND[a].some(k=>KEYS[k]); } for(const k in TAP)delete TAP[k]; this.tap=tp;
    let ax=(c.right?1:0)-(c.left?1:0);
    const pads=navigator.getGamepads?navigator.getGamepads():[]; let gp=null; for(const p of pads)if(p&&p.connected){gp=p;break;}
    this.pad=gp;
    if(gp){const b=i=>gp.buttons[i]&&gp.buttons[i].pressed; const sx=gp.axes[0]||0, sy=gp.axes[1]||0;
      const used=b(0)||b(1)||b(2)||b(3)||b(4)||b(5)||b(7)||b(9)||Math.abs(sx)>.4||Math.abs(sy)>.4||b(12)||b(13)||b(14)||b(15);
      if(used){this.lastDevice='pad';anyKey=true;}
      if(Math.abs(sx)>.25)ax=sx; if(b(14))ax=-1; if(b(15))ax=1;
      c.jump=c.jump||b(0); c.confirm=c.confirm||b(0); c.back=c.back||b(1); c.grapple=c.grapple||b(2); c.dash=c.dash||b(5)||b(7)||b(1);
      c.warm=c.warm||b(4)||b(6)||b(3); c.pause=c.pause||b(9); c.up=c.up||b(12)||sy<-.5; c.down=c.down||b(13)||sy>.5; c.left=c.left||b(14)||sx<-.5; c.right=c.right||b(15)||sx>.5; }
    this.cur=c; this.ax=clamp(ax,-1,1); },
  held(a){return !!this.cur[a]}, hit(a){return (!!this.cur[a]&&!this.prev[a])||!!(this.tap&&this.tap[a])}, rel(a){return !this.cur[a]&&!!this.prev[a]} };

// ----- звук (WebAudio, ассеты встроены в assets.js)
const AUD={ctx:null,buf:{},master:null,mus:null,vox:null,sfx:null,amb:{},music:null,musicName:'',duck:1,
  async init(){ if(this.ctx)return; const AC=window.AudioContext||window.webkitAudioContext; this.ctx=new AC();
    const c=this.ctx; this.master=c.createGain(); this.master.connect(c.destination);
    const comp=c.createDynamicsCompressor(); comp.threshold.value=-10; comp.ratio.value=4; comp.connect(this.master);
    this.mus=c.createGain(); this.vox=c.createGain(); this.sfx=c.createGain(); this.mus.connect(comp); this.sfx.connect(comp); const vc=c.createDynamicsCompressor(); vc.threshold.value=-18; vc.ratio.value=3; vc.attack.value=0.004; vc.release.value=0.15; this.vox.connect(vc); vc.connect(this.master);
    this.applyVolumes();
    const jobs=Object.entries(window.ASSETS_AUDIO||{}).map(async([k,b64])=>{ try{const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
      this.buf[k]=await c.decodeAudioData(u.buffer);}catch(e){console.warn('audio',k,e)} });
    await Promise.all(jobs); },
  applyVolumes(){ if(!this.ctx)return; const v=x=>Math.pow(x/10,1.6); this.mus.gain.value=v(SETTINGS.music)*0.55*this.duck; this.vox.gain.value=v(SETTINGS.voice)*1.6; this.sfx.gain.value=v(SETTINGS.sfx)*0.8*(this.sduck||1); },
  setDuck(d){ this.duck=d<1?Math.min(d,0.28):d; this.sduck=d<1?0.55:1; if(!this.ctx)return; const t=this.ctx.currentTime; this.mus.gain.setTargetAtTime(Math.pow(SETTINGS.music/10,1.6)*0.55*this.duck,t,0.2); this.sfx.gain.setTargetAtTime(Math.pow(SETTINGS.sfx/10,1.6)*0.8*this.sduck,t,0.2); },
  play(name,{vol=1,rate=1,pan=0,bus='sfx'}={}){ const b=this.buf[name]; if(!b||!this.ctx)return null; const c=this.ctx; const s=c.createBufferSource(); s.buffer=b; s.playbackRate.value=rate;
    const g=c.createGain(); g.gain.value=vol; let node=g; if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);node=p;} node.connect(this[bus]); s.connect(g); s.start(); return s; },
  playMusic(name,fade=2,loop=true){ if(!this.ctx||this.musicName===name)return; const c=this.ctx, now=c.currentTime;
    if(this.music){const m=this.music; m.g.gain.cancelScheduledValues(now); m.g.gain.setValueAtTime(m.g.gain.value,now); m.g.gain.linearRampToValueAtTime(0,now+fade); m.s.stop(now+fade+0.1);}
    this.musicName=name; const b=this.buf[name]; if(!b){this.music=null;return;}
    const s=c.createBufferSource(); s.buffer=b; s.loop=loop; const g=c.createGain(); g.gain.value=0; g.gain.linearRampToValueAtTime(1,now+fade); s.connect(g); g.connect(this.mus); s.start(); this.music={s,g}; },
  stopMusic(fade=1.5){ if(!this.music||!this.ctx)return; const now=this.ctx.currentTime,m=this.music; m.g.gain.setValueAtTime(m.g.gain.value,now); m.g.gain.linearRampToValueAtTime(0,now+fade); m.s.stop(now+fade+.1); this.music=null; this.musicName=''; },
  ambient(name,target){ if(!this.ctx||!this.buf[name])return; let a=this.amb[name]; const c=this.ctx;
    if(!a){ if(target<=0.001)return; const s=c.createBufferSource(); s.buffer=this.buf[name]; s.loop=true; const g=c.createGain(); g.gain.value=0; s.connect(g); g.connect(this.sfx); s.start(); a=this.amb[name]={s,g,v:0}; }
    if(Math.abs(a.v-target)>0.01){a.v=target; a.g.gain.setTargetAtTime(target,c.currentTime,0.4);} },
  stopAmbient(){ for(const k in this.amb)this.ambient(k,0); },
  voice(id){ const b=this.buf['v_'+id]; if(!b||!this.ctx){ const L=(window.ASSETS_LINES||{})[id]; return {dur:L?Math.max(2.5,L.t.length*0.065):2.5,src:null}; } const s=this.play('v_'+id,{bus:'vox'}); return {dur:b.duration,src:s}; } };

// ----- субтитры/реплики
const VOICE={queue:[],cur:null,t:0,
  say(ids){ for(const id of ids) this.queue.push(id); },
  clear(){ if(this.cur&&this.cur.src)try{this.cur.src.stop()}catch(e){} this.queue=[]; this.cur=null; AUD.setDuck(1); },
  update(dt){ if(this.cur){ this.t+=dt; if(this.t>this.cur.dur+0.35){ this.cur=null; if(!this.queue.length)AUD.setDuck(1);} }
    if(!this.cur&&this.queue.length){ const id=this.queue.shift(); const v=AUD.voice(id); const L=(window.ASSETS_LINES||{})[id]||{s:'',t:''};
      this.cur={id,dur:v.dur,src:v.src,speaker:L.s,text:L.t}; this.t=0; AUD.setDuck(0.38);} },
  busy(){return !!this.cur||this.queue.length>0} };
const SPEAKER={narr:'',irma:'ИРМА',avram:'АВРАМ · РАЦИЯ',sola:'СОЛА'};
function drawSubtitle(alphaMul=1,yBase=VH-70,portraits=false){ const c=VOICE.cur; if(!c||!SETTINGS.subs)return; const a=clamp(Math.min(VOICE.t/0.25,(c.dur+0.35-VOICE.t)/0.3),0,1)*alphaMul; if(a<=0)return;
  const g=U; g.save(); g.globalAlpha=a; const narr=!SPEAKER[c.speaker];
  const font=narr?`italic 500 21px ${FONT_U}`:`500 21px ${FONT_U}`; g.font=font; const lines=wrapText(c.text,740); const lh=29;
  let tw=0; for(const l of lines) tw=Math.max(tw,g.measureText(l).width); tw=Math.ceil(tw);
  const pimg=portraits&&(c.speaker==='irma'?IMG.p_irma:c.speaker==='avram'?IMG.p_avram:c.speaker==='sola'?IMG.p_sola:null); const ps=84, pad=18, gap=18;
  const th=lines.length*lh-8; const ih=Math.max(pimg?ps:0,th); const pw=Math.max(420,pad*2+(pimg?ps+gap:0)+tw), ph=ih+pad*2+(narr?0:6);
  const x=Math.round(VW/2-pw/2), y=Math.round(yBase+44-ph); const col=c.speaker==='irma'?UI.accent:c.speaker==='avram'?UI.cold:c.speaker==='sola'?'#f4e6a8':UI.brass;
  panel(g,x,y,pw,ph,{title:SPEAKER[c.speaker]||null,titleCol:col,c:12});
  let tx=x+pad; if(pimg){ const px=x+pad, py=y+Math.round((ph-ps)/2)+(narr?0:3); g.save(); chamferPath(g,px,py,ps,ps,8); g.clip(); g.drawImage(pimg,px,py,ps,ps);
      if(c.speaker==='avram'){ g.globalAlpha=a*(0.12+0.05*Math.sin(VOICE.t*40)); g.fillStyle='#9fd0ff'; for(let yy=0;yy<ps;yy+=3)g.fillRect(px,py+yy,ps,1);} g.restore();
    g.strokeStyle=col; g.lineWidth=1.6; chamferPath(g,px+.5,py+.5,ps-1,ps-1,8); g.stroke(); tx=px+ps+gap; }
  g.font=font; g.textBaseline='top'; const ty=y+Math.round((ph-th)/2)+(narr?0:3)-4; const cx=narr&&!pimg;
  g.textAlign=cx?'center':'left'; lines.forEach((l,i)=>textShadowed(g,l,cx?x+pw/2:tx,ty+i*lh,narr?'#f1dcc0':UI.ink)); g.restore(); }
