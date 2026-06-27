(function (ns) {
  const validNums = new Set(ns.SKINS.map(skin => skin.num));
  const allNums = () => ns.SKINS.map(skin => skin.num);

  function sanitizeEnabled(value, fallbackToAll = false) {
    if (!Array.isArray(value)) return fallbackToAll ? new Set(allNums()) : new Set();

    const clean = new Set();
    value.forEach(num => {
      if (Number.isInteger(num) && validNums.has(num)) clean.add(num);
    });
    return clean;
  }

  function loadEnabled() {
    try {
      const raw = localStorage.getItem(ns.CONFIG.LS_KEY);
      if (raw === null) return new Set(allNums());

      const enabled = sanitizeEnabled(JSON.parse(raw), true);
      saveEnabled(enabled);
      return enabled;
    } catch (_) {
      const enabled = new Set(allNums());
      saveEnabled(enabled);
      return enabled;
    }
  }

  function saveEnabled(enabledSet) {
    try {
      const enabled = sanitizeEnabled([...enabledSet]);
      localStorage.setItem(ns.CONFIG.LS_KEY, JSON.stringify([...enabled]));
    } catch (_) {}
  }

  const state = {
    enabled: loadEnabled(),
    isSpinning: false,
    resultVisible: false,
    currentRotation: 0,
    lastFocusedElement: null
  };

  function activeSkins() {
    return ns.SKINS.filter(skin => state.enabled.has(skin.num));
  }

  function setSkinEnabled(num, shouldEnable) {
    if (!validNums.has(num)) return;

    if (shouldEnable) state.enabled.add(num);
    else state.enabled.delete(num);
    saveEnabled(state.enabled);
  }

  function toggleSkin(num) {
    setSkinEnabled(num, !state.enabled.has(num));
  }

  function setAllEnabled(shouldEnable) {
    state.enabled = shouldEnable ? new Set(allNums()) : new Set();
    saveEnabled(state.enabled);
  }

  function hasAllSkins() {
    return activeSkins().length === ns.SKINS.length;
  }

  ns.state = {
    data: state,
    activeSkins,
    toggleSkin,
    setAllEnabled,
    hasAllSkins,
    saveEnabled
  };
})(window.Yaspin = window.Yaspin || {});