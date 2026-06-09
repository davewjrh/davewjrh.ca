// Observe sections and toggle .is-visible for animations
document.addEventListener('DOMContentLoaded', () => {
    const panels = document.querySelectorAll('.panel');

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, { threshold: 0.35 });

    panels.forEach(p => io.observe(p));

    // keyboard navigation between sections
    let sectionList = Array.from(panels);
    window.addEventListener('keydown', (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key === 'j' || e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scrollToNext();
        } else if (e.key === 'k' || e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollToPrev();
        }
    });

    function scrollToNext() {
        const idx = sectionList.findIndex(s => s.classList.contains('is-visible'));
        const next = sectionList[Math.min(sectionList.length - 1, Math.max(0, idx + 1))];
        if (next) next.scrollIntoView({ behavior: 'smooth' });
    }
    function scrollToPrev() {
        const idx = sectionList.findIndex(s => s.classList.contains('is-visible'));
        const prev = sectionList[Math.max(0, idx - 1)];
        if (prev) prev.scrollIntoView({ behavior: 'smooth' });
    }

    // small parallax on scroll for hero background
    const hero = document.querySelector('.hero');
    window.addEventListener('scroll', () => {
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        const offset = Math.min(Math.max(-rect.top / 8, -30), 30);
        hero.style.backgroundPosition = `center ${50 + offset}%`;
    }, { passive: true });

    // Disable right-click context menu on images
    const image = document.querySelector('img');
    image.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // Theme toggle: initialize from localStorage and wire up button
    const THEME_KEY = 'site-theme'; // 'dark' or 'light'
    const root = document.documentElement;
    // theme toggle is now inside the nav menu
    const toggle = document.getElementById('theme-toggle');

    function applyTheme(theme) {
        if (theme === 'light') {
            root.classList.add('light-theme');
            toggle && toggle.setAttribute('aria-pressed', 'true');
            if (toggle) toggle.textContent = '☀️';
        } else {
            root.classList.remove('light-theme');
            toggle && toggle.setAttribute('aria-pressed', 'false');
            if (toggle) toggle.textContent = '🌙';
        }
    }

    // Load saved theme or respect system preference
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    if (saved) {
        applyTheme(saved);
    } else {
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        applyTheme(prefersLight ? 'light' : 'dark');
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            const isLight = root.classList.contains('light-theme');
            const next = isLight ? 'dark' : 'light';
            applyTheme(next);
            try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
        });
    }

    // Navigation menu (single button -> menu)
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    function closeNavMenu() {
        if (!navToggle || !navMenu) return;
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.hidden = true;
    }

    function openNavMenu() {
        if (!navToggle || !navMenu) return;
        navToggle.setAttribute('aria-expanded', 'true');
        navMenu.hidden = false;
        // focus first menu item
        const first = navMenu.querySelector('[role="menuitem"]');
        if (first) first.focus();
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            if (expanded) closeNavMenu(); else openNavMenu();
        });

        // close when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu || !navToggle) return;
            if (navMenu.contains(e.target) || navToggle.contains(e.target)) return;
            closeNavMenu();
        });

        // close on Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeNavMenu();
        });

        // close on menu item click
        navMenu.addEventListener('click', (e) => {
            const a = e.target.closest('a[role="menuitem"]');
            if (a) {
                closeNavMenu();
            }
        });
    }
});