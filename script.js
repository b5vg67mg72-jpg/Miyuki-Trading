const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const siteHeader = document.querySelector('.site-header');
const progressBar = document.querySelector('.scroll-progress span');
const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];

const closeMenu = () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  mobileNav?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
};

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  mobileNav.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('hashchange', closeMenu);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const updateChrome = () => {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  siteHeader?.classList.toggle('is-scrolled', scrollTop > 18);
  if (progressBar) progressBar.style.transform = `scaleX(${scrollable > 0 ? scrollTop / scrollable : 0})`;
};

updateChrome();
window.addEventListener('scroll', updateChrome, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('is-current', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  },
  { rootMargin: '-30% 0px -55%', threshold: [0, 0.15, 0.4] }
);

document.querySelectorAll('section[id]').forEach((section) => sectionObserver.observe(section));
document.querySelector('#year').textContent = new Date().getFullYear();
