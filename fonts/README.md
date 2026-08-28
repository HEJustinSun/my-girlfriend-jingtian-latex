# Bundled fonts

The multilingual editions embed locale-appropriate, unmodified open-source fonts so that a clean XeLaTeX/Tectonic build does not depend on fonts installed on the host computer.

## CJK regional fonts

The Traditional Chinese, Japanese, and Korean editions use the official regional SubsetOTF builds from Adobe's `release` branches:

- Source Han Serif TW/JP/KR Regular 2.003
- Source Han Sans TW/JP/KR Medium 2.005

Source repositories: [Source Han Serif](https://github.com/adobe-fonts/source-han-serif) and [Source Han Sans](https://github.com/adobe-fonts/source-han-sans). The existing `SourceHanSerif-LICENSE.txt` and `SourceHanSans-LICENSE.txt` files cover these unmodified font binaries.

## Noto fonts

Latin/Cyrillic, Arabic sans-serif, and Devanagari editions use unmodified hinted TTF files from the official [Noto Fonts repository](https://github.com/notofonts/noto-fonts):

- Noto Serif and Noto Sans Regular, Bold, Italic, and Bold Italic (plus Sans Medium)
- Noto Naskh Arabic Regular and Noto Sans Arabic Medium
- Noto Serif Devanagari Regular and Noto Sans Devanagari Medium

Their license is preserved at `fonts/noto/OFL.txt`.

## Amiri

The Arabic body text uses the complete Regular, Bold, Italic, and Bold Italic family from the official [Amiri repository](https://github.com/aliftype/amiri). Amiri provides Arabic shaping together with the Latin and punctuation coverage needed by the mixed-script source. Its license is preserved at `fonts/amiri/OFL.txt`.

## SHA-256

```text
5d39f8eaaa9ad2aed93166b0a4fc4a43ac82de8a5c6112992446c24d88b595f9  SourceHanSansJP-Medium.otf
b2a86d076a1bd8ff964ff55fd2419b78a80af3f8e21d8d3a38f0aa484aedcf94  SourceHanSansKR-Medium.otf
6d73ddebf247891262bedc01fb7a4b52ed93ca1c7f48d28593dc7a4dc85af8f0  SourceHanSansTW-Medium.otf
e5f502bb193c28829895b098498f0f9dd8f658c760b0f83656ad41c1137a8785  SourceHanSerifJP-Regular.otf
b2b310255186ce92de2909f96522b9183a9f6c323dbe5663f205f02d6ece08b7  SourceHanSerifKR-Regular.otf
45f730307894dbe594366ed022efee4f9c4dcc0f41dc5db87c9ef8b8c0588bde  SourceHanSerifTW-Regular.otf
2f4b88e6ee50fa82c617e2d1d4ba18281cb1c6cd71c3af3ec64970c23995db4b  NotoNaskhArabic-Regular.ttf
7bbe267354704c6ad18bde24b1dbc756c8e4380ca1c3f3c25c45ec5c4471510b  NotoSans-Medium.ttf
751d14b3063f4989c05645dacdb99c8b8b986b1927efd31774fe46f4d25dfaa5  NotoSansArabic-Medium.ttf
3bb06453ba95458e85ab82f6d9ac7a4ccc371f10c7d2ba9119b651ec3fa2b3fe  NotoSansDevanagari-Medium.ttf
c8f669ceb2c9c60ccf55198b305e08a997ffca79a38cc7eeb551e643cbe66505  NotoSerif-Regular.ttf
7d4e2b1a7712840218a2726d598490647959ed1104934f3d30a72e77b7c51dad  NotoSerifDevanagari-Regular.ttf
3b2086a869bcded2aeb4416fc281ceec9d6ce3c06756cda19f8f763636204e7d  NotoSerif-Bold.ttf
0ea81d6b54fc8aa5dff0fd6ebe7cfa431e9e6cf747a8d4aa33581fa0aaccffea  NotoSerif-Italic.ttf
4fb8737145b4a503d548af4b517afdfc532e44a96ac15378257e825741334eec  NotoSerif-BoldItalic.ttf
b85c38ecea8a7cfb39c24e395a4007474fa5a4fc864f6ee33309eb4948d232d5  NotoSans-Regular.ttf
c976e4b1b99edc88775377fcc21692ca4bfa46b6d6ca6522bfda505b28ff9d6a  NotoSans-Bold.ttf
36cff144df01309dab648bea71baff9bb074026914afe63aeacc8bc90b67a28b  NotoSans-Italic.ttf
6edf4227ef0fa846aca70e86a307804ca4401741830f5b3af0f2554abe2b8466  NotoSans-BoldItalic.ttf
3cd4a96bf6dca38649c9c7b4ca11a3aed55e272ae377a667f6f2138994c4baec  Amiri-Bold.ttf
b0e1e24a38abd117824ad97914efb2d4d9969a96e354d5612bc91d53021af0e2  Amiri-BoldItalic.ttf
375ab9458ba4487c261200fda2af63e67c1fb77cdae22955b16cb0dbf2667841  Amiri-Italic.ttf
2444788b85996d795f0db7e14f3f6bfc3ea1c985e391267db0269b9e40f3447d  Amiri-Regular.ttf
```
