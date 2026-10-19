/* Configuración editable */
const WHATSAPP_NUMBER = '5493624553052';
// Pegá aquí el link normal de YouTube (watch, youtu.be o embed).
const YOUTUBE_VIDEO_URL = 'https://youtu.be/3ZIQhvENsGs';

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const wa = message => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
function youtubeEmbed(url, autoplay = false) {
  try {
    const parsed = new URL(url.trim());
    let id = parsed.searchParams.get('v');
    if (!id && parsed.hostname.includes('youtu.be')) id = parsed.pathname.slice(1);
    if (!id && parsed.pathname.includes('/embed/')) id = parsed.pathname.split('/embed/')[1];
    id = id?.split(/[?&#]/)[0];
    if (!id || !/^[\w-]{11}$/.test(id)) return '';
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      enablejsapi: '1',
      autoplay: autoplay ? '1' : '0',
      mute: autoplay ? '1' : '0'
    });
    return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
  } catch { return ''; }
}

function initMenu() {
  const burger = $('.burger');
  const nav = $('.nav');
  if (!burger || !nav) return;
  const close = () => { nav.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => { const open = nav.classList.toggle('open'); burger.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); });
  $$('.nav a').forEach(link => link.addEventListener('click', close));
}

function initCarousel() {
  const hero = $('.hero');
  if (!hero) return;
  const slides = $$('.slide', hero), dots = $('.dots', hero), video = $('#videoSlide iframe');
  let current = 0, timer, paused = false;
  const configuredVideo = $('#videoSlide')?.dataset.youtube || YOUTUBE_VIDEO_URL;
  const videoUrl = youtubeEmbed(configuredVideo || YOUTUBE_VIDEO_URL);
  if (video && videoUrl) video.src = videoUrl;
  slides.forEach((_, index) => { const dot = document.createElement('button'); dot.type = 'button'; dot.setAttribute('aria-label', `Ir a la diapositiva ${index + 1}`); dot.addEventListener('click', () => go(index)); dots.append(dot); });
  function schedule(delay) { clearTimeout(timer); timer = setTimeout(() => paused ? schedule(900) : go(current + 1), delay); }
  function setVideoPlayback(active) {
    if (!video || !videoUrl) return;
    if (active) {
      video.src = youtubeEmbed(configuredVideo || YOUTUBE_VIDEO_URL, true);
    } else if (video.contentWindow) {
      video.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
    }
  }
  function go(index) { current = (index + slides.length) % slides.length; slides.forEach((slide, i) => slide.classList.toggle('active', i === current)); $$('button', dots).forEach((dot, i) => dot.classList.toggle('on', i === current)); setVideoPlayback(slides[current].id === 'videoSlide'); schedule(current === slides.length - 1 ? 10000 : 5500); }
  $('.prev', hero).addEventListener('click', () => go(current - 1)); $('.next', hero).addEventListener('click', () => go(current + 1));
  hero.addEventListener('mouseenter', () => { paused = true; }); hero.addEventListener('mouseleave', () => { paused = false; });
  let startX = 0; hero.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true }); hero.addEventListener('touchend', e => { const distance = e.changedTouches[0].clientX - startX; if (Math.abs(distance) > 50) go(current + (distance < 0 ? 1 : -1)); });
  go(0);
}

function initAccordion() { $$('.q button').forEach(button => button.addEventListener('click', () => { const isOpen = button.getAttribute('aria-expanded') === 'true'; $$('.q button').forEach(other => { other.setAttribute('aria-expanded', 'false'); other.nextElementSibling.style.maxHeight = null; $('i', other).textContent = '+'; }); if (!isOpen) { button.setAttribute('aria-expanded', 'true'); button.nextElementSibling.style.maxHeight = `${button.nextElementSibling.scrollHeight}px`; $('i', button).textContent = '−'; } })); }

function initContactForm() { const form = $('#form'); if (!form) return; const error = $('.err', form); form.addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(form)); if (!data.nombre.trim() || !/^[\d\s+()-]{6,}$/.test(data.tel.trim()) || data.msg.trim().length < 5) { error.textContent = 'Completá tu nombre, un teléfono válido y tu mensaje.'; return; } error.textContent = ''; window.open(wa(`Nombre: ${data.nombre}\nTeléfono: ${data.tel}\nAsunto: ${data.asunto}\nMensaje: ${data.msg}`), '_blank', 'noopener'); form.reset(); }); }

function initWhatsApp() { const greeting = 'Hola Servi Muebles, quiero hacer una consulta.'; const floating = $('#wa'); const footer = $('#waFoot'); if (floating) { floating.href = wa(greeting); floating.dataset.tip = '¿Hablamos?'; } if (footer) { footer.href = wa(greeting); footer.target = '_blank'; footer.rel = 'noopener'; } $$('.ask').forEach(button => button.addEventListener('click', () => window.open(wa(`Hola, quiero consultar por: ${button.closest('[data-name]').dataset.name}`), '_blank', 'noopener'))); }

function initScrollEffects() { const header = $('.header'), top = $('.top'), links = $$('.nav a'); if (top) top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' })); addEventListener('scroll', () => { header?.classList.toggle('scrolled', scrollY > 10); top?.classList.toggle('show', scrollY > 600); }, { passive: true }); const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in'); revealObserver.unobserve(entry.target); } }), { threshold: .15 }); $$('.reveal').forEach(item => revealObserver.observe(item)); const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) links.forEach(link => link.classList.toggle('on', link.getAttribute('href') === `${location.pathname.split('/').pop()}#${entry.target.id}`)); }), { rootMargin: '-45% 0px -50% 0px' }); $$('main section[id]').forEach(section => sectionObserver.observe(section)); }

function initCounters() { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting) return; observer.unobserve(entry.target); const element = entry.target, target = Number(element.dataset.n); let value = 0; const step = Math.max(1, Math.ceil(target / 60)); const interval = setInterval(() => { value += step; if (value >= target) { value = target; clearInterval(interval); } element.textContent = `+${value}`; }, 25); }), { threshold: .6 }); $$('[data-n]').forEach(counter => observer.observe(counter)); }

[initMenu, initCarousel, initAccordion, initContactForm, initWhatsApp, initScrollEffects, initCounters].forEach(init => init());
