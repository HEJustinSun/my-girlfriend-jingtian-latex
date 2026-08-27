# 我的女友景甜

这是一个 5 x 8 英寸的 XeLaTeX 排版工程。

## 编译

需要 XeLaTeX 和标准 TeX Live 发行版。

### 使用 Makefile（推荐）

```bash
make
```

清理编译缓存：
```bash
make clean
```

### 手动编译

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
cp build/main.pdf ./我的女友景甜.pdf
```
