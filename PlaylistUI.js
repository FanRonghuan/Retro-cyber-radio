import { tracks } from '../data/tracks.js';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export class PlaylistUI extends EventTarget {
  constructor() {
    super();
    this.index = 0;
    this.panel = document.querySelector('#playerPanel');
    this.rail = document.querySelector('#albumRail');
    this.playlist = document.querySelector('#playlist');
    this.title = document.querySelector('#trackTitle');
    this.artist = document.querySelector('#trackArtist');
    this.source = document.querySelector('#trackSource');
    this.attribution = document.querySelector('#trackAttribution');
    this.seek = document.querySelector('#seek');
    this.currentTime = document.querySelector('#currentTime');
    this.duration = document.querySelector('#duration');
    this.window = document.querySelector('.album-window');
    this.dragStart = null;
    this.dragDelta = 0;
    this.bindCarouselGestures();
    this.render();
  }

  render() {
    this.rail.innerHTML = tracks.map((track, index) => {
      const distance = this.relativeDistance(index);
      const magnitude = Math.abs(distance);
      const scale = magnitude === 0 ? 1 : magnitude === 1 ? 0.8 : 0.68;
      const opacity = magnitude === 0 ? 1 : magnitude === 1 ? 0.4 : 0.22;
      const blur = magnitude === 0 ? 0 : magnitude === 1 ? 4 : 6;
      return `<button class="album-card ${distance === 0 ? 'active' : ''}" data-album-index="${index}" style="--card-accent:${track.accent};--offset:${distance * 104}px;--depth:${magnitude * -52}px;--rotate:${distance * 26}deg;--scale:${scale};--card-opacity:${opacity};--blur:${blur}px;--card-z:${10 - magnitude}" aria-label="Select ${track.title}"><img src="${track.cover}" data-fallback="${track.localCover}" alt=""><span>${track.title}</span><small>${track.artist}</small></button>`;
    }).join('');
    this.playlist.innerHTML = tracks.map((track, index) => `<button class="track-row ${index === this.index ? 'active' : ''}" data-index="${index}"><span class="row-icon">${index === this.index ? '<i></i><i></i><i></i>' : '>'}</span><span><strong>${track.title}</strong><small>${track.artist}</small></span><time>${track.duration}</time></button>`).join('');
    this.playlist.querySelectorAll('[data-index]').forEach((button) => button.addEventListener('click', () => this.select(Number(button.dataset.index))));
    this.rail.querySelectorAll('[data-album-index]').forEach((card) => card.addEventListener('click', () => this.select(Number(card.dataset.albumIndex))));
    this.rail.querySelectorAll('img[data-fallback]').forEach((image) => image.addEventListener('error', () => { image.src = image.dataset.fallback; }, { once: true }));
    this.updateMeta();
  }

  relativeDistance(index) {
    let distance = index - this.index;
    const half = Math.floor(tracks.length / 2);
    if (distance > half) distance -= tracks.length;
    if (distance < -half) distance += tracks.length;
    return distance;
  }

  bindCarouselGestures() {
    this.window.addEventListener('pointerdown', (event) => {
      this.dragStart = event.clientX;
      this.dragDelta = 0;
      this.window.classList.add('is-dragging');
      this.window.setPointerCapture(event.pointerId);
    });
    this.window.addEventListener('pointermove', (event) => {
      if (this.dragStart === null) return;
      this.dragDelta = event.clientX - this.dragStart;
      this.rail.style.setProperty('--drag-offset', `${Math.max(-68, Math.min(68, this.dragDelta))}px`);
    });
    this.window.addEventListener('pointerup', (event) => {
      if (this.dragStart === null) return;
      const delta = this.dragDelta;
      this.dragStart = null;
      this.window.classList.remove('is-dragging');
      this.rail.style.setProperty('--drag-offset', '0px');
      if (Math.abs(delta) > 26) this.select(this.index + (delta < 0 ? 1 : -1));
    });
    this.window.addEventListener('pointercancel', () => {
      this.dragStart = null;
      this.window.classList.remove('is-dragging');
      this.rail.style.setProperty('--drag-offset', '0px');
    });
  }

  updateMeta() {
    const track = tracks[this.index];
    this.title.textContent = track.title;
    this.artist.textContent = track.artist;
    this.source.href = track.sourceUrl || '#';
    this.source.hidden = !track.sourceUrl;
    this.attribution.textContent = track.attribution || '';
  }

  select(index) {
    this.index = (index + tracks.length) % tracks.length;
    this.render();
    this.dispatchEvent(new CustomEvent('trackchange', { detail: tracks[this.index] }));
  }

  setPlaying(playing) {
    document.querySelector('#playControl')?.classList.toggle('is-disabled', playing);
    document.querySelector('#pauseControl')?.classList.toggle('is-active', playing);
  }
  setProgress(current, total) { this.currentTime.textContent = formatTime(current); this.duration.textContent = formatTime(total); const percent = total ? (current / total) * 100 : 0; this.seek.value = percent; this.seek.style.setProperty('--progress', `${percent}%`); }
  reveal(visible) { this.panel.classList.toggle('is-on', visible); }
}
