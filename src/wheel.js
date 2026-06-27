(function (ns) {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svgEl(name, attrs) {
    const element = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(key => element.setAttribute(key, attrs[key]));
    return element;
  }

  function point(cx, cy, radius, angle) {
    const radians = angle * Math.PI / 180;
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians)
    };
  }

  function cleanLabel(name, total) {
    const label = name.replace(' Yasuo', '').replace(': Yasuo', '').replace('Yasuo', '').replace(':', '').trim();
    const maxChars = total > 12 ? 10 : total > 8 ? 14 : 18;
    return label.length > maxChars ? `${label.slice(0, maxChars - 1)}...` : label;
  }

  function drawRing(svg, cfg) {
    svg.appendChild(svgEl('circle', {
      cx: cfg.cx,
      cy: cfg.cy,
      r: cfg.radius + 6,
      fill: 'none',
      stroke: ns.CONFIG.COLORS.gold,
      'stroke-width': '3'
    }));
    svg.appendChild(svgEl('circle', {
      cx: cfg.cx,
      cy: cfg.cy,
      r: cfg.radius + 13,
      fill: 'none',
      stroke: ns.CONFIG.COLORS.strokeSoft,
      'stroke-width': '2',
      'stroke-dasharray': '3 10'
    }));
  }

  function drawCenter(svg, cfg) {
    svg.appendChild(svgEl('circle', {
      cx: cfg.cx,
      cy: cfg.cy,
      r: cfg.innerRadius,
      fill: ns.CONFIG.COLORS.center,
      stroke: ns.CONFIG.COLORS.gold,
      'stroke-width': '3'
    }));

    const text = svgEl('text', {
      x: cfg.cx,
      y: cfg.cy,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: ns.CONFIG.COLORS.text,
      'font-size': '11',
      'font-weight': '800'
    });
    text.textContent = 'YASUO';
    svg.appendChild(text);
  }

  function drawEmpty(svg, cfg) {
    svg.appendChild(svgEl('circle', {
      cx: cfg.cx,
      cy: cfg.cy,
      r: cfg.radius,
      fill: '#111a22',
      stroke: ns.CONFIG.COLORS.strokeSoft,
      'stroke-width': '2'
    }));
  }

  function drawSegment(svg, skin, index, total, cfg) {
    const segAngle = 360 / total;
    const startAngle = index * segAngle - 90;
    const endAngle = startAngle + segAngle;
    const start = point(cfg.cx, cfg.cy, cfg.radius, startAngle);
    const end = point(cfg.cx, cfg.cy, cfg.radius, endAngle);
    const largeArc = segAngle > 180 ? 1 : 0;
    const fill = ns.CONFIG.COLORS.segments[index % ns.CONFIG.COLORS.segments.length];

    const path = svgEl('path', {
      fill,
      stroke: ns.CONFIG.COLORS.stroke,
      'stroke-width': '1.2'
    });

    if (total === 1) {
      path.setAttribute('d', `M ${cfg.cx} ${cfg.cy - cfg.radius} A ${cfg.radius} ${cfg.radius} 0 1 1 ${cfg.cx - 0.01} ${cfg.cy - cfg.radius} Z`);
    } else {
      path.setAttribute('d', `M ${cfg.cx} ${cfg.cy} L ${start.x} ${start.y} A ${cfg.radius} ${cfg.radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`);
    }
    svg.appendChild(path);

    const midAngle = startAngle + segAngle / 2;
    const labelPoint = point(cfg.cx, cfg.cy, cfg.radius * 0.63, midAngle);
    let rotateDeg = midAngle + 90;
    const normalized = ((rotateDeg % 360) + 360) % 360;
    if (normalized > 90 && normalized < 270) rotateDeg += 180;

    const text = svgEl('text', {
      x: labelPoint.x,
      y: labelPoint.y,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: ns.CONFIG.COLORS.text,
      'font-size': total > 8 ? '8.5' : '10',
      'font-weight': '700',
      transform: `rotate(${rotateDeg}, ${labelPoint.x}, ${labelPoint.y})`
    });
    text.textContent = cleanLabel(skin.name, total);
    svg.appendChild(text);
  }

  function renderWheel(svg, activeSkins) {
    const cfg = ns.CONFIG.WHEEL;
    svg.innerHTML = '';

    if (activeSkins.length === 0) {
      drawEmpty(svg, cfg);
    } else {
      activeSkins.forEach((skin, index) => drawSegment(svg, skin, index, activeSkins.length, cfg));
    }

    drawRing(svg, cfg);
    drawCenter(svg, cfg);
  }

  function targetRotationForWinner(winnerIndex, total, currentRotation) {
    const segAngle = 360 / total;
    const winnerMidAngle = winnerIndex * segAngle + segAngle / 2;
    const turns = ns.CONFIG.SPIN.minTurns + Math.floor(Math.random() * ns.CONFIG.SPIN.randomTurns);
    const currentMod = currentRotation % 360;
    const degreesToWinner = ((360 - winnerMidAngle - currentMod) + 360) % 360;
    return currentRotation + turns * 360 + degreesToWinner;
  }

  function spinToWinner(svg, winnerIndex, total, currentRotation, onDone) {
    const targetRotation = targetRotationForWinner(winnerIndex, total, currentRotation);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let settled = false;
    let fallbackTimer = 0;

    function finish() {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallbackTimer);
      svg.removeEventListener('transitionend', handleTransitionEnd);
      onDone(targetRotation);
    }

    function handleTransitionEnd(event) {
      if (event.target === svg && event.propertyName === 'transform') finish();
    }

    svg.style.transition = reduceMotion ? 'none' : `transform ${ns.CONFIG.SPIN.durationMs}ms cubic-bezier(0.17, 0.67, 0.12, 1)`;
    svg.style.transform = `rotate(${targetRotation}deg)`;

    if (reduceMotion) {
      window.requestAnimationFrame(finish);
      return;
    }

    svg.addEventListener('transitionend', handleTransitionEnd);
    fallbackTimer = window.setTimeout(finish, ns.CONFIG.SPIN.durationMs + 350);
  }

  ns.wheel = {
    renderWheel,
    spinToWinner
  };
})(window.Yaspin = window.Yaspin || {});