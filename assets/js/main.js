/* ============================================================
   Comportements du site — sans dépendance externe.
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     ⚙️  À PERSONNALISER — coordonnées téléphoniques
     ----------------------------------------------------------
     Renseigne ton numéro ici et il sera injecté partout
     (lien "Téléphone" et lien WhatsApp).
     Laisse les deux chaînes vides pour masquer ces deux liens.

       phone    : format lisible, ex. "+216 20 123 456"
       whatsapp : format international sans "+" ni espace,
                  ex. "21620123456"
     ---------------------------------------------------------- */
  var CONTACT = {
    phone: "+216 20 535 769",
    whatsapp: "21620535769"
  };

  var EMAIL = "kais.zouali@gmail.com";

  var root  = document.documentElement;
  var I18N  = window.I18N || { en: {}, ui: { fr: {}, en: {} } };
  var lang  = "fr";
  var frCache = new Map();

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Thème clair / sombre ---------- */
  (function theme() {
    var stored = null;
    try { stored = localStorage.getItem("kz-theme"); } catch (e) {}
    if (!stored) {
      stored = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    root.setAttribute("data-theme", stored);

    var btn = $("#theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("kz-theme", next); } catch (e) {}
    });
  })();

  /* ---------- Langue ---------- */
  function t(key) {
    var pack = (I18N.ui && I18N.ui[lang]) || {};
    return pack[key] !== undefined ? pack[key] : key;
  }

  function applyLang(next) {
    lang = next === "en" ? "en" : "fr";
    root.lang = lang;

    var dict = lang === "en" ? (I18N.en || {}) : null;

    $$("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var isMeta = el.tagName === "META";

      if (!frCache.has(el)) {
        frCache.set(el, isMeta ? el.getAttribute("content") : el.innerHTML);
      }

      var value = dict && dict[key] !== undefined ? dict[key] : frCache.get(el);
      if (isMeta) el.setAttribute("content", value);
      else el.innerHTML = value;
    });

    $$(".lang-switch button").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    var burger = $("#burger");
    if (burger) {
      burger.setAttribute("aria-label",
        burger.getAttribute("aria-expanded") === "true" ? t("menuClose") : t("menuOpen"));
    }
    var themeBtn = $("#theme-toggle");
    if (themeBtn) themeBtn.setAttribute("aria-label", t("theme"));

    // Le texte de la note du formulaire vient d'être réinitialisé :
    // on retire l'état "message envoyé".
    var note = $(".form-note");
    if (note) note.classList.remove("form-ok");

    syncMoreBtn();

    try { localStorage.setItem("kz-lang", lang); } catch (e) {}
  }

  (function initLang() {
    var stored = null;
    try { stored = localStorage.getItem("kz-lang"); } catch (e) {}
    if (!stored) {
      stored = (navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
    }

    $$(".lang-switch button").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
    });

    applyLang(stored);
  })();

  /* ---------- Menu mobile ---------- */
  (function menu() {
    var burger = $("#burger");
    var nav = $("#nav");
    if (!burger || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? t("menuClose") : t("menuOpen"));
    }

    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) setOpen(false);
    });
  })();

  /* ---------- En-tête collant ---------- */
  (function stickyHeader() {
    var header = $(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  })();

  /* ----------------------------------------------------------
     Apparition au défilement + compteurs animés.

     Volontairement basé sur getBoundingClientRect plutôt que sur
     IntersectionObserver : l'observateur ne se déclenche pas dans
     certains contextes (onglet non composité, aperçu intégré,
     navigateur embarqué), ce qui laisserait la page entièrement
     vide. Ici, le pire cas reste un affichage sans animation.
     ---------------------------------------------------------- */
  (function scrollEffects() {
    var reveals = $$(".reveal");
    var counters = $$(".num");

    if (reduceMotion) {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    reveals.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 55 + "ms";
    });

    function runCounter(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;

      // On n'écrase la valeur écrite dans le HTML qu'une fois la
      // première frame obtenue : si requestAnimationFrame ne se
      // déclenche jamais, le chiffre final reste affiché plutôt
      // que de retomber à zéro.
      var start = null, done = false;
      requestAnimationFrame(function step(now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / 1100, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
        else done = true;
      });
      setTimeout(function () {
        if (!done) el.textContent = String(target);
      }, 1600);
    }

    function check() {
      var limit = window.innerHeight * 0.92;

      reveals = reveals.filter(function (el) {
        if (el.getBoundingClientRect().top >= limit) return true;
        el.classList.add("is-in");
        return false;
      });

      counters = counters.filter(function (el) {
        if (el.getBoundingClientRect().top >= limit) return true;
        runCounter(el);
        return false;
      });
    }

    var queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; check(); });
    }

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("load", check);

    // Filet de sécurité : si rien n'a été révélé au bout de 4 s, le
    // mécanisme a échoué — on affiche tout plutôt que de laisser
    // une page vide. Sinon on laisse le défilement faire son travail.
    setTimeout(function () {
      if (document.querySelector(".reveal.is-in")) return;
      reveals.forEach(function (el) { el.classList.add("is-in"); });
      counters.forEach(runCounter);
      reveals = []; counters = [];
    }, 4000);
  })();

  /* ---------- Lien de navigation actif ---------- */
  (function activeNav() {
    var links = $$(".nav > a[href^='#']");
    var map = {};
    var targets = [];

    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = a;
      targets.push(section);
    });
    if (!targets.length || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = map[entry.target.id];
        if (!a) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("is-current"); });
          a.classList.add("is-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    targets.forEach(function (s) { io.observe(s); });
  })();

  /* ---------- Parcours : voir plus / réduire ---------- */
  var moreBtn = $("#more-btn");
  var moreItems = $$(".tl.is-more");

  function syncMoreBtn() {
    if (!moreBtn) return;
    var expanded = moreBtn.getAttribute("aria-expanded") === "true";
    moreBtn.textContent = expanded ? t("moreHide") : t("moreShow");
  }

  if (moreBtn) {
    moreBtn.setAttribute("aria-expanded", "false");
    moreBtn.addEventListener("click", function () {
      var expanded = moreBtn.getAttribute("aria-expanded") === "true";
      moreItems.forEach(function (el) {
        el.hidden = expanded;
        if (!expanded) el.classList.add("is-in");
      });
      moreBtn.setAttribute("aria-expanded", expanded ? "false" : "true");
      syncMoreBtn();
    });
  }

  /* ---------- Coordonnées téléphoniques ---------- */
  (function contacts() {
    var telLink = $("#link-tel");
    var waLink = $("#link-wa");
    var display = $("[data-phone-display]");

    if (CONTACT.phone && telLink) {
      telLink.href = "tel:" + CONTACT.phone.replace(/[^\d+]/g, "");
      if (display) display.textContent = CONTACT.phone;
    } else if (telLink) {
      telLink.classList.add("is-hidden");
    }

    if (CONTACT.whatsapp && waLink) {
      waLink.href = "https://wa.me/" + CONTACT.whatsapp.replace(/[^\d]/g, "");
    } else if (waLink) {
      waLink.classList.add("is-hidden");
    }
  })();

  /* ---------- Formulaire → mailto ---------- */
  (function form() {
    var f = $("#contact-form");
    if (!f) return;

    var note = $(".form-note", f);

    // `f.name` renverrait l'attribut name du formulaire, pas le champ :
    // on passe systématiquement par f.elements.
    var fName = f.elements.namedItem("name");
    var fMail = f.elements.namedItem("email");
    var fSubj = f.elements.namedItem("subject");
    var fMsg  = f.elements.namedItem("message");

    f.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = fName.value.trim();
      var email = fMail.value.trim();
      var subject = fSubj.value;
      var message = fMsg.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

      $$(".field", f).forEach(function (el) { el.classList.remove("has-error"); });

      var invalid = [];
      if (!name) invalid.push(fName);
      if (!emailOk) invalid.push(fMail);
      if (!message) invalid.push(fMsg);

      if (invalid.length) {
        invalid.forEach(function (el) { el.closest(".field").classList.add("has-error"); });
        if (note) {
          note.classList.remove("form-ok");
          note.textContent = (invalid.length === 1 && invalid[0] === fMail) ? t("badEmail") : t("required");
        }
        invalid[0].focus();
        return;
      }

      var body =
        t("mailFrom") + " : " + name + " (" + email + ")\n" +
        t("mailNeed") + " : " + subject + "\n\n" +
        t("mailBody") + " :\n" + message + "\n";

      window.location.href =
        "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(t("mailSubject") + " — " + name) +
        "&body=" + encodeURIComponent(body);

      if (note) {
        note.textContent = t("opened");
        note.classList.add("form-ok");
      }
    });
  })();

  /* ---------- Impression ---------- */
  (function print() {
    var btn = $("#print-btn");
    if (btn) btn.addEventListener("click", function () { window.print(); });
  })();

  /* ---------- Année ---------- */
  (function year() {
    var el = $("#year");
    if (el) el.textContent = String(new Date().getFullYear());
  })();

})();
