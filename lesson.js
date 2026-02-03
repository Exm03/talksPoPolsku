// lesson.js
(function () {
  // Урок: 2026-02-01 (фиксируем id)
  const LESSON_ID = '2026-02-01';
  const YT_VIDEO_ID = '96gGoITaeG4';

  // Ключи localStorage
  const TIME_KEY = `lesson_${LESSON_ID}_time`;
  const WATCHED_KEY = `lesson_${LESSON_ID}_watched`;
  const TASK2_KEY = `lesson_${LESSON_ID}_task2`;
  const TASK3_KEY = `lesson_${LESSON_ID}_task3`;

  // Элементы
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  const markBtn = document.getElementById('markWatched');
  const linkDict = document.getElementById('linkDictionary');
  const linkEx = document.getElementById('linkExercise');
  const openDictBtn = document.getElementById('openDictionary');
  const openExBtn = document.getElementById('openExercise');
  const task2Chk = document.getElementById('task2');
  const task3Chk = document.getElementById('task3');
  const playVideoLink = document.getElementById('playVideoLink');

  // Привязки ссылок
  linkDict.href = `dictionary.html?id=${LESSON_ID}`;
  linkEx.href = `exercise.html?id=${LESSON_ID}`;
  playVideoLink.onclick = (e) => { e.preventDefault(); if (player) player.playVideo(); };

  // Восстановление состояния задач
  if (localStorage.getItem(TASK2_KEY) === 'done') task2Chk.checked = true;
  if (localStorage.getItem(TASK3_KEY) === 'done') task3Chk.checked = true;
  task2Chk.addEventListener('change', () => localStorage.setItem(TASK2_KEY, task2Chk.checked ? 'done' : 'todo'));
  task3Chk.addEventListener('change', () => localStorage.setItem(TASK3_KEY, task3Chk.checked ? 'done' : 'todo'));

  // Отметить просмотрено вручную
  markBtn.addEventListener('click', () => {
    localStorage.setItem(WATCHED_KEY, 'true');
    localStorage.setItem(`lesson_${LESSON_ID}_lastViewed`, new Date().toISOString());
    markBtn.textContent = 'Obejrzane';
    markBtn.disabled = true;
    // Обновить календарь (если в одной сессии)
    try { if (window._markLessonWatched) window._markLessonWatched(LESSON_ID); } catch(e){}
    alert('Lekcja oznaczona jako obejrzana');
  });

  // YouTube API
  let durationSec = 0;
  let saveInterval;

  let player;

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('player', {
    videoId: '96gGoITaeG4',
    playerVars: {
      modestbranding: 1,
      rel: 0,
      controls: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};


  function onPlayerReady(ev){
    durationSec = ev.target.getDuration() || 0;
    durationEl.textContent = '/ ' + formatTime(durationSec);
    const saved = parseFloat(localStorage.getItem(TIME_KEY) || '0');
    if (saved && saved > 2) {
      try { ev.target.seekTo(saved, true); } catch(e){}
    }
    saveInterval = setInterval(() => {
      if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
      const t = player.getCurrentTime();
      localStorage.setItem(TIME_KEY, String(t));
      updateTimeUI(t);
      if (durationSec > 0 && t / durationSec >= 0.8) {
        localStorage.setItem(WATCHED_KEY, 'true');
        localStorage.setItem(`lesson_${LESSON_ID}_lastViewed`, new Date().toISOString());
      }
    }, 5000);
    // UI: если уже просмотрено
    if (localStorage.getItem(WATCHED_KEY) === 'true') {
      markBtn.textContent = 'Obejrzane';
      markBtn.disabled = true;
    }
  }

  function onPlayerStateChange(ev){
    if (ev.data === YT.PlayerState.PAUSED || ev.data === YT.PlayerState.ENDED) {
      try {
        const t = player.getCurrentTime();
        localStorage.setItem(TIME_KEY, String(t));
        updateTimeUI(t);
      } catch(e){}
      if (ev.data === YT.PlayerState.ENDED) {
        localStorage.setItem(WATCHED_KEY, 'true');
        localStorage.setItem(`lesson_${LESSON_ID}_lastViewed`, new Date().toISOString());
      }
    }
    if (ev.data === YT.PlayerState.PLAYING) {
      durationSec = player.getDuration() || durationSec;
      durationEl.textContent = '/ ' + formatTime(durationSec);
    }
  }

  function updateTimeUI(sec){
    currentTimeEl.textContent = formatTime(sec);
  }
  function formatTime(s){
    s = Math.floor(s||0);
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }

  window.addEventListener('beforeunload', () => {
    if (player && typeof player.getCurrentTime === 'function') {
      try { localStorage.setItem(TIME_KEY, String(player.getCurrentTime())); } catch(e){}
    }
    clearInterval(saveInterval);
  });

  // Если страница загрузилась и урок уже отмечен — обновим кнопку
  if (localStorage.getItem(WATCHED_KEY) === 'true') {
    markBtn.textContent = 'Obejrzane';
    markBtn.disabled = true;
  }
})();
