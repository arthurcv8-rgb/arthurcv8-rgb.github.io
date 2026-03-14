// ================================================
// CONNEXION FIREBASE
// ================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUAX4KHrzFjULBUkhiH-XEU2mb3lB7q4E",
  authDomain: "devine-pays-voisin.firebaseapp.com",
  projectId: "devine-pays-voisin",
  storageBucket: "devine-pays-voisin.firebasestorage.app",
  messagingSenderId: "369727800455",
  appId: "1:369727800455:web:dd3ff9a4879b24f1f36422"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);


// ================================================
// DONNÉES : les 20 pays et leurs voisins
// ================================================
const COUNTRIES = [
  { name: "France",         flag: "🇫🇷", neighbors: ["Espagne", "Andorre", "Monaco", "Italie", "Suisse", "Allemagne", "Luxembourg", "Belgique"] },
  { name: "Allemagne",      flag: "🇩🇪", neighbors: ["France", "Belgique", "Luxembourg", "Pays-Bas", "Danemark", "Pologne", "Tchéquie", "Autriche", "Suisse"] },
  { name: "Espagne",        flag: "🇪🇸", neighbors: ["France", "Andorre", "Portugal", "Maroc"] },
  { name: "Italie",         flag: "🇮🇹", neighbors: ["France", "Monaco", "Suisse", "Autriche", "Slovénie", "Saint-Marin", "Vatican"] },
  { name: "Russie",         flag: "🇷🇺", neighbors: ["Norvège", "Finlande", "Estonie", "Lettonie", "Biélorussie", "Ukraine", "Pologne", "Lituanie", "Géorgie", "Azerbaïdjan", "Kazakhstan", "Chine", "Mongolie", "Corée du Nord"] },
  { name: "Brésil",         flag: "🇧🇷", neighbors: ["Venezuela", "Guyane", "Suriname", "Guyana", "Colombie", "Pérou", "Bolivie", "Paraguay", "Argentine", "Uruguay"] },
  { name: "Chine",          flag: "🇨🇳", neighbors: ["Russie", "Mongolie", "Kazakhstan", "Kirghizistan", "Tadjikistan", "Afghanistan", "Pakistan", "Inde", "Népal", "Bhoutan", "Myanmar", "Laos", "Vietnam", "Corée du Nord"] },
  { name: "Inde",           flag: "🇮🇳", neighbors: ["Pakistan", "Chine", "Népal", "Bhoutan", "Bangladesh", "Myanmar"] },
  { name: "Mexique",        flag: "🇲🇽", neighbors: ["États-Unis", "Guatemala", "Belize"] },
  { name: "Argentine",      flag: "🇦🇷", neighbors: ["Chili", "Bolivie", "Paraguay", "Brésil", "Uruguay"] },
  { name: "Maroc",          flag: "🇲🇦", neighbors: ["Espagne", "Algérie", "Mauritanie"] },
  { name: "Égypte",         flag: "🇪🇬", neighbors: ["Libye", "Soudan", "Israël", "Palestine"] },
  { name: "Nigeria",        flag: "🇳🇬", neighbors: ["Bénin", "Niger", "Tchad", "Cameroun"] },
  { name: "Turquie",        flag: "🇹🇷", neighbors: ["Grèce", "Bulgarie", "Géorgie", "Arménie", "Azerbaïdjan", "Iran", "Irak", "Syrie"] },
  { name: "Iran",           flag: "🇮🇷", neighbors: ["Turquie", "Irak", "Arménie", "Azerbaïdjan", "Turkménistan", "Afghanistan", "Pakistan"] },
  { name: "Pologne",        flag: "🇵🇱", neighbors: ["Allemagne", "Tchéquie", "Slovaquie", "Ukraine", "Biélorussie", "Lituanie", "Russie"] },
  { name: "Suisse",         flag: "🇨🇭", neighbors: ["France", "Allemagne", "Autriche", "Liechtenstein", "Italie"] },
  { name: "Autriche",       flag: "🇦🇹", neighbors: ["Allemagne", "Tchéquie", "Slovaquie", "Hongrie", "Slovénie", "Italie", "Suisse", "Liechtenstein"] },
  { name: "Afrique du Sud", flag: "🇿🇦", neighbors: ["Namibie", "Botswana", "Zimbabwe", "Mozambique", "Eswatini", "Lesotho"] },
  { name: "Pérou",          flag: "🇵🇪", neighbors: ["Équateur", "Colombie", "Brésil", "Bolivie", "Chili"] }
];

// Liste de tous les noms de pays pour générer de faux choix en QCM
const TOUS_LES_PAYS = [
  "Afghanistan","Algérie","Allemagne","Andorre","Angola","Argentine","Arménie","Australie",
  "Autriche","Azerbaïdjan","Bangladesh","Belgique","Belize","Bénin","Bhoutan","Biélorussie",
  "Bolivie","Botswana","Brésil","Bulgarie","Cameroun","Canada","Chili","Chine","Colombie",
  "Corée du Nord","Corée du Sud","Cuba","Danemark","Égypte","Équateur","Espagne","Estonie",
  "États-Unis","Finlande","France","Géorgie","Ghana","Grèce","Guatemala","Guyana","Honduras",
  "Hongrie","Inde","Irak","Iran","Israël","Italie","Kazakhstan","Kenya","Kirghizistan",
  "Kosovo","Laos","Lettonie","Liechtenstein","Lituanie","Libye","Luxembourg","Malawi",
  "Mauritanie","Mexique","Monaco","Mongolie","Mozambique","Myanmar","Namibie","Népal",
  "Nicaragua","Niger","Nigeria","Norvège","Ouganda","Pakistan","Palestine","Panama",
  "Paraguay","Pays-Bas","Pérou","Pologne","Portugal","République Tchèque","Roumanie",
  "Russie","Rwanda","Saint-Marin","Slovaquie","Slovénie","Soudan","Suriname","Suisse",
  "Syrie","Tadjikistan","Tanzanie","Tchad","Tchéquie","Thaïlande","Turkménistan","Turquie",
  "Ukraine","Uruguay","Vatican","Venezuela","Vietnam","Zimbabwe","Eswatini","Lesotho",
  "Botswana","Maroc","Andorre"
];


// ================================================
// ÉTAT DU JEU (les variables qui changent pendant la partie)
// ================================================
let mode       = 'ecriture'; // 'ecriture' ou 'qcm'
let difficulty = 'easy';     // 'easy', 'medium' ou 'hard'
let timeMax    = 120;        // secondes par manche selon difficulté
let totalRounds = 5;         // nombre de manches

let round          = 0;
let totalScore     = 0;
let currentCountry = null;   // le pays affiché
let foundNeighbors = [];     // voisins déjà trouvés
let usedCountries  = [];     // pays déjà utilisés dans cette partie
let timerInterval  = null;
let timeLeft       = 120;

// Pour le QCM : on garde les voisins restants à deviner
let qcmVoisinsRestants = [];


// ================================================
// CHANGER LE MODE (écriture / QCM)
// ================================================
function setMode(btn, nouveauMode) {
  // Met le bouton cliqué en "actif" et enlève les autres
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  mode = nouveauMode;
}


// ================================================
// CHANGER LA DIFFICULTÉ
// ================================================
function setDiff(btn, diff) {
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  difficulty = diff;
  // Facile = 120s, Normal = 90s, Difficile = 60s
  timeMax = diff === 'easy' ? 120 : diff === 'medium' ? 90 : 60;
}


// ================================================
// AFFICHER UN ÉCRAN (et cacher les autres)
// ================================================
function show(id) {
  const ecrans = ['screen-home', 'screen-game', 'screen-round-end', 'screen-result'];
  ecrans.forEach(e => document.getElementById(e).classList.add('hidden'));

  const el = document.getElementById(id);
  el.classList.remove('hidden');
  // Redéclencher l'animation fadein
  el.classList.remove('fadein');
  void el.offsetWidth; // force le navigateur à recalculer
  el.classList.add('fadein');
}


// ================================================
// CLASSEMENT FIREBASE
// ================================================
async function renderLeaderboard(containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = '<div class="lb-empty">Chargement...</div>';
  try {
    const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(8));
    const snap = await getDocs(q);
    if (snap.empty) {
      el.innerHTML = '<div class="lb-empty">Aucun score encore — soyez le premier !</div>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    el.innerHTML = snap.docs.map((doc, i) => {
      const d = doc.data();
      return `
        <div class="lb-row">
          <div class="medal-ico">${medals[i] || (i + 1)}</div>
          <div class="name">${d.name}</div>
          <div class="pts">${d.score} pts</div>
        </div>`;
    }).join('');
  } catch (e) {
    el.innerHTML = '<div class="lb-empty">Erreur de chargement.</div>';
  }
}


// ================================================
// DÉMARRER UNE NOUVELLE PARTIE
// ================================================
function startGame() {
  round      = 0;
  totalScore = 0;
  usedCountries = [];
  nextRound();
}


// ================================================
// CHOISIR UN PAYS AU HASARD (pas déjà utilisé)
// ================================================
function pickCountry() {
  const disponibles = COUNTRIES.filter(c => !usedCountries.includes(c.name));
  return disponibles[Math.floor(Math.random() * disponibles.length)];
}


// ================================================
// PASSER À LA MANCHE SUIVANTE
// ================================================
function nextRound() {
  round++;
  if (round > totalRounds) {
    showResult();
    return;
  }

  // Choisir un nouveau pays
  currentCountry = pickCountry();
  usedCountries.push(currentCountry.name);
  foundNeighbors = [];
  timeLeft = timeMax;

  // Mettre à jour l'affichage
  document.getElementById('round-label').textContent  = `MANCHE ${round}/${totalRounds}`;
  document.getElementById('score-label').textContent  = `⭐ ${totalScore} pts`;
  document.getElementById('flag-display').textContent = currentCountry.flag;
  document.getElementById('country-name').textContent = currentCountry.name;
  document.getElementById('hint-text').textContent    = 'cliquez pour un indice';
  document.getElementById('guess-input').value        = '';

  // Afficher la bonne zone selon le mode
  const zoneEcriture = document.getElementById('zone-ecriture');
  const zoneQcm      = document.getElementById('zone-qcm');
  if (mode === 'qcm') {
    zoneEcriture.classList.add('hidden');
    zoneQcm.classList.remove('hidden');
    // Préparer la liste des voisins à deviner en QCM
    qcmVoisinsRestants = [...currentCountry.neighbors];
    afficherQCM();
  } else {
    zoneEcriture.classList.remove('hidden');
    zoneQcm.classList.add('hidden');
    setTimeout(() => document.getElementById('guess-input').focus(), 150);
  }

  document.getElementById('country-card').classList.remove('correct', 'wrong');
  updateProgress();
  renderChips();
  updateTimerBar();

  show('screen-game');

  // Démarrer le chrono
  clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
}


// ================================================
// CHRONOMETRE
// ================================================
function tick() {
  timeLeft--;
  updateTimerBar();
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    showRoundEnd();
  }
}

function updateTimerBar() {
  const bar  = document.getElementById('timer-bar');
  const text = document.getElementById('timer-text');
  const pct  = (timeLeft / timeMax) * 100;

  bar.style.width = pct + '%';

  // Couleur selon le temps restant
  if (pct > 50)      bar.style.background = 'var(--vert)';
  else if (pct > 25) bar.style.background = '#facc15';
  else               bar.style.background = 'var(--rouge)';

  text.textContent = timeLeft + 's';
  text.style.color = timeLeft <= 10 ? 'var(--rouge)' : 'var(--gris)';
}


// ================================================
// METTRE À JOUR LE COMPTEUR DE VOISINS
// ================================================
function updateProgress() {
  document.getElementById('progress-text').textContent =
    `${foundNeighbors.length}/${currentCountry.neighbors.length} voisins trouvés`;
  document.getElementById('score-label').textContent = `⭐ ${totalScore} pts`;
}


// ================================================
// CHIPS (les pastilles ? ou nom trouvé)
// ================================================
function renderChips() {
  const container = document.getElementById('chips-container');
  container.innerHTML = currentCountry.neighbors.map(voisin => {
    const trouve = foundNeighbors.includes(voisin);
    return `<div class="chip ${trouve ? 'found' : ''}">${trouve ? '✓ ' + voisin : '?'}</div>`;
  }).join('');
}


// ================================================
// MODE ÉCRITURE — valider une réponse
// ================================================
function submitGuess() {
  const input = document.getElementById('guess-input');
  const valeur = input.value.trim();
  if (!valeur) return;

  // On compare sans accents et en minuscules
  const match = currentCountry.neighbors.find(v => normaliser(v) === normaliser(valeur));

  if (match && !foundNeighbors.includes(match)) {
    // ✅ Bonne réponse
    foundNeighbors.push(match);
    totalScore += difficulty === 'hard' ? 2 : 1;
    updateProgress();
    renderChips();

    const card = document.getElementById('country-card');
    card.classList.add('correct');
    setTimeout(() => card.classList.remove('correct'), 500);

    // Tous trouvés ? Fin de manche + bonus
    if (foundNeighbors.length === currentCountry.neighbors.length) {
      clearInterval(timerInterval);
      totalScore += 5; // bonus tous trouvés
      setTimeout(() => showRoundEnd(), 700);
    }

  } else {
    // ❌ Mauvaise réponse
    const inp = document.getElementById('guess-input');
    inp.classList.add('shake');
    setTimeout(() => inp.classList.remove('shake'), 450);

    const card = document.getElementById('country-card');
    card.classList.add('wrong');
    setTimeout(() => card.classList.remove('wrong'), 400);
  }

  input.value = '';
  input.focus();
}


// ================================================
// BOUTON INDICE (mode écriture)
// ================================================
function showHint() {
  const restants = currentCountry.neighbors.filter(v => !foundNeighbors.includes(v));
  if (!restants.length) return;

  const choix = restants[Math.floor(Math.random() * restants.length)];
  // Montre les 2 premières lettres + le nombre de lettres
  document.getElementById('hint-text').textContent =
    choix.slice(0, 2).toUpperCase() + '... (' + choix.length + ' lettres)';

  // Pénalité en mode difficile
  if (difficulty === 'hard') totalScore = Math.max(0, totalScore - 1);
}


// ================================================
// MODE QCM — générer les 4 boutons
// ================================================
function afficherQCM() {
  // S'il ne reste plus rien à deviner, fin de manche
  if (qcmVoisinsRestants.length === 0) {
    clearInterval(timerInterval);
    totalScore += 5; // bonus tous trouvés
    setTimeout(() => showRoundEnd(), 500);
    return;
  }

  // La bonne réponse = premier voisin restant
  const bonneReponse = qcmVoisinsRestants[0];

  // 3 mauvaises réponses au hasard (pas déjà voisins, pas déjà affichés)
  const fausses = TOUS_LES_PAYS
    .filter(p => !currentCountry.neighbors.includes(p) && p !== bonneReponse)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Mélanger les 4 options
  const options = [bonneReponse, ...fausses].sort(() => Math.random() - 0.5);

  // Générer les boutons
  const grid = document.getElementById('qcm-grid');
  grid.innerHTML = options.map(option => `
    <button class="qcm-btn" onclick="repondreQCM(this, '${option}', '${bonneReponse}')">
      ${option}
    </button>
  `).join('');
}


// ================================================
// MODE QCM — traiter la réponse du joueur
// ================================================
function repondreQCM(btn, reponse, bonneReponse) {
  // Désactiver tous les boutons pendant la correction
  document.querySelectorAll('.qcm-btn').forEach(b => b.disabled = true);

  if (reponse === bonneReponse) {
    // ✅ Bonne réponse
    btn.classList.add('correct');
    foundNeighbors.push(bonneReponse);
    totalScore += difficulty === 'hard' ? 2 : 1;
    updateProgress();
    renderChips();

    const card = document.getElementById('country-card');
    card.classList.add('correct');
    setTimeout(() => card.classList.remove('correct'), 500);

    // Retirer ce voisin de la liste et afficher le suivant
    qcmVoisinsRestants.shift();
    setTimeout(() => afficherQCM(), 900);

  } else {
    // ❌ Mauvaise réponse — montrer la bonne en vert
    btn.classList.add('wrong');
    document.querySelectorAll('.qcm-btn').forEach(b => {
      if (b.textContent.trim() === bonneReponse) b.classList.add('correct');
    });

    const card = document.getElementById('country-card');
    card.classList.add('wrong');
    setTimeout(() => card.classList.remove('wrong'), 500);

    // On passe ce voisin (manqué) et on continue
    qcmVoisinsRestants.shift();
    setTimeout(() => afficherQCM(), 1200);
  }
}


// ================================================
// NORMALISER (compare sans accents, sans majuscules)
// ================================================
function normaliser(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}


// ================================================
// FIN DE MANCHE — afficher le récap
// ================================================
function showRoundEnd() {
  const manques = currentCountry.neighbors.filter(v => !foundNeighbors.includes(v));

  document.getElementById('re-flag').textContent         = currentCountry.flag;
  document.getElementById('re-country-name').textContent = currentCountry.name;
  document.getElementById('re-sub').textContent          = `Manche ${round}/${totalRounds}`;
  document.getElementById('re-score').textContent        = `Score total : ${totalScore} pts`;

  // Voisins trouvés
  document.getElementById('re-found').innerHTML = foundNeighbors.length
    ? foundNeighbors.map(v => `<span class="re-chip-ok">✓ ${v}</span>`).join('')
    : '<span style="color:var(--gris);font-size:13px">Aucun</span>';

  // Voisins manqués
  const carteManques = document.getElementById('re-missed-card');
  if (manques.length) {
    carteManques.style.display = '';
    document.getElementById('re-missed').innerHTML =
      manques.map(v => `<span class="re-chip-miss">✗ ${v}</span>`).join('');
  } else {
    carteManques.style.display = 'none';
  }

  // Texte du bouton selon si c'est la dernière manche
  document.getElementById('btn-next').textContent =
    round >= totalRounds ? '🏆 VOIR LES RÉSULTATS' : 'MANCHE SUIVANTE →';

  show('screen-round-end');
}


// ================================================
// RÉSULTATS FINAUX
// ================================================
function showResult() {
  let medal, msg;
  if      (totalScore >= 30) { medal = '🥇'; msg = 'Géographe en chef !'; }
  else if (totalScore >= 20) { medal = '🥈'; msg = 'Excellent géographe !'; }
  else if (totalScore >= 10) { medal = '🥉'; msg = 'Pas mal du tout !'; }
  else                       { medal = '🌍'; msg = 'Continue à explorer le monde !'; }

  document.getElementById('result-medal').textContent = medal;
  document.getElementById('result-msg').textContent   = msg;
  document.getElementById('result-score').textContent = totalScore;
  document.getElementById('player-name').value        = '';
  document.getElementById('player-name').disabled     = false;

  const btnSave = document.querySelector('.btn-save');
  btnSave.textContent = '💾 SAUVER';
  btnSave.disabled    = false;
  btnSave.style.opacity = '1';

  renderLeaderboard('lb-result-list');
  show('screen-result');
}


// ================================================
// SAUVEGARDER LE SCORE DANS FIREBASE
// ================================================
async function saveScore() {
  const name = document.getElementById('player-name').value.trim();
  if (!name) { alert('Entrez votre prénom !'); return; }

  const btn = document.querySelector('.btn-save');
  btn.textContent = '⏳ Envoi...';
  btn.disabled = true;

  try {
    await addDoc(collection(db, "scores"), {
      name:  name,
      score: totalScore,
      date:  new Date().toLocaleDateString('fr-FR'),
      ts:    Date.now()
    });
    document.getElementById('player-name').disabled = true;
    btn.textContent   = '✅ Sauvegardé !';
    btn.style.opacity = '0.6';
    renderLeaderboard('lb-result-list');
  } catch (e) {
    btn.textContent = '❌ Erreur, réessayez';
    btn.disabled    = false;
  }
}


// ================================================
// RETOUR À L'ACCUEIL
// ================================================
async function goHome() {
  await renderLeaderboard('lb-home-list');
  show('screen-home');
}


// ================================================
// CLAVIER — touche Entrée pour valider
// ================================================
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const jeuVisible = !document.getElementById('screen-game').classList.contains('hidden');
    if (jeuVisible && mode === 'ecriture') submitGuess();
  }
});


// ================================================
// EXPOSER LES FONCTIONS (nécessaire avec type="module")
// ================================================
window.setMode     = setMode;
window.setDiff     = setDiff;
window.startGame   = startGame;
window.nextRound   = nextRound;
window.submitGuess = submitGuess;
window.showHint    = showHint;
window.repondreQCM = repondreQCM;
window.saveScore   = saveScore;
window.goHome      = goHome;


// ================================================
// INITIALISATION — charger le classement au démarrage
// ================================================
renderLeaderboard('lb-home-list');
