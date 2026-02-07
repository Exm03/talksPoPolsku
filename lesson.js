// lesson.js — шаблонный скрипт для страницы урока
(function () {
  'use strict';

  let player = null;
window.player = null;

let durationSec = 0;
let saveInterval = null;

let templateReady = false;

  /* ----------------- Helpers ----------------- */
  function qs(id) { return document.getElementById(id); }
  function setText(id, text) { const el = qs(id); if (el) el.textContent = text; }
  function safeSetHref(el, href) { if (!el) return; if (href) el.href = href; else el.removeAttribute('href'); }

  function setupExerciseLink(id, href) {
  const el = document.getElementById(id);
  if (!el) return;

  if (href) {
    el.href = href;
    el.classList.remove('disabled');
  } else {
    el.removeAttribute('href');
    el.classList.add('disabled');
  }
}


  function formatTime(s) {
    s = Math.floor(s || 0);
    return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  }
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* ------------- Data sources priority -------------
     1) localStorage.loadData (calendar.js кладёт сюда объект {id, videoId, exe, vocabHref, title...})
     2) ?id=YYYY-MM-DD + window._LESSONS (который выставляет calendar.js)
     3) fetch('lessons.json') - если такой файл есть на сервере (необязательно)
     4) FALLBACK (встроенный)
  --------------------------------------------------*/

  

  const urlId = getQueryParam('id');

  // Small fallback map: расширяй по мере необходимости
  const FALLBACK = {
    "2026-02-01": { title: "[SŁUCH] Talent do języków to mit", 
      type: "new", 
      href: "lesson.html?id=2026-02-01", 
      videoId: "96gGoITaeG4", 
      vocabHref: "https://quizlet.com/pl/1137942144/1-talent-do-jezykow-to-mit-3-kroki-zeby-zostac-poliglota-piotr-kruk-tedxsgh-flash-cards/?i=235rwg&x=1qqt", 
      exercises: {
  B1: "https://docs.google.com/forms/d/1-O_R3QBtxhKg06s0ZbOp_nGal1U0zXmRGXjMU8UFKxk/edit?usp=drivesdk",
  B2: "https://docs.google.com/forms/d/1IEmXa4UKQV4zvmQHgJi0AvAKIMKU-wUiw0XpjCFFr1M/edit?usp=drivesdk",
  C1: "https://docs.google.com/forms/d/1Qg1Irj6ydwBl20DYfVvmaHcDOpdQp8Ynlbikd-3-Czw/edit?usp=drivesdk",
  ALL: "https://docs.google.com/forms/d/1-GiAp0qTVyw36upl4qzLF5nrBP_hPhZMZMjjr15HsQA/edit?usp=drivesdk"
}, icon: "🎧" },
    "2026-02-03": { title: "[CZYT] Talent do języków to mit", type: "new", href: "lesson.html?id=2026-02-03", videoId: "96gGoITaeG4", vocabHref: "",  exercises: {
  B1: "https://docs.google.com/forms/d/1-O_R3QBtxhKg06s0ZbOp_nGal1U0zXmRGXjMU8UFKxk/edit?usp=drivesdk",
  B2: "https://docs.google.com/forms/d/1IEmXa4UKQV4zvmQHgJi0AvAKIMKU-wUiw0XpjCFFr1M/edit?usp=drivesdk",
  C1: "https://docs.google.com/forms/d/1Qg1Irj6ydwBl20DYfVvmaHcDOpdQp8Ynlbikd-3-Czw/edit?usp=drivesdk",
  ALL: "https://docs.google.com/forms/d/1-GiAp0qTVyw36upl4qzLF5nrBP_hPhZMZMjjr15HsQA/edit?usp=drivesdk"
}, icon: "📄" },
    "2026-02-05": { title: "[GRAM] Talent do języków to mit", type: "new", href: "lesson.html?id=2026-02-05", videoId: "96gGoITaeG4", vocabHref: "", exe: "lesson3-exercise.html", icon: "📚" },
    "2026-02-07": { title: "[PIS] Talent do języków to mit", type: "new", href: "lesson.html?id=2026-02-07", videoId: "96gGoITaeG4", vocabHref: "", exe: "lesson4-exercise.html", icon: "✍" },
    "2026-02-09": { title: "[SŁUCH] Cyfrowy obrzęk mózgu", type: "new", href: "lesson.html?id=2026-02-09", videoId: "96gGoITaeG4", vocabHref: "", exe:"lesson5-exercise.html" , icon: "🎧" },
    "2026-02-11": { title: "[CZYT] Cyfrowy obrzęk mózgu", type: "new", href: "lesson.html?id=2026-02-11", videoId: "96gGoITaeG4", vocabHref:"lesson6-vocab.html" , exe:"lesson6-exercise.html" , icon:"📄"},
    "2026-02-13": { title: "[GRAM] Cyfrowy obrzęk mózgu", type: "new", href: "lesson.html?id=2026-02-13", videoId: "96gGoITaeG4", vocabHref: "", exe:"lesson7-exercise.html", icon: "📚" },
    "2026-02-15": { title: "[PIS] Cyfrowy obrzęk mózgu", type: "new", href: "lesson.html?id=2026-02-15", videoId: "96gGoITaeG4", vocabHref: "", exe:"lesson8-exercise.html", icon: "✍" },
  
  };

  // Populate template function
  function populateTemplate(data) {
    if (!data) return;

    // Basic fields
    const title = data.title || `Lekcja ${data.id || ''}`;
    const subtitle = data.subtitle || '';
    const level = data.level || '';
    const description = data.description || '';
    const videoId = data.videoId || '';
    const exe = data.exe || '';
    const vocabHref = data.vocabHref || data.vocab || '';
    const icon = data.icon || '';

    setText('lessonTitleStrong', title);
    setText('lessonTitle', `Lekcja — ${title}`);
    setText('lessonSubtitle', subtitle);
    setText('lessonLevel', level);
    setText('lessonDesc', description);
    setText('crumbShort', title);
    if (qs('planTitle')) qs('planTitle').textContent = title;
    if (qs('planMeta')) qs('planMeta').textContent = level + (subtitle ? (' · ' + subtitle) : '');

    // icon
    const iconWrap = qs('lessonIconWrap');
    if (iconWrap) {
      iconWrap.innerHTML = '';
      if (data.iconUrl) {
        const img = document.createElement('img');
        img.src = data.iconUrl;
        img.alt = '';
        img.className = 'lesson-icon-img';
        iconWrap.appendChild(img);
      } else if (icon) {
        iconWrap.textContent = icon;
        iconWrap.setAttribute('aria-hidden', 'true');
      } else {
        iconWrap.textContent = '●';
      }
    }

    // links
    safeSetHref(qs('linkDictionary'), vocabHref);

    // упражнения по уровням
    const exercises = data.exercises || {};

    setupExerciseLink('linkB1', exercises.B1);
    setupExerciseLink('linkB2', exercises.B2);
    setupExerciseLink('linkC1', exercises.C1);
    setupExerciseLink('linkAll', exercises.ALL);

    // store video id so the YT init uses it (window scope)
    window.__TEMPLATE_LESSON = window.__TEMPLATE_LESSON || {};
    window.__TEMPLATE_LESSON.videoId = videoId;
    window.__TEMPLATE_LESSON.id = data.id || window.__TEMPLATE_LESSON.id || 'unknown';
    window.__TEMPLATE_LESSON.exe = exe;
    window.__TEMPLATE_LESSON.vocabHref = vocabHref;
    templateReady = true;
    tryInitPlayer();
  }

  // Try sources in order
  document.addEventListener('DOMContentLoaded', async function () {
    

    // 2) window._LESSONS with urlId
    if (urlId && window._LESSONS && window._LESSONS[urlId]) {
      const lesson = Object.assign({ id: urlId }, window._LESSONS[urlId]);
      populateTemplate(lesson);
      return;
    }

    // 3) try fetching lessons.json (optional)
    if (urlId) {
      try {
        const resp = await fetch('lessons.json', { cache: 'no-cache' });
        if (resp.ok) {
          const json = await resp.json();
          if (json && json[urlId]) {
            populateTemplate(Object.assign({ id: urlId }, json[urlId]));
            return;
          }
        }
      } catch (e) { /* ignore fetch errors */ }
    }

    // 4) FALLBACK
    if (urlId && FALLBACK[urlId]) {
      populateTemplate(FALLBACK[urlId]);
      return;
    }

    // 5) if nothing — show notice (no data)
    const lessonDesc = qs('lessonDesc');
    if (lessonDesc) {
      const node = document.createElement('div');
      node.className = 'no-data-notice';
      node.textContent = 'Brak danych lekcji. Otwórz lekcję przez Plan nauki (kliknij dzień) albo użyj ?id=YYYY-MM-DD.';
      lessonDesc.parentNode.insertBefore(node, lessonDesc);
    }
  });

  /* ------------------- Progress, links, tasks, player ------------------- */

  function lessonId() {
    return (window.__TEMPLATE_LESSON && window.__TEMPLATE_LESSON.id) || getQueryParam('id') || 'unknown';
  }
  function timeKey() { return `lesson_${lessonId()}_time`; }
  function watchedKey() { return `lesson_${lessonId()}_watched`; }
  function taskKey(n) { return `lesson_${lessonId()}_task${n}`; }

  // DOM refs
  const currentTimeEl = qs('currentTime');
  const durationEl = qs('duration');
  const markBtn = qs('markWatched');
  const openDictBtn = qs('openDictionary');
  const openExBtn = qs('openExercise');
  const task2Chk = qs('task2');
  const task3Chk = qs('task3');
  const playVideoLink = qs('playVideoLink');

  // Restore tasks
  try {
    if (task2Chk && localStorage.getItem(taskKey(2)) === 'done') task2Chk.checked = true;
    if (task3Chk && localStorage.getItem(taskKey(3)) === 'done') task3Chk.checked = true;
    if (task2Chk) task2Chk.addEventListener('change', () => localStorage.setItem(taskKey(2), task2Chk.checked ? 'done' : 'todo'));
    if (task3Chk) task3Chk.addEventListener('change', () => localStorage.setItem(taskKey(3), task3Chk.checked ? 'done' : 'todo'));
  } catch (e) {}

  // Mark watched
  if (markBtn) {
    markBtn.addEventListener('click', () => {
      try {
        localStorage.setItem(watchedKey(), 'true');
        localStorage.setItem(`lesson_${lessonId()}_lastViewed`, new Date().toISOString());
      } catch (e) {}
      markBtn.textContent = 'Obejrzane';
      markBtn.disabled = true;
      try { if (window._markLessonWatched) window._markLessonWatched(lessonId()); } catch (e) {}
      alert('Lekcja oznaczona jako obejrzana');
    });
  }

  // Open links
  if (openDictBtn) openDictBtn.addEventListener('click', () => {
    const href = (window.__TEMPLATE_LESSON && window.__TEMPLATE_LESSON.vocabHref) || qs('linkDictionary') && qs('linkDictionary').href;
    if (href) window.open(href, '_blank', 'noopener');
    else alert('Brak linku do słownictwa.');
  });
  if (openExBtn) openExBtn.addEventListener('click', () => {
    const href = (window.__TEMPLATE_LESSON && window.__TEMPLATE_LESSON.exe) || qs('linkExercise') && qs('linkExercise').href;
    if (href) window.open(href, '_blank', 'noopener');
    else alert('Brak linku do ćwiczenia.');
  });

  // Play link
  if (playVideoLink) playVideoLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.player && typeof window.player.playVideo === 'function') window.player.playVideo();
  });

  // UI: mark button if already watched
  if (localStorage.getItem(watchedKey()) === 'true') {
    if (markBtn) { markBtn.textContent = 'Obejrzane'; markBtn.disabled = true; }
  }

  /* ------------------- YouTube handling ------------------- */

function tryInitPlayer() {
  if (!templateReady) return;

  if (!window.YT || !window.YT.Player) {
    return;
  }

  const vid = window.__TEMPLATE_LESSON && window.__TEMPLATE_LESSON.videoId;
  if (!vid) return;

  if (player) return; // не создавать повторно

  player = new YT.Player('player', {
    videoId: vid,
    playerVars: { modestbranding: 1, rel: 0, controls: 1 },
    events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange }
  });

  window.player = player;
}

  // Called by YT IFrame API
 window.onYouTubeIframeAPIReady = function () {
  tryInitPlayer();
};

  function onPlayerReady(ev) {
    try {
      durationSec = ev.target.getDuration() || durationSec;
      if (durationEl) durationEl.textContent = '/ ' + formatTime(durationSec);

      // restore saved position
      const saved = parseFloat(localStorage.getItem(timeKey()) || '0');
      if (saved && saved > 2) {
        try { ev.target.seekTo(saved, true); } catch (e) {}
      }

      // periodic save when playing
      saveInterval = setInterval(() => {
        if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) return;
        try {
          const t = player.getCurrentTime();
          localStorage.setItem(timeKey(), String(t));
          if (currentTimeEl) currentTimeEl.textContent = formatTime(t);
          if (durationSec > 0 && t / durationSec >= 0.8) {
            localStorage.setItem(watchedKey(), 'true');
            localStorage.setItem(`lesson_${lessonId()}_lastViewed`, new Date().toISOString());
            if (markBtn) { markBtn.textContent = 'Obejrzane'; markBtn.disabled = true; }
          }
        } catch (e) {}
      }, 5000);

      if (localStorage.getItem(watchedKey()) === 'true') {
        if (markBtn) { markBtn.textContent = 'Obejrzane'; markBtn.disabled = true; }
      }
    } catch (e) {}
  }

  function onPlayerStateChange(ev) {
    try {
      if (!player) return;
      if (ev.data === YT.PlayerState.PAUSED || ev.data === YT.PlayerState.ENDED) {
        try {
          const t = player.getCurrentTime();
          localStorage.setItem(timeKey(), String(t));
          if (currentTimeEl) currentTimeEl.textContent = formatTime(t);
        } catch (e) {}
        if (ev.data === YT.PlayerState.ENDED) {
          localStorage.setItem(watchedKey(), 'true');
          localStorage.setItem(`lesson_${lessonId()}_lastViewed`, new Date().toISOString());
          if (markBtn) { markBtn.textContent = 'Obejrzane'; markBtn.disabled = true; }
        }
      }
      if (ev.data === YT.PlayerState.PLAYING) {
        durationSec = player.getDuration() || durationSec;
        if (durationEl) durationEl.textContent = '/ ' + formatTime(durationSec);
      }
    } catch (e) {}
  }

  window.addEventListener('beforeunload', () => {
    if (player && typeof player.getCurrentTime === 'function') {
      try { localStorage.setItem(timeKey(), String(player.getCurrentTime())); } catch (e) {}
    }
    if (saveInterval) clearInterval(saveInterval);
  });


})();
