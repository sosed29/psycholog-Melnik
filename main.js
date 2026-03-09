// Основной скрипт для сайта психолога Дарьи Мельник
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

function initApp() {
  // Убрать загрузку
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('loaded');
  }, 500);

  // Установить год в футере
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // Инициализация мобильного меню
  initMobileMenu();

  // Инициализация кнопки "Наверх"
  initBackToTop();

  // Инициализация слайдера сертификатов
  initCertificatesSlider();

  // Инициализация формы
  initBookingForm();

  // Эффект при скролле для header
  initHeaderScroll();

  // Плавный скролл для якорных ссылок
  initSmoothScroll();
}

function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!burger || !mobileMenu) return;

  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    burger.setAttribute('aria-expanded', mobileMenu.classList.contains('active'));
  });

  document.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

function initBackToTop() {
  const backToTop = document.getElementById('backToTop');
  if (!backToTop) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function initBookingForm() {
  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) return;

  bookingForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = getFormData();

    if (!validateFormData(formData)) {
      showFormStatus('error', 'Пожалуйста, заполните обязательные поля: имя, телефон и услугу');
      return;
    }

    await submitForm(formData);
  });
}

function getFormData() {
  return {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim() || 'Не указан',
    service: document.getElementById('service').value,
    message: document.getElementById('message').value.trim() || 'Нет сообщения'
  };
}

function validateFormData(formData) {
  return formData.name && formData.phone && formData.service;
}

async function submitForm(formData) {
  const submitBtn = document.querySelector('#bookingForm button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
  submitBtn.disabled = true;

  try {
    const result = await sendToTelegram(formData);

    if (result.success) {
      showFormStatus('success', '✅ Заявка отправлена! Я свяжусь с вами в течение 2 часов.');
      document.getElementById('bookingForm').reset();
      saveToLocalStorage(formData);
    } else {
      showFormStatus('error', result.error || 'Ошибка отправки. Позвоните: +7 (960) 475-11-47');
    }
  } catch (error) {
    console.error('Ошибка отправки формы:', error);
    showFormStatus('error', 'Ошибка соединения. Пожалуйста, позвоните: +7 (960) 475-11-47');
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

async function sendToTelegram(formData) {
  const BOT_TOKEN = '8280973765:AAERb4ZfdZFLl3B108UHEGth3npzr76Bxd4';
  const DARYA_CHAT_ID = '1348091597';

  const serviceNames = {
    'individual': 'Очная консультация (2 000 ₽)',
    'course': 'Пакет 5 сессий (9 000 ₽)',
    'online': 'Онлайн-консультация (2 000 ₽)'
  };

  const serviceText = serviceNames[formData.service] || formData.service;

  const message = `🎯 <b>НОВАЯ ЗАЯВКА С САЙТА ПСИХОЛОГА</b>

👤 <b>Клиент:</b> ${formData.name}
📞 <b>Телефон:</b> <a href="tel:${formData.phone}">${formData.phone}</a>
📧 <b>Email:</b> ${formData.email}
💼 <b>Услуга:</b> ${serviceText}

📝 <b>Сообщение:</b>
${formData.message}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
🌐 <b>Сайт:</b> ${window.location.href}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: DARYA_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const result = await response.json();

    if (result.ok) {
      return {
        success: true,
        message: 'Уведомление отправлено',
        telegramResult: result
      };
    } else {
      return {
        success: false,
        error: 'Ошибка отправки: ' + (result.description || 'Неизвестная ошибка')
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Ошибка сети: ' + error.message
    };
  }
}

function showFormStatus(type, message) {
  const formStatus = document.getElementById('formStatus');
  if (!formStatus) return;

  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;

  setTimeout(() => {
    formStatus.style.opacity = '0';
    setTimeout(() => {
      formStatus.className = 'form-status';
      formStatus.style.opacity = '1';
    }, 300);
  }, 5000);
}

function saveToLocalStorage(data) {
  try {
    const bookings = JSON.parse(localStorage.getItem('psychologist_bookings') || '[]');
    bookings.push({
      timestamp: new Date().toISOString(),
      data: data
    });
    localStorage.setItem('psychologist_bookings', JSON.stringify(bookings));
  } catch (e) {
    console.error('Ошибка сохранения в localStorage:', e);
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

function initCertificatesSlider() {
  const track = document.getElementById('certificatesTrack');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.querySelector('.slider-btn--prev');
  const nextBtn = document.querySelector('.slider-btn--next');
  const currentSlideEl = document.getElementById('currentSlide');
  const totalSlidesEl = document.getElementById('totalSlides');
  const modal = document.getElementById('certificateModal');
  const modalClose = document.querySelector('.modal__close');
  const modalImage = document.getElementById('modalImage');

  if (!track) return;

  // Все 21 сертификаты с правильными форматами
  const certificates = [
    { id: 1, image: 'img/cert-1.jpg' },
    { id: 2, image: 'img/cert-2.jpg' },
    { id: 3, image: 'img/cert-3.jpg' },
    { id: 4, image: 'img/cert-4.jpg' },
    { id: 5, image: 'img/cert-5.jpg' },
    { id: 6, image: 'img/cert-6.jpg' },
    { id: 7, image: 'img/cert-7.png' },
    { id: 8, image: 'img/cert-8.jpg' },
    { id: 9, image: 'img/cert-9.jpg' },
    { id: 10, image: 'img/cert-10.png' },
    { id: 11, image: 'img/cert-11.png' },
    { id: 12, image: 'img/cert-12.jpg' },
    { id: 13, image: 'img/cert-13.jpg' },
    { id: 14, image: 'img/cert-14.jpg' },
    { id: 15, image: 'img/cert-15.jpg' },
    { id: 16, image: 'img/cert-16.jpg' },
    { id: 17, image: 'img/cert-17.jpg' },
    { id: 18, image: 'img/cert-18.png' },
    { id: 19, image: 'img/cert-19.png' },
    { id: 20, image: 'img/cert-20.jpg' },
    { id: 21, image: 'img/cert-21.jpg' }
  ];

  let currentSlide = 0;
  let slidesToShow = 3;
  const totalSlides = certificates.length;

  totalSlidesEl.textContent = totalSlides;

  function createSlides() {
    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    certificates.forEach((cert, index) => {
      const card = document.createElement('div');
      card.className = 'certificate-card';
      card.innerHTML = `
        <img src="${cert.image}" alt="Сертификат ${cert.id}" class="certificate-card__image" loading="lazy">
      `;

      card.addEventListener('click', () => {
        openCertificateModal(cert);
      });

      track.appendChild(card);

      const dot = document.createElement('button');
      dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(index);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function goToSlide(slideIndex) {
    const maxSlide = totalSlides - slidesToShow;
    currentSlide = Math.min(Math.max(slideIndex, 0), maxSlide);

    const cardWidth = track.children[0]?.offsetWidth || 280;
    const gap = 30;
    const translateX = -currentSlide * (cardWidth + gap);

    track.style.transform = `translateX(${translateX}px)`;

    document.querySelectorAll('.slider-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });

    if (currentSlideEl) {
      const maxSlideForCounter = totalSlides - slidesToShow;
      let displayed = currentSlide + 1;
      if (currentSlide === maxSlideForCounter) {
        displayed = totalSlides;
      }
      currentSlideEl.textContent = displayed;
    }
  }

  function nextSlide() {
    const maxSlide = totalSlides - slidesToShow;
    if (currentSlide < maxSlide) {
      goToSlide(currentSlide + 1);
    } else {
      goToSlide(0);
    }
  }

  function prevSlide() {
    const maxSlide = totalSlides - slidesToShow;
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    } else {
      goToSlide(maxSlide);
    }
  }

  function openCertificateModal(certificate) {
    modalImage.src = certificate.image;
    modalImage.alt = `Сертификат ${certificate.id}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateSlidesToShow() {
    const width = window.innerWidth;
    if (width < 768) {
      slidesToShow = 1;
    } else if (width < 1024) {
      slidesToShow = 2;
    } else {
      slidesToShow = 3;
    }
    goToSlide(currentSlide);
  }

  createSlides();

  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (modalClose) modalClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  window.addEventListener('resize', updateSlidesToShow);
  updateSlidesToShow();
}

window.psychologistApp = {
  initApp,
  sendToTelegram,
  saveToLocalStorage
};
