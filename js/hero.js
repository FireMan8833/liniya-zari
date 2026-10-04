'use strict';
// ===== Ирма: процедурный скелет (IK ног и рук), squash&stretch, шарф на verlet, Печка, Клюв =====
const HC={suit:'#77704c',suitD:'#4f4a33',suitL:'#a59c6c',boot:'#2b221b',bootL:'#4a3a2c',glove:'#3a2c20',fur:'#d8cdb6',furD:'#a89c84',cap:'#5d402a',capL:'#82603f',
  skin:'#e0b090',lens:'#8fd4ff',copper:'#b8692e',copperL:'#e59a54',copperD:'#6b3818',scarf:'#b8452a',scarfD:'#7a2a18',strap:'#3a2a1c'};
function ik(hx,hy,fx,fy,a,b,s){ let dx=fx-hx,dy=fy-hy; let d=Math.hypot(dx,dy); const md=a+b-0.01; if(d>md){dx*=md/d;dy*=md/d;d=md;} if(d<1e-3)d=1e-3;
  const base=Math.atan2(dy,dx); const ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1); const al=Math.acos(ca); const ang=base-s*al;
  return [hx+Math.cos(ang)*a, hy+Math.sin(ang)*a, hx+dx, hy+dy]; }
function newAnim(){ const sc=[]; for(let i=0;i<8;i++)sc.push({x:0,y:-48,px:0,py:-48}); 
  return {ph:0,t:0,lean:0,squash:0,sq:1,landT:0,bob:0,blink:0,blinkT:2,scarf:sc,scarfInit:false,coat:0,coatV:0,ghosts:[],armT:0,look:0,pose:'idle',poseT:0,hookRest:0,tilt:0,swingTuck:0,breath:0}; }
function updateHeroAnim(P,dt,env){ const A=P.anim; A.t+=dt; A.poseT+=dt;
  const sp=Math.abs(P.vx); const k=clamp(sp/PHY.RUN,0,1.25);
  let pose='idle';
  if(P.dead) pose='dead'; else if(P.rope&&P.rope.att) pose='swing'; else if(P.zip) pose='zip'; else if(P.dashT>0) pose='dash';
  else if(P.action) pose=P.action; else if(P.onGround){ pose=sp>25?'run':'idle'; if(P.warming)pose='warm'; } else if(P.wall&&P.vy>0) pose='wall'; else pose=P.vy<0?'rise':'fall';
  if(pose!==A.pose){ A.prevPose=A.pose; A.pose=pose; A.poseT=0; }
  if(pose==='run'){ const kk=clamp(sp/PHY.RUN,0.05,1); A.ph+=Math.PI*2*sp*dt/runCycleLen(kk); } else if(pose==='idle'||pose==='warm'){ A.ph=lerp(A.ph,Math.round(A.ph/Math.PI)*Math.PI,1-Math.exp(-dt*10)); }
  const targetLean=pose==='run'?P.face*(0.12+0.1*k)+clamp(P.ax||0,-1,1)*0.06:pose==='dash'?P.face*0.5:pose==='rise'?P.face*0.05:pose==='fall'?-P.face*0.04:0;
  A.lean=lerp(A.lean,targetLean,1-Math.exp(-dt*12));
  A.landT=Math.max(0,A.landT-dt*3.2);
  if(P.rope&&P.rope.att){ const dL=P.rope.L-(A.lastL==null?P.rope.L:A.lastL); A.lastL=P.rope.L; if(dL<-0.02){ A.clPh=(A.clPh||0)+Math.PI*2*(-dL)/15; A.climb=Math.min(1,(A.climb||0)+dt*8); } else A.climb=Math.max(0,(A.climb||0)-dt*5); }
  else { A.lastL=null; A.climb=0; }
  // squash & stretch
  let tsq=1; if(pose==='rise')tsq=1+clamp(-P.vy/700,0,1)*0.12; if(pose==='fall')tsq=1+clamp(P.vy/900,0,1)*0.06; if(pose==='dash')tsq=0.86;
  tsq-=A.landT*0.22; A.sq=lerp(A.sq,tsq,1-Math.exp(-dt*18));
  // полы куртки — пружина
  const tc=clamp(-P.vx/500,-1,1)*0.5+clamp(-P.vy/900,-0.6,0.8)*(P.onGround?0:0.6)+Math.sin(A.t*7)*0.03*(env.wind||0);
  A.coatV+=(tc-A.coat)*dt*120; A.coatV*=Math.exp(-dt*9); A.coat+=A.coatV*dt;
  A.blinkT-=dt; if(A.blinkT<0){A.blink=0.12;A.blinkT=rnd(2,5);} A.blink=Math.max(0,A.blink-dt);
  A.breath+=dt*(pose==='run'?5:2);
  // шарф: verlet
  const nx=P.x-P.face*3, ny=P.y-47*A.sq;
  const sc=A.scarf; if(!A.scarfInit){ for(const p of sc){p.x=p.px=nx;p.y=p.py=ny;} A.scarfInit=true; }
  sc[0].x=nx; sc[0].y=ny; sc[0].px=nx; sc[0].py=ny;
  const wind=(env.wind||0)*-900+(env.windBase||0);
  for(let i=1;i<sc.length;i++){ const p=sc[i]; const vx=(p.x-p.px)*0.96, vy=(p.y-p.py)*0.96; p.px=p.x; p.py=p.y; p.x+=vx+(wind+Math.sin(A.t*9+i)*60)*dt*dt; p.y+=vy+(380+Math.cos(A.t*7+i*1.3)*60)*dt*dt; }
  for(let it=0;it<4;it++) for(let i=1;i<sc.length;i++){ const a=sc[i-1],b=sc[i]; const dx=b.x-a.x,dy=b.y-a.y; const d=Math.hypot(dx,dy)||1; const L=4.2; const df=(d-L)/d; if(i===1){b.x-=dx*df;b.y-=dy*df;} else {a.x+=dx*df*0.5;a.y+=dy*df*0.5;b.x-=dx*df*0.5;b.y-=dy*df*0.5;} }
  // шлейф рывка
  if(pose==='dash'&&((A.gT=(A.gT||0)-dt)<=0)){ A.gT=0.025; A.ghosts.push({x:P.x,y:P.y,face:P.face,lean:A.lean,sq:A.sq,ph:A.ph,a:0.55}); }
  for(const g of A.ghosts)g.a-=dt*2.2; A.ghosts=A.ghosts.filter(g=>g.a>0);
}
// ---- отрисовка
function limb(g,x1,y1,x2,y2,x3,y3,w1,w2,col,rim,rimDx,rimDy){ g.lineCap='round'; g.lineJoin='round';
  g.strokeStyle=col; g.lineWidth=w1; g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke(); g.lineWidth=w2; g.beginPath(); g.moveTo(x2,y2); g.lineTo(x3,y3); g.stroke();
  if(rim){ g.strokeStyle=rim; g.lineWidth=1.3; g.beginPath(); g.moveTo(x1+rimDx*w1*0.35,y1+rimDy*w1*0.35); g.lineTo(x2+rimDx*w1*0.3,y2+rimDy*w1*0.3); g.lineTo(x3+rimDx*w2*0.3,y3+rimDy*w2*0.3); g.stroke(); } }
function poseRig(P,A){ // возвращает ключевые точки в локальных координатах (x вправо по взгляду не нормализован: f — направление)
  const f=P.face, k=clamp(Math.abs(P.vx)/320,0,1.2), ph=A.ph, pose=A.pose, t=A.t;
  const R={}; let hipY=-27, bob=0;
  const breathe=Math.sin(A.breath)*0.6;
  if(pose==='run'){ bob=-Math.abs(Math.cos(ph))*3*k+1.5*k; }
  if(pose==='idle'||pose==='warm') bob=breathe*0.5;
  hipY+=bob+A.landT*7; R.hip=[0,hipY];
  const lean=A.lean; const tl=19; R.neck=[Math.sin(lean)*tl, hipY-Math.cos(lean)*tl];
  R.sh=[R.neck[0]*0.85-f*0.5, hipY-Math.cos(lean)*tl*0.82];
  R.head=[R.neck[0]+Math.sin(lean)*6+f*1.2, R.neck[1]-6.5];
  // ноги
  const feet=[];
  for(let i=0;i<2;i++){ const p=ph+i*Math.PI; let fx,fy;
    if(pose==='run'){ const S=Math.max(6,17*Math.min(k,1)); fx=f*S*Math.cos(p); fy=-Math.max(0,-Math.sin(p))*11*Math.min(1,k+0.2); }
    else if(pose==='idle'||pose==='warm'||pose==='repair'||pose==='lever'){ fx=f*(i?-5:4); fy=0; if(pose==='repair'){ fx=i?f*-9:f*7; fy=0; } }
    else if(pose==='rise'){ fx=f*(i?-7:7); fy=i?-8:-13; }
    else if(pose==='fall'){ fx=f*(i?-6:8)+Math.sin(t*9+i*2)*1.5; fy=i?-2:-5; }
    else if(pose==='wall'){ fx=f*(i?6:9); fy=i?-6:-14; }
    else if(pose==='dash'){ fx=f*(i?-14:6); fy=i?-6:-10; }
    else { fx=f*(i?-4:4); fy=0; }
    feet.push([fx,fy]); }
  R.feet=feet;
  // руки
  const hands=[]; const shx=R.sh[0], shy=R.sh[1];
  for(let i=0;i<2;i++){ let hx,hy; const p=ph+i*Math.PI;
    if(pose==='run'){ const sw=-Math.cos(p)*(0.9*Math.min(k,1)); const a=Math.PI/2-f*sw; hx=shx+Math.cos(a)*15*f*f+f*Math.sin(sw)*0; hx=shx-f*Math.sin(sw)*13; hy=shy+Math.cos(sw)*13-4*Math.min(k,1); }
    else if(pose==='idle'){ hx=shx+f*(i?-2:3); hy=shy+19+breathe*0.3; }
    else if(pose==='warm'){ hx=R.neck[0]+f*7; hy=shy+8+Math.sin(t*3+i)*1; }
    else if(pose==='rise'){ hx=shx+f*(i?-9:10); hy=shy-10-i*2; }
    else if(pose==='fall'){ hx=shx+f*(i?-13:12)+Math.sin(t*7+i)*2; hy=shy-6+Math.cos(t*6+i)*3; }
    else if(pose==='wall'){ hx=shx+f*13; hy=shy-(i?12:2); }
    else if(pose==='dash'){ hx=shx-f*(i?16:12); hy=shy+4+i*2; }
    else if(pose==='repair'){ const sw=Math.sin(t*14); hx=shx+f*(12+i*2); hy=shy+12+(i?0:sw*5); }
    else if(pose==='lever'){ hx=shx+f*12; hy=shy-6+Math.sin(t*2)*2; }
    else { hx=shx; hy=shy+18; }
    hands.push([hx,hy]); }
  R.hands=hands; return R; }
function drawHeroRigVec(g,P,A,o={}){ const f=P.face; const R=poseRig(P,A); const ghost=o.ghost;
  const rimCol=o.rim||'rgba(255,214,160,.85)'; const rdx=o.rdx||-0.6, rdy=o.rdy||-0.8;
  const col=c=>ghost?ghost:c; const rim=ghost?null:rimCol;
  g.save(); g.translate(P.x,P.y); g.scale(1/Math.sqrt(A.sq),A.sq);
  if(A.pose==='repair'){ g.translate(0,8); }
  const [hx,hy]=R.hip, [sx,sy]=R.sh;
  const legIK=(i)=>{ const [fx,fy]=R.feet[i]; const kneeS=f; const hipX=hx+f*(i?-1.5:1.5); return ik(hipX,hy,fx,fy-1.5,14,14.5,kneeS); };
  const armIK=(i)=>{ const [tx,ty]=R.hands[i]; return ik(sx+f*(i?-1:1),sy,tx,ty,10.5,10.5,-f); };
  // дальняя рука/нога (затемнены)
  const far=1;
  let L=legIK(far); limb(g,hx+f*-1.5,hy,L[0],L[1],L[2],L[3],6.4,5.2,col(HC.suitD),null);
  g.fillStyle=col('#1e1813'); g.beginPath(); g.ellipse(L[2]+f*2.5,L[3]-1,5.2,3,0,0,Math.PI*2); g.fill();
  let Ar=armIK(far); limb(g,sx,sy,Ar[0],Ar[1],Ar[2],Ar[3],4.8,4.2,col(HC.suitD),null); g.fillStyle=col(HC.glove); g.beginPath(); g.arc(Ar[2],Ar[3],2.6,0,7); g.fill();
  // шарф (за спиной)
  // Печка (ранец) — позади торса
  const bx=(hx+sx)/2-f*7.5, by=(hy+sy)/2-2; const ang=A.lean;
  g.save(); g.translate(bx,by); g.rotate(ang);
  g.fillStyle=col(HC.copperD); g.beginPath(); g.roundRect(-6,-11,12,22,4); g.fill();
  if(!ghost){ const gr=g.createLinearGradient(-6,0,6,0); gr.addColorStop(0,f>0?HC.copperL:HC.copperD); gr.addColorStop(1,f>0?HC.copperD:HC.copperL); g.fillStyle=gr; g.beginPath(); g.roundRect(-5.2,-10.5,10.4,21,3.5); g.fill();
    // светящиеся витки
    const ch=clamp(P.charge,0,1); const fl=0.75+0.25*Math.sin(A.t*13)*Math.sin(A.t*7.3);
    for(let i=0;i<4;i++){ g.strokeStyle=`rgba(255,${150+ch*80|0},${60+ch*40|0},${(0.25+ch*0.75)*fl})`; g.lineWidth=2; g.beginPath(); g.moveTo(-5.5,-5+i*4); g.quadraticCurveTo(0,-3+i*4,5.5,-5+i*4); g.stroke(); }
    g.fillStyle=HC.copperD; g.fillRect(-1.5,-15,3,5); g.fillStyle=HC.copperL; g.fillRect(-2.2,-16,4.4,1.8); }
  g.restore();
  // торс (парка)
  const coat=A.coat;
  g.fillStyle=col(HC.suit); g.beginPath();
  g.moveTo(sx-f*6,sy-2); g.quadraticCurveTo(sx+f*6.5,sy-3,sx+f*6,sy+4); g.lineTo(hx+f*6.5,hy+2);
  g.quadraticCurveTo(hx+f*7+coat*5,hy+9,hx+f*5+coat*7,hy+11); g.lineTo(hx-f*6+coat*9,hy+10+Math.abs(coat)*2); g.quadraticCurveTo(hx-f*7.5,hy+3,sx-f*6.5,sy+3); g.closePath(); g.fill();
  if(!ghost){ g.fillStyle='rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(hx-f*6+coat*9,hy+10); g.lineTo(hx+f*5+coat*7,hy+11); g.lineTo(hx+f*5,hy+5); g.lineTo(hx-f*6,hy+4); g.fill();
    g.strokeStyle=HC.strap; g.lineWidth=1.8; g.beginPath(); g.moveTo(sx-f*3,sy-1); g.lineTo(hx+f*3,hy-2); g.stroke();
    g.fillStyle=HC.strap; g.fillRect(hx-6,hy-3,12,2.4); g.fillStyle='#c9a24a'; g.fillRect(hx+f*1-1,hy-3.2,2.4,2.8);
    g.strokeStyle=rimCol; g.lineWidth=1.2; g.beginPath(); g.moveTo(sx-f*6+rdx*1.5,sy-1); g.quadraticCurveTo(sx+f*0,sy-4,sx+f*6,sy+3); g.stroke(); }
  // меховой воротник
  g.fillStyle=col(HC.fur); g.beginPath(); g.ellipse(R.neck[0],R.neck[1]+1.5,6.8,3.8,A.lean,0,Math.PI*2); g.fill();
  if(!ghost){ g.fillStyle=HC.furD; g.beginPath(); g.ellipse(R.neck[0]-f*1.5,R.neck[1]+3,5,2,A.lean,0,Math.PI); g.fill(); }
  // ближняя нога
  L=legIK(0); limb(g,hx+f*1.5,hy,L[0],L[1],L[2],L[3],6.8,5.6,col(HC.suit),rim,rdx,rdy);
  if(!ghost){ g.strokeStyle=HC.boot; g.lineWidth=5.8; g.beginPath(); g.moveTo(lerp(L[0],L[2],0.55),lerp(L[1],L[3],0.55)); g.lineTo(L[2],L[3]); g.stroke(); }
  g.fillStyle=col(HC.boot); g.beginPath(); g.ellipse(L[2]+f*2.8,L[3]-1,5.6,3.1,0,0,Math.PI*2); g.fill();
  // голова: шлем-ушанка, очки
  const [hdx,hdy]=R.head;
  g.save(); g.translate(hdx,hdy); g.rotate(A.lean*0.6);
  g.fillStyle=col(HC.skin); g.beginPath(); g.ellipse(f*1.5,1.5,5.4,6,0,0,Math.PI*2); g.fill();
  if(!ghost){ g.fillStyle='#3a2418'; g.beginPath(); g.moveTo(-f*5,-1); g.quadraticCurveTo(-f*7,6,-f*3,8); g.lineTo(-f*1,3); g.fill(); // волосы
    if(A.blink<=0){ g.fillStyle='#2a1a12'; g.fillRect(f*4-0.8,0,1.6,1.8); } }
  g.fillStyle=col(HC.cap); g.beginPath(); g.ellipse(0,-2.5,6.8,5.8,0,Math.PI,0); g.lineTo(f*-6.8,1); g.quadraticCurveTo(-f*7.5,6,-f*4.5,6.5); g.lineTo(-f*3,-1); g.closePath(); g.fill();
  if(!ghost){ g.fillStyle=HC.capL; g.beginPath(); g.ellipse(f*1,-6,4,1.6,0,0,Math.PI*2); g.fill();
    // очки
    g.fillStyle='#8a8070'; g.beginPath(); g.roundRect(-f*1.5-(f>0?0:7),-6.8,7,3.6,1.6); g.fill();
    const lg=0.65+0.35*Math.sin(A.t*1.7); g.fillStyle=`rgba(143,212,255,${lg})`; g.beginPath(); g.ellipse(f*3.2,-5,1.8,1.3,0,0,7); g.fill();
    g.fillStyle='rgba(255,255,255,.8)'; g.fillRect(f*3.6-0.5,-5.8,1,0.9);
    g.strokeStyle=rimCol; g.lineWidth=1.1; g.beginPath(); g.arc(0,-2.5,6.6,Math.PI*1.1,Math.PI*1.65); g.stroke(); }
  g.restore();
  // ближняя рука
  Ar=armIK(0); limb(g,sx,sy,Ar[0],Ar[1],Ar[2],Ar[3],5.2,4.6,col(HC.suit),rim,rdx,rdy);
  g.fillStyle=col(HC.glove); g.beginPath(); g.arc(Ar[2],Ar[3],2.9,0,7); g.fill();
  R.handW=[Ar[2],Ar[3]]; // точка хвата (локально)
  g.restore();
  return R; }
// Поза на тросе: тело висит под точкой хвата, повернуто вдоль троса
function drawHeroHangVec(g,P,A,o={}){ const f=P.face; const ghost=o.ghost; const col=c=>ghost?ghost:c; const rimCol=o.rim||'rgba(255,214,160,.85)';
  const ang=o.ang; // угол от хвата к якорю
  const t=A.t; const pump=clamp((P.ax||0)*f,-1,1); const vt=o.vt||0;
  g.save(); g.translate(o.gx,o.gy); g.rotate(ang+Math.PI/2);
  // локально: хват в (0,0), тело вниз (+y)
  const lean=clamp(-vt/900,-0.5,0.5)*f; const tuck=A.swingTuck||0;
  const sh=[0,8], hip=[Math.sin(lean)*-2, 27];
  // руки вверх к хвату
  limb(g,sh[0]-f*1.5,sh[1],-f*2.5,4,-f*0.5,0,4.6,4.2,col(HC.suitD),null);
  // Печка
  if(!ghost){ g.save(); g.translate(-f*7.5,17); g.fillStyle=HC.copperD; g.beginPath(); g.roundRect(-6,-11,12,22,4); g.fill(); g.fillStyle=HC.copper; g.beginPath(); g.roundRect(-5,-10,10,20,3.5); g.fill();
    const ch=clamp(P.charge,0,1); for(let i=0;i<4;i++){ g.strokeStyle=`rgba(255,${150+ch*80|0},70,${0.25+ch*0.7})`; g.lineWidth=2; g.beginPath(); g.moveTo(-5,-5+i*4); g.quadraticCurveTo(0,-3+i*4,5,-5+i*4); g.stroke(); } g.restore(); }
  // торс
  g.fillStyle=col(HC.suit); g.beginPath(); g.moveTo(-f*6,sh[1]-1); g.lineTo(f*6,sh[1]); g.lineTo(hip[0]+f*6.5,hip[1]+3); g.lineTo(hip[0]+f*4+A.coat*6,hip[1]+11); g.lineTo(hip[0]-f*6+A.coat*8,hip[1]+10); g.lineTo(-f*6.5,sh[1]+4); g.closePath(); g.fill();
  g.fillStyle=col(HC.fur); g.beginPath(); g.ellipse(0,sh[1]-1,6.5,3.6,0,0,7); g.fill();
  // ноги: маятник, поджимаются при раскачке
  for(let i=1;i>=0;i--){ const kx=f*(6+pump*7+tuck*6)+(i?-f*5:0)+Math.sin(t*4+i)*1.2; const ky=hip[1]+13-tuck*4; const fx=kx-f*(4+tuck*3)+(i?-f*3:f*2), fy=hip[1]+27-tuck*9;
    const L=ik(hip[0]+(i?-f*1.5:f*1.5),hip[1],fx,fy,14,14.5,f); limb(g,hip[0],hip[1],L[0],L[1],L[2],L[3],6.6,5.4,col(i?HC.suitD:HC.suit),i||ghost?null:rimCol,-0.5,-0.8);
    g.fillStyle=col(HC.boot); g.beginPath(); g.ellipse(L[2]+f*2.4,L[3],5.4,3,0.3*f,0,7); g.fill(); }
  // голова
  g.save(); g.translate(f*1.5,0); g.fillStyle=col(HC.skin); g.beginPath(); g.ellipse(f*1.8,-4,5.2,5.8,0,0,7); g.fill();
  g.fillStyle=col(HC.cap); g.beginPath(); g.ellipse(0,-8,6.6,5.6,0,Math.PI,0); g.lineTo(-f*6.6,-4); g.quadraticCurveTo(-f*7,1,-f*4,1.5); g.closePath(); g.fill();
  if(!ghost){ g.fillStyle='#8a8070'; g.beginPath(); g.roundRect(-f*1.5-(f>0?0:7),-12,7,3.4,1.5); g.fill(); g.fillStyle='rgba(143,212,255,.85)'; g.beginPath(); g.ellipse(f*3.2,-10.4,1.7,1.2,0,0,7); g.fill(); }
  g.restore();
  // ближняя рука
  limb(g,sh[0]+f*1.5,sh[1],f*2.5,4,f*0.6,0,5,4.4,col(HC.suit),ghost?null:rimCol,-0.5,-0.7);
  g.fillStyle=col(HC.glove); g.beginPath(); g.arc(0,0,3.2,0,7); g.fill();
  g.restore(); }
function drawScarf(g,A,ghost){ const sc=A.scarf; if(ghost)return; g.save(); g.lineCap='round'; g.lineJoin='round';
  for(let pass=0;pass<2;pass++){ g.strokeStyle=pass?HC.scarf:HC.scarfD; for(let i=1;i<sc.length;i++){ g.lineWidth=(pass?3.6:4.6)*(1-i/sc.length*0.6); g.beginPath(); g.moveTo(sc[i-1].x,sc[i-1].y+(pass?-0.4:0.5)); g.lineTo(sc[i].x,sc[i].y); g.stroke(); } } g.restore(); }
// ---- верёвка Клюва: verlet-цепочка между рукой и крюком
function ropeUpdate(R,x0,y0,x1,y1,len,dt,slackG=900){ const N=R.pts.length; R.t=(R.t||0)+dt; if(!R.init){ for(let i=0;i<N;i++)R.pts[i]={x:x0,y:y0,px:x0,py:y0}; R.init=true; R.wob=0; }
  const dx=x1-x0, dy=y1-y0, d=Math.hypot(dx,dy)||1; let nx=-dy/d, ny=dx/d; if(ny<0){nx=-nx;ny=-ny;}
  const sag=Math.min(70,len>d?Math.sqrt(len*len-d*d)*0.5:0);
  // волна вдоль троса: при полёте крюка и в момент натяжения
  const fly=slackG>500; if(R.lastFly&&!fly)R.wob=1; R.lastFly=fly; R.wob=Math.max(0,(R.wob||0)-dt*2.5);
  for(let i=0;i<N;i++){ const u=i/(N-1); const env=Math.sin(Math.PI*u); let off=sag*env;
    if(fly)off+=Math.sin(u*14-R.t*45)*3.2*env; off+=R.wob*Math.sin(u*Math.PI*3-R.t*30)*5*env;
    const p=R.pts[i]; p.x=x0+dx*u+nx*off; p.y=y0+dy*u+ny*off; } }
function ropeDraw(g,R,col='#2a1d14',hi='rgba(255,200,140,.5)'){ const p=R.pts; g.save(); g.lineCap='round'; g.lineJoin='round';
  g.strokeStyle=col; g.lineWidth=2.6; g.beginPath(); g.moveTo(p[0].x,p[0].y); for(let i=1;i<p.length;i++)g.lineTo(p[i].x,p[i].y); g.stroke();
  g.strokeStyle=hi; g.lineWidth=0.8; g.setLineDash([3,3]); g.beginPath(); g.moveTo(p[0].x,p[0].y-0.6); for(let i=1;i<p.length;i++)g.lineTo(p[i].x,p[i].y-0.6); g.stroke(); g.setLineDash([]); g.restore(); }
function drawHook(g,x,y,ang,open=1){ g.save(); g.translate(x,y); g.rotate(ang); g.scale(1.5,1.5); g.strokeStyle='#cfc2a8'; g.lineWidth=2.2; g.lineCap='round';
  g.beginPath(); g.moveTo(-6,0); g.lineTo(4,0); g.stroke(); g.beginPath(); g.moveTo(4,0); g.quadraticCurveTo(8,-5*open,3,-7*open); g.moveTo(4,0); g.quadraticCurveTo(8,5*open,3,7*open); g.stroke();
  g.fillStyle='#ffd7a0'; g.beginPath(); g.arc(4,0,1.6,0,7); g.fill(); g.restore(); }

// походка бега (общая для анимации и марионетки)
const smooth=x=>x*x*(3-2*x);
function runGait(u,k){ // u∈[0,1) фаза одной ноги → {x,y,a}
  const S=lerp(7,16,k), st=lerp(0.58,0.3,k);
  if(u<st){ const v=u/st; return {x:S-2*S*v, y:0, a:lerp(-0.12,0.25,smooth(v))*k, st:1, v}; }
  const v=(u-st)/(1-st); const lift=lerp(5,15,k);
  return {x:-S+2*S*smooth(v)-7*k*Math.sin(Math.PI*v)*(1-v)*2, y:-lift*Math.pow(Math.sin(Math.PI*Math.min(1,v*1.15)),0.9)*(1.25-0.5*v), a:k*(0.25+0.9*Math.sin(Math.PI*v)*(1-v*0.6))-0.15*v*k, st:0, v}; }
function runCycleLen(k){ const S=lerp(7,16,k), st=lerp(0.58,0.3,k); return 2*S/st; } // путь тела за полный цикл (две ноги)
