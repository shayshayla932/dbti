# DBTI · 设计民工也有自己的 BTI

A personality test for designers: 10 hands-on questions from a designer's workday, 12 result types, bilingual (中文 / English).

**Play:** https://shayshayla932.github.io/dbti/

- The site is the single file `index.html` at the repo root (served by GitHub Pages).
- `source/` holds the React + Vite source. Rebuild with:

  ```bash
  cd source
  npm install
  npx vite build   # outputs dist/index.html
  cp dist/index.html ../index.html
  ```

- UI motion components come from [beUI](https://github.com/starc007/ui-components) (MIT, see `source/src/beui/LICENSE-beUI`).
