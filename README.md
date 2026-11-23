# pixelpelula-site

Landing estática trilíngue (PT/EN/ES). Copy em `i18n/*.json` — não editar sem aprovação.

## Build & deploy

```sh
node build.mjs                      # gera dist/ (sem dependências)
python3 -m http.server -d dist      # preview local
# deploy: publicar dist/ em qualquer host estático (Netlify, Pages, S3)
```

A raiz `/` redireciona por idioma do navegador (fallback: EN). Rotas: `/pt/`, `/en/`, `/es/`.
