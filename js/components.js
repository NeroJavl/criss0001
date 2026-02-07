(() => {
  const STORAGE_KEY = 'lang';
  const DEFAULT_LANG = 'es';

  const currentScript = document.currentScript;
  const scriptSrc = currentScript && currentScript.src ? currentScript.src : '';
  const basePath = scriptSrc ? scriptSrc.replace(/components\.js(?:\?.*)?$/, '') : './js/';
  const i18nSrc = `${basePath}i18n.js`;

  const ensureI18n = () => {
    const hasI18n = Array.from(document.scripts).some((script) => {
      const src = script.getAttribute('src') || '';
      return src.includes('i18n.js');
    });

    if (hasI18n) return;

    const script = document.createElement('script');
    script.src = i18nSrc;
    script.defer = true;
    document.head.appendChild(script);
  };

  const getStoredLang = () => localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

  const createSwitch = () => {
    if (document.querySelector('.lang-switch-container')) return;

    const container = document.createElement('div');
    container.className = 'lang-switch-container';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lang-switch';
    button.setAttribute('role', 'switch');
    button.setAttribute('aria-checked', 'true');
    button.setAttribute('aria-label', 'Cambiar idioma');
    button.setAttribute('data-i18n-aria', 'lang.switch.aria');

    button.innerHTML = `
      <span class="lang-option" data-lang="es">ES</span>
      <span class="lang-divider">|</span>
      <span class="lang-option" data-lang="en">US</span>
    `;

    container.appendChild(button);

    document.body.appendChild(container);

    const options = button.querySelectorAll('.lang-option');

    const updateSwitch = (lang) => {
      const normalized = lang === 'en' ? 'en' : 'es';
      button.setAttribute('aria-checked', normalized === 'es' ? 'true' : 'false');
      options.forEach((option) => {
        option.classList.toggle('is-active', option.dataset.lang === normalized);
      });
    };

    window.updateLanguageSwitch = updateSwitch;

    const emitChange = (lang) => {
      document.dispatchEvent(new CustomEvent('language:changed', { detail: { lang } }));
    };

    const handleToggle = () => {
      const current = getStoredLang();
      const next = current === 'es' ? 'en' : 'es';
      if (typeof window.setLanguage === 'function') {
        window.setLanguage(next);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
        updateSwitch(next);
        emitChange(next);
      }
    };

    button.addEventListener('click', handleToggle);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    });

    document.addEventListener('language:changed', (event) => {
      if (event.detail && event.detail.lang) {
        updateSwitch(event.detail.lang);
      }
    });

    updateSwitch(getStoredLang());

  };

  const init = () => {
    ensureI18n();
    createSwitch();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
