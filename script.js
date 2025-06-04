let correctWord = '';
let audioUrl = '';
let phonemeMap = {
  "banana": ["b", "ə", "n", "æ", "n", "ə"],
  "computer": ["k", "ə", "m", "p", "j", "u", "t", "ər"],
  "pronunciation": ["p", "r", "ə", "n", "ʌ", "n", "s", "i", "ˈeɪ", "ʃ", "ən"]
};

async function fetchWord() {
  const word = document.getElementById('wordInput').value.toLowerCase();
  if (!word) return alert("Please enter a word.");

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();

    correctWord = data[0].word;
    document.getElementById("selectedWord").innerText = correctWord;

    const phonetics = data[0].phonetics.find(p => p.text)?.text || "N/A";
    audioUrl = data[0].phonetics.find(p => p.audio)?.audio || '';
    document.getElementById("phonetics").innerText = phonetics;

    const syllables = correctWord.replace(/([aeiouy]+[^aeiouy]*)/gi, '$1 ').trim().split(' ');
    document.getElementById("syllables").innerText = syllables.join(" - ");
    showSyllableAnimation(syllables);

    document.getElementById("wordInfo").classList.remove("hidden");
  } catch (err) {
    alert("Word not found.");
  }
}

function playAudio() {
  if (audioUrl) new Audio(audioUrl).play();
  else alert("No audio found.");
}

function startRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function(event) {
    const result = event.results[0][0].transcript.toLowerCase();
    document.getElementById("userSpeech").innerText = result;
    scorePronunciation(result);
  };

  recognition.onerror = function(e) {
    alert("Speech error: " + e.error);
  };

  recognition.start();
}

function showSyllableAnimation(syllables) {
  const container = document.getElementById("syllableSteps");
  container.innerHTML = '';
  syllables.forEach((syllable, i) => {
    const span = document.createElement('span');
    span.textContent = syllable;
    span.id = `syll${i}`;
    container.appendChild(span);
  });

  document.getElementById("syllableAnimation").classList.remove("hidden");

  let i = 0;
  const interval = setInterval(() => {
    if (i > 0) document.getElementById(`syll${i-1}`).classList.remove("active");
    if (i < syllables.length) {
      document.getElementById(`syll${i}`).classList.add("active");
      i++;
    } else {
      clearInterval(interval);
    }
  }, 700);
}

function scorePronunciation(spoken) {
  const actual = phonemeMap[correctWord];
  if (!actual) {
    document.getElementById("score").innerText = "N/A";
    return alert("No phoneme reference for this word (mocked list is small).");
  }

  const spokenPhonemes = simulatePhonemeSplit(spoken); // simple mock
  const matches = spokenPhonemes.filter((p, i) => actual[i] === p).length;
  const score = Math.round((matches / actual.length) * 10);
  document.getElementById("score").innerText = score;
}

function simulatePhonemeSplit(word) {
  return word.toLowerCase().split("").filter(c => /[a-z]/.test(c));
}
