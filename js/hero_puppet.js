'use strict';
// ===== Ирма v0.4: спрайтовая «марионетка» из AI-сгенерированных частей (торс, бедро, голень, стопа, плечо, предплечье) =====
const HB={TOR:16.2,TH:14.5,SH:13.2,ANK:4.6,UA:9.4,LA:9.0};
const HPART={ok:false,p:{}};
(function(){ const D=window.HERO_PARTS||{}; let n=0, need=Object.keys(D).length;
  for(const [k,v] of Object.entries(D)){ const im=new Image(); im.onload=()=>{ const c=document.createElement('canvas'); c.width=v.w; c.height=v.h; c.getContext('2d').drawImage(im,0,0);
      // затемнённая копия для дальних конечностей
      const d=document.createElement('canvas'); d.width=v.w; d.height=v.h; const dg=d.getContext('2d'); dg.drawImage(im,0,0); dg.globalCompositeOperation='source-atop'; dg.fillStyle='rgba(18,12,20,.5)'; dg.fillRect(0,0,v.w,v.h);
      HPART.p[k]={img:c,dark:d,a:v.a,b:v.b,pang:Math.atan2(v.b[1]-v.a[1],v.b[0]-v.a[0]),plen:Math.hypot(v.b[0]-v.a[0],v.b[1]-v.a[1]),tint:{}};
      if(++n===need)HPART.ok=true; }; im.src=v.src; } })();
const HGRADE={1:'#d6b49c',2:'#cdbdd8',3:'#bccadf',4:'#e6cdb4'};
const HOUT={1:'#140a06',2:'#f0c8a8',3:'#d8e8ff',4:'#140a06'};
function partGrade(p,col,dark){ const key=(dark?'d':'n')+col; if(p.tint[key])return p.tint[key]; const src=dark?p.dark:p.img; const c=document.createElement('canvas'); c.width=src.width; c.height=src.height; const g=c.getContext('2d');
  g.drawImage(src,0,0); g.globalCompositeOperation='multiply'; g.fillStyle=col; g.fillRect(0,0,c.width,c.height); g.globalCompositeOperation='destination-in'; g.drawImage(src,0,0); return p.tint[key]=c; }
function partImg(p,o){ if(o.ghost)return partTint(p,o.ghost); const gc=(typeof LV!=='undefined'&&LV)?HGRADE[LV.id]:null; return gc?partGrade(p,gc,o.dark):(o.dark?p.dark:p.img); }
function partTint(p,col){ if(p.tint[col])return p.tint[col]; const c=document.createElement('canvas'); c.width=p.img.width; c.height=p.img.height; const g=c.getContext('2d'); g.drawImage(p.img,0,0); g.globalCompositeOperation='source-in'; g.fillStyle=col; g.fillRect(0,0,c.width,c.height); return p.tint[col]=c; }
// кость: точка a части → (ax,ay), точка b → по направлению (bx,by); s — масштаб вдоль, w — множитель толщины
function boneDraw(g,name,ax,ay,bx,by,o,w=1,lenOverride){ const p=HPART.p[name]; if(!p)return; const L=lenOverride||Math.hypot(bx-ax,by-ay); const s=L/p.plen;
  g.save(); g.translate(ax,ay); g.rotate(Math.atan2(by-ay,bx-ax)); g.scale(s,s*w); g.rotate(-p.pang);
  g.drawImage(partImg(p,o),-p.a[0],-p.a[1]); g.restore(); return s; }
function footDraw(g,ax,ay,ang,s,o){ const p=HPART.p.foot; if(!p)return; g.save(); g.translate(ax,ay); g.rotate(ang); g.scale(s,s); g.rotate(-p.pang); g.drawImage(partImg(p,o),-p.a[0],-p.a[1]); g.restore(); }
// ---- скелет в локальной системе (x — вперёд по взгляду, y — вниз, начало — между стоп на земле)
function puppetStand(P,A){ const f=P.face, pose=A.pose, t=A.t; const sp=Math.abs(P.vx); const k=clamp(sp/PHY.RUN,0,1.15);
  const J={feet:[],fa:[0,0],hands:[null,null],elb:[null,null]}; const legL=HB.TH+HB.SH;
  let hipY=-(legL*0.975+HB.ANK), hipX=0, lean=A.lean*f;
  const br=Math.sin(A.breath)*0.5;
  const u=(A.ph/(Math.PI*2))%1;
  if(pose==='run'){ let drop=0; for(let i=0;i<2;i++){ const G=runGait((u+i*0.5)%1,Math.min(k,1)); J.feet.push([G.x,G.y-HB.ANK]); J.fa[i]=G.a; if(G.st)drop+=Math.sin(Math.PI*G.v); }
    hipY+=drop*2.2*k-1.2*k; hipX=1.5*k; }
  else { let F;
    if(pose==='idle'||pose==='warm'||pose==='lever') F=[[3.5,0,0],[-3,0,0]];
    else if(pose==='repair'){ F=[[8,0,0],[-7,-1,0.5]]; hipY+=8; }
    else if(pose==='rise'){ F=[[6,-12,0.45],[-5,-5,0.6]]; }
    else if(pose==='fall'){ F=[[7+Math.sin(t*8)*1.2,-4,0.2],[-4,-1,0.35+Math.sin(t*8+2)*0.1]]; }
    else if(pose==='wall'){ F=[[9,-14,-0.5],[7,-5,-0.3]]; }
    else if(pose==='dash'){ F=[[8,-9,0.3],[-14,-5,0.9]]; hipY+=3; }
    else F=[[3,0,0],[-3,0,0]];
    for(let i=0;i<2;i++){ J.feet.push([F[i][0],F[i][1]-HB.ANK]); J.fa[i]=F[i][2]; } }
  if(pose==='idle'||pose==='warm')hipY+=br*0.4;
  hipY+=A.landT*8;
  J.hip=[hipX,hipY]; J.lean=lean;
  J.sh=[hipX+Math.sin(lean)*HB.TOR, hipY-Math.cos(lean)*HB.TOR];
  const [sx,sy]=J.sh;
  for(let i=0;i<2;i++){
    if(pose==='run'){ const G=runGait((u+(1-i)*0.5)%1,Math.min(k,1)); const sw=clamp(G.x/16,-1,1)*0.85*Math.max(0.35,Math.min(k,1));
      const ua=sw+lean*0.6; const e=[sx+Math.sin(ua)*HB.UA, sy+Math.cos(ua)*HB.UA]; const fa=ua+lerp(0.5,1.55,Math.min(k,1))+(sw>0?0.25:0);
      J.elb[i]=e; J.hands[i]=[e[0]+Math.sin(fa)*HB.LA, e[1]+Math.cos(fa)*HB.LA]; continue; }
    let h;
    if(pose==='idle') h=[sx+(i?-1:2)+br*0.2, sy+17.5];
    else if(pose==='warm') h=[sx+8, sy+6+Math.sin(t*3+i)*0.8];
    else if(pose==='rise') h=i?[sx-8, sy+9]:[sx+10, sy+1];
    else if(pose==='fall') h=[sx+(i?-9:10)+Math.sin(t*7+i)*1.5, sy+(i?3:-1)+Math.cos(t*6+i)*2];
    else if(pose==='wall') h=[sx+10, sy+(i?-2:3)];
    else if(pose==='dash') h=[sx-(i?15:11), sy+5+i*2];
    else if(pose==='repair'){ const s2=Math.sin(t*14); h=[sx+11+i*2, sy+11+(i?0:s2*4)]; }
    else if(pose==='lever') h=[sx+12, sy-5+Math.sin(t*2)*2];
    else h=[sx+1, sy+17];
    J.hands[i]=h; }
  return J; }
function puppetHang(P,A,o){ // локально: хват в (0,0), тело вниз (+y), x — вперёд
  const t=A.t; const f=P.face; const pump=clamp((P.ax||0)*f,-1,1); const vt=o.vt||0; const tuck=o.zip?0.55:0.18+(A.swingTuck||0);
  const J={feet:[],fa:[0,0],hands:[],elb:[null,null],hang:1};
  // перехват руками при подъёме по тросу
  const cl=A.climb||0; const cph=A.clPh||0;
  for(let i=0;i<2;i++){ let hy=i?-3.5:0.5, hx=i?-0.6:0.6;
    if(cl>0.01){ const fr=((cph/(Math.PI*2))+i*0.5)%1; const yy=fr<0.72?lerp(-8,3,fr/0.72):lerp(3,-8,smooth((fr-0.72)/0.28)); hy=lerp(hy,yy,cl); hx=lerp(hx,fr<0.72?0:(i?-2.5:2.5),cl); }
    J.hands.push([hx,hy]); }
  const swing=clamp(-vt/900,-0.6,0.6);
  const hb=(J.hands[0][1]+J.hands[1][1])/2;
  J.sh=[-0.8, hb+HB.UA+HB.LA-2.5];
  J.lean=swing*0.35-0.05; const [sx,sy]=J.sh;
  J.hip=[sx-Math.sin(J.lean)*HB.TOR, sy+Math.cos(J.lean)*HB.TOR];
  const [hx,hy]=J.hip;
  for(let i=0;i<2;i++){ const sway=Math.sin(t*3.2+i*1.7)*1.2; const fx=hx+(2+pump*7+tuck*12+swing*6)+(i?-4:1.5)+sway, fy=hy+HB.TH+HB.SH-3-tuck*12-(i?1.5:0)+Math.abs(pump)*-2;
    J.feet.push([fx,fy]); J.fa[i]=0.55+tuck*0.4+pump*0.2-(i?-0.1:0); }
  return J; }
function puppetDraw(g,J,o){ const D={ghost:o.ghost}; const Dk={ghost:o.ghost,dark:!o.ghost};
  const legSeg=(i,dd)=>{ const [hx,hy]=J.hip; const ox=i?-1.2:1.2; const [ax,ay]=J.feet[i]; const L=ik(hx+ox,hy,ax,ay,HB.TH,HB.SH,1);
    boneDraw(g,'thigh',hx+ox,hy-1.5,L[0],L[1],dd,1.22,HB.TH+1.5); const s=boneDraw(g,'shin',L[0],L[1],L[2],L[3],dd,1.14,HB.SH);
    footDraw(g,L[2],L[3],J.fa[i],s,dd); return L; };
  const armSeg=(i,dd)=>{ const [sx,sy]=J.sh; const ox=i?-0.8:0.4; let E,H;
    if(J.elb[i]){ E=J.elb[i]; H=J.hands[i]; } else { const L=ik(sx+ox,sy,J.hands[i][0],J.hands[i][1],HB.UA,HB.LA,J.hang?-1:(J.hands[i][0]-sx<-2?1:-1)); E=[L[0],L[1]]; H=[L[2],L[3]]; }
    boneDraw(g,i?'uarmF':'uarm',sx+ox,sy-1.2,E[0],E[1],dd,1.25,HB.UA+1.2); boneDraw(g,i?'larmF':'larm',E[0],E[1],H[0],H[1],dd,1.2,HB.LA); return H; };
  armSeg(1,Dk); legSeg(1,Dk);
  boneDraw(g,'torso',J.hip[0],J.hip[1],J.sh[0],J.sh[1],D,1.0,HB.TOR);
  // светящиеся витки Печки
  if(!o.ghost&&o.charge!=null){ const ch=clamp(o.charge,0,1); const fl=0.8+0.2*Math.sin(o.t*13)*Math.sin(o.t*7.3);
    g.save(); g.translate(J.hip[0],J.hip[1]); g.rotate(J.lean); g.globalCompositeOperation='lighter';
    const gr=g.createRadialGradient(-10.2,-10.5,0,-10.2,-10.5,7); gr.addColorStop(0,`rgba(255,${150+ch*70|0},70,${(0.15+ch*0.55)*fl})`); gr.addColorStop(1,'rgba(255,120,40,0)'); g.fillStyle=gr; g.fillRect(-18,-19,16,17); g.restore(); }
  legSeg(0,D); const H=armSeg(0,D); return H; }
// тёмный контур для читаемости на ярком фоне (солнце, туман)
function puppetOutline(g,J){ const a=g.globalAlpha; const lid=(typeof LV!=='undefined'&&LV)?LV.id:1; const col=HOUT[lid]||'#140a06'; const light=lid===2||lid===3; g.globalAlpha=a*(light?0.5:0.6); const o=1.1; for(const [ox,oy] of [[o,0],[-o,0],[0,o],[0,-o]]){ g.save(); g.translate(ox,oy); puppetDraw(g,J,{ghost:col}); g.restore(); } g.globalAlpha=a; }
function drawHeroRig(g,P,A,o={}){ if(!HPART.ok)return drawHeroRigVec(g,P,A,o); const f=P.face; const J=puppetStand(P,A);
  g.save(); g.translate(P.x,P.y); g.scale(f/Math.sqrt(A.sq),A.sq); g.scale(1.14,1.14); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high';
  if(!o.ghost)puppetOutline(g,J); const H=puppetDraw(g,J,{ghost:o.ghost,charge:P.charge,t:A.t}); g.restore(); return {handW:[H[0]*f,H[1]]}; }
function drawHeroHang(g,P,A,o={}){ if(!HPART.ok)return drawHeroHangVec(g,P,A,o); const f=P.face; const J=puppetHang(P,A,o);
  g.save(); g.translate(o.gx,o.gy); g.rotate(o.ang+Math.PI/2); g.scale(f*1.12,1.12); g.imageSmoothingQuality='high';
  if(!o.ghost)puppetOutline(g,J); puppetDraw(g,J,{ghost:o.ghost,charge:P.charge,t:A.t}); g.restore(); }
