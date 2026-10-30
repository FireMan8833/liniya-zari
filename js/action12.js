'use strict';
// v0.11: replace VIII–XI, not another annex. No consoles, number locks or fetch menus.
const META12=[
 ['Последний вагон','Глава VIII','Перехватите вагон с насосом, пока Орсо ещё можно запустить.','↓ на подвижном вагоне — тормоз. Совместите сцепки; отпустите ↓, чтобы снова разогнаться.'],
 ['Слепой перегон','Глава IX','Пробейте заслоны Гильдии и откройте Орсо путь к развязке.','Shift рядом с ящиком — удар с разбега. Катящийся груз ломает деревянные заслоны и закрывает от фонарей.'],
 ['Через разрыв','Глава X','Опережая город, доберитесь до аварийного перевода.','В прыжке держите Q — планирование. Ловите восходящий ветер над трубами. E — Клюв, Space — отцепиться.'],
 ['Ночная стрелка','Глава XI','Переведите путь своим весом и направьте Орсо на обход.','Прыгните и держите E у подвесного груза. Повисните ниже кольца: ваш вес развернёт пролёт. W — подтянуться обратно к рельсам.']
];
const LINES12={
 r12_0a:{s:'avram',t:'Ирма, насос увозят! Без него Орсо не тронется. Мара выводит тебя к товарному составу. Перехвати последний вагон.'},
 r12_0b:{s:'mara',t:'Сцепки разошлись. Прыгни на гуляющий вагон и прижми тормоз башмаком: стрелка вниз. Поймай метку у сцепки. Рано затормозила — отпусти, попробуй ещё.'},
 r12_0c:{s:'teo',t:'На насосе не складская пломба. Его сняли именно с нашего обратного пути. Орсо остановили заранее, до солнечной вспышки.'},
 r12_0d:{s:'irma',t:'Значит, разрыв был только удобным поводом. Мара, цепляй насос. Дед, запускай город. Я проверю стрелку впереди.'},
 r12_ep0:{s:'narr',t:'Насос возвращается в Орсо. Аврам поднимает давление. На обороте накладной Тео находит схему: маршрут Орсо зачёркнут ещё за день до вспышки.'},
 r12_1a:{s:'avram',t:'Колёса пошли, Ирма! Но тормозить снова не сможем: хвост уже у полудня. Пробей заслоны на служебном перегоне.'},
 r12_1b:{s:'mara',t:'Ударь ящик рывком — он снесёт доски. За тяжёлым грузом можно укрыться от фонаря. Клювом подтянешь его обратно, если промахнёшься.'},
 r12_1c:{s:'veil',t:'Обходчица, не трогай перевод. На основном пути вы ещё успеете. На ночном я не отвечаю за людей.'},
 r12_1d:{s:'teo',t:'Я сравнил его схему с журналом Зари. Основной путь заканчивается разобранным мостом. Он ведёт город туда намеренно. Нужна ночная стрелка.'},
 r12_ep1:{s:'narr',t:'Последний заслон падает. За ним — рельсы к обрыву. Орсо приближается. Мара находит на старой карте узкий ночной обход; до него Ирме придётся добраться над ущельем.'},
 r12_2a:{s:'mara',t:'Раскрой плащ в прыжке — держи Q. Ветер над вентиляционными шахтами поднимет тебя. Не лети против него, переходи от потока к потоку.'},
 r12_2b:{s:'irma',t:'Старый мост разобрали недавно. Здесь ещё пахнет резаком. Вейл знал, что Орсо не сможет остановиться.'},
 r12_2c:{s:'teo',t:'В журнале Зари есть поправки к бегу солнца. Ночной обход строили на случай ускорения. Его не закрывали — его вычеркнули из наших карт.'},
 r12_2d:{s:'veil',t:'Ты видишь один город. Я вижу всё Кольцо. Если каждый начнёт менять путь, голова потеряет темп.'},
 r12_ep2:{s:'narr',t:'Ирма садится у башни перевода. Внизу уже слышен Орсо. Электропривод снят, но тросы противовесов целы. Путь можно перевести вручную — снаружи, над рельсами.'},
 r12_3a:{s:'avram',t:'Мы подходим! Вижу красный. Если дёрнуть тормоз, задние вагоны не выдержат. Ирма, вся надежда на тебя.'},
 r12_3b:{s:'mara',t:'Электрики больше нет. Зацепись Клювом за кольцо и повисни на тросе. Противовес опустит мостик. Дальше по нему — к следующему подвесу.'},
 r12_3c:{s:'teo',t:'Стой. Подпись Вейла стоит только под исполнением. Маршрут утвердили выше — в головном городе. Я вижу имя, но половину листа вырвали.'},
 r12_3d:{s:'irma',t:'Сначала выведем Орсо. А потом узнаем, кто решает за всё Кольцо. Дед, держи ход. Ночной путь открыт.'},
 r12_ep3:{s:'narr',t:'Орсо входит на ночной обход. На дальнем сигнале вспыхивает белый огонь — раньше, чем Аврам успевает назвать город. Кто-то впереди уже ждал этот состав.'}
};
Object.assign(ASSETS_LINES,LINES12);SPEAKER.veil='ВЕЙЛ';
function level12(k){const meta=META12[k],L=mkLevel({id:k+8,name:meta[0],sub:meta[1],sky:['yard12','sky10','canyon12','switch12'][k],tex:'iron12',music:k===1?'m_chase':k===2?'m_bridge':'m_city',length:9600,killY:1080,spawn:[120,560],rework12:k,cloak:false,litOnly:true,chrono:0,views:[],tasks9:[],nodes9:[],service9:1e8,terminals:[],sequence:{id:'unused',order:[],progress:0},flow:{id:'unused',bits:0,target:0},moving12:[],ram12:[],winches12:[],updraft12:[],pal:{...LEVELS[6].pal,fog:['#536261','#233d47','#37616a','#304f50'][k],fogA:.08}});
 const S=(x,y,w,h=400,o={})=>{const s={x,y,w,h,k:'art12',...o};L.solids.push(s);return s;};
 const car=(x,y,w=700,o={})=>S(x,y,w,24,{car12:true,oneWay:true,...o});
 car(0,560,850);L.cps=[{x:120},{x:3200},{x:6200},{x:9020}];
 for(let j=0;j<3;j++){
  const b=j*3000,id='A12_'+k+'_'+j;
  if(k===0){
   car(b+850,560,530);const m={id,j,b,x:b+1450,y:560,w:620,h:24,v:115,sign:1,min:b+1430,max:b+1780,target:b+1720,locked:false,car12:true,oneWay:true,k:'art12',dynamic12:true};L.moving12.push(m);L.solids.push(m);
   car(b+2400,560,600);car(b+2050,690,350); // low rescue carriage below coupling; visible before the gap
   L.anchors.push({x:b+1570,y:290},{x:b+2310,y:285});
   if(j===1){S(b+1060,490,80,70,{mat12:'wood12'});L.vents.push({x:b+2650,y:560,per:3.7,on:1.3,ph:.4});}
   if(j===2){S(b+1030,470,100,90);L.drones.push({x1:b+2140,x2:b+2670,y:200,per:5.5});}
  }else if(k===1){
   car(b,560,1500);car(b+1640,520,1360);
   const c={x:b+430,y:480,w:78,h:80,ram12:id};L.crates.push(c);
   const wall=S(b+1120,340,130,220,{mat12:'wood12',break12:id});L.ram12.push({id,j,x:wall.x,wall,energy:0});
   S(b+1870,450,80,70,{mat12:'wood12'});S(b+2150,390,110,130);L.anchors.push({x:b+1550,y:250});
   if(j>0)L.sentinels.push({x:b+930,y:250,base:Math.PI/2,amp:.55,per:4.7,ph:j});
   if(j===2)L.vents.push({x:b+2620,y:520,per:3.1,on:1.1,ph:.4});
  }else if(k===2){
   const gap=[600,760,900][j];S(b,560,1050,550,{mat12:'stone12'});S(b+1050+gap,560,1950-gap,550,{mat12:'stone12'});
   S(b+650,480,160,80,{mat12:'stone12'});S(b+870,400,180,160,{mat12:'stone12'});
   L.updraft12.push({x:b+1180,w:200,y:910,top:190},{x:b+1420+(j*100),w:210,y:920,top:170});
   L.anchors.push({x:b+1190,y:230},{x:b+1500+j*100,y:240});
   S(b+1100,830,180,18,{oneWay:true,mat12:'grate12'});S(b+1400,830,180,18,{oneWay:true,mat12:'grate12'});
   if(j===2)L.updraft12.push({x:b+1770,w:150,y:930,top:160});
  }else{
   car(b,560,1100);car(b+1570,560,1430);
   const m={id,j,x:b+1100,y:560,w:470,progress:0,done:false};L.winches12.push(m);
   L.anchors.push({x:b+1270,y:280,winch12:id});
   S(b+1120,840,400,18,{oneWay:true,mat12:'grate12'});
   // bridge collider extends with the counterweight; it is not a button-operated gate.
   S(m.x,m.y,1,24,{oneWay:true,bridge12:id,mat12:'grate12'});
   L.updraft12.push({x:b+1150,w:360,y:1000,top:340,rescue:true});
   if(j===1){L.vents.push({x:b+2000,y:560,per:3.6,on:1.2,ph:.7});S(b+2300,490,100,70);}
   if(j===2){S(b+2000,480,100,80);L.anchors.push({x:b+2340,y:250});}
  }
 }
 car(9000,560,600);L.goal={x:9370,kind:'door',hold:.5,label:['сцепить вагон с Орсо','выйти к обрыву','добраться до башни перевода','пустить Орсо на ночной путь'][k],gy:560};
 L.trig=[{x:160,lines:['r12_'+k+'a']},{x:850,lines:['r12_'+k+'b']},{x:3300,lines:['r12_'+k+'c']},{x:6800,lines:['r12_'+k+'d']}];
 return L;
}
LEVELS.splice(7,1,...[0,1,2,3].map(level12));
for(let k=0;k<4;k++){SUNPOS[k+8]=[.2,.3];GRADE[k+8]={...GRADE[7],sat:1.0,bloom:.16};CH_LINE[k+7]=META12[k][2];}
// Ensure actual music names exist; never leave a level silent because of an invented track.
LEVELS[9].music='m_bridge';if(!ASSETS_AUDIO[LEVELS[9].music])LEVELS[9].music='m_hall';
if(SAVE.rework12!==1){if(SAVE.chapter>=7){SAVE.chapter=7;SAVE.cp=0;}SAVE.progress12={};SAVE.rework12=1;SAVE.done=false;SAVE.unlocked=Math.max(SAVE.unlocked||0,SAVE.chapter>=7?7:0);persist();}
function notify12(t){W.note12={text:t,t:3.8};}
function save12(){if(LV.rework12===undefined)return;SAVE.progress12=SAVE.progress12||{};SAVE.progress12[LV.id]={flags:{...W.flags}};SAVE.chapter=LV.idx;SAVE.cp=W.cp;SAVE.done=false;persist();}
const startOld12=startGame;
startGame=function(li,cp=0){if(li<7)return startOld12(li,cp);buildWorld(li);LV.moving12=LV.moving12.map(m=>LV.solids.find(s=>s.dynamic12&&s.id===m.id));W.deaths=0;W.sola=SAVE.sola||null;W.journal9=false;const s=SAVE.progress12&&SAVE.progress12[LV.id];if(cp>0&&s)Object.assign(W.flags,s.flags);applySaved12();respawn(Math.min(cp,LV.cps.length-1));setState('game');VOICE.clear();SAVE.chapter=li;SAVE.cp=W.cp;SAVE.done=false;persist();AUD.playMusic(LV.music,1.5);};
function applySaved12(){for(const m of LV.moving12)if(W.flags[m.id]){m.locked=true;m.x=m.target;m.v=0;}for(const m of LV.winches12)if(W.flags[m.id]){m.done=true;m.progress=1;}for(const r of LV.ram12)if(W.flags[r.id])LV.colStatic=LV.colStatic.filter(s=>s.break12!==r.id);}
const cpOld12=onCheckpoint;onCheckpoint=function(i){if(LV.rework12===undefined)return cpOld12(i);save12();};
const respawnOld12=respawn;respawn=function(ci){respawnOld12(ci);if(LV.rework12!==undefined){W.P.inv=1;W.hook=null;applySaved12();}};
const occOld12=occluded;occluded=function(x1,y1,x2,y2){if(occOld12(x1,y1,x2,y2))return true;return LV.rework12===1&&LV.crates.some(c=>segHits(x1,y1,x2,y2,c));};
function finishAction12(id,text){if(W.flags[id])return;W.flags[id]=true;notify12(text);sfx('s_checkpoint',{vol:.6,rate:1.15});shake(2);save12();}
const stepOld12=stepWorld;
stepWorld=function(dt){if(LV.rework12===undefined)return stepOld12(dt);if(W.journal9)return;
 const P=W.P,I=inp(),k=LV.rework12;W.rescueT=I.held('rescue')?(W.rescueT||0)+dt:0;if(W.rescueT>1){respawn(W.cp);W.rescueT=0;return;}
 if(W.note12){W.note12.t-=dt;if(W.note12.t<=0)W.note12=null;}
 const wasGround=P.onGround,oldGround=P.ground,depart=oldGround&&oldGround.dynamic12?(oldGround.vx||0):0;
 // Live wagon braking: only the rider's body can slow a loose carriage.
 for(const m of LV.moving12){const old=m.x;
  if(!m.locked){const rider=P.onGround&&P.ground===m;const braking=rider&&I.held('down');m.braking=braking;
   if(braking)m.v=Math.sign(m.v)*Math.max(0,Math.abs(m.v)-420*dt);else m.v=lerp(m.v,m.sign*115,1-Math.exp(-dt*2.2));
   m.x+=m.v*dt;if(m.x>m.max){m.x=m.max;m.sign=-1;}if(m.x<m.min){m.x=m.min;m.sign=1;}
   if(braking&&Math.abs(m.x-m.target)<48&&Math.abs(m.v)<48){m.locked=true;m.x=m.target;m.v=0;finishAction12(m.id,'Сцепка защёлкнулась. Вагон удержан.');}
  }m.vx=(m.x-old)/dt;
 }
 // Kinetic ram: dash transfers impulse into a real movable, grapple-able cargo body.
 if(k===1){for(const c of LV.crates){const near=Math.abs(P.x-(c.x+c.w/2))<105&&Math.abs(P.y-(c.y+c.h))<85;
   if(near&&(P.dashT>0||I.hit('dash'))&&P.charge>=.05){c.kick12=P.face*720;c.pushT=.3;notify12('Удар передан грузу — следуйте за ним!');P.charge=Math.min(1,P.charge+.2);}
   if(c.kick12){c.pvx=c.kick12;c.pushT=.3;c.kick12*=Math.exp(-dt*.42);if(Math.abs(c.kick12)<20)c.kick12=0;}
   for(const r of LV.ram12){if(W.flags[r.id])continue;const wall=LV.colStatic.find(s=>s.break12===r.id);if(wall&&c.x+c.w>wall.x-28&&c.x<wall.x+wall.w+28&&c.y+c.h>wall.y&&Math.abs(c.kick12||0)>170){LV.colStatic=LV.colStatic.filter(s=>s!==wall);r.broken=true;for(let n=0;n<18;n++)addP({x:wall.x,y:wall.y+rnd(0,wall.h),vx:rnd(60,340),vy:rnd(-220,100),life:1.2,size:rnd(4,13),type:'debris'});finishAction12(r.id,'Заслон пробит. Дорога для Орсо свободна.');}}
  }}
 const gliding=k===2&&I.held('warm')&&!P.onGround&&!P.rope&&!P.zip&&!P.dead;W.glide12=gliding;
 const g=PHY.G,fall=PHY.FALL;if(gliding){PHY.G=155;PHY.FALL=100;if(P.vy>100)P.vy=100;}
 // Updrafts also return a missed final bridge jump to playable height, never a softlock.
 for(const w of LV.updraft12)if(P.x>w.x&&P.x<w.x+w.w&&P.y<w.y&&P.y>w.top&&(gliding||(w.rescue&&P.y>700))){P.vy=Math.max(-290,P.vy-2300*dt);W.lift12=true;}
 // Counterweight: actual hanging tension, not pressing E on the ground.
 for(const m of LV.winches12){const a=P.rope&&P.rope.a;const taut=a&&a.winch12===m.id&&!P.onGround&&P.x>m.x+15&&P.x<m.x+m.w-15&&P.y>m.y+30&&P.rope.L>150;
  if(!m.done&&taut){m.progress=Math.min(1,m.progress+dt/.95);if(m.progress>=1){m.done=true;finishAction12(m.id,'Противовес опущен. Пролёт встал по ночному пути.');}}
  const s=LV.colStatic.find(s=>s.bridge12===m.id);if(s)s.w=Math.max(1,m.w*m.progress);
 }
 // Keep uncompleted actions BEFORE the checkpoint; no saved restart past a required action.
 const cps=LV.cps;LV.cps=cps.filter((c,i)=>i===0||k===2||Array.from({length:i},(_,j)=>j).every(j=>W.flags['A12_'+k+'_'+j]));
 const originalGoal=LV.goal;const ready=k===2||[0,1,2].every(j=>W.flags['A12_'+k+'_'+j]);if(!ready)LV.goal=null;
 try{baseStep8(dt);}finally{PHY.G=g;PHY.FALL=fall;LV.cps=cps;LV.goal=originalGoal;}
 if(gliding&&!P.dead){P.vx=clamp(P.vx+I.ax*220*dt,-365,365);P.x+=I.ax*50*dt;P.charge=Math.min(1,P.charge+dt*.2);}
 if(wasGround&&!P.onGround&&I.hit('jump')&&depart){P.vx+=depart*.8;P.lock=.16;}
 // Recharge movement tools on all safe landings: the game never asks the player to wait for energy.
 if(P.onGround){P.charge=Math.min(1,P.charge+dt*.7);P.airDash=true;}
 if(P.x>9100&&!ready&&!W.note12)notify12('Сзади остался '+(k===0?'несцепленный вагон':k===1?'целый заслон':'неопущенный противовес')+'. T — к последней безопасной точке.');
};
// Separate art path: painted material tiles and train sprite, not legacy flat service-room rectangles.
const solidOld12=drawSolid;
function material12(name,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();const im=IMG[name];if(im){const tw=220,th=124;for(let xx=x;xx<x+w;xx+=tw)for(let yy=y;yy<y+h;yy+=th)ctx.drawImage(im,xx,yy,tw,th);}ctx.restore();}
function wagon12(s){const im=IMG.wagon12;if(!im)return;const bodyH=Math.min(220,s.w*.39);ctx.drawImage(im,s.x-12,s.y-3,s.w+24,bodyH);}
drawSolid=function(s,L){if(L.rework12===undefined)return solidOld12(s,L);if(s.k==='bound')return;if(s.break12&&W.flags[s.break12])return;
 if(s.car12){wagon12(s);return;}
 const h=Math.min(s.h,VIS.y1-s.y+120);if(h<=0)return;material12(s.mat12||'iron12',s.x,s.y,s.w,h);ctx.fillStyle='rgba(5,17,20,.18)';ctx.fillRect(s.x,s.y,s.w,h);ctx.strokeStyle=s.break12?'#bc8f57':'#9aafa8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+s.w,s.y);ctx.stroke();
 if(s.break12){for(const flip of [0,1]){ctx.save();ctx.translate(s.x+(flip?s.w:0),s.y+10);ctx.rotate((flip?1:-1)*Math.atan2(s.w,s.h-20));material12('wood12',-7,0,14,Math.hypot(s.h-20,s.w));ctx.restore();}}
};
const decorOld12=drawDecor5;
drawDecor5=function(L){if(L.rework12===undefined)return decorOld12(L);const t=W.time;
 // In-world rails and attached gantries establish support, scale and direction.
 ctx.strokeStyle='#566d70';ctx.lineWidth=4;for(let x=Math.floor(VIS.x0/500)*500;x<VIS.x1;x+=500){ctx.beginPath();ctx.moveTo(x,780);ctx.lineTo(x+500,780);ctx.moveTo(x,798);ctx.lineTo(x+500,798);ctx.stroke();}
 for(const m of L.moving12){if(!inVis(m.min,1100))continue;const x=m.target+590;ctx.strokeStyle=m.locked?'#9bc8ad':'#c8a56a';ctx.lineWidth=4;ctx.strokeRect(x,548,70,25);ctx.beginPath();ctx.moveTo(x+35,500);ctx.lineTo(x+35,540);ctx.stroke();if(Math.abs(W.P.x-(m.x+310))<400){ctx.fillStyle='#e7dac2';ctx.font=`600 15px ${FONT_U}`;ctx.textAlign='center';ctx.fillText(m.locked?'СЦЕПЛЕНО':'↓ — ТОРМОЗ · СОВМЕСТИТЕ СЦЕПКУ',m.x+310,420);}}
 for(const w of L.updraft12){if(!inVis(w.x,w.w))continue;material12('iron12',w.x+20,w.y-20,w.w-40,170);ctx.strokeStyle='rgba(205,226,218,.30)';ctx.lineWidth=2;for(let a=0;a<10;a++){const x=w.x+20+(a*43)%(w.w-30),y=w.y-((t*190+a*77)%(w.y-w.top));ctx.beginPath();ctx.moveTo(x,y+20);ctx.quadraticCurveTo(x+12,y,x,y-30);ctx.stroke();}}
 for(const m of L.winches12){if(!inVis(m.x-180,850))continue;const a=L.anchors.find(a=>a.winch12===m.id);const cy=320+m.progress*180;ctx.strokeStyle='#878b79';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x,110);ctx.lineTo(a.x+270,110);ctx.lineTo(a.x+270,cy);ctx.stroke();material12('iron12',a.x+228,cy,84,120);ctx.strokeStyle='#b4a078';ctx.strokeRect(a.x+228,cy,84,120);ctx.save();ctx.translate(m.x,m.y);ctx.rotate((1-m.progress)*-.9);material12('grate12',0,0,m.w,24);ctx.restore();}
 // Far train advancing under the route: not a modal timer or instant-fail chase.
 const trainX=W.P.x-850;for(let i=0;i<4;i++){const s={x:trainX-i*260,y:900,w:245};if(inVis(s.x,s.w)){ctx.save();ctx.globalAlpha=.6;wagon12(s);ctx.restore();}}
};
const anchorOld12=drawAnchor;drawAnchor=function(a,L,target){if(L.rework12===undefined)return anchorOld12(a,L,target);ctx.save();if(!a.winch12){const supports=L.solids.filter(s=>!s.dynamic12&&!s.oneWay||s.car12&&!s.dynamic12);let best=null,dist=1e9;for(const s of supports){const xx=clamp(a.x,s.x+20,s.x+s.w-20),d=Math.abs(a.x-xx);if(d<dist&&s.w>200&&s.y<700){dist=d;best={x:xx,y:s.y};}}if(best){const top=a.y-170;material12('iron12',best.x-9,top,18,best.y-top);material12('iron12',Math.min(best.x,a.x)-10,top-10,Math.abs(best.x-a.x)+20,16);ctx.strokeStyle='#8c9180';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,top+6);ctx.lineTo(a.x,a.y-14);ctx.moveTo(best.x,top+100);ctx.lineTo(a.x,top+6);ctx.stroke();}}ctx.strokeStyle=a.winch12?'#e0bd76':'#a8c4bc';ctx.lineWidth=4;ctx.beginPath();ctx.arc(a.x,a.y,target?16:12,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#233a3c';ctx.beginPath();ctx.arc(a.x,a.y,6,0,7);ctx.fill();ctx.restore();};
const goalOld12=drawGoal;drawGoal=function(L){if(L.rework12===undefined)return goalOld12(L);const g=L.goal;if(!g)return;ctx.save();material12('iron12',g.x-30,420,60,140);ctx.fillStyle=(L.rework12===2||[0,1,2].every(j=>W.flags['A12_'+L.rework12+'_'+j]))?'#a8e1b8':'#c68564';ctx.beginPath();ctx.arc(g.x,440,10,0,7);ctx.fill();ctx.restore();};
const crateDrawOld12=drawMechFront4;
// Repaint all cargo faces after their native physics/rope outline is rendered.
const renderOld12=renderGame;renderGame=function(dt=0){renderOld12(dt);if(LV.rework12===undefined)return;camApply(W.cam);for(const c of LV.crates){material12('wood12',c.x,c.y,c.w,c.h);ctx.strokeStyle='#887455';ctx.lineWidth=4;ctx.strokeRect(c.x+2,c.y+2,c.w-4,c.h-4);}
 if(W.glide12){const P=W.P;ctx.save();ctx.beginPath();ctx.moveTo(P.x-P.face*5,P.y-54);ctx.quadraticCurveTo(P.x-P.face*48,P.y-44,P.x-P.face*94,P.y-22);ctx.quadraticCurveTo(P.x-P.face*55,P.y-13+Math.sin(W.time*12)*5,P.x-P.face*12,P.y-5);ctx.closePath();ctx.clip();material12('cloth12',P.x-95,P.y-70,190,85);ctx.fillStyle='rgba(38,74,76,.27)';ctx.fillRect(P.x-95,P.y-70,190,85);ctx.restore();}
 ctx.setTransform(RS,0,0,RS,0,0);
};
const camOld12=updateCamera;updateCamera=function(dt){if(LV.rework12===undefined)return camOld12(dt);const P=W.P,c=W.cam;const z=W.glide12||P.rope?1.02:1.18;c.z=lerp(c.z,z,1-Math.exp(-dt*3));c.x=lerp(c.x,P.x+120+P.vx*.12,1-Math.exp(-dt*7));c.y=lerp(c.y,clamp(P.y-160,300,510),1-Math.exp(-dt*4));c.x=clamp(c.x,550,LV.length-500);};
const skyOld12=drawSky,layerOld12=drawLayers;
drawSky=function(L,cam){if(L.rework12===undefined)return skyOld12(L,cam);ctx.save();const im=IMG[L.sky];const travel=L.rework12===0?W.time*10:0;drawCover(im,-45-((cam.x*.025+travel)%90),-30,1440,830,1.03,.5,.5);ctx.fillStyle='rgba(8,25,30,.10)';ctx.fillRect(0,0,1280,720);ctx.restore();};drawLayers=function(L,cam){if(L.rework12===undefined)layerOld12(L,cam);};
const hudOld12=drawHUD;
drawHUD=function(dt){if(LV.rework12===undefined)return hudOld12(dt);U.save();const k=LV.rework12;U.fillStyle='rgba(9,24,29,.88)';U.fillRect(24,20,610,76);U.fillStyle='#e9deca';U.font=`700 21px ${FONT_U}`;U.fillText(LV.name,42,49);U.font=`500 14px ${FONT_U}`;U.fillStyle='#b7d0c5';U.fillText(META12[k][2],42,77);
 U.fillStyle='rgba(12,30,34,.85)';U.fillRect(1020,22,236,62);U.fillStyle='#e0d6bd';U.font=`600 14px ${FONT_U}`;U.fillText('ПЕЧКА · РЫВОК',1035,46);U.fillStyle='#d9b674';U.fillRect(1035,59,200*W.P.charge,6);
 let txt=W.note12?.text||((W.time<16||W.P.x<1800)?META12[k][3]:'E — Клюв · Space — прыжок · Shift — рывок · T — возврат · Tab — цель');if(!VOICE.busy()||W.note12){U.font=`500 16px ${FONT_U}`;const lines=wrapText(txt,1060);const y=670-lines.length*22;U.fillStyle='rgba(8,23,28,.88)';U.fillRect(80,y-24,1120,lines.length*24+26);U.fillStyle='#e9e0ca';U.textAlign='center';lines.forEach((s,i)=>U.fillText(s,640,y+i*24));}
 if(LV.rework12===0){const m=LV.moving12.find(m=>W.P.ground===m&&!m.locked);if(m){U.textAlign='center';U.font=`700 17px ${FONT_U}`;U.fillStyle='#edcf94';U.fillText(Math.abs(m.x-m.target)<48?'СЦЕПКА РЯДОМ · ТОРМОЗИТЕ ↓':'ПОЙМАЙТЕ МЕТКУ СЦЕПКИ · ↓',640,120);}}
 U.restore();drawSubtitle(1,VH-110);};
const journalOld12=openJournal9;openJournal9=function(){if(LV.rework12===undefined)return journalOld12();W.journal9=true;journal9.querySelector('h2').textContent=LV.sub+' · '+LV.name;document.getElementById('stakes9').textContent=META12[LV.rework12][2];document.getElementById('tasks9').textContent=META12[LV.rework12][3];journal9.showModal();};
// Four actual train movement epilogues. No unrelated legacy voice or space-map overlays.
const motionOld12=screenMotion8;screenMotion8=function(dt){if(ST.li<7)return motionOld12(dt);const k=ST.li-7,L=LEVELS[ST.li];if(!ST.init){ST.init=true;VOICE.clear();VOICE.say(['r12_ep'+k],{story:1});AUD.playMusic(L.music,1);}
 ST.t+=dt;VOICE.update(dt);drawCover(IMG[L.sky],0,0,1280,720,1.04+ST.t*.002,.4,.5);
 const y=k===3?425:475;ctx.save();ctx.translate(0,y);ctx.rotate(k===3?-.035:0);ctx.strokeStyle='#8f9b8b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,74);ctx.lineTo(1280,74);ctx.stroke();for(let i=0;i<5;i++)wagon12({x:-500+ST.t*90-i*330,y:0,w:310});ctx.restore();
 const gr=ctx.createLinearGradient(0,400,0,720);gr.addColorStop(0,'rgba(7,21,26,0)');gr.addColorStop(.45,'rgba(7,21,26,.88)');gr.addColorStop(1,'rgba(7,21,26,.98)');ctx.fillStyle=gr;ctx.fillRect(0,400,1280,320);
 U.save();U.textAlign='center';U.fillStyle='#e4c18c';U.font=`700 28px ${FONT_T}`;U.fillText(['НАСОС ВЕРНУЛСЯ','ПУТЬ В ОБРЫВ','РУЧНОЙ ПЕРЕВОД','НОЧНОЙ ПУТЬ'][k],640,548);U.font=`500 20px ${FONT_U}`;U.fillStyle='#ece4d3';const ls=wrapText(LINES12['r12_ep'+k].t,1080);ls.forEach((t,i)=>U.fillText(t,640,592+i*27));U.font=`500 14px ${FONT_U}`;U.fillStyle='#aabfb4';U.fillText('Enter — продолжить',640,691);U.restore();
 if(ST.t>Math.max(15,(AUD.buf['v_r12_ep'+k]?.duration||0)+1)||(ST.t>2&&INPUT.hit('confirm'))){VOICE.clear();setState('chapterEnd',{li:ST.li,stats:ST.stats});}
};
const endOld12=screenChapterEnd;screenChapterEnd=function(dt){if(ST.li!==10)return endOld12(dt);ST.t+=dt;drawCover(IMG.switch12,0,0,1280,720);overlayDim(.58);U.save();U.textAlign='center';U.fillStyle='#f0e4ca';U.font=`700 40px ${FONT_T}`;U.fillText('Орсо на ночном пути',640,300);U.font=`500 21px ${FONT_U}`;U.fillText('На дальнем сигнале уже ждут.',640,362);U.font=`500 15px ${FONT_U}`;U.fillStyle='#b0cbbf';U.fillText('Enter — к главам · история продолжается',640,441);U.restore();if(ST.t>1.5&&(INPUT.hit('confirm')||MOUSE.click)){MOUSE.click=false;SAVE.done=false;persist();setState('chapters',{sel:10});}};
screenChapters=function(){const li=clamp(ST.sel||0,0,10);bgMenu(LEVELS[li].sky);const x=54,y=22,w=1150,h=676,cy=windowFrame('Главы',x,y,w,h,'ЛИНИЯ ЗАРИ · ПУТЬ ОРСО');const items=LEVELS.map((L,i)=>({label:L.sub+'. '+L.name,disabled:i>(SAVE.unlocked||0),note:CH_LINE[i],act:()=>{AUD.stopMusic(1);startChapter(i,0);}}));items.push({label:'Назад',act:()=>setState('menu',{sel:2})});menuList(items,x+44,cy+32,{gap:39,w:w-88,noteY:668});if(INPUT.hit('back'))setState('menu',{sel:2});};
window.__dbg.startGame=(li,cp=0)=>startGame(li,cp);
