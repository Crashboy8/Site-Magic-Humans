/* Quiz Amour · moteur de calcul pur (aucun DOM). Déterministe : mêmes réponses, même résultat.
   Utilisé par quiz/amour.js (navigateur) et par quiz/amour.test.mjs (node --test). */
(function (root) {
  const LEVEL_RANK = { Critique: 3, Fort: 2, Faible: 1 };

  function fill(tpl, vars) {
    return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? "" : String(vars[k])));
  }
  const lc1 = (t) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t);

  /** Vérifie que toutes les questions ont une réponse valide. Renvoie la liste des ids manquants ou invalides. */
  function missingAnswers(answers, D) {
    const bad = [];
    for (const q of D.questions) {
      const a = answers[q.id];
      if (q.type === "single") {
        if (!q.options.some((o) => o.id === a)) bad.push(q.id);
      } else if (q.type === "value") {
        const opt = a && q.options.find((o) => o.id === a.pos);
        if (!opt) bad.push(q.id);
        else if (!opt.neutral && !D.firmness.some((f) => f.id === a.firm)) bad.push(q.id);
      } else if (q.type === "grid") {
        if (!a || q.axes.some((ax) => ![-2, -1, 0, 1, 2].includes(a[ax.id]))) bad.push(q.id);
      }
    }
    return bad;
  }

  /** Somme des points « add » des questions à choix unique. */
  function computeScores(answers, D) {
    const s = {};
    for (const q of D.questions) {
      if (q.type !== "single") continue;
      const opt = q.options.find((o) => o.id === answers[q.id]);
      if (!opt) continue;
      for (const [k, v] of Object.entries(opt.add || {})) s[k] = (s[k] || 0) + v;
    }
    return s;
  }

  /** Classe les ids d'un groupe : score décroissant, puis questions de départage (dans l'ordre), puis ordre fixe. */
  function rank(group, ids, tieQuestions, scores, answers) {
    const tie = (id) => {
      const i = tieQuestions.findIndex((qid) => answers[qid] === id);
      return i === -1 ? 99 : i;
    };
    return [...ids]
      .map((id) => ({ id, score: scores[group + "." + id] || 0 }))
      .sort((a, b) => b.score - a.score || tie(a.id) - tie(b.id) || ids.indexOf(a.id) - ids.indexOf(b.id));
  }

  function patternLevel(score) {
    if (score >= 6) return "net";
    if (score >= 4) return "probable";
    if (score >= 2) return "leger";
    return "aucun";
  }

  /** Niveau de risque si un partenaire était à l'opposé sur une valeur. */
  function valueLevel(q, opt, firm) {
    if (opt.neutral) return "Faible";
    return q.levels[firm];
  }

  function computeLoveProfile(answers, D, prenomRaw) {
    const missing = missingAnswers(answers, D);
    if (missing.length) throw new Error("Réponses manquantes : " + missing.join(", "));
    const prenom = String(prenomRaw || "").replace(/[<>]/g, "").trim().slice(0, 40) || "Toi";
    const scores = computeScores(answers, D);
    const L = D.languages, P = D.patterns, N = D.needs, M = D.masks, AX = D.axes;

    // 1. Langages de l'amour
    const recvRank = rank("recv", D.order.lang, ["q04", "q02", "q03"], scores, answers);
    const giveRank = rank("give", D.order.lang, ["q05", "q06", "q07"], scores, answers);
    const recv = recvRank[0].id, give = giveRank[0].id;
    const recv2 = recvRank[1].score > 0 ? recvRank[1].id : null;
    const give2 = giveRank[1].score > 0 ? giveRank[1].id : null;

    // 2. Scénario répété (Imago)
    const patRank = rank("pat", D.order.pat, ["q10", "q08", "q09", "q11"], scores, answers);
    const patScore = patRank[0].score;
    const level = patternLevel(patScore);
    const pattern = level === "aucun" ? null : patRank[0].id;

    // 3. Besoins, Anti-Contexte, Ressourcement
    const needRank = rank("need", D.order.need, ["q12", "q13", "q14"], scores, answers);
    const need1 = needRank[0].id, need2 = needRank[1].id;
    const antiNeed = answers.q13, ressNeed = answers.q14;

    // 4. Masque
    const maskRank = rank("mask", D.order.mask, ["q17", "q16", "q15"], scores, answers);
    const mask = maskRank[0].id;

    // 5. Valeurs et non-négociables
    const values = D.questions.filter((q) => q.type === "value").map((q) => {
      const a = answers[q.id], opt = q.options.find((o) => o.id === a.pos);
      const firm = opt.neutral ? null : a.firm;
      return { qid: q.id, topic: q.topic, topicLabel: q.topicLabel, position: opt.id, neutral: !!opt.neutral, firm,
               level: valueLevel(q, opt, firm), mine: opt.mine || null, opposite: opt.opposite || null };
    });
    const byLevel = (lv) => values.filter((v) => !v.neutral && v.level === lv);
    const critical = byLevel("Critique"), strong = byLevel("Fort");
    const soft = values.filter((v) => v.level === "Faible").map((v) => (v.neutral ? v.topicLabel + " : je m'adapte" : v.mine + " (négociable)"));

    // 6. Forme : complémentarités et frictions
    const grid = answers.q26, irritant = answers.q27 === "aucune" ? null : answers.q27;
    const axisIds = Object.keys(AX);
    let formeFriction = null;
    if (irritant) {
      const p = grid[irritant], ax = AX[irritant];
      formeFriction = { axis: irritant, level: Math.abs(p) === 2 ? "Fort" : "Faible",
                        text: p < 0 ? ax.frictionLeft : p > 0 ? ax.frictionRight : ax.frictionMid };
    }
    const complements = axisIds
      .filter((id) => id !== irritant && grid[id] !== 0)
      .sort((a, b) => Math.abs(grid[b]) - Math.abs(grid[a]) || axisIds.indexOf(a) - axisIds.indexOf(b))
      .slice(0, 2)
      .map((id) => (grid[id] < 0 ? AX[id].completeLeft : AX[id].completeRight));

    // 7. Partenaire
    const fond = [...critical, ...strong].slice(0, 2).map((v) => lc1(v.mine));
    const completeList = [
      "Quelqu'un qui " + L[recv].partnerHint + ".",
      N[need1].partner,
      ...(fond.length ? ["Quelqu'un qui partage ce qui compte pour toi : " + fond.join(", et ") + "."] : []),
      ...complements,
      ...(pattern ? [P[pattern].healing] : [])
    ];
    const frictionList = [
      ...strong.map((v) => v.opposite + "."),
      ...(formeFriction ? [formeFriction.text + (formeFriction.level === "Faible" ? " (friction légère, gérable avec de l'humour et quelques accords)" : "")] : []),
      ...(pattern ? ["Attirance familière à surveiller : " + lc1(P[pattern].reactive)] : [])
    ];
    if (!formeFriction) frictionList.push(D.formeNoFriction);
    const criticalList = [...critical.map((v) => v.opposite + "."), D.universalCritical];
    const nnList = critical.map((v) => v.mine);

    // 8. Textes assemblés
    const nnLine = nnList.length === 0 ? D.summaryNoNn : nnList.length === 1 ? D.summaryNn.one : fill(D.summaryNn.many, { n: nnList.length });
    const vars = {
      prenom, title: N[need1].title,
      recvLower: L[recv].lower, giveLower: L[give].lower,
      needShort: N[need1].short, need2Short: N[need2].short,
      maskName: M[mask].name, quality: M[mask].quality,
      patternLine: pattern ? fill(D.summaryPattern, { patternName: lc1(P[pattern].name) }) : "",
      nnLine
    };
    const summary = fill(D.summary, vars);
    const plan = D.plan.map((t) => fill(t, {
      sentence: L[recv].sentence,
      patternStep: pattern ? P[pattern].step : D.planNoPattern,
      ress: lc1(N[ressNeed].ress)
    }));
    const bullets = (arr) => (arr.length ? arr.map((x) => "- " + x).join("\n") : "- (aucun)");
    const exportText = D.exportTemplate.map((t) => fill(t, {
      prenom, title: N[need1].title, summary,
      recvName: L[recv].name, recv2Name: recv2 ? L[recv2].name : "aucun autre net",
      giveName: L[give].name, give2Name: give2 ? L[give2].name : "aucun autre net",
      patternName: pattern ? P[pattern].name : "aucun scénario net",
      need1Name: N[need1].name, need2Name: N[need2].name,
      anti: N[antiNeed].anti, ress: N[ressNeed].ress,
      maskName: M[mask].name, quality: M[mask].quality,
      nnList: bullets([...nnList, ...D.universal]),
      completeList: bullets(completeList), frictionList: bullets(frictionList), criticalList: bullets(criticalList),
      calendly: D.config.calendly, quizUrl: D.config.quizUrl
    })).join("\n");

    return {
      prenom, title: N[need1].title, summary,
      opener: D.opener[answers.q01],
      safety: answers.q28 === "present" || answers.q28 === "doute" ? D.safety[answers.q28] : null,
      pastAbuse: answers.q28 === "passe" ? D.pastAbuseNote : null,
      languages: { recv, recv2, give, give2, gap: recv === give ? D.langGap.same : D.langGap.diff,
                   noSecondary: !recv2 ? D.langGap.noSecondary : null, scores: { recv: recvRank, give: giveRank } },
      pattern: { id: pattern, level, levelText: D.patternLevels[level], score: patScore,
                 questions: pattern ? P[pattern].questions : D.aucunQuestions },
      needs: { top: [need1, need2], anti: N[antiNeed].anti, ress: N[ressNeed].ress, ranking: needRank },
      mask: { id: mask, ranking: maskRank },
      values, nonNegotiables: { critical: nnList, strong: strong.map((v) => v.mine), soft, universal: D.universal },
      forme: { grid, irritant, friction: formeFriction, complements, noComplement: complements.length ? null : D.formeNoComplement },
      partner: { complete: completeList, friction: frictionList, critical: criticalList },
      plan, keyMessages: D.keyMessages, exportText
    };
  }

  const API = { computeLoveProfile, computeScores, missingAnswers, rank, patternLevel, fill };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.AmourEngine = API;
})(typeof window !== "undefined" ? window : globalThis);
