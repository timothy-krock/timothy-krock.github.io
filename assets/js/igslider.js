(function initIGSliders(){
  const sliders = document.querySelectorAll('.igslider');
  sliders.forEach(slider => {
    const track = slider.querySelector('.track');
    const slides = [...slider.querySelectorAll('.slide')];
    const prevBtn = slider.querySelector('.prev');
    const nextBtn = slider.querySelector('.next');
    const dots    = [...slider.querySelectorAll('.dots > li')];
    if (!track || !slides.length) return;

    const slideW = () => track.clientWidth;
    const maxIdx = slides.length - 1;
    let idx = 0, raf = null, scrolling = false;

    function disableSnap(){ track.style.scrollSnapType = track.style.webkitScrollSnapType = 'none'; }
    function enableSnap(){ track.style.scrollSnapType = track.style.webkitScrollSnapType = 'x mandatory'; }

    function goTo(px){
      if (scrolling) { requestAnimationFrame(() => goTo(px)); return; }
      disableSnap();
      track.scrollLeft = px;
      try { track.scrollTo({ left: px, behavior: 'auto' }); } catch(e) {}
      requestAnimationFrame(enableSnap);
    }

    function setIndex(newIdx) {
      idx = Math.max(0, Math.min(maxIdx, newIdx));
      goTo(idx * slideW());
      prevBtn && (prevBtn.hidden = (idx === 0));
      nextBtn && (nextBtn.hidden = (idx === maxIdx));
      dots.forEach((d,i) => {
        d.setAttribute('aria-selected', i===idx ? 'true' : 'false');
        d.tabIndex = i===idx ? 0 : -1;
      });
    }

    // --------- DEDUPED TAP HANDLER (prevents +1 happening twice) ---------
    function bindTapOnce(el, handler){
      if (!el) return;
      let last = 0;
      const fire = (e) => {
        e.preventDefault(); e.stopPropagation();
        const now = Date.now();
        if (now - last < 250) return;   // ignore duplicate within 250ms
        last = now;
        handler();
      };
      // Support pointer events if available (covers mouse & touch); plus fallback click
      el.addEventListener('pointerup', fire, { passive:false });
      el.addEventListener('touchend',  fire, { passive:false });
      el.addEventListener('click',     fire, { passive:false });
    }

    bindTapOnce(prevBtn, () => setIndex(idx - 1));
    bindTapOnce(nextBtn, () => setIndex(idx + 1));

    dots.forEach((dot,i) => {
      bindTapOnce(dot, () => setIndex(i));
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIndex(i); }
      });
    });

    // Keep dots in sync when user swipes
    track.addEventListener('scroll', () => {
      scrolling = true;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / slideW());
        if (i !== idx) {
          idx = i;
          prevBtn && (prevBtn.hidden = (idx === 0));
          nextBtn && (nextBtn.hidden = (idx === maxIdx));
          dots.forEach((d,j) => {
            d.setAttribute('aria-selected', j===idx ? 'true' : 'false');
            d.tabIndex = j===idx ? 0 : -1;
          });
        }
        scrolling = false;
      });
    }, { passive:true });

    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); setIndex(idx + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); setIndex(idx - 1); }
    });

    addEventListener('resize', () => setIndex(idx));
    addEventListener('orientationchange', () => setIndex(idx));
    setIndex(0);
  });
})();
