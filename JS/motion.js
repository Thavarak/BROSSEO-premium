
    const fadeEls = document.querySelectorAll('.fade-up');

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); /* animate only once */
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(el => revealObserver.observe(el));

    /* Immediately reveal anything already in the viewport at page load */
    document.addEventListener('DOMContentLoaded', () => {
      fadeEls.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight)
          el.classList.add('visible');
      });
    });

    let isAnnual = true;

    /* Price lookup table for each plan in both billing modes */
    const prices = {
      elite: { annual:'289', monthly:'59', annualOrig:'normally $589.00', monthlyOrig:'normally $79.00/mo' },
      pro:   { annual:'189', monthly:'39', annualOrig:'normally $389.00', monthlyOrig:'normally $49.00/mo' },
      plus:  { annual:'89',  monthly:'19', annualOrig:'normally $189.00', monthlyOrig:'normally $29.00/mo' },
      basic: { annual:'49',  monthly:'9',  annualOrig:'normally $89.00',  monthlyOrig:'normally $12.00/mo' },
    };

    function toggleBilling() {
      isAnnual = !isAnnual;
      /* Reflect on/off state visually on the toggle element */
      document.getElementById('billing-toggle').classList.toggle('on', isAnnual);
      /* Highlight active label */
      document.getElementById('lbl-annual').classList.toggle('active', isAnnual);
      document.getElementById('lbl-monthly').classList.toggle('active', !isAnnual);

      Object.keys(prices).forEach(plan => {
        const key  = isAnnual ? 'annual'    : 'monthly';
        const orig = isAnnual ? 'annualOrig' : 'monthlyOrig';
        document.getElementById(`${plan}-price`).textContent  = prices[plan][key];
        document.getElementById(`${plan}-orig`).textContent   = prices[plan][orig];
        document.getElementById(`${plan}-period`).textContent = isAnnual ? '.50\u00a0/ year' : '.00\u00a0/ mo';
        document.getElementById(`${plan}-save`).textContent   = isAnnual
          ? `$${prices[plan].annual}.50 savings*` : 'Billed monthly';
      });
    }

    /* ─────────────────────────────────────────────────
       3. FAQ ACCORDION
       Toggles .open on the parent .faq-item. Closes any
       other open item first (single-open accordion pattern).
    ───────────────────────────────────────────────── */
    function toggleFaq(questionEl) {
      const item = questionEl.closest('.faq-item');
      document.querySelectorAll('.faq-item.open').forEach(el => {
        if (el !== item) el.classList.remove('open');
      });
      item.classList.toggle('open');
    }

    /* ─────────────────────────────────────────────────
       4. PAYMENT METHOD TABS
       Marks the clicked tab active and shows the card
       input fields only when "Card" is selected.
    ───────────────────────────────────────────────── */
    function selectPayMethod(el) {
      document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('card-fields').style.display =
        el.textContent.includes('Card') ? 'block' : 'none';
    }

    /* ─────────────────────────────────────────────────
       5. INPUT FORMATTERS
       formatCard()  — inserts a space every 4 digits for readability
       formatExpiry() — injects the " / " separator between MM and YY
    ───────────────────────────────────────────────── */
    function formatCard(input) {
      let v = input.value.replace(/\D/g,'').substring(0,16);
      input.value = v.replace(/(.{4})/g,'$1 ').trim();
    }
    function formatExpiry(input) {
      let v = input.value.replace(/\D/g,'').substring(0,4);
      if (v.length >= 2) v = v.substring(0,2) + ' / ' + v.substring(2);
      input.value = v;
    }

    /* ─────────────────────────────────────────────────
       6. MODAL LIFECYCLE
       openModal()      — shows overlay and pre-fills plan data
       closeModal()     — hides overlay, restores body scroll
       handleOverlayClick() — dismisses modal on backdrop click
       goToStep(n)      — shows step n, hides all others
       processPayment() — validates card, shows spinner, resolves to success
    ───────────────────────────────────────────────── */
    let currentPlan = '';

    function openModal(planName, price, origPrice) {
      currentPlan = planName;

      /* Populate plan name and prices in both Step 1 and Step 2 summaries */
      document.getElementById('modal-plan-name').textContent   = planName;
      document.getElementById('modal-plan-name2').textContent  = planName;
      document.getElementById('modal-plan-orig').textContent   = origPrice;
      document.getElementById('modal-plan-price').textContent  = '$' + price;
      document.getElementById('modal-plan-price2').textContent = '$' + price;
      document.getElementById('pay-price-label').textContent   = '$' + price;

      goToStep(1); /* always start at step 1 */
      document.getElementById('modal-overlay').classList.add('open');
      document.body.style.overflow = 'hidden'; /* prevent background scroll while modal is open */
    }

    function closeModal() {
      document.getElementById('modal-overlay').classList.remove('open');
      document.body.style.overflow = ''; /* restore scrolling */
    }

    /* Dismiss modal when clicking the dark backdrop (not the modal box itself) */
    function handleOverlayClick(e) {
      if (e.target === document.getElementById('modal-overlay')) closeModal();
    }

    /* Show one step at a time by toggling .active class */
    function goToStep(n) {
      document.querySelectorAll('.modal-step').forEach((s, i) => {
        s.classList.toggle('active', i + 1 === n);
      });
    }

    function processPayment() {
      /* Minimal card validation — require at least 12 digits (demo only) */
      const cardVal = document.getElementById('f-card').value.replace(/\s/g,'');
      if (cardVal.length < 12) {
        alert('Please enter a valid card number to continue.');
        return;
      }
      goToStep(3); /* show spinner */

      /* Simulate 2-second server round-trip, then show success screen */
      setTimeout(() => {
        document.getElementById('success-plan').textContent = currentPlan;
        goToStep(4);
      }, 2000);
    }