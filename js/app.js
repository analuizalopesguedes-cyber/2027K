/* ===== App ===== */
const RATE = 0.0038007; // ₩1 ≈ R$0,0038 (XE, 24/11/2026)
const $ = (s, el = document) => el.querySelector(s);
const fmtKRW = n => "₩" + n.toLocaleString("pt-BR");
const fmtBRL = n => "R$" + (n * RATE).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = c => c.length === 1 ? `${fmtKRW(c[0])} (≈ ${fmtBRL(c[0])})` : `${fmtKRW(c[0])} (≈ ${fmtBRL(c[0])})–${fmtKRW(c[1])} (≈ ${fmtBRL(c[1])})`;
const kakao = q => "https://map.kakao.com/link/search/" + encodeURIComponent(q);
const gmaps = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q + " Seoul");
const gsearch = q => "https://www.google.com/search?q=" + encodeURIComponent(q);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const ICON = {
  metro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l2-4M16 21l-2-4"/></svg>',
  walk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="13" cy="4" r="2"/><path d="M10 21l2-7 3 3v5M8 12l2-4 4 1 2 3"/></svg>',
  food: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 3c-2 2-2 6 0 8v10"/></svg>',
  shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  place: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z"/></svg>',
  night: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/></svg>',
  taxi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3z"/></svg>',
  rest: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M3 18v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6M3 14h18"/></svg>'
};
const I = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 9l2 6 2-5 2 5 2-6M7 12h10"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>',
  tk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'
};

function imgTag(src, alt) {
  return `<img src="${src}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove();this.parentNode&&this.parentNode.classList.add('noimg')">`;
}

/* ---------- Dias ---------- */
const scroller = $("#daysScroll"), view = $("#dayView");
DAYS.forEach((d, i) => {
  const b = document.createElement("button");
  b.className = "day-btn"; b.role = "tab"; b.id = "tab-" + d.id;
  b.setAttribute("aria-controls", "dayView");
  b.innerHTML = `<small>${d.wd} · dia ${i + 1}</small><b>${d.date}</b><small>${d.short}</small>`;
  b.addEventListener("click", () => { showDay(d.id, true); });
  scroller.appendChild(b);
});

function dayTotals(d) {
  let lo = 0, hi = 0;
  d.items.forEach(it => { if (it.cost) { lo += it.cost[0]; hi += (it.cost[1] ?? it.cost[0]); } });
  return [lo, hi];
}

function stopHTML(it) {
  const hasImg = !!it.img;
  const tags = [];
  if (it.cost) tags.push(`<span class="tag money">${I.coin}${esc(it.costLabel || "Custo")}: ${money(it.cost)}</span>`);
  if (it.free) tags.push(`<span class="tag free">Entrada gratuita</span>`);
  const actions = [];
  if (it.kakao) {
    actions.push(`<a class="btn kakao" href="${kakao(it.kakao)}" target="_blank" rel="noopener">${I.pin}KakaoMap</a>`);
    actions.push(`<a class="btn" href="${gmaps(it.place || it.title)}" target="_blank" rel="noopener">${I.map}Google Maps</a>`);
  }
  (it.tickets || []).forEach(t => actions.push(`<a class="btn ticket" href="${t.url}" target="_blank" rel="noopener">${I.tk}${esc(t.label)}</a>`));
  return `<li class="stop ${it.highlight ? "hl" : ""} pre">
    <span class="dot">${ICON[it.type] || ICON.place}</span>
    <article class="card ${hasImg ? "has-img" : ""}">
      ${hasImg ? `<div class="ph" data-n="${esc(it.title)}">${imgTag(it.img, it.title)}</div>` : ""}
      <div class="body">
        <div class="when">${esc(it.t)}</div>
        <h3>${esc(it.title)}</h3>
        ${it.desc ? `<p>${esc(it.desc)}</p>` : ""}
        ${it.place ? `<p class="addr">${I.pin}<span>${esc(it.place)}</span></p>` : ""}
        ${tags.length ? `<div class="meta">${tags.join("")}</div>` : ""}
        ${it.tip ? `<p class="tip"><b>Dica de amiga:</b> ${esc(it.tip.replace(/^Dica de amiga:\s*/, ""))}</p>` : ""}
        ${actions.length ? `<div class="actions">${actions.join("")}</div>` : ""}
      </div>
    </article>
  </li>`;
}

let current = null;
function showDay(id, scrollTo) {
  const idx = DAYS.findIndex(d => d.id === id); if (idx < 0) return;
  const d = DAYS[idx]; current = idx;
  [...scroller.children].forEach((b, i) => {
    b.setAttribute("aria-selected", i === idx ? "true" : "false");
    if (i === idx) scroller.scrollTo({ left: b.offsetLeft - scroller.clientWidth / 2 + b.offsetWidth / 2, behavior: "smooth" });
  });
  view.setAttribute("aria-labelledby", "tab-" + d.id);
  const [lo, hi] = dayTotals(d);
  const tickets = d.items.flatMap(it => it.tickets || []);
  const nightOrTicket = d.items.filter(it => it.type === "night" || it.type === "ticket");
  const highlights = d.items.filter(it => it.highlight).map(it => it.title);
  view.classList.remove("swap", "in"); void view.offsetWidth;
  view.innerHTML = `
    <div class="day-hero">
      ${imgTag(d.cover, d.title)}
      <div class="inner">
        <div><span class="day-num">Dia ${idx + 1} · ${d.date} · ${d.wd}</span>
          <h2>${esc(d.title)}</h2><p>${esc(d.sub)}</p></div>
        <div class="day-stats">
          <div class="stat"><span>Região</span><b>${esc(d.region)}</b></div>
          <div class="stat"><span>Gastos listados</span><b>${lo ? fmtKRW(lo) + (hi !== lo ? "–" + fmtKRW(hi) : "") : "Livre"}</b></div>
          <div class="stat"><span>Paradas</span><b>${d.items.length}</b></div>
        </div>
      </div>
    </div>
    <div class="hello"><span class="av">K20</span><span>${esc(d.hello)}</span></div>
    <div class="day-grid">
      <ol class="timeline" id="tl">${d.items.map(stopHTML).join("")}</ol>
      <aside class="aside">
        <div class="panel lime"><h3>Destaques do dia</h3><ul>${highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul></div>
        ${lo ? `<div class="panel"><h3>Quanto separar</h3><p style="margin:0;font-size:15px">${money([lo, hi])}</p><p style="margin:6px 0 0;font-size:13px;color:var(--ink-soft)">Soma dos itens do dia, sem compras pessoais.</p></div>` : ""}
        ${tickets.length ? `<div class="panel blue"><h3>Ingressos e reservas</h3><div class="actions">${tickets.map(t => `<a class="btn ticket" href="${t.url}" target="_blank" rel="noopener">${I.tk}${esc(t.label)}</a>`).join("")}</div></div>` : ""}
        <div class="panel"><h3>Ideia extra por aqui</h3>
          <p style="margin:0 0 8px;font-size:14px;color:var(--ink-soft)">Sobrou tempo? Busco no Google o que tem perto de ${esc(d.region)}.</p>
          <div class="actions">
            <a class="btn" href="${gsearch("cafés perto de " + d.region + " Seul")}" target="_blank" rel="noopener">${I.search}Cafés</a>
            <a class="btn" href="${gsearch("comida barata perto de " + d.region + " Seul")}" target="_blank" rel="noopener">${I.search}Comida</a>
            <a class="btn" href="${gsearch("o que fazer perto de " + d.region + " Seul")}" target="_blank" rel="noopener">${I.search}Passeios</a>
          </div></div>
      </aside>
    </div>
    <div class="day-nav">
      <button class="cta ghost" ${idx === 0 ? "disabled style='opacity:.35'" : ""} data-go="${idx - 1}">← Dia anterior</button>
      <button class="cta" ${idx === DAYS.length - 1 ? "disabled style='opacity:.35'" : ""} data-go="${idx + 1}">Próximo dia →</button>
    </div>`;
  view.classList.add("swap");
  requestAnimationFrame(() => view.classList.add("in"));
  view.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => {
    const n = DAYS[+b.dataset.go]; if (n) showDay(n.id, true);
  }));
  observe(view.querySelectorAll(".pre"));
  if (scrollTo) $("#dias").scrollIntoView({ behavior: "smooth" });
  try { history.replaceState(null, "", "#" + d.id); } catch (e) {}
  setSug(d.region.split(" e ")[0].split(" →")[0]);
  onScroll();
}

/* ---------- Guia ---------- */
$("#guide").innerHTML = GUIDE.map(g => `
  <a class="gcard pre" href="#${g.day}" data-day="${g.day}">
    ${imgTag(g.img, g.n)}
    <div class="gb"><h3>${esc(g.n)}</h3><p>${esc(g.d)}</p>
      <div class="row"><span class="pill">${esc(g.price)}</span><span class="pill pk">${esc(g.when)}</span><span class="pill bl">Dia ${DAYS.findIndex(d => d.id === g.day) + 1}</span></div></div>
  </a>`).join("");
$("#guide").addEventListener("click", e => {
  const a = e.target.closest("[data-day]"); if (!a) return;
  e.preventDefault(); showDay(a.dataset.day, true);
});

$("#regions").innerHTML = REGIONS.map(r => `
  <article class="region pre"><div class="ph">${imgTag(r.img, r.n)}</div><div class="t"><h3>${esc(r.n)}</h3><p>${esc(r.d)}</p></div></article>`).join("");

$("#kpopList").innerHTML = KPOP.map((k, i) => `
  <article class="card pre" style="padding:0"><div class="body">
    <div class="when">${i + 1} de ${KPOP.length}</div><h3 style="font-family:var(--f-title);color:var(--raspberry)">${esc(k.n)}</h3>
    <p>${esc(k.d)}</p><p class="addr">${I.pin}<span>${esc(k.a)}</span></p>
    <div class="actions"><a class="btn kakao" href="${kakao(k.k)}" target="_blank" rel="noopener">${I.pin}KakaoMap</a></div>
  </div></article>`).join("");

const NIGHT = [
  { n: "Bar Cham", k: "Bar tranquilo · Seochon", img: P.seochon, day: "d05",
    d: "Cocktail/whiskey bar pequeno com ingredientes coreanos. CatchTable 4,9/5 (880 avaliações) e reconhecimento internacional. Quarta–segunda, 18h–1h; fechado às terças.",
    a: "34 Jahamun-ro 7-gil, Jongno-gu", p: [22000, 25000], dress: "Smart casual (sem dress code oficial)", q: "바 참 자하문로", t: [T.cham, T.chamIg] },
  { n: "Magpie Brewing Co.", k: "Bar tranquilo · Itaewon", img: P.itaewon, day: "d08",
    d: "Taproom informal, walk-in, atendimento em inglês e cartão. Quarta–domingo, 17h–23h. Não serve comida.",
    a: "244-1 Noksapyeong-daero, Yongsan-gu (Noksapyeong, saída 2)", p: [30000, 55000], dress: "Casual", q: "맥파이 브루잉 이태원", t: [] },
  { n: "Zest Seoul", k: "Bar tranquilo · Cheongdam", img: P.cheongdam, day: "d14",
    d: "Coquetelaria premiada. CatchTable 4,8/5 (754 avaliações). Seg–sex 18h30–2h; sáb/dom 15h–2h. Coquetel de referência perto de ₩26.000.",
    a: "1º andar, Sky Building, 26 Dosan-daero 55-gil, Gangnam-gu", p: [20000, 60000], dress: "Smart casual (sem dress code oficial)", q: "제스트 서울 도산대로55길", t: [T.zestCt, T.zest] },
  { n: "Club FF", k: "Balada · Hongdae", img: P.hongdae, day: "d12",
    d: "Rock/indie, shows ao vivo e DJ, de quinta a domingo. Tripadvisor 4,4/5. Mantenha a bebida sob controle e saia se o ambiente incomodar.",
    a: "B1, 12 Wausan-ro 17-gil, Mapo-gu", p: [10000, 30000], dress: "Casual arrumado, tênis, sem chinelo", q: "클럽FF 홍대", t: [T.ff, T.ff2] },
  { n: "Cakeshop Seoul", k: "Balada · Itaewon", img: P.itaewon2, day: "d17",
    d: "Eletrônica/underground para ~200 pessoas, com DJs de UK bass, garage, disco, hip-hop e R&B. Quinta a sábado, a partir das 22h. Google ≈ 3,9/5.",
    a: "B1, 134 Itaewon-ro, Yongsan-gu", p: [20000, 30000], dress: "Roupa noturna arrumada, calçado fechado", q: "케이크샵 이태원", t: [T.cake] },
  { n: "Awesome Coin Noraebang", k: "Karaokê solo · Hongdae", img: P.hongdae1, day: "d10",
    d: "Coin noraebang com cabine fechada e individual, sem dividir sala ou microfone. Confirme a cabine e o preço no local.",
    a: "4 Wausan-ro, Mapo-gu (Hongik Univ. Station)", p: [500, 1000], dress: "Qualquer roupa", q: "어썸코인노래방 홍대본점", t: [] }
];
$("#nightList").innerHTML = NIGHT.map(n => `
  <article class="card has-img pre" style="grid-template-columns:1fr">
    <div class="ph" data-n="${esc(n.n)}" style="min-height:190px">${imgTag(n.img, n.n)}</div>
    <div class="body"><div class="when">${esc(n.k)} · dia ${DAYS.findIndex(d => d.id === n.day) + 1}</div>
      <h3 style="font-family:var(--f-title);color:var(--raspberry)">${esc(n.n)}</h3><p>${esc(n.d)}</p>
      <p class="addr">${I.pin}<span>${esc(n.a)}</span></p>
      <div class="meta"><span class="tag money">${I.coin}${money(n.p)}</span><span class="tag">${esc(n.dress)}</span></div>
      <div class="actions"><a class="btn kakao" href="${kakao(n.q)}" target="_blank" rel="noopener">${I.pin}KakaoMap</a>
      ${n.t.map(t => `<a class="btn ticket" href="${t.url}" target="_blank" rel="noopener">${I.tk}${esc(t.label)}</a>`).join("")}</div>
    </div></article>`).join("");

/* ---------- Mascotes decorativos ---------- */
const mascotSections = ["antes", "passeios", "regioes", "lotte", "kpop", "noite", "dinheiro", "seguranca", "ferramentas", "sugestoes"];
mascotSections.forEach((id, i) => {
  const head = document.querySelector("#" + id + " .sec-head");
  if (!head) return;
  const mascotNumber = (i % 4) + 1;
  const img = document.createElement("img");
  img.className = "section-mascot mascot-" + mascotNumber;
  img.src = "fotos/mascote-" + mascotNumber + ".png";
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.loading = "lazy";
  head.appendChild(img);
});

/* ---------- Frases ---------- */
const PHRASES = [
  ["Quanto custa?", "얼마예요?"], ["Obrigada!", "감사합니다"], ["Onde fica o banheiro?", "화장실 어디예요?"],
  ["Estou sozinha, uma pessoa.", "한 명이에요"], ["Posso pagar com cartão?", "카드 돼요?"],
  ["Tem esta versão do álbum?", "이 앨범 버전 있어요?"], ["Para este endereço, por favor.", "이 주소로 가 주세요"]
];
$("#phrases").innerHTML = PHRASES.map(([pt, ko]) => `
  <span style="display:inline-flex;gap:4px">
    <a class="btn" href="https://papago.naver.com/?sk=pt&tk=ko&st=${encodeURIComponent(pt)}" target="_blank" rel="noopener" title="Abrir no Papago"><b>${esc(pt)}</b>&nbsp;<span style="color:var(--raspberry)">${ko}</span></a>
    <a class="btn" href="https://translate.google.com/?sl=pt&tl=ko&text=${encodeURIComponent(pt)}&op=translate" target="_blank" rel="noopener" title="Abrir no Google Tradutor" aria-label="Google Tradutor: ${esc(pt)}">G</a>
  </span>`).join("");

/* ---------- Sugestões ---------- */
const sugWhere = $("#sugWhere"), sugWhat = $("#sugWhat"), sugPrev = $("#sugPreview");
const PLACES = ["Guro Station", "Gyeongbokgung", "Insadong", "Myeongdong", "Hongdae", "Seongsu", "Yeouido", "Jamsil", "Itaewon", "Yongsan", "Cheongdam", "Yeongdeungpo"];
$("#sugChips").innerHTML = PLACES.map(p => `<button type="button" data-p="${p}">${p}</button>`).join("");
const sugQuery = () => `${sugWhat.value} perto de ${sugWhere.value.trim() || "Seul"} Seul`;
function updPrev() {
  sugPrev.textContent = sugQuery();
  [...$("#sugChips").children].forEach(b => b.classList.toggle("on", b.dataset.p === sugWhere.value.trim()));
}
function setSug(p) { sugWhere.value = p; updPrev(); }
$("#sugChips").addEventListener("click", e => { const b = e.target.closest("button"); if (b) setSug(b.dataset.p); });
sugWhere.addEventListener("input", updPrev); sugWhat.addEventListener("change", updPrev);
$("#sugForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!sugWhere.value.trim()) { toast("Ops, Luiza, me conta onde você está primeiro."); sugWhere.focus(); return; }
  const a = document.createElement("a"); a.href = gsearch(sugQuery()); a.target = "_blank"; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  toast("Abri a busca no Google pra você.");
});
updPrev();

/* ---------- Conversor ---------- */
const krw = $("#krw"), brl = $("#brl");
krw.addEventListener("input", () => { brl.value = krw.value ? (krw.value * RATE).toFixed(2) : ""; });
brl.addEventListener("input", () => { krw.value = brl.value ? Math.round(brl.value / RATE) : ""; });

/* ---------- Hero, letreiro, contagem ---------- */
$("#hc1").src = P.gyeong; $("#hc2").src = P.bukchon; $("#hc3").src = P.hangang;
document.querySelectorAll(".collage img").forEach(i => { i.referrerPolicy = "no-referrer"; i.onerror = () => { i.style.visibility = "hidden"; }; });
const words = ["안녕하세요 · olá", "감사합니다 · obrigada", "서울 · Seul", "한강 · Rio Han", "경복궁 · Gyeongbokgung", "홍대 · Hongdae", "명동 · Myeongdong", "포토카드 · photocard"];
$("#marq").innerHTML = (words.map(w => `<span>${w}</span>`).join("")).repeat(2);
const TRIP = new Date("2027-09-04T16:00:00+09:00");
function tick() {
  let ms = TRIP - new Date();
  if (ms <= 0) { $("#countdown").innerHTML = `<div style="min-width:auto"><b>Chegou!</b><span>aproveita, Luiza</span></div>`; return; }
  const d = Math.floor(ms / 864e5); ms -= d * 864e5;
  const h = Math.floor(ms / 36e5); ms -= h * 36e5;
  $("#cd-d").textContent = d; $("#cd-h").textContent = h; $("#cd-m").textContent = Math.floor(ms / 6e4);
}
tick(); setInterval(tick, 30000);

/* ---------- Animações ---------- */
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("show"); e.target.classList.remove("pre"); io.unobserve(e.target); }
}), { threshold: .12, rootMargin: "0px 0px -40px 0px" }) : null;
function observe(list) {
  list.forEach((el, i) => {
    if (!io) { el.classList.remove("pre"); return; }
    el.style.transitionDelay = Math.min(i % 6, 5) * 60 + "ms";
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight) { requestAnimationFrame(() => { el.classList.add("show"); el.classList.remove("pre"); }); }
    else io.observe(el);
  });
}
document.querySelectorAll(".reveal").forEach(el => el.classList.add("pre"));
observe(document.querySelectorAll(".pre"));

const prog = $("#progress"), totop = $("#totop");
function onScroll() {
  const h = document.documentElement;
  prog.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`;
  totop.classList.toggle("on", h.scrollTop > 900);
  const tl = $("#tl");
  if (tl) {
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    tl.style.setProperty("--tl", p.toFixed(3));
  }
}
addEventListener("scroll", onScroll, { passive: true });
totop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

let tt;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2600); }

/* ---------- Início ---------- */
function fromHash() {
  const id = location.hash.slice(1);
  if (DAYS.some(d => d.id === id)) { showDay(id, false); setTimeout(() => $("#dias").scrollIntoView(), 50); return true; }
  return false;
}
if (!fromHash()) showDay("d04", false);
addEventListener("hashchange", fromHash);
