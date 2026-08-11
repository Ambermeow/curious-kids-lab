# 贡献指南 / Contributing Guide

感谢你想为「喵喵和孩子们的实验室」贡献代码或内容！

## 🎯 贡献方式

### 新增实验项目

1. 把 HTML 文件放到仓库根目录
2. 在对应实验室页面（如 `virtual-lab.html`）的 `projects` 数组里添加一条卡片记录
3. 提交 PR

### 项目卡片格式

```javascript
{
  id: 'my-project',           // 唯一 ID
  title: '项目标题',
  subject: 'physics',         // 学科分类
  difficulty: 'easy',         // easy / medium / hard
  desc: '项目简介，一句话说清楚这个实验讲什么',
  coverClass: 'cover-physics-1',
  emoji: '⚡',
  link: 'my-project.html'
}
```

### 修复 Bug

1. 在 Issue 中描述 Bug 表现和复现步骤
2. Fork → 修复 → PR

### 内容要求

- 面向 6–16 岁孩子的语言，避免术语堆砌
- 交互优先——让读者动手操作而非被动阅读
- 物理学/科学原理必须准确，不确定的地方请标注

## 🔧 技术约定

- 纯静态 HTML/CSS/JS，不依赖框架
- 每个实验页面自包含（可引用外部 CDN）
- 使用 `Noto Sans SC` 作为中文字体
- 移动端必须可操作

## 📜 许可

所有贡献默认采用 **CC BY-NC-SA 4.0** 协议发布。提交 PR 即表示你同意此条款。
