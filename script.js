// script.js
// Логика для кнопки image 6: click -> переход, ripple, keyboard accessibility.

document.addEventListener('DOMContentLoaded', function () {
  const cta = document.getElementById('image6');
  if (!cta) return;

  // Переход по data-href
  function navigateTo(href) {
    if (!href) return;
    // Для безопасности: если href начинается с http/https — откроем в новом окне, иначе — в том же
    if (/^https?:\/\//i.test(href)) {
      window.open(href, '_blank', 'noopener');
    } else {
      window.location.href = href;
    }
  }

  // Добавляем ripple эффект при клике
  function createRipple(e) {
    const rect = cta.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 1.2;
    ripple.style.width = ripple.style.height = size + 'px';

    // позиция клика внутри кнопки
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    cta.appendChild(ripple);
    // удалить через время анимации
    setTimeout(() => {
      ripple.remove();
    }, 700);
  }

  // клик мышью
  cta.addEventListener('click', function (e) {
    createRipple(e);
    const href = cta.dataset.href || cta.getAttribute('data-href') || 'calendar.html';
    // небольшая задержка, чтобы ripple виделся
    setTimeout(() => navigateTo(href), 220);
  });

  // keyboard: Enter / Space
  cta.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      // создаём "визуальный" ripple в центре
      const fakeEvent = {
        clientX: cta.getBoundingClientRect().left + cta.offsetWidth / 2,
        clientY: cta.getBoundingClientRect().top + cta.offsetHeight / 2
      };
      createRipple(fakeEvent);
      const href = cta.dataset.href || 'calendar.html';
      setTimeout(() => navigateTo(href), 180);
    }
  });

  // Улучшение UX: pointer feedback на touchstart (на Android/iOS)
  cta.addEventListener('touchstart', function (e) {
    // emulate pointer down scale
    cta.style.transform = 'translateY(-2px) scale(0.995)';
  }, {passive:true});
  cta.addEventListener('touchend', function () {
    cta.style.transform = '';
  });
});
