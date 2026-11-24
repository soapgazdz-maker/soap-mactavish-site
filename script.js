// Menu mobile
const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

// Apparition progressive des sections
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else revealItems.forEach(item => item.classList.add('visible'));

// Le lecteur Twitch a besoin du domaine exact dans le paramètre parent.
const player = document.getElementById('twitchPlayer');
const host = window.location.hostname;
if (host && host !== 'localhost' && host !== '127.0.0.1') {
  player.src = `https://player.twitch.tv/?channel=soap_mactavish6&parent=${encodeURIComponent(host)}&muted=true`;
}

// Ambiance cinématique originale, sans bouton visible.
// Les navigateurs exigent une première interaction avant d'autoriser le son.
let audioContext = null;
let ambienceStarted = false;
function startAmbient() {
  if (ambienceStarted) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  ambienceStarted = true;
  audioContext = new AudioCtx();
  const master = audioContext.createGain();
  master.gain.value = 0.075;
  master.connect(audioContext.destination);

  // Drone grave à trois couches pour une atmosphère plus intense.
  [43.65, 55, 65.41].forEach((frequency, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    osc.type = index === 1 ? 'sawtooth' : 'triangle';
    osc.frequency.value = frequency;
    osc.detune.value = index === 2 ? 7 : -4;
    filter.type = 'lowpass'; filter.frequency.value = index === 1 ? 180 : 125;
    gain.gain.value = index === 1 ? 0.12 : 0.22;
    osc.connect(filter); filter.connect(gain); gain.connect(master); osc.start();
  });

  // Pulsation sourde lente, façon bande-annonce, sans mélodie empruntée.
  const pulse = audioContext.createOscillator();
  const pulseGain = audioContext.createGain();
  pulse.type = 'sine'; pulse.frequency.value = 48;
  pulseGain.gain.value = 0;
  pulse.connect(pulseGain); pulseGain.connect(master); pulse.start();
  const beat = () => {
    if (!audioContext || audioContext.state === 'closed') return;
    const now = audioContext.currentTime;
    pulseGain.gain.cancelScheduledValues(now);
    pulseGain.gain.setValueAtTime(0.001, now);
    pulseGain.gain.linearRampToValueAtTime(0.24, now + 0.08);
    pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
  };
  beat();
  const interval = window.setInterval(beat, 1700);
  window.addEventListener('pagehide', () => { window.clearInterval(interval); if (audioContext) audioContext.close(); }, { once: true });
}
window.addEventListener('pointerdown', startAmbient, { once: true });
window.addEventListener('keydown', startAmbient, { once: true });
