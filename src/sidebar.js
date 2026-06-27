(function (ns) {
  function createSkinButton(skin, isActive, isDisabled, onToggle) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'skin-item';
    item.dataset.num = skin.num;
    item.setAttribute('aria-pressed', String(isActive));
    item.setAttribute('aria-label', `${isActive ? 'Disable' : 'Enable'} ${skin.name}`);
    item.disabled = isDisabled;

    const thumb = document.createElement('img');
    thumb.className = 'skin-thumb';
    thumb.src = ns.thumbUrl(skin.num);
    thumb.alt = '';
    thumb.width = 46;
    thumb.height = 46;
    thumb.loading = 'lazy';
    thumb.addEventListener('error', () => {
      thumb.classList.add('image-error');
      thumb.removeAttribute('src');
      thumb.setAttribute('aria-hidden', 'true');
      thumb.title = `${skin.name} thumbnail unavailable`;
    }, { once: true });

    const label = document.createElement('span');
    label.className = 'skin-label';
    label.textContent = skin.name;

    const dot = document.createElement('span');
    dot.className = 'toggle-dot';
    dot.setAttribute('aria-hidden', 'true');

    item.append(thumb, label, dot);
    item.addEventListener('click', () => onToggle(skin.num));
    return item;
  }

  function renderSidebar(options) {
    const { list, toggleAllButton, selectedSummary, onToggle, onToggleAll, disabled } = options;
    const selectedCount = ns.state.activeSkins().length;
    const allSelected = ns.state.hasAllSkins();

    selectedSummary.textContent = `${selectedCount} selected`;
    toggleAllButton.textContent = allSelected ? 'Clear all' : 'Select all';
    toggleAllButton.disabled = disabled;
    toggleAllButton.onclick = onToggleAll;

    list.setAttribute('role', 'group');
    list.innerHTML = '';
    ns.SKINS.forEach(skin => {
      list.appendChild(createSkinButton(skin, ns.state.data.enabled.has(skin.num), disabled, onToggle));
    });
  }

  ns.sidebar = { renderSidebar };
})(window.Yaspin = window.Yaspin || {});