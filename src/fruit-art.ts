import { fruitAt } from './fruits';

type Face = 'happy' | 'sleepy' | 'cheeky';

export function drawFruitCharacter(
  ctx: CanvasRenderingContext2D,
  level: number,
  x: number,
  y: number,
  displayRadius = fruitAt(level).radius,
  angle = 0,
  alpha = 1
): void {
  const fruit = fruitAt(level);
  const r = displayRadius;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(91, 55, 45, .18)';
  ctx.shadowBlur = Math.max(4, r * 0.12);
  ctx.shadowOffsetY = Math.max(2, r * 0.06);

  if (level === 0) drawGrapes(ctx, r, fruit.color, fruit.accent);
  else if (level === 1) drawCherries(ctx, r, fruit.color, fruit.accent);
  else if (level === 2) drawStrawberry(ctx, r, fruit.color, fruit.accent);
  else if (level === 3) drawTangerine(ctx, r, fruit.color, fruit.accent);
  else if (level === 4) drawLemon(ctx, r, fruit.color, fruit.accent);
  else if (level === 5) drawApple(ctx, r, fruit.color, fruit.accent);
  else if (level === 6) drawPear(ctx, r, fruit.color, fruit.accent);
  else if (level === 7) drawPeach(ctx, r, fruit.color, fruit.accent);
  else if (level === 8) drawPineapple(ctx, r, fruit.color, fruit.accent);
  else if (level === 9) drawMelon(ctx, r, fruit.color, fruit.accent);
  else drawWatermelon(ctx, r, fruit.color, fruit.accent);

  ctx.shadowColor = 'transparent';
  const faceY = level === 8 ? r * 0.12 : level === 6 ? r * 0.14 : level === 2 ? r * 0.08 : r * 0.1;
  drawFace(ctx, r, fruit.face, faceY);
  ctx.restore();
}

function fillStroke(ctx: CanvasRenderingContext2D, fill: string, stroke: string, width: number): void {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = width;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawGrapes(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.strokeStyle = '#648851';
  ctx.lineWidth = r * 0.13;
  ctx.beginPath(); ctx.moveTo(0, -r * .7); ctx.quadraticCurveTo(r * .1, -r, r * .34, -r * .92); ctx.stroke();
  const berries = [[0,-.38],[-.38,-.18],[.38,-.18],[-.22,.18],[.22,.18],[0,.52]];
  for (const [bx, by] of berries) {
    ctx.beginPath(); ctx.arc(bx! * r, by! * r, r * .43, 0, Math.PI * 2); fillStroke(ctx, color, accent, r * .08);
  }
  shine(ctx, -r * .26, -r * .42, r * .16);
}

function drawCherries(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.strokeStyle = '#5b8d4d'; ctx.lineWidth = r * .12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-r*.42,-r*.12); ctx.quadraticCurveTo(-r*.2,-r*.95, r*.1,-r*.82); ctx.moveTo(r*.42,-r*.12); ctx.quadraticCurveTo(r*.34,-r*.77,r*.1,-r*.82); ctx.stroke();
  for (const side of [-1,1]) { ctx.beginPath(); ctx.arc(side*r*.4,r*.18,r*.48,0,Math.PI*2); fillStroke(ctx,color,accent,r*.08); }
  leaf(ctx, r*.2, -r*.82, r*.38, '#69a85d');
  shine(ctx,-r*.55,-r*.02,r*.14);
}

function drawStrawberry(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.beginPath(); ctx.moveTo(-r*.78,-r*.35); ctx.bezierCurveTo(-r*.9,r*.2,-r*.35,r*.8,0,r); ctx.bezierCurveTo(r*.35,r*.8,r*.9,r*.2,r*.78,-r*.35); ctx.quadraticCurveTo(0,-r*.72,-r*.78,-r*.35); ctx.closePath(); fillStroke(ctx,color,accent,r*.08);
  ctx.shadowColor='transparent';
  for (const [sx,sy] of [[-.45,.05],[.45,.05],[-.3,.42],[.3,.42],[0,.68],[0,-.05]]) { ctx.fillStyle='#ffe59a'; ctx.beginPath(); ctx.ellipse(sx!*r,sy!*r,r*.045,r*.085,0,0,Math.PI*2); ctx.fill(); }
  for (let i=-2;i<=2;i++) leaf(ctx,i*r*.2,-r*.38,r*.42,'#68a95d',i*.22);
}

function drawTangerine(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.beginPath(); ctx.ellipse(0,r*.08,r*.98,r*.84,0,0,Math.PI*2); fillStroke(ctx,color,accent,r*.08);
  ctx.shadowColor='transparent'; ctx.strokeStyle=accent; ctx.globalAlpha*=.35; ctx.lineWidth=r*.035;
  for (let i=-2;i<=2;i++) { ctx.beginPath(); ctx.arc(i*r*.28,r*.03,r*.32,-1.1,1.1); ctx.stroke(); }
  ctx.globalAlpha/=.35; leaf(ctx,r*.14,-r*.72,r*.42,'#69a756',-.3);
}

function drawLemon(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.beginPath(); ctx.moveTo(-r,-r*.05); ctx.quadraticCurveTo(-r*.78,-r*.72,0,-r*.72); ctx.quadraticCurveTo(r*.78,-r*.72,r,-r*.05); ctx.quadraticCurveTo(r*.78,r*.72,0,r*.72); ctx.quadraticCurveTo(-r*.78,r*.72,-r,-r*.05); ctx.closePath(); fillStroke(ctx,color,accent,r*.075);
  shine(ctx,-r*.38,-r*.35,r*.2);
}

function drawApple(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.beginPath(); ctx.moveTo(0,-r*.63); ctx.bezierCurveTo(-r*.24,-r*.95,-r*.95,-r*.62,-r*.94,r*.12); ctx.bezierCurveTo(-r*.9,r*.8,-r*.3,r*.98,0,r*.77); ctx.bezierCurveTo(r*.3,r*.98,r*.9,r*.8,r*.94,r*.12); ctx.bezierCurveTo(r*.95,-r*.62,r*.24,-r*.95,0,-r*.63); ctx.closePath(); fillStroke(ctx,color,accent,r*.075);
  stem(ctx,0,-r*.68,r); leaf(ctx,r*.18,-r*.76,r*.42,'#568f54',-.35); shine(ctx,-r*.42,-r*.36,r*.2);
}

function drawPear(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.beginPath(); ctx.moveTo(0,-r*.82); ctx.bezierCurveTo(-r*.42,-r*.65,-r*.3,-r*.28,-r*.7,r*.02); ctx.bezierCurveTo(-r*1.02,r*.3,-r*.82,r*.92,0,r*.95); ctx.bezierCurveTo(r*.82,r*.92,r*1.02,r*.3,r*.7,r*.02); ctx.bezierCurveTo(r*.3,-r*.28,r*.42,-r*.65,0,-r*.82); ctx.closePath(); fillStroke(ctx,color,accent,r*.075);
  stem(ctx,0,-r*.78,r); leaf(ctx,r*.22,-r*.78,r*.4,'#619653',-.3); shine(ctx,-r*.38,-r*.1,r*.2);
}

function drawPeach(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.beginPath(); ctx.moveTo(0,-r*.78); ctx.bezierCurveTo(-r*.3,-r*1.02,-r*.95,-r*.6,-r*.96,r*.05); ctx.bezierCurveTo(-r*.98,r*.66,-r*.45,r*.98,0,r*.88); ctx.bezierCurveTo(r*.45,r*.98,r*.98,r*.66,r*.96,r*.05); ctx.bezierCurveTo(r*.95,-r*.6,r*.3,-r*1.02,0,-r*.78); ctx.closePath(); fillStroke(ctx,color,accent,r*.075);
  ctx.shadowColor='transparent'; ctx.strokeStyle=accent; ctx.lineWidth=r*.045; ctx.beginPath(); ctx.moveTo(0,-r*.72); ctx.quadraticCurveTo(r*.18,-r*.3,r*.08,r*.18); ctx.stroke();
  leaf(ctx,r*.24,-r*.78,r*.42,'#659d59',-.28);
}

function drawPineapple(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.beginPath(); ctx.ellipse(0,r*.17,r*.75,r*.86,0,0,Math.PI*2); fillStroke(ctx,color,accent,r*.07);
  ctx.shadowColor='transparent';
  for (let i=-2;i<=2;i++) leaf(ctx,i*r*.14,-r*.72,r*.72,i%2?'#438c58':'#61a967',i*.3);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0,r*.17,r*.7,r*.81,0,0,Math.PI*2); ctx.clip(); ctx.strokeStyle=accent; ctx.globalAlpha=.55; ctx.lineWidth=r*.025;
  for(let d=-r*1.2;d<r*1.3;d+=r*.28){ctx.beginPath();ctx.moveTo(-r,d-r);ctx.lineTo(r,d+r);ctx.moveTo(-r,d+r);ctx.lineTo(r,d-r);ctx.stroke();} ctx.restore();
}

function drawMelon(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.beginPath(); ctx.arc(0,0,r*.95,0,Math.PI*2); fillStroke(ctx,color,accent,r*.07);
  ctx.shadowColor='transparent'; ctx.save(); ctx.beginPath(); ctx.arc(0,0,r*.88,0,Math.PI*2); ctx.clip(); ctx.strokeStyle='#f2efd0'; ctx.globalAlpha=.65; ctx.lineWidth=r*.025;
  for(let d=-r*1.3;d<r*1.4;d+=r*.22){ctx.beginPath();ctx.moveTo(-r,d-r);ctx.lineTo(r,d+r);ctx.moveTo(-r,d+r);ctx.lineTo(r,d-r);ctx.stroke();} ctx.restore();
  stem(ctx,0,-r*.9,r);
}

function drawWatermelon(ctx: CanvasRenderingContext2D, r: number, color: string, accent: string): void {
  ctx.beginPath(); ctx.arc(0,0,r*.96,0,Math.PI*2); fillStroke(ctx,color,accent,r*.075);
  ctx.shadowColor='transparent'; ctx.strokeStyle=accent; ctx.globalAlpha*=.7; ctx.lineWidth=r*.065;
  for(const offset of [-.58,-.28,0,.28,.58]) { ctx.beginPath(); ctx.moveTo(offset*r,-r*.84); ctx.bezierCurveTo((offset+.16)*r,-r*.42,(offset-.16)*r,r*.42,offset*r,r*.84); ctx.stroke(); }
  ctx.globalAlpha/=.7; shine(ctx,-r*.43,-r*.46,r*.2);
}

function stem(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void { ctx.strokeStyle='#70573c';ctx.lineWidth=r*.09;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-r*.04,y-r*.23,x+r*.08,y-r*.3);ctx.stroke(); }
function leaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, angle=0): void { ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.62,-size*.46,size,0);ctx.quadraticCurveTo(size*.58,size*.42,0,0);ctx.fill();ctx.restore(); }
function shine(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void { ctx.save();ctx.shadowColor='transparent';ctx.globalAlpha*=.38;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(x,y,size,size*.48,-.65,0,Math.PI*2);ctx.fill();ctx.restore(); }

function drawFace(ctx: CanvasRenderingContext2D, r: number, face: Face, y: number): void {
  ctx.shadowColor='transparent'; ctx.strokeStyle='#594743';ctx.fillStyle='#594743';ctx.lineWidth=Math.max(1.3,r*.045);ctx.lineCap='round';
  if(face==='sleepy'){for(const side of [-1,1]){ctx.beginPath();ctx.arc(side*r*.25,y,r*.085,.1,Math.PI-.1);ctx.stroke();}}
  else{for(const side of [-1,1]){ctx.beginPath();ctx.arc(side*r*.25,y,Math.max(1.6,r*.052),0,Math.PI*2);ctx.fill();}}
  ctx.beginPath();ctx.arc(0,y+r*.16,r*(face==='cheeky'?.1:.14),0,Math.PI);ctx.stroke();
  ctx.fillStyle='#ef7e88';ctx.globalAlpha*=.48;for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*r*.42,y+r*.17,r*.09,r*.05,0,0,Math.PI*2);ctx.fill();}
}
