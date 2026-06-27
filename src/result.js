(function (ns) {
  const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function focusables(root) {
    return [...root.querySelectorAll(FOCUSABLE)].filter(node => {
      return !node.disabled && !node.hidden && node.getClientRects().length > 0;
    });
  }

  function trapFocus(event, dialog) {
    if (event.key !== 'Tab') return;

    const nodes = focusables(dialog);
    if (nodes.length === 0) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function setBackgroundLocked(isLocked) {
    const app = document.getElementById('app');
    const header = document.querySelector('.site-header');
    [app, header].forEach(element => {
      if (!element) return;
      if ('inert' in element) element.inert = isLocked;
      element.setAttribute('aria-hidden', String(isLocked));
    });
  }

  function ensureImageFallback(image) {
    const wrap = image.parentElement;
    let fallback = wrap.querySelector('[data-result-image-fallback]');
    if (fallback) return fallback;

    fallback = document.createElement('p');
    fallback.className = 'eyebrow';
    fallback.dataset.resultImageFallback = '';
    fallback.hidden = true;
    fallback.setAttribute('role', 'status');
    wrap.appendChild(fallback);
    return fallback;
  }

  function showResult(options) {
    const { dialog, name, image, spinAgainButton, closeButton, skin, onSpinAgain, onClose } = options;
    const imageFallback = ensureImageFallback(image);
    ns.state.data.resultVisible = true;
    ns.state.data.lastFocusedElement = document.activeElement;

    name.textContent = skin.name;
    image.classList.remove('image-error');
    image.hidden = false;
    image.alt = `${skin.name} splash art`;
    imageFallback.hidden = true;
    image.onerror = () => {
      image.classList.add('image-error');
      image.hidden = true;
      image.removeAttribute('src');
      imageFallback.textContent = `Splash art unavailable for ${skin.name}`;
      imageFallback.hidden = false;
    };
    image.src = ns.splashUrl(skin.num);

    dialog.hidden = false;
    dialog.setAttribute('aria-hidden', 'false');
    dialog.classList.add('visible');
    setBackgroundLocked(true);

    function close(shouldSpinAgain) {
      dialog.classList.remove('visible');
      dialog.hidden = true;
      dialog.setAttribute('aria-hidden', 'true');
      image.onerror = null;
      image.removeAttribute('src');
      image.hidden = false;
      imageFallback.hidden = true;
      ns.state.data.resultVisible = false;
      setBackgroundLocked(false);
      dialog.removeEventListener('keydown', keyHandler);
      spinAgainButton.onclick = null;
      closeButton.onclick = null;

      if (shouldSpinAgain) {
        onSpinAgain();
        return;
      }

      onClose();
      const previous = ns.state.data.lastFocusedElement;
      if (previous && previous.isConnected && typeof previous.focus === 'function') previous.focus();
    }

    function keyHandler(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(false);
        return;
      }
      trapFocus(event, dialog);
    }

    spinAgainButton.onclick = () => close(true);
    closeButton.onclick = () => close(false);
    dialog.addEventListener('keydown', keyHandler);
    window.setTimeout(() => spinAgainButton.focus(), 0);
  }

  ns.result = { showResult };
})(window.Yaspin = window.Yaspin || {});