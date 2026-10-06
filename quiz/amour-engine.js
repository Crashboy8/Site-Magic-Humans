/* Quiz Amour v1.2 · moteur pur (aucun DOM). Déterministe : mêmes réponses, même résultat.
   Utilisé par quiz/amour.js (navigateur) et par quiz/amour.test.mjs (node --test). */
(function (root) {
  const ADJUSTABLE = ["energie", "frictions", "langage", "complementarite"];
  const ADJUST_LEVELS = ["tres_important", "important", "important", "moyen"];
  const WEIGHTS = { critique: 5, tres_important: 4, important: 3, moyen: 2 };
  const SCENES = ["ordre", "argent", "vacances"];

  function fill(tpl, vars) {
    return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (vars == null || vars[k] == null ? "" : String(vars[k])));
  }
  const lc1 = (t) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t);

  function screenOf(D, id) {
    return D.screens.find((s) => s.id === id);
  }

  function blockValue(answers, screenId, block) {
    const bag = answers[screenId];
    if (!bag || typeof bag !== "object" || Array.isArray(bag)) return block.kind === "second" ? null : undefined;
    if (!Object.prototype.hasOwnProperty.call(bag, block.id)) return block.kind === "second" ? null : undefined;
    return bag[block.id];
  }

  function knownOption(block, id) {
    return block.options.some((o) => o.id === id);
  }

  function blockInvalid(block, value, ofValue) {
    if (block.kind === "single" || block.kind === "self") return !knownOption(block, value);
    if (block.kind === "second") {
      if (value == null) return false;
      if (!knownOption(block, value)) return true;
      return value === ofValue;
    }
    if (block.kind === "multi") {
      if (!Array.isArray(value)) return true;
      if (value.length < block.min || value.length > block.max) return true;
      if (new Set(value).size !== value.length) return true;
      return value.some((id) => !knownOption(block, id));
    }
    return true;
  }

  function missingAnswers(answers, D) {
    const bad = [];
    const src = answers || {};
    for (const screen of D.screens) {
      const a = src[screen.id];
      if (screen.type === "plusminus") {
        const plus = a && Array.isArray(a.plus) ? a.plus : null;
        const minus = a && Array.isArray(a.minus) ? a.minus : null;
        const ids = new Set(screen.items.map((it) => it.id));
        const unique = (arr) => arr && new Set(arr).size === arr.length && arr.every((id) => ids.has(id));
        const overlap = plus && minus && plus.some((id) => minus.includes(id));
        if (!plus || !minus || !unique(plus) || !unique(minus) || overlap || plus.length !== screen.plusCount || minus.length !== screen.minusCount) {
          bad.push(screen.id);
        }
      } else if (screen.type === "blocks") {
        for (const block of screen.blocks) {
          const value = blockValue(src, screen.id, block);
          const ofBlock = block.of ? screen.blocks.find((b) => b.id === block.of) : null;
          const ofValue = ofBlock ? blockValue(src, screen.id, ofBlock) : undefined;
          if (blockInvalid(block, value, ofValue)) bad.push(screen.id + "." + block.id);
        }
      } else if (screen.type === "sort") {
        const cols = new Set(D.flawColumns.map((c) => c.id));
        const ok = a && typeof a === "object" && screen.items.every((id) => cols.has(a[id]));
        if (!ok) bad.push(screen.id);
      } else if (screen.type === "values") {
        const topics = D.valueTopics.filter((t) => screen.topics.includes(t.id));
        const ok = a && typeof a === "object" && topics.every((topic) => {
          const row = a[topic.id];
          const opt = row && topic.options.find((o) => o.id === row.pos);
          if (!opt) return false;
          if (opt.neutral) return true;
          return D.firmness.some((f) => f.id === row.firm);
        });
        if (!ok) bad.push(screen.id);
      } else if (screen.type === "single") {
        if (!screen.options.some((o) => o.id === a)) bad.push(screen.id);
      }
    }
    return bad;
  }

  function rankNeeds(screen, chosenIds, side, order) {
    const chosen = new Set(chosenIds);
    const score = {};
    const firstPos = {};
    let pos = 0;
    for (const item of screen.items) {
      if (!chosen.has(item.id)) continue;
      for (const [need, pts] of Object.entries(item[side] || {})) {
        score[need] = (score[need] || 0) + pts;
        if (firstPos[need] == null) firstPos[need] = pos;
        pos += 1;
      }
    }
    const ranked = Object.keys(score).sort((a, b) =>
      score[b] - score[a] || firstPos[a] - firstPos[b] || order.indexOf(a) - order.indexOf(b));
    return { score, ranked };
  }

  function enneaRank(first, second, stress, order) {
    const scores = {};
    const add = (id, pts) => { if (!id) return; scores[id] = (scores[id] || 0) + pts; };
    add(first, 3);
    add(second, 2);
    add(stress, 2);
    const priority = (id) => (id === first ? 0 : id === stress ? 1 : id === second ? 2 : 3);
    const ranked = Object.keys(scores).sort((a, b) =>
      scores[b] - scores[a] || priority(a) - priority(b) || order.indexOf(a) - order.indexOf(b));
    return { scores, ranked };
  }

  function patternRank(scene, attirance, order) {
    const scores = {};
    const add = (id) => { if (!id || id === "aucun") return; scores[id] = (scores[id] || 0) + 2; };
    add(scene);
    add(attirance);
    const priority = (id) => (id === scene ? 0 : 1);
    const ranked = Object.keys(scores).sort((a, b) =>
      scores[b] - scores[a] || priority(a) - priority(b) || order.indexOf(a) - order.indexOf(b));
    const top = ranked[0] || null;
    const pts = top ? scores[top] : 0;
    const level = pts >= 4 ? "net" : pts >= 2 ? "leger" : "aucun";
    return { id: level === "aucun" ? null : top, level, scores };
  }

  function pairKey(a, b) {
    const order = ["sp", "so", "sx"];
    return [a, b].sort((x, y) => order.indexOf(x) - order.indexOf(y)).join("-");
  }

  function typeLabel(D, id) {
    const t = D.ennea.types[id];
    return "Type " + t.n + ", " + t.name;
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

  function bullets(items) {
    if (!items || !items.length) return "- (aucun)";
    return items.map((x) => "- " + x).join("\n");
  }

  function listOrAucun(items) {
    return items.length ? items.join(", ") : "aucun";
  }

  function boussolePayload(built) {
    const { D, need1, need2, anti, values, flaws, quotidien, recv, give, soir, weekend, drains, imp } = built;
    const N = D.needs;
    const notes = {};
    const needNames = need2 ? N[need1].name + ", " + N[need2].name : N[need1].name;
    putNote(notes, "besoins", "Tes besoins essentiels : " + needNames + ". Ce qui t'éteint : " + lc1(N[anti].name) + ".");

    const strongMines = values.filter((v) => v.level === "Fort" || v.level === "Critique").slice(0, 4).map((v) => v.mine);
    if (strongMines.length) putNote(notes, "valeurs", "Tes positions fortes : " + strongMines.join(" ; ") + ".");

    const directionMines = values
      .filter((v) => ["enfants", "lieu", "liberte"].includes(v.topic) && !v.neutral)
      .map((v) => v.mine);
    if (directionMines.length) putNote(notes, "direction", "Tes repères de projet de vie : " + directionMines.join(" ; ") + ".");

    const okShort = flaws.ok.slice(0, 6).map((id) => D.flaws[id].short);
    const discShort = flaws.discuter.slice(0, 6).map((id) => D.flaws[id].short);
    const defautsParts = [];
    if (okShort.length) defautsParts.push("Défauts que tu peux accepter : " + okShort.join(", ") + ".");
    if (discShort.length) defautsParts.push("À discuter : " + discShort.join(", ") + ".");
    if (defautsParts.length) putNote(notes, "defauts", defautsParts.join(" "));

    const fortNames = quotidien.items.filter((it) => it.level === "Fort").map((it) => it.name);
    putNote(notes, "frictions", fortNames.length
      ? "Frictions probables au quotidien : " + fortNames.join(", ") + "."
      : "Aucune friction forte repérée dans le quiz.");

    const drainText = drains.map((id) => D.drains[id].short).join(" et ");
    putNote(notes, "energie", "Tu te recharges " + D.recharge[soir].short + " en semaine et " + D.recharge[weekend].short + " le week-end. Ce qui te vide : " + drainText + ".");

    putNote(notes, "langage", "Tu te sens aimé·e par " + D.languages[recv].lower + ", et tu donnes surtout par " + D.languages[give].lower + ".");

    const compNames = quotidien.items.filter((it) => it.complement).map((it) => it.name);
    if (compNames.length) putNote(notes, "complementarite", "Différences qui peuvent te compléter : " + compNames.join(", ") + ".");

    const nnBits = flaws.nn.map((id) => D.flaws[id].short).concat(values.filter((v) => v.level === "Critique").map((v) => v.mine));
    if (nnBits.length) putNote(notes, "incompatibilite", "Tes non-négociables d'après le quiz : " + nnBits.join(" ; ") + ".");

    return { v: 2, imp, notes };
  }

  function encodePayload(obj) {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function computeLoveProfile(answers, D, prenomRaw) {
    const missing = missingAnswers(answers, D);
    if (missing.length) throw new Error("Réponses manquantes : " + missing.join(", "));

    const prenom = String(prenomRaw || "").replace(/[<>]/g, "").trim().slice(0, 40) || "Toi";
    const pm = screenOf(D, "plusmoins");
    const plusRank = rankNeeds(pm, answers.plusmoins.plus, "plus", D.order.need);
    const minusRank = rankNeeds(pm, answers.plusmoins.minus, "minus", D.order.need);
    const need1 = plusRank.ranked[0];
    const need2 = plusRank.ranked[1] && plusRank.score[plusRank.ranked[1]] > 0 ? plusRank.ranked[1] : null;
    const anti = minusRank.ranked[0];

    const res = answers.ressource;
    const soir = res.soir;
    const weekend = res.weekend;
    const drains = res.vide.slice();
    const same = soir === weekend;
    const line = same
      ? fill(D.ui.results.rechargeSame, { title: D.recharge[soir].title })
      : fill(D.ui.results.rechargeMixed, { soirTitle: D.recharge[soir].title, weekendTitle: D.recharge[weekend].title });

    const lang = answers.langages;
    const recv = lang.recv;
    const recv2 = lang.recv2 || null;
    const give = lang.give;
    const give2 = lang.give2 || null;
    const gap = recv === give ? D.langGap.same : D.langGap.diff;
    const noSecondary = recv2 == null ? D.langGap.noSecondary : null;

    const first = answers.enneaBase.first;
    const second = answers.enneaBase.second || null;
    const stress = answers.enneaStress.stress;
    const rankedEnnea = enneaRank(first, second, stress, D.order.ennea);
    const type = rankedEnnea.ranked[0];
    const alt = rankedEnnea.ranked[1] && rankedEnnea.scores[rankedEnnea.ranked[1]] > 0 ? rankedEnnea.ranked[1] : null;
    const confidence = type === stress && (type === first || type === second) ? "forte" : "a_verifier";
    const confidenceText = confidence === "forte"
      ? D.ennea.confidence.forte
      : fill(D.ennea.confidence.a_verifier, { typeLabel: typeLabel(D, type), altLabel: typeLabel(D, alt || type) });

    const samedi = answers.instinct.samedi;
    const souci = answers.instinct.souci;
    const instinct = samedi;
    const instinct2 = souci !== samedi ? souci : null;
    const instinctLine = instinct2 == null
      ? D.ui.results.instinctNet
      : fill(D.ui.results.instinctNuance, { name2: D.instincts[instinct2].name, desc2: D.instincts[instinct2].desc });
    const pairs = ["sp", "so", "sx"].map((p) => ({ partner: p, text: D.instinctPairs[pairKey(instinct, p)] }));

    const q = answers.quotidien;
    const items = SCENES.map((id) => {
      const tolerance = q[id];
      const self = q[id + "Self"];
      const scene = D.scenarios[id];
      const level = tolerance === "conflit" || tolerance === "tait" ? "Fort" : tolerance === "accord" ? "Faible" : null;
      const friction = level === "Fort" ? scene.friction : null;
      const complement = (tolerance === "ouvert" || tolerance === "accord") && self !== "milieu"
        ? (self === "gauche" ? scene.completeLeft : scene.completeRight)
        : null;
      return { id, name: scene.name, tolerance, self, level, friction, complement, note: D.scenarioNotes[tolerance] };
    });
    const noFriction = items.some((it) => it.level === "Fort") ? null : D.scenarioNotes.noFriction;
    const noComplement = items.some((it) => it.complement) ? null : D.scenarioNotes.noComplement;
    const quotidien = { items, noFriction, noComplement };

    const flawScreen = screenOf(D, "defauts");
    const flawAns = answers.defauts;
    const grouped = { ok: [], discuter: [], nn: [] };
    for (const id of flawScreen.items) grouped[flawAns[id]].push(id);
    const flawNote = grouped.nn.length >= 6 ? D.ui.results.flawsTooMany : grouped.nn.length === 0 ? D.ui.results.flawsNone : null;
    const flaws = { ok: grouped.ok, discuter: grouped.discuter, nn: grouped.nn, note: flawNote };

    const valueScreen = screenOf(D, "valeurs");
    const values = valueScreen.topics.map((topicId) => {
      const topic = D.valueTopics.find((t) => t.id === topicId);
      const row = answers.valeurs[topicId];
      const opt = topic.options.find((o) => o.id === row.pos);
      const firm = opt.neutral ? null : row.firm;
      const level = opt.neutral ? "Faible" : topic.levels[firm];
      return {
        topic: topic.id, topicLabel: topic.topicLabel, position: opt.id, neutral: !!opt.neutral, firm,
        level, mine: opt.mine || null, opposite: opt.opposite || null,
      };
    });
    const byLevel = (lv) => values.filter((v) => !v.neutral && v.level === lv);
    const critical = byLevel("Critique");
    const strong = byLevel("Fort");
    const soft = values.filter((v) => v.level === "Faible").map((v) => (v.neutral ? v.topicLabel + " : je m'adapte" : v.mine + " (négociable)"));

    const scene = answers.histoires.scene;
    const attirance = answers.histoires.attirance;
    const pat = patternRank(scene, attirance, D.order.pattern);
    const pattern = {
      id: pat.id,
      level: pat.level,
      levelText: D.patternLevels[pat.level],
      questions: pat.id ? D.patterns[pat.id].questions : D.aucunQuestions,
    };

    const complete = [
      "Quelqu'un qui " + D.languages[recv].partnerHint + ".",
      D.needs[need1].partner,
      D.recharge[soir].fit,
      ...items.map((it) => it.complement).filter(Boolean),
      ...(pat.id ? [D.patterns[pat.id].healing] : []),
    ];
    const friction = [
      ...strong.map((v) => v.opposite + "."),
      ...items.map((it) => it.friction).filter(Boolean),
    ];
    if (flaws.discuter.length) {
      friction.push("Défauts à discuter tôt, avec des accords clairs : " + flaws.discuter.map((id) => D.flaws[id].short).join(", ") + ".");
    }
    if (pat.id) friction.push("Attirance familière à surveiller : " + lc1(D.patterns[pat.id].reactive));
    friction.push(D.recharge[soir].risk);
    const criticalList = [
      ...critical.map((v) => v.opposite + "."),
    ];
    if (flaws.nn.length) criticalList.push("Défauts non négociables pour toi : " + flaws.nn.map((id) => D.flaws[id].short).join(", ") + ".");
    criticalList.push(D.universalCritical);

    const nonNegotiables = {
      values: critical.map((v) => v.mine),
      flaws: flaws.nn.map((id) => D.flaws[id].short),
      strong: strong.map((v) => v.mine),
      soft,
      universal: D.universal,
    };

    const drainCount = drains.length;
    const priority = {
      energie: 3 + (drainCount === 2 ? 1 : 0) + (soir === "solitaire" || weekend === "solitaire" ? 1 : 0),
      frictions: 2 + items.filter((it) => it.tolerance === "conflit" || it.tolerance === "tait").length,
      langage: 2 + (recv !== give ? 1 : 0),
      complementarite: 1 + items.filter((it) => (it.tolerance === "ouvert" || it.tolerance === "accord") && it.self !== "milieu").length,
    };
    const imp = assignImportance(priority);
    const boussole = boussolePayload({
      D, need1, need2, anti, values, flaws, quotidien, recv, give, soir, weekend, drains, imp,
    });
    // Le poids total reste 42 : 6 critiques fixes + le multiset imposé.
    const weightSum = 6 * WEIGHTS.critique + ADJUSTABLE.reduce((sum, key) => sum + WEIGHTS[imp[key]], 0);
    if (weightSum !== 42) throw new Error("Poids Boussole inattendu : " + weightSum);

    const needsPhrase = D.needs[need1].lower + (need2 ? ", puis " + D.needs[need2].lower : "");
    const nnDanger = flaws.nn.length
      ? "un ou une partenaire " + flaws.nn.slice(0, 2).map((id) => D.flaws[id].short).join(" ou ")
      : critical.length
        ? lc1(critical[0].opposite)
        : D.sentences.nnFallback;
    const third = pat.id ? D.patterns[pat.id].danger : "ton piège à toi, " + D.ennea.types[type].piege;
    const s1 = fill(D.sentences.need, {
      prenom, needs: needsPhrase, recvLower: D.languages[recv].lower, rechargeShort: D.recharge[soir].short,
    });
    const s2 = fill(D.sentences.danger, { anti: D.needs[anti].danger, nnDanger, third });
    const s3 = fill(D.sentences.ennea, {
      n: D.ennea.types[type].n,
      name: D.ennea.types[type].name,
      instinctName: D.instincts[instinct].name,
      instinctCouple: D.instincts[instinct].couple,
    });
    const sentences = [s1, s2, s3];

    const safetyId = answers.securite;
    const safety = safetyId === "present" || safetyId === "doute" ? D.safety[safetyId] : null;
    const pastAbuse = safetyId === "passe" ? D.pastAbuseNote : null;

    const shareText = D.shareTemplate.map((line) => fill(line, { s1, s2, s3, quizUrl: D.config.quizUrl })).join("\n");
    const exportVars = {
      prenom, title: D.needs[need1].title, s1, s2, s3,
      needNames: [need1, need2].filter(Boolean).map((id) => D.needs[id].name).join(", "),
      antiText: D.needs[anti].anti,
      rechargeLine: line,
      drainList: drains.map((id) => D.drains[id].short).join(", "),
      recvName: D.languages[recv].name,
      recv2Name: recv2 ? D.languages[recv2].name : "aucun autre net",
      giveName: D.languages[give].name,
      give2Name: give2 ? D.languages[give2].name : "aucun autre net",
      typeLabel: typeLabel(D, type),
      instinctName: D.instincts[instinct].name,
      confidenceText,
      patternName: pat.id ? D.patterns[pat.id].name : "aucun scénario net",
      flawsOk: listOrAucun(flaws.ok.map((id) => D.flaws[id].short)),
      flawsDiscuter: listOrAucun(flaws.discuter.map((id) => D.flaws[id].short)),
      flawsNn: listOrAucun(flaws.nn.map((id) => D.flaws[id].short)),
      nnList: bullets([...nonNegotiables.values, ...nonNegotiables.flaws, ...D.universal]),
      completeList: bullets(complete),
      frictionList: bullets(friction),
      criticalList: bullets(criticalList),
      calendly: D.config.calendly,
      quizUrl: D.config.quizUrl,
    };
    const exportText = D.exportTemplate.map((line) => fill(line, exportVars)).join("\n");

    return {
      prenom,
      title: D.needs[need1].title,
      sentences,
      shareText,
      safety,
      pastAbuse,
      needs: { top: [need1, need2], anti, plusScore: plusRank.score, minusScore: minusRank.score },
      recharge: { soir, weekend, same, drains, line },
      languages: { recv, recv2, give, give2, gap, noSecondary },
      ennea: {
        type, alt, confidence, confidenceText, scores: rankedEnnea.scores,
        instinct, instinct2, instinctLine, pairs,
      },
      quotidien,
      flaws,
      values,
      nonNegotiables,
      pattern,
      partner: { complete, friction, critical: criticalList },
      keyMessages: D.keyMessages,
      exportText,
      boussole,
    };
  }

  const api = { computeLoveProfile, missingAnswers, boussolePayload, encodePayload, fill };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AmourEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
