/* =========================================================
   Construction Calculator — script.js
   Single-page app: routing, sidebar, settings (theme, accent,
   text size, language, digits, decimals, remember inputs,
   compact sidebar, reduce motion), Bangla/English i18n,
   calculators (Roof, Column, Wall, Plaster, Steel) and forms.
   ========================================================= */
(() => {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const root = document.documentElement;

    /* =========================================================
       Translations
       ========================================================= */
    const I18N = {
        en: {
            'brand.name': 'Construction Calculator',
            'brand.tag': 'Easy construction estimates',

            'nav.main': 'Main',
            'nav.calculators': 'Calculators',
            'nav.more': 'More',
            'nav.collapse': 'Collapse sidebar',
            'nav.expand': 'Expand sidebar',
            'page.home': 'Home',
            'page.roof': 'Roof Molding',
            'page.column': 'Column Works',
            'page.wall': 'Wall B-C-S',
            'page.plaster': 'Plaster',
            'page.steel': 'Roof Steel',
            'page.tiles': 'Tiles',
            'page.about': 'About',
            'page.contact': 'Contact',
            'badge.soon': 'Soon',

            'search.ph': 'Search calculators…',
            'search.btn': 'Search',
            'search.empty': 'Nothing found for “{q}”',

            'a11y.openMenu': 'Open menu',
            'a11y.closeMenu': 'Close menu',
            'a11y.theme': 'Switch light / dark mode',
            'a11y.lang': 'বাংলায় দেখুন',

            'home.eyebrow': 'Easy Solutions for Construction Calculations',
            'home.title': 'Welcome to <span>Construction Calculator</span>',
            'home.lead': 'Roof casting, columns, brick walls, plaster and steel — cement, sand, khoa and cost estimates in one place, instantly.',
            'home.cta.roof': 'Calculate roof casting',
            'home.cta.column': 'Calculate columns',
            'home.cta.wall': 'Calculate brick walls',
            'home.cta.plaster': 'Calculate plaster',
            'stat1.t': '5+ Calculators', 'stat1.s': 'More coming soon',
            'stat2.t': 'Bangla + English', 'stat2.s': 'Switch any time',
            'stat3.t': 'Light & Dark', 'stat3.s': 'Easy on the eyes',
            'stat4.t': 'Printable', 'stat4.s': 'One-click print',
            'tools.title': 'Choose the estimate you need',
            'tools.sub': 'Enter your measurements and get material & cost estimates instantly.',
            'desc.roof': 'Find out how much cement, sand and khoa your roof casting needs.',
            'desc.column': 'Column materials, bricks to break for khoa, and the total cost.',
            'desc.wall': 'Bricks, cement and sand needed for brick walls.',
            'desc.plaster': 'Cement and sand by plaster thickness and mixing ratio.',
            'desc.steel': 'Total kg of rod from spacing, rod size and wastage.',
            'desc.tiles': 'The tiles calculator is coming soon.',
            'common.start': 'Start',
            'common.view': 'View',
            'feat.kicker': 'Why us',
            'feat.title': 'Key Features',
            'feat1.t': 'Easy Calculation', 'feat1.d': 'Quickly calculate materials and costs for your projects.',
            'feat2.t': 'Customizable Inputs', 'feat2.d': 'Adjust mixing ratios, dimensions, and units to fit your needs.',
            'feat3.t': 'Printable Results', 'feat3.d': 'Generate printable reports with detailed calculations.',
            'cta.title': 'Have questions or feedback?',
            'cta.learn': 'Learn More',
            'cta.contact': 'Contact Now',

            'calc.inputs': 'Inputs',
            'calc.results': 'Results',
            'calc.calculate': 'Calculate',
            'calc.reset': 'Reset',
            'calc.print': 'Print Results',
            'calc.empty': 'Enter the measurements and press Calculate — results will appear here.',

            'grp.ratio': 'Mixing Ratio',
            'grp.length': 'Length',
            'grp.width': 'Width',
            'grp.thickness': 'Thickness',
            'grp.colsize': 'Column Size',
            'grp.price': 'Market Price',
            'grp.wallsize': 'Wall Size',
            'grp.plaster': 'Wall & Plaster',
            'grp.roofsize': 'Roof Size',
            'grp.rod': 'Rod Details',
            'grp.materials': 'Materials',
            'grp.priceCalc': 'Price Calculation',

            'mat.cement': 'Cement',
            'mat.sand': 'Sand',
            'mat.khoa': 'Khoa',

            'f.firstLength': 'First Length',
            'f.secondLength': 'Second Length',
            'f.firstWidth': 'First Width',
            'f.secondWidth': 'Second Width',
            'f.height': 'Height',
            'f.unit': 'Unit',
            'unit.inches': 'Inches',
            'unit.feet': 'Feet',
            'f.colLength': 'Column Length',
            'f.colWidth': 'Column Width',
            'f.colThickness': 'Column Thickness',
            'f.cementPrice': 'Cement (per bag)',
            'f.sandPrice': 'Sand (per cft)',
            'f.khoaPrice': 'Khoa (per cft)',
            'f.wallLength': 'Wall Length',
            'f.wallHeight': 'Wall Height',
            'f.brickThickness': 'Brick Thickness',
            'f.plasterThickness': 'Plaster Thickness',
            'f.length': 'Length',
            'f.width': 'Width',
            'f.gap': 'Gap of Rod',
            'f.wastage': 'Wastage',
            'f.mm': 'Rod Size',

            'u.ft': 'ft', 'u.inch': 'inch', 'u.mm': 'mm', 'u.sqft': 'sq ft', 'u.cft': 'cft',
            'u.bags': 'Bags', 'u.pcs': 'Pcs', 'u.taka': 'Taka', 'u.rft': 'rft', 'u.kg': 'kg', 'u.kgft': 'kg/ft',

            'roof.title': 'Roof Molding',
            'roof.sub': 'Enter the roof length, width, thickness and mixing ratio to get cement, sand and khoa quantities.',
            'roof.hint': 'For an uneven roof enter both sides — the average is used. Roof casting commonly uses a 1 : 2 : 4 ratio.',
            'column.title': 'Column Works',
            'column.sub': 'Enter the column size, mixing ratio and market prices to get materials and the total cost.',
            'column.hint': 'Enter column length in feet, and width and thickness in inches.',
            'wall.title': 'Wall B-C-S (Brick, Cement, Sand)',
            'wall.sub': 'Enter the wall length, height, brick thickness and mixing ratio.',
            'wall.hint': 'Enter brick thickness in inches — e.g. 5 for a 5" wall or 10 for a 10" wall.',
            'plaster.title': 'Plaster Calculator',
            'plaster.sub': 'Enter the wall size, plaster thickness and mixing ratio.',
            'plaster.hint': 'Plaster is usually ½ to ¾ inch thick.',
            'steel.title': 'Roof Steel',
            'steel.sub': 'Enter the roof size, rod spacing, wastage and rod size (mm) to get the total kg of rod.',
            'steel.hint': 'Rod weight (kg/ft) = d² ÷ 532.2 (d = rod diameter in mm). Bars in both directions are counted.',
            'tiles.title': 'Tiles',
            'tiles.sub': 'This calculator is being built.',
            'tiles.h': 'Under Construction',
            'tiles.p': 'This page is currently under construction. We apologize for any inconvenience caused.',
            'tiles.back': 'Back To Home',

            'r.avgLW': 'Average Length × Width',
            'r.area': 'Area',
            'r.workArea': 'Total Work Area',
            'r.totalVolume': 'Total Volume',
            'r.workVolume': 'Total Work Volume',
            'r.dryVolume': 'Dry Volume',
            'r.dryMix': 'Dry Mixer Volume',
            'r.ratio': 'Mixing Ratio',
            'r.cementBags': 'Total cement needed',
            'r.sandBags': 'Total sand needed',
            'r.khoaBags': 'Total khoa needed',
            'r.bricksKhoa': 'Bricks to break for khoa',
            'r.bricks': 'Total bricks needed',
            'r.cementCost': 'Total cement cost',
            'r.sandCost': 'Total sand cost',
            'r.khoaCost': 'Total khoa cost',
            'r.totalCost': 'Total cost',
            'r.bars': 'Bars ({len} long)',
            'r.rodLength': 'Total rod length',
            'r.wastage': 'Wastage ({p}%)',
            'r.subTotal': 'Sub total',
            'r.kgPerFt': 'Weight per ft ({mm} mm)',
            'r.rodTotal': 'Total rod needed',

            'err.required': 'Please fill in this field',
            'err.number': 'Enter a valid number',
            'err.negative': 'Negative values are not allowed',
            'err.positive': 'Value must be greater than 0',
            'err.ratio': 'Ratios must add up to more than 0',

            'about.title': 'About Us',
            'about.intro': 'Welcome to the Construction Calculator! This tool is designed to assist you with various construction calculations, ensuring your projects run smoothly and efficiently.',
            'about.dev': 'Developer Information',
            'dev.role': 'Student of CSE Department at Premier University, Chittagong.',
            'dev.services': 'If you need any kind of development services, feel free to contact me:',
            'lbl.email': 'Email',
            'lbl.mobile': 'Mobile',
            'lbl.education': 'Education',
            'lbl.facebook': 'Facebook',
            'edu.value': 'CSE, Premier University, Chittagong',
            'inq.title': 'Client Inquiry Form',
            'f.name': 'Name',
            'f.phone': 'Phone',
            'f.req': 'Development Requirements',
            'inq.submit': 'Submit Inquiry',
            'inq.ok': 'Your inquiry has been submitted. We will get back to you soon.',

            'contact.title': 'Contact Us',
            'contact.sub': 'If you have any questions or need further assistance, feel free to reach out to us.',
            'fb.msg': 'Message us',
            'rev.title': 'Leave a Review',
            'f.rating': 'Rating',
            'f.comments': 'Comments',
            'rev.submit': 'Submit Review',
            'rev.ok': 'Thank you for your review!',
            'rate.5': '5 - Excellent', 'rate.4': '4 - Very Good', 'rate.3': '3 - Good', 'rate.2': '2 - Fair', 'rate.1': '1 - Poor',

            'foot.rights': 'All rights reserved.',
            'foot.dev': 'Developed by MD NAIM UDDIN MOZUMDAR',

            'set.title': 'Settings',
            'set.sub': 'Choose how the site looks and works.',
            'set.close': 'Close settings',
            'set.appearance': 'Appearance',
            'set.theme': 'Theme',
            'theme.light': 'Light', 'theme.dark': 'Dark', 'theme.system': 'System',
            'set.accent': 'Accent colour',
            'accent.gold': 'Gold', 'accent.blue': 'Blue', 'accent.green': 'Green', 'accent.orange': 'Orange', 'accent.purple': 'Purple',
            'set.fontSize': 'Text size',
            'fs.s': 'Small', 'fs.m': 'Medium', 'fs.l': 'Large',
            'set.langNum': 'Language & numbers',
            'set.lang': 'Language',
            'set.digits': 'Digits',
            'digits.auto': 'Auto',
            'set.digits.hint': 'Auto follows the selected language.',
            'set.decimals': 'Decimal places in results',
            'set.behavior': 'Behaviour',
            'set.remember': 'Remember my inputs',
            'set.remember.d': 'Values stay after a refresh',
            'set.compact': 'Compact sidebar',
            'set.compact.d': 'Icons only (desktop)',
            'set.motion': 'Reduce animations',
            'set.motion.d': 'Turn off movement effects',
            'set.clear': 'Clear saved inputs',
            'set.reset': 'Reset settings',
            'set.note': 'Settings are saved on this device.',
            'set.resetOk': 'Settings restored to default',
            'set.clearOk': 'Saved inputs cleared',
        },

        bn: {
            'brand.name': 'কনস্ট্রাকশন ক্যালকুলেটর',
            'brand.tag': 'নির্মাণ কাজের সহজ হিসাব',

            'nav.main': 'প্রধান',
            'nav.calculators': 'ক্যালকুলেটর',
            'nav.more': 'আরও',
            'nav.collapse': 'সাইডবার ছোট করুন',
            'nav.expand': 'সাইডবার বড় করুন',
            'page.home': 'হোম',
            'page.roof': 'ছাদ ঢালাই',
            'page.column': 'কলামের কাজ',
            'page.wall': 'দেওয়াল গাঁথুনি',
            'page.plaster': 'প্লাস্টার',
            'page.steel': 'ছাদের রড',
            'page.tiles': 'টাইলস',
            'page.about': 'আমাদের সম্পর্কে',
            'page.contact': 'যোগাযোগ',
            'badge.soon': 'শীঘ্রই',

            'search.ph': 'ক্যালকুলেটর খুঁজুন…',
            'search.btn': 'খুঁজুন',
            'search.empty': '“{q}” — কিছু পাওয়া যায়নি',

            'a11y.openMenu': 'মেনু খুলুন',
            'a11y.closeMenu': 'মেনু বন্ধ করুন',
            'a11y.theme': 'লাইট / ডার্ক মোড পরিবর্তন',
            'a11y.lang': 'View in English',

            'home.eyebrow': 'নির্মাণ কাজের হিসাবের সহজ সমাধান',
            'home.title': '<span>কনস্ট্রাকশন ক্যালকুলেটরে</span> স্বাগতম',
            'home.lead': 'ছাদ ঢালাই, কলাম, দেওয়াল গাঁথুনি, প্লাস্টার ও রডের হিসাব — সিমেন্ট, বালু, খোয়া ও খরচ এক জায়গায়, মুহূর্তেই।',
            'home.cta.roof': 'চলুন ছাদ ঢালাই এর হিসাব করি',
            'home.cta.column': 'চলুন কলামের হিসাব করি',
            'home.cta.wall': 'চলুন দেওয়াল গাঁথুনীর হিসাব করি',
            'home.cta.plaster': 'চলুন প্লাস্টার কাজের হিসাব করি',
            'stat1.t': '৫+ ক্যালকুলেটর', 'stat1.s': 'আরও আসছে',
            'stat2.t': 'বাংলা + English', 'stat2.s': 'যেকোনো সময় বদলান',
            'stat3.t': 'লাইট ও ডার্ক মোড', 'stat3.s': 'চোখের জন্য আরামদায়ক',
            'stat4.t': 'প্রিন্টযোগ্য', 'stat4.s': 'এক ক্লিকে প্রিন্ট',
            'tools.title': 'আপনার প্রয়োজনীয় হিসাব বেছে নিন',
            'tools.sub': 'মাপ দিন, সাথে সাথে ম্যাটেরিয়াল ও খরচের হিসাব পান।',
            'desc.roof': 'ছাদের ঢালাইয়ে সিমেন্ট, বালু ও খোয়া কত লাগবে তা বের করুন।',
            'desc.column': 'কলামের ম্যাটেরিয়াল, খোয়ার জন্য ইট ও সর্বমোট খরচের হিসাব।',
            'desc.wall': 'দেওয়ালের কাজে ইট, সিমেন্ট ও বালির পরিমাণ।',
            'desc.plaster': 'প্লাস্টারের পুরুত্ব ও রেশিও অনুযায়ী সিমেন্ট-বালির হিসাব।',
            'desc.steel': 'রডের গ্যাপ, সাইজ ও অপচয় ধরে মোট কত কেজি রড লাগবে।',
            'desc.tiles': 'টাইলসের হিসাব শীঘ্রই আসছে।',
            'common.start': 'শুরু করুন',
            'common.view': 'দেখুন',
            'feat.kicker': 'কেন আমরা',
            'feat.title': 'মূল বৈশিষ্ট্য',
            'feat1.t': 'সহজ হিসাব', 'feat1.d': 'আপনার প্রজেক্টের ম্যাটেরিয়াল ও খরচ দ্রুত হিসাব করুন।',
            'feat2.t': 'নিজের মতো ইনপুট', 'feat2.d': 'মিক্সিং রেশিও, মাপ ও একক নিজের প্রয়োজনমতো দিন।',
            'feat3.t': 'প্রিন্টযোগ্য ফলাফল', 'feat3.d': 'বিস্তারিত হিসাবসহ প্রিন্টযোগ্য রিপোর্ট তৈরি করুন।',
            'cta.title': 'কোনো প্রশ্ন বা মতামত আছে?',
            'cta.learn': 'আরও জানুন',
            'cta.contact': 'যোগাযোগ করুন',

            'calc.inputs': 'ইনপুট',
            'calc.results': 'ফলাফল',
            'calc.calculate': 'হিসাব করুন',
            'calc.reset': 'রিসেট',
            'calc.print': 'ফলাফল প্রিন্ট করুন',
            'calc.empty': 'মাপগুলো দিয়ে “হিসাব করুন” চাপুন — ফলাফল এখানে দেখাবে।',

            'grp.ratio': 'মিক্সিং রেশিও',
            'grp.length': 'দৈর্ঘ্য',
            'grp.width': 'প্রস্থ',
            'grp.thickness': 'পুরুত্ব',
            'grp.colsize': 'কলামের মাপ',
            'grp.price': 'বাজার দর',
            'grp.wallsize': 'দেওয়ালের মাপ',
            'grp.plaster': 'দেওয়াল ও প্লাস্টার',
            'grp.roofsize': 'ছাদের মাপ',
            'grp.rod': 'রডের তথ্য',
            'grp.materials': 'ম্যাটেরিয়াল',
            'grp.priceCalc': 'দামের হিসাব',

            'mat.cement': 'সিমেন্ট',
            'mat.sand': 'বালু',
            'mat.khoa': 'খোয়া',

            'f.firstLength': 'প্রথম দৈর্ঘ্য',
            'f.secondLength': 'দ্বিতীয় দৈর্ঘ্য',
            'f.firstWidth': 'প্রথম প্রস্থ',
            'f.secondWidth': 'দ্বিতীয় প্রস্থ',
            'f.height': 'উচ্চতা (পুরুত্ব)',
            'f.unit': 'একক',
            'unit.inches': 'ইঞ্চি',
            'unit.feet': 'ফুট',
            'f.colLength': 'কলামের দৈর্ঘ্য',
            'f.colWidth': 'কলামের প্রস্থ',
            'f.colThickness': 'কলামের পুরুত্ব',
            'f.cementPrice': 'সিমেন্ট (প্রতি ব্যাগ)',
            'f.sandPrice': 'বালু (প্রতি ঘনফুট)',
            'f.khoaPrice': 'খোয়া (প্রতি ঘনফুট)',
            'f.wallLength': 'দেওয়ালের দৈর্ঘ্য',
            'f.wallHeight': 'দেওয়ালের উচ্চতা',
            'f.brickThickness': 'ইটের পুরুত্ব',
            'f.plasterThickness': 'প্লাস্টারের পুরুত্ব',
            'f.length': 'দৈর্ঘ্য',
            'f.width': 'প্রস্থ',
            'f.gap': 'রডের গ্যাপ',
            'f.wastage': 'অপচয়',
            'f.mm': 'রডের সাইজ',

            'u.ft': 'ফুট', 'u.inch': 'ইঞ্চি', 'u.mm': 'মিমি', 'u.sqft': 'বর্গফুট', 'u.cft': 'ঘনফুট',
            'u.bags': 'ব্যাগ', 'u.pcs': 'পিস', 'u.taka': 'টাকা', 'u.rft': 'রানিং ফুট', 'u.kg': 'কেজি', 'u.kgft': 'কেজি/ফুট',

            'roof.title': 'ছাদ ঢালাই এর হিসাব',
            'roof.sub': 'ছাদের দৈর্ঘ্য, প্রস্থ, পুরুত্ব ও মিক্সিং রেশিও দিন — সিমেন্ট, বালু ও খোয়ার পরিমাণ পেয়ে যাবেন।',
            'roof.hint': 'অসমান ছাদের জন্য দুই দিকের মাপ দিন, গড় মাপ ধরে হিসাব হবে। সাধারণত ছাদ ঢালাইয়ে ১ : ২ : ৪ রেশিও ব্যবহার করা হয়।',
            'column.title': 'কলামের হিসাব',
            'column.sub': 'কলামের মাপ, মিক্সিং রেশিও ও বাজার দর দিন — ম্যাটেরিয়াল ও সর্বমোট খরচ পেয়ে যাবেন।',
            'column.hint': 'কলামের দৈর্ঘ্য ফুটে এবং প্রস্থ ও পুরুত্ব ইঞ্চিতে দিন।',
            'wall.title': 'দেওয়ালের কাজে ইট, সিমেন্ট ও বালির হিসাব',
            'wall.sub': 'দেওয়ালের দৈর্ঘ্য, উচ্চতা, ইটের পুরুত্ব ও রেশিও দিন।',
            'wall.hint': '৫ ইঞ্চি বা ১০ ইঞ্চি দেওয়ালের জন্য ইটের পুরুত্ব ইঞ্চিতে দিন।',
            'plaster.title': 'প্লাস্টার এর হিসাব',
            'plaster.sub': 'দেওয়ালের মাপ, প্লাস্টারের পুরুত্ব ও রেশিও দিন।',
            'plaster.hint': 'সাধারণত প্লাস্টারের পুরুত্ব ½ থেকে ¾ ইঞ্চি হয়।',
            'steel.title': 'ছাদের রডের হিসাব',
            'steel.sub': 'ছাদের মাপ, রডের গ্যাপ, অপচয় ও রডের সাইজ (মিমি) দিন — মোট কত কেজি রড লাগবে তা পাবেন।',
            'steel.hint': 'রডের ওজন (কেজি/ফুট) = d² ÷ ৫৩২.২ (d = রডের ব্যাস, মিমি)। দুই দিকের রড (লম্বা ও আড়া) ধরে হিসাব হবে।',
            'tiles.title': 'টাইলসের হিসাব',
            'tiles.sub': 'এই ক্যালকুলেটরটি তৈরির কাজ চলছে।',
            'tiles.h': 'কাজ চলছে',
            'tiles.p': 'এই পেজটির কাজ চলছে। অসুবিধার জন্য আমরা দুঃখিত। টাইলস ক্যালকুলেটর শীঘ্রই আসছে।',
            'tiles.back': 'হোমে ফিরে যান',

            'r.avgLW': 'গড় দৈর্ঘ্য × প্রস্থ',
            'r.area': 'ক্ষেত্রফল',
            'r.workArea': 'মোট কাজের ক্ষেত্রফল',
            'r.totalVolume': 'মোট আয়তন',
            'r.workVolume': 'মোট কাজের আয়তন',
            'r.dryVolume': 'শুকনো আয়তন',
            'r.dryMix': 'শুকনো মসলার আয়তন',
            'r.ratio': 'মিক্সিং রেশিও',
            'r.cementBags': 'মোট সিমেন্ট লাগবেঃ',
            'r.sandBags': 'মোট বালু লাগবেঃ',
            'r.khoaBags': 'মোট খোয়া লাগবেঃ',
            'r.bricksKhoa': 'খোয়ার জন্য ইট ভাঙতে হবেঃ',
            'r.bricks': 'মোট ইট লাগবেঃ',
            'r.cementCost': 'সর্বমোট সিমেন্টের দামঃ',
            'r.sandCost': 'সর্বমোট বালির দামঃ',
            'r.khoaCost': 'সর্বমোট খোয়ার দামঃ',
            'r.totalCost': 'সর্বমোট খরচঃ',
            'r.bars': 'রড ({len} লম্বা)',
            'r.rodLength': 'রডের মোট দৈর্ঘ্য',
            'r.wastage': 'অপচয় ({p}%)',
            'r.subTotal': 'সাব টোটাল',
            'r.kgPerFt': 'প্রতি ফুটের ওজন ({mm} মিমি)',
            'r.rodTotal': 'মোট রড লাগবেঃ',

            'err.required': 'এই ঘরটি পূরণ করুন',
            'err.number': 'সঠিক সংখ্যা দিন',
            'err.negative': 'ঋণাত্মক মান গ্রহণযোগ্য নয়',
            'err.positive': 'মান ০ এর বেশি হতে হবে',
            'err.ratio': 'রেশিওর যোগফল ০ এর বেশি হতে হবে',

            'about.title': 'আমাদের সম্পর্কে',
            'about.intro': 'কনস্ট্রাকশন ক্যালকুলেটরে স্বাগতম! নির্মাণ কাজের নানা হিসাব সহজ করতে এই টুলটি তৈরি, যাতে আপনার প্রজেক্ট সুন্দর ও দক্ষভাবে এগিয়ে যায়।',
            'about.dev': 'ডেভেলপারের তথ্য',
            'dev.role': 'সিএসই বিভাগের শিক্ষার্থী, প্রিমিয়ার ইউনিভার্সিটি, চট্টগ্রাম।',
            'dev.services': 'যেকোনো ধরনের ডেভেলপমেন্ট সার্ভিস প্রয়োজন হলে নির্দ্বিধায় যোগাযোগ করুন:',
            'lbl.email': 'ইমেইল',
            'lbl.mobile': 'মোবাইল',
            'lbl.education': 'শিক্ষা',
            'lbl.facebook': 'ফেসবুক',
            'edu.value': 'সিএসই, প্রিমিয়ার ইউনিভার্সিটি, চট্টগ্রাম',
            'inq.title': 'ক্লায়েন্ট ইনকোয়ারি ফর্ম',
            'f.name': 'নাম',
            'f.phone': 'ফোন',
            'f.req': 'ডেভেলপমেন্টের প্রয়োজনীয়তা',
            'inq.submit': 'ইনকোয়ারি পাঠান',
            'inq.ok': 'আপনার ইনকোয়ারি জমা হয়েছে। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।',

            'contact.title': 'যোগাযোগ করুন',
            'contact.sub': 'কোনো প্রশ্ন থাকলে বা আরও সহায়তা প্রয়োজন হলে আমাদের সাথে যোগাযোগ করুন।',
            'fb.msg': 'মেসেজ করুন',
            'rev.title': 'রিভিউ দিন',
            'f.rating': 'রেটিং',
            'f.comments': 'মন্তব্য',
            'rev.submit': 'রিভিউ পাঠান',
            'rev.ok': 'রিভিউ দেওয়ার জন্য ধন্যবাদ!',
            'rate.5': '৫ - অসাধারণ', 'rate.4': '৪ - খুব ভালো', 'rate.3': '৩ - ভালো', 'rate.2': '২ - মোটামুটি', 'rate.1': '১ - খারাপ',

            'foot.rights': 'সর্বস্বত্ব সংরক্ষিত।',
            'foot.dev': 'ডেভেলপার: MD NAIM UDDIN MOZUMDAR',

            'set.title': 'সেটিংস',
            'set.sub': 'সাইটটি কেমন দেখাবে ও কাজ করবে তা ঠিক করুন।',
            'set.close': 'সেটিংস বন্ধ করুন',
            'set.appearance': 'দেখতে কেমন হবে',
            'set.theme': 'থিম',
            'theme.light': 'লাইট', 'theme.dark': 'ডার্ক', 'theme.system': 'সিস্টেম',
            'set.accent': 'প্রধান রং',
            'accent.gold': 'সোনালি', 'accent.blue': 'নীল', 'accent.green': 'সবুজ', 'accent.orange': 'কমলা', 'accent.purple': 'বেগুনি',
            'set.fontSize': 'লেখার আকার',
            'fs.s': 'ছোট', 'fs.m': 'মাঝারি', 'fs.l': 'বড়',
            'set.langNum': 'ভাষা ও সংখ্যা',
            'set.lang': 'ভাষা',
            'set.digits': 'অঙ্ক',
            'digits.auto': 'অটো',
            'set.digits.hint': 'অটো দিলে নির্বাচিত ভাষা অনুযায়ী অঙ্ক দেখাবে।',
            'set.decimals': 'ফলাফলে দশমিকের পর ঘর',
            'set.behavior': 'আচরণ',
            'set.remember': 'ইনপুট মনে রাখুন',
            'set.remember.d': 'রিফ্রেশ করলেও মান থেকে যাবে',
            'set.compact': 'ছোট সাইডবার',
            'set.compact.d': 'শুধু আইকন দেখাবে (ডেস্কটপ)',
            'set.motion': 'অ্যানিমেশন কমান',
            'set.motion.d': 'নড়াচড়ার ইফেক্ট বন্ধ থাকবে',
            'set.clear': 'সংরক্ষিত ইনপুট মুছুন',
            'set.reset': 'সেটিংস রিসেট',
            'set.note': 'সেটিংস এই ডিভাইসে সংরক্ষিত থাকে।',
            'set.resetOk': 'সেটিংস ডিফল্টে ফিরে গেছে',
            'set.clearOk': 'সংরক্ষিত ইনপুট মুছে ফেলা হয়েছে',
        },
    };

    /* =========================================================
       Settings (persisted in localStorage)
       ========================================================= */
    const STORE_SETTINGS = 'cc.settings';
    const STORE_INPUTS = 'cc.inputs';
    const DEFAULTS = {
        theme: 'system', accent: 'gold', fontSize: 'm',
        lang: 'bn', digits: 'auto', decimals: 2,
        remember: true, compact: false, motion: false,
    };

    const storage = {
        get(key, fallback) {
            try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch (e) { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
        },
        remove(key) {
            try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
        },
    };

    const S = Object.assign({}, DEFAULTS, storage.get(STORE_SETTINGS, {}));
    S.decimals = Number(S.decimals);
    if (!(S.decimals >= 0 && S.decimals <= 3)) S.decimals = 2;
    if (!I18N[S.lang]) S.lang = 'bn';

    /* ---------- i18n helpers ---------- */
    const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
    const useBnDigits = () => (S.digits === 'auto' ? S.lang === 'bn' : S.digits === 'bn');
    const toBn = (s) => String(s).replace(/[0-9]/g, (d) => BN_DIGITS[d]);
    const toEn = (s) => String(s).replace(/[০-৯]/g, (d) => BN_DIGITS.indexOf(d));
    const digits = (s) => (useBnDigits() ? toBn(s) : toEn(s));

    function t(key, vars) {
        let s = (I18N[S.lang] && I18N[S.lang][key]) ?? I18N.en[key] ?? key;
        if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
        return digits(s);
    }

    const nfCache = {};
    function num(n, d = S.decimals) {
        if (!nfCache[d]) nfCache[d] = new Intl.NumberFormat('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
        return digits(nfCache[d].format(n));
    }
    // "clean" number for user-entered values: no forced trailing zeros
    const numPlain = (n) => digits(new Intl.NumberFormat('en-IN', { maximumFractionDigits: 3 }).format(n));

    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    /* ---------- Pages ---------- */
    const PAGES = [
        { id: 'home',    icon: 'fa-house' },
        { id: 'roof',    icon: 'fa-layer-group',       keys: 'roof slab casting dhalai chad ছাদ ঢালাই' },
        { id: 'column',  icon: 'fa-building-columns',  keys: 'column pillar kolam কলাম' },
        { id: 'wall',    icon: 'fa-trowel-bricks',     keys: 'wall brick cement sand bcs dewal it দেওয়াল ইট গাঁথুনি' },
        { id: 'plaster', icon: 'fa-paint-roller',      keys: 'plaster প্লাস্টার' },
        { id: 'steel',   icon: 'fa-grip-lines',        keys: 'rod steel rebar roof রড স্টিল' },
        { id: 'tiles',   icon: 'fa-table-cells-large', keys: 'tiles floor টাইলস' },
        { id: 'about',   icon: 'fa-circle-info',       keys: 'about developer আমাদের' },
        { id: 'contact', icon: 'fa-envelope',          keys: 'contact review email phone যোগাযোগ রিভিউ' },
    ];
    let currentPage = 'home';

    /* ---------- Toast ---------- */
    let toastTimer;
    function toast(message) {
        $('#toast-text').textContent = message;
        $('#toast').classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
    }

    /* =========================================================
       Apply settings
       ========================================================= */
    const darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const resolvedTheme = () => (S.theme === 'system' ? (darkMQ && darkMQ.matches ? 'dark' : 'light') : S.theme);

    function applyTheme() {
        const theme = resolvedTheme();
        root.setAttribute('data-theme', theme);
        root.setAttribute('data-accent', S.accent);
        root.setAttribute('data-fs', S.fontSize);
        if (S.compact) root.setAttribute('data-sidebar', 'compact'); else root.removeAttribute('data-sidebar');
        if (S.motion) root.setAttribute('data-motion', 'reduce'); else root.removeAttribute('data-motion');
        $('#theme-icon').className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        $('#collapse-icon').className = S.compact ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left';
        const meta = $('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#08090d' : '#0f1218');
    }
    if (darkMQ) {
        const onSystemChange = () => { if (S.theme === 'system') applyTheme(); };
        darkMQ.addEventListener ? darkMQ.addEventListener('change', onSystemChange) : darkMQ.addListener(onSystemChange);
    }

    function applyI18n() {
        root.setAttribute('lang', S.lang);
        $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
        $$('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
        $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
        $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
        $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
        $$('[data-ph]').forEach((el) => { el.placeholder = digits(el.dataset.ph); });
        $$('[data-dg]').forEach((el) => { el.textContent = digits(el.dataset.dg); });
        $$('.field-error[data-err]').forEach((el) => { el.textContent = t(el.dataset.err); });

        // compact-sidebar tooltips
        $$('.side-link').forEach((a) => {
            const label = $('.side-label', a);
            if (label) a.dataset.tip = label.textContent;
        });
        const collapseLabel = $('#collapse-btn .side-label');
        collapseLabel.textContent = t(S.compact ? 'nav.expand' : 'nav.collapse');
        $('#collapse-btn').dataset.tip = collapseLabel.textContent;

        // star rating labels
        $$('#review-form [data-rate]').forEach((l) => {
            const text = t('rate.' + l.dataset.rate);
            l.title = text;
            $('.sr-only', l).textContent = text;
        });
        updateRatingText();

        $('#lang-btn-text').textContent = S.lang === 'bn' ? 'EN' : 'বাং';
        $('#year').textContent = digits(new Date().getFullYear());

        // calculator results / empty states
        Object.keys(CALC).forEach((id) => {
            if (lastValues[id]) renderResult(id, lastValues[id]);
            else resetResult(id);
        });

        updateTopbar();
        $$('[data-search]').forEach((w) => { if ($('input', w).value.trim()) w._run(); });
    }

    function applyAll() {
        applyTheme();
        applyI18n();
        syncSettingsForm();
    }

    function saveSettings() {
        storage.set(STORE_SETTINGS, S);
    }

    function setSetting(key, value) {
        S[key] = value;
        saveSettings();
        if (key === 'remember' && !value) storage.remove(STORE_INPUTS);
        if (key === 'remember' && value) $$('form[data-calc]').forEach(saveInputs);
        applyAll();
    }

    /* =========================================================
       Settings drawer
       ========================================================= */
    const drawer = $('#settings');
    const settingsScrim = $('#settings-scrim');
    const settingsForm = $('#settings-form');
    let lastFocus = null;

    function syncSettingsForm() {
        ['theme', 'accent', 'fontSize', 'lang', 'digits', 'decimals'].forEach((name) => {
            $$(`input[name="${name}"]`, settingsForm).forEach((r) => { r.checked = String(S[name]) === r.value; });
        });
        ['remember', 'compact', 'motion'].forEach((name) => { settingsForm.elements[name].checked = !!S[name]; });
    }

    function openSettings() {
        lastFocus = document.activeElement;
        closeSidebar();
        syncSettingsForm();
        drawer.classList.add('open');
        settingsScrim.classList.add('show');
        document.body.classList.add('lock');
        setTimeout(() => $('#settings-close').focus(), 50);
    }
    function closeSettings() {
        if (!drawer.classList.contains('open')) return;
        drawer.classList.remove('open');
        settingsScrim.classList.remove('show');
        document.body.classList.remove('lock');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    $$('[data-open-settings]').forEach((b) => b.addEventListener('click', openSettings));
    $('#settings-close').addEventListener('click', closeSettings);
    settingsScrim.addEventListener('click', closeSettings);

    settingsForm.addEventListener('change', (e) => {
        const el = e.target;
        if (!el.name) return;
        const value = el.type === 'checkbox' ? el.checked : (el.name === 'decimals' ? Number(el.value) : el.value);
        setSetting(el.name, value);
    });

    // keep focus inside the drawer while open
    drawer.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusables = $$('button, input, [href], [tabindex]:not([tabindex="-1"])', drawer).filter((el) => !el.disabled && el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    $('#reset-settings').addEventListener('click', () => {
        Object.assign(S, DEFAULTS);
        saveSettings();
        applyAll();
        toast(t('set.resetOk'));
    });
    $('#clear-inputs').addEventListener('click', () => {
        storage.remove(STORE_INPUTS);
        $$('form[data-calc]').forEach((f) => f.reset());
        toast(t('set.clearOk'));
    });

    // Topbar quick toggles
    $('#theme-btn').addEventListener('click', () => setSetting('theme', resolvedTheme() === 'dark' ? 'light' : 'dark'));
    $('#lang-btn').addEventListener('click', () => setSetting('lang', S.lang === 'bn' ? 'en' : 'bn'));
    $('#collapse-btn').addEventListener('click', () => setSetting('compact', !S.compact));

    /* =========================================================
       Sidebar (mobile off-canvas)
       ========================================================= */
    const sidebar = $('#sidebar');
    const sideScrim = $('#side-scrim');
    const menuBtn = $('#menu-btn');
    const isMobile = () => window.matchMedia('(max-width: 1023.98px)').matches;

    function openSidebar() {
        sidebar.classList.add('open');
        sideScrim.classList.add('show');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('lock');
    }
    function closeSidebar() {
        if (!sidebar.classList.contains('open')) return;
        sidebar.classList.remove('open');
        sideScrim.classList.remove('show');
        menuBtn.setAttribute('aria-expanded', 'false');
        if (!drawer.classList.contains('open')) document.body.classList.remove('lock');
    }
    menuBtn.addEventListener('click', openSidebar);
    $('#side-close').addEventListener('click', closeSidebar);
    sideScrim.addEventListener('click', closeSidebar);
    window.addEventListener('resize', () => { if (!isMobile()) closeSidebar(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeSettings(); closeSidebar(); $$('[data-search]').forEach((w) => w._hide()); }
    });

    /* =========================================================
       Routing
       ========================================================= */
    function updateTopbar() {
        $('#top-title').textContent = t('page.' + currentPage);
        $('#top-crumb').innerHTML = currentPage === 'home'
            ? `<span>${escapeHtml(t('brand.name'))}</span>`
            : `<a href="#home">${escapeHtml(t('page.home'))}</a><i class="fa-solid fa-chevron-right"></i><span>${escapeHtml(t('page.' + currentPage))}</span>`;
        document.title = currentPage === 'home'
            ? `${t('brand.name')} | ${t('brand.tag')}`
            : `${t('page.' + currentPage)} | ${t('brand.name')}`;
    }

    function route() {
        let id = decodeURIComponent(location.hash.replace(/^#/, '')) || 'home';
        if (!PAGES.some((p) => p.id === id)) id = 'home';
        currentPage = id;

        $$('.page').forEach((s) => s.classList.toggle('active', s.id === 'page-' + id));
        $$('[data-link]').forEach((a) => {
            const active = a.dataset.link === id;
            a.classList.toggle('active', active);
            if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
        updateTopbar();
        closeSidebar();
        $$('[data-search]').forEach((w) => w._hide());
        window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', route);

    /* =========================================================
       Search (sidebar + home hero)
       ========================================================= */
    function findPages(q) {
        q = toEn(q.trim().toLowerCase());
        if (!q) return [];
        return PAGES.filter((p) => {
            if (p.id === 'home') return false;
            const hay = `${I18N.en['page.' + p.id]} ${I18N.bn['page.' + p.id]} ${p.keys || ''}`.toLowerCase();
            return hay.includes(q);
        });
    }

    $$('[data-search]').forEach((wrap) => {
        const input = $('input', wrap);
        const box = $('.search-results', wrap);
        const goBtn = $('[data-search-go]', wrap);

        wrap._hide = () => box.classList.remove('show');
        wrap._run = () => {
            const q = input.value.trim();
            if (!q) { box.innerHTML = ''; wrap._hide(); return; }
            const hits = findPages(q);
            box.innerHTML = hits.length
                ? hits.map((p) => `
                    <a href="#${p.id}" role="option">
                        <span class="menu-icon"><i class="fa-solid ${p.icon}"></i></span>
                        <strong>${escapeHtml(t('page.' + p.id))}</strong>
                    </a>`).join('')
                : `<div class="search-empty">${escapeHtml(t('search.empty', { q }))}</div>`;
            box.classList.add('show');
        };
        const go = () => {
            const hits = findPages(input.value);
            if (hits.length) { location.hash = hits[0].id; input.value = ''; wrap._hide(); input.blur(); }
            else wrap._run();
        };

        input.addEventListener('input', wrap._run);
        input.addEventListener('focus', () => { if (input.value.trim()) wrap._run(); });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); go(); }
            if (e.key === 'ArrowDown') { const a = $('a', box); if (a) { e.preventDefault(); a.focus(); } }
        });
        if (goBtn) goBtn.addEventListener('click', go);
        box.addEventListener('click', (e) => { if (e.target.closest('a')) { input.value = ''; wrap._hide(); } });
        document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) wrap._hide(); });
    });

    /* =========================================================
       Calculator form handling
       ========================================================= */
    function setError(input, key) {
        const field = input.closest('.field');
        if (!field) return;
        field.classList.toggle('invalid', !!key);
        const err = $('.field-error', field);
        if (!err) return;
        if (key) { err.dataset.err = key; err.textContent = t(key); }
        else { delete err.dataset.err; err.textContent = ''; }
    }

    // Accepts English or Bangla digits, and thousands commas
    function parseNum(raw) {
        const s = toEn(String(raw)).replace(/[,\s]/g, '').replace('٫', '.');
        if (s === '' || !/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
        return Number(s);
    }

    function readForm(form) {
        let ok = true;
        const v = {};
        $$('input[data-num]', form).forEach((inp) => {
            const raw = inp.value.trim();
            const n = parseNum(raw);
            let err = '';
            if (raw === '') err = 'err.required';
            else if (!Number.isFinite(n)) err = 'err.number';
            else if (n < 0) err = 'err.negative';
            else if (inp.hasAttribute('data-positive') && n <= 0) err = 'err.positive';
            setError(inp, err);
            if (err) ok = false;
            v[inp.name] = n;
        });
        $$('input[type="radio"]:checked', form).forEach((r) => { v[r.name] = r.value; });
        return ok ? v : null;
    }

    const ratioSum = (v, names) => names.reduce((s, n) => s + v[n], 0);
    const ratioText = (...r) => r.map(numPlain).join(' : ');

    // Result item builders
    const row = (label, value, unit = '', key = false) => ({ type: 'row', label, value, unit, key });
    const heading = (text) => ({ type: 'title', text });
    const total = (label, value, unit = '') => ({ type: 'total', label, value, unit });

    /* ---------- Calculators (formulas kept the same as the original site) ---------- */
    const DRY_FACTOR = 1.5;   // wet → dry volume
    const CEMENT_BAG = 0.8;   // cft of cement → bags
    const CFT_PER_BAG = 1.2;  // sand / khoa "bag" conversion

    const CALC = {
        roof: {
            ratios: ['ratio1', 'ratio2', 'ratio3'],
            run(v) {
                const sum = ratioSum(v, this.ratios);
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
                    row(t('r.avgLW'), `${num(length)} × ${num(width)}`, t('u.ft')),
                    row(t('r.area'), num(area), t('u.sqft')),
                    row(t('r.totalVolume'), num(volume), t('u.cft')),
                    row(t('r.dryVolume'), num(dry), t('u.cft')),
                    row(t('r.ratio'), ratioText(v.ratio1, v.ratio2, v.ratio3)),
                    heading(t('grp.materials')),
                    row(t('mat.cement'), num(cement), t('u.cft')),
                    row(t('r.cementBags'), num(cement * CEMENT_BAG), t('u.bags'), true),
                    row(t('mat.sand'), num(sand), t('u.cft')),
                    row(t('r.sandBags'), num(sand / CFT_PER_BAG), t('u.bags'), true),
                    row(t('mat.khoa'), num(khoa), t('u.cft')),
                    row(t('r.khoaBags'), num(khoa / CFT_PER_BAG), t('u.bags'), true),
                ];
            },
        },

        column: {
            ratios: ['ratio1', 'ratio2', 'ratio3'],
            run(v) {
                const sum = ratioSum(v, this.ratios);
                const volume = v.colLength * (v.colWidth / 12) * (v.colThickness / 12);
                const dry = volume * DRY_FACTOR;
                const cement = (dry / sum) * v.ratio1;
                const bagsCement = cement * CEMENT_BAG;
                const sand = (dry / sum) * v.ratio2;
                const khoa = (dry / sum) * v.ratio3;
                const bricksForKhoa = Math.ceil(khoa * 9 - 1e-9);

                const cementCost = bagsCement * v.cementPrice;
                const sandCost = sand * v.sandPrice;
                const khoaCost = khoa * v.khoaPrice;

                return [
                    row(t('r.workVolume'), num(volume), t('u.cft')),
                    row(t('r.dryVolume'), num(dry), t('u.cft')),
                    row(t('r.ratio'), ratioText(v.ratio1, v.ratio2, v.ratio3)),
                    heading(t('grp.materials')),
                    row(t('mat.cement'), num(cement), t('u.cft')),
                    row(t('r.cementBags'), num(bagsCement), t('u.bags'), true),
                    row(t('mat.sand'), num(sand), t('u.cft')),
                    row(t('r.sandBags'), num(sand / CFT_PER_BAG), t('u.bags'), true),
                    row(t('mat.khoa'), num(khoa), t('u.cft')),
                    row(t('r.khoaBags'), num(khoa / CFT_PER_BAG), t('u.bags'), true),
                    row(t('r.bricksKhoa'), num(bricksForKhoa, 0), t('u.pcs'), true),
                    heading(t('grp.priceCalc')),
                    row(t('r.cementCost'), num(cementCost), t('u.taka')),
                    row(t('r.sandCost'), num(sandCost), t('u.taka')),
                    row(t('r.khoaCost'), num(khoaCost), t('u.taka')),
                    total(t('r.totalCost'), num(cementCost + sandCost + khoaCost), t('u.taka')),
                ];
            },
        },

        wall: {
            ratios: ['ratio1', 'ratio2'],
            run(v) {
                const sum = ratioSum(v, this.ratios);
                const volume = v.wallLength * v.wallHeight * (v.brickThickness / 12);
                const bricks = Math.ceil(volume * 12 - 1e-9);
                const dryMix = volume * 0.35;
                const cement = (dryMix / sum) * v.ratio1;
                const sand = (dryMix / sum) * v.ratio2;
                return [
                    row(t('r.workVolume'), num(volume), t('u.cft')),
                    row(t('r.bricks'), num(bricks, 0), t('u.pcs'), true),
                    row(t('r.dryMix'), num(dryMix), t('u.cft')),
                    row(t('r.ratio'), ratioText(v.ratio1, v.ratio2)),
                    heading(t('grp.materials')),
                    row(t('mat.cement'), num(cement), t('u.cft')),
                    row(t('r.cementBags'), num(cement * CEMENT_BAG), t('u.bags'), true),
                    row(t('mat.sand'), num(sand), t('u.cft')),
                    row(t('r.sandBags'), num(sand / CFT_PER_BAG), t('u.bags'), true),
                ];
            },
        },

        plaster: {
            ratios: ['ratio1', 'ratio2'],
            run(v) {
                const sum = ratioSum(v, this.ratios);
                const area = v.wallLength * v.wallHeight;
                const volume = area * (v.plasterThickness / 12);
                const dry = volume * DRY_FACTOR;
                const cement = (dry / sum) * v.ratio1;
                const sand = (dry / sum) * v.ratio2;
                return [
                    row(t('r.workArea'), num(area), t('u.sqft')),
                    row(t('r.totalVolume'), num(volume), t('u.cft')),
                    row(t('r.dryVolume'), num(dry), t('u.cft')),
                    row(t('r.ratio'), ratioText(v.ratio1, v.ratio2)),
                    heading(t('grp.materials')),
                    row(t('mat.cement'), num(cement), t('u.cft')),
                    row(t('r.cementBags'), num(cement * CEMENT_BAG), t('u.bags'), true),
                    row(t('mat.sand'), num(sand), t('u.cft')),
                    row(t('r.sandBags'), num(sand / CFT_PER_BAG), t('u.bags'), true),
                ];
            },
        },

        steel: {
            ratios: [],
            run(v) {
                // bars across a span = span / spacing + 1 (rounded up); computed in inches to avoid float error
                const barCount = (spanFt) => Math.ceil(+((spanFt * 12) / v.gap).toFixed(6)) + 1;
                const barsA = barCount(v.length);   // each runs across the width
                const barsB = barCount(v.width);    // each runs across the length
                const totalLength = barsA * v.width + barsB * v.length;
                const waste = totalLength * (v.wastage / 100);
                const subTotal = totalLength + waste;
                const kgPerFt = (v.mm ** 2) / 532.2;
                const ft = t('u.ft');
                return [
                    row(t('r.bars', { len: `${numPlain(v.width)} ${ft}` }), num(barsA, 0), t('u.pcs')),
                    row(t('r.bars', { len: `${numPlain(v.length)} ${ft}` }), num(barsB, 0), t('u.pcs')),
                    row(t('r.rodLength'), num(totalLength), t('u.rft')),
                    row(t('r.wastage', { p: numPlain(v.wastage) }), num(waste), t('u.rft')),
                    row(t('r.subTotal'), num(subTotal), t('u.rft')),
                    row(t('r.kgPerFt', { mm: numPlain(v.mm) }), num(kgPerFt, 3), t('u.kgft')),
                    total(t('r.rodTotal'), num(subTotal * kgPerFt), t('u.kg')),
                ];
            },
        },
    };

    /* ---------- Rendering ---------- */
    const lastValues = {};

    function renderItems(items) {
        let html = '';
        let listOpen = false;
        const closeList = () => { if (listOpen) { html += '</ul>'; listOpen = false; } };
        items.forEach((it) => {
            if (it.type === 'title') {
                closeList();
                html += `<p class="group-title result-sub">${escapeHtml(it.text)}</p>`;
            } else if (it.type === 'total') {
                closeList();
                html += `<div class="total-box"><span class="label">${escapeHtml(it.label)}</span>
                         <span class="value">${escapeHtml(it.value)}<small>${escapeHtml(it.unit)}</small></span></div>`;
            } else {
                if (!listOpen) { html += '<ul class="result-list">'; listOpen = true; }
                html += `<li class="result-row${it.key ? ' key' : ''}">
                            <span class="label">${escapeHtml(it.label)}</span>
                            <span class="value">${escapeHtml(it.value)}${it.unit ? `<small>${escapeHtml(it.unit)}</small>` : ''}</span>
                         </li>`;
            }
        });
        closeList();
        return html;
    }

    function inputsSummary(form, v) {
        return $$('input[data-num]', form).map((inp) => {
            const field = inp.closest('.field');
            let label = $('label', field).textContent;
            if (field.closest('.fields.ratio')) label = `${t('grp.ratio')} · ${label}`;
            const unitEl = $('.unit', field);
            let unit = unitEl ? unitEl.textContent : '';
            if (inp.name === 'height') unit = t(v.heightUnit === 'feet' ? 'unit.feet' : 'unit.inches');
            return `<div>${escapeHtml(label)}: <strong>${escapeHtml(numPlain(v[inp.name]))} ${escapeHtml(unit)}</strong></div>`;
        }).join('');
    }

    function renderResult(id, v) {
        const card = $('#result-' + id);
        const form = $(`form[data-calc="${id}"]`);
        $('.result-output', card).innerHTML = renderItems(CALC[id].run(v));
        const date = new Date().toLocaleString(S.lang === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
        $('.print-head', card).innerHTML = `<strong>${escapeHtml(t('brand.name'))} — ${escapeHtml(t('page.' + id))}</strong><span>${escapeHtml(digits(date))}</span>`;
        $('.print-inputs', card).innerHTML = inputsSummary(form, v);
        $('[data-print]', card).disabled = false;
    }

    function resetResult(id) {
        const card = $('#result-' + id);
        $('.result-output', card).innerHTML = `
            <div class="empty">
                <div class="empty-icon"><i class="fa-solid fa-calculator"></i></div>
                <p>${escapeHtml(t('calc.empty'))}</p>
            </div>`;
        $('.print-head', card).innerHTML = '';
        $('.print-inputs', card).innerHTML = '';
        $('[data-print]', card).disabled = true;
    }

    /* ---------- Remember inputs ---------- */
    function saveInputs(form) {
        if (!S.remember) return;
        const all = storage.get(STORE_INPUTS, {});
        const data = {};
        $$('input[data-num]', form).forEach((inp) => { data[inp.name] = inp.value; });
        $$('input[type="radio"]:checked', form).forEach((r) => { data[r.name] = r.value; });
        all[form.dataset.calc] = data;
        storage.set(STORE_INPUTS, all);
    }
    function restoreInputs(form) {
        if (!S.remember) return;
        const data = storage.get(STORE_INPUTS, {})[form.dataset.calc];
        if (!data) return;
        $$('input[data-num]', form).forEach((inp) => { if (data[inp.name] != null) inp.value = data[inp.name]; });
        $$('input[type="radio"]', form).forEach((r) => { if (data[r.name] != null) r.checked = data[r.name] === r.value; });
    }

    /* ---------- Wire up calculator forms ---------- */
    $$('form[data-calc]').forEach((form) => {
        const id = form.dataset.calc;
        restoreInputs(form);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const v = readForm(form);
            const ratios = CALC[id].ratios;
            const fail = () => { delete lastValues[id]; resetResult(id); };
            if (v && ratios.length && ratioSum(v, ratios) <= 0) {
                ratios.forEach((n) => setError(form.elements[n], 'err.ratio'));
                $(`[name="${ratios[0]}"]`, form).focus();
                fail();
                return;
            }
            if (!v) {
                const bad = $('.field.invalid input', form);
                if (bad) bad.focus();
                fail();
                return;
            }
            lastValues[id] = v;
            renderResult(id, v);
            saveInputs(form);
            if (window.matchMedia('(max-width: 1100px)').matches) {
                $('#result-' + id).scrollIntoView({ behavior: S.motion ? 'auto' : 'smooth', block: 'start' });
            }
        });

        form.addEventListener('reset', () => {
            // let the browser clear values first, then sync state
            setTimeout(() => {
                $$('.field.invalid', form).forEach((f) => f.classList.remove('invalid'));
                $$('.field-error', form).forEach((e) => { delete e.dataset.err; e.textContent = ''; });
                delete lastValues[id];
                resetResult(id);
                saveInputs(form);
            });
        });

        form.addEventListener('input', (e) => {
            const field = e.target.closest('.field.invalid');
            if (field) field.classList.remove('invalid');
            saveInputs(form);
        });
        form.addEventListener('change', () => saveInputs(form));
    });

    // Print only the active result card (layout handled by @media print CSS)
    $$('[data-print]').forEach((btn) => btn.addEventListener('click', () => window.print()));

    /* =========================================================
       About: client inquiry  |  Contact: review
       ========================================================= */
    $('#inquiry-form').addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Client inquiry:', Object.fromEntries(new FormData(e.target)));
        toast(t('inq.ok'));
        e.target.reset();
    });

    const reviewForm = $('#review-form');
    function updateRatingText() {
        const checked = $('input[name="rating"]:checked', reviewForm);
        $('#rating-text').textContent = checked ? t('rate.' + checked.value) : '';
    }
    reviewForm.addEventListener('change', (e) => { if (e.target.name === 'rating') updateRatingText(); });
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Review:', Object.fromEntries(new FormData(reviewForm)));
        toast(t('rev.ok'));
        reviewForm.reset();
        updateRatingText();
    });

    /* ---------- Init ---------- */
    route();
    applyAll();
})();