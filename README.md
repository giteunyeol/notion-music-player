# Notion Music Player

A custom embeddable music player for Notion pages. It uses the YouTube IFrame API for playback and renders a custom interface on top of it.

## Files

- `index.html`: widget markup
- `styles.css`: visual theme and responsive layout
- `script.js`: query parsing and YouTube player controls

## Query parameters

- `video`: required YouTube URL or plain video id
- `title`: track title
- `artist`: artist name
- `cover`: optional cover image URL or genre key
- `theme`: `sunset`, `ocean`, `moss`, `noir`, `blush`, `latte`, `mint`, `midnight`, `butter`, `steel`, `cherry`, or `paper`
- `layout`: `horizontal` or `vertical`
- `autoplay`: `1` to request autoplay

## Genre covers

Use a genre key in `cover` to render a genre cover instead of an image URL.
If a matching file exists in `covers/`, that image is used first. Otherwise, the generated fallback cover is shown.

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

## Example

```text
https://your-domain.example/?video=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DqlbhhPWQKYY&title=Night%20Drive&artist=Your%20Name&theme=noir
```

## Use in Notion

1. Deploy this folder as a static site.
2. Open the deployed URL with query parameters.
3. Paste that URL into a Notion `/embed` block.

## Easy deployment options

### Vercel

1. Upload the folder to a Git repository.
2. Import the repository into Vercel.
3. Deploy as a static site with the default settings.

### GitHub Pages

1. Push the folder contents to a repository.
2. Enable GitHub Pages from the repository settings.
3. Use the generated Pages URL as your widget base URL.

## Notes

- Some YouTube videos block embedding. In that case, the widget cannot play them.
- Browsers and Notion may block autoplay until the user clicks inside the widget once.
