# 我的女友景甜

这是一个 5 x 8 英寸的 XeLaTeX 排版工程。

## 编译

需要 XeLaTeX 和标准 TeX Live 发行版：

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
```

## 越南语版本 / Bản dịch tiếng Việt

`main-vi.tex` 是越南语译本，与 `main.tex` 使用同一套版式、同一批字体，段落与分节顺序逐段对应（272 段正文、5 处分节符、2 处停顿完全一致）。思源宋体与思源黑体已包含全部越南语变音字符，无需另外安装字体。

`main-vi.tex` là bản dịch tiếng Việt, dùng chung bố cục và bộ chữ với `main.tex`, các đoạn văn và dấu ngắt đoạn tương ứng một-đối-một với nguyên tác.

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main-vi.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main-vi.tex
```
