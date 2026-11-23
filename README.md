# pixelpelula-site

Landing estática trilíngue (PT/EN/ES). Copy em `i18n/*.json` — não editar sem aprovação.

## Build & deploy

```sh
npm run build                       # gera dist/ (sem dependências)
npm start                           # preview em http://localhost:3000
npm test                            # testa rotas e arquivos estáticos
```

## Railway

Conecte este repositório a um serviço Railway. `railway.json` configura o build (`npm run build`), o start (`npm start`) e o health check em `/`. O servidor usa a variável `PORT` do Railway e publica as páginas em `/`, `/pt/`, `/en/` e `/es/`.

A raiz `/` redireciona por idioma do navegador (fallback: EN). Rotas: `/pt/`, `/en/`, `/es/`.
