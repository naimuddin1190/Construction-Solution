/* =========================================================
   Construction Calculator — script.js
   Single-page app: routing, navigation, search,
   calculators (Roof, Column, Wall, Plaster, Steel), forms.
   ========================================================= */
(() => {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const SITE = 'Construction Calculator';

    const PAGES = [
        { id: 'home',    name: 'Home',         bn: 'হোম',             icon: 'fa-house' },
        { id: 'roof',    name: 'Roof Molding', bn: 'ছাদ ঢালাই',       icon: 'fa-layer-group',       keys: 'roof slab casting dhalai chad' },
        { id: 'column',  name: 'Column Works', bn: 'কলামের কাজ',       icon: 'fa-building-columns',  keys: 'column pillar kolam' },
        { id: 'wall',    name: 'Wall B-C-S',   bn: 'দেওয়াল গাঁথুনি',   icon: 'fa-trowel-bricks',     keys: 'wall brick cement sand bcs dewal it' },
        { id: 'plaster', name: 'Plaster',      bn: 'প্লাস্টার',         icon: 'fa-paint-roller',      keys: 'plaster' },
        { id: 'steel',   name: 'Roof Steel',   bn: 'ছাদের রড',         icon: 'fa-grip-lines',        keys: 'rod steel rebar' },
        { id: 'tiles',   name: 'Tiles',        bn: 'টাইলস',            icon: 'fa-table-cells-large', keys: 'tiles floor' },
        { id: 'about',   name: 'About',        bn: 'আমাদের সম্পর্কে',  icon: 'fa-circle-info',       keys: 'developer' },
        { id: 'contact', name: 'Contact',      bn: 'যোগাযোগ',          icon: 'fa-envelope',          keys: 'review email phone' },
    ];
    const CALC_PAGES = ['roof', 'column', 'wall', 'plaster', 'steel', 'tiles'];

    /* ---------- Formatting helpers ---------- */
    const formatters = {};
    const fmt = (n, d = 2) => {
        if (!formatters[d]) {
            formatters[d] = new Intl.NumberFormat('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
        }
        return formatters[d].format(n);
    };
    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    // Result item builders
    const row = (label, value, unit = '', key = false) => ({ type: 'row', label, value, unit, key });
    const heading = (text) => ({ type: 'title', text });
    const total = (label, value, unit = '') => ({ type: 'total', label, value, unit });

    /* ---------- Toast ---------- */
    let toastTimer;
    function toast(message) {
        const el = $('#toast');
        $('#toast-text').textContent = message;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
    }

    /* =========================================================
       Navigation & routing
       ========================================================= */
    const nav = $('#nav');
    const burger = $('#burger');
    const dropdown = $('#calc-dropdown');
    const dropdownToggle = $('.dropdown-toggle', dropdown);

    function setMenu(open) {
        nav.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    }
    function setDropdown(open) {
        dropdown.classList.toggle('open', open);
        dropdownToggle.setAttribute('aria-expanded', String(open));
    }

    burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setDropdown(!dropdown.classList.contains('open'));
    });
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) setDropdown(false);
        if (!$('#search-wrap').contains(e.target)) hideSearch();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { setDropdown(false); setMenu(false); hideSearch(); }
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && nav.classList.contains('open')) setMenu(false);
    });

    function route() {
        let id = decodeURIComponent(location.hash.replace(/^#/, '')) || 'home';
        if (!PAGES.some((p) => p.id === id)) id = 'home';

        $$('.page').forEach((s) => s.classList.toggle('active', s.id === 'page-' + id));
        $$('[data-link]').forEach((a) => {
            const active = a.dataset.link === id;
            a.classList.toggle('active', active);
            if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
        dropdownToggle.classList.toggle('active', CALC_PAGES.includes(id));

        const page = PAGES.find((p) => p.id === id);
        document.title = id === 'home' ? `${SITE} | নির্মাণ হিসাব` : `${page.name} | ${SITE}`;

        setMenu(false);
        setDropdown(false);
        hideSearch();
        window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', route);

    /* =========================================================
       Search (home page)
       ========================================================= */
    const searchInput = $('#search');
    const searchResults = $('#search-results');

    function findPages(q) {
        q = q.trim().toLowerCase();
        if (!q) return [];
        return PAGES.filter((p) => p.id !== 'home' &&
            `${p.name} ${p.bn} ${p.keys || ''}`.toLowerCase().includes(q));
    }
    function hideSearch() {
        searchResults.classList.remove('show');
    }
    function runSearch() {
        const q = searchInput.value.trim();
        if (!q) { searchResults.innerHTML = ''; hideSearch(); return; }
        const hits = findPages(q);
        searchResults.innerHTML = hits.length
            ? hits.map((p) => `
                <a href="#${p.id}" role="option">
                    <span class="menu-icon"><i class="fa-solid ${p.icon}"></i></span>
                    <span><strong>${p.name}</strong><small>${p.bn}</small></span>
                </a>`).join('')
            : `<div class="search-empty">কিছু পাওয়া যায়নি — “${escapeHtml(q)}”</div>`;
        searchResults.classList.add('show');
    }
    function goToFirstResult() {
        const hits = findPages(searchInput.value);
        if (hits.length) {
            location.hash = hits[0].id;
            searchInput.value = '';
        } else {
            runSearch();
        }
    }
    searchInput.addEventListener('input', runSearch);
    searchInput.addEventListener('focus', () => { if (searchInput.value.trim()) runSearch(); });
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); goToFirstResult(); }
        if (e.key === 'ArrowDown') { const first = $('a', searchResults); if (first) { e.preventDefault(); first.focus(); } }
    });
    $('#search-btn').addEventListener('click', goToFirstResult);
    searchResults.addEventListener('click', (e) => {
        if (e.target.closest('a')) { searchInput.value = ''; hideSearch(); }
    });

    /* =========================================================
       Calculator form handling
       ========================================================= */
    function setError(input, msg) {
        const field = input.closest('.field');
        if (!field) return;
        field.classList.toggle('invalid', !!msg);
        const err = $('.field-error', field);
        if (err) err.textContent = msg || '';
    }

    // Reads & validates all number inputs. Returns values object or null.
    function readForm(form) {
        let ok = true;
        const v = {};
        $$('input[type="number"]', form).forEach((inp) => {
            const raw = inp.value.trim();
            const n = Number(raw);
            let msg = '';
            if (raw === '') msg = 'এই ঘরটি পূরণ করুন';
            else if (!Number.isFinite(n)) msg = 'সঠিক সংখ্যা দিন';
            else if (n < 0) msg = 'ঋণাত্মক মান গ্রহণযোগ্য নয়';
            else if (inp.hasAttribute('data-positive') && n <= 0) msg = 'মান ০ এর বেশি হতে হবে';
            setError(inp, msg);
            if (msg) ok = false;
            v[inp.name] = n;
        });
        $$('input[type="radio"]:checked', form).forEach((r) => { v[r.name] = r.value; });
        return ok ? v : null;
    }

    // Total mixing ratio must be > 0 (prevents division by zero)
    function ratioSum(form, names, v) {
        const sum = names.reduce((s, n) => s + v[n], 0);
        if (sum <= 0) {
            names.forEach((n) => setError(form.elements[n], 'রেশিওর যোগফল ০ এর বেশি হতে হবে'));
            return null;
        }
        return sum;
    }

    const ratioText = (...r) => r.map((x) => fmt(x, x % 1 === 0 ? 0 : 2)).join(' : ');

    /* ---------- Calculators (formulas kept the same as the original) ---------- */
    const DRY_FACTOR = 1.5;        // wet → dry volume
    const CEMENT_BAG = 0.8;        // cft cement → bags (≈ 1 / 1.25 cft per bag)
    const CFT_PER_BAG = 1.2;       // sand / khoa "bag" conversion

    const CALC = {
        roof(v, form) {
            const sum = ratioSum(form, ['ratio1', 'ratio2', 'ratio3'], v);
            if (sum === null) return null;

            const length = (v.firstLength + v.secondLength) / 2;
            const width = (v.firstWidth + v.secondWidth) / 2;
            const height = v.heightUnit === 'inches' ? v.height / 12 : v.height;

            const area = length * width;
            const volume = area * height;
            const dry = volume * DRY_FACTOR;
            const cement = (dry / sum) * v.ratio1;
            const sand = (dry / sum) * v.ratio2;
            const khoa = (dry / sum) * v.ratio3;

            return [
                row('Average Length × Width', `${fmt(length)} × ${fmt(width)}`, 'ft'),
                row('Area', fmt(area), 'sq ft'),
                row('Total Volume', fmt(volume), 'cft'),
                row('Dry Volume', fmt(dry), 'cft'),
                row('Mixing Ratio', ratioText(v.ratio1, v.ratio2, v.ratio3)),
                heading('Materials'),
                row('Cement Area', fmt(cement), 'cft'),
                row('মোট সিমেন্ট লাগবেঃ', fmt(cement * CEMENT_BAG), 'Bags', true),
                row('Sand Area', fmt(sand), 'cft'),
                row('মোট বালু লাগবেঃ', fmt(sand / CFT_PER_BAG), 'Bags', true),
                row('Khoa Area', fmt(khoa), 'cft'),
                row('মোট খোয়া লাগবেঃ', fmt(khoa / CFT_PER_BAG), 'Bags', true),
            ];
        },

        column(v, form) {
            const sum = ratioSum(form, ['ratio1', 'ratio2', 'ratio3'], v);
            if (sum === null) return null;

            const volume = v.colLength * (v.colWidth / 12) * (v.colThickness / 12);
            const dry = volume * DRY_FACTOR;
            const cement = (dry / sum) * v.ratio1;
            const bagsCement = cement * CEMENT_BAG;
            const sand = (dry / sum) * v.ratio2;
            const bagsSand = sand / CFT_PER_BAG;
            const khoa = (dry / sum) * v.ratio3;
            const bagsKhoa = khoa / CFT_PER_BAG;
            const bricksForKhoa = khoa * 9;

            const cementCost = bagsCement * v.cementPrice;
            const sandCost = sand * v.sandPrice;
            const khoaCost = khoa * v.khoaPrice;
            const totalCost = cementCost + sandCost + khoaCost;

            return [
                row('Total Work Volume', fmt(volume), 'cft'),
                row('Dry Volume', fmt(dry), 'cft'),
                row('Mixing Ratio', ratioText(v.ratio1, v.ratio2, v.ratio3)),
                heading('Materials'),
                row('Cement Need', fmt(cement), 'cft'),
                row('মোট সিমেন্ট লাগবেঃ', fmt(bagsCement), 'Bags', true),
                row('Sand Need', fmt(sand), 'cft'),
                row('মোট বালি লাগবেঃ', fmt(bagsSand), 'Bags', true),
                row('Khoa Need', fmt(khoa), 'cft'),
                row('মোট খোয়া লাগবেঃ', fmt(bagsKhoa), 'Bags', true),
                row('খোয়ার জন্য ইট ভাঙতে হবেঃ', fmt(Math.ceil(bricksForKhoa - 1e-9), 0), 'Pcs', true),
                heading('Price Calculation'),
                row('সর্বমোট সিমেন্টের দামঃ', fmt(cementCost), 'Taka'),
                row('সর্বমোট বালির দামঃ', fmt(sandCost), 'Taka'),
                row('সর্বমোট খোয়ার দামঃ', fmt(khoaCost), 'Taka'),
                total('সর্বমোট খরচঃ', fmt(totalCost), 'Taka'),
            ];
        },

        wall(v, form) {
            const sum = ratioSum(form, ['ratio1', 'ratio2'], v);
            if (sum === null) return null;

            const volume = v.wallLength * v.wallHeight * (v.brickThickness / 12);
            const bricks = volume * 12;
            const dryMix = volume * 0.35;
            const cement = (dryMix / sum) * v.ratio1;
            const sand = (dryMix / sum) * v.ratio2;

            return [
                row('Total Work Volume', fmt(volume), 'cft'),
                row('মোট ইট লাগবেঃ', fmt(Math.ceil(bricks - 1e-9), 0), 'Pcs', true),
                row('Dry Mixer Volume', fmt(dryMix), 'cft'),
                row('Mixing Ratio', ratioText(v.ratio1, v.ratio2)),
                heading('Materials'),
                row('Cement Need', fmt(cement), 'cft'),
                row('মোট সিমেন্ট লাগবেঃ', fmt(cement * CEMENT_BAG), 'Bags', true),
                row('Sand Need', fmt(sand), 'cft'),
                row('মোট বালি লাগবেঃ', fmt(sand / CFT_PER_BAG), 'Bags', true),
            ];
        },

        plaster(v, form) {
            const sum = ratioSum(form, ['ratio1', 'ratio2'], v);
            if (sum === null) return null;

            const area = v.wallLength * v.wallHeight;
            const volume = area * (v.plasterThickness / 12);
            const dry = volume * DRY_FACTOR;
            const cement = (dry / sum) * v.ratio1;
            const sand = (dry / sum) * v.ratio2;

            return [
                row('Total Work Area', fmt(area), 'sq ft'),
                row('Total Volume', fmt(volume), 'cft'),
                row('Dry Volume', fmt(dry), 'cft'),
                row('Mixing Ratio', ratioText(v.ratio1, v.ratio2)),
                heading('Materials'),
                row('Cement Needed', fmt(cement), 'cft'),
                row('মোট সিমেন্ট লাগবেঃ', fmt(cement * CEMENT_BAG), 'Bags', true),
                row('Sand Needed', fmt(sand), 'cft'),
                row('মোট বালি লাগবেঃ', fmt(sand / CFT_PER_BAG), 'Bags', true),
            ];
        },

        steel(v) {
            // Number of bars across a span = span / spacing + 1 (rounded up).
            // Computed in inches to avoid floating-point rounding errors.
            const barCount = (spanFt) => Math.ceil(+((spanFt * 12) / v.gap).toFixed(6)) + 1;

            const barsAlongLength = barCount(v.length);   // each bar runs across the width
            const barsAlongWidth = barCount(v.width);     // each bar runs across the length
            const runA = barsAlongLength * v.width;
            const runB = barsAlongWidth * v.length;
            const totalLength = runA + runB;
            const waste = totalLength * (v.wastage / 100);
            const subTotal = totalLength + waste;
            const kgPerFt = (v.mm ** 2) / 532.2;
            const totalKg = subTotal * kgPerFt;

            return [
                row(`Bars (${fmt(v.width)} ft long)`, fmt(barsAlongLength, 0), 'Pcs'),
                row(`Bars (${fmt(v.length)} ft long)`, fmt(barsAlongWidth, 0), 'Pcs'),
                row('Total Rod Length', fmt(totalLength), 'rft'),
                row(`Wastage (${fmt(v.wastage, v.wastage % 1 === 0 ? 0 : 2)}%)`, fmt(waste), 'rft'),
                row('Sub Total', fmt(subTotal), 'rft'),
                row(`Weight per ft (${fmt(v.mm, v.mm % 1 === 0 ? 0 : 2)} mm)`, fmt(kgPerFt, 3), 'kg/ft'),
                total('মোট রড লাগবেঃ', fmt(totalKg), 'kg'),
            ];
        },
    };

    /* ---------- Rendering ---------- */
    const EMPTY_STATE = `
        <div class="empty">
            <div class="empty-icon"><i class="fa-solid fa-calculator"></i></div>
            <p>মাপগুলো দিয়ে <strong>Calculate</strong> চাপুন — ফলাফল এখানে দেখাবে।</p>
        </div>`;

    function renderItems(items) {
        let html = '';
        let listOpen = false;
        const closeList = () => { if (listOpen) { html += '</ul>'; listOpen = false; } };

        items.forEach((it) => {
            if (it.type === 'title') {
                closeList();
                html += `<p class="group-title result-sub">${it.text}</p>`;
            } else if (it.type === 'total') {
                closeList();
                html += `<div class="total-box"><span class="label">${it.label}</span>
                         <span class="value">${it.value}<small>${it.unit}</small></span></div>`;
            } else {
                if (!listOpen) { html += '<ul class="result-list">'; listOpen = true; }
                html += `<li class="result-row${it.key ? ' key' : ''}">
                            <span class="label">${it.label}</span>
                            <span class="value">${it.value}${it.unit ? `<small>${it.unit}</small>` : ''}</span>
                         </li>`;
            }
        });
        closeList();
        return html;
    }

    function inputsSummary(form, v) {
        return $$('input[type="number"]', form).map((inp) => {
            const unitEl = $('.unit', inp.parentElement);
            let unit = unitEl ? unitEl.textContent : '';
            if (inp.name === 'height' && v.heightUnit) unit = v.heightUnit;
            return `<div>${escapeHtml(inp.dataset.label || inp.name)}: <strong>${escapeHtml(inp.value)} ${escapeHtml(unit)}</strong></div>`;
        }).join('');
    }

    function renderResult(id, items, form, v) {
        const card = $('#result-' + id);
        const page = PAGES.find((p) => p.id === id);
        $('.result-output', card).innerHTML = renderItems(items);
        $('.print-head', card).innerHTML =
            `<strong>${SITE} — ${page.name} (${page.bn})</strong>
             <span>${new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>`;
        $('.print-inputs', card).innerHTML = inputsSummary(form, v);
        $('[data-print]', card).disabled = false;
    }

    function resetResult(id) {
        const card = $('#result-' + id);
        $('.result-output', card).innerHTML = EMPTY_STATE;
        $('.print-head', card).innerHTML = '';
        $('.print-inputs', card).innerHTML = '';
        $('[data-print]', card).disabled = true;
    }

    function focusFirstInvalid(form) {
        const bad = $('.field.invalid input', form);
        if (bad) bad.focus();
    }

    $$('form[data-calc]').forEach((form) => {
        const id = form.dataset.calc;
        resetResult(id);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const v = readForm(form);
            if (!v) { focusFirstInvalid(form); return; }
            const items = CALC[id](v, form);
            if (!items) { focusFirstInvalid(form); return; }
            renderResult(id, items, form, v);

            // On small screens the results are below the form — bring them into view
            if (window.matchMedia('(max-width: 900px)').matches) {
                $('#result-' + id).scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        form.addEventListener('reset', () => {
            $$('.field.invalid', form).forEach((f) => f.classList.remove('invalid'));
            resetResult(id);
        });

        form.addEventListener('input', (e) => {
            const field = e.target.closest('.field.invalid');
            if (field) field.classList.remove('invalid');
        });
    });

    // Print only the active result card (layout handled by @media print CSS)
    $$('[data-print]').forEach((btn) => btn.addEventListener('click', () => window.print()));

    /* =========================================================
       About: client inquiry  |  Contact: review
       ========================================================= */
    $('#inquiry-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        console.log('Client inquiry:', data);
        toast('Your inquiry has been submitted. We will get back to you soon.');
        e.target.reset();
    });

    const ratingText = $('#rating-text');
    const reviewForm = $('#review-form');
    const updateRatingText = () => {
        const checked = $('input[name="rating"]:checked', reviewForm);
        if (checked) ratingText.textContent = $(`label[for="${checked.id}"]`, reviewForm).title;
    };
    reviewForm.addEventListener('change', (e) => { if (e.target.name === 'rating') updateRatingText(); });
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(reviewForm));
        console.log('Review:', data);
        toast('Thank you for your review!');
        reviewForm.reset();
        updateRatingText();
    });

    /* ---------- Init ---------- */
    $('#year').textContent = new Date().getFullYear();
    route();
})();