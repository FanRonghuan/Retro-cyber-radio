export class AudioPlayer extends EventTarget {
  constructor() {
    super();
    this.audio = new Audio();
    this.audio.volume = 0.8;
    this.localUrl = null;
    this.remoteUrl = null;
    this.audio.addEventListener('play', () => this.dispatchEvent(new Event('play')));
    this.audio.addEventListener('pause', () => this.dispatchEvent(new Event('pause')));
    this.audio.addEventListener('ended', () => this.dispatchEvent(new Event('ended')));
    this.audio.addEventListener('timeupdate', () => this.dispatchEvent(new Event('timeupdate')));
    this.audio.addEventListener('loadedmetadata', () => this.dispatchEvent(new Event('metadata')));
    this.audio.addEventListener('error', () => this.dispatchEvent(new CustomEvent('error', { detail: this.audio.error })));
  }

  loadFile(file) {
    if (this.localUrl) URL.revokeObjectURL(this.localUrl);
    this.localUrl = URL.createObjectURL(file);
    this.audio.src = this.localUrl;
    this.audio.load();
    this.dispatchEvent(new CustomEvent('file', { detail: { name: file.name } }));
  }

  loadUrl(url) {
    if (!url) { this.audio.removeAttribute('src'); this.audio.load(); return; }
    if (this.localUrl) { URL.revokeObjectURL(this.localUrl); this.localUrl = null; }
    this.remoteUrl = url;
    this.audio.src = url;
    this.audio.crossOrigin = 'anonymous';
    this.audio.load();
  }

  play() { return this.audio.play(); }
  pause() { this.audio.pause(); }
  toggle() { return this.audio.paused ? this.play() : this.pause(); }
  setVolume(value) { this.audio.volume = value; }
  seek(percent) { if (this.audio.duration) this.audio.currentTime = this.audio.duration * percent; }
}
