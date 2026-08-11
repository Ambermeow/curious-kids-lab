/**
 * AURORA PHYSICS LAB — Physics Engine & Interactions
 * aurora-physics.js
 */

// ============================ CANVAS UTILITIES ============================
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

// ============================ CUSTOM SLIDER SYSTEM ============================
function initCustomSlider(sliderEl, onChange) {
  const thumb = sliderEl.querySelector('.custom-slider-thumb');
  const track = sliderEl.querySelector('.custom-slider-track');
  let value = parseFloat(sliderEl.dataset.value) || 0;
  let dragging = false;

  function updateUI() {
    const pct = value / 100;
    if (thumb) thumb.style.left = (pct * 100) + '%';
    if (track) track.style.width = (pct * 100) + '%';
  }

  function handlePointer(clientX) {
    const rect = sliderEl.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    value = Math.round(pct * 100);
    sliderEl.dataset.value = value;
    updateUI();
    if (onChange) onChange(value);
  }

  sliderEl.addEventListener('mousedown', (e) => {
    dragging = true;
    handlePointer(e.clientX);
  });
  sliderEl.addEventListener('touchstart', (e) => {
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
  return { setValue: (v) => { value = v; sliderEl.dataset.value = v; updateUI(); } };
}

// ============================ LEVEL NAVIGATION ============================
function initNav() {
  const navItems = document.querySelectorAll('.level-nav-item');
  const sections = ['level1','level2','level3','level4'];

  function updateActive() {
    const scrollY = window.scrollY + 120;
    let active = sections[0];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) active = id;
    });
    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.target === active);
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = document.getElementById(item.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  window.addEventListener('scroll', updateActive, { passive: true });
}

// ============================ HERO ANIMATION ============================
const heroCanvas = document.getElementById('heroCanvas');
let heroCtx, heroW, heroH, heroT = 0;
const heroParticles = [];

function initHero() {
  const s = setupCanvas(heroCanvas);
  heroCtx = s.ctx; heroW = s.w; heroH = s.h;
  for (let i = 0; i < 80; i++) heroParticles.push({
    x: Math.random() * s.w, y: Math.random() * s.h,
    vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.35 + 0.08,
    hue: Math.random() > 0.5 ? 130 : 270
  });
}

function drawHero() {
  heroT += 0.005;
  heroCtx.clearRect(0, 0, heroW, heroH);

  // Aurora bands
  for (let i = 0; i < 5; i++) {
    const y = heroH * 0.25 + Math.sin(heroT + i * 0.8) * heroH * 0.18;
    const g = heroCtx.createLinearGradient(0, y - 80, 0, y + 80);
    g.addColorStop(0, 'rgba(80,240,120,0)');
    g.addColorStop(0.5, `rgba(${70+i*40},255,${130+i*30},${0.08-i*0.012})`);
    g.addColorStop(1, 'rgba(80,240,120,0)');
    heroCtx.fillStyle = g; heroCtx.fillRect(0, y - 80, heroW, 160);
  }

  // Particles
  heroParticles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > heroW || p.y < 0 || p.y > heroH) {
      p.x = Math.random() * heroW; p.y = Math.random() * heroH;
    }
    heroCtx.beginPath(); heroCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    heroCtx.fillStyle = `hsla(${p.hue},65%,55%,${p.a})`; heroCtx.fill();
  });

  requestAnimationFrame(drawHero);
}

// ============================ LEVEL 1: SOLAR WIND ============================
const swCanvas = document.getElementById('solarWindCanvas');
let swCtx, swW, swH, swT = 0;
let swIntensity = 35, swSpeed = 450, swCME = 0;
const swParticles = [];

function initSolarWind() {
  const s = setupCanvas(swCanvas);
  swCtx = s.ctx; swW = s.w; swH = s.h;
  for (let i = 0; i < 80; i++) swParticles.push(newSwParticle());
}

function newSwParticle() {
  return {
    x: -30 - Math.random() * 120,
    y: Math.random() * (swH || 460),
    vx: (swSpeed / 80) + Math.random() * 2.5,
    vy: (Math.random() - 0.5) * 0.8,
    r: Math.random() * 1.5 + 0.5,
    isE: Math.random() > 0.45
  };
}

function drawSolarWind() {
  swT += 0.016;
  const target = Math.round((swIntensity / 100) * 80);
  while (swParticles.length < target) swParticles.push(newSwParticle());
  while (swParticles.length > target) swParticles.pop();

  swCtx.fillStyle = 'rgba(10,16,30,0.28)';
  swCtx.fillRect(0, 0, swW, swH);

  // Sun glow
  const sg = swCtx.createRadialGradient(0, swH * 0.5, 0, 0, swH * 0.5, swW * 0.35);
  const glowA = 0.15 + swCME * 0.25;
  sg.addColorStop(0, `rgba(255,140,40,${glowA})`);
  sg.addColorStop(0.5, `rgba(255,100,20,${glowA * 0.4})`);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  swCtx.fillStyle = sg; swCtx.fillRect(0, 0, swW * 0.4, swH);

  // CME burst
  if (swCME > 0.01) {
    swCME *= 0.985;
    const br = swW * 0.3 * (1 + swCME * 3);
    const bg = swCtx.createRadialGradient(0, swH * 0.5, 0, 0, swH * 0.5, br);
    bg.addColorStop(0, `rgba(255,80,20,${swCME * 0.4})`);
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    swCtx.fillStyle = bg; swCtx.fillRect(0, 0, swW, swH);
  }

  // Earth
  const ex = swW * 0.83, ey = swH * 0.5, er = swH * 0.2;
  const eg = swCtx.createRadialGradient(ex - er * 0.3, ey - er * 0.3, 0, ex, ey, er);
  eg.addColorStop(0, '#3b82f6'); eg.addColorStop(0.7, '#0d2840'); eg.addColorStop(1, 'rgba(5,10,20,0)');
  swCtx.fillStyle = eg; swCtx.beginPath(); swCtx.arc(ex, ey, er, 0, Math.PI * 2); swCtx.fill();

  // Bow shock
  swCtx.strokeStyle = 'rgba(120,160,255,0.1)';
  swCtx.lineWidth = 1;
  swCtx.beginPath();
  for (let t = 0; t <= 1; t += 0.02) {
    const bx = ex - er * 0.3 - t * swW * 0.22;
    const by = ey + Math.sin(t * Math.PI) * er * 1.8 * (1 - t * 0.3);
    t === 0 ? swCtx.moveTo(bx, by) : swCtx.lineTo(bx, by);
  }
  swCtx.stroke();
  swCtx.beginPath();
  for (let t = 0; t <= 1; t += 0.02) {
    const bx = ex - er * 0.3 - t * swW * 0.22;
    const by = ey - Math.sin(t * Math.PI) * er * 1.8 * (1 - t * 0.3);
    t === 0 ? swCtx.moveTo(bx, by) : swCtx.lineTo(bx, by);
  }
  swCtx.stroke();

  // Particles
  const speedMul = (swSpeed / 450) * (1 + swCME * 2.5);
  swParticles.forEach(p => {
    p.x += p.vx * speedMul;
    p.y += p.vy + Math.sin(swT * 2.5 + p.x * 0.02) * 0.3;
    if (p.x > swW + 30 || p.y < -10 || p.y > swH + 10) Object.assign(p, newSwParticle());

    const dx = p.x - ex, dy = p.y - ey, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < er * 2.5 && dist > er) {
      const deflect = (1 - (dist - er) / (er * 1.5)) * 0.08;
      p.vy += (dy / dist) * deflect * (p.isE ? 1 : -1);
      p.vx -= Math.abs(deflect) * 0.3;
    }
    if (dist < er) Object.assign(p, newSwParticle());

    swCtx.beginPath(); swCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    swCtx.fillStyle = p.isE
      ? `rgba(100,200,255,${0.7 + Math.sin(swT * 4 + p.x) * 0.3})`
      : `rgba(255,120,100,0.6)`;
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

function getBField(x, y) {
  const cx = magW * 0.5, cy = magH * 0.5;
  const dx = x - cx, dy = y - cy;
  const r2 = dx * dx + dy * dy;
  const r = Math.sqrt(r2);
  if (r < 25) return { bx: 0, by: 0 };

  // Dipole: Br = 2cos(theta)/r^3, Btheta = sin(theta)/r^3
  const cosT = dy / r, sinT = dx / r;
  const Bmag = 1 / (r2 * r);
  const Br = 2 * Bmag * cosT;
  const Bt = Bmag * sinT;
  // Convert polar to cartesian: Bx = Br*sinT + Bt*cosT, By = Br*cosT - Bt*sinT
  const bx = Br * sinT + Bt * cosT;
  const by = Br * cosT - Bt * sinT;
  const norm = Math.sqrt(bx * bx + by * by);
  if (norm < 1e-10) return { bx: 0, by: 0 };
  return { bx: bx * 180000 / norm, by: by * 180000 / norm };
}

function drawMagnetosphere() {
  magT += 0.016;
  magCtx.fillStyle = '#080818';
  magCtx.fillRect(0, 0, magW, magH);

  const cx = magW * 0.5, cy = magH * 0.5;

  // Field lines (dipole)
  magCtx.strokeStyle = 'rgba(140,160,255,0.18)';
  magCtx.lineWidth = 1.2;
  for (let L = 0.4; L <= 1.6; L += 0.25) {
    [-1, 1].forEach(sign => {
      magCtx.beginPath();
      let first = true;
      for (let t = 0.05; t < Math.PI; t += 0.03) {
        const r = magH * 0.28 * L * Math.sin(t) * Math.sin(t);
        if (r < 5 || r > magW * 0.8) continue;
        const px = cx + r * Math.cos(t);
        const py = cy - sign * r * Math.sin(t);
        if (first) { magCtx.moveTo(px, py); first = false; }
        else magCtx.lineTo(px, py);
      }
      magCtx.stroke();
    });
  }

  // Earth
  const eg = magCtx.createRadialGradient(cx - 10, cy - 10, 0, cx, cy, 30);
  eg.addColorStop(0, '#60a5fa'); eg.addColorStop(1, '#1e3a5a');
  magCtx.fillStyle = eg; magCtx.beginPath(); magCtx.arc(cx, cy, 26, 0, Math.PI * 2); magCtx.fill();

  // Auroral glow at poles
  [1, -1].forEach(sign => {
    const ag = magCtx.createRadialGradient(cx, cy + sign * 52, 0, cx, cy + sign * 52, 32);
    ag.addColorStop(0, 'rgba(80,255,120,0.3)');
    ag.addColorStop(1, 'rgba(80,255,120,0)');
    magCtx.fillStyle = ag;
    magCtx.fillRect(cx - 40, cy + sign * 52 - 40, 80, 80);
  });

  // Source marker
  const sx = magW * (magSourceX / 100), sy = magH * (magSourceY / 100);
  magCtx.strokeStyle = 'rgba(255,200,100,0.55)';
  magCtx.setLineDash([4, 4]);
  magCtx.beginPath(); magCtx.arc(sx, sy, 10, 0, Math.PI * 2); magCtx.stroke();
  magCtx.setLineDash([]);

  // Particles
  for (let i = magParticles.length - 1; i >= 0; i--) {
    const p = magParticles[i];
    const B = getBField(p.x, p.y);
    const qB = p.charge * 0.06;
    p.vx += B.bx * qB;
    p.vy += B.by * qB;
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 3) { const s = 3 / speed; p.vx *= s; p.vy *= s; }
    p.x += p.vx;
    p.y += p.vy;
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 120) p.trail.shift();

    // Remove if too far
    const dcx = p.x - cx, dcy = p.y - cy;
    if (Math.sqrt(dcx * dcx + dcy * dcy) > magW * 0.8 || p.trail.length > 200) {
      magParticles.splice(i, 1); continue;
    }

    // Draw trail
    magCtx.beginPath();
    const tl = p.trail.length;
    for (let j = 0; j < tl; j++) {
      const t = p.trail[j], alpha = j / tl * 0.7;
      const px2 = t.x, py2 = t.y;
      if (j === 0) magCtx.moveTo(px2, py2);
      else magCtx.lineTo(px2, py2);
    }
    const hue = p.charge > 0 ? 140 : 280;
    magCtx.strokeStyle = `hsla(${hue},80%,60%,0.6)`;
    magCtx.lineWidth = 1.5;
    magCtx.stroke();

    // Draw particle head
    magCtx.beginPath(); magCtx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    magCtx.fillStyle = p.charge > 0 ? '#4ade80' : '#a78bfa';
    magCtx.fill();
  }

  requestAnimationFrame(drawMagnetosphere);
}

// ============================ LEVEL 3: QUANTUM JUMP ============================
let qGas = 'oxygen', qAnimating = false;
const qElectron = document.getElementById('qElectron');
const qPhoton = document.getElementById('qPhoton');
const quantumStage = document.getElementById('quantumStage');

const qColors = {
  'oxygen': { color: '#22c55e', nm: 557.7, name: '黄绿光', orbit: 2 },
  'oxygen-high': { color: '#ef4444', nm: 630.0, name: '深红光', orbit: 3 },
  'nitrogen': { color: '#a78bfa', nm: 427.8, name: '紫蓝光', orbit: 2 },
  'nitrogen-ion': { color: '#818cf8', nm: 391.4, name: '蓝紫光', orbit: 1 }
};

const orbitRadii = [40, 70, 100];

function triggerQuantumCollision() {
  if (qAnimating) return;
  qAnimating = true;
  const info = qColors[qGas] || qColors['oxygen'];
  const stageRect = quantumStage.getBoundingClientRect();
  const cx = stageRect.width / 2, cy = stageRect.height / 2;

  // Reset
  qPhoton.classList.remove('burst');
  qPhoton.style.background = info.color;
  qPhoton.style.opacity = '0';
  qPhoton.style.transform = '';

  // Step 1: Electron jumps to excited orbit
  const excitedR = orbitRadii[info.orbit] || 70;
  const angle = Math.random() * Math.PI * 2;
  const ex = cx + Math.cos(angle) * excitedR - 6;
  const ey = cy + Math.sin(angle) * excitedR - 6;
  qElectron.style.transition = 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)';
  qElectron.style.top = ey + 'px';
  qElectron.style.left = ex + 'px';
  qElectron.style.boxShadow = '0 0 24px rgba(255,255,100,0.9)';

  const label = document.getElementById('qStateLabel');
  if (label) label.textContent = '激发态 A* — 电子跃迁中...';

  // Step 2: After ~800ms, electron falls back with photon emission
  setTimeout(() => {
    const groundR = 40;
    const gx = cx + Math.cos(angle + 0.5) * groundR - 6;
    const gy = cy + Math.sin(angle + 0.5) * groundR - 6;
    qElectron.style.transition = 'all 0.4s cubic-bezier(0.22,0.61,0.36,1)';
    qElectron.style.top = gy + 'px';
    qElectron.style.left = gx + 'px';
    qElectron.style.boxShadow = '0 0 12px rgba(96,165,250,0.7)';

    // Photon burst
    const px = gx + 6, py = gy + 6;
    qPhoton.style.left = px + 'px';
    qPhoton.style.top = py + 'px';
    qPhoton.style.background = info.color;
    qPhoton.classList.add('burst');

    if (label) label.textContent = '基态 — 光子已释放 (' + info.nm + ' nm ' + info.name + ')';

    setTimeout(() => {
      qAnimating = false;
      qPhoton.classList.remove('burst');
      qPhoton.style.opacity = '0';
    }, 1300);
  }, 800);
}

// Orbit animation
function animateQuantumOrbit() {
  if (qAnimating) { requestAnimationFrame(animateQuantumOrbit); return; }
  requestAnimationFrame(animateQuantumOrbit);
}

// ============================ LEVEL 4: AURORA COLOR LAB ============================
const labCanvas = document.getElementById('auroraLabCanvas');
let labCtx, labW, labH, labT = 0;
let labWind = 45, labHeight = 180;
let activeMolecules = { oxygen: true, nitrogen: true, nitrogenIon: false, helium: false };

function initLab() {
  const s = setupCanvas(labCanvas);
  labCtx = s.ctx; labW = s.w; labH = s.h;
}

function drawAuroraLayer(yBase, amp, hue, alpha, freq, phase) {
  labCtx.save();
  const g = labCtx.createLinearGradient(0, yBase - amp, 0, yBase + amp);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.3, `hsla(${hue},80%,55%,${alpha})`);
  g.addColorStop(0.5, `hsla(${hue},90%,65%,${alpha * 1.2})`);
  g.addColorStop(0.7, `hsla(${hue},80%,55%,${alpha})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');

  labCtx.fillStyle = g;
  labCtx.beginPath();
  for (let x = 0; x <= labW; x += 2) {
    const nx = x / labW;
    const y = yBase + Math.sin(nx * freq + phase) * amp * 0.7
      + Math.sin(nx * freq * 2.7 + phase * 1.3) * amp * 0.3
      + Math.sin(nx * 12 + phase * 0.5) * amp * 0.15;
    if (x === 0) labCtx.moveTo(x, y);
    else labCtx.lineTo(x, y);
  }
  for (let x = labW; x >= 0; x -= 2) {
    const nx = x / labW;
    const y = yBase + Math.sin(nx * freq + phase) * amp * 0.7
      + Math.sin(nx * freq * 2.7 + phase * 1.3) * amp * 0.3
      + Math.sin(nx * 12 + phase * 0.5) * amp * 0.15;
    labCtx.lineTo(x, y + amp * 0.3);
  }
  labCtx.closePath();
  labCtx.fill();
  labCtx.restore();
}

function drawLab() {
  labT += 0.012;
  const windFactor = labWind / 100;

  // Dark sky gradient
  const skyG = labCtx.createLinearGradient(0, 0, 0, labH);
  skyG.addColorStop(0, '#020818');
  skyG.addColorStop(0.3, '#0a1030');
  skyG.addColorStop(0.6, '#0d1835');
  skyG.addColorStop(1, '#0a0a1a');
  labCtx.fillStyle = skyG;
  labCtx.fillRect(0, 0, labW, labH);

  // Stars
  labCtx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137.5 + 42) % labW;
    const sy = (i * 73.1 + 17) % (labH * 0.6);
    const sr = ((i * 3.7) % 2) * 0.5 + 0.5;
    const sa = 0.3 + Math.sin(labT * 0.7 + i) * 0.3;
    labCtx.globalAlpha = Math.max(0, sa);
    labCtx.beginPath(); labCtx.arc(sx, sy, sr, 0, Math.PI * 2); labCtx.fill();
  }
  labCtx.globalAlpha = 1;

  // Map height to Y position on canvas
  const altY = labH * (1 - (labHeight - 80) / 420);
  const amp = 35 + windFactor * 80;

  // 🔴🟢 核心物理修正：基于高度的碰撞猝灭方程
  const layers = [];
  
  if (activeMolecules.oxygen) {
    // 1. 绿光 (557.7 nm): 在 100-150km 达到峰值，300km 以上急剧衰减
    let greenAlpha = 0;
    if (labHeight <= 150) {
      greenAlpha = 0.1 + 0.5 * ((labHeight - 80) / 70); // 80~150km逐渐增强
    } else if (labHeight > 150 && labHeight <= 320) {
      greenAlpha = 0.6 * (1 - (labHeight - 150) / 170); // 150km以上逐渐衰减至0
    }
    if (greenAlpha > 0) {
      layers.push({ hue: 130, alpha: greenAlpha, freq: 4, phase: labT * 0.8, offset: 0, ampMul: 1 });
    }

    // 2. 红光 (630.0 nm): 160km 以下被碰撞猝灭，高空成为绝对主导
    let redAlpha = 0;
    if (labHeight > 160) {
      redAlpha = 0.8 * Math.min(1, (labHeight - 160) / 140); // 160km起攀升，300km达到峰值
    }
    if (redAlpha > 0) {
      layers.push({ hue: 0, alpha: redAlpha, freq: 5, phase: labT, offset: -5, ampMul: 1.2 });
    }
  }

  // 3. 氮分子/离子: 仅在低空 (<= 130km) 活跃
  let nitrogenAlpha = 0;
  if (labHeight <= 130) {
    nitrogenAlpha = 0.45 * (1 - (labHeight - 80) / 50); // 越低越明显
  }
  if (nitrogenAlpha > 0) {
    if (activeMolecules.nitrogen) {
      layers.push({ hue: 270, alpha: nitrogenAlpha * 0.8, freq: 6, phase: labT * 1.1 + 1, offset: 8, ampMul: 0.6 }); // Purple
    }
    if (activeMolecules.nitrogenIon) {
      layers.push({ hue: 230, alpha: nitrogenAlpha, freq: 5.5, phase: labT * 0.9 + 0.5, offset: -8, ampMul: 0.5 }); // Blue
    }
  }

  // 4. 氦原子: 仅在极高空可见，修正在光谱中的颜色为黄橙色 (Hue: 35)
  if (activeMolecules.helium) {
    let heAlpha = 0;
    if (labHeight > 250) {
      heAlpha = 0.3 * Math.min(1, (labHeight - 250) / 150);
    }
    if (heAlpha > 0) {
      layers.push({ hue: 35, alpha: heAlpha, freq: 7, phase: labT * 0.7 + 2, offset: 0, ampMul: 0.55 });
    }
  }

  // 渲染所有激活的光带
  layers.forEach(l => {
    drawAuroraLayer(altY + l.offset, amp * l.ampMul, l.hue, l.alpha, l.freq, l.phase);
  });

  // Ground silhouette & Altitude indicator
  labCtx.fillStyle = '#050510';
  labCtx.fillRect(0, labH - 30, labW, 30);

  labCtx.fillStyle = 'rgba(255,255,255,0.4)';
  labCtx.font = '11px "JetBrains Mono", monospace';
  labCtx.fillText(labHeight + ' km', 10, altY - 10);
  labCtx.strokeStyle = 'rgba(255,255,255,0.2)';
  labCtx.setLineDash([3, 6]);
  labCtx.beginPath(); labCtx.moveTo(50, altY); labCtx.lineTo(labW - 10, altY); labCtx.stroke();
  labCtx.setLineDash([]);

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
  specCtx.clearRect(0, 0, specW, specH);

  // Visible spectrum 380nm - 700nm
  const nmStart = 380, nmEnd = 700;
  const nmRange = nmEnd - nmStart;

  for (let x = 0; x < specW; x++) {
    const nm = nmStart + (x / specW) * nmRange;
    const { r, g, b } = wavelengthToRGB(nm);
    specCtx.fillStyle = `rgb(${r},${g},${b})`;
    specCtx.fillRect(x, 0, 1, specH);
  }

  // Draw active lines
  const lines = getActiveSpectralLines();
  lines.forEach(line => {
    const x = ((line.nm - nmStart) / nmRange) * specW;
    specCtx.strokeStyle = 'rgba(255,255,255,0.9)';
    specCtx.lineWidth = 1.5;
    specCtx.beginPath(); specCtx.moveTo(x, 0); specCtx.lineTo(x, specH); specCtx.stroke();
    specCtx.fillStyle = '#fff';
    specCtx.font = '10px "JetBrains Mono", monospace';
    specCtx.fillText(line.nm + 'nm', x + 3, specH - 5);
  });

  requestAnimationFrame(drawSpectrum);
}

function wavelengthToRGB(nm) {
  let r, g, b;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; g = 0; b = 1; }
  else if (nm >= 440 && nm < 490) { r = 0; g = (nm - 440) / 50; b = 1; }
  else if (nm >= 490 && nm < 510) { r = 0; g = 1; b = -(nm - 510) / 20; }
  else if (nm >= 510 && nm < 580) { r = (nm - 510) / 70; g = 1; b = 0; }
  else if (nm >= 580 && nm < 645) { r = 1; g = -(nm - 645) / 65; b = 0; }
  else if (nm >= 645 && nm <= 700) { r = 1; g = 0; b = 0; }
  else { r = 0; g = 0; b = 0; }

  let fac = 1;
  if (nm >= 380 && nm < 420) fac = 0.3 + 0.7 * (nm - 380) / 40;
  else if (nm >= 645 && nm <= 700) fac = 0.3 + 0.7 * (700 - nm) / 55;

  return {
    r: Math.round(r * fac * 255),
    g: Math.round(g * fac * 255),
    b: Math.round(b * fac * 255)
  };
}

function getActiveSpectralLines() {
  const lines = [];
  
  if (activeMolecules.oxygen) {
    if (labHeight > 160) lines.push({ nm: 630.0 }); // 随红光出现
    if (labHeight < 320) lines.push({ nm: 557.7 }); // 随绿光消失
  }
  
  if (labHeight <= 130) {
    if (activeMolecules.nitrogenIon || activeMolecules.nitrogen) {
      lines.push({ nm: 391.4 });
      lines.push({ nm: 427.8 });
    }
  }
  
  if (activeMolecules.helium && labHeight > 250) {
    lines.push({ nm: 587.6 });
  }
  
  return lines;
}

// ============================ COLOR LAB INFO ============================
function updateLabInfo() {
  const title = document.getElementById('labColorTitle');
  const desc = document.getElementById('labColorDesc');
  if (!title || !desc) return;

  if (labHeight > 250 && activeMolecules.oxygen) {
    title.textContent = '深红色极光';
    desc.textContent = '当前高度 ' + labHeight + ' km，高空气体极其稀薄。氧原子 ¹D 态在此高度不再被碰撞猝灭，完美释放 630.0 nm 深红光。同时发绿光的 ¹S 态原子数量急剧衰减，红光成为绝对主导。';
  } else if (labHeight >= 100 && labHeight <= 250 && activeMolecules.oxygen) {
    title.textContent = '黄绿色极光';
    desc.textContent = '当前高度 ' + labHeight + ' km，大气密度适中。氧原子被激发后在 0.7 秒内释放 557.7 nm 绿光。而原本会发红光的 ¹D 态原子因为寿命长达 110 秒，在此高度完全被碰撞猝灭，红光被“物理没收”。';
  } else if (labHeight < 100 && (activeMolecules.nitrogen || activeMolecules.nitrogenIon)) {
    title.textContent = '紫蓝色极光（下边缘）';
    desc.textContent = '当前高度 ' + labHeight + ' km，深入稠密大气层。极高能电子穿透至此并电离氮气。氮离子 N₂⁺ 第一负带系释放 391.4 nm 和 427.8 nm 的蓝紫光，形成极光帘幕的底部粉紫边缘。';
  } else if (activeMolecules.helium && labHeight > 250) {
    title.textContent = '黄橙色极光';
    desc.textContent = '当前高度 ' + labHeight + ' km，氦原子 He 贡献 D3 谱线（587.6 nm，黄橙色）。这种颜色极为罕见，仅在高纬度强烈地磁暴期间的高空偶尔出现。';
  } else {
    title.textContent = '混合极光 / 微弱信号';
    desc.textContent = '当前高度与气体配置未产生标志性的单一强光。请继续调整高度滑块或切换气体成分。';
  }
}

// ============================ CONTROLS ============================
function bindControls() {
  // Level 1 sliders
  initCustomSlider(document.getElementById('swIntensitySlider'), (v) => {
    swIntensity = v;
    document.getElementById('swIntensity').value = v;
    document.getElementById('swIntensityVal').textContent = v + '%';
  });
  initCustomSlider(document.getElementById('swSpeedSlider'), (v) => {
    swSpeed = Math.round(200 + (v / 100) * 1000);
    document.getElementById('swSpeed').value = swSpeed;
    document.getElementById('swSpeedVal').textContent = swSpeed + ' km/s';
  });

  // CME button
  document.getElementById('swCmeBtn').addEventListener('click', () => {
    swCME = 1;
    const islider = document.getElementById('swIntensitySlider');
    if (islider) {
      const setFn = initCustomSlider(islider, () => {});
      setFn.setValue(95);
      swIntensity = 95;
      document.getElementById('swIntensity').value = 95;
      document.getElementById('swIntensityVal').textContent = '95%';
    }
    const sslider = document.getElementById('swSpeedSlider');
    if (sslider) {
      const setFn2 = initCustomSlider(sslider, () => {});
      setFn2.setValue(100);
      swSpeed = 1200;
      document.getElementById('swSpeed').value = 1200;
      document.getElementById('swSpeedVal').textContent = '1200 km/s';
    }
  });

  // Level 2 sliders
  initCustomSlider(document.getElementById('magSourceXSlider'), (v) => {
    magSourceX = v;
    document.getElementById('magSourceX').value = v;
  });
  initCustomSlider(document.getElementById('magSourceYSlider'), (v) => {
    magSourceY = v;
    document.getElementById('magSourceY').value = v;
  });

  // Launch particles
  document.getElementById('magLaunchBtn').addEventListener('click', () => {
    const sx = magW * (magSourceX / 100), sy = magH * (magSourceY / 100);
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 1.5;
      magParticles.push({
        x: sx + Math.cos(angle) * 6,
        y: sy + Math.sin(angle) * 6,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        trail: [],
        charge: Math.random() > 0.5 ? 1 : -1
      });
    }
  });

  // Level 3
  document.getElementById('qGasSelect').addEventListener('change', (e) => {
    qGas = e.target.value;
  });
  document.getElementById('qCollideBtn').addEventListener('click', triggerQuantumCollision);

  // Level 4 sliders
  initCustomSlider(document.getElementById('labWindSlider'), (v) => {
    labWind = v;
    document.getElementById('labWind').value = v;
    document.getElementById('labWindVal').textContent = v + '%';
  });
  initCustomSlider(document.getElementById('labHeightSlider'), (v) => {
    labHeight = Math.round(80 + (v / 100) * 420);
    document.getElementById('labHeight').value = labHeight;
    document.getElementById('labHeightVal').textContent = labHeight + ' km';
    updateLabInfo();
  });

  // Molecule chips
  document.querySelectorAll('.molecule-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const type = chip.dataset.type;
      if (type === 'oxygen') activeMolecules.oxygen = chip.classList.contains('active');
      if (type === 'nitrogen') activeMolecules.nitrogen = chip.classList.contains('active');
      if (type === 'nitrogenIon') activeMolecules.nitrogenIon = chip.classList.contains('active');
      if (type === 'helium') activeMolecules.helium = chip.classList.contains('active');
      updateLabInfo();
    });
  });
}

// ============================ WINDOW RESIZE ============================
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const s = setupCanvas(heroCanvas);
    heroCtx = s.ctx; heroW = s.w; heroH = s.h;

    const s1 = setupCanvas(swCanvas);
    swCtx = s1.ctx; swW = s1.w; swH = s1.h;

    const s2 = setupCanvas(magCanvas);
    magCtx = s2.ctx; magW = s2.w; magH = s2.h;

    const s4 = setupCanvas(labCanvas);
    labCtx = s4.ctx; labW = s4.w; labH = s4.h;

    const s5 = setupCanvas(specCanvas);
    specCtx = s5.ctx; specW = s5.w; specH = s5.h;
  }, 200);
});

// ============================ INIT ============================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHero(); drawHero();
  initSolarWind(); drawSolarWind();
  initMagnetosphere(); drawMagnetosphere();
  initLab(); drawLab();
  initSpectrum(); drawSpectrum();
  animateQuantumOrbit();
  bindControls();
  updateLabInfo();
});
