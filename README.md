# 我的女友景甜

这是一个 5 x 8 英寸的 XeLaTeX 排版工程。

## 知识图谱关系网络

仓库提供基于 `main.tex` 文本整理的交互式知识图谱，包含 62 个实体和 110 条关系，覆盖人物、地点、机构、作品/物件及关键事件。

- 可视化页面：[`index.html`](./index.html)
- 实体关系分析：[`知识图谱实体关系分析.md`](./知识图谱实体关系分析.md)
- 支持实体搜索、类型筛选、节点详情、关系标签、拖拽与缩放
- 页面仅分析 Git 仓库文本中的叙事关系，不代表现实人物经历或事实判断

本地预览：

```bash
python -m http.server 8765
```

然后访问 <http://127.0.0.1:8765/>。

在仓库的 **Settings → Pages** 中选择从分支部署后，可通过以下地址访问：

<https://Tianwen2000.github.io/my-girlfriend-jingtian-latex/>

## 编译

需要 XeLaTeX 和标准 TeX Live 发行版：

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
```
