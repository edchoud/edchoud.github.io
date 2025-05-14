// --- Polyfill for modulepreload (Keep if using <script type="module">) ---
(function() {
    const i = document.createElement("link").relList;
    if (i && i.supports && i.supports("modulepreload")) return;
    for (const e of document.querySelectorAll('link[rel="modulepreload"]')) a(e);
    new MutationObserver(e => {
        for (const t of e)
            if (t.type === "childList")
                for (const o of t.addedNodes) o.tagName === "LINK" && o.rel === "modulepreload" && a(o)
    }).observe(document, {
        childList: !0,
        subtree: !0
    });

    function u(e) {
        const t = {};
        return (
            e.integrity && (t.integrity = e.integrity),
            e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
            (e.crossOrigin === "use-credentials" ? (t.credentials = "include") :
                e.crossOrigin === "anonymous" ? (t.credentials = "omit") :
                (t.credentials = "same-origin")),
            t
        );
    }

    function a(e) {
        if (e.ep) return;
        e.ep = !0;
        const t = u(e);
        fetch(e.href, t);
    }
})();

// --- Core Initializations for Project Pages ---
function initializeProjectPageCore() {
    // Lenis Setup
    const r = new Lenis({ // Original variable 'r' for Lenis instance
        lerp: .05,
        smoothWheel: !0,
        duration: 2.5,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        autoRaf: !1
    });

    // Smooth scroll for *local* anchor links (e.g., href="#top")
    function i(t) { // Original function 'i' for scrolling
        const href = t.getAttribute("href");
        if (href && href.startsWith('#') && href.length > 1) {
            try {
                const o = document.querySelector(href); // Original variable 'o' for target
                if (o) {
                    r.scrollTo(o); // Use Lenis instance 'r'
                }
            } catch (error) {
                console.error("Scroll target selector error:", error);
            }
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(t => { // Original variable 't' for anchor
        t.addEventListener("click", function(o) { // Original variable 'o' for event
             const href = t.getAttribute("href");
             // Check if link is purely local hash (e.g., #top, #comments)
             if (href === '#' || (href && href.startsWith('#') && href.length > 1)) {
                 try {
                     // Check if the target element exists on *this* page
                     if (document.querySelector(href)) {
                         o.preventDefault(); // Prevent default jump only if target is local
                         i(t); // Scroll smoothly
                     }
                 } catch(e) { /* Ignore if selector is invalid */ }
             }
             // Allow links like href="index.html#about" to navigate normally
        });
    });

    // Manual RAF loop for Lenis
    function a(t) { // Original function 'a' for RAF
        r.raf(t);
        requestAnimationFrame(a);
    }
    requestAnimationFrame(a); // Start the loop

    // Optional: Header fade-in on load
    // Ensure GSAP and ScrollTrigger are loaded if you use this
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        gsap.from(".header", {
            autoAlpha: 0,
            yPercent: -10,
            duration: .5,
            ease: "power4.inOut",
            delay: 0.1 // Slight delay after page load
        });
    }
}

// --- Menu Navigation and Header Scroll Behavior for Project Pages ---
function initializeProjectPageMenu() {
    // Ensure GSAP is loaded if you use the menu animation timeline
     if (typeof gsap === 'undefined') {
         console.warn("GSAP not loaded, menu animations disabled.");
         // Provide fallback for menu toggle if needed without GSAP
     }

    const r = document.querySelector(".hamburger"); // Original variable 'r' for hamburger
    const i = document.querySelector(".menu-nav"); // Original variable 'i' for menu nav container
    const u = document.querySelectorAll(".menu-nav__link"); // Original variable 'u' for menu links
    const a = document.querySelector(".header-container"); // Original variable 'a' for header container
    let e; // Original variable 'e' for menu timeline

    // Setup GSAP timeline only if GSAP is available
    if (typeof gsap !== 'undefined') {
         e = gsap.timeline({ reversed: !0 });
         // Menu Animation Setup
         (() => {
            e.to(i, { autoAlpha: 1, visibility: "visible", duration: .5 })
             .to(".menu-nav__link", { yPercent: -100, duration: .2, stagger: .1 })
             .from(".menu-nav__mail > *", { xPercent: 10, autoAlpha: 0, duration: .2 });
         })();
    }

    // Hamburger Click Listener
    if (r && i) {
        r.addEventListener("click", () => {
            r.classList.toggle("active");
            if (e) { // Use GSAP timeline if available
                e.reversed(!e.reversed());
            } else { // Basic toggle fallback if GSAP is missing
                i.style.visibility = (i.style.visibility === 'visible') ? 'hidden' : 'visible';
                i.style.opacity = (i.style.opacity === '1') ? '0' : '1';
            }
        });
    }

    // Menu Link Click Listener (Just closes menu)
    u.forEach(n => { // Original variable 'n' for link
        n.addEventListener("click", () => {
            if (e && !e.reversed()) { // Use GSAP timeline if available
                e.reversed(!0);
            } else if (!e && i) { // Basic hide fallback
                 i.style.visibility = 'hidden';
                 i.style.opacity = '0';
            }
            if (r) {
                r.classList.remove("active");
            }
        });
    });

    // Click Outside Menu Listener
    if (r && a && i) {
        document.addEventListener("click", n => { // Original variable 'n' for event
            if (!r.contains(n.target) && !i.contains(n.target)) {
                 if (e && !e.reversed()) { // Use GSAP timeline if available
                     e.reversed(!0);
                 } else if (!e && i) { // Basic hide fallback
                      i.style.visibility = 'hidden';
                      i.style.opacity = '0';
                 }
                 if (r.classList.contains("active")) {
                    r.classList.remove("active");
                 }
            }
        });
    }

    // Header Style Change on Scroll
    window.addEventListener("scroll", function() {
        const n = document.querySelector(".header"); // Original variable 'n' for header
        const c = document.querySelector(".hamburger-bar"); // Original variable 'c' for hamburger bar
        const scrollThreshold = 50; // Pixels to scroll before changing header style

        if (n && c) {
             if (window.scrollY > scrollThreshold) {
                 n.classList.add("dark");
                 c.classList.add("light");
             } else {
                 n.classList.remove("dark");
                 c.classList.remove("light");
             }
        }
    });

    // REMOVED: Scrollspy functionality
}

// --- DOMContentLoaded Listener ---
document.addEventListener("DOMContentLoaded", () => {
    initializeProjectPageCore();
    initializeProjectPageMenu();

    // Update year in footer
    document.querySelectorAll(".year").forEach(r => { // Original variable 'r' for element
        try {
            // Using current date at the time of generation for the year
            const currentYear = new Date().getFullYear();
             r.textContent = currentYear;
        } catch (error) {
            console.error("Failed to set footer year:", error);
        }
    });
});
