# 공유 이미지용 글꼴

`app/opengraph-image.tsx`가 링크 공유 이미지를 만들 때 쓰는 글꼴이다. 이미지 생성(ImageResponse)은 woff2와 웹 글꼴을 읽지 못해 TTF 파일을 둔다.

- `Gaegu-Bold-og.ttf`: [Gaegu Bold](https://github.com/google/fonts/tree/main/ofl/gaegu)에서 공유 이미지에 쓰는 글자만 남긴 부분 글꼴(원본 약 2.9MB)
- `Gaegu-OFL.txt`: Gaegu 라이선스(SIL Open Font License 1.1)

공유 이미지의 문구를 바꾸면 새 글자가 빠져 빈칸으로 나오므로 다시 만든다(fonttools 필요).

```bash
pyftsubset Gaegu-Bold.ttf --text="<opengraph-image.tsx의 TITLE·CHIP·LINES를 이어 붙인 문자열>" \
  --output-file=assets/fonts/Gaegu-Bold-og.ttf --layout-features='*'
```
