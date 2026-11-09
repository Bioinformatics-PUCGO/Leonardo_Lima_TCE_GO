/* Painéis interativos — Avaliação da Implementação da Agenda A3P no TCE-GO
   Renderização sem dependências externas (SVG + DOM). */
(function () {
  "use strict";
  const D = window.A3P_DADOS;
  const SVGNS = "http://www.w3.org/2000/svg";
  const CAT = [
    { nome: "Discordo totalmente", cor: "var(--dt)", hex: "#C8473D", nota: 1, claro: false },
    { nome: "Discordo parcialmente", cor: "var(--dp)", hex: "#EBA39B", nota: 2, claro: true },
    { nome: "Neutro", cor: "var(--ne)", hex: "#C3CCCB", nota: 3, claro: true },
    { nome: "Concordo parcialmente", cor: "var(--cp)", hex: "#A8D5B1", nota: 4, claro: true },
    { nome: "Concordo totalmente", cor: "var(--ct)", hex: "#2F8F55", nota: 5, claro: false },
  ];
  const COR_NOTA = { 5: "#2F8F55", 4: "#A8D5B1", 3: "#E2A92B", 2: "#E07A6F", 1: "#C8473D" };
  const SENT = {
    pos: { nome: "Positiva", cor: "#2F8F55" },
    mpos: { nome: "Parcialmente positiva", cor: "#8CCB98" },
    neu: { nome: "Neutra", cor: "#E2A92B" },
    neg: { nome: "Crítica", cor: "#D9645A" },
  };
  // Observações específicas por bloco (inconsistências encontradas nas figuras da dissertação)
  const AVISOS = {
    1: "Na Figura 7 da dissertação este bloco aparece com 96 registros (56/26/6/2/6) e NPS 0,60. Com 12 respondentes × 4 afirmativas o total possível é 48; aqui os registros foram reduzidos à metade (28/13/3/1/3), o que resulta em NPS 0,50. Confira com a planilha bruta do Forms.",
  };

  const fmt = (v, c = 2) => v.toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c });
  const pct = (v) => Math.round(v * 100) + "%";

  function calcular(b) {
    const t = [0, 0, 0, 0, 0];
    b.afirmativas.forEach((a) => a.contagem.forEach((c, i) => (t[i] += c)));
    const total = t.reduce((s, x) => s + x, 0);
    const P = t[4], N = t[2] + t[3], De = t[0] + t[1];
    return { t, total, P, N, De, nps: total ? (P - De) / total : 0 };
  }
  function corNPS(v) { return v >= 0.6 ? "#2F8F55" : v >= 0.3 ? "#E2A92B" : "#C8473D"; }

  function el(tag, attrs, ...filhos) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    filhos.flat().forEach((f) => f != null && e.append(f.nodeType ? f : document.createTextNode(f)));
    return e;
  }
  function sv(tag, attrs, ...filhos) {
    const e = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) {
      if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    filhos.flat().forEach((f) => f != null && e.append(f.nodeType ? f : document.createTextNode(f)));
    return e;
  }

  /* ---------- Dica flutuante ---------- */
  const dica = el("div", { class: "dica", role: "tooltip" });
  document.body.append(dica);
  function mostrarDica(ev, html) {
    dica.innerHTML = html; dica.classList.add("visivel");
    const x = Math.min(ev.clientX + 14, window.innerWidth - dica.offsetWidth - 8);
    const y = Math.min(ev.clientY + 14, window.innerHeight - dica.offsetHeight - 8);
    dica.style.left = x + "px"; dica.style.top = y + "px";
  }
  function esconderDica() { dica.classList.remove("visivel"); }
  function comDica(node, fn) {
    node.addEventListener("mousemove", (e) => mostrarDica(e, fn()));
    node.addEventListener("mouseleave", esconderDica);
  }

  /* ---------- Cabeçalho com navegação entre blocos ---------- */
  function cabecalho(titulo, subtitulo, atual) {
    const passos = el("nav", { class: "passos", "aria-label": "Blocos temáticos" },
      D.blocos.map((b) => {
        const c = calcular(b);
        const a = el("a", { class: "passo", href: `bloco-${b.bloco}.html` }, String(b.bloco), el("i", { style: `background:${corNPS(c.nps)}` }));
        if (b.bloco === atual) a.setAttribute("aria-current", "page");
        comDica(a, () => `<b>Bloco ${b.bloco}</b> — ${b.tema}<br>NPS adaptado ${fmt(c.nps)}`);
        return a;
      }));
    return el("header", { class: "cabecalho" },
      el("div", { class: "selo" },
        el("div", { class: "selo-marca", "aria-hidden": "true" }, el("span", null, "A3P")),
        el("div", null, el("b", null, "Comitê de Sustentabilidade"), el("small", null, "Tribunal de Contas do Estado de Goiás"))),
      el("div", { class: "titulo-bloco" }, el("h1", null, titulo), el("p", null, subtitulo)),
      el("div", { class: "navegacao" }, passos,
        atual ? el("a", { class: "link-geral", href: "index.html" }, "Ver comparativo dos 9 blocos") : null));
  }

  function rodape(extra) {
    return el("footer", { class: "rodape" },
      extra ? el("p", null, extra) : null,
      el("p", null, "NPS adaptado = (% de promotores − % de detratores). Promotores: nota 5 (concordo totalmente); neutros: notas 3 e 4; detratores: notas 1 e 2. Universo: 12 membros do Comitê de Sustentabilidade do TCE-GO (censo)."),
      el("p", null, "Fonte: LIMA, Leonardo Oliveira. Proposta de implementação da Agenda Ambiental na Administração Pública (A3P) no TCE-GO. Dissertação (Mestrado Profissional em Administração Pública) — UFG, 2026."));
  }

  /* ---------- Velocímetro NPS ---------- */
  function velocimetro(nps) {
    const cx = 120, cy = 118, r = 92;
    const ponto = (v, rr = r) => { const a = Math.PI * (1 - v); return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)]; };
    const arco = (v0, v1, cor) => {
      const [x0, y0] = ponto(v0), [x1, y1] = ponto(v1);
      return sv("path", { d: `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`, stroke: cor, "stroke-width": 20, fill: "none", "stroke-linecap": "butt" });
    };
    const v = Math.max(0, Math.min(1, nps));
    const ponteiro = sv("g", { style: "transition:transform .9s cubic-bezier(.3,1.4,.5,1);transform-origin:120px 118px;transform:rotate(-90deg)" },
      sv("line", { x1: cx, y1: cy, x2: cx, y2: cy - r + 8, stroke: "#12343B", "stroke-width": 4, "stroke-linecap": "round" }));
    const s = sv("svg", { viewBox: "0 0 240 180", role: "img", "aria-label": `NPS adaptado ${fmt(nps)}` },
      arco(0, 0.3, "#C8473D"), arco(0.3, 0.6, "#E2A92B"), arco(0.6, 1, "#2F8F55"),
      ponteiro, sv("circle", { cx, cy, r: 8, fill: "#12343B" }),
      sv("text", { x: 22, y: 140, "font-size": 11, fill: "#5A7076", "text-anchor": "middle" }, "0,00"),
      sv("text", { x: 218, y: 140, "font-size": 11, fill: "#5A7076", "text-anchor": "middle" }, "1,00"),
      sv("text", { x: cx, y: 172, "text-anchor": "middle", class: "nps-valor" }, fmt(nps)));
    requestAnimationFrame(() => requestAnimationFrame(() => { ponteiro.style.transform = `rotate(${-90 + 180 * v}deg)`; }));
    return s;
  }

  /* ---------- Página de bloco ---------- */
  function paginaBloco(app, n) {
    const b = D.blocos.find((x) => x.bloco === n);
    const c = calcular(b);
    document.title = `Bloco ${n} — ${b.tema} | A3P TCE-GO`;
    const estado = { destaque: null, modo: "pct", ordem: "quest", sent: "todas", busca: "", palavra: null, abertos: new Set() };

    // NPS
    const chips = el("div", { class: "chips" },
      [["Promotores", c.P, "#2F8F55", "nota 5"], ["Neutros", c.N, "#E2A92B", "notas 3 e 4"], ["Detratores", c.De, "#C8473D", "notas 1 e 2"]].map(([nome, q, cor, d]) => {
        const ch = el("div", { class: "chip", style: `background:${cor}`, tabindex: 0 }, pct(q / c.total), el("small", null, nome));
        comDica(ch, () => `<b>${nome}</b> (${d})<br>${q} de ${c.total} respostas`);
        return ch;
      }));
    const pNps = el("section", { class: "painel p-nps" }, el("h2", null, "NPS adaptado"),
      el("p", { class: "sub" }, `${b.afirmativas.length} afirmativas × ${D.respondentes} respondentes = ${c.total} respostas`),
      el("div", { class: "nps-corpo" }, velocimetro(c.nps), chips),
      AVISOS[n] ? el("div", { class: "aviso" }, AVISOS[n]) : null);

    // Valores por nota
    const svgNotas = sv("svg", { viewBox: "0 0 360 200", role: "img", "aria-label": "Distribuição das notas" });
    const pNotas = el("section", { class: "painel p-notas" }, el("h2", null, "Valores por nota"),
      el("p", { class: "sub" }, "Clique em uma barra para destacá-la nas afirmativas"), svgNotas);
    function desenharNotas() {
      svgNotas.innerHTML = "";
      const max = Math.max(...c.t), base = 165, alt = 125, w = 50, gap = 18, x0 = 22;
      [5, 4, 3, 2, 1].forEach((nota, i) => {
        const q = c.t[nota - 1], h = max ? (q / max) * alt : 0, x = x0 + i * (w + gap);
        const g = sv("g", { class: "barra-nota" + (estado.destaque && estado.destaque !== nota ? " apagada" : ""), tabindex: 0, role: "button",
          "aria-pressed": String(estado.destaque === nota), "aria-label": `Nota ${nota}: ${q} respostas`,
          onclick: () => alternarDestaque(nota), onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternarDestaque(nota); } } },
          sv("rect", { x, y: base - h, width: w, height: Math.max(h, 1), rx: 3, fill: COR_NOTA[nota] }),
          sv("text", { x: x + w / 2, y: base - h - 6, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: "#12343B" }, String(q)),
          sv("text", { x: x + w / 2, y: base + 18, "text-anchor": "middle", "font-size": 13, fill: "#5A7076" }, String(nota)));
        comDica(g, () => `<b>Nota ${nota}</b> — ${CAT[nota - 1].nome}<br>${q} respostas (${pct(q / c.total)})`);
        svgNotas.append(g);
      });
      svgNotas.append(sv("line", { x1: 14, x2: 352, y1: base, y2: base, stroke: "#D3DEDC" }),
        sv("text", { x: 180, y: 198, "text-anchor": "middle", "font-size": 12, fill: "#5A7076" }, "Opção numérica da resposta"));
    }
    function alternarDestaque(nota) { estado.destaque = estado.destaque === nota ? null : nota; desenharNotas(); desenharLikert(); }

    // Nuvem
    const caixaNuvem = el("div", { class: "nuvem" });
    const pNuvem = el("section", { class: "painel p-nuvem" }, el("h2", null, `Nuvem de palavras — Bloco ${n}`),
      el("p", { class: "sub" }, "Termos mais frequentes nas respostas abertas. Clique para filtrar as respostas."), caixaNuvem);

    // Likert
    const listaLikert = el("div");
    const botoesModo = ["pct", "num"].map((m) => el("button", { type: "button", "aria-pressed": String(estado.modo === m),
      onclick: () => { estado.modo = m; botoesModo.forEach((x, i) => x.setAttribute("aria-pressed", String(["pct", "num"][i] === m))); desenharLikert(); } },
      m === "pct" ? "Percentual" : "Nº de respostas"));
    const botoesOrdem = ["quest", "conc"].map((m) => el("button", { type: "button", "aria-pressed": String(estado.ordem === m),
      onclick: () => { estado.ordem = m; botoesOrdem.forEach((x, i) => x.setAttribute("aria-pressed", String(["quest", "conc"][i] === m))); desenharLikert(); } },
      m === "quest" ? "Ordem do formulário" : "Maior concordância"));
    const pLikert = el("section", { class: "painel p-likert" },
      el("h2", null, "Distribuição das respostas por afirmativa — escala Likert"),
      el("p", { class: "sub" }, "Clique em uma afirmativa para ver o texto completo e as contagens"),
      el("div", { class: "controles" },
        el("div", { class: "legenda" }, CAT.map((k) => el("span", null, el("i", { style: `background:${k.cor}` }), k.nome))),
        el("div", { class: "alternador", role: "group", "aria-label": "Unidade" }, botoesModo),
        el("div", { class: "alternador", role: "group", "aria-label": "Ordenação" }, botoesOrdem)),
      listaLikert,
      el("div", { class: "eixo-x", "aria-hidden": "true" }, el("span"), el("div", null, ...["−100%", "−50%", "0%", "50%", "100%"].map((t) => el("span", null, t)))));

    function desenharLikert() {
      listaLikert.innerHTML = "";
      let itens = b.afirmativas.map((a, i) => ({ ...a, i }));
      if (estado.ordem === "conc") itens.sort((x, y) => (y.contagem[4] * 10 + y.contagem[3]) - (x.contagem[4] * 10 + x.contagem[3]));
      itens.forEach((a) => {
        const tot = a.contagem.reduce((s, x) => s + x, 0);
        const p = a.contagem.map((x) => (x / tot) * 100);
        let pos = 50 - (p[0] + p[1] + p[2] / 2) / 2;
        const trilho = el("div", { class: "likert-trilho" }, el("span", { class: "eixo" }));
        a.contagem.forEach((q, k) => {
          const largura = p[k] / 2;
          if (q > 0) {
            const rot = largura >= 4 ? (estado.modo === "pct" ? Math.round(p[k]) + "%" : String(q)) : "";
            const seg = el("div", { class: "seg" + (CAT[k].claro ? " claro" : "") + (estado.destaque && estado.destaque !== k + 1 ? " apagada" : ""),
              style: `left:${pos}%;width:${largura}%;background:${CAT[k].cor}` }, rot);
            comDica(seg, () => `<b>${CAT[k].nome}</b><br>${q} de ${tot} respondentes (${Math.round(p[k])}%)`);
            trilho.append(seg);
          }
          pos += largura;
        });
        const aberto = estado.abertos.has(a.i);
        const curto = a.texto.length > 70 ? a.texto.slice(0, 68).trim() + "…" : a.texto;
        const linha = el("div", { class: "likert-linha", tabindex: 0, "aria-expanded": String(aberto),
          onclick: () => { aberto ? estado.abertos.delete(a.i) : estado.abertos.add(a.i); desenharLikert(); },
          onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); linha.click(); } } },
          el("div", { class: "likert-rotulo" }, el("b", null, `P${a.i + 1}`), aberto ? "" : curto), trilho);
        if (aberto) {
          const conc = a.contagem[3] + a.contagem[4], disc = a.contagem[0] + a.contagem[1];
          linha.append(el("div", { class: "likert-detalhe" },
            el("div", null, el("strong", { style: "color:var(--tinta)" }, a.texto)),
            el("div", { class: "rolagem" }, el("table", null,
              el("tr", null, CAT.map((k) => el("th", null, k.nome))),
              el("tr", null, a.contagem.map((q) => el("td", null, `${q} (${Math.round((q / tot) * 100)}%)`))))),
            el("div", { style: "margin-top:6px" }, `Concordância: ${pct(conc / tot)} · Discordância: ${pct(disc / tot)} · NPS do item: ${fmt((a.contagem[4] - disc) / tot)}`)));
        }
        listaLikert.append(linha);
      });
    }

    // Respostas abertas
    const lista = el("ul", { class: "respostas" });
    const estadoFiltro = el("div", { class: "estado-filtro" });
    const contagemSent = {};
    b.respostasAbertas.forEach((r) => (contagemSent[r.sentimento] = (contagemSent[r.sentimento] || 0) + 1));
    const filtros = el("div", { class: "filtros", role: "group", "aria-label": "Filtrar por tom da resposta" });
    function desenharFiltros() {
      filtros.innerHTML = "";
      [["todas", "Todas", null, b.respostasAbertas.length], ...Object.keys(SENT).filter((k) => contagemSent[k]).map((k) => [k, SENT[k].nome, SENT[k].cor, contagemSent[k]])]
        .forEach(([k, nome, cor, q]) => filtros.append(el("button", { type: "button", class: "filtro", "aria-pressed": String(estado.sent === k),
          onclick: () => { estado.sent = k; desenharFiltros(); desenharRespostas(); } }, cor ? el("i", { style: `background:${cor}` }) : null, `${nome} (${q})`)));
    }
    const busca = el("input", { class: "busca", type: "search", placeholder: "Buscar nas respostas", "aria-label": "Buscar nas respostas",
      oninput: (e) => { estado.busca = e.target.value; desenharRespostas(); } });
    const pAbertas = el("section", { class: "painel p-abertas" }, el("h2", null, "Respostas abertas"),
      el("p", { class: "sub" }, b.perguntaAberta), filtros, busca, estadoFiltro, lista);

    function realcar(texto, termos) {
      const norm = Array.from(texto).map((ch) => semAcento(ch.toLowerCase())).join("");
      const marcas = new Array(texto.length).fill(false);
      termos.filter(Boolean).forEach((t) => {
        const tn = semAcento(t.toLowerCase()); if (!tn) return;
        let i = norm.indexOf(tn);
        while (i >= 0) { for (let j = i; j < i + tn.length; j++) marcas[j] = true; i = norm.indexOf(tn, i + tn.length); }
      });
      const frag = document.createDocumentFragment(); let buf = "", em = false;
      const flush = () => { if (!buf) return; frag.append(em ? el("mark", null, buf) : document.createTextNode(buf)); buf = ""; };
      Array.from(texto).forEach((ch, i) => { if (marcas[i] !== em) { flush(); em = marcas[i]; } buf += ch; });
      flush(); return frag;
    }
    function desenharRespostas() {
      lista.innerHTML = ""; estadoFiltro.innerHTML = "";
      if (estado.palavra) estadoFiltro.append(`Filtrando pela palavra “${estado.palavra}”. `,
        el("button", { type: "button", onclick: () => { estado.palavra = null; desenharNuvem(); desenharRespostas(); } }, "Limpar"));
      const q = semAcento(estado.busca.trim().toLowerCase());
      const itens = b.respostasAbertas.map((r, i) => ({ ...r, i })).filter((r) => {
        const tn = semAcento(r.texto.toLowerCase());
        return (estado.sent === "todas" || r.sentimento === estado.sent) && (!q || tn.includes(q)) && (!estado.palavra || tn.includes(semAcento(estado.palavra)));
      });
      if (!itens.length) { lista.append(el("li", { class: "vazio" }, "Nenhuma resposta corresponde aos filtros. Limpe a busca ou escolha “Todas”.")); return; }
      itens.forEach((r) => {
        const aberto = estado.abertos.has("r" + r.i);
        const li = el("li", { tabindex: 0, "aria-expanded": String(aberto),
          onclick: () => { aberto ? estado.abertos.delete("r" + r.i) : estado.abertos.add("r" + r.i); desenharRespostas(); },
          onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); } } },
          el("span", { class: "ponto", style: `background:${SENT[r.sentimento].cor}`, title: SENT[r.sentimento].nome }),
          el("span", { class: "txt" }, realcar(r.texto, [estado.busca.trim(), estado.palavra])));
        lista.append(li);
      });
    }

    // Nuvem de palavras (calculada a partir das respostas)
    function desenharNuvem() {
      caixaNuvem.innerHTML = "";
      const freq = frequencias(b.respostasAbertas.map((r) => r.texto)).slice(0, 42);
      caixaNuvem.append(nuvem(freq, estado.palavra, (p) => { estado.palavra = estado.palavra === p ? null : p; desenharNuvem(); desenharRespostas(); }));
    }

    app.append(cabecalho(`Bloco ${n} — ${b.tema}`, "Relatório de respostas — Avaliação da implementação da Agenda A3P no TCE-GO", n),
      el("main", { class: "grade" }, pNps, pNotas, pNuvem, pLikert, pAbertas), rodape());
    desenharNotas(); desenharLikert(); desenharFiltros(); desenharRespostas(); desenharNuvem();
  }

  /* ---------- Texto: frequências e nuvem ---------- */
  function semAcento(s) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  const PARADAS = new Set(semAcento(`a à ao aos as às até após com como contra da das de do dos desde e é em entre era essa esse essas esses esta este estas estes isso isto já la lá mais mas me mesmo muito muitos na nas nem no nos não o os ou para pela pelas pelo pelos por porque quais qual quando que quem se sem ser seu seus sua suas são também te tem têm ter um uma umas uns foi há onde sobre todo todos toda todas cada bem assim ainda além apenas forma sendo serem seria seriam poderia poderiam pode podem possa possam deve devem deveria fazer feito faz fazem vez outras outros outra outro maior menor melhor meio através sim nao sei tce go tce-go a3p acredito considero creio exemplo vide resposta anterior ja sao ha alguns algumas tanto tudo nesse nessa neste nesta desse dessa deste desta dele dela eles elas ele ela nós vocês você lhe seja sejam está estão estar estamos sido tendo houver mediante através junto quanto quanta quantos`).split(/\s+/));
  function frequencias(textos) {
    const cont = new Map(), forma = new Map();
    textos.forEach((t) => (t.toLowerCase().match(/[a-zà-ÿ0-9-]+/gi) || []).forEach((w) => {
      w = w.replace(/^-+|-+$/g, "");
      const k = semAcento(w);
      if (k.length < 4 || PARADAS.has(k) || /^\d+$/.test(k)) return;
      cont.set(k, (cont.get(k) || 0) + 1);
      const f = forma.get(k) || {}; f[w] = (f[w] || 0) + 1; forma.set(k, f);
    }));
    return [...cont.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([k, q]) => { const f = forma.get(k); return [Object.keys(f).sort((a, b) => f[b] - f[a])[0], q]; });
  }
  const CORES_NUVEM = ["#0F5C6E", "#2F8F55", "#5B4A9E", "#1B8A8F", "#B07D12", "#3D7A3A", "#7A3F8C"];
  function nuvem(freq, ativa, aoClicar) {
    const W = 600, H = 320;
    const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Nuvem de palavras" });
    if (!freq.length) return svg;
    const ctx = document.createElement("canvas").getContext("2d");
    const max = freq[0][1], min = freq[freq.length - 1][1];
    const tam = (q) => (max === min ? 30 : 13 + (Math.sqrt(q - min) / Math.sqrt(max - min)) * 44);
    const ocupados = [];
    const colide = (r) => r.x < 2 || r.y < 2 || r.x + r.w > W - 2 || r.y + r.h > H - 2 ||
      ocupados.some((o) => r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y);
    freq.forEach(([p, q], idx) => {
      const fs = tam(q);
      ctx.font = `${idx < 3 ? 800 : 600} ${fs}px "Public Sans", Arial, sans-serif`;
      const w = ctx.measureText(p).width + 4, h = fs * 0.92;
      for (let t = 0; t < 900; t++) {
        const ang = t * 0.35, raio = 2.2 * ang;
        const cx = W / 2 + raio * Math.cos(ang) * 1.6, cy = H / 2 + raio * Math.sin(ang) * 0.85;
        const r = { x: cx - w / 2, y: cy - h / 2, w, h };
        if (!colide(r)) {
          ocupados.push(r);
          const txt = sv("text", { x: cx, y: cy + fs * 0.33, "text-anchor": "middle", "font-size": fs.toFixed(1), "font-weight": idx < 3 ? 800 : 600,
            fill: CORES_NUVEM[idx % CORES_NUVEM.length], class: "nuvem-palavra" + (ativa && semAcento(ativa) === semAcento(p) ? " ativa" : ""),
            tabindex: 0, role: "button", "aria-label": `${p}: ${q} ocorrências`, opacity: ativa && semAcento(ativa) !== semAcento(p) ? 0.35 : 1,
            onclick: () => aoClicar(p), onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); aoClicar(p); } } }, p);
          comDica(txt, () => `<b>${p}</b><br>${q} ocorrência${q > 1 ? "s" : ""}`);
          svg.append(txt);
          break;
        }
      }
    });
    return svg;
  }

  function rotuloCurto(b) { return `${b.bloco} · ${b.tema.length > 36 ? b.tema.slice(0, 35).trim() + "…" : b.tema}`; }
  /* ---------- Visão geral (comparativo) ---------- */
  function paginaGeral(app) {
    const dados = D.blocos.map((b) => ({ b, c: calcular(b) }));
    const media = dados.reduce((s, x) => s + x.c.nps, 0) / dados.length;
    const ordenados = [...dados].sort((x, y) => y.c.nps - x.c.nps);

    // Comparativo NPS
    const W = 620, lin = 34, H = ordenados.length * lin + 40, x0 = 262, larg = W - x0 - 50;
    const s1 = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "NPS adaptado por bloco" });
    ordenados.forEach(({ b, c }, i) => {
      const y = 10 + i * lin, w = Math.max(0, c.nps) * larg;
      const g = sv("g", { style: "cursor:pointer", onclick: () => (location.href = `bloco-${b.bloco}.html`) },
        sv("text", { x: x0 - 10, y: y + 18, "text-anchor": "end", "font-size": 12.5, fill: "#12343B" }, rotuloCurto(b)),
        sv("rect", { x: x0, y: y + 4, width: w, height: 20, rx: 3, fill: corNPS(c.nps) }),
        sv("text", { x: x0 + w + 6, y: y + 19, "font-size": 12.5, "font-weight": 700, fill: "#12343B" }, fmt(c.nps)));
      comDica(g, () => `<b>Bloco ${b.bloco} — ${b.tema}</b><br>NPS ${fmt(c.nps)} · ${pct(c.P / c.total)} promotores · ${pct(c.N / c.total)} neutros · ${pct(c.De / c.total)} detratores<br><i>Clique para abrir o painel</i>`);
      s1.append(g);
    });
    const xm = x0 + media * larg;
    s1.append(sv("line", { x1: xm, x2: xm, y1: 4, y2: H - 26, stroke: "#12343B", "stroke-dasharray": "4 4" }),
      sv("text", { x: xm, y: H - 10, "text-anchor": "middle", "font-size": 12, fill: "#12343B" }, `Média ${fmt(media)}`));

    // Composição
    const s2 = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Composição das respostas por bloco" });
    ordenados.forEach(({ b, c }, i) => {
      const y = 10 + i * lin; let x = x0;
      s2.append(sv("text", { x: x0 - 10, y: y + 18, "text-anchor": "end", "font-size": 12.5, fill: "#12343B" }, rotuloCurto(b)));
      [["Promotores", c.P, "#2F8F55", "#fff"], ["Neutros", c.N, "#E2A92B", "#12343B"], ["Detratores", c.De, "#C8473D", "#fff"]].forEach(([nome, q, cor, ct]) => {
        const w = (q / c.total) * (larg + 30);
        const g = sv("g", null, sv("rect", { x, y: y + 4, width: w, height: 20, fill: cor }),
          w > 30 ? sv("text", { x: x + w / 2, y: y + 18, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: ct }, pct(q / c.total)) : null);
        comDica(g, () => `<b>Bloco ${b.bloco}</b> — ${nome}<br>${q} de ${c.total} respostas (${pct(q / c.total)})`);
        s2.append(g); x += w;
      });
    });
    s2.append(sv("text", { x: x0, y: H - 10, "font-size": 12, fill: "#5A7076" }, "Promotores (verde) · Neutros (amarelo) · Detratores (vermelho)"));

    const cartoes = el("div", { class: "cartoes" }, dados.map(({ b, c }) =>
      el("a", { class: "cartao", href: `bloco-${b.bloco}.html` },
        el("div", { class: "num" }, `Bloco ${b.bloco}`), el("h3", null, b.tema),
        el("div", { class: "val", style: `color:${corNPS(c.nps)}` }, fmt(c.nps), el("small", null, "NPS adaptado")),
        el("div", { class: "mini", "aria-hidden": "true" },
          el("span", { style: `width:${(c.P / c.total) * 100}%;background:#2F8F55` }),
          el("span", { style: `width:${(c.N / c.total) * 100}%;background:#E2A92B` }),
          el("span", { style: `width:${(c.De / c.total) * 100}%;background:#C8473D` })))));

    app.append(cabecalho("Avaliação da implementação da Agenda A3P no TCE-GO",
      `Percepção do Comitê de Sustentabilidade em 9 blocos temáticos · NPS adaptado médio ${fmt(media)}`, null),
      el("main", { class: "grade" },
        el("section", { class: "painel", style: "grid-column:span 12" }, el("h2", null, "Painéis por bloco temático"),
          el("p", { class: "sub" }, "Abra um bloco para ver o velocímetro, as notas, a escala Likert por afirmativa, a nuvem de palavras e as respostas abertas."), cartoes),
        el("section", { class: "painel p-comp" }, el("h2", null, "NPS adaptado por bloco"),
          el("p", { class: "sub" }, "Ordenado do maior para o menor; a linha tracejada marca a média geral. Clique em uma barra para abrir o bloco."), s1),
        el("section", { class: "painel p-comp" }, el("h2", null, "Composição das respostas por bloco"),
          el("p", { class: "sub" }, "Promotores, neutros e detratores em cada bloco."), s2)),
      rodape("Observação: o Bloco 1 foi recalculado a partir de 48 respostas (12 × 4 afirmativas); por isso o NPS difere do 0,60 apresentado na Figura 7 e a média difere de 0,45."));
  }

  /* ---------- Inicialização ---------- */
  const app = document.getElementById("app");
  const n = parseInt(app.dataset.bloco, 10);
  const iniciar = () => (n ? paginaBloco(app, n) : paginaGeral(app));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(iniciar); else iniciar();
})();
