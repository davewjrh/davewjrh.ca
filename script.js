// ==========================
// Initialization
// ==========================
// Observe sections and toggle .is-visible for animations
document.addEventListener('DOMContentLoaded', () => {
    const panels = document.querySelectorAll('.panel');
    // Navigation menu (single button -> menu)
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

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

    // ==========================
    // Keyboard navigation
    // ==========================
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

    // ==========================
    // Visual effects
    // ==========================
    // small parallax on scroll for hero background
    const hero = document.querySelector('.hero');
    window.addEventListener('scroll', () => {
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        const offset = Math.min(Math.max(-rect.top / 8, -30), 30);
        hero.style.backgroundPosition = `center ${50 + offset}%`;
    }, { passive: true });

    // ==========================
    // Modal: project gallery
    // ==========================
    // Disable right-click context menu on images
    const image = document.querySelector('img');
    image.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // Modal for project gallery - element references and helpers
    // Get the modal
    var modal = document.getElementById("modal");
    // Get the image and insert it inside the modal - use its "alt" text as a caption
    var modalImg = document.getElementById("img01");
    var captionText = document.getElementById("caption");

    const images = document.querySelectorAll(".projects-img");

    // Helper to disable/enable nav while modal is open
    function setNavDisabledForModal(disabled) {
        try {
            if (!navToggle || !navMenu) return;
            if (disabled) {
                // close any open nav and hide/disable controls
                closeNavMenu();
                navToggle.disabled = true;
                // add per-element class so CSS can hide the toggle without !important
                const floatingNav = document.querySelector('.floating-nav');
                if (floatingNav) floatingNav.classList.add('is-hidden-due-to-modal');
                navMenu.classList.add('is-hidden-due-to-modal');
                navToggle.setAttribute('aria-hidden', 'true');
                navMenu.setAttribute('aria-hidden', 'true');
            } else {
                navToggle.disabled = false;
                const floatingNav = document.querySelector('.floating-nav');
                if (floatingNav) floatingNav.classList.remove('is-hidden-due-to-modal');
                navMenu.classList.remove('is-hidden-due-to-modal');
                navToggle.removeAttribute('aria-hidden');
                navMenu.removeAttribute('aria-hidden');
            }
        } catch (e) {
            // guard against environments where nav elements are missing
        }
    }

    function openModalForImage(img) {
        if (!modal) return;
        // remember opener for returning focus
        lastOpener = img;
        modal.style.display = "block";
        modal.setAttribute('aria-hidden', 'false');
        modalImg.src = img.src;
        modalImg.alt = img.alt || '';
        captionText.innerHTML = img.alt || '';
        setNavDisabledForModal(true);
        // move focus into modal
        modal.focus();
    }

    function closeModal() {
        if (!modal) return;
        modal.style.display = "none";
        modal.setAttribute('aria-hidden', 'true');
        setNavDisabledForModal(false);
        // return focus to opener if present
        try { if (lastOpener && typeof lastOpener.focus === 'function') lastOpener.focus(); } catch (e) { }
    }

    images.forEach(img => {
        img.addEventListener("click", function () {
            openModalForImage(this);
        });
    });

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // ==========================
    // Modal accessibility: focus trapping & return-focus
    // ==========================
    // Focus-trap: keep keyboard focus within modal while open
    let lastOpener = null;
    function trapFocus(e) {
        if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
        if (e.key === 'Tab') {
            const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const arr = Array.prototype.slice.call(focusable).filter(el => !el.disabled && el.offsetParent !== null);
            if (arr.length === 0) {
                e.preventDefault();
                return;
            }
            const first = arr[0];
            const last = arr[arr.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        } else if (e.key === 'Escape') {
            // allow Esc to close modal
            closeModal();
        }
    }

    // listen for keydown at document level to trap focus while modal is open
    document.addEventListener('keydown', trapFocus);

    // When the user clicks on <span> (x), close the modal
    if (span) span.onclick = function () { closeModal(); };

    // Close modal when clicking anywhere outside the image area
    if (modal) {
        modal.addEventListener("click", function (e) {
            if (e.target !== modalImg) {
                closeModal();
            }
        });
    }

    // ==========================
    // Theme toggle
    // ==========================
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

    // ==========================
    // Navigation menu helpers
    // ==========================
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