/* =========================================================
   Construction Solution — script.js
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
            'brand.name': 'Construction Solution',
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
            'home.title': 'Welcome to <span>Construction Solution</span>',
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
            'feat4.t': 'Live 3D Visualization', 'feat4.d': 'See the real shape of your roof, column, wall, plaster or rods in 3D while you type.',
            'sc.kicker': 'New',
            'sc.title': 'See your measurements in 3D',
            'sc.sub': 'As soon as you type a measurement, the real shape of your roof, column, wall, plaster or steel appears in 3D — rotate and zoom to check it.',
            'sc.p1': 'Updates instantly as you type',
            'sc.p2': 'Every measurement labelled around the shape',
            'sc.p3': 'Uneven roofs drawn in their real shape',
            'sc.p4': 'Rotate & zoom — on mobile too',
            'sc.cta': 'Try it in 3D',
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

            'viz.title': '3D Preview',
            'viz.hint': 'Drag to rotate · scroll to zoom · double-click to reset',
            'viz.hintTouch': 'Swipe sideways to rotate · pinch to zoom',
            'viz.sample': 'Sample size',
            'viz.live': 'Live — your measurements',
            'viz.reset': 'Reset view',
            'viz.rotate': 'Auto-rotate',
            'viz.nogl': '3D preview is not supported in this browser.',
            'viz.plaster': 'Plaster',
            'viz.bars': 'Bars',
            'viz.bricks': 'Bricks',
            'viz.simplified': 'Fewer bars drawn for clarity',

            'viz.areaCalc': 'Area (used in calculation)',
            'viz.areaShape': 'Area of actual shape',
            'viz.rightAngle': 'Corner between first length and first width is taken as 90°',
            'viz.noShape': 'These four sides can’t close into a shape — showing the average size',
            'set.icon': 'Site icon',
            'set.icon.d': 'Shown next to the URL in the browser tab.',
            'icon.upload': 'Upload',
            'icon.delete': 'Delete',
            'icon.default': 'Default icon',
            'icon.custom': 'Your icon',
            'icon.saved': 'Site icon updated',
            'icon.removed': 'Default icon restored',
            'icon.bad': 'Please choose an image file (max 5 MB)',

            'err.required': 'Please fill in this field',
            'err.number': 'Enter a valid number',
            'err.negative': 'Negative values are not allowed',
            'err.positive': 'Value must be greater than 0',
            'err.ratio': 'Ratios must add up to more than 0',

            'about.title': 'About Us',
            'about.intro': 'Welcome to Construction Solution! This tool is designed to assist you with various construction calculations, ensuring your projects run smoothly and efficiently.',
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
            'brand.name': 'কনস্ট্রাকশন সলিউশন',
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
            'home.title': '<span>কনস্ট্রাকশন সলিউশনে</span> স্বাগতম',
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
            'feat4.t': 'লাইভ ৩ডি ভিজ্যুয়ালাইজেশন', 'feat4.d': 'মাপ লেখার সাথে সাথে ছাদ, কলাম, দেওয়াল, প্লাস্টার ও রডের আসল আকৃতি ৩ডি-তে দেখুন।',
            'sc.kicker': 'নতুন',
            'sc.title': 'আপনার মাপ দেখুন ৩ডি-তে',
            'sc.sub': 'মাপ লেখার সাথে সাথেই ছাদ, কলাম, দেওয়াল, প্লাস্টার বা রডের আসল আকৃতি ৩ডি-তে ভেসে উঠবে — ঘুরিয়ে, জুম করে মিলিয়ে নিন।',
            'sc.p1': 'টাইপ করার সাথে সাথে আপডেট',
            'sc.p2': 'আকৃতির চারপাশে প্রতিটি মাপ লেখা',
            'sc.p3': 'বাঁকা ছাদও আসল আকৃতিতে',
            'sc.p4': 'ঘোরান ও জুম করুন — মোবাইলেও',
            'sc.cta': '৩ডি-তে দেখুন',
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

            'viz.title': '৩ডি প্রিভিউ',
            'viz.hint': 'ঘোরাতে টানুন · জুম করতে স্ক্রল · রিসেট করতে ডাবল-ক্লিক',
            'viz.hintTouch': 'ঘোরাতে পাশে সোয়াইপ করুন · জুম করতে পিঞ্চ',
            'viz.sample': 'নমুনা মাপ',
            'viz.live': 'লাইভ — আপনার মাপ',
            'viz.reset': 'ভিউ রিসেট',
            'viz.rotate': 'অটো ঘোরানো',
            'viz.nogl': 'এই ব্রাউজারে ৩ডি প্রিভিউ চলে না।',
            'viz.plaster': 'প্লাস্টার',
            'viz.bars': 'রড',
            'viz.bricks': 'ইট',
            'viz.simplified': 'স্পষ্টতার জন্য কম রড আঁকা হয়েছে',

            'viz.areaCalc': 'ক্ষেত্রফল (হিসাবে ধরা)',
            'viz.areaShape': 'আসল আকৃতির ক্ষেত্রফল',
            'viz.rightAngle': 'প্রথম দৈর্ঘ্য ও প্রথম প্রস্থের কোণ ৯০° ধরা হয়েছে',
            'viz.noShape': 'এই চার মাপে আকৃতি মেলে না — গড় মাপে দেখানো হচ্ছে',
            'set.icon': 'সাইট আইকন',
            'set.icon.d': 'ব্রাউজার ট্যাবে URL-এর পাশে দেখাবে।',
            'icon.upload': 'আপলোড',
            'icon.delete': 'মুছুন',
            'icon.default': 'ডিফল্ট আইকন',
            'icon.custom': 'আপনার আইকন',
            'icon.saved': 'সাইট আইকন বদলানো হয়েছে',
            'icon.removed': 'ডিফল্ট আইকন ফিরে এসেছে',
            'icon.bad': 'একটি ছবি ফাইল বেছে নিন (সর্বোচ্চ ৫ MB)',

            'err.required': 'এই ঘরটি পূরণ করুন',
            'err.number': 'সঠিক সংখ্যা দিন',
            'err.negative': 'ঋণাত্মক মান গ্রহণযোগ্য নয়',
            'err.positive': 'মান ০ এর বেশি হতে হবে',
            'err.ratio': 'রেশিওর যোগফল ০ এর বেশি হতে হবে',

            'about.title': 'আমাদের সম্পর্কে',
            'about.intro': 'কনস্ট্রাকশন সলিউশনে স্বাগতম! নির্মাণ কাজের নানা হিসাব সহজ করতে এই টুলটি তৈরি, যাতে আপনার প্রজেক্ট সুন্দর ও দক্ষভাবে এগিয়ে যায়।',
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
        theme: 'system', accent: 'teal', fontSize: 'm',
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
    const ACCENTS = ['teal', 'gold', 'blue', 'purple', 'orange', 'rose'];
    if (!ACCENTS.includes(S.accent)) S.accent = DEFAULTS.accent;

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
        const meta = $('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#162032' : '#eef2f5');
        syncMenuBtn();
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
        syncMenuBtn();

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
        applyFavicon();
        VIZ.refreshAll();
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

    /* =========================================================
       Site icon (favicon) — upload / delete from Settings
       ========================================================= */
    const STORE_ICON = 'cc.favicon';
    const rawGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const rawSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
    const rawRemove = (k) => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };

    // default icon: a house in the current accent colour
    function defaultIcon() {
        const cs = getComputedStyle(root);
        const c1 = cs.getPropertyValue('--brand').trim() || '#0d9488';
        const c2 = cs.getPropertyValue('--brand-600').trim() || '#0f766e';
        const fg = cs.getPropertyValue('--on-brand').trim() || '#ffffff';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><path d="M32 12 11 30h6v21h11V39h8v12h11V30h6z" fill="${fg}"/></svg>`;
        return 'data:image/svg+xml,' + encodeURIComponent(svg);
    }
    function applyFavicon() {
        const custom = rawGet(STORE_ICON);
        const href = custom || defaultIcon();
        $('#favicon').href = href;
        $('#icon-preview').src = href;
        $('#icon-state').textContent = t(custom ? 'icon.custom' : 'icon.default');
        $('#icon-delete').disabled = !custom;
    }
    $('#icon-file').addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file) return;
        if (!/^image\//.test(file.type) || file.size > 5 * 1024 * 1024) { toast(t('icon.bad')); return; }
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                // shrink to 64×64 so it fits comfortably in localStorage
                const size = 64;
                const c = document.createElement('canvas');
                c.width = c.height = size;
                const ctx = c.getContext('2d');
                const w = img.naturalWidth || size, h = img.naturalHeight || size;
                const k = Math.min(size / w, size / h);
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, (size - w * k) / 2, (size - h * k) / 2, w * k, h * k);
                let url;
                try { url = c.toDataURL('image/png'); } catch (err) { url = reader.result; }
                if (!rawSet(STORE_ICON, url)) { toast(t('icon.bad')); return; }
                applyFavicon();
                toast(t('icon.saved'));
            };
            img.onerror = () => toast(t('icon.bad'));
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
    $('#icon-delete').addEventListener('click', () => {
        rawRemove(STORE_ICON);
        applyFavicon();
        toast(t('icon.removed'));
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

    /* =========================================================
       Sidebar (mobile off-canvas)
       ========================================================= */
    const sidebar = $('#sidebar');
    const sideScrim = $('#side-scrim');
    const menuBtn = $('#menu-btn');
    const isMobile = () => window.matchMedia('(max-width: 1023.98px)').matches;

    // Hamburger: on mobile it opens/closes the off-canvas sidebar,
    // on desktop it switches between the full and icon-only sidebar.
    function syncMenuBtn() {
        if (!menuBtn) return;
        const expanded = isMobile() ? sidebar.classList.contains('open') : !S.compact;
        menuBtn.setAttribute('aria-expanded', String(expanded));
        const label = isMobile()
            ? t(expanded ? 'a11y.closeMenu' : 'a11y.openMenu')
            : t(S.compact ? 'nav.expand' : 'nav.collapse');
        menuBtn.setAttribute('aria-label', label);
        menuBtn.title = label;
    }

    function openSidebar() {
        sidebar.classList.add('open');
        sideScrim.classList.add('show');
        document.body.classList.add('lock');
        syncMenuBtn();
    }
    function closeSidebar() {
        if (!sidebar.classList.contains('open')) return;
        sidebar.classList.remove('open');
        sideScrim.classList.remove('show');
        syncMenuBtn();
        if (!drawer.classList.contains('open')) document.body.classList.remove('lock');
    }
    menuBtn.addEventListener('click', () => {
        if (isMobile()) (sidebar.classList.contains('open') ? closeSidebar : openSidebar)();
        else setSetting('compact', !S.compact);
    });
    $('#side-close').addEventListener('click', closeSidebar);
    sideScrim.addEventListener('click', closeSidebar);
    window.addEventListener('resize', () => { if (!isMobile()) closeSidebar(); syncMenuBtn(); });

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
        VIZ.show(id);
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

    // bars across a span = span / spacing + 1 (rounded up); computed in inches to avoid float error
    const barCount = (spanFt, gapIn) => Math.ceil(+((spanFt * 12) / gapIn).toFixed(6)) + 1;

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
                const barsA = barCount(v.length, v.gap);   // each runs across the width
                const barsB = barCount(v.width, v.gap);    // each runs across the length
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

    /* =========================================================
       3D preview (three.js) — redraws live as measurements are typed
       ========================================================= */
    const VIZ = (() => {
        // sample sizes shown until the user types their own
        const DEF = {
            roof:    { firstLength: 20, secondLength: 20, firstWidth: 12, secondWidth: 12, height: 5 },
            column:  { colLength: 10, colWidth: 12, colThickness: 12 },
            wall:    { wallLength: 12, wallHeight: 10, brickThickness: 5 },
            plaster: { wallLength: 12, wallHeight: 10, plasterThickness: 0.75 },
            steel:   { length: 16, width: 10, gap: 6, mm: 10 },
        };
        const SIZE = 4;          // longest side, in scene units
        const MAX_BARS = 90;     // per direction, for clarity / performance
        const cards = {};
        const viewers = {};
        let active = null;

        const glOK = (() => {
            try {
                if (typeof THREE === 'undefined' || !window.WebGLRenderingContext) return false;
                const c = document.createElement('canvas');
                return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
            } catch (e) { return false; }
        })();

        const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
        const fv = (n, unitKey) => `${numPlain(n)} ${t(unitKey)}`;
        const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

        function readValues(id) {
            const form = $(`form[data-calc="${id}"]`);
            const v = {};
            let live = false;
            Object.keys(DEF[id]).forEach((k) => {
                // query by name: form.elements['length'] would return the element count
                const n = parseNum($(`input[name="${k}"]`, form).value);
                if (Number.isFinite(n) && n > 0) { v[k] = n; live = true; } else v[k] = DEF[id][k];
            });
            const unit = $('input[name="heightUnit"]:checked', form);
            v.heightUnit = unit ? unit.value : 'inches';
            return { v, live };
        }

        // Real plot shape from four sides. A = front-left corner, 90° between
        // AB (first length) and AD (first width); DC = second length, BC = second width.
        function roofQuad(L1, L2, W1, W2) {
            const A = [0, 0], B = [L1, 0], D = [0, W1];
            const ex = B[0] - D[0], ey = B[1] - D[1], d = Math.hypot(ex, ey);
            if (!(d > 0) || d > L2 + W2 + 1e-9 || d < Math.abs(L2 - W2) - 1e-9) return null;
            const a = (L2 * L2 - W2 * W2 + d * d) / (2 * d);
            const h = Math.sqrt(Math.max(L2 * L2 - a * a, 0));
            const px = D[0] + a * ex / d, py = D[1] + a * ey / d;
            const c1 = [px + h * ey / d, py - h * ex / d], c2 = [px - h * ey / d, py + h * ex / d];
            const side = (p) => ex * (p[1] - D[1]) - ey * (p[0] - D[0]);
            const C = side(c1) * side(A) < 0 ? c1 : c2;     // C on the far side of diagonal BD
            return [A, B, C, D];
        }
        const polyArea = (P) => Math.abs(P.reduce((sum, p, i) => {
            const q = P[(i + 1) % P.length];
            return sum + p[0] * q[1] - q[0] * p[1];
        }, 0)) / 2;

        const steelSteps = (v) => {
            const a = barCount(v.length, v.gap), b = barCount(v.width, v.gap);
            return { a, b, simplified: a > MAX_BARS || b > MAX_BARS };
        };

        /* ---------- info chips (work without WebGL too) ---------- */
        const CHIPS = {
            roof(v) {
                const L = (v.firstLength + v.secondLength) / 2, W = (v.firstWidth + v.secondWidth) / 2;
                const q = roofQuad(v.firstLength, v.secondLength, v.firstWidth, v.secondWidth);
                const chips = [
                    [t('f.firstLength'), fv(v.firstLength, 'u.ft')],
                    [t('f.secondLength'), fv(v.secondLength, 'u.ft')],
                    [t('f.firstWidth'), fv(v.firstWidth, 'u.ft')],
                    [t('f.secondWidth'), fv(v.secondWidth, 'u.ft')],
                    [t('grp.thickness'), fv(v.height, v.heightUnit === 'feet' ? 'u.ft' : 'u.inch')],
                    [t('viz.areaCalc'), `${num(L * W)} ${t('u.sqft')}`],
                ];
                if (q) chips.push([t('viz.areaShape'), `${num(polyArea(q))} ${t('u.sqft')}`]);
                return chips;
            },
            column(v) {
                return [
                    [t('f.colLength'), fv(v.colLength, 'u.ft')],
                    [t('f.colWidth'), fv(v.colWidth, 'u.inch')],
                    [t('f.colThickness'), fv(v.colThickness, 'u.inch')],
                    [t('r.workVolume'), `${num(v.colLength * v.colWidth * v.colThickness / 144)} ${t('u.cft')}`],
                ];
            },
            wall(v) {
                const vol = v.wallLength * v.wallHeight * (v.brickThickness / 12);
                return [
                    [t('f.wallLength'), fv(v.wallLength, 'u.ft')],
                    [t('f.wallHeight'), fv(v.wallHeight, 'u.ft')],
                    [t('f.brickThickness'), fv(v.brickThickness, 'u.inch')],
                    [t('viz.bricks'), `≈ ${num(Math.ceil(vol * 12 - 1e-9), 0)} ${t('u.pcs')}`],
                ];
            },
            plaster(v) {
                return [
                    [t('f.wallLength'), fv(v.wallLength, 'u.ft')],
                    [t('f.wallHeight'), fv(v.wallHeight, 'u.ft')],
                    [t('f.plasterThickness'), fv(v.plasterThickness, 'u.inch')],
                    [t('r.workArea'), `${num(v.wallLength * v.wallHeight)} ${t('u.sqft')}`],
                ];
            },
            steel(v) {
                const s = steelSteps(v);
                return [
                    [t('grp.length'), fv(v.length, 'u.ft')],
                    [t('grp.width'), fv(v.width, 'u.ft')],
                    [t('f.gap'), fv(v.gap, 'u.inch')],
                    [t('f.mm'), fv(v.mm, 'u.mm')],
                    [t('viz.bars'), `${num(s.a, 0)} + ${num(s.b, 0)} ${t('u.pcs')}`],
                ];
            },
        };

        /* ---------- shared textures ---------- */
        const texCache = {};
        function canvasTex(key, w, h, draw, srgb = true) {
            if (texCache[key]) return texCache[key];
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            draw(c.getContext('2d'), w, h);
            const tx = new THREE.CanvasTexture(c);
            if (srgb) tx.encoding = THREE.sRGBEncoding;
            tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
            tx.userData = { cached: true };
            texCache[key] = tx;
            return tx;
        }
        const concreteTex = () => canvasTex('concrete', 128, 128, (g, w, h) => {
            g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
            for (let i = 0; i < 1500; i++) {
                const s = 226 + (Math.random() * 29 | 0);
                g.fillStyle = `rgb(${s},${s},${s})`;
                g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
            }
        });
        const brickTex = () => canvasTex('brick', 256, 128, (g, w, h) => {
            g.fillStyle = '#d9d0c3'; g.fillRect(0, 0, w, h);          // mortar
            const rows = 4, rh = h / rows, bw = w / 2;
            for (let r = 0; r < rows; r++) {
                const off = (r % 2) * bw / 2;
                for (let c = -1; c < 3; c++) {
                    g.fillStyle = `hsl(${10 + Math.random() * 8}, 50%, ${40 + Math.random() * 8}%)`;
                    g.fillRect(c * bw + off + 3, r * rh + 3, bw - 6, rh - 6);
                }
            }
        });
        const shadowTex = () => canvasTex('shadow', 128, 128, (g, w, h) => {
            const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
            gr.addColorStop(0, 'rgba(15,23,42,.32)');
            gr.addColorStop(1, 'rgba(15,23,42,0)');
            g.fillStyle = gr; g.fillRect(0, 0, w, h);
        }, false);

        function colors() {
            const cs = getComputedStyle(root);
            const dark = root.getAttribute('data-theme') === 'dark';
            return {
                dark,
                brand: cs.getPropertyValue('--brand').trim() || '#0d9488',
                onBrand: cs.getPropertyValue('--on-brand').trim() || '#ffffff',
                edge: dark ? 0xcbd5e1 : 0x334155,
                grid: dark ? 0x64748b : 0x94a3b8,
                concrete: dark ? 0xa7b0ba : 0xc3c9d0,
            };
        }

        function makeLabel(text, C) {
            const family = `"Noto Sans Bengali", Poppins, system-ui, sans-serif`;
            const font = `600 40px ${family}`;
            const c = document.createElement('canvas');
            let ctx = c.getContext('2d');
            ctx.font = font;
            const h = 64, w = Math.ceil(ctx.measureText(text).width) + 36;
            c.width = w; c.height = h;
            ctx = c.getContext('2d');
            ctx.fillStyle = C.brand;
            ctx.beginPath();
            const r = h / 2;
            ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.arc(w - r, r, r, -Math.PI / 2, Math.PI / 2);
            ctx.lineTo(r, h); ctx.arc(r, r, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fill();
            ctx.font = font; ctx.fillStyle = C.onBrand; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(text, w / 2, h / 2 + 2);
            const tx = new THREE.CanvasTexture(c);
            tx.encoding = THREE.sRGBEncoding;
            tx.anisotropy = 4;
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true }));
            const sh = 0.3;
            sp.scale.set(sh * w / h, sh, 1);
            sp.renderOrder = 10;
            return sp;
        }

        /* ---------- scene builders (everything normalised to SIZE units) ---------- */
        function buildScene(id, v, C) {
            const g = new THREE.Group();
            const V = (x, y, z) => new THREE.Vector3(x, y, z);
            const edgeMat = new THREE.LineBasicMaterial({ color: C.edge, transparent: true, opacity: C.dark ? .35 : .4 });
            const concrete = () => new THREE.MeshStandardMaterial({ color: C.concrete, roughness: .92, metalness: 0, map: concreteTex() });

            function box(w, h, d, mat, x, y, z) {
                const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
                m.position.set(x, y, z);
                g.add(m);
                const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), edgeMat);
                e.position.copy(m.position);
                g.add(e);
                return m;
            }
            function ground(w, d) {
                const s = new THREE.Mesh(
                    new THREE.PlaneGeometry(w * 1.7 + .6, d * 1.7 + .6),
                    new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false })
                );
                s.rotation.x = -Math.PI / 2; s.position.y = .002;
                g.add(s);
                const grid = new THREE.GridHelper(10, 20, C.grid, C.grid);
                grid.material.transparent = true; grid.material.opacity = C.dark ? .18 : .25;
                g.add(grid);
            }
            function dim(a, b, off, text) {
                const a2 = a.clone().add(off), b2 = b.clone().add(off);
                const line = new THREE.LineSegments(
                    new THREE.BufferGeometry().setFromPoints([a, a2, b, b2, a2, b2]),
                    new THREE.LineBasicMaterial({ color: C.brand, transparent: true, opacity: .9, depthTest: false })
                );
                line.renderOrder = 9;
                g.add(line);
                const lab = makeLabel(text, C);
                lab.position.copy(a2).lerp(b2, .5).add(off.clone().setLength(.2));
                g.add(lab);
            }
            function brickMaterials(lenFt, hFt, tFt) {
                const face = (rx, ry) => {
                    const tx = brickTex().clone();
                    tx.userData = {};
                    tx.needsUpdate = true;
                    tx.repeat.set(Math.max(rx, .05), Math.max(ry, .05));
                    return new THREE.MeshStandardMaterial({ map: tx, roughness: .95 });
                };
                // texture tile = 20in × 12in (2 bricks × 4 courses)
                const front = face(lenFt * .6, hFt), side = face(tFt * .6, hFt), top = face(lenFt * .6, tFt);
                return [side, side, top, top, front, front];
            }

            let bbox;
            if (id === 'roof') {
                const T = v.heightUnit === 'feet' ? v.height : v.height / 12;
                const unitKey = v.heightUnit === 'feet' ? 'u.ft' : 'u.inch';
                let q = roofQuad(v.firstLength, v.secondLength, v.firstWidth, v.secondWidth);
                const exact = !!q;
                const Lavg = (v.firstLength + v.secondLength) / 2, Wavg = (v.firstWidth + v.secondWidth) / 2;
                if (!q) q = [[0, 0], [Lavg, 0], [Lavg, Wavg], [0, Wavg]];   // sides can't close → average rectangle

                const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
                const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
                const spanX = maxX - minX, spanY = maxY - minY;
                const k = SIZE / Math.max(spanX, spanY, T);
                const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
                // plan (x, y) → scene (x, -z): first length runs along the front, nearest the camera
                const P = q.map(([px, py]) => V((px - cx) * k, 0, -(py - cy) * k));
                const y = Math.max(T * k, .05), lift = .9;

                const shape = new THREE.Shape(P.map((p) => new THREE.Vector2(p.x, -p.z)));
                const geo = new THREE.ExtrudeGeometry(shape, { depth: y, bevelEnabled: false });
                geo.rotateX(-Math.PI / 2);
                const slab = new THREE.Mesh(geo, concrete());
                slab.position.y = lift;
                g.add(slab);
                const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
                edges.position.y = lift;
                g.add(edges);

                // light support posts at the corners (context only, not to scale)
                const ghost = new THREE.MeshStandardMaterial({ color: C.concrete, transparent: true, opacity: .35, roughness: 1 });
                const cs = Math.min(.14, Math.min(spanX, spanY) * k * .08);
                P.forEach((p) => {
                    const pos = p.clone();
                    const len = pos.length();
                    if (len > 0) pos.multiplyScalar(Math.max(0, 1 - (cs * 1.3) / len));
                    const m = new THREE.Mesh(new THREE.BoxGeometry(cs, lift, cs), ghost);
                    m.position.set(pos.x, lift / 2, pos.z);
                    g.add(m);
                });
                ground(spanX * k, spanY * k);

                // all four sides labelled around the shape
                const sides = exact
                    ? [[0, 1, v.firstLength, 'f.firstLength'], [1, 2, v.secondWidth, 'f.secondWidth'],
                       [3, 2, v.secondLength, 'f.secondLength'], [0, 3, v.firstWidth, 'f.firstWidth']]
                    : [[0, 1, Lavg], [1, 2, Wavg], [3, 2, Lavg], [0, 3, Wavg]];
                sides.forEach(([i, j, val, key]) => {
                    const pa = P[i].clone().setY(lift), pb = P[j].clone().setY(lift);
                    const dir = pb.clone().sub(pa);
                    const n = V(dir.z, 0, -dir.x).normalize();
                    const mid = pa.clone().lerp(pb, .5);
                    if (n.dot(V(mid.x, 0, mid.z)) < 0) n.negate();          // point away from the centre
                    dim(pa, pb, n.multiplyScalar(.35), key ? `${t(key)} ${fv(val, 'u.ft')}` : fv(val, 'u.ft'));
                });
                // thickness at the front-left corner
                const out = V(P[0].x, 0, P[0].z).normalize().multiplyScalar(.3);
                dim(P[0].clone().setY(lift), P[0].clone().setY(lift + y), out, fv(v.height, unitKey));

                // right-angle mark on the assumed 90° corner
                if (exact) {
                    const sz = .22, top = lift + y + .004;
                    const u = P[1].clone().sub(P[0]).setY(0).normalize().multiplyScalar(sz);
                    const w = P[3].clone().sub(P[0]).setY(0).normalize().multiplyScalar(sz);
                    const a0 = P[0].clone().setY(top);
                    const mark = new THREE.LineSegments(
                        new THREE.BufferGeometry().setFromPoints([a0.clone().add(u), a0.clone().add(u).add(w), a0.clone().add(u).add(w), a0.clone().add(w)]),
                        new THREE.LineBasicMaterial({ color: C.brand, depthTest: false })
                    );
                    mark.renderOrder = 9;
                    g.add(mark);
                }
                bbox = { w: spanX * k, h: lift + y, d: spanY * k, cy: (lift + y) / 2 };
            }

            else if (id === 'column') {
                const H = v.colLength, w = v.colWidth / 12, d = v.colThickness / 12;
                const k = SIZE / Math.max(H, w, d);
                const X = Math.max(w * k, .05), Y = H * k, Z = Math.max(d * k, .05);
                box(X, Y, Z, concrete(), 0, Y / 2, 0);
                ground(Math.max(X, .8), Math.max(Z, .8));
                dim(V(-X / 2, 0, Z / 2), V(-X / 2, Y, Z / 2), V(-.35, 0, 0), fv(v.colLength, 'u.ft'));
                dim(V(-X / 2, 0, Z / 2), V(X / 2, 0, Z / 2), V(0, 0, .35), fv(v.colWidth, 'u.inch'));
                dim(V(X / 2, 0, -Z / 2), V(X / 2, 0, Z / 2), V(.35, 0, 0), fv(v.colThickness, 'u.inch'));
                bbox = { w: X, h: Y, d: Z, cy: Y / 2 };
            }

            else if (id === 'wall') {
                const L = v.wallLength, H = v.wallHeight, T = v.brickThickness / 12;
                const k = SIZE / Math.max(L, H, T);
                const X = L * k, Y = H * k, Z = Math.max(T * k, .04);
                box(X, Y, Z, brickMaterials(L, H, T), 0, Y / 2, 0);
                ground(X, Math.max(Z, .8));
                dim(V(-X / 2, 0, Z / 2), V(X / 2, 0, Z / 2), V(0, 0, .35), fv(L, 'u.ft'));
                dim(V(-X / 2, 0, Z / 2), V(-X / 2, Y, Z / 2), V(-.35, 0, 0), fv(H, 'u.ft'));
                dim(V(X / 2, Y, -Z / 2), V(X / 2, Y, Z / 2), V(.3, .15, 0), fv(v.brickThickness, 'u.inch'));
                bbox = { w: X, h: Y, d: Z, cy: Y / 2 };
            }

            else if (id === 'plaster') {
                const L = v.wallLength, H = v.wallHeight;
                const k = SIZE / Math.max(L, H);
                const X = L * k, Y = H * k;
                const tw = Math.max((5 / 12) * k, .05);                       // 5" brick wall behind
                const p = Math.max((v.plasterThickness / 12) * k, .025);     // plaster layer
                box(X, Y, tw, brickMaterials(L, H, 5 / 12), 0, Y / 2, 0);
                const cover = X * .72;                                       // partly applied, so bricks stay visible
                const plaster = new THREE.MeshStandardMaterial({ color: C.dark ? 0xd9d2c3 : 0xf1ebdd, roughness: 1, map: concreteTex() });
                box(cover, Y, p, plaster, -X / 2 + cover / 2, Y / 2, tw / 2 + p / 2);
                ground(X, .9);
                dim(V(-X / 2, 0, tw / 2 + p), V(X / 2, 0, tw / 2 + p), V(0, 0, .35), fv(L, 'u.ft'));
                dim(V(-X / 2, 0, tw / 2 + p), V(-X / 2, Y, tw / 2 + p), V(-.35, 0, 0), fv(H, 'u.ft'));
                dim(V(-X / 2 + cover, Y * .62, tw / 2), V(-X / 2 + cover, Y * .62, tw / 2 + p), V(.4, 0, .25),
                    `${t('viz.plaster')} ${fv(v.plasterThickness, 'u.inch')}`);
                bbox = { w: X, h: Y, d: tw + p, cy: Y / 2 };
            }

            else if (id === 'steel') {
                const L = v.length, W = v.width;
                const k = SIZE / Math.max(L, W);
                const X = L * k, Z = W * k, slabT = .16, y0 = .25;
                const slabMat = new THREE.MeshStandardMaterial({ color: C.concrete, transparent: true, opacity: .16, depthWrite: false });
                box(X, slabT, Z, slabMat, 0, y0, 0);
                const r = Math.max((v.mm / 304.8) / 2 * k, .009);
                const rodMat = new THREE.MeshStandardMaterial({ color: 0x9a6248, roughness: .45, metalness: .55 });
                const cyl = new THREE.CylinderGeometry(r, r, 1, 8);
                const gapK = (v.gap / 12) * k;

                // positions of bars across a span, thinned out above MAX_BARS
                const positions = (span, count) => {
                    const step = Math.ceil(count / MAX_BARS);
                    const out = [];
                    for (let i = 0; i < count; i += step) out.push(Math.min(-span / 2 + i * gapK, span / 2));
                    if (out[out.length - 1] !== span / 2) out.push(span / 2);
                    return out;
                };
                const s = steelSteps(v);
                const m4 = new THREE.Matrix4();
                const qA = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2);  // along z
                const qB = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), Math.PI / 2);  // along x
                const xs = positions(X, s.a), zs = positions(Z, s.b);
                const barsA = new THREE.InstancedMesh(cyl, rodMat, xs.length);
                xs.forEach((px, i) => barsA.setMatrixAt(i, m4.compose(V(px, y0 - r, 0), qA, V(1, Z, 1))));
                const barsB = new THREE.InstancedMesh(cyl, rodMat, zs.length);
                zs.forEach((pz, i) => barsB.setMatrixAt(i, m4.compose(V(0, y0 + r, pz), qB, V(1, X, 1))));
                barsA.instanceMatrix.needsUpdate = barsB.instanceMatrix.needsUpdate = true;
                g.add(barsA, barsB);

                ground(X, Z);
                dim(V(-X / 2, y0 - slabT / 2, Z / 2), V(X / 2, y0 - slabT / 2, Z / 2), V(0, 0, .35), fv(L, 'u.ft'));
                dim(V(X / 2, y0 - slabT / 2, -Z / 2), V(X / 2, y0 - slabT / 2, Z / 2), V(.35, 0, 0), fv(W, 'u.ft'));
                if (!s.simplified && xs.length > 1) {
                    dim(V(xs[0], y0 + slabT / 2, Z / 2), V(xs[1], y0 + slabT / 2, Z / 2), V(0, .3, 0), fv(v.gap, 'u.inch'));
                }
                bbox = { w: X, h: y0 + slabT, d: Z, cy: y0 };
            }
            return { group: g, bbox };
        }

        /* ---------- viewer ---------- */
        class Viewer {
            constructor(id, card) {
                this.id = id;
                this.card = card;
                this.stage = $('.viz-stage', card);
                this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                this.renderer.outputEncoding = THREE.sRGBEncoding;
                this.renderer.domElement.setAttribute('aria-hidden', 'true');
                this.stage.appendChild(this.renderer.domElement);

                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(32, 1, .05, 200);
                this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa7b5, .85));
                const key = new THREE.DirectionalLight(0xffffff, .75); key.position.set(4, 7, 5); this.scene.add(key);
                const fill = new THREE.DirectionalLight(0xffffff, .25); fill.position.set(-5, 3, -4); this.scene.add(fill);
                this.content = new THREE.Group();
                this.scene.add(this.content);

                this.home = { theta: -.75, phi: 1.1 };
                this.view = { theta: this.home.theta, phi: this.home.phi, radius: 10 };
                this.target = new THREE.Vector3(0, 1, 0);
                this.fitR = 10;
                this.userZoom = false;
                this.auto = !S.motion;
                this.dirty = true;
                this.running = false;

                this.bindControls();
                this.ro = new ResizeObserver(() => this.resize());
                this.ro.observe(this.stage);
                this.resize();
            }
            resize() {
                const w = this.stage.clientWidth, h = this.stage.clientHeight;
                if (!w || !h) return;
                this.renderer.setSize(w, h, false);
                this.camera.aspect = w / h;
                this.camera.updateProjectionMatrix();
                this.dirty = true;
            }
            bindControls() {
                const el = this.renderer.domElement;
                const pts = new Map();
                let pinch0 = 0, r0 = 0;
                el.addEventListener('pointerdown', (e) => {
                    el.setPointerCapture(e.pointerId);
                    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                    this.setAuto(false);
                    if (pts.size === 2) {
                        const [a, b] = [...pts.values()];
                        pinch0 = Math.hypot(a.x - b.x, a.y - b.y); r0 = this.view.radius;
                    }
                });
                el.addEventListener('pointermove', (e) => {
                    const p = pts.get(e.pointerId);
                    if (!p) return;
                    const dx = e.clientX - p.x, dy = e.clientY - p.y;
                    p.x = e.clientX; p.y = e.clientY;
                    if (pts.size === 1) {
                        this.view.theta -= dx * .009;
                        this.view.phi = clamp(this.view.phi - dy * .009, .2, 1.52);
                    } else if (pts.size === 2 && pinch0) {
                        const [a, b] = [...pts.values()];
                        this.view.radius = clamp(r0 * pinch0 / Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1), 3, 26);
                        this.userZoom = true;
                    }
                    this.dirty = true;
                });
                const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; };
                el.addEventListener('pointerup', up);
                el.addEventListener('pointercancel', up);
                el.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    this.view.radius = clamp(this.view.radius * (1 + Math.sign(e.deltaY) * .08), 3, 26);
                    this.userZoom = true;
                    this.dirty = true;
                }, { passive: false });
                el.addEventListener('dblclick', () => this.resetView());
            }
            setAuto(on) {
                this.auto = on;
                const btn = $('[data-viz-rotate]', this.card);
                if (btn) btn.setAttribute('aria-pressed', String(on));
            }
            resetView() {
                this.view.theta = this.home.theta;
                this.view.phi = this.home.phi;
                this.view.radius = this.fitR;
                this.userZoom = false;
                this.dirty = true;
            }
            clear() {
                this.content.traverse((o) => {
                    if (o.geometry) o.geometry.dispose();
                    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
                    mats.forEach((m) => {
                        if (m.map && !(m.map.userData && m.map.userData.cached)) m.map.dispose();
                        m.dispose();
                    });
                });
                this.content.clear();
            }
            rebuild(v) {
                this.clear();
                const { group, bbox } = buildScene(this.id, v, colors());
                this.content.add(group);
                this.target.set(0, bbox.cy, 0);
                this.fitR = clamp(Math.hypot(bbox.w, bbox.h, bbox.d) * 1.7 + 1.4, 4, 24);
                if (!this.userZoom) this.view.radius = this.fitR;
                this.dirty = true;
            }
            render() {
                const { theta, phi, radius } = this.view, tg = this.target;
                this.camera.position.set(
                    tg.x + radius * Math.sin(phi) * Math.sin(theta),
                    tg.y + radius * Math.cos(phi),
                    tg.z + radius * Math.sin(phi) * Math.cos(theta)
                );
                this.camera.lookAt(tg);
                this.renderer.render(this.scene, this.camera);
            }
            start() {
                if (this.running) return;
                this.running = true;
                const tick = () => {
                    if (!this.running) return;
                    if (this.auto) { this.view.theta += .0035; this.dirty = true; }
                    if (this.dirty) { this.render(); this.dirty = false; }
                    this.raf = requestAnimationFrame(tick);
                };
                this.raf = requestAnimationFrame(tick);
            }
            stop() {
                this.running = false;
                cancelAnimationFrame(this.raf);
            }
        }

        /* ---------- cards ---------- */
        function createCards() {
            $$('form[data-calc]').forEach((form) => {
                const id = form.dataset.calc;
                if (!DEF[id]) return;
                const card = document.createElement('section');
                card.className = 'card viz-card';
                card.dataset.viz = id;
                card.innerHTML = `
                    <div class="card-head">
                        <h2><i class="fa-solid fa-cube"></i> <span data-i18n="viz.title"></span></h2>
                        <div class="viz-tools">
                            <button type="button" class="icon-btn icon-btn-sm" data-viz-rotate aria-pressed="${!S.motion}" data-i18n-title="viz.rotate" data-i18n-aria="viz.rotate"><i class="fa-solid fa-rotate"></i></button>
                            <button type="button" class="icon-btn icon-btn-sm" data-viz-reset data-i18n-title="viz.reset" data-i18n-aria="viz.reset"><i class="fa-solid fa-expand"></i></button>
                        </div>
                    </div>
                    <div class="viz-stage"><span class="viz-badge"></span></div>
                    <div class="viz-foot">
                        <div class="viz-chips"></div>
                        <small class="viz-hint"><i class="fa-solid fa-hand-pointer"></i><span></span></small>
                    </div>`;
                form.after(card);
                cards[id] = card;

                if (!glOK) {
                    $('.viz-stage', card).insertAdjacentHTML('beforeend', '<div class="viz-empty"><div><i class="fa-solid fa-cube"></i><span data-i18n="viz.nogl"></span></div></div>');
                    $('.viz-tools', card).hidden = true;
                }
                $('[data-viz-rotate]', card).addEventListener('click', () => {
                    const vw = viewers[id];
                    if (vw) vw.setAuto(!vw.auto);
                });
                $('[data-viz-reset]', card).addEventListener('click', () => { if (viewers[id]) viewers[id].resetView(); });
            });
        }

        function updateInfo(id) {
            const card = cards[id];
            const { v, live } = readValues(id);
            const chips = CHIPS[id](v).map(([label, value]) =>
                `<span class="viz-chip">${escapeHtml(label)}<b>${escapeHtml(value)}</b></span>`);
            if (id === 'roof') {
                const q = roofQuad(v.firstLength, v.secondLength, v.firstWidth, v.secondWidth);
                const rect = v.firstLength === v.secondLength && v.firstWidth === v.secondWidth;
                if (!q) chips.push(`<span class="viz-chip warn">${escapeHtml(t('viz.noShape'))}</span>`);
                else if (!rect) chips.push(`<span class="viz-chip warn">${escapeHtml(t('viz.rightAngle'))}</span>`);
            }
            if (id === 'steel' && steelSteps(v).simplified) chips.push(`<span class="viz-chip warn">${escapeHtml(t('viz.simplified'))}</span>`);
            $('.viz-chips', card).innerHTML = chips.join('');
            const badge = $('.viz-badge', card);
            badge.classList.toggle('live', live);
            badge.innerHTML = live ? `<i class="dot"></i>${escapeHtml(t('viz.live'))}` : escapeHtml(t('viz.sample'));
            $('.viz-hint span', card).textContent = t(isTouch() ? 'viz.hintTouch' : 'viz.hint');
            return v;
        }

        const pending = {};
        function update(id) {
            if (!cards[id] || pending[id]) return;
            pending[id] = requestAnimationFrame(() => {
                pending[id] = 0;
                const v = updateInfo(id);
                if (viewers[id]) viewers[id].rebuild(v);
            });
        }

        /* ---------- home page demo: cycles through the shapes ---------- */
        const ORDER = ['roof', 'column', 'wall', 'plaster', 'steel'];
        const demo = { el: null, viewer: null, shape: 'roof', timer: 0, touched: false, bound: false };
        const demoValues = (id) => Object.assign({ heightUnit: 'inches' },
            id === 'roof' ? { firstLength: 30, secondLength: 24, firstWidth: 18, secondWidth: 20, height: 5 } : DEF[id]);

        function setDemo(id) {
            demo.shape = id;
            $$('[data-demo]', demo.el).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.demo === id)));
            $('#demo-label').textContent = t('page.' + id);
            if (demo.viewer) {
                demo.viewer.id = id;
                demo.viewer.userZoom = false;
                demo.viewer.rebuild(demoValues(id));
            }
        }
        function startDemo() {
            demo.el = demo.el || $('#viz-demo');
            if (!demo.el) return;
            if (!demo.bound) {
                demo.bound = true;
                $$('[data-demo]', demo.el).forEach((b) => b.addEventListener('click', () => {
                    demo.touched = true;
                    setDemo(b.dataset.demo);
                }));
                $('.viz-stage', demo.el).addEventListener('pointerdown', () => { demo.touched = true; });
                if (!glOK) $('.viz-stage', demo.el).insertAdjacentHTML('beforeend', '<div class="viz-empty"><div><i class="fa-solid fa-cube"></i><span data-i18n="viz.nogl"></span></div></div>');
            }
            if (glOK && !demo.viewer) {
                try { demo.viewer = new Viewer(demo.shape, demo.el); }
                catch (e) { console.warn('3D demo unavailable:', e); }
            }
            setDemo(demo.shape);
            if (demo.viewer) { demo.viewer.auto = !S.motion && !demo.touched; demo.viewer.start(); }
            clearInterval(demo.timer);
            demo.timer = setInterval(() => {
                if (demo.touched || S.motion || document.hidden) return;
                setDemo(ORDER[(ORDER.indexOf(demo.shape) + 1) % ORDER.length]);
            }, 6000);
        }
        function stopDemo() {
            clearInterval(demo.timer);
            if (demo.viewer) demo.viewer.stop();
        }

        function show(id) {
            Object.values(viewers).forEach((vw) => vw.stop());
            stopDemo();
            active = id;
            if (id === 'home') { startDemo(); return; }
            if (!cards[id]) return;
            if (glOK && !viewers[id]) {
                try { viewers[id] = new Viewer(id, cards[id]); }
                catch (e) { console.warn('3D preview unavailable:', e); }
            }
            const v = updateInfo(id);
            if (viewers[id]) { viewers[id].rebuild(v); viewers[id].start(); }
        }

        function refreshAll() {
            Object.keys(cards).forEach((id) => {
                const v = updateInfo(id);
                const vw = viewers[id];
                if (vw) {
                    if (S.motion && vw.auto) vw.setAuto(false);
                    vw.rebuild(v);
                }
            });
            if (demo.el) {
                if (S.motion && demo.viewer) demo.viewer.auto = false;
                setDemo(demo.shape);
            }
        }

        // labels are drawn on canvas — redraw once the Bangla font has loaded
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => refreshAll());

        return { createCards, update, show, refreshAll };
    })();

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
                VIZ.update(id);
            });
        });

        form.addEventListener('input', (e) => {
            const field = e.target.closest('.field.invalid');
            if (field) field.classList.remove('invalid');
            saveInputs(form);
            VIZ.update(id);
        });
        form.addEventListener('change', () => { saveInputs(form); VIZ.update(id); });
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
    VIZ.createCards();
    route();
    applyAll();
})();