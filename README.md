# Painéis interativos — Implementação da Agenda A3P no TCE-GO

Painéis dos 9 blocos temáticos da dissertação de Leonardo Oliveira Lima (Mestrado Profissional em Administração Pública — UFG, 2026), com a percepção dos 12 membros do Comitê de Sustentabilidade do TCE-GO.

## Estrutura

```
index.html          visão geral: NPS comparativo e composição dos 9 blocos
bloco-1.html … bloco-9.html   um painel por bloco
assets/dados.js     TODOS os dados (afirmativas, contagens Likert, respostas abertas)
assets/painel.js    gráficos e interações (sem bibliotecas externas)
assets/estilo.css   visual
```

## Publicar no GitHub Pages

1. Crie um repositório (ex.: `dashboard-a3p-tcego`) e envie todo o conteúdo desta pasta para a raiz.
2. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. Em 1–2 minutos o site fica em `https://SEU-USUARIO.github.io/dashboard-a3p-tcego/`.

Os arquivos também abrem direto no navegador (duplo clique), sem servidor.

## Interações em cada painel

- Velocímetro do NPS adaptado com promotores, neutros e detratores (passe o mouse para ver as contagens).
- "Valores por nota": clique numa barra para destacar aquela nota em todas as afirmativas.
- Escala Likert: alterna entre percentual e nº de respostas, reordena por concordância e, ao clicar numa afirmativa, mostra o texto completo, a tabela de contagens e o NPS do item.
- Nuvem de palavras calculada a partir das respostas abertas; clique numa palavra para filtrar as respostas.
- Respostas abertas com busca, filtro por tom (positiva, parcialmente positiva, neutra, crítica) e expansão do texto completo.

## Atualizar os dados

Edite apenas `assets/dados.js`. Cada afirmativa tem
`contagem: [Discordo totalmente, Discordo parcialmente, Neutro, Concordo parcialmente, Concordo totalmente]`
(12 respondentes por afirmativa). NPS, gráficos e nuvem são recalculados automaticamente.

## Origem dos dados e pontos de atenção

- Respostas abertas: planilha `Resultados_por_bloco.xlsx`.
- Texto das afirmativas: formulário reproduzido no anexo da dissertação.
- Contagens por afirmativa: reconstruídas a partir dos gráficos das Figuras 7–15, ajustadas para bater exatamente com os totais de "Valores por nota". Os blocos 2 a 9 reproduzem os NPS da Tabela 1. Substitua pelos dados brutos do Forms quando possível.
- Bloco 1: a Figura 7 mostra 96 registros (56/26/6/2/6), mas 12 respondentes × 4 afirmativas = 48. Usou-se metade (28/13/3/1/3), o que dá NPS 0,50 em vez de 0,60.
- Bloco 9: na Figura 15 os rótulos das afirmativas repetem os do Bloco 8; aqui foram usados os textos corretos do formulário.
- Bloco 7: os rótulos da Figura 13 diferem do formulário; aqui foram usados os textos do formulário.
- Tom das respostas abertas: segue as cores dos marcadores nas figuras da dissertação.
