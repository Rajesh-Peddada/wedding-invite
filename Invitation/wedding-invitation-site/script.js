(() => {
  'use strict';
  const cfg = window.WEDDING || {};
  const byId = (id) => document.getElementById(id);
  const put = (id, value) => { if (byId(id) && typeof value === 'string') byId(id).textContent = value; };

  document.title = cfg.pageTitle || 'Wedding Invitation';
  put('familyLine', cfg.familyLine); put('hostLine', cfg.hostLine); put('introLine', cfg.introLine);
  put('brideName', cfg.brideName); put('groomName', cfg.groomName);
  put('groomParents', cfg.groomParents); put('groomGrandparents', cfg.groomGrandparents); put('brideParents', cfg.brideParents);
  put('eventDate', cfg.eventDate); put('eventTime', cfg.eventTime); put('regionLine', cfg.regionLine);
  put('fullDate', cfg.eventDate); put('fullTime', cfg.eventTime);
  put('venueName', cfg.venueName); put('venueAddress', cfg.venueAddress); put('footerLine', cfg.footerLine);
  put('footerNames', `${cfg.brideName || 'Bride Name'} & ${cfg.groomName || 'Groom Name'}`);

  const mapQuery = String(cfg.mapQuery || cfg.venueAddress || '').trim();
  const venueReady = mapQuery.length > 2 && !/goes here|city, india|wedding venue/i.test(mapQuery);
  const mapsUrl = venueReady ? (cfg.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`) : '#';
  byId('mapsLink').href = mapsUrl;
  byId('mapsLink').hidden = !venueReady;
  byId('venueMap').hidden = !venueReady;
  byId('mapPlaceholder').hidden = venueReady;
  if (venueReady) {
    const mapTarget = String(cfg.mapCoordinates || mapQuery).trim();
    const mapZoom = Number(cfg.mapZoom) || 17;
    byId('venueMap').src = `https://maps.google.com/maps?q=${encodeURIComponent(mapTarget)}&z=${mapZoom}&output=embed`;
  }

  const calendarLink = byId('calendarLink');
  if (cfg.calendarStart && (cfg.calendarEnd || /^\d{4}-\d{2}-\d{2}$/.test(cfg.calendarStart))) {
    const title = `${cfg.groomName || 'Groom'} & ${cfg.brideName || 'Bride'} — Wedding`;
    const isAllDay = /^\d{4}-\d{2}-\d{2}$/.test(cfg.calendarStart) && !cfg.calendarEnd;
    const compact = (value) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const nextDay = (value) => {
      const date = new Date(`${value}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + 1);
      return date.toISOString().slice(0, 10).replace(/-/g, '');
    };
    const dates = isAllDay
      ? `${cfg.calendarStart.replace(/-/g, '')}/${nextDay(cfg.calendarStart)}`
      : `${compact(cfg.calendarStart)}/${compact(cfg.calendarEnd)}`;
    const eventDetails = `${cfg.venueName || 'Wedding celebration'}${cfg.eventTime ? `\nCeremony time: ${cfg.eventTime}` : ''}`;
    calendarLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${encodeURIComponent(dates)}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(mapQuery)}`;
  } else {
    calendarLink.hidden = true;
  }

  // Music remains optional. Copy your own licensed MP3 to the filename configured in config.js.
  const audio = byId('weddingAudio');
  const musicControls = byId('musicControls');
  const musicButton = byId('musicToggle');
  const musicIcon = byId('musicIcon');
  if (cfg.audioFile) {
    audio.src = cfg.audioFile;
    musicControls.hidden = false;
    audio.addEventListener('error', () => { musicControls.hidden = true; });
    const updateMusicControl = () => {
      const isPlaying = !audio.paused;
      musicIcon.textContent = isPlaying ? 'Ⅱ' : '▶';
      musicButton.setAttribute('aria-label', isPlaying ? 'Pause ceremony music' : 'Play ceremony music');
      musicButton.setAttribute('title', isPlaying ? 'Pause ceremony music' : 'Play ceremony music');
      musicButton.setAttribute('aria-pressed', String(isPlaying));
    };
    let pausedByViewer = false;
    const tryAutoplay = () => {
      if (pausedByViewer || !audio.paused) return;
      audio.play().then(updateMusicControl).catch(updateMusicControl);
    };
    audio.addEventListener('play', updateMusicControl);
    audio.addEventListener('pause', updateMusicControl);
    musicButton.addEventListener('click', async () => {
      if (audio.paused) {
        pausedByViewer = false;
        try { await audio.play(); } catch (_) { /* Keep the play control available if playback fails. */ }
      } else {
        pausedByViewer = true;
        audio.pause();
      }
      updateMusicControl();
    });
    updateMusicControl();
    tryAutoplay();
    window.addEventListener('load', tryAutoplay, { once: true });
    window.addEventListener('pageshow', tryAutoplay);
    document.addEventListener('pointerdown', (event) => {
      if (!musicButton.contains(event.target)) tryAutoplay();
    }, { once: true, passive: true });
    document.addEventListener('keydown', tryAutoplay, { once: true });
  }

  const form = byId('rsvpForm');
  const formNote = byId('formNote');
  const thankYou = byId('thankYou');
  const nameInput = byId('guestName');
  nameInput.addEventListener('input', () => {
    if (!nameInput.value.trim()) return;
    nameInput.removeAttribute('aria-invalid');
    if (formNote.textContent === 'Please add your name before sending your reply.') formNote.textContent = '';
  });
  let selectedAnswer = 'yes';
  let isSubmitting = false;
  let lastSavedName = '';

  const answerButtons = [...form.querySelectorAll('[data-answer]')];
  answerButtons.forEach((button) => button.addEventListener('click', async (event) => {
    if (button.type === 'submit') {
      // Native submit handler captures the primary response below.
      selectedAnswer = button.dataset.answer;
      return;
    }
    selectedAnswer = button.dataset.answer;
    await submitRsvp(event);
  }));

  async function submitRsvp(event) {
    if (event) event.preventDefault();
    if (isSubmitting) return;
    const guestName = nameInput.value.trim();
    if (!guestName) {
      nameInput.setAttribute('aria-invalid', 'true');
      formNote.textContent = 'Please add your name before sending your reply.';
      nameInput.focus();
      return;
    }
    nameInput.removeAttribute('aria-invalid');
    isSubmitting = true;
    answerButtons.forEach((button) => { button.disabled = true; });
    const payload = {
      guestName,
      website: byId('website').value
    };
    lastSavedName = guestName;

    try {
      if (cfg.rsvpEndpoint && /^https:\/\//i.test(cfg.rsvpEndpoint)) {
        // text/plain avoids a CORS preflight. Apps Script's response is opaque to this static page,
        // so a successful fetch means the POST was handed off, not independently verified by the page.
        await fetch(cfg.rsvpEndpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
        showThankYou();
      } else {
        showThankYou();
      }
    } catch (_) {
      formNote.textContent = 'We could not send that reply just now. Please try again or contact the couple directly.';
    } finally {
      isSubmitting = false;
      answerButtons.forEach((button) => { button.disabled = false; });
    }
  }

  form.addEventListener('submit', (event) => {
    const submitter = event.submitter;
    selectedAnswer = (submitter && submitter.dataset && submitter.dataset.answer) || 'yes';
    submitRsvp(event);
  });
  // Decline has type=button, so the custom path calls submitRsvp directly.
  function showThankYou() {
    form.hidden = true;
    thankYou.hidden = false;
    // Restart line-drawing when a guest edits their response and submits again.
    thankYou.classList.remove('is-visible');
    void thankYou.offsetWidth;
    thankYou.classList.add('is-visible');
    put('thanksName', lastSavedName);
    // if (!isConfigured) {
    //   put('thanksCopy', `${selectedAnswer === 'yes' ? 'Preview only — ' : 'Preview only — '}this reply has not been saved yet. Add the RSVP endpoint in config.js to enable the private guest register.`);
    // }
  }
})();
