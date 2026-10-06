/* Quiz Amour · écrans (intro, une question, résultats).
   Démarre au chargement, uniquement si quiz/index.html a posé MH_THEME = "amour".
   Aucune réponse n'est envoyée ni gardée (pas de localStorage, pas d'adresse personnelle).
   La réponse à la question de sécurité (q28) sert au calcul puis est oubliée : elle n'entre pas dans le texte copié. */
(function () {
  const D = window.AMOUR_DATA;
  const E = window.AmourEngine;
  if (!D || !E || !document.getElementById("screen-amour")) return;

  const U = D.ui;
  const R = U.results;
  const root = document.getElementById("screen-amour");

  const style = document.createElement("style");
  style.textContent = [
    ".am-grid-row{display:flex;flex-direction:column;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px}",
    ".am-grid-ends{display:flex;justify-content:space-between;gap:12px;font-size:.92rem;line-height:1.35}",
    ".am-grid-ends span{flex:1 1 0;min-width:0}",
    ".am-grid-ends span:last-child{text-align:right}",
    ".am-dots{display:flex;justify-content:space-between;align-items:center;gap:6px}",
    ".am-dot{width:44px;height:44px;min-width:44px;border-radius:50%;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;font-weight:700;cursor:pointer;padding:0}",
    ".am-dot[aria-pressed=true]{background:var(--accent);color:#fff;border-color:var(--accent)}",
    ".am-firm{display:flex;flex-direction:column;gap:8px;margin-top:14px}",
    "#screen-amour .rsrc-opt{min-height:44px}",
    "#screen-amour .am-firm .rsrc-opt{min-height:44px}"
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

  const PARTS = [];
  D.questions.forEach(function (q) {
    if (PARTS.indexOf(q.part) === -1) PARTS.push(q.part);
  });

  let prenom = "";
  let qi = 0;
  let answers = {};

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fill(tpl, vars) { return E.fill(tpl, vars); }
  function cleanName(n) {
    return String(n || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
  }
  function scrollTop() {
    try { window.scrollTo(0, 0); } catch (e) { /* navigateur ancien */ }
  }
  function ul(items) {
    return '<ul class="clean">' + items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  }
  function section(id, num, title, body) {
    return '<section class="rs" id="' + id + '"><h2><span class="snum">' + num + "</span> " + esc(title) + "</h2>" + body + "</section>";
  }

  function optionById(q, id) {
    return (q.options || []).filter(function (o) { return o.id === id; })[0] || null;
  }
  function isNeutral(q, pos) {
    const opt = optionById(q, pos);
    return !!(opt && opt.neutral);
  }
  function complete(q) {
    const a = answers[q.id];
    if (q.type === "single") return !!(a && optionById(q, a));
    if (q.type === "value") {
      if (!a || !optionById(q, a.pos)) return false;
      if (isNeutral(q, a.pos)) return true;
      return D.firmness.some(function (f) { return f.id === a.firm; });
    }
    if (q.type === "grid") {
      if (!a) return false;
      return q.axes.every(function (ax) { return [-2, -1, 0, 1, 2].indexOf(a[ax.id]) !== -1; });
    }
    return false;
  }

  function showIntro() {
    const I = U.intro;
    root.innerHTML =
      '<div class="hero">' +
        '<span class="eyebrow">' + esc(I.eyebrow) + "</span>" +
        "<h1>" + I.h1 + "</h1>" +
        '<p class="lead">' + esc(I.lead) + "</p>" +
      "</div>" +
      '<div class="stack-lg" style="padding-top:18px">' +
        "<ul class=\"clean\">" + I.bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" +
        '<p class="howto-tip">' + esc(I.howto) + "</p>" +
        '<div class="hello">' +
          '<div class="field"><label for="am-prenom">' + esc(I.nameLabel) + "</label>" +
            '<input id="am-prenom" autocomplete="given-name" maxlength="40" value="' + esc(prenom) + '">' +
            '<p class="muted">' + esc(I.nameHelp) + "</p></div>" +
          '<p class="err" id="am-err" aria-live="polite"></p>' +
          '<button class="btn" type="button" data-act="start">' + esc(I.start) + "</button>" +
        "</div>" +
      "</div>";
    const input = document.getElementById("am-prenom");
    if (input) input.focus();
    scrollTop();
  }

  function dotLabel(v, ax) {
    if (v < 0) return ax.left;
    if (v > 0) return ax.right;
    return "ni l'un ni l'autre";
  }

  function showQuestion(doScroll) {
    const q = D.questions[qi];
    const n = D.questions.length;
    const last = qi === n - 1;
    const ok = complete(q);
    const a = answers[q.id];
    let hint = U.quiz.hintSingle;
    if (q.type === "value") hint = U.quiz.hintValue;
    if (q.type === "grid") hint = U.quiz.hintGrid;

    let body = "";
    if (q.type === "single" || q.type === "value") {
      body += '<div class="stack" style="padding-top:8px">';
      q.options.forEach(function (o) {
        const pressed = q.type === "single" ? a === o.id : a && a.pos === o.id;
        body += '<button type="button" class="rsrc-opt' + (pressed ? " picked" : "") + '" data-act="opt" data-id="' + esc(o.id) + '" aria-pressed="' + (pressed ? "true" : "false") + '">' + esc(o.label) + "</button>";
      });
      body += "</div>";
      if (q.type === "value" && a && a.pos && !isNeutral(q, a.pos)) {
        body += '<div class="am-firm" role="group" aria-label="' + esc(U.quiz.firmnessLabel) + '">';
        body += '<p class="rsrc-q"><span class="qstem">' + esc(U.quiz.firmnessLabel) + "</span></p>";
        D.firmness.forEach(function (f) {
          const pressed = a.firm === f.id;
          body += '<button type="button" class="rsrc-opt' + (pressed ? " picked" : "") + '" data-act="firm" data-id="' + esc(f.id) + '" aria-pressed="' + (pressed ? "true" : "false") + '">' + esc(f.label) + "</button>";
        });
        body += "</div>";
      }
    } else if (q.type === "grid") {
      body += '<p class="muted">' + esc(U.quiz.gridHelp) + "</p>";
      body += '<div class="stack" style="padding-top:8px">';
      q.axes.forEach(function (ax) {
        const cur = a ? a[ax.id] : undefined;
        body += '<div class="am-grid-row">';
        body += '<div class="am-grid-ends"><span>' + esc(ax.left) + "</span><span>" + esc(ax.right) + "</span></div>";
        body += '<div class="am-dots" role="group" aria-label="' + esc(ax.left + " / " + ax.right) + '">';
        [-2, -1, 0, 1, 2].forEach(function (v) {
          const pressed = cur === v;
          body += '<button type="button" class="am-dot" data-act="dot" data-axis="' + esc(ax.id) + '" data-v="' + v + '" aria-pressed="' + (pressed ? "true" : "false") + '" aria-label="' + esc(dotLabel(v, ax)) + '"></button>';
        });
        body += "</div></div>";
      });
      body += "</div>";
    }

    const segs = D.questions.map(function (_, i) {
      return '<span class="' + (i < qi || (i === qi && ok) ? "done" : "") + '"></span>';
    }).join("");

    root.innerHTML =
      '<div class="progress" aria-hidden="true">' + segs + "</div>" +
      '<div class="qhead">' +
        '<span class="eyebrow">' + esc(fill(U.quiz.part, { p: PARTS.indexOf(q.part) + 1, n: PARTS.length, label: U.parts[q.part] || "" })) + "</span>" +
        '<p class="muted">' + esc(fill(U.quiz.count, { i: qi + 1, n: n })) + "</p>" +
        "<h2>" + esc(q.text) + "</h2>" +
        (q.private ? '<p class="muted">' + esc(U.quiz.privacy) + "</p>" : "") +
      "</div>" +
      body +
      '<div class="qnav">' +
        '<button type="button" class="btn ghost" data-act="prev">' + esc(U.quiz.prev) + "</button>" +
        '<span class="hint" id="am-hint">' + (ok ? "" : esc(hint)) + "</span>" +
        '<button type="button" class="btn" data-act="next"' + (ok ? "" : " disabled") + ">" + esc(last ? U.quiz.last : U.quiz.next) + "</button>" +
      "</div>";
    if (doScroll) scrollTop();
  }

  function langPanel(kind) {
    const id = kind === "recv" ? profileLang.recv : profileLang.give;
    const id2 = kind === "recv" ? profileLang.recv2 : profileLang.give2;
    const L = D.languages[id];
    const tips = kind === "recv" ? L.recvTips : L.giveTips;
    const body = kind === "recv" ? L.recv : L.give;
    const lab = kind === "recv" ? R.recvLab : R.giveLab;
    let second = "";
    if (id2) {
      second = '<p><span class="lab">' + esc(R.secondaryLab) + "</span> " + esc(D.languages[id2].name) + "</p>";
    } else if (kind === "recv" && profileLang.noSecondary) {
      second = "<p>" + esc(profileLang.noSecondary) + "</p>";
    }
    return '<div class="panel"><p class="lab">' + esc(lab) + "</p><h3>" + esc(L.name) + "</h3><p>" + esc(body) + '</p><p class="lab">' + esc(R.tipsLab) + "</p>" + ul(tips) + second + "</div>";
  }

  let profileLang = null;

  function showResults(profile) {
    profileLang = profile.languages;
    const toc = [
      ["sec-lang", R.langH], ["sec-imago", R.imagoH], ["sec-needs", R.needsH], ["sec-anti", R.antiH],
      ["sec-ress", R.ressH], ["sec-mask", R.maskH], ["sec-nn", R.nnH], ["sec-partner", R.partnerH],
      ["sec-key", R.keyH], ["sec-plan", R.planH], ["sec-boussole", R.boussoleLab], ["sec-cta", R.ctaH],
      ["sec-export", R.exportH], ["sec-matching", R.matchingH], ["sec-ethics", R.ethicsH]
    ];
    const L = profile.languages;
    const pat = profile.pattern;
    const P = pat.id ? D.patterns[pat.id] : null;
    const mask = D.masks[profile.mask.id];
    const nn = profile.nonNegotiables;

    let imago = '<div class="panel"><p>' + esc(pat.levelText) + "</p>";
    if (P) {
      imago += "<h3>" + esc(P.name) + "</h3><p>" + esc(P.summary) + "</p><p>" + esc(P.imago) + "</p>" +
        "<p><strong>Ce qui te déclenche :</strong> " + esc(P.trigger) + "</p>" +
        '<p class="lab">' + esc(R.reactiveLab) + "</p><p>" + esc(P.reactive) + "</p>" +
        '<p class="lab">' + esc(R.healingLab) + "</p><p>" + esc(P.healing) + "</p>";
    }
    imago += '<p class="lab">' + esc(R.imagoQuestionsLab) + "</p>" + ul(pat.questions);
    if (profile.pastAbuse) imago += "<p>" + esc(profile.pastAbuse) + "</p>";
    imago += '<p class="muted">' + esc(R.imagoDisclaimer) + "</p>" +
      '<p class="muted">' + esc(R.imagoCredit) + "</p></div>";

    const needs = '<div class="grid2">' + profile.needs.top.map(function (id) {
      const N = D.needs[id];
      return '<div class="panel"><h3>' + esc(N.name) + "</h3><p>" + esc(N.desc) + '</p><p class="lab">' + esc(R.ctxLab) + '</p><p class="lab">' + esc(R.needsPartnerLab) + "</p><p>" + esc(N.partner) + "</p></div>";
    }).join("") + "</div>";

    const nnCritical = nn.critical.length
      ? '<ul class="clean">' + nn.critical.map(function (x) { return '<li><span class="dot r"></span>' + esc(x) + "</li>"; }).join("") + "</ul>"
      : "<p>" + esc(R.nnNoneCritical) + "</p>";

    const partnerCols =
      '<div class="grid3">' +
        '<div class="panel ctx-good"><p class="lab">' + esc(R.completeLab) + "</p>" + ul(profile.partner.complete) +
          (profile.forme.noComplement ? "<p>" + esc(profile.forme.noComplement) + "</p>" : "") + "</div>" +
        '<div class="panel"><p class="lab">' + esc(R.frictionLab) + "</p>" + ul(profile.partner.friction) + "</div>" +
        '<div class="panel ctx-bad"><p class="lab">' + esc(R.criticalLab) + "</p>" + ul(profile.partner.critical) + "</div>" +
      "</div>" +
      "<h3>" + esc(R.gridH) + "</h3>" +
      '<div class="grid2">' + D.riskGrid.map(function (g) {
        return '<div class="panel"><p class="lab">' + esc(g.level) + "</p><h3>" + esc(g.label) + "</h3><p>" + esc(g.text) + "</p></div>";
      }).join("") + "</div>";

    const matchingHtml = esc(fill(R.matchingP, { email: D.config.matchingEmail })).replace(
      esc(D.config.matchingEmail),
      '<a href="mailto:' + esc(D.config.matchingEmail) + '">' + esc(D.config.matchingEmail) + "</a>"
    );

    root.innerHTML =
      (profile.safety ? '<div class="panel ctx-bad" role="alert"><p class="lab">' + esc(profile.safety.title) + "</p><p>" + esc(profile.safety.text) + "</p></div>" : "") +
      '<div class="rhead">' +
        '<span class="eyebrow">' + esc(fill(R.eyebrow, { prenom: profile.prenom })) + "</span>" +
        '<h2 class="alloy">' + esc(R.titlePrefix) + " <em>" + esc(profile.title) + "</em></h2>" +
        '<p class="lead"><strong>' + esc(R.summaryLab) + "</strong> " + esc(profile.summary) + "</p>" +
        "<p>" + esc(profile.opener) + "</p>" +
        '<nav class="toc">' + toc.map(function (item) { return '<a href="#' + item[0] + '">' + esc(item[1]) + "</a>"; }).join("") + "</nav>" +
      "</div>" +
      section("sec-lang", "2", R.langH,
        '<div class="grid2">' + langPanel("recv") + langPanel("give") + "</div>" +
        '<div class="prose"><p>' + esc(L.gap) + "</p><p class=\"muted\">" + esc(R.langCredit) + "</p></div>") +
      section("sec-imago", "3", R.imagoH, imago) +
      section("sec-needs", "4", R.needsH, needs) +
      section("sec-anti", "5", R.antiH, '<div class="panel ctx-bad"><p>' + esc(R.antiIntro) + "</p><p>" + esc(profile.needs.anti) + "</p></div>") +
      section("sec-ress", "6", R.ressH, '<div class="panel equation"><p>' + esc(profile.needs.ress) + "</p></div>") +
      section("sec-mask", "7", R.maskH,
        '<div class="prose"><p>' + esc(D.maskIntro) + "</p></div>" +
        '<div class="panel"><p class="lab">' + esc(R.maskLab) + "</p><h3>" + esc(mask.name) + "</h3>" +
          '<p class="lab">' + esc(R.qualityLab) + "</p><p>" + esc(mask.quality) + "</p>" +
          '<p class="lab">' + esc(R.overflowLab) + "</p><p>" + esc(mask.overflow) + "</p>" +
          '<p class="lab">' + esc(R.maskPartnerLab) + "</p><p>" + esc(mask.partner) + "</p>" +
          '<p class="lab">' + esc(R.exerciseLab) + "</p><p>" + esc(mask.exercise) + "</p></div>") +
      section("sec-nn", "8", R.nnH,
        '<div class="prose"><p>' + esc(R.nnIntro) + "</p></div><div class=\"panel\">" +
          '<p class="lab">' + esc(R.nnCriticalLab) + "</p>" + nnCritical +
          (nn.strong.length ? '<p class="lab">' + esc(R.nnStrongLab) + "</p>" + ul(nn.strong) : "") +
          (nn.soft.length ? '<p class="lab">' + esc(R.nnSoftLab) + "</p>" + ul(nn.soft) : "") +
          '<p class="lab">' + esc(R.nnUniversalLab) + "</p>" + ul(nn.universal) +
        "</div>") +
      section("sec-partner", "9", R.partnerH, '<div class="prose"><p>' + esc(R.partnerIntro) + "</p></div>" + partnerCols) +
      section("sec-key", "10", R.keyH, '<div class="prose">' + ul(profile.keyMessages) + "</div>") +
      section("sec-plan", "11", R.planH, "<ol class=\"clean\">" + profile.plan.map(function (step) { return "<li>" + esc(step) + "</li>"; }).join("") + "</ol>") +
      section("sec-boussole", "12", R.boussoleLab,
        '<div class="panel stack"><p>' + esc(R.boussoleP) + '</p><div class="row-actions"><a class="btn" data-act="boussole" href="' + esc(D.config.boussoleUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(R.boussoleBtn) + "</a></div></div>") +
      '<section class="rs" id="sec-cta"><div class="cta" data-cta-place="quiz_amour_resultat">' +
        '<span class="eyebrow">' + esc(R.ctaEyebrow) + "</span><h3>" + esc(R.ctaH) + "</h3><p>" + esc(R.ctaP) + "</p><p>" + esc(R.ctaSign) + "</p>" +
        '<div class="cta-actions"><a class="btn" href="' + esc(D.config.calendly) + '" target="_blank" rel="noopener noreferrer">' + esc(R.ctaBtn) + "</a>" +
        '<a class="btn alt" href="' + esc(D.config.site) + '" target="_blank" rel="noopener noreferrer">' + esc(R.siteBtn) + "</a></div></div></section>" +
      section("sec-export", "14", R.exportH,
        '<div class="panel"><p>' + esc(R.exportP) + '</p><textarea id="am-export" readonly>' + esc(profile.exportText) + '</textarea>' +
        '<div class="row-actions"><button type="button" class="btn" data-act="copy">' + esc(R.copyBtn) + '</button><span class="toast" id="am-toast" aria-live="polite"></span></div></div>') +
      section("sec-matching", "15", R.matchingH, '<div class="panel"><p class="muted">' + matchingHtml + "</p></div>") +
      section("sec-ethics", "16", R.ethicsH,
        '<div class="prose"><p>' + esc(R.ethicsP) + '</p><p><a class="link" href="' + esc(location.pathname + "?theme=amour") + '">' + esc(R.restart) + "</a></p></div>");

    answers = {};
    scrollTop();
  }

  function rememberTheme() {
    try { sessionStorage.setItem("mh_theme", "amour"); } catch (e) { /* mode privé */ }
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = "mh_theme=amour; Path=/; Max-Age=7200; SameSite=Lax" + secure;
  }

  function startQuiz() {
    const input = document.getElementById("am-prenom");
    const err = document.getElementById("am-err");
    prenom = cleanName(input ? input.value : "");
    if (!prenom) {
      if (err) err.textContent = U.intro.nameErr;
      if (input) input.focus();
      return;
    }
    qi = 0;
    showQuestion(true);
  }

  root.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" && ev.target && ev.target.id === "am-prenom") {
      ev.preventDefault();
      startQuiz();
    }
  });

  root.addEventListener("click", function (ev) {
    const btn = ev.target.closest("[data-act]");
    if (!btn || !root.contains(btn)) return;
    const act = btn.getAttribute("data-act");
    const q = D.questions[qi];

    if (act === "start") { startQuiz(); return; }
    if (act === "opt" && q) {
      const id = btn.getAttribute("data-id");
      if (q.type === "single") answers[q.id] = id;
      if (q.type === "value") {
        const prev = answers[q.id] && typeof answers[q.id] === "object" ? answers[q.id] : {};
        answers[q.id] = isNeutral(q, id) ? { pos: id } : { pos: id, firm: prev.firm };
      }
      showQuestion(false);
      return;
    }
    if (act === "firm" && q && q.type === "value") {
      const prev = answers[q.id] && typeof answers[q.id] === "object" ? answers[q.id] : {};
      answers[q.id] = { pos: prev.pos, firm: btn.getAttribute("data-id") };
      showQuestion(false);
      return;
    }
    if (act === "dot" && q && q.type === "grid") {
      const prev = answers[q.id] && typeof answers[q.id] === "object" ? answers[q.id] : {};
      const next = {};
      Object.keys(prev).forEach(function (k) { next[k] = prev[k]; });
      next[btn.getAttribute("data-axis")] = Number(btn.getAttribute("data-v"));
      answers[q.id] = next;
      showQuestion(false);
      return;
    }
    if (act === "prev") {
      if (qi <= 0) showIntro();
      else { qi -= 1; showQuestion(true); }
      return;
    }
    if (act === "next") {
      if (!q || !complete(q)) return;
      if (qi < D.questions.length - 1) { qi += 1; showQuestion(true); return; }
      const snapshot = answers;
      let profile;
      try { profile = E.computeLoveProfile(snapshot, D, prenom); }
      catch (e) { return; }
      showResults(profile);
      return;
    }
    if (act === "boussole") rememberTheme();
    if (act === "copy") {
      const ta = document.getElementById("am-export");
      const toast = document.getElementById("am-toast");
      const text = ta ? ta.value : "";
      const done = function (msg) { if (toast) toast.textContent = msg; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(R.copied); }, function () {
          if (ta) { ta.focus(); ta.select(); }
          done(R.copyFallback);
        });
      } else {
        if (ta) { ta.focus(); ta.select(); }
        done(R.copyFallback);
      }
    }
  });

  showIntro();
})();
