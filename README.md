# 《我的女友景甜》互动阅读计划

原仓库提供一份 5 x 8 英寸的 XeLaTeX 排版作品。这个分支没有改动原文，只把阅读体验向前延伸了一步：封面、互动测验、自动计分和可打印试卷。

## 这次增加了什么

- 24 题、满分 100 分的互动阅读测验；
- 围绕白描、数字锚定、物件回调、对照与留白重新设计的语言题；
- 按“事件证据—文笔修辞—人物社会—AI 真实性—商业价值”五层递进；
- 每层开始前显示独立章节页，以横向滑屏动画进入下一组题目；
- 商业题区分热度、产品转化、资产波动与长期价值，不构成投资建议；
- 一次只出现一道题，支持上一题、下一题和本机自动保存；
- 完成后即时计分，展示分项成绩和逐题解析；
- A4 打印版试卷，包含全部题目、答案和解析；
- 全新封面，以及更克制的“凌晨、海面、心跳”视觉氛围。

## 编译

需要 XeLaTeX 和标准 TeX Live 发行版：

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
```

## 互动阅读测验

打开 `quiz/index.html` 即可开始作答。页面不重复收录原文。

`output/pdf/孙哥阅读理解测试.pdf` 是配套 A4 打印版，包含封面、全部题目、参考答案与解析。

## 感谢与赞赏

感谢每一位认真读完、认真作答、认真提出修改意见的人。若你愿意支持这个互动版本继续维护，可以使用下面的比特币二维码自愿赞赏。

<p align="center">
  <img src="quiz/assets/thank-you-qr.png" width="240" alt="比特币自愿赞赏二维码" />
  <br />
  <sub>自愿赞赏 · 与测验分数和内容访问无关</sub>
</p>
