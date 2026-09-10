const TAGLINE = 'Le jeu vidéo qui te fait réussir ta vie dans le plaisir';

const SAMPLE_PROFILE_TEXT = `# Talent Unique

Je suis quelqu'un qui aide les autres à retrouver de la clarté quand tout leur semble confus. Mon talent, c'est de poser les bonnes questions au bon moment pour qu'une personne se comprenne elle-même mieux qu'avant notre échange. Je vibre le plus quand je vois le déclic dans les yeux de quelqu'un — ce moment où la confusion devient une décision.

## Valeurs
- Authenticité : je ne supporte pas les faux-semblants, dans mes relations comme dans mon travail
- Liberté : j'ai besoin de choisir mon rythme et mes engagements
- Transmission : ce que j'apprends n'a de sens que si je peux le transmettre

## Ressources
- Marcher en forêt seul, tôt le matin
- Les longues conversations avec mon ami Julien, en général en fin de semaine
- Écrire dans mon carnet le soir, ça me vide la tête

## Bonnes habitudes
- Méditer 10 minutes chaque matin avant de regarder mon téléphone
- Noter trois choses accomplies avant de dormir
- Appeler un proche chaque dimanche

## Contexte déclencheur
Je suis le plus dans mon talent quand je suis en tête-à-tête avec quelqu'un, dans un endroit calme, sans écran entre nous, et avec du temps devant moi. À l'inverse, les réunions à plusieurs avec un agenda serré et beaucoup d'interruptions m'éteignent complètement.

## Analyse de personnalité
Profil orienté vers l'accompagnement individuel et l'écoute profonde. Grande sensibilité au sens et à la qualité de présence plus qu'à la performance visible. Tendance à se ressourcer seul mais à s'épanouir pleinement dans l'échange à deux.`;

const App = {
  state: {
    user: null,
    view: 'login',
    onboardingIndex: 0,
    activeTab: 'dashboard',
    tempCategories: [],
    tempList: [],
    tempChoice: '',
    magicLinkSent: false,
    magicLinkEmail: '',
    loginError: null
  },

  init() {
    let initialized = false;
    supabaseClient.auth.onAuthStateChange((event, session) => {
      const wasLoggedIn = !!Auth.currentUser;
      Auth.currentUser = session ? { id: session.user.id, email: session.user.email } : null;

      if (!initialized) {
        initialized = true;
        if (Auth.currentUser) this._loadUserData();
        else { this.state.view = 'login'; this.render(); }
        return;
      }
      if (Auth.currentUser && !wasLoggedIn) {
        this._loadUserData();
      } else if (!Auth.currentUser && wasLoggedIn) {
        this.state.user = null;
        this.state.view = 'login';
        this.state.magicLinkSent = false;
        this.render();
      }
    });
  },

  async _loadUserData() {
    try {
      const user = await Store.load();
      this.state.user = user;
      if (user) {
        if (!user.onboarding_complete) {
          if (user.onboarding_at_recap) {
            this.state.view = 'onboarding-recap';
          } else {
            this.state.view = 'onboarding';
            this.state.onboardingIndex = user.onboarding_step || 0;
            this._prepareTempStateForStep(this.state.onboardingIndex);
          }
        } else {
          this.state.view = 'app';
        }
      } else {
        this.state.view = 'import';
      }
    } catch (e) {
      console.error('Chargement des données impossible', e);
      this.state.loginError = "Impossible de charger ta sauvegarde. Réessaie dans un instant.";
      this.state.view = 'login';
    }
    this.render();
  },

  // ---------- Connexion (magic link) ----------

  async submitMagicLink(formEl) {
    const email = (new FormData(formEl).get('email') || '').trim();
    if (!email) return;
    this.state.loginError = null;
    const error = await Auth.sendMagicLink(email);
    if (error) {
      this.state.loginError = "Impossible d'envoyer le lien. Vérifie l'adresse et réessaie.";
      console.error('sendMagicLink', error);
    } else {
      this.state.magicLinkSent = true;
      this.state.magicLinkEmail = email;
    }
    this.render();
  },

  backToLoginForm() {
    this.state.magicLinkSent = false;
    this.render();
  },

  async signOut() {
    await Auth.signOut();
  },

  render() {
    const root = document.getElementById('app');
    if (!root) return;
    try {
      if (this.state.view === 'login') root.innerHTML = Auth.renderLogin(this.state);
      else if (this.state.view === 'import') root.innerHTML = this._renderImport();
      else if (this.state.view === 'onboarding') root.innerHTML = this._renderOnboarding();
      else if (this.state.view === 'onboarding-recap') root.innerHTML = this._renderOnboardingRecap();
      else root.innerHTML = this._renderApp();
    } catch (e) {
      // Filet de sécurité : sans ça, une exception pendant le rendu laisse
      // #app vide (rien à l'écran, rien à cliquer) sans aucun moyen pour le
      // joueur de s'en sortir depuis l'UI.
      console.error('Render failed', e);
      root.innerHTML = this._renderCrashRecovery();
    }
  },

  _renderCrashRecovery() {
    return `
      <div class="import-shell">
        <h1 class="hero-title">Oups, ça a buggé</h1>
        <p class="hero-sub">Quelque chose s'est mal passé. Tu peux te reconnecter sans rien perdre : ta sauvegarde est sur le serveur, pas dans ce navigateur.</p>
        <button class="btn-primary" onclick="App.hardReset()">Se reconnecter</button>
      </div>
    `;
  },

  hardReset() {
    Auth.signOut();
  },

  // ---------- Import ----------

  _renderImport() {
    return `
      <div class="import-shell">
        <h1 class="hero-title">${TAGLINE}</h1>
        <p class="hero-sub">Colle ici le contenu de ta page Notion Talent Unique (talent, valeurs, ressources, bonnes habitudes, contexte déclencheur).</p>
        <textarea id="import-textarea" rows="12" placeholder="Colle ton profil Talent Unique ici..."></textarea>
        <div class="import-actions">
          <button class="btn-primary" onclick="App.submitImport()">Commencer</button>
          <button class="btn-ghost" onclick="App.submitImportSample()">Essayer avec un profil de test</button>
        </div>
      </div>
    `;
  },

  submitImport() {
    const el = document.getElementById('import-textarea');
    const text = el ? el.value.trim() : '';
    if (!text) {
      alert('Colle ton profil avant de continuer, ou essaie avec le profil de test.');
      return;
    }
    this._beginJourney(text);
  },

  submitImportSample() {
    this._beginJourney(SAMPLE_PROFILE_TEXT);
  },

  _beginJourney(text) {
    const parsed = TalentParser.parse(text);
    const user = Store.createUser(text, parsed);
    this.state.user = user;
    this.state.view = 'onboarding';
    this.state.onboardingIndex = 0;
    this._prepareTempStateForStep(0);
    this.render();
  },

  // ---------- Onboarding ----------

  _renderOnboarding() {
    const u = this.state.user;
    Onboarding.rebuildProfile(u);
    const idx = this.state.onboardingIndex;
    const step = Onboarding.getStep(idx);
    if (!step) return '';
    const progressPct = Math.round((idx / Onboarding.TOTAL_STEPS) * 100);
    return `
      <div class="onboarding-shell">
        <div class="progress-header">
          <div class="progress-bar"><div class="progress-fill" style="width:${progressPct}%"></div></div>
          <div class="progress-label">Étape ${step.etape}/8 — ${step.etapeLabel} · Question ${idx + 1}/${Onboarding.TOTAL_STEPS}</div>
        </div>
        ${this._renderStepper(u, idx)}
        <div class="question-card">
          <div class="question-nav-top">
            <button class="btn-ghost btn-prev" ${idx === 0 ? 'disabled' : ''} onclick="App.goToOnboardingStep(${idx - 1})">← Précédent</button>
          </div>
          <p class="question-text">${this._nl2br(step.prompt(u))}</p>
          ${this._renderStepWidget(step, u, idx)}
        </div>
      </div>
    `;
  },

  _renderStepper(u, currentIdx) {
    const maxReached = u.onboarding_max_reached || 0;
    const dots = [];
    for (let i = 0; i < Onboarding.TOTAL_STEPS; i++) {
      const reachable = i <= maxReached;
      const answered = u.onboarding_answers[i] !== null && u.onboarding_answers[i] !== undefined && u.onboarding_answers[i] !== '';
      const cls = ['step-dot'];
      if (i === currentIdx) cls.push('step-dot-current');
      else if (answered) cls.push('step-dot-answered');
      if (!reachable) cls.push('step-dot-locked');
      dots.push(`<button type="button" class="${cls.join(' ')}" ${reachable ? `onclick="App.goToOnboardingStep(${i})"` : 'disabled'} title="Question ${i + 1}">${i + 1}</button>`);
    }
    return `<div class="stepper">${dots.join('')}</div>`;
  },

  goToOnboardingStep(idx) {
    const u = this.state.user;
    const maxReached = u.onboarding_max_reached || 0;
    if (idx < 0 || idx > maxReached) return;
    u.onboarding_at_recap = false;
    u.onboarding_step = idx;
    Store.save(u);
    this.state.view = 'onboarding';
    this.state.onboardingIndex = idx;
    this._prepareTempStateForStep(idx);
    this.render();
  },

  _prepareTempStateForStep(idx) {
    const step = Onboarding.getStep(idx);
    const u = this.state.user;
    if (!step || !u) return;
    const saved = u.onboarding_answers[idx];
    const hasSaved = saved !== null && saved !== undefined;
    if (step.type === 'categories') {
      const existing = Object.entries(u.profil_structure.quotas_categories);
      this.state.tempCategories = hasSaved
        ? saved.map(c => ({ ...c }))
        : (existing.length ? existing.map(([id, c]) => ({ id, label: c.label, couleur: c.couleur })) : DEFAULT_CATEGORIES.map(c => ({ ...c })));
    } else if (step.type === 'valeurs-editor') {
      this.state.tempList = hasSaved
        ? [...saved.valeurs]
        : (u.profil_structure.valeurs.length ? [...u.profil_structure.valeurs] : [...(u.parsed_seed.valeurs || [])]);
      this.state.tempChoice = hasSaved ? saved.plusEprouvee : (this.state.tempList[0] || '');
    } else if (step.type === 'ressources-editor') {
      this.state.tempList = hasSaved
        ? [...saved]
        : (u.profil_structure.ressources.length ? u.profil_structure.ressources.map(r => r.nom) : [...(u.parsed_seed.ressources || [])].slice(0, 3));
    }
  },

  _renderStepWidget(step, u, idx) {
    const saved = u.onboarding_answers[idx];
    switch (step.type) {
      case 'textarea': {
        const seed = (saved !== null && saved !== undefined) ? saved : step.prefill(u);
        return `
          <textarea id="step-input" class="step-textarea" rows="4">${this._esc(seed)}</textarea>
          <button class="btn-primary" onclick="App.submitTextareaStep()">Continuer</button>
        `;
      }
      case 'choice':
        return `
          <div class="choice-row">
            ${step.options(u).map(o => `<button class="btn-choice ${o.value === saved ? 'btn-choice-selected' : ''}" onclick="App.submitOnboardingStep('${this._escAttr(o.value)}')">${o.label}</button>`).join('')}
          </div>
        `;
      case 'categories':
        return this._renderCategoriesWidget();
      case 'valeurs-editor':
        return this._renderValeursWidget();
      case 'ressources-editor':
        return this._renderListWidget('+ ajouter une ressource');
      default:
        return '';
    }
  },

  _renderCategoriesWidget() {
    return `
      <div class="cat-editor">
        ${this.state.tempCategories.map((c, i) => `
          <span class="chip" style="--c:${c.couleur}">
            <input value="${this._escAttr(c.label)}" onchange="App.renameTempCategory(${i}, this.value)">
            <button type="button" onclick="App.removeTempCategory(${i})">✕</button>
          </span>
        `).join('')}
        <span class="chip chip-add">
          <input id="new-cat-input" placeholder="+ ajouter" onkeydown="if(event.key==='Enter'){event.preventDefault();App.addTempCategory(this.value);this.value='';}">
        </span>
      </div>
      <button class="btn-primary" onclick="App.submitCategoriesStep()">Continuer</button>
    `;
  },

  renameTempCategory(i, val) { this.state.tempCategories[i].label = val; },
  removeTempCategory(i) {
    if (this.state.tempCategories.length <= 1) return;
    this.state.tempCategories.splice(i, 1);
    this.render();
  },
  addTempCategory(val) {
    if (!val.trim()) return;
    this.state.tempCategories.push({
      id: Quotas.slugify(val) + '-' + Math.random().toString(36).slice(2, 5),
      label: val.trim(),
      couleur: PALETTE_LIBRE[this.state.tempCategories.length % PALETTE_LIBRE.length]
    });
    this.render();
  },
  submitCategoriesStep() { this.submitOnboardingStep(this.state.tempCategories); },

  _renderValeursWidget() {
    return `
      <div class="list-editor">
        ${this.state.tempList.map((v, i) => `
          <span class="chip">
            <input value="${this._escAttr(v)}" onchange="App.renameTempListItem(${i}, this.value)">
            <button type="button" onclick="App.removeTempListItem(${i})">✕</button>
          </span>
        `).join('')}
        <span class="chip chip-add">
          <input id="new-list-input" placeholder="+ ajouter une valeur" onkeydown="if(event.key==='Enter'){event.preventDefault();App.addTempListItem(this.value);this.value='';}">
        </span>
      </div>
      <label class="field-label">Laquelle est la plus mise à l'épreuve ?</label>
      <select id="valeur-eprouvee-select" onchange="App.state.tempChoice=this.value">
        ${this.state.tempList.map(v => `<option value="${this._escAttr(v)}" ${v === this.state.tempChoice ? 'selected' : ''}>${v}</option>`).join('')}
      </select>
      <button class="btn-primary" onclick="App.submitValeursStep()">Continuer</button>
    `;
  },

  submitValeursStep() {
    const select = document.getElementById('valeur-eprouvee-select');
    const plusEprouvee = select ? select.value : this.state.tempChoice;
    this.submitOnboardingStep({ valeurs: [...this.state.tempList], plusEprouvee });
  },

  _renderListWidget(addPlaceholder) {
    return `
      <div class="list-editor">
        ${this.state.tempList.map((v, i) => `
          <span class="chip">
            <input value="${this._escAttr(v)}" onchange="App.renameTempListItem(${i}, this.value)">
            <button type="button" onclick="App.removeTempListItem(${i})">✕</button>
          </span>
        `).join('')}
        <span class="chip chip-add">
          <input id="new-list-input" placeholder="${addPlaceholder}" onkeydown="if(event.key==='Enter'){event.preventDefault();App.addTempListItem(this.value);this.value='';}">
        </span>
      </div>
      <button class="btn-primary" onclick="App.submitListStep()">Continuer</button>
    `;
  },

  renameTempListItem(i, val) { this.state.tempList[i] = val; },
  removeTempListItem(i) { this.state.tempList.splice(i, 1); this.render(); },
  addTempListItem(val) {
    if (!val.trim()) return;
    this.state.tempList.push(val.trim());
    this.render();
  },
  submitListStep() { this.submitOnboardingStep([...this.state.tempList]); },

  submitTextareaStep() {
    const el = document.getElementById('step-input');
    this.submitOnboardingStep(el ? el.value : '');
  },

  submitOnboardingStep(value) {
    const idx = this.state.onboardingIndex;
    const u = this.state.user;
    const alreadyDidFullPass = (u.onboarding_max_reached || 0) >= Onboarding.TOTAL_STEPS;

    u.onboarding_answers[idx] = value;
    u.onboarding_max_reached = Math.max(u.onboarding_max_reached || 0, idx + 1);
    Onboarding.rebuildProfile(u);

    if (alreadyDidFullPass || idx + 1 >= Onboarding.TOTAL_STEPS) {
      u.onboarding_at_recap = true;
      Store.save(u);
      this.state.view = 'onboarding-recap';
    } else {
      u.onboarding_step = idx + 1;
      Store.save(u);
      this.state.onboardingIndex = idx + 1;
      this._prepareTempStateForStep(idx + 1);
    }
    this.render();
  },

  // ---------- Récapitulatif ----------

  _renderOnboardingRecap() {
    const u = this.state.user;
    Onboarding.rebuildProfile(u);
    const rows = Onboarding.STEPS.map((step, idx) => `
      <tr>
        <td class="recap-num">${idx + 1}</td>
        <td class="recap-label">${Esc.html(step.recapLabel)}</td>
        <td class="recap-answer">${Esc.html(Onboarding.formatAnswer(idx, u))}</td>
        <td class="recap-edit"><button type="button" class="btn-ghost" onclick="App.editOnboardingAnswer(${idx})">Modifier</button></td>
      </tr>
    `).join('');
    return `
      <div class="onboarding-shell">
        <div class="section-title">Récapitulatif de tes réponses</div>
        <p class="muted-text">Vérifie, corrige ce que tu veux, puis lance ta partie.</p>
        <div class="recap-table-wrap">
          <table class="recap-table"><tbody>${rows}</tbody></table>
        </div>
        <button class="btn-primary" onclick="App.confirmOnboarding()">Commencer à jouer 🎮</button>
      </div>
    `;
  },

  editOnboardingAnswer(idx) {
    this.goToOnboardingStep(idx);
  },

  confirmOnboarding() {
    const u = this.state.user;
    Onboarding.finalize(u);
    this.state.view = 'app';
    this.state.activeTab = 'dashboard';
    this.render();
  },

  // ---------- App (dashboard + modules) ----------

  _renderApp() {
    const u = this.state.user;
    const modules = u.profil_structure.modules_actifs;
    const tabs = [
      { id: 'dashboard', label: '🎮 Quêtes' },
      { id: 'ressourcement', label: '🌿 Ressourcement' },
      { id: 'habitudes', label: '🔁 Habitudes' }
    ];
    if (modules.includes('crm')) tabs.push({ id: 'crm', label: '🤝 Réseau' });
    tabs.push({ id: 'settings', label: '⚙️ Paramètres' });

    return `
      <div class="app-shell">
        <header class="app-header">
          <div class="app-title">${TAGLINE}</div>
          ${modules.includes('moodboard') ? '<span class="tag-soon">Module Moodboard activé — arrive en v2</span>' : ''}
        </header>
        <nav class="tab-nav">
          ${tabs.map(t => `<button class="tab-btn ${this.state.activeTab === t.id ? 'active' : ''}" onclick="App.switchTab('${t.id}')">${t.label}</button>`).join('')}
        </nav>
        <main class="tab-content">${this._renderActiveTab()}</main>
        <div id="reward-overlay"></div>
      </div>
    `;
  },

  _renderActiveTab() {
    const u = this.state.user;
    switch (this.state.activeTab) {
      case 'dashboard': return Dashboard.render(u);
      case 'ressourcement': return Ressourcement.render(u);
      case 'habitudes': return Habitudes.render(u);
      case 'crm': return Crm.render(u);
      case 'settings': return Restart.render(u);
      default: return '';
    }
  },

  switchTab(id) { this.state.activeTab = id; this.render(); },

  // ---------- Actions : quêtes ----------

  declareQuest(id) {
    const u = this.state.user;
    const quete = u.progression.quetes.find(q => q.id === id);
    if (!quete || quete.statut !== 'a_faire') return;
    const { nouveauxBadges } = Store.addDeclaration(u, quete);
    this.render();
    this._showReward(quete.points, nouveauxBadges);
  },

  requestFollowUpQuest() {
    const u = this.state.user;
    const q = QuestGenerator.generateFollowUpQuest(u);
    if (q) { u.progression.quetes.push(q); Store.save(u); }
    this.render();
  },

  _showReward(points, nouveauxBadges) {
    const overlay = document.getElementById('reward-overlay');
    if (!overlay) return;
    const badgeHtml = (nouveauxBadges || [])
      .map(b => `<div class="reward-badge">${b.emoji} Nouveau badge : ${b.label}</div>`)
      .join('');
    overlay.innerHTML = `<div class="reward-pop">+${points} pts ⚡${badgeHtml}</div>`;
    const pop = overlay.querySelector('.reward-pop');
    requestAnimationFrame(() => pop && pop.classList.add('reward-pop-show'));
    setTimeout(() => { overlay.innerHTML = ''; }, 1800);
  },

  // ---------- Actions : ressourcement ----------

  markResourceUsed(id) {
    const u = this.state.user;
    const r = u.profil_structure.ressources.find(res => res.id === id);
    if (r) { r.dernier_moment = new Date().toISOString(); Store.save(u); }
    this.render();
  },

  // ---------- Actions : CRM ----------

  addContact(formEl) {
    const u = this.state.user;
    const data = new FormData(formEl);
    const nom = (data.get('nom') || '').trim();
    if (!nom) return;
    u.progression.contacts.push({
      id: crypto.randomUUID(),
      nom,
      role: (data.get('role') || '').trim(),
      frequence_souhaitee: data.get('frequence'),
      dernier_contact: null,
      notes: ''
    });
    Store.save(u);
    this.render();
  },

  markContactSeen(id) {
    const u = this.state.user;
    const c = u.progression.contacts.find(ct => ct.id === id);
    if (c) { c.dernier_contact = new Date().toISOString(); Store.save(u); }
    this.render();
  },

  // ---------- Actions : paramètres / catégories ----------

  renameCategorySetting(id, val) {
    Quotas.renameCategory(this.state.user.profil_structure.quotas_categories, id, val);
    Store.save(this.state.user);
  },
  updateQuotaSetting(id, val) {
    const q = this.state.user.profil_structure.quotas_categories[id];
    if (q) q.quota_points = Math.max(1, parseInt(val, 10) || 1);
    Store.save(this.state.user);
  },
  removeCategorySetting(id) {
    const quotas = this.state.user.profil_structure.quotas_categories;
    if (Object.keys(quotas).length <= 1) return;
    Quotas.removeCategory(quotas, id);
    Store.save(this.state.user);
    this.render();
  },
  addCategorySetting(formEl) {
    const label = (new FormData(formEl).get('label') || '').trim();
    if (!label) return;
    Quotas.addCategory(this.state.user.profil_structure.quotas_categories, label);
    Store.save(this.state.user);
    this.render();
  },

  confirmRestart() {
    if (!confirm('Repartir à zéro ? Ta progression (quêtes, points, badges) sera remise à zéro. Ton profil et tes réglages restent intacts.')) return;
    const u = this.state.user;
    Store.restart(u);
    u.progression.quetes = QuestGenerator.generateStarterQuests(u);
    Store.save(u);
    this.state.activeTab = 'dashboard';
    this.render();
  },

  // ---------- Utils ----------

  _esc(str) { return Esc.html(str); },
  _escAttr(str) { return Esc.attr(str); },
  _nl2br(str) { return Esc.nl2br(str); }
};

document.addEventListener('DOMContentLoaded', () => App.init());
