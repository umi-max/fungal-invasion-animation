const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1200, H = 680;
const GY = 415;
const FRAMES_DIR = '/tmp/anim_frames';
const FPS = 30;
const DURATION = 20; // seconds
const TOTAL_FRAMES = FPS * DURATION;

fs.mkdirSync(FRAMES_DIR, { recursive: true });

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

let t = 0;

/* ── Entities ── */
const marchers = Array.from({length:8},(_,i)=>({
  x: 840 - i*75,
  y: GY+72+(i%2)*14,
  speed: 0.75+i*0.02,
  bob: i*0.9, arm: i*0.65,
  type: i===0?'leader': i===3?'cool':'normal'
}));

const spores = [
  {x:810,y:170,vx:-0.8,vy:-0.4,sz:28,ph:0,  face:'angry'},
  {x:940,y:130,vx: 0.9,vy: 0.3,sz:22,ph:1.2,face:'normal'},
  {x:880,y:250,vx:-0.5,vy: 0.6,sz:18,ph:2.4,face:'cool'},
  {x:1060,y:160,vx: 0.7,vy:-0.5,sz:24,ph:0.8,face:'angry'},
  {x:1120,y:230,vx:-0.9,vy: 0.4,sz:20,ph:1.8,face:'normal'},
  {x:990,y:300,vx: 0.6,vy:-0.7,sz:16,ph:3.0,face:'normal'},
  {x:750,y:200,vx: 0.4,vy: 0.5,sz:14,ph:1.5,face:'angry'},
  {x:1080,y:310,vx:-0.6,vy:-0.3,sz:19,ph:2.1,face:'cool'},
];

const leaves = Array.from({length:18},(_,i)=>({
  x:100+Math.random()*240, y:180+Math.random()*80,
  vx:(Math.random()-0.5)*1.8, vy:0.4+Math.random()*0.7,
  rot:Math.random()*Math.PI*2, rv:(Math.random()-0.5)*0.09,
  sz:5+Math.random()*7, alpha:0, delay:220+i*28
}));

/* ── Utils ── */
function rr(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function bubble(cx,cy,lines,tail,alpha,fs=12){
  if(alpha<=0)return;
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.font=`${fs}px sans-serif`;
  const pad=11, lh=fs+5;
  const mw=Math.max(...lines.map(l=>ctx.measureText(l).width));
  const bw=mw+pad*2, bh=lines.length*lh+pad*2;
  const bx=cx-bw/2, by=cy-bh/2;

  rr(bx,by,bw,bh,10);
  ctx.fillStyle='rgba(255,253,235,0.97)'; ctx.fill();
  ctx.strokeStyle='#444'; ctx.lineWidth=1.8; ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle='rgba(255,253,235,0.97)';
  if(tail==='down'){ ctx.moveTo(cx-8,by+bh-1); ctx.lineTo(cx+8,by+bh-1); ctx.lineTo(cx,by+bh+20); }
  else if(tail==='up'){ ctx.moveTo(cx-8,by+1); ctx.lineTo(cx+8,by+1); ctx.lineTo(cx,by-20); }
  else if(tail==='right'){ ctx.moveTo(bx+bw-1,cy-6); ctx.lineTo(bx+bw-1,cy+6); ctx.lineTo(bx+bw+20,cy); }
  else { ctx.moveTo(bx+1,cy-6); ctx.lineTo(bx+1,cy+6); ctx.lineTo(bx-20,cy); }
  ctx.fill();

  ctx.globalAlpha=alpha;
  ctx.fillStyle='#1a1a1a';
  lines.forEach((l,i)=>ctx.fillText(l,bx+pad,by+pad+(i+1)*lh-4));
  ctx.restore();
}

/* ── Update ── */
function update(){
  t++;
  marchers.forEach(m=>{
    m.x -= m.speed;
    if(m.x < -40) m.x = 880;
  });
  spores.forEach(s=>{
    s.x += s.vx + Math.sin(t*0.04+s.ph)*0.7;
    s.y += s.vy + Math.cos(t*0.05+s.ph)*0.4;
    if(s.x<580||s.x>1185) s.vx*=-1;
    if(s.y<100||s.y>370)  s.vy*=-1;
  });
  leaves.forEach(l=>{
    if(t>l.delay){ l.alpha=Math.min(0.75,l.alpha+0.008); l.y+=l.vy; l.x+=l.vx; l.rot+=l.rv; }
    if(l.y>GY){ l.y=160+Math.random()*80; l.x=90+Math.random()*250; l.alpha=0; }
  });
}

/* ── Background ── */
function drawBG(){
  ctx.fillStyle='#f0e4c4';
  ctx.fillRect(0,0,W,GY);
  ctx.fillStyle='rgba(160,100,40,0.06)';
  for(let i=0;i<220;i++) ctx.fillRect((i*137.5)%W,(i*97.3)%(GY),2,2);
  ctx.fillStyle='#9B6B3A';
  ctx.fillRect(0,GY-6,W,18);
  const ug=ctx.createLinearGradient(0,GY,0,H);
  ug.addColorStop(0,'#6B3A18'); ug.addColorStop(1,'#321408');
  ctx.fillStyle=ug;
  ctx.fillRect(0,GY+12,W,H-GY-12);
  ctx.fillStyle='rgba(110,60,20,0.22)';
  for(let i=0;i<90;i++){
    ctx.beginPath();
    ctx.arc((i*151.3)%W,GY+18+(i*83.7)%(H-GY-22),2.5,0,Math.PI*2);
    ctx.fill();
  }
}

function drawTitle(){
  ctx.save();
  ctx.fillStyle='#666'; ctx.font='italic 13px serif';
  ctx.fillText('SCIENTIFIC EDITORIAL',30,34);
  ctx.fillStyle='#111'; ctx.font='bold 27px serif';
  ctx.fillText('Modus Operandi: Aerial Assault and Underground Siege',30,68);
  ctx.strokeStyle='#888'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(30,76); ctx.lineTo(W-30,76); ctx.stroke();
  ctx.restore();
}

function drawRoots(cx){
  const segs=[
    [[cx,GY],[cx-55,GY+65],[cx-120,GY+105]],
    [[cx,GY],[cx+45,GY+55],[cx+110,GY+88]],
    [[cx-15,GY+18],[cx-140,GY+95]],
    [[cx+12,GY+28],[cx+165,GY+80]],
  ];
  ctx.strokeStyle='#7B3A1A'; ctx.lineWidth=4; ctx.lineCap='round';
  segs.forEach(s=>{
    ctx.beginPath(); ctx.moveTo(s[0][0],s[0][1]);
    s.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));
    ctx.stroke();
  });
}

function drawRootHighway(){
  const pulse=Math.sin(t*0.09)*0.3+0.7;
  ctx.save();
  ctx.strokeStyle=`rgba(210,55,15,${0.45*pulse})`;
  ctx.lineWidth=9;
  ctx.setLineDash([20,12]);
  ctx.lineDashOffset=-(t*0.55);
  ctx.beginPath();
  ctx.moveTo(760,GY+68);
  ctx.bezierCurveTo(620,GY+95,430,GY+48,290,GY+88);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=`rgba(255,80,20,${0.65*pulse})`;
  ctx.beginPath();
  ctx.moveTo(275,GY+88); ctx.lineTo(296,GY+77); ctx.lineTo(296,GY+99);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawTree(cx,sc,wobble,panic){
  ctx.save();
  ctx.translate(cx,GY);
  ctx.scale(sc,sc);
  const shake=panic>0?Math.sin(t*0.42)*panic*5:0;
  ctx.translate(shake,0);
  ctx.fillStyle='#6B3A2A';
  ctx.fillRect(-18,-55,36,55);
  ctx.strokeStyle='#4A2010'; ctx.lineWidth=1;
  ctx.strokeRect(-18,-55,36,55);
  ctx.strokeStyle='rgba(50,20,8,0.3)'; ctx.lineWidth=1;
  [-8,0,8].forEach(x=>{ctx.beginPath();ctx.moveTo(x,-55);ctx.lineTo(x+1.5,0);ctx.stroke();});
  const tiers=[{y:-52,w:108,h:68},{y:-102,w:84,h:62},{y:-146,w:64,h:54},{y:-182,w:46,h:46}];
  tiers.forEach((lr,i)=>{
    ctx.fillStyle='#1A380E';
    ctx.beginPath();ctx.moveTo(-lr.w/2+9,lr.y+lr.h);ctx.lineTo(9,lr.y);ctx.lineTo(lr.w/2+9,lr.y+lr.h);ctx.closePath();ctx.fill();
    ctx.fillStyle=i%2===0?'#2D5A18':'#3A7020';
    ctx.beginPath();ctx.moveTo(-lr.w/2,lr.y+lr.h);ctx.lineTo(0,lr.y);ctx.lineTo(lr.w/2,lr.y+lr.h);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#1A380E';ctx.lineWidth=1;ctx.stroke();
  });
  const ey=-75;
  const blink=Math.sin(t*0.024+wobble)>0.92;
  const ew=blink?1:(panic>0.4?9:7);
  const pdx=panic>0.05?5:0;
  ctx.fillStyle='#FFF';
  ctx.beginPath();ctx.ellipse(-17,ey,8,ew,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(17,ey,8,ew,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1a1a1a';
  ctx.beginPath();ctx.ellipse(-17+pdx,ey,4,blink?1:4,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(17+pdx,ey,4,blink?1:4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFF';
  ctx.beginPath();ctx.arc(-15+pdx,ey-2,1.5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(19+pdx,ey-2,1.5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#333';ctx.lineWidth=2.5;ctx.lineCap='round';
  if(panic>0.05){
    ctx.beginPath();ctx.moveTo(-24,ey-12);ctx.lineTo(-11,ey-16);ctx.stroke();
    ctx.beginPath();ctx.moveTo(11,ey-16);ctx.lineTo(24,ey-12);ctx.stroke();
  } else {
    ctx.beginPath();ctx.moveTo(-24,ey-13);ctx.lineTo(-11,ey-13);ctx.stroke();
    ctx.beginPath();ctx.moveTo(11,ey-13);ctx.lineTo(24,ey-13);ctx.stroke();
  }
  ctx.strokeStyle='#333';ctx.lineWidth=2;
  if(panic>0.55){
    ctx.beginPath();ctx.arc(0,ey+14,9,0.1*Math.PI,0.9*Math.PI);ctx.stroke();
    ctx.fillStyle='#333';
    ctx.beginPath();ctx.arc(0,ey+14,9,0.1*Math.PI,0.9*Math.PI);ctx.fill();
    ctx.fillStyle='#FFF';
    ctx.fillRect(-7,ey+14,5,6);ctx.fillRect(0,ey+14,5,6);
  } else if(panic>0.05){
    ctx.beginPath();ctx.arc(0,ey+19,7,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
  } else {
    ctx.beginPath();ctx.arc(0,ey+17,6,0,Math.PI);ctx.stroke();
  }
  if(panic>0.28){
    ctx.fillStyle='rgba(70,120,255,0.82)';
    ctx.beginPath();ctx.arc(28,ey-7,4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(28,ey-3);ctx.lineTo(31,ey+7);ctx.lineTo(25,ey+7);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}

function drawMushroom(x,y,s){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  ctx.fillStyle='#D4A060';ctx.fillRect(-5,-13,10,16);
  ctx.fillStyle='#B02818';
  ctx.beginPath();ctx.arc(0,-13,13,Math.PI,0);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.75)';
  ctx.beginPath();ctx.arc(-4,-16,3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(5,-12,2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawStump(cx,w,h,growFungi,hasFace){
  ctx.save();ctx.translate(cx,GY);
  ctx.fillStyle='#8B4513';
  ctx.beginPath();
  ctx.moveTo(-w/2,0);ctx.lineTo(-w/2-5,-h);ctx.lineTo(w/2+5,-h);ctx.lineTo(w/2,0);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#5A2408';
  ctx.beginPath();
  ctx.moveTo(w/2,0);ctx.lineTo(w/2+5,-h);ctx.lineTo(w/2+18,-h-2);ctx.lineTo(w/2+13,4);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#A05030';
  ctx.beginPath();ctx.ellipse(0,-h,w/2+5,14,0,0,Math.PI*2);ctx.fill();
  for(let r=w/2-4;r>5;r-=11){
    ctx.strokeStyle='rgba(55,22,6,0.32)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(0,-h,r,r*0.3,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.strokeStyle='rgba(45,18,4,0.32)';ctx.lineWidth=1;
  for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*14,0);ctx.lineTo(i*14+i*(-2),-h);ctx.stroke();}
  if(growFungi){
    const n=Math.min(6,Math.floor(t/100)+1);
    for(let i=0;i<n;i++){
      const fx=-w/2+14+i*(w/n);
      const anim=Math.sin(t*0.05+i*1.2)*2;
      drawMushroom(fx,-h-2+anim,0.55);
    }
    ctx.save();
    const glow=Math.sin(t*0.08)*0.25+0.25;
    ctx.fillStyle=`rgba(200,30,0,${glow})`;
    ctx.beginPath();ctx.ellipse(0,-h,w/2+5,14,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  if(hasFace){
    const fy=-h*0.55;
    ctx.fillStyle='#FFF';
    ctx.beginPath();ctx.ellipse(-14,fy,7,5,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(14,fy,7,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#8B4513';
    ctx.fillRect(-22,fy-5,17,5);ctx.fillRect(5,fy-5,17,5);
    ctx.fillStyle='#333';
    ctx.beginPath();ctx.arc(-14,fy+1,2.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(14,fy+1,2.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#444';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(-10,fy+13);ctx.bezierCurveTo(-3,fy+17,3,fy+17,10,fy+13);ctx.stroke();
    const sighCyc=t%240;
    if(sighCyc>120){
      const sa=sighCyc<140?(sighCyc-120)/20:sighCyc<200?1:(240-sighCyc)/40;
      ctx.save();ctx.globalAlpha=sa*0.8;
      ctx.font='italic 13px serif';ctx.fillStyle='#666';
      ctx.fillText('*sigh*',18,fy-10);
      for(let p=0;p<3;p++){
        const py=fy-22-p*14+Math.sin(t*0.06)*3;
        ctx.beginPath();ctx.arc(28+p*6,py,3+p*2,0,Math.PI*2);
        ctx.strokeStyle='rgba(120,120,120,0.5)';ctx.stroke();
      }
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawMarcher(m){
  const bob=Math.sin(t*0.13+m.bob)*5;
  const arm=Math.sin(t*0.19+m.arm)*0.65;
  const leg=Math.sin(t*0.19+m.arm)*10;
  ctx.save();ctx.translate(m.x,m.y+bob);
  ctx.fillStyle=m.type==='leader'?'#D4802A':'#C87028';
  ctx.beginPath();ctx.ellipse(0,-8,10,13,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#8B3610';ctx.lineWidth=1.5;ctx.stroke();
  ctx.strokeStyle='#C07020';ctx.lineWidth=3;ctx.lineCap='round';
  ctx.save();ctx.translate(-10,-8);ctx.rotate(arm-0.4);
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-10,9);ctx.stroke();
  ctx.restore();
  ctx.save();ctx.translate(10,-8);ctx.rotate(-arm+0.4);
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(10,9);ctx.stroke();
  if(m.type==='leader'){
    ctx.fillStyle='#F0DCA0';ctx.fillRect(7,-3,12,14);
    ctx.strokeStyle='#8B4513';ctx.lineWidth=1;ctx.strokeRect(7,-3,12,14);
    ctx.strokeStyle='#555';ctx.lineWidth=0.8;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(9,i*4);ctx.lineTo(17,i*4);ctx.stroke();}
    ctx.strokeStyle='#080';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(9,9);ctx.lineTo(11,11);ctx.lineTo(17,4);ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle='#C07020';ctx.lineWidth=3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-5,4);ctx.lineTo(-5+leg,18);ctx.stroke();
  ctx.beginPath();ctx.moveTo(5,4);ctx.lineTo(5-leg,18);ctx.stroke();
  ctx.fillStyle='#4A2010';
  ctx.beginPath();ctx.ellipse(-5+leg,19,6,3.2,0.2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(5-leg,19,6,3.2,-0.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFD700';
  ctx.beginPath();ctx.ellipse(0,-18,13,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFC000';
  ctx.beginPath();ctx.arc(0,-18,10,Math.PI,0);ctx.fill();
  ctx.strokeStyle='#B08010';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#E89050';
  ctx.beginPath();ctx.ellipse(0,-10,7,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#222';
  ctx.beginPath();ctx.arc(-3,-11,1.5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(3,-11,1.5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#333';ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,-7,4,0,Math.PI);ctx.stroke();
  if(m.type==='cool'){
    ctx.fillStyle='rgba(0,0,0,0.82)';
    ctx.beginPath();ctx.ellipse(-3,-11,4.5,2.5,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(3,-11,4.5,2.5,0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function drawSpore(s){
  const wb=Math.sin(t*0.07+s.ph)*4;
  ctx.save();ctx.translate(s.x,s.y+wb);
  ctx.fillStyle='#B83C10';
  ctx.beginPath();ctx.arc(0,0,s.sz,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(60,10,0,0.4)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='rgba(50,12,0,0.22)';
  for(let b=0;b<6;b++){
    const a=b/6*Math.PI*2;
    ctx.beginPath();ctx.arc(Math.cos(a)*(s.sz-5),Math.sin(a)*(s.sz-5),3,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle='rgba(180,80,20,0.45)';
  for(let d=0;d<5;d++){
    const a=d/5*Math.PI*2+t*0.04;
    ctx.beginPath();ctx.arc(Math.cos(a)*(s.sz+6),Math.sin(a)*(s.sz+6),2.2,0,Math.PI*2);ctx.fill();
  }
  const r=s.sz;
  if(s.face==='angry'){
    ctx.fillStyle='#FFF';
    ctx.beginPath();ctx.ellipse(-r*.27,-r*.15,r*.18,r*.13,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(r*.27,-r*.15,r*.18,r*.13,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#111';
    ctx.beginPath();ctx.arc(-r*.24,-r*.12,r*.09,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(r*.24,-r*.12,r*.09,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#4A0800';ctx.lineWidth=r*.1;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-r*.42,-r*.32);ctx.lineTo(-r*.15,-r*.25);ctx.stroke();
    ctx.beginPath();ctx.moveTo(r*.42,-r*.32);ctx.lineTo(r*.15,-r*.25);ctx.stroke();
    ctx.strokeStyle='#4A0800';ctx.lineWidth=r*.08;
    ctx.beginPath();ctx.arc(0,r*.18,r*.28,0,Math.PI);ctx.stroke();
    ctx.fillStyle='#FFF';
    [-r*.18,0,r*.18].forEach(tx=>ctx.fillRect(tx-r*.08,r*.16,r*.13,r*.1));
  } else if(s.face==='cool'){
    ctx.fillStyle='rgba(0,0,0,0.85)';
    ctx.beginPath();ctx.ellipse(-r*.27,-r*.1,r*.21,r*.13,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(r*.27,-r*.1,r*.21,r*.13,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(80,10,0,0.7)';ctx.lineWidth=r*.08;
    ctx.beginPath();ctx.arc(0,r*.2,r*.25,0.1*Math.PI,0.9*Math.PI);ctx.stroke();
  } else {
    ctx.fillStyle='#FFF';
    ctx.beginPath();ctx.ellipse(-r*.25,-r*.15,r*.17,r*.13,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(r*.25,-r*.15,r*.17,r*.13,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#111';
    ctx.beginPath();ctx.arc(-r*.22,-r*.12,r*.09,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(r*.22,-r*.12,r*.09,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(80,10,0,0.7)';ctx.lineWidth=r*.07;
    ctx.beginPath();ctx.arc(0,r*.2,r*.22,0.1*Math.PI,0.9*Math.PI);ctx.stroke();
  }
  ctx.restore();
}

function drawLeaves(){
  leaves.forEach(l=>{
    if(l.alpha<=0)return;
    ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.rot);
    ctx.globalAlpha=l.alpha;ctx.fillStyle='#2D5A18';
    ctx.beginPath();ctx.ellipse(0,0,l.sz*.42,l.sz,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  });
}

function drawBubbles(){
  const cyc=t%960;
  const panic=Math.min(1,Math.max(0,(t-380)/200));
  if(cyc>55){const a=Math.min(1,(cyc-55)/22);
    bubble(195,248,["Ugh, my roots are so.","Are we being colonized,","or is it just the soil?"],'right',a);}
  if(cyc>140){const a=Math.min(1,(cyc-140)/22);
    bubble(372,198,["Don't even mention","colonization. I heard that","old stump is a real jerk.","I hope the fungi gets lost."],'left',a,11);}
  if(cyc>35){const a=Math.min(1,(cyc-35)/22);
    bubble(850,110,["Hey, I'm primary infection.","Look at this sad stump...","easy target!"],'down',a,11);}
  if(cyc>105){const a=Math.min(1,(cyc-105)/22);
    bubble(1052,175,["Yeah, let's turn this guy","into a nice, moldy,","root-party!"],'down',a,11);}
  if(cyc>178){const a=Math.min(1,(cyc-178)/22);
    bubble(560,GY+22,["Underground Hostile Colonization train!","Destination: That healthy tree.","We're on Phase 2 now, baby! Primary spread!"],'up',a,11);}
  if(cyc>248){const a=Math.min(1,(cyc-248)/22);
    bubble(1058,462,["I've been here for, like,","62 years... It's quiet.","But I can wait.","*Sigh* The fungi just won't leave."],'up',a,11);}
  if(t>380){const a=Math.min(0.95,(t-380)/45)*panic;
    bubble(140,330,["THEY'RE IN THE ROOTS!!","SOMEBODY CALL A BOTANIST!!!","...OR A THERAPIST!!!"],'right',a,13);}
  if(cyc>340){const a=Math.min(0.85,(cyc-340)/22);
    bubble(870,308,["I don't even need","to try, honestly."],'up',a,11);}
}

function drawProgressBar(){
  const pct=Math.min(1,t/750);
  const x=32,y=H-130,w=300,h=22;
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,0.58)';
  rr(x-6,y-22,w+55,h+28,7);ctx.fill();
  ctx.fillStyle='#1a1a1a';rr(x,y,w,h,5);ctx.fill();
  if(pct>0){
    ctx.fillStyle=pct<0.5?'#CC4400':pct<0.8?'#EE1100':'#FF0000';
    rr(x,y,w*pct,h,5);ctx.fill();
  }
  ctx.strokeStyle='#FFD700';ctx.lineWidth=1.5;rr(x,y,w,h,5);ctx.stroke();
  ctx.fillStyle='#FFD700';ctx.font='bold 11px monospace';
  ctx.fillText(`COLONIZATION PROGRESS: ${Math.round(pct*100)}%`,x,y-6);
  if(pct>0.7&&Math.sin(t*0.22)>0){
    ctx.fillStyle='#FF3300';ctx.font='bold 12px monospace';
    ctx.fillText('!! WARNING !!',x+w+10,y+16);
  }
  ctx.restore();
}

function drawChooChoo(){
  const cyc=t%240;
  if(cyc>70)return;
  const a=cyc<25?cyc/25:cyc<52?1:(70-cyc)/18;
  ctx.save();ctx.globalAlpha=a;
  ctx.fillStyle='#FFD700';ctx.font='bold 26px sans-serif';
  ctx.fillText('CHOO CHOO!! [=====]---',320,GY+35);
  ctx.restore();
}

function drawTicker(){
  const msgs="BREAKING: Local fungi launch coordinated assault on innocent pine trees  |  "+
    "EXPERTS SAY: We've never seen colonization this aggressive  |  "+
    "DEVELOPING: Underground tunnels found; trees advised to just vibe  |  "+
    "STUMP WATCH: Old stump enters 62nd year of existential crisis  |  "+
    "WEATHER: Spore count EXTREME - bring an umbrella, lose a tree  |  "+
    "BOTANIST SHORTAGE: All botanists currently on other emergencies  |  "+
    "FUN FACT: Fungi don't care about your feelings  |  ";
  const off=(t*1.6)%(msgs.length*7.5);
  ctx.save();
  ctx.fillStyle='rgba(20,6,0,0.88)';ctx.fillRect(0,H-36,W,36);
  ctx.fillStyle='#FFD700';ctx.font='bold 11px monospace';
  ctx.fillText('!! BREAKING NEWS:',8,H-10);
  ctx.fillStyle='#FFF';ctx.font='11px monospace';
  ctx.save();
  ctx.beginPath();ctx.rect(145,H-36,W-145,36);ctx.clip();
  ctx.fillText(msgs+msgs,145-off,H-10);
  ctx.restore();ctx.restore();
}

function drawCredits(){
  ctx.save();
  const txt='Conception by Hafiz Umair Masood Awan';
  ctx.font='bold 12px serif';
  const tw=ctx.measureText(txt).width;
  ctx.fillStyle='#FFD700';ctx.fillRect(W-tw-30,H-58,tw+24,24);
  ctx.fillStyle='#111';ctx.fillText(txt,W-tw-18,H-40);
  ctx.restore();
}

function draw(){
  ctx.clearRect(0,0,W,H);
  drawBG();drawTitle();
  drawRoots(195);drawRoots(372);drawRootHighway();
  marchers.forEach(drawMarcher);
  const panic=Math.min(1,Math.max(0,(t-380)/200));
  drawTree(195,1.12,0,panic);drawTree(372,0.94,1.9,panic*0.65);
  drawLeaves();
  drawStump(675,96,80,true,false);drawStump(1065,90,70,false,true);drawStump(1160,50,36,false,false);
  spores.forEach(drawSpore);
  drawBubbles();drawChooChoo();drawProgressBar();drawTicker();drawCredits();
}

/* ── Frame export loop ── */
// Advance t by 2 each frame to match browser rendering speed (browser was ~60fps, we render at 30fps)
const STEP = 2;

console.log(`Rendering ${TOTAL_FRAMES} frames (${DURATION}s @ ${FPS}fps)...`);
const start = Date.now();

for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
  // advance t by STEP ticks per frame
  for (let s = 0; s < STEP; s++) update();
  draw();

  const buf = canvas.toBuffer('image/png');
  const filename = path.join(FRAMES_DIR, `f${String(frame).padStart(5,'0')}.png`);
  fs.writeFileSync(filename, buf);

  if (frame % 60 === 0) {
    const elapsed = ((Date.now()-start)/1000).toFixed(1);
    const pct = Math.round(frame/TOTAL_FRAMES*100);
    process.stdout.write(`\r  ${pct}% (${frame}/${TOTAL_FRAMES}) — ${elapsed}s elapsed`);
  }
}
console.log(`\nDone! Frames saved to ${FRAMES_DIR}`);
