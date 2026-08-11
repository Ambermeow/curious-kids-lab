/**
 * AURORA PHYSICS LAB — Interactive Engine
 * Modules: Hero, Solar Wind, Magnetosphere, Quantum Jump, Aurora Color Lab, Spectrum
 */

// ============================ UTILITIES ============================
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

// ============================ HERO ============================
const heroCanvas = document.getElementById('heroCanvas');
let heroCtx, heroW, heroH, heroT = 0;
const heroParticles = [];

function initHero() {
  const s = setupCanvas(heroCanvas);
  heroCtx = s.ctx; heroW = s.w; heroH = s.h;
  for (let i = 0; i < 60; i++) heroParticles.push({
    x: Math.random() * s.w, y: Math.random() * s.h,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.4 + 0.1, hue: Math.random() > 0.5 ? 140 : 170
  });
}
function drawHero() {
  heroT += 0.004;
  heroCtx.clearRect(0, 0, heroW, heroH);
  for (let i = 0; i < 4; i++) {
    const y = heroH * 0.3 + Math.sin(heroT + i * 0.9) * heroH * 0.18;
    const g = heroCtx.createLinearGradient(0, y - 70, 0, y + 70);
    g.addColorStop(0, 'rgba(80,220,120,0)');
    g.addColorStop(0.5, `rgba(${80+i*35},255,${140+i*25},${0.07-i*0.01})`);
    g.addColorStop(1, 'rgba(80,220,120,0)');
    heroCtx.fillStyle = g; heroCtx.fillRect(0, y - 70, heroW, 140);
  }
  heroParticles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > heroW || p.y < 0 || p.y > heroH) {
      p.x = Math.random() * heroW; p.y = Math.random() * heroH;
    }
    heroCtx.beginPath(); heroCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    heroCtx.fillStyle = `hsla(${p.hue},70%,55%,${p.a})`; heroCtx.fill();
  });
  requestAnimationFrame(drawHero);
}

// ============================ LEVEL 1: SOLAR WIND ============================
const swCanvas = document.getElementById('solarWindCanvas');
let swCtx, swW, swH, swT = 0;
let swIntensity = 35, swSpeed = 450, swCmeActive = false, swCmeTimer = 0;
const swParticles = [];

function initSolarWind() {
  const s = setupCanvas(swCanvas);
  swCtx = s.ctx; swW = s.w; swH = s.h;
  for (let i = 0; i < 80; i++) swParticles.push(createSwParticle());
}
function createSwParticle() {
  return {
    x: -20 - Math.random() * 100,
    y: Math.random() * (swH || 400),
    vx: (swSpeed / 80) + Math.random() * 2,
    vy: (Math.random() - 0.5) * 0.8,
    r: Math.random() * 1.5 + 0.5,
    isE: Math.random() > 0.45,
    life: 1
  };
}
function drawSolarWind() {
  swT += 0.016;
  const density = (swIntensity / 100) * 80;
  while (swParticles.length < density) swParticles.push(createSwParticle());
  while (swParticles.length > density) swParticles.pop();

  swCtx.fillStyle = 'rgba(12,18,35,0.25)';
  swCtx.fillRect(0, 0, swW, swH);

  // Sun glow on left
  const sunG = swCtx.createRadialGradient(0, swH * 0.5, 0, 0, swH * 0.5, swW * 0.35);
  sunG.addColorStop(0, 'rgba(255,140,40,0.18)');
  sunG.addColorStop(0.5, 'rgba(255,100,20,0.06)');
  sunG.addColorStop(1, 'rgba(0,0,0,0)');
  swCtx.fillStyle = sunG; swCtx.fillRect(0, 0, swW * 0.4, swH);

  // CME burst
  if (swCmeActive) {
    swCmeTimer -= 0.016;
    const burstR = (1 - swCmeTimer / 2) * swW * 0.3;
    const burstG = swCtx.createRadialGradient(0, swH * 0.5, 0, 0, swH * 0.5, burstR);
    burstG.addColorStop(0, `rgba(255,80,20,${swCmeTimer * 0.3})`);
    burstG.addColorStop(1, 'rgba(0,0,0,0)');
    swCtx.fillStyle = burstG; swCtx.fillRect(0, 0, swW, swH);
    if (swCmeTimer <= 0) swCmeActive = false;
  }

  // Earth on right
  const ex = swW * 0.82, ey = swH * 0.5, er = swH * 0.22;
  const eg = swCtx.createRadialGradient(ex - er * 0.3, ey - er * 0.3, 0, ex, ey, er);
  eg.addColorStop(0, '#2a5a8a'); eg.addColorStop(0.7, '#0d2840'); eg.addColorStop(1, 'rgba(5,10,20,0)');
  swCtx.fillStyle = eg; swCtx.beginPath(); swCtx.arc(ex, ey, er, 0, Math.PI * 2); swCtx.fill();

  // Magnetosphere bow shock
  swCtx.strokeStyle = 'rgba(120,160,255,0.12)';
  swCtx.lineWidth = 1.5;
  swCtx.beginPath();
  for (let t = 0; t <= 1; t += 0.02) {
    const bx = ex - er * 0.3 - t * swW * 0.25;
    const by = ey + Math.sin(t * Math.PI) * (er * 1.8) * (1 - t * 0.3);
    t === 0 ? swCtx.moveTo(bx, by) : swCtx.lineTo(bx, by);
  }
  swCtx.stroke();
  swCtx.beginPath();
  for (let t = 0; t <= 1; t += 0.02) {
    const bx = ex - er * 0.3 - t * swW * 0.25;
    const by = ey - Math.sin(t * Math.PI) * (er * 1.8) * (1 - t * 0.3);
    t === 0 ? swCtx.moveTo(bx, by) : swCtx.lineTo(bx, by);
  }
  swCtx.stroke();

  // Particles
  swParticles.forEach(p => {
    p.x += p.vx * (swSpeed / 450) * (swCmeActive ? 2.5 : 1);
    p.y += p.vy + Math.sin(swT * 3 + p.x * 0.02) * 0.3;
    if (p.x > swW + 20 || p.y < -10 || p.y > swH + 10) Object.assign(p, createSwParticle());

    // Deflect near Earth
    const dx = p.x - ex, dy = p.y - ey, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < er * 2.5 && dist > er) {
      const deflect = (1 - (dist - er) / (er * 1.5)) * 0.08;
      p.vy += (dy / dist) * deflect * (p.isE ? 1 : -1);
      p.vx -= Math.abs(deflect) * 0.3;
    }
    if (dist < er) Object.assign(p, createSwParticle());

    swCtx.beginPath(); swCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    swCtx.fillStyle = p.isE ? `rgba(100,200,255,${0.7 + Math.sin(swT * 5 + p.x) * 0.3})` : `rgba(255,120,100,${0.6})`;
    swCtx.fill();
  });

  requestAnimationFrame(drawSolarWind);
}

// ============================ LEVEL 2: MAGNETOSPHERE ============================
const magCanvas = document.getElementById('magnetosphereCanvas');
let magCtx, magW, magH, magT = 0;
let magSourceX = 10, magSourceY = 50;
const magParticles = [];

function initMagnetosphere() {
  const s = setupCanvas(magCanvas);
  magCtx = s.ctx; magW = s.w; magH = s.h;
}

function getBfield(x, y) {
  // Dipole field centered at (cx, cy)
  const cx = magW * 0.5, cy = magH * 0.5;
  const dx = x - cx, dy = y - cy;
  const r2 = dx * dx + dy * dy;
  const r = Math.sqrt(r2);
  if (r < 20) return { bx: 0, by: 0 };
  const m = 80000; // magnetic moment scale
  const B = m / (r2 * r2);
  const Br = B * (3 * dy * dy / r2 - 1);
  const Bt = B * (-3 * dx * dy / r2);
  const bn = Math.sqrt(Br * Br + Bt * Bt);
  if (bn < 1e-10) return { bx: 0, by: 0 };
  return { bx: Br * 30000 / bn, by: Bt * 30000 / bn };
}

function drawMagnetosphere() {
  magT += 0.016;
  magCtx.fillStyle = '#080818';
  magCtx.fillRect(0, 0, magW, magH);

  const cx = magW * 0.5, cy = magH * 0.5;

  // Draw field lines
  magCtx.strokeStyle = 'rgba(140,160,255,0.18)';
  magCtx.lineWidth = 1.2;
  for (let lat = 8; lat < 90; lat += 10) {
    const rad = lat * Math.PI / 180;
    const sin2 = Math.sin(rad) ** 2;
    [-1, 1].forEach(sign => {
      magCtx.beginPath();
      for (let theta = 0; theta <= Math.PI; theta += 0.04) {
        const ct = Math.cos(theta), st = Math.sin(theta);
        const denom = 1 - ct * Math.cos(rad);
        if (Math.abs(denom) < 0.01) continue;
        const r = (magH * 0.28) * sin2 / denom;
        if (r < 0) continue;
        const px = cx + r * st;
        const py = cy - sign * r * ct;
        theta === 0 ? magCtx.moveTo(px, py) : magCtx.lineTo(px, py);
      }
      magCtx.stroke();
    });
  }

  // Earth
  const eGrad = magCtx.createRadialGradient(cx - 12, cy - 12, 0, cx, cy, 32);
  eGrad.addColorStop(0, '#3b82f6'); eGrad.addColorStop(1, '#1e3a5a');
  magCtx.fillStyle = eGrad;
  magCtx.beginPath(); magCtx.arc(cx, cy, 28, 0, Math.PI * 2); magCtx.fill();

  // Auroral glow
  const ag = magCtx.createRadialGradient(cx, cy - 45, 0, cx, cy - 45, 28);
  ag.addColorStop(0, 'rgba(80,255,120,0.35)'); ag.addColorStop(1, 'rgba(80,255,120,0)');
  magCtx.fillStyle = ag; magCtx.fillRect(cx - 35, cy - 78, 70, 55);
  const ag2 = magCtx.createRadialGradient(cx, cy + 45, 0, cx, cy + 45, 28);
  ag2.addColorStop(0, 'rgba(80,255,120,0.25)'); ag2.addColorStop(1, 'rgba(80,255,120,0)');
  magCtx.fillStyle = ag2; magCtx.fillRect(cx - 35, cy + 20, 70, 55);

  // Source marker
  const sx = magW * (magSourceX / 100), sy = magH * (magSourceY / 100);
  magCtx.strokeStyle = 'rgba(255,200,100,0.5)';
  magCtx.setLineDash([4, 4]);
  magCtx.beginPath(); magCtx.arc(sx, sy, 10, 0, Math.PI * 2); magCtx.stroke();
  magCtx.setLineDash([]);
  magCtx.fillStyle = 'rgba(255,200,100,0.8)';
  magCtx.beginPath(); magCtx.arc(sx, sy, 4, 0, Math.PI * 2); magCtx.fill();

  // Launch particles periodically
  if (Math.random() < 0.06) {
    const angle = Math.random() * Math.PI * 2;
    magParticles.push({
      x: sx + Math.cos(angle) * 8, y: sy + Math.sin(angle) * 8,
      vx: Math.cos(angle) * 1.5, vy: Math.sin(angle) * 1.5,
      trail: [], charge: Math.random() > 0.5 ? 1 : -1
    });
  }

  // Update & draw particles
  for (let i = magParticles.length - 1; i >= 0; i--) {
    const p = magParticles[i];
    const B = getBfield(p.x, p.y);
    const qm = p.charge * 0.015; // charge-to-mass ratio scaled
    // Lorentz force: F = q(v × B)
    const fx = qm * (p.vy * B.bx - p.vx * B.by);
    const fy = qm * (p.vx * B.bx + p.vy * B.by);
    p.vx += fx; p.vy += fy;
    p.vx *= 0.999; p.vy *= 0.999;
    p.x += p.vx; p.y += p.vy;

    const distToEarth = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
    if (distToEarth < 30 || p.x < -20 || p.x > magW + 20 || p.y < -20 || p.y > magH + 20) {
      magParticles.splice(i, 1); continue;
    }

    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 40) p.trail.shift();

    magCtx.beginPath();
    for (let j = 0; j < p.trail.length - 1; j++) {
      const t = p.trail[j];
      magCtx.moveTo(t.x, t.y); magCtx.lineTo(p.trail[j + 1].x, p.trail[j + 1].y);
    }
    magCtx.strokeStyle = p.charge > 0 ? 'rgba(255,120,100,0.6)' : 'rgba(100,200,255,0.6)';
    magCtx.lineWidth = 1.5;
    magCtx.stroke();

    magCtx.beginPath(); magCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    magCtx.fillStyle = p.charge > 0 ? '#ff7a6e' : '#6ecfff';
    magCtx.fill();
  }

  requestAnimationFrame(drawMagnetosphere);
}

// ============================ LEVEL 3: QUANTUM JUMP ============================
const qStage = document.getElementById('quantumStage');
const qElectron = document.getElementById('qElectron');
const qPhoton = document.getElementById('qPhoton');
const qStateLabel = document.getElementById('qStateLabel');
let qState = 'ground'; // ground, excited, emitting
let qGas = 'oxygen';

function getQuantumColor(gas) {
  switch (gas) {
    case 'oxygen': return { excite: '#fbbf24', emit: '#4ade80', photon: '#4ade80', label: '绿光 557.7 nm', name: '原子氧 O' };
    case 'nitrogen': return { excite: '#fbbf24', emit: '#a78bfa', photon: '#a78bfa', label: '紫光 427.8 nm', name: '分子氮 N₂' };
    case 'nitrogen-ion': return { excite: '#fbbf24', emit: '#38bdf8', photon: '#38bdf8', label: '蓝光 391.4 nm', name: '氮离子 N₂⁺' };
    default: return { excite: '#fbbf24', emit: '#4ade80', photon: '#4ade80', label: '绿光 557.7 nm', name: '原子氧 O' };
  }
}

function triggerQuantumCollision() {
  if (qState !== 'ground') return;
  qState = 'excited';
  qStateLabel.textContent = '激发态 A*';
  const colors = getQuantumColor(qGas);

  // Electron jumps outward
  qElectron.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
  qElectron.style.marginTop = '-100px';
  qElectron.style.background = colors.excite;
  qElectron.style.boxShadow = `0 0 16px ${colors.excite}`;

  // Orbit glow
  document.querySelectorAll('.quantum-orbit').forEach((o, i) => {
    if (i === 2) o.classList.add('excited');
  });

  setTimeout(() => {
    qState = 'emitting';
    qStateLabel.textContent = '发射光子 hν';

    // Electron falls back
    qElectron.style.transition = 'all 0.6s cubic-bezier(0.68, -0.3, 0.32, 1.3)';
    qElectron.style.marginTop = '-40px';
    qElectron.style.background = colors.emit;
    qElectron.style.boxShadow = `0 0 12px ${colors.emit}`;

    // Photon burst
    qPhoton.style.background = colors.photon;
    qPhoton.style.boxShadow = `0 0 20px ${colors.photon}`;
    qPhoton.style.opacity = '1';
    qPhoton.style.transition = 'none';
    qPhoton.style.top = 'calc(50% - 100px)';
    qPhoton.style.left = 'calc(50% + 20px)';

    setTimeout(() => {
      qPhoton.style.transition = 'all 0.8s ease-out';
      qPhoton.style.top = 'calc(50% - 180px)';
      qPhoton.style.left = 'calc(50% + 120px)';
      qPhoton.style.opacity = '0';
    }, 50);

    setTimeout(() => {
      qState = 'ground';
      qStateLabel.textContent = '基态';
      document.querySelectorAll('.quantum-orbit').forEach(o => o.classList.remove('excited'));
    }, 900);
  }, 800);
}

// Animate electron orbiting
let qOrbitAngle = 0;
function animateQuantumOrbit() {
  if (qState === 'ground') {
    qOrbitAngle += 0.03;
    const r = 40;
    const ox = Math.cos(qOrbitAngle) * r;
    const oy = Math.sin(qOrbitAngle) * r;
    qElectron.style.marginLeft = `${ox - 5}px`;
    qElectron.style.marginTop = `${oy - 5}px`;
  }
  requestAnimationFrame(animateQuantumOrbit);
}

// ============================ LEVEL 4: AURORA COLOR LAB ============================
const labCanvas = document.getElementById('auroraLabCanvas');
let labCtx, labW, labH, labT = 0;
let labWind = 45, labHeight = 180;
const labMolecules = { oxygen: true, nitrogen: true, nitrogenIon: false, helium: false };
const labParticles = [];

function initLab() {
  const s = setupCanvas(labCanvas);
  labCtx = s.ctx; labW = s.w; labH = s.h;
  for (let i = 0; i < 120; i++) labParticles.push(createLabParticle());
}
function createLabParticle() {
  return {
    x: Math.random() * (labW || 800), y: (labH || 400) + 10,
    vx: (Math.random() - 0.5) * 1.5, vy: -Math.random() * 1.5 - 0.5,
    life: 1, decay: Math.random() * 0.008 + 0.004,
    r: Math.random() * 2.5 + 0.8
  };
}
function getLabColor() {
  const h = labHeight;
  const hasO = labMolecules.oxygen, hasN = labMolecules.nitrogen, hasNI = labMolecules.nitrogenIon, hasHe = labMolecules.helium;

  if (h > 400 && hasHe) return { r: 236, g: 72, b: 153 }; // magenta helium
  if (h > 300 && hasNI) return { r: 217, g: 70, b: 239 }; // magenta N2+
  if (h > 240 && hasO) return { r: 239, g: 68, b: 68 };  // red O
  if (h >= 100 && h <= 240 && hasO) return { r: 74, g: 222, b: 128 }; // green O
  if (h < 120 && hasN) {
    if (hasNI && Math.random() > 0.5) return { r: 96, g: 165, b: 250 }; // blue N2+
    return { r: 192, g: 132, b: 252 }; // purple/pink N2
  }
  if (hasN) return { r: 192, g: 132, b: 252 };
  if (hasO) return { r: 74, g: 222, b: 128 };
  return { r: 148, g: 163, b: 184 }; // faint white/gray
}
function getLabColorInfo() {
  const h = labHeight;
  const hasO = labMolecules.oxygen, hasN = labMolecules.nitrogen, hasNI = labMolecules.nitrogenIon, hasHe = labMolecules.helium;

  if (!hasO && !hasN && !hasNI && !hasHe) {
    return { title: '无可见极光', desc: '大气中没有可被激发的气体分子。极光将极其微弱，只剩背景光。请至少添加一种气体成分。' };
  }
  if (h > 400 && hasHe) return { title: '洋红色极光', desc: '高度 > 400 km，氦原子主导。He 的 3³D → 2³P 跃迁产生 587.6 nm 的洋红光，极为罕见。' };
  if (h > 300 && hasNI) return { title: '绯红色极光', desc: '高度 > 300 km，氮离子 N₂⁺ 主导。第一负带系跃迁产生 391.4 nm 和 427.8 nm 的蓝紫光，呈现绯红色调。' };
  if (h > 240 && hasO) return { title: '深红色极光', desc: '高度 240–400 km，氧原子主导。原子氧的 ¹D → ³P 跃迁释放 630.0 nm 红光。高海拔碰撞频率低，氧原子有足够时间完成这个较慢的跃迁。' };
  if (h >= 100 && h <= 240 && hasO) return { title: '黄绿色极光', desc: '高度 100–240 km，氧原子主导。³S → ¹D 跃迁释放 557.7 nm 绿光。这是极光最常见的颜色，该跃迁概率高且氧原子在此高度浓度适中。' };
  if (h < 120 && hasN) {
    if (hasNI) return { title: '蓝紫色极光', desc: '高度 < 120 km，氮分子与氮离子混合。N₂⁺ 的 Meinel 带系和 N₂ 的第二正带系共同作用，产生蓝紫色调。' };
    return { title: '粉红色极光', desc: '高度 80–120 km，氮分子 N₂ 主导。第二正带系和第一正带系跃迁产生粉红到深红色。低海拔处氧原子被"碰撞淬灭"，氮分子发射占主导。' };
  }
  if (hasN) return { title: '紫色极光', desc: '氮分子发射主导。N₂ 的第二正带系产生 337.1 nm 和 357.7 nm 的紫外/紫光。' };
  return { title: '微弱极光', desc: '当前配置下可见光发射较弱。' };
}
function drawLab() {
  labT += 0.016;
  const w = labW, h = labH;

  // Night sky
  const sg = labCtx.createLinearGradient(0, 0, 0, h);
  sg.addColorStop(0, '#030308'); sg.addColorStop(1, '#0a0a18');
  labCtx.fillStyle = sg; labCtx.fillRect(0, 0, w, h);

  // Stars
  labCtx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 131.7) % w, sy = (i * 67.3) % (h * 0.5);
    labCtx.beginPath(); labCtx.arc(sx, sy, Math.random() * 1, 0, Math.PI * 2); labCtx.fill();
  }

  // Ground silhouette
  labCtx.fillStyle = '#010105';
  labCtx.beginPath(); labCtx.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) {
    labCtx.lineTo(x, h - 25 - Math.sin(x * 0.012) * 12 - Math.sin(x * 0.035) * 6);
  }
  labCtx.lineTo(w, h); labCtx.closePath(); labCtx.fill();

  // Aurora curtains
  const intensity = labWind / 100;
  const color = getLabColor();
  for (let c = 0; c < 5; c++) {
    const baseX = w * 0.18 + c * w * 0.16;
    const cg = labCtx.createLinearGradient(baseX - 50, 0, baseX + 50, h * 0.65);
    cg.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${0.35 * intensity})`);
    cg.addColorStop(0.5, `rgba(${color.r * 0.7},${color.g * 0.7},${color.b * 0.8},${0.12 * intensity})`);
    cg.addColorStop(1, 'rgba(0,0,0,0)');
    labCtx.fillStyle = cg;
    labCtx.beginPath();
    for (let y = 0; y < h * 0.65; y += 4) {
      const wave = Math.sin(y * 0.018 + labT * 1.8 + c) * 28 + Math.sin(y * 0.045 + labT * 1.2) * 12;
      const xw = 45 + Math.sin(y * 0.008 + c) * 18;
      const px = baseX + wave;
      y === 0 ? labCtx.moveTo(px - xw / 2, y) : labCtx.lineTo(px - xw / 2, y);
    }
    for (let y = h * 0.65; y >= 0; y -= 4) {
      const wave = Math.sin(y * 0.018 + labT * 1.8 + c) * 28 + Math.sin(y * 0.045 + labT * 1.2) * 12;
      const xw = 45 + Math.sin(y * 0.008 + c) * 18;
      const px = baseX + wave;
      labCtx.lineTo(px + xw / 2, y);
    }
    labCtx.closePath(); labCtx.fill();
  }

  // Sparkle particles
  labParticles.forEach(p => {
    p.x += p.vx + Math.sin(labT * 2 + p.y * 0.02) * 0.4;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) Object.assign(p, createLabParticle());
    const pc = getLabColor();
    labCtx.beginPath(); labCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    labCtx.fillStyle = `rgba(${pc.r},${pc.g},${pc.b},${p.life * 0.7})`;
    labCtx.fill();
  });

  // Altitude indicator bar
  labCtx.fillStyle = 'rgba(255,255,255,0.12)';
  labCtx.fillRect(w - 70, 20, 50, h - 80);
  const indY = 20 + (h - 80) * (1 - (labHeight - 80) / 420);
  labCtx.fillStyle = 'rgba(255,255,255,0.85)';
  labCtx.fillRect(w - 75, indY - 2, 60, 4);
  labCtx.fillStyle = 'rgba(255,255,255,0.7)';
  labCtx.font = '11px Inter';
  labCtx.fillText(`${labHeight} km`, w - 68, indY - 8);

  requestAnimationFrame(drawLab);
}

// ============================ SPECTRUM ANALYZER ============================
const specCanvas = document.getElementById('spectrumCanvas');
let specCtx, specW, specH;

function initSpectrum() {
  const s = setupCanvas(specCanvas);
  specCtx = s.ctx; specW = s.w; specH = s.h;
}
function drawSpectrum() {
  specCtx.fillStyle = '#050510';
  specCtx.fillRect(0, 0, specW, specH);

  const h = labHeight;
  const hasO = labMolecules.oxygen, hasN = labMolecules.nitrogen, hasNI = labMolecules.nitrogenIon, hasHe = labMolecules.helium;
  const lines = [];

  if (hasO) {
    if (h > 200) lines.push({ wl: 630.0, r: 239, g: 68, b: 68, label: 'O ¹D→³P', name: '深红' });
    if (h <= 260) lines.push({ wl: 557.7, r: 74, g: 222, b: 128, label: 'O ³S→¹D', name: '黄绿' });
  }
  if (hasN) {
    if (h < 150) lines.push({ wl: 427.8, r: 168, g: 85, b: 247, label: 'N₂ 2PG', name: '紫' });
    lines.push({ wl: 337.1, r: 192, g: 132, b: 252, label: 'N₂ 2PG', name: '紫外紫' });
  }
  if (hasNI) {
    lines.push({ wl: 391.4, r: 96, g: 165, b: 250, label: 'N₂⁺ 1NG', name: '蓝' });
    lines.push({ wl: 427.8, r: 56, g: 189, b: 248, label: 'N₂⁺ 1NG', name: '蓝紫' });
  }
  if (hasHe && h > 350) {
    lines.push({ wl: 587.6, r: 236, g: 72, b: 153, label: 'He 3³D→2³P', name: '洋红' });
  }

  // Wavelength axis
  specCtx.strokeStyle = 'rgba(255,255,255,0.15)';
  specCtx.lineWidth = 1;
  specCtx.beginPath(); specCtx.moveTo(30, specH - 25); specCtx.lineTo(specW - 10, specH - 25); specCtx.stroke();

  const minWL = 300, maxWL = 700;
  const mapX = wl => 30 + (wl - minWL) / (maxWL - minWL) * (specW - 40);

  // Draw spectral lines
  lines.forEach(line => {
    const x = mapX(line.wl);
    const intensity = 0.6 + Math.sin(Date.now() * 0.002 + line.wl) * 0.2;
    const grad = specCtx.createLinearGradient(x, specH - 25, x, 10);
    grad.addColorStop(0, `rgba(${line.r},${line.g},${line.b},${intensity})`);
    grad.addColorStop(1, `rgba(${line.r},${line.g},${line.b},0)`);
    specCtx.strokeStyle = grad;
    specCtx.lineWidth = 3;
    specCtx.beginPath(); specCtx.moveTo(x, specH - 25); specCtx.lineTo(x, 10); specCtx.stroke();

    // Glow
    specCtx.strokeStyle = `rgba(${line.r},${line.g},${line.b},${intensity * 0.3})`;
    specCtx.lineWidth = 8;
    specCtx.beginPath(); specCtx.moveTo(x, specH - 25); specCtx.lineTo(x, 20); specCtx.stroke();
  });

  // Labels
  specCtx.fillStyle = 'rgba(255,255,255,0.5)';
  specCtx.font = '10px JetBrains Mono';
  [300, 400, 500, 600, 700].forEach(wl => {
    const x = mapX(wl);
    specCtx.fillText(`${wl}nm`, x - 14, specH - 8);
  });

  requestAnimationFrame(drawSpectrum);
}

function updateSpectrumList() {
  const h = labHeight;
  const hasO = labMolecules.oxygen, hasN = labMolecules.nitrogen, hasNI = labMolecules.nitrogenIon, hasHe = labMolecules.helium;
  const rows = [];

  if (hasO) {
    if (h <= 260) rows.push({ bar: 'linear-gradient(90deg,#22c55e,#4ade80)', wl: '557.7 nm', trans: 'O — ³S → ¹D', cap: '黄绿光' });
    if (h > 200) rows.push({ bar: 'linear-gradient(90deg,#ef4444,#f87171)', wl: '630.0 nm', trans: 'O — ¹D → ³P', cap: '深红光' });
  }
  if (hasN) {
    rows.push({ bar: 'linear-gradient(90deg,#a855f7,#c084fc)', wl: '427.8 nm', trans: 'N₂ — 2PG', cap: '紫光' });
    rows.push({ bar: 'linear-gradient(90deg,#c084fc,#e9d5ff)', wl: '337.1 nm', trans: 'N₂ — 2PG', cap: '紫外紫' });
  }
  if (hasNI) {
    rows.push({ bar: 'linear-gradient(90deg,#3b82f6,#60a5fa)', wl: '391.4 nm', trans: 'N₂⁺ — 1NG', cap: '蓝光' });
    rows.push({ bar: 'linear-gradient(90deg,#60a5fa,#93c5fd)', wl: '427.8 nm', trans: 'N₂⁺ — 1NG', cap: '蓝紫光' });
  }
  if (hasHe && h > 350) {
    rows.push({ bar: 'linear-gradient(90deg,#db2777,#f472b6)', wl: '587.6 nm', trans: 'He — 3³D → 2³P', cap: '洋红光' });
  }

  if (rows.length === 0) {
    rows.push({ bar: '#94a3b8', wl: '—', trans: '无激活的发射线', cap: '无可见光' });
  }

  const html = rows.map(r => `
    <div class="spectrum-row">
      <div class="spectrum-color-bar" style="background: ${r.bar};"></div>
      <span class="spectrum-wavelength">${r.wl}</span>
      <span class="spectrum-transition">${r.trans}</span>
      <span class="caption">${r.cap}</span>
    </div>
  `).join('');

  document.getElementById('spectrumList').innerHTML = html;
}

function updateLabInfo() {
  const info = getLabColorInfo();
  document.getElementById('labColorTitle').textContent = info.title;
  document.getElementById('labColorDesc').textContent = info.desc;
  updateSpectrumList();
}

// ============================ CUSTOM SLIDER ============================
function initCustomSlider(el, onChange) {
  const id = el.id;
  // Try class-based selectors first, then id-based
  let thumb = el.querySelector('.custom-slider-thumb');
  let track = el.querySelector('.custom-slider-track');
  if (!thumb && id) thumb = document.getElementById(id + 'Thumb');
  if (!track && id) track = document.getElementById(id + 'Track');
  let value = parseFloat(el.dataset.value) || 0;
  let dragging = false;

  function updateUI() {
    const pct = value / 100;
    if (thumb) thumb.style.left = (pct * 100) + '%';
    if (track) track.style.width = (pct * 100) + '%';
  }

  function setValue(v) {
    value = Math.max(0, Math.min(100, v));
    el.dataset.value = value;
    updateUI();
    if (onChange) onChange(value);
  }

  function handlePointer(clientX) {
    const rect = el.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    setValue(Math.round(pct * 100));
  }

  el.addEventListener('mousedown', (e) => {
    dragging = true;
    handlePointer(e.clientX);
  });
  el.addEventListener('touchstart', (e) => {
    dragging = true;
    handlePointer(e.touches[0].clientX);
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    handlePointer(e.clientX);
  });
  document.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    handlePointer(e.touches[0].clientX);
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('mouseup', () => { dragging = false; });
  document.addEventListener('touchend', () => { dragging = false; });

  updateUI();
  return { setValue };
}

// ============================ CONTROLS ============================
function bindControls() {
  // Level 1
  const swIntensitySlider = document.getElementById('swIntensity');
  const swSpeedSlider = document.getElementById('swSpeed');
  const swCmeBtn = document.getElementById('swCmeBtn');
  if (swIntensitySlider) {
    swIntensitySlider.addEventListener('input', () => {
      swIntensity = parseInt(swIntensitySlider.value);
      document.getElementById('swIntensityVal').textContent = swIntensity + '%';
    });
  }
  if (swSpeedSlider) {
    swSpeedSlider.addEventListener('input', () => {
      swSpeed = parseInt(swSpeedSlider.value);
      document.getElementById('swSpeedVal').textContent = swSpeed + ' km/s';
    });
  }
  if (swCmeBtn) {
    swCmeBtn.addEventListener('click', () => {
      swCmeActive = true; swCmeTimer = 2.0;
      swIntensitySlider.value = 95; swIntensity = 95;
      document.getElementById('swIntensityVal').textContent = '95%';
      swSpeedSlider.value = 1000; swSpeed = 1000;
      document.getElementById('swSpeedVal').textContent = '1000 km/s';
    });
  }

  // Level 2 — sliders initialized by inline script in HTML (bypasses browser cache issues)
  const magLaunchBtn = document.getElementById('magLaunchBtn');
  if (magLaunchBtn) {
    magLaunchBtn.addEventListener('click', () => {
      const sx = magW * (magSourceX / 100), sy = magH * (magSourceY / 100);
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        magParticles.push({
          x: sx + Math.cos(angle) * 5, y: sy + Math.sin(angle) * 5,
          vx: Math.cos(angle) * (1 + Math.random()), vy: Math.sin(angle) * (1 + Math.random()),
          trail: [], charge: Math.random() > 0.5 ? 1 : -1
        });
      }
    });
  }

  // Level 3
  const qGasSelect = document.getElementById('qGasSelect');
  const qCollideBtn = document.getElementById('qCollideBtn');
  if (qGasSelect) {
    qGasSelect.addEventListener('change', () => { qGas = qGasSelect.value; });
  }
  if (qCollideBtn) {
    qCollideBtn.addEventListener('click', triggerQuantumCollision);
  }

  // Level 4
  const labWindSlider = document.getElementById('labWind');
  const labHeightSlider = document.getElementById('labHeight');
  if (labWindSlider) {
    labWindSlider.addEventListener('input', () => {
      labWind = parseInt(labWindSlider.value);
      document.getElementById('labWindVal').textContent = labWind + '%';
    });
  }
  if (labHeightSlider) {
    labHeightSlider.addEventListener('input', () => {
      labHeight = parseInt(labHeightSlider.value);
      document.getElementById('labHeightVal').textContent = labHeight + ' km';
      updateLabInfo();
    });
  }

  // Molecule chips
  document.querySelectorAll('.molecule-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.dataset.type;
      labMolecules[type] = !labMolecules[type];
      chip.classList.toggle('active', labMolecules[type]);
      updateLabInfo();
    });
  });

  // Level nav
  document.querySelectorAll('.level-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.level-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const target = document.getElementById(item.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ============================ RESIZE ============================
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const h = resizeCanvas(heroCanvas); heroW = h.w; heroH = h.h;
    const sw = resizeCanvas(swCanvas); swW = sw.w; swH = sw.h;
    const m = resizeCanvas(magCanvas); magW = m.w; magH = m.h;
    const l = resizeCanvas(labCanvas); labW = l.w; labH = l.h;
    resizeCanvas(specCanvas);
  }, 150);
});

// ============================ INIT ============================
document.addEventListener('DOMContentLoaded', () => {
  initHero(); drawHero();
  initSolarWind(); drawSolarWind();
  initMagnetosphere(); drawMagnetosphere();
  initLab(); drawLab();
  initSpectrum(); drawSpectrum();
  animateQuantumOrbit();
  bindControls();
  updateLabInfo();
});
