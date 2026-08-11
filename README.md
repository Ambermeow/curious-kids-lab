<p align="center">
  <img src="https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-blue" alt="License">
  <img src="https://img.shields.io/badge/contributions-welcome-brightgreen" alt="Contributions">
</p>

# 🧪 Miaohan Lab — An Interactive Science Playground for Curious Kids

> A curiosity-driven, interactive science education website. From aurora physics to neural networks, from thought experiments to sensor hacking — kids learn science by **doing** it.

**[www.miaohan.fun](https://www.miaohan.fun)** ｜ For kids aged 6–16, and anyone who never stopped asking "why."

---

## 📐 What Is This?

Miaohan Lab is an open collection of **browser-based interactive science experiments**. Built with plain HTML / CSS / JavaScript — no installation required, no frameworks, nothing to download.

We believe science isn't something you memorize. It's something you **play with**.

---

## 🧭 Labs Overview

| Lab | Focus | Live Projects |
|---|---|---|
| 💻 **CS+AI Lab** | Computing & Artificial Intelligence | Binary-to-Image, What Is a Function, Cat-vs-Dog CNN, word2vec, AI Thought Experiments… |
| 🔬 **Virtual Lab** | Physics · Chemistry · Biology · Math | Aurora Physics, Micromagnetism, Bluetooth/WiFi/IR Electromagnetic Secrets, Gravity Ball |
| 🎭 **Think Lab** | Story Reimagining · Everyday What-Ifs | The Meritocratic Teacher, The Mimosa Who Was Once Arrogant… |

---

## 🗂 Project Structure

```
miaohan-lab/
│
├── index.html                              # 🏠 Homepage
│
├── 🔬 virtual-lab/                         # Virtual Lab — Physics, Chemistry, Biology, Math
│   ├── virtual-lab.html                    #    Lab index (cards + filters)
│   ├── aurora-physics.html                 #    Aurora Physics Lab (4 levels)
│   ├── aurora-physics.js
│   ├── aurora-physics.css
│   ├── Magnetization.html                  #    Micromagnetism Lab
│   ├── bluetooth_WIFI_infrared.html        #    Electromagnetic Waves: Bluetooth / WiFi / IR
│   └── VIRTUAL-LAB-TODO.md                 #    Planned experiments backlog
│
├── 💻 csai-lab/                            # CS + AI Lab — Computing, AI & Sensors
│   ├── csai-lab.html                       #    Lab index (cards + filters)
│   ├── 从二进制到图像.html                  #    Binary to Image
│   ├── whatisfunction.html                 #    What Is a Function?
│   ├── 猫狗CNN.html                         #    Cat-vs-Dog CNN Classifier
│   ├── word2vec.html                       #    word2vec Word Embeddings
│   ├── ai_thought_experiment_for_kids.html #    AI Thought Experiments
│   ├── triplet-loss-function.html          #    Triplet Loss Explained
│   ├── 语音控制台灯的原理/                  #    Voice-Controlled Lamp (multi-page)
│   └── 重力小球.html                        #    Gravity Ball — Intro to Sensors
│
├── 🎭 think-lab/                           # Think Lab — Philosophy & Critical Thinking
│   ├── think-lab.html                      #    Lab index (cards + filters)
│   ├── meritocracy-teacher.html            #    The Meritocratic Teacher
│   └── bebrave_mimosa.html                 #    The Mimosa Who Was Once Arrogant
│
├── prototypes/                             # 🧪 Work-in-progress experiments
│
├── 📄 README.md
├── 📜 LICENSE                              # CC BY-NC-SA 4.0
├── 📋 CONTRIBUTING.md
└── 🔧 .gitignore
```

> **Note:** All files are stored flat at the root for compatibility with our FTP-based hosting. The directory groupings above reflect the logical organization by lab.

---

## 🚀 Running Locally

```bash
git clone https://github.com/<your-username>/miaohan-lab.git
cd miaohan-lab
npx serve .
# Open http://localhost:3000 in your browser
```

Every page is static HTML. No Node.js, no build tools, no fuss.

---

## 🤝 Contributing

We warmly welcome contributors! Here's how you can help:

- **Add a new experiment**: drop in an HTML file and add a card to the lab page
- **Fix physics or code bugs**: spotted something wrong? PRs are always appreciated
- **Improve UX / visuals**: make experiments more intuitive and fun
- **Translate**: help us reach kids in more languages

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details.

---

## 📜 License

This project is licensed under **CC BY-NC-SA 4.0** (Attribution-NonCommercial-ShareAlike).

- ✅ You may share, copy, and adapt the material
- ✅ You must give appropriate credit
- ❌ **Commercial use is prohibited**
- ✅ Derivative works must use the same license

Full text: [`LICENSE`](./LICENSE).

---

<p align="center">Let curiosity take us anywhere ❤️</p>
