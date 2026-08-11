/* ----------------------------------------------------
   PIXELQUEST: MODULAR JAVASCRIPT APP LOGIC
   ---------------------------------------------------- */

// --- GLOBAL VARIABLES & STATE ---
let activeTab = 1;

// Mascot dialogues
const mascotDialogues = {
    tab1: [
        "在这个关卡，拨动下方的物理开关（Bit），可以点亮或熄灭对应的 LED 灯泡。看看 8 个电平状态组合出来的数值是多少吧！",
        "试试完成我头上的能量挑战，用二进制代码凑出目标数字，小皮会超级开心哦！",
        "1 表示通电（ON），0 表示断电（OFF）。每 8 个二进制位组成一个字节，它在十进制里代表 0 到 255 之间的数值！"
    ],
    tab2: [
        "现在你是像素小画家！左边是色彩配置，右侧是 16x16 画板。在画板上按住鼠标滑动，涂画属于你自己的像素世界！",
        "选择 1-Bit 模式，你只能画黑白两色，内存只占用 256 位！切换到 24-Bit 真彩模式，可以画出彩虹，但需要 6144 位内存空间！",
        "注意下方的底层二进制流，当你画画时，数据流里的 0 和 1 正在实时发生变化。这正是计算机在内存里保存图像的格式！"
    ],
    tab3: [
        "哎呀！你看，像素方块在内存里其实是排成一长排的（一维状态）。我们必须要给计算机输入宽度分辨率，它才能把它们折叠成好看的图片！",
        "拉动下方的滑块，改变解密的分辨率宽度。如果宽度不对，爱心图案就会错位扭曲！",
        "当宽度刚好调整为 8 像素时，爱心拼图就会完美合拢！这就是为什么图像文件头部必须存储分辨率信息！"
    ],
    tab4: [
        "超级扫描仪准备就绪！你可以点击左上角上传真正的 PNG 或 JPG 照片，也可以点击预设加载可爱的猫咪、熊猫或我哦！",
        "在左侧的图片上移动鼠标，放大镜会实时捕捉局部像素！右侧的 8x8 放大网格中会显示它们对应的颜色代号和二进制序列。",
        "点击右侧 8x8 网格中的任意像素，你可以在下方‘屏幕显微镜’看到它内部红绿蓝三个发光体的发光比例！",
        "打开‘边缘侦探’，小皮会通过数学算子帮你在上传的图片里寻找灰度突变的地方。这就是无人车和人脸识别中最基础的边缘检测！"
    ]
};

// Mascot text helper
function setMascotText(text) {
    const bubble = document.getElementById('mascot-bubble');
    if (bubble) {
        bubble.classList.remove('active');
        // Simple reflow trick to restart animation
        void bubble.offsetWidth;
        bubble.innerText = text;
        bubble.classList.add('active');
    }
    // Wiggle mouth svg to simulate talking
    const mouth = document.querySelector('.vivi-mouth');
    if (mouth) {
        mouth.setAttribute('d', 'M 38 54 A 12 12 0 0 0 62 54'); // wide mouth talk
        setTimeout(() => {
            mouth.setAttribute('d', 'M 44 54 Q 50 60 56 54'); // restore smile
        }, 1500);
    }
}

function getRandomMascotText(tabKey) {
    const texts = mascotDialogues[tabKey];
    const index = Math.floor(Math.random() * texts.length);
    setMascotText(texts[index]);
}

// --- CONFETTI SYSTEM ---
let confettiActive = false;
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confettiParticles = [];

function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = Math.random() * -confettiCanvas.height - 20;
        this.size = Math.random() * 8 + 6;
        this.color = ['#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1', '#ec4899'][Math.floor(Math.random() * 6)];
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        if (this.y > confettiCanvas.height) {
            this.y = -20;
            this.x = Math.random() * confettiCanvas.width;
        }
    }
    draw() {
        confettiCtx.save();
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate(this.rotation * Math.PI / 180);
        confettiCtx.fillStyle = this.color;
        confettiCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        confettiCtx.restore();
    }
}

function triggerConfetti() {
    if (confettiActive) return;
    confettiActive = true;
    confettiParticles = [];
    for (let i = 0; i < 100; i++) {
        confettiParticles.push(new ConfettiParticle());
    }
    
    let duration = 3000; // 3 seconds
    let startTime = Date.now();
    
    function animate() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        let elapsed = Date.now() - startTime;
        
        confettiParticles.forEach(p => {
            p.update();
            p.draw();
        });
        
        if (elapsed < duration) {
            requestAnimationFrame(animate);
        } else {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            confettiActive = false;
        }
    }
    animate();
}

// --- TAB SWITCHER ---
function switchTab(tabIndex) {
    activeTab = tabIndex;
    
    // Toggle active content panel
    document.querySelectorAll('.tab-panel').forEach((panel, i) => {
        if (i + 1 === tabIndex) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // Toggle tab buttons active style
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        if (i + 1 === tabIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Trigger dialogue text
    if (tabIndex === 1) {
        setMascotText("欢迎来到第一关！计算机的所有秘密都藏在这些小开关里哦！拨动它们点亮灯泡吧！");
    } else if (tabIndex === 2) {
        setMascotText("第二关开启！你可以用不同的‘位深度’创作你的像素画，快来画点什么吧！");
        initAdventure2();
    } else if (tabIndex === 3) {
        setMascotText("第三关来啦！看一看底部的排队像素，怎么拉动滑块才能拼回那颗散落的心脏呢？");
        initAdventure3();
    } else if (tabIndex === 4) {
        setMascotText("终极挑战：照片二进制显微镜！你可以上传你自己的照片，或者分析下面可爱的熊猫和猫咪！");
        initAdventure4();
    }
}
window.switchTab = switchTab;


// ====================================================
// ADVENTURE 1: ELECTRICAL SWITCHES & CHALLENGE
// ====================================================
let bits = [0, 0, 0, 0, 0, 0, 0, 0];
let targetValue = 42;

function initAdventure1() {
    const bulbContainer = document.getElementById('circuit-bulbs-container');
    const switchContainer = document.getElementById('circuit-switches-container');
    const refreshBtn = document.getElementById('refresh-quest-btn');
    
    if (!bulbContainer || !switchContainer) return;
    
    // Setup target challenge
    generateNewQuest();
    refreshBtn.onclick = generateNewQuest;
    
    // Render bulbs & switches
    renderCircuit();
}

function renderCircuit() {
    const bulbContainer = document.getElementById('circuit-bulbs-container');
    const switchContainer = document.getElementById('circuit-switches-container');
    
    bulbContainer.innerHTML = '';
    switchContainer.innerHTML = '';
    
    let decimalVal = 0;
    
    bits.forEach((bit, i) => {
        const placeValue = Math.pow(2, 7 - i); // MSB to LSB
        if (bit === 1) {
            decimalVal += placeValue;
        }
        
        // Render bulb
        const bulbWrap = document.createElement('div');
        bulbWrap.className = 'bulb-wrapper';
        bulbWrap.innerHTML = `
            <div class="bulb-light ${bit === 1 ? 'on' : ''}">
                <i data-lucide="${bit === 1 ? 'lightbulb' : 'lightbulb-off'}"></i>
            </div>
            <span class="bulb-status ${bit === 1 ? 'on' : ''}">${bit === 1 ? '1' : '0'}</span>
        `;
        bulbContainer.appendChild(bulbWrap);
        
        // Render arcade 3D switch
        const switchWrap = document.createElement('div');
        switchWrap.className = 'toggle-switch-wrapper';
        
        const arcadeSwitch = document.createElement('div');
        arcadeSwitch.className = `arcade-switch ${bit === 1 ? 'active' : ''}`;
        arcadeSwitch.innerHTML = `<div class="arcade-switch-handle"></div>`;
        arcadeSwitch.onclick = () => toggleBit(i);
        
        const bitLabel = document.createElement('span');
        bitLabel.className = 'switch-bit';
        bitLabel.innerText = `${placeValue}`;
        
        switchWrap.appendChild(arcadeSwitch);
        switchWrap.appendChild(bitLabel);
        switchContainer.appendChild(switchWrap);
    });
    
    // Update labels
    document.getElementById('dec-val').innerText = decimalVal;
    document.getElementById('hex-val').innerText = `0x` + decimalVal.toString(16).toUpperCase().padStart(2, '0');
    
    // Render newly generated Lucide icons
    lucide.createIcons();
    
    // Verify target challenge
    checkQuest(decimalVal);
}

function toggleBit(index) {
    bits[index] = bits[index] === 1 ? 0 : 1;
    renderCircuit();
}

function generateNewQuest() {
    targetValue = Math.floor(Math.random() * 254) + 1; // 1 to 255
    document.getElementById('target-value').innerText = targetValue;
    const questCard = document.getElementById('quest-card');
    questCard.classList.remove('success');
    
    // Mascot prompts
    setMascotText(`把能量组合成 exactamente ${targetValue} 吧！拨动下方标着 128、64... 的开关来相加凑数！`);
}

function checkQuest(currentVal) {
    const questCard = document.getElementById('quest-card');
    if (currentVal === targetValue) {
        questCard.classList.add('success');
        triggerConfetti();
        
        // Trigger Mascot Happy Emotion
        setMascotText(`太棒啦！🎉 你完美合成了 ${targetValue}！小皮吃饱了能量，现在动力满满！我们可以去神奇画板玩啦！`);
        
        // Dynamic mascot jump animation
        const mascot = document.getElementById('mascot-vivi');
        if (mascot) {
            mascot.animate([
                { transform: 'translateY(0) scale(1)' },
                { transform: 'translateY(-20px) scale(0.9, 1.1)' },
                { transform: 'translateY(0) scale(1.1, 0.9)' },
                { transform: 'translateY(0) scale(1)' }
            ], { duration: 500, easing: 'ease-out' });
        }
    }
}


// ====================================================
// ADVENTURE 2: MAGIC PAINTBRUSH (CANVAS & BIT DEPTH)
// ====================================================
let paintDepth = 1; // 1, 8, or 24
let drawingGridData = Array(256).fill(0); // 16x16 grid
let isPainting = false;

// 1-Bit default active tool: 1 (white)
let paintColor1Bit = 1;
// 8-Bit default gray shade: 128
let paintColor8Bit = 128;
// 24-Bit default color: RGB [99, 102, 241] (Hex: #6366f1)
let paintColor24Bit = [99, 102, 241];

function initAdventure2() {
    const grid = document.getElementById('paint-grid-16');
    if (!grid) return;
    
    // Clear and reset canvas container event bindings
    grid.innerHTML = '';
    
    // Setup 16x16 grid cell elements
    for (let i = 0; i < 256; i++) {
        const cell = document.createElement('div');
        cell.className = 'paint-pixel';
        cell.dataset.index = i;
        
        // Drag drawing support
        cell.onmousedown = (e) => {
            isPainting = true;
            paintPixel(i);
            e.preventDefault();
        };
        cell.onmouseover = () => {
            if (isPainting) paintPixel(i);
        };
        
        grid.appendChild(cell);
    }
    
    // Stop painting when mouse is released anywhere on page
    const stopDraw = () => { isPainting = false; };
    document.addEventListener('mouseup', stopDraw);
    
    // Render color tool palette
    renderPaintPalette();
    
    // Synchronize canvas values
    updatePaintCanvasVisuals();
}

function clearPaintCanvas() {
    if (paintDepth === 24) {
        drawingGridData = Array(256).fill().map(() => [11, 15, 25]); // dark navy base
    } else {
        drawingGridData = Array(256).fill(0); // black base
    }
    updatePaintCanvasVisuals();
    updatePaintBinaryStream();
    
    setMascotText("画布已经擦干净啦！你可以切换不同的色彩模式，开始新创作！");
}
window.clearPaintCanvas = clearPaintCanvas;

function setPaintDepth(depth) {
    paintDepth = depth;
    
    // Reset buttons states
    document.querySelectorAll('.depth-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`depth-btn-${depth}`).classList.add('active');
    
    // Reset canvas array size / structure
    clearPaintCanvas();
    
    // Re-render color picks
    renderPaintPalette();
    
    if (depth === 1) {
        setMascotText("1-Bit 模式已激活！每个点只需 1 个开关，你画画时数据流会直接呈现为 0 和 1 的排字拼图！");
    } else if (depth === 8) {
        setMascotText("8-Bit 灰度已激活！你可以画出 256 种深浅不同的灰色阴影，每个格子存储一个 0-255 的十进制数值。");
    } else if (depth === 24) {
        setMascotText("24-Bit 真彩色已激活！每个像素格可以从红、绿、蓝的混色盘中挑选。内存占用会瞬间乘以 24 哦！");
    }
}
window.setPaintDepth = setPaintDepth;

// Render different color picker elements according to active bit-depth
function renderPaintPalette() {
    const paletteArea = document.getElementById('color-palette-area');
    if (!paletteArea) return;
    
    paletteArea.innerHTML = '';
    
    if (paintDepth === 1) {
        paletteArea.innerHTML = `
            <span class="palette-title">选择你的画笔状态 (1-Bit):</span>
            <div class="color-circles-list">
                <button onclick="window.setPaintColor1Bit(0)" id="c1-0" class="color-circle-btn" style="background: #0b0f19;" title="黑色 (0)"></button>
                <button onclick="window.setPaintColor1Bit(1)" id="c1-1" class="color-circle-btn active" style="background: #ffffff;" title="白色 (1)"></button>
            </div>
            <div class="brush-preview-bar">
                <span>当前画笔代码:</span>
                <span class="font-mono text-mint" id="brush-code-label">1 (ON / 白色)</span>
            </div>
        `;
        window.setPaintColor1Bit = function(val) {
            paintColor1Bit = val;
            document.querySelectorAll('.color-circle-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`c1-${val}`).classList.add('active');
            document.getElementById('brush-code-label').innerText = val === 1 ? '1 (ON / 白色)' : '0 (OFF / 黑色)';
        };
    } 
    else if (paintDepth === 8) {
        paletteArea.innerHTML = `
            <span class="palette-title">选择灰度亮度 (8-Bit):</span>
            <div class="rgb-painter-sliders">
                <div class="slider-row">
                    <label>灰</label>
                    <input type="range" id="gray-brush-slider" min="0" max="255" value="${paintColor8Bit}" oninput="window.setPaintColor8Bit(this.value)" class="w-full range-slider accent-purple">
                    <span id="gray-brush-val">${paintColor8Bit}</span>
                </div>
            </div>
            <div class="brush-preview-bar">
                <span>画笔颜色预览:</span>
                <div class="brush-preview-color" id="brush-preview-color-box" style="background: rgb(${paintColor8Bit}, ${paintColor8Bit}, ${paintColor8Bit});"></div>
            </div>
        `;
        window.setPaintColor8Bit = function(val) {
            paintColor8Bit = parseInt(val);
            document.getElementById('gray-brush-val').innerText = val;
            document.getElementById('brush-preview-color-box').style.backgroundColor = `rgb(${val}, ${val}, ${val})`;
        };
    } 
    else if (paintDepth === 24) {
        paletteArea.innerHTML = `
            <span class="palette-title">调色板 (24-Bit 真彩混色):</span>
            
            <!-- Standard presets -->
            <div class="color-circles-list mb-2" id="circles-24bit">
                <!-- Auto-populated presets -->
            </div>

            <!-- R-G-B Fine Sliders -->
            <div class="rgb-painter-sliders">
                <div class="slider-row">
                    <label class="text-rose-400">红</label>
                    <input type="range" id="brush-r" min="0" max="255" value="${paintColor24Bit[0]}" oninput="window.setPaintColor24BitFromSliders()" class="w-full range-slider accent-coral">
                    <span id="brush-r-val">${paintColor24Bit[0]}</span>
                </div>
                <div class="slider-row">
                    <label class="text-emerald-400">绿</label>
                    <input type="range" id="brush-g" min="0" max="255" value="${paintColor24Bit[1]}" oninput="window.setPaintColor24BitFromSliders()" class="w-full range-slider accent-mint">
                    <span id="brush-g-val">${paintColor24Bit[1]}</span>
                </div>
                <div class="slider-row">
                    <label class="text-sky-400">蓝</label>
                    <input type="range" id="brush-b" min="0" max="255" value="${paintColor24Bit[2]}" oninput="window.setPaintColor24BitFromSliders()" class="w-full range-slider accent-primary">
                    <span id="brush-b-val">${paintColor24Bit[2]}</span>
                </div>
            </div>
            <div class="brush-preview-bar">
                <span>混色代码: <strong id="brush-hex-24">#6366F1</strong></span>
                <div class="brush-preview-color" id="brush-preview-color-box-24" style="background: rgb(${paintColor24Bit[0]}, ${paintColor24Bit[1]}, ${paintColor24Bit[2]});"></div>
            </div>
        `;
        
        // Setup preset colors
        const presets = [
            [244, 63, 94],   // coral
            [16, 185, 129],  // mint
            [99, 102, 241],  // indigo
            [245, 158, 11],  // amber
            [139, 92, 246],  // purple
            [236, 72, 153],  // pink
            [255, 255, 255], // white
            [11, 15, 25]     // dark navy
        ];
        
        const listDiv = document.getElementById('circles-24bit');
        presets.forEach((rgb, idx) => {
            const btn = document.createElement('button');
            btn.className = `color-circle-btn ${idx === 2 ? 'active' : ''}`;
            btn.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
            btn.style.color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
            btn.onclick = () => window.setPaintColor24BitFromPreset(rgb, btn);
            listDiv.appendChild(btn);
        });

        window.setPaintColor24BitFromPreset = function(rgb, btnEl) {
            paintColor24Bit = rgb;
            document.querySelectorAll('#circles-24bit .color-circle-btn').forEach(btn => btn.classList.remove('active'));
            btnEl.classList.add('active');
            
            // Sync sliders values
            document.getElementById('brush-r').value = rgb[0];
            document.getElementById('brush-g').value = rgb[1];
            document.getElementById('brush-b').value = rgb[2];
            
            document.getElementById('brush-r-val').innerText = rgb[0];
            document.getElementById('brush-g-val').innerText = rgb[1];
            document.getElementById('brush-b-val').innerText = rgb[2];
            
            const hex = "#" + rgb.map(x => x.toString(16).toUpperCase().padStart(2, '0')).join('');
            document.getElementById('brush-hex-24').innerText = hex;
            document.getElementById('brush-preview-color-box-24').style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        };

        window.setPaintColor24BitFromSliders = function() {
            const r = parseInt(document.getElementById('brush-r').value);
            const g = parseInt(document.getElementById('brush-g').value);
            const b = parseInt(document.getElementById('brush-b').value);
            
            paintColor24Bit = [r, g, b];
            
            document.getElementById('brush-r-val').innerText = r;
            document.getElementById('brush-g-val').innerText = g;
            document.getElementById('brush-b-val').innerText = b;
            
            // Remove active checkmark from preset circles
            document.querySelectorAll('#circles-24bit .color-circle-btn').forEach(btn => btn.classList.remove('active'));
            
            const hex = "#" + [r, g, b].map(x => x.toString(16).toUpperCase().padStart(2, '0')).join('');
            document.getElementById('brush-hex-24').innerText = hex;
            document.getElementById('brush-preview-color-box-24').style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        };
    }
}

function paintPixel(index) {
    if (paintDepth === 1) {
        drawingGridData[index] = paintColor1Bit;
    } else if (paintDepth === 8) {
        drawingGridData[index] = paintColor8Bit;
    } else if (paintDepth === 24) {
        drawingGridData[index] = paintColor24Bit;
    }
    
    updatePaintCanvasVisuals();
    updatePaintBinaryStream();
}

function updatePaintCanvasVisuals() {
    const pixels = document.querySelectorAll('.paint-pixel');
    pixels.forEach((cell, idx) => {
        const val = drawingGridData[idx];
        if (paintDepth === 1) {
            cell.style.backgroundColor = val === 1 ? '#ffffff' : '#0b0f19';
        } else if (paintDepth === 8) {
            cell.style.backgroundColor = `rgb(${val}, ${val}, ${val})`;
        } else if (paintDepth === 24) {
            cell.style.backgroundColor = `rgb(${val[0]}, ${val[1]}, ${val[2]})`;
        }
    });
}

function updatePaintBinaryStream() {
    const streamContainer = document.getElementById('paint-binary-stream');
    const memorySizeLabel = document.getElementById('memory-size-label');
    if (!streamContainer) return;
    
    streamContainer.innerHTML = '';
    
    let html = '';
    
    if (paintDepth === 1) {
        // Simple 1-bit values: 0 or 1
        drawingGridData.forEach(val => {
            html += `<span class="bin-val-text">${val}</span>`;
        });
        memorySizeLabel.innerText = "已占用内存: 256 bits (32 Bytes)";
    } 
    else if (paintDepth === 8) {
        // Grayscale 8-bit bytes
        drawingGridData.forEach(val => {
            const binary = val.toString(2).padStart(8, '0');
            html += `<span class="bin-val-text text-purple">${binary}</span> `;
        });
        memorySizeLabel.innerText = "已占用内存: 2048 bits (256 Bytes)";
    } 
    else if (paintDepth === 24) {
        // RGB values, each is 3 bytes (24 bits)
        drawingGridData.forEach(rgb => {
            const bR = rgb[0].toString(2).padStart(8, '0');
            const bG = rgb[1].toString(2).padStart(8, '0');
            const bB = rgb[2].toString(2).padStart(8, '0');
            html += `<span class="bin-val-text bin-val-r">${bR}</span><span class="bin-val-text bin-val-g">${bG}</span><span class="bin-val-text bin-val-b">${bB}</span> `;
        });
        memorySizeLabel.innerText = "已占用内存: 6144 bits (768 Bytes)";
    }
    
    streamContainer.innerHTML = html;
}


// ====================================================
// ADVENTURE 3: PIXEL ALIGNMENT (1D TO 2D DECODING)
// ====================================================
let lineupWidth = 8;

// Cute heart pattern 8x8 representation
const heartPattern = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 0, 0, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 1, 0,
    0, 0, 1, 1, 1, 1, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
];

function initAdventure3() {
    const slider = document.getElementById('lineup-width-slider');
    if (!slider) return;
    
    // Bind slider events
    slider.oninput = (e) => {
        lineupWidth = parseInt(e.target.value);
        renderAdventure3();
    };
    
    renderAdventure3();
}

function renderAdventure3() {
    const widthValLabel = document.getElementById('lineup-width-val');
    const flatContainer = document.getElementById('lineup-1d-container');
    const gridContainer = document.getElementById('lineup-2d-grid');
    const badge = document.getElementById('pattern-match-badge');
    
    if (!widthValLabel || !flatContainer || !gridContainer) return;
    
    widthValLabel.innerText = `${lineupWidth} 像素`;
    
    // Render 1D flat linear pixel lineup
    flatContainer.innerHTML = '';
    heartPattern.forEach((bit) => {
        const node = document.createElement('div');
        node.className = 'square-node';
        node.style.backgroundColor = bit === 1 ? 'var(--accent-coral)' : '#1e293b';
        flatContainer.appendChild(node);
    });
    
    // Render 2D reconstructed grid layout
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${lineupWidth}, 1fr)`;
    
    heartPattern.forEach((bit) => {
        const node = document.createElement('div');
        node.className = 'reconstructed-pixel';
        node.style.backgroundColor = bit === 1 ? 'var(--accent-coral)' : '#1e293b';
        gridContainer.appendChild(node);
    });
    
    // Check alignment width
    if (lineupWidth === 8) {
        badge.className = 'fit-indicator success';
        badge.innerText = '✨ 完美合拢！图片完全对齐啦';
        setMascotText("哇！看到了吗？宽度拉到 8 像素时，原本扭曲的一行小方块瞬间拼成了一个漂亮的心形！这说明分辨率对图像还原至关重要！");
    } else {
        badge.className = 'fit-indicator';
        badge.style.background = 'rgba(244, 63, 94, 0.15)';
        badge.style.color = 'var(--accent-coral)';
        badge.innerText = '❌ 图像错位中';
        getRandomMascotText('tab3');
    }
}


// ====================================================
// ADVENTURE 4: SUPER PHOTO SCANNER (MAGNIFY & ANALYZE)
// ====================================================
let scanImg = new Image();
let scanCanvas = null;
let scanCtx = null;
let analysisView = 'color'; // 'color' or 'xray'
let selectedPixelIdx = 0; // selected relative pixel index in 8x8 zoom (0 to 63)

// 8x8 buffer container of pixel color data under lens
let lensPixelData = Array(64).fill().map(() => [255, 255, 255]);

// Off-screen canvas to resize uploaded images to exactly 64x64 for analysis grid
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 64;
offscreenCanvas.height = 64;
const offscreenCtx = offscreenCanvas.getContext('2d');

function initAdventure4() {
    scanCanvas = document.getElementById('src-canvas');
    scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true });
    
    const fileUploader = document.getElementById('image-uploader');
    const uploaderDropzone = document.getElementById('uploader-dropzone');
    const edgeToggle = document.getElementById('toggle-edge-detect');
    const imgViewBox = document.getElementById('image-view-box');
    
    // File upload binding
    fileUploader.onchange = handleImageUpload;
    
    // Drag & Drop bindings
    uploaderDropzone.ondragover = (e) => {
        uploaderDropzone.classList.add('dragover');
        e.preventDefault();
    };
    uploaderDropzone.ondragleave = () => {
        uploaderDropzone.classList.remove('dragover');
    };
    uploaderDropzone.ondrop = (e) => {
        uploaderDropzone.classList.remove('dragover');
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            fileUploader.files = e.dataTransfer.files;
            handleImageUpload();
        }
    };
    
    // Edge detective checkbox
    edgeToggle.onchange = () => {
        updateScannerImage();
        setMascotText(edgeToggle.checked 
            ? "边缘侦探模式已打开！小皮正在对图像应用卷积算子（Laplacian Filter），帮我们描绘物体的明暗分界线哦！"
            : "回到了正常的照片分析！用鼠标在小动物身上滑一滑吧！"
        );
    };
    
    // Move magnifier lens on hover
    imgViewBox.onmousemove = handleMagnifierMove;
    imgViewBox.onmouseleave = () => {
        document.getElementById('mag-lens').style.display = 'none';
    };
    imgViewBox.ontouchmove = (e) => {
        if (e.touches && e.touches[0]) {
            handleMagnifierMove(e.touches[0]);
            e.preventDefault();
        }
    };
    imgViewBox.ontouchstart = (e) => {
        if (e.touches && e.touches[0]) {
            handleMagnifierMove(e.touches[0]);
        }
    };
    
    // Load default Cat preset image initially
    loadPresetImage('cat');
}

function handleImageUpload() {
    const fileUploader = document.getElementById('image-uploader');
    if (fileUploader.files && fileUploader.files[0]) {
        const file = fileUploader.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            scanImg.src = e.target.result;
            scanImg.onload = () => {
                // Clear preset active states
                document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
                updateScannerImage();
                setMascotText("新照片成功载入！移动鼠标看看它的二进制像素结构吧！你也可以点击‘边缘侦探’让小皮描绘轮廓！");
            };
        };
        reader.readAsDataURL(file);
    }
}

// Generate self-contained vector graphic templates so they run offline instantly
function drawSelfContainedPreset(presetName) {
    offscreenCtx.fillStyle = '#0f172a';
    offscreenCtx.fillRect(0, 0, 64, 64);
    
    if (presetName === 'cat') {
        // Cat face
        // BG: soft pinkish violet
        offscreenCtx.fillStyle = '#6d28d9';
        offscreenCtx.fillRect(0, 0, 64, 64);
        
        // Ears
        offscreenCtx.fillStyle = '#fda4af';
        offscreenCtx.beginPath();
        offscreenCtx.moveTo(12, 30); offscreenCtx.lineTo(2, 6); offscreenCtx.lineTo(24, 24); offscreenCtx.fill();
        offscreenCtx.beginPath();
        offscreenCtx.moveTo(52, 30); offscreenCtx.lineTo(62, 6); offscreenCtx.lineTo(40, 24); offscreenCtx.fill();
        
        // Head / Body
        offscreenCtx.fillStyle = '#f3f4f6';
        offscreenCtx.beginPath();
        offscreenCtx.arc(32, 34, 20, 0, Math.PI * 2);
        offscreenCtx.fill();
        
        // Eye patches / Eyes
        offscreenCtx.fillStyle = '#1e1b4b';
        offscreenCtx.beginPath();
        offscreenCtx.arc(24, 30, 4, 0, Math.PI * 2);
        offscreenCtx.arc(40, 30, 4, 0, Math.PI * 2);
        offscreenCtx.fill();
        
        // Nose
        offscreenCtx.fillStyle = '#ec4899';
        offscreenCtx.beginPath();
        offscreenCtx.moveTo(30, 36); offscreenCtx.lineTo(34, 36); offscreenCtx.lineTo(32, 38); offscreenCtx.fill();
        
        // Cheeks
        offscreenCtx.fillStyle = '#fb7185';
        offscreenCtx.beginPath();
        offscreenCtx.arc(17, 36, 3, 0, Math.PI * 2);
        offscreenCtx.arc(47, 36, 3, 0, Math.PI * 2);
        offscreenCtx.fill();
    } 
    else if (presetName === 'panda') {
        // Panda preset
        // BG: Soft green
        offscreenCtx.fillStyle = '#065f46';
        offscreenCtx.fillRect(0, 0, 64, 64);
        
        // Ears
        offscreenCtx.fillStyle = '#111827';
        offscreenCtx.beginPath();
        offscreenCtx.arc(16, 20, 7, 0, Math.PI * 2);
        offscreenCtx.arc(48, 20, 7, 0, Math.PI * 2);
        offscreenCtx.fill();
        
        // Head
        offscreenCtx.fillStyle = '#ffffff';
        offscreenCtx.beginPath();
        offscreenCtx.arc(32, 34, 20, 0, Math.PI * 2);
        offscreenCtx.fill();
        
        // Eyes patch black
        offscreenCtx.fillStyle = '#111827';
        offscreenCtx.beginPath();
        offscreenCtx.ellipse(24, 32, 6, 8, Math.PI / 6, 0, Math.PI * 2);
        offscreenCtx.ellipse(40, 32, 6, 8, -Math.PI / 6, 0, Math.PI * 2);
        offscreenCtx.fill();
        
        // Eyes white inside
        offscreenCtx.fillStyle = '#ffffff';
        offscreenCtx.beginPath();
        offscreenCtx.arc(24, 30, 2, 0, Math.PI * 2);
        offscreenCtx.arc(40, 30, 2, 0, Math.PI * 2);
        offscreenCtx.fill();
        
        // Nose
        offscreenCtx.fillStyle = '#111827';
        offscreenCtx.beginPath();
        offscreenCtx.arc(32, 38, 3, 0, Math.PI * 2);
        offscreenCtx.fill();
    } 
    else if (presetName === 'robot') {
        // Robot preset (Vivi the Pixelbot)
        // BG: Deep navy
        offscreenCtx.fillStyle = '#1e1b4b';
        offscreenCtx.fillRect(0, 0, 64, 64);
        
        // Antenna
        offscreenCtx.strokeStyle = '#f43f5e';
        offscreenCtx.lineWidth = 2;
        offscreenCtx.beginPath();
        offscreenCtx.moveTo(32, 22); offscreenCtx.lineTo(32, 10); offscreenCtx.stroke();
        offscreenCtx.fillStyle = '#fbbf24';
        offscreenCtx.beginPath(); offscreenCtx.arc(32, 8, 3, 0, Math.PI*2); offscreenCtx.fill();
        
        // Head / body block
        offscreenCtx.fillStyle = '#6366f1';
        offscreenCtx.strokeStyle = '#0f172a';
        offscreenCtx.lineWidth = 2;
        offscreenCtx.fillRect(16, 22, 32, 28);
        offscreenCtx.strokeRect(16, 22, 32, 28);
        
        // Screen
        offscreenCtx.fillStyle = '#0f172a';
        offscreenCtx.fillRect(20, 28, 24, 16);
        
        // Glowing LED eyes
        offscreenCtx.fillStyle = '#10b981';
        offscreenCtx.beginPath();
        offscreenCtx.arc(26, 36, 2.5, 0, Math.PI * 2);
        offscreenCtx.arc(38, 36, 2.5, 0, Math.PI * 2);
        offscreenCtx.fill();
        
        // Mouth
        offscreenCtx.strokeStyle = '#10b981';
        offscreenCtx.lineWidth = 1.5;
        offscreenCtx.beginPath();
        offscreenCtx.moveTo(27, 41); offscreenCtx.lineTo(37, 41); offscreenCtx.stroke();
    }
}

function loadPresetImage(presetName) {
    // Set active button
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`preset-btn-${presetName}`).classList.add('active');
    
    // Draw the self-contained vector pattern on offscreen canvas
    drawSelfContainedPreset(presetName);
    
    // Update scanner display
    updateScannerImage();
}
window.loadPresetImage = loadPresetImage;

// Processes the offscreen 64x64 buffer and displays it to the layout canvas
function updateScannerImage() {
    const width = scanCanvas.parentElement.clientWidth;
    const height = scanCanvas.parentElement.clientHeight;
    
    scanCanvas.width = 320;
    scanCanvas.height = 320;
    
    // Clear canvas
    scanCtx.fillStyle = '#070a13';
    scanCtx.fillRect(0, 0, 320, 320);
    
    // Render 64x64 offscreen buffer onto display canvas (upscaled)
    scanCtx.imageSmoothingEnabled = false; // keep it retro pixelated!
    
    const edgeToggle = document.getElementById('toggle-edge-detect');
    if (edgeToggle.checked) {
        // Apply Edge Detection convolution to 64x64 image
        const edgesCanvas = applyEdgeFilter(offscreenCanvas);
        scanCtx.drawImage(edgesCanvas, 0, 0, 320, 320);
    } else {
        scanCtx.drawImage(offscreenCanvas, 0, 0, 320, 320);
    }
    
    // Preload zoomed lens on center coordinates initial teaser
    extractLensGrid(160, 160);
    renderAnalysisGrid();
}

function handleMagnifierMove(e) {
    const imgViewBox = document.getElementById('image-view-box');
    const lens = document.getElementById('mag-lens');
    if (!imgViewBox || !lens) return;
    
    const containerRect = imgViewBox.getBoundingClientRect();
    const canvasRect = scanCanvas.getBoundingClientRect();
    
    // 1. Mouse coordinates relative to the container for positioning the lens
    const lx = e.clientX - containerRect.left;
    const ly = e.clientY - containerRect.top;
    
    // Position the glassmorphic circle lens centered on the mouse
    lens.style.display = 'block';
    lens.style.left = `${lx - 32}px`;
    lens.style.top = `${ly - 32}px`;
    
    // 2. Mouse coordinates relative to the canvas
    const cx = e.clientX - canvasRect.left;
    const cy = e.clientY - canvasRect.top;
    
    // Scale by displayed width/height to avoid coordinates drift on responsive screens
    const displayW = canvasRect.width || 320;
    const displayH = canvasRect.height || 320;
    let mx = (cx / displayW) * 320;
    let my = (cy / displayH) * 320;
    
    // Restrict within canvas bounds (320x320)
    mx = Math.max(0, Math.min(320, mx));
    my = Math.max(0, Math.min(320, my));
    
    // Read local pixel data
    extractLensGrid(mx, my);
    
    // Render Right Panel Grid
    renderAnalysisGrid();
}

// Extract 8x8 pixels around the mouse coordinate from offscreen 64x64 grid
function extractLensGrid(mx, my) {
    // Map mx, my (0 to 320) to offscreen coordinates (0 to 64)
    const px = Math.floor((mx / 320) * 64);
    const py = Math.floor((my / 320) * 64);
    
    // Grab 8x8 region starting from top-left offset
    let startX = px - 4;
    let startY = py - 4;
    
    // Keep offset within bounds
    if (startX < 0) startX = 0;
    if (startX > 56) startX = 56;
    if (startY < 0) startY = 0;
    if (startY > 56) startY = 56;
    
    // Access image data under magnifying lens
    const edgeToggle = document.getElementById('toggle-edge-detect');
    
    // We fetch pixels from offscreen canvas
    let tempCtx = offscreenCtx;
    
    // If edge detect is active, read pixel color of the edge canvas
    if (edgeToggle.checked) {
        const edgeCanvas = applyEdgeFilter(offscreenCanvas);
        const edgeCtx = edgeCanvas.getContext('2d');
        const imgData = edgeCtx.getImageData(startX, startY, 8, 8);
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const idx = (y * 8 + x) * 4;
                lensPixelData[y * 8 + x] = [
                    imgData.data[idx],
                    imgData.data[idx + 1],
                    imgData.data[idx + 2]
                ];
            }
        }
    } else {
        const imgData = offscreenCtx.getImageData(startX, startY, 8, 8);
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const idx = (y * 8 + x) * 4;
                lensPixelData[y * 8 + x] = [
                    imgData.data[idx],
                    imgData.data[idx + 1],
                    imgData.data[idx + 2]
                ];
            }
        }
    }
}

// Renders the 8x8 grid on the right side of the screen
function renderAnalysisGrid() {
    const gridMatrix = document.getElementById('zoom-grid-matrix');
    if (!gridMatrix) return;
    
    gridMatrix.innerHTML = '';
    
    lensPixelData.forEach((rgb, idx) => {
        const cell = document.createElement('div');
        cell.className = `zoomed-pixel ${idx === selectedPixelIdx ? 'active' : ''}`;
        cell.onclick = () => selectScannerPixel(idx);
        
        // Dynamic mode rendering
        if (analysisView === 'color') {
            cell.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
            cell.style.color = getContrastColor(rgb);
            // Hide text numbers in color view to avoid visual clutter
            cell.innerText = '';
        } 
        else if (analysisView === 'xray') {
            // X-ray thresholding mode: Binarized black and white overlay
            const grayscale = Math.floor(rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
            const binaryVal = grayscale > 127 ? 1 : 0;
            
            cell.style.backgroundColor = binaryVal === 1 ? '#ffffff' : '#070a13';
            cell.style.color = binaryVal === 1 ? '#000000' : '#10b981';
            cell.innerText = binaryVal;
        }
        
        gridMatrix.appendChild(cell);
    });
    
    // Sync diagnostic panel with active selected pixel values
    syncPixelDiagnostics(selectedPixelIdx);
}

function selectScannerPixel(idx) {
    selectedPixelIdx = idx;
    
    // Highlight active element in grid
    document.querySelectorAll('.zoomed-pixel').forEach((cell, i) => {
        if (i === idx) {
            cell.classList.add('active');
        } else {
            cell.classList.remove('active');
        }
    });
    
    syncPixelDiagnostics(idx);
}

function syncPixelDiagnostics(idx) {
    const rgb = lensPixelData[idx];
    if (!rgb) return;
    
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];
    
    // Row / Col coordinates (1-based)
    const row = Math.floor(idx / 8) + 1;
    const col = (idx % 8) + 1;
    
    document.getElementById('scan-coord').innerText = `第 ${row} 行, 第 ${col} 列`;
    document.getElementById('scan-index').innerText = `内存序列 index: ${idx}`;
    
    const hex = "#" + [r, g, b].map(x => x.toString(16).toUpperCase().padStart(2, '0')).join('');
    document.getElementById('scan-hex').innerText = hex;
    
    // Formatted Binaries
    const binR = r.toString(2).padStart(8, '0');
    const binG = g.toString(2).padStart(8, '0');
    const binB = b.toString(2).padStart(8, '0');
    
    document.getElementById('scan-binary').innerHTML = `
        <span class="bin-val-r">R: ${binR}</span> <br>
        <span class="bin-val-g">G: ${binG}</span> <br>
        <span class="bin-val-b">B: ${binB}</span>
    `;
    
    // Update subpixel LEDs heights & opacity
    const barR = document.querySelector('#led-r .led-bar');
    const barG = document.querySelector('#led-g .led-bar');
    const barB = document.querySelector('#led-b .led-bar');
    
    barR.style.height = `${(r / 255) * 80 + 10}%`;
    barG.style.height = `${(g / 255) * 80 + 10}%`;
    barB.style.height = `${(b / 255) * 80 + 10}%`;
    
    barR.style.opacity = r / 255 < 0.2 ? 0.2 : r / 255;
    barG.style.opacity = g / 255 < 0.2 ? 0.2 : g / 255;
    barB.style.opacity = b / 255 < 0.2 ? 0.2 : b / 255;
}

function setAnalysisView(mode) {
    analysisView = mode;
    
    document.getElementById('btn-analysis-color').classList.remove('active');
    document.getElementById('btn-analysis-xray').classList.remove('active');
    
    document.getElementById(`btn-analysis-${mode}`).classList.add('active');
    
    renderAnalysisGrid();
}
window.setAnalysisView = setAnalysisView;

// Helper to determine white or black text inside color grid blocks
function getContrastColor(rgb) {
    const brightness = Math.floor(rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
    return brightness > 140 ? '#000000' : '#ffffff';
}


// ====================================================
// EDGE DETECTION FILTER (LOCAL IMAGE CONVOLUTION)
// ====================================================
function applyEdgeFilter(srcCanvasEl) {
    const w = srcCanvasEl.width;
    const h = srcCanvasEl.height;
    
    const edgeCanvas = document.createElement('canvas');
    edgeCanvas.width = w;
    edgeCanvas.height = h;
    const edgeCtx = edgeCanvas.getContext('2d');
    
    const srcCtx = srcCanvasEl.getContext('2d');
    const imgData = srcCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    
    const output = edgeCtx.createImageData(w, h);
    const outData = output.data;
    
    // Laplacian Filter Kernel
    const k = [
        -1, -1, -1,
        -1,  8, -1,
        -1, -1, -1
    ];
    
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            
            let sumVal = 0;
            
            // Loop kernel
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pxIdx = ((y + ky) * w + (x + kx)) * 4;
                    // Grayscale value
                    const gray = data[pxIdx] * 0.299 + data[pxIdx + 1] * 0.587 + data[pxIdx + 2] * 0.114;
                    const weight = k[(ky + 1) * 3 + (kx + 1)];
                    sumVal += gray * weight;
                }
            }
            
            // Map edge strength to glowing green outline representation
            const strength = Math.min(Math.max(Math.abs(sumVal), 0), 255);
            const idx = (y * w + x) * 4;
            
            if (strength > 40) {
                // Glow mint green
                outData[idx] = 16;       // R
                outData[idx + 1] = 185;  // G
                outData[idx + 2] = 129;  // B
                outData[idx + 3] = 255;  // Alpha
            } else {
                // Background dark navy
                outData[idx] = 11;
                outData[idx + 1] = 15;
                outData[idx + 2] = 25;
                outData[idx + 3] = 255;
            }
        }
    }
    
    edgeCtx.putImageData(output, 0, 0);
    return edgeCanvas;
}


// ====================================================
// INITIALIZATION ON LOAD
// ====================================================
window.onload = () => {
    // Render Step 1
    initAdventure1();
    
    // Trigger Mascot Greeting
    setMascotText("哇！你来啦！欢迎体验像素探险家！点击上方的绿色卡片关卡，开启我们图像识别的二进制冒险吧！");
    
    // Setup generic click sounds or responses when user taps the mascot
    const mascotBox = document.getElementById('mascot-container');
    if (mascotBox) {
        mascotBox.onclick = () => {
            const tabs = ['tab1', 'tab2', 'tab3', 'tab4'];
            getRandomMascotText(tabs[activeTab - 1]);
        };
    }
};
