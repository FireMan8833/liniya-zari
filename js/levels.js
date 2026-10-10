'use strict';
// ===== три главы; геометрия задаётся конструктором с проверенными «архетипами» препятствий =====
// Константы движения (см. world.js): прыжок ~122 вверх, ~225 по горизонтали; рывок +130; Клюв — 390.
function mkLevel(o){ return Object.assign({solids:[],crumbles:[],movers:[],anchors:[],zips:[],vents:[],braziers:[],sentinels:[],drones:[],icicles:[],shards:[],embers:[],cps:[],trig:[],shade:[],sunz:[],shelters:[],floes:[],wheels:[],decor:[],covers:[],crates:[],plates:[],gates:[],pulls:[],mirrors:[],receivers:[],hints:[],sand:[],shadeMov:[],npcs:[],marks:[]},o); }
const LEVELS=[];
// ---------- ГЛАВА 1: ХВОСТ ОРСО (дневная сторона, крыши ползущего города)
LEVELS.push((()=>{ const L=mkLevel({id:1,name:'Хвост Орсо',sub:'Глава I',sky:'sky1',tex:'tex1',music:'m_level',length:10650,killY:800,heat:true,train:true,
  pal:{fog:'#e0743a',fogA:0.24,amb:'#fff2e2',far:'#7a3a22',mid:'#4a2418',rim:'rgba(255,220,160,.9)',lightDir:[-0.6,-0.8]},
  wind:null,spawn:[120,560]});
  const W=(x,w,y,o={})=>L.solids.push(Object.assign({x,y,w,h:900-y,k:'wagon',wagon:true},o));
  const S=(x,y,w,h,k='crate',o={})=>L.solids.push(Object.assign({x,y,w,h,k},o));
  W(0,1000,560,{win:1}); S(500,516,64,44,'crate'); L.shade.push([0,330]); L.decor.push({k:'canopy',x:0,w:330,y:430});
  W(1110,990,540,{win:1}); L.shade.push([1150,1360]); L.decor.push({k:'canopy',x:1150,w:210,y:420});
  L.sunz.push([1420,1620]); L.vents.push({x:1760,y:540,per:2.6,on:1.1,ph:0},{x:1920,y:540,per:2.6,on:1.1,ph:1.3});
  L.embers.push([1250,500],[1520,480],[2010,500]);
  W(2240,1060,500,{win:1}); S(2700,280,120,120,'tank'); S(2930,300,80,200,'tower'); L.shards.push({id:'s1',x:2760,y:250});
  W(3400,600,560,{win:1}); L.anchors.push({x:4190,y:330}); L.embers.push([4190,420]);
  W(4380,320,540,{win:1}); for(let i=0;i<4;i++)L.crumbles.push({x:4700+i*50,y:540,w:50,h:26});
  W(4700,200,566,{noTop:1,hollow:1}); W(4900,400,540,{win:1}); L.vents.push({x:5160,y:540,per:3.2,on:1.4,ph:0,launch:1});
  S(5130,230,320,14,'boom',{oneWay:1}); L.shards.push({id:'s2',x:5400,y:200});
  W(5430,370,520,{win:1}); L.shade.push([5450,5650]); L.decor.push({k:'canopy',x:5450,w:200,y:400});
  W(6050,110,520); L.embers.push([5930,470]);
  L.anchors.push({x:6340,y:300},{x:6640,y:300});
  W(6850,560,540,{win:1});
  W(7530,270,520,{win:1}); L.crumbles.push({x:7800,y:520,w:45,h:26},{x:7845,y:520,w:45,h:26}); W(7800,90,546,{noTop:1,hollow:1}); W(7890,210,520,{win:1});
  W(8360,540,500,{win:1}); L.anchors.push({x:9080,y:290}); W(9260,450,520,{win:1}); W(9830,820,470,{loco:1});
  L.cps.push({x:120},{x:2280},{x:4420},{x:5470},{x:6890},{x:8400},{x:9870});
  L.chase={trig:7050,to:9820,speed:222,back:440};
  L.goal={x:10450,kind:'door',hold:0.6,label:'войти в кабину'};
  L.trig.push({x:160,lines:['r_start','r_start2'],tip:'move'},{x:700,tip:'jump'},{x:1300,lines:['r_heat'],tip:'heat'},{x:1680,lines:['r_vent']},
    {x:2560,tip:'wall'},{x:3700,lines:['r_grapple'],tip:'grapple'},{x:5050,tip:'launch'},{x:5520,lines:['r_pechka'],tip:'dash'},{x:6200,tip:'swing'},
    {x:7050,lines:['r_chase'],tip:'run'},{x:9870,lines:['r_chase_end']});
  return L; })());
// ---------- ГЛАВА 2: МОСТ СУМЕРЕК (терминатор, каньон, ветер)
LEVELS.push((()=>{ const L=mkLevel({id:2,name:'Мост Сумерек',sub:'Глава II',sky:'sky2',tex:'tex2',music:'m_bridge',length:8800,killY:1000,
  pal:{fog:'#6a4a8a',fogA:0.42,amb:'#d9c4e8',far:'#2a1e3a',mid:'#1c1428',rim:'rgba(255,170,140,.9)',lightDir:[-0.9,-0.3]},
  wind:{per:7.5,warn:1.6,dur:2.6,force:1300,from:1250,to:2700},spawn:[100,520]});
  const S=(x,y,w,h,k,o={})=>L.solids.push(Object.assign({x,y,w,h,k},o));
  S(0,520,500,380,'wagon',{wagon:1,win:1,loco:1}); S(640,560,660,440,'stone');
  S(1300,560,350,40,'deck'); S(1800,560,300,40,'deck'); S(2260,560,440,40,'deck');
  L.shelters.push({x:1560,w:60,h:150,y:560},{x:1960,w:60,h:150,y:560},{x:2380,w:60,h:150,y:560});
  S(2560,500,60,60,'crate'); S(2620,430,60,130,'crate'); S(2690,330,110,230,'pillar'); S(2700,230,70,14,'beam',{oneWay:1}); L.shards.push({id:'s3',x:2735,y:200});
  L.zips.push({x1:2790,y1:290,x2:3700,y2:520});
  S(3650,600,560,40,'deck'); L.anchors.push({x:4400,y:330,mx:4330,mx2:4470,per:5});
  S(4630,580,90,420,'pillar'); L.movers.push({x:4760,y:570,w:130,h:18,x2:5010,y2:570,per:5.5,k:'beam'});
  S(5150,560,330,40,'deck'); S(5630,560,270,40,'deck'); L.crumbles.push({x:5480,y:560,w:50,h:20},{x:5530,y:560,w:50,h:20},{x:5580,y:560,w:50,h:20});
  S(5900,560,900,40,'deck'); S(6950,560,990,40,'deck');
  S(6180,470,120,16,'slab'); S(6560,470,120,16,'slab'); S(7020,470,120,16,'slab'); S(7380,470,120,16,'slab'); L.shards.push({id:'s4',x:6620,y:440});
  L.drones.push({x1:6050,x2:7550,y:300,per:9});
  S(7700,300,120,160,'girderblk'); S(7940,320,80,240,'pillar');
  L.anchors.push({x:8250,y:150}); S(8460,380,340,620,'stone');
  L.cps.push({x:100},{x:680},{x:2300},{x:3700},{x:5200},{x:5950},{x:7650});
  L.goal={x:8650,kind:'lever',hold:1.4,label:'открыть путевой затвор'};
  L.trig.push({x:150,lines:['l2_a','e1','l2_b']},{x:1250,lines:['l2_wind'],tip:'wind'},{x:2560,lines:['l2_zip'],tip:'zip'},{x:3900,tip:'crane'},{x:5960,lines:['l2_drone'],tip:'drone'},{x:7600,tip:'wall'});
  return L; })());
// ---------- ГЛАВА 3: НОЧНАЯ СТОРОНА (холод, лёд, фонарщики)
LEVELS.push((()=>{ const L=mkLevel({id:3,name:'Ночная сторона',sub:'Глава III',sky:'sky3',tex:'tex3',music:'m_cold',length:9300,killY:900,cold:true,dark:true,
  pal:{fog:'#2a5a7a',fogA:0.4,amb:'#5a7aa6',far:'#0f2234',mid:'#0a1622',rim:'rgba(170,220,255,.9)',lightDir:[0.3,-1]},
  wind:{per:9,warn:1.6,dur:2.8,force:1200,from:7900,to:9100},spawn:[120,600]});
  const S=(x,y,w,h,k,o={})=>L.solids.push(Object.assign({x,y,w,h,k},o));
  S(0,600,700,300,'snow'); S(700,600,220,300,'ice',{slip:1}); S(920,600,480,300,'snow'); L.braziers.push({x:300,y:600},{x:1250,y:600});
  S(1520,560,200,340,'ruin'); S(1840,500,180,400,'ruin'); S(2140,560,180,340,'ruin'); S(2140,380,180,30,'arch',{oneWay:1});
  L.icicles.push({x:2190,y:410},{x:2270,y:410});
  S(2440,600,460,300,'snow'); S(2440,360,460,30,'arch',{oneWay:1}); L.icicles.push({x:2520,y:390},{x:2640,y:390},{x:2760,y:390}); L.anchors.push({x:2380,y:250});
  L.shards.push({id:'s5',x:2670,y:330}); L.braziers.push({x:2850,y:600});
  for(let i=0;i<5;i++)L.floes.push({x:3040+i*250,y:620,w:110,h:24}); L.water=[{x1:2900,x2:4290,y:652}];
  S(4290,600,560,300,'snow',{}); L.braziers.push({x:4380,y:600});
  S(4850,600,1600,300,'snow'); for(const x of [5050,5350,5620,5850,6100,6300])L.covers.push(x),S(x,530,64,70,'wall');
  L.sentinels.push({x:5230,y:300,base:1.57,amp:0.75,per:5.2,ph:0},{x:5980,y:290,base:1.57,amp:0.75,per:4.6,ph:2});
  S(6450,600,200,300,'snow'); L.wheels.push({cx:6880,cy:560,r:160,n:4,per:11,pw:90});
  S(7150,560,700,340,'ruin'); L.braziers.push({x:7300,y:560});
  S(7850,600,1450,300,'snow'); L.shelters.push({x:8050,w:60,h:120,y:600},{x:8420,w:60,h:120,y:600},{x:8780,w:60,h:120,y:600});
  L.braziers.push({x:8150,y:600},{x:8700,y:600}); S(8930,500,90,100,'crate'); S(8960,400,120,14,'beam',{oneWay:1}); L.shards.push({id:'s6',x:9020,y:370});
  L.cps.push({x:120},{x:1300},{x:2900},{x:4380},{x:6500},{x:7300},{x:8150});
  L.goal={x:9150,kind:'repair',hold:3,label:'починить стрелку'};
  L.trig.push({x:160,lines:['l3_a','r_cold'],tip:'cold'},{x:650,lines:['l3_ice']},{x:1900,lines:['l3_icicle']},{x:2950,tip:'floe'},{x:4700,lines:['r_sentinel'],tip:'hide'},{x:6500,tip:'wheel'},{x:8950,lines:['r_end']});
  return L; })());
// ---------- ГЛАВА 4: ЗЕРКАЛЬНЫЙ ЛЕС (Пекло, прямой путь колонистов)
LEVELS.push((()=>{ const L=mkLevel({id:4,name:'Зеркальный лес',sub:'Глава IV',sky:'sky4',tex:'tex4',music:'m_desert',length:12400,killY:900,heat:true,heatBase:0.08,cloak:true,
  pal:{fog:'#e8b07a',fogA:0.16,amb:'#fff4e0',far:'#c89a6a',mid:'#8a5e3c',rim:'rgba(255,244,214,.95)',lightDir:[0.35,-1]},
  wind:null,spawn:[120,560]});
  const S=(x,y,w,h,k,o={})=>L.solids.push(Object.assign({x,y,w,h,k},o));
  // A. Солевая равнина — обучение плащу: луч → приёмник R1 → створка G1
  S(0,560,2900,340,'salt'); L.shade.push([0,280]); L.decor.push({k:'mtower',x:120,y:560,h:430,broken:1});
  L.receivers.push({x:965,y:520,link:'G1',need:0.8}); L.gates.push({id:'G1',x:1010,y:320,w:36,h:240,dir:'up'});
  L.shade.push([1070,1330]); L.decor.push({k:'awning',x:1070,w:260,y:430}); L.embers.push([1200,500]);
  // B. Тени башен: ползущие тени, ящик на уступе (стащить Клювом), обрыв без зацепов
  L.shadeMov.push({x:1660,w:170,amp:150,per:6.5,ph:0},{x:2120,w:150,amp:130,per:5.5,ph:1.6});
  L.decor.push({k:'mtower',x:1745,y:560,h:520},{k:'mtower',x:2195,y:560,h:470});
  S(2460,380,220,24,'mtower'); L.crates.push({x:2470,y:270,w:84,h:110});
  S(2900,340,800,560,'salt',{nowall:1}); L.shade.push([3020,3200]); L.decor.push({k:'mtower',x:3110,y:340,h:380});
  // C. Лагерь зеркальщиков: Сола и выбор
  S(3700,560,1000,340,'salt'); L.shade.push([3700,4700]); L.decor.push({k:'awning',x:3760,w:880,y:400,camp:1});
  S(4400,500,80,60,'crate'); L.shards.push({id:'s7',x:4440,y:465}); L.npcs.push({k:'sola',x:4150,y:560,when:'camp'});
  // D. Пески червей: бег будит червя, на камнях можно остыть
  S(4700,580,400,320,'dune'); S(5100,550,130,350,'rock'); S(5230,580,380,320,'dune'); S(5610,550,130,350,'rock'); S(5740,580,420,320,'dune'); S(6160,550,130,350,'rock'); S(6290,580,410,320,'dune');
  L.sand.push([4700,5100,580],[5230,5610,580],[5740,6160,580],[6290,6700,580]); L.shade.push([5100,5230],[5610,5740],[6160,6290]); L.embers.push([5675,505]);
  // E. Цепь зеркал: рычаг-кольцо поворачивает нижнее зеркало; луч → M0 → M1 → M2 → R2 → мост. Затем плита с ящиком под бликом
  S(6700,560,1000,340,'salt'); L.shade.push([6720,6830]); L.decor.push({k:'mtower',x:6775,y:560,h:300,broken:1});
  L.pulls.push({x:6900,y:285,link:'M0'});
  L.mirrors.push({id:'M0',x:6990,y:520,t:'\\',alt:'/'},{id:'M1',x:6990,y:300,t:'/'},{id:'M2',x:7240,y:300,t:'\\'});
  L.receivers.push({x:7240,y:470,link:'B1',need:1.0}); L.gates.push({id:'B1',x:7700,y:560,w:250,h:22,dir:'bridge'});
  L.npcs.push({k:'sola',x:6770,y:560,when:'take'});
  L.crates.push({x:7300,y:464,w:84,h:96});
  S(7950,560,1950,340,'salt'); L.plates.push({x:8030,w:100,y:560,link:'G3'}); L.sunz.push([7990,8170]); L.gates.push({id:'G3',x:8250,y:240,w:36,h:320,dir:'up'});
  L.shade.push([8180,8250]);
  // F. Верхний маршрут для смелых: кольца и платформы, осколок s8
  L.shade.push([8560,8700],[9010,9150]); L.anchors.push({x:8450,y:260},{x:8940,y:170});
  S(8640,300,140,20,'mtower',{oneWay:1}); S(9100,280,160,20,'mtower',{oneWay:1}); L.shards.push({id:'s8',x:9190,y:245});
  // G. Солнечный прилив: тень уходит, бегом к семафору
  L.chase={trig:9450,to:11300,speed:230,back:440};
  S(10070,540,430,360,'salt'); for(let i=0;i<4;i++)L.crumbles.push({x:10500+i*50,y:540,w:50,h:26}); S(10700,520,300,380,'salt'); L.anchors.push({x:11110,y:300}); S(11170,540,1230,360,'salt'); L.shade.push([10120,10260],[10760,10900]);
  // H. Тихий финал: метка Тео и семафор прямого пути
  L.shade.push([11300,12400]); L.decor.push({k:'semaphore',x:12230,y:540}); L.marks.push({x:11700,y:540}); L.npcs.push({k:'sola',x:11830,y:540,when:'take'});
  L.views=[{x1:6700,x2:7700,cx:7080,cy:380,z:1.2}];
  L.cps.push({x:120},{x:1100},{x:2200},{x:3020},{x:3760},{x:4600},{x:5650},{x:6750},{x:7400},{x:8320},{x:9300},{x:10120},{x:11350});
  L.goal={x:12150,kind:'repair',hold:2,label:'запустить семафор прямого пути',sem:1};
  L.trig.push({x:150,lines:['l4_a','l4_b'],tip:'heat4'},{x:520,lines:['l4_cloak'],tip:'cloak'},{x:1400,lines:['l4_shade'],tip:'shademov'},{x:2280,lines:['l4_crate'],tip:'drag'},{x:2600,tip:'crateshade'},
    {x:3900,lines:['l4_sola1','l4_sola2','l4_sola3']},{x:4000,choice:true},{x:4720,linesBy:{take:['l4_worm_s'],stay:['l4_worm_i']},tip:'worm'},{x:5000,tip:'sneak'},
    {x:6750,linesBy:{take:['l4_mirror_s'],stay:['l4_mirror_i']},tip:'mirror'},{x:6860,tip:'pull'},{x:7960,lines:['l4_plate'],tip:'plate'},{x:9450,lines:['l4_tide'],tip:'tide'},
    {x:11650,linesBy:{take:['l4_teo','l4_sola_end'],stay:['l4_teo']}});
  return L; })());
// ---------- ГЛАВА 5: САНГРА (мёртвый город-ковчег, Мара, Смотритель Вейл, три предохранителя)
LEVELS.push((()=>{ const L=mkLevel({id:5,name:'Сангра',sub:'Глава V',sky:'sky5',tex:'tex5',music:'m_city',length:24000,killY:900,cloak:true,litOnly:true,mech:true,
  pal:{fog:'#5a4a7a',fogA:0.3,amb:'#e0d4f0',far:'#3a2c4a',mid:'#241a30',rim:'rgba(150,230,220,.9)',lightDir:[-0.5,-0.8]},
  wind:null,spawn:[120,560],views:[]});
  const S=(x,y,w,h,k='hull',o={})=>L.solids.push(Object.assign({x,y,w,h,k},o)); const V=(x1,x2,cx,cy,z)=>L.views.push({x1,x2,cx,cy,z});
  const D=(k,x,y,o={})=>L.decor.push(Object.assign({k,x,y},o));
  // A. Прибытие: окраина мёртвого города, метка Тео
  S(0,560,1800,340); S(560,516,64,44,'crate'); S(1150,470,260,90); L.marks.push({x:900,y:560}); L.shards.push({id:'s10',x:1290,y:430});
  D('chimney',300,560,{h:300}); D('glamp',700,560,{off:1}); D('chimney',1620,560,{h:380}); D('sign',1000,420,{t:'САНГРА · 7-Й ВОКЗАЛ'});
  // B. Шлюз: кольцо открывает ворота; грузовой лифт везёт ящик и Ирму наверх; ящик на плиту — вторые ворота
  S(1800,560,1400,340); L.pulls.push({x:2060,y:250,link:'G1'}); L.gates.push({id:'G1',x:2150,y:240,w:36,h:320,dir:'up'}); V(1850,2300,2080,400,1.3);
  L.crates.push({x:2560,y:464,w:84,h:96}); L.gates.push({id:'LF1',x:3060,y:560,w:140,h:300,dir:'lift',cargo:1,spd:0.32});
  S(3200,260,760,640,'hull',{nowall:1}); L.plates.push({x:3420,w:100,y:260,link:'G2'}); L.gates.push({id:'G2',x:3800,y:20,w:36,h:240,dir:'up'});
  V(2330,3300,2900,370,1.2); V(3300,3960,3560,230,1.25); D('chimney',3600,260,{h:200});
  // C. Паровые кварталы: выбросы пара по ритму, клапан-катапульта, движущаяся балка, хрупкий настил
  S(3960,420,190,480); S(4150,560,900,340); L.vents.push({x:4400,y:560,per:2.4,on:1.0,ph:0},{x:4620,y:560,per:2.4,on:1.0,ph:0.8},{x:4840,y:560,per:2.4,on:1.0,ph:1.6},{x:5010,y:560,per:2.4,on:1.1,ph:0,launch:1});
  S(4960,300,440,16,'grate',{oneWay:1}); L.vents.push({x:5230,y:300,per:2.2,on:0.8,ph:0.5}); L.movers.push({x:5420,y:300,w:120,h:18,x2:5640,y2:300,per:4.5,k:'beam'});
  S(5780,300,70,600,'tower'); for(let i=0;i<4;i++)L.crumbles.push({x:5850+i*50,y:300,w:50,h:22}); D('pipes',4150,560,{w:900}); V(4900,5800,5330,360,1.2);
  // D. Фонари Гильдии: прожекторы и дрон-фонарь; укрытия
  S(6050,560,2430,340); for(const x of [6420,6720,6990,7220,7470,7700])S(x,490,64,70,'cover5');
  L.sentinels.push({x:6600,y:300,base:1.57,amp:0.75,per:5.2,ph:0},{x:7350,y:290,base:1.57,amp:0.75,per:4.6,ph:2});
  L.drones.push({x1:7850,x2:8400,y:300,per:8}); S(7980,440,120,14,'slab'); S(8230,440,120,14,'slab'); L.shards.push({id:'s9',x:7530,y:520});
  D('glamp',6200,560); D('glamp',7900,560); D('chimney',6900,560,{h:260});
  // E. Световой узел: учебный колодец → приёмник → заслонка; затем ящик на плиту, кольцо-зеркало, луч → мост
  L.litOnly=true; S(8480,560,1420,340); L.sunz.push([8560,8660]); L.receivers.push({x:8880,y:520,link:'G4',need:0.7}); L.gates.push({id:'G4',x:8920,y:320,w:36,h:240,dir:'up'}); V(8480,8960,8730,420,1.3);
  L.crates.push({x:9060,y:464,w:84,h:96}); L.plates.push({x:9180,w:100,y:560,link:'G5'}); L.sunz.push([9310,9410]);
  L.gates.push({id:'G5',x:9480,y:400,w:36,h:160,dir:'up'}); L.mirrors.push({id:'M5a',x:9640,y:520,t:'/'},{id:'M5b',x:9640,y:260,t:'\\',alt:'/'}); L.pulls.push({x:9560,y:230,link:'M5b'});
  L.receivers.push({x:9850,y:260,link:'B5',need:1.0}); L.gates.push({id:'B5',x:9900,y:560,w:260,h:22,dir:'bridge'}); V(8960,9900,9500,390,1.2);
  L.hints.push({done:'B5',x1:8960,x2:9920,pts:[[9370,520],[9640,520],[9640,260],[9850,260]]});
  // F. Лагерь Мары и колёса Хребта
  S(10160,560,700,340); L.npcs.push({k:'mara',x:10560,y:560}); D('forge',10620,560); D('glamp',10300,560);
  L.wheels.push({cx:11090,cy:560,r:160,n:4,per:11,pw:90}); S(11360,560,200,340); L.wheels.push({cx:11790,cy:560,r:160,n:4,per:-9,pw:90});
  S(12060,560,200,340); L.anchors.push({x:12510,y:300}); S(12740,560,560,340); D('chimney',12950,560,{h:320});
  // G. Затопленное депо: тонущие понтоны и канатка
  L.water=[{x1:13300,x2:15660,y:612}]; for(let i=0;i<5;i++)L.floes.push({x:13440+i*230,y:580,w:110,h:24}); L.npcs.push({k:'mara',x:13180,y:560});
  S(14560,560,300,340); S(14720,470,140,90,'crate'); L.zips.push({x1:14850,y1:430,x2:15700,y2:520}); S(15650,560,4250,340);
  // H. Три предохранителя: F1 — ящик с полки на плиту; F2 — ящик на лифте на верхнюю плиту; F3 — кольцо открывает шторку, луч в приёмник
  L.npcs.push({k:'mara',x:16120,y:560}); D('glamp',15800,560);
  S(16500,380,220,24,'beam'); S(16735,470,100,14,'grate',{oneWay:1}); L.crates.push({x:16560,y:270,w:84,h:110}); L.plates.push({x:16880,w:100,y:560,link:'F1'}); D('fuse',16930,450,{id:'F1',n:'I'}); V(16300,17150,16720,400,1.25);
  L.crates.push({x:17400,y:464,w:84,h:96}); L.gates.push({id:'LF2',x:17700,y:560,w:140,h:220,dir:'lift',cargo:1,spd:0.36}); S(17840,340,420,560,'hull',{nowall:1});
  L.plates.push({x:18080,w:100,y:340,link:'F2'}); D('fuse',18130,230,{id:'F2',n:'II'}); V(17150,18300,17760,360,1.2);
  L.sunz.push([18400,18500]); L.mirrors.push({id:'MF',x:18800,y:520,t:'/'}); L.gates.push({id:'SH3',x:18780,y:330,w:40,h:110,dir:'up'}); L.pulls.push({x:18640,y:250,link:'SH3'});
  L.receivers.push({x:18800,y:190,link:'F3',need:1.0}); D('fuse',18870,150,{id:'F3',n:'III'});
  L.gates.push({id:'GF',x:19200,y:240,w:40,h:320,dir:'up',all:['F1','F2','F3']}); V(18300,19260,18820,350,1.2);
  L.hints.push({done:'F3',x1:18300,x2:19200,pts:[[18460,520],[18800,520],[18800,190]]});
  // I. Продувка: Вейл пускает пар по линии — бегом
  L.chase={trig:19560,to:22350,speed:225,back:440};
  S(20010,540,550,360); for(let i=0;i<4;i++)L.crumbles.push({x:20560+i*50,y:540,w:50,h:26}); S(20760,520,340,380); L.anchors.push({x:21270,y:300}); S(21440,540,320,360);
  L.vents.push({x:21700,y:540,per:2.0,on:1.0,ph:0,launch:1}); S(21800,330,220,16,'grate',{oneWay:1}); S(21760,540,2240,360);
  // J. Сердце Хребта
  L.npcs.push({k:'mara',x:23330,y:540}); D('heart',23760,540); D('glamp',22700,540); D('glamp',23100,540);
  L.cps.push({x:120},{x:1900},{x:2450},{x:3300},{x:4200},{x:5100},{x:6150},{x:7100},{x:7900},{x:8500},{x:9000},{x:10250},{x:11400},{x:12100},{x:12800},{x:14600},{x:15750},{x:16300},{x:17200},{x:18320},{x:19300},{x:20850},{x:21500},{x:22500});
  L.goal={x:23620,kind:'repair',hold:2.5,label:'запустить сердце Хребта',fin:['l5_end2','l5_teo']};
  L.trig.push({x:150,lines:['l5_a','l5_b'],tip:'city5'},{x:1900,lines:['l5_gate'],tip:'pull5'},{x:2450,lines:['l5_lift'],tip:'lift5'},{x:3330,tip:'plate'},
    {x:4200,lines:['l5_steam'],tip:'steam5'},{x:4950,tip:'launch'},{x:6100,lines:['l5_lamp']},{x:6300,lines:['l5_hide'],tip:'hide'},{x:7850,tip:'drone'},
    {x:8480,lines:['l5_light'],tip:'light5'},{x:9000,linesBy:{take:['l5_sola_s'],stay:['l5_sola_i']},tip:'light5b'},
    {x:10300,linesBy:{take:['l5_mara1','l5_mara2','l5_mara3','l5_sola_m','l5_mara4','l5_mara5'],stay:['l5_mara1','l5_mara2','l5_mara3','l5_mara4','l5_mara5']}},{x:10870,lines:['l5_wheel'],tip:'wheel'},{x:12280,tip:'swing'},
    {x:13150,lines:['l5_depot'],tip:'floe5'},{x:14650,tip:'zip'},{x:16150,lines:['l5_fuse'],tip:'fuse5'},{x:16400,tip:'drag'},{x:17250,tip:'lift5'},{x:18330,tip:'fuse3'},
    {x:19560,lines:['l5_purge','l5_run'],tip:'run'},{x:23200,lines:['l5_end']});
  return L; })());
const TIPS={move:[['A','D'],'бег'],jump:[['Пробел'],'прыжок — держите, чтобы прыгнуть выше'],heat:[[],'Прямое солнце перегревает костюм. Держитесь в тени'],
  wall:[['Пробел'],'у стены — прыжок от стены. Поднимайтесь «ёлочкой»'],grapple:[['E'],'Клюв: держите у кольца, раскачивайтесь A/D'],launch:[[],'Клапан-катапульта подбросит вверх'],
  dash:[['Shift'],'термо-рывок — тратит заряд Печки'],swing:[['W','S'],'на тросе — подтянуться / отпустить трос. Прыжок — сорваться с ускорением'],run:[[],'БЕГИТЕ!'],
  wind:[[],'Порывы ветра сдувают. Прячьтесь за опорами'],zip:[['E'],'у троса канатки — скольжение. Прыжок — спрыгнуть'],crane:[[],'Крюк крана движется — ловите момент'],
  drone:[[],'Фонарщик выжигает лучом. Укрывайтесь под плитами'],cold:[['Q'],'обогрев от Печки. Жаровни согревают и заряжают Печку'],floe:[[],'Льдины тонут под весом — не задерживайтесь'],
  hide:[[],'Прожектор не видит сквозь стены. Двигайтесь в тени укрытий'],wheel:[[],'Шестерня поворачивается — ступайте на платформы'],
  heat4:[[],'Пекло: перегрев идёт даже на ровном свету. Тень — единственный отдых'],cloak:[['Q','W'],'плащ: светлой стороной к солнцу — луч. A/D — поворот, W — выше'],
  shademov:[[],'Тени башен ползут — двигайтесь вместе с ними'],drag:[['E','←→'],'Клюв цепляет ящик: держите E и идите стрелками (или A/D) от ящика — он поедет за вами'],
  crateshade:[[],'Ящик отбрасывает тень. Его можно толкать — подойдите и идите на него'],sneak:[['S'],'держите S — идти тихо, пригнувшись'],
  worm:[[],'Бег и жар будят червя. Шкала вибрации — внизу. Остывайте на камнях'],mirror:[['E','Q'],'E — Клювом дёрнуть кольцо (нижнее зеркало повернётся). Затем Q, лицом вправо: свет пойдёт по пунктиру на приёмник — и выдвинется мост'],
  pull:[['E'],'Клюв дёргает рычаги-кольца издалека'],plate:[[],'Плита держит створку, пока на ней груз'],tide:[[],'СОЛНЕЧНЫЙ ПРИЛИВ — БЕГИТЕ!'],
  city5:[[],'Бирюзовые метки Тео ведут вперёд'],pull5:[['E'],'кольцо над воротами — Клюв дёрнет рычаг'],
  lift5:[['→'],'закатите ящик на лифт и встаньте рядом — поедете вместе'],
  steam5:[[],'Пар бьёт по ритму — проходите в паузах'],
  light5:[['Q'],'плащ отражает свет только в столбе света'],
  light5b:[['E','Q'],'ящик на плиту → E по кольцу → Q из столба света'],
  floe5:[[],'Понтоны тонут — не задерживайтесь'],
  fuse5:[[],'Зажгите три лампы: I и II — ящики на плиты, III — луч'],
  fuse3:[['E','Q'],'E — кольцо поднимет шторку, затем Q из столба света']};
const SHARDS={s1:'Бортовой журнал «Зари»',s2:'Записка путейца',s3:'Устав Гильдии Фонарщиков',s4:'Детская считалка Орсо',s5:'Журнал «Зари», последняя запись',s6:'Пометка на полях',s7:'Журнал зеркальщиков',s8:'Расписка Гильдии',s9:'Приказ №40',s10:'Записка Тео'};
if(typeof module!=='undefined')module.exports={LEVELS,TIPS,SHARDS};
