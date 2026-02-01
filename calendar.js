/* calendar.js (обновлён)
   Добавлена поддержка иконок, доступности по дате в часовом поясе Europe/Warsaw,
   периодическое обновление (каждую минуту) и блокировка клика до наступления даты.
*/

(function () {
  /* === YOUR LESSONS: редактируй этот объект ===
     icon: (опционально) — строка: emoji / inline SVG / текст
     iconUrl: (опционально) — относительный или абсолютный путь к картинке (приоритет выше icon)
  */
  const LESSONS = {
    "2026-02-01": { title: "1.1 Talent do języków to mit", tag: "TED", type: "new", href: "lesson.html?id=2026-02-01", icon: "🎧" },
    "2026-02-02": { title: "1.2 Talent do języków to mit", tag: "TED", type: "new", href: "lesson.html?id=2026-02-02", icon: "📄" },
    "2026-02-03": { title: "1.3 Talent do języków to mit", tag: "TED", type: "new", href: "lesson.html?id=2026-02-03", icon: "✅" },
    "2026-02-04": { title: "1.4 Talent do języków to mit", tag: "TED", type: "new", href: "lesson.html?id=2026-02-04", icon: "📝" },
    "2026-02-05": { title: "1.4 Talent do języków to mit", tag: "TED", type: "new", href: "lesson.html?id=2026-02-05", icon: "📝" },
    "2026-02-06": { title: "1.4 Talent do języków to mit", tag: "TED", type: "new", href: "lesson.html?id=2026-02-06", icon: "📝" },
    "2026-02-07": { title: "1.4 Talent do języków to mit", tag: "TED", type: "new", href: "lesson.html?id=2026-02-07", icon: "📝" },
    "2026-02-08": { title: "1.4 Talent do języków to mit", tag: "TED", type: "new", href: "lesson.html?id=2026-02-08", icon: "📝" },
  };
  /* ========================================= */

  // DOM
  const calendarGrid = document.getElementById('calendarGrid');
  const monthLabel = document.getElementById('monthLabel');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const filterCheckbox = document.getElementById('filterNew');
  const showAllBtn = document.getElementById('showAll');
  const showAllLessonsBtn = document.getElementById('showAllLessons');

  // view month default (можешь поставить today)
  let viewYear = 2026;
  let viewMonth = 1; // февраль

  let viewOnlyNew = filterCheckbox ? filterCheckbox.checked : false;

  // Вернёт ISO-дату (YYYY-MM-DD) для переданного Date в часовом поясе Poland
  function polandISODate(d = new Date()) {
    // 'en-CA' форматирует YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(d);
  }

  // Получить "сегодня" в Польше (строка YYYY-MM-DD)
  function polandToday() {
    return polandISODate(new Date());
  }

  function formatMonthLabel(y,m){
    const names = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
    return `${names[m]} ${y}`;
  }

  function isoDate(y,m,d){
    return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  function isLessonWatched(id){
    return localStorage.getItem(`lesson_${id}_watched`) === 'true';
  }

  function markLessonWatched(id){
    localStorage.setItem(`lesson_${id}_watched`, 'true');
    localStorage.setItem(`lesson_${id}_lastViewed`, new Date().toISOString());
  }

  function openLesson(id, href, available){
    if (!available) {
      // короткое уведомление о дате доступности в часовом поясе Польши
      const msg = `Урок будет доступен ${id} (часовой пояс Polska)`;
      // мягкий UX: используем alert, можно заменить на кастомный тултип
      alert(msg);
      return;
    }
    markLessonWatched(id);
    const dest = href || `lesson.html?id=${id}`;
    if (/^https?:\/\//.test(dest)) window.open(dest, '_blank', 'noopener');
    else window.location.href = dest;
  }

  // Создаёт карточку урока (DOM)
  function createLessonCard(dateKey, lesson, available, watched) {
    const card = document.createElement('div');
    card.className = 'lesson-card';
    if (watched) card.classList.add('viewed');

    // иконка
    const iconWrap = document.createElement('div');
    iconWrap.className = 'lesson-icon-wrap';

    if (lesson.iconUrl) {
      const img = document.createElement('img');
      img.src = lesson.iconUrl;
      img.alt = '';
      img.className = 'lesson-icon-img';
      iconWrap.appendChild(img);
    } else if (lesson.icon) {
      const ic = document.createElement('div');
      ic.className = 'lesson-icon';
      ic.innerHTML = lesson.icon;
      iconWrap.appendChild(ic);
    } else {
      const ic = document.createElement('div');
      ic.className = 'lesson-icon';
      ic.textContent = '●';
      iconWrap.appendChild(ic);
    }

    // если ещё недоступно — добавим полупрозрачный замок поверх и класс locked
    if (!available) {
      const lock = document.createElement('div');
      lock.className = 'icon-locked';
      lock.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 8V7a5 5 0 10-10 0v1" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="8" width="18" height="13" rx="2" stroke="#fff" stroke-width="1.6" fill="rgba(0,0,0,0.2)"/></svg>';
      iconWrap.appendChild(lock);
      card.classList.add('locked');
    } else if (watched) {
      // если просмотрено, заменим иконку на галочку
      const done = document.createElement('div');
      done.className = 'icon-done';
      done.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      // убираем старый (последний child) и добавим done
      iconWrap.innerHTML = '';
      iconWrap.appendChild(done);
    }

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = lesson.title;

    const meta = document.createElement('div');
    meta.className = 'meta';
    if (lesson.tag) {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag';
      tagSpan.textContent = lesson.tag;
      meta.appendChild(tagSpan);
    }
    // red dot если новый и ещё не просмотрен и доступен
    if (lesson.type === 'new' && !watched && available) {
      const dot = document.createElement('span');
      dot.className = 'red-dot';
      meta.appendChild(dot);
    }

    card.appendChild(iconWrap);
    card.appendChild(title);
    card.appendChild(meta);

    // клик — откроет только если доступен
    card.addEventListener('click', function (e) {
      e.stopPropagation();
      openLesson(dateKey, lesson.href, available);
      // после markLessonWatched визуально обновляем карточку
      setTimeout(() => renderCalendar(), 80);
    });

    return card;
  }

  // render
  function renderCalendar(){
    calendarGrid.innerHTML = '';
    monthLabel.textContent = formatMonthLabel(viewYear, viewMonth);

    const firstDay = new Date(viewYear, viewMonth, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7; // 0 = Monday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // заполнить пустые ячейки перед первым днём
    for (let i = 0; i < startWeekday; i++) {
      const empty = document.createElement('div');
      empty.className = 'day empty';
      calendarGrid.appendChild(empty);
    }

    const todayPoland = polandToday();

    for (let day = 1; day <= daysInMonth; day++){
      const dateKey = isoDate(viewYear, viewMonth, day);
      const cell = document.createElement('div');
      cell.className = 'day';
      const num = document.createElement('div');
      num.className = 'num';
      num.textContent = day;
      cell.appendChild(num);

      const lesson = LESSONS[dateKey];
        

      if (lesson) {
        // доступность: доступно если дата урока <= текущая дата в Польше
        const available = dateKey <= todayPoland;
        const watched = isLessonWatched(dateKey);

        // фильтр "показывать только новые" (если включён)
        if (viewOnlyNew && !(lesson.type === 'new')) {
          // не показываем
        } else {
          const card = createLessonCard(dateKey, lesson, available, watched);
          cell.appendChild(card);
        }
      }

      calendarGrid.appendChild(cell);
    }
  }

  // навигация
  prevBtn.addEventListener('click', function () {
    viewMonth--;
    if (viewMonth < 0){ viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  nextBtn.addEventListener('click', function () {
    viewMonth++;
    if (viewMonth > 11){ viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  // фильтр
  if (filterCheckbox) {
    filterCheckbox.addEventListener('change', function (e) {
      viewOnlyNew = e.target.checked;
      renderCalendar();
    });
  }
  if (showAllBtn) showAllBtn.addEventListener('click', function (){ viewOnlyNew = false; if (filterCheckbox) filterCheckbox.checked = false; renderCalendar(); });
  if (showAllLessonsBtn) showAllLessonsBtn.addEventListener('click', function (){ viewOnlyNew = false; if (filterCheckbox) filterCheckbox.checked = false; renderCalendar(); });

  // апдейт календаря каждые 60 секунд (на случай перехода суток в часовом поясе Польши)
  renderCalendar();
  setInterval(renderCalendar, 60 * 1000);

  // expose helpers
  window._LESSONS = LESSONS;
  window._markLessonWatched = markLessonWatched;
  window._polandToday = polandToday;
})();


LESSONS['2026-02-01'] =  {
  title: "Talent do języków — wideo",
  tag: "TED",
  type: "new",
  href: "lesson.html?id=2026-02-01",
  icon: "🎧"
};
