/* Voice Detective Lab — all signal processing stays in the visitor's browser. */
const CONFIG = { frameSize: 1024, hopSize: 256, melBands: 40, coefficients: 13, history: 180 };
const FEATURED_FILTER_BANDS = [0, 2, 4, 7, 11, 16, 21, 27, 33, 39];
const commands = [
  { id: 'turn-on', zh: '打开台灯', en: 'Turn on light' },
  { id: 'turn-off', zh: '关闭台灯', en: 'Turn off light' },
  { id: 'play', zh: '播放音乐', en: 'Play music' },
  { id: 'stop', zh: '停止播放', en: 'Stop playing' },
];

const FILTER_STORIES = [
  { zh: ['低频地基', '它给很慢的振动较高权重。这里常含有发声的“底座”，但它不等于某一个音高。'], en: ['Low foundation', 'It gives slow vibrations more weight. This area often carries the base of voicing, but it is not one single pitch.'] },
  { zh: ['低频共鸣', '它把相邻的低频桶一起收集。三角形会和邻居重叠，所以能量不会被硬切成两半。'], en: ['Low resonance', 'It gathers neighbouring low-frequency bins together. The triangle overlaps its neighbours, so energy is never chopped sharply in half.'] },
  { zh: ['低音区轮廓', '它开始描述低频能量是平还是鼓起。元音时，声道的宽大共鸣会让某些区域变亮。'], en: ['Low-band contour', 'It starts describing whether low-frequency energy is flat or bulging. During vowels, broad vocal-tract resonances can brighten some regions.'] },
  { zh: ['元音线索', '它覆盖一个较宽的频率邻域，帮助观察第一个共振峰附近的能量走向；这是口形线索之一，不是直接量尺。'], en: ['Vowel clue', 'It covers a wider frequency neighbourhood and helps observe energy near the first resonance; that is one mouth-shape clue, not a direct ruler.'] },
  { zh: ['口腔共鸣', '这个中频区域常参与元音对比。张口大小、舌位和嘴唇都会共同改变这里的谱包络。'], en: ['Mouth resonance', 'This mid band often helps compare vowels. Jaw opening, tongue placement, and lips all shape this spectral envelope together.'] },
  { zh: ['清晰度线索', '它收集更靠上的中频能量。不同辅音接到元音前后时，这里的亮暗常会改变。'], en: ['Clarity cue', 'It gathers higher mid-band energy. When different consonants join a vowel, brightness here often changes.'] },
  { zh: ['中高频变化', '频带到这里变宽，是 Mel 尺度“高频分得更粗”的例子。它仍保留发音方式的轮廓，而非每条细谐波。'], en: ['Mid-high change', 'Bands are wider here: an example of the Mel scale being coarser at high frequency. It keeps articulation shape, not every fine harmonic.'] },
  { zh: ['辅音边缘', '快速的 /s/、/sh/ 一类摩擦声会让中高频能量变化。这个滤波器只报告这一带有多少能量。'], en: ['Consonant edge', 'Fast friction sounds such as /s/ or /sh/ can change mid-high energy. This filter only reports how much energy lives nearby.'] },
  { zh: ['摩擦细节', '它观察较高频的“沙沙”线索。这里也更容易受麦克风、距离和环境噪声影响。'], en: ['Friction detail', 'It observes higher-frequency “hissy” clues. This area is also more sensitive to microphone, distance, and room noise.'] },
  { zh: ['最高频提示', '这是本页选出的最高频聚光灯。它不是最重要的万能滤波器，只是帮助展示：高频区域通常被合并得更宽。'], en: ['Highest hint', 'This is the highest spotlight on this page. It is not a universally most important filter; it shows how high-frequency regions are usually pooled more broadly.'] },
];

const COEFFICIENT_INFO = [
  { zh: ['整体对数能量', '它混合所有 Mel 能量的总量。通常与这一帧有多响有关；有的工业配置会单独用能量，或不保留 C0。', '它不是音高。'], en: ['Overall log energy', 'It mixes the total across all Mel energies. It often tracks how loud this frame is; some industrial setups use energy separately or omit C0.', 'It is not pitch.'] },
  { zh: ['低频—高频的总体倾斜', '它比较整张谱包络是偏厚、偏低频，还是偏亮、偏高频。声道形状、说话方式和麦克风都会参与。', '不是某一块舌头的读数。'], en: ['Overall low-to-high tilt', 'It compares whether the envelope is thick and low or bright and high. Vocal-tract shape, speaking style, and microphone all contribute.', 'It is not a reading from one part of the tongue.'] },
  { zh: ['最宽的共振峰弯曲', '它混合全部 40 带，特别描述大起伏。对元音来说，它可能间接关联张口程度和第一共振峰。', '“间接关联”比“一一代表”更准确。'], en: ['Broadest resonance bend', 'It mixes all 40 bands to describe large curves. In vowels it may indirectly relate to jaw opening and the first resonance.', '“Indirectly related” is more accurate than “represents”.'] },
  { zh: ['第二层的大轮廓', '它记录共振峰之间怎样排布。元音中，第二共振峰常会受舌头前后位置影响，但这个系数同时混合其他线索。', '它只能提供线索，不能看见舌头。'], en: ['Second broad contour', 'It records how resonances are arranged. In vowels, the second resonance is often influenced by front-back tongue position, but this coefficient mixes other clues too.', 'It offers a clue; it cannot see a tongue.'] },
  { zh: ['中频包络变化', '它开始捕捉较细的“山丘”变化。口唇、舌位、下巴和发音过渡都会让它改变。', '它描述的是声音形状，不是人体传感器。'], en: ['Mid-band envelope change', 'It starts to capture smaller “hill” changes. Lips, tongue placement, jaw, and transitions can all change it.', 'It describes a sound shape, not a body sensor.'] },
  { zh: ['中频细节', '它补充前几个系数没有讲完的谱包络细节，常能帮助模型区别相近的音节。', '一个系数从不单独做决定。'], en: ['Mid-band detail', 'It adds spectral-envelope detail that earlier coefficients did not explain, often helping a model separate similar syllables.', 'One coefficient never decides alone.'] },
  { zh: ['中高频的发音方式', '它对从元音转向辅音时的谱形改变更敏感，例如送气或闭塞后的能量重新出现。', '也可能受噪声影响。'], en: ['Mid-high articulation', 'It is more sensitive to envelope changes when vowels move to consonants, such as energy returning after a stop or burst.', 'Noise can affect it too.'] },
  { zh: ['更细的谱形起伏', '它像用更细的画笔描包络。它能增加区分力，也开始更容易带进说话人、距离和设备差异。', '所以产品常配合归一化。'], en: ['Finer envelope ripples', 'It is like drawing the envelope with a finer brush. It can add distinction, but it can also bring in speaker, distance, and device differences.', 'That is why products often normalise.'] },
  { zh: ['高频局部结构', '它会注意到清擦音和摩擦声附近的变化，例如 /s/ 一类线索。', '它并不只等于“清晰”。'], en: ['High-frequency local shape', 'It can notice changes near hissy and friction sounds, such as clues from /s/.', 'It does not simply mean “clarity”.'] },
  { zh: ['高频局部结构', '它保留又一层较快的包络变化；在低信噪比环境里，它往往比低阶系数更不稳定。', '模型会结合所有帧判断。'], en: ['High-frequency local shape', 'It preserves another layer of faster envelope change; in noisy places it is often less stable than low-order coefficients.', 'A model combines all frames when deciding.'] },
  { zh: ['细粒度音色变化', '它描述较细的谱包络纹理。这里可能含有音色和说话人差异，所以不是“越大越好”的信息。', '训练决定哪些变化该忽略。'], en: ['Fine timbre variation', 'It describes fine spectral-envelope texture. This can contain timbre and speaker differences, so it is not information that is “better when bigger”.', 'Training decides which changes to ignore.'] },
  { zh: ['很细的谱包络变化', '它是本页保留的倒数第二层细节。保留太多高阶项会让噪声和设备差异更明显。', '维数是效果、速度和鲁棒性的取舍。'], en: ['Very fine envelope change', 'It is the second finest detail kept here. Keeping too many high-order terms can make noise and device differences more visible.', 'Dimension count balances accuracy, speed, and robustness.'] },
  { zh: ['本页保留的最细变化', 'C12 描述仍被保留的最快谱包络起伏。它补充细节，却不是一个稳定的“身份标签”。', 'MFCC 不是唯一声纹身份证。'], en: ['Finest change kept here', 'C12 describes the fastest spectral-envelope ripple still kept. It adds detail, but it is not a stable identity label.', 'MFCC is not a unique voice ID.'] },
];

const $ = (selector) => document.querySelector(selector);
const canvases = { waveform: $('#waveform'), filterbank: $('#filterbank'), mel: $('#mel-spectrogram'), mfcc: $('#mfcc-map'), live: $('#live-mfcc') };
let language = localStorage.getItem('voice-lab-language') || 'zh';
let context, activeId = 'turn-on', demoFrame = 0, demoSource, demoStartTime = 0, demoAnimation;
let micStream, micContext, analyser, micFilters, micAnimation, liveHistory = [], liveVectors = [];
let activeFilterBand = FEATURED_FILTER_BANDS[0], activeCoefficient = 0, latestRecognition = null, liveStatus = 'waiting';
let templates = readTemplates();
const cache = new Map();

function inLanguage(value) { return value[language]; }
function commandLabel(id) { return inLanguage(commands.find((command) => command.id === id)); }
function readTemplates() { try { return JSON.parse(localStorage.getItem('voice-lab-mfcc-templates') || '{}'); } catch { return {}; } }
function writeTemplates() { localStorage.setItem('voice-lab-mfcc-templates', JSON.stringify(templates)); }
function activeData() { return cache.get(activeId); }
function getAudioContext() { if (!context) context = new (window.AudioContext || window.webkitAudioContext)(); return context; }

async function setLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.dataset.lang = language;
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  $('#language-toggle').textContent = language === 'zh' ? 'EN' : '\u4E2D';
  $('#language-toggle').setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '\u5207\u6362\u5230\u4e2d\u6587');
  document.querySelectorAll('#template-command option').forEach((option) => { option.textContent = option.dataset[language]; });
  await loadCommands();
  chooseCommand(activeId);
  setActiveFilter(activeFilterBand);
  showCoefficient(activeCoefficient);
  refreshTemplateCount(); renderRecognition(); renderLiveStatus();
  localStorage.setItem('voice-lab-language', language);
}

function hzToMel(hz) { return 2595 * Math.log10(1 + hz / 700); }
function melToHz(mel) { return 700 * (Math.pow(10, mel / 2595) - 1); }
function hamming(size) { return Array.from({ length: size }, (_, index) => 0.54 - 0.46 * Math.cos((2 * Math.PI * index) / (size - 1))); }
const windowFn = hamming(CONFIG.frameSize);

function fftMagnitude(input) {
  const n = input.length, real = new Float32Array(input), imag = new Float32Array(n);
  for (let index = 1, swap = 0; index < n; index++) {
    let bit = n >> 1;
    for (; swap & bit; bit >>= 1) swap ^= bit;
    swap ^= bit;
    if (index < swap) { const realValue = real[index]; real[index] = real[swap]; real[swap] = realValue; }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1, angle = -2 * Math.PI / size, wpr = Math.cos(angle), wpi = Math.sin(angle);
    for (let start = 0; start < n; start += size) {
      let wr = 1, wi = 0;
      for (let k = 0; k < half; k++) {
        const even = start + k, odd = even + half, tr = wr * real[odd] - wi * imag[odd], ti = wr * imag[odd] + wi * real[odd];
        real[odd] = real[even] - tr; imag[odd] = imag[even] - ti; real[even] += tr; imag[even] += ti;
        const nextWr = wr * wpr - wi * wpi; wi = wr * wpi + wi * wpr; wr = nextWr;
      }
    }
  }
  const magnitude = new Float32Array(n / 2 + 1);
  for (let index = 0; index < magnitude.length; index++) magnitude[index] = (real[index] ** 2 + imag[index] ** 2) / n;
  return magnitude;
}

function makeMelFilters(sampleRate) {
  const maxBin = CONFIG.frameSize / 2, minMel = hzToMel(30), maxMel = hzToMel(sampleRate / 2);
  const points = Array.from({ length: CONFIG.melBands + 2 }, (_, index) => melToHz(minMel + (index * (maxMel - minMel)) / (CONFIG.melBands + 1)));
  const bins = points.map((hz) => Math.floor(((CONFIG.frameSize + 1) * hz) / sampleRate));
  return Array.from({ length: CONFIG.melBands }, (_, band) => {
    const values = new Float32Array(maxBin + 1), [left, center, right] = [bins[band], bins[band + 1], bins[band + 2]];
    for (let bin = Math.max(0, left); bin < Math.min(maxBin + 1, center); bin++) values[bin] = (bin - left) / Math.max(1, center - left);
    for (let bin = Math.max(0, center); bin <= Math.min(maxBin, right); bin++) values[bin] = (right - bin) / Math.max(1, right - center);
    return { values, left, center, right, hz: [points[band], points[band + 1], points[band + 2]] };
  });
}

function mfccFromPower(power, filters) {
  const mel = filters.map(({ values }) => {
    let energy = 0;
    for (let index = 0; index < Math.min(values.length, power.length); index++) energy += power[index] * values[index];
    return Math.log(Math.max(energy, 1e-10));
  });
  const coeffs = Array.from({ length: CONFIG.coefficients }, (_, coefficient) => {
    let sum = 0;
    for (let band = 0; band < mel.length; band++) sum += mel[band] * Math.cos((Math.PI * coefficient * (band + .5)) / mel.length);
    return sum * Math.sqrt(2 / mel.length);
  });
  return { mel, coeffs };
}

function analyseBuffer(buffer) {
  const source = buffer.getChannelData(0), filters = makeMelFilters(buffer.sampleRate), frames = [], melFrames = [], powers = [];
  for (let start = 0; start + CONFIG.frameSize <= source.length; start += CONFIG.hopSize) {
    const frame = new Float32Array(CONFIG.frameSize);
    for (let index = 0; index < CONFIG.frameSize; index++) frame[index] = source[start + index] * windowFn[index];
    const power = fftMagnitude(frame), { mel, coeffs } = mfccFromPower(power, filters);
    powers.push(power); melFrames.push(mel); frames.push(coeffs);
  }
  return { buffer, source, sampleRate: buffer.sampleRate, duration: buffer.duration, filters, frames, melFrames, powers };
}

async function loadCommandAudio(id) {
  const audioContext = getAudioContext();
  const url = `assets/${language}/${id}.wav`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

async function loadCommands() {
  const results = await Promise.all(commands.map(async (command) => {
    const buffer = await loadCommandAudio(command.id);
    return [command.id, analyseBuffer(buffer)];
  }));
  results.forEach(([id, data]) => cache.set(id, data));
}

function resizeCanvas(canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2), rect = canvas.getBoundingClientRect(), width = Math.max(1, Math.floor(rect.width * ratio)), height = Math.max(1, Math.floor(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  return canvas.getContext('2d');
}
function clear(ctx, canvas) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#17355d'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
function beginLine(ctx, color, width = 1) { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); }
function valueColor(value) {
  const stops = [[23, 53, 93], [43, 106, 144], [83, 174, 165], [244, 201, 93], [239, 144, 120]];
  const point = Math.max(0, Math.min(.999, value)) * (stops.length - 1), low = stops[Math.floor(point)], high = stops[Math.min(stops.length - 1, Math.ceil(point))], mix = point - Math.floor(point);
  return `rgb(${low.map((item, index) => Math.round(item + (high[index] - item) * mix)).join(',')})`;
}

function drawWaveform() {
  const data = activeData(); if (!data) return;
  const canvas = canvases.waveform, ctx = resizeCanvas(canvas), { width, height } = canvas, samples = Math.max(1, Math.floor(data.source.length / width)); clear(ctx, canvas);
  beginLine(ctx, '#9ae7d9', Math.max(1.2, width / 900));
  for (let x = 0; x < width; x++) {
    let minimum = 1, maximum = -1;
    for (let sample = 0; sample < samples; sample++) { const value = data.source[x * samples + sample] || 0; minimum = Math.min(minimum, value); maximum = Math.max(maximum, value); }
    if (x === 0) ctx.moveTo(x, height * .5 + minimum * height * .39); else ctx.lineTo(x, height * .5 + minimum * height * .39);
    ctx.lineTo(x, height * .5 + maximum * height * .39);
  }
  ctx.stroke();
  const marker = demoFrame / Math.max(1, data.frames.length - 1) * width; ctx.fillStyle = '#f4c95d'; ctx.fillRect(marker - 1, 0, 2, height);
}

function drawFilterbank() {
  const data = activeData(); if (!data) return;
  const canvas = canvases.filterbank, ctx = resizeCanvas(canvas), { width, height } = canvas, power = data.powers[Math.min(demoFrame, data.powers.length - 1)]; clear(ctx, canvas);
  let maximum = 0; for (const value of power) maximum = Math.max(maximum, Math.log1p(value * 1e6));
  beginLine(ctx, 'rgba(210,231,248,.45)', 1);
  for (let index = 0; index < power.length; index++) {
    const x = index / (power.length - 1) * width, y = height - (Math.log1p(power[index] * 1e6) / Math.max(maximum, .01)) * height * .75;
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  FEATURED_FILTER_BANDS.forEach((band, spotlight) => {
    const filter = data.filters[band], x1 = filter.left / (power.length - 1) * width, x2 = filter.center / (power.length - 1) * width, x3 = filter.right / (power.length - 1) * width, active = band === activeFilterBand;
    beginLine(ctx, active ? '#f4c95d' : 'rgba(154,231,217,.65)', active ? 2.3 : 1);
    ctx.moveTo(x1, height - 2); ctx.lineTo(x2, height * .12); ctx.lineTo(x3, height - 2); ctx.stroke();
    if (active) { ctx.fillStyle = '#f4c95d'; ctx.font = `${Math.max(11, Math.round(width / 67))}px ui-monospace, monospace`; ctx.fillText(`M${spotlight + 1}`, Math.max(3, x2 - 8), height * .12 - 7); }
  });
}

function drawHeatmap(canvas, data, rows, highlightFrame = null, options = {}) {
  const ctx = resizeCanvas(canvas); clear(ctx, canvas); if (!data?.length) return;
  const { width, height } = canvas, allValues = data.flat(), min = Math.min(...allValues), max = Math.max(...allValues), span = Math.max(.001, max - min);
  const rowRanges = options.byRow ? Array.from({ length: rows }, (_, row) => { const values = data.map((frame) => frame[row] ?? 0); const rowMin = Math.min(...values), rowMax = Math.max(...values); return [rowMin, Math.max(.001, rowMax - rowMin)]; }) : null;
  const cellWidth = width / data.length, cellHeight = height / rows;
  for (let column = 0; column < data.length; column++) for (let row = 0; row < rows; row++) {
    const value = data[column][row] ?? 0, [rangeMin, rangeSpan] = rowRanges ? rowRanges[row] : [min, span];
    ctx.fillStyle = valueColor((value - rangeMin) / rangeSpan); ctx.fillRect(column * cellWidth, row * cellHeight, Math.ceil(cellWidth) + .4, Math.ceil(cellHeight) + .4);
  }
  if (highlightFrame !== null) { ctx.fillStyle = 'rgba(255,247,191,.9)'; ctx.fillRect(highlightFrame * cellWidth - 1, 0, 2, height); }
  if (options.labels) { ctx.fillStyle = 'rgba(7,24,47,.7)'; ctx.font = `${Math.max(10, Math.round(width / 90))}px ui-monospace, monospace`; for (let row = 0; row < rows; row++) ctx.fillText(`C${row}`, 4, row * cellHeight + Math.min(cellHeight - 2, 12)); }
}

function renderDemo() {
  const data = activeData(); if (!data) return;
  drawWaveform(); drawFilterbank(); drawHeatmap(canvases.mel, data.melFrames, CONFIG.melBands, demoFrame); drawHeatmap(canvases.mfcc, data.frames, CONFIG.coefficients, demoFrame, { labels: true, byRow: true });
  $('#demo-time').textContent = `${((demoFrame * CONFIG.hopSize) / data.sampleRate).toFixed(2)} s`;
}

function showCoefficient(index) {
  activeCoefficient = index; const [title, explanation, caution] = inLanguage(COEFFICIENT_INFO[index]);
  $('#mfcc-detail').innerHTML = `<span class="coefficient-token">C${index}</span><div><h3>${title}</h3><p><strong>${language === 'zh' ? '它在混合：' : 'It mixes: '}</strong>${explanation} <strong>${caution}</strong></p></div>`;
}

function updateFilterReadout() {
  const data = activeData(); if (!data) return;
  const spotlight = FEATURED_FILTER_BANDS.indexOf(activeFilterBand), filter = data.filters[activeFilterBand], [title, story] = inLanguage(FILTER_STORIES[spotlight]);
  const energy = data.melFrames[Math.min(demoFrame, data.melFrames.length - 1)][activeFilterBand];
  const range = `${filter.hz[0].toFixed(0)}–${filter.hz[2].toFixed(0)} Hz`;
  $('#mel-readout').innerHTML = `<b>M${spotlight + 1} · ${title} · ${range}</b><br>${story} ${language === 'zh' ? `这一帧的 log-Mel 能量：${energy.toFixed(2)}。` : `This frame’s log-Mel energy: ${energy.toFixed(2)}.`}`;
}

function setActiveFilter(band) {
  if (!FEATURED_FILTER_BANDS.includes(band)) return;
  activeFilterBand = band;
  document.querySelectorAll('.filter-chip').forEach((chip) => chip.classList.toggle('is-active', Number(chip.dataset.filterBand) === band));
  updateFilterReadout(); drawFilterbank();
}

function installExploration() {
  [canvases.mfcc, canvases.live].forEach((canvas) => canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect(), row = Math.max(0, Math.min(12, Math.floor((event.clientY - rect.top) / rect.height * 13))); showCoefficient(row);
  }));
  canvases.filterbank.addEventListener('pointermove', (event) => {
    const data = activeData(); if (!data) return;
    const rect = canvases.filterbank.getBoundingClientRect(), bin = (event.clientX - rect.left) / rect.width * (CONFIG.frameSize / 2);
    const nearest = FEATURED_FILTER_BANDS.reduce((best, band) => Math.abs(data.filters[band].center - bin) < Math.abs(data.filters[best].center - bin) ? band : best, FEATURED_FILTER_BANDS[0]); setActiveFilter(nearest);
  });
  document.querySelectorAll('.filter-chip').forEach((chip) => {
    const activate = () => setActiveFilter(Number(chip.dataset.filterBand));
    chip.addEventListener('pointerenter', activate); chip.addEventListener('focus', activate); chip.addEventListener('click', activate);
  });
}

function chooseCommand(id) {
  activeId = id; demoFrame = 0;
  document.querySelectorAll('.command-button').forEach((button) => button.classList.toggle('is-active', button.dataset.command === id));
  const data = activeData(); $('#audio-duration').textContent = data ? `${data.duration.toFixed(2)} s` : '—'; $('#nyquist-label').textContent = data ? `${(data.sampleRate / 2000).toFixed(0)} kHz` : '8 kHz'; renderDemo(); updateFilterReadout();
}

function playDemo() {
  const data = activeData(); if (!data) return;
  const audioContext = getAudioContext(); audioContext.resume(); demoSource?.stop(); cancelAnimationFrame(demoAnimation);
  const source = audioContext.createBufferSource(); source.buffer = data.buffer; source.connect(audioContext.destination); demoSource = source; demoStartTime = audioContext.currentTime; source.start();
  const tick = () => {
    if (!demoSource) return;
    const elapsed = audioContext.currentTime - demoStartTime; demoFrame = Math.min(data.frames.length - 1, Math.floor(elapsed * data.sampleRate / CONFIG.hopSize)); renderDemo(); updateFilterReadout();
    if (elapsed < data.duration) demoAnimation = requestAnimationFrame(tick);
  };
  source.onended = () => { if (demoSource === source) { demoFrame = Math.max(0, data.frames.length - 1); renderDemo(); updateFilterReadout(); demoSource = null; } };
  tick();
}

function normalise(vector) { const useful = vector.slice(1), mean = useful.reduce((total, value) => total + value, 0) / useful.length, centered = useful.map((value) => value - mean), length = Math.hypot(...centered) || 1; return centered.map((value) => value / length); }
function average(vectors) { return vectors[0].map((_, index) => vectors.reduce((total, vector) => total + vector[index], 0) / vectors.length); }
function refreshTemplateCount() { const count = Object.keys(templates).length; $('#template-count').textContent = count ? (language === 'zh' ? `已保存 ${count} 个本地示范` : `${count} local sample${count === 1 ? '' : 's'} saved`) : (language === 'zh' ? '还没有本地示范' : 'No local samples yet'); }
function renderRecognition() {
  if (!Object.keys(templates).length) { $('#recognition-result').textContent = '—'; $('#recognition-desc').textContent = language === 'zh' ? '先说半秒左右，再把当前声音保存为一个本地示范。之后页面会比较最近的 MFCC 轨迹。' : 'Speak for about half a second, then save the current sound as a local sample. The page will compare recent MFCC trails.'; $('#confidence-meter').style.width = '0%'; return; }
  if (latestRecognition?.saved) { $('#recognition-result').textContent = language === 'zh' ? '已保存' : 'Saved'; $('#recognition-desc').textContent = language === 'zh' ? `“${commandLabel(latestRecognition.saved)}”的示范已留在这个浏览器。` : `A sample for “${commandLabel(latestRecognition.saved)}” is kept in this browser.`; $('#confidence-meter').style.width = '100%'; return; }
  if (!latestRecognition) { $('#recognition-result').textContent = language === 'zh' ? '等待声音' : 'Waiting for sound'; $('#recognition-desc').textContent = language === 'zh' ? '开始说话后，页面会比较最近的轨迹。' : 'Once you speak, the page will compare the recent trail.'; return; }
  const { id, distance, confidence } = latestRecognition; $('#recognition-result').textContent = commandLabel(id); $('#recognition-desc').textContent = language === 'zh' ? `最近 22 帧 MFCC 与本地示范的距离：${distance.toFixed(2)}。这是教学用的简单模板匹配。` : `Distance from the local sample over the latest 22 MFCC frames: ${distance.toFixed(2)}. This is a simple teaching template match.`; $('#confidence-meter').style.width = `${confidence}%`;
}
function updateRecognition() {
  if (liveVectors.length < 8 || !Object.keys(templates).length) return;
  const vector = normalise(average(liveVectors.slice(-22))), scores = Object.entries(templates).map(([id, template]) => ({ id, distance: Math.hypot(...vector.map((value, index) => value - template[index])) }));
  scores.sort((first, second) => first.distance - second.distance); const match = scores[0]; latestRecognition = { ...match, confidence: Math.max(0, Math.min(99, Math.round(100 * Math.exp(-match.distance * 1.5)))) }; renderRecognition();
}

function renderLiveStatus() {
  const labels = { waiting: language === 'zh' ? '等待麦克风授权' : 'Waiting for microphone permission', running: micContext ? `${Math.round(micContext.sampleRate / 1000)} kHz · ${language === 'zh' ? '正在本地处理' : 'processing on this device'}` : '', stopped: language === 'zh' ? '已停止（地图留在本页）' : 'Stopped (map stays here)', unsupported: language === 'zh' ? '这个浏览器不支持麦克风接口' : 'This browser does not support microphone input', denied: language === 'zh' ? '麦克风权限未授予' : 'Microphone permission was not granted', error: language === 'zh' ? '无法开启麦克风' : 'Could not start microphone' };
  $('#live-state').textContent = labels[liveStatus] || labels.waiting;
}

function processMicFrame() {
  if (!analyser || !micContext || !micFilters) return;
  const decibels = new Float32Array(analyser.frequencyBinCount); analyser.getFloatFrequencyData(decibels);
  const power = new Float32Array(decibels.length); for (let index = 0; index < decibels.length; index++) power[index] = Number.isFinite(decibels[index]) ? Math.pow(10, decibels[index] / 10) : 0;
  const { coeffs } = mfccFromPower(power, micFilters), waveform = new Float32Array(CONFIG.frameSize); analyser.getFloatTimeDomainData(waveform);
  const rms = Math.sqrt(waveform.reduce((sum, sample) => sum + sample * sample, 0) / waveform.length);
  if (rms > .006) { liveHistory.push(coeffs); liveVectors.push(coeffs); if (liveVectors.length > 260) liveVectors.shift(); } else liveHistory.push(Array(CONFIG.coefficients).fill(-16));
  if (liveHistory.length > CONFIG.history) liveHistory.shift(); drawHeatmap(canvases.live, liveHistory, CONFIG.coefficients, null, { labels: true, byRow: true }); updateRecognition(); micAnimation = requestAnimationFrame(processMicFrame);
}

async function startMic() {
  if (!navigator.mediaDevices?.getUserMedia) { liveStatus = 'unsupported'; renderLiveStatus(); return; }
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    micContext = new (window.AudioContext || window.webkitAudioContext)(); await micContext.resume(); analyser = micContext.createAnalyser(); analyser.fftSize = CONFIG.frameSize; analyser.smoothingTimeConstant = 0; micFilters = makeMelFilters(micContext.sampleRate);
    const silence = micContext.createGain(); silence.gain.value = 0; micContext.createMediaStreamSource(micStream).connect(analyser); analyser.connect(silence).connect(micContext.destination);
    liveHistory = []; liveVectors = []; latestRecognition = null; liveStatus = 'running'; $('#start-mic').disabled = true; $('#stop-mic').disabled = false; $('#save-template').disabled = false; renderLiveStatus(); renderRecognition(); processMicFrame();
  } catch (error) { liveStatus = error.name === 'NotAllowedError' ? 'denied' : 'error'; renderLiveStatus(); }
}
function stopMic() { cancelAnimationFrame(micAnimation); micStream?.getTracks().forEach((track) => track.stop()); micContext?.close(); micStream = null; analyser = null; micContext = null; micFilters = null; liveStatus = 'stopped'; $('#start-mic').disabled = false; $('#stop-mic').disabled = true; $('#save-template').disabled = true; renderLiveStatus(); }
function saveTemplate() {
  if (liveVectors.length < 18) { $('#recognition-desc').textContent = language === 'zh' ? '请先连续说话约半秒，再保存。' : 'Please speak continuously for about half a second before saving.'; return; }
  const id = $('#template-command').value; templates[id] = normalise(average(liveVectors.slice(-70))); writeTemplates(); latestRecognition = { saved: id }; refreshTemplateCount(); renderRecognition();
}
function clearTemplates() { templates = {}; latestRecognition = null; localStorage.removeItem('voice-lab-mfcc-templates'); refreshTemplateCount(); renderRecognition(); }

function renderAll() { renderDemo(); if (!micStream) drawHeatmap(canvases.live, liveHistory, CONFIG.coefficients, null, { labels: true, byRow: true }); }
async function boot() {
  try { await setLanguage(language); }
  catch (error) { $('#mel-readout').textContent = language === 'zh' ? '音频特征初始化失败，请刷新页面后重试。' : 'Audio feature setup failed. Please refresh and try again.'; console.error(error); }
  installExploration();
  document.querySelectorAll('.command-button').forEach((button) => button.addEventListener('click', () => chooseCommand(button.dataset.command)));
  $('#language-toggle').addEventListener('click', async () => { try { await setLanguage(language === 'zh' ? 'en' : 'zh'); } catch (e) { $('#mel-readout').textContent = language === 'zh' ? '语言切换时音频加载失败，请刷新后重试。' : 'Audio loading failed during language switch. Please refresh and try again.'; console.error(e); } });
  $('#play-demo').addEventListener('click', playDemo); $('#start-mic').addEventListener('click', startMic); $('#stop-mic').addEventListener('click', stopMic); $('#save-template').addEventListener('click', saveTemplate); $('#clear-templates').addEventListener('click', clearTemplates); window.addEventListener('resize', renderAll);
  try { refreshTemplateCount(); renderRecognition(); renderLiveStatus(); }
  catch (error) { console.error(error); }
}
boot();
