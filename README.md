# 我的女友景甜

这是一个 5 x 8 英寸的 XeLaTeX 排版工程。

## 编译

需要 XeLaTeX 和标准 TeX Live 发行版：

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
```

## 账单可视化

见 [`ledger/index.html`](ledger/index.html)：全书十七笔与钱相关的流水（含已支付、打水漂、承诺未兑现、被拒付与金额未披露项）、故事时间线与金额对照图，数据逐条核对自 `main.tex`，出处列即行号。零依赖静态页面，浏览器直接打开即可。
