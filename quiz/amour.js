/* Quiz Amour v1.3 · 10 questions, classement, résultats.
   Démarre uniquement si quiz/index.html a posé MH_THEME = "amour".
   Aucune réponse n'est envoyée ni gardée. La sécurité, les textes libres,
   le prénom et l'ennéagramme ne partent pas vers un serveur. */
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
    "#screen-amour .am-title{font-size:clamp(1.35rem,4.6vw,1.75rem);font-weight:800;line-height:1.25;margin:8px 0}",
    "#screen-amour .am-help{color:var(--muted);margin:0 0 8px}",
    "#screen-amour .am-counters{position:sticky;top:0;z-index:2;background:var(--bg);display:flex;flex-wrap:wrap;gap:8px;padding:8px 0}",
    "#screen-amour .am-count{font-weight:700;font-size:1rem;border-radius:999px;padding:6px 12px;background:var(--surface);border:1px solid var(--line)}",
    "#screen-amour .am-count.is-ok{background:var(--good-soft);color:var(--good)}",
    "#screen-amour .am-group{margin:14px 0}",
    "#screen-amour .am-gh{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin:0 0 8px}",
    "#screen-amour .am-gh h3{font-size:1.1rem;font-weight:700;margin:0}",
    "#screen-amour .am-picks{display:grid;grid-template-columns:1fr;gap:10px}",
    "@media(min-width:720px){#screen-amour .am-picks{grid-template-columns:1fr 1fr}}",
    "#screen-amour .am-pick{min-height:64px;padding:14px 16px;border-radius:14px;border:1px solid var(--line);background:var(--surface);display:flex;gap:12px;align-items:flex-start;cursor:pointer;text-align:left;width:100%;font:inherit;color:inherit}",
    "#screen-amour .am-pick input[type=checkbox],#screen-amour .am-safety input{width:24px;height:24px;min-width:24px;margin-top:2px;accent-color:var(--accent)}",
    "#screen-amour .am-pick.is-on{border:2px solid var(--accent);background:var(--accent-soft)}",
    "#screen-amour .am-pick-label{font-size:1.08rem;font-weight:600;display:block}",
    "#screen-amour .am-pick-hint{color:var(--muted);font-size:.95rem;display:block;margin-top:2px}",
    "#screen-amour .am-other-input,#screen-amour textarea,#screen-amour .am-who{width:100%;margin-top:8px;font:inherit;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}",
    "#screen-amour .am-rank{list-style:none;margin:8px 0;padding:0;display:flex;flex-direction:column;gap:8px}",
    "#screen-amour .am-rank-item{display:grid;grid-template-columns:28px 44px minmax(0,1fr) 44px 44px;gap:6px;align-items:center;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:8px}",
    "#screen-amour .am-rank-item.has-remove{grid-template-columns:28px 44px minmax(0,1fr) 44px 44px 44px}",
    "#screen-amour .am-rank-item.is-dragging{position:relative;z-index:3;box-shadow:0 8px 24px rgba(0,0,0,.12);transform:scale(1.02)}",
    "#screen-amour .am-rank-pos{font-weight:800;text-align:center}",
    "#screen-amour .am-handle,#screen-amour .am-up,#screen-amour .am-down,#screen-amour .am-remove{width:44px;height:44px;min-width:44px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;font-weight:700;cursor:pointer;touch-action:none}",
    "#screen-amour .am-handle{touch-action:none}",
    "#screen-amour .am-up:disabled,#screen-amour .am-down:disabled{opacity:.35;cursor:not-allowed}",
    "#screen-amour .am-divider{list-style:none;text-align:center;color:var(--muted);font-size:.95rem;padding:6px 0}",
    "#screen-amour .am-divider::before,#screen-amour .am-divider::after{content:'';display:inline-block;width:18%;height:1px;background:var(--line);vertical-align:middle;margin:0 8px}",
    "#screen-amour .am-pool{margin-top:12px}",
    "#screen-amour .am-badge{display:inline-block;font-size:.85rem;font-weight:700;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 10px;margin-bottom:8px}",
    "#screen-amour .am-chip{min-height:44px;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;cursor:pointer}",
    "#screen-amour .am-chip[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:#fff}",
    "#screen-amour .am-chips{display:flex;flex-wrap:wrap;gap:8px}",
    "#screen-amour .am-safety{margin-top:22px;padding-top:14px;border-top:1px solid var(--line);font-size:.95rem}",
    "#screen-amour .am-safety legend{font-size:.95rem;margin-bottom:8px}",
    "#screen-amour .am-add{margin-top:8px}",
    "#screen-amour .am-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}",
    "#screen-amour .am-more{color:var(--muted);font-size:.95rem}",
    "#screen-amour .qnav{position:sticky;bottom:var(--mh-cookie-banner-h,0px);z-index:4;background:var(--bg);padding-top:8px}",
    "#screen-amour details .am-split{display:grid !important;grid-template-columns:1fr;gap:10px}",
    "@media(min-width:720px){#screen-amour details .am-split.cols-2{grid-template-columns:1fr 1fr}#screen-amour details .am-split.cols-3{grid-template-columns:1fr 1fr 1fr}}",
    "@media(prefers-reduced-motion:reduce){#screen-amour .am-rank-item{transition:none !important}}"
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
  let answers = {};
  let lastPrefix = "";
  let held = null;
  let focusSel = "";
  let pendingLive = "";

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

  function deficit(s) {
    if (s.type === "pick" && !(s.rank && s.rank.mode === "step" && phase === "rank")) {
      return s.groups.reduce(function (sum, g) { return sum + Math.max(0, g.min - chosenIds(s, g).length); }, 0);
    }
    if (s.type === "rank" || (s.rank && phase === "rank")) {
      if (s.type === "rank") return Math.max(0, s.minRanked - ensure(s).order.length);
      return 0;
    }
    if (s.type === "commit") {
      const bag = ensure(s);
      const textOk = String(bag.engagement || "").trim().length >= s.engagement.minLength;
      return (textOk ? 0 : 1) + (bag.moment ? 0 : 1);
    }
    return 0;
  }

  function counterText(label, x, min, ok) {
    const base = label ? fill(Q.counter, { label: label, x: x, min: min }) : fill(Q.counterBare, { x: x, min: min });
    return base + (ok ? " " + Q.counterOk : "");
  }

  function countersHtml(s) {
    const bits = [];
    if (s.type === "pick" && phase !== "rank") {
      s.groups.forEach(function (g) {
        const x = chosenIds(s, g).length;
        const ok = x >= g.min;
        bits.push('<span class="am-count' + (ok ? " is-ok" : "") + '">' + esc(counterText(g.counter, x, g.min, ok)) + "</span>");
      });
    } else if (s.type === "rank") {
      const x = ensure(s).order.length;
      const ok = x >= s.minRanked;
      bits.push('<span class="am-count' + (ok ? " is-ok" : "") + '">' + esc(fill(Q.rankCounter, { x: x, min: s.minRanked }) + (ok ? " " + Q.counterOk : "")) + "</span>");
    } else if (s.type === "commit") {
      const bag = ensure(s);
      const x = (String(bag.engagement || "").trim().length >= 5 ? 1 : 0) + (bag.moment ? 1 : 0);
      const ok = x >= 2;
      bits.push('<span class="am-count' + (ok ? " is-ok" : "") + '">' + esc(fill(Q.engagementCounter, { x: x, min: 2 }) + (ok ? " " + Q.counterOk : "")) + "</span>");
    } else if (s.rank && phase === "rank") {
      s.rank.groups.forEach(function (gid) {
        const g = s.groups.find(function (x) { return x.id === gid; });
        const x = (ensure(s).order[gid] || []).length;
        bits.push('<span class="am-count is-ok">' + esc(counterText(g.counter, x, g.min, true)) + "</span>");
      });
    }
    return '<div class="am-counters" aria-live="polite">' + bits.join("") + "</div>";
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
    return '<li class="am-rank-item' + (removable ? " has-remove" : "") + '" data-id="' + esc(id) + '">' +
      '<span class="am-rank-pos">' + (index + 1) + "</span>" +
      '<button type="button" class="am-handle" id="' + esc(handleId) + '" aria-label="' + esc("Déplacer « " + label + " »") + '" aria-describedby="am-rank-help">⠿</button>' +
      '<span class="am-rank-label">' + esc(label) + "</span>" +
      '<button type="button" class="am-up" data-act="up" data-group="' + esc(gid || "") + '" data-index="' + index + '" aria-label="' + esc(Q.up + " « " + label + " »") + '"' + (index === 0 ? " disabled" : "") + ">↑</button>" +
      '<button type="button" class="am-down" data-act="down" data-group="' + esc(gid || "") + '" data-index="' + index + '" aria-label="' + esc(Q.down + " « " + label + " »") + '"' + (index === total - 1 ? " disabled" : "") + ">↓</button>" +
      (removable ? '<button type="button" class="am-remove" data-act="remove" data-id="' + esc(id) + '" aria-label="' + esc(Q.remove.replace("du classement", "« " + label + " » du classement")) + '">×</button>' : "") +
      "</li>";
  }

  function listHtml(s, gid, ids, removable, divider) {
    let html = '<ol class="am-rank" data-group="' + esc(gid || "") + '">';
    ids.forEach(function (id, i) {
      html += rankItemHtml(s, gid, id, i, ids.length, removable);
      if (divider && divider.group === gid && i + 1 === divider.after) {
        html += '<li class="am-divider" aria-hidden="true">' + esc(divider.text) + "</li>";
      }
    });
    if (divider && divider.group === gid && ids.length === divider.after) {
      /* déjà inséré après le dernier */
    }
    return html + "</ol>";
  }

  function pickHtml(s) {
    return s.groups.map(function (g) {
      const bag = ensure(s);
      const picked = bag.picked[g.id] || [];
      let html = '<section class="am-group">';
      if (g.title) {
        const x = chosenIds(s, g).length;
        html += '<div class="am-gh"><h3>' + esc(g.title) + "</h3><span class=\"am-count" + (x >= g.min ? " is-ok" : "") + "\">" + esc(counterText(g.counter, x, g.min, x >= g.min)) + "</span></div>";
      }
      if (g.help) html += '<p class="am-help">' + esc(g.help) + "</p>";
      html += '<div class="am-picks">';
      g.items.forEach(function (it) {
        const on = picked.indexOf(it.id) !== -1;
        html += '<label class="am-pick' + (on ? " is-on" : "") + '"><input type="checkbox" data-act="check" data-group="' + esc(g.id) + '" data-id="' + esc(it.id) + '"' + (on ? " checked" : "") + "><span><span class=\"am-pick-label\">" + esc(it.label) + "</span>" +
          (it.hint ? '<span class="am-pick-hint">' + esc(it.hint) + "</span>" : "") + "</span></label>";
      });
      if (g.other) {
        const shown = Math.max(1, (bag.other[g.id] || []).length);
        const max = g.other.max || 1;
        for (let i = 0; i < Math.min(shown, max); i++) {
          const val = (bag.other[g.id] || [])[i] || "";
          const on = val.trim().length > 0;
          html += '<div class="am-pick' + (on ? " is-on" : "") + '"><input type="checkbox" data-act="other-check" data-group="' + esc(g.id) + '" data-index="' + i + '"' + (on ? " checked" : "") + '><span><span class="am-pick-label">' + esc(g.other.label) + '</span><input class="am-other-input" id="am-other-' + esc(g.id) + "-" + i + '" data-act="other" data-group="' + esc(g.id) + '" data-index="' + i + '" maxlength="' + g.other.maxLength + '" placeholder="' + esc(g.other.placeholder || "") + '" value="' + esc(val) + '"></span></div>';
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
      return "<section><h3>" + esc(g.title || g.counter || "") + "</h3>" + listHtml(s, gid, ids, false, s.rank.divider) + "</section>";
    }).join("");
  }

  function directRankHtml(s) {
    const order = ensure(s).order;
    const left = s.items.filter(function (it) { return order.indexOf(it.id) === -1; });
    let html = "<h3>" + esc(Q.rankZone) + "</h3>";
    if (!order.length) html += '<p class="am-help">' + esc(Q.rankEmpty) + "</p>";
    html += listHtml(s, "", order, true, null);
    html += '<div class="am-pool am-picks">';
    left.forEach(function (it) {
      html += '<button type="button" class="am-pick" data-act="pool" data-id="' + esc(it.id) + '"><span><span class="am-pick-label">' + esc(it.label) + "</span>" +
        (it.hint ? '<span class="am-pick-hint">' + esc(it.hint) + "</span>" : "") + "</span></button>";
    });
    html += "</div>";
    if (s.footnote) html += '<p class="am-help">' + esc(s.footnote) + "</p>";
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
    let html = '<div class="am-chips">';
    D.nextSteps.forEach(function (step) {
      html += '<button type="button" class="am-chip" data-act="example" data-id="' + esc(step.id) + '">' + esc(step.label) + "</button>";
    });
    html += "</div>";
    html += '<p class="am-blockq" style="font-weight:700;margin-top:14px">' + esc(Q.engagementLabel) + "</p>";
    html += '<textarea id="am-engagement" rows="2" maxlength="140" placeholder="' + esc(s.engagement.placeholder) + '">' + esc(bag.engagement || "") + "</textarea>";
    html += '<p class="am-help">' + esc(fill(Q.chars, { n: String(bag.engagement || "").length, max: 140 })) + "</p>";
    html += "<h3>" + esc(Q.shareBlock) + "</h3>";
    html += '<label>' + esc(Q.whoLabel) + ' <input class="am-who" id="am-who" maxlength="40" placeholder="' + esc(s.share.whoPlaceholder) + '" value="' + esc(bag.who || "") + '"></label>';
    html += '<p style="font-weight:700;margin-top:12px">' + esc(Q.whenLabel) + "</p><div class=\"am-chips\">";
    D.moments.forEach(function (m) {
      const on = bag.moment === m.id;
      html += '<button type="button" class="am-chip" data-act="moment" data-id="' + esc(m.id) + '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(m.label) + "</button>";
    });
    html += "</div>";
    html += '<fieldset class="am-safety"><legend>' + esc(s.safety.text) + "</legend>";
    s.safety.options.forEach(function (o) {
      const on = bag.safety === o.id;
      html += '<label class="am-pick' + (on ? " is-on" : "") + '" style="margin-top:8px"><input type="radio" name="am-safety" data-act="safety" data-id="' + esc(o.id) + '"' + (on ? " checked" : "") + "><span class=\"am-pick-label\">" + esc(o.label) + "</span></label>";
    });
    html += '<p class="am-help">' + esc(s.safety.note) + "</p></fieldset>";
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
    html += '<p class="am-help">' + esc(fill(Q.idea, { antidote: antidote })) + "</p>";
    if ((bag.picked.actions || []).indexOf("rappel") !== -1) {
      html += '<p style="font-weight:700">' + esc(Q.timeAsk) + '</p><div class="am-chips">';
      D.times.forEach(function (t) {
        const on = bag.time === t.id;
        html += '<button type="button" class="am-chip" data-act="time" data-id="' + esc(t.id) + '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(t.label) + "</button>";
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
    return "<section><h3>" + esc(s.rank.title) + "</h3><p class=\"am-help\">" + esc(Q.rankHelp) + "</p>" + listHtml(s, gid, ids, false, null) + "</section>";
  }

  function shell(s, title, help, body, buttonLabel, scroll) {
    const n = D.screens.length;
    const k = deficit(s);
    const ok = k === 0;
    const segs = D.screens.map(function (_, i) {
      return '<span class="' + (i < qi || (i === qi && ok) ? "done" : "") + '"></span>';
    }).join("");
    const suffix = s.rank && s.rank.mode === "step" && phase === "rank" ? Q.rankSuffix : "";
    root.innerHTML =
      '<div class="progress" aria-hidden="true">' + segs + "</div>" +
      '<div class="qhead"><span class="eyebrow">' + esc(fill(Q.progress, { i: s.n, n: n }) + " · " + s.eyebrow + suffix) + "</span>" +
      (s.badge && phase !== "rank" ? '<div class="am-badge">' + esc(s.badge) + "</div>" : "") +
      '<h2 class="am-title">' + esc(title) + "</h2>" +
      (help ? '<p class="am-help">' + esc(help) + "</p>" : "") +
      "</div>" +
      countersHtml(s) +
      body +
      '<p id="am-rank-help" class="am-sr">' + esc(Q.rankHelp) + "</p>" +
      '<p id="am-live" class="am-sr" aria-live="polite"></p>' +
      '<div class="qnav"><button type="button" class="btn ghost" data-act="prev">' + esc(Q.prev) + "</button>" +
      '<span class="am-more">' + (ok ? "" : esc(fill(Q.more, { k: k }))) + "</span>" +
      '<button type="button" class="btn" data-act="next"' + (ok ? "" : " disabled") + ' aria-disabled="' + (ok ? "false" : "true") + '">' + esc(buttonLabel) + "</button></div>";
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
  }

  function showIntro() {
    const I = U.intro;
    root.innerHTML =
      '<div class="hero"><span class="eyebrow">' + esc(I.eyebrow) + "</span><h1>" + I.h1 + '</h1><p class="lead">' + esc(I.lead) + "</p></div>" +
      '<div class="stack-lg" style="padding-top:18px"><ul class="clean">' + I.bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" +
      '<p class="howto-tip">' + esc(I.howto) + "</p>" +
      '<div class="hello"><div class="field"><label for="am-prenom">' + esc(I.nameLabel) + "</label>" +
      '<input id="am-prenom" autocomplete="given-name" maxlength="40" value="' + esc(prenom) + '">' +
      '<p class="muted">' + esc(I.nameHelp) + "</p></div>" +
      '<button class="btn" type="button" data-act="start">' + esc(I.start) + "</button></div></div>";
    const input = document.getElementById("am-prenom");
    if (input) input.focus();
    scrollTop();
  }

  function showQuestion(scroll) {
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
    const button = s.rank && s.rank.mode === "step" ? s.rank.cta : (qi === D.screens.length - 1 ? Q.finish : Q.next);
    let body = pickHtml(s);
    if (s.id === "demain") body += demainExtra(s);
    if (s.rank && s.rank.mode === "inline") body += inlineRank(s);
    shell(s, s.title, s.help, body, button, scroll);
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

  function showResults(profile) {
    const named = prenom;
    const head = named ? fill(R.headerNamed, { prenom: named }) : R.headerAnon;
    const boussoleHref = D.config.boussoleUrl + "#amour=" + E.encodePayload(profile.boussole);
    const boussoleBtn = '<a class="btn" data-act="boussole" href="' + esc(boussoleHref) + '" target="_blank" rel="noopener noreferrer">' + esc(R.boussoleBtn) + "</a>";

    function ol(title, rows) {
      return "<h3>" + esc(title) + "</h3><ol>" + rows.map(function (row) { return "<li>" + esc(row) + "</li>"; }).join("") + "</ol>";
    }
    const glance =
      ol(R.nourritLab, profile.nourrit.slice(0, 3).map(function (c) { return c.short; })) +
      ol(R.videLab, profile.vide.map(function (c, i) { return c.short + (i === 0 ? " (" + R.noMoreMark + ")" : ""); })) +
      ol(R.langLab, profile.languages.order.map(function (id) { return screenAt(2).items.find(function (it) { return it.id === id; }).label; })) +
      ol(R.valuesLab, profile.values.order.map(function (v, i) { return v.short + (i < 3 ? " (" + R.nnMark + ")" : ""); })) +
      ol(R.instinctLab, [profile.ennea.instinct, profile.ennea.instinct2, profile.ennea.instinctLast].filter(Boolean).map(function (id) {
        return screenAt(5).items.find(function (it) { return it.id === id; }).label;
      })) +
      "<h3>" + esc(R.rechargeLab) + "</h3><p>" + esc(D.recharge[profile.recharge.profile].title + (function () {
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
      })()) + "</p>" +
      "<h3>" + esc(R.stressLab) + "</h3><p>" + esc("modéré → " + profile.stress.modere.map(function (id) { return D.stress.modere[id].short; }).join(", ") + " · fort → " + profile.stress.fort.map(function (id) { return D.stress.fort[id].short; }).join(", ")) + "</p>" +
      "<h3>" + esc(R.brakeLab) + "</h3><p>" + esc((function () {
        const g = D.screens.find(function (s) { return s.id === "freins"; }).groups[0];
        const it = g.items.find(function (item) { return item.id === profile.brakes.first; });
        return (it ? it.label : "") + " " + profile.brakes.antidote;
      })()) + "</p>" +
      "<h3>" + esc(R.demainLab) + "</h3><p>" + esc(profile.demain.actions.map(function (id) {
        return id === "rappel" ? fill(D.actions.rappel, { heure: (D.times.find(function (t) { return t.id === profile.demain.time; }) || {}).label || "" }) : D.actions[id];
      }).join(" ")) + "</p>" +
      (profile.demain.actions.indexOf("rappel") !== -1 ? '<p><button type="button" class="btn alt" data-act="ics">' + esc(R.icsBtn) + "</button></p>" : "") +
      "<h3>" + esc(R.stepLab) + "</h3><p>" + esc("« " + profile.etape.engagement + " »" + (profile.etape.who ? " · " + fill(R.shareWith, { who: profile.etape.who }) : "") + " · " + (D.moments.find(function (m) { return m.id === profile.etape.moment; }) || {}).label) + "</p>";

    const type = D.ennea.types[profile.ennea.type];
    const detail =
      "<section><h2>" + esc(R.needsH) + "</h2><p>" + esc(D.needs[profile.needs.top[0]].desc) + "</p>" +
      (profile.needs.top[1] ? "<p>" + esc(D.needs[profile.needs.top[1]].desc) + "</p>" : "") +
      (profile.needs.anti ? "<p>" + esc(D.needs[profile.needs.anti].anti || D.needs[profile.needs.anti].danger || "") + "</p>" : "") + "</section>" +
      "<section><h2>" + esc(R.ressH) + "</h2><p>" + esc(profile.recharge.line) + "</p><p>" + esc(D.recharge[profile.recharge.profile].couple) + "</p><p>" + esc(D.recharge[profile.recharge.profile].fit) + "</p><p>" + esc(D.recharge[profile.recharge.profile].risk) + "</p><p>" + esc(R.rechargeRule) + "</p></section>" +
      "<section><h2>" + esc(R.langH) + "</h2>" + [profile.languages.lang1, profile.languages.lang2].filter(Boolean).map(function (id) {
        const L = D.languages[id];
        return "<p><strong>" + esc(L.name) + "</strong> " + esc(L.recv) + "</p><p>" + esc(R.tipsLab + " " + L.tips) + "</p>";
      }).join("") + "</section>" +
      "<section><h2>" + esc(R.enneaH) + "</h2><p>" + esc(type.couple) + "</p><p><strong>" + esc(R.piegeLab) + "</strong> " + esc(type.piege) + "</p>" +
      (profile.ennea.stressHint ? "<p>" + esc(profile.ennea.stressHint) + "</p>" : "") +
      "<p>" + esc(profile.ennea.confidenceText) + "</p><p class=\"muted\">" + esc(D.ennea.disclaimer) + "</p><p class=\"muted\">" + esc(D.ennea.credit) + "</p></section>" +
      "<section><h2>" + esc(R.instinctH) + "</h2><p>" + esc(D.instincts[profile.ennea.instinct].couple) + "</p>" +
      profile.ennea.pairs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      "<p class=\"muted\">" + esc(R.pairsNote) + "</p></section>" +
      "<section><h2>" + esc(R.stressH) + "</h2>" +
      profile.stress.modere.map(function (id) { return "<p>" + esc(D.stress.modere[id].text) + "</p>"; }).join("") +
      profile.stress.fort.map(function (id) { return "<p>" + esc(D.stress.fort[id].text) + " " + esc(D.stress.fort[id].tip) + "</p>"; }).join("") +
      "</section>" +
      "<section><h2>" + esc(R.brakesH) + "</h2>" + profile.brakes.all.map(function (id) {
        const own = String(id).indexOf("autre:") === 0;
        const short = own ? id : D.brakes[id].short;
        const antidote = own ? D.brakes.energie.antidote : D.brakes[id].antidote;
        return "<p><strong>" + esc(short) + "</strong> " + esc(antidote) + "</p>";
      }).join("") + "</section>" +
      "<section><h2>" + esc(R.partnerH) + "</h2><p>" + esc(R.partnerIntro) + "</p><div class=\"am-split cols-3\">" +
      '<div class="panel ctx-good"><p class="lab">' + esc(R.completeLab) + "</p>" + ul(profile.partner.complete) + "</div>" +
      '<div class="panel"><p class="lab">' + esc(R.frictionLab) + "</p>" + ul(profile.partner.friction) + "</div>" +
      '<div class="panel ctx-bad"><p class="lab">' + esc(R.criticalLab) + "</p>" + ul(profile.partner.critical) + "</div></div>" +
      "<h3>" + esc(R.gridH) + "</h3>" + D.riskGrid.map(function (g) {
        return '<div class="panel"><p class="lab">' + esc(g.level) + "</p><h3>" + esc(g.label) + "</h3><p>" + esc(g.text) + "</p></div>";
      }).join("") + "</section>" +
      (profile.pastAbuse ? "<section><h2>" + esc(R.pastH) + "</h2><p>" + esc(profile.pastAbuse) + "</p></section>" : "") +
      "<section><h2>" + esc(R.keyH) + "</h2>" + ul(profile.keyMessages) + "</section>";

    const matching = esc(fill(R.matchingP, { email: D.config.matchingEmail })).replace(esc(D.config.matchingEmail), '<a href="mailto:' + esc(D.config.matchingEmail) + '">' + esc(D.config.matchingEmail) + "</a>");

    root.innerHTML =
      (profile.safety ? '<div class="panel ctx-bad" role="alert"><p class="lab">' + esc(profile.safety.title) + "</p><p>" + esc(profile.safety.text) + "</p></div>" : "") +
      '<div class="rhead"><h2 class="alloy">' + esc(head) + "</h2></div>" +
      '<div class="panel" id="sec-phrases"><h3>' + esc(R.sentencesH) + "</h3>" +
      profile.sentences.map(function (s) { return "<p>" + esc(s) + "</p>"; }).join("") + "</div>" +
      '<div class="row-actions"><a class="btn" data-cta-place="quiz_amour_3phrases" href="' + esc(D.config.calendly) + '" target="_blank" rel="noopener noreferrer">' + esc(R.ctaBtn) + "</a>" +
      boussoleBtn +
      '<button type="button" class="btn ghost" data-act="copy-short">' + esc(R.copyShortBtn) + '</button><span class="toast" id="am-toast-short" aria-live="polite"></span></div>' +
      '<section id="sec-glance"><h2>' + esc(R.glanceH) + "</h2>" + glance + "</section>" +
      "<details><summary>" + esc(R.detailsSummary) + "</summary><div>" + detail + "</div></details>" +
      '<section class="rs" id="sec-cta"><div class="cta" data-cta-place="quiz_amour_resultat"><span class="eyebrow">' + esc(R.ctaEyebrow) + "</span><h3>" + esc(R.ctaH) + "</h3><p>" + esc(R.ctaP) + "</p><p>" + esc(R.ctaSign) + "</p>" +
      '<div class="cta-actions"><a class="btn" href="' + esc(D.config.calendly) + '" target="_blank" rel="noopener noreferrer">' + esc(R.ctaBtn) + "</a>" +
      '<a class="btn alt" href="' + esc(D.config.site) + '" target="_blank" rel="noopener noreferrer">' + esc(R.siteBtn) + "</a></div></div></section>" +
      '<section><h2>' + esc(R.boussoleLab) + "</h2><div class=\"panel\"><p>" + esc(R.boussoleP) + "</p><p class=\"muted\">" + esc(R.boussoleNote) + '</p><div class="row-actions">' + boussoleBtn + "</div></div></section>" +
      '<section><h2>' + esc(R.exportH) + '</h2><div class="panel"><p>' + esc(R.exportP) + '</p><textarea id="am-export" readonly>' + esc(profile.exportText) + "</textarea>" +
      '<textarea id="am-share" readonly hidden>' + esc(profile.shareText) + '</textarea><div class="row-actions"><button type="button" class="btn" data-act="copy">' + esc(R.copyBtn) + '</button><span class="toast" id="am-toast" aria-live="polite"></span></div></div></section>' +
      '<section><h2>' + esc(R.matchingH) + '</h2><div class="panel"><p class="muted">' + matching + "</p></div></section>" +
      '<section><h2>' + esc(R.ethicsH) + '</h2><div class="prose"><p>' + esc(R.ethicsP) + '</p><p><a class="link" href="/quiz-amour/">' + esc(R.restart) + "</a></p></div></section>";

    root.dataset.share = profile.shareText;
    root.dataset.ics = JSON.stringify({ engagement: profile.etape.engagement, time: profile.demain.time });
    answers = {};
    scrollTop();
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
      prenom = cleanName(ev.target.value);
      qi = 0;
      phase = "ask";
      showQuestion(true);
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
      const card = el.closest(".am-pick");
      const box = card.querySelector('input[type="checkbox"]');
      const on = arr[i].trim().length > 0;
      box.checked = on;
      card.classList.toggle("is-on", on);
      if (s.rank && s.rank.mode === "inline") resync(s);
      const k = deficit(s);
      const next = root.querySelector("[data-act=next]");
      if (next) { next.disabled = k > 0; next.setAttribute("aria-disabled", k > 0 ? "true" : "false"); }
      const more = root.querySelector(".am-more");
      if (more) more.textContent = k > 0 ? fill(Q.more, { k: k }) : "";
      return;
    }
    if (el.id === "am-engagement") {
      const bag = ensure(screenAt(qi));
      bag.engagement = el.value.replace(/[<>]/g, "").slice(0, 140);
      if (bag.engagement !== lastPrefix) lastPrefix = "";
      showQuestion(false);
      const area = document.getElementById("am-engagement");
      if (area) { area.focus(); area.setSelectionRange(area.value.length, area.value.length); }
    }
    if (el.id === "am-who") ensure(screenAt(qi)).who = el.value.replace(/[<>]/g, "").slice(0, 40);
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
      const input = document.getElementById("am-prenom");
      prenom = cleanName(input ? input.value : "");
      qi = 0;
      phase = "ask";
      showQuestion(true);
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
    if (act === "prev") {
      if (s && s.rank && s.rank.mode === "step" && phase === "rank") { phase = "ask"; showQuestion(true); return; }
      if (qi <= 0) { showIntro(); return; }
      qi -= 1;
      const prev = screenAt(qi);
      phase = prev.rank && prev.rank.mode === "step" && (ensure(prev).order[prev.rank.groups[0]] || []).length ? "rank" : "ask";
      showQuestion(true);
      return;
    }
    if (act === "next") {
      if (!s || deficit(s) > 0) return;
      if (s.rank && s.rank.mode === "step" && phase !== "rank") {
        resync(s);
        phase = "rank";
        showQuestion(true);
        return;
      }
      if (qi < D.screens.length - 1) {
        qi += 1;
        phase = "ask";
        showQuestion(true);
        return;
      }
      let profile;
      try { profile = E.computeLoveProfile(answers, D, prenom); }
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
      return;
    }
    if (act === "ics") icsFile();
  });

  showIntro();
})();
