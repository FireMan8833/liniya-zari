'use strict';
// ===== WebGL2 постобработка: тепловое марево, ударные волны, хроматическая аберрация,
// bloom (dual-filter), объёмные лучи от солнца, кино-тонмаппинг, грейдинг, виньетка, зерно =====
// Дисторсия: канвас DCV (1/4 разрешения). R — «высота» линзы (градиент = смещение), G — маска марева.
const DCV=document.createElement('canvas'); DCV.width=320; DCV.height=180; const DX=DCV.getContext('2d');
const FX={bloom:0.55,thr:0.62,heat:0,ca:0.0015,vign:0.38,grain:0.045,rays:0,sun:[0.2,0.2],sunCol:[1,0.8,0.55],exposure:1,
  lift:[0,0,0],gamma:[1,1,1],gain:[1,1,1],sat:1,flash:0,fade:0,shadowTint:[0,0,0],hiTint:[0,0,0],dist:1,time:0};
function fxReset(){ Object.assign(FX,{bg:0,lit:0,bloom:0.5,thr:0.66,heat:0,ca:0.0012,vign:0.35,grain:0.04,rays:0,exposure:1,lift:[0,0,0],gamma:[1,1,1],gain:[1,1,1],sat:1,flash:0,fade:0,shadowTint:[0,0,0],hiTint:[0,0,0],dist:0}); }
// рисование в карту дисторсии (мировые координаты переводятся вызывающим кодом в экранные 0..VW)
function distBegin(){ DX.setTransform(1,0,0,1,0,0); DX.globalCompositeOperation='source-over'; DX.fillStyle='#000'; DX.fillRect(0,0,320,180); DX.globalCompositeOperation='lighter'; DX.setTransform(320/VW,0,0,180/VH,0,0); }
const DSPR=(()=>{ const mk=(fn)=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const d=g.createImageData(128,128);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){const u=(x-63.5)/64,v=(y-63.5)/64,r=Math.sqrt(u*u+v*v);const [R,G]=fn(r);const i=(y*128+x)*4;d.data[i]=R;d.data[i+1]=G;d.data[i+2]=0;d.data[i+3]=255;}
  g.putImageData(d,0,0);return c;};
  return { lens:mk(r=>[r<1?255*Math.pow(Math.cos(r*Math.PI/2),2):0,0]),
    ring:mk(r=>[r<1?255*Math.max(0,Math.sin(clamp((r-0.55)/0.45,0,1)*Math.PI)):0,0]),
    heat:mk(r=>[0,r<1?255*Math.pow(1-r,1.5):0]) }; })();
function distLens(x,y,r,a=1){ DX.globalAlpha=clamp(a,0,1); DX.drawImage(DSPR.lens,x-r,y-r,r*2,r*2); DX.globalAlpha=1; }
function distRing(x,y,r,a=1){ DX.globalAlpha=clamp(a,0,1); DX.drawImage(DSPR.ring,x-r,y-r,r*2,r*2); DX.globalAlpha=1; }
function distHeat(x,y,rx,ry,a=1){ DX.globalAlpha=clamp(a,0,1); DX.drawImage(DSPR.heat,x-rx,y-ry,rx*2,ry*2); DX.globalAlpha=1; }
function distHeatRect(x,y,w,h,a=1){ DX.globalAlpha=clamp(a,0,1); const g=DX.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.5,'rgb(0,255,0)'); g.addColorStop(1,'rgba(0,0,0,0)'); DX.fillStyle=g; DX.fillRect(x,y,w,h); DX.globalAlpha=1; }

// Параметры GPU-фона (небо, солнце, сияние, звёзды, облака, параллакс, дымка, лучи) — заполняются render_bg.js
const BGP={on:0,sky:null,skyR:[0,0,1280,720],far:null,mid:null,farR:[0,0,1,1],midR:[0,0,1,1],sun:[0,0],lid:1,t:0,camx:0,pul:1,fogC:[0,0,0],fogA:0,cloudA:0.2,g1c:[1,1,1],g1r:260,g1a:0.3,shC:[1,1,1],shA:1};
const POST=(()=>{
  const gl=screenCv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance',desynchronized:true});
  const P={ok:false,resize(){},render(){}};
  if(!gl){ console.warn('WebGL2 недоступен — без постобработки'); const c2=screenCv.getContext('2d');
    P.render=()=>{ c2.fillStyle='#000'; c2.fillRect(0,0,screenCv.width,screenCv.height); c2.drawImage(scv,0,0,screenCv.width,screenCv.height); }; return P; }
  const VS=`#version 300 es
  in vec2 p; out vec2 uv; void main(){ uv=p*0.5+0.5; gl_Position=vec4(p,0.,1.); }`;
  const H=`#version 300 es
  precision highp float; in vec2 uv; out vec4 o;`;
  const SRC={
   bg:H+`uniform sampler2D SKY,FAR,MID,CLD; uniform vec4 skyR,farR,midR; uniform vec2 sun; uniform float lid,t,camx,pul,fogA,cloudA,g1r,g1a,shA; uniform vec3 fogC,g1c,shC;
    float ga(float r){ r=clamp(r,0.,1.); return r<.25? mix(1.,.45,r/.25) : .45*(1.-(r-.25)/.75); }
    float hash(vec2 q){ q=fract(q*vec2(123.34,456.21)); q+=dot(q,q+45.32); return fract(q.x*q.y); }
    vec4 strip(sampler2D T, vec4 R, vec2 p){ vec2 u=(p-R.xy)/R.zw; if(u.x<0.||u.x>1.||u.y<0.||u.y>1.) return vec4(0.); return texture(T,u); }
    void main(){ vec2 p=vec2(uv.x,1.-uv.y)*vec2(1280.,720.);
      vec3 c=texture(SKY,(p-skyR.xy)/skyR.zw).rgb;
      if(lid<2.5||lid>3.5){ float d=length(p-sun); c+=g1c*g1a*ga(d/(g1r*pul))+vec3(1.,.7,.35)*0.1*ga(d/600.); }
      else { for(int i=0;i<3;i++){ float fi=float(i); float yy=120.+fi*60.; float top=yy+sin(p.x*0.006+t*0.35+fi)*40.; float bot=yy+70.+sin(p.x*0.005+t*0.3+fi*1.7)*50.;
        float m=smoothstep(top-6.,top+10.,p.y)*(1.-smoothstep(bot-14.,bot+6.,p.y)); float gr=max(0.,1.-abs(p.y-yy)/60.);
        c+=(i==1?vec3(.67,.43,1.):vec3(.31,1.,.7))*(0.05+0.04*sin(t*0.6+fi*2.))*m*gr; } }
      if(lid>1.5&&lid<3.5&&p.y<330.){ vec2 cell=floor(p/36.); float h=hash(cell); if(h>0.72){ vec2 sp=(cell+vec2(hash(cell+1.3),hash(cell+2.7)))*36.; float s=0.5+0.9*hash(cell+5.1); vec2 dd=abs(p-sp);
        if(dd.x<s&&dd.y<s){ float tw=0.25+0.5*abs(sin(t*1.5+h*40.)); if(lid<2.5) tw*=clamp((p.x/1280.-0.3)*2.,0.,1.); c+=vec3(tw); } } }
      for(int i=0;i<4;i++){ float fi=float(i); float y0=170.+fi*70.; float hh=140.+fi*20.; if(p.y>=y0&&p.y<y0+hh){ float x0=-mod(camx*0.03*(fi+1.)+t*(6.+fi*5.),1024.);
        float a=texture(CLD,vec2((p.x-x0)/1024.,(p.y-y0)/hh)).a; c=mix(c,vec3(1.),a*cloudA); } }
      vec4 f=strip(FAR,farR,p); c=c*(1.-f.a)+f.rgb;
      float k=clamp((p.y-300.)/420.,0.,1.); float fa=k<.6?mix(0.,fogA*.5,k/.6):mix(fogA*.5,fogA*.8,(k-.6)/.4); c=mix(c,fogC,fa);
      f=strip(MID,midR,p); c=c*(1.-f.a)+f.rgb;
      k=clamp((p.y-360.)/360.,0.,1.); c=mix(c,fogC,fogA*.55*k);
      if(lid<2.5||lid>3.5){ vec2 d=p-sun; float L=length(d); float an=atan(d.y,d.x); float acc=0.;
        for(int i=0;i<7;i++){ float fi=float(i); float ai=0.35+fi*0.13+sin(t*0.2+fi)*0.03; float df=abs(an-ai); float m=1.-smoothstep(0.022,0.045,df);
          acc+=m*max(0.,1.-L*cos(df)/1500.)*(0.04+0.03*sin(t*0.7+fi*1.7)); }
        c+=shC*acc*shA; }
      o=vec4(c,1.); }`,
   comp:H+`uniform sampler2D S,D,BG,LT; uniform vec2 dpx; uniform float heat,ca,t,dist,bgOn,lit;
    float n2(vec2 q){ return sin(q.x*31.0+t*3.1)*sin(q.y*23.0-t*4.3)+sin((q.x+q.y)*17.0+t*2.3)*0.6; }
    vec4 dt(vec2 q){ return texture(D,vec2(q.x,1.-q.y)); }
    vec3 smp(vec2 q){ vec4 s=texture(S,vec2(q.x,1.-q.y)); vec3 b=bgOn>0.5?texture(BG,q).rgb:vec3(0.); return b*(1.-s.a)+s.rgb; }
    void main(){ vec2 d=vec2(0.);
      if(dist>0.||heat>0.){ float hx=dt(uv+vec2(dpx.x,0.)).r-dt(uv-vec2(dpx.x,0.)).r; float hy=dt(uv+vec2(0.,dpx.y)).r-dt(uv-vec2(0.,dpx.y)).r;
        d+=vec2(hx,hy)*0.045*dist;
        float m=dt(uv).g*dist+heat; vec2 q=uv*vec2(1.,0.6);
        d+=vec2(n2(q*1.3),n2(q*1.7+3.1))*0.0022*m; }
      vec2 cc=uv-0.5; float r2=dot(cc,cc); vec2 off=cc*ca*(1.0+r2*4.0);
      vec3 col; if(ca>0.0004){ col.r=smp(uv+d+off).r; col.g=smp(uv+d).g; col.b=smp(uv+d-off).b; } else col=smp(uv+d);
      if(lit>0.5) col*=texture(LT,vec2(uv.x,1.-uv.y)).rgb;
      o=vec4(col,1.); }`,
   bright:H+`uniform sampler2D S; uniform float thr; uniform vec2 px;
    void main(){ vec3 c=(texture(S,uv+px*vec2(-1,-1)).rgb+texture(S,uv+px*vec2(1,-1)).rgb+texture(S,uv+px*vec2(-1,1)).rgb+texture(S,uv+px*vec2(1,1)).rgb)*0.25;
      float l=max(c.r,max(c.g,c.b)); float k=clamp((l-thr)/(1.0-thr+1e-4),0.,1.); k=k*k*(3.0-2.0*k); o=vec4(c*k,1.); }`,
   down:H+`uniform sampler2D S; uniform vec2 px;
    void main(){ vec3 c=texture(S,uv).rgb*4.0+texture(S,uv-px).rgb+texture(S,uv+px).rgb+texture(S,uv+vec2(px.x,-px.y)).rgb+texture(S,uv-vec2(px.x,-px.y)).rgb; o=vec4(c/8.0,1.); }`,
   up:H+`uniform sampler2D S,B; uniform vec2 px; uniform float w;
    void main(){ vec3 c=texture(S,uv+vec2(-px.x*2.,0.)).rgb+texture(S,uv+vec2(-px.x,px.y)).rgb*2.+texture(S,uv+vec2(0.,px.y*2.)).rgb+texture(S,uv+px).rgb*2.
      +texture(S,uv+vec2(px.x*2.,0.)).rgb+texture(S,uv+vec2(px.x,-px.y)).rgb*2.+texture(S,uv+vec2(0.,-px.y*2.)).rgb+texture(S,uv-px).rgb*2.;
      o=vec4(c/12.0+texture(B,uv).rgb*w,1.); }`,
   rays:H+`uniform sampler2D S; uniform vec2 sun;
    void main(){ vec2 dlt=(uv-sun)*(1.0/24.0)*0.9; vec2 c=uv; float il=1.0; vec3 acc=vec3(0.);
      for(int i=0;i<24;i++){ c-=dlt; acc+=texture(S,c).rgb*il; il*=0.94; } o=vec4(acc/24.0*1.25,1.); }`,
   fin:H+`uniform sampler2D A,Bl,R; uniform float bloom,rays,exposure,sat,vign,grain,t,flash,fade; uniform vec3 lift,gam,gain,sunCol,shT,hiT; uniform vec2 res;
    float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
    void main(){ vec3 c=texture(A,uv).rgb; vec3 b=texture(Bl,uv).rgb; vec3 r=rays>0.?texture(R,uv).rgb:vec3(0.);
      c+=b*bloom+r*rays*sunCol;
      c*=exposure;
      c=c/(1.0+max(vec3(0.),c-0.8)*0.55);
      c=pow(max(c,0.),1.0/gam); c=c*gain+lift*(1.0-c);
      float l=dot(c,vec3(0.2126,0.7152,0.0722)); c=mix(vec3(l),c,sat);
      c+=shT*(1.0-smoothstep(0.0,0.5,l))+hiT*smoothstep(0.5,1.0,l);
      vec2 q=uv-0.5; q.x*=res.x/res.y; c*=1.0-vign*smoothstep(0.35,1.05,length(q)*1.2);
      c+=(hash(floor(uv*res*0.5)+fract(t*7.0)*100.0)-0.5)*grain;
      c=mix(c,vec3(1.,0.97,0.92),flash); c*=1.0-fade;
      o=vec4(clamp(c,0.,1.),1.); }`
  };
  function sh(type,src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)); return s; }
  const vs=sh(gl.VERTEX_SHADER,VS); const PR={};
  for(const k in SRC){ const p=gl.createProgram(); gl.attachShader(p,vs); gl.attachShader(p,sh(gl.FRAGMENT_SHADER,SRC[k])); gl.bindAttribLocation(p,0,'p'); gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)); p.u={}; const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
    for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i); p.u[a.name]=gl.getUniformLocation(p,a.name);} PR[k]=p; }
  const vb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vb); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  function tex(w,h,wrap){ const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,wrap?gl.REPEAT:gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    if(w)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null); return t; }
  function fbo(w,h){ const t=tex(w,h); const f=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,f); gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0); return {t,f,w,h}; }
  // загрузка канвасов без переворота (переворот — в шейдере) и с premultiplied alpha: быстрый GPU→GPU путь в Chromium
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  const MAXT=gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const sceneT=tex(), distT=tex(), lightT=tex(); let T={};
  const STATIC=new Map(); // статичные текстуры (небо, параллакс-полосы, облака) — загружаются один раз
  function staticTex(src,wrap){ if(!src)return null; let t=STATIC.get(src); if(t)return t; let s=src;
    if(src.width>MAXT){ const c=document.createElement('canvas'); c.width=MAXT; c.height=src.height; c.getContext('2d').drawImage(src,0,0,MAXT,src.height); s=c; }
    t=tex(0,0,wrap); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,s); STATIC.set(src,t); return t; }
  P.preload=(list)=>{ for(const s of list) staticTex(s); };
  P.resize=()=>{ const W=scv.width,Hh=scv.height; for(const k in T){ const o=T[k]; if(Array.isArray(o))o.forEach(x=>{gl.deleteTexture(x.t);gl.deleteFramebuffer(x.f);}); else {gl.deleteTexture(o.t);gl.deleteFramebuffer(o.f);} }
    const lo=SETTINGS.fx==='min'||SETTINGS.fx==='low'; T={A:fbo(W,Hh),BG:lo?fbo(W>>1,Hh>>1):fbo(W,Hh),br:fbo(W>>1,Hh>>1),dn:[],upc:[],rays:fbo(W>>2,Hh>>2)};
    let w=W>>1,h=Hh>>1; for(let i=0;i<5;i++){ w=Math.max(1,w>>1); h=Math.max(1,h>>1); T.dn.push(fbo(w,h)); T.upc.push(fbo(w,h)); } };
  const blackT=tex(1,1);
  P.resize();
  function use(p,target,texs){ gl.useProgram(p); if(target){gl.bindFramebuffer(gl.FRAMEBUFFER,target.f); gl.viewport(0,0,target.w,target.h);} else {gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,screenCv.width,screenCv.height);}
    let i=0; for(const n in texs){ gl.activeTexture(gl.TEXTURE0+i); gl.bindTexture(gl.TEXTURE_2D,texs[n]); gl.uniform1i(p.u[n],i); i++; } }
  const draw=()=>gl.drawArrays(gl.TRIANGLES,0,3);
  const u1=(p,n,v)=>{ if(p.u[n])gl.uniform1f(p.u[n],v); }, u2=(p,n,a,b)=>{ if(p.u[n])gl.uniform2f(p.u[n],a,b); }, u3=(p,n,v)=>{ if(p.u[n])gl.uniform3fv(p.u[n],v); }, u4=(p,n,v)=>{ if(p.u[n])gl.uniform4fv(p.u[n],v); };
  let cloudT=null;
  P.render=()=>{ const W=scv.width,Hh=scv.height; gl.bindVertexArray(vao);
    gl.bindTexture(gl.TEXTURE_2D,sceneT); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,scv);
    const useDist=FX.dist>0||FX.heat>0; if(useDist){ gl.bindTexture(gl.TEXTURE_2D,distT); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,DCV); }
    const bgOn=FX.bg&&BGP.sky; let p;
    if(bgOn){ if(!cloudT)cloudT=staticTex(CLOUD,true);
      p=PR.bg; use(p,T.BG,{SKY:staticTex(BGP.sky),FAR:staticTex(BGP.far),MID:staticTex(BGP.mid),CLD:cloudT});
      u4(p,'skyR',BGP.skyR); u4(p,'farR',BGP.farR); u4(p,'midR',BGP.midR); u2(p,'sun',BGP.sun[0],BGP.sun[1]); u1(p,'lid',BGP.lid); u1(p,'t',BGP.t); u1(p,'camx',BGP.camx); u1(p,'pul',BGP.pul);
      u1(p,'fogA',BGP.fogA); u3(p,'fogC',BGP.fogC); u1(p,'cloudA',BGP.cloudA); u3(p,'g1c',BGP.g1c); u1(p,'g1r',BGP.g1r); u1(p,'g1a',BGP.g1a); u3(p,'shC',BGP.shC); u1(p,'shA',BGP.shA); draw(); }
    const lit=FX.lit; if(lit){ gl.bindTexture(gl.TEXTURE_2D,lightT); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,LIGHT); }
    p=PR.comp; use(p,T.A,{S:sceneT,D:distT,BG:T.BG.t,LT:lightT}); u2(p,'dpx',1.5/320,1.5/180); u1(p,'heat',FX.heat); u1(p,'ca',FX.ca); u1(p,'t',FX.time); u1(p,'dist',useDist?FX.dist:0); u1(p,'bgOn',bgOn?1:0); u1(p,'lit',lit?1:0); draw();
    const fast=SETTINGS.fx==='min'; let levels=5, cur=null;
    if(!fast){ p=PR.bright; use(p,T.br,{S:T.A.t}); u1(p,'thr',FX.thr); u2(p,'px',0.5/W,0.5/Hh); draw();
    levels=SETTINGS.fx==='low'?3:5; let src=T.br; for(let i=0;i<levels;i++){ const d=T.dn[i]; p=PR.down; use(p,d,{S:src.t}); u2(p,'px',1/src.w,1/src.h); draw(); src=d; }
    cur=T.dn[levels-1];
    for(let i=levels-2;i>=0;i--){ const tgt=T.upc[i]; p=PR.up; use(p,tgt,{S:cur.t,B:T.dn[i].t}); u2(p,'px',0.5/cur.w,0.5/cur.h); u1(p,'w',1.0); draw(); cur=tgt; }
    } else cur={t:blackT};
    if(FX.rays>0&&!fast){ p=PR.rays; use(p,T.rays,{S:T.br.t}); u2(p,'sun',FX.sun[0],1-FX.sun[1]); draw(); }
    p=PR.fin; use(p,null,{A:T.A.t,Bl:cur.t,R:T.rays.t});
    u1(p,'bloom',fast?0:FX.bloom*0.95*(levels<5?1.3:1)); u1(p,'rays',fast?0:FX.rays); u1(p,'exposure',FX.exposure); u1(p,'sat',FX.sat); u1(p,'vign',FX.vign);
    u1(p,'grain',FX.grain); u1(p,'t',FX.time); u1(p,'flash',FX.flash); u1(p,'fade',FX.fade);
    u3(p,'lift',FX.lift); u3(p,'gam',FX.gamma); u3(p,'gain',FX.gain); u3(p,'sunCol',FX.sunCol); u3(p,'shT',FX.shadowTint); u3(p,'hiT',FX.hiTint);
    u2(p,'res',screenCv.width,screenCv.height); draw(); };
  P.ok=true; return P; })();
