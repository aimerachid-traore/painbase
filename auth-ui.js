// ================================================================
//  auth-ui.js  —  Modal d'auth PainBase
//  Toute la logique d'authentification est gérée par Supabase SDK.
//  Ce fichier ne fait que piloter l'UI (afficher/cacher, messages).
//
//  Dépendances : supabase.config.js, supabase-client.js, auth-ui.css
// ================================================================

(function () {

  // ── Injection du HTML de la modal ─────────────────────────────
  const MODAL_HTML = `
<div class="pb-overlay" id="pbOverlay">
  <div class="pb-modal" role="dialog" aria-modal="true" aria-label="Connexion PainBase">
    <button class="pb-modal-close" id="pbClose" aria-label="Fermer">✕</button>

    <div class="pb-modal-logo">
      <span class="mark"></span>PainBase
    </div>

    <!-- Tabs -->
    <div class="pb-tabs" role="tablist">
      <button class="pb-tab active" id="tabSignin" role="tab" aria-selected="true">Sign in</button>
      <button class="pb-tab"        id="tabSignup" role="tab" aria-selected="false">Create account</button>
    </div>

    <!-- SIGN IN -->
    <form id="formSignin" autocomplete="on">
      <div class="pb-field">
        <label for="siEmail">Email</label>
        <input id="siEmail" type="email" placeholder="you@example.com" required autocomplete="email">
      </div>
      <div class="pb-field">
        <label for="siPassword">Password</label>
        <input id="siPassword" type="password" placeholder="••••••••" required autocomplete="current-password">
      </div>
      <div class="pb-forgot"><a id="forgotLink">Forgot password?</a></div>
      <button class="pb-submit" type="submit" id="btnSignin">Sign in →</button>
    </form>

    <!-- SIGN UP (caché par défaut) -->
    <form id="formSignup" style="display:none" autocomplete="on">
      <div class="pb-field">
        <label for="suEmail">Email</label>
        <input id="suEmail" type="email" placeholder="you@example.com" required autocomplete="email">
      </div>
      <div class="pb-field">
        <label for="suPassword">Password</label>
        <input id="suPassword" type="password" placeholder="8+ characters" required minlength="8" autocomplete="new-password">
      </div>
      <button class="pb-submit" type="submit" id="btnSignup">Create free account →</button>
    </form>

    <!-- Google OAuth -->
    <div class="pb-divider">or</div>
    <button class="pb-google" id="btnGoogle" type="button">
      <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58Z"/></svg>
      Continue with Google
    </button>

    <!-- Message d'état -->
    <div class="pb-msg" id="pbMsg"></div>
  </div>
</div>`;

  function setup() {
    document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
    _init();
  }
  // Fonctionne que le DOM soit déjà chargé ou non
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

  // ── Helpers UI ─────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  function showMsg(text, type = 'error') {
    const el = $('pbMsg');
    el.textContent = text;
    el.className = 'pb-msg ' + type;
  }

  function clearMsg() { $('pbMsg').className = 'pb-msg'; }

  function setLoading(btnId, loading) {
    const btn = $(btnId);
    btn.disabled = loading;
    btn.textContent = loading ? 'Loading…' : btn.dataset.label;
  }

  // ── Open / Close modal ─────────────────────────────────────────
  window.PBAuthModal = {
    open(tab = 'signin') {
      $('pbOverlay').classList.add('open');
      clearMsg();
      if (tab === 'signup') _switchTab('signup');
      else _switchTab('signin');
      setTimeout(() => {
        const el = tab === 'signup' ? $('suEmail') : $('siEmail');
        el && el.focus();
      }, 100);
    },
    close() {
      $('pbOverlay').classList.remove('open');
    }
  };

  function _switchTab(tab) {
    const isSignin = tab === 'signin';
    $('tabSignin').classList.toggle('active', isSignin);
    $('tabSignup').classList.toggle('active', !isSignin);
    $('tabSignin').setAttribute('aria-selected', isSignin);
    $('tabSignup').setAttribute('aria-selected', !isSignin);
    $('formSignin').style.display = isSignin ? '' : 'none';
    $('formSignup').style.display = isSignin ? 'none' : '';
    clearMsg();
  }

  // ── Init events ────────────────────────────────────────────────
  function _init() {
    // store labels
    $('btnSignin').dataset.label = 'Sign in →';
    $('btnSignup').dataset.label = 'Create free account →';

    // close
    $('pbClose').addEventListener('click', () => PBAuthModal.close());
    $('pbOverlay').addEventListener('click', e => {
      if (e.target === $('pbOverlay')) PBAuthModal.close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') PBAuthModal.close();
    });

    // tabs
    $('tabSignin').addEventListener('click', () => _switchTab('signin'));
    $('tabSignup').addEventListener('click', () => _switchTab('signup'));

    // forgot password
    $('forgotLink').addEventListener('click', async () => {
      const email = $('siEmail').value.trim();
      if (!email) { showMsg('Enter your email first.'); return; }
      const { error } = await PBAuth.resetPassword(email);
      if (error) showMsg(error.message);
      else showMsg('Check your inbox for a reset link.', 'success');
    });

    // ── SIGN IN ──────────────────────────────────────────────────
    $('formSignin').addEventListener('submit', async e => {
      e.preventDefault();
      clearMsg();
      setLoading('btnSignin', true);
      const { error } = await PBAuth.signIn(
        $('siEmail').value.trim(),
        $('siPassword').value
      );
      setLoading('btnSignin', false);
      if (error) {
        showMsg(error.message === 'Invalid login credentials'
          ? 'Wrong email or password.'
          : error.message);
      } else {
        showMsg('Welcome back!', 'success');
        setTimeout(() => PBAuthModal.close(), 800);
      }
    });

    // ── SIGN UP ──────────────────────────────────────────────────
    $('formSignup').addEventListener('submit', async e => {
      e.preventDefault();
      clearMsg();
      setLoading('btnSignup', true);
      const { error } = await PBAuth.signUp(
        $('suEmail').value.trim(),
        $('suPassword').value
      );
      setLoading('btnSignup', false);
      if (error) {
        showMsg(error.message);
      } else {
        showMsg('Account created! Check your email to confirm.', 'success');
      }
    });

    // ── GOOGLE OAuth ─────────────────────────────────────────────
    // Supabase gère entièrement le flow OAuth — redirect + callback
    $('btnGoogle').addEventListener('click', async () => {
      await _sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href }
      });
    });

    // ── Écoute les changements de session ──────────────────────
    if (typeof PBAuth !== 'undefined') {
      PBAuth.onAuthChange(user => _updateNavAuth(user));
      PBAuth.getUser().then(user => _updateNavAuth(user));
    } else {
      _updateNavAuth(null); // pas connecté — affiche Sign in / Start hunting
    }
  }

  // ── Met à jour la nav selon l'état de connexion ───────────────
  function _updateNavAuth(user) {
    const cta = document.querySelector('.nav-cta');
    if (!cta) return;

    if (user) {
      const initial = (user.email || 'U')[0].toUpperCase();
      const email   = user.email || '';
      cta.innerHTML = `
        <div class="pb-user-chip" tabindex="0" id="pbChip">
          <div class="avatar">${initial}</div>
          <span>${email.split('@')[0]}</span>
          <span class="arrow">▾</span>
          <div class="pb-user-menu" id="pbMenu">
            <a href="painbase-dashboard.html">My saved problems</a>
            <a href="painbase-dashboard.html">Dashboard</a>
            <div class="divider"></div>
            <a class="signout" id="pbSignOut">Sign out</a>
          </div>
        </div>`;

      // Click-toggle (remplace hover — fiable sur tous les navigateurs)
      const chip = document.getElementById('pbChip');
      const menu = document.getElementById('pbMenu');

      chip.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = menu.classList.contains('open');
        // Ferme tous les autres menus ouverts
        document.querySelectorAll('.pb-user-menu.open').forEach(m => m.classList.remove('open'));
        document.querySelectorAll('.pb-user-chip.open').forEach(c => c.classList.remove('open'));
        if (!isOpen) {
          menu.classList.add('open');
          chip.classList.add('open');
        }
      });

      // Ferme au clic en dehors
      document.addEventListener('click', function closeMenu() {
        menu.classList.remove('open');
        chip.classList.remove('open');
      });

      // Ferme sur Escape
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          menu.classList.remove('open');
          chip.classList.remove('open');
        }
      });

      document.getElementById('pbSignOut')?.addEventListener('click', async e => {
        e.stopPropagation();
        await PBAuth.signOut();
      });

    } else {
      cta.innerHTML = `
        <a href="#" class="pb-signin-trigger" style="color:var(--ink-dim);font-size:14.5px;font-weight:500">Sign in</a>
        <button class="btn btn-primary pb-signup-trigger">Start hunting</button>`;
      cta.querySelector('.pb-signin-trigger')?.addEventListener('click', e => {
        e.preventDefault(); PBAuthModal.open('signin');
      });
      cta.querySelector('.pb-signup-trigger')?.addEventListener('click', () => {
        PBAuthModal.open('signup');
      });
    }
  }

})();
