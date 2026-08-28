# 我的女友景甜

这是一个 5 x 8 英寸的 XeLaTeX 排版工程。

## 编译

需要 XeLaTeX 和标准 TeX Live 发行版：

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
```

## 多语言版本 / Translations

`translations/` 目录提供五种语言的完整译本（保持原书 5 x 8 英寸版式与全部宏不变），并附已编译的 PDF：

| 语言 | 源文件 | PDF |
|---|---|---|
| English | `translations/main-en.tex` | `translations/main-en.pdf` |
| 日本語 | `translations/main-ja.tex` | `translations/main-ja.pdf` |
| Español | `translations/main-es.tex` | `translations/main-es.pdf` |
| Français | `translations/main-fr.tex` | `translations/main-fr.pdf` |
| Русский | `translations/main-ru.tex` | `translations/main-ru.pdf` |

编译（在 `translations/` 目录内，或用 tectonic 直接指定文件）：

```bash
xelatex -interaction=nonstopmode -halt-on-error main-en.tex   # 需 ../fonts 与 ../assets 在位
# 或
tectonic translations/main-en.tex
```

译文均使用仓库自带的思源字体（拉丁/西里尔/かな字形均在覆盖范围内），无需额外安装字体。
