// 모바일 메뉴 열기/닫기
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '메뉴 열기');
}));
// 하단 저작권 표시 연도
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

window.PBCOMPANY_AUTH_CONFIG = {
  url: "https://uhveijacwqexlyxudpes.supabase.co",
  publishableKey: "sb_publishable_pbtechcompany2312119!@"
};

