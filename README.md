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

Le site est publié sur **<https://kaisz.github.io/WebSite/>**.

Trois endroits contiennent cette URL et sont à mettre à jour si un domaine
personnalisé est branché plus tard :

| Fichier | Ligne |
|---|---|
| `index.html` | `<link rel="canonical" …>` |
| `robots.txt` | `Sitemap: …` |
| `sitemap.xml` | `<loc>…</loc>` |

Les chemins d'assets étant tous relatifs, le site fonctionne indifféremment à la
racine d'un domaine ou dans un sous-chemin — rien d'autre à modifier.

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

**GitHub Pages** *(déploiement actuel)*

Le dépôt <https://github.com/kaisz/WebSite> déploie automatiquement à chaque push
sur `main`, via `.github/workflows/static.yml`.

Prérequis à faire **une seule fois**, dans *Settings → Pages → Build and deployment* :
régler **Source** sur **GitHub Actions**. Sans cela, l'étape `configure-pages`
échoue avec `Get Pages site failed … Not Found`, car l'API Pages du dépôt n'existe
pas encore. Le workflow passe `enablement: true` pour tenter de l'activer tout seul,
mais le réglage manuel reste la voie la plus fiable.

Suivi des déploiements : onglet *Actions* du dépôt.

**VPS avec Nginx** — copier le dossier dans `/var/www/kaiszouali` et servir en statique.

---

## 4. Choix techniques

**Pourquoi le français est écrit en dur dans le HTML.**
Le contenu français se trouve directement dans `index.html`, donc lisible par les
moteurs de recherche sans exécution de JavaScript. `i18n.js` ne contient que les
surcouches anglaise et arabe, appliquées au clic via les attributs `data-i18n`.
Le texte français d'origine est mis en cache côté client pour permettre l'aller-retour.
Les 154 clés sont couvertes dans les deux langues, sans clé manquante ni orpheline.

**Arabe et sens d'écriture.**
Le bouton `ع` pose `lang="ar"` et `dir="rtl"` sur `<html>`. La feuille de style
utilise des propriétés logiques (`padding-inline-start`, `inset-inline-start`,
`text-align: end`) pour que la mise en page se retourne d'elle-même, plus un bloc
dédié pour ce qui ne se déduit pas :

- pile de polices arabes système, sans police distante ;
- crénage remis à `normal` — le resserrement négatif casse les ligatures cursives ;
- capitales supprimées, sans objet en arabe ;
- flèches retournées via `scaleX(-1)` pour suivre le sens de lecture ;
- étiquettes techniques traduites sorties du monospace, police sans glyphe arabe.

**Le piège des plages d'années en arabe.**
Dans un paragraphe RTL, le tiret de `2010–2016` est un caractère neutre : il prend
la direction du paragraphe, sépare les deux nombres en deux séquences, et celles-ci
sont ordonnées de droite à gauche — affichant `2016–2010`. Même effet sur le signe
moins de `−90 %`. Ces valeurs sont donc isolées en `direction: ltr` +
`unicode-bidi: isolate`, tout en restant collées au bord de départ. Les libellés
arabes commençant par un chiffre ont par ailleurs été reformulés en lettres, et les
dates de formation placées entre parenthèses, que l'algorithme met correctement en miroir.

**Séparation entre production et veille.**
La section « expertise » affirme que chaque technologie a servi en production chez
un client. Les domaines encore en autoformation (Spark, PyTorch, BigQuery, Power BI…)
sont donc rassemblés dans un bloc distinct et explicitement étiqueté comme tel,
plutôt que mélangés à la liste principale.

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
