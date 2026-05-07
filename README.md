# 노션 뮤직 플레이어 - Notion Music Player

노션 페이지에 임베드해서 사용할 수 있는 커스텀 음악 플레이어입니다. YouTube IFrame API로 음악을 재생하고, 그 위에 자체 플레이어 인터페이스를 렌더링합니다.

## 파일 구성

- `index.html`: 위젯 마크업
- `styles.css`: 비주얼 테마와 반응형 레이아웃
- `script.js`: 쿼리 파라미터 파싱과 YouTube 플레이어 제어

## 쿼리 파라미터

- `video`: 필수 값입니다. YouTube URL 또는 일반 동영상 ID를 입력합니다.
- `title`: 트랙 제목
- `artist`: 아티스트 이름
- `cover`: 선택 값입니다. 커버 이미지 URL 또는 장르 키를 입력합니다.
- `theme`: `sunset`, `ocean`, `moss`, `noir`, `blush`, `latte`, `mint`, `midnight`, `butter`, `steel`, `cherry`, `paper` 중 하나
- `layout`: `horizontal` 또는 `vertical`
- `autoplay`: `1`로 설정하면 자동 재생을 요청합니다.

## 장르 커버

이미지 URL 대신 `cover`에 장르 키를 넣으면 해당 장르 커버를 표시합니다.
`covers/` 폴더에 일치하는 파일이 있으면 해당 이미지를 먼저 사용합니다. 없으면 생성된 대체 커버가 표시됩니다.

- `pop`
- `kpop`
- `jpop`
- `jazz`
- `lofi`
- `rock`
- `hiphop`
- `rnb`
- `electronic`
- `citypop`
- `classic`
- `indie`
- `ballad`

## 예시

```text
https://your-domain.example/?video=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DqlbhhPWQKYY&title=Night%20Drive&artist=Your%20Name&theme=noir
```

## 노션에서 사용하기

1. 이 폴더를 정적 사이트로 배포합니다.
2. 배포된 URL에 쿼리 파라미터를 붙여 엽니다.
3. 해당 URL을 노션의 `/embed` 블록에 붙여 넣습니다.

## 간단한 배포 방법

### Vercel

1. 이 폴더를 Git 저장소에 업로드합니다.
2. 해당 저장소를 Vercel에서 가져옵니다.
3. 기본 설정으로 정적 사이트를 배포합니다.

### GitHub Pages

1. 폴더 내용을 저장소에 push합니다.
2. 저장소 설정에서 GitHub Pages를 활성화합니다.
3. 생성된 Pages URL을 위젯 기본 URL로 사용합니다.

## 참고 사항

- 일부 YouTube 영상은 임베드를 차단합니다. 이 경우 위젯에서 재생할 수 없습니다.
- 브라우저와 노션 정책에 따라 사용자가 위젯 안을 한 번 클릭하기 전까지 자동 재생이 차단될 수 있습니다.
