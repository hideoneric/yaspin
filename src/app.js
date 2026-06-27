(function (ns) {
  const elements = {
    app: document.getElementById('app'),
    wheelSvg: document.getElementById('wheel-svg'),
    spinButton: document.getElementById('spin-btn'),
    noSkinsMessage: document.getElementById('no-skins-msg'),
    skinList: document.getElementById('skin-list'),
    toggleAllButton: document.getElementById('toggle-all-btn'),
    selectedSummary: document.getElementById('selected-summary'),
    resultDialog: document.getElementById('result-card'),
    resultName: document.getElementById('result-skin-name'),
    resultImage: document.getElementById('result-splash'),
    spinAgainButton: document.getElementById('spin-again-btn'),
    closeResultButton: document.getElementById('close-result-btn')
  };

  function controlsLocked() {
    return ns.state.data.isSpinning || ns.state.data.resultVisible;
  }

  function renderApp() {
    const activeSkins = ns.state.activeSkins();
    const hasSkins = activeSkins.length > 0;

    ns.sidebar.renderSidebar({
      list: elements.skinList,
      toggleAllButton: elements.toggleAllButton,
      selectedSummary: elements.selectedSummary,
      disabled: controlsLocked(),
      onToggle: num => {
        if (controlsLocked()) return;
        ns.state.toggleSkin(num);
        renderApp();
      },
      onToggleAll: () => {
        if (controlsLocked()) return;
        ns.state.setAllEnabled(!ns.state.hasAllSkins());
        renderApp();
      }
    });

    if (!ns.state.data.isSpinning) {
      ns.wheel.renderWheel(elements.wheelSvg, activeSkins);
    }

    elements.spinButton.disabled = controlsLocked() || !hasSkins;
    elements.noSkinsMessage.textContent = hasSkins ? '' : 'Select at least one skin';
  }

  function spin() {
    if (controlsLocked()) return;

    const spinSkins = ns.state.activeSkins();
    if (spinSkins.length === 0) {
      renderApp();
      return;
    }

    ns.state.data.isSpinning = true;
    renderApp();

    const winnerIndex = Math.floor(Math.random() * spinSkins.length);
    const winner = spinSkins[winnerIndex];

    ns.wheel.spinToWinner(
      elements.wheelSvg,
      winnerIndex,
      spinSkins.length,
      ns.state.data.currentRotation,
      targetRotation => {
        ns.state.data.currentRotation = targetRotation;
        ns.state.data.isSpinning = false;
        ns.state.data.resultVisible = true;
        renderApp();
        ns.result.showResult({
          dialog: elements.resultDialog,
          name: elements.resultName,
          image: elements.resultImage,
          spinAgainButton: elements.spinAgainButton,
          closeButton: elements.closeResultButton,
          skin: winner,
          onSpinAgain: () => {
            renderApp();
            window.requestAnimationFrame(spin);
          },
          onClose: renderApp
        });
      }
    );
  }

  elements.spinButton.addEventListener('click', spin);

  renderApp();
})(window.Yaspin = window.Yaspin || {});
