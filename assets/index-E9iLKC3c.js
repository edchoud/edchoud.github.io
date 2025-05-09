// Polyfill pour rel="modulepreload" pour les navigateurs qui ne le supportent pas nativement.
(function() {
    const modernLinkRelList = document.createElement("link").relList;
    if (modernLinkRelList && modernLinkRelList.supports && modernLinkRelList.supports("modulepreload")) {
        return; // Support natif détecté, pas besoin du polyfill.
    }

    // Précharge les liens 'modulepreload' déjà présents dans le DOM.
    document.querySelectorAll('link[rel="modulepreload"]').forEach(linkElement => {
        preloadLink(linkElement);
    });

    // Observe les ajouts futurs de liens 'modulepreload' au DOM.
    new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                for (const node of mutation.addedNodes) {
                    if (node.tagName === "LINK" && node.rel === "modulepreload") {
                        preloadLink(node);
                    }
                }
            }
        }
    }).observe(document, { childList: true, subtree: true });

    /**
     * Construit un objet d'options pour la requête fetch basé sur les attributs du lien.
     * @param {HTMLLinkElement} linkElement - L'élément <link>.
     * @returns {object} Options pour fetch.
     */
    function getFetchOptions(linkElement) {
        const fetchOptions = {};
        if (linkElement.integrity) {
            fetchOptions.integrity = linkElement.integrity;
        }
        if (linkElement.referrerPolicy) {
            fetchOptions.referrerPolicy = linkElement.referrerPolicy;
        }
        if (linkElement.crossOrigin === "use-credentials") {
            fetchOptions.credentials = "include";
        } else if (linkElement.crossOrigin === "anonymous") {
            fetchOptions.credentials = "omit";
        } else {
            fetchOptions.credentials = "same-origin";
        }
        return fetchOptions;
    }

    /**
     * Précharge le module via fetch si ce n'est pas déjà fait.
     * @param {HTMLLinkElement} linkElement - L'élément <link> à précharger.
     */
    function preloadLink(linkElement) {
        if (linkElement.ep) { // 'ep' (déjà préchargé) est une propriété personnalisée pour éviter les doubles chargements.
            return;
        }
        linkElement.ep = true;
        const fetchOptions = getFetchOptions(linkElement);
        fetch(linkElement.href, fetchOptions);
    }
})();

/**
 * Fonction principale pour initialiser le scrolling Lenis et les animations GSAP.
 */
function initializeMainFeatures() {
    // Initialisation de Lenis pour le scrolling fluide
    const lenis = new Lenis({
        lerp: 0.05,
        smoothWheel: true,
        duration: 2.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        autoRaf: false, // On gère manuellement le requestAnimationFrame
    });

    /**
     * Gère le scroll vers une ancre spécifique.
     * @param {HTMLAnchorElement} anchorElement - L'élément <a> cliqué.
     */
    function scrollToAnchor(anchorElement) {
        const targetSelector = anchorElement.getAttribute("href");
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            lenis.scrollTo(targetElement);
        }
    }

    // Ajoute les écouteurs d'événements pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchorLink => {
        anchorLink.addEventListener("click", function(event) {
            event.preventDefault();
            scrollToAnchor(anchorLink);
        });
    });

    // Boucle de rendu pour Lenis
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Enregistrement du plugin ScrollTrigger pour GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Timeline GSAP pour l'animation du preloader et des éléments initiaux
    const introTimeline = gsap.timeline({});
    introTimeline
        .to(".preloader", { duration: 1.5, y: "100%", ease: "circ.inOut" })
        .set(".preloader", { display: "none" })
        .from(".header", { autoAlpha: 0, yPercent: -10, duration: 0.5, ease: "power4.inOut" }, "-=1") // Démarre 1s avant la fin de l'animation précédente
        .from(".hero-heading__title[data-title-first]", { xPercent: -20, duration: 2, ease: "power4.out" }, "-=1.5")
        .from(".hero-heading__title[data-title-second]", { xPercent: 5, duration: 2, ease: "power4.out" }, "<") // "<" démarre en même temps que la précédente
        .from(".hero__subtitle", { yPercent: 10, duration: 1, autoAlpha: 0, ease: "power4.out" }, "-=1.5")
        .from(".hero__bottom", { yPercent: 10, duration: 1, autoAlpha: 0, ease: "power4.out" }, "-=1.5");


    // Animation du titre du héros au scroll
    gsap.to(".hero__title", {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            ease: "power4.inOut", // L'ease sur un scrub est généralement moins perceptible, mais respectons l'original
            scrub: true,
        },
        yPercent: 15,
    });

    // Animation du texte de la section "About"
    gsap.from(".about-content__text", {
        scrollTrigger: {
            trigger: ".about",
            start: "top center", // "0 center" signifie "top center"
            ease: "power4.inOut",
        },
        yPercent: "10",
        autoAlpha: 0,
        duration: 0.7,
    });

    // Animation des éléments de la section "Skills"
    gsap.timeline({
            scrollTrigger: {
                trigger: ".skills",
                start: "top center",
                end: "bottom bottom",
                ease: "power1.inOut",
            },
        })
        .from(".skills-item > *", {
            yPercent: "10",
            autoAlpha: 0,
            duration: 0.7,
            stagger: 0.1,
        });

    // Animation des éléments des sections "Contact" et "Footer"
    gsap.timeline({
            scrollTrigger: {
                trigger: ".contact",
                start: "-100px center", // "-100 center"
                end: "bottom bottom",
                ease: "power1.inOut",
            },
        })
        .from(".contact-row > *", { yPercent: "10", autoAlpha: 0, duration: 0.7, stagger: 0.1 })
        .from(".footer-row > *", { yPercent: "10", autoAlpha: 0, duration: 0.4 });

    // Animation des overlays des images de projets
    document.querySelectorAll(".projects-item__img-overlay").forEach((overlayElement) => {
        gsap.to(overlayElement, {
            scrollTrigger: {
                trigger: overlayElement,
                start: "top center",
                end: "bottom 80%",
                ease: "circ.inOut",
                // scrub: true, // Optionnel: si l'animation doit suivre le scroll
            },
            yPercent: 100,
            duration: 1.4,
        });
    });
}

/**
 * Fonction pour initialiser la navigation (menu hamburger, changement de header au scroll, etc.).
 */
function initializeNavigation() {
    gsap.registerPlugin(ScrollTrigger); // Peut être déjà enregistré, mais sans danger de le répéter.

    const hamburgerButton = document.querySelector(".hamburger");
    const menuNav = document.querySelector(".menu-nav");
    const menuNavLinks = document.querySelectorAll(".menu-nav__link");
    const headerContainer = document.querySelector(".header-container"); // Utilisé pour la détection de clic extérieur

    // Timeline GSAP pour l'animation du menu (initialement inversée et en pause)
    const menuTimeline = gsap.timeline({ reversed: true, paused: true });

    menuTimeline
        .to(menuNav, { autoAlpha: 1, visibility: "visible", duration: 0.5 }) // autoAlpha gère la visibilité
        .from(".menu-nav__link", { yPercent: 100, duration: 0.3, stagger: 0.1, ease: "power1.out" }) // Animé depuis le bas
        .from(".menu-nav__mail > *", { xPercent: 10, autoAlpha: 0, duration: 0.2 }, "-=0.2"); // Légèrement avant la fin des liens

    // Écouteur pour le clic sur le bouton hamburger
    hamburgerButton.addEventListener("click", () => {
        hamburgerButton.classList.toggle("active");
        menuTimeline.reversed(!menuTimeline.reversed()); // Inverse l'état de la timeline
        if (!menuTimeline.reversed()) {
            menuTimeline.play(); // Joue la timeline si elle n'est pas inversée (donc en train de s'ouvrir)
        }
    });

    // Écouteurs pour les clics sur les liens du menu de navigation
    menuNavLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (!menuTimeline.reversed()) { // Si le menu est ouvert
                menuTimeline.reverse(); // Ferme le menu
            }
            hamburgerButton.classList.remove("active");
        });
    });

    // Écouteur pour fermer le menu en cliquant à l'extérieur
    document.addEventListener("click", event => {
        if (!hamburgerButton.contains(event.target) && !menuNav.contains(event.target) && headerContainer.contains(event.target) === false) {
            if (!menuTimeline.reversed()) { // Si le menu est ouvert
                menuTimeline.reverse();
                hamburgerButton.classList.remove("active");
            }
        }
    });

    // Changement d'apparence du header au scroll
    window.addEventListener("scroll", function() {
        const header = document.querySelector(".header");
        const hamburgerBar = document.querySelector(".hamburger-bar");
        const heroSection = document.querySelector(".hero");
        if (!heroSection) return;

        let heroHeightThreshold = heroSection.offsetHeight - header.offsetHeight; // Seuil basé sur la hauteur du héros moins celle du header

        if (window.scrollY > heroHeightThreshold) {
            header.classList.add("dark");
            hamburgerBar.classList.add("light");
        } else {
            header.classList.remove("dark");
            hamburgerBar.classList.remove("light");
        }
    });

    // Mise en évidence du lien de navigation actif au scroll
    (function() {
        const sections = document.querySelectorAll("section[id]"); // S'assurer que les sections ont des IDs
        if (!sections || sections.length === 0) return;

        function updateActiveNavLink() {
            let windowHeight = window.innerHeight;
            let currentActiveSectionId = null;

            sections.forEach(section => {
                const sectionRect = section.getBoundingClientRect();
                const sectionId = section.getAttribute("id");

                // Logique pour déterminer si la section est "active" dans la viewport
                // (le haut de la section est visible jusqu'à 60% de la hauteur de la fenêtre,
                // et le bas de la section est visible au-delà de 20% de la hauteur de la fenêtre)
                if (sectionRect.top < windowHeight * 0.6 && sectionRect.bottom > windowHeight * 0.2) {
                    currentActiveSectionId = sectionId;
                }
            });

            document.querySelectorAll(".menu-nav__link").forEach(link => {
                link.classList.remove("active");
            });

            if (currentActiveSectionId) {
                const activeLink = document.querySelector(`.menu-nav__link[href*="#${currentActiveSectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add("active");
                }
            }
        }

        window.addEventListener("scroll", updateActiveNavLink);
        updateActiveNavLink(); // Appel initial pour définir l'état au chargement
    })();
}

// Exécution des initialisations après le chargement complet du DOM
document.addEventListener("DOMContentLoaded", () => {
    initializeMainFeatures();
    initializeNavigation();

    // Met à jour l'année dans les éléments avec la classe "year"
    document.querySelectorAll(".year").forEach(yearElement => {
        yearElement.textContent = new Date().getFullYear();
    });
});
