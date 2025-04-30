window.onload = function () {
  setTimeout(() => {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
    
    // Restore saved sound & background on load
    loadSavedSound();
    setMoodBackground();
    
    // Show “Forgot PIN?” if they’ve already maxed attempts
    if (pinAttempts >= MAX_PIN_ATTEMPTS) {
      forgotPinLink.classList.remove('hidden');
    }
  }, 1500);
};

// — Element refs —
const saveBtn        = document.getElementById('saveBtn');
const diaryEntry     = document.getElementById('diaryEntry');
const entriesContainer = document.getElementById('entriesContainer');
const modeToggle     = document.getElementById('modeToggle');
const soundSelect    = document.getElementById('soundSelect');
const audioToggleBtn = document.getElementById('audioToggleBtn');
const feedbackBtn    = document.getElementById('feedbackBtn');
const feedbackPopup  = document.getElementById('feedbackPopup');
const closeFeedback  = document.getElementById('closeFeedback');
const moodSelect     = document.getElementById('moodSelect');
const ambientAudio   = document.getElementById('ambientAudio');
const audioSource    = document.getElementById('audioSource');
const pinInput       = document.getElementById('pinInput');
const pinButton      = document.getElementById('pinButton');
const editPinBtn     = document.getElementById('editPinBtn');
const forgotPinLink  = document.getElementById('forgotPinLink');
const quoteText      = document.getElementById('quoteText');
const nextQuoteBtn   = document.getElementById('nextQuoteBtn');

// — State & Constants —
let entries         = JSON.parse(localStorage.getItem('novaEntries')) || [];
let userPIN         = localStorage.getItem('novaPIN')       || null;
let pinAttempts     = parseInt(localStorage.getItem('novaPinAttempts')) || 0;
const MAX_PIN_ATTEMPTS = 3;

// **HERE** is the missing declaration:
let currentQuote = 0;

const quotes = [
  "Believe in yourself and all that you are.",
  "Your only limit is your mind.",
  "Start each day with a grateful heart.",
  "Dream it. Wish it. Do it.",
  "Stay positive, work hard, make it happen.",
  "Difficult roads often lead to beautiful destinations."
];

const sounds = {
  forest:   "forest.mp3",
  rain:     "rain.mp3",
  ocean:    "ocean.mp3",
  campfire: "campfire.mp3",
  snow:     "snow.mp3"
};

// — Update diary entries display —
function updateEntriesDisplay() {
  entriesContainer.innerHTML = '';
  if (!entries.length) {
    entriesContainer.innerHTML = "<p>No diary entries yet.</p>";
    return;
  }
  entries.forEach((entry, i) => {
    const div = document.createElement('div');
    div.className = 'entry';
    const h4 = document.createElement('h4');
    h4.innerText = `${getMoodEmoji(entry.mood)} ${capitalize(entry.mood)} — ${entry.date}`;
    div.appendChild(h4);
    const bc = document.createElement('div');
    bc.className = 'blur-content';
    const p = document.createElement('p');
    p.innerText = entry.content;
    bc.appendChild(p);
    if (entry.locked) bc.classList.add('locked');
    div.appendChild(bc);
    if (!entry.locked) {
      const eBtn = document.createElement('button');
      eBtn.innerText = 'Edit';
      eBtn.onclick = () => editEntry(i);
      div.appendChild(eBtn);
      const lBtn = document.createElement('button');
      lBtn.innerText = 'Lock';
      lBtn.onclick = () => lockEntry(i);
      div.appendChild(lBtn);
    } else {
      const ul = document.createElement('button');
      ul.innerText = 'Unlock';
      ul.onclick = () => unlockEntry(i);
      div.appendChild(ul);
    }
    entriesContainer.appendChild(div);
  });
}

// — Core functions (save, lock, unlock, edit) —
function saveEntry() {
  const content = diaryEntry.value.trim();
  let mood = moodSelect.value;
  if (!content) return alert('Write something first!');
  if (!mood) mood = detectMood(content);
  entries.push({ date: new Date().toLocaleDateString(), content, mood, locked: false });
  localStorage.setItem('novaEntries', JSON.stringify(entries));
  diaryEntry.value = '';
  updateEntriesDisplay();
  alert(quotes[Math.floor(Math.random() * quotes.length)]);
  setMoodBackground();
}

function lockEntry(i) {
  if (!userPIN) return alert('Set a PIN first!');
  entries[i].locked = true;
  localStorage.setItem('novaEntries', JSON.stringify(entries));
  updateEntriesDisplay();
}

function unlockEntry(i) {
  const attempt = prompt('Enter your PIN:');
  if (attempt === userPIN) {
    entries[i].locked = false;
    localStorage.setItem('novaEntries', JSON.stringify(entries));
    updateEntriesDisplay();
  } else {
    alert('Incorrect PIN.');
  }
}

function editEntry(i) {
  const updated = prompt('Edit your entry:', entries[i].content);
  if (updated !== null) {
    entries[i].content = updated;
    localStorage.setItem('novaEntries', JSON.stringify(entries));
    updateEntriesDisplay();
  }
}

// — Dark mode toggle —
function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

// — Sound controls —
function changeSound() {
  const sel = soundSelect.value;
  if (sounds[sel]) {
    audioSource.src = sounds[sel];
    ambientAudio.load();
    ambientAudio.play();
    localStorage.setItem('savedSound', sel);
    audioToggleBtn.innerText = '🔇';
  }
}
function loadSavedSound() {
  const saved = localStorage.getItem('savedSound');
  if (saved && sounds[saved]) {
    soundSelect.value = saved;
    audioSource.src = sounds[saved];
    ambientAudio.load();
  }
}
function toggleAudio() {
  if (ambientAudio.paused) {
    ambientAudio.play();
    audioToggleBtn.innerText = '🔇';
  } else {
    ambientAudio.pause();
    audioToggleBtn.innerText = '🔊';
  }
}

// — Feedback popup —
function openFeedback() {
  feedbackPopup.style.display = 'flex';
}
function closeFeedbackPopup() {
  feedbackPopup.style.display = 'none';
}

// — PIN handling with recovery —
function handlePIN() {
  const pin = pinInput.value.trim();
  if (!pin) return alert('Please enter a PIN.');
  if (!userPIN) {
    userPIN = pin;
    localStorage.setItem('novaPIN', userPIN);
    alert('PIN set!');
  }
  else if (pin === userPIN) {
    alert('Unlocked!');
    document.querySelector('.diary-section').classList.remove('hidden');
    document.querySelector('.past-entries').classList.remove('hidden');
    editPinBtn.classList.remove('hidden');
  }
  else {
    alert('Wrong PIN.');
    pinAttempts++;
    localStorage.setItem('novaPinAttempts', pinAttempts);
    if (pinAttempts >= MAX_PIN_ATTEMPTS) {
      forgotPinLink.classList.remove('hidden');
    }
  }
}

function editPIN() {
  const cur = prompt('Enter current PIN:');
  if (cur === userPIN) {
    const nxt = prompt('Enter new PIN:');
    if (nxt) {
      userPIN = nxt;
      localStorage.setItem('novaPIN', userPIN);
      alert('PIN updated!');
    }
  } else alert('Incorrect current PIN.');
}

function handleForgotPin() {
  if (confirm('This will ERASE all entries and reset your PIN. Continue?')) {
    localStorage.removeItem('novaEntries');
    localStorage.removeItem('novaPIN');
    localStorage.removeItem('novaPinAttempts');
    location.reload();
  }
}

// — Cycle quotes —
function showNextQuote() {
  currentQuote = (currentQuote + 1) % quotes.length;
  quoteText.innerText = quotes[currentQuote];
}

// — Robust mood background setter —
function setMoodBackground() {
  const mood = moodSelect.value;
  document.body.classList.remove(
    'mood-happy','mood-sad','mood-angry','mood-calm','mood-excited',
    'mood-anxious','mood-relaxed','mood-motivated','mood-grateful','mood-lonely'
  );
  if (mood) document.body.classList.add(`mood-${mood}`);
}

// — Helpers —
function detectMood(t) {
  t = t.toLowerCase();
  if (t.includes('happy'))   return 'happy';
  if (t.includes('sad'))     return 'sad';
  if (t.includes('angry'))   return 'angry';
  if (t.includes('calm'))    return 'calm';
  if (t.includes('excited')) return 'excited';
  return 'calm';
}
function getMoodEmoji(m) {
  return {
    happy:"😊", sad:"😢", angry:"😡", calm:"😌", excited:"🤩",
    anxious:"😰", relaxed:"😌", motivated:"🚀", grateful:"🙏", lonely:"🥺"
  }[arguments[0]] || "";
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// — Event Listeners —
saveBtn.addEventListener('click', saveEntry);
modeToggle.addEventListener('click', toggleDarkMode);
soundSelect.addEventListener('change', changeSound);
audioToggleBtn.addEventListener('click', toggleAudio);
feedbackBtn.addEventListener('click', openFeedback);
closeFeedback.addEventListener('click', closeFeedbackPopup);
nextQuoteBtn.addEventListener('click', showNextQuote);
pinButton.addEventListener('click', handlePIN);
editPinBtn.addEventListener('click', editPIN);
forgotPinLink.addEventListener('click', handleForgotPin);
moodSelect.addEventListener('change', setMoodBackground);

// — Initialize display & first quote —
updateEntriesDisplay();
quoteText.innerText = quotes[currentQuote];
