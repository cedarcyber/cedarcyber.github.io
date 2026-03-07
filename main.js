// On page load/refresh, always start at the top and strip any hash from the URL
      history.scrollRestoration = "manual";
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      document.getElementById("year").textContent = new Date().getFullYear();

      // Sticky nav active-section highlighting
      (function () {
        var navLinks = document.querySelectorAll(".nav-link[data-section]");
        var sections = document.querySelectorAll("section[id]");

        var navObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                var id = entry.target.id;
                navLinks.forEach(function (link) {
                  link.classList.toggle("nav-active", link.dataset.section === id);
                });
              }
            });
          },
          { rootMargin: "-10% 0px -65% 0px" }
        );

        sections.forEach(function (section) {
          navObserver.observe(section);
        });
      })();

      // Scroll fade-up animations
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
      );

      document.querySelectorAll(".card").forEach((el) => {
        el.classList.add("fade-up");
        observer.observe(el);
      });

      // Custom tooltips for logo tiles
      (function () {
        var tip = document.createElement("div");
        tip.id = "logo-tooltip";
        document.body.appendChild(tip);

        function esc(s) {
          return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        }

        var pinned = null;

        function position(tile) {
          var rect = tile.getBoundingClientRect();
          var tw = tip.offsetWidth;
          var th = tip.offsetHeight;
          var left = rect.left + (rect.width - tw) / 2;
          var top = rect.top - th - 12;
          var above = true;
          if (top < 8) { top = rect.bottom + 12; above = false; }
          if (left < 8) left = 8;
          if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8;
          tip.style.left = left + "px";
          tip.style.top = top + "px";
          tip.dataset.dir = above ? "up" : "down";
        }

        function show(tile) {
          var name = tile.dataset.name || "";
          var quote = tile.dataset.quote || "";
          tip.innerHTML =
            '<strong class="tip-name">' + esc(name) + "</strong>" +
            (quote ? '<em class="tip-quote">\u201c' + esc(quote) + "\u201d</em>" : "");
          tip.style.visibility = "hidden";
          tip.classList.add("tip-visible");
          position(tile);
          tip.style.visibility = "";
        }

        function hide() {
          tip.classList.remove("tip-visible");
          pinned = null;
        }

        document.querySelectorAll(".logo-tile[data-quote]").forEach(function (tile) {
          tile.style.cursor = "pointer";

          tile.addEventListener("mouseenter", function () {
            if (!pinned) show(tile);
          });

          tile.addEventListener("mouseleave", function () {
            if (pinned !== tile) {
              tip.classList.remove("tip-visible");
            }
          });

          tile.addEventListener("click", function (e) {
            e.stopPropagation();
            if (pinned === tile) {
              hide();
            } else {
              pinned = tile;
              show(tile);
            }
          });
        });

        document.addEventListener("click", function () {
          if (pinned) hide();
        });
      })();

      // Magic wizard star effect
      (function () {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:200;';
        document.body.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        var W, H;

        function resize() {
          W = canvas.width = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        var COLORS = ['#ffffff', '#a5c8ff', '#8b5cf6', '#c084fc', '#fbbf24', '#7dd3fc'];
        var NUM_STARS = 38;

        // Floating background stars
        var stars = [];
        for (var i = 0; i < NUM_STARS; i++) {
          stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.4 + 0.3,
            op: Math.random(),
            opDir: Math.random() > 0.5 ? 1 : -1,
            opSpeed: Math.random() * 0.007 + 0.002,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
          });
        }

        // Sparkle shapes (4-pointed stars)
        var sparkles = [];
        var lastSparkle = 0;

        function addSparkle() {
          sparkles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            size: Math.random() * 3 + 1.5,
            op: 1,
            life: 0,
            maxLife: Math.random() * 80 + 50,
            rot: Math.random() * Math.PI,
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
          });
        }

        function drawStar4(x, y, size, rot) {
          ctx.beginPath();
          for (var k = 0; k < 8; k++) {
            var angle = rot + (k * Math.PI / 4);
            var r = k % 2 === 0 ? size : size * 0.35;
            var px = x + Math.cos(angle) * r;
            var py = y + Math.sin(angle) * r;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        }

        // Wand-sweep trails
        var trails = [];
        var lastTrail = 0;

        function addTrail() {
          var startX = Math.random() * W;
          var startY = Math.random() * H;
          var endX = startX + (Math.random() - 0.5) * W * 0.55;
          var endY = startY + (Math.random() - 0.5) * H * 0.4;
          var ctrlX = (startX + endX) / 2 + (Math.random() - 0.5) * W * 0.25;
          var ctrlY = (startY + endY) / 2 + (Math.random() - 0.5) * H * 0.4;
          var color = COLORS[Math.floor(Math.random() * COLORS.length)];
          var steps = Math.floor(Math.random() * 18) + 14;
          var points = [];
          for (var step = 0; step <= steps; step++) {
            var t = step / steps;
            var bx = (1-t)*(1-t)*startX + 2*(1-t)*t*ctrlX + t*t*endX;
            var by = (1-t)*(1-t)*startY + 2*(1-t)*t*ctrlY + t*t*endY;
            points.push({
              x: bx + (Math.random()-0.5)*8,
              y: by + (Math.random()-0.5)*8,
              size: Math.random() * 2.25 + 1,
              op: 0,
              maxOp: Math.random() * 0.375 + 0.125,
              life: 0,
              delay: Math.floor(t * steps * 3),
              maxLife: Math.random() * 55 + 45,
              rot: Math.random() * Math.PI,
              color: color
            });
          }
          trails.push(points);
        }

        function animate(time) {
          ctx.clearRect(0, 0, W, H);

          // Background stars
          for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            s.op += s.opDir * s.opSpeed;
            if (s.op >= 1) { s.op = 1; s.opDir = -1; }
            if (s.op <= 0) { s.op = 0; s.opDir = 1; }
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < -5) s.x = W + 5;
            if (s.x > W + 5) s.x = -5;
            if (s.y < -5) s.y = H + 5;
            if (s.y > H + 5) s.y = -5;
            ctx.globalAlpha = s.op * 0.325;
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
          }

          // Sparkles
          if (time - lastSparkle > 520) {
            addSparkle();
            if (Math.random() < 0.175) addSparkle();
            lastSparkle = time;
          }
          for (var i = sparkles.length - 1; i >= 0; i--) {
            var sp = sparkles[i];
            sp.life++;
            sp.op = 1 - sp.life / sp.maxLife;
            if (sp.op <= 0) { sparkles.splice(i, 1); continue; }
            sp.rot += 0.025;
            var currentSize = sp.size * (0.4 + sp.op * 0.6);
            // Soft glow
            var grd = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, currentSize * 2);
            grd.addColorStop(0, sp.color);
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalAlpha = sp.op * 0.175;
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, currentSize * 2, 0, Math.PI * 2);
            ctx.fill();
            // Star shape
            ctx.globalAlpha = sp.op * 0.5;
            ctx.fillStyle = sp.color;
            drawStar4(sp.x, sp.y, currentSize, sp.rot);
          }

          // Wand trails
          if (time - lastTrail > 4500) {
            addTrail();
            lastTrail = time;
          }
          for (var t = trails.length - 1; t >= 0; t--) {
            var trail = trails[t];
            var allDead = true;
            for (var p = 0; p < trail.length; p++) {
              var pt = trail[p];
              pt.life++;
              if (pt.life < pt.delay) { allDead = false; continue; }
              var adj = pt.life - pt.delay;
              pt.op = adj < 12
                ? (adj / 12) * pt.maxOp
                : pt.maxOp * (1 - (adj - 12) / pt.maxLife);
              if (pt.op > 0) {
                allDead = false;
                pt.rot += 0.03;
                ctx.globalAlpha = pt.op;
                ctx.fillStyle = pt.color;
                drawStar4(pt.x, pt.y, pt.size, pt.rot);
              }
            }
            if (allDead) trails.splice(t, 1);
          }

          ctx.globalAlpha = 1;
          requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
      })();
