/* ModelLab motion layer (Charles Liu's UX & animation rules).
   Everything here is progressive: no motion API = no animation, and prefers-reduced-motion turns it all off.
   Timing tokens (keep in sync with the CSS at the bottom of style.css):
     press 150ms · popover 200ms · move 300ms · page/shared element 350ms · rare moment ≤500ms per move */
(function () {
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = function () { return RM.matches; };
  var view = document.getElementById('view') || document.querySelector('main') || document.body;
  function once(key) { try { if (sessionStorage.getItem(key)) return false; sessionStorage.setItem(key, '1'); return true; } catch (e) { return true; } }

  /* 2 · Tier list / quiz result -> model page: the tapped card grows into the model's avatar (View Transitions). */
  document.addEventListener('click', function (e) {
    if (reduced() || !document.startViewTransition || !window.ML || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target.closest && e.target.closest('a.tcard, a.tl-hit, a.lib-new');
    if (!a) return;
    var m = (new URL(a.href, location.href).pathname.match(/\/models\/([^\/]+)\/?$/) || [])[1];
    if (!m || !ML.byId[m]) return;
    e.preventDefault(); e.stopImmediatePropagation();
    a.style.viewTransitionName = 'ml-hero';
    var t = document.startViewTransition(function () {
      a.style.viewTransitionName = '';
      ML.go('#m-' + m);
      var av = document.querySelector('.mp-head .av');
      if (av) av.style.viewTransitionName = 'ml-hero';
    });
    t.finished.finally(function () { var av = document.querySelector('.mp-head .av'); if (av) av.style.viewTransitionName = ''; });
  }, true);

  /* 7 · Add to compare: the button confirms with a small bump and a drawn check (no destination on screen, so no arc). */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.igp-btn[data-cmp]');
    if (!b) return;
    var id = b.getAttribute('data-cmp'), adding = b.getAttribute('aria-pressed') !== 'true';
    requestAnimationFrame(function () {
      var nb = document.querySelector('.igp-btn[data-cmp="' + id + '"]');
      if (nb && adding && !reduced()) { nb.classList.remove('mo-bump'); void nb.offsetWidth; nb.classList.add('mo-bump'); }
    });
  });

  /* 6 · Numbers that roll: crash-history figures count up the first time they scroll into view. */
  var NUM = /([−\-+]?)(\d+(?:\.\d+)?)%/g;
  function rollIn(el) {
    if (el.dataset.rolled) return; el.dataset.rolled = '1';
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) if (NUM.test(n.nodeValue)) nodes.push(n), NUM.lastIndex = 0;
    nodes.forEach(function (node) {
      var parts = node.nodeValue.split(NUM), frag = document.createDocumentFragment();
      for (var i = 0; i < parts.length; i++) {
        if (i % 3 === 0) { if (parts[i]) frag.appendChild(document.createTextNode(parts[i])); continue; }
        var sign = parts[i], val = parts[i + 1]; i++;
        var s = document.createElement('span'); s.className = 'mo-num'; s.dataset.to = val; s.dataset.dp = (val.split('.')[1] || '').length;
        s.textContent = sign + (0).toFixed(s.dataset.dp) + '%'; s.dataset.sign = sign; frag.appendChild(s);
      }
      node.parentNode.replaceChild(frag, node);
    });
    var spans = el.querySelectorAll('.mo-num'), t0 = performance.now(), D = 700;
    (function tick(now) {
      var p = Math.min(1, (now - t0) / D), k = 1 - Math.pow(1 - p, 3);   // ease-out: most of the change up front
      spans.forEach(function (s) { s.textContent = s.dataset.sign + (Number(s.dataset.to) * k).toFixed(Number(s.dataset.dp)) + '%'; });
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (x) { if (x.isIntersecting) { io.unobserve(x.target); rollIn(x.target); } });
  }, { threshold: 0.35 }) : null;

  /* 5 · spent typing dots leave the chat entirely, so they don't hold a gap */
  document.addEventListener('animationend', function (e) { if (e.target.classList && e.target.classList.contains('bd-dots') && e.animationName === 'mo-dots-life') e.target.remove(); });

  /* After every render: wire up the effects that depend on what's on screen. */
  function afterRender() {
    if (reduced()) return;
    // 6 · rolling numbers
    if (io) document.querySelectorAll('.panel.post.cm .cm-r').forEach(function (el) {
      if (!el.dataset.rolled && !el.closest('.mo-num') && /\d%/.test(el.textContent)) io.observe(el);
    });
    // 1 · quiz result reveal: rare moment, plays once per result
    var res = document.querySelector('.tl-res:not(.mo-seen)');
    if (res) {
      res.classList.add('mo-seen');
      var key = 'mo-quiz-' + [].map.call(res.querySelectorAll('.tl-hit b'), function (b) { return b.textContent; }).join('|');
      if (once(key)) res.classList.add('mo-reveal');
    }
    // 8 · new-drop pill shimmers once per drop
    var pill = document.querySelector('.lib-new:not(.mo-seen)');
    if (pill) {
      pill.classList.add('mo-seen'); var k = 'mo-drop-' + (pill.textContent || '');
      try {
        var seen = Number(localStorage.getItem(k) || 0);
        // first view of this drop (or a re-render within 2s of it, so the shimmer survives the data refresh)
        if (!seen || Date.now() - seen < 2000) { if (!seen) localStorage.setItem(k, String(Date.now())); pill.classList.add('mo-shine'); }
      } catch (e) {}
    }
  }
  var pending = false;
  new MutationObserver(function () { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; afterRender(); }); })
    .observe(document.body, { childList: true, subtree: true });
  afterRender();
})();
