let _audio = null;
let _voices = [];

function loadVoices() {
  _voices = window.speechSynthesis?.getVoices() ?? [];
}
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
  loadVoices();
}

export function speakGerman(text) {
  if (!text) return;
  if (_audio) {
    _audio.pause();
    _audio = null;
  }
  window.speechSynthesis?.cancel();
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=de&client=tw-ob&ttsspeed=0.9`;
  _audio = new Audio(url);
  _audio.play().catch(() => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.85;
    const v =
      _voices.find((v) => v.lang === "de-DE") ?? _voices.find((v) => v.lang.startsWith("de"));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  });
}
