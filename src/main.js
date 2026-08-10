import './styles.css';
import { RadioScene } from './scene/RadioScene.js';
import { AudioPlayer } from './player/AudioPlayer.js';
import { PlaylistUI } from './ui/PlaylistUI.js';
import { tracks } from './data/tracks.js';
import { runBootSequence } from './animations/BootSequence.js';

const scene = new RadioScene(document.querySelector('#radioCanvas'));
const audio = new AudioPlayer();
const ui = new PlaylistUI();
let powered = false;
const playbackStatus = document.querySelector('#playbackStatus');
const setPlaybackStatus = (message = '') => { playbackStatus.textContent = message; };

scene.setLabel(tracks[0]);
scene.setTrackInfo(tracks[0]);
audio.loadUrl(tracks[0].audio);

async function powerOn() {
  if (powered) return;
  powered = true;
  document.querySelector('#modelState').textContent = 'ONLINE';
  await runBootSequence({ scene, ui });
}

function powerOff() {
  powered = false;
  audio.pause();
  scene.liftNeedle();
  scene.powerOff();
  ui.reveal(false);
  document.querySelector('#modelState').textContent = 'STANDBY';
}

async function togglePower() { if (powered) powerOff(); else await powerOn(); }

async function playSelected() {
  if (!powered) await powerOn();
  const track = tracks[ui.index];
  if (!track.audio) { setPlaybackStatus('此曲目尚未下载到本地，请先选择已下载曲目或使用 LOAD MUSIC。'); return; }
  if (!audio.audio.src || audio.audio.src !== new URL(track.audio, location.href).href) audio.loadUrl(track.audio);
  setPlaybackStatus('正在加载音频…');
  try { await audio.play(); setPlaybackStatus('正在播放本地 MP3'); } catch { setPlaybackStatus('播放被浏览器阻止，请再次点击播放。'); }
}

function pauseSelected() {
  if (audio.audio.src) audio.pause();
}

function changeTrack(offset) {
  ui.select(ui.index + offset);
}

document.querySelector('#powerControl').addEventListener('click', togglePower);
document.querySelector('#playControl').addEventListener('click', playSelected);
document.querySelector('#pauseControl').addEventListener('click', pauseSelected);
document.querySelector('#nextTrack').addEventListener('click', () => changeTrack(1));
document.querySelector('#prevAlbum').addEventListener('click', () => changeTrack(-1));
document.querySelector('#nextAlbum').addEventListener('click', () => changeTrack(1));
document.querySelector('#volume').addEventListener('input', (event) => audio.setVolume(Number(event.target.value)));
document.querySelector('#seek').addEventListener('input', (event) => audio.seek(Number(event.target.value) / 100));
document.querySelector('#audioFile').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  audio.loadFile(file);
  ui.title.textContent = file.name.replace(/\.[^.]+$/, '');
  if (!powered) await powerOn();
});
document.querySelector('#exportGlb').addEventListener('click', () => scene.exportGLB());

scene.addEventListener('partclick', async (event) => {
  const action = event.detail;
  if (action === 'PowerButton') await togglePower();
  if (action === 'PlayButton') await playSelected();
  if (action === 'PauseButton') pauseSelected();
  if (action === 'NextButton') changeTrack(1);
  if (action === 'VolumeKnob') document.querySelector('#volume').focus();
});

ui.addEventListener('trackchange', async (event) => {
  // Switching the queue must stop the previous track immediately. Otherwise
  // selecting an item without a local file can leave the old audio playing.
  audio.pause();
  scene.setLabel(event.detail);
  scene.setTrackInfo(event.detail);
  audio.loadUrl(event.detail.audio);
  setPlaybackStatus(event.detail.audio ? '已选择本地可播放曲目。' : '此曲目待下载；暂不可播放。');
  // Selecting a song only changes the queue and record label. Playback starts
  // explicitly from the physical PlayButton or the right-side Play control.
});
audio.addEventListener('play', () => { scene.setSpinning(true); ui.setPlaying(true); });
audio.addEventListener('pause', () => { scene.setSpinning(false); ui.setPlaying(false); });
audio.addEventListener('error', () => setPlaybackStatus('音频加载失败，请刷新后重试。'));
audio.addEventListener('ended', () => changeTrack(1));
audio.addEventListener('timeupdate', () => { ui.setProgress(audio.audio.currentTime, audio.audio.duration); scene.screenInfo.current = audio.audio.currentTime; scene.screenInfo.duration = audio.audio.duration || 0; scene.updateScreen(); });
audio.addEventListener('metadata', () => { ui.setProgress(0, audio.audio.duration); scene.screenInfo.current = 0; scene.screenInfo.duration = audio.audio.duration || 0; scene.updateScreen(); });
