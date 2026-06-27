(function (ns) {
  const DDR = 'https://ddragon.leagueoflegends.com/cdn/img/champion';

  const SKINS = [
    { num: 0, name: 'Default Yasuo' },
    { num: 1, name: 'High Noon Yasuo' },
    { num: 2, name: 'PROJECT: Yasuo' },
    { num: 3, name: 'Blood Moon Yasuo' },
    { num: 9, name: 'Nightbringer Yasuo' },
    { num: 10, name: 'Odyssey Yasuo' },
    { num: 17, name: 'Battle Boss Yasuo' },
    { num: 18, name: 'True Damage Yasuo' },
    { num: 35, name: 'Prestige True Damage Yasuo' },
    { num: 36, name: 'Spirit Blossom Yasuo' },
    { num: 45, name: 'Sea Dog Yasuo' },
    { num: 54, name: 'Truth Dragon Yasuo' },
    { num: 55, name: 'Dream Dragon Yasuo' },
    { num: 56, name: 'Inkshadow Yasuo' },
    { num: 57, name: 'Prestige Inkshadow Yasuo' },
    { num: 68, name: 'Foreseen Yasuo' },
    { num: 77, name: 'Battle Wolf Yasuo' },
    { num: 87, name: 'Genesis Nightbringer Yasuo' }
  ];

  ns.CONFIG = {
    LS_KEY: 'yaspin_enabled_skins',
    WHEEL: {
      cx: 180,
      cy: 180,
      radius: 160,
      innerRadius: 34
    },
    SPIN: {
      durationMs: 4000,
      minTurns: 5,
      randomTurns: 3
    },
    COLORS: {
      segments: ['#16323a', '#111a22', '#2b2f2e', '#1f2630'],
      stroke: '#55d7cf',
      strokeSoft: 'rgba(85, 215, 207, 0.35)',
      gold: '#d6b15f',
      text: '#f3f7f4',
      center: '#071014'
    }
  };

  ns.SKINS = SKINS;
  ns.thumbUrl = num => `${DDR}/loading/Yasuo_${num}.jpg`;
  ns.splashUrl = num => `${DDR}/splash/Yasuo_${num}.jpg`;
})(window.Yaspin = window.Yaspin || {});
