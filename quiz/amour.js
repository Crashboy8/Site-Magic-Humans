/* Quiz Amour v1.4 · 10 questions, classement, résultats.
   Démarre uniquement si quiz/index.html a posé MH_THEME = "amour".
   Aucune réponse n'est envoyée. La progression reste dans ce navigateur
   pour pouvoir reprendre. La réponse de sécurité n'est pas stockée. */
(function () {
  const D = window.AMOUR_DATA;
  const E = window.AmourEngine;
  if (!D || !E || !document.getElementById("screen-amour")) return;

  const U = D.ui;
  const Q = U.quiz;
  const R = U.results;
  const root = document.getElementById("screen-amour");

  const style = document.createElement("style");
  style.textContent = [
    "#screen-amour .hero em{color:var(--accent)}",
    "#screen-amour .am-stage{padding-bottom:12px}",
    "#screen-amour .am-in{animation:am-in .32s ease}",
    "@keyframes am-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
    "#screen-amour .am-group{scroll-margin-top:16px;display:flex;flex-direction:column;gap:10px}",
    "#screen-amour .am-body{padding-bottom:12px}",
    "#screen-amour ol.items{list-style:none;margin:0;padding:0}",
    "#screen-amour label.rsrc-opt,#screen-amour button.rsrc-opt{transition:border-color .15s,background .15s}",
    "#screen-amour{--sage:#146B3A;--sage-soft:#E5F6EB;--sage-track:#7ECFA3;--coral:#C2412D;--coral-soft:#FDE8E3;--coral-track:#F0A898;--pink:#B4235A;--pink-soft:#FDE7F0;--pink-track:#F0A0C4;--gold:#8A5A00;--gold-soft:#FFF3CC;--gold-track:#F0D078;--sky:#17679E;--sky-soft:#E6F4FC;--sky-track:#9ED0F2;--am:var(--pink);--am-soft:var(--pink-soft)}",
    "#screen-amour[data-tone=sage]{--am:var(--sage);--am-soft:var(--sage-soft)}",
    "#screen-amour[data-tone=coral]{--am:var(--coral);--am-soft:var(--coral-soft)}",
    "#screen-amour[data-tone=pink]{--am:var(--pink);--am-soft:var(--pink-soft)}",
    "#screen-amour[data-tone=gold]{--am:var(--gold);--am-soft:var(--gold-soft)}",
    "#screen-amour[data-tone=sky]{--am:var(--sky);--am-soft:var(--sky-soft)}",
    "#screen-amour .am-group[data-tone=sage],#screen-amour section[data-tone=sage]{--am:var(--sage);--am-soft:var(--sage-soft)}",
    "#screen-amour .am-group[data-tone=coral],#screen-amour section[data-tone=coral]{--am:var(--coral);--am-soft:var(--coral-soft)}",
    "#screen-amour .am-group[data-tone=gold],#screen-amour section[data-tone=gold]{--am:var(--gold);--am-soft:var(--gold-soft)}",
    "#screen-amour .am-group[data-tone=pink],#screen-amour section[data-tone=pink]{--am:var(--pink);--am-soft:var(--pink-soft)}",
    "#screen-amour .am-group[data-tone=sky],#screen-amour section[data-tone=sky]{--am:var(--sky);--am-soft:var(--sky-soft)}",
    "#screen-amour .eyebrow{display:flex;align-items:center;gap:8px;color:var(--am)}",
    "#screen-amour .legend b{color:var(--am)}",
    "#screen-amour .legend [data-ico-tone=sage] b,#screen-amour .am-ico[data-ico-tone=sage],#screen-amour .rule[data-tone=sage] .k{color:var(--sage)}",
    "#screen-amour .legend [data-ico-tone=coral] b,#screen-amour .am-ico[data-ico-tone=coral],#screen-amour .rule[data-tone=coral] .k{color:var(--coral)}",
    "#screen-amour .legend [data-ico-tone=pink] b,#screen-amour .am-ico[data-ico-tone=pink],#screen-amour .rule[data-tone=pink] .k{color:var(--pink)}",
    "#screen-amour .legend [data-ico-tone=gold] b,#screen-amour .am-ico[data-ico-tone=gold],#screen-amour .rule[data-tone=gold] .k{color:var(--gold)}",
    "#screen-amour .legend [data-ico-tone=sky] b,#screen-amour .am-ico[data-ico-tone=sky],#screen-amour .rule[data-tone=sky] .k{color:var(--sky)}",
    "#screen-amour .am-ico{display:inline-flex;flex:none;line-height:0;color:var(--am)}",
    "#screen-amour .am-ico svg{width:20px;height:20px;display:block}",
    "#screen-amour .rsrc-opt{border-width:2px}",
    "#screen-amour .rsrc-opt.picked,#screen-amour .am-rank-item{background:var(--am-soft);border-color:var(--am)}",
    "#screen-amour .rsrc-opt[data-item-tone=sage].picked,#screen-amour .am-rank-item[data-item-tone=sage]{background:var(--sage-soft);border-color:var(--sage)}",
    "#screen-amour .rsrc-opt[data-item-tone=coral].picked,#screen-amour .am-rank-item[data-item-tone=coral]{background:var(--coral-soft);border-color:var(--coral)}",
    "#screen-amour .rsrc-opt[data-item-tone=pink].picked,#screen-amour .am-rank-item[data-item-tone=pink]{background:var(--pink-soft);border-color:var(--pink)}",
    "#screen-amour .rsrc-opt[data-item-tone=gold].picked,#screen-amour .am-rank-item[data-item-tone=gold]{background:var(--gold-soft);border-color:var(--gold)}",
    "#screen-amour .rsrc-opt[data-item-tone=sky].picked,#screen-amour .am-rank-item[data-item-tone=sky]{background:var(--sky-soft);border-color:var(--sky)}",
    "#screen-amour .rsrc-opt[data-item-tone=sage] .am-ico{color:var(--sage)}",
    "#screen-amour .rsrc-opt[data-item-tone=coral] .am-ico{color:var(--coral)}",
    "#screen-amour .rsrc-opt[data-item-tone=pink] .am-ico{color:var(--pink)}",
    "#screen-amour .rsrc-opt[data-item-tone=gold] .am-ico{color:var(--gold)}",
    "#screen-amour .rsrc-opt[data-item-tone=sky] .am-ico{color:var(--sky)}",
    "#screen-amour .rsrc-opt.has-ico{display:grid;grid-template-columns:28px 1fr;column-gap:10px;row-gap:2px;align-items:center}",
    "#screen-amour .rsrc-opt.has-ico .am-ico{grid-row:1 / span 2}",
    "#screen-amour .rsrc-opt.has-ico strong,#screen-amour .rsrc-opt.has-ico .muted{grid-column:2}",
    "#screen-amour label.rsrc-opt:hover,#screen-amour button.rsrc-opt:hover{border-color:var(--am)}",
    "#screen-amour .progress{gap:5px}",
    "#screen-amour .progress span{height:8px;border-radius:8px}",
    "#screen-amour .progress span[data-tone=sage]{background:var(--sage-track)}",
    "#screen-amour .progress span[data-tone=coral]{background:var(--coral-track)}",
    "#screen-amour .progress span[data-tone=pink]{background:var(--pink-track)}",
    "#screen-amour .progress span[data-tone=gold]{background:var(--gold-track)}",
    "#screen-amour .progress span[data-tone=sky]{background:var(--sky-track)}",
    "#screen-amour .progress span[data-tone=split]{background:linear-gradient(90deg,var(--sage-track),var(--coral-track))}",
    "#screen-amour .progress span.done[data-tone=sage],#screen-amour .progress span.is-now[data-tone=sage]{background:var(--sage)}",
    "#screen-amour .progress span.done[data-tone=coral],#screen-amour .progress span.is-now[data-tone=coral]{background:var(--coral)}",
    "#screen-amour .progress span.done[data-tone=pink],#screen-amour .progress span.is-now[data-tone=pink]{background:var(--pink)}",
    "#screen-amour .progress span.done[data-tone=gold],#screen-amour .progress span.is-now[data-tone=gold]{background:var(--gold)}",
    "#screen-amour .progress span.done[data-tone=sky],#screen-amour .progress span.is-now[data-tone=sky]{background:var(--sky)}",
    "#screen-amour .progress span.done[data-tone=split],#screen-amour .progress span.is-now[data-tone=split]{background:linear-gradient(90deg,var(--sage),var(--coral))}",
    "#screen-amour .progress span.is-now{height:9px}",
    "#screen-amour .progress span.is-partial{position:relative;overflow:hidden}",
    "#screen-amour .progress span.is-partial i{display:block;height:100%;border-radius:8px}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=sage]{background:var(--sage-track)}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=sage] i{background:var(--sage)}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=coral]{background:var(--coral-track)}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=coral] i{background:var(--coral)}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=pink]{background:var(--pink-track)}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=pink] i{background:var(--pink)}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=gold]{background:var(--gold-track)}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=gold] i{background:var(--gold)}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=sky]{background:var(--sky-track)}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=sky] i{background:var(--sky)}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=split]{background:linear-gradient(90deg,var(--sage-track),var(--coral-track))}",
    "#screen-amour .progress span.is-now.is-partial[data-tone=split] i{background:linear-gradient(90deg,var(--sage),var(--coral))}",
    "#screen-amour .am-resume{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}",
    "#screen-amour .am-resume p{margin:0;font-weight:700}",
    "#screen-amour .am-cta{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:18px 16px}",
    "#screen-amour .am-cta .btn{align-self:flex-start}",
    "#screen-amour .am-sticky{display:none}",
    "@media(max-width:720px){#screen-amour.has-sticky{padding-bottom:88px}#screen-amour .am-sticky{display:flex;position:fixed;left:12px;right:12px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:35;align-items:center;gap:8px;padding:8px 8px 8px 14px;background:var(--surface);border:1px solid var(--line);border-radius:999px;box-shadow:0 8px 28px rgba(0,0,0,.16)}#screen-amour .am-sticky .btn{flex:1;justify-content:center}#screen-amour .am-sticky .btn.ghost{flex:0 0 auto}}",
    "#screen-amour .snum{color:var(--am)}",
    "#screen-amour .legend{position:relative}",
    "#screen-amour .am-pop{position:absolute;right:4px;top:-4px;color:var(--am);pointer-events:none;animation:am-heart .9s ease forwards}",
    "@keyframes am-heart{0%{opacity:0;transform:translateY(6px) scale(.4)}35%{opacity:1;transform:translateY(-4px) scale(1.15)}100%{opacity:0;transform:translateY(-22px) scale(1)}}",
    "#screen-amour .am-sentence{display:flex;gap:10px;align-items:flex-start}",
    "#screen-amour .am-sentence .am-ico{margin-top:.15em}",
    "#screen-amour .rule strong{display:flex;align-items:flex-start;gap:8px}",
    "#screen-amour .rule[data-tone=sage]{background:var(--sage-soft);border-color:var(--sage)}",
    "#screen-amour .rule[data-tone=coral]{background:var(--coral-soft);border-color:var(--coral)}",
    "#screen-amour .rule[data-tone=pink]{background:var(--pink-soft);border-color:var(--pink)}",
    "#screen-amour .rule[data-tone=gold]{background:var(--gold-soft);border-color:var(--gold)}",
    "#screen-amour .rule[data-tone=sky]{background:var(--sky-soft);border-color:var(--sky)}",
    "#screen-amour .rhead{background:linear-gradient(120deg,var(--dom-tint,var(--pink-soft)),var(--sec-tint,var(--sage-soft)));border-radius:var(--radius);padding:26px 20px 22px;margin-top:10px}",
    "#screen-amour .alloy{font-size:clamp(2.4rem,8vw,3.8rem);line-height:1.02}",
    "#screen-amour .alloy em{font-style:normal;color:var(--sc,var(--accent));font-weight:500}",
    "#screen-amour .am-pills{display:flex;flex-wrap:wrap;gap:8px}",
    "#screen-amour .pr-domsec{margin:0 0 12px}",
    "#screen-amour .am-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;border-radius:999px;background:var(--bt);color:var(--bc);font-weight:700;margin:0 8px 8px 0}",
    "#screen-amour .am-pill small{display:block;font-weight:700;text-transform:uppercase;font-size:.68rem;letter-spacing:.08em;opacity:.85}",
    "#screen-amour .pr-bars{display:grid;gap:8px}",
    "#screen-amour .pr-bar{display:grid;grid-template-columns:minmax(0,118px) 1fr auto;align-items:center;gap:8px;font-size:.9rem}",
    "#screen-amour .pr-bar-n{display:flex;align-items:center;gap:6px;color:var(--bc);font-weight:700;min-width:0}",
    "#screen-amour .pr-bar-n span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#screen-amour .pr-track{height:10px;border-radius:99px;background:var(--line);overflow:hidden}",
    "#screen-amour .pr-track i{display:block;height:100%;background:var(--bf);border-radius:99px}",
    "#screen-amour .pr-score{color:var(--bc);font-weight:700;font-variant-numeric:tabular-nums}",
    "#screen-amour .pr-sec .snum{color:var(--bc)}",
    "#screen-amour .pr-rows{display:grid;gap:8px}",
    "#screen-amour .pr-rows div{display:grid;grid-template-columns:108px 1fr;gap:8px}",
    "#screen-amour .pr-rows b{color:var(--bc)}",
    "#screen-amour .pr-say li{font-family:var(--display);font-size:1.12rem;line-height:1.35;margin:6px 0}",
    "#screen-amour .pr-exit{display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:start;margin:8px 0}",
    "#screen-amour .pr-exit .k{width:28px;height:28px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:700}",
    "@media(min-width:720px){#screen-amour .pr-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}}",
    "@media (prefers-color-scheme: dark){:root:not([data-theme=light]) #screen-amour .alloy em{color:var(--sc-dark,var(--sc))} :root:not([data-theme=light]) #screen-amour .rhead{background:linear-gradient(120deg,color-mix(in srgb,var(--dom-color,#F3A3C0) 24%,var(--surface)),color-mix(in srgb,var(--sec-color,#8ED4AE) 24%,var(--surface)))} :root:not([data-theme=light]) #screen-amour [style*=\"--bcd\"]{--bc:var(--bcd);--bt:color-mix(in srgb,var(--bf) 22%,var(--surface))}}",
    ":root[data-theme=dark] #screen-amour .alloy em{color:var(--sc-dark,var(--sc))}",
    ":root[data-theme=dark] #screen-amour .rhead{background:linear-gradient(120deg,color-mix(in srgb,var(--dom-color,#F3A3C0) 24%,var(--surface)),color-mix(in srgb,var(--sec-color,#8ED4AE) 24%,var(--surface)))}",
    ":root[data-theme=dark] #screen-amour [style*='--bcd']{--bc:var(--bcd);--bt:color-mix(in srgb,var(--bf) 22%,var(--surface))}",
    "@media (prefers-color-scheme: dark){:root:not([data-theme=light]) #screen-amour{--sage:#8ED4AE;--sage-soft:#1A3326;--sage-track:#2F6B48;--coral:#F0A090;--coral-soft:#3A221C;--coral-track:#7A4034;--pink:#F3A3C0;--pink-soft:#3A2030;--pink-track:#7A3854;--gold:#F0D078;--gold-soft:#3A3018;--gold-track:#7A5C20;--sky:#8ECAF0;--sky-soft:#1A2C3A;--sky-track:#2E6288}}",
    ":root[data-theme=dark] #screen-amour{--sage:#8ED4AE;--sage-soft:#1A3326;--sage-track:#2F6B48;--coral:#F0A090;--coral-soft:#3A221C;--coral-track:#7A4034;--pink:#F3A3C0;--pink-soft:#3A2030;--pink-track:#7A3854;--gold:#F0D078;--gold-soft:#3A3018;--gold-track:#7A5C20;--sky:#8ECAF0;--sky-soft:#1A2C3A;--sky-track:#2E6288}",
    "#screen-amour .rsrc-opt strong,#screen-amour .rsrc-opt .muted{display:block}",
    "#screen-amour label.rsrc-opt:focus-within{outline:2px solid var(--accent);outline-offset:3px}",
    "#screen-amour .am-rank-item.is-dragging{position:relative;z-index:3;box-shadow:0 8px 24px rgba(0,0,0,.12)}",
    "#screen-amour .am-handle{touch-action:none}",
    "#screen-amour .choice:disabled{opacity:.35;cursor:not-allowed}",
    "#screen-amour .am-divider{text-align:center;padding:4px 0}",
    "#screen-amour button.chip{font:inherit;cursor:pointer;color:var(--ink)}",
    "#screen-amour button.chip[aria-pressed=true]{border-color:var(--accent);background:var(--accent-soft)}",
    "#screen-amour .am-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}",
    "#screen-amour .qnav{position:fixed;left:0;right:0;bottom:0;z-index:30;background:var(--bg);border-top:1px solid var(--line);flex-wrap:nowrap;justify-content:stretch;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px))}",
    "#screen-amour .am-nav-inner{max-width:700px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:8px}",
    "#screen-amour .am-nav-row{flex-wrap:nowrap;width:100%}",
    "#screen-amour .am-nav-row .btn{flex:1 1 0;justify-content:center;white-space:nowrap}",
    "#screen-amour .am-nav-row .btn:disabled{opacity:1;background:var(--bg);color:var(--muted);border:1px solid var(--line)}",
    "#screen-amour .rule .quote{color:var(--ink);font-size:1.15rem}",
    "#screen-amour .rule .btn{align-self:flex-start;margin-top:4px}",
    "@media(max-width:420px){#screen-amour .am-nav-row .btn{padding:12px 10px;font-size:.92rem}}",
    "@media(prefers-reduced-motion:reduce){#screen-amour .am-in,#screen-amour .am-rank-item{animation:none!important;transition:none!important}#screen-amour .am-pop{display:none}}",
    "@media print{",
    "@page{size:A4;margin:9mm}",
    "html,body{background:#fff!important;color:#1B1816!important;font-size:8.6pt!important;line-height:1.3!important}",
    ".topbar,footer,.wrap>div:last-child,.mh-cookie-banner,.am-screen-only,#screen-amour .qnav,#screen-amour .btn,#screen-amour .row-actions,#screen-amour .am-sticky,#screen-amour .am-resume{display:none!important}",
    ".wrap{max-width:none!important;padding:0!important}",
    "#screen-amour{zoom:.86}",
    "#screen-amour .alloy{font-size:26pt!important;line-height:1.02!important;margin:0 0 2px}",
    "#screen-amour .rhead{padding:8px 10px!important;gap:4px!important;margin:0!important}",
    "#screen-amour .rs{padding-top:4px;gap:4px;break-inside:auto}",
    "#screen-amour .rs p,#screen-amour .rs h3{margin:2px 0}",
    "#screen-amour .rs h3{font-size:10.5pt}",
    "#screen-amour ul.clean{gap:2px}",
    "#screen-amour ul.clean li{margin:1px 0}",
    "#screen-amour .panel{break-inside:auto;padding:6px 8px;margin:4px 0;gap:3px}",
    "#screen-amour .rule{break-inside:avoid;padding:4px 8px;margin:2px 0;gap:2px 8px}",
    "#screen-amour #sec-now .rule p{display:none!important}",
    "#screen-amour .quote{font-size:11.5pt}",
    "#screen-amour .pr-hide,#screen-amour .toc,#screen-amour .pr-bars,#screen-amour details{display:none!important}",
    "#screen-amour .pr-cols,#screen-amour .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
    "#screen-amour .fond li:nth-child(n+3){display:none}",
    "#screen-amour .am-pill{padding:3px 10px 3px 6px}",
    "#screen-amour .pr-say li{font-size:9.5pt}",
    "#screen-amour .pr-exit .k{color:#fff}",
    "#screen-amour .rs h2{font-size:13.5pt;margin:0 0 4px}",
    "*{print-color-adjust:exact;-webkit-print-color-adjust:exact}",
    "}"
  ].join("");
  document.head.appendChild(style);

  document.querySelectorAll("main[id^='screen-']").forEach(function (el) {
    el.hidden = el.id !== "screen-amour";
  });
  root.hidden = false;
  const langSwitch = document.querySelector(".qlang");
  if (langSwitch) langSwitch.hidden = true;
  const brand = document.querySelector(".brand span");
  if (brand) brand.textContent = U.brand;
  const footer = document.querySelector("footer");
  if (footer) footer.textContent = U.footer;
  document.title = U.pageTitle + " | Magic Humans";
  document.documentElement.lang = "fr";

  let prenom = "";
  let qi = 0;
  let phase = "ask";
  let groupStep = 0;
  let answers = {};
  let lastPrefix = "";
  let held = null;
  let focusSel = "";
  let pendingLive = "";
  let armed = true;
  let view = "intro";
  let resultProfile = null;
  let resumeNote = false;
  let stickyOff = false;
  let composing = false;
  let runId = 1;
  let stack = [{ view: "intro", qi: 0, phase: "ask", groupStep: 0 }];
  let historyReady = false;

  function track(name, params) {
    try {
      if (typeof window.mhTrack === "function") window.mhTrack(name, params || {});
    } catch (e) { /* mesure indisponible */ }
  }
  function browserStore() {
    try { return window.localStorage; } catch (e) { return null; }
  }
  function currentSnap() {
    return { view: view, qi: qi, phase: phase, groupStep: groupStep };
  }
  function saveProgress() {
    E.writeProgress(browserStore(), {
      prenom: prenom,
      qi: qi,
      phase: phase,
      groupStep: groupStep,
      view: view,
      answers: answers,
      lastPrefix: lastPrefix,
      profile: resultProfile,
      stack: stack,
    });
  }
  function pushHist() {
    stack.push(currentSnap());
    try { history.pushState({ amour: 1, runId: runId, i: stack.length - 1 }, ""); } catch (e) { /* historique indisponible */ }
    saveProgress();
  }
  function resumeHtml() {
    if (!resumeNote) return "";
    return '<div class="am-resume" role="status"><p>' + esc(Q.resumeNotice) + '</p><button type="button" class="btn ghost small" data-act="restart">' + esc(Q.resumeRestart) + "</button></div>";
  }

  const PATHS = {
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 14"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    gem: '<path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3 1.5 1 3 2.5 3 4.5a2.5 2.5 0 0 0 5 0c0-4-3-7-3-10 4 2 6 6 6 10a6 6 0 0 1-12 0c0-1 .5-2.5 1.5-4"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    battery: '<rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    anchor: '<circle cx="12" cy="5" r="3"/><line x1="12" x2="12" y1="22" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    userx: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    spark: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="12" y1="14" y2="10"/><circle cx="12" cy="14" r="8"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    snow: '<line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    pulse: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>',
    swords: '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/>',
    tree: '<path d="M12 22v-6"/><path d="M7 22h10"/><path d="m12 2 5 8h-3l3 6H7l3-6H7z"/>'
  };
  const SCREEN_TONE = { ressource: "gold", langages: "pink", ennea: "gold", valeurs: "sky", instinct: "pink", stress: "coral", freins: "sky", demain: "sage", etape: "pink" };
  const SCREEN_ICON = { nourrit: "leaf", ressource: "sun", langages: "message", ennea: "compass", valeurs: "gem", instinct: "flame", stress: "zap", freins: "anchor", demain: "flag", etape: "pen" };
  const GROUP_TONE = { nourrit: "sage", vide: "coral", modere: "gold", fort: "coral" };
  const ITEM_TONE = { sp: "sage", so: "sky", sx: "pink" };
  const CARD_ICON = {
    ressource: { seul: "user", raconter: "message", bouger: "pulse", mains: "hand", evader: "moon", monde: "pin", tendresse: "heart", douceur: "coffee", rien: "moon", moi: "user", nature: "tree", sport: "pulse", adeux: "users", proches: "users", sortir: "pin", decouvrir: "compass", projet: "pen" },
    langages: { paroles: "message", moments: "clock", cadeaux: "gift", services: "hand", toucher: "heart" },
    instinct: { sp: "home", so: "users", sx: "flame" },
    stress: { D: "arrow", I: "smile", S: "shield", C: "search", fight: "swords", flight: "arrow", freeze: "snow", fawn: "heart" },
    freins: { rejet: "userx", blesser: "heart", moment: "clock", espoir: "spark", habitude: "repeat", seul: "user", flou: "help", regard: "eye", contraintes: "box", energie: "battery", parfait: "star", passe: "history" },
    demain: { a5: "timer", voix: "mic", rappel: "bell" }
  };

  function ico(name, tone) {
    if (!PATHS[name]) return "";
    return '<span class="am-ico"' + (tone ? ' data-ico-tone="' + tone + '"' : "") + ' aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + PATHS[name] + "</svg></span>";
  }
  function cardIcon(screenId, itemId) {
    const bag = CARD_ICON[screenId];
    return bag ? bag[itemId] || "" : "";
  }
  function currentTone(s) {
    if (!s) return "pink";
    if (s.id === "nourrit" && phase !== "rank") {
      const g = activeGroups(s)[0];
      if (g && GROUP_TONE[g.id]) return GROUP_TONE[g.id];
    }
    if (s.id === "nourrit") return "sage";
    return SCREEN_TONE[s.id] || "pink";
  }
  function barTone(sc) {
    if (sc.id === "nourrit") return "split";
    return SCREEN_TONE[sc.id] || "pink";
  }
  function subProgress(s) {
    const split = !!(s.splitGroups && s.groups && s.groups.length > 1);
    const rankStep = !!(s.rank && s.rank.mode === "step");
    const base = split ? s.groups.length : 1;
    const parts = base + (rankStep ? 1 : 0);
    let index = 0;
    if (rankStep && phase === "rank") index = parts - 1;
    else if (split) index = Math.max(0, Math.min(groupStep, base - 1));
    return { parts: parts, index: index };
  }
  function questionIcon(s) {
    if (s.id === "nourrit" && phase !== "rank") {
      const g = activeGroups(s)[0];
      if (g && g.id === "vide") return "cloud";
    }
    return SCREEN_ICON[s.id] || "heart";
  }

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fill(tpl, vars) { return E.fill(tpl, vars); }
  function cleanName(n) { return String(n || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 40); }
  function scrollTop() { try { window.scrollTo(0, 0); } catch (e) { /* ancien navigateur */ } }
  function screenAt(i) { return D.screens[i]; }
  function gidOf(g) { return g.id; }

  function ensure(s) {
    if (!answers[s.id]) {
      if (s.type === "pick") {
        const bag = { picked: {}, other: {}, order: {} };
        s.groups.forEach(function (g) {
          bag.picked[g.id] = [];
          bag.other[g.id] = g.other ? [""] : [];
          bag.order[g.id] = [];
        });
        answers[s.id] = bag;
      } else if (s.type === "rank") answers[s.id] = { order: [] };
      else answers[s.id] = { engagement: "", who: "", moment: null, safety: null };
    }
    return answers[s.id];
  }

  function textsOf(bag, g) {
    const max = g.other ? g.other.max || 1 : 0;
    const list = bag.other && bag.other[g.id] ? bag.other[g.id] : [];
    const out = [];
    for (let i = 0; i < Math.max(max, list.length); i++) out.push(String(list[i] || "").replace(/[<>]/g, "").slice(0, g.other ? g.other.maxLength : 60));
    return out.slice(0, max || out.length);
  }

  function chosenIds(s, g) {
    const bag = ensure(s);
    const picked = (bag.picked[g.id] || []).filter(function (id) { return g.items.some(function (it) { return it.id === id; }); });
    if (g.other) {
      textsOf(bag, g).forEach(function (text, i) { if (text.trim()) picked.push("autre:" + i); });
    }
    return picked;
  }

  function resync(s) {
    const bag = ensure(s);
    s.rank.groups.forEach(function (gid) {
      const g = s.groups.find(function (x) { return x.id === gid; });
      const ch = chosenIds(s, g);
      const prev = bag.order[gid] || [];
      const keep = prev.filter(function (id) { return ch.indexOf(id) !== -1; });
      ch.forEach(function (id) { if (keep.indexOf(id) === -1) keep.push(id); });
      bag.order[gid] = keep;
    });
  }

  function activeGroups(s) {
    if (!s.groups) return [];
    if (s.splitGroups && phase !== "rank") {
      const i = Math.max(0, Math.min(groupStep, s.groups.length - 1));
      return [s.groups[i]];
    }
    return s.groups;
  }

  function deficit(s) {
    if (s.type === "pick" && !(s.rank && s.rank.mode === "step" && phase === "rank")) {
      return activeGroups(s).reduce(function (sum, g) { return sum + Math.max(0, g.min - chosenIds(s, g).length); }, 0);
    }
    if (s.type === "rank" || (s.rank && phase === "rank")) {
      if (s.type === "rank") return Math.max(0, s.minRanked - ensure(s).order.length);
      return 0;
    }
    if (s.type === "commit") return ensure(s).moment ? 0 : 1;
    return 0;
  }

  function moreCue(s) {
    if (s.type !== "pick" || phase === "rank" || !s.groups) return null;
    if (s.splitGroups) {
      const g = activeGroups(s)[0];
      if (!g) return null;
      const k = Math.max(0, g.min - chosenIds(s, g).length);
      return k > 0 ? { k: k, down: false } : null;
    }
    const defs = s.groups.map(function (g) {
      return { g: g, k: Math.max(0, g.min - chosenIds(s, g).length) };
    });
    const firstOpen = defs.findIndex(function (d) { return d.k > 0; });
    if (firstOpen < 0) return null;
    if (firstOpen > 0) {
      const open = defs[firstOpen];
      return { k: open.k, down: true, label: open.g.counter || open.g.title, id: open.g.id };
    }
    const total = defs.reduce(function (sum, d) { return sum + d.k; }, 0);
    return { k: total, down: false };
  }

  function moreHtml(s) {
    const cue = moreCue(s);
    if (!cue) return "";
    if (cue.down) {
      return '<button type="button" class="link hint am-more" data-act="scroll-group" data-group="' + esc(cue.id) + '">' + esc(fill(Q.moreDown, { k: cue.k, label: cue.label })) + "</button>";
    }
    return '<p class="hint am-more">' + esc(fill(Q.more, { k: cue.k })) + "</p>";
  }

  function counterText(label, x, min, ok) {
    const base = label ? fill(Q.counter, { label: label, x: x, min: min }) : fill(Q.counterBare, { x: x, min: min });
    return base + (ok ? " " + Q.counterOk : "");
  }

  function counterSpan(text, tone) {
    return "<span" + (tone ? ' data-ico-tone="' + tone + '"' : "") + "><b>" + esc(text) + "</b></span>";
  }

  function countersHtml(s, pop) {
    const bits = [];
    if (s.type === "pick" && phase !== "rank") {
      activeGroups(s).forEach(function (g) {
        const x = chosenIds(s, g).length;
        const ok = x >= g.min;
        const tone = GROUP_TONE[g.id] || "";
        bits.push(counterSpan(counterText(g.counter, x, g.min, ok), tone));
      });
    } else if (s.type === "rank") {
      const x = ensure(s).order.length;
      const ok = x >= s.minRanked;
      bits.push(counterSpan(fill(Q.rankCounter, { x: x, min: s.minRanked }) + (ok ? " " + Q.counterOk : ""), ""));
    } else if (s.type === "commit") {
      const bag = ensure(s);
      const wrote = String(bag.engagement || "").trim().length >= (s.engagement.minLength || 5);
      const both = wrote && !!bag.moment;
      bits.push(counterSpan(Q.engagementCounter + (both ? " " + Q.counterOk : ""), ""));
    } else if (s.rank && phase === "rank") {
      s.rank.groups.forEach(function (gid) {
        const g = s.groups.find(function (x) { return x.id === gid; });
        const x = (ensure(s).order[gid] || []).length;
        bits.push(counterSpan(counterText(g.counter, x, g.min, true), GROUP_TONE[gid] || ""));
      });
    }
    if (!bits.length) return "";
    return '<div class="legend" aria-live="polite">' + bits.join("") + (pop ? '<span class="am-pop">' + ico("heart") + "</span>" : "") + "</div>";
  }

  function live(msg) {
    const el = document.getElementById("am-live");
    if (el) el.textContent = msg;
  }

  function labelFor(s, gid, id) {
    if (String(id).indexOf("autre:") === 0) {
      const g = s.groups.find(function (x) { return x.id === gid; });
      const text = textsOf(ensure(s), g)[Number(id.split(":")[1])] || "";
      return text.trim();
    }
    const pool = s.groups ? s.groups.reduce(function (all, g) { return all.concat(g.items); }, []) : s.items;
    const item = pool.find(function (it) { return it.id === id; });
    return item ? item.label : id;
  }

  function rankItemHtml(s, gid, id, index, total, removable) {
    const label = labelFor(s, gid, id);
    const handleId = "am-handle-" + (gid || "rank") + "-" + id;
    const mark = cardIcon(s.id, id);
    const tone = ITEM_TONE[id] || "";
    return '<li class="item am-rank-item' + (removable ? " has-remove" : "") + '" data-id="' + esc(id) + '"' + (tone ? ' data-item-tone="' + tone + '"' : "") + ">" +
      '<div class="txt"><span class="snum">' + (index + 1) + "</span> " + (mark ? ico(mark, tone) : "") + " " + esc(label) + "</div>" +
      '<div class="choices">' +
      '<button type="button" class="choice am-handle" id="' + esc(handleId) + '" aria-label="' + esc("Déplacer « " + label + " »") + '" aria-describedby="am-rank-help">⠿</button>' +
      '<button type="button" class="choice am-up" data-act="up" data-group="' + esc(gid || "") + '" data-index="' + index + '" aria-label="' + esc(Q.up + " « " + label + " »") + '"' + (index === 0 ? " disabled" : "") + ">↑</button>" +
      '<button type="button" class="choice am-down" data-act="down" data-group="' + esc(gid || "") + '" data-index="' + index + '" aria-label="' + esc(Q.down + " « " + label + " »") + '"' + (index === total - 1 ? " disabled" : "") + ">↓</button>" +
      (removable ? '<button type="button" class="choice am-remove" data-act="remove" data-id="' + esc(id) + '" aria-label="' + esc(Q.remove.replace("du classement", "« " + label + " » du classement")) + '">×</button>' : "") +
      "</div></li>";
  }

  function listHtml(s, gid, ids, removable, divider) {
    let html = '<ol class="items am-rank" data-group="' + esc(gid || "") + '">';
    ids.forEach(function (id, i) {
      html += rankItemHtml(s, gid, id, i, ids.length, removable);
      if (divider && divider.group === gid && i + 1 === divider.after) {
        html += '<li class="muted am-divider" aria-hidden="true">' + esc(divider.text) + "</li>";
      }
    });
    if (divider && divider.group === gid && ids.length === divider.after) {
      /* déjà inséré après le dernier */
    }
    return html + "</ol>";
  }

  function pickHtml(s) {
    return activeGroups(s).map(function (g) {
      const bag = ensure(s);
      const picked = bag.picked[g.id] || [];
      const gTone = GROUP_TONE[g.id] || "";
      let html = '<section class="am-group" id="am-group-' + esc(g.id) + '"' + (gTone ? ' data-tone="' + gTone + '"' : "") + ">";
      if (g.title && !s.splitGroups) html += "<h3>" + esc(g.title) + "</h3>";
      if (g.help) html += '<p class="muted">' + esc(g.help) + "</p>";
      html += '<div class="items">';
      g.items.forEach(function (it) {
        const on = picked.indexOf(it.id) !== -1;
        const mark = cardIcon(s.id, it.id);
        const tone = ITEM_TONE[it.id] || "";
        html += '<label class="rsrc-opt' + (on ? " picked" : "") + (mark ? " has-ico" : "") + '"' + (tone ? ' data-item-tone="' + tone + '"' : "") + '><input class="am-sr" type="checkbox" data-act="check" data-group="' + esc(g.id) + '" data-id="' + esc(it.id) + '"' + (on ? " checked" : "") + ">" + (mark ? ico(mark, tone) : "") + "<strong>" + esc(it.label) + "</strong>" +
          (it.hint ? '<span class="muted">' + esc(it.hint) + "</span>" : "") + "</label>";
      });
      if (g.other) {
        const shown = Math.max(1, (bag.other[g.id] || []).length);
        const max = g.other.max || 1;
        for (let i = 0; i < Math.min(shown, max); i++) {
          const val = (bag.other[g.id] || [])[i] || "";
          const on = val.trim().length > 0;
          html += '<div class="rsrc-opt' + (on ? " picked" : "") + '"><strong>' + esc(g.other.label) + '</strong><div class="field"><input id="am-other-' + esc(g.id) + "-" + i + '" data-act="other" data-group="' + esc(g.id) + '" data-index="' + i + '" maxlength="' + g.other.maxLength + '" placeholder="' + esc(g.other.placeholder || "") + '" value="' + esc(val) + '"></div></div>';
        }
      }
      html += "</div>";
      if (g.other && (g.other.max || 1) > 1 && (bag.other[g.id] || []).length < g.other.max) {
        html += '<button type="button" class="btn ghost am-add" data-act="add-other" data-group="' + esc(g.id) + '">' + esc(Q.addOther) + "</button>";
      }
      return html + "</section>";
    }).join("");
  }

  function rankPhaseHtml(s) {
    const bag = ensure(s);
    return s.rank.groups.map(function (gid) {
      const g = s.groups.find(function (x) { return x.id === gid; });
      const ids = bag.order[gid] || [];
      const tone = GROUP_TONE[gid] || "";
      return "<section" + (tone ? ' data-tone="' + tone + '"' : "") + "><h3>" + esc(g.title || g.counter || "") + "</h3>" + listHtml(s, gid, ids, false, s.rank.divider) + "</section>";
    }).join("");
  }

  function directRankHtml(s) {
    const order = ensure(s).order;
    const left = s.items.filter(function (it) { return order.indexOf(it.id) === -1; });
    let html = "<h3>" + esc(Q.rankZone) + "</h3>";
    if (!order.length) html += '<p class="muted">' + esc(Q.rankEmpty) + "</p>";
    html += listHtml(s, "", order, true, null);
    html += '<div class="items am-pool">';
    left.forEach(function (it) {
      const mark = cardIcon(s.id, it.id);
      const tone = ITEM_TONE[it.id] || "";
      html += '<button type="button" class="rsrc-opt' + (mark ? " has-ico" : "") + '" data-act="pool" data-id="' + esc(it.id) + '"' + (tone ? ' data-item-tone="' + tone + '"' : "") + ">" + (mark ? ico(mark, tone) : "") + "<strong>" + esc(it.label) + "</strong>" +
        (it.hint ? '<span class="muted">' + esc(it.hint) + "</span>" : "") + "</button>";
    });
    html += "</div>";
    if (s.footnote) html += '<p class="muted">' + esc(s.footnote) + "</p>";
    return html;
  }

  function autoComplete(s) {
    if (s.type !== "rank" || !s.autoCompleteLast) return;
    const bag = ensure(s);
    const left = s.items.filter(function (it) { return bag.order.indexOf(it.id) === -1; });
    if (left.length === 1 && bag.order.length === s.items.length - 1) {
      bag.order = E.rankingState(bag.order, { type: "add", id: left[0].id });
      pendingLive = fill(Q.placed, { label: left[0].label, pos: bag.order.length, total: s.items.length });
    }
  }

  function commitHtml(s) {
    const bag = ensure(s);
    let html = '<div class="chips">';
    D.nextSteps.forEach(function (step) {
      html += '<button type="button" class="chip" data-act="example" data-id="' + esc(step.id) + '">' + esc(step.label) + "</button>";
    });
    html += "</div>";
    html += '<p class="lab" style="margin-top:14px">' + esc(Q.engagementLabel) + "</p>";
    html += '<textarea id="am-engagement" rows="2" maxlength="140" placeholder="' + esc(s.engagement.placeholder) + '">' + esc(bag.engagement || "") + "</textarea>";
    html += '<p class="muted" data-am-chars>' + esc(fill(Q.chars, { n: String(bag.engagement || "").length, max: 140 })) + "</p>";
    html += "<h3>" + esc(Q.shareBlock) + "</h3>";
    html += '<div class="field"><label for="am-who">' + esc(Q.whoLabel) + '</label><input id="am-who" maxlength="40" placeholder="' + esc(s.share.whoPlaceholder) + '" value="' + esc(bag.who || "") + '"></div>';
    html += "<h3>" + esc(Q.whenLabel) + '</h3><div class="items">';
    D.moments.forEach(function (m) {
      const on = bag.moment === m.id;
      html += '<button type="button" class="rsrc-opt' + (on ? " picked" : "") + '" data-act="moment" data-id="' + esc(m.id) + '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(m.label) + "</button>";
    });
    html += "</div>";
    html += '<fieldset class="stack"><legend class="muted">' + esc(s.safety.text) + "</legend>";
    s.safety.options.forEach(function (o) {
      const on = bag.safety === o.id;
      html += '<label class="rsrc-opt' + (on ? " picked" : "") + '"><input class="am-sr" type="radio" name="am-safety" data-act="safety" data-id="' + esc(o.id) + '"' + (on ? " checked" : "") + "><strong>" + esc(o.label) + "</strong></label>";
    });
    html += '<p class="muted">' + esc(s.safety.note) + "</p></fieldset>";
    return html;
  }

  function demainExtra(s) {
    const bag = ensure(s);
    let html = "";
    const frein = answers.freins;
    let antidote = D.brakes.energie.antidote;
    if (frein) {
      const g = screenAt(D.screens.findIndex(function (x) { return x.id === "freins"; })).groups[0];
      const ids = g.items.map(function (it) { return it.id; }).filter(function (id) { return (frein.picked.freins || []).indexOf(id) !== -1; });
      if (ids.length) antidote = D.brakes[ids[0]].antidote;
      else if ((frein.other.freins || []).some(function (t) { return String(t).trim(); })) antidote = D.brakes.energie.antidote;
    }
    html += '<p class="muted">' + esc(fill(Q.idea, { antidote: antidote })) + "</p>";
    if ((bag.picked.actions || []).indexOf("rappel") !== -1) {
      html += "<h3>" + esc(Q.timeAsk) + '</h3><div class="items">';
      D.times.forEach(function (t) {
        const on = bag.time === t.id;
        html += '<button type="button" class="rsrc-opt' + (on ? " picked" : "") + '" data-act="time" data-id="' + esc(t.id) + '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(t.label) + "</button>";
      });
      html += "</div>";
    }
    return html;
  }

  function inlineRank(s) {
    if (!s.rank || s.rank.mode !== "inline") return "";
    const gid = s.rank.groups[0];
    const ids = ensure(s).order[gid] || [];
    if (ids.length < 2) return "";
    return "<section class=\"stack\"><h3>" + esc(s.rank.title) + "</h3><p class=\"muted\">" + esc(Q.rankHelp) + "</p>" + listHtml(s, gid, ids, false, null) + "</section>";
  }

  function pinSticky() {
    const bar = document.getElementById("am-sticky");
    if (!bar) return;
    let cookie = 0;
    if (document.body.classList.contains("mh-cookie-open")) {
      cookie = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mh-cookie-banner-h")) || 0;
    }
    const vv = window.visualViewport;
    const lift = vv ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)) : 0;
    bar.style.bottom = (10 + cookie + lift) + "px";
  }

  function pinNav() {
    pinSticky();
    const nav = root.querySelector(".qnav");
    const block = root.querySelector(".am-body");
    if (!nav) return;
    const vv = window.visualViewport;
    const lift = vv ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)) : 0;
    let cookie = 0;
    if (document.body.classList.contains("mh-cookie-open")) {
      cookie = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mh-cookie-banner-h")) || 0;
    }
    nav.style.bottom = (lift + cookie) + "px";
    if (block) block.style.paddingBottom = (nav.offsetHeight + cookie + 12) + "px";
  }

  function shell(s, title, help, body, buttonLabel, scroll) {
    const n = D.screens.length;
    const k = deficit(s);
    const ok = k === 0;
    const segs = D.screens.map(function (sc, i) {
      const sub = i === qi ? subProgress(sc) : null;
      const pct = sub ? Math.round(((sub.index + 1) / sub.parts) * 100) : 100;
      const partial = !!(sub && sub.parts > 1 && pct < 100);
      const cls = [(i < qi || (i === qi && ok && !partial)) ? "done" : "", i === qi ? "is-now" : "", partial ? "is-partial" : ""].filter(Boolean).join(" ");
      return '<span class="' + cls + '" data-tone="' + barTone(sc) + '">' + (partial ? '<i style="width:' + pct + '%"></i>' : "") + "</span>";
    }).join("");
    const suffix = s.rank && s.rank.mode === "step" && phase === "rank" ? Q.rankSuffix : "";
    const pop = !scroll && ok && armed;
    armed = !ok;
    root.dataset.tone = currentTone(s);
    root.classList.remove("has-sticky");
    root.innerHTML =
      resumeHtml() +
      '<div class="am-stage' + (scroll ? " am-in" : "") + '">' +
      '<div class="progress" aria-hidden="true">' + segs + "</div>" +
      '<div class="qhead"><span class="eyebrow">' + ico(questionIcon(s)) + esc(fill(Q.progress, { i: s.n, n: n }) + " · " + s.eyebrow + suffix) + "</span>" +
      (s.badge && phase !== "rank" ? '<span class="tag">' + esc(s.badge) + "</span>" : "") +
      "<h2>" + esc(title) + "</h2>" +
      (help ? '<p class="muted">' + esc(help) + "</p>" : "") +
      countersHtml(s, pop) +
      "</div>" +
      '<div class="am-body">' + body +
      '<p id="am-rank-help" class="am-sr">' + esc(Q.rankHelp) + "</p>" +
      '<p id="am-live" class="am-sr" aria-live="polite"></p></div></div>' +
      '<div class="qnav"><div class="am-nav-inner">' +
      moreHtml(s) +
      '<div class="row-actions am-nav-row"><button type="button" class="btn ghost" data-act="prev">' + esc(Q.prev) + "</button>" +
      '<button type="button" class="btn" data-act="next"' + (ok ? "" : " disabled") + ' aria-disabled="' + (ok ? "false" : "true") + '">' + esc(buttonLabel) + "</button></div></div></div>";
    pinNav();
    if (focusSel) {
      const el = document.getElementById(focusSel);
      if (el) el.focus();
      focusSel = "";
    }
    if (pendingLive) {
      live(pendingLive);
      pendingLive = "";
    }
    if (scroll) scrollTop();
    saveProgress();
  }

  function showIntro() {
    const I = U.intro;
    const introTones = ["sage", "gold", "pink", "coral"];
    view = "intro";
    armed = true;
    delete root.dataset.tone;
    root.classList.remove("has-sticky");
    root.innerHTML =
      resumeHtml() +
      '<div class="hero"><span class="eyebrow">' + ico("heart") + esc(I.eyebrow) + "</span><h1>" + I.h1 + '</h1><p class="lead">' + esc(I.lead) + "</p></div>" +
      '<div class="stack-lg" style="padding-top:18px"><div class="howto"><div class="rules">' +
      I.bullets.map(function (b, i) {
        const tone = introTones[i] || "pink";
        return '<div class="rule" data-tone="' + tone + '"><span class="k">' + (i + 1) + "</span><strong>" + esc(b) + "</strong></div>";
      }).join("") +
      "</div>" +
      '<p class="howto-tip">' + esc(I.howto) + "</p></div>" +
      '<div class="hello"><div class="field"><label for="am-prenom">' + esc(I.nameLabel) + "</label>" +
      '<input id="am-prenom" autocomplete="given-name" maxlength="40" value="' + esc(prenom) + '">' +
      '<p class="muted">' + esc(I.nameHelp) + "</p></div></div>" +
      '<div class="row-actions"><button class="btn" type="button" data-act="start">' + esc(I.start) + "</button></div></div>";
    const input = document.getElementById("am-prenom");
    if (input) input.focus();
    scrollTop();
    saveProgress();
  }

  function showQuestion(scroll) {
    view = "question";
    const s = screenAt(qi);
    ensure(s);
    if (s.type === "pick" && s.rank && s.rank.mode === "step" && phase === "rank") {
      shell(s, s.rank.title, Q.rankHelp, rankPhaseHtml(s), Q.next, scroll);
      return;
    }
    if (s.type === "rank") {
      shell(s, s.title, s.help || Q.rankTapHelp, directRankHtml(s), Q.next, scroll);
      return;
    }
    if (s.type === "commit") {
      shell(s, s.title, s.help, commitHtml(s), Q.finish, scroll);
      return;
    }
    const onSplit = s.splitGroups && groupStep < s.groups.length - 1;
    const button = onSplit ? Q.next : (s.rank && s.rank.mode === "step" ? s.rank.cta : (qi === D.screens.length - 1 ? Q.finish : Q.next));
    const g = s.splitGroups ? activeGroups(s)[0] : null;
    const title = g && g.stepTitle ? g.stepTitle : s.title;
    let body = pickHtml(s);
    if (s.id === "demain") body += demainExtra(s);
    if (s.rank && s.rank.mode === "inline") body += inlineRank(s);
    shell(s, title, s.help, body, button, scroll);
  }

  function moveRank(s, gid, index, dir) {
    const bag = ensure(s);
    const list = s.type === "rank" ? bag.order : bag.order[gid];
    const next = E.rankingState(list, { type: dir, index: index });
    if (s.type === "rank") bag.order = next;
    else bag.order[gid] = next;
    const id = next[dir === "up" ? index - 1 : index + 1] || next[index];
    focusSel = "am-handle-" + (gid || "rank") + "-" + id;
    const label = labelFor(s, gid, id);
    const pos = next.indexOf(id) + 1;
    showQuestion(false);
    live(fill(Q.live, { label: label, pos: pos, total: next.length }));
  }

  function ul(items) {
    return "<ul class=\"clean\">" + items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  }

  function needStyle(id) {
    const b = D.profil.besoins[id];
    return "--bc:" + b.ink + ";--bcd:" + b.dark + ";--bf:" + b.color + ";--bt:" + b.tint;
  }
  function profilSvg(name) {
    const inner = D.profil.icons[name];
    if (!inner) return "";
    return '<span class="am-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + "</svg></span>";
  }
  function calendlyHref(place) {
    try { return E.calendlyLink(D.config.calendly, place, location.search || ""); }
    catch (err) { return D.config.calendly; }
  }
  function discoveryBlock(place, pierreLine) {
    return '<section class="rs am-cta"><span class="eyebrow">' + esc(R.ctaEyebrow) + "</span><h2>" + esc(R.ctaH) + "</h2><p>" + esc(pierreLine) + "</p><p>" + esc(R.ctaP) + '</p><a class="btn" data-cta-place="quiz_amour_' + place + '" href="' + esc(calendlyHref(place)) + '" target="_blank" rel="noopener noreferrer">' + esc(R.ctaBtn) + '</a><p class="muted">' + esc(R.ctaSign) + "</p></section>";
  }
  function stickyBar() {
    if (stickyOff) return "";
    return '<div class="am-sticky" id="am-sticky"><a class="btn small" data-cta-place="quiz_amour_resultat-sticky" href="' + esc(calendlyHref("resultat-sticky")) + '" target="_blank" rel="noopener noreferrer">' + esc(R.stickyCta) + '</a><button type="button" class="btn ghost small" data-act="dismiss-sticky" aria-label="' + esc(R.stickyClose) + '">×</button></div>';
  }
  function stepGlance(profile) {
    const stepText = String(profile.etape.engagement || "").trim();
    const who = profile.etape.who ? fill(R.shareWith, { who: profile.etape.who }) : "";
    const momentLabel = (D.moments.find(function (m) { return m.id === profile.etape.moment; }) || {}).label || "";
    const parts = [];
    if (stepText) parts.push("« " + stepText + " »");
    else parts.push(R.nowStepEmpty);
    if (who) parts.push(who);
    if (momentLabel) parts.push(momentLabel);
    return parts.join(" · ");
  }
  function brakeTitle(id, asShort) {
    if (String(id).indexOf("autre:") === 0) return E.answerLabel(answers, D, "freins", "freins", id);
    if (asShort) return D.brakes[id] ? D.brakes[id].short : "";
    const g = D.screens.find(function (s) { return s.id === "freins"; }).groups[0];
    const it = g.items.find(function (item) { return item.id === id; });
    return it ? it.label : "";
  }

  function profilReport(profile, pierreLine) {
    const pr = profile.profil;
    const U = D.profil.ui;
    const B = D.profil.besoins;
    const dom = B[pr.dom];
    const sec = B[pr.sec];
    const headStyle = "--sc:" + sec.ink + ";--sc-dark:" + sec.dark + ";--dom-tint:" + dom.tint + ";--sec-tint:" + sec.tint + ";--dom-color:" + dom.color + ";--sec-color:" + sec.color;
    const pills =
      '<div class="am-pills"><span class="am-pill" style="' + needStyle(pr.dom) + '">' + profilSvg(dom.icon) + "<span><small>Dominante</small>" + esc(dom.name) + "</span></span>" +
      '<span class="am-pill" style="' + needStyle(pr.sec) + '">' + profilSvg(sec.icon) + "<span><small>Secondaire</small>" + esc(sec.name) + "</span></span></div>";
    const bars = pr.bars.map(function (bar) {
      const b = B[bar.id];
      return '<div class="pr-bar" style="' + needStyle(bar.id) + '"><span class="pr-bar-n">' + profilSvg(b.icon) + "<span>" + esc(b.name) + '</span></span><span class="pr-track"><i style="width:' + bar.pct + '%"></i></span><span class="pr-score">' + esc(String(bar.score)) + "</span></div>";
    }).join("");
    const why = '<details class="pr-hide"><summary>' + esc(U.whyLab) + "</summary><p>" + esc(fill(U.whyIntro, { domName: dom.name })) + "</p><ul class=\"clean\">" +
      pr.why.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") +
      "</ul><p class=\"muted\">" + esc(U.whyNote) + "</p></details>";
    const header =
      '<div class="rhead" style="' + headStyle + '"><span class="eyebrow">' + esc(pr.header.eyebrow) + "</span>" +
      '<div class="alloy">' + esc(pr.name.noun) + " <em>" + esc(pr.name.adj) + "</em></div>" +
      '<p class="pr-domsec">' + esc(pr.header.domSec) + "</p>" + pills +
      '<div class="panel"><span class="lab">' + esc(U.alliageLab) + '</span><p class="quote">' + esc(pr.header.alliage) + "</p></div>" +
      '<div class="panel pr-hide"><span class="lab">' + esc(U.barsLab) + '</span><div class="pr-bars">' + bars + "</div>" +
      (pr.header.marginLine ? "<p>" + esc(pr.header.marginLine) + "</p>" : "") + "</div>" + why + "</div>";
    const marks = [dom.icon, "cloud-rain", "life-buoy"];
    const tones = [pr.dom, pr.dom, pr.dom];
    const phrases =
      '<section class="rs" id="sec-phrases"><h2>' + esc(R.sentencesH) + "</h2>" +
      '<div class="panel">' + profile.sentences.map(function (sentence, i) {
        return '<p class="am-sentence' + (i === 0 ? " quote" : "") + '" style="' + needStyle(tones[i]) + '">' + profilSvg(marks[i]) + "<span>" + esc(sentence) + "</span></p>";
      }).join("") + "</div>" +
      '<div class="row-actions am-screen-only"><button type="button" class="btn ghost small" data-act="copy-short">' + esc(R.copyShortBtn) + '</button><button type="button" class="btn ghost small" data-act="share">' + esc(R.shareBtn) + '</button><span class="toast" id="am-toast-short" aria-live="polite"></span></div></section>';
    const hrefs = ["#am-s1", "#am-s2", "#am-s3", "#am-s4", "#am-s5", "#am-s6", "#sec-now"];
    const toc = '<nav class="toc" aria-label="Sommaire">' + U.toc.map(function (label, i) {
      return '<a href="' + hrefs[i] + '">' + esc(label) + "</a>";
    }).join("") + "</nav>";
    const sections = pr.sections.map(function (secItem, i) {
      const style = needStyle(pr.dom);
      let body = "";
      if (secItem.trap) body += "<h3>" + esc(secItem.trap) + "</h3>";
      if (secItem.lead) body += "<p>" + esc(secItem.lead) + "</p>";
      if (secItem.list) {
        body += '<div class="panel ' + (i === 0 ? "ctx-good" : "ctx-bad") + '"><span class="lab">' + esc(i === 0 ? "Tes contextes fertiles" : "Tes contextes toxiques") + "</span><ul class=\"clean\">" +
          secItem.list.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + "</ul>" +
          (secItem.alarm ? "<p><strong>" + esc(U.s2alarmLab) + " :</strong> " + esc(secItem.alarm) + "</p>" : "") +
          "</div>";
      }
      if (secItem.rows) {
        body += '<div class="pr-rows">' + secItem.rows.map(function (row) {
          return "<div><b>" + esc(row.label) + "</b><span>" + esc(row.text) + "</span></div>";
        }).join("") + "</div>";
      }
      if (secItem.rule) body += "<p>" + esc(secItem.rule) + "</p>";
      if (secItem.fond) body += '<ul class="clean fond">' + secItem.fond.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + "</ul>";
      if (secItem.nourrit) {
        const pair = function (item) { return "<p><strong>" + esc(item.label) + "</strong> " + esc(item.text) + "</p>"; };
        body += '<div class="grid2">';
        body += '<div class="panel ctx-good"><span class="lab">' + esc(U.s4nourrit) + "</span>" + secItem.nourrit.map(pair).join("") + "</div>";
        body += '<div class="panel"><span class="lab">' + esc(U.s4frotte) + "</span>" + secItem.frotte.map(pair).join("") + "</div>";
        body += "</div>";
        body += '<div class="panel pr-hide"><span class="lab">' + esc(U.s4proche) + "</span>" + secItem.proche.map(pair).join("") +
          "<p><strong>" + esc(U.s4mirrorLab) + " :</strong> " + esc(secItem.mirror) + "</p></div>";
        body += '<div class="panel ctx-bad"><span class="lab">' + esc(U.s4critical) + '</span><ul class="clean">' +
          secItem.critical.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + "</ul></div>";
      }
      if (secItem.partner) {
        body += '<div class="grid2"><div class="panel"><span class="lab">' + esc(U.s5partner) + '</span><ul class="clean pr-say">' +
          secItem.partner.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + "</ul></div>";
        body += '<div class="panel"><span class="lab">' + esc(U.s5date) + '</span><ul class="clean pr-say">' +
          secItem.date.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + "</ul></div></div>";
      }
      if (secItem.exits) {
        body += '<div class="panel"><span class="lab">' + esc(U.s6exitLab) + "</span>" + secItem.exits.map(function (item, n) {
          return '<div class="pr-exit"><span class="k">' + (n + 1) + "</span><p>" + esc(item) + "</p></div>";
        }).join("") + "</div>";
      }
      if (secItem.extra) {
        body += secItem.extra.map(function (line, j) {
          const hide = i === 2 || (i === 0 && j !== 0) || (i === 1 && j !== 1) || (i === 5 && j !== 0);
          return '<p class="' + (hide ? "pr-hide" : "") + '">' + esc(line) + "</p>";
        }).join("");
      }
      if (secItem.also) body += "<p>" + esc(secItem.also) + "</p>";
      return '<section class="rs pr-sec" id="am-s' + (i + 1) + '" style="' + style + '"><p class="snum">' + profilSvg(secItem.icon) + " " + (i + 1) + "</p><h2>" + esc(secItem.title) + "</h2>" + body + "</section>";
    });
    return header + '<div class="stack-lg" style="padding-top:8px">' + phrases + discoveryBlock("resultat-apres-profil", pierreLine) + toc +
      '<div class="pr-cols">' + sections[0] + sections[1] + "</div>" +
      sections.slice(2).join("") + "</div>";
  }

  function showResults(profile) {
    view = "results";
    resultProfile = profile;
    const boussoleHref = D.config.boussoleUrl + "#amour=" + E.encodePayload(profile.boussole);
    const fortId = (profile.stress.fort || [])[0];
    const pierreLine = (R.nowStress && R.nowStress[fortId]) || R.nowGeneric;
    const stepText = String(profile.etape.engagement || "").trim();
    const stepMoment = (D.moments.find(function (m) { return m.id === profile.etape.moment; }) || {}).label || "";
    const stepBody = stepText
      ? '<p class="quote">« ' + esc(stepText) + " »</p>" + (stepMoment ? "<p>" + esc(stepMoment) + "</p>" : "")
      : "<p>" + esc(R.nowStepEmpty) + "</p>";

    function ol(title, rows) {
      return '<div class="panel"><span class="lab">' + esc(title) + '</span><ol class="clean">' + rows.map(function (row) { return "<li>" + esc(row) + "</li>"; }).join("") + "</ol></div>";
    }
    const glance =
      ol(R.nourritLab, profile.nourrit.slice(0, 3).map(function (c) { return c.short; })) +
      ol(R.videLab, profile.vide.map(function (c, i) { return c.short + (i === 0 ? " (" + R.noMoreMark + ")" : ""); })) +
      ol(R.langLab, profile.languages.order.map(function (id) { return screenAt(2).items.find(function (it) { return it.id === id; }).label; })) +
      ol(R.valuesLab, profile.values.order.map(function (v, i) { return v.short + (i < 3 ? " (" + R.nnMark + ")" : ""); })) +
      ol(R.instinctLab, [profile.ennea.instinct, profile.ennea.instinct2, profile.ennea.instinctLast].filter(Boolean).map(function (id) {
        return screenAt(5).items.find(function (it) { return it.id === id; }).label;
      })) +
      '<div class="panel"><span class="lab">' + esc(R.rechargeLab) + "</span><p>" + esc(D.recharge[profile.recharge.profile].title + (function () {
        const screen = D.screens.find(function (s) { return s.id === "ressource"; });
        const shorts = [];
        ["soir", "weekend"].forEach(function (gid) {
          const g = screen.groups.find(function (x) { return x.id === gid; });
          (profile.recharge.picks[gid] || []).forEach(function (id) {
            const it = g.items.find(function (item) { return item.id === id; });
            if (it && it.recharge === profile.recharge.profile) shorts.push(it.short);
          });
        });
        return shorts.length ? " : " + shorts.slice(0, 2).join(", ") : "";
      })()) + "</p></div>" +
      '<div class="panel"><span class="lab">' + esc(R.stressLab) + "</span><p>" + esc("modéré → " + profile.stress.modere.map(function (id) { return D.stress.modere[id].short; }).join(", ") + " · fort → " + profile.stress.fort.map(function (id) { return D.stress.fort[id].short; }).join(", ")) + "</p></div>" +
      '<div class="panel"><span class="lab">' + esc(R.brakeLab) + "</span><p>" + esc(brakeTitle(profile.brakes.first, false) + " " + profile.brakes.antidote) + "</p></div>" +
      '<div class="panel"><span class="lab">' + esc(R.demainLab) + "</span><p>" + esc(profile.demain.actions.map(function (id) {
        return id === "rappel" ? fill(D.actions.rappel, { heure: (D.times.find(function (t) { return t.id === profile.demain.time; }) || {}).label || "" }) : D.actions[id];
      }).join(" ")) + "</p>" +
      (profile.demain.actions.indexOf("rappel") !== -1 ? '<p><button type="button" class="btn ghost small" data-act="ics">' + esc(R.icsBtn) + "</button></p>" : "") +
      "</div>" +
      '<div class="panel"><span class="lab">' + esc(R.stepLab) + "</span><p>" + esc(stepGlance(profile)) + "</p></div>";

    const type = D.ennea.types[profile.ennea.type];
    const detail =
      '<section class="rs"><h2>' + esc(R.ressH) + "</h2><p>" + esc(profile.recharge.line) + "</p><p>" + esc(D.recharge[profile.recharge.profile].couple) + "</p><p>" + esc(D.recharge[profile.recharge.profile].fit) + "</p><p>" + esc(D.recharge[profile.recharge.profile].risk) + "</p><p>" + esc(R.rechargeRule) + "</p></section>" +
      '<section class="rs"><h2>' + esc(R.langH) + "</h2>" + [profile.languages.lang1, profile.languages.lang2].filter(Boolean).map(function (id) {
        const L = D.languages[id];
        return "<p><strong>" + esc(L.name) + "</strong> " + esc(L.recv) + "</p><p>" + esc(R.tipsLab + " " + L.tips) + "</p>";
      }).join("") + "</section>" +
      '<section class="rs"><h2>' + esc(R.enneaH) + "</h2><p>" + esc(type.couple) + "</p><p><strong>" + esc(R.piegeLab) + "</strong> " + esc(type.piege) + "</p>" +
      (profile.ennea.stressHint ? "<p>" + esc(profile.ennea.stressHint) + "</p>" : "") +
      "<p>" + esc(profile.ennea.confidenceText) + "</p><p class=\"muted\">" + esc(D.ennea.disclaimer) + "</p><p class=\"muted\">" + esc(D.ennea.credit) + "</p></section>" +
      '<section class="rs"><h2>' + esc(R.instinctH) + "</h2><p>" + esc(D.instincts[profile.ennea.instinct].couple) + "</p>" +
      profile.ennea.pairs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      "<p class=\"muted\">" + esc(R.pairsNote) + "</p></section>" +
      '<section class="rs"><h2>' + esc(R.stressH) + "</h2>" +
      profile.stress.modere.map(function (id) { return "<p>" + esc(D.stress.modere[id].text) + "</p>"; }).join("") +
      profile.stress.fort.map(function (id) { return "<p>" + esc(D.stress.fort[id].text) + " " + esc(D.stress.fort[id].tip) + "</p>"; }).join("") +
      "</section>" +
      '<section class="rs"><h2>' + esc(R.brakesH) + "</h2>" + profile.brakes.all.map(function (id) {
        const own = String(id).indexOf("autre:") === 0;
        const title = brakeTitle(id, true);
        const antidote = own ? D.brakes.energie.antidote : (D.brakes[id] ? D.brakes[id].antidote : "");
        return "<p><strong>" + esc(title) + "</strong> " + esc(antidote) + "</p>";
      }).join("") + "</section>" +
      '<section class="rs"><h2>' + esc(R.partnerH) + "</h2><p>" + esc(R.partnerIntro) + '</p><div class="grid3">' +
      '<div class="panel ctx-good"><p class="lab">' + esc(R.completeLab) + "</p>" + ul(profile.partner.complete) + "</div>" +
      '<div class="panel"><p class="lab">' + esc(R.frictionLab) + "</p>" + ul(profile.partner.friction) + "</div>" +
      '<div class="panel ctx-bad"><p class="lab">' + esc(R.criticalLab) + "</p>" + ul(profile.partner.critical) + "</div></div>" +
      "<h3>" + esc(R.gridH) + "</h3>" + D.riskGrid.map(function (g) {
        return '<div class="panel"><p class="lab">' + esc(g.level) + "</p><h3>" + esc(g.label) + "</h3><p>" + esc(g.text) + "</p></div>";
      }).join("") + "</section>" +
      (profile.pastAbuse ? '<section class="rs"><h2>' + esc(R.pastH) + "</h2><p>" + esc(profile.pastAbuse) + "</p></section>" : "") +
      '<section class="rs"><h2>' + esc(R.keyH) + "</h2>" + ul(profile.keyMessages) + "</section>";

    const matching = esc(fill(R.matchingP, { email: D.config.matchingEmail })).replace(esc(D.config.matchingEmail), '<a href="mailto:' + esc(D.config.matchingEmail) + '">' + esc(D.config.matchingEmail) + "</a>");

    root.classList.toggle("has-sticky", !stickyOff);
    root.innerHTML =
      resumeHtml() +
      (profile.safety ? '<div class="panel ctx-bad am-screen-only" role="alert"><span class="lab">' + esc(profile.safety.title) + "</span><p>" + esc(profile.safety.text) + "</p></div>" : "") +
      profilReport(profile, pierreLine) +
      '<section class="rs" id="sec-now"><h2>' + esc(R.nowH) + '</h2><div class="stack">' +
      '<article class="rule" data-tone="sage"><span class="k">1</span><strong>' + ico("flag", "sage") + esc(R.nowStep) + "</strong>" + stepBody + "</article>" +
      '<article class="rule" data-tone="sky"><span class="k">2</span><strong>' + ico("compass", "sky") + esc(R.nowTest) + "</strong><p>" + esc(R.nowTestP) + "</p>" +
      '<a class="btn" data-act="boussole" href="' + esc(boussoleHref) + '" target="_blank" rel="noopener noreferrer">' + esc(R.nowBoussole) + "</a></article>" +
      '<article class="rule" data-tone="pink"><span class="k">3</span><strong>' + ico("phone", "pink") + esc(R.nowPierre) + "</strong><p>" + esc(pierreLine) + "</p>" +
      '<a class="btn" data-cta-place="quiz_amour_resultat-fin" href="' + esc(calendlyHref("resultat-fin")) + '" target="_blank" rel="noopener noreferrer">' + esc(R.nowCall) + "</a></article>" +
      "</div>" +
      '<div class="row-actions"><button type="button" class="btn ghost" data-act="print">' + esc(R.nowPdf) + "</button></div></section>" +
      '<div class="am-screen-only stack-lg">' +
      '<section class="rs" id="sec-glance"><h2>' + esc(R.glanceH) + '</h2><div class="stack">' + glance + "</div></section>" +
      "<details><summary>" + esc(R.detailsSummary) + "</summary><div>" + detail + "</div></details>" +
      '<section class="rs"><h2>' + esc(R.exportH) + '</h2><div class="panel"><p>' + esc(R.exportP) + '</p><textarea id="am-export" readonly>' + esc(profile.exportText) + "</textarea>" +
      '<textarea id="am-share" readonly hidden>' + esc(profile.shareText) + '</textarea><div class="row-actions"><button type="button" class="btn" data-act="copy">' + esc(R.copyBtn) + '</button><span class="toast" id="am-toast" aria-live="polite"></span></div></div></section>' +
      '<section class="rs"><h2>' + esc(R.matchingH) + '</h2><div class="panel"><p class="muted">' + matching + "</p></div></section>" +
      '<section class="rs"><h2>' + esc(R.ethicsH) + '</h2><div class="prose"><p>' + esc(R.ethicsP) + '</p><p><button type="button" class="link" data-act="restart">' + esc(R.restart) + "</button></p></div></section>" +
      "</div>" +
      stickyBar();

    delete root.dataset.tone;
    root.dataset.share = profile.shareText;
    root.dataset.ics = JSON.stringify({ engagement: profile.etape.engagement, time: profile.demain.time });
    pinSticky();
    scrollTop();
    saveProgress();
  }

  function rememberTheme() {
    try { sessionStorage.setItem("mh_theme", "amour"); } catch (e) { /* privé */ }
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = "mh_theme=amour; Path=/; Max-Age=7200; SameSite=Lax" + secure;
  }

  function copyText(text, toast, area) {
    const done = function (msg) { if (toast) toast.textContent = msg; };
    const fallback = function () {
      if (area) { area.hidden = false; area.focus(); area.select(); }
      done(R.copyFallback);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(R.copied); }, fallback);
    } else fallback();
  }

  function icsFile() {
    let data = {};
    try { data = JSON.parse(root.dataset.ics || "{}"); } catch (e) { data = {}; }
    const pad = function (n) { return String(n).padStart(2, "0"); };
    const now = new Date();
    const stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + "T" + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + "Z";
    const parts = String(data.time || "18:00").split(":");
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(Number(parts[0]) || 18, Number(parts[1]) || 0, 0, 0);
    const local = start.getFullYear() + pad(start.getMonth() + 1) + pad(start.getDate()) + "T" + pad(start.getHours()) + pad(start.getMinutes()) + "00";
    const desc = String(data.engagement || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/\n/g, "\\n");
    const body = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Magic Humans//Quiz Amour//FR", "BEGIN:VEVENT",
      "UID:" + Date.now() + "@magichumans.com", "DTSTAMP:" + stamp, "DTSTART:" + local, "DURATION:PT15M",
      "SUMMARY:Ma prochaine étape (Quiz Amour)", "DESCRIPTION:" + desc, "BEGIN:VALARM", "TRIGGER:PT0M",
      "ACTION:DISPLAY", "DESCRIPTION:Ma prochaine étape", "END:VALARM", "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([body], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prochaine-etape.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function toggleCheck(s, gid, id, on) {
    const bag = ensure(s);
    let list = (bag.picked[gid] || []).slice();
    let dropped = "";
    if (on) {
      if (list.indexOf(id) === -1) list.push(id);
      if (s.exclusive) {
        s.exclusive.forEach(function (pair) {
          if (pair.indexOf(id) === -1) return;
          const other = pair.filter(function (x) { return x !== id; })[0];
          if (list.indexOf(other) !== -1) {
            list = list.filter(function (x) { return x !== other; });
            const item = s.groups[0].items.find(function (it) { return it.id === other; });
            dropped = item ? item.label : other;
          }
        });
      }
    } else list = list.filter(function (x) { return x !== id; });
    bag.picked[gid] = list;
    if (s.rank && s.rank.mode === "inline") resync(s);
    if (dropped) live(fill(Q.unchecked, { label: dropped }));
  }

  const drag = { on: false };

  root.addEventListener("pointerdown", function (ev) {
    const item = ev.target.closest(".am-rank-item");
    if (!item || !root.contains(item)) return;
    const handle = ev.target.closest(".am-handle");
    const button = ev.target.closest("button");
    if (button && !handle) return;
    if (!handle && ev.pointerType !== "mouse") return;
    ev.preventDefault();
    item.setPointerCapture(ev.pointerId);
    const ol = item.parentElement;
    const items = [].slice.call(ol.querySelectorAll(".am-rank-item"));
    drag.on = true;
    drag.pointer = ev.pointerId;
    drag.item = item;
    drag.ol = ol;
    drag.from = items.indexOf(item);
    drag.to = drag.from;
    drag.startY = ev.clientY;
    drag.gid = ol.getAttribute("data-group") || "";
    const olRect = ol.getBoundingClientRect();
    drag.mids = items.map(function (el) {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2 - olRect.top;
    });
    const next = items[drag.from + 1];
    drag.h = next ? next.getBoundingClientRect().top - item.getBoundingClientRect().top : item.getBoundingClientRect().height + 8;
    item.classList.add("is-dragging");
  });

  root.addEventListener("pointermove", function (ev) {
    if (!drag.on || ev.pointerId !== drag.pointer) return;
    const dy = ev.clientY - drag.startY;
    drag.item.style.transform = "translateY(" + dy + "px) scale(1.02)";
    const items = [].slice.call(drag.ol.querySelectorAll(".am-rank-item"));
    const y = ev.clientY - drag.ol.getBoundingClientRect().top;
    let to = items.length - 1;
    for (let i = 0; i < drag.mids.length; i++) {
      if (y < drag.mids[i]) { to = i; break; }
    }
    drag.to = to;
    items.forEach(function (el, i) {
      if (el === drag.item) return;
      let shift = 0;
      if (drag.from < to && i > drag.from && i <= to) shift = -drag.h;
      if (to < drag.from && i >= to && i < drag.from) shift = drag.h;
      el.style.transform = shift ? "translateY(" + shift + "px)" : "";
      el.style.transition = "transform 150ms";
    });
    if (ev.clientY < 60) window.scrollBy(0, -12);
    if (ev.clientY > window.innerHeight - 60) window.scrollBy(0, 12);
  });

  function endDrag(ev) {
    if (!drag.on || (ev && ev.pointerId !== drag.pointer)) return;
    drag.on = false;
    const s = screenAt(qi);
    const gid = drag.gid;
    const bag = ensure(s);
    const list = s.type === "rank" ? bag.order.slice() : (bag.order[gid] || []).slice();
    const next = E.rankingState(list, { type: "move", from: drag.from, to: drag.to });
    if (s.type === "rank") bag.order = next;
    else bag.order[gid] = next;
    const id = next[drag.to];
    focusSel = "am-handle-" + (gid || "rank") + "-" + id;
    showQuestion(false);
    live(fill(Q.live, { label: labelFor(s, gid, id), pos: drag.to + 1, total: next.length }));
  }
  root.addEventListener("pointerup", endDrag);
  root.addEventListener("pointercancel", endDrag);

  root.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" && ev.target && ev.target.id === "am-prenom") {
      ev.preventDefault();
      beginQuiz();
      return;
    }
    const handle = ev.target.closest && ev.target.closest(".am-handle");
    if (!handle) return;
    const item = handle.closest(".am-rank-item");
    const ol = item.parentElement;
    const gid = ol.getAttribute("data-group") || "";
    const s = screenAt(qi);
    const items = [].slice.call(ol.querySelectorAll(".am-rank-item"));
    const index = items.indexOf(item);
    const id = item.getAttribute("data-id");
    if (ev.key === "Escape" && held) {
      ev.preventDefault();
      const bag = ensure(s);
      if (s.type === "rank") bag.order = held.snapshot;
      else bag.order[gid] = held.snapshot;
      held = null;
      focusSel = handle.id;
      showQuestion(false);
      return;
    }
    if ((ev.key === " " || ev.key === "Enter") && !held) {
      ev.preventDefault();
      const bag = ensure(s);
      const list = s.type === "rank" ? bag.order.slice() : (bag.order[gid] || []).slice();
      held = { id: id, gid: gid, snapshot: list };
      live(fill(Q.grabbed, { label: labelFor(s, gid, id) }));
      return;
    }
    if ((ev.key === " " || ev.key === "Enter") && held) {
      ev.preventDefault();
      held = null;
      live(fill(Q.live, { label: labelFor(s, gid, id), pos: index + 1, total: items.length }));
      return;
    }
    if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
      ev.preventDefault();
      moveRank(s, gid, index, ev.key === "ArrowUp" ? "up" : "down");
    }
  });

  root.addEventListener("input", function (ev) {
    const el = ev.target;
    if (el.getAttribute("data-act") === "other") {
      const s = screenAt(qi);
      const g = s.groups.find(function (x) { return x.id === el.getAttribute("data-group"); });
      const i = Number(el.getAttribute("data-index"));
      const bag = ensure(s);
      const arr = (bag.other[g.id] || []).slice();
      while (arr.length <= i) arr.push("");
      arr[i] = el.value.replace(/[<>]/g, "").slice(0, g.other.maxLength);
      bag.other[g.id] = arr;
      if (el.value.length > arr[i].length) el.value = arr[i];
      const card = el.closest(".rsrc-opt");
      const on = arr[i].trim().length > 0;
      if (card) card.classList.toggle("picked", on);
      if (s.rank && s.rank.mode === "inline") resync(s);
      const k = deficit(s);
      const next = root.querySelector("[data-act=next]");
      if (next) { next.disabled = k > 0; next.setAttribute("aria-disabled", k > 0 ? "true" : "false"); }
      const more = root.querySelector(".am-more");
      const cue = moreCue(s);
      if (more) more.textContent = cue ? (cue.down ? fill(Q.moreDown, { k: cue.k, label: cue.label }) : fill(Q.more, { k: cue.k })) : "";
      saveProgress();
      return;
    }
    if (el.id === "am-prenom") {
      prenom = cleanName(el.value);
      saveProgress();
      return;
    }
    if (el.id === "am-engagement") {
      if (composing) {
        const chars = root.querySelector("[data-am-chars]");
        if (chars) chars.textContent = fill(Q.chars, { n: String(el.value || "").length, max: 140 });
        return;
      }
      applyEngagement(el);
      return;
    }
    if (el.id === "am-who") {
      ensure(screenAt(qi)).who = el.value.replace(/[<>]/g, "").slice(0, 40);
      saveProgress();
    }
  });

  function applyEngagement(el) {
    const s = screenAt(qi);
    if (!s || s.type !== "commit" || !el) return;
    const bag = ensure(s);
    const clean = String(el.value || "").replace(/[<>]/g, "").slice(0, 140);
    if (el.value !== clean) el.value = clean;
    bag.engagement = clean;
    if (bag.engagement !== lastPrefix) lastPrefix = "";
    const chars = root.querySelector("[data-am-chars]");
    if (chars) chars.textContent = fill(Q.chars, { n: String(bag.engagement).length, max: 140 });
    const wrote = clean.trim().length >= (s.engagement.minLength || 5);
    const legend = root.querySelector(".legend b");
    if (legend) legend.textContent = Q.engagementCounter + (wrote && bag.moment ? " " + Q.counterOk : "");
    const next = root.querySelector("[data-act=next]");
    const blocked = deficit(s) > 0;
    if (next) {
      next.disabled = blocked;
      next.setAttribute("aria-disabled", blocked ? "true" : "false");
    }
    saveProgress();
  }

  root.addEventListener("compositionstart", function (ev) {
    if (ev.target && ev.target.id === "am-engagement") composing = true;
  });
  root.addEventListener("compositionend", function (ev) {
    if (!ev.target || ev.target.id !== "am-engagement") return;
    composing = false;
    applyEngagement(ev.target);
  });

  root.addEventListener("change", function (ev) {
    const el = ev.target;
    const act = el.getAttribute && el.getAttribute("data-act");
    const s = screenAt(qi);
    if (!s) return;
    if (act === "check") {
      toggleCheck(s, el.getAttribute("data-group"), el.getAttribute("data-id"), el.checked);
      showQuestion(false);
    }
    if (act === "safety") {
      ensure(s).safety = el.getAttribute("data-id");
      showQuestion(false);
    }
  });

  root.addEventListener("click", function (ev) {
    const btn = ev.target.closest("[data-act]");
    if (!btn || !root.contains(btn)) return;
    const act = btn.getAttribute("data-act");
    const s = screenAt(qi);

    if (act === "start") {
      beginQuiz();
      return;
    }
    if (act === "restart") {
      restartQuiz();
      return;
    }
    if (act === "dismiss-sticky") {
      stickyOff = true;
      root.classList.remove("has-sticky");
      const bar = document.getElementById("am-sticky");
      if (bar) bar.remove();
      return;
    }
    if (act === "share") {
      const text = root.dataset.share || "";
      const toast = document.getElementById("am-toast-short");
      const payload = { title: "Amoureux, mais malheureux ?", text: text, url: D.config.quizUrl };
      if (navigator.share) {
        navigator.share(payload).catch(function (err) {
          if (err && err.name === "AbortError") return;
          copyText(text, toast, document.getElementById("am-share"));
        });
      } else copyText(text, toast, document.getElementById("am-share"));
      return;
    }
    if (act === "check" || act === "safety") return;
    if (act === "other-check") {
      const g = s.groups.find(function (x) { return x.id === btn.getAttribute("data-group"); });
      const i = Number(btn.getAttribute("data-index"));
      const field = document.getElementById("am-other-" + g.id + "-" + i);
      const bag = ensure(s);
      const arr = (bag.other[g.id] || []).slice();
      if ((arr[i] || "").trim()) arr[i] = "";
      else if (field) field.focus();
      bag.other[g.id] = arr;
      if (s.rank && s.rank.mode === "inline") resync(s);
      showQuestion(false);
      return;
    }
    if (act === "add-other") {
      const bag = ensure(s);
      const gid = btn.getAttribute("data-group");
      bag.other[gid] = (bag.other[gid] || [""]).concat("");
      focusSel = "am-other-" + gid + "-" + (bag.other[gid].length - 1);
      showQuestion(false);
      return;
    }
    if (act === "pool") {
      const bag = ensure(s);
      bag.order = E.rankingState(bag.order, { type: "add", id: btn.getAttribute("data-id") });
      autoComplete(s);
      showQuestion(false);
      return;
    }
    if (act === "remove" && s.type === "rank") {
      const bag = ensure(s);
      bag.order = E.rankingState(bag.order, { type: "remove", id: btn.getAttribute("data-id") });
      showQuestion(false);
      return;
    }
    if (act === "up" || act === "down") {
      moveRank(s, btn.getAttribute("data-group") || "", Number(btn.getAttribute("data-index")), act);
      return;
    }
    if (act === "example") {
      const step = D.nextSteps.find(function (x) { return x.id === btn.getAttribute("data-id"); });
      const bag = ensure(s);
      if (!String(bag.engagement || "").trim() || bag.engagement === lastPrefix) {
        bag.engagement = step.prefix;
        lastPrefix = step.prefix;
      }
      showQuestion(false);
      return;
    }
    if (act === "moment") {
      ensure(s).moment = btn.getAttribute("data-id");
      showQuestion(false);
      return;
    }
    if (act === "time") {
      ensure(s).time = btn.getAttribute("data-id");
      showQuestion(false);
      return;
    }
    if (act === "safety") {
      ensure(s).safety = btn.getAttribute("data-id");
      showQuestion(false);
      return;
    }
    if (act === "scroll-group") {
      const target = document.getElementById("am-group-" + btn.getAttribute("data-group"));
      if (target && target.scrollIntoView) target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (act === "prev") {
      resumeNote = false;
      if (stack.length > 1) {
        try { history.back(); return; } catch (e2) { /* repli manuel */ }
      }
      if (s && s.splitGroups && phase !== "rank" && groupStep > 0) {
        groupStep -= 1;
        showQuestion(true);
        return;
      }
      if (s && s.rank && s.rank.mode === "step" && phase === "rank") {
        phase = "ask";
        groupStep = s.splitGroups ? s.groups.length - 1 : 0;
        showQuestion(true);
        return;
      }
      if (qi <= 0) { showIntro(); return; }
      qi -= 1;
      const prev = screenAt(qi);
      phase = prev.rank && prev.rank.mode === "step" && (ensure(prev).order[prev.rank.groups[0]] || []).length ? "rank" : "ask";
      groupStep = 0;
      showQuestion(true);
      return;
    }
    if (act === "next") {
      if (!s || deficit(s) > 0) return;
      resumeNote = false;
      if (s.splitGroups && phase !== "rank" && groupStep < s.groups.length - 1) {
        groupStep += 1;
        view = "question";
        pushHist();
        showQuestion(true);
        return;
      }
      if (s.rank && s.rank.mode === "step" && phase !== "rank") {
        resync(s);
        phase = "rank";
        view = "question";
        pushHist();
        showQuestion(true);
        return;
      }
      if (qi < D.screens.length - 1) {
        track("question_validee", { index: s.n });
        qi += 1;
        phase = "ask";
        groupStep = 0;
        view = "question";
        pushHist();
        showQuestion(true);
        return;
      }
      let profile;
      try { profile = E.computeLoveProfile(answers, D, prenom); }
      catch (e) { return; }
      track("question_validee", { index: s.n });
      resultProfile = profile;
      view = "results";
      track("resultat_affiche", { index: s.n });
      pushHist();
      showResults(profile);
      return;
    }
    if (act === "boussole") rememberTheme();
    if (act === "copy-short") {
      copyText(root.dataset.share || "", document.getElementById("am-toast-short"), document.getElementById("am-share"));
      return;
    }
    if (act === "copy") {
      const ta = document.getElementById("am-export");
      copyText(ta ? ta.value : "", document.getElementById("am-toast"), ta);
      return;
    }
    if (act === "print") { window.print(); return; }
    if (act === "ics") icsFile();
  });

  window.addEventListener("resize", pinNav);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", pinNav);
    window.visualViewport.addEventListener("scroll", pinNav);
  }
  if (window.MutationObserver) {
    const watchNav = new MutationObserver(pinNav);
    watchNav.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    watchNav.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
  }

  function beginQuiz() {
    const input = document.getElementById("am-prenom");
    prenom = cleanName(input ? input.value : prenom);
    qi = 0;
    phase = "ask";
    groupStep = 0;
    view = "question";
    resumeNote = false;
    track("quiz_start", { index: 1 });
    pushHist();
    showQuestion(true);
  }

  function restartQuiz() {
    E.clearProgress(browserStore());
    answers = {};
    prenom = "";
    qi = 0;
    phase = "ask";
    groupStep = 0;
    view = "intro";
    resultProfile = null;
    lastPrefix = "";
    resumeNote = false;
    stickyOff = false;
    runId += 1;
    stack = [{ view: "intro", qi: 0, phase: "ask", groupStep: 0 }];
    try { history.pushState({ amour: 1, runId: runId, i: 0 }, ""); } catch (e) { /* historique indisponible */ }
    showIntro();
  }

  function applySnap(snap) {
    view = snap && snap.view ? snap.view : "intro";
    qi = snap && Number.isInteger(snap.qi) ? snap.qi : 0;
    phase = snap && snap.phase === "rank" ? "rank" : "ask";
    groupStep = snap && Number.isInteger(snap.groupStep) ? snap.groupStep : 0;
    if (view === "results") {
      if (!resultProfile) {
        try { resultProfile = E.computeLoveProfile(answers, D, prenom); }
        catch (err) { view = "question"; }
      }
      if (view === "results" && resultProfile) {
        showResults(resultProfile);
        return;
      }
    }
    if (view === "question" && screenAt(qi)) {
      showQuestion(true);
      return;
    }
    view = "intro";
    showIntro();
  }

  let popSkips = 0;
  function onPop(ev) {
    if (!historyReady) return;
    const st = ev.state;
    if (st && st.amour === 1 && st.runId !== runId) {
      if (popSkips > 40) return;
      popSkips += 1;
      try { history.back(); } catch (e) { /* fin d'historique */ }
      return;
    }
    popSkips = 0;
    if (!st || st.amour !== 1 || st.runId !== runId) return;
    if (!stack[st.i]) return;
    stack = stack.slice(0, st.i + 1);
    resumeNote = false;
    applySnap(stack[st.i]);
  }

  function boot() {
    const saved = E.readProgress(browserStore());
    if (saved && (saved.view === "question" || saved.view === "results")) {
      const q = saved.qi;
      if (Number.isInteger(q) && q >= 0 && q < D.screens.length) {
        prenom = saved.prenom || "";
        qi = q;
        phase = saved.phase === "rank" ? "rank" : "ask";
        groupStep = saved.groupStep || 0;
        answers = saved.answers || {};
        lastPrefix = saved.lastPrefix || "";
        view = saved.view === "results" && saved.profile ? "results" : "question";
        if (view === "results") resultProfile = saved.profile;
        if (Array.isArray(saved.stack) && saved.stack.length) {
          stack = saved.stack.map(function (step) {
            return {
              view: step.view === "question" || step.view === "results" ? step.view : "intro",
              qi: step.qi || 0,
              phase: step.phase === "rank" ? "rank" : "ask",
              groupStep: step.groupStep || 0,
            };
          });
        } else stack = [{ view: "intro", qi: 0, phase: "ask", groupStep: 0 }];
        const last = stack[stack.length - 1];
        const now = currentSnap();
        if (!last || last.view !== now.view || last.qi !== now.qi || last.phase !== now.phase || last.groupStep !== now.groupStep) {
          stack.push(now);
        }
        resumeNote = true;
      }
    } else if (saved && saved.prenom) prenom = saved.prenom;
    try {
      history.replaceState({ amour: 1, runId: runId, i: 0 }, "");
      for (let i = 1; i < stack.length; i++) history.pushState({ amour: 1, runId: runId, i: i }, "");
    } catch (e) { /* historique indisponible */ }
    historyReady = true;
    window.addEventListener("popstate", onPop);
    applySnap(stack[stack.length - 1]);
  }

  boot();
})();
