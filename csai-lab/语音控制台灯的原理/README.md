# 离线语音识别实验室

这是一个纯前端、零后端、中英双语的离线语音特征科普页面。内置的合成演示音频和用户的麦克风录音都只在浏览器本地处理。

## 运行

浏览器的麦克风权限只在安全上下文中可用，因此请从这个目录启动一个本地服务器，而不要直接双击 `index.html`：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 页面中的科学边界

- 页面用 **40 个 Mel 滤波器**计算 log-Mel 能量，再用 DCT 生成 **13 维 MFCC**；这是为了教学而选定的可运行配置。
- 页面只把其中 **10 条代表性 Mel 滤波器**画出来并提供悬停解释，避免把 40 条曲线堆成不可读的图。实际计算仍使用全部 40 条。
- 13 并非工业规范。嵌入式库可以独立配置 Mel 滤波器数量和 DCT 输出数量；一些关键词模型直接使用 log-Mel / filterbank 特征而不用 MFCC。部署时特征前端必须与模型训练时完全一致。
- MFCC 不是“自动去除口音和音色”的魔法。Mel 汇总、log 压缩和 DCT 会弱化细碎频谱细节；真实产品还会使用归一化、降噪，以及涵盖不同说话人、口音与环境的训练数据来获得鲁棒性。

## 实现说明

- 演示指令：页面内生成一段简化的、带共振峰变化的演示 PCM；播放和可视化分析的是同一份数据。它按 1024 个采样点分帧、Hamming 加窗、FFT、40 个 Mel 三角滤波器、log 和 DCT，得到 13 维 MFCC。
- 实时模式：`getUserMedia` 获取麦克风，`AnalyserNode` 使用浏览器原生 FFT，网页端完成 Mel 能量与 MFCC 计算并绘制 Canvas。
- 本地小词表：用户可把一段当前声音保存为模板。页面只把归一化后的 MFCC 模板保存在本浏览器的 `localStorage`，再用最近帧的欧氏距离做演示级匹配。

生产设备通常会把连续 MFCC 帧送入量化的关键词模型（如 DS-CNN）或 DTW 模板匹配，并结合 VAD、置信度阈值和拒识策略。这里的模板匹配用于解释特征流，不应当替代真正训练、评测过的识别模型。

## 参考

- [Arm CMSIS-DSP MFCC](https://arm-software.github.io/CMSIS-DSP/latest/group__MFCCF32.html) 的初始化参数把 `nbMelFilters` 与 `nbDctOutputs` 分开配置。
- [TensorFlow Lite Micro audio frontend](https://android.googlesource.com/platform/external/tensorflow/+/HEAD/tensorflow/lite/experimental/microfrontend/lib/) 是嵌入式 filterbank 特征前端的公开示例，包含滤波器组、降噪、增益与 log 缩放模块。
