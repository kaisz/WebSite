# Site vitrine — Kais Zouali

Site statique bilingue (FR/EN) présentant mes prestations d'ingénieur logiciel
indépendant, construit à partir de mon profil LinkedIn.

Aucune dépendance, aucun build, aucun `npm install` : trois fichiers et c'est en ligne.

```
WebSite/
├── index.html              contenu (français par défaut)
├── assets/
│   ├── css/styles.css      thème clair/sombre + impression
│   ├── js/i18n.js          traductions anglaises
│   ├── js/main.js          interactions (thème, langue, formulaire…)
│   └── img/favicon.svg
├── robots.txt
└── sitemap.xml
```

---

## 1. À personnaliser avant mise en ligne

### Numéro de téléphone / WhatsApp — déjà renseigné

Configuré en un seul endroit, tout en haut de `assets/js/main.js` :

```js
var CONTACT = {
  phone: "+216 20 535 769",   // format lisible, affiché tel quel
  whatsapp: "21620535769"     // international, sans + ni espace
};
```

De là sont générés le lien `tel:`, le lien `https://wa.me/…` et le texte affiché.
Si ces deux champs sont vidés, les liens « Téléphone » et « WhatsApp » se masquent
automatiquement — le site reste cohérent.

Le numéro figure aussi dans les données structurées JSON-LD de `index.html`
(`"telephone"`) : à modifier en même temps le cas échéant.

### Nom de domaine

Trois endroits contiennent l'URL de démonstration `https://kaiszouali.com/` :

| Fichier | Ligne |
|---|---|
| `index.html` | `<link rel="canonical" …>` |
| `robots.txt` | `Sitemap: …` |
| `sitemap.xml` | `<loc>…</loc>` |

Remplacer par le domaine réel une fois choisi.

### Image de partage (optionnel mais recommandé)

Pour un bel aperçu quand un lien est partagé sur LinkedIn ou WhatsApp,
ajouter une image 1200×630 px dans `assets/img/og.jpg`, puis dans `<head>` :

```html
<meta property="og:image" content="https://ton-domaine.com/assets/img/og.jpg">
```

---

## 2. Aperçu local

```bash
python -m http.server 4173
```

Puis ouvrir <http://localhost:4173>. N'importe quel serveur statique fait l'affaire
(`npx serve`, `php -S localhost:4173`…). Ouvrir `index.html` directement en
`file://` fonctionne aussi, mais certains navigateurs bloquent alors les scripts locaux.

---

## 3. Déploiement

Le site étant 100 % statique, l'hébergement est gratuit chez tous les fournisseurs.

**Cloudflare Pages / Netlify** — glisser-déposer le dossier sur leur interface.
Build command : *(vide)*. Publish directory : `/`.

**GitHub Pages**

```bash
git init && git add . && git commit -m "Site vitrine"
git branch -M main
git remote add origin https://github.com/kaisz/kaisz.github.io.git
git push -u origin main
```

Puis *Settings → Pages → Source: main / root*.

**VPS avec Nginx** — copier le dossier dans `/var/www/kaiszouali` et servir en statique.

---

## 4. Choix techniques

**Pourquoi le français est écrit en dur dans le HTML.**
Le contenu français se trouve directement dans `index.html`, donc lisible par les
moteurs de recherche sans exécution de JavaScript. `i18n.js` ne contient que la
surcouche anglaise, appliquée au clic sur `EN` via les attributs `data-i18n`.
Le texte français d'origine est mis en cache côté client pour permettre l'aller-retour.

**Pourquoi pas d'IntersectionObserver.**
Les animations d'apparition reposent sur `getBoundingClientRect` plutôt que sur
`IntersectionObserver`. Ce dernier ne se déclenche pas dans certains contextes
(onglet non composité, navigateur embarqué, aperçu intégré), ce qui laisserait une
page entièrement vide puisque les éléments sont à `opacity: 0`. Ici le pire cas est
un affichage sans animation. Un filet de sécurité affiche tout au bout de 4 s si
rien n'a été révélé.

**Pourquoi le contenu reste visible sans JavaScript.**
Le masquage initial est conditionné à la classe `.js` posée par un script inline
dans `<head>`. Sans JavaScript, aucune règle `opacity: 0` ne s'applique : la page
reste intégralement lisible.

**Formulaire de contact.**
Il compose un lien `mailto:` pré-rempli — aucun backend, aucun service tiers,
aucune donnée collectée. Pour recevoir les messages directement dans une boîte
sans ouvrir le client mail du visiteur, brancher [Formspree](https://formspree.io)
ou [Web3Forms](https://web3forms.com) sur l'attribut `action` du formulaire.

**Impression / PDF.**
Le lien « Imprimer / PDF » du pied de page déclenche `window.print()`. Une feuille
de style dédiée bascule en thème clair, masque la navigation et le formulaire, et
déplie l'intégralité du parcours : le résultat sert de CV.

---

## 5. Accessibilité et performance

- Navigation complète au clavier, lien d'évitement, `aria-*` sur tous les contrôles
- `prefers-reduced-motion` respecté (animations désactivées)
- `prefers-color-scheme` respecté au premier chargement, choix mémorisé ensuite
- Aucune requête réseau externe : pas de CDN, pas de police distante, pas de tracker
- Données structurées JSON-LD (`ProfessionalService` + `Person`) pour le référencement
