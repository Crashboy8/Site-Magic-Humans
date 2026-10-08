/* Quiz Amour v1.4 · 8 questions, classement, résultats.
   Démarre uniquement si quiz/index.html a posé MH_THEME = "amour".
   Aucune réponse n'est envoyée. La progression reste dans ce navigateur
   pour pouvoir reprendre. */
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
    "#screen-amour .am-in{animation:am-in .38s ease}",
    "@keyframes am-in{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}",
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
    "#screen-amour .eyebrow{display:flex;align-items:flex-start;gap:10px;color:var(--am)}",
    "#screen-amour .eyebrow > span{min-width:0}",
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
    "#screen-amour .rsrc-opt.has-ico{display:grid;grid-template-columns:28px minmax(0,1fr);column-gap:10px;row-gap:2px;align-items:center}",
    "#screen-amour .rsrc-opt.has-ico .am-ico{grid-row:1 / span 2;align-self:start;margin-top:2px}",
    "#screen-amour .rsrc-opt.has-ico strong,#screen-amour .rsrc-opt.has-ico .muted{grid-column:2;min-width:0}",
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
    "#screen-amour .am-sentence > span{flex:1;min-width:0}",
    "#screen-amour .am-sentence .am-ico{margin-top:.15em;flex:none}",
    "#screen-amour .rule strong{display:flex;align-items:flex-start;gap:10px;min-width:0}",
    "#screen-amour .rule strong .am-ico{flex:none;margin-top:1px}",
    "#screen-amour .am-lab{min-width:0;flex:1}",
    "#screen-amour .rule[data-tone=sage]{background:var(--sage-soft);border-color:var(--sage)}",
    "#screen-amour .rule[data-tone=coral]{background:var(--coral-soft);border-color:var(--coral)}",
    "#screen-amour .rule[data-tone=pink]{background:var(--pink-soft);border-color:var(--pink)}",
    "#screen-amour .rule[data-tone=gold]{background:var(--gold-soft);border-color:var(--gold)}",
    "#screen-amour .rule[data-tone=sky]{background:var(--sky-soft);border-color:var(--sky)}",
    "#screen-amour .howto .rules{gap:16px}",
    "#screen-amour .am-benefit{flex-direction:row;align-items:center;gap:12px;padding:18px 16px;border-radius:22px;box-shadow:0 10px 24px rgba(43,37,34,.09)}",
    "#screen-amour .am-benefit strong{align-items:flex-start;line-height:1.35;flex:1;min-width:0}",
    "#screen-amour .am-benefit .k{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;flex:none;line-height:0;background:var(--surface)}",
    "#screen-amour .am-benefit .k .am-ico svg{width:40px;height:40px;stroke-width:2.15}",
    "#screen-amour .am-benefit[data-tone=sage]{background:linear-gradient(125deg,color-mix(in srgb,var(--sage) 22%,var(--surface)),var(--surface) 72%);border-color:color-mix(in srgb,var(--sage) 34%,var(--surface))}",
    "#screen-amour .am-benefit[data-tone=gold]{background:linear-gradient(125deg,color-mix(in srgb,var(--gold) 24%,var(--surface)),var(--surface) 72%);border-color:color-mix(in srgb,var(--gold) 36%,var(--surface))}",
    "#screen-amour .am-benefit[data-tone=pink]{background:linear-gradient(125deg,color-mix(in srgb,var(--pink) 20%,var(--surface)),var(--surface) 72%);border-color:color-mix(in srgb,var(--pink) 32%,var(--surface))}",
    "#screen-amour .am-benefit[data-tone=coral]{background:linear-gradient(125deg,color-mix(in srgb,var(--coral) 20%,var(--surface)),var(--surface) 72%);border-color:color-mix(in srgb,var(--coral) 32%,var(--surface))}",
    "#screen-amour .am-benefit[data-tone=sage] .k{box-shadow:0 0 0 7px color-mix(in srgb,var(--sage) 16%,var(--surface)),0 8px 16px rgba(43,37,34,.08)}",
    "#screen-amour .am-benefit[data-tone=gold] .k{box-shadow:0 0 0 7px color-mix(in srgb,var(--gold) 20%,var(--surface)),0 8px 16px rgba(43,37,34,.08)}",
    "#screen-amour .am-benefit[data-tone=pink] .k{box-shadow:0 0 0 7px color-mix(in srgb,var(--pink) 16%,var(--surface)),0 8px 16px rgba(43,37,34,.08)}",
    "#screen-amour .am-benefit[data-tone=coral] .k{box-shadow:0 0 0 7px color-mix(in srgb,var(--coral) 16%,var(--surface)),0 8px 16px rgba(43,37,34,.08)}",
    "#screen-amour .rhead{background:linear-gradient(120deg,var(--dom-tint,var(--pink-soft)),var(--sec-tint,var(--sage-soft)));border-radius:var(--radius);padding:26px 20px 22px;margin-top:10px}",
    "#screen-amour .alloy{font-size:clamp(2.4rem,8vw,3.8rem);line-height:1.02}",
    "#screen-amour .alloy em{font-style:normal;color:var(--sc,var(--accent));font-weight:500}",
    "#screen-amour .am-pills{display:flex;flex-wrap:wrap;gap:8px}",
    "#screen-amour .pr-domsec{margin:0 0 12px}",
    "#screen-amour .am-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;border-radius:999px;background:var(--bt);color:var(--bc);font-weight:700;margin:0 8px 8px 0}",
    "#screen-amour .am-pill small{display:block;font-weight:700;text-transform:uppercase;font-size:.68rem;letter-spacing:.08em;opacity:.85}",
    "#screen-amour .pr-bars{display:grid;gap:8px}",
    "#screen-amour .pr-bar{display:grid;grid-template-columns:minmax(0,118px) 1fr auto;align-items:center;gap:8px;font-size:.9rem}",
    "#screen-amour .pr-bar-n{display:flex;align-items:center;gap:8px;color:var(--bc);font-weight:700;min-width:0}",
    "#screen-amour .pr-bar-n > .am-ico{flex:none}",
    "#screen-amour .pr-bar-n .am-namebtn{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#screen-amour .pr-track{height:10px;border-radius:99px;background:var(--line);overflow:hidden}",
    "#screen-amour .pr-track i{display:block;height:100%;width:0;background:var(--bf);border-radius:99px;animation:am-bar .8s cubic-bezier(.2,.7,.2,1) forwards}",
    "@keyframes am-bar{to{width:var(--w,0%)}}",
    "#screen-amour .am-salle .salle-row{display:grid;grid-template-columns:minmax(0,108px) 1fr auto;align-items:center;gap:8px;margin:8px 0;font-size:.92rem}",
    "#screen-amour .am-salle .salle-lab{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--bc);min-width:0}",
    "#screen-amour .am-salle .salle-lab > .am-ico{flex:none}",
    "#screen-amour .am-salle .salle-lab .am-namebtn{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#screen-amour .am-salle .salle-you{font-weight:700;font-size:.75rem;color:var(--muted)}",
    "#screen-amour .am-salle .salle-pct{font-weight:700;font-variant-numeric:tabular-nums;color:var(--ink)}",
    "#screen-amour .am-salle .pr-track{background:var(--line)}",
    "#screen-amour .am-salle .pr-track i{background:var(--bf)}",
    "#screen-amour .pr-score{color:var(--bc);font-weight:700;font-variant-numeric:tabular-nums}",
    "#screen-amour .pr-sec .snum{color:var(--bc)}",
    "#screen-amour details.am-fold{margin:0}",
    "#screen-amour details.am-fold > summary{cursor:pointer;list-style:none}",
    "#screen-amour details.am-fold > summary::-webkit-details-marker{display:none}",
    "#screen-amour details.am-fold > summary::marker{content:\"\"}",
    "#screen-amour details.am-fold > summary .rs{display:flex;flex-direction:row;align-items:center;gap:8px;margin-bottom:0}",
    "#screen-amour details.am-fold > summary .rs::after{content:\"\\25B6\";margin-left:auto;flex:none;font-size:.85rem;line-height:1}",
    "#screen-amour details.am-fold[open] > summary .rs::after{transform:rotate(90deg)}",
    "#screen-amour details.am-fold > summary .rs > .am-sec-head{flex:1;min-width:0}",
    "#screen-amour details.am-fold > summary h2{margin:0;flex:1;min-width:0}",
    "#screen-amour details.am-fold > summary .snum{margin:0}",
    "#screen-amour details.am-fold:not([open]) > .am-fold-body{display:none}",
    "#screen-amour .am-custom{display:flex;gap:8px;align-items:center}",
    "#screen-amour .am-custom .field{flex:1;min-width:0}",
    "#screen-amour .am-custom .btn{flex:0 0 auto;padding:10px 12px}",
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
    "#screen-amour .am-tap{display:flex;align-items:center;gap:12px;text-align:left}",
    "#screen-amour .am-tap .snum{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--am);color:#fff;font-weight:700;flex:none;font-size:1rem;font-family:inherit;font-style:normal}",
    "#screen-amour .am-steps{display:flex;justify-content:center;gap:14px;margin:2px 0 14px}",
    "#screen-amour .am-steps span{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:1.05rem;border:2px solid var(--am);color:var(--am);background:var(--surface)}",
    "#screen-amour .am-steps span.is-next{box-shadow:0 0 0 4px color-mix(in srgb,var(--am) 28%,transparent)}",
    "#screen-amour .am-steps span.is-on{background:var(--am);border-color:var(--am);color:#fff;box-shadow:none}",
    "#screen-amour .am-style{display:flex;align-items:flex-start;gap:12px;text-align:left}",
    "#screen-amour .am-style .snum{width:36px;height:36px;margin-top:1px;border-radius:50%;display:grid;place-items:center;flex:none;font-weight:700;font-size:1rem;font-family:inherit;font-style:normal;border:2px dashed var(--am);background:transparent;color:transparent}",
    "#screen-amour .am-style.picked .snum{border-style:solid;background:var(--am);color:#fff}",
    "#screen-amour .am-style[data-item-tone=sage] .snum{border-color:var(--sage)}",
    "#screen-amour .am-style[data-item-tone=sky] .snum{border-color:var(--sky)}",
    "#screen-amour .am-style[data-item-tone=pink] .snum{border-color:var(--pink)}",
    "#screen-amour .am-style[data-item-tone=sage].picked .snum{background:var(--sage)}",
    "#screen-amour .am-style[data-item-tone=sky].picked .snum{background:var(--sky)}",
    "#screen-amour .am-style[data-item-tone=pink].picked .snum{background:var(--pink)}",
    "#screen-amour .am-style-copy{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}",
    "#screen-amour .item .txt{display:flex;align-items:flex-start;gap:8px;min-width:0}",
    "#screen-amour .item .txt .snum,#screen-amour .item .txt .am-ico{flex:none}",
    "#screen-amour .item .txt .am-ico{margin-top:2px}",
    "#screen-amour .rsrc-opt.am-style strong{display:flex;align-items:flex-start;gap:8px;min-width:0}",
    "#screen-amour .am-style .muted{display:block}",
    "#screen-amour .am-rank-reset{width:100%;margin-top:4px;justify-content:center}",
    "#screen-amour button.chip{font:inherit;cursor:pointer;color:var(--ink)}",
    "#screen-amour button.chip[aria-pressed=true]{border-color:var(--accent);background:var(--accent-soft)}",
    "#screen-amour .am-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}",
    "#screen-amour .qnav{position:fixed;left:0;right:0;bottom:0;z-index:30;background:var(--bg);border-top:1px solid var(--line);flex-wrap:nowrap;justify-content:stretch;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px))}",
    "#screen-amour .am-nav-inner{max-width:700px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:8px}",
    "#screen-amour .am-nav-row{flex-wrap:nowrap;width:100%}",
    "#screen-amour .am-nav-row .btn{flex:1 1 0;justify-content:center;white-space:nowrap}",
    "#screen-amour .am-nav-row .btn:disabled{opacity:1;background:var(--bg);color:var(--muted);border:1px solid var(--line)}",
    "#screen-amour .am-petit{display:flex;flex-direction:column;gap:6px;margin:0 0 8px}",
    "#screen-amour .am-petit label{font-weight:700}",
    "#screen-amour .am-petit textarea{width:100%;min-height:72px}",
    "#screen-amour .am-petit-print{display:none}",
    "#screen-amour button.am-namebtn{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.14em}",
    "#screen-amour button.am-namebtn.am-pill{text-decoration:none}",
    "#screen-amour button.am-namebtn.am-pill{background:var(--bt);padding:6px 12px 6px 8px;margin:0 8px 8px 0}",
    "#screen-amour button.am-namebtn:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}",
    "#screen-amour .alloy .am-namebtn{font-weight:inherit;line-height:inherit}",
    "#screen-amour .alloy em .am-namebtn{font-weight:500}",
    "#screen-amour button.am-pill{font:inherit;border:0;cursor:pointer;text-align:left}",
    "#screen-amour .pr-bar-n .am-namebtn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;font-weight:700}",
    "#screen-amour .am-salle .salle-lab .am-namebtn{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;color:inherit;text-align:left}",
    "#screen-amour .am-fam-open{align-self:flex-start}",
    "#screen-amour dialog.am-fam{border:0;padding:0;margin:auto;max-width:700px;width:min(700px,calc(100vw - 24px));max-height:min(88vh,760px);border-radius:18px;background:var(--bg);color:var(--ink);box-shadow:0 18px 50px rgba(27,24,22,.22)}",
    "#screen-amour dialog.am-fam::backdrop{background:rgba(27,24,22,.45)}",
    "#screen-amour .am-fam-box{display:flex;flex-direction:column;max-height:min(88vh,760px)}",
    "#screen-amour .am-fam-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--line);background:var(--bg)}",
    "#screen-amour .am-fam-kicker{margin:0;font-weight:700}",
    "#screen-amour .am-fam-chips{display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px 0}",
    "#screen-amour .am-fam-body{overflow:auto;padding:4px 14px 18px;-webkit-overflow-scrolling:touch}",
    "#screen-amour .am-fam-card{display:flex;flex-direction:column;gap:8px}",
    "#screen-amour .am-fam-card h3{display:flex;align-items:center;gap:8px;margin:8px 0 0}",
    "#screen-amour .am-fam-card h4{margin:12px 0 4px}",
    "#screen-amour .am-pair{padding:8px 0;border-top:1px solid var(--line)}",
    "#screen-amour .am-pair h4{margin:0 0 4px;font-size:1rem}",
    "#screen-amour .am-fam-nu{margin:0;padding-left:1.1em}",
    "#screen-amour .am-fam-nu li{margin:4px 0}",
    "@media(max-width:420px){#screen-amour dialog.am-fam{width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0}#screen-amour .am-fam-box{max-height:100dvh;height:100dvh}}",
    "#screen-amour .rule .quote{color:var(--ink);font-size:1.15rem}",
    "#screen-amour .rule .btn{align-self:flex-start;margin-top:4px}",
    "@media(max-width:420px){#screen-amour .am-nav-row .btn{padding:12px 10px;font-size:.92rem}}",
    "#screen-amour{background:radial-gradient(880px 420px at 0% 0%, color-mix(in srgb, var(--am) 16%, transparent), transparent 62%), radial-gradient(640px 360px at 100% 0%, color-mix(in srgb, var(--am) 10%, transparent), transparent 58%);transition:background .45s ease}",
    "#screen-amour:not([data-tone]){background:radial-gradient(520px 280px at 6% 0%, color-mix(in srgb, var(--sage) 20%, transparent), transparent 70%), radial-gradient(480px 260px at 96% 2%, color-mix(in srgb, var(--pink) 16%, transparent), transparent 70%), radial-gradient(420px 220px at 70% 12%, color-mix(in srgb, var(--gold) 14%, transparent), transparent 72%)}",
    "#screen-amour .am-hero .eyebrow .am-ico{animation:am-float 2.8s ease-in-out infinite}",
    "@keyframes am-float{50%{transform:translateY(-3px)}}",
    "#screen-amour .am-benefit{animation:am-in .45s ease both}",
    "#screen-amour .am-benefit:nth-child(2){animation-delay:.05s}",
    "#screen-amour .am-benefit:nth-child(3){animation-delay:.1s}",
    "#screen-amour .am-benefit:nth-child(4){animation-delay:.15s}",
    "#screen-amour .qhead .eyebrow .am-ico{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;flex:none;background:var(--am-soft);color:var(--am)}",
    "#screen-amour .progress span.done[data-tone=sage],#screen-amour .progress span.is-now[data-tone=sage]{background:linear-gradient(90deg,#9ED9B8,var(--sage))}",
    "#screen-amour .progress span.done[data-tone=coral],#screen-amour .progress span.is-now[data-tone=coral]{background:linear-gradient(90deg,#F6C2B6,var(--coral))}",
    "#screen-amour .progress span.done[data-tone=pink],#screen-amour .progress span.is-now[data-tone=pink]{background:linear-gradient(90deg,#F7C2D6,var(--pink))}",
    "#screen-amour .progress span.done[data-tone=gold],#screen-amour .progress span.is-now[data-tone=gold]{background:linear-gradient(90deg,#F6E2A4,var(--gold))}",
    "#screen-amour .progress span.done[data-tone=sky],#screen-amour .progress span.is-now[data-tone=sky]{background:linear-gradient(90deg,#C5E4F8,var(--sky))}",
    "#screen-amour .progress span.done[data-tone=split],#screen-amour .progress span.is-now[data-tone=split]{background:linear-gradient(90deg,var(--sage),var(--coral))}",
    "#screen-amour .progress span.is-now{position:relative;overflow:visible;color:var(--am)}",
    "#screen-amour .progress span.is-now[data-tone=sage]{color:var(--sage)}",
    "#screen-amour .progress span.is-now[data-tone=coral]{color:var(--coral)}",
    "#screen-amour .progress span.is-now[data-tone=pink]{color:var(--pink)}",
    "#screen-amour .progress span.is-now[data-tone=gold]{color:var(--gold)}",
    "#screen-amour .progress span.is-now[data-tone=sky]{color:var(--sky)}",
    "#screen-amour .progress span.is-now[data-tone=split]{color:var(--coral)}",
    "#screen-amour .progress span.is-now::after{content:\"\";position:absolute;right:-8px;top:50%;width:16px;height:16px;transform:translateY(-50%);background:currentColor;z-index:2;pointer-events:none;-webkit-mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E\") center/contain no-repeat;mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E\") center/contain no-repeat;animation:am-spark 1.5s ease-in-out infinite}",
    "@keyframes am-spark{50%{transform:translateY(-50%) scale(1.18)}}",
    "#screen-amour .rsrc-opt{position:relative;border-radius:16px;padding-right:28px;transition:transform .16s ease, border-color .15s, background .15s, box-shadow .16s}",
    "#screen-amour label.rsrc-opt:active,#screen-amour button.rsrc-opt:active{transform:scale(.98)}",
    "#screen-amour .rsrc-opt.picked{box-shadow:0 8px 18px color-mix(in srgb, var(--am) 16%, transparent)}",
    "#screen-amour .rsrc-opt.am-just{animation:am-pick .34s ease}",
    "@keyframes am-pick{0%{transform:scale(.96)}55%{transform:scale(1.02)}100%{transform:scale(1)}}",
    "#screen-amour label.rsrc-opt.picked::after,#screen-amour button.rsrc-opt.am-style.picked::after,#screen-amour button.rsrc-opt.am-tap.picked::after{content:\"\";position:absolute;right:12px;top:16px;width:7px;height:12px;border:solid var(--am);border-width:0 2.5px 2.5px 0;transform:rotate(45deg);pointer-events:none}",
    "#screen-amour .rsrc-opt[data-item-tone=sage].picked::after{border-color:var(--sage)}",
    "#screen-amour .rsrc-opt[data-item-tone=coral].picked::after{border-color:var(--coral)}",
    "#screen-amour .rsrc-opt[data-item-tone=pink].picked::after{border-color:var(--pink)}",
    "#screen-amour .rsrc-opt[data-item-tone=gold].picked::after{border-color:var(--gold)}",
    "#screen-amour .rsrc-opt[data-item-tone=sky].picked::after{border-color:var(--sky)}",
    "#screen-amour .rsrc-opt.am-just.picked::after{animation:am-draw .28s ease}",
    "@keyframes am-draw{from{opacity:0;transform:rotate(45deg) scale(.4)}to{opacity:1;transform:rotate(45deg) scale(1)}}",
    "#screen-amour .am-hero-row{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:12px;row-gap:4px;align-items:center}",
    "#screen-amour .am-reveal{display:flex;justify-content:flex-start;margin:0;grid-column:1;grid-row:1 / span 2}",
    "#screen-amour .am-hero-row>.eyebrow{display:block;grid-column:2;grid-row:1;min-width:0}",
    "#screen-amour .am-hero-row>.alloy{grid-column:2;grid-row:2;margin:0;min-width:0}",
    "#screen-amour .am-badge{position:relative;width:116px;height:116px;border-radius:36px;display:grid;place-items:center;background:var(--bt);color:var(--bc);box-shadow:0 0 0 8px color-mix(in srgb, var(--bf) 22%, #fff), 0 16px 32px color-mix(in srgb, var(--bf) 28%, transparent);animation:am-badge .7s ease both}",
    "@keyframes am-badge{0%{transform:scale(.9);opacity:0}70%{transform:scale(1.03)}100%{transform:none;opacity:1}}",
    "#screen-amour .am-badge .am-ico svg{width:58px;height:58px}",
    "@media(max-width:479px){#screen-amour .am-badge{width:64px;height:64px;border-radius:20px;box-shadow:0 0 0 5px color-mix(in srgb, var(--bf) 22%, #fff), 0 10px 20px color-mix(in srgb, var(--bf) 28%, transparent)}#screen-amour .am-badge .am-ico svg{width:32px;height:32px}#screen-amour .am-reveal{grid-row:2}#screen-amour .am-hero-row>.eyebrow{grid-column:1 / -1;grid-row:1;letter-spacing:.02em}#screen-amour .am-hero-row>.alloy{font-size:clamp(1.95rem,8.8vw,2.15rem)}}",
    "#screen-amour .am-burst{position:absolute;inset:0;pointer-events:none}",
    "#screen-amour .am-bit{position:absolute;left:50%;top:50%;color:var(--bf);opacity:0;animation:am-bit 1.05s ease forwards}",
    "#screen-amour .am-bit .am-ico svg{width:14px;height:14px}",
    "#screen-amour .am-bit:nth-child(1){--dx:-46px;--dy:-28px}",
    "#screen-amour .am-bit:nth-child(2){--dx:40px;--dy:-34px;animation-delay:.04s}",
    "#screen-amour .am-bit:nth-child(3){--dx:-52px;--dy:10px;animation-delay:.08s}",
    "#screen-amour .am-bit:nth-child(4){--dx:48px;--dy:6px;animation-delay:.02s}",
    "#screen-amour .am-bit:nth-child(5){--dx:-18px;--dy:-48px;animation-delay:.06s}",
    "#screen-amour .am-bit:nth-child(6){--dx:12px;--dy:42px;animation-delay:.1s}",
    "#screen-amour .am-bit:nth-child(7){--dx:28px;--dy:-8px;animation-delay:.05s}",
    "@keyframes am-bit{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}30%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1)}}",
    "#screen-amour .rs{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:16px 16px 18px;box-shadow:0 8px 22px rgba(43,37,34,.04)}",
    "#screen-amour .pr-sec{border-color:color-mix(in srgb, var(--bf) 42%, var(--line));border-top:4px solid var(--bf);background:linear-gradient(180deg, color-mix(in srgb, var(--bt) 78%, var(--surface)), var(--surface) 46%)}",
    "#screen-amour .am-sec-head{display:flex;flex-direction:row;align-items:center;gap:10px;padding:0}",
    "#screen-amour .am-sec-head .snum{flex:none}",
    "#screen-amour .am-sec-head h2{margin:0;flex:1;min-width:0}",
    "#screen-amour .pr-sec .snum{display:inline-flex;align-items:center;gap:6px;width:fit-content;margin:0;padding:4px 10px 4px 6px;border-radius:999px;background:var(--bt);color:var(--bc)}",
    "#screen-amour .am-talent{position:relative;border:1px solid color-mix(in srgb, var(--bf) 48%, var(--line));border-radius:22px;background:radial-gradient(280px 120px at 100% 0%, color-mix(in srgb, var(--bf) 20%, transparent), transparent 70%), linear-gradient(180deg, var(--bt), var(--surface) 62%);box-shadow:0 14px 30px color-mix(in srgb, var(--bf) 16%, transparent);padding:18px 16px 20px}",
    "#screen-amour .am-talent-head{display:flex;flex-direction:row;align-items:flex-start;gap:12px}",
    "#screen-amour .am-talent-head h2{margin:0;flex:1;min-width:0}",
    "#screen-amour .am-talent-mark{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;flex:none;background:var(--bf);color:#fff;margin:0}",
    "#screen-amour .am-talent-mark .am-ico{color:#fff}",
    "#screen-amour .am-talent-mark .am-ico svg{width:30px;height:30px}",
    "#screen-amour .am-cta{background:radial-gradient(420px 180px at 100% 0%, color-mix(in srgb, var(--pink) 18%, transparent), transparent 70%), linear-gradient(165deg, #fffaf6, var(--surface));border:1px solid color-mix(in srgb, #C4501F 32%, var(--line));box-shadow:0 16px 36px rgba(196,80,31,.12)}",
    "#screen-amour .am-cta .eyebrow{color:#C4501F}",
    "#screen-amour .am-fam-card{border:1px solid color-mix(in srgb, var(--bf) 36%, var(--line));border-radius:20px;overflow:hidden;background:var(--surface);gap:0;animation:am-in .36s ease}",
    "#screen-amour .am-fam-band{display:flex;align-items:center;gap:12px;padding:16px;background:linear-gradient(135deg, var(--bt), color-mix(in srgb, var(--bf) 18%, var(--bt)));border-bottom:4px solid var(--bf);color:var(--bc)}",
    "#screen-amour .am-fam-band h3{margin:0;flex:1;min-width:0}",
    "#screen-amour .am-fam-mark{width:72px;height:72px;border-radius:22px;flex:none;display:grid;place-items:center;background:var(--bf);color:#fff;box-shadow:0 8px 16px color-mix(in srgb, var(--bf) 28%, transparent)}",
    "#screen-amour .am-fam-mark .am-ico{color:#fff}",
    "#screen-amour .am-fam-mark .am-ico svg{width:40px;height:40px}",
    "#screen-amour .am-fam-pad{display:flex;flex-direction:column;gap:10px;padding:14px 14px 16px}",
    "#screen-amour .am-fact{display:flex;gap:10px;align-items:flex-start;margin:0}",
    "#screen-amour .am-fact > span:last-child{flex:1;min-width:0}",
    "#screen-amour .am-fact-ico{flex:none;width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:var(--bt);color:var(--bc)}",
    "#screen-amour .am-fact-ico .am-ico svg{width:18px;height:18px}",
    "#screen-amour .am-fam-nu{display:flex;flex-direction:column;gap:8px;list-style:none;margin:0;padding:0}",
    "#screen-amour .am-fam-nu li{margin:0;padding:8px 12px;border-radius:16px;background:color-mix(in srgb, var(--bt) 75%, var(--surface));border:1px solid color-mix(in srgb, var(--bf) 28%, var(--line))}",
    "#screen-amour .am-pair{border:1px solid var(--line);border-radius:16px;padding:12px;margin:8px 0 0;background:var(--surface)}",
    "#screen-amour .am-pair.am-coule{border-color:color-mix(in srgb, #146B3A 34%, var(--line));background:linear-gradient(180deg, #F4FBF6, var(--surface) 46%)}",
    "#screen-amour .am-pair.am-attention{border-color:color-mix(in srgb, #8A5A00 34%, var(--line));background:linear-gradient(180deg, #FFF9EC, var(--surface) 46%)}",
    "#screen-amour .am-pair-top{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;column-gap:10px;row-gap:6px;padding:0}",
    "#screen-amour .am-pair h4{margin:0;font-size:1rem;min-width:0;grid-column:2;grid-row:1}",
    "#screen-amour .am-pair h4 .am-namebtn{white-space:normal;text-align:left}",
    "#screen-amour .am-duo{display:inline-flex;align-items:center;gap:2px;grid-column:1;grid-row:1;flex:none}",
    "#screen-amour .am-duo-b{display:inline-flex;color:var(--bc);flex:none}",
    "#screen-amour .am-tag{margin:0;justify-self:start;grid-column:2;grid-row:2;font-size:.75rem;font-weight:700;line-height:1.3;padding:4px 8px;border-radius:999px}",
    "@media(min-width:720px){#screen-amour .am-pair-top{grid-template-columns:auto minmax(0,1fr) auto}#screen-amour .am-tag{grid-column:3;grid-row:1;justify-self:end}}",
    "#screen-amour .am-tag-coule{background:#E5F6EB;color:#146B3A}",
    "#screen-amour .am-tag-attention{background:#FFF3CC;color:#8A5A00}",
    "#screen-amour .am-fam-chips .chip{display:inline-flex;align-items:center;gap:8px;border-color:var(--bf);color:var(--bc)}",
    "#screen-amour .am-fam-chips .chip[aria-pressed=true]{background:var(--bt);border-color:var(--bf);color:var(--bc)}",
    "#screen-amour .am-salle .salle-lab{display:flex;align-items:center;gap:10px;color:var(--bc)}",
    "#screen-amour .am-salle .salle-lab .am-namebtn{flex:1;min-width:0}",
    "#screen-amour .am-salle .salle-row{grid-template-columns:minmax(0,132px) 1fr auto}",
    "@media(prefers-reduced-motion:reduce){#screen-amour .am-in,#screen-amour .am-rank-item,#screen-amour .am-benefit,#screen-amour .am-hero .eyebrow .am-ico,#screen-amour .am-badge,#screen-amour .am-just,#screen-amour .rsrc-opt,#screen-amour .pr-track i,#screen-amour .am-fam-card,#screen-amour .progress span.is-now::after{animation:none!important;transition:none!important}#screen-amour .am-pop,#screen-amour .am-burst{display:none}#screen-amour .pr-track i{width:var(--w,0%)}}",
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
    "#screen-amour .am-petit{display:none!important}",
    "#screen-amour .am-petit.is-filled{display:block!important}",
    "#screen-amour .am-petit.is-filled textarea,#screen-amour .am-petit.is-filled .muted{display:none!important}",
    "#screen-amour .am-petit.is-filled label{display:block!important;font-weight:700}",
    "#screen-amour .am-petit.is-filled .am-petit-print{display:block!important}",
    "#screen-amour .quote{font-size:11.5pt}",
    "#screen-amour .pr-hide,#screen-amour .toc,#screen-amour .pr-bars,#screen-amour details{display:none!important}",
    "#screen-amour details.am-fold{display:block!important}",
    "#screen-amour details.am-fold > summary{display:block!important}",
    "#screen-amour details.am-fold > .am-fold-body{display:block!important}",
    "#screen-amour details.am-fold > summary .rs::after{content:none!important}",
    "#screen-amour dialog.am-fam{display:none!important}",
    "#screen-amour .pr-cols,#screen-amour .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
    "#screen-amour .fond li:nth-child(n+3){display:none}",
    "#screen-amour .am-pill{padding:3px 10px 3px 6px}",
    "#screen-amour .pr-say li{font-size:9.5pt}",
    "#screen-amour .pr-exit .k{color:#fff}",
    "#screen-amour .rs h2{font-size:13.5pt;margin:0 0 4px}",
    "#screen-amour .am-talent-head h2,#screen-amour .am-sec-head h2{margin:0}",
    "#screen-amour .am-hero-row{align-items:center;gap:10px}",
    "#screen-amour .am-pair-top{grid-template-columns:auto minmax(0,1fr) auto;column-gap:8px}",
    "#screen-amour .am-tag{grid-column:3;grid-row:1;justify-self:end}",
    "#screen-amour .am-burst,#screen-amour .am-bit{display:none!important}",
    "#screen-amour .am-badge{animation:none!important;box-shadow:none;background:var(--bt)!important;color:var(--bc)!important}",
    "#screen-amour .am-talent{background:#fff!important;box-shadow:none}",
    "#screen-amour .am-cta{background:#fff!important;box-shadow:none}",
    "#screen-amour .rs{box-shadow:none;background:#fff}",
    "#screen-amour .pr-sec{background:#fff!important;border-top:3px solid var(--bf)}",
    "#screen-amour .am-fam-card{animation:none!important;display:block;overflow:visible;break-inside:auto}",
    "#screen-amour .am-fam-pad{display:block}",
    "#screen-amour .am-fam-band{background:var(--bt)!important;color:var(--bc)!important;break-inside:avoid;break-after:avoid}",
    "#screen-amour .am-fact,#screen-amour .am-fam-nu li,#screen-amour .am-pair{break-inside:avoid}",
    "#screen-amour .am-fam-pad>h4,#screen-amour details.am-fold>summary,#screen-amour .am-sec-head,#screen-amour .rs>h2,#screen-amour .am-talent-head{break-inside:avoid;break-after:avoid}",
    "#screen-amour #sec-now{break-inside:avoid}",
    "#screen-amour .pr-track i{animation:none!important;width:var(--w,0%)}",
    "#screen-amour .progress span.is-now::after{display:none!important}",
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
  if (footer) footer.textContent = E.salleSession(location.search || "") ? U.footerSalle : U.footer;
  document.title = U.pageTitle + " | Magic Humans";
  document.documentElement.lang = "fr";

  let prenom = "";
  let qi = 0;
  let phase = "ask";
  let groupStep = 0;
  let answers = {};
  let lastPrefix = "";
  let petitPas = "";
  let held = null;
  let focusSel = "";
  let pendingLive = "";
  let armed = true;
  let view = "intro";
  let resultProfile = null;
  let resumeNote = false;
  let stickyOff = false;
  let composing = false;
  let salleTimer = null;
  let sallePosting = false;
  let runId = 1;
  let justPick = "";
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
      petitPas: petitPas,
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
    hearts: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" transform="translate(-0.4 -1.2) scale(0.58)" vector-effect="non-scaling-stroke"/><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" transform="translate(9.2 6.6) scale(0.58)" vector-effect="non-scaling-stroke"/>',
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
  const SCREEN_TONE = { ressource: "gold", langages: "pink", ennea: "gold", valeurs: "sky", instinct: "pink", stress: "coral", freins: "sky" };
  const SCREEN_ICON = { nourrit: "leaf", ressource: "sun", langages: "message", ennea: "compass", valeurs: "gem", instinct: "flame", stress: "zap", freins: "anchor" };
  const GROUP_TONE = { nourrit: "sage", vide: "coral", modere: "gold", fort: "coral" };
  const ITEM_TONE = { sp: "sage", so: "sky", sx: "pink" };
  const CARD_ICON = {
    nourrit: { ecoute: "message", rire: "smile", fiable: "shield", espace: "compass", tendresse: "heart", admiration: "star", projets: "home", aventure: "spark", calme: "leaf", profondeur: "eye", rituels: "coffee", soutien: "hand", desir: "flame", partage: "users", justifier: "help", critiques: "pen", silences: "moon", cris: "zap", flou: "cloud", charge: "battery", ecrans: "phone", jalousie: "eye", routine: "repeat", promesses: "flag", fusion: "users", indifference: "userx" },
    ennea: { t1: "search", t2: "heart", t3: "star", t4: "flame", t5: "compass", t6: "shield", t7: "sun", t8: "zap", t9: "leaf" },
    valeurs: { honnetete: "message", fidelite: "heart", respect: "hand", famille: "home", enfants: "users", sans_enfants: "user", liberte: "compass", ambition: "star", simplicite: "leaf", aventure: "spark", humour: "smile", culture: "gem", sante: "pulse", solidarite: "hand", creativite: "pen" },
    ressource: { seul: "user", raconter: "message", bouger: "pulse", mains: "hand", evader: "moon", monde: "pin", tendresse: "heart", douceur: "coffee", rien: "moon", moi: "user", nature: "tree", sport: "pulse", adeux: "users", proches: "users", sortir: "pin", decouvrir: "compass", projet: "pen" },
    langages: { paroles: "message", moments: "clock", cadeaux: "gift", services: "hand", toucher: "heart" },
    instinct: { sp: "home", so: "users", sx: "flame" },
    stress: { D: "arrow", I: "smile", S: "shield", C: "search", fight: "swords", flight: "arrow", freeze: "snow", fawn: "heart" },
    freins: { rejet: "userx", blesser: "heart", moment: "clock", espoir: "spark", habitude: "repeat", seul: "user", flou: "help", regard: "eye", contraintes: "box", energie: "battery", parfait: "star", passe: "history" }
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
  function rankStep(s) {
    return !!(s && s.rank && (s.rank.mode === "step" || s.rank.mode === "tap"));
  }
  function subProgress(s) {
    if (s.type === "commit" && s.groups && s.groups.length) {
      return { parts: 2, index: groupStep > 0 ? 1 : 0 };
    }
    const split = !!(s.splitGroups && s.groups && s.groups.length > 1);
    const ranked = rankStep(s);
    const base = split ? s.groups.length : 1;
    const parts = base + (ranked ? 1 : 0);
    let index = 0;
    if (ranked && phase === "rank") index = parts - 1;
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
          bag.other[g.id] = g.other && !g.other.multi ? [""] : [];
          bag.order[g.id] = [];
        });
        answers[s.id] = bag;
      } else if (s.type === "rank") answers[s.id] = { order: [] };
      else {
        const bag = { engagement: "", who: "", moment: null, safety: null, time: null, picked: {}, other: {}, order: {} };
        (s.groups || []).forEach(function (g) {
          bag.picked[g.id] = [];
          bag.other[g.id] = g.other && !g.other.multi ? [""] : [];
          bag.order[g.id] = [];
        });
        answers[s.id] = bag;
      }
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

  function groupGap(s, g) {
    const x = chosenIds(s, g).length;
    const under = Math.max(0, (g.min || 0) - x);
    const over = g.max ? Math.max(0, x - g.max) : 0;
    return under + over;
  }
  function tapState(s) {
    const gid = s.rank.groups[0];
    const g = s.groups.find(function (x) { return x.id === gid; });
    const ch = chosenIds(s, g);
    const top = s.rank.top || 3;
    const head = [];
    (ensure(s).order[gid] || []).forEach(function (id) {
      if (ch.indexOf(id) !== -1 && head.indexOf(id) === -1 && head.length < top) head.push(id);
    });
    return { gid: gid, g: g, ch: ch, top: top, head: head, need: Math.min(top, ch.length) };
  }
  function deficit(s) {
    if (s.type === "pick" && !(rankStep(s) && phase === "rank")) {
      return activeGroups(s).reduce(function (sum, g) { return sum + groupGap(s, g); }, 0);
    }
    if (s.type === "rank" || (s.rank && phase === "rank")) {
      if (s.type === "rank") return Math.max(0, s.minRanked - ensure(s).order.length);
      if (s.rank.mode === "tap") {
        const t = tapState(s);
        return Math.max(0, t.need - t.head.length);
      }
      return 0;
    }
    if (s.type === "commit") {
      if (s.groups && groupStep === 0) {
        return activeGroups(s).reduce(function (sum, g) { return sum + Math.max(0, g.min - chosenIds(s, g).length); }, 0);
      }
      return ensure(s).moment ? 0 : 1;
    }
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

  function counterText(label, x, min, ok, max) {
    const base = max
      ? fill(Q.counterMax, { label: label || "Choix", x: x, max: max, min: min })
      : (label ? fill(Q.counter, { label: label, x: x, min: min }) : fill(Q.counterBare, { x: x, min: min }));
    return base + (ok ? " " + Q.counterOk : "");
  }

  function counterSpan(text, tone) {
    return "<span" + (tone ? ' data-ico-tone="' + tone + '"' : "") + "><b>" + esc(text) + "</b></span>";
  }

  function countersHtml(s, pop) {
    const bits = [];
    if ((s.type === "pick" && phase !== "rank") || (s.type === "commit" && s.groups && groupStep === 0)) {
      activeGroups(s).forEach(function (g) {
        if (!g.min) return;
        const x = chosenIds(s, g).length;
        const ok = x >= g.min && (!g.max || x <= g.max);
        const tone = GROUP_TONE[g.id] || "";
        bits.push(counterSpan(counterText(g.counter, x, g.min, ok, g.max), tone));
      });
    } else if (s.type === "rank") {
      const x = ensure(s).order.length;
      const ok = x >= s.minRanked;
      const text = s.cardRank
        ? fill(Q.rankOrder, { x: x, n: s.items.length })
        : fill(Q.rankCounter, { x: x, min: s.minRanked });
      bits.push(counterSpan(text + (ok ? " " + Q.counterOk : ""), ""));
    } else if (s.type === "commit") {
      const bag = ensure(s);
      const wrote = String(bag.engagement || "").trim().length >= (s.engagement.minLength || 5);
      const both = wrote && !!bag.moment;
      bits.push(counterSpan(Q.engagementCounter + (both ? " " + Q.counterOk : ""), ""));
    } else if (s.rank && s.rank.mode === "tap" && phase === "rank") {
      const t = tapState(s);
      const ok = t.head.length >= t.need;
      bits.push(counterSpan(fill(Q.topCounter, { x: t.head.length, n: t.need }) + (ok ? " " + Q.counterOk : ""), ""));
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
      '<div class="txt"><span class="snum">' + (index + 1) + "</span>" + (mark ? ico(mark, tone) : "") + '<span class="am-lab">' + esc(label) + "</span></div>" +
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
        const fresh = justPick === g.id + ":" + it.id;
        if (fresh) justPick = "";
        html += '<label class="rsrc-opt' + (on ? " picked" : "") + (fresh ? " am-just" : "") + (mark ? " has-ico" : "") + '"' + (tone ? ' data-item-tone="' + tone + '"' : "") + '><input class="am-sr" type="checkbox" data-act="check" data-group="' + esc(g.id) + '" data-id="' + esc(it.id) + '"' + (on ? " checked" : "") + ">" + (mark ? ico(mark, tone) : "") + "<strong>" + esc(it.label) + "</strong>" +
          (it.hint ? '<span class="muted">' + esc(it.hint) + "</span>" : "") + "</label>";
      });
      if (g.other && g.other.multi) {
        (bag.other[g.id] || []).slice(0, g.other.max || 5).forEach(function (val, i) {
          const on = String(val || "").trim().length > 0;
          html += '<div class="rsrc-opt am-custom' + (on ? " picked" : "") + '"><div class="field"><input id="am-other-' + esc(g.id) + "-" + i + '" data-act="other" data-group="' + esc(g.id) + '" data-index="' + i + '" maxlength="' + g.other.maxLength + '" placeholder="' + esc(g.other.placeholder || "") + '" value="' + esc(val || "") + '"></div>' +
            '<button type="button" class="btn ghost small" data-act="remove-other" data-group="' + esc(g.id) + '" data-index="' + i + '" aria-label="' + esc(Q.removeLine) + '">' + esc(Q.removeLine) + "</button></div>";
        });
      } else if (g.other) {
        const shown = Math.max(1, (bag.other[g.id] || []).length);
        const max = g.other.max || 1;
        for (let i = 0; i < Math.min(shown, max); i++) {
          const val = (bag.other[g.id] || [])[i] || "";
          const on = val.trim().length > 0;
          html += '<div class="rsrc-opt' + (on ? " picked" : "") + '"><strong>' + esc(g.other.label) + '</strong><div class="field"><input id="am-other-' + esc(g.id) + "-" + i + '" data-act="other" data-group="' + esc(g.id) + '" data-index="' + i + '" maxlength="' + g.other.maxLength + '" placeholder="' + esc(g.other.placeholder || "") + '" value="' + esc(val) + '"></div></div>';
        }
      }
      html += "</div>";
      if (g.other && (g.other.max || 1) > 1 && (bag.other[g.id] || []).length < (g.other.max || 1)) {
        html += '<button type="button" class="btn ghost am-add" data-act="add-other" data-group="' + esc(g.id) + '">' + esc(g.other.addLabel || Q.addOther) + "</button>";
      }
      return html + "</section>";
    }).join("");
  }

  function tapPhaseHtml(s) {
    const t = tapState(s);
    const rest = t.ch.filter(function (id) { return t.head.indexOf(id) === -1; });
    let html = '<div class="items">';
    t.head.forEach(function (id, i) {
      const fresh = justPick === "tap:" + id;
      if (fresh) justPick = "";
      html += '<button type="button" class="rsrc-opt am-tap picked' + (fresh ? " am-just" : "") + '" data-act="tap-top" data-group="' + esc(t.gid) + '" data-id="' + esc(id) + '" aria-pressed="true"><span class="snum">' + (i + 1) + "</span><strong>" + esc(labelFor(s, t.gid, id)) + "</strong></button>";
    });
    rest.forEach(function (id) {
      html += '<button type="button" class="rsrc-opt am-tap" data-act="tap-top" data-group="' + esc(t.gid) + '" data-id="' + esc(id) + '" aria-pressed="false"><strong>' + esc(labelFor(s, t.gid, id)) + "</strong></button>";
    });
    return html + "</div>";
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

  function cardRankHtml(s) {
    const order = ensure(s).order;
    let steps = '<div class="am-steps" aria-hidden="true">';
    for (let i = 0; i < s.items.length; i++) {
      const on = i < order.length;
      const next = i === order.length;
      steps += '<span class="' + (on ? "is-on" : "") + (next ? " is-next" : "") + '">' + (i + 1) + "</span>";
    }
    steps += "</div>";
    let html = steps + '<div class="items am-style-list">';
    s.items.forEach(function (it) {
      const pos = order.indexOf(it.id);
      const on = pos !== -1;
      const mark = cardIcon(s.id, it.id);
      const tone = ITEM_TONE[it.id] || "";
      const fresh = justPick === "rank:" + it.id;
      if (fresh) justPick = "";
      html += '<button type="button" class="rsrc-opt am-style' + (on ? " picked" : "") + (fresh ? " am-just" : "") + '" data-act="rank-card" data-id="' + esc(it.id) + '" aria-pressed="' + (on ? "true" : "false") + '"' + (tone ? ' data-item-tone="' + tone + '"' : "") + ">" +
        '<span class="snum">' + (on ? String(pos + 1) : "") + "</span>" +
        '<span class="am-style-copy"><strong>' + (mark ? ico(mark, tone) : "") + '<span class="am-lab">' + esc(it.label) + "</span></strong>" +
        (it.hint ? '<span class="muted">' + esc(it.hint) + "</span>" : "") +
        "</span></button>";
    });
    html += "</div>";
    html += '<button type="button" class="btn ghost am-rank-reset" data-act="rank-reset"' + (order.length ? "" : " disabled") + ">" + esc(Q.rankReset) + "</button>";
    return html;
  }

  function directRankHtml(s) {
    if (s.cardRank) return cardRankHtml(s);
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
    const subNow = subProgress(s);
    let progressLabel = fill(Q.progress, { i: s.n, n: n });
    if (subNow.parts > 1) progressLabel += " · " + (subNow.index + 1) + "/" + subNow.parts;
    const suffix = s.rank && phase === "rank" ? (s.rank.mode === "tap" ? Q.topSuffix : (s.rank.mode === "step" ? Q.rankSuffix : "")) : "";
    const skipBtn = s.optional && phase !== "rank" ? '<button type="button" class="btn ghost" data-act="skip">' + esc(Q.skip) + "</button>" : "";
    const pop = !scroll && ok && armed;
    armed = !ok;
    root.dataset.tone = currentTone(s);
    root.classList.remove("has-sticky");
    root.innerHTML =
      resumeHtml() +
      '<div class="am-stage' + (scroll ? " am-in" : "") + '">' +
      '<div class="progress" aria-hidden="true">' + segs + "</div>" +
      '<div class="qhead"><span class="eyebrow">' + ico(questionIcon(s)) + "<span>" + esc(progressLabel + " · " + s.eyebrow + suffix) + "</span></span>" +
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
      skipBtn +
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
    stopSalle();
    const I = U.intro;
    const introTones = ["sage", "gold", "pink", "coral"];
    const introIcons = ["heart", "sun", "hearts", "spark"];
    view = "intro";
    armed = true;
    delete root.dataset.tone;
    root.classList.remove("has-sticky");
    root.innerHTML =
      resumeHtml() +
      '<div class="hero am-hero"><span class="eyebrow">' + ico("heart") + "<span>" + esc(I.eyebrow) + "</span></span><h1>" + I.h1 + '</h1><p class="lead">' + esc(I.lead) + "</p></div>" +
      '<div class="stack-lg" style="padding-top:18px"><div class="howto"><div class="rules">' +
      I.bullets.map(function (b, i) {
        const tone = introTones[i] || "pink";
        return '<div class="rule am-benefit" data-tone="' + tone + '"><span class="k">' + ico(introIcons[i] || "heart", tone) + "</span><strong>" + esc(b) + "</strong></div>";
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
    stopSalle();
    view = "question";
    const s = screenAt(qi);
    ensure(s);
    if (s.type === "pick" && rankStep(s) && phase === "rank") {
      if (s.rank.mode === "tap") shell(s, s.rank.title, s.rank.help || "", tapPhaseHtml(s), Q.next, scroll);
      else shell(s, s.rank.title, Q.rankHelp, rankPhaseHtml(s), Q.next, scroll);
      return;
    }
    if (s.type === "rank") {
      shell(s, s.title, s.help || Q.rankTapHelp, directRankHtml(s), Q.next, scroll);
      return;
    }
    if (s.type === "commit") {
      if (s.groups && groupStep === 0) {
        const g0 = s.groups[0];
        shell(s, g0.stepTitle || s.title, g0.help || "", pickHtml(s) + demainExtra(s), Q.next, scroll);
        return;
      }
      shell(s, s.title, s.help, commitHtml(s), Q.finish, scroll);
      return;
    }
    const onSplit = s.splitGroups && groupStep < s.groups.length - 1;
    const button = onSplit ? Q.next : (rankStep(s) && phase !== "rank" ? s.rank.cta : (qi === D.screens.length - 1 ? Q.finish : Q.next));
    const g = s.splitGroups ? activeGroups(s)[0] : null;
    const title = g && g.stepTitle ? g.stepTitle : s.title;
    let body = pickHtml(s);
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
    const lead = pierreLine ? "<p>" + esc(pierreLine) + "</p>" : "";
    return '<section class="rs am-cta"><span class="eyebrow">' + ico("spark") + "<span>" + esc(R.ctaEyebrow) + "</span></span><h2>" + esc(R.ctaH) + "</h2>" + lead + "<p>" + esc(R.ctaP) + '</p><a class="btn" data-cta-place="quiz_amour_' + place + '" href="' + esc(calendlyHref(place)) + '" target="_blank" rel="noopener noreferrer">' + esc(R.ctaBtn) + '</a><p class="muted">' + esc(R.ctaSign) + "</p></section>";
  }
  function stickyBar() {
    if (stickyOff) return "";
    return '<div class="am-sticky" id="am-sticky"><a class="btn small" data-cta-place="quiz_amour_resultat-sticky" href="' + esc(calendlyHref("resultat-sticky")) + '" target="_blank" rel="noopener noreferrer">' + esc(R.stickyCta) + '</a><button type="button" class="btn ghost small" data-act="dismiss-sticky" aria-label="' + esc(R.stickyClose) + '">×</button></div>';
  }
  function brakeTitle(id, asShort) {
    if (String(id).indexOf("autre:") === 0) return E.answerLabel(answers, D, "freins", "freins", id);
    if (asShort) return D.brakes[id] ? D.brakes[id].short : "";
    const g = D.screens.find(function (s) { return s.id === "freins"; }).groups[0];
    const it = g.items.find(function (item) { return item.id === id; });
    return it ? it.label : "";
  }

  function familyNameBtn(id, label) {
    return '<button type="button" class="am-namebtn" data-act="family" data-id="' + esc(id) + '">' + esc(label) + "</button>";
  }

  function familyPairsHtml(list, enc, kind, selfIcon) {
    const tag = kind === "attention" ? enc.attentionLab : enc.couleLab;
    return list.map(function (pair) {
      const other = D.profil.besoins[pair.id];
      const who = familyNameBtn(pair.id, pair.noun) + (pair.same ? " <small>" + esc(enc.sameLab) + "</small>" : "");
      return '<article class="am-pair am-' + kind + '"><div class="am-pair-top"><span class="am-duo">' + profilSvg(selfIcon) + '<span class="am-duo-b" style="' + needStyle(pair.id) + '">' + profilSvg(other.icon) + '</span></span><h4>' + who + '</h4><span class="am-tag am-tag-' + kind + '">' + esc(tag) + "</span></div><p>" + esc(pair.text) + "</p><p><strong>" + esc(enc.tipLab) + ".</strong> " + esc(pair.tip) + "</p></article>";
    }).join("");
  }

  function familyCardInner(id, anchor) {
    const enc = D.profil.encyclo;
    const guide = E.familyGuide(D, id);
    if (!guide) return "";
    const nuances = '<ul class="am-fam-nu">' + guide.nuances.map(function (row) {
      return "<li>" + esc(row.line) + "</li>";
    }).join("") + "</ul>";
    return '<div class="am-fam-card"' + (anchor ? ' id="fam-' + esc(id) + '"' : "") + ' style="' + needStyle(id) + '">' +
      '<header class="am-fam-band"><span class="am-fam-mark">' + profilSvg(guide.icon) + "</span><h3><span>" + esc(guide.noun + " · " + guide.name) + "</span></h3></header>" +
      '<div class="am-fam-pad"><p>' + esc(guide.portrait) + "</p>" +
      '<p class="am-fact"><span class="am-fact-ico">' + ico("heart") + "</span><span><strong>" + esc(enc.nourritLab) + ".</strong> " + esc(guide.nourrit) + "</span></p>" +
      '<p class="am-fact"><span class="am-fact-ico">' + ico("cloud") + "</span><span><strong>" + esc(enc.videLab) + ".</strong> " + esc(guide.vide) + "</span></p>" +
      "<h4>" + esc(enc.nuancesLab) + "</h4>" + nuances +
      "<h4>" + esc(enc.couleLab) + "</h4>" + familyPairsHtml(guide.coule, enc, "coule", guide.icon) +
      "<h4>" + esc(enc.attentionLab) + "</h4>" + familyPairsHtml(guide.attention, enc, "attention", guide.icon) +
      "</div></div>";
  }

  function familyFold(domId) {
    const enc = D.profil.encyclo;
    const guide = E.familyGuide(D, domId);
    const title = guide ? guide.noun + " · " + guide.name : enc.openAll;
    return '<details class="am-fold" id="sec-familles"><summary><h2>' + esc(title) + "</h2></summary><div class=\"am-fold-body\">" + familyCardInner(domId, true) + "</div></details>";
  }

  function familyDialog() {
    const enc = D.profil.encyclo;
    const chips = D.profil.order.map(function (id) {
      const b = D.profil.besoins[id];
      return '<button type="button" class="chip" data-act="family" data-id="' + esc(id) + '" aria-pressed="false" style="' + needStyle(id) + '">' + profilSvg(b.icon) + esc(b.noun) + "</button>";
    }).join("");
    return '<dialog id="am-fam-dialog" class="am-fam"><div class="am-fam-box"><div class="am-fam-head"><p class="am-fam-kicker" id="am-fam-kicker">' + esc(enc.openAll) + '</p><button type="button" class="btn ghost small" data-act="family-close">' + esc(enc.close) + "</button></div>" +
      '<div class="am-fam-chips" role="group" aria-label="' + esc(enc.openAll) + '">' + chips + '</div><div class="am-fam-body" id="am-fam-body"></div></div></dialog>';
  }

  function renderFamily(id) {
    const body = document.getElementById("am-fam-body");
    const dlg = document.getElementById("am-fam-dialog");
    if (!body || !dlg) return;
    const guide = E.familyGuide(D, id);
    if (!guide) return;
    body.innerHTML = familyCardInner(id);
    const title = body.querySelector("h3");
    if (title) {
      title.id = "am-fam-title";
      dlg.setAttribute("aria-labelledby", "am-fam-title");
    }
    dlg.querySelectorAll(".am-fam-chips [data-act=family]").forEach(function (chip) {
      const on = chip.getAttribute("data-id") === id;
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
    body.scrollTop = 0;
  }

  let familyOpener = null;

  function openFamily(id, opener) {
    const dlg = document.getElementById("am-fam-dialog");
    if (!dlg || !E.familyGuide(D, id)) return;
    familyOpener = opener || document.activeElement;
    renderFamily(id);
    if (typeof dlg.showModal === "function") {
      if (!dlg.open) dlg.showModal();
      const closeBtn = dlg.querySelector("[data-act=family-close]");
      if (closeBtn) closeBtn.focus();
      return;
    }
    const fold = document.getElementById("sec-familles");
    if (fold) fold.open = true;
    const card = document.getElementById("fam-" + id);
    if (card && card.scrollIntoView) card.scrollIntoView({ block: "start" });
  }

  function profilReport(profile, pierreLine) {
    const pr = profile.profil;
    const U = D.profil.ui;
    const B = D.profil.besoins;
    const enc = D.profil.encyclo;
    const dom = B[pr.dom];
    const sec = B[pr.sec];
    const headStyle = "--sc:" + sec.ink + ";--sc-dark:" + sec.dark + ";--dom-tint:" + dom.tint + ";--sec-tint:" + sec.tint + ";--dom-color:" + dom.color + ";--sec-color:" + sec.color;
    const pills =
      '<div class="am-pills"><button type="button" class="am-pill am-namebtn" data-act="family" data-id="' + esc(pr.dom) + '" style="' + needStyle(pr.dom) + '">' + profilSvg(dom.icon) + "<span><small>Dominante</small>" + esc(dom.name) + "</span></button>" +
      '<button type="button" class="am-pill am-namebtn" data-act="family" data-id="' + esc(pr.sec) + '" style="' + needStyle(pr.sec) + '">' + profilSvg(sec.icon) + "<span><small>Secondaire</small>" + esc(sec.name) + "</span></button></div>";
    const bars = pr.bars.map(function (bar) {
      const b = B[bar.id];
      return '<div class="pr-bar" style="' + needStyle(bar.id) + '"><span class="pr-bar-n">' + profilSvg(b.icon) + familyNameBtn(bar.id, b.name) + '</span><span class="pr-track"><i style="--w:' + bar.pct + '%"></i></span><span class="pr-score">' + esc(String(Math.round(bar.score))) + "</span></div>";
    }).join("");
    const why = '<details class="pr-hide"><summary>' + esc(U.whyLab) + "</summary><p>" + esc(fill(U.whyIntro, { domName: dom.name })) + "</p><ul class=\"clean\">" +
      pr.why.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") +
      "</ul><p class=\"muted\">" + esc(U.whyNote) + "</p></details>";
    const burst = '<span class="am-burst" aria-hidden="true">' + [0, 1, 2, 3, 4, 5, 6].map(function () { return '<i class="am-bit">' + ico("heart") + "</i>"; }).join("") + "</span>";
    const header =
      '<div class="rhead" style="' + headStyle + '"><div class="am-hero-row"><div class="am-reveal"><div class="am-badge" style="' + needStyle(pr.dom) + '">' + profilSvg(dom.icon) + burst + '</div></div><span class="eyebrow">' + esc(pr.header.eyebrow) + "</span>" +
      '<div class="alloy">' + familyNameBtn(pr.dom, pr.name.noun) + " <em>" + familyNameBtn(pr.sec, pr.name.adj) + "</em></div></div>" +
      '<p class="pr-domsec">' + esc(pr.header.domSec) + "</p>" + pills +
      '<button type="button" class="btn ghost small am-fam-open" data-act="family-all">' + esc(enc.openAll) + "</button>" +
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
    const talentText = (R.talent && R.talent[pr.dom]) || "";
    const talentBlock = '<section class="rs am-talent" id="sec-talent" style="' + needStyle(pr.dom) + '"><div class="am-talent-head"><div class="am-talent-mark">' + profilSvg(dom.icon) + "</div><h2>" + esc(R.talentH) + "</h2></div><p>" + esc(talentText) + "</p></section>";
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
      if (secItem.ownDrains && secItem.ownDrains.length) {
        body += '<div class="panel ctx-bad" id="am-own-drains"><span class="lab">' + esc(U.s2ownH) + '</span><ul class="clean">' +
          secItem.ownDrains.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + "</ul></div>";
      }
      if (secItem.rows) {
        body += '<div class="pr-rows">' + secItem.rows.map(function (row) {
          return "<div><b>" + esc(row.label) + "</b><span>" + esc(row.text) + "</span></div>";
        }).join("") + "</div>";
      }
      if (secItem.rule) body += "<p>" + esc(secItem.rule) + "</p>";
      if (secItem.fond) body += '<ul class="clean fond">' + secItem.fond.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + "</ul>";
      if (secItem.nourrit) {
        const pair = function (item) { return "<p><strong>" + familyNameBtn(item.id, item.label) + "</strong> " + esc(item.text) + "</p>"; };
        body += '<div class="grid2">';
        body += '<div class="panel ctx-good"><span class="lab">' + esc(U.s4nourrit) + "</span>" + secItem.nourrit.map(pair).join("") + "</div>";
        body += '<div class="panel"><span class="lab">' + esc(U.s4frotte) + "</span>" + secItem.frotte.map(pair).join("") + "</div>";
        body += "</div>";
        body += '<div class="panel pr-hide"><span class="lab">' + esc(U.s4proche) + "</span>" + secItem.proche.map(pair).join("") +
          "<p><strong>" + familyNameBtn(pr.dom, U.s4mirrorLab) + " :</strong> " + esc(secItem.mirror) + "</p></div>";
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
      const head = '<section class="rs pr-sec" id="am-s' + (i + 1) + '" style="' + style + '"><div class="am-sec-head"><p class="snum">' + profilSvg(secItem.icon) + " " + (i + 1) + "</p><h2>" + esc(secItem.title) + "</h2></div>";
      if (i >= 2) return '<details class="am-fold"><summary>' + head + "</section></summary><div class=\"am-fold-body\">" + body + "</div></details>";
      return head + body + "</section>";
    });
    return header + '<div class="stack-lg" style="padding-top:8px">' + phrases + talentBlock + discoveryBlock("resultat-apres-profil", pierreLine) + salleSlot() + toc +
      '<div class="pr-cols">' + sections[0] + sections[1] + "</div>" +
      sections.slice(2).join("") + familyFold(pr.dom) + "</div>";
  }

  function showResults(profile) {
    view = "results";
    resultProfile = profile;
    const boussoleHref = D.config.boussoleUrl + "#amour=" + E.encodePayload(profile.boussole);
    const fortId = (profile.stress.fort || [])[0];
    const stressLine = (R.nowStress && R.nowStress[fortId]) || "";
    const endLine = stressLine ? stressLine + " " + R.nowGeneric : R.nowGeneric;

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
      '<div class="panel"><span class="lab">' + esc(R.brakeLab) + "</span><p>" + esc(brakeTitle(profile.brakes.first, false) + " " + profile.brakes.antidote) + "</p></div>";

    const type = profile.ennea.type ? D.ennea.types[profile.ennea.type] : null;
    const enneaBlock = type
      ? '<section class="rs"><h2>' + esc(R.enneaH) + "</h2><p>" + esc(type.couple) + "</p><p><strong>" + esc(R.piegeLab) + "</strong> " + esc(type.piege) + "</p>" +
        (profile.ennea.stressHint ? "<p>" + esc(profile.ennea.stressHint) + "</p>" : "") +
        "<p>" + esc(profile.ennea.confidenceText) + "</p><p class=\"muted\">" + esc(D.ennea.disclaimer) + "</p><p class=\"muted\">" + esc(D.ennea.credit) + "</p></section>"
      : "";
    const detail =
      '<section class="rs"><h2>' + esc(R.ressH) + "</h2><p>" + esc(profile.recharge.line) + "</p><p>" + esc(D.recharge[profile.recharge.profile].couple) + "</p><p>" + esc(D.recharge[profile.recharge.profile].fit) + "</p><p>" + esc(D.recharge[profile.recharge.profile].risk) + "</p><p>" + esc(R.rechargeRule) + "</p></section>" +
      '<section class="rs"><h2>' + esc(R.langH) + "</h2>" + [profile.languages.lang1, profile.languages.lang2].filter(Boolean).map(function (id) {
        const L = D.languages[id];
        return "<p><strong>" + esc(L.name) + "</strong> " + esc(L.recv) + "</p><p>" + esc(R.tipsLab + " " + L.tips) + "</p>";
      }).join("") + "</section>" +
      enneaBlock +
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
      profilReport(profile, stressLine) +
      '<section class="rs" id="sec-now"><h2>' + esc(R.nowH) + "</h2>" + petitPasHtml() + '<div class="stack">' +
      '<article class="rule" data-tone="sky"><span class="k">1</span><strong>' + ico("compass", "sky") + '<span class="am-lab">' + esc(R.nowTest) + "</span></strong><p>" + esc(R.nowTestP) + "</p>" +
      '<a class="btn" data-act="boussole" href="' + esc(boussoleHref) + '" target="_blank" rel="noopener noreferrer">' + esc(R.nowBoussole) + "</a></article>" +
      '<article class="rule" data-tone="pink"><span class="k">2</span><strong>' + ico("phone", "pink") + '<span class="am-lab">' + esc(R.nowPierre) + "</span></strong><p>" + esc(endLine) + "</p>" +
      '<a class="btn" data-cta-place="quiz_amour_resultat-fin" href="' + esc(calendlyHref("resultat-fin")) + '" target="_blank" rel="noopener noreferrer">' + esc(R.nowCall) + "</a></article>" +
      "</div>" +
      '<div class="row-actions"><button type="button" class="btn ghost" data-act="print">' + esc(R.nowPdf) + "</button></div></section>" +
      '<div class="am-screen-only stack-lg">' +
      '<section class="rs" id="sec-glance"><h2>' + esc(R.glanceH) + '</h2><div class="stack">' + glance + "</div></section>" +
      "<details><summary>" + esc(R.detailsSummary) + "</summary><div>" + detail + "</div></details>" +
      '<section class="rs"><h2>' + esc(R.exportH) + '</h2><div class="panel"><p>' + esc(R.exportP) + '</p><textarea id="am-export" readonly>' + esc(E.exportWithPetitPas(profile.exportText, D, petitPas)) + "</textarea>" +
      '<textarea id="am-share" readonly hidden>' + esc(profile.shareText) + '</textarea><div class="row-actions"><button type="button" class="btn" data-act="copy">' + esc(R.copyBtn) + '</button><span class="toast" id="am-toast" aria-live="polite"></span></div></div></section>' +
      '<section class="rs"><h2>' + esc(R.matchingH) + '</h2><div class="panel"><p class="muted">' + matching + "</p></div></section>" +
      '<section class="rs"><h2>' + esc(R.ethicsH) + '</h2><div class="prose"><p>' + esc(R.ethicsP) + '</p><p><button type="button" class="link" data-act="restart">' + esc(R.restart) + "</button></p></div></section>" +
      "</div>" +
      stickyBar() +
      familyDialog();

    delete root.dataset.tone;
    root.dataset.share = profile.shareText;
    pinSticky();
    scrollTop();
    saveProgress();
    startSalle(profile);
  }

  function salleSlot() {
    if (!E.salleSession(location.search || "")) return "";
    return '<div id="am-salle" class="am-screen-only" hidden></div>';
  }

  function stopSalle() {
    if (salleTimer) {
      clearInterval(salleTimer);
      salleTimer = null;
    }
  }

  function salleFlagKey(session) {
    return "quiz_amour_salle_" + session;
  }

  function compterSalle(profile) {
    const session = E.salleSession(location.search || "");
    const profil = profile && profile.profil ? profile.profil.dom : "";
    if (!session || !salleIdsHas(profil)) return Promise.resolve();
    let store = null;
    try { store = window.localStorage; } catch (e) { store = null; }
    try { if (store && store.getItem(salleFlagKey(session)) === "1") return Promise.resolve(); } catch (e) { /* quota */ }
    if (sallePosting) return Promise.resolve();
    sallePosting = true;
    const body = JSON.stringify({ session: session, profil: profil });
    return fetch("/boussole-decision/api/quiz-salle/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body,
      credentials: "omit",
      keepalive: true,
    }).then(function (res) {
      if (res && res.ok && store) {
        try { store.setItem(salleFlagKey(session), "1"); } catch (e) { /* quota */ }
      } else sallePosting = false;
    }).catch(function () { sallePosting = false; });
  }

  function salleIdsHas(id) {
    return E.salleIds(D).indexOf(id) !== -1;
  }

  function cacherSalle() {
    const box = document.getElementById("am-salle");
    if (!box) return;
    box.hidden = true;
    box.innerHTML = "";
  }

  function dessinerSalle(profile, data) {
    const box = document.getElementById("am-salle");
    if (!box) return;
    if (!data || data.ok !== true || !Array.isArray(data.profils)) {
      cacherSalle();
      return;
    }
    const dom = profile && profile.profil ? profile.profil.dom : "";
    const photo = E.sallePhoto(dom, data.profils, D);
    if (photo.total < 5) {
      box.hidden = false;
      box.innerHTML =
        '<section class="rs am-salle" aria-live="polite"><h2>' + esc(R.salleH) + "</h2><p>" + esc(R.salleWait) + '</p><button type="button" class="btn ghost small" data-act="family-all">' + esc(D.profil.encyclo.openAll) + '</button><button type="button" class="btn ghost small" data-act="salle-refresh">' + esc(R.salleRefresh) + "</button></section>";
      return;
    }
    const rows = photo.bars.map(function (bar) {
      const you = bar.id === dom ? ' <small class="salle-you">' + esc(R.salleYou) + "</small>" : "";
      const besoin = D.profil.besoins[bar.id];
      return '<div class="salle-row" style="' + needStyle(bar.id) + '"><div class="salle-lab">' + profilSvg(besoin.icon) + familyNameBtn(bar.id, bar.name) + you + '</div><span class="pr-track"><i style="--w:' + bar.pct + '%"></i></span><span class="salle-pct">' + esc(String(bar.pct)) + " %</span></div>";
    }).join("");
    const compat = photo.compat
      ? "<p>" + esc(fill(R.salleCompat, { name: photo.compat.name, pct: photo.compat.pct })) + "</p>"
      : "";
    box.hidden = false;
    box.innerHTML =
      '<section class="rs am-salle" aria-live="polite"><h2>' + esc(R.salleH) + "</h2><p class=\"muted\">" + esc(fill(R.salleTotal, { n: photo.total })) + "</p>" + rows + compat +
      '<button type="button" class="btn ghost small" data-act="family-all">' + esc(D.profil.encyclo.openAll) + '</button><button type="button" class="btn ghost small" data-act="salle-refresh">' + esc(R.salleRefresh) + "</button></section>";
  }

  function chargerSalle(profile) {
    const session = E.salleSession(location.search || "");
    if (!session || !document.getElementById("am-salle")) return Promise.resolve();
    if (document.visibilityState === "hidden") return Promise.resolve();
    return fetch("/boussole-decision/api/quiz-salle/?session=" + encodeURIComponent(session), { credentials: "omit" })
      .then(function (res) { return res && res.ok ? res.json() : null; })
      .then(function (data) { dessinerSalle(profile, data); })
      .catch(function () { cacherSalle(); });
  }

  function startSalle(profile) {
    stopSalle();
    if (!E.salleSession(location.search || "")) return;
    const tick = function () { chargerSalle(profile); };
    Promise.resolve(compterSalle(profile)).then(tick);
    salleTimer = setInterval(tick, 30000);
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

  function toggleCheck(s, gid, id, on) {
    if (on) justPick = gid + ":" + id;
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
      bag.picked[gid] = list;
      const g = (s.groups || []).find(function (x) { return x.id === gid; });
      if (g && g.max && chosenIds(s, g).length > g.max) {
        bag.picked[gid] = list.filter(function (x) { return x !== id; });
        live(Q.maxValues);
        return;
      }
    } else bag.picked[gid] = list.filter(function (x) { return x !== id; });
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

  function isTypedField(el) {
    return !!(el && ((el.id === "am-petit-pas") || (el.getAttribute && el.getAttribute("data-act") === "other")));
  }

  function petitPasHtml() {
    const texte = E.petitPasStored(petitPas);
    const shown = String(texte || "").trim();
    return '<div class="am-petit' + (shown ? " is-filled" : "") + '" id="am-petit">' +
      '<label for="am-petit-pas">' + esc(R.petitPasLabel) + "</label>" +
      '<textarea id="am-petit-pas" rows="2" maxlength="140" placeholder="' + esc(R.petitPasPh) + '">' + esc(texte) + "</textarea>" +
      '<p class="muted">' + esc(R.petitPasHint) + "</p>" +
      '<p class="am-petit-print"' + (shown ? "" : " hidden") + ">" + esc(shown) + "</p></div>";
  }

  function applyPetitPas(el) {
    if (!el || el.id !== "am-petit-pas") return;
    const raw = String(el.value || "");
    const clean = raw.replace(/[<>]/g, "").slice(0, 140);
    if (!composing && el.value !== clean) el.value = clean;
    petitPas = composing ? raw.replace(/[<>]/g, "").slice(0, 140) : clean;
    const box = document.getElementById("am-petit");
    const shown = String(petitPas || "").trim();
    if (box) box.classList.toggle("is-filled", !!shown);
    const printed = box && box.querySelector(".am-petit-print");
    if (printed) {
      printed.hidden = !shown;
      printed.textContent = shown;
    }
    const area = document.getElementById("am-export");
    if (area && resultProfile) area.value = E.exportWithPetitPas(resultProfile.exportText, D, petitPas);
    if (!composing) saveProgress();
  }

  function paintAsk(s) {
    const k = deficit(s);
    const next = root.querySelector("[data-act=next]");
    if (next) {
      next.disabled = k > 0;
      next.setAttribute("aria-disabled", k > 0 ? "true" : "false");
    }
    const cue = moreCue(s);
    let more = root.querySelector(".am-more");
    const nav = root.querySelector(".am-nav-inner");
    if (cue && !more && nav) {
      more = document.createElement(cue.down ? "button" : "p");
      more.className = cue.down ? "link hint am-more" : "hint am-more";
      if (cue.down) {
        more.type = "button";
        more.setAttribute("data-act", "scroll-group");
        more.setAttribute("data-group", cue.id);
      }
      nav.insertBefore(more, nav.firstChild);
    }
    if (more) {
      if (!cue) more.remove();
      else more.textContent = cue.down ? fill(Q.moreDown, { k: cue.k, label: cue.label }) : fill(Q.more, { k: cue.k });
    }
    if (s.type === "pick" || (s.type === "commit" && s.groups && groupStep === 0)) {
      const legend = root.querySelector(".legend b");
      const g = activeGroups(s)[0];
      if (legend && g && g.min) {
        const x = chosenIds(s, g).length;
        legend.textContent = counterText(g.counter, x, g.min, x >= g.min);
      }
    }
    saveProgress();
  }

  function applyOther(el) {
    const s = screenAt(qi);
    if (!s || !el) return;
    const g = (s.groups || []).find(function (x) { return x.id === el.getAttribute("data-group"); });
    if (!g || !g.other) return;
    const i = Number(el.getAttribute("data-index"));
    const bag = ensure(s);
    const arr = (bag.other[g.id] || []).slice();
    while (arr.length <= i) arr.push("");
    const before = arr[i] || "";
    const clean = String(el.value || "").replace(/[<>]/g, "").slice(0, g.other.maxLength);
    if (!composing && el.value !== clean) el.value = clean;
    arr[i] = composing ? el.value : clean;
    bag.other[g.id] = arr;
    if (g.max && chosenIds(s, g).length > g.max) {
      arr[i] = before;
      bag.other[g.id] = arr;
      if (!composing) el.value = before;
      live(Q.maxValues);
      paintAsk(s);
      return;
    }
    const card = el.closest(".rsrc-opt");
    if (card) card.classList.toggle("picked", String(arr[i] || "").trim().length > 0);
    if (s.rank && s.rank.mode === "inline") resync(s);
    if (!composing) paintAsk(s);
  }

  root.addEventListener("input", function (ev) {
    const el = ev.target;
    if (el.id === "am-petit-pas") {
      if (composing) return;
      applyPetitPas(el);
      return;
    }
    if (el.getAttribute("data-act") === "other") {
      if (composing) return;
      applyOther(el);
      return;
    }
    if (el.id === "am-prenom") {
      prenom = cleanName(el.value);
      saveProgress();
    }
  });

  root.addEventListener("compositionstart", function (ev) {
    if (isTypedField(ev.target)) composing = true;
  });
  root.addEventListener("compositionend", function (ev) {
    if (!isTypedField(ev.target)) return;
    composing = false;
    if (ev.target.id === "am-petit-pas") applyPetitPas(ev.target);
    else applyOther(ev.target);
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

  root.addEventListener("close", function (ev) {
    if (!ev.target || ev.target.id !== "am-fam-dialog") return;
    const back = familyOpener;
    familyOpener = null;
    if (back && typeof back.focus === "function") back.focus();
  }, true);

  root.addEventListener("click", function (ev) {
    const tocLink = ev.target.closest(".toc a");
    if (tocLink) {
      const foldId = (tocLink.getAttribute("href") || "").replace("#", "");
      const foldTarget = foldId ? document.getElementById(foldId) : null;
      const fold = foldTarget && foldTarget.closest("details.am-fold");
      if (fold) fold.open = true;
    }
    if (ev.target && ev.target.id === "am-fam-dialog") {
      ev.target.close();
      return;
    }
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
    if (act === "salle-refresh") {
      if (resultProfile) chargerSalle(resultProfile);
      return;
    }
    if (act === "family" || act === "family-all") {
      const dlg = document.getElementById("am-fam-dialog");
      const picked = act === "family" ? btn.getAttribute("data-id") : (resultProfile && resultProfile.profil ? resultProfile.profil.dom : D.profil.order[0]);
      if (dlg && dlg.open && dlg.contains(btn)) {
        renderFamily(picked);
        return;
      }
      openFamily(picked, btn);
      return;
    }
    if (act === "family-close") {
      const dlg = document.getElementById("am-fam-dialog");
      if (dlg && dlg.open) dlg.close();
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
      const payload = { title: U.pageTitle, text: text, url: D.config.quizUrl };
      if (navigator.share) {
        navigator.share(payload).catch(function (err) {
          if (err && err.name === "AbortError") return;
          copyText(text, toast, document.getElementById("am-share"));
        });
      } else copyText(text, toast, document.getElementById("am-share"));
      return;
    }
    if (act === "check" || act === "safety") return;
    if (act === "tap-top") {
      if (!s || !s.rank || s.rank.mode !== "tap") return;
      const id = btn.getAttribute("data-id");
      const t = tapState(s);
      if (t.ch.indexOf(id) === -1) return;
      const head = t.head.slice();
      const at = head.indexOf(id);
      const label = labelFor(s, t.gid, id);
      if (at !== -1) {
        head.splice(at, 1);
        pendingLive = fill(Q.untap, { label: label });
      } else if (head.length < t.top) {
        head.push(id);
        justPick = "tap:" + id;
        pendingLive = fill(Q.placed, { label: label, pos: head.length, total: t.top });
      }
      ensure(s).order[t.gid] = head;
      showQuestion(false);
      return;
    }
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
      const g = (s.groups || []).find(function (x) { return x.id === gid; });
      const max = g && g.other ? g.other.max || 1 : 1;
      const list = (bag.other[gid] || []).slice();
      if (list.length >= max) return;
      bag.other[gid] = list.concat("");
      focusSel = "am-other-" + gid + "-" + (bag.other[gid].length - 1);
      showQuestion(false);
      return;
    }
    if (act === "remove-other") {
      const bag = ensure(s);
      const gid = btn.getAttribute("data-group");
      const i = Number(btn.getAttribute("data-index"));
      const list = (bag.other[gid] || []).slice();
      if (!Number.isInteger(i) || i < 0 || i >= list.length) return;
      list.splice(i, 1);
      bag.other[gid] = list;
      if (bag.order && Array.isArray(bag.order[gid])) {
        bag.order[gid] = bag.order[gid].map(function (id) {
          if (String(id).indexOf("autre:") !== 0) return id;
          const n = Number(String(id).split(":")[1]);
          if (n === i) return null;
          if (n > i) return "autre:" + (n - 1);
          return id;
        }).filter(Boolean);
      }
      if (s.rank && s.rank.mode === "inline") resync(s);
      showQuestion(false);
      return;
    }
    if (act === "rank-card") {
      if (!s || !s.cardRank) return;
      const bag = ensure(s);
      const id = btn.getAttribute("data-id");
      const item = (s.items || []).find(function (it) { return it.id === id; });
      if (!item) return;
      if (bag.order.indexOf(id) !== -1) {
        bag.order = E.rankingState(bag.order, { type: "remove", id: id });
        pendingLive = fill(Q.rankUndo, { label: item.label });
      } else {
        bag.order = E.rankingState(bag.order, { type: "add", id: id });
        justPick = "rank:" + id;
        pendingLive = fill(Q.placed, { label: item.label, pos: bag.order.length, total: s.items.length });
      }
      showQuestion(false);
      return;
    }
    if (act === "rank-reset") {
      if (!s || !s.cardRank || btn.disabled) return;
      ensure(s).order = [];
      pendingLive = Q.rankCleared;
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
    if (act === "skip") {
      if (!s || !s.optional) return;
      const bag = ensure(s);
      (s.groups || []).forEach(function (g) {
        bag.picked[g.id] = [];
        bag.order[g.id] = [];
        if (bag.other && bag.other[g.id]) bag.other[g.id] = bag.other[g.id].map(function () { return ""; });
      });
      track("question_validee", { index: s.n });
      qi += 1;
      phase = "ask";
      groupStep = 0;
      view = "question";
      pushHist();
      showQuestion(true);
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
      if (s && rankStep(s) && phase === "rank") {
        phase = "ask";
        groupStep = s.splitGroups ? s.groups.length - 1 : 0;
        showQuestion(true);
        return;
      }
      if (qi <= 0) { showIntro(); return; }
      qi -= 1;
      const prev = screenAt(qi);
      phase = rankStep(prev) && (ensure(prev).order[prev.rank.groups[0]] || []).length ? "rank" : "ask";
      groupStep = 0;
      showQuestion(true);
      return;
    }
    if (act === "next") {
      if (!s || deficit(s) > 0) return;
      resumeNote = false;
      if (s.type === "commit" && s.groups && groupStep === 0) {
        groupStep = 1;
        view = "question";
        pushHist();
        showQuestion(true);
        return;
      }
      if (s.splitGroups && phase !== "rank" && groupStep < s.groups.length - 1) {
        groupStep += 1;
        view = "question";
        pushHist();
        showQuestion(true);
        return;
      }
      if (rankStep(s) && phase !== "rank") {
        if (s.rank.mode === "tap") ensure(s).order[tapState(s).gid] = tapState(s).head.slice();
        else resync(s);
        phase = "rank";
        view = "question";
        pushHist();
        showQuestion(true);
        return;
      }
      if (s.rank && s.rank.mode === "tap" && phase === "rank") {
        const t = tapState(s);
        const rest = t.ch.filter(function (id) { return t.head.indexOf(id) === -1; });
        ensure(s).order[t.gid] = t.head.concat(rest);
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
  });

  let printRestore = null;
  function openDetailsForPrint() {
    if (printRestore) return;
    const closed = [];
    root.querySelectorAll("details").forEach(function (el) {
      if (!el.open) {
        closed.push(el);
        el.open = true;
      }
    });
    printRestore = closed;
  }
  function closeDetailsAfterPrint() {
    if (!printRestore) return;
    const closed = printRestore;
    printRestore = null;
    closed.forEach(function (el) { el.open = false; });
  }
  window.addEventListener("beforeprint", openDetailsForPrint);
  window.addEventListener("afterprint", closeDetailsAfterPrint);
  if (window.matchMedia) {
    const printMq = window.matchMedia("print");
    const onPrintMq = function (ev) {
      if (ev.matches) openDetailsForPrint();
      else closeDetailsAfterPrint();
    };
    if (printMq.addEventListener) printMq.addEventListener("change", onPrintMq);
    else if (printMq.addListener) printMq.addListener(onPrintMq);
  }

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
    stopSalle();
    E.clearProgress(browserStore());
    answers = {};
    prenom = "";
    qi = 0;
    phase = "ask";
    groupStep = 0;
    view = "intro";
    resultProfile = null;
    lastPrefix = "";
    petitPas = "";
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
        petitPas = saved.petitPas || "";
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
