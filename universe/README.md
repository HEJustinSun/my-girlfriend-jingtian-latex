# 孙哥宇宙 · SUN GE UNIVERSE

本目录存放《我的女友景甜》这一 IP 的全部衍生内容。

仓库根目录是**正典**（canon）——一部第一人称叙述的作品，是这个宇宙唯一的事实来源。
本目录是**衍生层**：在正典之上生长出来的、面向不同媒介和不同受众的再创作。
两层分开存放，是为了让正典保持不被改写，同时让衍生作品可以放开手脚。

```
my-girlfriend-jingtian-latex/
├── main.tex                    ← 正典：《我的女友景甜》5×8in 精装排版
├── 我的女友景甜.pdf              ← 正典成品
├── fonts/                      ← 全宇宙共用字体（思源宋体 / 思源黑体）
└── universe/                   ← 你在这里
    ├── README.md
    └── adaptations/            ← 改编作品，一部一目录
        └── the-billionaires-50-million-bride/
```

## 层级模型

| 层 | 位置 | 可否改动设定 | 说明 |
|---|---|---|---|
| 正典 Canon | `../main.tex` | 否 | 事件、人物、时间线的基准 |
| 改编 Adaptations | `adaptations/<slug>/` | 可以，但须在作品 README 里写明偏离处 | 剧本、分镜、小说化、漫画脚本等 |

正典与改编之间不是"翻拍"关系，而是"母本与变体"关系。改编可以换名字、换国籍、换时代、
换结局；唯一的硬要求是在自己的 README 里说清楚**继承了什么、改动了什么、为什么改**。

## 现有衍生作品

| # | 作品 | 形态 | 状态 | 目录 |
|---|---|---|---|---|
| 001 | 《五千万美元新娘》<br>The Billionaire's $50 Million Bride | 60 集海外竖屏短剧剧本 | Showrunner Draft v1.0 | [`adaptations/the-billionaires-50-million-bride/`](adaptations/the-billionaires-50-million-bride/) |

## 目录约定

每一部衍生作品是 `adaptations/` 下的一个独立目录，目录名用英文 slug（小写、连字符）。
目录内至少包含：

| 文件 | 作用 |
|---|---|
| `README.md` | 作品元信息、与正典的关系、编译方式 |
| `<content>.md` | **内容的唯一事实来源**（SSOT）。纯文本，便于 diff 和评审 |
| `build.py` | 把 SSOT 转成 `main.tex` 并调用 XeLaTeX |
| `preamble.tex` | 该作品的排版设计（版式、字体、颜色、宏） |
| `main.tex` | 生成产物，勿手改 |
| `<中文名>.pdf` | 成品 |

字体不在作品目录内重复放置，统一引用仓库根目录的 `fonts/`（约 20 MB，重复一次就多一份）。
`preamble.tex` 里的路径写作 `../../../fonts/`。

## 新增一部衍生作品

1. 在 `adaptations/` 下建目录，把内容整理成 Markdown 作为 SSOT。
   源稿若是 `.docx`，用 pandoc 转一次即可：
   ```bash
   pandoc source.docx -t markdown-smart --wrap=none -o <content>.md
   ```
2. 抄一份已有作品的 `build.py` 和 `preamble.tex`，按新作品的体裁改版式。
3. 跑 `python3 build.py`，确认 `Errors: 0` 且页数符合预期。
4. 写作品 `README.md`，并在本文件的"现有衍生作品"表里加一行。

## 虚构边界

衍生层的作品是**虚构作品**。改编稿在处理与现实相似的题材时遵守以下约束（沿用 001 号作品
第四部分的规定，对后续作品同样适用）：

- 不直接影射现实中的加密行业人物、现役运动员或演员。
- 作品内出现的公司、项目、品牌（如 HELIOS、VANCE LEGACY HOLDINGS、AVA FOREVER）
  均为虚构，与任何真实实体无关。
- 涉及未成年人合约、信托、证券披露等情节，在进入实拍前需由对应法域的执业律师复核；
  仓库内的稿件只是创作稿，不构成任何法律意见。
