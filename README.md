# 我的女友景甜

这是一个 5 x 8 英寸的 XeLaTeX 排版工程。

## 编译

需要 XeLaTeX 和标准 TeX Live 发行版：

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
```

## English edition

The English edition is available in `main-en.tex`.

Build the English edition with XeLaTeX:

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main-en.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main-en.tex
```
