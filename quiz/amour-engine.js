/* Quiz Amour v1.3 · moteur pur (aucun DOM). Déterministe : mêmes réponses, même résultat.
   Utilisé par quiz/amour.js (navigateur) et par quiz/amour.test.mjs (node --test). */
(function (root) {
  const ADJUSTABLE = ["energie", "frictions", "langage", "complementarite"];
  const ADJUST_LEVELS = ["tres_important", "important", "important", "moyen"];
  const WEIGHTS = { critique: 5, tres_important: 4, important: 3, moyen: 2 };

  function fill(tpl, vars) {
    return String(tpl == null ? "" : tpl).replace(/\{(\w+)\}/g, (_, k) => (vars == null || vars[k] == null ? "" : String(vars[k])));
  }
  const lc1 = (t) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t);

  function cleanFree(text, max) {
    return String(text || "").replace(/[<>]/g, "").trim().slice(0, max || 140);
  }

  function screenOf(D, id) {
    return D.screens.find((s) => s.id === id);
  }

  function groupOf(screen, groupId) {
    return screen && screen.groups ? screen.groups.find((g) => g.id === groupId) : null;
  }

  function bagOf(answers, screenId) {
    const bag = answers && answers[screenId];
    return bag && typeof bag === "object" ? bag : {};
  }

  function otherTexts(bag, group) {
    const max = group.other ? group.other.max || 1 : 0;
    const list = bag.other && Array.isArray(bag.other[group.id]) ? bag.other[group.id] : [];
    const out = [];
    for (let i = 0; i < max; i++) out.push(cleanFree(list[i], group.other.maxLength || 60));
    return out;
  }

  function chosen(answers, screen, group) {
    const bag = bagOf(answers, screen.id);
    const picked = bag.picked && Array.isArray(bag.picked[group.id]) ? bag.picked[group.id] : [];
    const ids = picked.filter((id) => group.items.some((it) => it.id === id));
    const texts = group.other ? otherTexts(bag, group) : [];
    texts.forEach((text, i) => {
      if (text) ids.push("autre:" + i);
    });
    return ids;
  }

  function sameSet(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    const set = new Set(a);
    return b.every((id) => set.has(id)) && new Set(b).size === b.length;
  }

  function ordered(answers, screen, group) {
    const ch = chosen(answers, screen, group);
    const bag = bagOf(answers, screen.id);
    const order = bag.order && Array.isArray(bag.order[group.id]) ? bag.order[group.id] : null;
    if (order && sameSet(order, ch)) return order.slice();
    return ch.slice();
  }

  function itemById(group, id) {
    return group.items.find((it) => it.id === id) || null;
  }

  function otherTextAt(answers, screen, group, index) {
    const bag = bagOf(answers, screen.id);
    const texts = group.other ? otherTexts(bag, group) : [];
    return texts[index] || "";
  }

  function shortOf(D, screen, groupId, id) {
    const group = groupOf(screen, groupId);
    if (!group) return "";
    if (String(id).indexOf("autre:") === 0) {
      const text = otherTextAt(D._answers, screen, group, Number(id.split(":")[1]));
      return lc1(text);
    }
    if (screen.id === "valeurs") {
      const row = D.values[id];
      return row ? row.short : "";
    }
    if (screen.id === "freins" && D.brakes[id]) return D.brakes[id].short;
    const item = itemById(group, id);
    return item && item.short ? item.short : "";
  }

  function labelOf(D, screen, groupId, id) {
    const group = groupOf(screen, groupId);
    if (!group) {
      const direct = screen.items && screen.items.find((it) => it.id === id);
      return direct ? direct.label : "";
    }
    if (String(id).indexOf("autre:") === 0) {
      const text = otherTextAt(D._answers, screen, group, Number(id.split(":")[1]));
      return text;
    }
    const item = itemById(group, id);
    return item ? item.label : "";
  }

  function rankingState(list, action) {
    const next = Array.isArray(list) ? list.slice() : [];
    if (!action || typeof action !== "object") return next;
    if (action.type === "move") {
      const from = action.from;
      const to = action.to;
      if (!Number.isInteger(from) || !Number.isInteger(to)) return next;
      if (from < 0 || from >= next.length || to < 0 || to >= next.length) return next;
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    }
    if (action.type === "up") {
      const i = action.index;
      if (!Number.isInteger(i) || i <= 0 || i >= next.length) return next;
      const [item] = next.splice(i, 1);
      next.splice(i - 1, 0, item);
      return next;
    }
    if (action.type === "down") {
      const i = action.index;
      if (!Number.isInteger(i) || i < 0 || i >= next.length - 1) return next;
      const [item] = next.splice(i, 1);
      next.splice(i + 1, 0, item);
      return next;
    }
    if (action.type === "add") {
      if (action.id == null || next.indexOf(action.id) !== -1) return next;
      next.push(action.id);
      return next;
    }
    if (action.type === "remove") {
      return next.filter((id) => id !== action.id);
    }
    return next;
  }

  function knownIds(group, ids) {
    const allowed = new Set(group.items.map((it) => it.id));
    return ids.every((id) => allowed.has(id) || String(id).indexOf("autre:") === 0);
  }

  function missingAnswers(answers, D) {
    const bad = [];
    const src = answers || {};
    for (const screen of D.screens) {
      if (screen.type === "pick") {
        const bag = bagOf(src, screen.id);
        for (const group of screen.groups) {
          const picked = bag.picked && Array.isArray(bag.picked[group.id]) ? bag.picked[group.id] : null;
          const raw = picked || [];
          const unknown = raw.some((id) => !group.items.some((it) => it.id === id));
          const dup = new Set(raw).size !== raw.length;
          const ch = chosen(src, screen, group);
          if (!picked || unknown || dup || ch.length < group.min || !knownIds(group, ch)) bad.push(screen.id + "." + group.id);
          if (screen.rank && screen.rank.mode === "step" && screen.rank.groups.indexOf(group.id) !== -1) {
            const order = bag.order && Array.isArray(bag.order[group.id]) ? bag.order[group.id] : null;
            if (!order || !sameSet(order, ch)) bad.push(screen.id + "." + group.id);
          }
        }
        if (screen.exclusive) {
          for (const pair of screen.exclusive) {
            const group = screen.groups[0];
            const ch = chosen(src, screen, group);
            if (pair.every((id) => ch.indexOf(id) !== -1)) bad.push(screen.id);
          }
        }
      } else if (screen.type === "rank") {
        const order = bagOf(src, screen.id).order;
        const allowed = new Set(screen.items.map((it) => it.id));
        const ok = Array.isArray(order)
          && order.length >= screen.minRanked
          && new Set(order).size === order.length
          && order.every((id) => allowed.has(id));
        if (!ok) bad.push(screen.id);
      } else if (screen.type === "commit") {
        const row = bagOf(src, screen.id);
        const moments = new Set((screen.share.moments || D.moments.map((m) => m.id)));
        if (!moments.has(row.moment)) bad.push(screen.id);
        for (const group of screen.groups || []) {
          const picked = row.picked && Array.isArray(row.picked[group.id]) ? row.picked[group.id] : null;
          const raw = picked || [];
          const unknown = raw.some((id) => !group.items.some((it) => it.id === id));
          const dup = new Set(raw).size !== raw.length;
          const ch = chosen(src, screen, group);
          if (!picked || unknown || dup || ch.length < group.min || !knownIds(group, ch)) bad.push(screen.id + "." + group.id);
        }
      }
    }
    return [...new Set(bad)];
  }

  function clipNote(text) {
    const t = String(text).replace(/\s+/g, " ").trim();
    if (t.length <= 300) return t;
    const head = t.slice(0, 297);
    const sp = head.lastIndexOf(" ");
    return (sp > 0 ? head.slice(0, sp) : head) + "...";
  }

  function putNote(notes, key, text) {
    if (!text) return;
    const clipped = clipNote(text);
    if (clipped) notes[key] = clipped;
  }

  function assignImportance(priority) {
    const sorted = [...ADJUSTABLE].sort((a, b) => priority[b] - priority[a] || ADJUSTABLE.indexOf(a) - ADJUSTABLE.indexOf(b));
    const assigned = {};
    sorted.forEach((key, i) => { assigned[key] = ADJUST_LEVELS[i]; });
    const imp = {};
    for (const key of ADJUSTABLE) imp[key] = assigned[key];
    return imp;
  }

  function pairKey(a, b) {
    const order = ["sp", "so", "sx"];
    return [a, b].sort((x, y) => order.indexOf(x) - order.indexOf(y)).join("-");
  }

  function typeLabel(D, id) {
    const t = D.ennea.types[id];
    return t ? "Type " + t.n + ", " + t.name : "";
  }

  function catalogShort(D, screen, groupId, id) {
    if (String(id).indexOf("autre:") === 0) return "";
    return shortOf(D, screen, groupId, id);
  }

  function dataOrder(group, ids) {
    const rank = new Map(group.items.map((it, i) => [it.id, i]));
    return ids.slice().sort((a, b) => {
      const aa = String(a).indexOf("autre:") === 0;
      const bb = String(b).indexOf("autre:") === 0;
      if (aa !== bb) return aa ? 1 : -1;
      if (aa && bb) return Number(a.split(":")[1]) - Number(b.split(":")[1]);
      return (rank.get(a) ?? 99) - (rank.get(b) ?? 99);
    });
  }

  function computeLoveProfile(answers, D, prenomRaw) {
    const missing = missingAnswers(answers, D);
    if (missing.length) throw new Error("Réponses manquantes : " + missing.join(", "));
    D._answers = answers;

    const prenom = String(prenomRaw || "").replace(/[<>]/g, "").trim().slice(0, 40) || "Toi";
    const nourritScreen = screenOf(D, "nourrit");
    const ressourceScreen = screenOf(D, "ressource");
    const langScreen = screenOf(D, "langages");
    const enneaScreen = screenOf(D, "ennea");
    const valeursScreen = screenOf(D, "valeurs");
    const instinctScreen = screenOf(D, "instinct");
    const stressScreen = screenOf(D, "stress");
    const freinsScreen = screenOf(D, "freins");
    const etapeScreen = screenOf(D, "etape");

    const gNourrit = groupOf(nourritScreen, "nourrit");
    const gVide = groupOf(nourritScreen, "vide");
    const nourritOrder = ordered(answers, nourritScreen, gNourrit);
    const videOrder = ordered(answers, nourritScreen, gVide);

    const points = {};
    nourritOrder.forEach((id, index) => {
      const item = itemById(gNourrit, id);
      if (!item || !item.need) return;
      const pts = index === 0 ? 3 : index === 1 ? 2 : 1;
      points[item.need] = (points[item.need] || 0) + pts;
    });
    const bestRank = {};
    nourritOrder.forEach((id, index) => {
      const item = itemById(gNourrit, id);
      if (!item || !item.need) return;
      if (bestRank[item.need] == null || index < bestRank[item.need]) bestRank[item.need] = index;
    });
    const rankedNeeds = Object.keys(points).sort((a, b) =>
      points[b] - points[a]
      || bestRank[a] - bestRank[b]
      || D.order.need.indexOf(a) - D.order.need.indexOf(b));
    const need1 = rankedNeeds[0];
    const need2 = rankedNeeds[1] && points[rankedNeeds[1]] > 0 ? rankedNeeds[1] : null;
    let anti = null;
    for (const id of videOrder) {
      const item = itemById(gVide, id);
      if (item && item.need) { anti = item.need; break; }
    }
    const noMore = videOrder[0];

    const gSoir = groupOf(ressourceScreen, "soir");
    const gWeek = groupOf(ressourceScreen, "weekend");
    const soirIds = dataOrder(gSoir, chosen(answers, ressourceScreen, gSoir).filter((id) => itemById(gSoir, id)));
    const weekIds = dataOrder(gWeek, chosen(answers, ressourceScreen, gWeek).filter((id) => itemById(gWeek, id)));
    const counts = {};
    const bump = (id, group) => {
      const item = itemById(group, id);
      if (!item || !item.recharge) return;
      counts[item.recharge] = (counts[item.recharge] || 0) + 1;
    };
    soirIds.forEach((id) => bump(id, gSoir));
    weekIds.forEach((id) => bump(id, gWeek));
    const firstSoirProfile = soirIds.length ? itemById(gSoir, soirIds[0]).recharge : null;
    const profiles = Object.keys(counts).sort((a, b) => {
      if (counts[b] !== counts[a]) return counts[b] - counts[a];
      if (a === firstSoirProfile) return -1;
      if (b === firstSoirProfile) return 1;
      return D.order.recharge.indexOf(a) - D.order.recharge.indexOf(b);
    });
    const profile = profiles[0];
    const profile2 = profiles[1] && counts[profiles[1]] >= 2 ? profiles[1] : null;
    const solo = [...soirIds, ...weekIds].filter((id) => {
      const group = soirIds.indexOf(id) !== -1 && itemById(gSoir, id) ? gSoir : gWeek;
      const item = itemById(group, id) || itemById(gSoir, id) || itemById(gWeek, id);
      return item && item.recharge === "solitaire";
    }).length;
    const line = profile2
      ? fill(D.ui.results.rechargeMixed, { soirTitle: D.recharge[profile].title, weekendTitle: D.recharge[profile2].title })
      : fill(D.ui.results.rechargeSame, { title: D.recharge[profile].title });

    const langOrder = bagOf(answers, "langages").order.slice();
    const languages = { order: langOrder, lang1: langOrder[0], lang2: langOrder[1] };

    const gTypes = groupOf(enneaScreen, "types");
    const typeOrder = ordered(answers, enneaScreen, gTypes);
    const enneaType = typeOrder[0];
    const enneaAlt = typeOrder[1] || null;
    const confidenceText = !enneaType
      ? ""
      : enneaAlt
        ? fill(D.ennea.confidenceMany, { typeLabel: typeLabel(D, enneaType), altLabel: typeLabel(D, enneaAlt) })
        : D.ennea.confidenceOne;

    const gMod = groupOf(stressScreen, "modere");
    const gFort = groupOf(stressScreen, "fort");
    const modere = dataOrder(gMod, chosen(answers, stressScreen, gMod));
    const fort = dataOrder(gFort, chosen(answers, stressScreen, gFort));
    let stressHint = null;
    if (D.stress.families) {
      const aligned = fort.some((id) => (D.stress.families[id] || []).indexOf(enneaType) !== -1);
      if (aligned) stressHint = D.ennea.stressHint;
    }

    const instinctOrder = bagOf(answers, "instinct").order.slice();
    const instinct = instinctOrder[0];
    const instinct2 = instinctOrder[1] || null;
    const instinctLast = instinctOrder[2] || null;
    const pairs = ["sp", "so", "sx"].map((p) => D.instinctPairs[pairKey(instinct, p)]).filter(Boolean);

    const gVal = groupOf(valeursScreen, "valeurs");
    const valueOrderIds = ordered(answers, valeursScreen, gVal);
    const valueEntries = valueOrderIds.map((id) => {
      const own = String(id).indexOf("autre:") === 0;
      if (own) {
        const texte = otherTextAt(answers, valeursScreen, gVal, Number(id.split(":")[1]));
        return { id, short: lc1(texte), opposite: fill(D.ui.results.ownOpposite, { texte }), direction: false, own: true };
      }
      const row = D.values[id];
      return { id, short: row.short, opposite: row.opposite, direction: !!row.direction, own: false };
    });
    const nonNegotiables = valueEntries.slice(0, 3);
    const toDiscuss = valueEntries.slice(3);
    const directionValues = valueEntries.filter((v) => v.direction && !v.own);

    const gFrein = groupOf(freinsScreen, "freins");
    const brakeChosen = chosen(answers, freinsScreen, gFrein);
    const brakeAll = dataOrder(gFrein, brakeChosen);
    const brakeFirst = brakeAll[0];
    const brakeAntidote = String(brakeFirst).indexOf("autre:") === 0
      ? D.brakes.energie.antidote
      : D.brakes[brakeFirst].antidote;

    const gAct = groupOf(etapeScreen, "actions");
    const actionIds = dataOrder(gAct, chosen(answers, etapeScreen, gAct));
    const timeRaw = bagOf(answers, "etape").time;
    const time = actionIds.indexOf("rappel") !== -1 ? (timeRaw || "18:00") : null;

    const etapeBag = bagOf(answers, "etape");
    const etape = {
      engagement: cleanFree(etapeBag.engagement, 140),
      who: cleanFree(etapeBag.who, 40),
      moment: etapeBag.moment,
    };

    const safetyId = etapeBag.safety || null;
    const safety = safetyId === "present" || safetyId === "doute" ? D.safety[safetyId] : null;
    const pastAbuse = safetyId === "passe" ? D.pastAbuseNote : null;

    const card = (screen, groupId, id) => ({ id, short: shortOf(D, screen, groupId, id) || labelOf(D, screen, groupId, id) });
    const nourritCards = nourritOrder.map((id) => card(nourritScreen, "nourrit", id));
    const videCards = videOrder.map((id) => card(nourritScreen, "vide", id));

    const complete = [
      D.needs[need1].partner,
      "Un partenaire qui " + D.languages[languages.lang1].partnerHint,
      D.recharge[profile].fit,
      D.stress.modere[modere[0]].partner,
    ];
    const friction = toDiscuss.map((v) => D.ui.results.discussPrefix + " " + v.short + ".");
    if (instinct && instinctLast) {
      const pair = D.instinctPairs[pairKey(instinct, instinctLast)];
      if (pair) friction.push(pair);
    }
    const critical = nonNegotiables.map((v) => v.opposite);
    if (videCards[0]) critical.push(fill(D.ui.results.relive, { short: videCards[0].short }));
    critical.push(D.universalCritical);

    const profil = computeProfil({
      prenom,
      nourrit: nourritCards,
      vide: videCards,
      recharge: { profile, picks: { soir: soirIds, weekend: weekIds } },
      languages,
      ennea: { all: typeOrder, instinct, instinct2, instinctLast },
      values: { order: valueEntries },
      stress: { modere, fort },
      partner: { critical },
    }, D);
    const sentences = profil.sentences;
    const s1 = sentences[0];
    const s2 = sentences[1];
    const s3 = sentences[2];

    const topVide = videOrder.slice(0, 2);
    const energyHit = topVide.some((id) => {
      const item = itemById(gVide, id);
      return item && item.energy;
    });
    const conflictHit = topVide.some((id) => {
      const item = itemById(gVide, id);
      return item && item.conflict;
    });
    const langHits = nourritOrder.filter((id) => {
      const item = itemById(gNourrit, id);
      return item && item.lang && (item.lang === languages.lang1 || item.lang === languages.lang2);
    }).length;
    const priority = {
      energie: 3 + (solo >= 2 ? 1 : 0) + (energyHit ? 1 : 0),
      frictions: 2 + (fort.indexOf("fight") !== -1 ? 1 : 0) + (fort.indexOf("flight") !== -1 || fort.indexOf("freeze") !== -1 ? 1 : 0) + (conflictHit ? 1 : 0),
      langage: 2 + Math.min(2, langHits),
      complementarite: 1 + (modere.length >= 2 ? 1 : 0) + (nourritOrder.indexOf("aventure") !== -1 || nourritOrder.indexOf("espace") !== -1 ? 1 : 0),
    };
    const boostKey = D.profil.boussoleBoost[profil.boussoleDom];
    if (boostKey) priority[boostKey] += 1;
    const imp = assignImportance(priority);
    const weightSum = 6 * WEIGHTS.critique + ADJUSTABLE.reduce((sum, key) => sum + WEIGHTS[imp[key]], 0);
    if (weightSum !== 42) throw new Error("Poids total " + weightSum);

    const notes = {};
    const takeShorts = (ids, groupId, screen, limit) => ids.slice(0, limit).map((id) => catalogShort(D, screen, groupId, id)).filter(Boolean);
    const nourritNote = takeShorts(nourritOrder, "nourrit", nourritScreen, 3);
    const videNote = takeShorts(videOrder, "vide", nourritScreen, 2);
    const besoinParts = [];
    if (nourritNote.length) besoinParts.push("Ce qui te nourrit : " + nourritNote.join(", ") + ".");
    if (videNote.length) besoinParts.push("Ce qui te vide : " + videNote.join(" et ") + ".");
    putNote(notes, "besoins", besoinParts.join(" "));

    const valeurNote = valueEntries.slice(0, 5).filter((v) => !v.own).map((v) => v.short);
    if (valeurNote.length) putNote(notes, "valeurs", "Tes valeurs, dans l'ordre : " + valeurNote.join(", ") + ".");
    if (directionValues.length) putNote(notes, "direction", "Tes repères de projet de vie : " + directionValues.map((v) => v.short).join(" ; ") + ".");
    const defautsShort = videOrder.slice(1, 6).map((id) => catalogShort(D, nourritScreen, "vide", id)).filter(Boolean);
    if (defautsShort.length) putNote(notes, "defauts", "Ce que tu as du mal à vivre chez l'autre : " + defautsShort.join(", ") + ".");

    putNote(notes, "frictions", "Sous stress fort, tu as tendance à " + fort.map((id) => D.stress.fort[id].short).join(" ou ") + ". Sous stress modéré, tu " + modere.map((id) => D.stress.modere[id].short).join(" ou ") + ". Repère si vos disputes finissent par un vrai accord.");
    const energieTail = profile2 ? " et " + D.recharge[profile2].short : "";
    const videEnergie = videNote.length ? " Ce qui te vide : " + videNote.join(" et ") + "." : "";
    putNote(notes, "energie", "Tu te recharges " + D.recharge[profile].short + energieTail + "." + videEnergie);
    putNote(notes, "langage", "Tu te sens aimé·e surtout par " + D.languages[languages.lang1].lower + ", puis " + D.languages[languages.lang2].lower + ".");
    const compPair = instinct && instinctLast ? D.instinctPairs[pairKey(instinct, instinctLast)] : "";
    putNote(notes, "complementarite", "Ton sous-type dominant : " + D.instincts[instinct].name + "." + (compPair ? " " + compPair : ""));
    const nnNote = nonNegotiables.filter((v) => !v.own).map((v) => v.short);
    const videNn = catalogShort(D, nourritScreen, "vide", noMore);
    const inco = [];
    if (nnNote.length) inco.push("Tes non-négociables d'après le quiz : " + nnNote.join(" ; ") + ".");
    if (videNn) inco.push("Ce que tu ne veux plus vivre : " + videNn + ".");
    putNote(notes, "incompatibilite", inco.join(" "));

    const boussole = { v: 2, imp, notes };

    const timeLabel = (D.times.find((t) => t.id === time) || {}).label || "";
    const demainLines = actionIds.map((id) => id === "rappel" ? fill(D.actions.rappel, { heure: timeLabel }) : D.actions[id]);
    const momentLabel = (D.moments.find((m) => m.id === etape.moment) || {}).label || "";
    const glanceLines = [];
    const ol = (title, rows) => {
      glanceLines.push(title);
      rows.forEach((row, i) => glanceLines.push((i + 1) + ". " + row));
    };
    ol(D.ui.results.nourritLab, nourritCards.slice(0, 3).map((c) => c.short));
    ol(D.ui.results.videLab, videCards.map((c, i) => c.short + (i === 0 ? " (" + D.ui.results.noMoreMark + ")" : "")));
    ol(D.ui.results.langLab, langOrder.map((id) => (langScreen.items.find((it) => it.id === id) || {}).label || id));
    ol(D.ui.results.valuesLab, valueEntries.map((v, i) => v.short + (i < 3 ? " (" + D.ui.results.nnMark + ")" : "")));
    ol(D.ui.results.instinctLab, instinctOrder.map((id) => (instinctScreen.items.find((it) => it.id === id) || {}).label || D.instincts[id].name));
    const domShorts = [...soirIds, ...weekIds].filter((id) => {
      const item = itemById(gSoir, id) || itemById(gWeek, id);
      return item && item.recharge === profile;
    }).slice(0, 2).map((id) => (itemById(gSoir, id) || itemById(gWeek, id)).short);
    glanceLines.push(D.ui.results.rechargeLab);
    glanceLines.push(D.recharge[profile].title + (domShorts.length ? " : " + domShorts.join(", ") : ""));
    glanceLines.push(D.ui.results.stressLab);
    glanceLines.push("modéré → " + modere.map((id) => (gMod.items.find((it) => it.id === id) || {}).label).join(", ") + " · fort → " + fort.map((id) => (gFort.items.find((it) => it.id === id) || {}).label).join(", "));
    glanceLines.push(D.ui.results.brakeLab);
    glanceLines.push((String(brakeFirst).indexOf("autre:") === 0 ? shortOf(D, freinsScreen, "freins", brakeFirst) : (gFrein.items.find((it) => it.id === brakeFirst) || {}).label) + " " + brakeAntidote);
    glanceLines.push(D.ui.results.demainLab);
    glanceLines.push(demainLines.join(" "));
    glanceLines.push(D.ui.results.stepLab);
    const stepParts = [];
    if (etape.engagement) stepParts.push("« " + etape.engagement + " »");
    else stepParts.push(D.ui.results.nowStepEmpty);
    if (etape.who) stepParts.push(fill(D.ui.results.shareWith, { who: etape.who }));
    if (momentLabel) stepParts.push(momentLabel);
    glanceLines.push(stepParts.join(" · "));

    const shareText = D.shareTemplate.map((line) => fill(line, { s1, s2, s3, quizUrl: D.config.quizUrl })).join("\n");
    const exportBody = D.exportTemplate.map((line) => fill(line, {
      s1, s2, s3, glance: glanceLines.join("\n"), calendly: D.config.calendly,
    })).join("\n");
    const exportText = "Mon profil amoureux (hypothèse) : " + profil.name.text + ".\n" + exportBody;

    delete D._answers;

    return {
      prenom,
      title: D.needs[need1].title,
      sentences,
      shareText,
      exportText,
      safety,
      pastAbuse,
      needs: { top: [need1, need2], anti, points, noMore },
      nourrit: nourritCards,
      vide: videCards,
      recharge: { profile, profile2, line, solo, picks: { soir: soirIds, weekend: weekIds } },
      languages,
      ennea: { type: enneaType, alt: enneaAlt, all: typeOrder, confidenceText, stressHint, instinct, instinct2, instinctLast, pairs },
      values: { order: valueEntries, nonNegotiables, toDiscuss, directionValues },
      stress: { modere, fort },
      brakes: { all: brakeAll, first: brakeFirst, antidote: brakeAntidote },
      demain: { actions: actionIds, time },
      etape,
      partner: { complete, friction, critical },
      keyMessages: D.keyMessages,
      boussole,
      profil,
    };
  }

  function boussolePayload(profile) {
    return profile && profile.boussole ? profile.boussole : null;
  }

  function encodePayload(obj) {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  /* Profil amoureux v1.4. Q4 (ennéagramme) est un éclairage : il n'entre pas dans le score affiché ni dans la Boussole. */
  const PROFIL_SOURCES = ["nourrit", "vide", "valeurs", "langages", "instinct", "ressource", "stress"];

  function profilAt(arr, i) {
    return Array.isArray(arr) ? (i < arr.length ? arr[i] : arr[arr.length - 1]) : arr;
  }
  function profilPairKey(P, a, b) {
    const ia = P.order.indexOf(a);
    const ib = P.order.indexOf(b);
    return ia <= ib ? a + "+" + b : b + "+" + a;
  }
  function profilAdd(out, need, pts, src, rank, ref) {
    if (need && pts > 0) out.push({ need, pts, src, rank, ref });
  }
  function profilPoints(out, w, tbl, i, src, ref) {
    if (!w) return;
    if (typeof w === "string") {
      profilAdd(out, w, typeof tbl === "number" ? tbl : profilAt(tbl, i), src, i + 1, ref);
      return;
    }
    profilAdd(out, w.p, profilAt(tbl.p, i), src, i + 1, ref);
    if (w.s) profilAdd(out, w.s, profilAt(tbl.s, i), src, i + 1, ref);
  }
  function contributions(base, D) {
    const P = D.profil;
    const W = P.weights;
    const PT = P.points;
    const out = [];
    base.nourrit.forEach((c, i) => profilPoints(out, W.nourrit[c.id], PT.nourrit, i, "nourrit", c));
    base.vide.forEach((c, i) => profilPoints(out, W.vide[c.id], PT.vide, i, "vide", c));
    ["soir", "weekend"].forEach((g) => (base.recharge.picks[g] || []).forEach((id) => profilPoints(out, W.ressource[id], PT.ressource, 0, "ressource", { id, g })));
    base.languages.order.forEach((id, i) => profilPoints(out, W.langages[id], PT.langages, i, "langages", { id }));
    base.values.order.forEach((v, i) => { if (!v.own) profilPoints(out, W.valeurs[v.id], PT.valeurs, i, "valeurs", v); });
    [base.ennea.instinct, base.ennea.instinct2, base.ennea.instinctLast].forEach((id, i) => {
      if (id) profilPoints(out, W.instinct[id], PT.instinct, i, "instinct", { id });
    });
    base.stress.modere.concat(base.stress.fort).forEach((id) => profilPoints(out, W.stress[id], PT.stress, 0, "stress", { id }));
    return out;
  }
  function exposure(P) {
    const e = {};
    P.order.forEach((n) => { e[n] = 0; });
    Object.keys(P.weights).forEach((src) => {
      if (src === "ennea") return;
      const pt = P.points[src];
      const unitP = typeof pt === "number" ? pt : Array.isArray(pt) ? pt[0] : pt.p[0];
      const unitS = typeof pt === "object" && !Array.isArray(pt) ? pt.s[0] : 0;
      Object.keys(P.weights[src]).forEach((key) => {
        const w = P.weights[src][key];
        if (typeof w === "string") e[w] += unitP;
        else { e[w.p] += unitP; if (w.s) e[w.s] += unitS; }
      });
    });
    return e;
  }
  function rank(P, contribs) {
    const raw = {};
    const nour = {};
    const vide = {};
    const expo = exposure(P);
    P.order.forEach((n) => { raw[n] = 0; nour[n] = 0; vide[n] = 0; });
    contribs.forEach((c) => {
      raw[c.need] += c.pts;
      if (c.src === "nourrit") nour[c.need] += c.pts;
      if (c.src === "vide") vide[c.need] += c.pts;
    });
    const ranking = P.order.slice().sort((a, b) =>
      raw[b] * expo[a] - raw[a] * expo[b] || nour[b] - nour[a] || vide[b] - vide[a] || P.order.indexOf(a) - P.order.indexOf(b));
    const scores = {};
    P.order.forEach((n) => { scores[n] = Math.round((1000 * raw[n]) / expo[n]) / 10; });
    return { raw, scores, ranking, expo };
  }
  function whyLabel(D, c) {
    const w = D.profil.ui.why;
    switch (c.src) {
      case "nourrit": return fill(w.nourrit, { short: c.ref.short, rank: c.rank });
      case "vide": return fill(w.vide, { short: c.ref.short });
      case "ressource": {
        const screen = D.screens.find((x) => x.id === "ressource");
        const group = screen.groups.find((g) => g.id === c.ref.g);
        const item = group.items.find((it) => it.id === c.ref.id);
        return fill(w.ressource, { short: item ? item.short : c.ref.id });
      }
      case "langages": return fill(w.langages, { lower: D.languages[c.ref.id].lower, rank: c.rank });
      case "valeurs": return fill(w.valeurs, { short: c.ref.short, rank: c.rank });
      case "instinct": return fill(w.instinct, { name: D.instincts[c.ref.id].name });
      default: return w.stress;
    }
  }
  function computeProfil(base, D) {
    const P = D.profil;
    const U = P.ui;
    const B = P.besoins;
    const contribs = contributions(base, D);
    const ranked = rank(P, contribs);
    const scores = ranked.scores;
    const ranking = ranked.ranking;
    const dom = ranking[0];
    const sec = ranking[1];
    const d = B[dom];
    const s = B[sec];
    const name = { noun: d.noun, adj: s.adj, text: d.noun + " " + s.adj };
    const inverse = s.noun + " " + d.adj;
    const margin = scores[sec] >= 0.95 * scores[dom] ? "mixte" : scores[sec] < 0.6 * scores[dom] ? "net" : null;
    const max = Math.max(1, scores[dom]);
    const bars = ranking.map((id) => ({ id, score: scores[id], pct: Math.round((scores[id] / max) * 100) }));
    const byKey = {};
    contribs.filter((c) => c.need === dom).forEach((c) => {
      const k = c.src === "stress" ? "stress" : c.src + ":" + (c.ref.id || "");
      if (!byKey[k]) byKey[k] = { c, pts: 0 };
      byKey[k].pts += c.pts;
    });
    const why = Object.keys(byKey).map((k) => byKey[k]).sort((a, b) =>
      b.pts - a.pts || PROFIL_SOURCES.indexOf(a.c.src) - PROFIL_SOURCES.indexOf(b.c.src) || a.c.rank - b.c.rank
    ).slice(0, 3).map((x) => whyLabel(D, x.c));
    const boussoleDom = dom;
    let anti = null;
    for (let i = 0; i < base.vide.length; i++) {
      const w = P.weights.vide[base.vide[i].id];
      if (w) { anti = w.p; break; }
    }
    const noMore = base.vide[0];
    const noMoreNeed = noMore && P.weights.vide[noMore.id] ? P.weights.vide[noMore.id].p : null;
    const top = base.nourrit[0];
    const topNeed = top && P.weights.nourrit[top.id] ? P.weights.nourrit[top.id].p : null;
    const fortOrder = D.stress.order_fort || ["fight", "flight", "freeze", "fawn"];
    const fortIds = fortOrder.filter((id) => base.stress.fort.indexOf(id) !== -1);
    const trapId = fortIds[0];
    const trap = P.pieges[trapId];
    const prenom = base.prenom || "Toi";
    const sentences = [
      fill(U.sentences.s1, { prenom, profil: name.text, s1: d.s1, secNeed: s.secNeed }),
      fill(U.sentences.s2, { bloomShort: d.bloomShort, fadeShort: d.fadeShort }),
      fill(U.sentences.s3, { trapName: trap.name, trapShort: trap.short, exitShort: trap.exitShort }),
    ];
    const rc = D.recharge[base.recharge.profile];
    const s1 = {
      title: U.s1h, icon: "sun", lead: d.bloom, list: d.bloomList.slice(),
      extra: [
        "Ton besoin secondaire (" + s.name + ") ajoute une couleur : " + s.secBloom + ".",
        top ? (topNeed ? fill(U.s1top, { short: top.short, de: B[topNeed].de }) : "") : "",
        fill(U.s1recharge, { title: lc1(rc.title), couple: lc1(rc.couple) }),
      ].filter(Boolean),
    };
    const s2 = {
      title: U.s2h, icon: "cloud-rain", lead: d.fade, list: d.fadeList.slice(), alarm: d.alarm,
      extra: [
        "Et comme " + s.lower + " compte aussi pour toi, " + s.secFade + ".",
        noMore ? (noMoreNeed ? fill(U.s2noMore, { short: noMore.short, de: B[noMoreNeed].de }) : fill(U.s2noMoreOwn, { short: noMore.short })) : "",
        U.s2test,
      ].filter(Boolean),
    };
    const s3 = {
      title: U.s3h, icon: "house",
      rows: ["rythme", "proximite", "independance", "conflits"].map((k) => ({ label: U.s3rows[k], text: d.rel[k] })),
      extra: [
        fill(U.s3sec, { name: s.name, cond: s.secCond }),
        fill(U.s3instinct, { name: D.instincts[base.ennea.instinct].name, couple: lc1(D.instincts[base.ennea.instinct].couple) }),
      ],
    };
    const group = (type) => P.order.filter((o) => o !== dom && P.couples[profilPairKey(P, dom, o)].type === type)
      .map((o) => ({ id: o, label: fill(U.s4profileLine, { name: B[o].name, who: B[o].who }), text: P.couples[profilPairKey(P, dom, o)].text }));
    const firstModere = base.stress.modere[0];
    const s4 = {
      title: U.s4h, icon: "users", rule: U.s4rule,
      fond: [
        fill(U.s4fond, { fond: d.partnerFond }),
        fill(U.s4fondSec, { fond: s.partnerFond }),
        fill(U.s4lang, { hint: D.languages[base.languages.lang1].partnerHint }),
        firstModere ? fill(U.s4stress, { partner: lc1(D.stress.modere[firstModere].partner) }) : "",
      ].filter(Boolean),
      nourrit: group("nourrit"), proche: group("proche"), frotte: group("frotte"),
      mirror: P.couples[profilPairKey(P, dom, dom)].text,
      critical: base.partner.critical.slice(),
    };
    const s5 = {
      title: U.s5h, icon: "message-circle-heart",
      partner: d.sayPartner.concat([s.sayPartner[0]]),
      date: d.sayDate.concat([s.sayDate[0]]),
    };
    const others = fortIds.slice(1).map((id) => P.pieges[id].name);
    const s6 = {
      title: U.s6h, icon: "life-buoy", trap: trap.title, lead: trap.mech,
      extra: [
        fill(U.s6trigger, { trigger: d.trigger }),
        base.stress.modere.length ? fill(U.s6early, { modere: base.stress.modere.map((id) => D.stress.modere[id].short).join(" ou ") }) : "",
        fill(U.s6calm, { calm: d.calm }),
      ].filter(Boolean),
      exits: trap.exits.slice(),
    };
    if (others.length) s6.also = fill(U.s6also, { others: others.join(", ") });
    return {
      dom, sec, name, inverse, margin, raw: ranked.raw, scores, ranking, bars, why, trapId, anti, boussoleDom,
      header: {
        eyebrow: base.prenom && base.prenom !== "Toi" ? fill(U.eyebrowNamed, { prenom: base.prenom }) : U.eyebrowAnon,
        domSec: fill(U.domSec, { domName: d.name, domKey: d.key, secName: s.name, secKey: s.key }),
        alliage: P.alliages[profilPairKey(P, dom, sec)],
        marginLine: margin === "mixte" ? fill(U.mixedLine, { inverse }) : margin === "net" ? U.netLine : undefined,
      },
      sentences,
      sections: [s1, s2, s3, s4, s5, s6],
    };
  }
  function boussoleBoost(profil, D) { return D.profil.boussoleBoost[profil.boussoleDom]; }

  function progressKey() {
    return "quiz_amour_v15_progress";
  }

  function cloneJson(value, fallback) {
    try { return JSON.parse(JSON.stringify(value)); }
    catch (e) { return fallback; }
  }

  function packProgress(state) {
    const src = state && typeof state === "object" ? state : {};
    const cloned = cloneJson(src.answers, {});
    const answers = cloned && typeof cloned === "object" && !Array.isArray(cloned) ? cloned : {};
    if (answers.etape && typeof answers.etape === "object") answers.etape.safety = null;
    let profile = null;
    if (src.view === "results" && src.profile) {
      profile = cloneJson(src.profile, null);
      if (profile && typeof profile === "object" && !Array.isArray(profile)) {
        profile.safety = null;
        profile.pastAbuse = null;
      } else profile = null;
    }
    const qiNum = Number(src.qi);
    const gsNum = Number(src.groupStep);
    const view = src.view === "question" || src.view === "results" ? src.view : "intro";
    const stack = (Array.isArray(src.stack) ? src.stack : []).slice(-40).map((step) => {
      if (!step || typeof step !== "object") return null;
      const q = Number(step.qi);
      const g = Number(step.groupStep);
      return {
        view: step.view === "question" || step.view === "results" ? step.view : "intro",
        qi: Number.isInteger(q) && q >= 0 ? q : 0,
        phase: step.phase === "rank" ? "rank" : "ask",
        groupStep: Number.isInteger(g) && g >= 0 ? g : 0,
      };
    }).filter(Boolean);
    return {
      v: 15,
      prenom: String(src.prenom || "").replace(/[<>]/g, "").trim().slice(0, 40),
      qi: Number.isInteger(qiNum) && qiNum >= 0 ? qiNum : 0,
      phase: src.phase === "rank" ? "rank" : "ask",
      groupStep: Number.isInteger(gsNum) && gsNum >= 0 ? gsNum : 0,
      view,
      answers,
      lastPrefix: String(src.lastPrefix || "").slice(0, 140),
      profile,
      stack,
    };
  }

  function parseProgress(raw) {
    let data = raw;
    if (typeof raw === "string") {
      try { data = JSON.parse(raw); } catch (e) { return null; }
    }
    if (!data || typeof data !== "object" || Array.isArray(data) || data.v !== 15) return null;
    if (!data.answers || typeof data.answers !== "object" || Array.isArray(data.answers)) return null;
    if (data.view !== "intro" && data.view !== "question" && data.view !== "results") return null;
    return packProgress(data);
  }

  function readProgress(store) {
    try {
      if (!store || typeof store.getItem !== "function") return null;
      const raw = store.getItem(progressKey());
      if (!raw) return null;
      return parseProgress(raw);
    } catch (e) { return null; }
  }

  function writeProgress(store, state) {
    try {
      if (!store || typeof store.setItem !== "function") return false;
      store.setItem(progressKey(), JSON.stringify(packProgress(state)));
      return true;
    } catch (e) { return false; }
  }

  function clearProgress(store) {
    try {
      if (!store || typeof store.removeItem !== "function") return false;
      store.removeItem(progressKey());
      return true;
    } catch (e) { return false; }
  }

  function cleanUtmBit(value) {
    return String(value == null ? "" : value).replace(/[^a-zA-Z0-9._~:-]/g, "").slice(0, 80);
  }

  function calendlyLink(base, place, search) {
    const url = new URL(String(base), "https://www.magichumans.com");
    const params = search && typeof search.get === "function"
      ? search
      : new URLSearchParams(String(search || "").replace(/^\?/, ""));
    const src = cleanUtmBit(params.get("utm_source"));
    const camp = cleanUtmBit(params.get("utm_campaign"));
    const spot = cleanUtmBit(place) || "resultat";
    const bits = [spot];
    if (src) bits.push(src);
    if (camp) bits.push(camp);
    url.searchParams.set("utm_content", bits.join("|"));
    return url.toString();
  }

  var SALLE_SESSION = /^webinaire-[a-z0-9][a-z0-9-]{0,40}$/;

  function salleSessionOk(value) {
    return SALLE_SESSION.test(String(value || ""));
  }

  function salleSession(search) {
    var params;
    try {
      params = search && typeof search.get === "function"
        ? search
        : new URLSearchParams(String(search || "").replace(/^\?/, ""));
    } catch (e) { return ""; }
    var explicit = params.get("salle");
    if (salleSessionOk(explicit)) return String(explicit);
    var src = params.get("utm_source") || "";
    if (String(src).indexOf("webinaire-") === 0 && salleSessionOk(src)) return String(src);
    return "";
  }

  function salleIds(D) {
    var order = D && D.profil && Array.isArray(D.profil.order) ? D.profil.order : [];
    return order.filter(function (id) { return D.profil.besoins && D.profil.besoins[id]; });
  }

  function salleNourrit(dom, D) {
    var P = D && D.profil;
    if (!P || !P.besoins || !P.besoins[dom] || !P.couples || !Array.isArray(P.order)) return [];
    return P.order.filter(function (id) {
      if (id === dom || !P.besoins[id]) return false;
      var row = P.couples[profilPairKey(P, dom, id)];
      return !!(row && row.type === "nourrit");
    });
  }

  function sallePhoto(dom, rows, D) {
    var ids = salleIds(D);
    var counts = {};
    ids.forEach(function (id) { counts[id] = 0; });
    (Array.isArray(rows) ? rows : []).forEach(function (row) {
      if (!row || !Object.prototype.hasOwnProperty.call(counts, row.id)) return;
      var n = Number(row.n);
      if (Number.isInteger(n) && n > 0 && n < 1000000) counts[row.id] = n;
    });
    var total = ids.reduce(function (sum, id) { return sum + counts[id]; }, 0);
    var bars = ids.map(function (id) {
      var b = D.profil.besoins[id];
      return {
        id: id,
        name: b.name,
        color: b.color,
        n: counts[id],
        pct: total > 0 ? Math.round((counts[id] / total) * 100) : 0,
      };
    });
    var compat = null;
    var nourrit = salleNourrit(dom, D);
    if (nourrit.length && total > 0) {
      var best = nourrit[0];
      nourrit.forEach(function (id) {
        if (counts[id] > counts[best]) best = id;
      });
      compat = {
        id: best,
        name: D.profil.besoins[best].name,
        pct: Math.round((counts[best] / total) * 100),
      };
    }
    return { total: total, bars: bars, compat: compat };
  }

  function answerLabel(answers, D, screenId, groupId, id) {
    const screen = screenOf(D, screenId);
    const group = groupOf(screen, groupId);
    if (!screen || !group) return "";
    if (String(id).indexOf("autre:") === 0) {
      return otherTextAt(answers, screen, group, Number(String(id).split(":")[1]));
    }
    const item = itemById(group, id);
    return item ? item.label : "";
  }

  const api = {
    computeLoveProfile, missingAnswers, boussolePayload, encodePayload, fill, rankingState,
    computeProfil, contributions, rank, exposure, boussoleBoost, pairKey: profilPairKey,
    progressKey, packProgress, parseProgress, readProgress, writeProgress, clearProgress,
    calendlyLink, answerLabel,
    salleSession, salleSessionOk, salleIds, salleNourrit, sallePhoto,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AmourEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
