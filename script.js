/* =========================================================
   Construction Solution — script.js
   Single-page app: routing, sidebar, settings (theme, accent,
   text size, language, digits, decimals, remember inputs,
   compact sidebar, reduce motion), Bangla/English i18n,
   calculators (Roof, Column, Wall, Plaster, Steel) and forms.
   ========================================================= */
/* =========================================================
   🔧 FIREBASE SETUP — paste your project's web config here.
   Firebase console → ⚙ Project settings → General → "Your apps"
   → Web app (</>) → SDK setup and configuration → Config.
   Leave it empty and the site still works; only the admin
   login, admin settings and saved messages need Firebase.
   ========================================================= */
const FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
    apiKey: 'AIzaSyDFOTeqHRxQonG13fd6qVSLQt14gm7rxDE',
    authDomain: 'construction-solution90.firebaseapp.com',
    projectId: 'construction-solution90',
    storageBucket: 'construction-solution90.firebasestorage.app',
    messagingSenderId: '770800582518',
    appId: '1:770800582518:web:4c6aa44771cf7e8427c457',
    measurementId: 'G-CF4V9BE8CW',
};

// Who is admin is decided only by your Firestore Rules (isAdmin()), not by this file.
// After login the site simply tries an admin-only read; if the Rules allow it, the account is admin.

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
            'page.column': 'Columns & Lintels',
            'page.wall': 'Wall B-C-S',
            'page.plaster': 'Plaster',
            'page.steel': 'Roof Steel',
            'page.tiles': 'Tiles',
            'page.about': 'About',
            'page.contact': 'Contact',
            'page.review': 'Leave a Review',
            'review.title': 'Leave a Review',
            'review.sub': 'Tell us how the calculators worked for you. For anything else, use the WhatsApp or Gmail buttons in the corner.',
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
            'home.cta.column': 'Calculate columns & lintels',
            'home.cta.wall': 'Calculate brick walls',
            'home.cta.plaster': 'Calculate plaster',
            'stat1.t': '5+ Calculators', 'stat1.s': 'More coming soon',
            'stat2.t': 'Bangla + English', 'stat2.s': 'Switch any time',
            'stat3.t': 'Light & Dark', 'stat3.s': 'Easy on the eyes',
            'stat4.t': 'Printable', 'stat4.s': 'One-click print',
            'tools.title': 'Choose the estimate you need',
            'tools.sub': 'Enter your measurements and get material & cost estimates instantly.',
            'desc.roof': 'Find out how much cement, sand and khoa your roof casting needs.',
            'desc.column': 'Many columns and lintels at once — materials, bricks for khoa and cost.',
            'desc.wall': 'Bricks, cement and sand needed for brick walls.',
            'desc.plaster': 'Cement and sand by plaster thickness and mixing ratio.',
            'desc.steel': 'Total kg of rod from spacing, rod size and wastage.',
            'desc.tiles': 'Tiles, boxes, mortar and cost for any room — even L-shaped ones.',
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
            'grp.price': 'Market price',
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
            'f.sandPrice': 'Sand (per {vol})',
            'f.khoaPrice': 'Khoa (per {vol})',
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
            'column.title': 'Columns & Lintels',
            'column.sub': 'Add every column and lintel with its size and quantity — get materials and, if you enter prices, the cost.',
            'column.hint': 'Pick the unit at the top (feet + inch, meter …) — every box follows it.',
            'wall.title': 'Wall B-C-S (Brick, Cement, Sand)',
            'wall.sub': 'Enter the wall length, height, brick thickness and mixing ratio.',
            'wall.hint': 'Brick thickness: 5 inch for a 5" wall, 10 inch for a 10" wall.',
            'plaster.title': 'Plaster Calculator',
            'plaster.sub': 'Enter the wall size, plaster thickness and mixing ratio.',
            'plaster.hint': 'Plaster is usually ½ to ¾ inch thick.',
            'steel.title': 'Roof Steel',
            'steel.sub': 'Enter the roof size, rod spacing, wastage and rod size (mm) to get the total kg of rod.',
            'steel.hint': 'Rod weight (kg/ft) = d² ÷ 532.2 (d = rod diameter in mm). Bars in both directions are counted.',
            'tiles.title': 'Tiles',
            'tiles.sub': 'Enter the room size and tile size — get the number of tiles, boxes, mortar and cost.',
            'tl.areas': 'Room size',
            'tl.part': 'Part {n}',
            'tl.addPart': 'Add another part',
            'tl.removePart': 'Remove this part',
            'tl.deduct': 'Area to leave out',
            'tl.optional': '(optional)',
            'tl.size': 'Tile size (inches)',
            'tl.sizeHint': 'Tap a common size, or choose Custom to type the size printed on the box (mm or inches).',
            'tl.custom': 'Custom',
            'tl.sideA': 'Tile length',
            'tl.sideB': 'Tile width',
            'tl.buy': 'Wastage & buying',
            'tl.perBox': 'Tiles per box',
            'tl.price': 'Price',
            'tl.priceUnit': 'Price is',
            'tl.perSft': 'Per {area}',
            'tl.perBoxPrice': 'Per box',
            'tl.mortar': 'Mortar & skirting (optional)',
            'tl.bed': 'Mortar thickness',
            'tl.skirt': 'Skirting height',
            'tl.hint': 'Measure wall to wall along the floor. For 12 ft 6 in, type 12\'6 or 12.5. For an L-shaped room, split it into rectangles and add each as a part.',
            'tl.formula': 'Show the formulas',
            'tl.f1': 'Floor area = length × width (add up every part) − area left out',
            'tl.f2': 'Skirting area = 2 × (length + width) × skirting height (in) ÷ 12',
            'tl.f3': 'One tile = tile length (in) × tile width (in) ÷ 144 sq ft',
            'tl.f4': 'Tiles = (floor area + skirting area) ÷ one tile, rounded up',
            'tl.f5': 'With wastage = tiles × (1 + wastage % ÷ 100), rounded up',
            'tl.f6': 'Boxes = tiles with wastage ÷ tiles per box, rounded up',
            'tl.f7': 'Mortar dry volume = floor area × thickness (in) ÷ 12 × {tileDry}',
            'tl.f8': 'Cement = dry volume × cement ÷ (cement + sand) → bags = × {cementBag};  Sand = dry volume × sand ÷ (cement + sand)',
            'tl.needBox': 'Enter tiles per box to price by the box',
            'r.floorArea': 'Floor area',
            'r.deduct': 'Left out',
            'r.skirtArea': 'Skirting area',
            'r.tileArea': 'Total area to tile',
            'r.tileSize': 'Tile size',
            'r.oneTile': 'One tile covers',
            'r.tilesNet': 'Tiles (without wastage)',
            'r.tilesTotal': 'Total tiles needed',
            'r.boxes': 'Total boxes needed',
            'r.buySft': 'You will buy',
            'r.tileCost': 'Tile cost',
            'r.sand': 'Sand',
            'grp.tiles': 'Tiles',
            'grp.mortar': 'Mortar (bedding)',
            'u.box': 'Boxes',
            'unit.mm': 'mm',
            'k.tileDry': 'Tile mortar dry factor',
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
            'r.kgPerFt': 'Weight per {per} ({mm} mm)',
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

            'page.admin': 'Admin Dashboard',
            'lbl.whatsapp': 'WhatsApp',
            'lbl.gmail': 'Gmail',
            'wa.chat': 'Chat on WhatsApp',
            'gm.write': 'Write in Gmail',
            'call.now': 'Call now',
            'inq.viaWa': 'Send on WhatsApp',
            'inq.viaGm': 'Send via Gmail',
            'inq.note': 'Your message opens in WhatsApp or Gmail, already written — just press send.',
            'inq.subject': 'Development inquiry — {name}',
            'inq.msgTitle': 'New inquiry from {site}',
            'inq.opened': 'Your message is ready — just press send.',
            'ann.close': 'Dismiss',

            'admin.login': 'Admin login',
            'admin.loginTitle': 'Admin login',
            'admin.loginSub': 'Only for the site administrator.',
            'admin.email': 'Email',
            'admin.password': 'Password',
            'admin.signIn': 'Sign in',
            'admin.signingIn': 'Signing in…',
            'admin.forgot': 'Forgot password?',
            'admin.resetSent': 'Password reset email sent to {email}',
            'admin.needEmail': 'Enter your email first',
            'admin.noFirebase': 'Firebase is not set up yet. Put your Firebase config in FIREBASE_CONFIG at the top of script.js.',
            'admin.notAdmin': 'This account is not an admin.',
            'admin.err.cred': 'Wrong email or password.',
            'admin.err.many': 'Too many attempts. Please try again later.',
            'admin.err.net': 'No internet connection.',
            'admin.err.generic': 'Something went wrong: {code}',
            'admin.welcome': 'Welcome, admin',
            'admin.logout': 'Log out',
            'admin.loggedOut': 'Logged out',
            'admin.sub': 'Control the whole site from here. Saved changes go live for every visitor.',
            'admin.save': 'Save changes',
            'admin.saving': 'Saving…',
            'admin.saved': 'Saved — live for everyone',
            'admin.saveErr': 'Could not save: {code}',
            'admin.badNumber': 'Please enter valid numbers (constants must be above 0).',
            'admin.badUrl': 'Links must start with https://',
            'admin.calcOff': 'This calculator is turned off right now.',
            'tab.overview': 'Overview',
            'tab.site': 'Site & appearance',
            'tab.contact': 'Contact',
            'tab.calc': 'Calculators',
            'tab.messages': 'Messages',
            'tab.dev': 'Developer',
            'ad.show': 'Show developer info',
            'ad.showInq': 'Show client inquiry form',
            'ad.photo': 'Photo',
            'ad.photo.d': 'A square photo looks best. Without a photo the initials are shown.',
            'ad.photoRemove': 'Remove photo',
            'ad.name': 'Name',
            'ad.initials': 'Initials',
            'ad.roleBn': 'Title / role (Bangla)',
            'ad.roleEn': 'Title / role (English)',
            'ad.aboutBn': 'Short intro (Bangla)',
            'ad.aboutEn': 'Short intro (English)',
            'ad.eduBn': 'Education (Bangla)',
            'ad.eduEn': 'Education (English)',
            'ad.contact': 'Developer contact',
            'ad.contact.d': 'The inquiry form sends to this WhatsApp / Gmail. Leave a field empty to hide it.',
            'ad.extra': 'Extra info rows',
            'ad.extra.d': 'Add anything else — website, address, GitHub… Leave the link empty for plain text.',
            'ad.addRow': 'Add row',
            'ad.labelBn': 'Label (Bangla)',
            'ad.labelEn': 'Label (English)',
            'ad.value': 'Text',
            'ad.url': 'Link (optional)',
            'ad.icon': 'Icon',
            'ad.removeRow': 'Remove row',
            'ad.clearAll': 'Delete all developer info',
            'ad.clearConfirm': 'Delete all developer info? It is removed from the site when you press Save.',
            'ad.restore': 'Restore original',
            'ad.badEmail': 'Please enter a valid email address',
            'ic.globe': 'Website', 'ic.location': 'Location', 'ic.work': 'Work', 'ic.link': 'Link', 'ic.award': 'Award',
            'ic.code': 'Code', 'ic.github': 'GitHub', 'ic.linkedin': 'LinkedIn', 'ic.facebook': 'Facebook', 'ic.info': 'Info',
            'ov.inquiries': 'Inquiries',
            'ov.reviews': 'Reviews',
            'ov.rating': 'Average rating',
            'ov.calcs': 'Calculators on',
            'ov.recent': 'Recent messages',
            'ov.lastSaved': 'Last saved {time} · {who}',
            'as.brand': 'Brand',
            'as.nameEn': 'Site name (English)',
            'as.nameBn': 'Site name (Bangla)',
            'as.tagEn': 'Tagline (English)',
            'as.tagBn': 'Tagline (Bangla)',
            'as.blankHint': 'Leave blank to keep the default.',
            'as.defaults': 'Default settings for every visitor',
            'as.allowUser': 'Let visitors change their own settings',
            'as.allowUser.d': 'Off = everyone sees exactly these settings; Settings, theme and language buttons are hidden.',
            'as.announce': 'Announcement bar',
            'as.annOn': 'Show announcement on every page',
            'as.annBn': 'Text (Bangla)',
            'as.annEn': 'Text (English)',
            'ac.wa': 'WhatsApp number (with country code)',
            'ac.waHint': 'e.g. 8801XXXXXXXXX',
            'ac.email': 'Email (opens in Gmail)',
            'ac.phone': 'Mobile number',
            'ac.social': 'Social links',
            'ac.socialHint': 'Leave a link empty to hide that icon.',
            'ac.waFloat': 'Floating WhatsApp & Gmail buttons',
            'ac.waFloat.d': 'Shown at the bottom corner of every page',
            'ac.waMsgBn': 'WhatsApp greeting (Bangla)',
            'ac.waMsgEn': 'WhatsApp greeting (English)',
            'cc.visible': 'Show calculators',
            'cc.prices': 'Default market prices (Column Works)',
            'cc.prices.d': 'Filled in for visitors who haven’t typed a price. 0 = leave empty.',
            'cc.constants': 'Calculation constants',
            'cc.constants.d': 'Change only if you know the formula. The defaults are the original values.',
            'cc.restore': 'Restore original values',
            'k.dry': 'Dry volume factor',
            'k.cementBag': 'Cement cft → bags',
            'k.cftPerBag': 'Sand / khoa cft per bag',
            'k.wallDry': 'Wall dry mortar (per cft)',
            'k.bricksPerCft': 'Bricks per cft of wall',
            'k.khoaBricks': 'Bricks per cft of khoa',
            'k.steelDiv': 'Rod weight divisor (d² ÷ x)',
            'msg.inquiries': 'Client inquiries',
            'msg.reviews': 'Reviews',
            'msg.empty': 'Nothing here yet.',
            'msg.reply': 'Reply',
            'msg.delete': 'Delete',
            'msg.confirm': 'Delete this message?',
            'msg.deleted': 'Deleted',
            'msg.loading': 'Loading…',
            'msg.noaccess': 'Could not load: {code}',
            'msg.inquiry': 'Inquiry',
            'msg.review': 'Review',
            'msg.replyText': 'Hello {name}, thank you for contacting {site}.',
            'accent.teal': 'Teal', 'accent.rose': 'Rose',

                        'lu.others': 'Others', 'lu.haat': 'Haat (18 inch)',
            'lu.ydft': 'Yard + Feet', 'lu.haatin': 'Haat + Inch', 'lu.mcm': 'Meter + Centimeter', 'lu.cmmm': 'Centimeter + Millimeter',
            'lu.combo': 'Two units together', 'lu.single': 'One unit',
            'mu.label': 'Measure in',
            'u.m': 'm', 'u.cm': 'cm', 'u.yd': 'yd', 'u.haat': 'haat',
            'sh.open': 'Print / PDF / WhatsApp',
            'sh.title': 'Print or share',
            'sh.sub': 'Print the result, save it as a PDF, or send it on WhatsApp.',
            'sh.with3d': 'Include the 3D picture',
            'sh.with3d.d': 'Adds the 3D preview under the results',
            'sh.no3d': 'Without the 3D picture — only measurements and results.',
            'sh.print': 'Print',
            'sh.pdf': 'Download PDF',
            'sh.wa': 'Send PDF on WhatsApp',
            'sh.note': 'On a phone the PDF is attached in WhatsApp directly. On a computer it downloads and WhatsApp opens — attach the file there.',
            'sh.pdfReady': 'PDF downloaded',
            'sh.waDesk': 'PDF downloaded — attach it in the WhatsApp chat that just opened',
            'sh.tapAgain': 'PDF is ready — tap the WhatsApp button again',
            'sh.err': 'Could not make the PDF. Check your internet connection and try again.',
            'rp.inputs': 'Measurements',
            'rp.results': 'Results',
            'rp.3d': '3D preview',
            "page.plan": "Floor Plan",
            "plan.title": "Floor Plan — 2D & 3D",
            "plan.sub": "Draw walls, rooms, doors and windows like CAD software — see it in 3D and get the material estimate automatically.",
            "desc.plan": "Draw your house plan in 2D, walk around it in 3D and get bricks, cement, sand and tiles automatically.",
            "nav.design": "Design",
            "badge.new": "New",
            "rp.plan2d": "Floor plan (2D)",
            "fp.tools": "Drawing tools",
            "fp.select": "Select",
            "fp.pan": "Pan",
            "fp.wall": "Wall",
            "fp.room": "Room",
            "fp.door": "Door",
            "fp.window": "Window",
            "fp.text": "Text",
            "fp.dim": "Dimension",
            "fp.furn": "Furniture",
            "fp.erase": "Erase",
            "fp.t.select": "Select & move (V)",
            "fp.t.pan": "Pan the drawing (H or hold Space)",
            "fp.t.wall": "Draw walls, click by click (W)",
            "fp.t.room": "Rectangular room with 4 walls (R)",
            "fp.t.door": "Put a door on a wall (D)",
            "fp.t.window": "Put a window on a wall (N)",
            "fp.t.text": "Add a text label (T)",
            "fp.t.dim": "Dimension line (M)",
            "fp.t.furn": "Place furniture (F)",
            "fp.t.erase": "Click anything to erase it (E)",
            "fp.h.select": "Tap an item to edit it · drag empty space to pan · wheel / pinch to zoom",
            "fp.h.pan": "Drag to move the drawing · wheel / pinch to zoom",
            "fp.h.wall": "Mortar ratio cement : sand (usually 1 : 4 or 1 : 6).",
            "fp.h.room": "Click two opposite corners · or click once and type L x W",
            "fp.h.door": "Click on a wall to put a door",
            "fp.h.window": "Click on a wall to put a window",
            "fp.h.text": "Click where the text should go",
            "fp.h.dim": "Click the start, the end, then where the line should sit",
            "fp.h.furn": "Choose an item, then click to place it",
            "fp.h.erase": "Click an item to delete it",
            "fp.undo": "Undo",
            "fp.redo": "Redo",
            "fp.fit": "Fit to screen",
            "fp.view": "View",
            "fp.file": "File",
            "fp.sample": "Sample house",
            "fp.new": "New plan",
            "fp.open": "Open file (.json)",
            "fp.save": "Save as file (.json)",
            "fp.png": "Download image (PNG)",
            "fp.canvas": "Floor plan drawing area",
            "fp.estTitle": "Automatic estimate",
            "fp.estHint": "Worked out from your drawing — it updates by itself. Change the ratios or prices if you like.",
            "fp.estResult": "Estimate from the plan",
            "fp.g.wall": "Brick walls",
            "fp.g.plaster": "Wall plaster",
            "fp.g.slab": "Roof slab (casting)",
            "fp.g.tiles": "Floor tiles",
            "fp.h.ratio": "Ratio cement : sand : khoa (usually 1 : 2 : 4).",
            "fp.o.pThk": "(default 0.5\")",
            "fp.o.sThk": "(default 5\")",
            "fp.sides": "Plaster on",
            "fp.both": "Both sides",
            "fp.one": "One side",
            "fp.none": "None",
            "fp.include": "Include the slab?",
            "fp.yes": "Yes",
            "fp.no": "No",
            "fp.noTiles": "No tiles",
            "fp.tilePrice": "Tile price (per {area})",
            "fp.f1": "Wall volume = (length × height − doors & windows) × thickness (in) ÷ 12",
            "fp.f2": "Bricks = wall volume (cft) × {bricksPerCft}",
            "fp.f3": "Wall mortar (dry) = wall volume × {wallDry}, split by the cement : sand ratio",
            "fp.f4": "Plaster (dry) = net wall area × sides × thickness (in) ÷ 12 × {dry}",
            "fp.f5": "Slab volume = total room area × slab thickness (in) ÷ 12; dry mix = volume × {dry}",
            "fp.f6": "Cement bags = cement (cft) × {cementBag}",
            "fp.f7": "Tiles = room area ÷ one tile area, plus wastage %",
            "fp.roomN": "Room {n}",
            "fp.empty": "Draw some walls or rooms to see the estimate.",
            "fp.r.summary": "Plan summary",
            "fp.r.rooms": "Rooms",
            "fp.r.wallLen": "Total wall length",
            "fp.r.doors": "Doors",
            "fp.r.windows": "Windows",
            "fp.r.doorWin": "Doors / windows",
            "fp.r.netWall": "Net wall area (without openings)",
            "fp.r.wallT": "{t} walls ({l})",
            "fp.planSet": "Plan settings",
            "fp.newWallT": "New walls",
            "fp.wallT": "Wall thickness",
            "fp.wallH": "Wall height",
            "fp.snap": "Snap step",
            "fp.snapOff": "Off",
            "fp.ortho": "Straight angles (0° / 45° / 90°)",
            "fp.showDims": "Show wall lengths",
            "fp.typeHint": "While drawing a wall, just type a length (like 12'6 or 12 6) and press Enter.",
            "fp.delete": "Delete",
            "fp.cancel": "Cancel",
            "fp.clear": "Clear the whole plan",
            "fp.clearConfirm": "Clear the whole plan? This cannot be undone after you leave the page.",
            "fp.sampleConfirm": "Replace your drawing with the sample house?",
            "fp.addDoor": "Add door",
            "fp.addWin": "Add window",
            "fp.roomName": "Room name",
            "fp.perim": "Perimeter",
            "fp.delRoom": "Delete room",
            "fp.delRoomHint": "Only the room (floor and name) is deleted — its walls stay.",
            "fp.type": "Type",
            "fp.opH": "Height",
            "fp.sill": "Sill height (from floor)",
            "fp.flipSide": "Flip side",
            "fp.flipHinge": "Flip hinge",
            "fp.textPrompt": "Text",
            "fp.textSize": "Text size",
            "fp.dimOff": "Distance from the object",
            "fp.depth": "Depth",
            "fp.rotate": "Rotate",
            "fp.lenPrompt": "Wall length",
            "fp.rectPrompt": "Length x Width",
            "fp.needWall": "Click on a wall — doors and windows sit inside walls.",
            "fp.badFile": "This file could not be opened as a floor plan.",
            "fp.opened": "Plan opened",
            "fp.f.bed": "Double bed",
            "fp.f.sbed": "Single bed",
            "fp.f.sofa": "Sofa",
            "fp.f.dining": "Dining table",
            "fp.f.chair": "Chair",
            "fp.f.desk": "Desk",
            "fp.f.wardrobe": "Wardrobe",
            "fp.f.counter": "Kitchen counter",
            "fp.f.fridge": "Fridge",
            "fp.f.wc": "Toilet (WC)",
            "fp.f.basin": "Wash basin",
            "fp.f.shower": "Shower",
            "fp.f.tub": "Bathtub",
            "fp.f.stairs": "Stairs",
            'rp.made': 'Made with {site}',
            'lu.imperial': 'Imperial',
            'lu.metric': 'Metric (SI)',
            'lu.ftin': 'Feet-Inch (ft-in)',
            'lu.ft': 'Feet (ft)',
            'lu.in': 'Inch (in)',
            'lu.yd': 'Yard (yd)',
            'lu.m': 'Metre (m)',
            'lu.cm': 'Centimetre (cm)',
            'lu.mm': 'Millimetre (mm)',
            'u.m2': 'm²',
            'u.m3': 'm³',
            'u.rm': 'm',
            'u.kgm': 'kg/m',
            'u.areaU': '{area}',
            'cl.items': 'Columns & lintels',
            'cl.addCol': 'Add column',
            'cl.addLin': 'Add lintel',
            'cl.column': 'Column',
            'cl.lintel': 'Lintel',
            'cl.columnN': 'Column {n}',
            'cl.lintelN': 'Lintel {n}',
            'cl.remove': 'Remove',
            'cl.colH': 'Height',
            'cl.linL': 'Length (span)',
            'cl.width': 'Width',
            'cl.colT': 'Thickness',
            'cl.linD': 'Depth',
            'cl.qty': 'Quantity',
            'cl.qtyOpt': '(empty = 1)',
            'cl.colTotal': 'All columns ({n} pcs)',
            'cl.linTotal': 'All lintels ({n} pcs)',
            'f.brickPrice': 'Brick (per piece)',
            'f.rodPrice': 'Rod (per kg)',
            'ap.cement': 'Cement (per bag)',
            'ap.sand': 'Sand (per cft)',
            'ap.khoa': 'Khoa (per cft)',
            'ap.brick': 'Brick (per piece)',
            'ap.rod': 'Rod (per kg)',
            'r.brickCost': 'Total brick cost',
            'r.rodCost': 'Total rod cost',
            'pr.hint': 'Optional — fill in the prices you know to get the cost. Results come without them too.',
            'tl.wasteOpt': '(empty = 10%)',
            'tl.ratioHint': 'Leave the mortar ratio empty to use 1 : 4.',
            'calc.formula': 'Show the formulas',
            'calc.fnote': 'Lengths are converted to feet / inches for the formulas; results are shown in the unit system you picked (1 cft = 0.0283 m³, 1 sq ft = 0.0929 m²).',
            'roof.f1': 'Average length = (first + second length) ÷ 2;  average width = (first + second width) ÷ 2',
            'roof.f2': 'Area = average length × average width',
            'roof.f3': 'Volume = area × thickness (in) ÷ 12',
            'roof.f4': 'Dry volume = volume × {dry}',
            'roof.f5': 'Cement = dry volume × cement ÷ (cement + sand + khoa);  bags = cement cft × {cementBag}',
            'roof.f6': 'Sand / khoa = dry volume × its part ÷ total parts;  bags = cft ÷ {cftPerBag}',
            'roof.f7': 'Cost = cement bags × price + sand × price + khoa × price',
            'cl.f1': 'Each item = length or height (ft) × width (in) ÷ 12 × thickness or depth (in) ÷ 12 × quantity',
            'cl.f2': 'Total volume = all columns + all lintels',
            'cl.f3': 'Dry volume = total volume × {dry}',
            'cl.f4': 'Cement = dry volume × cement ÷ (cement + sand + khoa);  bags = cement cft × {cementBag}',
            'cl.f5': 'Sand / khoa = dry volume × its part ÷ total parts;  bags = cft ÷ {cftPerBag}',
            'cl.f6': 'Bricks to break for khoa = khoa cft × {khoaBricks}',
            'cl.f7': 'Cost = cement bags × price + sand × price + khoa × price',
            'wall.f1': 'Volume = length × height × brick thickness (in) ÷ 12',
            'wall.f2': 'Bricks = volume × {bricksPerCft}, rounded up',
            'wall.f3': 'Dry mortar = volume × {wallDry}',
            'wall.f4': 'Cement = dry mortar × cement ÷ (cement + sand);  bags = cement cft × {cementBag}',
            'wall.f5': 'Sand = dry mortar × sand ÷ (cement + sand);  bags = cft ÷ {cftPerBag}',
            'wall.f6': 'Cost = bricks × price + cement bags × price + sand × price',
            'plaster.f1': 'Area = wall length × wall height',
            'plaster.f2': 'Volume = area × plaster thickness (in) ÷ 12',
            'plaster.f3': 'Dry volume = volume × {dry}',
            'plaster.f4': 'Cement = dry volume × cement ÷ (cement + sand);  bags = cement cft × {cementBag}',
            'plaster.f5': 'Sand = dry volume × sand ÷ (cement + sand);  bags = cft ÷ {cftPerBag}',
            'plaster.f6': 'Cost = cement bags × price + sand × price',
            'steel.f1': 'Bars one way = length × 12 ÷ gap (in), rounded up, + 1;  the other way the same with the width',
            'steel.f2': 'Total rod length = bars along the length × width + bars along the width × length',
            'steel.f3': 'With wastage = total length × (1 + wastage % ÷ 100)',
            'steel.f4': 'Weight per ft = d² ÷ {steelDiv} kg  (d = rod size in mm)',
            'steel.f5': 'Total rod = length with wastage × weight per ft',
            'steel.f6': 'Cost = total kg × price per kg',
            'tl.f9': 'Cost = tiles bought × price (per sq ft or per box) + mortar cement bags × price + sand × price',

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
            'page.column': 'কলাম ও লিন্টেলের কাজ',
            'page.wall': 'দেওয়াল গাঁথুনি',
            'page.plaster': 'প্লাস্টার',
            'page.steel': 'ছাদের রড',
            'page.tiles': 'টাইলস',
            'page.about': 'আমাদের সম্পর্কে',
            'page.contact': 'যোগাযোগ',
            'page.review': 'রিভিউ দিন',
            'review.title': 'রিভিউ দিন',
            'review.sub': 'ক্যালকুলেটরগুলো কেমন লাগলো জানান। অন্য কোনো দরকারে কোণের হোয়াটসঅ্যাপ বা জিমেইল বাটনে চাপ দিন।',
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
            'home.cta.column': 'চলুন কলাম ও লিন্টেলের হিসাব করি',
            'home.cta.wall': 'চলুন দেওয়াল গাঁথুনীর হিসাব করি',
            'home.cta.plaster': 'চলুন প্লাস্টার কাজের হিসাব করি',
            'stat1.t': '৫+ ক্যালকুলেটর', 'stat1.s': 'আরও আসছে',
            'stat2.t': 'বাংলা + English', 'stat2.s': 'যেকোনো সময় বদলান',
            'stat3.t': 'লাইট ও ডার্ক মোড', 'stat3.s': 'চোখের জন্য আরামদায়ক',
            'stat4.t': 'প্রিন্টযোগ্য', 'stat4.s': 'এক ক্লিকে প্রিন্ট',
            'tools.title': 'আপনার প্রয়োজনীয় হিসাব বেছে নিন',
            'tools.sub': 'মাপ দিন, সাথে সাথে ম্যাটেরিয়াল ও খরচের হিসাব পান।',
            'desc.roof': 'ছাদের ঢালাইয়ে সিমেন্ট, বালু ও খোয়া কত লাগবে তা বের করুন।',
            'desc.column': 'একসাথে অনেকগুলো কলাম ও লিন্টেল — ম্যাটেরিয়াল, খোয়ার জন্য ইট ও খরচ।',
            'desc.wall': 'দেওয়ালের কাজে ইট, সিমেন্ট ও বালির পরিমাণ।',
            'desc.plaster': 'প্লাস্টারের পুরুত্ব ও রেশিও অনুযায়ী সিমেন্ট-বালির হিসাব।',
            'desc.steel': 'রডের গ্যাপ, সাইজ ও অপচয় ধরে মোট কত কেজি রড লাগবে।',
            'desc.tiles': 'যেকোনো রুমের টাইলস, বক্স, মসলা ও খরচ — L-আকৃতির রুমেরও।',
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
            'f.sandPrice': 'বালু (প্রতি {vol})',
            'f.khoaPrice': 'খোয়া (প্রতি {vol})',
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
            'column.title': 'কলাম ও লিন্টেলের কাজ',
            'column.sub': 'প্রতিটি কলাম ও লিন্টেলের মাপ ও সংখ্যা দিন — ম্যাটেরিয়াল পাবেন, দাম দিলে খরচও।',
            'column.hint': 'উপরের ড্রপডাউন থেকে একক বেছে নিন (ফুট + ইঞ্চি, মিটার …) — সব ঘর সেই এককে থাকবে।',
            'wall.title': 'দেওয়ালের কাজে ইট, সিমেন্ট ও বালির হিসাব',
            'wall.sub': 'দেওয়ালের দৈর্ঘ্য, উচ্চতা, ইটের পুরুত্ব ও রেশিও দিন।',
            'wall.hint': 'ইটের পুরুত্ব: ৫ ইঞ্চি দেওয়ালে ৫ ইঞ্চি, ১০ ইঞ্চি দেওয়ালে ১০ ইঞ্চি।',
            'plaster.title': 'প্লাস্টার এর হিসাব',
            'plaster.sub': 'দেওয়ালের মাপ, প্লাস্টারের পুরুত্ব ও রেশিও দিন।',
            'plaster.hint': 'সাধারণত প্লাস্টারের পুরুত্ব ½ থেকে ¾ ইঞ্চি হয়।',
            'steel.title': 'ছাদের রডের হিসাব',
            'steel.sub': 'ছাদের মাপ, রডের গ্যাপ, অপচয় ও রডের সাইজ (মিমি) দিন — মোট কত কেজি রড লাগবে তা পাবেন।',
            'steel.hint': 'রডের ওজন (কেজি/ফুট) = d² ÷ ৫৩২.২ (d = রডের ব্যাস, মিমি)। দুই দিকের রড (লম্বা ও আড়া) ধরে হিসাব হবে।',
            'tiles.title': 'টাইলসের হিসাব',
            'tiles.sub': 'রুমের মাপ আর টাইলসের সাইজ দিন — কয়টি টাইলস, কয় বক্স, মসলা ও খরচ সব পেয়ে যাবেন।',
            'tl.areas': 'রুমের মাপ',
            'tl.part': 'অংশ {n}',
            'tl.addPart': 'আরেকটি অংশ যোগ করুন',
            'tl.removePart': 'এই অংশটি মুছুন',
            'tl.deduct': 'যে জায়গা বাদ যাবে',
            'tl.optional': '(ঐচ্ছিক)',
            'tl.size': 'টাইলসের সাইজ (ইঞ্চি)',
            'tl.sizeHint': 'প্রচলিত সাইজে চাপ দিন, অথবা "কাস্টম" বেছে বক্সে লেখা সাইজ দিন (মিমি বা ইঞ্চি)।',
            'tl.custom': 'কাস্টম',
            'tl.sideA': 'টাইলসের দৈর্ঘ্য',
            'tl.sideB': 'টাইলসের প্রস্থ',
            'tl.buy': 'অপচয় ও কেনাকাটা',
            'tl.perBox': 'প্রতি বক্সে টাইলস',
            'tl.price': 'দাম',
            'tl.priceUnit': 'দাম ধরা হবে',
            'tl.perSft': 'প্রতি {area}',
            'tl.perBoxPrice': 'প্রতি বক্স',
            'tl.mortar': 'মসলা ও স্কার্টিং (ঐচ্ছিক)',
            'tl.bed': 'মসলার পুরুত্ব',
            'tl.skirt': 'স্কার্টিংয়ের উচ্চতা',
            'tl.hint': 'মেঝে বরাবর দেয়াল থেকে দেয়াল মাপ নিন। ১২ ফুট ৬ ইঞ্চি হলে লিখুন 12\'6 অথবা 12.5। L-আকৃতির রুম হলে আয়তক্ষেত্রে ভাগ করে প্রতিটি আলাদা অংশ হিসেবে দিন।',
            'tl.formula': 'সূত্র দেখুন',
            'tl.f1': 'মেঝের ক্ষেত্রফল = দৈর্ঘ্য × প্রস্থ (সব অংশ যোগ করে) − বাদ যাওয়া জায়গা',
            'tl.f2': 'স্কার্টিং = ২ × (দৈর্ঘ্য + প্রস্থ) × স্কার্টিংয়ের উচ্চতা (ইঞ্চি) ÷ ১২',
            'tl.f3': 'একটি টাইলস = টাইলসের দৈর্ঘ্য (ইঞ্চি) × প্রস্থ (ইঞ্চি) ÷ ১৪৪ বর্গফুট',
            'tl.f4': 'টাইলস সংখ্যা = (মেঝে + স্কার্টিং) ÷ একটি টাইলসের ক্ষেত্রফল, উপরের পূর্ণসংখ্যা',
            'tl.f5': 'অপচয়সহ = টাইলস × (১ + অপচয় % ÷ ১০০), উপরের পূর্ণসংখ্যা',
            'tl.f6': 'বক্স = অপচয়সহ টাইলস ÷ প্রতি বক্সে টাইলস, উপরের পূর্ণসংখ্যা',
            'tl.f7': 'মসলার শুকনো আয়তন = মেঝের ক্ষেত্রফল × পুরুত্ব (ইঞ্চি) ÷ ১২ × {tileDry}',
            'tl.f8': 'সিমেন্ট = শুকনো আয়তন × সিমেন্ট ÷ (সিমেন্ট + বালু) → ব্যাগ = × {cementBag};  বালু = শুকনো আয়তন × বালু ÷ (সিমেন্ট + বালু)',
            'tl.needBox': 'বক্স হিসেবে দাম জানতে প্রতি বক্সে টাইলস সংখ্যা দিন',
            'r.floorArea': 'মেঝের ক্ষেত্রফল',
            'r.deduct': 'বাদ গেছে',
            'r.skirtArea': 'স্কার্টিংয়ের ক্ষেত্রফল',
            'r.tileArea': 'মোট টাইলস লাগানোর জায়গা',
            'r.tileSize': 'টাইলসের সাইজ',
            'r.oneTile': 'একটি টাইলসে জায়গা',
            'r.tilesNet': 'টাইলস (অপচয় ছাড়া)',
            'r.tilesTotal': 'মোট টাইলস লাগবেঃ',
            'r.boxes': 'মোট বক্স লাগবেঃ',
            'r.buySft': 'কিনতে হবে',
            'r.tileCost': 'টাইলসের দাম',
            'r.sand': 'বালু',
            'grp.tiles': 'টাইলস',
            'grp.mortar': 'মসলা (বেডিং)',
            'u.box': 'বক্স',
            'unit.mm': 'মিমি',
            'k.tileDry': 'টাইলসের মসলার শুকনো গুণক',
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
            'r.kgPerFt': 'প্রতি {per} ওজন ({mm} মিমি)',
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

            'page.admin': 'এডমিন ড্যাশবোর্ড',
            'lbl.whatsapp': 'হোয়াটসঅ্যাপ',
            'lbl.gmail': 'জিমেইল',
            'wa.chat': 'হোয়াটসঅ্যাপে মেসেজ দিন',
            'gm.write': 'জিমেইলে লিখুন',
            'call.now': 'এখনই কল করুন',
            'inq.viaWa': 'হোয়াটসঅ্যাপে পাঠান',
            'inq.viaGm': 'জিমেইলে পাঠান',
            'inq.note': 'আপনার মেসেজটি হোয়াটসঅ্যাপ বা জিমেইলে লেখা অবস্থায় খুলবে — শুধু পাঠান চাপুন।',
            'inq.subject': 'ডেভেলপমেন্ট ইনকোয়ারি — {name}',
            'inq.msgTitle': '{site} থেকে নতুন ইনকোয়ারি',
            'inq.opened': 'মেসেজ তৈরি — শুধু পাঠান চাপুন।',
            'ann.close': 'বন্ধ করুন',

            'admin.login': 'এডমিন লগইন',
            'admin.loginTitle': 'এডমিন লগইন',
            'admin.loginSub': 'শুধু সাইটের এডমিনের জন্য।',
            'admin.email': 'ইমেইল',
            'admin.password': 'পাসওয়ার্ড',
            'admin.signIn': 'লগইন করুন',
            'admin.signingIn': 'লগইন হচ্ছে…',
            'admin.forgot': 'পাসওয়ার্ড ভুলে গেছেন?',
            'admin.resetSent': '{email} ঠিকানায় পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে',
            'admin.needEmail': 'আগে ইমেইল লিখুন',
            'admin.noFirebase': 'Firebase এখনো সেটআপ করা হয়নি। script.js ফাইলের শুরুতে FIREBASE_CONFIG-এ আপনার Firebase কনফিগ বসান।',
            'admin.notAdmin': 'এই অ্যাকাউন্টটি এডমিন নয়।',
            'admin.err.cred': 'ইমেইল বা পাসওয়ার্ড ভুল।',
            'admin.err.many': 'অনেকবার চেষ্টা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।',
            'admin.err.net': 'ইন্টারনেট সংযোগ নেই।',
            'admin.err.generic': 'কিছু একটা সমস্যা হয়েছে: {code}',
            'admin.welcome': 'স্বাগতম, এডমিন',
            'admin.logout': 'লগআউট',
            'admin.loggedOut': 'লগআউট হয়েছে',
            'admin.sub': 'এখান থেকে পুরো সাইট নিয়ন্ত্রণ করুন। সেভ করলেই সব ভিজিটরের জন্য চালু হবে।',
            'admin.save': 'পরিবর্তন সেভ করুন',
            'admin.saving': 'সেভ হচ্ছে…',
            'admin.saved': 'সেভ হয়েছে — সবার জন্য চালু',
            'admin.saveErr': 'সেভ করা যায়নি: {code}',
            'admin.badNumber': 'সঠিক সংখ্যা দিন (ধ্রুবকগুলো ০-এর বেশি হতে হবে)।',
            'admin.badUrl': 'লিংক অবশ্যই https:// দিয়ে শুরু হতে হবে',
            'admin.calcOff': 'এই ক্যালকুলেটরটি এখন বন্ধ আছে।',
            'tab.overview': 'ওভারভিউ',
            'tab.site': 'সাইট ও ডিজাইন',
            'tab.contact': 'যোগাযোগ',
            'tab.calc': 'ক্যালকুলেটর',
            'tab.messages': 'মেসেজ',
            'tab.dev': 'ডেভেলপার',
            'ad.show': 'ডেভেলপারের তথ্য দেখান',
            'ad.showInq': 'ক্লায়েন্ট ইনকোয়ারি ফর্ম দেখান',
            'ad.photo': 'ছবি',
            'ad.photo.d': 'বর্গাকার ছবি সবচেয়ে ভালো দেখায়। ছবি না থাকলে নামের আদ্যক্ষর দেখাবে।',
            'ad.photoRemove': 'ছবি সরান',
            'ad.name': 'নাম',
            'ad.initials': 'আদ্যক্ষর',
            'ad.roleBn': 'পদবি / পরিচয় (বাংলা)',
            'ad.roleEn': 'পদবি / পরিচয় (ইংরেজি)',
            'ad.aboutBn': 'সংক্ষিপ্ত পরিচিতি (বাংলা)',
            'ad.aboutEn': 'সংক্ষিপ্ত পরিচিতি (ইংরেজি)',
            'ad.eduBn': 'শিক্ষা (বাংলা)',
            'ad.eduEn': 'শিক্ষা (ইংরেজি)',
            'ad.contact': 'ডেভেলপারের যোগাযোগ',
            'ad.contact.d': 'ইনকোয়ারি ফর্ম এই হোয়াটসঅ্যাপ / জিমেইলে যাবে। কোনো ঘর খালি রাখলে সেটি লুকানো থাকবে।',
            'ad.extra': 'অতিরিক্ত তথ্য',
            'ad.extra.d': 'আরও কিছু যোগ করুন — ওয়েবসাইট, ঠিকানা, GitHub… লিংক খালি রাখলে শুধু লেখা দেখাবে।',
            'ad.addRow': 'নতুন সারি যোগ করুন',
            'ad.labelBn': 'শিরোনাম (বাংলা)',
            'ad.labelEn': 'শিরোনাম (ইংরেজি)',
            'ad.value': 'লেখা',
            'ad.url': 'লিংক (ঐচ্ছিক)',
            'ad.icon': 'আইকন',
            'ad.removeRow': 'সারি মুছুন',
            'ad.clearAll': 'ডেভেলপারের সব তথ্য মুছুন',
            'ad.clearConfirm': 'ডেভেলপারের সব তথ্য মুছবেন? সেভ চাপলে সাইট থেকে মুছে যাবে।',
            'ad.restore': 'আগের তথ্য ফিরিয়ে আনুন',
            'ad.badEmail': 'সঠিক ইমেইল ঠিকানা দিন',
            'ic.globe': 'ওয়েবসাইট', 'ic.location': 'ঠিকানা', 'ic.work': 'কাজ', 'ic.link': 'লিংক', 'ic.award': 'পুরস্কার',
            'ic.code': 'কোড', 'ic.github': 'GitHub', 'ic.linkedin': 'LinkedIn', 'ic.facebook': 'ফেসবুক', 'ic.info': 'তথ্য',
            'ov.inquiries': 'ইনকোয়ারি',
            'ov.reviews': 'রিভিউ',
            'ov.rating': 'গড় রেটিং',
            'ov.calcs': 'চালু ক্যালকুলেটর',
            'ov.recent': 'সাম্প্রতিক মেসেজ',
            'ov.lastSaved': 'সর্বশেষ সেভ {time} · {who}',
            'as.brand': 'ব্র্যান্ড',
            'as.nameEn': 'সাইটের নাম (ইংরেজি)',
            'as.nameBn': 'সাইটের নাম (বাংলা)',
            'as.tagEn': 'ট্যাগলাইন (ইংরেজি)',
            'as.tagBn': 'ট্যাগলাইন (বাংলা)',
            'as.blankHint': 'খালি রাখলে ডিফল্ট থাকবে।',
            'as.defaults': 'সব ভিজিটরের জন্য ডিফল্ট সেটিং',
            'as.allowUser': 'ভিজিটরদের নিজের সেটিং বদলাতে দিন',
            'as.allowUser.d': 'বন্ধ করলে সবাই ঠিক এই সেটিং দেখবে; সেটিংস, থিম ও ভাষার বাটন লুকানো থাকবে।',
            'as.announce': 'ঘোষণা বার',
            'as.annOn': 'প্রতিটি পেজে ঘোষণা দেখান',
            'as.annBn': 'লেখা (বাংলা)',
            'as.annEn': 'লেখা (ইংরেজি)',
            'ac.wa': 'হোয়াটসঅ্যাপ নম্বর (কান্ট্রি কোডসহ)',
            'ac.waHint': 'যেমন 8801XXXXXXXXX',
            'ac.email': 'ইমেইল (জিমেইলে খুলবে)',
            'ac.phone': 'মোবাইল নম্বর',
            'ac.social': 'সোশ্যাল লিংক',
            'ac.socialHint': 'কোনো লিংক খালি রাখলে সেই আইকন লুকানো থাকবে।',
            'ac.waFloat': 'ভাসমান হোয়াটসঅ্যাপ ও জিমেইল বাটন',
            'ac.waFloat.d': 'প্রতিটি পেজের নিচের কোণে দেখাবে',
            'ac.waMsgBn': 'হোয়াটসঅ্যাপ শুভেচ্ছা (বাংলা)',
            'ac.waMsgEn': 'হোয়াটসঅ্যাপ শুভেচ্ছা (ইংরেজি)',
            'cc.visible': 'ক্যালকুলেটর দেখান',
            'cc.prices': 'ডিফল্ট বাজার দর (কলামের কাজ)',
            'cc.prices.d': 'যারা দাম লেখেননি তাদের জন্য আগে থেকে বসানো থাকবে। ০ = খালি থাকবে।',
            'cc.constants': 'হিসাবের ধ্রুবক',
            'cc.constants.d': 'সূত্র জানলে তবেই বদলান। ডিফল্ট মানগুলো আসল সূত্রের।',
            'cc.restore': 'আসল মান ফিরিয়ে আনুন',
            'k.dry': 'শুকনো আয়তনের গুণক',
            'k.cementBag': 'সিমেন্ট ঘনফুট → ব্যাগ',
            'k.cftPerBag': 'প্রতি ব্যাগে বালু/খোয়া (ঘনফুট)',
            'k.wallDry': 'দেওয়ালের শুকনো মসলা (প্রতি ঘনফুট)',
            'k.bricksPerCft': 'প্রতি ঘনফুট দেওয়ালে ইট',
            'k.khoaBricks': 'প্রতি ঘনফুট খোয়ায় ইট',
            'k.steelDiv': 'রডের ওজনের ভাজক (d² ÷ x)',
            'msg.inquiries': 'ক্লায়েন্ট ইনকোয়ারি',
            'msg.reviews': 'রিভিউ',
            'msg.empty': 'এখানে এখনো কিছু নেই।',
            'msg.reply': 'উত্তর দিন',
            'msg.delete': 'মুছুন',
            'msg.confirm': 'এই মেসেজটি মুছবেন?',
            'msg.deleted': 'মুছে ফেলা হয়েছে',
            'msg.loading': 'লোড হচ্ছে…',
            'msg.noaccess': 'লোড করা যায়নি: {code}',
            'msg.inquiry': 'ইনকোয়ারি',
            'msg.review': 'রিভিউ',
            'msg.replyText': 'আসসালামু আলাইকুম {name}, {site}-এ যোগাযোগ করার জন্য ধন্যবাদ।',
            'accent.teal': 'টিল', 'accent.rose': 'গোলাপি',

                        'lu.others': 'অন্যান্য', 'lu.haat': 'হাত (১৮ ইঞ্চি)',
            'lu.ydft': 'গজ + ফুট', 'lu.haatin': 'হাত + ইঞ্চি', 'lu.mcm': 'মিটার + সেন্টিমিটার', 'lu.cmmm': 'সেন্টিমিটার + মিলিমিটার',
            'lu.combo': 'দুই একক একসাথে', 'lu.single': 'এক একক',
            'mu.label': 'মাপের একক',
            'u.m': 'মিটার', 'u.cm': 'সেমি', 'u.yd': 'গজ', 'u.haat': 'হাত',
            'sh.open': 'প্রিন্ট / PDF / হোয়াটসঅ্যাপ',
            'sh.title': 'প্রিন্ট বা শেয়ার',
            'sh.sub': 'ফলাফল প্রিন্ট করুন, PDF সেভ করুন, অথবা হোয়াটসঅ্যাপে পাঠান।',
            'sh.with3d': '৩ডি ছবিসহ',
            'sh.with3d.d': 'ফলাফলের নিচে ৩ডি প্রিভিউ যোগ হবে',
            'sh.no3d': '৩ডি ছবি ছাড়া — শুধু মাপ ও ফলাফল।',
            'sh.print': 'প্রিন্ট করুন',
            'sh.pdf': 'PDF ডাউনলোড',
            'sh.wa': 'হোয়াটসঅ্যাপে PDF পাঠান',
            'sh.note': 'মোবাইলে PDF সরাসরি হোয়াটসঅ্যাপে যুক্ত হবে। কম্পিউটারে PDF ডাউনলোড হবে আর হোয়াটসঅ্যাপ খুলবে — সেখানে ফাইলটি যুক্ত করুন।',
            'sh.pdfReady': 'PDF ডাউনলোড হয়েছে',
            'sh.waDesk': 'PDF ডাউনলোড হয়েছে — খোলা হোয়াটসঅ্যাপ চ্যাটে ফাইলটি যুক্ত করুন',
            'sh.tapAgain': 'PDF তৈরি — আবার হোয়াটসঅ্যাপ বাটনে চাপ দিন',
            'sh.err': 'PDF তৈরি করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।',
            'rp.inputs': 'মাপ',
            'rp.results': 'ফলাফল',
            'rp.3d': '৩ডি প্রিভিউ',
            "page.plan": "ফ্লোর প্ল্যান",
            "plan.title": "ফ্লোর প্ল্যান — ২ডি ও ৩ডি",
            "plan.sub": "ক্যাড সফটওয়্যারের মতো দেয়াল, রুম, দরজা, জানালা আঁকুন — ৩ডি-তে দেখুন আর মালামালের হিসাব পান অটোমেটিক।",
            "desc.plan": "বাড়ির নকশা ২ডি-তে আঁকুন, ৩ডি-তে ঘুরিয়ে দেখুন — ইট, সিমেন্ট, বালু, টাইলসের হিসাব অটোমেটিক।",
            "nav.design": "ডিজাইন",
            "badge.new": "নতুন",
            "rp.plan2d": "ফ্লোর প্ল্যান (২ডি)",
            "fp.tools": "আঁকার টুল",
            "fp.select": "সিলেক্ট",
            "fp.pan": "সরান",
            "fp.wall": "দেয়াল",
            "fp.room": "রুম",
            "fp.door": "দরজা",
            "fp.window": "জানালা",
            "fp.text": "লেখা",
            "fp.dim": "মাপের লাইন",
            "fp.furn": "আসবাব",
            "fp.erase": "মুছুন",
            "fp.t.select": "সিলেক্ট ও সরানো (V)",
            "fp.t.pan": "নকশা সরান (H বা Space চেপে ধরে)",
            "fp.t.wall": "ক্লিক করে করে দেয়াল আঁকুন (W)",
            "fp.t.room": "৪ দেয়ালসহ চারকোনা রুম (R)",
            "fp.t.door": "দেয়ালে দরজা বসান (D)",
            "fp.t.window": "দেয়ালে জানালা বসান (N)",
            "fp.t.text": "লেখা যোগ করুন (T)",
            "fp.t.dim": "মাপের লাইন (M)",
            "fp.t.furn": "আসবাব বসান (F)",
            "fp.t.erase": "যেটাতে ক্লিক করবেন মুছে যাবে (E)",
            "fp.h.select": "এডিট করতে কোনো কিছুতে ট্যাপ করুন · ফাঁকা জায়গা টেনে সরান · হুইল / দুই আঙুলে জুম",
            "fp.h.pan": "টেনে নকশা সরান · হুইল / দুই আঙুলে জুম",
            "fp.h.wall": "মসলার অনুপাত সিমেন্ট : বালু (সাধারণত ১ : ৪ বা ১ : ৬)।",
            "fp.h.room": "দুই বিপরীত কোণে ক্লিক করুন · বা একবার ক্লিক করে দৈর্ঘ্য x প্রস্থ টাইপ করুন",
            "fp.h.door": "দরজা বসাতে দেয়ালে ক্লিক করুন",
            "fp.h.window": "জানালা বসাতে দেয়ালে ক্লিক করুন",
            "fp.h.text": "যেখানে লেখা বসবে সেখানে ক্লিক করুন",
            "fp.h.dim": "শুরু, শেষ, তারপর লাইন কোথায় বসবে — ক্লিক করুন",
            "fp.h.furn": "আসবাব বেছে নিয়ে ক্লিক করে বসান",
            "fp.h.erase": "মুছতে কোনো কিছুতে ক্লিক করুন",
            "fp.undo": "আগের অবস্থা",
            "fp.redo": "আবার করুন",
            "fp.fit": "স্ক্রিনে ফিট",
            "fp.view": "ভিউ",
            "fp.file": "ফাইল",
            "fp.sample": "নমুনা বাড়ি",
            "fp.new": "নতুন প্ল্যান",
            "fp.open": "ফাইল খুলুন (.json)",
            "fp.save": "ফাইল হিসেবে সেভ (.json)",
            "fp.png": "ছবি ডাউনলোড (PNG)",
            "fp.canvas": "ফ্লোর প্ল্যান আঁকার জায়গা",
            "fp.estTitle": "অটোমেটিক হিসাব",
            "fp.estHint": "আপনার নকশা থেকে হিসাব হচ্ছে — নিজে নিজেই আপডেট হয়। চাইলে অনুপাত বা দাম বদলান।",
            "fp.estResult": "প্ল্যান থেকে হিসাব",
            "fp.g.wall": "ইটের দেয়াল",
            "fp.g.plaster": "দেয়ালের প্লাস্টার",
            "fp.g.slab": "ছাদ ঢালাই",
            "fp.g.tiles": "মেঝের টাইলস",
            "fp.h.ratio": "অনুপাত সিমেন্ট : বালু : খোয়া (সাধারণত ১ : ২ : ৪)।",
            "fp.o.pThk": "(না দিলে ০.৫\")",
            "fp.o.sThk": "(না দিলে ৫\")",
            "fp.sides": "প্লাস্টার হবে",
            "fp.both": "দুই পাশে",
            "fp.one": "এক পাশে",
            "fp.none": "হবে না",
            "fp.include": "ছাদ ঢালাই ধরবেন?",
            "fp.yes": "হ্যাঁ",
            "fp.no": "না",
            "fp.noTiles": "টাইলস নয়",
            "fp.tilePrice": "টাইলসের দাম (প্রতি {area})",
            "fp.f1": "দেয়ালের আয়তন = (দৈর্ঘ্য × উচ্চতা − দরজা-জানালা) × পুরুত্ব (ইঞ্চি) ÷ ১২",
            "fp.f2": "ইট = দেয়ালের আয়তন (ঘনফুট) × {bricksPerCft}",
            "fp.f3": "দেয়ালের শুকনো মসলা = দেয়ালের আয়তন × {wallDry}, সিমেন্ট : বালু অনুপাতে ভাগ",
            "fp.f4": "প্লাস্টারের শুকনো মসলা = দেয়ালের নিট ক্ষেত্রফল × পাশ × পুরুত্ব (ইঞ্চি) ÷ ১২ × {dry}",
            "fp.f5": "ছাদের আয়তন = মোট রুমের ক্ষেত্রফল × পুরুত্ব (ইঞ্চি) ÷ ১২; শুকনো মসলা = আয়তন × {dry}",
            "fp.f6": "সিমেন্টের ব্যাগ = সিমেন্ট (ঘনফুট) × {cementBag}",
            "fp.f7": "টাইলস = রুমের ক্ষেত্রফল ÷ একটি টাইলসের ক্ষেত্রফল + অপচয় %",
            "fp.roomN": "রুম {n}",
            "fp.empty": "হিসাব দেখতে কিছু দেয়াল বা রুম আঁকুন।",
            "fp.r.summary": "প্ল্যানের সারাংশ",
            "fp.r.rooms": "রুম",
            "fp.r.wallLen": "মোট দেয়ালের দৈর্ঘ্য",
            "fp.r.doors": "দরজা",
            "fp.r.windows": "জানালা",
            "fp.r.doorWin": "দরজা / জানালা",
            "fp.r.netWall": "দেয়ালের নিট ক্ষেত্রফল (দরজা-জানালা বাদে)",
            "fp.r.wallT": "{t} দেয়াল ({l})",
            "fp.planSet": "প্ল্যান সেটিংস",
            "fp.newWallT": "নতুন দেয়াল",
            "fp.wallT": "দেয়ালের পুরুত্ব",
            "fp.wallH": "দেয়ালের উচ্চতা",
            "fp.snap": "স্ন্যাপ ধাপ",
            "fp.snapOff": "বন্ধ",
            "fp.ortho": "সোজা কোণ (০° / ৪৫° / ৯০°)",
            "fp.showDims": "দেয়ালের মাপ দেখাবে",
            "fp.typeHint": "দেয়াল আঁকার সময় শুধু মাপ টাইপ করুন (যেমন 12'6 বা 12 6) তারপর Enter চাপুন।",
            "fp.delete": "মুছুন",
            "fp.cancel": "বাতিল",
            "fp.clear": "পুরো প্ল্যান মুছুন",
            "fp.clearConfirm": "পুরো প্ল্যান মুছে ফেলবেন? পেজ ছেড়ে গেলে আর ফেরানো যাবে না।",
            "fp.sampleConfirm": "আপনার নকশার জায়গায় নমুনা বাড়ি বসবে?",
            "fp.addDoor": "দরজা যোগ",
            "fp.addWin": "জানালা যোগ",
            "fp.roomName": "রুমের নাম",
            "fp.perim": "পরিধি",
            "fp.delRoom": "রুম মুছুন",
            "fp.delRoomHint": "শুধু রুম (মেঝে ও নাম) মুছবে — দেয়াল থাকবে।",
            "fp.type": "ধরন",
            "fp.opH": "উচ্চতা",
            "fp.sill": "মেঝে থেকে উচ্চতা (সিল)",
            "fp.flipSide": "পাশ উল্টান",
            "fp.flipHinge": "কব্জা উল্টান",
            "fp.textPrompt": "লেখা",
            "fp.textSize": "লেখার সাইজ",
            "fp.dimOff": "বস্তু থেকে দূরত্ব",
            "fp.depth": "গভীরতা",
            "fp.rotate": "ঘোরান",
            "fp.lenPrompt": "দেয়ালের দৈর্ঘ্য",
            "fp.rectPrompt": "দৈর্ঘ্য x প্রস্থ",
            "fp.needWall": "দেয়ালের উপর ক্লিক করুন — দরজা-জানালা দেয়ালেই বসে।",
            "fp.badFile": "ফাইলটি ফ্লোর প্ল্যান হিসেবে খোলা যায়নি।",
            "fp.opened": "প্ল্যান খোলা হয়েছে",
            "fp.f.bed": "ডাবল খাট",
            "fp.f.sbed": "সিঙ্গেল খাট",
            "fp.f.sofa": "সোফা",
            "fp.f.dining": "ডাইনিং টেবিল",
            "fp.f.chair": "চেয়ার",
            "fp.f.desk": "টেবিল (ডেস্ক)",
            "fp.f.wardrobe": "আলমারি",
            "fp.f.counter": "রান্নাঘরের কাউন্টার",
            "fp.f.fridge": "ফ্রিজ",
            "fp.f.wc": "কমোড",
            "fp.f.basin": "বেসিন",
            "fp.f.shower": "শাওয়ার",
            "fp.f.tub": "বাথটাব",
            "fp.f.stairs": "সিঁড়ি",
            'rp.made': '{site} দিয়ে তৈরি',
            'lu.imperial': 'ইম্পেরিয়াল (Imperial)',
            'lu.metric': 'মেট্রিক (Metric / SI)',
            'lu.ftin': 'ফুট-ইঞ্চি (ft-in)',
            'lu.ft': 'ফুট (ft)',
            'lu.in': 'ইঞ্চি (in)',
            'lu.yd': 'গজ (yd)',
            'lu.m': 'মিটার (m)',
            'lu.cm': 'সেন্টিমিটার (cm)',
            'lu.mm': 'মিলিমিটার (mm)',
            'u.m2': 'বর্গমিটার',
            'u.m3': 'ঘনমিটার',
            'u.rm': 'রানিং মিটার',
            'u.kgm': 'কেজি/মিটার',
            'u.areaU': '{area}',
            'cl.items': 'কলাম ও লিন্টেল',
            'cl.addCol': 'কলাম যোগ করুন',
            'cl.addLin': 'লিন্টেল যোগ করুন',
            'cl.column': 'কলাম',
            'cl.lintel': 'লিন্টেল',
            'cl.columnN': 'কলাম {n}',
            'cl.lintelN': 'লিন্টেল {n}',
            'cl.remove': 'মুছুন',
            'cl.colH': 'উচ্চতা',
            'cl.linL': 'দৈর্ঘ্য (স্প্যান)',
            'cl.width': 'প্রস্থ',
            'cl.colT': 'পুরুত্ব',
            'cl.linD': 'গভীরতা',
            'cl.qty': 'সংখ্যা',
            'cl.qtyOpt': '(খালি = ১)',
            'cl.colTotal': 'সব কলাম ({n} পিস)',
            'cl.linTotal': 'সব লিন্টেল ({n} পিস)',
            'f.brickPrice': 'ইট (প্রতি পিস)',
            'f.rodPrice': 'রড (প্রতি কেজি)',
            'ap.cement': 'সিমেন্ট (প্রতি ব্যাগ)',
            'ap.sand': 'বালু (প্রতি ঘনফুট)',
            'ap.khoa': 'খোয়া (প্রতি ঘনফুট)',
            'ap.brick': 'ইট (প্রতি পিস)',
            'ap.rod': 'রড (প্রতি কেজি)',
            'r.brickCost': 'সর্বমোট ইটের দামঃ',
            'r.rodCost': 'সর্বমোট রডের দামঃ',
            'pr.hint': 'ঐচ্ছিক — যে দামগুলো জানেন সেগুলো দিলে খরচ পাবেন। না দিলেও ফলাফল আসবে।',
            'tl.wasteOpt': '(খালি = ১০%)',
            'tl.ratioHint': 'মসলার রেশিও খালি রাখলে ১ : ৪ ধরা হবে।',
            'calc.formula': 'সূত্র দেখুন',
            'calc.fnote': 'সূত্রে সব মাপ ফুট/ইঞ্চিতে রূপান্তর করে হিসাব হয়; ফলাফল আপনার বেছে নেওয়া একক পদ্ধতিতে দেখায় (১ ঘনফুট = ০.০২৮৩ ঘনমিটার, ১ বর্গফুট = ০.০৯২৯ বর্গমিটার)।',
            'roof.f1': 'গড় দৈর্ঘ্য = (প্রথম + দ্বিতীয় দৈর্ঘ্য) ÷ ২;  গড় প্রস্থ = (প্রথম + দ্বিতীয় প্রস্থ) ÷ ২',
            'roof.f2': 'ক্ষেত্রফল = গড় দৈর্ঘ্য × গড় প্রস্থ',
            'roof.f3': 'আয়তন = ক্ষেত্রফল × পুরুত্ব (ইঞ্চি) ÷ ১২',
            'roof.f4': 'শুকনো আয়তন = আয়তন × {dry}',
            'roof.f5': 'সিমেন্ট = শুকনো আয়তন × সিমেন্ট ÷ (সিমেন্ট + বালু + খোয়া);  ব্যাগ = সিমেন্ট ঘনফুট × {cementBag}',
            'roof.f6': 'বালু / খোয়া = শুকনো আয়তন × নিজের অংশ ÷ মোট অংশ;  ব্যাগ = ঘনফুট ÷ {cftPerBag}',
            'roof.f7': 'খরচ = সিমেন্ট ব্যাগ × দর + বালু × দর + খোয়া × দর',
            'cl.f1': 'প্রতিটি = দৈর্ঘ্য বা উচ্চতা (ফুট) × প্রস্থ (ইঞ্চি) ÷ ১২ × পুরুত্ব বা গভীরতা (ইঞ্চি) ÷ ১২ × সংখ্যা',
            'cl.f2': 'মোট আয়তন = সব কলাম + সব লিন্টেল',
            'cl.f3': 'শুকনো আয়তন = মোট আয়তন × {dry}',
            'cl.f4': 'সিমেন্ট = শুকনো আয়তন × সিমেন্ট ÷ (সিমেন্ট + বালু + খোয়া);  ব্যাগ = সিমেন্ট ঘনফুট × {cementBag}',
            'cl.f5': 'বালু / খোয়া = শুকনো আয়তন × নিজের অংশ ÷ মোট অংশ;  ব্যাগ = ঘনফুট ÷ {cftPerBag}',
            'cl.f6': 'খোয়ার জন্য ইট = খোয়া ঘনফুট × {khoaBricks}',
            'cl.f7': 'খরচ = সিমেন্ট ব্যাগ × দর + বালু × দর + খোয়া × দর',
            'wall.f1': 'আয়তন = দৈর্ঘ্য × উচ্চতা × ইটের পুরুত্ব (ইঞ্চি) ÷ ১২',
            'wall.f2': 'ইট = আয়তন × {bricksPerCft}, উপরের পূর্ণসংখ্যা',
            'wall.f3': 'শুকনো মসলা = আয়তন × {wallDry}',
            'wall.f4': 'সিমেন্ট = শুকনো মসলা × সিমেন্ট ÷ (সিমেন্ট + বালু);  ব্যাগ = সিমেন্ট ঘনফুট × {cementBag}',
            'wall.f5': 'বালু = শুকনো মসলা × বালু ÷ (সিমেন্ট + বালু);  ব্যাগ = ঘনফুট ÷ {cftPerBag}',
            'wall.f6': 'খরচ = ইট × দর + সিমেন্ট ব্যাগ × দর + বালু × দর',
            'plaster.f1': 'ক্ষেত্রফল = দেওয়ালের দৈর্ঘ্য × উচ্চতা',
            'plaster.f2': 'আয়তন = ক্ষেত্রফল × প্লাস্টারের পুরুত্ব (ইঞ্চি) ÷ ১২',
            'plaster.f3': 'শুকনো আয়তন = আয়তন × {dry}',
            'plaster.f4': 'সিমেন্ট = শুকনো আয়তন × সিমেন্ট ÷ (সিমেন্ট + বালু);  ব্যাগ = সিমেন্ট ঘনফুট × {cementBag}',
            'plaster.f5': 'বালু = শুকনো আয়তন × বালু ÷ (সিমেন্ট + বালু);  ব্যাগ = ঘনফুট ÷ {cftPerBag}',
            'plaster.f6': 'খরচ = সিমেন্ট ব্যাগ × দর + বালু × দর',
            'steel.f1': 'এক দিকের রড = দৈর্ঘ্য × ১২ ÷ গ্যাপ (ইঞ্চি), উপরের পূর্ণসংখ্যা + ১;  অন্য দিকে প্রস্থ দিয়ে একইভাবে',
            'steel.f2': 'রডের মোট দৈর্ঘ্য = দৈর্ঘ্য বরাবর রড × প্রস্থ + প্রস্থ বরাবর রড × দৈর্ঘ্য',
            'steel.f3': 'অপচয়সহ = মোট দৈর্ঘ্য × (১ + অপচয় % ÷ ১০০)',
            'steel.f4': 'প্রতি ফুটের ওজন = d² ÷ {steelDiv} কেজি  (d = রডের সাইজ, মিমি)',
            'steel.f5': 'মোট রড = অপচয়সহ দৈর্ঘ্য × প্রতি ফুটের ওজন',
            'steel.f6': 'খরচ = মোট কেজি × প্রতি কেজির দর',
            'tl.f9': 'খরচ = কেনা টাইলস × দর (প্রতি বর্গফুট বা প্রতি বক্স) + মসলার সিমেন্ট ব্যাগ × দর + বালু × দর',

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

    /* ---------- Site config (set by the admin, shared by every visitor) ---------- */
    const STORE_SITE = 'cc.site';
    const SITE_DEFAULT = {
        brand: { bn: '', en: '' },
        tagline: { bn: '', en: '' },
        defaults: Object.assign({}, DEFAULTS),
        allowUserSettings: true,
        favicon: '',
        announcement: { enabled: false, bn: '', en: '' },
        contact: {
            whatsapp: '8801833515057',
            phone: '01833515057',
            email: 'uddinmdnaim10@gmail.com',
            facebook: 'https://www.facebook.com/profile.php?id=100082555653933',
            instagram: 'https://www.instagram.com/mozumder_naim/',
            twitter: '',
            linkedin: '',
            waFloat: true,
            waMessage: {
                bn: 'আসসালামু আলাইকুম! কনস্ট্রাকশন সলিউশন থেকে যোগাযোগ করছি।',
                en: 'Hello! I am contacting you from Construction Solution.',
            },
        },
        calculators: { roof: true, column: true, wall: true, plaster: true, steel: true, tiles: true },
        // About page — everything editable from Admin → Developer
        developer: {
            enabled: true,
            inquiry: true,
            name: 'MD NAIM UDDIN MOZUMDAR',
            initials: 'NM',
            photo: '',
            role: { bn: 'সিএসই বিভাগের শিক্ষার্থী, প্রিমিয়ার ইউনিভার্সিটি, চট্টগ্রাম।', en: 'Student of CSE Department at Premier University, Chittagong.' },
            about: { bn: 'যেকোনো ধরনের ডেভেলপমেন্ট সার্ভিস প্রয়োজন হলে নির্দ্বিধায় যোগাযোগ করুন:', en: 'If you need any kind of development services, feel free to contact me:' },
            education: { bn: 'সিএসই, প্রিমিয়ার ইউনিভার্সিটি, চট্টগ্রাম', en: 'CSE, Premier University, Chittagong' },
            whatsapp: '8801833515057',
            email: 'uddinmdnaim10@gmail.com',
            phone: '01833515057',
            extras: [],
        },
        prices: { cement: 0, sand: 0, khoa: 0, brick: 0, rod: 0 },
        // calculation constants — the original formula values
        constants: { dry: 1.5, cementBag: 0.8, cftPerBag: 1.2, wallDry: 0.35, bricksPerCft: 12, khoaBricks: 9, steelDiv: 532.2, tileDry: 1.33 },
    };
    const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o) && !(o.toDate);
    function deepMerge(base, over) {
        const out = Object.assign({}, base);
        if (!isObj(over)) return out;
        Object.keys(over).forEach((k) => {
            out[k] = isObj(base[k]) && isObj(over[k]) ? deepMerge(base[k], over[k]) : over[k];
        });
        return out;
    }
    let SITE = deepMerge(SITE_DEFAULT, storage.get(STORE_SITE, {}));
    let LOCAL = storage.get(STORE_SETTINGS, {}) || {};
    let IS_ADMIN = false;
    const K = () => SITE.constants;

    const ACCENTS = ['teal', 'gold', 'blue', 'purple', 'orange', 'rose'];
    const S = {};
    // visitor's own choices sit on top of the admin's defaults (unless the admin locked them)
    function computeSettings() {
        const mine = (SITE.allowUserSettings !== false || IS_ADMIN) ? LOCAL : {};
        Object.keys(S).forEach((k) => delete S[k]);
        Object.assign(S, DEFAULTS, SITE.defaults, mine);
        S.decimals = Number(S.decimals);
        if (!(S.decimals >= 0 && S.decimals <= 3)) S.decimals = 2;
        if (!I18N[S.lang]) S.lang = 'bn';
        if (!ACCENTS.includes(S.accent)) S.accent = DEFAULTS.accent;
        if (!['light', 'dark', 'system'].includes(S.theme)) S.theme = 'system';
        if (!['s', 'm', 'l'].includes(S.fontSize)) S.fontSize = 'm';
        if (!['auto', 'en', 'bn'].includes(S.digits)) S.digits = 'auto';
    }
    computeSettings();

    /* ---------- i18n helpers ---------- */
    const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
    const useBnDigits = () => (S.digits === 'auto' ? S.lang === 'bn' : S.digits === 'bn');
    const toBn = (s) => String(s).replace(/[0-9]/g, (d) => BN_DIGITS[d]);
    const toEn = (s) => String(s).replace(/[০-৯]/g, (d) => BN_DIGITS.indexOf(d));
    const digits = (s) => (useBnDigits() ? toBn(s) : toEn(s));

    // the admin can rename the site from the dashboard
    function siteOverride(key) {
        const L = S.lang, name = SITE.brand && SITE.brand[L], tag = SITE.tagline && SITE.tagline[L];
        if (key === 'brand.name' && name) return name;
        if (key === 'brand.tag' && tag) return tag;
        if (key === 'home.title' && name) {
            const n = escapeHtml(name);
            return L === 'bn' ? `<span>${n}</span>-এ স্বাগতম` : `Welcome to <span>${n}</span>`;
        }
        return null;
    }

    function t(key, vars) {
        let s = siteOverride(key) ?? (I18N[S.lang] && I18N[S.lang][key]) ?? I18N.en[key] ?? key;
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
        { id: 'column',  icon: 'fa-building-columns',  keys: 'column pillar kolam lintel beam কলাম লিন্টেল' },
        { id: 'wall',    icon: 'fa-trowel-bricks',     keys: 'wall brick cement sand bcs dewal it দেওয়াল ইট গাঁথুনি' },
        { id: 'plaster', icon: 'fa-paint-roller',      keys: 'plaster প্লাস্টার' },
        { id: 'steel',   icon: 'fa-grip-lines',        keys: 'rod steel rebar roof রড স্টিল' },
        { id: 'tiles',   icon: 'fa-table-cells-large', keys: 'tiles floor টাইলস' },
        { id: 'plan',    icon: 'fa-compass-drafting',  keys: 'floor plan cad autocad design drawing house map নকশা ফ্লোর প্ল্যান বাড়ির' },
        { id: 'about',   icon: 'fa-circle-info',       keys: 'about developer আমাদের' },
        { id: 'review',  icon: 'fa-star',              keys: 'review rating feedback contact রিভিউ রেটিং মতামত যোগাযোগ' },
        { id: 'admin',   icon: 'fa-gauge-high' },
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

    // values for formula / label templates: the admin's constants + current area/volume units
    function kvars() {
        const k = K(), met = LEN.system() === 'met', o = {};
        Object.keys(k).forEach((key) => { o[key] = numPlain(k[key]); });
        o.vol = t(met ? 'u.m3' : 'u.cft');
        o.area = t(met ? 'u.m2' : 'u.sqft');
        return o;
    }

    function applyI18n() {
        root.setAttribute('lang', S.lang);
        $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
        $$('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
        const kv = kvars();
        $$('[data-i18n-k]').forEach((el) => { el.textContent = t(el.dataset.i18nK, kv); });
        $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
        $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
        $$('[data-i18n-label]').forEach((el) => { el.label = t(el.dataset.i18nLabel); });
        $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
        $$('[data-ph]').forEach((el) => { el.placeholder = digits(el.dataset.ph); });
        LEN.refresh(document);
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

        TILES.renumber();
        COLS.relabel();
        PLAN.relabel();
        updateTopbar();
        $$('[data-search]').forEach((w) => { if ($('input', w).value.trim()) w._run(); });
    }

    function applyAll() {
        applyTheme();
        applySiteUi();
        applyI18n();
        syncSettingsForm();
        applyContacts();
        renderDeveloper();
        applyAnnouncement();
        applyFavicon();
        VIZ.refreshAll();
    }

    function saveSettings() {
        storage.set(STORE_SETTINGS, LOCAL);
    }

    function setSetting(key, value) {
        LOCAL[key] = value;
        saveSettings();
        computeSettings();
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
       Site icon (favicon) — managed from the admin dashboard
       ========================================================= */
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
        const custom = SITE.favicon || '';
        const href = custom || defaultIcon();
        $('#favicon').href = href;
        $('#icon-preview').src = href;
        $('#icon-state').textContent = t(custom ? 'icon.custom' : 'icon.default');
        $('#icon-delete').disabled = !custom;
    }

    /* =========================================================
       Contact links (WhatsApp, Gmail, phone, social) — from site config
       ========================================================= */
    const safeUrl = (u) => (/^https:\/\/[^\s"'<>]+$/i.test(String(u || '').trim()) ? String(u).trim() : '');
    const onlyDigits = (s) => toEn(String(s || '')).replace(/\D/g, '');
    // local BD numbers (01XXXXXXXXX) → 8801XXXXXXXXX for wa.me
    const waNumber = (s) => { const d = onlyDigits(s); return /^01\d{9}$/.test(d) ? '88' + d : d; };
    function waLink(text, number = SITE.contact.whatsapp) {
        const n = waNumber(number);
        return n ? `https://wa.me/${n}${text ? '?text=' + encodeURIComponent(text) : ''}` : '';
    }
    function gmailLink(subject, body, to = SITE.contact.email) {
        if (!to) return '';
        let url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;
        if (subject) url += `&su=${encodeURIComponent(subject)}`;
        if (body) url += `&body=${encodeURIComponent(body)}`;
        return url;
    }
    /* ---------- About page: developer card (from Admin → Developer) ---------- */
    const DEV_ICONS = {
        globe: 'fa-solid fa-globe', location: 'fa-solid fa-location-dot', work: 'fa-solid fa-briefcase',
        link: 'fa-solid fa-link', award: 'fa-solid fa-award', code: 'fa-solid fa-code', info: 'fa-solid fa-circle-info',
        github: 'fa-brands fa-github', linkedin: 'fa-brands fa-linkedin-in', facebook: 'fa-brands fa-facebook-f',
    };
    const trn = (o) => (o && (o[S.lang] || o.bn || o.en)) || '';
    const initialsOf = (name) => String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    const isPhoto = (u) => /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(String(u || ''));

    function renderDeveloper() {
        const d = SITE.developer || {};
        const card = $('#dev-card'), form = $('#inquiry-form');
        const wa = waNumber(d.whatsapp), mail = String(d.email || '').trim();
        card.hidden = d.enabled === false;
        form.hidden = d.inquiry === false || (!wa && !mail);
        $('#about-wrap').classList.toggle('two', !card.hidden && !form.hidden);

        const av = $('#dev-avatar');
        const initials = (d.initials || initialsOf(d.name)).slice(0, 4);
        av.innerHTML = isPhoto(d.photo) ? `<img src="${escapeHtml(d.photo)}" alt="">` : escapeHtml(initials);
        av.hidden = !isPhoto(d.photo) && !initials;
        const setText = (id, text) => { const n = $(id); n.textContent = text; n.hidden = !text; };
        setText('#dev-name', d.name || '');
        setText('#dev-role', trn(d.role));
        setText('#dev-about', trn(d.about));

        const row = (icon, cls, label, value, href) => `
            <li><span class="menu-icon ${cls}"><i class="${icon}"></i></span><span><small>${escapeHtml(label)}</small>${href
                ? `<a href="${escapeHtml(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''}>${escapeHtml(value)}</a>`
                : `<span class="v">${escapeHtml(value)}</span>`}</span></li>`;
        const rows = [];
        if (wa) rows.push(row('fa-brands fa-whatsapp', 'wa', t('lbl.whatsapp'), '+' + wa, waLink(trn(SITE.contact.waMessage), wa)));
        if (mail) rows.push(row('fa-solid fa-envelope', 'gm', t('lbl.gmail'), mail, gmailLink(t('brand.name'), '', mail)));
        if (d.phone) rows.push(row('fa-solid fa-phone', '', t('lbl.mobile'), d.phone, 'tel:' + toEn(d.phone).replace(/[^\d+]/g, '')));
        if (trn(d.education)) rows.push(row('fa-solid fa-graduation-cap', '', t('lbl.education'), trn(d.education), ''));
        (Array.isArray(d.extras) ? d.extras : []).forEach((x) => {
            if (!x || !(x.value || trn(x.label))) return;
            rows.push(row(DEV_ICONS[x.icon] || DEV_ICONS.info, '', trn(x.label), x.value || safeUrl(x.url), safeUrl(x.url)));
        });
        $('#dev-info').innerHTML = rows.join('');
        $('#dev-info').hidden = !rows.length;

        $('#inq-wa').hidden = !wa;
        $('#inq-gm').hidden = !mail;
    }

    function applyContacts() {
        const c = SITE.contact;
        const greet = (c.waMessage || {})[S.lang] || '';
        const setLink = (a, href) => {
            a.hidden = !href;
            if (href) a.href = href; else a.removeAttribute('href');
            const li = a.closest('.info-list li');
            if (li) li.hidden = !href;
        };
        $$('[data-contact="whatsapp"]').forEach((a) => setLink(a, waLink(greet)));
        $$('[data-contact="gmail"]').forEach((a) => setLink(a, gmailLink(t('brand.name'), '')));
        $$('[data-contact="tel"]').forEach((a) => setLink(a, c.phone ? 'tel:' + toEn(c.phone).replace(/[^\d+]/g, '') : ''));
        $$('[data-social]').forEach((a) => setLink(a, safeUrl(c[a.dataset.social])));
        $$('[data-contact-text]').forEach((el) => {
            const k = el.dataset.contactText;
            el.textContent = k === 'whatsapp' ? (waNumber(c.whatsapp) ? '+' + waNumber(c.whatsapp) : '') : (c[k] || '');
        });
        $('#wa-float').hidden = !c.waFloat || (!waLink('') && !gmailLink('', ''));
    }

    /* =========================================================
       Site-wide settings from the admin (visibility, banner, prices…)
       ========================================================= */
    const CALC_IDS = ['roof', 'column', 'wall', 'plaster', 'steel', 'tiles', 'plan'];
    const calcOn = (id) => SITE.calculators[id] !== false;

    function applySiteUi() {
        // calculators on/off
        $$('[data-feature]').forEach((el) => { el.hidden = !calcOn(el.dataset.feature); });
        $$('.side-link[data-link]').forEach((a) => { if (CALC_IDS.includes(a.dataset.link)) a.hidden = !calcOn(a.dataset.link); });
        $$('[data-demo]').forEach((b) => { b.hidden = !calcOn(b.dataset.demo); });

        // can visitors change their own settings?
        const locked = SITE.allowUserSettings === false && !IS_ADMIN;
        $$('[data-open-settings]').forEach((b) => { b.hidden = locked; });
        $('#theme-btn').hidden = locked;
        $('#lang-btn').hidden = locked;
        if (locked) closeSettings();

        // admin entry points
        $('#admin-link').hidden = !IS_ADMIN;
        $('#admin-login-btn').hidden = IS_ADMIN;

        // default market prices (set by the admin, per bag / cft / piece / kg) → every calculator
        const met = LEN.system() === 'met';
        [['cementPrice', 'cement'], ['sandPrice', 'sand'], ['khoaPrice', 'khoa'], ['brickPrice', 'brick'], ['rodPrice', 'rod']].forEach(([name, key]) => {
            let price = Number(SITE.prices[key]) || 0;
            if (!(price > 0)) return;
            $$(`form[data-calc] input[name="${name}"]`).forEach((inp) => {
                if (inp.value.trim()) return;
                const p = inp.dataset.price === 'vol' && met ? price / 0.028316846592 : price;
                inp.value = String(+p.toFixed(2));
            });
        });
    }

    let annDismissed = '';
    try { annDismissed = sessionStorage.getItem('cc.annDismissed') || ''; } catch (e) { /* ignore */ }
    function applyAnnouncement() {
        const a = SITE.announcement || {};
        const text = a.enabled ? (a[S.lang] || a.bn || a.en || '').trim() : '';
        $('#announce-text').textContent = text;
        $('#announce').hidden = !text || annDismissed === text;
    }
    $('#announce-close').addEventListener('click', () => {
        annDismissed = $('#announce-text').textContent;
        try { sessionStorage.setItem('cc.annDismissed', annDismissed); } catch (e) { /* ignore */ }
        $('#announce').hidden = true;
    });

    // called whenever the site config document changes (realtime from Firestore)
    function setSiteConfig(data) {
        SITE = deepMerge(SITE_DEFAULT, data || {});
        storage.set(STORE_SITE, data || {});
        computeSettings();
        applyAll();
        if (CALC_IDS.includes(currentPage) && !calcOn(currentPage)) { toast(t('admin.calcOff')); location.hash = 'home'; }
        if (currentPage === 'admin') ADMIN.fill();
    }

    /* =========================================================
       Firebase: auth (admin only) + Firestore
       ========================================================= */
    const FB = { ready: false, auth: null, db: null, user: null, authResolved: false };
    let pendingAdmin = false;   // page opened at #admin before auth finished loading
    let loginPending = false;   // the login form is waiting for the admin check

    function serverTime() { return firebase.firestore.FieldValue.serverTimestamp(); }

    function fbInit() {
        try {
            if (typeof firebase === 'undefined' || !FIREBASE_CONFIG || !FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId) return;
            if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
            FB.auth = firebase.auth();
            FB.db = firebase.firestore();
            FB.ready = true;
        } catch (e) {
            console.warn('Firebase could not start:', e);
            return;
        }
        // site settings: public, realtime
        FB.db.doc('site/config').onSnapshot(
            (snap) => setSiteConfig(snap.exists ? snap.data() : {}),
            (err) => console.warn('Site config not loaded:', err.code || err)
        );
        // admin session
        FB.auth.onAuthStateChanged(async (user) => {
            FB.user = user;
            let admin = false;
            if (user) {
                // admin-only read: allowed by the Rules → admin; "permission-denied" → not admin
                try { await FB.db.collection('inquiries').limit(1).get(); admin = true; } catch (e) { admin = false; }
                if (!admin) {
                    if (loginPending) showLoginError(t('admin.notAdmin'));
                    loginPending = false;
                    await FB.auth.signOut();
                    return;
                }
            }
            FB.authResolved = true;
            setAdmin(admin);
        });
    }

    function setAdmin(admin) {
        const was = IS_ADMIN;
        IS_ADMIN = admin;
        computeSettings();
        applyAll();
        if (admin) {
            ADMIN.start();
            if (loginPending || pendingAdmin) {
                loginPending = pendingAdmin = false;
                closeLogin();
                toast(t('admin.welcome'));
                location.hash = 'admin';
            }
        } else {
            ADMIN.stop();
            pendingAdmin = false;
            if (was) toast(t('admin.loggedOut'));
            if (currentPage === 'admin') location.hash = 'home';
        }
    }

    /* ---------- Login modal ---------- */
    const loginModal = $('#login-modal');
    const loginScrim = $('#login-scrim');
    const loginForm = $('#login-form');
    const loginError = $('#login-error');
    const showLoginError = (msg) => { loginError.textContent = msg; };

    function openLogin() {
        closeSidebar();
        closeSettings();
        $('#fb-missing').hidden = FB.ready;
        loginError.textContent = '';
        loginModal.classList.add('open');
        loginScrim.classList.add('show');
        document.body.classList.add('lock');
        setTimeout(() => $('#login-email').focus(), 60);
    }
    function closeLogin() {
        if (!loginModal.classList.contains('open')) return;
        loginModal.classList.remove('open');
        loginScrim.classList.remove('show');
        document.body.classList.remove('lock');
    }
    function authError(err) {
        const c = (err && err.code) || '';
        if (/invalid-credential|wrong-password|user-not-found|invalid-email|invalid-login/.test(c)) return t('admin.err.cred');
        if (/too-many-requests/.test(c)) return t('admin.err.many');
        if (/network/.test(c)) return t('admin.err.net');
        return t('admin.err.generic', { code: c || String((err && err.message) || err) });
    }

    $('#admin-login-btn').addEventListener('click', openLogin);
    $('#login-close').addEventListener('click', closeLogin);
    loginScrim.addEventListener('click', closeLogin);
    $('#pass-toggle').addEventListener('click', () => {
        const inp = $('#login-pass');
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        $('#pass-toggle i').className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!FB.ready) { showLoginError(t('admin.noFirebase')); return; }
        const email = $('#login-email').value.trim();
        const pass = $('#login-pass').value;
        if (!email || !pass) { showLoginError(t('err.required')); return; }
        const btn = $('#login-submit');
        const label = $('span', btn);
        btn.disabled = true;
        label.textContent = t('admin.signingIn');
        loginError.textContent = '';
        loginPending = true;
        try {
            await FB.auth.signInWithEmailAndPassword(email, pass);
        } catch (err) {
            loginPending = false;
            showLoginError(authError(err));
        } finally {
            btn.disabled = false;
            label.textContent = t('admin.signIn');
        }
    });
    $('#forgot-btn').addEventListener('click', async () => {
        if (!FB.ready) { showLoginError(t('admin.noFirebase')); return; }
        const email = $('#login-email').value.trim();
        if (!email) { showLoginError(t('admin.needEmail')); $('#login-email').focus(); return; }
        try {
            await FB.auth.sendPasswordResetEmail(email);
            showLoginError('');
            toast(t('admin.resetSent', { email }));
        } catch (err) { showLoginError(authError(err)); }
    });

    /* =========================================================
       Admin dashboard
       ========================================================= */
    const ADMIN = (() => {
        const forms = { site: $('#af-site'), dev: $('#af-dev'), contact: $('#af-contact'), calc: $('#af-calc') };
        const el = (form, name) => $(`[name="${name}"]`, form);
        const setRadio = (form, name, val) => $$(`input[name="${name}"]`, form).forEach((r) => { r.checked = String(val) === r.value; });
        const getRadio = (form, name) => { const r = $(`input[name="${name}"]:checked`, form); return r ? r.value : null; };
        let unsubs = [];
        let inquiries = [];
        let reviews = [];
        let refs = {};

        function setTab(tab) {
            $$('.admin-tabs [data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
            $$('.admin-panel').forEach((p) => { p.hidden = p.dataset.panel !== tab; });
        }
        $$('.admin-tabs [data-tab]').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

        // forms the admin is editing are not overwritten by realtime updates
        Object.values(forms).forEach((f) => {
            const mark = () => { f.dataset.dirty = '1'; };
            f.addEventListener('input', mark);
            f.addEventListener('change', (e) => { if (e.target.id !== 'icon-file') mark(); });
        });
        const isDirty = (f) => f.dataset.dirty === '1';

        function fill() {
            fillForms();
            const ts = SITE.updatedAt;
            $('#last-saved').textContent = ts ? t('ov.lastSaved', { time: fmtTime(ts), who: SITE.updatedBy || '' }) : '';
            $('#admin-email').textContent = FB.user ? FB.user.email : '';
            renderMessages();
        }
        /* ---------- Developer tab ---------- */
        const extrasBox = $('#dev-extras');
        let devPhoto = '';
        function showDevPhoto() {
            const name = el(forms.dev, 'name').value, ini = el(forms.dev, 'initials').value;
            $('#dev-photo-preview').innerHTML = isPhoto(devPhoto) ? `<img src="${escapeHtml(devPhoto)}" alt="">` : escapeHtml((ini || initialsOf(name) || '?').slice(0, 4));
            $('#dev-photo-remove').disabled = !devPhoto;
        }
        function extraRow(x = {}) {
            const div = document.createElement('div');
            div.className = 'extra-row';
            const opts = Object.keys(DEV_ICONS).map((k) => `<option value="${k}"${(x.icon || 'globe') === k ? ' selected' : ''}>${escapeHtml(t('ic.' + k))}</option>`).join('');
            const lab = x.label || {};
            div.innerHTML = `
                <select class="control" data-x="icon" aria-label="${escapeHtml(t('ad.icon'))}">${opts}</select>
                <input class="control" data-x="labelBn" maxlength="60" placeholder="${escapeHtml(t('ad.labelBn'))}" value="${escapeHtml(lab.bn || '')}">
                <input class="control" data-x="labelEn" maxlength="60" placeholder="${escapeHtml(t('ad.labelEn'))}" value="${escapeHtml(lab.en || '')}">
                <input class="control" data-x="value" maxlength="160" placeholder="${escapeHtml(t('ad.value'))}" value="${escapeHtml(x.value || '')}">
                <input class="control" data-x="url" type="url" maxlength="300" placeholder="${escapeHtml(t('ad.url'))} — https://…" value="${escapeHtml(x.url || '')}">
                <button type="button" class="icon-btn icon-btn-sm danger" data-remove-row title="${escapeHtml(t('ad.removeRow'))}" aria-label="${escapeHtml(t('ad.removeRow'))}"><i class="fa-solid fa-trash-can"></i></button>`;
            return div;
        }
        function fillDev(d) {
            const f = forms.dev;
            el(f, 'devEnabled').checked = d.enabled !== false;
            el(f, 'devInquiry').checked = d.inquiry !== false;
            el(f, 'name').value = d.name || '';
            el(f, 'initials').value = d.initials || '';
            el(f, 'roleBn').value = (d.role || {}).bn || '';
            el(f, 'roleEn').value = (d.role || {}).en || '';
            el(f, 'aboutBn').value = (d.about || {}).bn || '';
            el(f, 'aboutEn').value = (d.about || {}).en || '';
            el(f, 'eduBn').value = (d.education || {}).bn || '';
            el(f, 'eduEn').value = (d.education || {}).en || '';
            el(f, 'whatsapp').value = d.whatsapp || '';
            el(f, 'phone').value = d.phone || '';
            el(f, 'email').value = d.email || '';
            devPhoto = isPhoto(d.photo) ? d.photo : '';
            extrasBox.innerHTML = '';
            (Array.isArray(d.extras) ? d.extras : []).forEach((x) => extrasBox.appendChild(extraRow(x)));
            showDevPhoto();
        }
        const markDev = () => { forms.dev.dataset.dirty = '1'; };
        $('#dev-add-row').addEventListener('click', () => {
            const r = extraRow();
            extrasBox.appendChild(r);
            $('input', r).focus();
            markDev();
        });
        extrasBox.addEventListener('click', (e) => {
            const b = e.target.closest('[data-remove-row]');
            if (b) { b.closest('.extra-row').remove(); markDev(); }
        });
        ['name', 'initials'].forEach((n) => el(forms.dev, n).addEventListener('input', showDevPhoto));
        $('#dev-photo-file').addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            e.target.value = '';
            if (!file) return;
            if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type) || file.size > 8 * 1024 * 1024) { toast(t('icon.bad')); return; }
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    // square crop, 256 px JPEG (~20 KB) so it fits in the config document
                    const size = 256, c = document.createElement('canvas');
                    c.width = c.height = size;
                    const ctx = c.getContext('2d');
                    const side = Math.min(img.naturalWidth, img.naturalHeight);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, size, size);
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
                    devPhoto = c.toDataURL('image/jpeg', .85);
                    showDevPhoto();
                    markDev();
                };
                img.onerror = () => toast(t('icon.bad'));
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
        $('#dev-photo-remove').addEventListener('click', () => { devPhoto = ''; showDevPhoto(); markDev(); });
        $('#dev-clear').addEventListener('click', () => {
            if (!window.confirm(t('ad.clearConfirm'))) return;
            fillDev({ enabled: false, inquiry: false, name: '', initials: '', photo: '', role: {}, about: {}, education: {}, whatsapp: '', email: '', phone: '', extras: [] });
            markDev();
        });
        $('#dev-restore').addEventListener('click', () => { fillDev(SITE_DEFAULT.developer); markDev(); });

        forms.dev.addEventListener('submit', (e) => {
            e.preventDefault();
            const f = forms.dev, v = (n) => el(f, n).value.trim();
            const email = v('email');
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast(t('ad.badEmail')); el(f, 'email').focus(); return; }
            const extras = [];
            for (const r of $$('.extra-row', extrasBox)) {
                const g = (k) => $(`[data-x="${k}"]`, r).value.trim();
                const url = g('url');
                if (url && !safeUrl(url)) { toast(t('admin.badUrl')); $('[data-x="url"]', r).focus(); return; }
                if (!g('value') && !g('labelBn') && !g('labelEn') && !url) continue;     // skip empty rows
                extras.push({ icon: DEV_ICONS[g('icon')] ? g('icon') : 'info', label: { bn: g('labelBn'), en: g('labelEn') }, value: g('value'), url });
            }
            save({
                developer: {
                    enabled: el(f, 'devEnabled').checked,
                    inquiry: el(f, 'devInquiry').checked,
                    name: v('name'),
                    initials: v('initials'),
                    photo: devPhoto,
                    role: { bn: v('roleBn'), en: v('roleEn') },
                    about: { bn: v('aboutBn'), en: v('aboutEn') },
                    education: { bn: v('eduBn'), en: v('eduEn') },
                    whatsapp: onlyDigits(v('whatsapp')),
                    phone: v('phone'),
                    email,
                    extras,
                },
            }, f);
        });

        function fillForms() {
            const fs = forms.site, d = SITE.defaults;
            if (!isDirty(forms.dev)) fillDev(SITE.developer);
            if (!isDirty(fs)) {
            el(fs, 'nameBn').value = SITE.brand.bn || '';
            el(fs, 'nameEn').value = SITE.brand.en || '';
            el(fs, 'tagBn').value = SITE.tagline.bn || '';
            el(fs, 'tagEn').value = SITE.tagline.en || '';
            ['theme', 'lang', 'accent', 'fontSize', 'digits', 'decimals'].forEach((k) => setRadio(fs, 'def_' + k, d[k]));
            el(fs, 'allowUserSettings').checked = SITE.allowUserSettings !== false;
            el(fs, 'def_remember').checked = !!d.remember;
            el(fs, 'def_compact').checked = !!d.compact;
            el(fs, 'def_motion').checked = !!d.motion;
            el(fs, 'annEnabled').checked = !!SITE.announcement.enabled;
            el(fs, 'annBn').value = SITE.announcement.bn || '';
            el(fs, 'annEn').value = SITE.announcement.en || '';
            }

            const fc = forms.contact, c = SITE.contact;
            if (!isDirty(fc)) {
            ['whatsapp', 'phone', 'email', 'facebook', 'instagram', 'twitter', 'linkedin'].forEach((k) => { el(fc, k).value = c[k] || ''; });
            el(fc, 'waMsgBn').value = (c.waMessage || {}).bn || '';
            el(fc, 'waMsgEn').value = (c.waMessage || {}).en || '';
            el(fc, 'waFloat').checked = !!c.waFloat;
            }

            const fk = forms.calc;
            if (!isDirty(fk)) {
                CALC_IDS.forEach((id) => { el(fk, 'en_' + id).checked = calcOn(id); });
                ['cement', 'sand', 'khoa', 'brick', 'rod'].forEach((k) => { el(fk, 'p_' + k).value = SITE.prices[k] || 0; });
                fillConstants(SITE.constants);
            }
        }
        function fillConstants(k) {
            Object.keys(SITE_DEFAULT.constants).forEach((key) => { el(forms.calc, 'k_' + key).value = k[key]; });
        }

        async function save(partial, form, keepDirty = false) {
            if (!FB.ready || !IS_ADMIN) return;
            const btn = $('button[type="submit"]', form);
            const label = $('span', btn);
            btn.disabled = true;
            label.textContent = t('admin.saving');
            try {
                partial.updatedAt = serverTime();
                partial.updatedBy = FB.user ? FB.user.email : '';
                await FB.db.doc('site/config').set(partial, { merge: true });
                if (!keepDirty) { delete form.dataset.dirty; fillForms(); }
                toast(t('admin.saved'));
            } catch (err) {
                toast(t('admin.saveErr', { code: err.code || err.message }));
            } finally {
                btn.disabled = false;
                label.textContent = t('admin.save');
            }
        }

        forms.site.addEventListener('submit', (e) => {
            e.preventDefault();
            const f = forms.site, v = (n) => el(f, n).value.trim();
            save({
                brand: { bn: v('nameBn'), en: v('nameEn') },
                tagline: { bn: v('tagBn'), en: v('tagEn') },
                defaults: {
                    theme: getRadio(f, 'def_theme') || 'system',
                    lang: getRadio(f, 'def_lang') || 'bn',
                    accent: getRadio(f, 'def_accent') || 'teal',
                    fontSize: getRadio(f, 'def_fontSize') || 'm',
                    digits: getRadio(f, 'def_digits') || 'auto',
                    decimals: Number(getRadio(f, 'def_decimals') ?? 2),
                    remember: el(f, 'def_remember').checked,
                    compact: el(f, 'def_compact').checked,
                    motion: el(f, 'def_motion').checked,
                },
                allowUserSettings: el(f, 'allowUserSettings').checked,
                announcement: { enabled: el(f, 'annEnabled').checked, bn: v('annBn'), en: v('annEn') },
            }, f);
        });

        forms.contact.addEventListener('submit', (e) => {
            e.preventDefault();
            const f = forms.contact, v = (n) => el(f, n).value.trim();
            const social = {};
            for (const k of ['facebook', 'instagram', 'twitter', 'linkedin']) {
                const u = v(k);
                if (u && !safeUrl(u)) { toast(t('admin.badUrl')); el(f, k).focus(); return; }
                social[k] = u;
            }
            save({
                contact: Object.assign(social, {
                    whatsapp: onlyDigits(v('whatsapp')),
                    phone: v('phone'),
                    email: v('email'),
                    waFloat: el(f, 'waFloat').checked,
                    waMessage: { bn: v('waMsgBn'), en: v('waMsgEn') },
                }),
            }, f);
        });

        forms.calc.addEventListener('submit', (e) => {
            e.preventDefault();
            const f = forms.calc;
            const calculators = {};
            CALC_IDS.forEach((id) => { calculators[id] = el(f, 'en_' + id).checked; });
            const prices = {}, constants = {};
            for (const k of ['cement', 'sand', 'khoa', 'brick', 'rod']) {
                const n = parseNum(el(f, 'p_' + k).value || '0');
                if (!Number.isFinite(n) || n < 0) { toast(t('admin.badNumber')); el(f, 'p_' + k).focus(); return; }
                prices[k] = n;
            }
            for (const k of Object.keys(SITE_DEFAULT.constants)) {
                const n = parseNum(el(f, 'k_' + k).value);
                if (!Number.isFinite(n) || n <= 0) { toast(t('admin.badNumber')); el(f, 'k_' + k).focus(); return; }
                constants[k] = n;
            }
            save({ calculators, prices, constants }, f);
        });
        $('#restore-constants').addEventListener('click', () => fillConstants(SITE_DEFAULT.constants));

        // site icon: upload / delete (saved to the site config for everyone)
        $('#icon-file').addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            e.target.value = '';
            if (!file) return;
            if (!/^image\//.test(file.type) || file.size > 5 * 1024 * 1024) { toast(t('icon.bad')); return; }
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const size = 64;                          // small PNG keeps the config document light
                    const c = document.createElement('canvas');
                    c.width = c.height = size;
                    const ctx = c.getContext('2d');
                    const w = img.naturalWidth || size, h = img.naturalHeight || size;
                    const k = Math.min(size / w, size / h);
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, (size - w * k) / 2, (size - h * k) / 2, w * k, h * k);
                    let url;
                    try { url = c.toDataURL('image/png'); } catch (err) { toast(t('icon.bad')); return; }
                    save({ favicon: url }, forms.site, true);
                };
                img.onerror = () => toast(t('icon.bad'));
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
        $('#icon-delete').addEventListener('click', () => save({ favicon: '' }, forms.site, true));

        $('#admin-logout').addEventListener('click', () => { if (FB.ready) FB.auth.signOut(); });

        /* ---------- messages ---------- */
        function fmtTime(ts) {
            const d = ts && ts.toDate ? ts.toDate() : (ts && ts.seconds ? new Date(ts.seconds * 1000) : null);
            return d ? digits(d.toLocaleString(S.lang === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })) : '';
        }
        const stamp = (m) => (m.createdAt && m.createdAt.seconds) || 0;

        function msgHtml(m, kind) {
            refs[m.id] = m.ref;
            const name = m.name || '—';
            const reply = t('msg.replyText', { name, site: t('brand.name') });
            const wa = m.phone ? waLink(reply, m.phone) : '';
            const gm = m.email ? gmailLink(`Re: ${t('brand.name')}`, reply, m.email) : '';
            const stars = kind === 'review' ? `<span class="msg-stars">${'★'.repeat(Math.max(0, Math.min(5, Number(m.rating) || 0)))}</span>` : '';
            return `
                <article class="msg">
                    <div class="msg-top">
                        <strong>${escapeHtml(name)}<span class="msg-kind">${escapeHtml(t(kind === 'review' ? 'msg.review' : 'msg.inquiry'))}</span></strong>
                        <time>${escapeHtml(fmtTime(m.createdAt))}</time>
                    </div>
                    <div class="msg-meta">${[m.phone, m.email].filter(Boolean).map(escapeHtml).join(' · ')} ${stars}</div>
                    <p class="msg-body">${escapeHtml(m.message || m.comments || '')}</p>
                    <div class="msg-actions">
                        ${wa ? `<a class="btn btn-wa" href="${escapeHtml(wa)}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> ${escapeHtml(t('msg.reply'))}</a>` : ''}
                        ${gm ? `<a class="btn btn-ghost" href="${escapeHtml(gm)}" target="_blank" rel="noopener"><i class="fa-solid fa-envelope"></i> Gmail</a>` : ''}
                        <button type="button" class="btn btn-danger" data-del="${escapeHtml(m.id)}"><i class="fa-solid fa-trash-can"></i> ${escapeHtml(t('msg.delete'))}</button>
                    </div>
                </article>`;
        }
        const listHtml = (items, kind) => (items.length
            ? items.map((m) => msgHtml(m, kind)).join('')
            : `<p class="msg-empty">${escapeHtml(t('msg.empty'))}</p>`);

        function renderMessages() {
            refs = {};
            $('#inq-list').innerHTML = listHtml(inquiries, 'inquiry');
            $('#rev-list').innerHTML = listHtml(reviews, 'review');
            const recent = inquiries.map((m) => [m, 'inquiry']).concat(reviews.map((m) => [m, 'review']))
                .sort((a, b) => stamp(b[0]) - stamp(a[0])).slice(0, 5);
            $('#recent-list').innerHTML = recent.length
                ? recent.map(([m, k]) => msgHtml(m, k)).join('')
                : `<p class="msg-empty">${escapeHtml(t('msg.empty'))}</p>`;
            $('#st-inq').textContent = num(inquiries.length, 0);
            $('#st-rev').textContent = num(reviews.length, 0);
            const rated = reviews.filter((r) => Number(r.rating) > 0);
            $('#st-rating').textContent = rated.length ? `${num(rated.reduce((s, r) => s + Number(r.rating), 0) / rated.length, 1)} ★` : '–';
            $('#st-calc').textContent = `${num(CALC_IDS.filter(calcOn).length, 0)} / ${num(CALC_IDS.length, 0)}`;
            const total = inquiries.length + reviews.length;
            $('#msg-count').hidden = !total;
            $('#msg-count').textContent = num(total, 0);
        }

        $('#page-admin').addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-del]');
            if (!btn) return;
            const ref = refs[btn.dataset.del];
            if (!ref || !window.confirm(t('msg.confirm'))) return;
            try { await ref.delete(); toast(t('msg.deleted')); }
            catch (err) { toast(t('admin.saveErr', { code: err.code || err.message })); }
        });

        function start() {
            stop();
            if (!FB.ready) return;
            const listen = (col, set, listId) => FB.db.collection(col).orderBy('createdAt', 'desc').limit(200).onSnapshot(
                (snap) => { set(snap.docs.map((d) => Object.assign({ id: d.id, ref: d.ref }, d.data()))); renderMessages(); },
                (err) => { $(listId).innerHTML = `<p class="msg-empty">${escapeHtml(t('msg.noaccess', { code: err.code || err.message }))}</p>`; }
            );
            unsubs.push(listen('inquiries', (l) => { inquiries = l; }, '#inq-list'));
            unsubs.push(listen('reviews', (l) => { reviews = l; }, '#rev-list'));
        }
        function stop() {
            Object.values(forms).forEach((f) => { delete f.dataset.dirty; });
            unsubs.forEach((u) => { try { u(); } catch (e) { /* ignore */ } });
            unsubs = [];
            inquiries = [];
            reviews = [];
        }

        return { fill, start, stop, setTab, renderMessages };
    })();

    $('#reset-settings').addEventListener('click', () => {
        LOCAL = {};
        saveSettings();
        computeSettings();
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
        if (e.key === 'Escape') { if (typeof SHARE !== 'undefined') SHARE.close(); closeLogin(); closeSettings(); closeSidebar(); $$('[data-search]').forEach((w) => w._hide()); }
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
        if (id === 'contact') { id = 'review'; history.replaceState(null, '', '#review'); }   // old links
        if (!PAGES.some((p) => p.id === id)) id = 'home';
        if (id === 'admin' && !IS_ADMIN) {
            if (FB.ready && !FB.authResolved) pendingAdmin = true;   // wait for the session to load
            else openLogin();
            history.replaceState(null, '', '#home');
            id = 'home';
        }
        if (CALC_IDS.includes(id) && !calcOn(id)) {
            toast(t('admin.calcOff'));
            history.replaceState(null, '', '#home');
            id = 'home';
        }
        currentPage = id;
        document.body.dataset.page = id;

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
        if (id === 'plan') PLAN.show();
        if (id === 'admin') ADMIN.fill();
    }
    window.addEventListener('hashchange', route);

    /* =========================================================
       Search (sidebar + home hero)
       ========================================================= */
    function findPages(q) {
        q = toEn(q.trim().toLowerCase());
        if (!q) return [];
        return PAGES.filter((p) => {
            if (p.id === 'home' || p.id === 'admin') return false;
            if (CALC_IDS.includes(p.id) && !calcOn(p.id)) return false;
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

    // Accepts English or Bangla digits, thousands commas, and feet'inches (12'6 = 12.5 ft)
    function parseNum(raw) {
        const s = toEn(String(raw)).replace(/[,\s]/g, '').replace('٫', '.').replace(/[’′]/g, "'").replace(/[”″]/g, '"');
        const fi = s.match(/^(\d+(?:\.\d+)?)'(?:(\d+(?:\.\d+)?)"?)?$/);
        if (fi) return Number(fi[1]) + (fi[2] ? Number(fi[2]) / 12 : 0);
        if (s === '' || !/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
        return Number(s);
    }

    /* =========================================================
       Length boxes: feet | inch in one box + unit menu (ft+in, ft, in, m, cm, mm)
       Every length input carries data-len="ft" or data-len="in" — the unit the
       formulas expect. Whatever the visitor types is converted to that unit.
       ========================================================= */
    // single units (inches per unit) and two-part combinations [big, small]
    // International engineering practice:
    //   Imperial — feet-inches (12'-6"), feet, inches, yards
    //   Metric (SI) — metre, centimetre, millimetre (never mixed with imperial)
    const IN_PER = { ft: 12, in: 1, yd: 36, m: 39.37007874015748, cm: 0.3937007874015748, mm: 0.03937007874015748 };
    const UNIT_KEY = { ft: 'u.ft', in: 'u.inch', yd: 'u.yd', m: 'u.m', cm: 'u.cm', mm: 'u.mm' };
    const COMBOS = { ftin: ['ft', 'in'] };
    const LEN_UNITS = [...Object.keys(COMBOS), ...Object.keys(IN_PER)];
    const SYSTEM_OF = { ftin: 'imp', ft: 'imp', in: 'imp', yd: 'imp', m: 'met', cm: 'met', mm: 'met' };
    const STORE_UNIT = 'cc.unit';
    const PREC = { ft: 4, in: 3, yd: 4, m: 4, cm: 2, mm: 1 };      // decimals shown after converting
    const r3 = (n) => +(+n).toFixed(3);

    /* =========================================================
       Lengths: pick ONE unit at the top of a calculator and every box follows it.
       Two-part units (Feet + Inch, Meter + Centimetre, Centimetre + Millimetre,
       Yard + Feet, Haat + Inch) show both parts in one box with a faint divider.
       Inputs carry data-len="ft"|"in" — the unit the formulas expect.
       ========================================================= */
    const LEN = (() => {
        let unit = storage.get(STORE_UNIT, 'ftin');
        if (!LEN_UNITS.includes(unit)) unit = 'ftin';
        const boxOf = (inp) => inp.closest('.len-box');
        const toInches = (inp, v) => (inp.dataset.len === 'ft' ? v * 12 : v);
        // inches → whole big units + remainder in small units
        const split = (inches, [A, B]) => {
            let a = Math.floor((inches + 1e-9) / IN_PER[A]);
            let b = +((inches - a * IN_PER[A]) / IN_PER[B]).toFixed(PREC[B]);
            const per = IN_PER[A] / IN_PER[B];
            if (b >= per - 1e-9) { a += 1; b = +(b - per).toFixed(PREC[B]); }
            return { a, b };
        };
        function setLook(w) {
            const mode = w.dataset.mode, combo = COMBOS[mode];
            if (combo) w.dataset.combo = '1'; else delete w.dataset.combo;
            const tags = $$('.len-tag:not(.solo)', w);
            tags[0].textContent = combo ? t(UNIT_KEY[combo[0]]) : '';
            tags[1].textContent = combo ? t(UNIT_KEY[combo[1]]) : '';
            $('.len-sub', w).setAttribute('aria-label', combo ? t(UNIT_KEY[combo[1]]) : '');
            $('.len-tag.solo', w).textContent = combo ? '' : t(UNIT_KEY[mode]);
        }

        function enhance(scope = document) {
            $$('input[data-len]', scope).forEach((inp) => {
                if (boxOf(inp)) return;
                const wrap = inp.parentElement;
                $$('.unit', wrap).forEach((u) => u.remove());
                wrap.className = 'input-wrap len-box';
                inp.insertAdjacentHTML('afterend', `
                    <span class="len-tag"></span>
                    <span class="len-div" aria-hidden="true"></span>
                    <input type="text" inputmode="decimal" autocomplete="off" class="len-sub">
                    <span class="len-tag"></span>
                    <span class="len-tag solo"></span>`);
                wrap.dataset.mode = unit;
                setLook(wrap);
            });
        }

        // → { empty } | { bad } | { neg } | { value } (value in the field's base unit)
        function read(inp, mode = (boxOf(inp) || {}).dataset?.mode || unit) {
            const w = boxOf(inp);
            const main = inp.value.trim();
            const sub = w ? $('.len-sub', w).value.trim() : '';
            // untouched since we converted it → use the exact value (no rounding drift)
            if (inp.dataset.exact && inp.dataset.shown === main + '|' + sub) {
                const ex = Number(inp.dataset.exact);
                return { value: inp.dataset.len === 'ft' ? ex / 12 : ex };
            }
            const combo = COMBOS[mode];
            if (main === '' && (!combo || sub === '')) return { empty: true };
            let inches;
            if (combo) {
                const quoted = mode === 'ftin' && /['’′]/.test(main);   // 12'6 typed in the feet part
                const x = main === '' ? 0 : (quoted ? parseNum(main) : parseNum(main));
                const y = (sub === '' || quoted) ? 0 : parseNum(sub);
                if (!Number.isFinite(x) || !Number.isFinite(y)) return { bad: true };
                if (x < 0 || y < 0) return { neg: true };
                inches = x * IN_PER[combo[0]] + y * IN_PER[combo[1]];
            } else {
                const n = parseNum(main);
                if (!Number.isFinite(n)) return { bad: true };
                if (n < 0) return { neg: true };
                inches = n * IN_PER[mode];
            }
            return { value: inp.dataset.len === 'ft' ? inches / 12 : inches };
        }
        const value = (inp) => { const r = read(inp); return r.value ?? NaN; };

        function write(inp, inches) {
            const w = boxOf(inp), sub = $('.len-sub', w), mode = w.dataset.mode, combo = COMBOS[mode];
            if (inches == null || !Number.isFinite(inches)) { inp.value = ''; sub.value = ''; delete inp.dataset.exact; return; }
            if (combo) {
                const { a, b } = split(inches, combo);
                inp.value = String(a);
                sub.value = b ? String(b) : '';
            } else {
                inp.value = String(+(inches / IN_PER[mode]).toFixed(PREC[mode]));
                sub.value = '';
            }
            inp.dataset.exact = String(inches);
            inp.dataset.shown = inp.value.trim() + '|' + sub.value.trim();
        }
        function refresh(scope = document) {
            $$('.unit-select').forEach((sel) => { sel.value = unit; });
            $$('.len-box', scope).forEach((w) => {
                const inp = $('input[data-len]', w), sub = $('.len-sub', w);
                const ph = Number(toEn(inp.dataset.ph || '0'));
                const inches = Number.isFinite(ph) ? toInches(inp, ph) : 0;
                const combo = COMBOS[w.dataset.mode];
                setLook(w);
                if (combo) {
                    const { a, b } = split(inches, combo);
                    inp.placeholder = digits(String(a));
                    sub.placeholder = digits(String(b));
                } else {
                    inp.placeholder = digits(String(+(inches / IN_PER[w.dataset.mode]).toFixed(PREC[w.dataset.mode])));
                    sub.placeholder = '';
                }
            });
        }
        // prices per cft ↔ per m³ (and per sq ft ↔ per m²), areas sq ft ↔ m², when the system changes
        function convertSystem(toMet) {
            const r2 = (x) => String(+x.toFixed(2));
            $$('input[data-price], input[data-area-val]').forEach((inp) => {
                const n = parseNum(inp.value);
                if (!Number.isFinite(n) || inp.value.trim() === '') return;
                let kind = inp.dataset.price || 'areaVal';
                if (kind === 'tile') {
                    const pu = $('input[name="priceUnit"]:checked', inp.form);
                    if (pu && pu.value === 'box') return;
                    kind = 'area';
                }
                const f = kind === 'vol' ? 0.028316846592 : 0.09290304;
                if (kind === 'areaVal') inp.value = r2(toMet ? n * f : n / f);          // an area
                else inp.value = r2(toMet ? n / f : n * f);                             // a price per area / volume
            });
        }
        // change the unit everywhere and convert what was already typed
        function setUnit(to) {
            if (!LEN_UNITS.includes(to) || to === unit) { refresh(); return; }
            if (SYSTEM_OF[to] !== SYSTEM_OF[unit]) convertSystem(SYSTEM_OF[to] === 'met');
            $$('.len-box').forEach((w) => {
                const inp = $('input[data-len]', w);
                const r = read(inp, w.dataset.mode);
                w.dataset.mode = to;
                if (r.value != null) write(inp, toInches(inp, r.value));
            });
            unit = to;
            storage.set(STORE_UNIT, unit);
            refresh();
        }
        // "12 ft 6 inch", "3 m 81 cm", "3.81 m" …
        function display(inp, v) {
            const w = boxOf(inp);
            const mode = w ? w.dataset.mode : unit;
            const inches = toInches(inp, v);
            const combo = COMBOS[mode];
            if (combo) {
                const { a, b } = split(inches, combo);
                return `${numPlain(a)}'-${numPlain(b)}"`;          // engineering notation: 12'-6"
            }
            return `${numPlain(+(inches / IN_PER[mode]).toFixed(PREC[mode]))} ${t(UNIT_KEY[mode])}`;
        }
        const state = (inp) => { const w = boxOf(inp); return w ? { sub: $('.len-sub', w).value } : null; };
        function restore(inp, st) {
            const w = boxOf(inp);
            if (!st || !w) return;
            if (st.sub != null) $('.len-sub', w).value = st.sub;
        }
        // values saved in another unit are converted to the current one
        function restoreForm(form, savedUnit) {
            if (!savedUnit || savedUnit === unit || !LEN_UNITS.includes(savedUnit)) return;
            if (SYSTEM_OF[savedUnit] !== SYSTEM_OF[unit]) {
                const r2 = (x) => String(+x.toFixed(2)), toMet = SYSTEM_OF[unit] === 'met';
                $$('input[data-price], input[data-area-val]', form).forEach((inp) => {
                    const n = parseNum(inp.value);
                    if (!Number.isFinite(n) || inp.value.trim() === '') return;
                    if (inp.dataset.price === 'tile' && ($('input[name="priceUnit"]:checked', form) || {}).value === 'box') return;
                    const f = inp.dataset.price === 'vol' ? 0.028316846592 : 0.09290304;
                    inp.value = r2(inp.dataset.areaVal !== undefined ? (toMet ? n * f : n / f) : (toMet ? n / f : n * f));
                });
            }
            $$('.len-box', form).forEach((w) => {
                const inp = $('input[data-len]', w);
                const r = read(inp, savedUnit);
                if (r.value != null) write(inp, toInches(inp, r.value));
            });
        }
        // plan lengths (feet) in the chosen unit: 12'-6", 3.81 m …
        function fmtInches(inches) {
            const combo = COMBOS[unit];
            if (combo) {
                const neg = inches < 0 ? '−' : '';
                const { a, b } = split(Math.abs(inches), combo);
                const bb = +b.toFixed(1);
                if (!a) return `${neg}${numPlain(bb)}"`;
                return `${neg}${numPlain(a)}'-${numPlain(bb)}"`;
            }
            return `${numPlain(+(inches / IN_PER[unit]).toFixed(Math.min(PREC[unit], 2)))} ${t(UNIT_KEY[unit])}`;
        }
        const fmt = (ft) => fmtInches(ft * 12);
        const fmtIn = (inch) => (unit === 'm' ? `${numPlain(+(inch * 2.54).toFixed(1))} ${t('u.cm')}` : fmtInches(inch));
        // put a value (in the field's base unit) into a length box
        const set = (inp, val) => write(inp, Number.isFinite(+val) ? toInches(inp, +val) : null);
        const sync = () => refresh();
        const current = () => unit;
        const system = () => SYSTEM_OF[unit] || 'imp';

        document.addEventListener('change', (e) => {
            if (!e.target.classList || !e.target.classList.contains('unit-select')) return;
            setUnit(e.target.value);
            $$('form[data-calc]').forEach((f) => {
                saveInputs(f);
                VIZ.update(f.dataset.calc);
                if (lastValues[f.dataset.calc]) { const nv = readForm(f); if (nv) lastValues[f.dataset.calc] = nv; }
            });
            applyI18n();                                   // units in labels + results follow the new system
        });

        return { enhance, read, value, display, refresh, state, restore, restoreForm, sync, current, setUnit, system, fmt, fmtIn, set };
    })();
    LEN.enhance(document);

    // two lengths with the same unit → "600 × 600 mm"
    function pairLabel(a, b) {
        const pa = String(a).split(' '), pb = String(b).split(' ');
        if (pa.length === 2 && pb.length === 2 && pa[1] === pb[1]) return `${pa[0]} × ${pb[0]} ${pa[1]}`;
        return `${a} × ${b}`;
    }

    function readForm(form) {
        let ok = true;
        const v = { _disp: {} };
        $$('input[data-num]', form).forEach((inp) => {
            if (inp.closest('[hidden]')) { setError(inp, ''); return; }           // e.g. custom tile size not chosen
            const optional = inp.hasAttribute('data-optional');
            let n, err = '';
            if (inp.hasAttribute('data-len')) {
                const r = LEN.read(inp);
                if (r.empty) {
                    if (optional) { setError(inp, ''); v[inp.name] = Number(inp.dataset.default || 0); return; }
                    err = 'err.required';
                } else if (r.bad) err = 'err.number';
                else if (r.neg) err = 'err.negative';
                else n = r.value;
            } else {
                const raw = inp.value.trim();
                if (raw === '') {
                    if (optional) { setError(inp, ''); v[inp.name] = Number(inp.dataset.default || 0); return; }
                    err = 'err.required';
                } else {
                    n = parseNum(raw);
                    if (!Number.isFinite(n)) err = 'err.number';
                    else if (n < 0) err = 'err.negative';
                }
            }
            if (!err && inp.hasAttribute('data-positive') && !(n > 0)) err = 'err.positive';
            setError(inp, err);
            if (err) { ok = false; return; }
            v[inp.name] = n;
            if (inp.hasAttribute('data-len')) v._disp[inp.name] = LEN.display(inp, n);
        });
        $$('input[type="radio"]:checked', form).forEach((r) => { v[r.name] = r.value; });
        // metric prices / areas → the per-cft, per-sq-ft basis the formulas use
        if (ok && LEN.system() === 'met') {
            $$('input[data-price], input[data-area-val]', form).forEach((inp) => {
                const n = v[inp.name];
                if (!(n > 0)) return;
                let kind = inp.dataset.price || 'areaVal';
                if (kind === 'tile') { if (v.priceUnit === 'box') return; kind = 'area'; }
                if (kind === 'vol') v[inp.name] = n * 0.028316846592;           // per m³ → per cft
                else if (kind === 'area') v[inp.name] = n * 0.09290304;         // per m² → per sq ft
                else v[inp.name] = n / 0.09290304;                              // m² → sq ft
            });
        }
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

    /* ---------- Unit system for results (Imperial ↔ Metric/SI) ----------
       Formulas always work in feet / inches / cft (the original method).
       Results are shown in the system of the chosen unit:
       Imperial → sq ft, cft, rft, kg/ft   ·   Metric → m², m³, m, kg/m      */
    const M2_PER_SQFT = 0.09290304, M3_PER_CFT = 0.028316846592, M_PER_FT = 0.3048;
    const isMet = () => LEN.system() === 'met';
    const vd = () => (isMet() ? Math.max(S.decimals, 3) : S.decimals);           // m³ needs more decimals
    const qArea = (sqft) => [num(isMet() ? sqft * M2_PER_SQFT : sqft), t(isMet() ? 'u.m2' : 'u.sqft')];
    const qVol = (cft) => [num(isMet() ? cft * M3_PER_CFT : cft, vd()), t(isMet() ? 'u.m3' : 'u.cft')];
    const qLen = (ft) => [num(isMet() ? ft * M_PER_FT : ft), t(isMet() ? 'u.m' : 'u.ft')];
    const qRun = (ft) => [num(isMet() ? ft * M_PER_FT : ft), t(isMet() ? 'u.rm' : 'u.rft')];
    const qKgPer = (kgft) => [num(isMet() ? kgft / M_PER_FT : kgft, 3), t(isMet() ? 'u.kgm' : 'u.kgft')];
    const rq = (label, [val, unit], key = false) => row(label, val, unit, key);
    const qs = ([val, unit]) => `${val} ${unit}`;

    // optional market prices → cost rows (only the ones that were filled in)
    function costItems(lines) {
        const used = lines.filter(([, qty, price]) => price > 0 && qty > 0);
        if (!used.length) return [];
        let sum = 0;
        const out = [heading(t('grp.priceCalc'))];
        used.forEach(([key, qty, price]) => {
            const c = qty * price;
            sum += c;
            out.push(row(t(key), num(c), t('u.taka')));
        });
        out.push(total(t('r.totalCost'), num(sum), t('u.taka')));
        return out;
    }

    // the usual cement / sand (/ khoa) block shared by roof, column, plaster
    function mixItems(dry, v, withKhoa) {
        const sum = v.ratio1 + v.ratio2 + (withKhoa ? v.ratio3 : 0);
        const cement = dry / sum * v.ratio1, sand = dry / sum * v.ratio2, khoa = withKhoa ? dry / sum * v.ratio3 : 0;
        const bags = cement * K().cementBag;
        const items = [
            heading(t('grp.materials')),
            rq(t('mat.cement'), qVol(cement)),
            row(t('r.cementBags'), num(bags), t('u.bags'), true),
            rq(t('mat.sand'), qVol(sand)),
            row(t('r.sandBags'), num(sand / K().cftPerBag), t('u.bags'), true),
        ];
        if (withKhoa) {
            items.push(rq(t('mat.khoa'), qVol(khoa)), row(t('r.khoaBags'), num(khoa / K().cftPerBag), t('u.bags'), true));
        }
        return { items, cement, bags, sand, khoa };
    }

    /* ---------- Calculators (formulas kept the same as the original site) ---------- */
    // constants (dry factor, bag sizes, bricks per cft …) come from K() — the admin can tune them
    // prices arrive per bag / per piece / per kg, and per cft (or per sq ft) — readForm converts metric prices

    const CALC = {
        roof: {
            ratios: ['ratio1', 'ratio2', 'ratio3'],
            run(v) {
                const length = (v.firstLength + v.secondLength) / 2;
                const width = (v.firstWidth + v.secondWidth) / 2;
                const height = v.height / 12;                 // thickness is read in inches
                const area = length * width;
                const volume = area * height;
                const dry = volume * K().dry;
                const m = mixItems(dry, v, true);
                const L = qLen(length), W = qLen(width);
                return [
                    row(t('r.avgLW'), `${L[0]} × ${W[0]}`, L[1]),
                    rq(t('r.area'), qArea(area)),
                    rq(t('r.totalVolume'), qVol(volume)),
                    rq(t('r.dryVolume'), qVol(dry)),
                    row(t('r.ratio'), ratioText(v.ratio1, v.ratio2, v.ratio3)),
                    ...m.items,
                    ...costItems([['r.cementCost', m.bags, v.cementPrice], ['r.sandCost', m.sand, v.sandPrice], ['r.khoaCost', m.khoa, v.khoaPrice]]),
                ];
            },
        },

        // columns and lintels — any number of each
        column: {
            ratios: ['ratio1', 'ratio2', 'ratio3'],
            run(v) {
                const items = colItems(v);
                const rows = [];
                const sums = { column: 0, lintel: 0 }, counts = { column: 0, lintel: 0 };
                items.forEach((it) => {
                    const vol = it.L * (it.W / 12) * (it.T / 12) * it.Q;
                    sums[it.type] += vol;
                    counts[it.type] += it.Q;
                    const dims = [it.dL, it.dW, it.dT].filter(Boolean).join(' × ');
                    rows.push(rq(`${it.no}${dims ? ` (${dims})` : ''}${it.Q !== 1 ? ` × ${numPlain(it.Q)}` : ''}`, qVol(vol)));
                });
                const volume = sums.column + sums.lintel;
                const dry = volume * K().dry;
                const m = mixItems(dry, v, true);
                const bricksForKhoa = Math.ceil(m.khoa * K().khoaBricks - 1e-9);
                const out = [...rows];
                if (counts.column) out.push(rq(t('cl.colTotal', { n: numPlain(counts.column) }), qVol(sums.column)));
                if (counts.lintel) out.push(rq(t('cl.linTotal', { n: numPlain(counts.lintel) }), qVol(sums.lintel)));
                out.push(
                    rq(t('r.workVolume'), qVol(volume), true),
                    rq(t('r.dryVolume'), qVol(dry)),
                    row(t('r.ratio'), ratioText(v.ratio1, v.ratio2, v.ratio3)),
                    ...m.items,
                    row(t('r.bricksKhoa'), num(bricksForKhoa, 0), t('u.pcs'), true),
                    ...costItems([['r.cementCost', m.bags, v.cementPrice], ['r.sandCost', m.sand, v.sandPrice], ['r.khoaCost', m.khoa, v.khoaPrice]]),
                );
                return out;
            },
        },

        wall: {
            ratios: ['ratio1', 'ratio2'],
            run(v) {
                const volume = v.wallLength * v.wallHeight * (v.brickThickness / 12);
                const bricks = Math.ceil(volume * K().bricksPerCft - 1e-9);
                const dryMix = volume * K().wallDry;
                const m = mixItems(dryMix, v, false);
                return [
                    rq(t('r.workVolume'), qVol(volume)),
                    row(t('r.bricks'), num(bricks, 0), t('u.pcs'), true),
                    rq(t('r.dryMix'), qVol(dryMix)),
                    row(t('r.ratio'), ratioText(v.ratio1, v.ratio2)),
                    ...m.items,
                    ...costItems([['r.brickCost', bricks, v.brickPrice], ['r.cementCost', m.bags, v.cementPrice], ['r.sandCost', m.sand, v.sandPrice]]),
                ];
            },
        },

        plaster: {
            ratios: ['ratio1', 'ratio2'],
            run(v) {
                const area = v.wallLength * v.wallHeight;
                const volume = area * (v.plasterThickness / 12);
                const dry = volume * K().dry;
                const m = mixItems(dry, v, false);
                return [
                    rq(t('r.workArea'), qArea(area)),
                    rq(t('r.totalVolume'), qVol(volume)),
                    rq(t('r.dryVolume'), qVol(dry)),
                    row(t('r.ratio'), ratioText(v.ratio1, v.ratio2)),
                    ...m.items,
                    ...costItems([['r.cementCost', m.bags, v.cementPrice], ['r.sandCost', m.sand, v.sandPrice]]),
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
                const kgPerFt = (v.mm ** 2) / K().steelDiv;
                const kg = subTotal * kgPerFt;
                const d = v._disp || {};
                return [
                    row(t('r.bars', { len: d.width || qs(qLen(v.width)) }), num(barsA, 0), t('u.pcs')),
                    row(t('r.bars', { len: d.length || qs(qLen(v.length)) }), num(barsB, 0), t('u.pcs')),
                    rq(t('r.rodLength'), qRun(totalLength)),
                    rq(t('r.wastage', { p: numPlain(v.wastage) }), qRun(waste)),
                    rq(t('r.subTotal'), qRun(subTotal)),
                    rq(t('r.kgPerFt', { mm: numPlain(v.mm), per: t(isMet() ? 'u.m' : 'u.ft') }), qKgPer(kgPerFt)),
                    total(t('r.rodTotal'), num(kg), t('u.kg')),
                    ...costItems([['r.rodCost', kg, v.rodPrice]]),
                ];
            },
        },

        tiles: {
            ratios: ['ratio1', 'ratio2'],
            run(v) {
                const parts = tileParts(v);
                const floor = parts.reduce((a, p) => a + p.L * p.W, 0);
                const net = Math.max(floor - (v.deduct || 0), 0);
                const perimeter = parts.reduce((a, p) => a + 2 * (p.L + p.W), 0);
                const skirt = v.skirt > 0 ? perimeter * v.skirt / 12 : 0;
                const area = net + skirt;
                const tile = tileDims(v);
                const oneTile = tile.a * tile.b / 144;
                const base = Math.ceil(area / oneTile - 1e-9);
                const wastage = v.wastage || 0;
                const withWaste = Math.ceil(base * (1 + wastage / 100) - 1e-9);
                const perBox = Math.floor(v.perBox || 0);
                const boxes = perBox > 0 ? Math.ceil(withWaste / perBox) : 0;
                const buyTiles = boxes ? boxes * perBox : withWaste;
                const buySft = buyTiles * oneTile;

                const items = [rq(t('r.floorArea'), qArea(floor))];
                if (v.deduct > 0) { const a = qArea(v.deduct); items.push(row(t('r.deduct'), '− ' + a[0], a[1])); }
                if (skirt > 0) items.push(rq(t('r.skirtArea'), qArea(skirt)));
                items.push(
                    rq(t('r.tileArea'), qArea(area)),
                    heading(t('grp.tiles')),
                    row(t('r.tileSize'), tile.label),
                    (() => { const a = qArea(oneTile); return row(t('r.oneTile'), num(isMet() ? oneTile * M2_PER_SQFT : oneTile, isMet() ? 4 : 3), a[1]); })(),
                    row(t('r.tilesNet'), num(base, 0), t('u.pcs')),
                    row(t('r.wastage', { p: numPlain(wastage) }), '+ ' + num(withWaste - base, 0), t('u.pcs')),
                    row(t('r.tilesTotal'), num(withWaste, 0), t('u.pcs'), true),
                );
                if (boxes) items.push(row(t('r.boxes'), `${num(boxes, 0)}`, `${t('u.box')} (${num(buyTiles, 0)} ${t('u.pcs')})`, true));
                items.push(rq(t('r.buySft'), qArea(buySft), true));

                let mortar = { bags: 0, sand: 0 };
                if (v.bed > 0) {
                    const sum = v.ratio1 + v.ratio2;
                    const dry = net * (v.bed / 12) * K().tileDry;
                    const cement = dry / sum * v.ratio1;
                    const sand = dry / sum * v.ratio2;
                    mortar = { bags: cement * K().cementBag, sand };
                    items.push(
                        heading(t('grp.mortar')),
                        rq(t('r.dryVolume'), qVol(dry)),
                        row(t('r.ratio'), ratioText(v.ratio1, v.ratio2)),
                        rq(t('mat.cement'), qVol(cement)),
                        row(t('r.cementBags'), num(mortar.bags), t('u.bags'), true),
                        rq(t('r.sandBags'), qVol(sand), true),
                    );
                }
                let tileCost = 0;
                if (v.price > 0) {
                    if (v.priceUnit === 'box' && !boxes) items.push(heading(t('grp.priceCalc')), row(t('tl.needBox'), ''));
                    else tileCost = v.priceUnit === 'box' ? boxes * v.price : buySft * v.price;
                }
                items.push(...costItems([['r.tileCost', 1, tileCost], ['r.cementCost', mortar.bags, v.cementPrice], ['r.sandCost', mortar.sand, v.sandPrice]]));
                return items;
            },
        },
    };

    /* ---------- Column & lintel helpers ---------- */
    // rows come in as type_0 / iL_0 / iW_0 / iT_0 / iQ_0, type_1 …
    function colItems(v) {
        const d = v._disp || {};
        const n = { column: 0, lintel: 0 };
        return Object.keys(v)
            .filter((k) => /^iL_\d+$/.test(k))
            .map((k) => k.slice(3))
            .sort((a, b) => a - b)
            .map((i) => {
                const type = v['type_' + i] === 'lintel' ? 'lintel' : 'column';
                n[type] += 1;
                return {
                    type, L: v['iL_' + i], W: v['iW_' + i], T: v['iT_' + i], Q: v['iQ_' + i] > 0 ? v['iQ_' + i] : 1,
                    dL: d['iL_' + i], dW: d['iW_' + i], dT: d['iT_' + i],
                    no: t(type === 'lintel' ? 'cl.lintelN' : 'cl.columnN', { n: n[type] }),
                };
            })
            .filter((it) => it.L > 0 && it.W > 0 && it.T > 0);
    }

    /* ---------- Tiles helpers ---------- */
    // room parts come in as len_0/wid_0, len_1/wid_1 …
    function tileParts(v) {
        return Object.keys(v)
            .filter((k) => /^len_\d+$/.test(k))
            .map((k) => k.slice(4))
            .sort((a, b) => a - b)
            .map((i) => ({ L: v['len_' + i], W: v['wid_' + i] }))
            .filter((p) => p.L > 0 && p.W > 0);
    }
    function tileDims(v) {
        if (v.tileSize && v.tileSize !== 'custom') {
            const [a, b] = v.tileSize.split('x').map(Number);
            return { a, b, label: `${numPlain(a)} × ${numPlain(b)} ${t('u.inch')}` };
        }
        // custom size: tileA / tileB already in inches (the box converts mm, cm …)
        const d = v._disp || {};
        const label = d.tileA && d.tileB ? pairLabel(d.tileA, d.tileB) : `${numPlain(r3(v.tileA))} × ${numPlain(r3(v.tileB))} ${t('u.inch')}`;
        return { a: v.tileA, b: v.tileB, label };
    }

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

    // [label, value] pairs for the print/PDF report
    function inputsList(form, v) {
        const out = [];
        $$('input[data-num]', form).forEach((inp) => {
            if (inp.closest('[hidden]')) return;
            const isLen = inp.hasAttribute('data-len');
            const empty = isLen ? LEN.read(inp).empty : !inp.value.trim();
            if (inp.hasAttribute('data-optional') && empty) return;
            const field = inp.closest('.field');
            let label = $('label', field).textContent.replace(/\s*\(.*?\)\s*$/, '').trim();
            if (field.closest('.fields.ratio') && !/·/.test(label)) label = `${t('grp.ratio')} · ${label}`;
            const part = inp.closest('[data-area]');
            if (part) label = `${$('.area-no', part).textContent} · ${label}`;
            let value;
            if (isLen) value = (v._disp && v._disp[inp.name]) || numPlain(v[inp.name]);
            else {
                const unitEl = $('.unit', field);
                const typed = parseNum(inp.value);
                value = `${numPlain(Number.isFinite(typed) ? typed : v[inp.name])} ${unitEl ? unitEl.textContent : ''}`.trim();
            }
            out.push([label, value]);
        });
        if (form.dataset.calc === 'tiles') out.splice(0, 0);
        return out;
    }
    function inputsSummary(form, v) {
        return inputsList(form, v).map(([l, val]) => `<div>${escapeHtml(l)}: <strong>${escapeHtml(val)}</strong></div>`).join('');
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
        $$('input[data-num]', form).forEach((inp) => {
            data[inp.name] = inp.value;
            const st = LEN.state(inp);
            if (st) data[inp.name + '__in'] = st.sub;
        });
        $$('input[type="radio"]:checked', form).forEach((r) => { data[r.name] = r.value; });
        data.__unit = LEN.current();
        all[form.dataset.calc] = data;
        storage.set(STORE_INPUTS, all);
    }
    function restoreInputs(form) {
        if (!S.remember) return;
        const data = storage.get(STORE_INPUTS, {})[form.dataset.calc];
        if (!data) return;
        $$('input[data-num]', form).forEach((inp) => {
            LEN.restore(inp, { sub: data[inp.name + '__in'] });
            if (data[inp.name] != null) inp.value = data[inp.name];
        });
        LEN.restoreForm(form, data.__unit || 'ftin');
        $$('input[type="radio"]', form).forEach((r) => { if (data[r.name] != null) r.checked = data[r.name] === r.value; });
    }

    /* =========================================================
       3D preview (three.js) — redraws live as measurements are typed
       ========================================================= */
    const VIZ = (() => {
        // sample sizes shown until the user types their own
        const DEF = {
            roof:    { firstLength: 20, secondLength: 20, firstWidth: 12, secondWidth: 12, height: 5 },
            column:  { items: [{ type: 'column', L: 10, W: 12, T: 12, Q: 1, no: '' }] },
            wall:    { wallLength: 12, wallHeight: 10, brickThickness: 5 },
            plaster: { wallLength: 12, wallHeight: 10, plasterThickness: 0.75 },
            steel:   { length: 16, width: 10, gap: 6, mm: 10 },
            tiles:   { len_0: 12, wid_0: 10 },
        };
        const SIZE = 4;          // longest side, in scene units
        const MAX_BARS = 90;     // per direction, for clarity / performance
        const cards = {};
        const viewers = {};
        let active = null;
        let planSrc = null;        // floor plan data comes from the PLAN editor

        const glOK = (() => {
            try {
                if (typeof THREE === 'undefined' || !window.WebGLRenderingContext) return false;
                const c = document.createElement('canvas');
                return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
            } catch (e) { return false; }
        })();

        const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
        const fv = (n, unitKey) => `${numPlain(n)} ${t(unitKey)}`;
        // the length exactly as the visitor typed it (their unit), else the base unit
        const D = (v, name, unitKey) => (v._disp && v._disp[name]) || fv(v[name], unitKey);
        function lenOf(inp) {
            if (!inp) return { n: NaN };
            if (inp.hasAttribute('data-len')) {
                const r = LEN.read(inp);
                return r.value != null ? { n: r.value, d: LEN.display(inp, r.value) } : { n: NaN };
            }
            return { n: parseNum(inp.value) };
        }
        const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

        // tiles: every room part + tile size (falls back to a 12 × 10 ft room with 24 × 24 in tiles)
        function readTiles(form) {
            const parts = [];
            let live = false;
            $$('[data-area]', form).forEach((r) => {
                const L = lenOf($('input[name^="len_"]', r)), W = lenOf($('input[name^="wid_"]', r));
                if (L.n > 0 && W.n > 0) { parts.push({ L: L.n, W: W.n, dL: L.d, dW: W.d }); live = true; }
            });
            if (!parts.length) parts.push({ L: 12, W: 10 });
            const get = (n) => lenOf($(`input[name="${n}"]`, form)).n;
            const tA = lenOf($('input[name="tileA"]', form)), tB = lenOf($('input[name="tileB"]', form));
            const tv = {
                tileSize: ($('input[name="tileSize"]:checked', form) || {}).value || '24x24',
                tileA: tA.n, tileB: tB.n, _disp: { tileA: tA.d, tileB: tB.d },
            };
            if (tv.tileSize === 'custom' && !(tv.tileA > 0 && tv.tileB > 0)) tv.tileSize = '24x24';
            const td = tileDims(tv);
            const w = get('wastage');
            return {
                v: {
                    parts, tileA: td.a, tileB: td.b, tileLabel: td.label,
                    skirt: get('skirt') > 0 ? get('skirt') : 0,
                    deduct: get('deduct') > 0 ? get('deduct') : 0,
                    wastage: w >= 0 ? w : 10,
                },
                live,
            };
        }

        // column & lintel: every row that has its three sizes
        function readColumn(form) {
            const items = [];
            const n = { column: 0, lintel: 0 };
            $$('[data-area]', form).forEach((r) => {
                const g = (p) => lenOf($(`input[name^="${p}_"]`, r));
                const L = g('iL'), W = g('iW'), T = g('iT');
                const q = parseNum($('input[name^="iQ_"]', r).value);
                const type = ($('input[type="radio"]:checked', r) || {}).value === 'lintel' ? 'lintel' : 'column';
                n[type] += 1;
                if (L.n > 0 && W.n > 0 && T.n > 0) {
                    items.push({ type, L: L.n, W: W.n, T: T.n, Q: q > 0 ? q : 1, dL: L.d, dW: W.d, dT: T.d,
                        no: t(type === 'lintel' ? 'cl.lintelN' : 'cl.columnN', { n: n[type] }) });
                }
            });
            return { v: { items: items.length ? items : DEF.column.items }, live: items.length > 0 };
        }

        function readValues(id) {
            const form = $(`form[data-calc="${id}"]`);
            if (id === 'tiles') return readTiles(form);
            if (id === 'column') return readColumn(form);
            if (id === 'plan') { const d = planSrc ? planSrc() : null; return { v: { plan: d }, live: !!(d && (d.walls.length || d.furn.length)) }; }
            const v = { _disp: {} };
            let live = false;
            Object.keys(DEF[id]).forEach((k) => {
                // query by name: form.elements['length'] would return the element count
                const r = lenOf($(`input[name="${k}"]`, form));
                if (Number.isFinite(r.n) && r.n > 0) { v[k] = r.n; live = true; if (r.d) v._disp[k] = r.d; } else v[k] = DEF[id][k];
            });
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
                    [t('f.firstLength'), D(v, 'firstLength', 'u.ft')],
                    [t('f.secondLength'), D(v, 'secondLength', 'u.ft')],
                    [t('f.firstWidth'), D(v, 'firstWidth', 'u.ft')],
                    [t('f.secondWidth'), D(v, 'secondWidth', 'u.ft')],
                    [t('grp.thickness'), D(v, 'height', 'u.inch')],
                    [t('viz.areaCalc'), `${num(L * W)} ${t('u.sqft')}`],
                ];
                if (q) chips.push([t('viz.areaShape'), `${num(polyArea(q))} ${t('u.sqft')}`]);
                return chips;
            },
            column(v) {
                const c = { column: 0, lintel: 0 };
                let vol = 0;
                v.items.forEach((it) => { c[it.type] += it.Q; vol += it.L * it.W * it.T / 144 * it.Q; });
                const chips = [];
                if (c.column) chips.push([t('cl.column'), `${num(c.column, 0)} ${t('u.pcs')}`]);
                if (c.lintel) chips.push([t('cl.lintel'), `${num(c.lintel, 0)} ${t('u.pcs')}`]);
                chips.push([t('r.workVolume'), qs(qVol(vol))]);
                return chips;
            },
            wall(v) {
                const vol = v.wallLength * v.wallHeight * (v.brickThickness / 12);
                return [
                    [t('f.wallLength'), D(v, 'wallLength', 'u.ft')],
                    [t('f.wallHeight'), D(v, 'wallHeight', 'u.ft')],
                    [t('f.brickThickness'), D(v, 'brickThickness', 'u.inch')],
                    [t('viz.bricks'), `≈ ${num(Math.ceil(vol * K().bricksPerCft - 1e-9), 0)} ${t('u.pcs')}`],
                ];
            },
            plaster(v) {
                return [
                    [t('f.wallLength'), D(v, 'wallLength', 'u.ft')],
                    [t('f.wallHeight'), D(v, 'wallHeight', 'u.ft')],
                    [t('f.plasterThickness'), D(v, 'plasterThickness', 'u.inch')],
                    [t('r.workArea'), qs(qArea(v.wallLength * v.wallHeight))],
                ];
            },
            tiles(v) {
                const floor = v.parts.reduce((a, p) => a + p.L * p.W, 0);
                const per = v.parts.reduce((a, p) => a + 2 * (p.L + p.W), 0);
                const area = Math.max(floor - v.deduct, 0) + (v.skirt > 0 ? per * v.skirt / 12 : 0);
                const base = Math.ceil(area / (v.tileA * v.tileB / 144) - 1e-9);
                const total = Math.ceil(base * (1 + v.wastage / 100) - 1e-9);
                const chips = [
                    [t('r.floorArea'), qs(qArea(floor))],
                    [t('r.tileSize'), v.tileLabel],
                    [t('grp.tiles'), `≈ ${num(total, 0)} ${t('u.pcs')}`],
                ];
                if (v.parts.length > 1) chips.unshift([t('tl.areas'), v.parts.map((p) => `${p.dL || fv(p.L, 'u.ft')} × ${p.dW || fv(p.W, 'u.ft')}`).join(' + ')]);
                return chips;
            },
            plan(v) {
                const d = v.plan;
                if (!d || !(d.walls.length || d.furn.length)) return [[t('fp.r.rooms'), num(0, 0)]];
                const floor = d.rooms.reduce((a, r) => a + PLAN.polyArea(r.pts), 0);
                const doors = d.openings.filter((o) => o.type === 'door').length;
                return [
                    [t('fp.r.rooms'), num(d.rooms.length, 0)],
                    [t('r.floorArea'), qs(qArea(floor))],
                    [t('fp.r.doorWin'), `${num(doors, 0)} / ${num(d.openings.length - doors, 0)}`],
                ];
            },
            steel(v) {
                const s = steelSteps(v);
                return [
                    [t('grp.length'), D(v, 'length', 'u.ft')],
                    [t('grp.width'), D(v, 'width', 'u.ft')],
                    [t('f.gap'), D(v, 'gap', 'u.inch')],
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
        const tileTex = () => canvasTex('tile', 256, 256, (g, w, h) => {
            g.fillStyle = '#b8b1a6'; g.fillRect(0, 0, w, h);                // grout
            const tw = w / 2, th = h / 2;
            for (let r = 0; r < 2; r++) {
                for (let c = 0; c < 2; c++) {
                    const x = c * tw, y = r * th;
                    g.fillStyle = `hsl(36, 20%, ${88 + Math.random() * 5}%)`;
                    g.fillRect(x + 3, y + 3, tw - 6, th - 6);
                    g.strokeStyle = 'rgba(140,128,112,.16)'; g.lineWidth = 2;     // soft marble vein
                    g.beginPath();
                    g.moveTo(x + 8, y + 20 + Math.random() * 60);
                    g.bezierCurveTo(x + 45, y + Math.random() * 120, x + 85, y + Math.random() * 120, x + tw - 8, y + 30 + Math.random() * 80);
                    g.stroke();
                }
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
                const T = v.height / 12;                       // thickness is in inches
                const unitKey = 'u.inch';
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
                    dim(pa, pb, n.multiplyScalar(.35), key ? `${t(key)} ${D(v, key.slice(2), 'u.ft')}` : fv(val, 'u.ft'));
                });
                // thickness at the front-left corner
                const out = V(P[0].x, 0, P[0].z).normalize().multiplyScalar(.3);
                dim(P[0].clone().setY(lift), P[0].clone().setY(lift + y), out, D(v, 'height', unitKey));

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
                // columns stand side by side; lintels sit across at lintel level (up to 4 copies of each row)
                const inst = [];
                v.items.forEach((it) => { for (let i = 0; i < Math.min(Math.ceil(it.Q), 4); i++) inst.push({ it, first: i === 0 }); });
                const gapFt = 2;
                const footFt = (x) => (x.it.type === 'lintel' ? x.it.L : x.it.W / 12);
                const spanFt = inst.reduce((a, x) => a + footFt(x), 0) + gapFt * (inst.length - 1);
                const cols = v.items.filter((it) => it.type === 'column');
                const colH = cols.length ? Math.max(...cols.map((it) => it.L)) : 0;
                const linY = colH ? colH * 0.8 : 7;
                const maxDepth = Math.max(...v.items.map((it) => (it.type === 'lintel' ? it.T : 0) / 12), 0);
                const maxZ = Math.max(...v.items.map((it) => (it.type === 'lintel' ? it.W : it.T) / 12));
                const k = SIZE / Math.max(spanFt, colH, v.items.some((it) => it.type === 'lintel') ? linY + maxDepth : 0, 1);
                const linMat = new THREE.MeshStandardMaterial({ color: C.dark ? 0x9aa3ad : 0xb3bac2, roughness: .9, map: concreteTex() });
                let x = -spanFt * k / 2, topY = 0;
                inst.forEach(({ it, first }) => {
                    if (it.type === 'column') {
                        const X = Math.max(it.W / 12 * k, .05), Y = it.L * k, Z = Math.max(it.T / 12 * k, .05);
                        box(X, Y, Z, concrete(), x + X / 2, Y / 2, 0);
                        if (first) {
                            dim(V(x, 0, Z / 2), V(x, Y, Z / 2), V(-.3, 0, 0), it.dL || fv(it.L, 'u.ft'));
                            const lab = makeLabel(it.Q > 1 ? `${it.no} × ${numPlain(it.Q)}` : it.no, C);
                            lab.position.set(x + X / 2, Y + .55, 0);
                            g.add(lab);
                        }
                        topY = Math.max(topY, Y);
                        x += X + gapFt * k;
                    } else {
                        const X = it.L * k, Y = Math.max(it.T / 12 * k, .04), Z = Math.max(it.W / 12 * k, .04), y0 = linY * k;
                        box(X, Y, Z, linMat, x + X / 2, y0 + Y / 2, 0);
                        if (first) {
                            dim(V(x, y0, Z / 2), V(x + X, y0, Z / 2), V(0, -.55, .3), it.dL || fv(it.L, 'u.ft'));
                            const lab = makeLabel(it.Q > 1 ? `${it.no} × ${numPlain(it.Q)}` : it.no, C);
                            lab.position.set(x + X * .65, y0 + Y + .28, .35);     // keep clear of the column labels
                            g.add(lab);
                        }
                        topY = Math.max(topY, y0 + Y);
                        x += X + gapFt * k;
                    }
                });
                ground(Math.max(spanFt * k, .8), Math.max(maxZ * k, .8));
                bbox = { w: spanFt * k, h: topY + .4, d: maxZ * k, cy: (topY + .4) / 2 };
            }

            else if (id === 'wall') {
                const L = v.wallLength, H = v.wallHeight, T = v.brickThickness / 12;
                const k = SIZE / Math.max(L, H, T);
                const X = L * k, Y = H * k, Z = Math.max(T * k, .04);
                box(X, Y, Z, brickMaterials(L, H, T), 0, Y / 2, 0);
                ground(X, Math.max(Z, .8));
                dim(V(-X / 2, 0, Z / 2), V(X / 2, 0, Z / 2), V(0, 0, .35), D(v, 'wallLength', 'u.ft'));
                dim(V(-X / 2, 0, Z / 2), V(-X / 2, Y, Z / 2), V(-.35, 0, 0), D(v, 'wallHeight', 'u.ft'));
                dim(V(X / 2, Y, -Z / 2), V(X / 2, Y, Z / 2), V(.3, .15, 0), D(v, 'brickThickness', 'u.inch'));
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
                dim(V(-X / 2, 0, tw / 2 + p), V(X / 2, 0, tw / 2 + p), V(0, 0, .35), D(v, 'wallLength', 'u.ft'));
                dim(V(-X / 2, 0, tw / 2 + p), V(-X / 2, Y, tw / 2 + p), V(-.35, 0, 0), D(v, 'wallHeight', 'u.ft'));
                dim(V(-X / 2 + cover, Y * .62, tw / 2), V(-X / 2 + cover, Y * .62, tw / 2 + p), V(.4, 0, .25),
                    `${t('viz.plaster')} ${D(v, 'plasterThickness', 'u.inch')}`);
                bbox = { w: X, h: Y, d: tw + p, cy: Y / 2 };
            }

            else if (id === 'tiles') {
                const parts = v.parts;
                const totalL = parts.reduce((a, p) => a + p.L, 0);
                const maxW = Math.max(...parts.map((p) => p.W));
                const k = SIZE / Math.max(totalL, maxW);
                const T = .06, back = -maxW * k / 2, ft = 'u.ft';
                const plain = new THREE.MeshStandardMaterial({ color: C.dark ? 0xb9b4ab : 0xd9d4ca, roughness: .6 });
                let x0 = -totalL * k / 2;
                parts.forEach((p, i) => {
                    const X = p.L * k, Z = p.W * k;
                    const top = tileTex().clone();
                    top.userData = {};
                    top.needsUpdate = true;
                    // texture = 2 × 2 tiles
                    top.repeat.set(Math.max(p.L * 12 / v.tileA / 2, .05), Math.max(p.W * 12 / v.tileB / 2, .05));
                    const topMat = new THREE.MeshStandardMaterial({ map: top, roughness: .35, metalness: .05 });
                    box(X, T, Z, [plain, plain, topMat, plain, plain, plain], x0 + X / 2, T / 2, back + Z / 2);
                    const front = back + Z;
                    dim(V(x0, T, front), V(x0 + X, T, front), V(0, 0, .35), p.dL || fv(p.L, ft));
                    if (i === 0) dim(V(x0, T, back), V(x0, T, front), V(-.35, 0, 0), p.dW || fv(p.W, ft));
                    else dim(V(x0 + X, T, back), V(x0 + X, T, front), V(.35, 0, 0), p.dW || fv(p.W, ft));
                    if (v.skirt > 0) {                                   // skirting along the back (and the left wall)
                        const hS = Math.max(v.skirt / 12 * k, .03), d = .025;
                        box(X, hS, d, plain, x0 + X / 2, T + hS / 2, back + d / 2);
                        if (i === 0) box(d, hS, Z, plain, x0 + d / 2, T + hS / 2, back + Z / 2);
                    }
                    x0 += X;
                });
                const lab = makeLabel(v.tileLabel, C);                   // tile size badge on the floor
                lab.position.set(-totalL * k / 2 + .55, .32, back + parts[0].W * k - .35);
                g.add(lab);
                ground(totalL * k, maxW * k);
                bbox = { w: totalL * k, h: .35, d: maxW * k, cy: .06 };
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
                dim(V(-X / 2, y0 - slabT / 2, Z / 2), V(X / 2, y0 - slabT / 2, Z / 2), V(0, 0, .35), D(v, 'length', 'u.ft'));
                dim(V(X / 2, y0 - slabT / 2, -Z / 2), V(X / 2, y0 - slabT / 2, Z / 2), V(.35, 0, 0), D(v, 'width', 'u.ft'));
                if (!s.simplified && xs.length > 1) {
                    dim(V(xs[0], y0 + slabT / 2, Z / 2), V(xs[1], y0 + slabT / 2, Z / 2), V(0, .3, 0), D(v, 'gap', 'u.inch'));
                }
                bbox = { w: X, h: y0 + slabT, d: Z, cy: y0 };
            }
            else if (id === 'plan') {
                const d = v.plan || { walls: [], rooms: [], openings: [], furn: [] };
                const pts = [];
                d.walls.forEach((w) => pts.push(w.a, w.b));
                d.rooms.forEach((r) => pts.push(...r.pts));
                d.furn.forEach((f) => pts.push({ x: f.x - f.w / 2, y: f.y - f.d / 2 }, { x: f.x + f.w / 2, y: f.y + f.d / 2 }));
                if (!pts.length) pts.push({ x: 0, y: 0 }, { x: 30, y: 20 });
                const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
                const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
                const span = Math.max(maxX - minX, maxY - minY, 4);
                const k = 6 / span, cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
                const S3 = (p, y = 0) => V((p.x - cx) * k, y, (p.y - cy) * k);       // plan y (down) → scene +z (towards the camera)
                const wallMat = new THREE.MeshStandardMaterial({ color: C.dark ? 0xd6d3cd : 0xf3efe8, roughness: .9 });
                const capMat = new THREE.MeshStandardMaterial({ color: C.dark ? 0x9aa3ad : 0x8b95a1, roughness: .9 });
                const glass = new THREE.MeshStandardMaterial({ color: 0x8ec5e8, transparent: true, opacity: .45, roughness: .1, metalness: .1, depthWrite: false });
                const wood = new THREE.MeshStandardMaterial({ color: 0xa47148, roughness: .7 });
                let topY = 0;
                // a box placed along a direction (angle in plan) — w along, h up, t across
                function seg(w, h, tt, mat, centre, y0, ang) {
                    if (w <= 1e-4 || h <= 1e-4) return;
                    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, tt), Array.isArray(mat) ? mat : [mat, mat, capMat, mat, mat, mat]);
                    m.position.copy(S3(centre, y0 + h / 2));
                    m.rotation.y = -ang;
                    g.add(m);
                    const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), edgeMat);
                    e.position.copy(m.position); e.rotation.copy(m.rotation);
                    g.add(e);
                }
                // floors
                const floorTx = tileTex().clone();
                floorTx.userData = {}; floorTx.needsUpdate = true; floorTx.repeat.set(k * 2.5, k * 2.5);
                const floorMat = new THREE.MeshStandardMaterial({ map: floorTx, roughness: .6, side: THREE.DoubleSide });
                d.rooms.forEach((r) => {
                    const shape = new THREE.Shape(r.pts.map((p) => new THREE.Vector2((p.x - cx) * k, (p.y - cy) * k)));
                    const geo = new THREE.ShapeGeometry(shape);
                    geo.rotateX(Math.PI / 2);
                    const m = new THREE.Mesh(geo, floorMat);
                    m.position.y = .012;
                    g.add(m);
                });
                // walls, cut around doors and windows
                d.walls.forEach((w) => {
                    const dx = w.b.x - w.a.x, dy = w.b.y - w.a.y, L = Math.hypot(dx, dy);
                    if (L < 1e-3) return;
                    const ang = Math.atan2(dy, dx), u = { x: dx / L, y: dy / L };
                    const at = (s) => ({ x: w.a.x + u.x * s, y: w.a.y + u.y * s });
                    const tt = Math.max(w.t / 12 * k, .02), H = w.h * k;
                    topY = Math.max(topY, H);
                    const ops = d.openings.filter((o) => o.wall === w.id).map((o) => ({ o, s: Math.max(o.at - o.w / 2, 0), e: Math.min(o.at + o.w / 2, L) })).sort((p, q) => p.s - q.s);
                    let cur = 0;
                    ops.forEach(({ o, s, e }) => {
                        if (s > cur) seg((s - cur) * k, H, tt, wallMat, at((cur + s) / 2), 0, ang);
                        const sill = Math.min(o.sill || 0, w.h), top = Math.min(sill + o.h, w.h);
                        const wd = (e - Math.max(s, cur)) * k, mid = at((Math.max(s, cur) + e) / 2);
                        if (wd > 0) {
                            if (sill > 0) seg(wd, sill * k, tt, wallMat, mid, 0, ang);
                            if (top < w.h) seg(wd, (w.h - top) * k, tt, wallMat, mid, top * k, ang);
                            if (o.type === 'window') seg(wd, (top - sill) * k, Math.max(tt * .18, .006), glass, mid, sill * k, ang);
                            else seg(wd, (top - sill) * k, Math.max(tt * .35, .01), wood, mid, 0, ang);
                        }
                        cur = Math.max(cur, e);
                    });
                    if (cur < L) seg((L - cur) * k, H, tt, wallMat, at((cur + L) / 2), 0, ang);
                });
                // furniture
                const LIBF = PLAN.LIB;
                d.furn.forEach((f) => {
                    const L = LIBF[f.kind];
                    if (!L) return;
                    const mat = new THREE.MeshStandardMaterial({ color: L.c, roughness: .8 });
                    const ang = (f.rot || 0) * Math.PI / 180;
                    if (f.kind === 'stairs') {
                        const n = Math.max(2, Math.round(f.d / .85)), step = f.d / n;
                        for (let i = 0; i < n; i++) {
                            const off = -f.d / 2 + step * (i + .5);
                            const c = { x: f.x - Math.sin(ang) * off, y: f.y + Math.cos(ang) * off };
                            seg(f.w * k, (L.h / n) * (n - i) * k, step * k, mat, c, 0, ang);
                        }
                        return;
                    }
                    const h = L.h * k;
                    seg(f.w * k, h, f.d * k, [mat, mat, mat, mat, mat, mat], f, 0, ang);
                    topY = Math.max(topY, h);
                });
                // room names
                d.rooms.forEach((r) => {
                    if (!r.name) return;
                    const c = PLAN.centroid(r.pts);
                    const lab = makeLabel(r.name, C);
                    lab.scale.multiplyScalar(.8);
                    lab.position.copy(S3(c, .25));
                    g.add(lab);
                });
                ground((maxX - minX) * k, (maxY - minY) * k);
                topY = Math.max(topY, .3);
                bbox = { w: (maxX - minX) * k, h: topY, d: (maxY - minY) * k, cy: topY / 3 };
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
                if (this.id === 'plan') this.fitR = clamp(this.fitR / Math.min(1, Math.max(this.camera.aspect, .4) * 1.15), 4, 26);
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
            // still picture of the current view (for print / PDF)
            snapshot(w = 960, h = 600) {
                const r = this.renderer, pr = r.getPixelRatio();
                r.setPixelRatio(1.5);
                r.setSize(w, h, false);
                this.camera.aspect = w / h;
                this.camera.updateProjectionMatrix();
                this.render();
                const url = r.domElement.toDataURL('image/png');
                r.setPixelRatio(pr);
                this.resize();
                this.render();
                return url;
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
        const ORDER = ['roof', 'column', 'wall', 'plaster', 'steel', 'tiles'];
        const demo = { el: null, viewer: null, shape: 'roof', timer: 0, touched: false, bound: false };
        const demoValues = (id) => {
            if (id === 'column') {
                return { items: [
                    { type: 'column', L: 10, W: 12, T: 12, Q: 2, no: t('cl.columnN', { n: 1 }) },
                    { type: 'lintel', L: 8, W: 10, T: 6, Q: 1, no: t('cl.lintelN', { n: 1 }) },
                ] };
            }
            if (id === 'tiles') {
                return { parts: [{ L: 14, W: 12 }, { L: 7, W: 7 }], tileA: 24, tileB: 24, tileLabel: `24 × 24 ${t('u.inch')}`, skirt: 4, deduct: 0, wastage: 10 };
            }
            return Object.assign({ heightUnit: 'inches' },
                id === 'roof' ? { firstLength: 30, secondLength: 24, firstWidth: 18, secondWidth: 20, height: 5 } : DEF[id]);
        };

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
                try {
                    viewers[id] = new Viewer(id, cards[id]);
                    if (id === 'plan') { viewers[id].setAuto(false); viewers[id].home.phi = .9; viewers[id].view.phi = .9; }
                } catch (e) { console.warn('3D preview unavailable:', e); }
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

        function snapshot(id) {
            const vw = viewers[id];
            if (!vw) return '';
            try { vw.rebuild(readValues(id).v); return vw.snapshot(); } catch (e) { console.warn('3D snapshot failed:', e); return ''; }
        }

        // the floor plan page has its own 3D panel (not a generated card)
        function attach(id, el, src) {
            cards[id] = el;
            planSrc = src;
            if (!glOK) {
                $('.viz-stage', el).insertAdjacentHTML('beforeend', '<div class="viz-empty"><div><i class="fa-solid fa-cube"></i><span data-i18n="viz.nogl"></span></div></div>');
                $('.plan-3d-tools > span', el).hidden = true;
            }
            $('[data-viz-rotate]', el).addEventListener('click', () => { const vw = viewers[id]; if (vw) vw.setAuto(!vw.auto); });
            $('[data-viz-reset]', el).addEventListener('click', () => { if (viewers[id]) viewers[id].resetView(); });
        }

        return { createCards, update, show, refreshAll, snapshot, attach };
    })();

    /* ---------- Column & lintel form: any number of columns and lintels ---------- */
    const COLS = (() => {
        const form = $('form[data-calc="column"]');
        const list = $('#col-items');
        let nextId = 0;
        const translate = (scope) => {
            $$('[data-i18n]', scope).forEach((el) => { el.textContent = t(el.dataset.i18n); });
            $$('[data-i18n-title]', scope).forEach((el) => { el.title = t(el.dataset.i18nTitle); });
            $$('[data-i18n-aria]', scope).forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
            $$('[data-ph]', scope).forEach((el) => { el.placeholder = digits(el.dataset.ph); });
        };
        const lenField = (i, name, base) => `
            <div class="field">
                <label for="column-${name}_${i}" data-role="${name}"></label>
                <div class="input-wrap"><input type="text" inputmode="decimal" autocomplete="off" id="column-${name}_${i}" name="${name}_${i}" data-num data-positive data-len="${base}" data-ph="0"></div>
                <span class="field-error"></span>
            </div>`;
        const LABELS = {
            column: { iL: 'cl.colH', iW: 'cl.width', iT: 'cl.colT' },
            lintel: { iL: 'cl.linL', iW: 'cl.width', iT: 'cl.linD' },
        };
        function relabel() {
            const n = { column: 0, lintel: 0 };
            const rows = $$('[data-area]', list);
            rows.forEach((r) => {
                const type = ($('input[type="radio"]:checked', r) || {}).value === 'lintel' ? 'lintel' : 'column';
                r.dataset.type = type;
                n[type] += 1;
                $('.area-no', r).textContent = t(type === 'lintel' ? 'cl.lintelN' : 'cl.columnN', { n: n[type] });
                ['iL', 'iW', 'iT'].forEach((k) => { $(`[data-role="${k}"]`, r).textContent = t(LABELS[type][k]); });
                $('[data-remove-part]', r).hidden = rows.length === 1;
            });
        }
        function addRow(type, focus) {
            const i = nextId++;
            const row = document.createElement('div');
            row.className = 'item-row';
            row.dataset.area = String(i);
            row.innerHTML = `
                <div class="item-head">
                    <span class="area-no"></span>
                    <div class="segmented" role="radiogroup">
                        <label><input type="radio" name="type_${i}" value="column"${type !== 'lintel' ? ' checked' : ''}><span data-i18n="cl.column"></span></label>
                        <label><input type="radio" name="type_${i}" value="lintel"${type === 'lintel' ? ' checked' : ''}><span data-i18n="cl.lintel"></span></label>
                    </div>
                    <button type="button" class="icon-btn icon-btn-sm danger" data-remove-part data-i18n-title="cl.remove" data-i18n-aria="cl.remove"><i class="fa-solid fa-trash-can"></i></button>
                </div>
                <div class="fields">
                    ${lenField(i, 'iL', 'ft')}${lenField(i, 'iW', 'in')}${lenField(i, 'iT', 'in')}
                    <div class="field">
                        <label for="column-iQ_${i}"><span data-i18n="cl.qty"></span> <small class="opt" data-i18n="cl.qtyOpt"></small></label>
                        <div class="input-wrap"><input type="text" inputmode="numeric" autocomplete="off" id="column-iQ_${i}" name="iQ_${i}" data-num data-optional data-default="1" data-ph="0"><span class="unit" data-i18n="u.pcs"></span></div>
                        <span class="field-error"></span>
                    </div>
                </div>`;
            list.appendChild(row);
            LEN.enhance(row);
            translate(row);
            LEN.refresh(row);
            relabel();
            if (focus) $('input[data-len]', row).focus();
            return row;
        }
        function setRows() { list.innerHTML = ''; nextId = 0; addRow('column', false); }

        $$('[data-add-item]', form).forEach((b) => b.addEventListener('click', () => { addRow(b.dataset.addItem, true); saveInputs(form); VIZ.update('column'); }));
        list.addEventListener('click', (e) => {
            const b = e.target.closest('[data-remove-part]');
            if (!b) return;
            b.closest('[data-area]').remove();
            relabel();
            saveInputs(form);
            VIZ.update('column');
        });
        list.addEventListener('change', (e) => { if (/^type_/.test(e.target.name)) relabel(); });
        form.addEventListener('reset', () => setTimeout(() => { setRows(); }));

        // rebuild the rows saved last time
        const saved = (S.remember && storage.get(STORE_INPUTS, {}).column) || {};
        const idx = Object.keys(saved).filter((k) => /^iL_\d+$/.test(k)).map((k) => Number(k.slice(3))).sort((a, b) => a - b);
        list.innerHTML = '';
        if (idx.length) {
            idx.forEach((i) => { nextId = i; addRow(saved['type_' + i] === 'lintel' ? 'lintel' : 'column', false); });
            nextId = idx[idx.length - 1] + 1;
        } else {
            addRow('column', false);
        }
        return { relabel };
    })();

    /* ---------- Tiles form: room parts + custom size ---------- */
    const TILES = (() => {
        const form = $('form[data-calc="tiles"]');
        const list = $('#tile-areas');
        let nextId = 0;
        const translate = (root) => {
            $$('[data-i18n]', root).forEach((el) => { el.textContent = t(el.dataset.i18n); });
            $$('[data-i18n-title]', root).forEach((el) => { el.title = t(el.dataset.i18nTitle); });
            $$('[data-i18n-aria]', root).forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
            $$('[data-ph]', root).forEach((el) => { el.placeholder = digits(el.dataset.ph); });
        };
        const field = (i, name, key, ph) => `
            <div class="field">
                <label for="tiles-${name}_${i}" data-i18n="${key}"></label>
                <div class="input-wrap"><input type="text" inputmode="decimal" autocomplete="off" id="tiles-${name}_${i}" name="${name}_${i}" data-num data-positive data-len="ft" data-ph="${ph}"></div>
                <span class="field-error"></span>
            </div>`;
        function renumber() {
            const rows = $$('[data-area]', list);
            rows.forEach((r, n) => {
                $('.area-no', r).textContent = t('tl.part', { n: n + 1 });
                $('[data-remove-part]', r).hidden = rows.length === 1;
            });
        }
        function addRow(focus) {
            const i = nextId++;
            const row = document.createElement('div');
            row.className = 'area-row';
            row.dataset.area = String(i);
            row.innerHTML = `<span class="area-no"></span>${field(i, 'len', 'f.length', '0')}${field(i, 'wid', 'f.width', '0')}
                <button type="button" class="icon-btn icon-btn-sm danger" data-remove-part data-i18n-title="tl.removePart" data-i18n-aria="tl.removePart"><i class="fa-solid fa-trash-can"></i></button>`;
            list.appendChild(row);
            LEN.enhance(row);
            translate(row);
            LEN.refresh(row);
            renumber();
            if (focus) $('input', row).focus();
            return row;
        }
        function setRows(n) {
            list.innerHTML = '';
            nextId = 0;
            for (let i = 0; i < Math.max(1, n); i++) addRow(false);
        }
        function syncCustom() {
            const custom = $('input[name="tileSize"]:checked', form)?.value === 'custom';
            $('#tile-custom').hidden = !custom;
        }

        $('#tile-add-area').addEventListener('click', () => { addRow(true); VIZ.update('tiles'); });
        list.addEventListener('click', (e) => {
            const b = e.target.closest('[data-remove-part]');
            if (!b) return;
            b.closest('[data-area]').remove();
            renumber();
            saveInputs(form);
            VIZ.update('tiles');
        });
        form.addEventListener('change', (e) => { if (e.target.name === 'tileSize') { syncCustom(); if (e.target.value === 'custom') $('#tiles-tileA').focus(); } });
        form.addEventListener('reset', () => setTimeout(() => { setRows(1); syncCustom(); }));

        // rebuild as many rows as were saved last time
        const saved = (S.remember && storage.get(STORE_INPUTS, {}).tiles) || {};
        const savedIdx = Object.keys(saved).filter((k) => /^len_\d+$/.test(k)).map((k) => Number(k.slice(4))).sort((a, b) => a - b);
        list.innerHTML = '';
        if (savedIdx.length) {
            savedIdx.forEach((i) => { nextId = i; addRow(false); });
            nextId = savedIdx[savedIdx.length - 1] + 1;
        } else {
            addRow(false);
        }

        return { renumber, syncCustom };
    })();

    /* =========================================================
       Floor plan — a small 2D CAD editor with a live 3D model
       Plan units are feet (x → right, y → down). Wall thickness is in inches.
       ========================================================= */
    const PLAN = (() => {
        const STORE = 'cc.plan', STORE_VIEW = 'cc.planView';
        const svg = $('#plan-svg'), wrap = $('#plan-2d'), main = $('#plan-main'), insp = $('#fp-inspector');
        const form = $('form[data-calc="plan"]');
        const uid = () => Math.random().toString(36).slice(2, 9);
        const KINDS = ['walls', 'rooms', 'openings', 'texts', 'dims', 'furn'];
        const blank = () => ({ v: 1, walls: [], rooms: [], openings: [], texts: [], dims: [], furn: [],
            opt: { wallT: 5, wallH: 10, showDims: true, ortho: true, snap: 0.5 } });
        const fin = (n, d = 0) => (Number.isFinite(+n) ? +n : d);
        const pt = (p) => ({ x: fin(p && p.x), y: fin(p && p.y) });
        function sanitize(o) {
            const b = blank();
            if (!o || typeof o !== 'object') return b;
            b.walls = (Array.isArray(o.walls) ? o.walls : []).filter(Boolean).map((w) => ({ id: String(w.id || uid()), a: pt(w.a), b: pt(w.b), t: Math.max(fin(w.t, 5), .5), h: Math.max(fin(w.h, 10), .5) }));
            b.rooms = (Array.isArray(o.rooms) ? o.rooms : []).filter((r) => r && Array.isArray(r.pts) && r.pts.length >= 3).map((r) => ({ id: String(r.id || uid()), name: String(r.name || '').slice(0, 40), pts: r.pts.map(pt) }));
            const wallIds = new Set(b.walls.map((w) => w.id));
            b.openings = (Array.isArray(o.openings) ? o.openings : []).filter((x) => x && wallIds.has(String(x.wall))).map((x) => ({ id: String(x.id || uid()), wall: String(x.wall), type: x.type === 'window' ? 'window' : 'door', at: fin(x.at), w: Math.max(fin(x.w, 3), .5), h: Math.max(fin(x.h, 7), .5), sill: Math.max(fin(x.sill), 0), flip: fin(x.flip) & 3 }));
            b.texts = (Array.isArray(o.texts) ? o.texts : []).filter(Boolean).map((x) => ({ id: String(x.id || uid()), x: fin(x.x), y: fin(x.y), text: String(x.text || '').slice(0, 80), size: Math.max(fin(x.size, 1), .2) }));
            b.dims = (Array.isArray(o.dims) ? o.dims : []).filter(Boolean).map((x) => ({ id: String(x.id || uid()), a: pt(x.a), b: pt(x.b), off: fin(x.off, -2) }));
            b.furn = (Array.isArray(o.furn) ? o.furn : []).filter((x) => x && LIB[x.kind]).map((x) => ({ id: String(x.id || uid()), kind: x.kind, x: fin(x.x), y: fin(x.y), rot: fin(x.rot) % 360, w: Math.max(fin(x.w, LIB[x.kind].w), .3), d: Math.max(fin(x.d, LIB[x.kind].d), .3) }));
            b.opt = Object.assign(b.opt, o.opt && typeof o.opt === 'object' ? o.opt : {});
            return b;
        }

        /* ---------- furniture library (sizes in ft, height for 3D) ---------- */
        const R = (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
        const Ln = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
        const Ci = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
        const El = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
        const LIB = {
            bed:      { w: 5, d: 6.5, h: 2, c: 0xe7dccb, draw: (w, d) => R(-w / 2, -d / 2, w, d, .15) + (w >= 4 ? R(-w / 2 + .3, -d / 2 + .3, w / 2 - .45, .9, .2) + R(.15, -d / 2 + .3, w / 2 - .45, .9, .2) : R(-w / 2 + .3, -d / 2 + .3, w - .6, .9, .2)) + Ln(-w / 2, -d / 2 + 1.7, w / 2, -d / 2 + 1.7) },
            sbed:     { w: 3.5, d: 6.5, h: 2, c: 0xe7dccb, draw: (w, d) => LIB.bed.draw(w, d) },
            sofa:     { w: 7, d: 3, h: 2.8, c: 0x8fa8bf, draw: (w, d) => R(-w / 2, -d / 2, w, d, .25) + R(-w / 2, -d / 2, w, .7, .2) + R(-w / 2, -d / 2, .6, d, .2) + R(w / 2 - .6, -d / 2, .6, d, .2) + Ln(-w / 6, -d / 2 + .7, -w / 6, d / 2) + Ln(w / 6, -d / 2 + .7, w / 6, d / 2) },
            dining:   { w: 5, d: 3, h: 2.5, c: 0xa47148, draw: (w, d) => R(-w / 2, -d / 2, w, d, .1) + [-1, 0, 1].map((i) => R(i * w / 3 - .6, -d / 2 - 1.1, 1.2, .9, .15) + R(i * w / 3 - .6, d / 2 + .2, 1.2, .9, .15)).join('') + R(-w / 2 - 1.1, -.6, .9, 1.2, .15) + R(w / 2 + .2, -.6, .9, 1.2, .15) },
            chair:    { w: 1.6, d: 1.6, h: 3, c: 0xa47148, draw: (w, d) => R(-w / 2, -d / 2, w, d, .15) + R(-w / 2, -d / 2, w, .35, .1) },
            desk:     { w: 4, d: 2, h: 2.5, c: 0xb08860, draw: (w, d) => R(-w / 2, -d / 2, w, d, .08) + Ci(0, d / 2 + .7, .55) },
            wardrobe: { w: 4, d: 2, h: 7, c: 0xc2a27c, draw: (w, d) => R(-w / 2, -d / 2, w, d) + Ln(-w / 2, -d / 2, w / 2, d / 2) + Ln(-w / 2, d / 2, w / 2, -d / 2) + Ln(0, -d / 2, 0, d / 2) },
            counter:  { w: 6, d: 2, h: 2.8, c: 0xd5d8dc, draw: (w, d) => R(-w / 2, -d / 2, w, d) + R(-w / 2 + .4, -d / 2 + .35, 1.8, d - .7, .2) + Ci(w / 2 - 1.3, -.2, .3) + Ci(w / 2 - .6, .25, .3) },
            fridge:   { w: 2.5, d: 2.5, h: 6, c: 0xe5e7eb, draw: (w, d) => R(-w / 2, -d / 2, w, d, .1) + Ln(-w / 2, -d / 2 + .45, w / 2, -d / 2 + .45) },
            wc:       { w: 1.5, d: 2.3, h: 1.4, c: 0xf8fafc, draw: (w, d) => R(-w / 2, -d / 2, w, .6, .1) + El(0, .25, w * .38, d * .34) },
            basin:    { w: 1.8, d: 1.4, h: 2.8, c: 0xf8fafc, draw: (w, d) => R(-w / 2, -d / 2, w, d, .2) + El(0, .05, w * .32, d * .3) },
            shower:   { w: 3, d: 3, h: .3, c: 0xdbeafe, draw: (w, d) => R(-w / 2, -d / 2, w, d) + Ln(-w / 2, -d / 2, w / 2, d / 2) + Ln(-w / 2, d / 2, w / 2, -d / 2) + Ci(0, 0, .18) },
            tub:      { w: 2.5, d: 5.5, h: 1.8, c: 0xf8fafc, draw: (w, d) => R(-w / 2, -d / 2, w, d, .35) + R(-w / 2 + .25, -d / 2 + .25, w - .5, d - .5, .6) },
            stairs:   { w: 3.5, d: 10, h: 10, c: 0xcbd5e1, draw: (w, d) => { let s = R(-w / 2, -d / 2, w, d); for (let y = -d / 2 + .85; y < d / 2 - .1; y += .85) s += Ln(-w / 2, y, w / 2, y); return s + Ln(0, d / 2 - .4, 0, -d / 2 + .6) + Ln(-.4, -d / 2 + 1.1, 0, -d / 2 + .6) + Ln(.4, -d / 2 + 1.1, 0, -d / 2 + .6); } },
        };

        let P = sanitize(storage.get(STORE, null));
        const view = { s: 18, x: 40, y: 40, fitted: false };
        let tool = 'select', sel = null, furnKind = 'bed';
        let chain = null, rectStart = null, dimPts = null, hover = null, snapKind = '';
        let drag = null, pan = null, pinch = null, down = null, spaceDown = false;
        const pointers = new Map();
        let hist = [JSON.stringify(P)], hi = 0;

        /* ---------- geometry ---------- */
        const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
        const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
        const mul = (a, k) => ({ x: a.x * k, y: a.y * k });
        const len = (a) => Math.hypot(a.x, a.y);
        const dist = (a, b) => len(sub(a, b));
        const unitv = (a) => { const l = len(a) || 1; return { x: a.x / l, y: a.y / l }; };
        const perp = (a) => ({ x: -a.y, y: a.x });
        const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        const clean = (p) => ({ x: +p.x.toFixed(4), y: +p.y.toFixed(4) });
        const projT = (p, a, b) => { const ab = sub(b, a), l2 = ab.x * ab.x + ab.y * ab.y || 1; return ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / l2; };
        const distSeg = (p, a, b) => dist(p, lerp(a, b, Math.max(0, Math.min(1, projT(p, a, b)))));
        const distLine = (p, a, b) => { const ab = sub(b, a), l = len(ab) || 1; return Math.abs((p.x - a.x) * ab.y - (p.y - a.y) * ab.x) / l; };
        const polyArea = (pts) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p.x * q.y - q.x * p.y; }, 0)) / 2;
        function centroid(pts) {
            let a = 0, cx = 0, cy = 0;
            pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length], f = p.x * q.y - q.x * p.y; a += f; cx += (p.x + q.x) * f; cy += (p.y + q.y) * f; });
            if (Math.abs(a) < 1e-9) return { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
            return { x: cx / (3 * a), y: cy / (3 * a) };
        }
        const wallLen = (w) => dist(w.a, w.b);
        const byId = (arr, id) => arr.find((x) => x.id === id);
        const LIST = { wall: 'walls', room: 'rooms', op: 'openings', text: 'texts', dim: 'dims', furn: 'furn' };
        const getSel = () => (sel ? byId(P[LIST[sel.k]], sel.id) : null);

        function endpoints(exclude) {
            const out = [];
            P.walls.forEach((w) => { out.push(w.a, w.b); });
            if (chain) out.push(...chain.pts);
            return exclude ? out.filter((q) => dist(q, exclude) > 1e-3) : out;
        }
        function degreeMap() {
            const m = new Map();
            const key = (p) => `${Math.round(p.x * 100)}:${Math.round(p.y * 100)}`;
            P.walls.forEach((w) => { [w.a, w.b].forEach((p) => m.set(key(p), (m.get(key(p)) || 0) + 1)); });
            return (p) => m.get(key(p)) || 0;
        }

        /* ---------- snapping ---------- */
        const isMetric = () => LEN.system() === 'met';
        const snapStep = () => fin(P.opt.snap);
        function snapPoint(p, from, exclude) {
            const tol = 10 / view.s;
            let best = null, bd = tol;
            endpoints(exclude).forEach((q) => { const d = dist(p, q); if (d < bd) { bd = d; best = q; } });
            if (best) { snapKind = 'end'; return { x: best.x, y: best.y }; }
            const st = snapStep();
            if (from && P.opt.ortho) {
                const d = sub(p, from), step = Math.PI / 4;
                const ang = Math.round(Math.atan2(d.y, d.x) / step) * step;
                let L = len(d);
                if (st) L = Math.round(L / st) * st;
                snapKind = 'ortho';
                return clean(add(from, { x: Math.cos(ang) * L, y: Math.sin(ang) * L }));
            }
            let q = st ? { x: Math.round(p.x / st) * st, y: Math.round(p.y / st) * st } : { x: p.x, y: p.y };
            // line up with existing corners (CAD tracking)
            endpoints(exclude).forEach((e) => { if (Math.abs(q.x - e.x) < tol) q.x = e.x; if (Math.abs(q.y - e.y) < tol) q.y = e.y; });
            snapKind = 'grid';
            return clean(q);
        }

        /* ---------- model edits ---------- */
        function addWall(a, b, t = P.opt.wallT, h = P.opt.wallH) {
            const L = dist(a, b);
            if (L < .05) return [];
            let iv = [[0, 1]];
            P.walls.forEach((w) => {
                if (distLine(w.a, a, b) > .01 || distLine(w.b, a, b) > .01) return;        // not on the same line
                let t1 = projT(w.a, a, b), t2 = projT(w.b, a, b);
                if (t1 > t2) [t1, t2] = [t2, t1];
                const out = [];
                iv.forEach(([s, e]) => {
                    if (t2 <= s || t1 >= e) { out.push([s, e]); return; }
                    if (t1 > s) out.push([s, t1]);
                    if (t2 < e) out.push([t2, e]);
                });
                iv = out;
            });
            const ids = [];
            iv.forEach(([s, e]) => {
                if ((e - s) * L < .05) return;
                const w = { id: uid(), a: clean(lerp(a, b, s)), b: clean(lerp(a, b, e)), t, h };
                P.walls.push(w);
                ids.push(w.id);
            });
            return ids;
        }
        function addRoom(pts, name) {
            if (pts.length < 3 || polyArea(pts) < 1) return null;
            const r = { id: uid(), name: name || t('fp.roomN', { n: P.rooms.length + 1 }), pts: pts.map(clean) };
            P.rooms.push(r);
            return r;
        }
        function addRect(a, b, name, wallT) {
            const pts = [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }];
            pts.forEach((p, i) => addWall(p, pts[(i + 1) % 4], wallT));
            return addRoom(pts, name);
        }
        function nearestWall(p, tolPx = 12) {
            let best = null, bd = Infinity;
            P.walls.forEach((w) => {
                const d = distSeg(p, w.a, w.b) - w.t / 24;
                if (d < bd) { bd = d; best = w; }
            });
            return best && bd <= tolPx / view.s ? best : null;
        }
        function addOpening(type, w, p, extra = {}) {
            const L = wallLen(w);
            const o = Object.assign({ id: uid(), wall: w.id, type, w: type === 'door' ? 3 : 4, h: type === 'door' ? 7 : 4, sill: type === 'door' ? 0 : 3, flip: 0 }, extra);
            o.w = Math.min(o.w, Math.max(L - .2, .5));
            o.at = Math.max(o.w / 2, Math.min(L - o.w / 2, projT(p, w.a, w.b) * L));
            P.openings.push(o);
            return o;
        }
        function moveEndpoint(old, nw) {
            const same = (q) => dist(q, old) < 1e-3;
            P.walls.forEach((w) => { if (same(w.a)) w.a = clean(nw); if (same(w.b)) w.b = clean(nw); });
            P.rooms.forEach((r) => { r.pts = r.pts.map((q) => (same(q) ? clean(nw) : q)); });
            clampOpenings();
        }
        function clampOpenings() {
            P.openings = P.openings.filter((o) => {
                const w = byId(P.walls, o.wall);
                if (!w) return false;
                const L = wallLen(w);
                if (L < .6) return false;
                o.w = Math.min(o.w, L - .2);
                o.at = Math.max(o.w / 2, Math.min(L - o.w / 2, o.at));
                return true;
            });
        }
        function remove(k, id) {
            const list = LIST[k];
            P[list] = P[list].filter((x) => x.id !== id);
            if (k === 'wall') P.openings = P.openings.filter((o) => o.wall !== id);
            if (sel && sel.id === id) sel = null;
        }

        /* ---------- history + saving ---------- */
        function commit() {
            hist = hist.slice(0, hi + 1);
            hist.push(JSON.stringify(P));
            if (hist.length > 120) hist.shift();
            hi = hist.length - 1;
            storage.set(STORE, P);
            changed();
        }
        function restoreFrom(json) {
            P = sanitize(JSON.parse(json));
            if (sel && !getSel()) sel = null;
            storage.set(STORE, P);
            changed();
        }
        const undo = () => { if (hi > 0) { hi -= 1; restoreFrom(hist[hi]); } };
        const redo = () => { if (hi < hist.length - 1) { hi += 1; restoreFrom(hist[hi]); } };
        let estT = 0;
        function changed() {
            draw();
            inspector();
            VIZ.update('plan');
            clearTimeout(estT);
            estT = setTimeout(refreshEstimate, 120);
        }
        function refreshEstimate() {
            const v = readForm(form);
            if (!v) return;
            lastValues.plan = v;
            renderResult('plan', v);
        }

        /* ---------- drawing (SVG) ---------- */
        function palette(forExport) {
            const cs = getComputedStyle(root);
            const dark = !forExport && root.getAttribute('data-theme') === 'dark';
            const brand = cs.getPropertyValue('--brand').trim() || '#0d9488';
            return {
                bg: dark ? '#172133' : '#ffffff', grid: dark ? 'rgba(148,163,184,.12)' : 'rgba(30,41,59,.07)', grid2: dark ? 'rgba(148,163,184,.24)' : 'rgba(30,41,59,.15)',
                wall: dark ? '#cbd5e1' : '#334155', ink: dark ? '#e2e8f0' : '#1e293b', muted: dark ? '#94a3b8' : '#64748b',
                room: dark ? 'rgba(148,163,184,.07)' : 'rgba(13,148,136,.05)', furn: dark ? 'rgba(148,163,184,.10)' : 'rgba(255,255,255,.9)', brand,
            };
        }
        const esc = escapeHtml;
        const fmtL = (ft) => LEN.fmt(ft);

        // everything in plan (ft) coordinates; s = pixels per foot (for text and line sizes)
        function worldMarkup(pal, s, live) {
            const px = (n) => n / s;               // n screen pixels in ft
            const deg = degreeMap();
            let out = '';
            // rooms
            P.rooms.forEach((r) => {
                const isSel = live && sel && sel.k === 'room' && sel.id === r.id;
                out += `<polygon data-id="${r.id}" data-k="room" points="${r.pts.map((p) => `${p.x},${p.y}`).join(' ')}" fill="${isSel ? 'rgba(13,148,136,.14)' : pal.room}" ${isSel ? `stroke="${pal.brand}" stroke-width="${px(2)}" stroke-dasharray="${px(6)} ${px(4)}"` : ''}/>`;
            });
            // walls
            P.walls.forEach((w) => {
                const u = unitv(sub(w.b, w.a)), n = perp(u), ht = w.t / 24;
                const a = deg(w.a) > 1 ? sub(w.a, mul(u, ht)) : w.a, b = deg(w.b) > 1 ? add(w.b, mul(u, ht)) : w.b;
                const q = [add(a, mul(n, ht)), add(b, mul(n, ht)), sub(b, mul(n, ht)), sub(a, mul(n, ht))];
                const isSel = live && sel && sel.k === 'wall' && sel.id === w.id;
                out += `<polygon data-id="${w.id}" data-k="wall" points="${q.map((p) => `${p.x},${p.y}`).join(' ')}" fill="${isSel ? pal.brand : pal.wall}"/>`;
            });
            // openings
            P.openings.forEach((o) => {
                const w = byId(P.walls, o.wall);
                if (!w) return;
                const u = unitv(sub(w.b, w.a)), n = perp(u), ht = w.t / 24 + px(1);
                const c = add(w.a, mul(u, o.at)), hw = o.w / 2;
                const j1 = sub(c, mul(u, hw)), j2 = add(c, mul(u, hw));
                const isSel = live && sel && sel.k === 'op' && sel.id === o.id;
                const st = `stroke="${isSel ? pal.brand : pal.ink}" stroke-width="${px(isSel ? 2.2 : 1.3)}" fill="none"`;
                const gap = [add(j1, mul(n, ht)), add(j2, mul(n, ht)), sub(j2, mul(n, ht)), sub(j1, mul(n, ht))];
                let g = `<polygon points="${gap.map((p) => `${p.x},${p.y}`).join(' ')}" fill="${pal.bg}"/>`;
                g += `<line x1="${gap[0].x}" y1="${gap[0].y}" x2="${gap[3].x}" y2="${gap[3].y}" ${st}/><line x1="${gap[1].x}" y1="${gap[1].y}" x2="${gap[2].x}" y2="${gap[2].y}" ${st}/>`;
                if (o.type === 'door') {
                    const side = o.flip & 1 ? -1 : 1, hingeEnd = o.flip & 2 ? 1 : -1;
                    const hinge = add(c, mul(u, hingeEnd * hw)), other = sub(c, mul(u, hingeEnd * hw));
                    const tip = add(hinge, mul(n, side * o.w));
                    const cr = (tip.x - hinge.x) * (other.y - hinge.y) - (tip.y - hinge.y) * (other.x - hinge.x);
                    g += `<line x1="${hinge.x}" y1="${hinge.y}" x2="${tip.x}" y2="${tip.y}" ${st}/>`;
                    g += `<path d="M ${tip.x} ${tip.y} A ${o.w} ${o.w} 0 0 ${cr > 0 ? 1 : 0} ${other.x} ${other.y}" ${st} stroke-dasharray="${px(4)} ${px(3)}"/>`;
                } else {
                    const hs = w.t / 24;
                    [hs, 0, -hs].forEach((k, i) => {
                        const p1 = add(j1, mul(n, k)), p2 = add(j2, mul(n, k));
                        g += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${i === 1 ? pal.brand : (isSel ? pal.brand : pal.ink)}" stroke-width="${px(i === 1 ? 2 : 1.2)}"/>`;
                    });
                }
                out += `<g data-id="${o.id}" data-k="op">${g}</g>`;
            });
            // furniture
            P.furn.forEach((f) => {
                const L = LIB[f.kind];
                const isSel = live && sel && sel.k === 'furn' && sel.id === f.id;
                out += `<g data-id="${f.id}" data-k="furn" transform="translate(${f.x} ${f.y}) rotate(${f.rot})" stroke="${isSel ? pal.brand : pal.ink}" stroke-width="${px(isSel ? 2 : 1.1)}" fill="${pal.furn}">${L.draw(f.w, f.d)}</g>`;
            });
            // dimension lines
            P.dims.forEach((d) => {
                const isSel = live && sel && sel.k === 'dim' && sel.id === d.id;
                out += dimMarkup(d, pal, s, isSel);
            });
            // wall lengths
            if (P.opt.showDims) {
                P.walls.forEach((w) => {
                    const L = wallLen(w);
                    if (L * s < 40) return;
                    const u = unitv(sub(w.b, w.a)), n = perp(u), m = lerp(w.a, w.b, .5);
                    const pos = add(m, mul(n, w.t / 24 + px(9)));
                    let ang = Math.atan2(u.y, u.x) * 180 / Math.PI;
                    if (ang > 90 || ang < -90) ang += 180;
                    out += `<text x="${pos.x}" y="${pos.y}" font-size="${px(10.5)}" fill="${pal.muted}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${ang} ${pos.x} ${pos.y})" pointer-events="none">${esc(fmtL(L))}</text>`;
                });
            }
            // room names + areas
            P.rooms.forEach((r) => {
                const c = centroid(r.pts);
                const fs = Math.max(px(12), Math.min(1.2, px(16)));
                out += `<text x="${c.x}" y="${c.y}" text-anchor="middle" fill="${pal.ink}" pointer-events="none"><tspan x="${c.x}" font-size="${fs}" font-weight="600">${esc(r.name)}</tspan><tspan x="${c.x}" dy="${fs * 1.25}" font-size="${fs * .8}" fill="${pal.muted}">${esc(qs(qArea(polyArea(r.pts))))}</tspan></text>`;
            });
            // texts
            P.texts.forEach((x) => {
                const isSel = live && sel && sel.k === 'text' && sel.id === x.id;
                out += `<text data-id="${x.id}" data-k="text" x="${x.x}" y="${x.y}" font-size="${x.size}" fill="${isSel ? pal.brand : pal.ink}" ${isSel ? 'text-decoration="underline"' : ''}>${esc(x.text)}</text>`;
            });
            return out;
        }
        function dimMarkup(d, pal, s, isSel, preview) {
            const px = (n) => n / s;
            const L = dist(d.a, d.b);
            if (L < 1e-3) return '';
            const u = unitv(sub(d.b, d.a)), n = perp(u);
            const a2 = add(d.a, mul(n, d.off)), b2 = add(d.b, mul(n, d.off));
            const ext = mul(n, Math.sign(d.off || 1) * px(6));
            const col = isSel || preview ? pal.brand : pal.ink;
            const st = `stroke="${col}" stroke-width="${px(1.1)}"`;
            const tk = mul(add(u, n), px(5));
            let g = `<line x1="${d.a.x}" y1="${d.a.y}" x2="${a2.x + ext.x}" y2="${a2.y + ext.y}" ${st} opacity=".6"/>`;
            g += `<line x1="${d.b.x}" y1="${d.b.y}" x2="${b2.x + ext.x}" y2="${b2.y + ext.y}" ${st} opacity=".6"/>`;
            g += `<line x1="${a2.x}" y1="${a2.y}" x2="${b2.x}" y2="${b2.y}" ${st}/>`;
            [a2, b2].forEach((p) => { g += `<line x1="${p.x - tk.x}" y1="${p.y - tk.y}" x2="${p.x + tk.x}" y2="${p.y + tk.y}" stroke="${col}" stroke-width="${px(1.6)}"/>`; });
            const m = lerp(a2, b2, .5), tp = add(m, mul(n, -px(8) * Math.sign(d.off || 1)));
            let ang = Math.atan2(u.y, u.x) * 180 / Math.PI;
            if (ang > 90 || ang < -90) ang += 180;
            g += `<text x="${tp.x}" y="${tp.y}" font-size="${px(11.5)}" font-weight="600" fill="${col}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${ang} ${tp.x} ${tp.y})">${esc(fmtL(L))}</text>`;
            return preview ? g : `<g data-id="${d.id}" data-k="dim">${g}</g>`;
        }
        function gridMarkup(pal, s, W, H) {
            const met = isMetric();
            const minor = met ? 3.280839895 : 1, major = met ? 16.404199475 : 5;
            const x0 = -view.x / s, y0 = -view.y / s, x1 = x0 + W / s, y1 = y0 + H / s;
            let g = '';
            const linesFor = (step, col, wpx) => {
                if (step * s < 7) return '';
                let o = '';
                for (let x = Math.floor(x0 / step) * step; x <= x1; x += step) o += `M${x} ${y0}V${y1}`;
                for (let y = Math.floor(y0 / step) * step; y <= y1; y += step) o += `M${x0} ${y}H${x1}`;
                return `<path d="${o}" stroke="${col}" stroke-width="${wpx / s}" fill="none"/>`;
            };
            g += linesFor(minor, pal.grid, 1) + linesFor(major, pal.grid2, 1);
            g += `<path d="M${-px0(s)} 0H${px0(s)}M0 ${-px0(s)}V${px0(s)}" stroke="${pal.brand}" stroke-width="${1.5 / s}" opacity=".5"/>`;
            return g;
        }
        const px0 = (s) => 14 / s;

        let rafId = 0;
        function draw() {
            if (rafId) return;
            rafId = requestAnimationFrame(() => { rafId = 0; drawNow(); });
        }
        function drawNow() {
            const W = wrap.clientWidth, H = wrap.clientHeight;
            if (!W || !H) return;
            if (!view.fitted) { view.fitted = true; fit(true); }
            const pal = palette(), s = view.s;
            svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
            let over = '';
            const px = (n) => n / s;
            // previews
            if (chain && hover) {
                const last = chain.pts[chain.pts.length - 1];
                const pts = chain.pts.map((p) => `${p.x},${p.y}`).join(' ') + ` ${hover.x},${hover.y}`;
                over += `<polyline points="${pts}" fill="none" stroke="${pal.brand}" stroke-width="${px(Math.max(2, P.opt.wallT / 12 * s))}" stroke-opacity=".35" stroke-linejoin="round"/>`;
                over += `<line x1="${last.x}" y1="${last.y}" x2="${hover.x}" y2="${hover.y}" stroke="${pal.brand}" stroke-width="${px(1.5)}" stroke-dasharray="${px(6)} ${px(4)}"/>`;
                over += dimMarkup({ a: last, b: hover, off: -1.2 }, pal, s, false, true);
            }
            if (rectStart && hover) {
                const x = Math.min(rectStart.x, hover.x), y = Math.min(rectStart.y, hover.y), w = Math.abs(hover.x - rectStart.x), h = Math.abs(hover.y - rectStart.y);
                over += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(13,148,136,.08)" stroke="${pal.brand}" stroke-width="${px(1.6)}" stroke-dasharray="${px(6)} ${px(4)}"/>`;
                over += dimMarkup({ a: { x, y }, b: { x: x + w, y }, off: -1.4 }, pal, s, false, true);
                over += dimMarkup({ a: { x, y }, b: { x, y: y + h }, off: 1.4 }, pal, s, false, true);
            }
            if (dimPts && hover) {
                if (dimPts.length === 1) over += `<line x1="${dimPts[0].x}" y1="${dimPts[0].y}" x2="${hover.x}" y2="${hover.y}" stroke="${pal.brand}" stroke-width="${px(1.2)}" stroke-dasharray="${px(5)} ${px(4)}"/>`;
                else if (dimPts.length === 2) over += dimMarkup({ a: dimPts[0], b: dimPts[1], off: signedOff(hover) }, pal, s, false, true);
            }
            // selection handles
            const so = getSel();
            if (so && sel.k === 'wall') [so.a, so.b].forEach((p, i) => { over += `<rect class="handle" data-handle="${i ? 'b' : 'a'}" x="${p.x - px(6)}" y="${p.y - px(6)}" width="${px(12)}" height="${px(12)}" stroke-width="${px(2)}"/>`; });
            if (so && sel.k === 'dim') [so.a, so.b].forEach((p, i) => { over += `<rect class="handle" data-handle="${i ? 'b' : 'a'}" x="${p.x - px(5)}" y="${p.y - px(5)}" width="${px(10)}" height="${px(10)}" stroke-width="${px(2)}"/>`; });
            if (so && sel.k === 'room') so.pts.forEach((p) => { over += `<circle cx="${p.x}" cy="${p.y}" r="${px(4)}" fill="${pal.brand}"/>`; });
            // snap marker
            if (hover && tool !== 'select' && tool !== 'pan' && tool !== 'erase') {
                const r = px(5);
                over += snapKind === 'end'
                    ? `<rect x="${hover.x - r}" y="${hover.y - r}" width="${2 * r}" height="${2 * r}" fill="none" stroke="${pal.brand}" stroke-width="${px(2)}"/>`
                    : `<path d="M${hover.x - r} ${hover.y}H${hover.x + r}M${hover.x} ${hover.y - r}V${hover.y + r}" stroke="${pal.brand}" stroke-width="${px(1.5)}"/>`;
            }
            svg.innerHTML = `<rect width="${W}" height="${H}" fill="${pal.bg}"/>`
                + `<g transform="translate(${view.x} ${view.y}) scale(${s})">${gridMarkup(pal, s, W, H)}${worldMarkup(pal, s, true)}<g pointer-events="none">${over}</g></g>`;
            status();
        }

        /* ---------- status bar + hints ---------- */
        function status() {
            const parts = [`<span class="hint-chip">${esc(t('fp.h.' + tool))}</span>`];
            if (hover) parts.push(`<span>${esc(fmtL(hover.x))}, ${esc(fmtL(hover.y))}</span>`);
            if (chain && hover) {
                const last = chain.pts[chain.pts.length - 1], d = sub(hover, last);
                parts.push(`<span>${esc(fmtL(len(d)))} · ${numPlain(Math.round(-Math.atan2(d.y, d.x) * 180 / Math.PI))}°</span>`);
            }
            $('#fp-status').innerHTML = parts.join('');
        }

        /* ---------- view: pan / zoom / fit ---------- */
        function toWorld(cx, cy) {
            const r = svg.getBoundingClientRect();
            return { x: (cx - r.left - view.x) / view.s, y: (cy - r.top - view.y) / view.s };
        }
        function zoomAt(cx, cy, k) {
            const r = svg.getBoundingClientRect();
            const sx = cx - r.left, sy = cy - r.top;
            const ns = Math.max(2, Math.min(400, view.s * k));
            view.x = sx - (sx - view.x) * ns / view.s;
            view.y = sy - (sy - view.y) * ns / view.s;
            view.s = ns;
            draw();
        }
        function bounds() {
            const xs = [], ys = [];
            const push = (p, m = 0) => { xs.push(p.x - m, p.x + m); ys.push(p.y - m, p.y + m); };
            P.walls.forEach((w) => { push(w.a, w.t / 24); push(w.b, w.t / 24); });
            P.rooms.forEach((r) => r.pts.forEach((p) => push(p)));
            P.furn.forEach((f) => push(f, Math.max(f.w, f.d) / 2));
            P.texts.forEach((x) => push(x, x.size));
            P.dims.forEach((d) => { push(add(d.a, mul(perp(unitv(sub(d.b, d.a))), d.off))); push(add(d.b, mul(perp(unitv(sub(d.b, d.a))), d.off))); });
            if (!xs.length) return { x0: 0, y0: 0, x1: 30, y1: 20, empty: true };
            return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
        }
        function fit(quiet) {
            const W = wrap.clientWidth, H = wrap.clientHeight;
            if (!W || !H) return;
            const b = bounds(), pad = 3;
            const bw = b.x1 - b.x0 + pad * 2, bh = b.y1 - b.y0 + pad * 2;
            view.s = Math.max(2, Math.min(120, Math.min(W / bw, (H - 30) / bh)));
            view.x = (W - (b.x1 - b.x0) * view.s) / 2 - b.x0 * view.s;
            view.y = (H - 30 - (b.y1 - b.y0) * view.s) / 2 - b.y0 * view.s;
            if (!quiet) draw();
        }

        /* ---------- tools ---------- */
        function setTool(tl) {
            tool = tl;
            chain = null; rectStart = null; dimPts = null;
            hidePrompt();
            $$('.plan-tools [data-tool]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === tl)));
            wrap.dataset.tool = tl;
            $('#fp-furn-kind').hidden = tl !== 'furn';
            draw();
        }
        function finishChain() { chain = null; draw(); }
        function signedOff(p) {
            const [a, b] = dimPts, u = unitv(sub(b, a)), n = perp(u);
            return +(((p.x - a.x) * n.x + (p.y - a.y) * n.y)).toFixed(3);
        }

        function clickAt(raw) {
            if (tool === 'wall') {
                const last = chain ? chain.pts[chain.pts.length - 1] : null;
                const p = snapPoint(raw, last);
                if (!chain) { chain = { pts: [p] }; draw(); return; }
                if (dist(p, last) < .05) return;
                const first = chain.pts[0];
                if (chain.pts.length >= 2 && dist(p, first) < 1e-3) {
                    addWall(last, first);
                    addRoom(chain.pts);
                    chain = null;
                    commit();
                    return;
                }
                addWall(last, p);
                chain.pts.push(p);
                commit();
            } else if (tool === 'room') {
                const p = snapPoint(raw, null);
                if (!rectStart) { rectStart = p; draw(); return; }
                if (Math.abs(p.x - rectStart.x) > .3 && Math.abs(p.y - rectStart.y) > .3) {
                    const a = { x: Math.min(p.x, rectStart.x), y: Math.min(p.y, rectStart.y) };
                    const b = { x: Math.max(p.x, rectStart.x), y: Math.max(p.y, rectStart.y) };
                    const r = addRect(a, b);
                    rectStart = null;
                    if (r) sel = { k: 'room', id: r.id };
                    commit();
                }
            } else if (tool === 'door' || tool === 'window') {
                const w = nearestWall(raw, 16);
                if (!w) { toast(t('fp.needWall')); return; }
                const o = addOpening(tool, w, raw);
                sel = { k: 'op', id: o.id };
                commit();
            } else if (tool === 'text') {
                const p = snapPoint(raw, null);
                showPrompt('text', t('fp.textPrompt'), (val) => {
                    if (!val.trim()) return;
                    const x = { id: uid(), x: p.x, y: p.y, text: val.trim().slice(0, 80), size: 1 };
                    P.texts.push(x);
                    sel = { k: 'text', id: x.id };
                    commit();
                }, raw);
            } else if (tool === 'dim') {
                const p = snapPoint(raw, dimPts && dimPts.length === 1 ? dimPts[0] : null);
                if (!dimPts) { dimPts = [p]; draw(); return; }
                if (dimPts.length === 1) { if (dist(p, dimPts[0]) > .05) dimPts.push(p); draw(); return; }
                const d = { id: uid(), a: dimPts[0], b: dimPts[1], off: signedOff(raw) || -2 };
                P.dims.push(d);
                dimPts = null;
                commit();
            } else if (tool === 'furn') {
                const p = snapPoint(raw, null);
                const L = LIB[furnKind];
                const f = { id: uid(), kind: furnKind, x: p.x, y: p.y, rot: 0, w: L.w, d: L.d };
                P.furn.push(f);
                sel = { k: 'furn', id: f.id };
                commit();
            }
        }

        /* ---------- typed lengths (CAD style) ---------- */
        const prompt = $('#fp-prompt'), promptIn = $('#fp-prompt-input');
        let promptCb = null;
        function showPrompt(kind, label, cb, at, initial = '') {
            promptCb = cb;
            $('#fp-prompt-label').textContent = label;
            promptIn.value = initial;
            prompt.hidden = false;
            prompt.dataset.kind = kind;
            const r = svg.getBoundingClientRect();
            const sx = at ? at.x * view.s + view.x : 20, sy = at ? at.y * view.s + view.y : 20;
            prompt.style.left = Math.max(8, Math.min(r.width - 230, sx + 14)) + 'px';
            prompt.style.top = Math.max(8, Math.min(r.height - 60, sy + 14)) + 'px';
            promptIn.focus();
            promptIn.setSelectionRange(promptIn.value.length, promptIn.value.length);
        }
        function hidePrompt() { prompt.hidden = true; promptCb = null; }
        promptIn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); const cb = promptCb, v = promptIn.value; hidePrompt(); if (cb) cb(v); svg.focus && svg.focus(); }
            else if (e.key === 'Escape') { e.preventDefault(); hidePrompt(); }
            e.stopPropagation();
        });
        promptIn.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== promptIn) hidePrompt(); }, 150));

        // "12'6", "12 6", "3.5" (in the chosen unit) → feet
        function parseLen(str) {
            const s = toEn(String(str || '')).trim();
            if (!s) return NaN;
            const u = LEN.current();
            const two = s.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/);
            if (u === 'ftin' && two) return Number(two[1]) + Number(two[2]) / 12;
            const n = parseNum(s);
            if (!Number.isFinite(n)) return NaN;
            if (/['’′]/.test(s) || u === 'ftin' || u === 'ft') return n;
            return n * IN_PER[u] / 12;
        }
        function typedLength(first) {
            if (tool === 'wall' && chain) {
                showPrompt('len', t('fp.lenPrompt'), (val) => {
                    const L = parseLen(val);
                    if (!(L > 0)) { toast(t('err.number')); return; }
                    const last = chain.pts[chain.pts.length - 1];
                    let dir = hover && dist(hover, last) > 1e-3 ? unitv(sub(hover, last)) : { x: 1, y: 0 };
                    if (P.opt.ortho) { const a = Math.round(Math.atan2(dir.y, dir.x) / (Math.PI / 4)) * (Math.PI / 4); dir = { x: Math.cos(a), y: Math.sin(a) }; }
                    const p = clean(add(last, mul(dir, L)));
                    addWall(last, p);
                    chain.pts.push(p);
                    commit();
                }, hover, first);
            } else if (tool === 'room' && rectStart) {
                showPrompt('rect', t('fp.rectPrompt'), (val) => {
                    const [a, b] = String(val).split(/\s*[x×*,]\s*/i);
                    const L = parseLen(a), W = parseLen(b);
                    if (!(L > 0) || !(W > 0)) { toast(t('err.number')); return; }
                    const sx = hover && hover.x < rectStart.x ? -1 : 1, sy = hover && hover.y < rectStart.y ? -1 : 1;
                    const q = { x: rectStart.x + sx * L, y: rectStart.y + sy * W };
                    const r = addRect({ x: Math.min(q.x, rectStart.x), y: Math.min(q.y, rectStart.y) }, { x: Math.max(q.x, rectStart.x), y: Math.max(q.y, rectStart.y) });
                    rectStart = null;
                    if (r) sel = { k: 'room', id: r.id };
                    commit();
                }, hover, first);
            }
        }

        /* ---------- pointer input ---------- */
        svg.addEventListener('contextmenu', (e) => e.preventDefault());
        svg.addEventListener('pointerdown', (e) => {
            svg.setPointerCapture(e.pointerId);
            pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (pointers.size === 2) {
                const [a, b] = [...pointers.values()];
                pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
                down = null; drag = null; pan = null;
                return;
            }
            const wp = toWorld(e.clientX, e.clientY);
            if (e.button === 2 && tool === 'wall' && chain) { finishChain(); return; }
            if (e.button === 1 || e.button === 2 || tool === 'pan' || spaceDown) {
                pan = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
                wrap.classList.add('panning');
                return;
            }
            if (tool === 'select') {
                const h = e.target.closest('[data-handle]');
                const hit = e.target.closest('[data-id]');
                const so = getSel();
                if (h && so) {
                    const key = h.dataset.handle;
                    drag = { kind: 'handle', key, orig: { ...so[key] }, moved: false };
                    return;
                }
                if (hit) {
                    sel = { k: hit.dataset.k, id: hit.dataset.id };
                    const o = getSel();
                    if (sel.k === 'furn' || sel.k === 'text') drag = { kind: 'move', off: sub(wp, o), moved: false };
                    else if (sel.k === 'op') drag = { kind: 'op', moved: false };
                    else drag = null;
                    inspector();
                    draw();
                    return;
                }
                if (sel) { sel = null; inspector(); draw(); }
                pan = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
                return;
            }
            if (tool === 'erase') {
                const hit = e.target.closest('[data-id]');
                if (hit) { remove(hit.dataset.k, hit.dataset.id); commit(); }
                return;
            }
            down = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, wp };
        });
        svg.addEventListener('pointermove', (e) => {
            if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (pinch && pointers.size === 2) {
                const [a, b] = [...pointers.values()];
                const d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
                view.x += cx - pinch.cx; view.y += cy - pinch.cy;
                zoomAt(cx, cy, d / (pinch.d || d));
                pinch = { d, cx, cy };
                return;
            }
            const wp = toWorld(e.clientX, e.clientY);
            if (pan) { view.x = pan.vx + e.clientX - pan.x; view.y = pan.vy + e.clientY - pan.y; draw(); return; }
            if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) {
                pan = { x: down.x, y: down.y, vx: down.vx, vy: down.vy };
                down = null;
                wrap.classList.add('panning');
                return;
            }
            if (drag) {
                const o = getSel();
                if (!o) { drag = null; return; }
                drag.moved = true;
                if (drag.kind === 'handle') {
                    if (sel.k === 'wall') {
                        const cur = o[drag.key];
                        const other = o[drag.key === 'a' ? 'b' : 'a'];
                        const p = snapPoint(wp, other, drag.orig);
                        moveEndpoint(cur, p);
                    } else {
                        o[drag.key] = snapPoint(wp, null);
                    }
                } else if (drag.kind === 'move') {
                    const p = snapPoint(sub(wp, drag.off), null);
                    o.x = p.x; o.y = p.y;
                } else if (drag.kind === 'op') {
                    const w = byId(P.walls, o.wall), L = wallLen(w);
                    const st = snapStep() || .01;
                    o.at = Math.max(o.w / 2, Math.min(L - o.w / 2, Math.round(projT(wp, w.a, w.b) * L / st) * st));
                }
                draw();
                return;
            }
            const last = chain ? chain.pts[chain.pts.length - 1] : (dimPts && dimPts.length === 1 ? dimPts[0] : null);
            hover = (tool === 'select' || tool === 'pan' || tool === 'erase') ? wp : (dimPts && dimPts.length === 2 ? wp : snapPoint(wp, last));
            draw();
        });
        const endPointer = (e) => {
            pointers.delete(e.pointerId);
            if (pinch) { if (pointers.size < 2) pinch = null; return; }
            if (pan) { pan = null; wrap.classList.remove('panning'); return; }
            if (drag) { const moved = drag.moved; drag = null; if (moved) commit(); return; }
            if (down) { const wp = down.wp; down = null; clickAt(wp); }
        };
        svg.addEventListener('pointerup', endPointer);
        svg.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); pinch = null; pan = null; down = null; drag = null; wrap.classList.remove('panning'); });
        svg.addEventListener('pointerleave', () => { if (!pointers.size) { hover = null; draw(); } });
        svg.addEventListener('dblclick', () => { if (tool === 'wall' && chain) finishChain(); });
        svg.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.pow(1.0015, -e.deltaY)); }, { passive: false });

        /* ---------- keyboard ---------- */
        const KEYS = { v: 'select', h: 'pan', w: 'wall', r: 'room', d: 'door', n: 'window', t: 'text', m: 'dim', f: 'furn', e: 'erase' };
        document.addEventListener('keydown', (e) => {
            if (currentPage !== 'plan') return;
            const tg = e.target;
            if (tg && (tg.closest('input, textarea, select, [contenteditable]') || tg.closest('.modal, .drawer'))) return;
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key === ' ') { spaceDown = true; e.preventDefault(); return; }
            if (e.key === 'Escape') {
                if (chain || rectStart || dimPts) { chain = null; rectStart = null; dimPts = null; draw(); }
                else if (sel) { sel = null; inspector(); draw(); }
                else setTool('select');
                return;
            }
            if (e.key === 'Enter' && tool === 'wall' && chain) { finishChain(); return; }
            if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); remove(sel.k, sel.id); commit(); return; }
            if (/^[0-9.'০-৯]$/.test(e.key) && ((tool === 'wall' && chain) || (tool === 'room' && rectStart))) { e.preventDefault(); typedLength(e.key); return; }
            const tl = KEYS[e.key.toLowerCase()];
            if (tl) { setTool(tl); return; }
            if (e.key.toLowerCase() === 'o') { P.opt.ortho = !P.opt.ortho; commit(); }
        });
        document.addEventListener('keyup', (e) => { if (e.key === ' ') spaceDown = false; });

        /* ---------- inspector (properties of the selected item) ---------- */
        const lenBox = (id, base) => `<div class="input-wrap"><input type="text" inputmode="decimal" autocomplete="off" id="${id}" data-len="${base}" data-ph="0"></div>`;
        const field = (label, inner) => `<div class="field"><label>${esc(label)}</label>${inner}</div>`;
        function setLen(id, val) { const el = $('#' + id, insp); if (el) LEN.set(el, val); }
        function readLen(id) { const el = $('#' + id, insp); const r = el ? LEN.read(el) : {}; return r.value; }

        function inspector() {
            const o = getSel();
            let h = '';
            if (!o) {
                const floor = P.rooms.reduce((s, r) => s + polyArea(r.pts), 0);
                const wl = P.walls.reduce((s, w) => s + wallLen(w), 0);
                const steps = isMetric() ? [[0, 'fp.snapOff'], [0.164042, '5 cm'], [0.328084, '10 cm'], [1.64042, '50 cm']] : [[0, 'fp.snapOff'], [1 / 12, '1"'], [0.25, '3"'], [0.5, '6"'], [1, "1'"]];
                h = `<h3><i class="fa-solid fa-sliders"></i>${esc(t('fp.planSet'))}</h3>
                    <div class="fp-stats">
                        <div><small>${esc(t('fp.r.rooms'))}</small><b>${num(P.rooms.length, 0)}</b></div>
                        <div><small>${esc(t('r.floorArea'))}</small><b>${esc(qs(qArea(floor)))}</b></div>
                        <div><small>${esc(t('fp.r.wallLen'))}</small><b>${esc(fmtL(wl))}</b></div>
                        <div><small>${esc(t('fp.r.doorWin'))}</small><b>${num(P.openings.filter((x) => x.type === 'door').length, 0)} / ${num(P.openings.filter((x) => x.type === 'window').length, 0)}</b></div>
                    </div>
                    ${field(t('fp.newWallT'), `<div class="segmented"><label><input type="radio" name="fpT" value="5"${P.opt.wallT === 5 ? ' checked' : ''}><span>5"</span></label><label><input type="radio" name="fpT" value="10"${P.opt.wallT === 10 ? ' checked' : ''}><span>10"</span></label><label><input type="radio" name="fpT" value="c"${P.opt.wallT !== 5 && P.opt.wallT !== 10 ? ' checked' : ''}><span>${esc(t('tl.custom'))}</span></label></div>`)}
                    ${field(t('fp.wallT'), lenBox('fp-i-wt', 'in'))}
                    ${field(t('fp.wallH'), lenBox('fp-i-wh', 'ft'))}
                    ${field(t('fp.snap'), `<select class="control" id="fp-i-snap">${steps.map(([v, l]) => `<option value="${v}"${Math.abs(v - snapStep()) < 1e-6 ? ' selected' : ''}>${esc(l.startsWith('fp.') ? t(l) : digits(l))}</option>`).join('')}</select>`)}
                    <label class="set-row"><span><strong>${esc(t('fp.ortho'))}</strong></span><input type="checkbox" class="switch" id="fp-i-ortho"${P.opt.ortho ? ' checked' : ''}></label>
                    <label class="set-row"><span><strong>${esc(t('fp.showDims'))}</strong></span><input type="checkbox" class="switch" id="fp-i-dims"${P.opt.showDims ? ' checked' : ''}></label>
                    <ul class="fp-keys">
                        <li><kbd>W</kbd>${esc(t('fp.wall'))} <kbd>R</kbd>${esc(t('fp.room'))} <kbd>D</kbd>${esc(t('fp.door'))} <kbd>N</kbd>${esc(t('fp.window'))}</li>
                        <li><kbd>T</kbd>${esc(t('fp.text'))} <kbd>M</kbd>${esc(t('fp.dim'))} <kbd>F</kbd>${esc(t('fp.furn'))} <kbd>E</kbd>${esc(t('fp.erase'))}</li>
                        <li><kbd>Ctrl Z</kbd>${esc(t('fp.undo'))} <kbd>Del</kbd>${esc(t('fp.delete'))} <kbd>Esc</kbd>${esc(t('fp.cancel'))}</li>
                        <li>${esc(t('fp.typeHint'))}</li>
                    </ul>
                    <button type="button" class="btn btn-danger btn-sm" data-act="clear"><i class="fa-solid fa-trash-can"></i> ${esc(t('fp.clear'))}</button>`;
            } else if (sel.k === 'wall') {
                h = `<h3><i class="fa-solid fa-grip-lines-vertical"></i>${esc(t('fp.wall'))}</h3>
                    ${field(t('grp.length'), lenBox('fp-i-len', 'ft'))}
                    ${field(t('fp.wallT'), lenBox('fp-i-t', 'in'))}
                    ${field(t('fp.wallH'), lenBox('fp-i-h', 'ft'))}
                    <button type="button" class="btn btn-soft btn-sm" data-act="addDoor"><i class="fa-solid fa-door-open"></i> ${esc(t('fp.addDoor'))}</button>
                    <button type="button" class="btn btn-soft btn-sm" data-act="addWin"><i class="fa-solid fa-table-columns"></i> ${esc(t('fp.addWin'))}</button>
                    <button type="button" class="btn btn-danger btn-sm" data-act="del"><i class="fa-solid fa-trash-can"></i> ${esc(t('fp.delete'))}</button>`;
            } else if (sel.k === 'room') {
                h = `<h3><i class="fa-regular fa-square"></i>${esc(t('fp.room'))}</h3>
                    ${field(t('fp.roomName'), `<input class="control" id="fp-i-name" maxlength="40" value="${esc(o.name)}">`)}
                    <div class="fp-stats"><div><small>${esc(t('r.area'))}</small><b>${esc(qs(qArea(polyArea(o.pts))))}</b></div><div><small>${esc(t('fp.perim'))}</small><b>${esc(fmtL(o.pts.reduce((s, p, i) => s + dist(p, o.pts[(i + 1) % o.pts.length]), 0)))}</b></div></div>
                    <button type="button" class="btn btn-danger btn-sm" data-act="del"><i class="fa-solid fa-trash-can"></i> ${esc(t('fp.delRoom'))}</button>
                    <small class="set-help">${esc(t('fp.delRoomHint'))}</small>`;
            } else if (sel.k === 'op') {
                h = `<h3><i class="fa-solid ${o.type === 'door' ? 'fa-door-open' : 'fa-table-columns'}"></i>${esc(t(o.type === 'door' ? 'fp.door' : 'fp.window'))}</h3>
                    ${field(t('fp.type'), `<div class="segmented"><label><input type="radio" name="fpOpT" value="door"${o.type === 'door' ? ' checked' : ''}><span>${esc(t('fp.door'))}</span></label><label><input type="radio" name="fpOpT" value="window"${o.type === 'window' ? ' checked' : ''}><span>${esc(t('fp.window'))}</span></label></div>`)}
                    ${field(t('cl.width'), lenBox('fp-i-ow', 'ft'))}
                    ${field(t('fp.opH'), lenBox('fp-i-oh', 'ft'))}
                    ${o.type === 'window' ? field(t('fp.sill'), lenBox('fp-i-os', 'ft')) : ''}
                    ${o.type === 'door' ? `<button type="button" class="btn btn-soft btn-sm" data-act="flipSide"><i class="fa-solid fa-arrows-up-down"></i> ${esc(t('fp.flipSide'))}</button><button type="button" class="btn btn-soft btn-sm" data-act="flipHinge"><i class="fa-solid fa-arrows-left-right"></i> ${esc(t('fp.flipHinge'))}</button>` : ''}
                    <button type="button" class="btn btn-danger btn-sm" data-act="del"><i class="fa-solid fa-trash-can"></i> ${esc(t('fp.delete'))}</button>`;
            } else if (sel.k === 'text') {
                h = `<h3><i class="fa-solid fa-font"></i>${esc(t('fp.text'))}</h3>
                    ${field(t('fp.textPrompt'), `<input class="control" id="fp-i-text" maxlength="80" value="${esc(o.text)}">`)}
                    ${field(t('fp.textSize'), lenBox('fp-i-ts', 'ft'))}
                    <button type="button" class="btn btn-danger btn-sm" data-act="del"><i class="fa-solid fa-trash-can"></i> ${esc(t('fp.delete'))}</button>`;
            } else if (sel.k === 'dim') {
                h = `<h3><i class="fa-solid fa-ruler-horizontal"></i>${esc(t('fp.dim'))}</h3>
                    <div class="fp-stats"><div><small>${esc(t('grp.length'))}</small><b>${esc(fmtL(dist(o.a, o.b)))}</b></div></div>
                    ${field(t('fp.dimOff'), lenBox('fp-i-do', 'ft'))}
                    <button type="button" class="btn btn-soft btn-sm" data-act="flipDim"><i class="fa-solid fa-arrows-up-down"></i> ${esc(t('fp.flipSide'))}</button>
                    <button type="button" class="btn btn-danger btn-sm" data-act="del"><i class="fa-solid fa-trash-can"></i> ${esc(t('fp.delete'))}</button>`;
            } else if (sel.k === 'furn') {
                h = `<h3><i class="fa-solid fa-couch"></i>${esc(t('fp.f.' + o.kind))}</h3>
                    ${field(t('cl.width'), lenBox('fp-i-fw', 'ft'))}
                    ${field(t('fp.depth'), lenBox('fp-i-fd', 'ft'))}
                    <button type="button" class="btn btn-soft btn-sm" data-act="rotL"><i class="fa-solid fa-rotate-left"></i> ${esc(t('fp.rotate'))} −90°</button>
                    <button type="button" class="btn btn-soft btn-sm" data-act="rotR"><i class="fa-solid fa-rotate-right"></i> ${esc(t('fp.rotate'))} +90°</button>
                    <button type="button" class="btn btn-danger btn-sm" data-act="del"><i class="fa-solid fa-trash-can"></i> ${esc(t('fp.delete'))}</button>`;
            }
            insp.innerHTML = h;
            LEN.enhance(insp);
            LEN.refresh(insp);
            if (!o) { setLen('fp-i-wt', P.opt.wallT); setLen('fp-i-wh', P.opt.wallH); }
            else if (sel.k === 'wall') { setLen('fp-i-len', wallLen(o)); setLen('fp-i-t', o.t); setLen('fp-i-h', o.h); }
            else if (sel.k === 'op') { setLen('fp-i-ow', o.w); setLen('fp-i-oh', o.h); setLen('fp-i-os', o.sill); }
            else if (sel.k === 'text') setLen('fp-i-ts', o.size);
            else if (sel.k === 'dim') setLen('fp-i-do', Math.abs(o.off));
            else if (sel.k === 'furn') { setLen('fp-i-fw', o.w); setLen('fp-i-fd', o.d); }
        }

        insp.addEventListener('change', (e) => {
            const tg = e.target, o = getSel();
            const box = tg.closest('.len-box');
            const id = box ? $('input[data-len]', box).id : tg.id;
            const v = box ? readLen(id) : null;
            const ok = (x) => Number.isFinite(x) && x > 0;
            if (!o) {
                if (tg.name === 'fpT' && tg.value !== 'c') P.opt.wallT = Number(tg.value);
                else if (id === 'fp-i-wt' && ok(v)) P.opt.wallT = +v.toFixed(3);
                else if (id === 'fp-i-wh' && ok(v)) P.opt.wallH = +v.toFixed(3);
                else if (id === 'fp-i-snap') P.opt.snap = Number(tg.value);
                else if (id === 'fp-i-ortho') P.opt.ortho = tg.checked;
                else if (id === 'fp-i-dims') P.opt.showDims = tg.checked;
                else return;
                commit();
                return;
            }
            if (sel.k === 'wall') {
                if (id === 'fp-i-len' && ok(v)) {
                    const u = unitv(sub(o.b, o.a));
                    moveEndpoint(o.b, add(o.a, mul(u, v)));
                } else if (id === 'fp-i-t' && ok(v)) o.t = v;
                else if (id === 'fp-i-h' && ok(v)) o.h = v;
                else return;
            } else if (sel.k === 'room') {
                if (id === 'fp-i-name') o.name = tg.value.slice(0, 40); else return;
            } else if (sel.k === 'op') {
                if (tg.name === 'fpOpT') { o.type = tg.value; if (o.type === 'window' && !o.sill) { o.sill = 3; o.h = Math.min(o.h, 4); } if (o.type === 'door') o.sill = 0; }
                else if (id === 'fp-i-ow' && ok(v)) o.w = v;
                else if (id === 'fp-i-oh' && ok(v)) o.h = v;
                else if (id === 'fp-i-os' && Number.isFinite(v) && v >= 0) o.sill = v;
                else return;
                clampOpenings();
            } else if (sel.k === 'text') {
                if (id === 'fp-i-text') o.text = tg.value.slice(0, 80);
                else if (id === 'fp-i-ts' && ok(v)) o.size = v;
                else return;
            } else if (sel.k === 'dim') {
                if (id === 'fp-i-do' && ok(v)) o.off = Math.sign(o.off || -1) * v; else return;
            } else if (sel.k === 'furn') {
                if (id === 'fp-i-fw' && ok(v)) o.w = v;
                else if (id === 'fp-i-fd' && ok(v)) o.d = v;
                else return;
            }
            commit();
        });
        insp.addEventListener('click', (e) => {
            const b = e.target.closest('[data-act]');
            if (!b) return;
            const o = getSel(), act = b.dataset.act;
            if (act === 'clear') {
                if (!window.confirm(t('fp.clearConfirm'))) return;
                const opt = P.opt;
                P = blank(); P.opt = opt; sel = null;
                commit();
                return;
            }
            if (!o) return;
            if (act === 'del') remove(sel.k, sel.id);
            else if (act === 'addDoor' || act === 'addWin') { const n = addOpening(act === 'addDoor' ? 'door' : 'window', o, lerp(o.a, o.b, .5)); sel = { k: 'op', id: n.id }; }
            else if (act === 'flipSide') { if (sel.k === 'dim') o.off = -o.off; else o.flip ^= 1; }
            else if (act === 'flipHinge') o.flip ^= 2;
            else if (act === 'flipDim') o.off = -o.off;
            else if (act === 'rotL' || act === 'rotR') o.rot = ((o.rot + (act === 'rotR' ? 90 : -90)) % 360 + 360) % 360;
            commit();
        });

        /* ---------- toolbar, view, file menu ---------- */
        $$('.plan-tools [data-tool]').forEach((b) => b.addEventListener('click', () => setTool(b.dataset.tool)));
        const kindSel = $('#fp-furn-kind');
        function fillKinds() { kindSel.innerHTML = Object.keys(LIB).map((k) => `<option value="${k}"${k === furnKind ? ' selected' : ''}>${esc(t('fp.f.' + k))}</option>`).join(''); }
        kindSel.addEventListener('change', () => { furnKind = kindSel.value; });
        $('#fp-undo').addEventListener('click', undo);
        $('#fp-redo').addEventListener('click', redo);
        $('#fp-fit').addEventListener('click', () => fit());
        function setView(v) {
            main.dataset.view = v;
            $$('input[name="fpView"]').forEach((r) => { r.checked = r.value === v; });
            storage.set(STORE_VIEW, v);
            setTimeout(() => { draw(); VIZ.update('plan'); }, 30);
        }
        $$('input[name="fpView"]').forEach((r) => r.addEventListener('change', () => setView(r.value)));
        const menuBtn2 = $('#fp-menu-btn'), menu = $('#fp-menu');
        menuBtn2.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; menuBtn2.setAttribute('aria-expanded', String(!menu.hidden)); });
        document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('.fp-menu')) { menu.hidden = true; menuBtn2.setAttribute('aria-expanded', 'false'); } });
        menu.addEventListener('click', async (e) => {
            const b = e.target.closest('[data-fp]');
            if (!b) return;
            menu.hidden = true;
            const a = b.dataset.fp;
            if (a === 'new') {
                if ((P.walls.length || P.furn.length) && !window.confirm(t('fp.clearConfirm'))) return;
                const opt = P.opt; P = blank(); P.opt = opt; sel = null; commit(); fit();
            } else if (a === 'sample') {
                if ((P.walls.length || P.furn.length) && !window.confirm(t('fp.sampleConfirm'))) return;
                sample(); commit(); fit();
            } else if (a === 'open') $('#fp-file').click();
            else if (a === 'save') downloadBlob(new Blob([JSON.stringify(P, null, 1)], { type: 'application/json' }), fileBase() + '.json');
            else if (a === 'png') {
                const url = await toPng();
                const res = await fetch(url);
                downloadBlob(await res.blob(), fileBase() + '.png');
            }
        });
        $('#fp-file').addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            e.target.value = '';
            if (!file) return;
            if (file.size > 3 * 1024 * 1024) { toast(t('fp.badFile')); return; }
            const rd = new FileReader();
            rd.onload = () => {
                try { P = sanitize(JSON.parse(rd.result)); sel = null; commit(); fit(); toast(t('fp.opened')); }
                catch (err) { toast(t('fp.badFile')); }
            };
            rd.readAsText(file);
        });
        function downloadBlob(blob, name) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = name;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
        }
        function fileBase() {
            const d = new Date();
            return `Floor-Plan_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

        /* ---------- PNG export (also used in the PDF) ---------- */
        function toPng(maxW = 1800) {
            const b = bounds(), pad = 3;
            const bw = b.x1 - b.x0 + pad * 2, bh = b.y1 - b.y0 + pad * 2;
            const s = Math.min(maxW / bw, 1400 / bh, 60);
            const W = Math.round(bw * s), H = Math.round(bh * s);
            const pal = palette(true);
            const savedSel = sel; sel = null;
            const body = worldMarkup(pal, s / 1.7, false);       // a little bigger text and lines for print
            sel = savedSel;
            const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Noto Sans Bengali, Nirmala UI, Vrinda, Poppins, Arial, sans-serif"><rect width="${W}" height="${H}" fill="#ffffff"/><g transform="translate(${(pad - b.x0) * s} ${(pad - b.y0) * s}) scale(${s})">${body}</g></svg>`;
            return new Promise((res, rej) => {
                const img = new Image();
                img.onload = () => {
                    const c = document.createElement('canvas');
                    c.width = W; c.height = H;
                    const g = c.getContext('2d');
                    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
                    g.drawImage(img, 0, 0);
                    res(c.toDataURL('image/png'));
                };
                img.onerror = rej;
                img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
            });
        }

        /* ---------- sample house ---------- */
        function sample() {
            const opt = P.opt;
            P = blank(); P.opt = opt;
            const bn = S.lang === 'bn';
            addRect({ x: 0, y: 0 }, { x: 36, y: 24 }, null, 10);
            P.rooms = [];
            addRect({ x: 0, y: 0 }, { x: 14, y: 12 }, bn ? 'শোবার ঘর ১' : 'Bedroom 1', 5);
            addRect({ x: 0, y: 12 }, { x: 14, y: 24 }, bn ? 'শোবার ঘর ২' : 'Bedroom 2', 5);
            addRect({ x: 14, y: 0 }, { x: 36, y: 14 }, bn ? 'বসার ঘর' : 'Living room', 5);
            addRect({ x: 14, y: 14 }, { x: 25, y: 24 }, bn ? 'রান্নাঘর' : 'Kitchen', 5);
            addRect({ x: 25, y: 14 }, { x: 36, y: 24 }, bn ? 'বাথরুম' : 'Bathroom', 5);
            const at = (type, x, y, extra) => { const w = nearestWall({ x, y }, 4); if (w) addOpening(type, w, { x, y }, extra); };
            const v0 = view.s; view.s = 18;
            at('door', 25, 0, { w: 3.5, flip: 0 });
            at('door', 14, 8, { flip: 0 });
            at('door', 14, 16, { flip: 0 });
            at('door', 21.5, 14, { flip: 1 });
            at('door', 28, 14, { w: 2.5, flip: 1 });
            at('window', 0, 6); at('window', 0, 18); at('window', 7, 0); at('window', 32, 0, { w: 5 });
            at('window', 19, 24); at('window', 33, 24, { w: 2.5, h: 2, sill: 5 }); at('window', 36, 7, { w: 5 });
            view.s = v0;
            const f = (kind, x, y, rot = 0) => P.furn.push({ id: uid(), kind, x, y, rot, w: LIB[kind].w, d: LIB[kind].d });
            f('bed', 6, 5.5); f('wardrobe', 2.5, 10.6); f('bed', 6, 19, 180); f('wardrobe', 3.5, 13.4, 180);
            f('sofa', 23, 10.8, 180); f('dining', 31.5, 5); f('counter', 19.5, 22.6); f('fridge', 15.7, 15.7);
            f('wc', 34.6, 22.5); f('basin', 27, 22.8); f('shower', 33.9, 16.1);
            P.dims.push({ id: uid(), a: { x: 0, y: 0 }, b: { x: 36, y: 0 }, off: -3 });
            P.dims.push({ id: uid(), a: { x: 0, y: 0 }, b: { x: 0, y: 24 }, off: 3 });
        }

        /* ---------- estimate from the drawing ---------- */
        CALC.plan = {
            ratios: [],
            run(v) {
                const k = K();
                const walls = P.walls;
                if (!walls.length && !P.rooms.length) return [row(t('fp.empty'), '')];
                const floor = P.rooms.reduce((s, r) => s + polyArea(r.pts), 0);
                const groups = {};
                let wl = 0, netTotal = 0;
                walls.forEach((w) => {
                    const L = wallLen(w);
                    const op = P.openings.filter((o) => o.wall === w.id).reduce((s, o) => s + o.w * Math.min(o.h, Math.max(w.h - o.sill, 0)), 0);
                    const net = Math.max(L * w.h - op, 0);
                    const g = groups[w.t] || (groups[w.t] = { len: 0, vol: 0 });
                    g.len += L; g.vol += net * w.t / 12;
                    wl += L; netTotal += net;
                });
                const doors = P.openings.filter((o) => o.type === 'door').length, wins = P.openings.length - doors;
                const items = [
                    heading(t('fp.r.summary')),
                    row(t('fp.r.rooms'), num(P.rooms.length, 0), t('u.pcs')),
                    rq(t('r.floorArea'), qArea(floor)),
                    rq(t('fp.r.wallLen'), qRun(wl)),
                    row(t('fp.r.doors'), num(doors, 0), t('u.pcs')),
                    row(t('fp.r.windows'), num(wins, 0), t('u.pcs')),
                ];
                let bricks = 0, bags = 0, sand = 0, khoa = 0, tileCost = 0;
                const mix = (dry, parts, idx) => dry / parts.reduce((a, b) => a + b, 0) * parts[idx];
                if (walls.length) {
                    let vol = 0;
                    items.push(heading(t('fp.g.wall')));
                    Object.keys(groups).map(Number).sort((a, b) => b - a).forEach((tk) => {
                        vol += groups[tk].vol;
                        items.push(rq(t('fp.r.wallT', { t: LEN.fmtIn(tk), l: fmtL(groups[tk].len) }), qVol(groups[tk].vol)));
                    });
                    bricks = Math.ceil(vol * k.bricksPerCft - 1e-9);
                    const dry = vol * k.wallDry, rt = [v.wRatio1, v.wRatio2];
                    const c = mix(dry, rt, 0), s = mix(dry, rt, 1);
                    bags += c * k.cementBag; sand += s;
                    items.push(
                        rq(t('fp.r.netWall'), qArea(netTotal)),
                        row(t('r.bricks'), num(bricks, 0), t('u.pcs'), true),
                        rq(t('r.dryMix'), qVol(dry)),
                        row(t('r.cementBags'), num(c * k.cementBag), t('u.bags'), true),
                        rq(t('mat.sand'), qVol(s), true),
                    );
                }
                const sides = Number(v.pSides ?? 2);
                if (walls.length && sides > 0 && v.pThk > 0) {
                    const area = netTotal * sides, dry = area * v.pThk / 12 * k.dry, rt = [v.pRatio1, v.pRatio2];
                    const c = mix(dry, rt, 0), s = mix(dry, rt, 1);
                    bags += c * k.cementBag; sand += s;
                    items.push(heading(t('fp.g.plaster')), rq(t('r.workArea'), qArea(area)), row(t('r.cementBags'), num(c * k.cementBag), t('u.bags'), true), rq(t('mat.sand'), qVol(s), true));
                }
                if (v.slab !== '0' && floor > 0 && v.sThk > 0) {
                    const vol = floor * v.sThk / 12, dry = vol * k.dry, rt = [v.sRatio1, v.sRatio2, v.sRatio3];
                    const c = mix(dry, rt, 0), s = mix(dry, rt, 1), kh = mix(dry, rt, 2);
                    bags += c * k.cementBag; sand += s; khoa += kh;
                    items.push(heading(t('fp.g.slab')), rq(t('r.totalVolume'), qVol(vol)), row(t('r.cementBags'), num(c * k.cementBag), t('u.bags'), true), rq(t('mat.sand'), qVol(s), true), rq(t('mat.khoa'), qVol(kh), true));
                }
                if (v.fTile && v.fTile !== '0' && floor > 0) {
                    const [a, b] = v.fTile.split('x').map(Number), one = a * b / 144;
                    const n = Math.ceil(floor / one - 1e-9), nw = Math.ceil(n * (1 + (v.fWaste || 0) / 100) - 1e-9);
                    tileCost = nw * one * (v.tilePrice || 0);
                    items.push(heading(t('fp.g.tiles')), row(t('r.tileSize'), `${numPlain(a)} × ${numPlain(b)} ${t('u.inch')}`), row(t('r.tilesTotal'), num(nw, 0), t('u.pcs'), true), rq(t('r.buySft'), qArea(nw * one)));
                }
                items.push(...costItems([['r.brickCost', bricks, v.brickPrice], ['r.cementCost', bags, v.cementPrice], ['r.sandCost', sand, v.sandPrice], ['r.khoaCost', khoa, v.khoaPrice], ['r.tileCost', 1, tileCost]]));
                return items;
            },
        };
        form.addEventListener('input', () => { clearTimeout(estT); estT = setTimeout(refreshEstimate, 250); });
        form.addEventListener('change', () => { clearTimeout(estT); estT = setTimeout(refreshEstimate, 120); });

        /* ---------- init ---------- */
        new ResizeObserver(() => draw()).observe(wrap);
        VIZ.attach('plan', $('#plan-3d'), () => P);
        const savedView = storage.get(STORE_VIEW, null);
        if (savedView && ['2d', 'split', '3d'].includes(savedView)) { main.dataset.view = savedView; $$('input[name="fpView"]').forEach((r) => { r.checked = r.value === savedView; }); }
        setTool('select');

        return {
            data: () => P,
            polyArea, centroid, LIB,
            toPng,
            relabel() { fillKinds(); inspector(); draw(); if (currentPage === 'plan') refreshEstimate(); },
            show() { view.fitted = view.fitted && wrap.clientWidth > 0; draw(); inspector(); setTimeout(refreshEstimate, 0); },
            refreshEstimate,
        };
    })();

    /* ---------- Wire up calculator forms ---------- */
    $$('form[data-calc]').forEach((form) => {
        const id = form.dataset.calc;
        restoreInputs(form);
        if (id === 'tiles') TILES.syncCustom();

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
                LEN.sync();
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

    /* =========================================================
       Print / PDF / WhatsApp — with or without the 3D picture
       ========================================================= */
    const SHARE = (() => {
        const modal = $('#share-modal'), scrim = $('#share-scrim');
        const chk = $('#share-3d');
        const st = { id: null, img: '', planImg: '', pdf: {} };
        const LIBS = [
            'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        ];
        let libsP = null;
        const loadScript = (src) => new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = res;
            s.onerror = () => rej(new Error('Could not load ' + src));
            document.head.appendChild(s);
        });
        function loadLibs() {
            if (window.html2canvas && window.jspdf) return Promise.resolve();
            if (!libsP) libsP = Promise.all(LIBS.map(loadScript)).catch((e) => { libsP = null; throw e; });
            return libsP;
        }

        const stamp = () => digits(new Date().toLocaleString(S.lang === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }));
        // always plain English letters: WhatsApp and some phones garble Bangla file names
        const fileName = () => {
            const d = new Date();
            const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const ascii = (x) => String(x || '').normalize('NFKD').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const brand = ascii(SITE.brand && SITE.brand.en) || ascii(I18N.en['brand.name']) || 'Construction-Solution';
            return `${brand}_${ascii(I18N.en['page.' + st.id]) || st.id}_${day}.pdf`;
        };

        function reportHtml(img) {
            const id = st.id, v = lastValues[id];
            const form = $(`form[data-calc="${id}"]`);
            const inputs = inputsList(form, v).map(([l, val]) => `<tr><td>${escapeHtml(l)}</td><td>${escapeHtml(val)}</td></tr>`).join('');
            const res = CALC[id].run(v).map((it) => {
                if (it.type === 'title') return `<tr class="sub"><td colspan="2">${escapeHtml(it.text)}</td></tr>`;
                const unit = it.unit ? `<small>${escapeHtml(it.unit)}</small>` : '';
                return `<tr class="${it.key || it.type === 'total' ? 'key' : ''}"><td>${escapeHtml(it.label)}</td><td>${escapeHtml(it.value)}${unit}</td></tr>`;
            }).join('');
            return `
                <div class="rp" lang="${S.lang}">
                    <div class="rp-head">
                        <div><div class="rp-brand">${escapeHtml(t('brand.name'))}</div><div class="rp-title">${escapeHtml(t('page.' + id))}</div></div>
                        <div class="rp-date">${escapeHtml(stamp())}</div>
                    </div>
                    ${id === 'plan' && st.planImg ? `<div class="rp-3d"><h3>${escapeHtml(t('rp.plan2d'))}</h3><img src="${st.planImg}" alt=""></div>` : ''}
                    <h3>${escapeHtml(t('rp.inputs'))}</h3>
                    <table class="rp-table rp-inputs">${inputs}</table>
                    <h3>${escapeHtml(t('rp.results'))}</h3>
                    <table class="rp-table">${res}</table>
                    ${img ? `<div class="rp-3d"><h3>${escapeHtml(t('rp.3d'))}</h3><img src="${img}" alt=""></div>` : ''}
                    <div class="rp-foot">${escapeHtml(t('rp.made', { site: t('brand.name') }))}</div>
                </div>`;
        }
        const imagesReady = (root) => Promise.all($$('img', root).map((im) => (im.decode ? im.decode().catch(() => {}) : Promise.resolve())));

        function buildPdf(with3d) {
            const key = with3d ? '3d' : 'plain';
            if (st.pdf[key]) return st.pdf[key];
            st.pdf[key] = (async () => {
                await loadLibs();
                const root = $('#pdf-root');
                root.innerHTML = reportHtml(with3d ? st.img : '');
                root.classList.add('render');
                try {
                    await imagesReady(root);
                    if (document.fonts && document.fonts.ready) await document.fonts.ready;
                    avoidPageCuts(root.firstElementChild);
                    const canvas = await window.html2canvas(root.firstElementChild, { scale: 2, backgroundColor: '#ffffff', logging: false });
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
                    const pw = 210, ph = 297;
                    const pagePx = Math.floor(canvas.width * ph / pw);
                    for (let y = 0, page = 0; y < canvas.height; y += pagePx, page++) {
                        const c = document.createElement('canvas');
                        c.width = canvas.width;
                        c.height = Math.min(pagePx, canvas.height - y);
                        const ctx = c.getContext('2d');
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, c.width, c.height);
                        ctx.drawImage(canvas, 0, -y);
                        if (page) pdf.addPage();
                        pdf.addImage(c.toDataURL('image/jpeg', .92), 'JPEG', 0, 0, pw, c.height * pw / canvas.width);
                    }
                    return pdf.output('blob');
                } finally {
                    root.classList.remove('render');
                    root.innerHTML = '';
                }
            })();
            st.pdf[key].catch(() => { delete st.pdf[key]; });
            return st.pdf[key];
        }
        // push rows / the 3D picture to the next A4 page instead of cutting them in half
        function avoidPageCuts(rp) {
            const pageH = rp.offsetWidth * 297 / 210;
            const top = (el) => { let y = 0; for (let n = el; n && n !== rp; n = n.offsetParent) y += n.offsetTop; return y; };
            $$('.rp-table tr, .rp-3d, .rp h3, .rp-foot', rp).forEach((el) => {
                const y = top(el), h = el.offsetHeight;
                const page = Math.floor(y / pageH), end = (page + 1) * pageH;
                if (h < pageH && y + h > end - 24) {
                    const gap = end - y + 32;                      // land a little below the next page's top
                    if (el.tagName === 'TR') {
                        const sp = document.createElement('tr');
                        sp.innerHTML = `<td colspan="2" style="height:${gap}px;padding:0;border:0"></td>`;
                        el.parentNode.insertBefore(sp, el);
                    } else {
                        el.style.marginTop = (parseFloat(getComputedStyle(el).marginTop) + gap) + 'px';
                    }
                }
            });
        }
        const want3d = () => chk.checked && !!st.img;

        function updatePreview() {
            const img = $('#share-img');
            img.hidden = !want3d();
            if (want3d()) img.src = st.img;
            $('#share-no3d').hidden = want3d();
        }

        async function open(id) {
            if (!lastValues[id]) return;
            st.id = id;
            st.pdf = {};
            st.planImg = '';
            if (id === 'plan') { try { st.planImg = await PLAN.toPng(1600); } catch (e) { console.warn('2D export failed:', e); } }
            st.img = VIZ.snapshot(id);
            chk.disabled = !st.img;
            if (!st.img) chk.checked = false;
            updatePreview();
            modal.classList.add('open');
            scrim.classList.add('show');
            document.body.classList.add('lock');
            setTimeout(() => $('#share-print').focus(), 60);
            buildPdf(want3d()).catch(() => {});          // get the PDF ready in the background
        }
        function close() {
            if (!modal.classList.contains('open')) return;
            modal.classList.remove('open');
            scrim.classList.remove('show');
            document.body.classList.remove('lock');
        }

        async function busy(btn, fn) {
            btn.classList.add('loading');
            const icon = $('i', btn), cls = icon.className;
            icon.className = 'fa-solid fa-spinner';
            try { await fn(); } finally { btn.classList.remove('loading'); icon.className = cls; }
        }
        function download(blob, name) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
        }
        function summaryText() {
            const lines = [`${t('brand.name')} — ${t('page.' + st.id)}`, ''];
            CALC[st.id].run(lastValues[st.id]).forEach((it) => {
                if ((it.key || it.type === 'total') && it.value) lines.push(`• ${it.label.replace(/[:ঃ]\s*$/, '')}: ${it.value} ${it.unit || ''}`.trim());
            });
            return lines.join('\n');
        }

        async function doPrint() {
            const pr = $('#print-root');
            pr.innerHTML = reportHtml(want3d() ? st.img : '');
            await imagesReady(pr);
            root.classList.add('printing-report');
            window.print();
        }
        async function doPdf() {
            try {
                download(await buildPdf(want3d()), fileName());
                toast(t('sh.pdfReady'));
            } catch (e) { console.warn(e); toast(t('sh.err')); }
        }
        async function doWhatsApp() {
            const name = fileName();
            let canFiles = false;
            try {
                canFiles = !!(navigator.share && navigator.canShare &&
                    navigator.canShare({ files: [new File([new Blob(['x'], { type: 'application/pdf' })], 'x.pdf', { type: 'application/pdf' })] }));
            } catch (e) { canFiles = false; }
            const win = canFiles ? null : window.open('', '_blank');     // open now so the popup isn't blocked
            try {
                const blob = await buildPdf(want3d());
                if (canFiles) {
                    await navigator.share({ files: [new File([blob], name, { type: 'application/pdf' })], title: name, text: summaryText() });
                } else {
                    download(blob, name);
                    const url = 'https://wa.me/?text=' + encodeURIComponent(summaryText());
                    if (win) win.location.href = url; else window.open(url, '_blank', 'noopener');
                    toast(t('sh.waDesk'));
                }
            } catch (e) {
                if (win) win.close();
                if (e && e.name === 'AbortError') return;
                if (e && e.name === 'NotAllowedError') { toast(t('sh.tapAgain')); return; }
                console.warn(e);
                toast(t('sh.err'));
            }
        }

        chk.addEventListener('change', () => { updatePreview(); buildPdf(want3d()).catch(() => {}); });
        $('#share-close').addEventListener('click', close);
        scrim.addEventListener('click', close);
        $('#share-print').addEventListener('click', (e) => busy(e.currentTarget, doPrint));
        $('#share-pdf').addEventListener('click', (e) => busy(e.currentTarget, doPdf));
        $('#share-wa').addEventListener('click', (e) => busy(e.currentTarget, doWhatsApp));
        window.addEventListener('beforeprint', () => { if ($('#print-root').innerHTML.trim()) root.classList.add('printing-report'); });
        window.addEventListener('afterprint', () => { root.classList.remove('printing-report'); $('#print-root').innerHTML = ''; });
        $$('[data-print]').forEach((btn) => btn.addEventListener('click', () => open(btn.closest('.result-card').id.replace('result-', ''))));

        return { open, close };
    })();


    /* =========================================================
       Review page
       ========================================================= */
    // inquiry → opens the developer's WhatsApp or Gmail with the message written, and saves it for the admin
    $('#inquiry-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const dev = SITE.developer || {};
        const via = (e.submitter && e.submitter.value) || (waNumber(dev.whatsapp) ? 'whatsapp' : 'gmail');
        const d = Object.fromEntries(new FormData(form));
        const body = [
            t('inq.msgTitle', { site: t('brand.name') }),
            '',
            `${t('f.name')}: ${d.name}`,
            `${t('f.phone')}: ${d.phone}`,
            `${t('lbl.email')}: ${d.email}`,
            '',
            `${t('f.req')}:`,
            d.message,
        ].join('\n');
        const url = via === 'gmail'
            ? gmailLink(t('inq.subject', { name: d.name }), body, dev.email)
            : waLink(body, dev.whatsapp);
        if (url) window.open(url, '_blank', 'noopener');
        if (FB.ready) {
            FB.db.collection('inquiries').add({
                name: String(d.name).slice(0, 100),
                phone: String(d.phone).slice(0, 30),
                email: String(d.email).slice(0, 120),
                message: String(d.message).slice(0, 2000),
                via, lang: S.lang, createdAt: serverTime(),
            }).catch((err) => console.warn('Inquiry not saved:', err.code || err));
        }
        toast(t('inq.opened'));
        form.reset();
    });

    const reviewForm = $('#review-form');
    function updateRatingText() {
        const checked = $('input[name="rating"]:checked', reviewForm);
        $('#rating-text').textContent = checked ? t('rate.' + checked.value) : '';
    }
    reviewForm.addEventListener('change', (e) => { if (e.target.name === 'rating') updateRatingText(); });
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(reviewForm));
        if (FB.ready) {
            FB.db.collection('reviews').add({
                name: String(d.name).slice(0, 100),
                email: String(d.email).slice(0, 120),
                rating: Math.max(1, Math.min(5, Number(d.rating) || 5)),
                comments: String(d.comments).slice(0, 2000),
                lang: S.lang, createdAt: serverTime(),
            }).catch((err) => console.warn('Review not saved:', err.code || err));
        }
        toast(t('rev.ok'));
        reviewForm.reset();
        updateRatingText();
    });

    /* ---------- Init ---------- */
    VIZ.createCards();
    fbInit();
    route();
    applyAll();
})();