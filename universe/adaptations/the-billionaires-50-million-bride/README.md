# 五千万美元新娘 · The Billionaire's $50 Million Bride

> LOVE BEGINS WHERE OWNERSHIP ENDS

孙哥宇宙 001 号衍生作品。基于正典《我的女友景甜》的真实场景演绎改编的**虚构**短剧剧本。

| | |
|---|---|
| 形态 | 60 集海外竖屏短剧 |
| 单集时长 | 100–125 秒 |
| 语言 | 英文对白 / 中文动作与导演提示 |
| 类型 | Billionaire Romance / Celebrity Scandal / Toxic Love / Revenge / Mystery |
| 核心受众 | 18–44 岁女性 |
| 版本 | Showrunner Development Draft v1.0 |
| 成品 | [`五千万美元新娘.pdf`](五千万美元新娘.pdf)（138 页，US Letter） |

## 与正典的关系

继承正典的**情境内核**——一通电话、一个金额、一次沉默：

| 正典 | 本改编 |
|---|---|
| 取卵前索要五千万美元 | EP01 冷开场 + EP41 完整重演，成为全剧轴心 |
| 男方长年"用给予表达亲密" | Sun 的 Yes 越来越轻，直到最贵的一次他沉默 |
| 昂贵的空房间（包层酒店、空影院） | 贯穿全剧的视觉复沓："越贵越空" |
| 指甲锉 | 唯一不能升值的礼物，反复出现直到终集 |

改动的部分：

- **全部人物、公司、地名重命名并虚构化**。Sun Ge / Ava Vance / Maya Cross / Grant Reddick /
  HELIOS / VANCE LEGACY HOLDINGS 等均为虚构，不指向任何真实个人或实体。
- **加入了正典没有的犯罪线**：伪造监护人签字、被侵占的童星信托、AI 数字替身权利买卖。
  这条线把"要钱"从动机不明改写成有具体指向的赎回。
- **结局改写**：正典止于叙述者的自省；本剧让女主角亲手在发布会上完成反杀，男主角放弃
  "买下来送给她"的解法，改为把证据和选择权无条件交出。

## 文件

| 文件 | 说明 |
|---|---|
| `screenplay.md` | **内容 SSOT**。改内容只改这里 |
| `preamble.tex` | 排版设计：版式、字体、配色、剧本元素宏 |
| `build.py` | `screenplay.md` → `main.tex` → PDF |
| `main.tex` | 生成产物，勿手改 |
| `五千万美元新娘.pdf` | 成品 |

`screenplay.md` 由制作方交付的 `.docx` 一次性转换而来：

```bash
pandoc The_Billionaires_50_Million_Bride_Showrunner_Draft_v1.docx \
  -t markdown-smart --wrap=none -o screenplay.md
```

此后 Markdown 即为唯一来源，不再回头改 docx。

## 编译

```bash
python3 build.py              # 重新生成 main.tex，编译，产出 PDF
python3 build.py --tex-only   # 只生成 main.tex
```

只依赖标准库。编译经 `~/.claude/scripts/texcompile.sh` 走 **XeLaTeX**——
xeCJK 只能在 XeTeX 下工作，换 LuaLaTeX 会直接失败。

当前状态：`Output written on main.pdf (138 pages). Errors: 0. Undefined references: 0.`

## 排版说明

版式取 US Letter，沿用正典的墨色（`#161618` / `#5C5C62`），加一支 HELIOS 橙
（`#B04A1E`）——剧中反复出现的那颗胶带橙子、品牌灯、诊所日落和最终的外卖盒。

`build.py` 把 Markdown 的块语法映射为语义宏，而不是通用的 `\section` 套娃：

| 剧本元素 | 宏 |
|---|---|
| 场景标题（slugline） | `\Scene{序号}{INT. …— DAY}` |
| 动作/导演提示 | `\Action{…}` |
| 人物提示 + 对白 | `\Cue{AVA}` / `\CueP{SUN}{低声}` + `\Dialogue{…}` |
| 转场 | `\Transition{CUT TO BLACK.}` |
| 屏幕文字插入 | `\Insert{ON SCREEN: HI.}` |
| 本集目标 / 尾钩 | `\EpisodeMeta{…}{…}` |
| 节拍总表条目 | `\Beat{EP01 — FIFTY MILLION}{…}` |

转换是全覆盖的：2903 个源文本块 → 2903 个 LaTeX 元素，没有静默丢弃。
`build.py` 遇到无法归类的块会直接抛 `ValueError` 而不是跳过。

两处中英混排的坑，`preamble.tex` 里有对应注释：

- 思源宋体/黑体 CN 按中文习惯把 U+2019 画成全角，英文撇号会被撑开成
  `BILLIONAIRE’ S`。西文字体加 `+pwid` 取比例形，中文字体不加，中文引号保持全角。
- U+2014 在本稿里 277 次出现，257 次是英文破折号（场景标题、分集标题），
  10 次是中文破折号。整体归入西文类，中文破折号用 `\CNdash` 局部切回 CJK 类。

## 虚构声明

本作品为虚构创作。人物、公司、机构、事件均属虚构，与任何真实人物或实体无关。
剧中涉及的未成年人合约、Coogan Trust、证券披露等情节为戏剧设定，不构成法律意见；
正式立项前需由美国娱乐法与证券律师复核。
