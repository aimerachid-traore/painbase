// ================================================================
//  mobile-nav.js  —  Injecte le hamburger + drawer dans toutes les pages
//  Doit être chargé APRÈS auth-ui.js
// ================================================================
(function () {

  const PAGES = {
    'painbase-landing.html':   [
      { href:'painbase-landing.html#explore',     label:'Browse problems' },
      { href:'painbase-landing.html#leaderboard', label:'Leaderboard' },
      { href:'painbase-landing.html#how',         label:'How it works' },
      { href:'painbase-pricing.html',             label:'Pricing' },
      { href:'painbase-dashboard.html',           label:'My dashboard' },
    ],
    'painbase-detail': [
      { href:'painbase-landing.html',             label:'Browse problems' },
      { href:'painbase-landing.html#leaderboard', label:'Leaderboard' },
      { href:'painbase-pricing.html',             label:'Pricing' },
      { href:'painbase-dashboard.html',           label:'My dashboard' },
    ],
    'painbase-dashboard.html': [
      { href:'painbase-landing.html',             label:'Browse problems' },
      { href:'painbase-pricing.html',             label:'Pricing' },
      { href:'painbase-dashboard.html',           label:'My dashboard', active:true },
    ],
    'painbase-pricing.html': [
      { href:'painbase-landing.html',             label:'Browse problems' },
      { href:'painbase-dashboard.html',           label:'My dashboard' },
      { href:'painbase-pricing.html',             label:'Pricing', active:true },
    ],
  };

  function currentLinks() {
    const path = location.pathname.split('/').pop() || 'painbase-landing.html';
    // match detail pages (hash routing)
    if (path.includes('painbase-detail')) return PAGES['painbase-detail'];
    return PAGES[path] || PAGES['painbase-landing.html'];
  }

  function setup() {
    const nav = document.querySelector('nav .nav-in');
    if (!nav) return;

    // Inject hamburger button before nav-cta
    const cta = nav.querySelector('.nav-cta');
    const burger = document.createElement('button');
    burger.className = 'hamburger';
    burger.setAttribute('aria-label', 'Menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = `<span class="bar"></span><span class="bar"></span><span class="bar"></span>`;
    nav.insertBefore(burger, cta);

    // Inject drawer after <nav>
    const drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';
    drawer.id = 'mobileDrawer';
    const links = currentLinks();
    drawer.innerHTML = links.map(l =>
      `<a href="${l.href}" ${l.active ? 'class="active"' : ''}>${l.label}</a>`
    ).join('') +
    `<div class="mob-divider"></div>
     <div class="mob-auth" id="mobAuth">
       <button class="btn" style="background:var(--panel-2);border:1px solid var(--line);color:var(--ink);font-family:Archivo;font-weight:600;font-size:15px;padding:13px;border-radius:9px" onclick="PBAuthModal.open('signin')">Sign in</button>
       <button class="btn btn-primary" style="font-size:15px;padding:13px" onclick="PBAuthModal.open('signup')">Start hunting — free</button>
     </div>`;
    document.querySelector('nav').after(drawer);

    // Toggle
    function closeDrawer() {
      burger.classList.remove('open');
      drawer.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    function openDrawer() {
      burger.classList.add('open');
      drawer.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    burger.addEventListener('click', () => {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });

    // Close on link click
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

    // Close on outside click
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !drawer.contains(e.target)) closeDrawer();
    });

    // Close on resize past breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeDrawer();
    });

    // Update mob-auth based on user state
    if (typeof PBAuth !== 'undefined') {
      PBAuth.onAuthChange(user => _updateMobAuth(user));
      PBAuth.getUser().then(user => _updateMobAuth(user));
    } else {
      _updateMobAuth(null);
    }

    function _updateMobAuth(user) {
      const mobAuth = document.getElementById('mobAuth');
      if (!mobAuth) return;
      if (user) {
        mobAuth.innerHTML = `
          <a href="painbase-dashboard.html" style="border:1px solid var(--line);border-radius:9px;padding:12px 16px;display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);background:var(--panel-2)">
            <div style="width:28px;height:28px;border-radius:50%;background:var(--ember);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#1a0d08;flex:none">${(user.email||'U')[0].toUpperCase()}</div>
            <span style="font-size:14px;font-weight:500">${user.email}</span>
          </a>
          <button class="btn" style="background:transparent;border:1px solid var(--line);color:var(--ink-faint);font-family:Archivo;font-weight:600;font-size:14px;padding:11px;border-radius:9px" id="mobSignOut">Sign out</button>`;
        document.getElementById('mobSignOut')?.addEventListener('click', () => PBAuth.signOut());
      } else {
        mobAuth.innerHTML = `
          <button class="btn" style="background:var(--panel-2);border:1px solid var(--line);color:var(--ink);font-family:Archivo;font-weight:600;font-size:15px;padding:13px;border-radius:9px" onclick="PBAuthModal.open('signin')">Sign in</button>
          <button class="btn btn-primary" style="font-size:15px;padding:13px" onclick="PBAuthModal.open('signup')">Start hunting — free</button>`;
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
