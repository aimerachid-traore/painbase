// ================================================================
//  i18n.js — PainBase internationalisation EN / FR
//  Auto-detect browser language, toggle saved in localStorage.
//  Exposes: window.t(key), window.setLang(lang), window.PB_LANG
// ================================================================
(function () {

  const LANGS = {
    en: {
      nav: {
        browse: 'Browse problems', leaderboard: 'Leaderboard',
        how: 'How it works', pricing: 'Pricing', dashboard: 'Dashboard',
        signin: 'Sign in', start: 'Start hunting',
        saved: 'My saved problems', signout: 'Sign out',
      },
      hero: {
        live: 'Listening to the internet · updated hourly',
        h1: 'The database of <em>real problems</em> worth solving.',
        sub: 'PainBase mines Reddit, Hacker News &amp; forums for the things people <b>actually complain about</b> — then clusters them into validated, fundable problems. Stop guessing what to build.',
        placeholder: 'Search a problem, e.g. "invoices", "sleep", "onboarding"…',
        search_btn: 'Search',
        stat1: 'problems tracked', stat2: 'sources mined', stat3: 'posts analysed',
      },
      themes: { all: 'All themes' },
      section: {
        trending: 'Trending pain points',
        leaderboard: 'Most complained-about · this week',
        lb_meta: 'ranked by verified mentions',
        how: 'How PainBase works',
        how_meta: 'listen → cluster → surface',
      },
      lb: { problem: 'Problem', mentions: 'Mentions', growth: 'Growth', volume: 'Volume' },
      steps: {
        s1_n: '01 / LISTEN', s1_h: 'We never stop scraping',
        s1_p: 'Workers continuously pull posts & comments from Reddit, Hacker News and forums where people vent about unsolved problems.',
        s2_n: '02 / CLUSTER', s2_h: 'AI groups the noise',
        s2_p: 'Every post is classified, de-duplicated and clustered by embeddings, so 230 separate rants become one quantified problem.',
        s3_n: '03 / SURFACE', s3_h: 'You get the brief',
        s3_p: 'For each problem, the AI writes a summary, scores demand & competition, and suggests a product angle you could actually ship.',
      },
      cta: {
        h2: 'Your next idea is already a complaint.',
        p: "Thousands of people are describing problems they'd pay to fix. PainBase hands them to you, validated and sorted.",
        btn: 'Start hunting — free',
      },
      footer: {
        tagline: 'Real problems, mined hourly. Built for builders.',
        browse: 'Browse', leaderboard: 'Leaderboard', how: 'How it works',
        pricing: 'Pricing', dashboard: 'Dashboard', api: 'API', terms: 'Terms',
      },
      auth: {
        signin_tab: 'Sign in', signup_tab: 'Create account',
        email: 'Email', password: 'Password',
        forgot: 'Forgot password?', signin_btn: 'Sign in →',
        pass_placeholder: '8+ characters', signup_btn: 'Create free account →',
        or: 'or', google: 'Continue with Google', loading: 'Loading…',
        welcome: 'Welcome back!',
        account_created: 'Account created! Check your email to confirm.',
        wrong_creds: 'Wrong email or password.',
        reset_sent: 'Check your inbox for a reset link.',
        enter_email: 'Enter your email first.',
      },
      mob: { signin: 'Sign in', start: 'Start hunting — free', signout: 'Sign out' },
      search: {
        loading: 'Loading problems…',
        ai_label: '🔍 Real-time AI search',
        no_base_prefix: 'No results in database for',
        no_base_suffix: '— scraping Reddit & HN…',
        step1: 'Scraping Reddit…', step2: 'Scraping Hacker News…',
        step3: 'AI analysis in progress…', step4: 'Generating ideas…',
        posts_analyzed: 'posts analyzed on Reddit & HN',
        no_opportunity: 'No opportunity detected. Try a more specific term.',
        error: 'Search error. Please try again.',
        confidence: 'AI confidence:', sources: 'Sources:',
        min_chars: 'Type at least 3 characters to search.',
        no_problems: 'No problems available.',
        no_problems_yet: 'No problems available yet.\nThe pipeline is collecting data — try again in a few moments.',
        problem: 'problem', problems: 'problems', mentions: 'mentions',
      },
      detail: {
        loading: 'Loading…', breadcrumb: 'Browse problems',
        save: 'Save problem', saved_btn: 'Saved',
        explore: 'Explore product angles →', share: 'Share',
        mentions_lbl: 'Verified mentions', growth_lbl: 'Growth this week',
        src_posts_lbl: 'Source posts', opp_lbl: 'Opportunity score',
        updated: 'last updated',
        source_posts: 'Source posts',
        showing_of: function (total) { return 'showing 5 of ' + total; },
        more_posts: function (n) { return 'Show more posts (' + n + ' remaining)'; },
        opp_scores: 'Opportunity scores',
        demand: 'Demand intensity', competition: 'Competition density', opportunity: 'Opportunity gap',
        who_complaining: "Who's complaining", by_segment: 'by segment',
        existing_solutions: 'Existing solutions', partial_fits: 'partial fits only',
        related_problems: 'Related problems',
        ai_analysis: 'AI analysis', how_ai_built: 'how this brief was built',
        trend_chart: 'Mention trend', trend_meta: 'weekly · last 12 weeks',
        product_angle: 'Product angle:',
        gap_none: 'Gap ✓', gap_partial: 'Partial',
        view_original: 'View original →', comments: 'comments',
        signin_for_sources: 'Sign in to see all source posts →',
        all_sources_shown: function (n) { return n + ' posts collected — all shown'; },
        not_found_h2: 'Problem not found',
        not_found_p: "This problem doesn't exist or may have been removed.",
        browse_all: '← Browse all problems',
        link_copied: '✓ Link copied!',
      },
      dash: {
        greeting: 'MY WORKSPACE', title: 'Your dashboard',
        stat_saved: 'Problems saved', stat_themes: 'Themes explored', stat_plan: 'Current plan',
        tab_saved: 'Saved problems', tab_activity: 'Recent activity',
        loading: 'Loading…',
        empty_h: "You haven't saved any problems yet.",
        empty_p: 'Browse the database and save problems worth building on.',
        empty_cta: 'Browse problems →',
        locked_h: 'Sign in to see your problems',
        locked_p: 'Create a free account to save and track the problems worth building.',
        locked_btn: 'Sign in →',
      },
      pricing: {
        eyebrow: 'PRICING',
        h1: '100% <em>free</em>.<br>Forever.',
        p: 'PainBase is completely free during beta. Create an account, explore all problems, save the ones that interest you.',
      },
    },

    fr: {
      nav: {
        browse: 'Explorer', leaderboard: 'Classement',
        how: 'Comment ça marche', pricing: 'Tarifs', dashboard: 'Tableau de bord',
        signin: 'Connexion', start: 'Commencer',
        saved: 'Mes problèmes sauvegardés', signout: 'Déconnexion',
      },
      hero: {
        live: 'À l\'écoute d\'internet · mis à jour toutes les heures',
        h1: 'La base de données des <em>vrais problèmes</em> à résoudre.',
        sub: 'PainBase analyse Reddit, Hacker News &amp; des forums pour trouver ce dont les gens <b>se plaignent vraiment</b> — et les regroupe en problèmes validés et finançables. Arrêtez de deviner ce qu\'il faut créer.',
        placeholder: 'Chercher un problème, ex. "factures", "sommeil", "onboarding"…',
        search_btn: 'Rechercher',
        stat1: 'problèmes suivis', stat2: 'sources analysées', stat3: 'posts analysés',
      },
      themes: { all: 'Tous les thèmes' },
      section: {
        trending: 'Points douloureux tendances',
        leaderboard: 'Les plus plaints · cette semaine',
        lb_meta: 'classés par mentions vérifiées',
        how: 'Comment PainBase fonctionne',
        how_meta: 'écouter → regrouper → remonter',
      },
      lb: { problem: 'Problème', mentions: 'Mentions', growth: 'Croissance', volume: 'Volume' },
      steps: {
        s1_n: '01 / ÉCOUTER', s1_h: 'On ne s\'arrête jamais',
        s1_p: 'Des workers collectent en continu des posts et commentaires de Reddit, Hacker News et des forums où les gens se plaignent de problèmes non résolus.',
        s2_n: '02 / REGROUPER', s2_h: 'L\'IA organise le bruit',
        s2_p: 'Chaque post est classifié, dédupliqué et regroupé — 230 plaintes distinctes deviennent un seul problème quantifié.',
        s3_n: '03 / REMONTER', s3_h: 'Vous recevez le brief',
        s3_p: 'Pour chaque problème, l\'IA rédige un résumé, évalue la demande & la concurrence, et suggère un angle produit que vous pourriez lancer.',
      },
      cta: {
        h2: 'Votre prochaine idée est déjà une plainte.',
        p: 'Des milliers de personnes décrivent des problèmes pour lesquels elles paieraient. PainBase vous les livre, validés et classés.',
        btn: 'Commencer gratuitement',
      },
      footer: {
        tagline: 'Vrais problèmes, extraits toutes les heures. Pour les créateurs.',
        browse: 'Explorer', leaderboard: 'Classement', how: 'Comment ça marche',
        pricing: 'Tarifs', dashboard: 'Tableau de bord', api: 'API', terms: 'CGU',
      },
      auth: {
        signin_tab: 'Connexion', signup_tab: 'Créer un compte',
        email: 'Email', password: 'Mot de passe',
        forgot: 'Mot de passe oublié ?', signin_btn: 'Se connecter →',
        pass_placeholder: '8+ caractères', signup_btn: 'Créer un compte gratuit →',
        or: 'ou', google: 'Continuer avec Google', loading: 'Chargement…',
        welcome: 'Bienvenue !',
        account_created: 'Compte créé ! Vérifiez votre email pour confirmer.',
        wrong_creds: 'Email ou mot de passe incorrect.',
        reset_sent: 'Consultez votre boîte mail pour réinitialiser.',
        enter_email: 'Entrez d\'abord votre email.',
      },
      mob: { signin: 'Connexion', start: 'Commencer gratuitement', signout: 'Déconnexion' },
      search: {
        loading: 'Chargement des problèmes…',
        ai_label: '🔍 Recherche IA en temps réel',
        no_base_prefix: 'Aucun résultat en base pour',
        no_base_suffix: '— scraping Reddit & HN en cours…',
        step1: 'Scraping Reddit…', step2: 'Scraping Hacker News…',
        step3: 'Analyse IA en cours…', step4: 'Génération des idées…',
        posts_analyzed: 'posts analysés sur Reddit & HN',
        no_opportunity: 'Aucune opportunité détectée. Essaie un terme plus spécifique.',
        error: 'Erreur lors de la recherche. Réessaie dans un instant.',
        confidence: 'Confiance IA :', sources: 'Sources :',
        min_chars: 'Tape au moins 3 caractères pour lancer une recherche.',
        no_problems: 'Aucun problème disponible.',
        no_problems_yet: 'Aucun problème disponible pour le moment.\nLe pipeline collecte des données — réessaie dans quelques instants.',
        problem: 'problème', problems: 'problèmes', mentions: 'mentions',
      },
      detail: {
        loading: 'Chargement…', breadcrumb: 'Explorer les problèmes',
        save: 'Sauvegarder', saved_btn: 'Sauvegardé',
        explore: 'Explorer les angles produit →', share: 'Partager',
        mentions_lbl: 'Mentions vérifiées', growth_lbl: 'Croissance cette semaine',
        src_posts_lbl: 'Posts sources', opp_lbl: 'Score d\'opportunité',
        updated: 'mis à jour',
        source_posts: 'Posts sources',
        showing_of: function (total) { return 'affichage 5 sur ' + total; },
        more_posts: function (n) { return 'Voir plus (' + n + ' restants)'; },
        opp_scores: 'Scores d\'opportunité',
        demand: 'Intensité de la demande', competition: 'Densité de la concurrence', opportunity: 'Écart d\'opportunité',
        who_complaining: 'Qui se plaint', by_segment: 'par segment',
        existing_solutions: 'Solutions existantes', partial_fits: 'correspondances partielles',
        related_problems: 'Problèmes similaires',
        ai_analysis: 'Analyse IA', how_ai_built: 'comment ce brief a été construit',
        trend_chart: 'Tendance des mentions', trend_meta: 'hebdomadaire · 12 dernières semaines',
        product_angle: 'Angle produit :',
        gap_none: 'Écart ✓', gap_partial: 'Partiel',
        view_original: 'Voir l\'original →', comments: 'commentaires',
        signin_for_sources: 'Connecte-toi pour voir tous les posts sources →',
        all_sources_shown: function (n) { return n + ' posts collectés — tout affiché'; },
        not_found_h2: 'Problème introuvable',
        not_found_p: 'Ce problème n\'existe pas ou a été supprimé.',
        browse_all: '← Explorer tous les problèmes',
        link_copied: '✓ Lien copié !',
      },
      dash: {
        greeting: 'MON ESPACE', title: 'Tableau de bord',
        stat_saved: 'Problèmes sauvegardés', stat_themes: 'Thèmes explorés', stat_plan: 'Plan actuel',
        tab_saved: 'Problèmes sauvegardés', tab_activity: 'Activité récente',
        loading: 'Chargement…',
        empty_h: 'Aucun problème sauvegardé.',
        empty_p: 'Explorez la base et sauvegardez les problèmes qui vous intéressent.',
        empty_cta: 'Explorer les problèmes →',
        locked_h: 'Connectez-vous pour voir vos problèmes',
        locked_p: 'Créez un compte gratuit pour sauvegarder et suivre les problèmes à construire.',
        locked_btn: 'Connexion →',
      },
      pricing: {
        eyebrow: 'TARIFS',
        h1: '100% <em>gratuit</em>.<br>Pour toujours.',
        p: 'PainBase est entièrement gratuit pendant la bêta. Crée un compte, explore tous les problèmes, sauvegarde ceux qui t\'intéressent.',
      },
    },
  };

  // ── Language detection ─────────────────────────────────────────
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('pb_lang') : null;
  const auto   = typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  const lang   = stored || auto;

  window.PB_LANG = lang;

  // ── Global translate function ─────────────────────────────────
  window.t = function (key) {
    const dict     = LANGS[lang]    || LANGS.en;
    const fallback = LANGS.en;
    const resolve  = (obj, k) => k.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : undefined), obj);
    const val = resolve(dict, key);
    if (val !== undefined) return val;
    return resolve(fallback, key) !== undefined ? resolve(fallback, key) : key;
  };

  // ── Switch language and reload ────────────────────────────────
  window.setLang = function (l) {
    if (l !== 'en' && l !== 'fr') return;
    localStorage.setItem('pb_lang', l);
    location.reload();
  };

  // ── Inject CSS for the toggle button ─────────────────────────
  (function injectCSS() {
    const s = document.createElement('style');
    s.id = 'pb-i18n-style';
    s.textContent = [
      '.lang-toggle{display:flex;align-items:center;border:1px solid var(--line,#312A22);border-radius:7px;overflow:hidden;background:var(--bg-2,#16130F);flex:none;margin-right:10px}',
      '.lang-btn{font-family:"JetBrains Mono",monospace;font-size:11px;font-weight:700;padding:5px 9px;background:none;border:none;cursor:pointer;color:var(--ink-faint,#6F6557);letter-spacing:.07em;transition:background .15s,color .15s;line-height:1}',
      '.lang-btn.active{background:var(--ember,#FF5C38);color:#1a0d08}',
      '.lang-btn:hover:not(.active){color:var(--ink,#F3ECDF)}',
    ].join('');
    if (document.head) {
      document.head.appendChild(s);
    } else {
      document.addEventListener('DOMContentLoaded', function () { document.head.appendChild(s); });
    }
  })();

  // ── Inject toggle button into nav ────────────────────────────
  function injectToggle() {
    const navIn = document.querySelector('nav .nav-in');
    if (!navIn || navIn.querySelector('.lang-toggle')) return;
    const toggle = document.createElement('div');
    toggle.className = 'lang-toggle';
    toggle.innerHTML =
      '<button class="lang-btn' + (lang === 'en' ? ' active' : '') + '" data-lang="en" onclick="setLang(\'en\')">EN</button>' +
      '<button class="lang-btn' + (lang === 'fr' ? ' active' : '') + '" data-lang="fr" onclick="setLang(\'fr\')">FR</button>';
    const cta = navIn.querySelector('.nav-cta');
    if (cta) navIn.insertBefore(toggle, cta);
    else navIn.appendChild(toggle);
  }

  // ── Apply data-i18n translations ──────────────────────────────
  function applyTranslations() {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var val = t(el.dataset.i18n);
      if (typeof val === 'string') el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var val = t(el.dataset.i18nHtml);
      if (typeof val === 'string') el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var val = t(el.dataset.i18nPh);
      if (typeof val === 'string') el.placeholder = val;
    });

    injectToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }

})();
