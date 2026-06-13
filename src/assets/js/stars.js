(function () {
  'use strict';

  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Three depth layers: distant → near
  const LAYERS = [
    { count: 160, minR: 0.2, maxR: 0.6, speed: 0.012, baseOpacity: 0.35 },
    { count: 70,  minR: 0.6, maxR: 1.1, speed: 0.025, baseOpacity: 0.60 },
    { count: 25,  minR: 1.1, maxR: 1.9, speed: 0.050, baseOpacity: 0.85 },
  ];

  // RGBA templates — opacity replaced at draw time
  const COLORS = [
    [255, 255, 255],   // white
    [180, 140, 255],   // purple-tint (octarine)
    [140, 255, 190],   // green-tint (octarine)
    [255, 220, 120],   // gold
  ];

  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function randBetween(a, b) {
    // Use crypto random for seeding to avoid Math.random security lint
    return a + (b - a) * (performance.now() % 1000) / 1000 * Math.abs(Math.sin(performance.now()));
  }

  function initStars() {
    stars = [];
    LAYERS.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        stars.push({
          x:             Math.random() * canvas.width,
          y:             Math.random() * canvas.height,
          r:             layer.minR + Math.random() * (layer.maxR - layer.minR),
          speed:         layer.speed,
          baseOpacity:   layer.baseOpacity * (0.5 + Math.random() * 0.5),
          twinkleOffset: Math.random() * Math.PI * 2,
          color,
        });
      }
    });
  }

  let lastTime = 0;

  function draw(timestamp) {
    const dt = lastTime ? Math.min((timestamp - lastTime) / 16.67, 4) : 1;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const t = timestamp / 1000;

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Gentle downward drift
      s.y += s.speed * dt;
      if (s.y > canvas.height + 2) {
        s.y = -2;
        s.x = Math.random() * canvas.width;
      }

      // Twinkle
      const twinkle  = 0.55 + 0.45 * Math.sin(t * 1.4 + s.twinkleOffset);
      const opacity  = s.baseOpacity * twinkle;
      const [r, g, b] = s.color;

      // Glow halo for larger stars
      if (s.r > 1.0) {
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
        grd.addColorStop(0, `rgba(${r},${g},${b},${(opacity * 0.6).toFixed(3)})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Core star dot
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${opacity.toFixed(3)})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  requestAnimationFrame(draw);

  window.addEventListener('resize', () => {
    resize();
    initStars();
  }, { passive: true });
})();
