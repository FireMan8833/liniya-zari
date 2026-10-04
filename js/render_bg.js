'use strict';
// ===== фон: небо (ИИ-арт), процедурные параллакс-слои с воздушной перспективой, облака, лучи =====
const BG={};
function mkCanvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
function prepLevelArt(L){ const key='lv'+L.id; if(BG[key])return BG[key];
  const R=seeded(L.id*977+13), r=(a,b)=>a+R()*(b-a); const out={};
  const farW=Math.ceil(L.length*0.1+VW+400), midW=Math.ceil(L.length*0.3+VW+400);
  const far=mkCanvas(farW,720), fg=far.getContext('2d'); const mid=mkCanvas(midW,720), mg=mid.getContext('2d');
  const vgrad=(g,y0,y1,c0,c1)=>{ const gr=g.createLinearGradient(0,y0,0,y1); gr.addColorStop(0,c0); gr.addColorStop(1,c1); return gr; };
  if(L.id===1){
    // дальние ползущие города
    for(let x=-50;x<farW;x+=r(160,320)){ const base=r(470,500), cw=r(80,200); fg.fillStyle=vgrad(fg,300,560,'rgba(122,58,34,.55)','rgba(150,70,40,.25)');
      for(let i=0;i<r(4,9);i++){ const bw=r(10,36), bh=r(20,110); const bx=x+r(0,cw); fg.fillRect(bx,base-bh,bw,bh+80); if(R()<0.4){ fg.fillRect(bx+bw*0.4,base-bh-r(20,50),r(3,6),r(20,50)); } }
      fg.fillRect(x-10,base-8,cw+20,90); for(let i=0;i<10;i++){ fg.fillStyle=`rgba(255,${180+R()*60|0},120,${r(.2,.6)})`; fg.fillRect(x+r(0,cw),base-r(5,60),1.6,1.6); } fg.fillStyle='rgba(122,58,34,.5)'; }
    // средний план: эстакады, краны, трубы
    for(let x=0;x<midW;x+=r(220,420)){ const base=560; mg.fillStyle='#4a2418';
      const k=R(); if(k<0.35){ const h=r(180,320); mg.fillRect(x,base-h,r(14,22),h+200); mg.fillRect(x-30,base-h,r(120,220),r(8,12)); mg.strokeStyle='#4a2418'; mg.lineWidth=2; mg.beginPath(); mg.moveTo(x+100,base-h+10); mg.lineTo(x+100,base-h+r(60,120)); mg.stroke(); }
      else if(k<0.7){ const h=r(120,260), w=r(26,44); mg.fillRect(x,base-h,w,h+200); mg.fillRect(x-4,base-h,w+8,8); }
      else { const h=r(60,120); for(let i=0;i<5;i++){ mg.fillRect(x+i*30,base-h,6,h+200); } mg.fillRect(x,base-h,150,10); mg.strokeStyle='#4a2418'; mg.lineWidth=3; for(let i=0;i<4;i++){mg.beginPath(); mg.moveTo(x+i*30,base-h+10); mg.lineTo(x+i*30+30,base); mg.stroke();} } }
    mg.fillStyle='#3a1a12'; mg.fillRect(0,600,midW,200);
    for(let x=0;x<midW;x+=r(30,90)){ mg.fillStyle=`rgba(255,${120+R()*80|0},40,${r(.3,.8)})`; mg.fillRect(x,600+r(0,6),r(20,80),r(1,3)); }
  } else if(L.id===2){
    for(let layer=0;layer<3;layer++){ const base=440+layer*50; fg.fillStyle=['rgba(70,50,100,.45)','rgba(55,38,80,.6)','rgba(40,28,60,.75)'][layer]; fg.beginPath(); fg.moveTo(0,720); let y=base;
      for(let x=0;x<=farW;x+=r(20,60)){ y=clamp(y+r(-30,30),base-80,base+40); fg.lineTo(x,y); } fg.lineTo(farW,720); fg.fill(); }
    for(let x=200;x<farW;x+=r(500,800)){ fg.strokeStyle='rgba(30,22,48,.7)'; fg.lineWidth=2; const h=r(120,200), w=40; fg.strokeRect(x,470-h,w,h+100); for(let yy=470-h;yy<570;yy+=20){ fg.beginPath(); fg.moveTo(x,yy); fg.lineTo(x+w,yy+20); fg.moveTo(x+w,yy); fg.lineTo(x,yy+20); fg.stroke(); }
      fg.fillStyle='rgba(255,190,120,.7)'; fg.fillRect(x+w/2-1,470-h-4,2,2); }
    // гигантские фермы моста
    for(let x=100;x<midW;x+=r(380,560)){ const w=r(50,80), top=r(250,380); mg.strokeStyle='#1c1428'; mg.fillStyle='#1c1428'; mg.lineWidth=5; mg.strokeRect(x,top,w,720); mg.lineWidth=2.5;
      for(let yy=top;yy<720;yy+=w){ mg.beginPath(); mg.moveTo(x,yy); mg.lineTo(x+w,yy+w); mg.moveTo(x+w,yy); mg.lineTo(x,yy+w); mg.stroke(); }
      mg.fillRect(x-20,top-8,w+40,12); if(R()<0.6){ mg.lineWidth=1.5; mg.beginPath(); mg.moveTo(x+w/2,top); mg.quadraticCurveTo(x+w/2+200,top+120,x+w/2+r(380,560),top+r(-20,40)); mg.stroke(); } }
  } else if(L.id===4){
    // дальний план: соляные дюны, силуэты зеркальных башен с бликами
    for(let layer=0;layer<3;layer++){ const base=450+layer*45; fg.fillStyle=['rgba(236,190,140,.45)','rgba(214,160,112,.6)','rgba(186,128,86,.75)'][layer]; fg.beginPath(); fg.moveTo(0,720); let y=base;
      for(let x=0;x<=farW;x+=r(40,90)){ y=clamp(y+r(-14,14),base-40,base+20); fg.lineTo(x,y); } fg.lineTo(farW,720); fg.fill(); }
    for(let x=150;x<farW;x+=r(260,520)){ const h=r(110,230), b=r(470,500); fg.fillStyle='rgba(120,74,46,.55)'; fg.fillRect(x-2,b-h,4,h+40); fg.fillRect(x-14,b-h,28,4); fg.save(); fg.translate(x,b-h-4); fg.rotate(r(-0.4,0.4)); fg.fillStyle='rgba(255,250,230,.75)'; fg.fillRect(-22,-3,44,4); fg.restore();
      fg.fillStyle='rgba(255,255,240,.5)'; fg.beginPath(); fg.arc(x+r(-10,10),b-h-6,r(2,4),0,7); fg.fill(); }
    // средний план: рельсовые арки прямого пути, дюны, остовы колонистских машин
    mg.fillStyle='#9a6a44'; mg.beginPath(); mg.moveTo(0,720); let yy=600; for(let x=0;x<=midW;x+=r(50,110)){ yy=clamp(yy+r(-18,18),560,630); mg.lineTo(x,yy); } mg.lineTo(midW,720); mg.fill();
    for(let x=0;x<midW;x+=r(300,520)){ const k=R(); mg.fillStyle='#7a5034';
      if(k<0.45){ const w=r(160,260), h=r(110,170); mg.beginPath(); mg.moveTo(x,620); mg.lineTo(x,620-h); mg.arc(x+w/2,620-h,w/2,Math.PI,0); mg.lineTo(x+w,620); mg.lineTo(x+w-18,620); mg.lineTo(x+w-18,620-h); mg.arc(x+w/2,620-h,w/2-18,0,Math.PI,true); mg.lineTo(x+18,620); mg.closePath(); mg.fill();
        mg.fillStyle='rgba(255,236,200,.35)'; mg.fillRect(x,620-h-w/2+1,w,2); }
      else if(k<0.75){ const h=r(160,300); mg.fillRect(x,620-h,8,h); mg.strokeStyle='#7a5034'; mg.lineWidth=2; mg.beginPath(); for(let y2=620;y2>620-h+20;y2-=34){ mg.moveTo(x-14,y2); mg.lineTo(x+22,y2-34); mg.moveTo(x+22,y2); mg.lineTo(x-14,y2-34);} mg.stroke(); mg.fillStyle='rgba(255,252,236,.85)'; mg.fillRect(x-24,620-h-6,56,4); }
      else { const w=r(120,200); mg.beginPath(); mg.moveTo(x,630); mg.lineTo(x+20,600); mg.lineTo(x+w*0.7,590); mg.lineTo(x+w,612); mg.lineTo(x+w,630); mg.fill(); for(let i=0;i<3;i++){ mg.beginPath(); mg.arc(x+30+i*45,630,14,0,7); mg.fill(); } } }
  } else {
    for(let layer=0;layer<2;layer++){ const base=470+layer*40; fg.fillStyle=layer?'rgba(20,44,66,.85)':'rgba(40,70,100,.55)'; fg.beginPath(); fg.moveTo(0,720);
      for(let x=0;x<=farW;x+=r(30,90)){ const spike=R()<0.15; fg.lineTo(x,base-(spike?r(60,140):r(0,30))); } fg.lineTo(farW,720); fg.fill(); }
    for(let x=300;x<farW;x+=r(400,700)){ fg.fillStyle='rgba(16,34,52,.85)'; const h=r(90,170), w=r(20,40); fg.fillRect(x,500-h,w,h+40); fg.fillRect(x-6,500-h,w+12,6); if(R()<0.5)fg.fillRect(x+w*0.3,500-h-20,w*0.4,20); }
    for(let x=0;x<midW;x+=r(260,460)){ const k=R(); mg.fillStyle='#0a1622';
      if(k<0.4){ const h=r(120,240), w=r(140,220); mg.beginPath(); mg.moveTo(x,600); mg.lineTo(x,600-h); mg.arc(x+w/2,600-h,w/2,Math.PI,0); mg.lineTo(x+w,600); mg.lineTo(x+w-24,600); mg.lineTo(x+w-24,600-h); mg.arc(x+w/2,600-h,w/2-24,0,Math.PI,true); mg.lineTo(x+24,600); mg.closePath(); mg.fill();
        mg.fillStyle='rgba(200,230,255,.25)'; mg.fillRect(x,600-h-w/2+2,w,3); }
      else if(k<0.75){ const h=r(160,300); mg.beginPath(); mg.moveTo(x,620); mg.lineTo(x+r(10,30),620-h); mg.lineTo(x+r(40,60),620); mg.fill(); mg.fillStyle='rgba(160,210,255,.18)'; mg.beginPath(); mg.moveTo(x+4,620); mg.lineTo(x+r(10,30),620-h); mg.lineTo(x+12,620); mg.fill(); }
      else { const h=r(80,160); mg.fillRect(x,600-h,r(40,70),h+100); mg.fillStyle='rgba(220,240,255,.3)'; mg.fillRect(x-3,600-h-4,76,5); } }
    mg.fillStyle='#08121c'; mg.fillRect(0,610,midW,200);
  }
  out.far=far; out.mid=mid; BG[key]=out; return out; }
// облака/дымка: мягкие полосы
const CLOUD=(()=>{ const c=mkCanvas(512,128), g=c.getContext('2d'); for(let i=0;i<40;i++){ const x=Math.random()*512, y=64+Math.random()*30-15, r=20+Math.random()*50; const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(255,255,255,.35)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(x-r,y-r,r*2,r*2); } return c; })();
const SUNPOS={1:[0.27,0.4],2:[0.11,0.49],3:[0.05,0.72],4:[0.5,0.44]};
function hex3(h){ const p=parseInt(h.slice(1),16); return [(p>>16)/255,((p>>8)&255)/255,(p&255)/255]; }
// GPU-путь: всё небо и дальние слои рисуются одним шейдером (post.js, программа bg)
function skyGL(L,cam){ const img=IMG[L.sky]; if(!img)return false; const t=W.time; const A=prepLevelArt(L); const pal=L.pal;
  const s=Math.max(VW/img.width,VH*1.12/img.height); const dw=img.width*s, dh=img.height*s; const u=clamp(cam.x/L.length,0,1);
  const ox=-(dw-VW)*u*0.9, oy=-(dh-VH)*0.5-clamp((cam.y-400)*0.04,-30,30); const sp=SUNPOS[L.id]; const sx=ox+sp[0]*dw, sy=oy+sp[1]*dh; L._sun=[sx,sy];
  const yShift=(p)=>-(cam.y-420)*p*0.6;
  Object.assign(BGP,{sky:img,skyR:[ox,oy,dw,dh],far:A.far,mid:A.mid,farR:[-cam.x*0.1-100,yShift(0.1),A.far.width,A.far.height],midR:[-cam.x*0.3-100,yShift(0.3)+20,A.mid.width,A.mid.height],
    sun:[sx,sy],lid:L.id,t,camx:cam.x,pul:0.85+0.15*Math.sin(t*1.3),fogC:L._fog3||(L._fog3=hex3(pal.fog)),fogA:pal.fogA,cloudA:L.id===1?0.22:L.id===2?0.18:L.id===4?0.1:0.12,
    g1c:L.id===1||L.id===4?[1,0.96,0.86]:[1,0.48,0.16],g1r:L.id===1?260:L.id===4?300:220,g1a:L.id===1?0.2:L.id===4?0.06:0.35,shC:L.id===1||L.id===4?[1,0.94,0.78]:[1,0.69,0.5],shA:0.9});
  FX.bg=1; return true; }
function drawSky(L,cam){ if(POST.ok&&skyGL(L,cam))return; const img=IMG[L.sky]; const t=W.time;
  if(img){ const s=Math.max(VW/img.width,VH*1.12/img.height); const dw=img.width*s, dh=img.height*s; const u=clamp(cam.x/L.length,0,1);
    const ox=-(dw-VW)*u*0.9, oy=-(dh-VH)*0.5-clamp((cam.y-400)*0.04,-30,30); ctx.drawImage(img,ox,oy,dw,dh);
    const sp=SUNPOS[L.id]; const sx=ox+sp[0]*dw, sy=oy+sp[1]*dh; L._sun=[sx,sy];
    if(L.id!==3){ ctx.save(); ctx.globalCompositeOperation='lighter'; const pul=0.85+0.15*Math.sin(t*1.3); glow(L.id===1?GLOW.white:GLOW.hot,sx,sy,(L.id===1?260:220)*pul,L.id===1?0.3:0.35); glow(GLOW.warm,sx,sy,600,0.1); ctx.restore(); }
    else { // полярное сияние — мерцание
      ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<3;i++){ const yy=120+i*60; ctx.globalAlpha=0.05+0.04*Math.sin(t*0.6+i*2); const g=ctx.createLinearGradient(0,yy-60,0,yy+60); g.addColorStop(0,'rgba(80,255,180,0)'); g.addColorStop(.5,i===1?'rgba(170,110,255,1)':'rgba(80,255,180,1)'); g.addColorStop(1,'rgba(80,255,180,0)'); ctx.fillStyle=g;
        ctx.beginPath(); ctx.moveTo(0,yy); for(let x=0;x<=VW;x+=40)ctx.lineTo(x,yy+Math.sin(x*0.006+t*0.35+i)*40); ctx.lineTo(VW,yy+80); for(let x=VW;x>=0;x-=40)ctx.lineTo(x,yy+70+Math.sin(x*0.005+t*0.3+i*1.7)*50); ctx.fill(); } ctx.restore(); ctx.globalAlpha=1; } }
  else { ctx.fillStyle='#333'; ctx.fillRect(0,0,VW,VH); }
  // звёзды мерцают (II, III)
  if(L.id===2||L.id===3){ if(!L._stars){ const R=seeded(7); L._stars=Array.from({length:90},()=>({x:R()*VW,y:R()*VH*0.45,p:R()*6,s:R()*1.4+0.4})); }
    ctx.save(); ctx.globalCompositeOperation='lighter'; for(const s of L._stars){ ctx.globalAlpha=(0.25+0.5*Math.abs(Math.sin(t*1.5+s.p)))*(L.id===2?clamp((s.x/VW-0.3)*2,0,1):1); ctx.fillStyle='#fff'; ctx.fillRect(s.x,s.y,s.s,s.s);} ctx.restore(); ctx.globalAlpha=1; }
  // дрейфующие облака/дымка
  ctx.save(); ctx.globalAlpha=L.id===1?0.22:L.id===2?0.18:0.12; const cc=L.id===1?'#ffcf9a':L.id===2?'#e8a8c8':'#a8d8ff';
  for(let i=0;i<4;i++){ const sp=6+i*5; const y=170+i*70; const x0=-((cam.x*0.03*(i+1)+t*sp)%1024); for(let x=x0;x<VW;x+=1024){ ctx.drawImage(CLOUD,x,y,1024,140+i*20); } } ctx.restore(); ctx.globalAlpha=1; }
function drawLayers(L,cam){ if(FX.bg)return; const A=prepLevelArt(L); const pal=L.pal;
  const yShift=(p)=>-(cam.y-420)*p*0.6;
  ctx.drawImage(A.far,-cam.x*0.1-100,yShift(0.1));
  // воздушная перспектива
  let g=ctx.createLinearGradient(0,300,0,VH); g.addColorStop(0,rgba(pal.fog,0)); g.addColorStop(.6,rgba(pal.fog,pal.fogA*0.5)); g.addColorStop(1,rgba(pal.fog,pal.fogA*0.8)); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
  ctx.drawImage(A.mid,-cam.x*0.3-100,yShift(0.3)+20);
  g=ctx.createLinearGradient(0,360,0,VH); g.addColorStop(0,rgba(pal.fog,0)); g.addColorStop(1,rgba(pal.fog,pal.fogA*0.55)); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
  // солнечные лучи сквозь дымку
  if((L.id<=2||L.id===4)&&L._sun){ const [sx,sy]=L._sun; ctx.save(); ctx.globalCompositeOperation='lighter'; const t=W.time;
    for(let i=0;i<7;i++){ const a=0.35+i*0.13+Math.sin(t*0.2+i)*0.03; const len=1500; ctx.globalAlpha=(0.04+0.03*Math.sin(t*0.7+i*1.7))*(L.id===1?1.2:0.9);
      const gr=ctx.createLinearGradient(sx,sy,sx+Math.cos(a)*len,sy+Math.sin(a)*len); gr.addColorStop(0,L.id===1?'#fff0c8':'#ffb080'); gr.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=gr;
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+Math.cos(a-0.04)*len,sy+Math.sin(a-0.04)*len); ctx.lineTo(sx+Math.cos(a+0.04)*len,sy+Math.sin(a+0.04)*len); ctx.fill(); } ctx.restore(); ctx.globalAlpha=1; } }
