/* Quiz Amour v1.2 · écrans (intro, 11 étapes, résultats).
   Démarre uniquement si quiz/index.html a posé MH_THEME = "amour".
   Aucune réponse n'est envoyée ni gardée. La sécurité, le prénom et l'ennéagramme
   ne partent pas vers un serveur : seul le clic Boussole ouvre une ancre #amour=. */
(function () {
  const D = window.AMOUR_DATA;
  const E = window.AmourEngine;
  if (!D || !E || !document.getElementById("screen-amour")) return;

  const U = D.ui;
  const R = U.results;
  const root = document.getElementById("screen-amour");

  const style = document.createElement("style");
  style.textContent = [
    ".am-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px;display:flex;flex-direction:column;gap:10px}",
    ".am-blockq{font-weight:700;margin:6px 0 2px}",
    ".am-tag{display:block;font-size:.85rem;color:var(--muted);margin-top:2px}",
    ".am-chips{display:flex;flex-wrap:wrap;gap:8px}",
    ".am-chip{min-height:44px;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;cursor:pointer}",
    ".am-chip[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:#fff}",
    ".am-chip:disabled,.am-pm-btn:disabled{opacity:.45;cursor:not-allowed}",
    ".am-pm-row{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:10px 12px}",
    ".am-pm-row .txt{flex:1 1 auto}",
    ".am-pm-btn{width:44px;height:44px;min-width:44px;border-radius:50%;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;font-weight:700;cursor:pointer}",
    ".am-pm-btn.plus[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:#fff}",
    ".am-pm-btn.minus[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:var(--bg)}",
    ".am-pm-row.is-minus .txt{color:var(--muted);text-decoration:line-through}",
    ".am-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}",
    ".am-seg button{min-height:44px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;font-size:.9rem;cursor:pointer}",
    ".am-seg button[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:#fff}",
    "#screen-amour .rsrc-opt{min-height:44px}"
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
  function screenAt(i) { return D.screens[i]; }
  function topicOf(id) { return D.valueTopics.filter(function (t) { return t.id === id; })[0]; }
  function screenBad(s) {
    return E.missingAnswers(answers, D).some(function (id) {
      return id === s.id || id.indexOf(s.id + ".") === 0;
    });
  }
  function bag(id) {
    return answers[id] && typeof answers[id] === "object" ? answers[id] : {};
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

  function segButtons(items, act, extra) {
    return '<div class="am-seg">' + items.map(function (it) {
      const pressed = it.pressed;
      return '<button type="button" data-act="' + act + '"' + extra(it) + ' aria-pressed="' + (pressed ? "true" : "false") + '">' + esc(it.label) + "</button>";
    }).join("") + "</div>";
  }

  function blockHtml(s, b) {
    const value = bag(s.id)[b.id];
    let html = '<p class="am-blockq">' + esc(b.text) + "</p>";
    if (b.kind === "single") {
      html += '<div class="stack">';
      b.options.forEach(function (o) {
        const pressed = value === o.id;
        html += '<button type="button" class="rsrc-opt' + (pressed ? " picked" : "") + '" data-act="opt" data-block="' + esc(b.id) + '" data-id="' + esc(o.id) + '" aria-pressed="' + (pressed ? "true" : "false") + '">' +
          esc(o.label) + (o.tag ? '<span class="am-tag">' + esc(o.tag) + "</span>" : "") + "</button>";
      });
      html += "</div>";
    } else if (b.kind === "second") {
      const ofValue = bag(s.id)[b.of];
      const none = value == null;
      html += '<div class="am-chips">';
      html += '<button type="button" class="am-chip" data-act="second" data-block="' + esc(b.id) + '" data-id="" aria-pressed="' + (none ? "true" : "false") + '">' + esc(U.quiz.secondNone) + "</button>";
      b.options.forEach(function (o) {
        const pressed = value === o.id;
        const disabled = o.id === ofValue;
        html += '<button type="button" class="am-chip" data-act="second" data-block="' + esc(b.id) + '" data-id="' + esc(o.id) + '" aria-pressed="' + (pressed ? "true" : "false") + '"' + (disabled ? " disabled" : "") + ">" + esc(o.label) + "</button>";
      });
      html += "</div>";
    } else if (b.kind === "multi") {
      const chosen = Array.isArray(value) ? value : [];
      html += '<div class="am-chips">';
      b.options.forEach(function (o) {
        const pressed = chosen.indexOf(o.id) !== -1;
        const disabled = !pressed && chosen.length >= b.max;
        html += '<button type="button" class="am-chip" data-act="multi" data-block="' + esc(b.id) + '" data-id="' + esc(o.id) + '" aria-pressed="' + (pressed ? "true" : "false") + '"' + (disabled ? " disabled" : "") + ">" + esc(o.label) + "</button>";
      });
      html += "</div>";
    } else if (b.kind === "self") {
      html += segButtons(b.options.map(function (o) {
        return { id: o.id, label: o.label, pressed: value === o.id };
      }), "self", function (it) {
        return ' data-block="' + esc(b.id) + '" data-id="' + esc(it.id) + '"';
      });
    }
    return html;
  }

  function questionBody(s) {
    if (s.type === "plusminus") {
      const cur = bag(s.id);
      const plus = cur.plus || [];
      const minus = cur.minus || [];
      let html = '<p class="muted">' + esc(U.quiz.plusLegend) + " · " + esc(U.quiz.minusLegend) + "</p>";
      html += '<p class="muted">' + esc(fill(U.quiz.plusLeft, { n: s.plusCount - plus.length })) + " · " + esc(fill(U.quiz.minusLeft, { n: s.minusCount - minus.length })) + "</p>";
      html += '<div class="stack">';
      s.items.forEach(function (item) {
        const isPlus = plus.indexOf(item.id) !== -1;
        const isMinus = minus.indexOf(item.id) !== -1;
        html += '<div class="am-pm-row' + (isMinus ? " is-minus" : "") + '"><p class="txt">' + esc(item.label) + "</p>";
        html += '<button type="button" class="am-pm-btn plus" data-act="pm-plus" data-id="' + esc(item.id) + '" aria-pressed="' + (isPlus ? "true" : "false") + '" aria-label="' + esc("Ce qui me nourrit : " + item.label) + '"' + (!isPlus && plus.length >= s.plusCount ? " disabled" : "") + ">+</button>";
        html += '<button type="button" class="am-pm-btn minus" data-act="pm-minus" data-id="' + esc(item.id) + '" aria-pressed="' + (isMinus ? "true" : "false") + '" aria-label="' + esc("Ce qui m'éteint : " + item.label) + '"' + (!isMinus && minus.length >= s.minusCount ? " disabled" : "") + ">−</button>";
        html += "</div>";
      });
      return html + "</div>";
    }
    if (s.type === "blocks") {
      let html = '<div class="stack">';
      for (let i = 0; i < s.blocks.length; i++) {
        const b = s.blocks[i];
        const next = s.blocks[i + 1];
        if (next && next.kind === "self" && next.id === b.id + "Self") {
          html += '<div class="am-card">' + blockHtml(s, b) + blockHtml(s, next) + "</div>";
          i += 1;
        } else {
          html += '<div class="am-card">' + blockHtml(s, b) + "</div>";
        }
      }
      return html + "</div>";
    }
    if (s.type === "sort") {
      const cur = bag(s.id);
      let html = '<div class="stack">';
      s.items.forEach(function (id) {
        html += '<div class="am-card"><p class="am-blockq">' + esc(D.flaws[id].label) + "</p>";
        html += segButtons(D.flawColumns.map(function (col) {
          return { id: col.id, label: col.label, pressed: cur[id] === col.id, flaw: id };
        }), "sort", function (it) {
          return ' data-id="' + esc(it.flaw) + '" data-col="' + esc(it.id) + '"';
        });
        html += "</div>";
      });
      return html + "</div>";
    }
    if (s.type === "values") {
      const cur = bag(s.id);
      let html = '<div class="stack">';
      s.topics.forEach(function (topicId) {
        const topic = topicOf(topicId);
        const row = cur[topicId] || {};
        const opt = topic.options.filter(function (o) { return o.id === row.pos; })[0];
        html += '<div class="am-card"><p class="am-blockq">' + esc(topic.topicLabel) + '</p><div class="am-chips">';
        topic.options.forEach(function (o) {
          const pressed = row.pos === o.id;
          html += '<button type="button" class="am-chip" data-act="pos" data-topic="' + esc(topicId) + '" data-id="' + esc(o.id) + '" title="' + esc(o.label) + '" aria-label="' + esc(o.label) + '" aria-pressed="' + (pressed ? "true" : "false") + '">' + esc(o.chip) + "</button>";
        });
        html += "</div>";
        if (opt && !opt.neutral) {
          html += '<p class="am-blockq">' + esc(U.quiz.firmnessLabel) + "</p>";
          html += segButtons(D.firmness.map(function (f) {
            return { id: f.id, label: f.label, pressed: row.firm === f.id, topic: topicId };
          }), "firm", function (it) {
            return ' data-topic="' + esc(it.topic) + '" data-id="' + esc(it.id) + '"';
          });
        }
        html += "</div>";
      });
      return html + "</div>";
    }
    let html = '<div class="stack">';
    s.options.forEach(function (o) {
      const pressed = answers[s.id] === o.id;
      html += '<button type="button" class="rsrc-opt' + (pressed ? " picked" : "") + '" data-act="choice" data-id="' + esc(o.id) + '" aria-pressed="' + (pressed ? "true" : "false") + '">' + esc(o.label) + "</button>";
    });
    return html + "</div>";
  }

  function showQuestion(doScroll) {
    const s = screenAt(qi);
    const n = D.screens.length;
    const ok = !screenBad(s);
    const last = qi === n - 1;
    const segs = D.screens.map(function (_, i) {
      const done = i < qi || (i === qi && ok);
      return '<span class="' + (done ? "done" : "") + '"></span>';
    }).join("");
    root.innerHTML =
      '<div class="progress" aria-hidden="true">' + segs + "</div>" +
      '<div class="qhead">' +
        '<span class="eyebrow">' + esc(fill(U.quiz.count, { i: qi + 1, n: n }) + " · " + s.eyebrow) + "</span>" +
        "<h2>" + esc(s.text) + "</h2>" +
        (s.help ? '<p class="muted">' + esc(s.help) + "</p>" : "") +
        (s.private ? '<p class="muted">' + esc(U.quiz.privacy) + "</p>" : "") +
      "</div>" +
      questionBody(s) +
      '<div class="qnav">' +
        '<button type="button" class="btn ghost" data-act="prev">' + esc(U.quiz.prev) + "</button>" +
        '<span class="hint">' + (ok ? "" : esc(U.quiz.hints[s.type])) + "</span>" +
        '<button type="button" class="btn" data-act="next"' + (ok ? "" : " disabled") + ">" + esc(last ? U.quiz.last : U.quiz.next) + "</button>" +
      "</div>";
    if (doScroll) scrollTop();
  }

  function toggleSign(sign, itemId) {
    const s = screenAt(qi);
    const cur = { plus: (bag(s.id).plus || []).slice(), minus: (bag(s.id).minus || []).slice() };
    const other = sign === "plus" ? "minus" : "plus";
    const max = sign === "plus" ? s.plusCount : s.minusCount;
    if (cur[sign].indexOf(itemId) !== -1) cur[sign] = cur[sign].filter(function (id) { return id !== itemId; });
    else if (cur[sign].length < max) {
      cur[sign].push(itemId);
      cur[other] = cur[other].filter(function (id) { return id !== itemId; });
    }
    answers[s.id] = cur;
  }

  function setBlock(blockId, value) {
    const s = screenAt(qi);
    const cur = Object.assign({}, bag(s.id));
    cur[blockId] = value;
    s.blocks.forEach(function (b) {
      if (b.kind === "second" && b.of === blockId && cur[b.id] === value) cur[b.id] = null;
    });
    answers[s.id] = cur;
  }

  function langPanel(kind, profileLang) {
    const id = kind === "recv" ? profileLang.recv : profileLang.give;
    const id2 = kind === "recv" ? profileLang.recv2 : profileLang.give2;
    const L = D.languages[id];
    const tips = kind === "recv" ? L.recvTips : L.giveTips;
    const body = kind === "recv" ? L.recv : L.give;
    const lab = kind === "recv" ? R.recvLab : R.giveLab;
    let second = "";
    if (id2) second = '<p><span class="lab">' + esc(R.secondaryLab) + "</span> " + esc(D.languages[id2].name) + "</p>";
    else if (kind === "recv" && profileLang.noSecondary) second = "<p>" + esc(profileLang.noSecondary) + "</p>";
    return '<div class="panel"><p class="lab">' + esc(lab) + "</p><h3>" + esc(L.name) + "</h3><p>" + esc(body) + '</p><p class="lab">' + esc(R.tipsLab) + "</p>" + ul(tips) + second + "</div>";
  }

  function showResults(profile) {
    const boussoleHref = D.config.boussoleUrl + "#amour=" + E.encodePayload(profile.boussole);
    const L = profile.languages;
    const en = profile.ennea;
    const type = D.ennea.types[en.type];
    const instinct = D.instincts[en.instinct];
    const pat = profile.pattern;
    const P = pat.id ? D.patterns[pat.id] : null;
    const nn = profile.nonNegotiables;
    const bothCriticalEmpty = !nn.values.length && !nn.flaws.length;

    let imago = '<div class="panel"><p>' + esc(pat.levelText) + "</p>";
    if (P) {
      imago += "<h3>" + esc(P.name) + "</h3><p>" + esc(P.summary) + "</p><p>" + esc(P.imago) + "</p>" +
        "<p><strong>Ce qui te déclenche :</strong> " + esc(P.trigger) + "</p>" +
        '<p class="lab">' + esc(R.reactiveLab) + "</p><p>" + esc(P.reactive) + "</p>" +
        '<p class="lab">' + esc(R.healingLab) + "</p><p>" + esc(P.healing) + "</p>";
    }
    imago += '<p class="lab">' + esc(R.imagoQuestionsLab) + "</p>" + ul(pat.questions);
    if (profile.pastAbuse) imago += "<p>" + esc(profile.pastAbuse) + "</p>";
    imago += '<p class="muted">' + esc(R.imagoDisclaimer) + "</p><p class=\"muted\">" + esc(R.imagoCredit) + "</p></div>";

    const nourrit = profile.needs.top.filter(Boolean).map(function (id) {
      const N = D.needs[id];
      return '<div class="panel"><h3>' + esc(N.name) + "</h3><p>" + esc(N.desc) + '</p><p class="lab">' + esc(R.needsPartnerLab) + "</p><p>" + esc(N.partner) + "</p></div>";
    }).join("") +
      '<div class="panel ctx-bad"><p>' + esc(R.antiIntro) + "</p><p>" + esc(D.needs[profile.needs.anti].anti) + "</p></div>";

    const recharge = D.recharge[profile.recharge.soir];
    const weekend = D.recharge[profile.recharge.weekend];
    let ress = "<p>" + esc(profile.recharge.line) + "</p><p>" + esc(recharge.couple) + "</p>";
    if (!profile.recharge.same) ress += "<p>" + esc(weekend.couple) + "</p>";
    ress += '<p class="lab">' + esc(R.drainsLab) + "</p>" + ul(profile.recharge.drains.map(function (id) { return D.drains[id].label; }));
    ress += "<p>" + esc(R.rechargeRule) + "</p>";

    const pairs = '<p class="lab">' + esc(R.pairsLab) + "</p>" + ul(en.pairs.map(function (p) {
      return fill(R.pairPrefix, { name: D.instincts[p.partner].name }) + " " + p.text;
    }));
    const enneaHtml =
      "<h3>Type " + esc(String(type.n)) + ", " + esc(type.name) + "</h3>" +
      "<p>" + esc(en.confidenceText) + "</p><p>" + esc(type.couple) + "</p>" +
      "<p><strong>" + esc(R.piegeLab) + "</strong> " + esc(type.piege) + "</p>" +
      "<h3>" + esc(instinct.name) + "</h3><p>" + esc(instinct.desc) + "</p><p>" + esc(en.instinctLine) + "</p>" +
      pairs + "<p class=\"muted\">" + esc(R.pairsNote) + "</p>" +
      '<p class="muted">' + esc(D.ennea.disclaimer) + "</p><p class=\"muted\">" + esc(D.ennea.credit) + "</p>";

    const quotidien = profile.quotidien.items.map(function (it) {
      let line = "<p><strong>" + esc(it.name) + ".</strong> " + esc(it.note) + "</p>";
      if (it.complement) line += "<p>" + esc(it.complement) + "</p>";
      if (it.friction) line += "<p>" + esc(it.friction) + "</p>";
      return line;
    }).join("") +
      (profile.quotidien.noFriction ? "<p>" + esc(profile.quotidien.noFriction) + "</p>" : "") +
      (profile.quotidien.noComplement ? "<p>" + esc(profile.quotidien.noComplement) + "</p>" : "");

    function flawCol(title, ids) {
      const labels = ids.map(function (id) { return D.flaws[id].label; });
      return '<div class="panel"><p class="lab">' + esc(title) + "</p>" + (labels.length ? ul(labels) : "<p>aucun</p>") + "</div>";
    }
    const flawsHtml = "<p>" + esc(R.flawsIntro) + "</p>" + flawCol("Acceptable", profile.flaws.ok) + flawCol("À discuter", profile.flaws.discuter) + flawCol("Non négociable", profile.flaws.nn) +
      (profile.flaws.note ? "<p>" + esc(profile.flaws.note) + "</p>" : "");

    let nnHtml = '<div class="prose"><p>' + esc(R.nnIntro) + "</p></div><div class=\"panel\">";
    if (bothCriticalEmpty) nnHtml += "<p>" + esc(R.nnNoneCritical) + "</p>";
    else {
      if (nn.values.length) nnHtml += '<p class="lab">' + esc(R.nnCriticalLab) + "</p>" + ul(nn.values);
      if (nn.flaws.length) nnHtml += '<p class="lab">' + esc(R.nnFlawsLab) + "</p>" + ul(nn.flaws);
    }
    if (nn.strong.length) nnHtml += '<p class="lab">' + esc(R.nnStrongLab) + "</p>" + ul(nn.strong);
    if (nn.soft.length) nnHtml += '<p class="lab">' + esc(R.nnSoftLab) + "</p>" + ul(nn.soft);
    nnHtml += '<p class="lab">' + esc(R.nnUniversalLab) + "</p>" + ul(nn.universal) + "</div>";

    const partner =
      '<div class="prose"><p>' + esc(R.partnerIntro) + "</p></div>" +
      '<div class="panel ctx-good"><p class="lab">' + esc(R.completeLab) + "</p>" + ul(profile.partner.complete) + "</div>" +
      '<div class="panel"><p class="lab">' + esc(R.frictionLab) + "</p>" + ul(profile.partner.friction) + "</div>" +
      '<div class="panel ctx-bad"><p class="lab">' + esc(R.criticalLab) + "</p>" + ul(profile.partner.critical) + "</div>" +
      "<h3>" + esc(R.gridH) + "</h3>" +
      D.riskGrid.map(function (g) {
        return '<div class="panel"><p class="lab">' + esc(g.level) + "</p><h3>" + esc(g.label) + "</h3><p>" + esc(g.text) + "</p></div>";
      }).join("");

    const matchingHtml = esc(fill(R.matchingP, { email: D.config.matchingEmail })).replace(
      esc(D.config.matchingEmail),
      '<a href="mailto:' + esc(D.config.matchingEmail) + '">' + esc(D.config.matchingEmail) + "</a>"
    );
    const boussoleBtn = '<a class="btn" data-act="boussole" href="' + esc(boussoleHref) + '" target="_blank" rel="noopener noreferrer">' + esc(R.boussoleBtn) + "</a>";

    function section(id, title, body) {
      return '<section class="rs" id="' + id + '"><h2>' + esc(title) + "</h2>" + body + "</section>";
    }

    root.innerHTML =
      (profile.safety ? '<div class="panel ctx-bad" role="alert"><p class="lab">' + esc(profile.safety.title) + "</p><p>" + esc(profile.safety.text) + "</p></div>" : "") +
      '<div class="rhead">' +
        '<span class="eyebrow">' + esc(fill(R.eyebrow, { prenom: profile.prenom })) + "</span>" +
        '<h2 class="alloy">' + esc(R.titlePrefix) + " <em>" + esc(profile.title) + "</em></h2>" +
      "</div>" +
      '<div class="panel" id="sec-phrases"><h3>' + esc(R.sentencesH) + "</h3>" +
        profile.sentences.map(function (s) { return "<p>" + esc(s) + "</p>"; }).join("") +
        '<p class="muted">' + esc(D.ennea.disclaimer) + "</p></div>" +
      '<div class="row-actions">' +
        '<a class="btn" data-cta-place="quiz_amour_3phrases" href="' + esc(D.config.calendly) + '" target="_blank" rel="noopener noreferrer">' + esc(R.ctaBtn) + "</a>" +
        boussoleBtn +
        '<button type="button" class="btn ghost" data-act="copy-short">' + esc(R.copyShortBtn) + "</button>" +
        '<span class="toast" id="am-toast-short" aria-live="polite"></span>' +
      "</div>" +
      '<p class="muted">' + esc(R.boussoleNote) + "</p>" +
      "<details><summary>" + esc(R.detailsSummary) + "</summary><div>" +
        section("sec-nourrit", R.nourritH, nourrit) +
        section("sec-ress", R.ressH, '<div class="panel">' + ress + "</div>") +
        section("sec-lang", R.langH, langPanel("recv", L) + langPanel("give", L) + '<p>' + esc(L.gap) + '</p><p class="muted">' + esc(R.langCredit) + "</p>") +
        section("sec-ennea", R.enneaH, '<div class="panel">' + enneaHtml + "</div>") +
        section("sec-quotidien", R.quotidienH, quotidien) +
        section("sec-flaws", R.flawsH, flawsHtml) +
        section("sec-nn", R.nnH, nnHtml) +
        section("sec-partner", R.partnerH, partner) +
        section("sec-imago", R.imagoH, imago) +
        section("sec-key", R.keyH, '<div class="prose">' + ul(profile.keyMessages) + "</div>") +
      "</div></details>" +
      '<section class="rs" id="sec-cta"><div class="cta" data-cta-place="quiz_amour_resultat">' +
        '<span class="eyebrow">' + esc(R.ctaEyebrow) + "</span><h3>" + esc(R.ctaH) + "</h3><p>" + esc(R.ctaP) + "</p><p>" + esc(R.ctaSign) + "</p>" +
        '<div class="cta-actions"><a class="btn" href="' + esc(D.config.calendly) + '" target="_blank" rel="noopener noreferrer">' + esc(R.ctaBtn) + "</a>" +
        '<a class="btn alt" href="' + esc(D.config.site) + '" target="_blank" rel="noopener noreferrer">' + esc(R.siteBtn) + "</a></div></div></section>" +
      section("sec-boussole", R.boussoleLab, '<div class="panel"><p>' + esc(R.boussoleP) + '</p><div class="row-actions">' + boussoleBtn + "</div></div>") +
      section("sec-export", R.exportH,
        '<div class="panel"><p>' + esc(R.exportP) + '</p><textarea id="am-export" readonly>' + esc(profile.exportText) + "</textarea>" +
        '<textarea id="am-share" readonly hidden>' + esc(profile.shareText) + "</textarea>" +
        '<div class="row-actions"><button type="button" class="btn" data-act="copy">' + esc(R.copyBtn) + '</button><span class="toast" id="am-toast" aria-live="polite"></span></div></div>') +
      section("sec-matching", R.matchingH, '<div class="panel"><p class="muted">' + matchingHtml + "</p></div>") +
      section("sec-ethics", R.ethicsH,
        '<div class="prose"><p>' + esc(R.ethicsP) + '</p><p><a class="link" href="/quiz-amour/">' + esc(R.restart) + "</a></p></div>");

    root.dataset.share = profile.shareText;
    answers = {};
    scrollTop();
  }

  function rememberTheme() {
    try { sessionStorage.setItem("mh_theme", "amour"); } catch (e) { /* mode privé */ }
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
    const s = screenAt(qi);

    if (act === "start") { startQuiz(); return; }
    if (act === "pm-plus" && s && s.type === "plusminus") { toggleSign("plus", btn.getAttribute("data-id")); showQuestion(false); return; }
    if (act === "pm-minus" && s && s.type === "plusminus") { toggleSign("minus", btn.getAttribute("data-id")); showQuestion(false); return; }
    if (act === "opt" && s && s.type === "blocks") { setBlock(btn.getAttribute("data-block"), btn.getAttribute("data-id")); showQuestion(false); return; }
    if (act === "second" && s && s.type === "blocks") {
      const id = btn.getAttribute("data-id");
      setBlock(btn.getAttribute("data-block"), id ? id : null);
      showQuestion(false);
      return;
    }
    if (act === "multi" && s && s.type === "blocks") {
      const blockId = btn.getAttribute("data-block");
      const id = btn.getAttribute("data-id");
      const block = s.blocks.filter(function (b) { return b.id === blockId; })[0];
      const cur = Object.assign({}, bag(s.id));
      const chosen = Array.isArray(cur[blockId]) ? cur[blockId].slice() : [];
      const at = chosen.indexOf(id);
      if (at !== -1) chosen.splice(at, 1);
      else if (chosen.length < block.max) chosen.push(id);
      cur[blockId] = chosen;
      answers[s.id] = cur;
      showQuestion(false);
      return;
    }
    if (act === "self" && s && s.type === "blocks") { setBlock(btn.getAttribute("data-block"), btn.getAttribute("data-id")); showQuestion(false); return; }
    if (act === "sort" && s && s.type === "sort") {
      const id = btn.getAttribute("data-id");
      const col = btn.getAttribute("data-col");
      const cur = Object.assign({}, bag(s.id));
      if (cur[id] === col) delete cur[id];
      else cur[id] = col;
      answers[s.id] = cur;
      showQuestion(false);
      return;
    }
    if (act === "pos" && s && s.type === "values") {
      const topicId = btn.getAttribute("data-topic");
      const opt = topicOf(topicId).options.filter(function (o) { return o.id === btn.getAttribute("data-id"); })[0];
      const cur = Object.assign({}, bag(s.id));
      const prev = cur[topicId] || {};
      cur[topicId] = opt.neutral ? { pos: opt.id } : { pos: opt.id, firm: prev.firm };
      answers[s.id] = cur;
      showQuestion(false);
      return;
    }
    if (act === "firm" && s && s.type === "values") {
      const topicId = btn.getAttribute("data-topic");
      const cur = Object.assign({}, bag(s.id));
      const prev = cur[topicId] || {};
      cur[topicId] = { pos: prev.pos, firm: btn.getAttribute("data-id") };
      answers[s.id] = cur;
      showQuestion(false);
      return;
    }
    if (act === "choice" && s && s.type === "single") { answers[s.id] = btn.getAttribute("data-id"); showQuestion(false); return; }
    if (act === "prev") {
      if (qi <= 0) showIntro();
      else { qi -= 1; showQuestion(true); }
      return;
    }
    if (act === "next") {
      if (!s || screenBad(s)) return;
      if (qi < D.screens.length - 1) { qi += 1; showQuestion(true); return; }
      const snapshot = answers;
      let profile;
      try { profile = E.computeLoveProfile(snapshot, D, prenom); }
      catch (e) { return; }
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
    }
  });

  showIntro();
})();
