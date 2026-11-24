# K20 · Coreia do Sul

Guia de viagem da Luiza pela Coreia do Sul, de 04 a 19 de setembro de 2027, no padrão K20.

## Estrutura

```
index.html      página do site
css/style.css   estilos (cores e fontes K20)
js/data.js      roteiro dia a dia, fotos, ingressos, lojas
js/app.js       telas, animações, busca de sugestões, conversor
fonts/          coloque aqui Lovelo-Black.woff2 (opcional)
```

## Como ver

Abra o `index.html` no navegador. As fotos vêm da Wikimedia Commons e a fonte Lovelo do cdnfonts, então é preciso internet.

## Publicar no GitHub Pages

1. Suba esta pasta para um repositório.
2. Em Settings → Pages, escolha a branch `main` e a pasta `/ (root)`.
3. O site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## Editar o roteiro

Tudo do roteiro fica em `js/data.js`, no array `DAYS`. Cada item tem horário (`t`), título, descrição, endereço (`place`), busca do KakaoMap (`kakao`), custo em won (`cost`), foto (`img`) e ingressos (`tickets`).

Os valores são estimativas de 2026: confirme tudo de 1 a 3 meses antes da viagem.
