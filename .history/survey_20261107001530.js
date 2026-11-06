/* =========================================================
   Construction Solution — survey.js  (ভূমি জরিপ / Land Survey)
   Loaded after script.js. Uses the small helper bridge
   window.CS that script.js exposes (t, num, toast, storage…).

   · Map & division : upload a mouza map (image / PDF), set the
     scale, trace plots (দাগ), measure, divide between sharers,
     download a printable division map (বণ্টন নকশা).
   · Field area     : area from side lengths measured on the land.
   · Unit converter : শতাংশ, কাঠা, বিঘা, একর, …

   Geometry is kept in "map units" (image pixels, or feet when
   there is no image). D.scale.f = feet in one map unit, so
   changing the scale re-measures everything at once.
   ========================================================= */
(() => {
    'use strict';
    const CS = window.CS;
    const ROOT = document.getElementById('survey-root');
    if (!CS || !ROOT) return;
    const { $, $$, t, num, digits, parseNum, esc, toast, storage, I18N } = CS;

    /* =========================================================
       Text (Bangla / English)
       ========================================================= */
    const BN = {
        'sv.title': 'ভূমি জরিপ — জমির মাপ, মৌজা নকশা ও বণ্টন',
        'sv.sub': 'মৌজা নকশা আপলোড করে স্কেল সেট করুন, দাগ এঁকে নির্ভুল পরিমাণ বের করুন, শরিকদের মধ্যে জমি ভাগ করে বণ্টন নকশা ডাউনলোড করুন। মাঠে মাপা বাহু থেকেও ক্ষেত্রফল বের করা যায়।',
        'sv.tab.map': 'নকশা, মাপ ও বণ্টন', 'sv.tab.field': 'মাঠের মাপ (বাহু দিয়ে)', 'sv.tab.conv': 'একক রূপান্তর',
        'sv.s1': 'নকশা আপলোড', 'sv.s1d': 'ছবি বা PDF', 'sv.s2': 'স্কেল সেট', 'sv.s2d': 'জানা দূরত্ব বা ১৬" = ১ মাইল',
        'sv.s3': 'দাগ আঁকুন', 'sv.s3d': 'কোণে কোণে ক্লিক', 'sv.s4': 'বণ্টন ও ডাউনলোড', 'sv.s4d': 'শরিক অনুযায়ী ভাগ',
        'sv.t.select': 'বাছাই', 'sv.t.pan': 'সরান', 'sv.t.draw': 'দাগ আঁকুন', 'sv.t.measure': 'দূরত্ব', 'sv.t.calib': 'স্কেল মাপ',
        'sv.upload': 'নকশা দিন', 'sv.undo': 'আগের অবস্থা', 'sv.redo': 'পরের অবস্থা', 'sv.fit': 'পুরোটা দেখুন', 'sv.full': 'বড় পর্দা',
        'sv.finish': 'দাগ শেষ', 'sv.back': 'শেষ বিন্দু মুছুন', 'sv.cancel': 'বাতিল',
        'sv.h.select': 'দাগে ট্যাপ করে বাছাই করুন · কোণ টেনে ঠিক করুন · ভাগের রেখা টেনে সরান · ফাঁকা জায়গা টেনে নকশা সরান',
        'sv.h.pan': 'টেনে নকশা সরান · চাকা/দুই আঙুলে ছোট-বড় করুন',
        'sv.h.draw': 'জমির কোণে কোণে ক্লিক/ট্যাপ করুন · প্রথম বিন্দুতে ফিরলে বা "দাগ শেষ" চাপলে দাগ বন্ধ হবে',
        'sv.h.measure': 'দুই বিন্দুতে ক্লিক করে দূরত্ব মাপুন',
        'sv.h.calib': 'নকশার এমন দুই বিন্দুতে ক্লিক করুন যাদের আসল দূরত্ব জানা (যেমন নকশার স্কেল দাগ বা মাঠে মাপা একটি বাহু)',
        'sv.p.map': 'মৌজা নকশা', 'sv.noImg': 'কোনো নকশা দেওয়া নেই — ফাঁকা জায়গায় সরাসরি ফুটে আঁকতে পারেন, অথবা মৌজা নকশার ছবি / PDF দিন।',
        'sv.choose': 'ছবি / PDF বেছে নিন', 'sv.replace': 'নকশা বদলান', 'sv.removeImg': 'নকশা সরান', 'sv.alpha': 'নকশা কতটা গাঢ়',
        'sv.pdfPage': 'PDF-এর পাতা', 'sv.loading': 'নকশা খোলা হচ্ছে…', 'sv.pdfFail': 'PDF খোলা যায়নি — ছবি (JPG/PNG) হিসেবে দিয়ে দেখুন',
        'sv.imgFail': 'ফাইলটি খোলা যায়নি', 'sv.bigImg': 'ছবিটি অনেক বড় ছিল, মাপ ঠিক রেখে ছোট করা হয়েছে',
        'sv.p.scale': 'স্কেল', 'sv.sc.none': 'নকশা ছাড়া আঁকছেন: ১ ঘর = ১ ফুট (স্কেল লাগবে না)',
        'sv.sc.now': '১ ইঞ্চি নকশা = {v}', 'sv.sc.px': '১ পিক্সেল = {v}',
        'sv.sc.warn': 'স্কেল অনুমান করা — একটি জানা দূরত্ব দিয়ে যাচাই করে নিন', 'sv.sc.ok': 'জানা দূরত্ব দিয়ে স্কেল সেট করা',
        'sv.sc.m1': 'জানা দূরত্ব দিয়ে (সবচেয়ে নির্ভুল)', 'sv.sc.pick': 'নকশায় দুই বিন্দু বাছুন',
        'sv.sc.picked': 'দুই বিন্দু বাছা হয়েছে', 'sv.sc.dist': 'ওই দুই বিন্দুর আসল দূরত্ব', 'sv.sc.apply': 'স্কেল সেট করুন',
        'sv.sc.m2': 'নকশায় ছাপা স্কেল দিয়ে', 'sv.sc.ratio': 'নকশার স্কেল', 'sv.sc.dpi': 'স্ক্যানের DPI', 'sv.sc.dpiAuto': 'ফাইল থেকে পাওয়া',
        'sv.sc.r16': '১৬" = ১ মাইল (RS/BS/SA মৌজা)', 'sv.sc.r32': '৩২" = ১ মাইল', 'sv.sc.r64': '৬৪" = ১ মাইল', 'sv.sc.r8': '৮" = ১ মাইল',
        'sv.sc.custom': 'অন্য স্কেল (১ : N)', 'sv.sc.N': 'N (১ : N)', 'sv.sc.done': 'স্কেল সেট হয়েছে', 'sv.sc.need2': 'আগে নকশায় দুই বিন্দু বাছুন',
        'sv.sc.help': 'বাংলাদেশের বেশিরভাগ মৌজা নকশা ১৬ ইঞ্চি = ১ মাইল (১ ইঞ্চি = ৩৩০ ফুট)। স্ক্যান করা ছবিতে কাগজ কতটা বড় তা নিশ্চিত নয়, তাই জানা দূরত্ব দিয়ে মিলিয়ে নেওয়াই সবচেয়ে নির্ভুল।',
        'sv.p.plots': 'দাগ সমূহ', 'sv.noPlots': 'এখনো কোনো দাগ নেই — উপরের "দাগ আঁকুন" দিয়ে জমির সীমানা আঁকুন।',
        'sv.total': 'সব দাগ মিলিয়ে', 'sv.plotN': 'দাগ {n}', 'sv.f.name': 'দাগ নং / নাম', 'sv.f.owner': 'মালিক / নোট',
        'sv.area': 'পরিমাণ', 'sv.sides': 'বাহুর মাপ', 'sv.side': 'বাহু {n}', 'sv.del': 'দাগ মুছুন', 'sv.delV': 'বাছাই করা কোণ মুছুন',
        'sv.divide': 'এই দাগ বণ্টন করুন', 'sv.allUnits': 'সব এককে', 'sv.lenUnit': 'দৈর্ঘ্য দেখাবে', 'sv.areaUnit': 'পরিমাণ দেখাবে',
        'sv.vHint': 'বাহুর উপর দুবার ক্লিক করলে নতুন কোণ যোগ হয়',
        'sv.p.div': 'বণ্টন (ভাগ)', 'sv.d.how': 'কিভাবে ভাগ হবে', 'sv.d.front': 'সবাই সামনের বাহু পাবে', 'sv.d.depth': 'সামনে থেকে পেছনে ভাগ',
        'sv.d.edge': 'সামনের বাহু (রাস্তার দিক)', 'sv.d.mode': 'অংশের হিসাব', 'sv.d.eq': 'সমান ভাগ', 'sv.d.ratio': 'অনুপাতে', 'sv.d.area': 'শতাংশে',
        'sv.d.share': 'শরিক {n}', 'sv.d.name': 'নাম', 'sv.d.val': 'ভাগ', 'sv.d.valArea': 'শতাংশ', 'sv.d.add': 'শরিক যোগ করুন',
        'sv.d.run': 'ভাগ করুন', 'sv.d.exact': 'আবার নির্ভুল করুন', 'sv.d.clear': 'বণ্টন মুছুন', 'sv.d.rest': 'অবশিষ্ট',
        'sv.d.over': 'অংশগুলোর যোগফল দাগের পরিমাণের চেয়ে বেশি', 'sv.d.drag': 'নকশায় ভাগের রেখা টেনে সরাতে পারবেন — পরিমাণ সাথে সাথে বদলাবে।',
        'sv.d.moved': 'রেখা হাতে সরানো হয়েছে — পরিমাণ লক্ষ্য থেকে আলাদা হতে পারে', 'sv.d.target': 'লক্ষ্য', 'sv.d.got': 'পেয়েছে',
        'sv.d.hint': 'উদাহরণ: ছেলে ২, মেয়ে ১ — "অনুপাতে" বেছে ভাগে ২ ও ১ লিখুন', 'sv.d.need': 'আগে একটি দাগ বাছাই করুন', 'sv.d.done': 'বণ্টন হয়েছে',
        'sv.d.front2': 'প্রতিটি অংশ রাস্তা/সামনের বাহুর দিকে চওড়া পাবে', 'sv.d.depth2': 'প্রথম শরিক সামনে, শেষ জন পেছনে',
        'sv.d.front3': 'সামনে পাবে', 'sv.d.cutLen': 'ভাগের রেখা',
        'sv.p.info': 'নকশার তথ্য (প্রিন্টে যাবে)', 'sv.i.title': 'শিরোনাম', 'sv.i.titlePh': 'যেমন: মরহুম আব্দুল করিমের জমির বণ্টন নকশা',
        'sv.i.mouza': 'মৌজা', 'sv.i.jl': 'জে.এল. নং', 'sv.i.khatian': 'খতিয়ান নং', 'sv.i.dag': 'দাগ নং', 'sv.i.upazila': 'উপজেলা', 'sv.i.district': 'জেলা',
        'sv.i.by': 'প্রস্তুতকারী (সার্ভেয়ার)',
        'sv.p.export': 'ডাউনলোড ও সংরক্ষণ', 'sv.x.png': 'নকশা ডাউনলোড (PNG)', 'sv.x.print': 'প্রিন্ট করুন', 'sv.x.withImg': 'পেছনে মৌজা নকশা রাখুন',
        'sv.x.only': 'শুধু বাছাই করা দাগ', 'sv.x.save': 'প্রজেক্ট ফাইল সেভ', 'sv.x.open': 'প্রজেক্ট ফাইল খুলুন', 'sv.x.new': 'নতুন করে শুরু',
        'sv.x.newQ': 'সব দাগ, বণ্টন ও নকশা মুছে নতুন করে শুরু করবেন?', 'sv.x.bad': 'ফাইলটি সঠিক নয়', 'sv.x.opened': 'প্রজেক্ট খোলা হয়েছে',
        'sv.x.auto': 'সব কাজ এই ডিভাইসে নিজে থেকেই সেভ থাকে।', 'sv.x.empty': 'আগে অন্তত একটি দাগ আঁকুন',
        'sv.e.plan': 'জমির নকশা', 'sv.e.divTitle': 'বণ্টন নকশা', 'sv.e.share': 'শরিকের নাম', 'sv.e.no': 'ক্রম', 'sv.e.total': 'মোট',
        'sv.e.date': 'তারিখ', 'sv.e.scale': 'স্কেল', 'sv.e.sign': 'স্বাক্ষর', 'sv.e.by': 'প্রস্তুতকারী', 'sv.e.plot': 'দাগ', 'sv.e.owner': 'মালিক / নোট',
        'sv.e.pscale': 'স্কেল: A4 কাগজে প্রিন্ট করলে ১ ইঞ্চি = {v}',
        'sv.e.note': 'Construction Solution দিয়ে তৈরি। দলিল বা মামলার আগে লাইসেন্সধারী সার্ভেয়ার দিয়ে মাঠে যাচাই করে নিন।', 'sv.e.n': 'উ',
        'sv.m.title': 'দূরত্ব মাপ', 'sv.m.clear': 'সব দূরত্ব মুছুন',
        'sv.u.dec': 'শতাংশ (শতক)', 'sv.u.ojut': 'অযুতাংশ', 'sv.u.katha': 'কাঠা', 'sv.u.chhatak': 'ছটাক', 'sv.u.bigha': 'বিঘা', 'sv.u.acre': 'একর',
        'sv.u.hect': 'হেক্টর', 'sv.u.sft': 'বর্গফুট', 'sv.u.sqm': 'বর্গমিটার', 'sv.u.sqhat': 'বর্গহাত', 'sv.u.kani': 'কানি (চট্টগ্রাম)', 'sv.u.ganda': 'গণ্ডা',
        'sv.us.dec': 'শতাংশ', 'sv.us.katha': 'কাঠা', 'sv.us.sft': 'বর্গফুট', 'sv.us.sqm': 'ব.মি.', 'sv.us.acre': 'একর', 'sv.us.bigha': 'বিঘা',
        'sv.l.ftin': 'ফুট-ইঞ্চি', 'sv.l.ft': 'ফুট', 'sv.l.in': 'ইঞ্চি', 'sv.l.m': 'মিটার', 'sv.l.cm': 'সেন্টিমিটার', 'sv.l.hat': 'হাত', 'sv.l.yd': 'গজ',
        'sv.l.link': 'লিংক', 'sv.l.chain': 'চেইন', 'sv.l.chainlink': 'চেইন-লিংক', 'sv.ls.ft': 'ফুট', 'sv.ls.m': 'মি', 'sv.ls.hat': 'হাত', 'sv.ls.ch': 'চে', 'sv.ls.li': 'লি',
        'sv.f.shape': 'জমির আকৃতি', 'sv.f.rect': 'আয়তাকার', 'sv.f.quad': 'চার বাহু (অসমান)', 'sv.f.tri': 'ত্রিভুজ', 'sv.f.multi': 'যেকোনো আকৃতি (ত্রিভুজে ভাগ)',
        'sv.f.unit': 'মাপের একক', 'sv.f.len': 'দৈর্ঘ্য', 'sv.f.wid': 'প্রস্থ', 'sv.f.n': 'উত্তর বাহু', 'sv.f.e': 'পূর্ব বাহু', 'sv.f.s': 'দক্ষিণ বাহু', 'sv.f.w': 'পশ্চিম বাহু',
        'sv.f.diag': 'কর্ণ: উত্তর-পশ্চিম কোণ থেকে দক্ষিণ-পূর্ব কোণ', 'sv.f.opt': '(ঐচ্ছিক — দিলে নির্ভুল)',
        'sv.f.a': 'বাহু ১', 'sv.f.b': 'বাহু ২', 'sv.f.c': 'বাহু ৩', 'sv.f.triN': 'ত্রিভুজ {n}', 'sv.f.addTri': 'ত্রিভুজ যোগ করুন',
        'sv.f.toMap': 'নকশায় দাগ হিসেবে যোগ করুন', 'sv.f.toDiv': 'এই জমি বণ্টন করুন',
        'sv.f.approx': 'কর্ণ ছাড়া "গড় পদ্ধতিতে" আনুমানিক হিসাব — জমি একদম আয়তাকার না হলে পরিমাণ কিছুটা বেশি আসে। নির্ভুল হিসাবের জন্য একটি কর্ণ মেপে দিন।',
        'sv.f.exactQ': 'কর্ণ দিয়ে নির্ভুল হিসাব (দুই ত্রিভুজ পদ্ধতি)', 'sv.f.bad': 'এই তিন মাপে ত্রিভুজ হয় না — বাহুগুলো আবার দেখুন',
        'sv.f.badQ': 'এই কর্ণ দিয়ে চার বাহু মেলানো যায় না — মাপ আবার দেখুন',
        'sv.f.tipMulti': 'বাঁকা বা অসমান জমিকে কয়েকটি ত্রিভুজে ভাগ করে প্রতিটির তিন বাহু মাপুন — সার্ভেয়াররা মাঠে এভাবেই মাপেন। সব ত্রিভুজের যোগফলই জমির পরিমাণ।',
        'sv.f.result': 'জমির পরিমাণ', 'sv.f.empty': 'বাহুর মাপ দিন — সাথে সাথে পরিমাণ দেখাবে', 'sv.f.added': 'নকশায় দাগ যোগ হয়েছে',
        'sv.f.mixA': '{b} বিঘা {k} কাঠা {c} ছটাক', 'sv.f.mixB': '{a} একর {d} শতাংশ', 'sv.f.noDraw': 'এই আকৃতি নকশায় আঁকা যায় না',
        'sv.c.title': 'জমির একক রূপান্তর', 'sv.c.val': 'পরিমাণ', 'sv.c.from': 'একক', 'sv.c.area': 'ক্ষেত্রফল', 'sv.c.length': 'দৈর্ঘ্য',
        'sv.c.note': 'প্রমিত মান: ১ একর = ১০০ শতাংশ = ৪৩,৫৬০ বর্গফুট · ১ শতাংশ = ৪৩৫.৬ বর্গফুট · ১ কাঠা = ৭২০ বর্গফুট · ১ বিঘা = ২০ কাঠা = ৩৩ শতাংশ · ১ গান্টার চেইন = ৬৬ ফুট = ১০০ লিংক · ১ হাত = ১.৫ ফুট। কানি, গণ্ডা অঞ্চলভেদে আলাদা হতে পারে (এখানে চট্টগ্রামের হিসাব: ১ কানি = ৪০ শতক, ১ গণ্ডা = ২ শতক)।',
        'sv.need3': 'দাগে কমপক্ষে ৩টি কোণ লাগবে', 'sv.added': 'দাগ যোগ হয়েছে: {a}', 'sv.sel': 'বাছাই করা দাগ',
    };
    const EN = {
        'sv.title': 'Land Survey — measure, mouza map & division',
        'sv.sub': 'Upload a mouza map and set its scale, trace plots for exact areas, divide land between sharers and download the division map. You can also get the area from sides measured on the land.',
        'sv.tab.map': 'Map, measure & divide', 'sv.tab.field': 'Field sides', 'sv.tab.conv': 'Unit converter',
        'sv.s1': 'Upload map', 'sv.s1d': 'Image or PDF', 'sv.s2': 'Set scale', 'sv.s2d': 'Known distance or 16" = 1 mile',
        'sv.s3': 'Trace plots', 'sv.s3d': 'Click the corners', 'sv.s4': 'Divide & download', 'sv.s4d': 'Split by shares',
        'sv.t.select': 'Select', 'sv.t.pan': 'Pan', 'sv.t.draw': 'Draw plot', 'sv.t.measure': 'Distance', 'sv.t.calib': 'Scale',
        'sv.upload': 'Map', 'sv.undo': 'Undo', 'sv.redo': 'Redo', 'sv.fit': 'Fit all', 'sv.full': 'Full screen',
        'sv.finish': 'Finish', 'sv.back': 'Remove last point', 'sv.cancel': 'Cancel',
        'sv.h.select': 'Tap a plot to select · drag corners to adjust · drag division lines · drag empty space to pan',
        'sv.h.pan': 'Drag to pan · wheel / two fingers to zoom',
        'sv.h.draw': 'Click / tap each corner of the land · back on the first point or "Finish" closes the plot',
        'sv.h.measure': 'Click two points to measure a distance',
        'sv.h.calib': 'Click two points on the map whose real distance you know (the scale bar or a side measured on site)',
        'sv.p.map': 'Mouza map', 'sv.noImg': 'No map yet — draw straight in feet on the blank sheet, or add a mouza map image / PDF.',
        'sv.choose': 'Choose image / PDF', 'sv.replace': 'Change map', 'sv.removeImg': 'Remove map', 'sv.alpha': 'Map strength',
        'sv.pdfPage': 'PDF page', 'sv.loading': 'Opening the map…', 'sv.pdfFail': 'Could not open the PDF — try it as an image (JPG/PNG)',
        'sv.imgFail': 'Could not open the file', 'sv.bigImg': 'The image was very large, it was shrunk keeping the scale',
        'sv.p.scale': 'Scale', 'sv.sc.none': 'Drawing without a map: 1 unit = 1 ft (no scale needed)',
        'sv.sc.now': '1 inch on the map = {v}', 'sv.sc.px': '1 pixel = {v}',
        'sv.sc.warn': 'Scale is a guess — check it with a known distance', 'sv.sc.ok': 'Scale set from a known distance',
        'sv.sc.m1': 'From a known distance (most accurate)', 'sv.sc.pick': 'Pick two points on the map',
        'sv.sc.picked': 'Two points picked', 'sv.sc.dist': 'Real distance between them', 'sv.sc.apply': 'Set scale',
        'sv.sc.m2': 'From the printed map scale', 'sv.sc.ratio': 'Map scale', 'sv.sc.dpi': 'Scan DPI', 'sv.sc.dpiAuto': 'read from the file',
        'sv.sc.r16': '16" = 1 mile (RS/BS/SA mouza)', 'sv.sc.r32': '32" = 1 mile', 'sv.sc.r64': '64" = 1 mile', 'sv.sc.r8': '8" = 1 mile',
        'sv.sc.custom': 'Other (1 : N)', 'sv.sc.N': 'N (1 : N)', 'sv.sc.done': 'Scale set', 'sv.sc.need2': 'Pick two points on the map first',
        'sv.sc.help': 'Most Bangladeshi mouza maps are 16 inches = 1 mile (1 inch = 330 ft). A scanned image may not keep the paper size, so matching a known distance is the most accurate.',
        'sv.p.plots': 'Plots', 'sv.noPlots': 'No plots yet — use "Draw plot" above to trace the land boundary.',
        'sv.total': 'All plots', 'sv.plotN': 'Plot {n}', 'sv.f.name': 'Plot no. / name', 'sv.f.owner': 'Owner / note',
        'sv.area': 'Area', 'sv.sides': 'Side lengths', 'sv.side': 'Side {n}', 'sv.del': 'Delete plot', 'sv.delV': 'Delete selected corner',
        'sv.divide': 'Divide this plot', 'sv.allUnits': 'In every unit', 'sv.lenUnit': 'Show lengths in', 'sv.areaUnit': 'Show area in',
        'sv.vHint': 'Double-click a side to add a corner',
        'sv.p.div': 'Division', 'sv.d.how': 'How to divide', 'sv.d.front': 'Everyone gets frontage', 'sv.d.depth': 'Front to back strips',
        'sv.d.edge': 'Front side (road side)', 'sv.d.mode': 'Shares', 'sv.d.eq': 'Equal', 'sv.d.ratio': 'By ratio', 'sv.d.area': 'In decimals',
        'sv.d.share': 'Sharer {n}', 'sv.d.name': 'Name', 'sv.d.val': 'Share', 'sv.d.valArea': 'Decimal', 'sv.d.add': 'Add sharer',
        'sv.d.run': 'Divide', 'sv.d.exact': 'Make exact again', 'sv.d.clear': 'Remove division', 'sv.d.rest': 'Remaining',
        'sv.d.over': 'The shares add up to more than the plot', 'sv.d.drag': 'Drag a division line on the map — areas update as you move it.',
        'sv.d.moved': 'Lines moved by hand — areas may differ from the targets', 'sv.d.target': 'Target', 'sv.d.got': 'Gets',
        'sv.d.hint': 'Example: son 2, daughter 1 — choose "By ratio" and enter 2 and 1', 'sv.d.need': 'Select a plot first', 'sv.d.done': 'Divided',
        'sv.d.front2': 'Every part gets width along the road / front side', 'sv.d.depth2': 'First sharer at the front, last at the back',
        'sv.d.front3': 'Frontage', 'sv.d.cutLen': 'Division line',
        'sv.p.info': 'Map details (printed)', 'sv.i.title': 'Title', 'sv.i.titlePh': 'e.g. Division map of the land of late Abdul Karim',
        'sv.i.mouza': 'Mouza', 'sv.i.jl': 'J.L. no.', 'sv.i.khatian': 'Khatian no.', 'sv.i.dag': 'Dag no.', 'sv.i.upazila': 'Upazila', 'sv.i.district': 'District',
        'sv.i.by': 'Prepared by (surveyor)',
        'sv.p.export': 'Download & save', 'sv.x.png': 'Download map (PNG)', 'sv.x.print': 'Print', 'sv.x.withImg': 'Keep the mouza map behind',
        'sv.x.only': 'Only the selected plot', 'sv.x.save': 'Save project file', 'sv.x.open': 'Open project file', 'sv.x.new': 'Start over',
        'sv.x.newQ': 'Delete every plot, division and the map and start over?', 'sv.x.bad': 'That file is not valid', 'sv.x.opened': 'Project opened',
        'sv.x.auto': 'Everything is saved on this device automatically.', 'sv.x.empty': 'Draw at least one plot first',
        'sv.e.plan': 'Land map', 'sv.e.divTitle': 'Division map', 'sv.e.share': 'Sharer', 'sv.e.no': 'No.', 'sv.e.total': 'Total',
        'sv.e.date': 'Date', 'sv.e.scale': 'Scale', 'sv.e.sign': 'Signature', 'sv.e.by': 'Prepared by', 'sv.e.plot': 'Plot', 'sv.e.owner': 'Owner / note',
        'sv.e.pscale': 'Scale: printed on A4, 1 inch = {v}',
        'sv.e.note': 'Made with Construction Solution. Have a licensed surveyor check it on site before any deed or case.', 'sv.e.n': 'N',
        'sv.m.title': 'Distances', 'sv.m.clear': 'Clear distances',
        'sv.u.dec': 'Decimal (shotok)', 'sv.u.ojut': 'Ojutangsho', 'sv.u.katha': 'Katha', 'sv.u.chhatak': 'Chhatak', 'sv.u.bigha': 'Bigha', 'sv.u.acre': 'Acre',
        'sv.u.hect': 'Hectare', 'sv.u.sft': 'Sq ft', 'sv.u.sqm': 'Sq m', 'sv.u.sqhat': 'Sq hat', 'sv.u.kani': 'Kani (Chattogram)', 'sv.u.ganda': 'Gonda',
        'sv.us.dec': 'dec', 'sv.us.katha': 'katha', 'sv.us.sft': 'sft', 'sv.us.sqm': 'm²', 'sv.us.acre': 'acre', 'sv.us.bigha': 'bigha',
        'sv.l.ftin': 'Feet-inches', 'sv.l.ft': 'Feet', 'sv.l.in': 'Inches', 'sv.l.m': 'Metres', 'sv.l.cm': 'Centimetres', 'sv.l.hat': 'Hat (cubit)', 'sv.l.yd': 'Yards',
        'sv.l.link': 'Links', 'sv.l.chain': 'Chains', 'sv.l.chainlink': 'Chain-links', 'sv.ls.ft': 'ft', 'sv.ls.m': 'm', 'sv.ls.hat': 'hat', 'sv.ls.ch': 'ch', 'sv.ls.li': 'li',
        'sv.f.shape': 'Shape of the land', 'sv.f.rect': 'Rectangle', 'sv.f.quad': '4 sides (unequal)', 'sv.f.tri': 'Triangle', 'sv.f.multi': 'Any shape (triangles)',
        'sv.f.unit': 'Measured in', 'sv.f.len': 'Length', 'sv.f.wid': 'Width', 'sv.f.n': 'North side', 'sv.f.e': 'East side', 'sv.f.s': 'South side', 'sv.f.w': 'West side',
        'sv.f.diag': 'Diagonal: north-west corner to south-east corner', 'sv.f.opt': '(optional — makes it exact)',
        'sv.f.a': 'Side 1', 'sv.f.b': 'Side 2', 'sv.f.c': 'Side 3', 'sv.f.triN': 'Triangle {n}', 'sv.f.addTri': 'Add triangle',
        'sv.f.toMap': 'Add to the map as a plot', 'sv.f.toDiv': 'Divide this land',
        'sv.f.approx': 'Without a diagonal this is the "average method" estimate — slightly high unless the land is a true rectangle. Measure one diagonal for the exact area.',
        'sv.f.exactQ': 'Exact, from the diagonal (two-triangle method)', 'sv.f.bad': 'These three sides cannot make a triangle — check them',
        'sv.f.badQ': 'The four sides do not fit with this diagonal — check the measurements',
        'sv.f.tipMulti': 'Split irregular land into triangles and measure the three sides of each — the way surveyors measure in the field. The triangles add up to the land.',
        'sv.f.result': 'Land area', 'sv.f.empty': 'Enter the sides — the area shows right away', 'sv.f.added': 'Added to the map',
        'sv.f.mixA': '{b} bigha {k} katha {c} chhatak', 'sv.f.mixB': '{a} acre {d} decimal', 'sv.f.noDraw': 'This shape cannot be drawn',
        'sv.c.title': 'Land unit converter', 'sv.c.val': 'Amount', 'sv.c.from': 'Unit', 'sv.c.area': 'Area', 'sv.c.length': 'Length',
        'sv.c.note': 'Standard values: 1 acre = 100 decimal = 43,560 sft · 1 decimal = 435.6 sft · 1 katha = 720 sft · 1 bigha = 20 katha = 33 decimal · 1 Gunter chain = 66 ft = 100 links · 1 hat = 1.5 ft. Kani and gonda vary by region (Chattogram values used: 1 kani = 40 decimal, 1 gonda = 2 decimal).',
        'sv.need3': 'A plot needs at least 3 corners', 'sv.added': 'Plot added: {a}', 'sv.sel': 'Selected plot',
    };
    Object.assign(I18N.bn, BN);
    Object.assign(I18N.en, EN);

    /* =========================================================
       Units
       ========================================================= */
    const AREA_U = {                      // square feet in one unit
        dec: 435.6, katha: 720, bigha: 14400, acre: 43560, sft: 1, sqm: 10.7639104, ojut: 4.356,
        chhatak: 45, hect: 107639.104, sqhat: 2.25, kani: 17424, ganda: 871.2,
    };
    const AREA_ORDER = ['dec', 'katha', 'bigha', 'acre', 'sft', 'sqm', 'ojut', 'chhatak', 'hect', 'sqhat', 'kani', 'ganda'];
    const LEN_U = { ft: 1, in: 1 / 12, m: 3.280839895, cm: 0.03280839895, hat: 1.5, yd: 3, link: 0.66, chain: 66 };
    const LEN_ORDER = ['ft', 'in', 'm', 'cm', 'hat', 'yd', 'link', 'chain'];
    const MILE_IN = 63360;                // inches in a mile

    const pnum = (v) => { const x = parseNum(v); return Number.isFinite(x) ? x : NaN; };
    const fmtArea = (sft, u) => `${num(sft / AREA_U[u])} ${t('sv.us.' + u) !== 'sv.us.' + u ? t('sv.us.' + u) : t('sv.u.' + u)}`;
    function fmtLen(ft, mode) {
        const m = mode || D.opt.len;
        if (!Number.isFinite(ft)) return '';
        if (m === 'ftin') {
            let f = Math.floor(ft + 1e-9), i = Math.round((ft - f) * 12 * 2) / 2;
            if (i >= 12) { f += 1; i = 0; }
            return digits(`${f}'-${i}"`);
        }
        if (m === 'm') return `${num(ft / LEN_U.m)} ${t('sv.ls.m')}`;
        if (m === 'hat') return `${num(ft / 1.5)} ${t('sv.ls.hat')}`;
        if (m === 'link') {
            const L = ft / 0.66, c = Math.floor(L / 100 + 1e-9), l = L - c * 100;
            return c ? `${digits(c)} ${t('sv.ls.ch')} ${num(l, 1)} ${t('sv.ls.li')}` : `${num(l, 1)} ${t('sv.ls.li')}`;
        }
        return `${num(ft)} ${t('sv.ls.ft')}`;
    }
    function mixed(sft) {
        const b = Math.floor(sft / 14400 + 1e-9), r = sft - b * 14400;
        const k = Math.floor(r / 720 + 1e-9), c = (r - k * 720) / 45;
        const dec = sft / 435.6, a = Math.floor(dec / 100 + 1e-9);
        return [t('sv.f.mixA', { b: digits(b), k: digits(k), c: num(c, 1) }), t('sv.f.mixB', { a: digits(a), d: num(dec - a * 100) })];
    }

    /* =========================================================
       Geometry
       ========================================================= */
    const sArea = (P) => { let s = 0; for (let i = 0, n = P.length; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
    const pArea = (P) => Math.abs(sArea(P));
    function centroid(P) {
        const A = sArea(P);
        if (Math.abs(A) < 1e-9) { const n = P.length || 1; return [P.reduce((s, p) => s + p[0], 0) / n, P.reduce((s, p) => s + p[1], 0) / n]; }
        let x = 0, y = 0;
        for (let i = 0, n = P.length; i < n; i++) { const a = P[i], b = P[(i + 1) % n], f = a[0] * b[1] - b[0] * a[1]; x += (a[0] + b[0]) * f; y += (a[1] + b[1]) * f; }
        return [x / (6 * A), y / (6 * A)];
    }
    // a point inside the polygon that is good for a label (centroid, or a nearby inside point for odd shapes)
    function labelPt(P) {
        const c = centroid(P);
        if (inPoly(c, P)) return c;
        let best = P[0], bd = -1;
        const b = bbox(P), steps = 14;
        for (let i = 1; i < steps; i++) for (let j = 1; j < steps; j++) {
            const q = [b.x0 + (b.x1 - b.x0) * i / steps, b.y0 + (b.y1 - b.y0) * j / steps];
            if (!inPoly(q, P)) continue;
            const d = Math.min(...P.map((p, k) => segDist(q, p, P[(k + 1) % P.length])));
            if (d > bd) { bd = d; best = q; }
        }
        return best;
    }
    function inPoly(p, P) {
        let ins = false;
        for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
            const a = P[i], b = P[j];
            if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) ins = !ins;
        }
        return ins;
    }
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    function segDist(p, a, b) {
        const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
        const k = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
        return Math.hypot(p[0] - a[0] - k * dx, p[1] - a[1] - k * dy);
    }
    function bbox(P) {
        const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
        P.forEach((p) => { b.x0 = Math.min(b.x0, p[0]); b.y0 = Math.min(b.y0, p[1]); b.x1 = Math.max(b.x1, p[0]); b.y1 = Math.max(b.y1, p[1]); });
        return b;
    }
    // keep the part of polygon P where p·u <= c (le) or >= c (ge)
    function clip(P, u, c, le) {
        const out = [], f = (p) => (le ? c - (p[0] * u[0] + p[1] * u[1]) : (p[0] * u[0] + p[1] * u[1]) - c);
        for (let i = 0, n = P.length; i < n; i++) {
            const a = P[i], b = P[(i + 1) % n], fa = f(a), fb = f(b);
            if (fa >= 0) out.push(a);
            if ((fa >= 0) !== (fb >= 0)) { const k = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
        }
        return out;
    }
    // the inside pieces of the line p·u = c across polygon P → [[a,b], …]
    function chord(P, u, c) {
        const v = [-u[1], u[0]], hits = [];
        for (let i = 0, n = P.length; i < n; i++) {
            const a = P[i], b = P[(i + 1) % n];
            const fa = a[0] * u[0] + a[1] * u[1] - c, fb = b[0] * u[0] + b[1] * u[1] - c;
            if ((fa > 0) !== (fb > 0)) { const k = fa / (fa - fb); hits.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
        }
        hits.sort((p, q) => (p[0] * v[0] + p[1] * v[1]) - (q[0] * v[0] + q[1] * v[1]));
        const segs = [];
        for (let i = 0; i + 1 < hits.length; i += 2) segs.push([hits[i], hits[i + 1]]);
        return segs;
    }
    const heron = (a, b, c) => { const s = (a + b + c) / 2, q = s * (s - a) * (s - b) * (s - c); return q > 0 ? Math.sqrt(q) : (q > -1e-9 ? 0 : NaN); };
    // third corner of a triangle with base A→B, sides |AC| = ac, |BC| = bc, on the given side (+1 / -1)
    function apex(A, B, ac, bc, side) {
        const d = dist(A, B);
        const x = (ac * ac - bc * bc + d * d) / (2 * d), h2 = ac * ac - x * x;
        if (h2 < -1e-6) return null;
        const h = Math.sqrt(Math.max(h2, 0)), ux = (B[0] - A[0]) / d, uy = (B[1] - A[1]) / d;
        return [A[0] + ux * x - uy * h * side, A[1] + uy * x + ux * h * side];
    }

    /* =========================================================
       Styles
       ========================================================= */
    const css = `
    .new-badge { background: linear-gradient(135deg, #10b981, #0d9488); color: #fff !important; border-color: transparent !important; }
    .side-badge.new-badge { font-size: .6rem; padding: .1rem .45rem; border-radius: 999px; margin-left: auto; font-weight: 700; }
    .sv-steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .6rem; margin-bottom: var(--gap); }
    .sv-step { display: flex; align-items: center; gap: .65rem; padding: .7rem .85rem; border-radius: var(--radius-sm); }
    .sv-step b { flex: none; width: 2rem; height: 2rem; border-radius: .65rem; display: grid; place-items: center; background: var(--brand-grad); color: var(--on-brand); font-size: .9rem; box-shadow: var(--brand-shadow); }
    .sv-step strong { display: block; font-size: .875rem; line-height: 1.3; }
    .sv-step small { display: block; color: var(--muted); font-size: .72rem; line-height: 1.3; }
    .sv-tabs { display: flex; gap: .4rem; margin-bottom: var(--gap); overflow-x: auto; scrollbar-width: none; padding: .3rem; border-radius: var(--radius-sm); }
    .sv-tabs::-webkit-scrollbar { display: none; }
    .sv-tabs button { flex: 1 0 auto; display: inline-flex; align-items: center; justify-content: center; gap: .5rem; min-height: 2.9rem; padding: .5rem 1rem; border: 0; border-radius: .7rem; background: transparent; color: var(--muted); font: inherit; font-weight: 600; font-size: .9rem; cursor: pointer; white-space: nowrap; }
    .sv-tabs button[aria-selected="true"] { background: var(--brand-grad); color: var(--on-brand); box-shadow: var(--brand-shadow); }
    .sv-pane[hidden] { display: none !important; }
    .sv-work { overflow: hidden; }
    .sv-work.full { position: fixed; inset: 0; z-index: 90; border-radius: 0; display: flex; flex-direction: column; background: var(--bg); }
    .sv-work.full .sv-main { flex: 1; min-height: 0; }
    .sv-work.full .sv-left { min-height: 0; }
    .sv-work.full .sv-stage { height: auto; min-height: 0; flex: 1; }
    .sv-work.full .sv-side { max-height: none; }
    .sv-main { display: grid; grid-template-columns: minmax(0, 1fr) 21rem; min-height: 38rem; }
    .sv-left { display: flex; flex-direction: column; min-width: 0; border-right: 1px solid var(--line); }
    .sv-hint { display: flex; align-items: center; gap: .5rem; padding: .45rem .8rem; font-size: .78rem; color: var(--muted); border-bottom: 1px solid var(--line); min-height: 2.2rem; }
    .sv-hint i { color: var(--brand-ink); }
    .sv-stage { position: relative; height: 38rem; touch-action: none; overflow: hidden; background: var(--field); cursor: crosshair; }
    .sv-stage[data-tool="select"], .sv-stage[data-tool="pan"] { cursor: grab; }
    .sv-stage canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .sv-float { position: absolute; left: 50%; bottom: .8rem; transform: translateX(-50%); display: flex; gap: .4rem; z-index: 2; flex-wrap: wrap; justify-content: center; }
    .sv-float[hidden] { display: none; }
    .sv-float .btn { min-height: 2.5rem; box-shadow: var(--shadow); }
    .sv-live { position: absolute; left: .7rem; top: .7rem; z-index: 2; padding: .35rem .65rem; border-radius: .6rem; font-size: .78rem; font-weight: 600; background: var(--glass-strong); border: 1px solid var(--line-2); pointer-events: none; }
    .sv-live:empty { display: none; }
    .sv-zoom { position: absolute; right: .7rem; bottom: .8rem; z-index: 2; display: flex; flex-direction: column; gap: .3rem; }
    .sv-side { padding: 1rem; overflow-y: auto; max-height: 41rem; background: var(--glass); }
    .sv-sec + .sv-sec { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--line); }
    .sv-sec h3 { margin: 0 0 .7rem; font-size: .95rem; display: flex; align-items: center; gap: .5rem; }
    .sv-sec h3 i { color: var(--brand-ink); }
    .sv-sec h4 { margin: .8rem 0 .4rem; font-size: .82rem; color: var(--ink-2); }
    .sv-sec .field + .field, .sv-sec .sv-row + .field, .sv-sec .field + .sv-row { margin-top: .6rem; }
    .sv-sec .field > label { font-size: .8rem; }
    .sv-sec .control, .sv-sec .input-wrap input { min-height: 2.5rem; height: 2.5rem; font-size: .9rem; }
    .sv-sec .input-wrap { min-height: 2.5rem; }
    .sv-sec .segmented { min-height: 2.5rem; }
    .sv-sec .segmented label > span { font-size: .78rem; }
    .sv-sec .btn { min-height: 2.5rem; }
    .sv-btns { display: grid; grid-template-columns: 1fr 1fr; gap: .45rem; margin-top: .6rem; }
    .sv-btns .full { grid-column: 1 / -1; }
    .sv-row { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
    .sv-note { font-size: .76rem; color: var(--muted); line-height: 1.5; margin: .5rem 0 0; }
    .sv-chip { display: inline-flex; align-items: center; gap: .35rem; padding: .3rem .6rem; border-radius: .6rem; font-size: .76rem; font-weight: 600; line-height: 1.35; }
    .sv-chip.warn { background: rgba(245, 158, 11, .14); color: #b45309; }
    .sv-chip.ok { background: var(--brand-50); color: var(--brand-ink); }
    html[data-theme="dark"] .sv-chip.warn { color: #fbbf24; }
    .sv-scale-now { font-weight: 700; font-size: .9rem; margin: .4rem 0; }
    .sv-plot { display: flex; align-items: center; gap: .6rem; width: 100%; padding: .55rem .65rem; border: 1px solid var(--line); border-radius: .7rem; background: var(--field); color: var(--ink); font: inherit; text-align: left; cursor: pointer; }
    .sv-plot + .sv-plot { margin-top: .4rem; }
    .sv-plot[aria-current="true"] { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-50); }
    .sv-plot .dot { flex: none; width: .9rem; height: .9rem; border-radius: .3rem; }
    .sv-plot span { flex: 1; min-width: 0; font-size: .85rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sv-plot small { flex: none; font-size: .78rem; color: var(--muted); font-weight: 600; }
    .sv-total { display: flex; justify-content: space-between; gap: .5rem; margin-top: .55rem; font-size: .82rem; font-weight: 700; padding: .45rem .65rem; border-radius: .6rem; background: var(--brand-50); color: var(--brand-ink); }
    .sv-big { font-size: 1.35rem; font-weight: 800; color: var(--brand-ink); line-height: 1.25; }
    .sv-units { display: grid; grid-template-columns: 1fr 1fr; gap: .35rem; margin-top: .5rem; }
    .sv-units div { padding: .4rem .55rem; border-radius: .55rem; background: var(--field); border: 1px solid var(--line); }
    .sv-units small { display: block; font-size: .68rem; color: var(--muted); }
    .sv-units b { font-size: .85rem; }
    .sv-mixed { margin-top: .45rem; font-size: .8rem; color: var(--ink-2); line-height: 1.6; }
    .sv-sides { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: .25rem .6rem; font-size: .8rem; }
    .sv-sides li { display: flex; justify-content: space-between; gap: .4rem; border-bottom: 1px dashed var(--line); padding: .2rem 0; }
    .sv-sides span { color: var(--muted); }
    .sv-share { display: grid; grid-template-columns: .8rem minmax(0, 1fr) 5.2rem 2.2rem; gap: .35rem; align-items: center; }
    .sv-share + .sv-share { margin-top: .35rem; }
    .sv-share .dot { width: .8rem; height: .8rem; border-radius: .25rem; }
    .sv-share input { width: 100%; min-height: 2.4rem; padding: .4rem .55rem; border: 1px solid var(--line-2); border-radius: .55rem; background: var(--field); color: var(--ink); font: inherit; font-size: .85rem; }
    .sv-share input:disabled { opacity: .45; }
    .sv-share button { width: 2.2rem; height: 2.4rem; border: 1px solid var(--line-2); border-radius: .55rem; background: transparent; color: var(--muted); cursor: pointer; }
    .sv-share button:hover { color: var(--err); border-color: rgba(229, 72, 77, .35); }
    .sv-parts { width: 100%; border-collapse: collapse; margin-top: .6rem; font-size: .78rem; }
    .sv-parts th, .sv-parts td { padding: .35rem .3rem; border-bottom: 1px solid var(--line); text-align: right; }
    .sv-parts th:first-child, .sv-parts td:first-child { text-align: left; }
    .sv-parts th { color: var(--muted); font-weight: 600; font-size: .7rem; }
    .sv-parts .dot { display: inline-block; width: .65rem; height: .65rem; border-radius: .2rem; margin-right: .3rem; vertical-align: middle; }
    .sv-parts tfoot td { font-weight: 700; }
    .sv-parts .off { color: #b45309; }
    .sv-err { color: var(--err); font-size: .8rem; margin-top: .5rem; }
    .sv-check { display: flex; align-items: center; gap: .5rem; font-size: .82rem; margin-top: .55rem; cursor: pointer; }
    .sv-check input { width: 1.05rem; height: 1.05rem; accent-color: var(--brand); }
    .sv-range { width: 100%; accent-color: var(--brand); }
    /* field tab */
    .sv-grid2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--gap); align-items: start; }
    .sv-tri { border: 1px dashed var(--line-2); border-radius: .8rem; padding: .7rem; }
    .sv-tri + .sv-tri { margin-top: .6rem; }
    .sv-tri-head { display: flex; justify-content: space-between; align-items: center; font-size: .82rem; font-weight: 700; margin-bottom: .45rem; }
    .sv-tri-head small { color: var(--brand-ink); }
    .sv-fields3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
    .sv-fields2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
    .sv-svg { width: 100%; height: 15rem; display: block; border-radius: .8rem; background: var(--field); border: 1px solid var(--line); margin-bottom: 1rem; }
    .sv-svg text { font-family: 'Noto Sans Bengali', Poppins, system-ui, sans-serif; }
    .sv-res-empty { color: var(--muted); text-align: center; padding: 2.5rem 1rem; }
    .sv-res-empty i { font-size: 2rem; color: var(--brand-100); display: block; margin-bottom: .6rem; }
    .sv-warnbox { margin-top: .8rem; padding: .65rem .8rem; border-radius: .7rem; background: rgba(245, 158, 11, .12); color: var(--ink-2); font-size: .8rem; line-height: 1.5; }
    .sv-okbox { margin-top: .8rem; padding: .65rem .8rem; border-radius: .7rem; background: var(--brand-50); color: var(--ink-2); font-size: .8rem; line-height: 1.5; }
    .sv-conv-table { width: 100%; border-collapse: collapse; }
    .sv-conv-table td { padding: .55rem .4rem; border-bottom: 1px solid var(--line); font-size: .9rem; }
    .sv-conv-table td:last-child { text-align: right; font-weight: 700; }
    .sv-conv-table tr.on td { color: var(--brand-ink); }
    @media (max-width: 1100px) {
        .sv-main { grid-template-columns: minmax(0, 1fr); }
        .sv-left { border-right: 0; }
        .sv-side { max-height: none; border-top: 1px solid var(--line); }
        .sv-grid2 { grid-template-columns: minmax(0, 1fr); }
        .sv-work.full .sv-main { display: flex; flex-direction: column; }
        .sv-work.full .sv-left { flex: 1; }
        .sv-work.full .sv-side { flex: none; max-height: 34vh; }
    }
    @media (max-width: 700px) {
        .sv-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .sv-stage { height: 62vh; min-height: 22rem; }
        .sv-tabs button { flex: 1 0 auto; padding: .5rem .75rem; font-size: .82rem; }
        .sv-fields3 { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35rem; }
        .sv-fields2 { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: .5rem; }
        .sv-hint { font-size: .72rem; }
    }
    @media print { .sv-work.full { position: static; } }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    /* =========================================================
       Markup
       ========================================================= */
    const icon = (c) => `<i class="fa-solid ${c}"></i>`;
    const lenOptions = (sel) => LEN_ORDER.map((u) => `<option value="${u}"${u === sel ? ' selected' : ''} data-i18n="sv.l.${u}"></option>`).join('');
    const areaOptions = (sel) => AREA_ORDER.map((u) => `<option value="${u}"${u === sel ? ' selected' : ''} data-i18n="sv.u.${u}"></option>`).join('');
    const fld = (id, key, extra = '', unit = '') => `
        <div class="field">
            <label for="${id}"><span data-i18n="${key}"></span>${extra}</label>
            <div class="input-wrap${unit ? '' : ' plain'}"><input type="text" inputmode="decimal" autocomplete="off" id="${id}" data-ph="0">${unit}</div>
        </div>`;

    ROOT.innerHTML = `
    <div class="sv-steps">
        ${[1, 2, 3, 4].map((n) => `<div class="sv-step glass"><b data-dg="${n}"></b><div><strong data-i18n="sv.s${n}"></strong><small data-i18n="sv.s${n}d"></small></div></div>`).join('')}
    </div>
    <div class="sv-tabs glass" role="tablist">
        <button type="button" role="tab" data-svtab="map" aria-selected="true">${icon('fa-map-location-dot')}<span data-i18n="sv.tab.map"></span></button>
        <button type="button" role="tab" data-svtab="field" aria-selected="false">${icon('fa-ruler-combined')}<span data-i18n="sv.tab.field"></span></button>
        <button type="button" role="tab" data-svtab="conv" aria-selected="false">${icon('fa-right-left')}<span data-i18n="sv.tab.conv"></span></button>
    </div>

    <!-- ===== map, measure & divide ===== -->
    <div class="sv-pane" data-svpane="map">
        <div class="card sv-work" id="sv-work">
            <div class="plan-bar">
                <div class="plan-tools" role="toolbar">
                    <button type="button" class="pt" data-svtool="select">${icon('fa-arrow-pointer')}<span data-i18n="sv.t.select"></span></button>
                    <button type="button" class="pt" data-svtool="pan">${icon('fa-hand')}<span data-i18n="sv.t.pan"></span></button>
                    <span class="pt-sep"></span>
                    <button type="button" class="pt" data-svtool="draw">${icon('fa-draw-polygon')}<span data-i18n="sv.t.draw"></span></button>
                    <button type="button" class="pt" data-svtool="measure">${icon('fa-ruler')}<span data-i18n="sv.t.measure"></span></button>
                    <button type="button" class="pt" data-svtool="calib">${icon('fa-ruler-combined')}<span data-i18n="sv.t.calib"></span></button>
                    <span class="pt-sep"></span>
                    <button type="button" class="pt" id="sv-up">${icon('fa-file-arrow-up')}<span data-i18n="sv.upload"></span></button>
                </div>
                <div class="plan-actions">
                    <button type="button" class="icon-btn icon-btn-sm" id="sv-undo" data-i18n-title="sv.undo" data-i18n-aria="sv.undo"><i class="fa-solid fa-rotate-left"></i></button>
                    <button type="button" class="icon-btn icon-btn-sm" id="sv-redo" data-i18n-title="sv.redo" data-i18n-aria="sv.redo"><i class="fa-solid fa-rotate-right"></i></button>
                    <button type="button" class="icon-btn icon-btn-sm" id="sv-fit" data-i18n-title="sv.fit" data-i18n-aria="sv.fit"><i class="fa-solid fa-expand"></i></button>
                    <button type="button" class="icon-btn icon-btn-sm" id="sv-full" aria-pressed="false" data-i18n-title="sv.full" data-i18n-aria="sv.full"><i class="fa-solid fa-maximize"></i></button>
                </div>
            </div>
            <div class="sv-main">
                <div class="sv-left">
                    <div class="sv-hint"><i class="fa-solid fa-circle-info"></i><span id="sv-hint"></span></div>
                    <div class="sv-stage" id="sv-stage">
                        <canvas id="sv-canvas"></canvas>
                        <div class="sv-live" id="sv-live"></div>
                        <div class="sv-float" id="sv-drawbar" hidden>
                            <button type="button" class="btn btn-ghost btn-sm" id="sv-back">${icon('fa-delete-left')} <span data-i18n="sv.back"></span></button>
                            <button type="button" class="btn btn-ghost btn-sm" id="sv-cancel">${icon('fa-xmark')} <span data-i18n="sv.cancel"></span></button>
                            <button type="button" class="btn btn-primary btn-sm" id="sv-finish">${icon('fa-check')} <span data-i18n="sv.finish"></span></button>
                        </div>
                        <div class="sv-zoom">
                            <button type="button" class="icon-btn icon-btn-sm" data-zoom="1.25" aria-label="+"><i class="fa-solid fa-plus"></i></button>
                            <button type="button" class="icon-btn icon-btn-sm" data-zoom="0.8" aria-label="-"><i class="fa-solid fa-minus"></i></button>
                        </div>
                    </div>
                </div>
                <aside class="sv-side" id="sv-side">
                    <section class="sv-sec" id="sv-sec-sel"></section>
                    <section class="sv-sec" id="sv-sec-div"></section>
                    <section class="sv-sec" id="sv-sec-plots"></section>
                    <section class="sv-sec" id="sv-sec-map"></section>
                    <section class="sv-sec" id="sv-sec-info">
                        <h3><i class="fa-solid fa-file-signature"></i><span data-i18n="sv.p.info"></span></h3>
                        <div class="field"><label for="sv-i-title" data-i18n="sv.i.title"></label><input class="control" id="sv-i-title" data-info="title" maxlength="120" data-i18n-ph="sv.i.titlePh" autocomplete="off"></div>
                        <div class="sv-row" style="margin-top:.6rem">
                            <div class="field"><label for="sv-i-mouza" data-i18n="sv.i.mouza"></label><input class="control" id="sv-i-mouza" data-info="mouza" maxlength="60" autocomplete="off"></div>
                            <div class="field"><label for="sv-i-jl" data-i18n="sv.i.jl"></label><input class="control" id="sv-i-jl" data-info="jl" maxlength="30" autocomplete="off"></div>
                        </div>
                        <div class="sv-row" style="margin-top:.6rem">
                            <div class="field"><label for="sv-i-khatian" data-i18n="sv.i.khatian"></label><input class="control" id="sv-i-khatian" data-info="khatian" maxlength="40" autocomplete="off"></div>
                            <div class="field"><label for="sv-i-dag" data-i18n="sv.i.dag"></label><input class="control" id="sv-i-dag" data-info="dag" maxlength="60" autocomplete="off"></div>
                        </div>
                        <div class="sv-row" style="margin-top:.6rem">
                            <div class="field"><label for="sv-i-upazila" data-i18n="sv.i.upazila"></label><input class="control" id="sv-i-upazila" data-info="upazila" maxlength="60" autocomplete="off"></div>
                            <div class="field"><label for="sv-i-district" data-i18n="sv.i.district"></label><input class="control" id="sv-i-district" data-info="district" maxlength="60" autocomplete="off"></div>
                        </div>
                        <div class="field" style="margin-top:.6rem"><label for="sv-i-by" data-i18n="sv.i.by"></label><input class="control" id="sv-i-by" data-info="by" maxlength="80" autocomplete="off"></div>
                    </section>
                    <section class="sv-sec" id="sv-sec-export">
                        <h3><i class="fa-solid fa-download"></i><span data-i18n="sv.p.export"></span></h3>
                        <div class="sv-row">
                            <div class="field"><label for="sv-len" data-i18n="sv.lenUnit"></label>
                                <select class="control" id="sv-len"><option value="ftin" data-i18n="sv.l.ftin"></option><option value="ft" data-i18n="sv.l.ft"></option><option value="m" data-i18n="sv.l.m"></option><option value="hat" data-i18n="sv.l.hat"></option><option value="link" data-i18n="sv.l.chainlink"></option></select></div>
                            <div class="field"><label for="sv-au" data-i18n="sv.areaUnit"></label>
                                <select class="control" id="sv-au"><option value="dec" data-i18n="sv.u.dec"></option><option value="katha" data-i18n="sv.u.katha"></option><option value="sft" data-i18n="sv.u.sft"></option><option value="sqm" data-i18n="sv.u.sqm"></option><option value="acre" data-i18n="sv.u.acre"></option></select></div>
                        </div>
                        <label class="sv-check"><input type="checkbox" id="sv-x-img" checked><span data-i18n="sv.x.withImg"></span></label>
                        <label class="sv-check"><input type="checkbox" id="sv-x-only"><span data-i18n="sv.x.only"></span></label>
                        <div class="sv-btns">
                            <button type="button" class="btn btn-primary btn-sm full" id="sv-png">${icon('fa-image')} <span data-i18n="sv.x.png"></span></button>
                            <button type="button" class="btn btn-soft btn-sm full" id="sv-print">${icon('fa-print')} <span data-i18n="sv.x.print"></span></button>
                            <button type="button" class="btn btn-ghost btn-sm" id="sv-save">${icon('fa-floppy-disk')} <span data-i18n="sv.x.save"></span></button>
                            <button type="button" class="btn btn-ghost btn-sm" id="sv-open">${icon('fa-folder-open')} <span data-i18n="sv.x.open"></span></button>
                            <button type="button" class="btn btn-danger btn-sm full" id="sv-new">${icon('fa-file-circle-plus')} <span data-i18n="sv.x.new"></span></button>
                        </div>
                        <p class="sv-note" data-i18n="sv.x.auto"></p>
                    </section>
                </aside>
            </div>
            <input type="file" id="sv-file" accept="image/*,application/pdf,.pdf" hidden>
            <input type="file" id="sv-proj" accept=".json,application/json" hidden>
        </div>
    </div>

    <!-- ===== field sides → area ===== -->
    <div class="sv-pane" data-svpane="field" hidden>
        <div class="sv-grid2">
            <div class="card">
                <div class="card-head"><h2><i class="fa-solid fa-ruler-combined"></i> <span data-i18n="sv.tab.field"></span></h2></div>
                <div class="card-body" id="sv-field">
                    <div class="field"><span class="field-label" data-i18n="sv.f.shape"></span>
                        <div class="segmented" role="radiogroup" style="flex-wrap:wrap">
                            <label><input type="radio" name="svShape" value="rect" checked><span data-i18n="sv.f.rect"></span></label>
                            <label><input type="radio" name="svShape" value="quad"><span data-i18n="sv.f.quad"></span></label>
                            <label><input type="radio" name="svShape" value="tri"><span data-i18n="sv.f.tri"></span></label>
                            <label><input type="radio" name="svShape" value="multi"><span data-i18n="sv.f.multi"></span></label>
                        </div>
                    </div>
                    <div class="field" style="margin-top:1rem"><label for="sv-f-unit" data-i18n="sv.f.unit"></label>
                        <select class="control" id="sv-f-unit">${lenOptions('ft')}</select></div>
                    <div data-shape="rect" style="margin-top:1rem"><div class="sv-fields2">${fld('sv-f-L', 'sv.f.len')}${fld('sv-f-W', 'sv.f.wid')}</div></div>
                    <div data-shape="quad" style="margin-top:1rem" hidden>
                        <div class="sv-fields2">${fld('sv-f-qn', 'sv.f.n')}${fld('sv-f-qe', 'sv.f.e')}${fld('sv-f-qs', 'sv.f.s')}${fld('sv-f-qw', 'sv.f.w')}</div>
                        <div style="margin-top:.75rem">${fld('sv-f-qd', 'sv.f.diag', ' <small class="opt" data-i18n="sv.f.opt"></small>')}</div>
                    </div>
                    <div data-shape="tri" style="margin-top:1rem" hidden><div class="sv-fields3">${fld('sv-f-ta', 'sv.f.a')}${fld('sv-f-tb', 'sv.f.b')}${fld('sv-f-tc', 'sv.f.c')}</div></div>
                    <div data-shape="multi" style="margin-top:1rem" hidden>
                        <p class="sv-note" style="margin:0 0 .75rem" data-i18n="sv.f.tipMulti"></p>
                        <div id="sv-tris"></div>
                        <button type="button" class="btn btn-soft btn-sm" id="sv-addtri" style="margin-top:.7rem">${icon('fa-plus')} <span data-i18n="sv.f.addTri"></span></button>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-head"><h2><i class="fa-solid fa-square-poll-horizontal"></i> <span data-i18n="sv.f.result"></span></h2></div>
                <div class="card-body" id="sv-fres"></div>
            </div>
        </div>
    </div>

    <!-- ===== unit converter ===== -->
    <div class="sv-pane" data-svpane="conv" hidden>
        <div class="sv-grid2">
            <div class="card">
                <div class="card-head"><h2><i class="fa-solid fa-vector-square"></i> <span data-i18n="sv.c.area"></span></h2></div>
                <div class="card-body">
                    <div class="sv-fields2">
                        ${fld('sv-c-av', 'sv.c.val')}
                        <div class="field"><label for="sv-c-au" data-i18n="sv.c.from"></label><select class="control" id="sv-c-au">${areaOptions('dec')}</select></div>
                    </div>
                    <table class="sv-conv-table" id="sv-c-at" style="margin-top:1rem"></table>
                </div>
            </div>
            <div class="card">
                <div class="card-head"><h2><i class="fa-solid fa-ruler-horizontal"></i> <span data-i18n="sv.c.length"></span></h2></div>
                <div class="card-body">
                    <div class="sv-fields2">
                        ${fld('sv-c-lv', 'sv.c.val')}
                        <div class="field"><label for="sv-c-lu" data-i18n="sv.c.from"></label><select class="control" id="sv-c-lu">${lenOptions('ft')}</select></div>
                    </div>
                    <table class="sv-conv-table" id="sv-c-lt" style="margin-top:1rem"></table>
                    <p class="sv-note" data-i18n="sv.c.note" style="margin-top:1rem"></p>
                </div>
            </div>
        </div>
    </div>`;

    /* ---------- tabs ---------- */
    let tab = storage.get('cc.survey.tab', 'map');
    function setTab(id) {
        tab = id;
        storage.set('cc.survey.tab', id);
        $$('[data-svtab]', ROOT).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.svtab === id)));
        $$('[data-svpane]', ROOT).forEach((p) => { p.hidden = p.dataset.svpane !== id; });
        if (id === 'map') MAP.resize();
    }
    $$('[data-svtab]', ROOT).forEach((b) => b.addEventListener('click', () => setTab(b.dataset.svtab)));

    /* =========================================================
       Unit converter
       ========================================================= */
    const CONV = (() => {
        const st = storage.get('cc.survey.conv', { av: '', au: 'dec', lv: '', lu: 'ft' }) || {};
        const av = $('#sv-c-av'), au = $('#sv-c-au'), lv = $('#sv-c-lv'), lu = $('#sv-c-lu');
        av.value = st.av || ''; au.value = st.au || 'dec'; lv.value = st.lv || ''; lu.value = st.lu || 'ft';
        function render() {
            const a = pnum(av.value), l = pnum(lv.value);
            const sft = a * AREA_U[au.value], ft = l * LEN_U[lu.value];
            $('#sv-c-at').innerHTML = AREA_ORDER.map((u) => `<tr class="${u === au.value ? 'on' : ''}"><td>${esc(t('sv.u.' + u))}</td><td>${Number.isFinite(sft) ? num(sft / AREA_U[u], u === 'sft' || u === 'ojut' || u === 'sqhat' ? 2 : 4) : '—'}</td></tr>`).join('')
                + (Number.isFinite(sft) && sft > 0 ? `<tr><td colspan="2" class="sv-mixed" style="text-align:left;font-weight:500">${mixed(sft).map(esc).join('<br>')}</td></tr>` : '');
            $('#sv-c-lt').innerHTML = LEN_ORDER.map((u) => `<tr class="${u === lu.value ? 'on' : ''}"><td>${esc(t('sv.l.' + u))}</td><td>${Number.isFinite(ft) ? num(ft / LEN_U[u], 3) : '—'}</td></tr>`).join('')
                + (Number.isFinite(ft) && ft > 0 ? `<tr><td>${esc(t('sv.l.ftin'))}</td><td>${fmtLen(ft, 'ftin')}</td></tr><tr><td>${esc(t('sv.l.chainlink'))}</td><td>${fmtLen(ft, 'link')}</td></tr>` : '');
            storage.set('cc.survey.conv', { av: av.value, au: au.value, lv: lv.value, lu: lu.value });
        }
        [av, au, lv, lu].forEach((el) => el.addEventListener('input', render));
        [au, lu].forEach((el) => el.addEventListener('change', render));
        return { render };
    })();

    /* =========================================================
       Field area (from sides measured on the land)
       ========================================================= */
    const FIELD = (() => {
        const box = $('#sv-field'), res = $('#sv-fres'), tris = $('#sv-tris');
        const unitSel = $('#sv-f-unit');
        let st = storage.get('cc.survey.field', null) || { shape: 'rect', unit: 'ft', v: {}, tris: [['', '', ''], ['', '', '']] };
        let last = null, lastHtml = '';                            // {sft, pts (ft) | null}
        function triRows() {
            tris.innerHTML = st.tris.map((tr, i) => `
                <div class="sv-tri" data-tri="${i}">
                    <div class="sv-tri-head"><span>${esc(t('sv.f.triN', { n: digits(i + 1) }))}</span><small data-tri-area></small>
                    ${st.tris.length > 1 ? `<button type="button" class="icon-btn icon-btn-sm" data-deltri="${i}" aria-label="x"><i class="fa-solid fa-xmark"></i></button>` : ''}</div>
                    <div class="sv-fields3">${[0, 1, 2].map((k) => `<div class="field"><div class="input-wrap plain"><input type="text" inputmode="decimal" autocomplete="off" data-tri-v="${k}" value="${esc(tr[k] || '')}" data-ph="${digits(0)}" placeholder="${esc(t(['sv.f.a', 'sv.f.b', 'sv.f.c'][k]))}" aria-label="${esc(t(['sv.f.a', 'sv.f.b', 'sv.f.c'][k]))}"></div></div>`).join('')}</div>
                </div>`).join('');
        }
        function restore() {
            $$('input[name="svShape"]', box).forEach((r) => { r.checked = r.value === st.shape; });
            unitSel.value = LEN_U[st.unit] ? st.unit : 'ft';
            $$('[data-shape] input[id]', box).forEach((inp) => { inp.value = st.v[inp.id] || ''; });
            triRows();
        }
        function read() {
            st.shape = ($('input[name="svShape"]:checked', box) || {}).value || 'rect';
            st.unit = unitSel.value;
            $$('[data-shape] input[id]', box).forEach((inp) => { st.v[inp.id] = inp.value; });
            $$('[data-tri]', tris).forEach((row) => { const i = Number(row.dataset.tri); $$('[data-tri-v]', row).forEach((inp) => { st.tris[i][Number(inp.dataset.triV)] = inp.value; }); });
            storage.set('cc.survey.field', st);
        }
        const val = (id) => pnum(st.v[id]) * LEN_U[st.unit];
        // → { sft, pts (ft, y down = south), note, err, approx, parts }
        function compute() {
            const s = st.shape;
            if (s === 'rect') {
                const L = val('sv-f-L'), W = val('sv-f-W');
                if (!(L > 0 && W > 0)) return null;
                return { sft: L * W, pts: [[0, 0], [L, 0], [L, W], [0, W]], sides: [L, W, L, W] };
            }
            if (s === 'tri') {
                const a = val('sv-f-ta'), b = val('sv-f-tb'), c = val('sv-f-tc');
                if (!(a > 0 && b > 0 && c > 0)) return null;
                const A = heron(a, b, c);
                if (!(A > 0)) return { err: t('sv.f.bad') };
                const C = apex([0, 0], [a, 0], c, b, 1);
                return { sft: A, pts: [[0, 0], [a, 0], C], sides: [a, b, c] };
            }
            if (s === 'quad') {
                const n = val('sv-f-qn'), e = val('sv-f-qe'), so = val('sv-f-qs'), w = val('sv-f-qw'), d = val('sv-f-qd');
                if (!(n > 0 && e > 0 && so > 0 && w > 0)) return null;
                const NW = [0, 0], NE = [n, 0];
                if (d > 0) {
                    const A1 = heron(n, e, d), A2 = heron(so, w, d);
                    if (!(A1 >= 0 && A2 >= 0) || Number.isNaN(A1) || Number.isNaN(A2)) return { err: t('sv.f.badQ') };
                    const SE = apex(NW, NE, d, e, 1);
                    const SW = SE && apex(NW, SE, w, so, 1);
                    if (!SE || !SW) return { err: t('sv.f.badQ') };
                    return { sft: A1 + A2, pts: [NW, NE, SE, SW], sides: [n, e, so, w], exact: true };
                }
                // average method (what most people do by hand) — an estimate
                const sft = (n + so) / 2 * (e + w) / 2;
                const W = (e + w) / 2;
                const dg = Math.min(Math.max(Math.hypot(W, (n + so) / 2), Math.abs(n - e) + .01, Math.abs(so - w) + .01), n + e - .01, so + w - .01);
                const SE = apex(NW, NE, dg, e, 1), SW = SE && apex(NW, SE, w, so, 1);
                return { sft, pts: SE && SW ? [NW, NE, SE, SW] : null, sides: [n, e, so, w], approx: true };
            }
            // any shape: sum of triangles
            let sum = 0, bad = false, any = false;
            const parts = st.tris.map((tr) => {
                const [a, b, c] = tr.map((x) => pnum(x) * LEN_U[st.unit]);
                if (!(a > 0 && b > 0 && c > 0)) return null;
                any = true;
                const A = heron(a, b, c);
                if (!(A > 0)) { bad = true; return NaN; }
                sum += A;
                return A;
            });
            if (!any) return null;
            return { sft: sum, parts, err: bad ? t('sv.f.bad') : '' };
        }
        function svg(r) {
            const P = r.pts, b = bbox(P), W = 420, H = 240, pad = 46;
            const k = Math.min((W - pad * 2) / Math.max(b.x1 - b.x0, 1e-6), (H - pad * 2) / Math.max(b.y1 - b.y0, 1e-6));
            const X = (p) => (pad + (p[0] - b.x0) * k + (W - pad * 2 - (b.x1 - b.x0) * k) / 2), Y = (p) => (pad + (p[1] - b.y0) * k + (H - pad * 2 - (b.y1 - b.y0) * k) / 2);
            const c = centroid(P);
            const labels = P.map((p, i) => {
                const q = P[(i + 1) % P.length], mx = (X(p) + X(q)) / 2, my = (Y(p) + Y(q)) / 2;
                const dx = mx - X(c), dy = my - Y(c), L = Math.hypot(dx, dy) || 1;
                return `<text x="${mx + dx / L * 16}" y="${my + dy / L * 16 + 4}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink-2)">${esc(fmtLen(dist(p, q), 'ftin'))}</text>`;
            }).join('');
            const diag = r.exact ? `<line x1="${X(P[0])}" y1="${Y(P[0])}" x2="${X(P[2])}" y2="${Y(P[2])}" stroke="var(--brand)" stroke-dasharray="5 4" stroke-width="1.5"/>` : '';
            const dirs = st.shape === 'quad' ? `<text x="${W / 2}" y="16" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(t('sv.f.n'))}</text><text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(t('sv.f.s'))}</text>` : '';
            return `<svg class="sv-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><polygon points="${P.map((p) => `${X(p)},${Y(p)}`).join(' ')}" fill="rgba(var(--brand-rgb), .16)" stroke="var(--brand)" stroke-width="2.5" stroke-linejoin="round"${r.approx ? ' stroke-dasharray="7 5"' : ''}/>${diag}${labels}${dirs}</svg>`;
        }
        function unitsGrid(sft) {
            return `<div class="sv-units">${['dec', 'katha', 'bigha', 'acre', 'sft', 'sqm', 'ojut', 'chhatak'].map((u) => `<div><small>${esc(t('sv.u.' + u))}</small><b>${num(sft / AREA_U[u], u === 'acre' || u === 'bigha' ? 4 : 2)}</b></div>`).join('')}</div>
                <div class="sv-mixed">${mixed(sft).map(esc).join('<br>')}</div>`;
        }
        function render() {
            read();
            $$('[data-shape]', box).forEach((el) => { el.hidden = el.dataset.shape !== st.shape; });
            const r = compute();
            last = r && r.sft > 0 ? r : null;
            if (st.shape === 'multi') $$('[data-tri]', tris).forEach((row, i) => { const a = r && r.parts && r.parts[i]; $('[data-tri-area]', row).textContent = a > 0 ? fmtArea(a, 'dec') : (Number.isNaN(a) ? '✕' : ''); });
            // only touch the DOM when something changed (a blur → "change" must not replace a button mid-click)
            const put = (html) => { if (html !== lastHtml) { res.innerHTML = html; lastHtml = html; } };
            if (!r) { put(`<div class="sv-res-empty"><i class="fa-solid fa-ruler-combined"></i>${esc(t('sv.f.empty'))}</div>`); return; }
            if (r.err && !(r.sft > 0)) { put(`<div class="sv-err">${esc(r.err)}</div>`); return; }
            put(`${r.pts ? svg(r) : ''}
                <div class="sv-big">${esc(fmtArea(r.sft, 'dec'))}</div>
                <div style="color:var(--muted);font-weight:600">${esc(fmtArea(r.sft, 'katha'))} · ${esc(fmtArea(r.sft, 'sft'))}</div>
                ${unitsGrid(r.sft)}
                ${r.err ? `<div class="sv-err">${esc(r.err)}</div>` : ''}
                ${r.approx ? `<div class="sv-warnbox"><i class="fa-solid fa-triangle-exclamation"></i> ${esc(t('sv.f.approx'))}</div>` : ''}
                ${r.exact ? `<div class="sv-okbox"><i class="fa-solid fa-circle-check"></i> ${esc(t('sv.f.exactQ'))}</div>` : ''}
                ${r.pts ? `<div class="sv-btns"><button type="button" class="btn btn-soft btn-sm" data-fto="map">${icon('fa-map-location-dot')} <span>${esc(t('sv.f.toMap'))}</span></button><button type="button" class="btn btn-primary btn-sm" data-fto="div">${icon('fa-people-arrows')} <span>${esc(t('sv.f.toDiv'))}</span></button></div>` : ''}`);
        }
        box.addEventListener('input', render);
        box.addEventListener('change', render);
        tris.addEventListener('click', (e) => {
            const d = e.target.closest('[data-deltri]');
            if (!d) return;
            read(); st.tris.splice(Number(d.dataset.deltri), 1); triRows(); render();
        });
        $('#sv-addtri').addEventListener('click', () => { read(); st.tris.push(['', '', '']); triRows(); render(); const ins = $$('[data-tri-v]', tris); if (ins.length) ins[ins.length - 3].focus(); });
        res.addEventListener('click', (e) => {
            const b = e.target.closest('[data-fto]');
            if (!b || !last || !last.pts) return;
            MAP.addFromFeet(last.pts, b.dataset.fto === 'div');
            setTab('map');
            toast(t('sv.f.added'));
        });
        restore();
        return { render, relabel() { read(); triRows(); render(); } };
    })();

    /* =========================================================
       Small IndexedDB store for the (large) map image
       ========================================================= */
    const IDB = (() => {
        let dbp = null;
        const open = () => dbp || (dbp = new Promise((res, rej) => {
            try {
                const r = indexedDB.open('cc-survey', 1);
                r.onupgradeneeded = () => r.result.createObjectStore('kv');
                r.onsuccess = () => res(r.result);
                r.onerror = () => rej(r.error);
            } catch (e) { rej(e); }
        }));
        const run = (mode, fn) => open().then((db) => new Promise((res, rej) => {
            const tx = db.transaction('kv', mode), st = tx.objectStore('kv'), rq = fn(st);
            tx.oncomplete = () => res(rq && rq.result); tx.onerror = () => rej(tx.error);
        }));
        return {
            get: (k) => run('readonly', (s) => s.get(k)).catch(() => null),
            set: (k, v) => run('readwrite', (s) => s.put(v, k)).catch(() => null),
            del: (k) => run('readwrite', (s) => s.delete(k)).catch(() => null),
        };
    })();

    /* =========================================================
       Map workspace
       ========================================================= */
    const PLOT_COLORS = ['#0d9488', '#2563eb', '#d97706', '#7c3aed', '#dc2626', '#059669', '#db2777', '#0891b2'];
    const PART_COLORS = ['#2dd4bf', '#60a5fa', '#fbbf24', '#a78bfa', '#f87171', '#4ade80', '#f472b6', '#22d3ee', '#fb923c', '#818cf8', '#a3e635', '#e879f9'];
    const RATIOS = { r16: 3960, r32: 1980, r64: 990, r8: 7920 };
    const STORE = 'cc.survey';
    let D;

    const MAP = (() => {
        const stage = $('#sv-stage'), cv = $('#sv-canvas'), ctx = cv.getContext('2d');
        const side = $('#sv-side');
        let IMG = null, pdfDoc = null;
        let view = { z: 1, ox: 0, oy: 0 }, fitted = false;
        let tool = 'select', sel = null, selV = null;
        let draft = null, mA = null, calib = [], hover = null, loupe = null, gesture = null;
        const pointers = new Map();
        let hist = [], hi = -1;

        /* ---------- data ---------- */
        const blank = () => ({
            v: 1, nextId: 1, img: null,
            scale: { f: 1, how: 'none', dpi: 300, ratio: 'r16', N: 3960 },
            plots: [], marks: [], info: {},
            opt: { len: 'ftin', area: 'dec', alpha: 0.85, xImg: true, xOnly: false },
        });
        function sanitize(d) {
            const b = blank();
            if (!d || typeof d !== 'object') return b;
            const out = Object.assign(b, d);
            out.scale = Object.assign(blank().scale, d.scale || {});
            out.opt = Object.assign(blank().opt, d.opt || {});
            out.info = Object.assign({}, d.info || {});
            out.plots = (Array.isArray(d.plots) ? d.plots : []).filter((p) => p && Array.isArray(p.pts) && p.pts.length >= 3)
                .map((p) => ({ id: p.id || 0, name: String(p.name || ''), owner: String(p.owner || ''), color: p.color || PLOT_COLORS[0],
                    pts: p.pts.map((q) => [Number(q[0]) || 0, Number(q[1]) || 0]), div: p.div || null }));
            out.marks = (Array.isArray(d.marks) ? d.marks : []).filter((m) => m && m.a && m.b);
            if (!(out.scale.f > 0)) out.scale.f = 1;
            out.nextId = Math.max(out.nextId || 1, ...out.plots.map((p) => p.id + 1), 1);
            return out;
        }
        const F = () => D.scale.f;                               // feet per map unit
        const sftOf = (P) => pArea(P) * F() * F();
        const ftOf = (a, b) => dist(a, b) * F();
        const plotById = (id) => D.plots.find((p) => p.id === id);
        const plotName = (p) => p.name || t('sv.plotN', { n: digits(D.plots.indexOf(p) + 1) });
        const save = () => storage.set(STORE, D);
        function snapshot() { const c = Object.assign({}, D); delete c.img; return JSON.stringify(c); }
        function commit() {
            hist = hist.slice(0, hi + 1);
            hist.push(snapshot());
            if (hist.length > 80) hist.shift();
            hi = hist.length - 1;
            save(); syncHist(); renderSide(); draw();
        }
        function restoreSnap(s) { const img = D.img; D = sanitize(JSON.parse(s)); D.img = img; if (sel && !plotById(sel)) sel = null; selV = null; save(); syncHist(); renderSide(); draw(); }
        const undo = () => { if (hi > 0) { hi -= 1; restoreSnap(hist[hi]); } };
        const redo = () => { if (hi < hist.length - 1) { hi += 1; restoreSnap(hist[hi]); } };
        function syncHist() { $('#sv-undo').disabled = hi <= 0; $('#sv-redo').disabled = hi >= hist.length - 1; }

        /* ---------- division ---------- */
        function frame(p) {
            const P = p.pts, n = P.length, f = ((p.div.edge % n) + n) % n;
            const a = P[f], b = P[(f + 1) % n], L = dist(a, b) || 1;
            const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, c = centroid(P);
            let nx = -uy, ny = ux;
            if ((c[0] - a[0]) * nx + (c[1] - a[1]) * ny < 0) { nx = -nx; ny = -ny; }
            return p.div.way === 'depth' ? { u: [nx, ny], a, b } : { u: [ux, uy], a, b };
        }
        // the share of each part (0..1) + names; err when the amounts don't fit
        function targets(p) {
            const dv = p.div, sh = dv.shares;
            const total = sftOf(p.pts);
            let fr, err = '', rest = false;
            if (dv.mode === 'area') {
                const v = sh.map((s) => Math.max(pnum(s.val) || 0, 0) * AREA_U.dec);
                const sum = v.reduce((a, b) => a + b, 0);
                if (sum > total * 1.000001) err = t('sv.d.over');
                fr = v.map((x) => x / total);
                if (!err && total - sum > total * 1e-6) { fr.push((total - sum) / total); rest = true; }
                if (err) fr = sh.map(() => 1 / sh.length);
            } else if (dv.mode === 'ratio') {
                const v = sh.map((s) => { const x = pnum(s.val); return x > 0 ? x : 1; });
                const sum = v.reduce((a, b) => a + b, 0);
                fr = v.map((x) => x / sum);
            } else fr = sh.map(() => 1 / sh.length);
            return { fr, err, rest, total };
        }
        function divide(p) {
            if (!p.div) return;
            const { u } = frame(p), P = p.pts;
            const s = P.map((q) => q[0] * u[0] + q[1] * u[1]);
            const lo0 = Math.min(...s), hi0 = Math.max(...s), A = pArea(P);
            const { fr } = targets(p);
            const cuts = [];
            let acc = 0;
            for (let i = 0; i < fr.length - 1; i++) {
                acc += fr[i];
                const goal = acc * A;
                let lo = lo0, hi = hi0;
                for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (pArea(clip(P, u, m, true)) < goal) lo = m; else hi = m; }
                cuts.push((lo + hi) / 2);
            }
            p.div.cuts = cuts;
            p.div.exact = true;
        }
        function parts(p) {
            if (!p.div || !p.div.cuts) return [];
            const { u } = frame(p), { fr, rest } = targets(p), c = p.div.cuts, P = p.pts, f2 = F() * F();
            const out = [];
            for (let i = 0; i <= c.length; i++) {
                let Q = P;
                if (i > 0) Q = clip(Q, u, c[i - 1], false);
                if (i < c.length) Q = clip(Q, u, c[i], true);
                const isRest = rest && i === fr.length - 1;
                const sh = p.div.shares[i] || {};
                out.push({ pts: Q, i, rest: isRest, name: isRest ? t('sv.d.rest') : (sh.name || t('sv.d.share', { n: digits(i + 1) })),
                    color: isRest ? '#cbd5e1' : PART_COLORS[i % PART_COLORS.length], sft: pArea(Q) * f2, target: (fr[i] || 0) * sftOf(P) });
            }
            return out;
        }
        const redivideAll = () => D.plots.forEach((p) => { if (p.div && p.div.exact !== false) divide(p); });

        /* ---------- view ---------- */
        let cw = 0, ch = 0;
        const dpr = () => Math.min(window.devicePixelRatio || 1, 2.5);
        function resize() {
            const r = stage.getBoundingClientRect();
            if (!r.width || !r.height) return;
            cw = r.width; ch = r.height;
            cv.width = Math.round(cw * dpr()); cv.height = Math.round(ch * dpr());
            if (!fitted) fit(); else draw();
        }
        new ResizeObserver(resize).observe(stage);
        const toS = (p, v = view) => [p[0] * v.z + v.ox, p[1] * v.z + v.oy];
        const toW = (s) => [(s[0] - view.ox) / view.z, (s[1] - view.oy) / view.z];
        function contentBox(only) {
            let P = [];
            const plots = only ? D.plots.filter((p) => p.id === only) : D.plots;
            plots.forEach((p) => { P = P.concat(p.pts); });
            if (!only) D.marks.forEach((m) => { P.push(m.a, m.b); });
            if (!only && IMG && D.img) P.push([0, 0], [D.img.w, D.img.h]);
            if (!P.length) { const s = 120 / F(); P = [[0, 0], [s, s * .7]]; }
            return bbox(P);
        }
        function fitTo(b, W, H, pad) {
            const z = Math.min((W - pad * 2) / Math.max(b.x1 - b.x0, 1e-6), (H - pad * 2) / Math.max(b.y1 - b.y0, 1e-6));
            return { z, ox: (W - (b.x1 - b.x0) * z) / 2 - b.x0 * z, oy: (H - (b.y1 - b.y0) * z) / 2 - b.y0 * z };
        }
        function fit(only) {
            if (!cw) return;
            view = fitTo(contentBox(only), cw, ch, Math.min(60, cw * .08));
            fitted = true;
            draw();
        }
        function zoomAt(s, k) {
            const w = toW(s);
            view.z = Math.min(Math.max(view.z * k, 1e-4), 1e4);
            view.ox = s[0] - w[0] * view.z; view.oy = s[1] - w[1] * view.z;
            draw();
        }

        /* ---------- drawing ---------- */
        let raf = 0;
        function draw() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); }
        function palette(light) {
            const dark = !light && document.documentElement.getAttribute('data-theme') === 'dark';
            const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#0d9488';
            return dark
                ? { bg: '#111c2e', grid: 'rgba(148,163,184,.09)', grid2: 'rgba(148,163,184,.18)', ink: '#e2e8f0', mute: '#94a3b8', halo: 'rgba(17,28,46,.88)', brand, dark }
                : { bg: '#fbfcfd', grid: 'rgba(30,41,59,.055)', grid2: 'rgba(30,41,59,.12)', ink: '#1e293b', mute: '#64748b', halo: 'rgba(255,255,255,.92)', brand, dark };
        }
        const FONT = "'Noto Sans Bengali', Poppins, system-ui, sans-serif";
        function label(c, text, x, y, o, size, opt = {}) {
            c.save();
            c.font = `${opt.bold ? 700 : 600} ${size * o.k}px ${FONT}`;
            c.textAlign = opt.align || 'center'; c.textBaseline = 'middle';
            if (opt.rot) { c.translate(x, y); c.rotate(opt.rot); x = 0; y = 0; }
            c.lineJoin = 'round'; c.lineWidth = 3.5 * o.k; c.strokeStyle = o.pal.halo; c.strokeText(text, x, y);
            c.fillStyle = opt.color || o.pal.ink; c.fillText(text, x, y);
            c.restore();
        }
        function edgeLabel(c, a, b, cen, ft, o, color) {
            const A = toS(a, o.v), B = toS(b, o.v);
            const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
            if (L < 46 * o.k) return;
            let ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
            if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
            const C = toS(cen, o.v), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
            let nx = -(B[1] - A[1]) / L, ny = (B[0] - A[0]) / L;
            if ((mx - C[0]) * nx + (my - C[1]) * ny < 0) { nx = -nx; ny = -ny; }
            label(c, fmtLen(ft), mx + nx * 11 * o.k, my + ny * 11 * o.k, o, 11, { rot: ang, color });
        }
        function niceStep(target) { const p = 10 ** Math.floor(Math.log10(target)), m = target / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
        function poly(c, P, v) { c.beginPath(); P.forEach((p, i) => { const s = toS(p, v); if (i) c.lineTo(s[0], s[1]); else c.moveTo(s[0], s[1]); }); c.closePath(); }

        // draws the whole sheet into canvas context c with view o.v
        function scene(c, o) {
            const { pal, v, k } = o;
            c.fillStyle = pal.bg; c.fillRect(o.x || 0, o.y || 0, o.W, o.H);
            // grid in feet
            const stepFt = niceStep(42 * k / v.z * F()), step = stepFt / F();
            if (step * v.z > 6) {
                const w0 = [(o.x || 0) - v.ox, (o.y || 0) - v.oy].map((s) => s / v.z), w1 = [(o.x || 0) + o.W - v.ox, (o.y || 0) + o.H - v.oy].map((s) => s / v.z);
                c.lineWidth = 1;
                for (let gx = Math.floor(w0[0] / step) * step, i = Math.floor(w0[0] / step); gx <= w1[0]; gx += step, i++) {
                    c.strokeStyle = i % 5 === 0 ? pal.grid2 : pal.grid; const X = gx * v.z + v.ox; c.beginPath(); c.moveTo(X, o.y || 0); c.lineTo(X, (o.y || 0) + o.H); c.stroke();
                }
                for (let gy = Math.floor(w0[1] / step) * step, i = Math.floor(w0[1] / step); gy <= w1[1]; gy += step, i++) {
                    c.strokeStyle = i % 5 === 0 ? pal.grid2 : pal.grid; const Y = gy * v.z + v.oy; c.beginPath(); c.moveTo(o.x || 0, Y); c.lineTo((o.x || 0) + o.W, Y); c.stroke();
                }
            }
            // map image
            if (IMG && D.img && o.img) {
                c.save(); c.globalAlpha = D.opt.alpha; c.imageSmoothingEnabled = v.z < 2; c.imageSmoothingQuality = 'high';
                c.drawImage(IMG, v.ox, v.oy, D.img.w * v.z, D.img.h * v.z);
                c.restore();
            }
            const plots = o.only ? D.plots.filter((p) => p.id === o.only) : D.plots;
            // plots + parts
            plots.forEach((p) => {
                const P = p.pts, cen = centroid(P), on = o.ui && p.id === sel;
                const ps = parts(p);
                if (ps.length) {
                    ps.forEach((q) => { if (q.pts.length < 3) return; poly(c, q.pts, v); c.fillStyle = q.color + (o.img && IMG ? '8c' : '66'); c.fill(); });
                    // division lines
                    const { u } = frame(p);
                    p.div.cuts.forEach((cc, i) => chord(P, u, cc).forEach(([a, b]) => {
                        const A = toS(a, v), B = toS(b, v);
                        c.save(); c.strokeStyle = pal.dark ? '#f8fafc' : '#0f172a'; c.lineWidth = 2.2 * k; c.setLineDash([9 * k, 6 * k]);
                        c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); c.restore();
                        if (o.ui && on) { const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; c.beginPath(); c.arc(M[0], M[1], 8, 0, 7); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = pal.brand; c.stroke(); }
                    }));
                } else {
                    poly(c, P, v); c.fillStyle = p.color + (on ? '33' : '22'); c.fill();
                }
                poly(c, P, v);
                c.lineJoin = 'round'; c.strokeStyle = p.color; c.lineWidth = (on ? 3 : 2.2) * k; c.stroke();
            });
            // lengths (each part's sides when divided, else the plot's sides) — every segment once
            plots.forEach((p) => {
                const ps = parts(p), seen = new Set();
                const key = (a, b) => [a, b].map((q) => `${Math.round(q[0] * 100)},${Math.round(q[1] * 100)}`).sort().join('|');
                const polys = ps.length ? ps.map((q) => q.pts) : [p.pts];
                polys.forEach((Q) => {
                    if (Q.length < 3) return;
                    const cen = labelPt(Q);
                    Q.forEach((a, i) => {
                        const b = Q[(i + 1) % Q.length];
                        if (dist(a, b) * v.z < 2) return;
                        const kk = key(a, b); if (seen.has(kk)) return; seen.add(kk);
                        edgeLabel(c, a, b, cen, ftOf(a, b), o);
                    });
                });
            });
            // names + areas
            plots.forEach((p) => {
                const ps = parts(p);
                if (ps.length) ps.forEach((q) => {
                    if (q.pts.length < 3) return;
                    const L = toS(labelPt(q.pts), v);
                    label(c, q.name, L[0], L[1] - 8 * k, o, 12.5, { bold: true });
                    label(c, fmtArea(q.sft, D.opt.area), L[0], L[1] + 9 * k, o, 11.5, { color: pal.dark ? '#5eead4' : '#0f766e' });
                });
                else {
                    const L = toS(labelPt(p.pts), v);
                    label(c, plotName(p), L[0], L[1] - 9 * k, o, 13, { bold: true, color: p.color });
                    label(c, fmtArea(sftOf(p.pts), D.opt.area), L[0], L[1] + 9 * k, o, 12, { bold: true });
                }
            });
            // vertices of the selected plot
            if (o.ui && sel) {
                const p = plotById(sel);
                if (p) p.pts.forEach((q, i) => { const s = toS(q, v); c.beginPath(); c.arc(s[0], s[1], i === selV ? 7 : 5.5, 0, 7); c.fillStyle = i === selV ? p.color : '#fff'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = p.color; c.stroke(); });
            }
            // distances
            if (!o.only) D.marks.forEach((m) => {
                const A = toS(m.a, v), B = toS(m.b, v);
                c.save(); c.strokeStyle = '#e11d48'; c.lineWidth = 2 * k; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke();
                [A, B].forEach((s) => { c.beginPath(); c.arc(s[0], s[1], 3.5 * k, 0, 7); c.fillStyle = '#e11d48'; c.fill(); });
                c.restore();
                label(c, fmtLen(ftOf(m.a, m.b)), (A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 12 * k, o, 11.5, { bold: true, color: '#be123c' });
            });
            if (o.ui) overlay(c, o);
        }
        // in-progress drawing, snap ring, calibration points
        function overlay(c, o) {
            const v = o.v, h = hover;
            if (draft && draft.length) {
                const pts = h ? draft.concat([h]) : draft;
                c.save(); c.strokeStyle = o.pal.brand; c.lineWidth = 2.5; c.setLineDash([]);
                c.beginPath(); pts.forEach((p, i) => { const s = toS(p, v); if (i) c.lineTo(s[0], s[1]); else c.moveTo(s[0], s[1]); }); c.stroke();
                if (pts.length >= 3) { c.globalAlpha = .12; poly(c, pts, v); c.fillStyle = o.pal.brand; c.fill(); }
                c.restore();
                draft.forEach((p, i) => { const s = toS(p, v); c.beginPath(); c.arc(s[0], s[1], i === 0 ? 7 : 4.5, 0, 7); c.fillStyle = i === 0 ? o.pal.brand : '#fff'; c.fill(); c.strokeStyle = o.pal.brand; c.lineWidth = 2; c.stroke(); });
                if (h) { const a = draft[draft.length - 1]; const A = toS(a, v), B = toS(h, v); label(c, fmtLen(ftOf(a, h)), (A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 12, o, 11.5, { bold: true }); }
            }
            const two = (a, b, col) => {
                const A = toS(a, v);
                c.save(); c.fillStyle = col; c.beginPath(); c.arc(A[0], A[1], 5, 0, 7); c.fill();
                if (b) { const B = toS(b, v); c.strokeStyle = col; c.lineWidth = 2.5; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); c.setLineDash([]); c.beginPath(); c.arc(B[0], B[1], 5, 0, 7); c.fill(); }
                c.restore();
            };
            if (mA) { two(mA, h, '#e11d48'); if (h) { const A = toS(mA, v), B = toS(h, v); label(c, fmtLen(ftOf(mA, h)), (A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 12, o, 12, { bold: true, color: '#be123c' }); } }
            if (calib.length) two(calib[0], calib[1] || (tool === 'calib' ? h : null), '#7c3aed');
            if (h && (tool === 'draw' || tool === 'measure' || tool === 'calib')) {
                const s = toS(h, v);
                c.save(); c.strokeStyle = h.snap ? '#f59e0b' : o.pal.brand; c.lineWidth = 1.5;
                c.beginPath(); c.arc(s[0], s[1], h.snap ? 9 : 6, 0, 7); c.stroke();
                c.beginPath(); c.moveTo(s[0] - 14, s[1]); c.lineTo(s[0] - 4, s[1]); c.moveTo(s[0] + 4, s[1]); c.lineTo(s[0] + 14, s[1]); c.moveTo(s[0], s[1] - 14); c.lineTo(s[0], s[1] - 4); c.moveTo(s[0], s[1] + 4); c.lineTo(s[0], s[1] + 14); c.stroke();
                c.restore();
            }
        }
        function northArrow(c, x, y, r, o) {
            c.save(); c.translate(x, y);
            c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = o.pal.halo; c.fill(); c.lineWidth = 1.2 * o.k; c.strokeStyle = o.pal.grid2; c.stroke();
            c.beginPath(); c.moveTo(0, -r * .78); c.lineTo(r * .32, r * .35); c.lineTo(0, r * .15); c.closePath(); c.fillStyle = '#e11d48'; c.fill();
            c.beginPath(); c.moveTo(0, -r * .78); c.lineTo(-r * .32, r * .35); c.lineTo(0, r * .15); c.closePath(); c.fillStyle = o.pal.ink; c.fill();
            c.restore();
            label(c, t('sv.e.n'), x, y - r - 9 * o.k, o, 12, { bold: true });
        }
        function scaleBar(c, x, y, maxPx, o) {
            const ftPx = F() / o.v.z, L = niceStep(maxPx * ftPx * .7), px = L / ftPx;
            c.save();
            for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? o.pal.halo : o.pal.ink; c.fillRect(x + px * i / 4, y, px / 4, 6 * o.k); }
            c.strokeStyle = o.pal.ink; c.lineWidth = 1 * o.k; c.strokeRect(x, y, px, 6 * o.k);
            c.restore();
            label(c, digits(0), x, y - 9 * o.k, o, 10.5);
            const u = D.opt.len === 'ftin' ? 'ft' : D.opt.len;
            const nice = u === 'ft' ? `${CS.numPlain(L)} ${t('sv.ls.ft')}` : u === 'm' ? `${CS.numPlain(Math.round(L / LEN_U.m * 100) / 100)} ${t('sv.ls.m')}` : fmtLen(L, u);
            label(c, nice, x + px, y - 9 * o.k, o, 10.5);
        }
        function paint() {
            if (!cw) return;
            const d = dpr();
            ctx.setTransform(d, 0, 0, d, 0, 0);
            const o = { pal: palette(false), v: view, k: 1, W: cw, H: ch, ui: true, img: true };
            scene(ctx, o);
            northArrow(ctx, cw - 28, 40, 15, o);
            scaleBar(ctx, 14, ch - 18, Math.min(170, cw * .35), o);
            if (loupe) {                                        // magnifier for fingers
                const r = 58, cx = loupe[0] < cw / 2 ? cw - r - 12 : r + 12, cy = r + 12, z = 3;
                const w = toW(loupe);
                const lv = { z: view.z * z, ox: cx - w[0] * view.z * z, oy: cy - w[1] * view.z * z };
                ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
                scene(ctx, Object.assign({}, o, { v: lv, x: cx - r, y: cy - r, W: r * 2, H: r * 2 }));
                ctx.restore();
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.lineWidth = 3; ctx.strokeStyle = o.pal.brand; ctx.stroke();
            }
            live();
        }

        /* ---------- live readout ---------- */
        function live() {
            let s = '';
            if (draft && draft.length) {
                const pts = hover ? draft.concat([hover]) : draft;
                s = `${digits(draft.length)} ✦ ${pts.length >= 3 ? fmtArea(sftOf(pts), D.opt.area) : ''}`;
            } else if (tool === 'measure' && mA && hover) s = fmtLen(ftOf(mA, hover));
            else if (tool === 'calib' && calib.length === 2) s = t('sv.sc.picked');
            $('#sv-live').textContent = s;
        }

        /* ---------- hit testing & snapping ---------- */
        function snap(s, skip) {
            let best = null, bd = 12;
            const test = (q, ref) => { const S = toS(q); const d = Math.hypot(S[0] - s[0], S[1] - s[1]); if (d < bd && ref !== skip) { bd = d; best = q; } };
            D.plots.forEach((p) => p.pts.forEach((q, i) => test(q, p.id + ':' + i)));
            if (draft && draft.length > 2) test(draft[0], 'd0');
            D.marks.forEach((m) => { test(m.a); test(m.b); });
            if (best) { const r = [best[0], best[1]]; r.snap = true; return r; }
            return toW(s);
        }
        function hit(s) {
            const p = sel && plotById(sel);
            if (p) {
                if (p.div && p.div.cuts) {
                    const { u } = frame(p);
                    for (let i = 0; i < p.div.cuts.length; i++) {
                        for (const [a, b] of chord(p.pts, u, p.div.cuts[i])) {
                            if (segDist(s, toS(a), toS(b)) < 11) return { k: 'cut', p, i };
                        }
                    }
                }
                for (let i = 0; i < p.pts.length; i++) { const S = toS(p.pts[i]); if (Math.hypot(S[0] - s[0], S[1] - s[1]) < 13) return { k: 'vert', p, i }; }
            }
            const w = toW(s);
            for (let i = D.marks.length - 1; i >= 0; i--) { const m = D.marks[i]; if (segDist(s, toS(m.a), toS(m.b)) < 8) return { k: 'mark', i }; }
            for (let i = D.plots.length - 1; i >= 0; i--) if (inPoly(w, D.plots[i].pts)) return { k: 'plot', p: D.plots[i] };
            return { k: 'none' };
        }

        /* ---------- tools ---------- */
        function setTool(tl) {
            if (tl !== 'draw') draft = null;
            if (tl !== 'measure') mA = null;
            if (tl !== 'calib' && calib.length < 2) calib = [];
            if (tl === 'calib' && !(IMG && D.img)) { toast(t('sv.noImg')); tl = 'select'; }
            tool = tl;
            stage.dataset.tool = tl;
            $$('[data-svtool]', ROOT).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.svtool === tl)));
            $('#sv-hint').textContent = t('sv.h.' + tl);
            syncDrawbar(); draw();
        }
        function syncDrawbar() { $('#sv-drawbar').hidden = !(tool === 'draw' && draft && draft.length); $('#sv-finish').disabled = !(draft && draft.length >= 3); }
        function finishDraft() {
            if (!draft || draft.length < 3) { toast(t('sv.need3')); return; }
            const id = D.nextId++;
            const p = { id, name: '', owner: '', color: PLOT_COLORS[(id - 1) % PLOT_COLORS.length], pts: draft.map((q) => [q[0], q[1]]), div: null };
            D.plots.push(p);
            draft = null; sel = id; selV = null;
            setTool('select');
            commit();
            toast(t('sv.added', { a: fmtArea(sftOf(p.pts), D.opt.area) }));
        }
        function clickAt(s) {
            if (tool === 'draw') {
                const w = snap(s);
                if (!draft) draft = [];
                if (draft.length >= 3 && w.snap && w[0] === draft[0][0] && w[1] === draft[0][1]) { finishDraft(); return; }
                draft.push([w[0], w[1]]);
                syncDrawbar(); draw(); return;
            }
            if (tool === 'measure') {
                const w = snap(s);
                if (!mA) { mA = [w[0], w[1]]; draw(); return; }
                if (dist(mA, w) > 0) D.marks.push({ a: mA, b: [w[0], w[1]] });
                mA = null; commit(); return;
            }
            if (tool === 'calib') {
                const w = snap(s);
                if (calib.length >= 2) calib = [];
                calib.push([w[0], w[1]]);
                if (calib.length === 2) { setTool('select'); renderSide(); const inp = $('#sv-cal-d'); if (inp) { inp.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => inp.focus(), 250); } }
                draw(); return;
            }
            const h = hit(s);
            if (h.k === 'plot') { if (sel !== h.p.id) { sel = h.p.id; selV = null; renderSide(); } }
            else if (h.k === 'mark') { /* tap a distance: nothing */ }
            else if (h.k === 'none' && sel) { sel = null; selV = null; renderSide(); }
            draw();
        }

        /* ---------- pointer input ---------- */
        const pos = (e) => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
        stage.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button')) return;
            try { stage.setPointerCapture(e.pointerId); } catch (err) { /* synthetic */ }
            const s = pos(e);
            pointers.set(e.pointerId, s);
            if (pointers.size === 2) {
                const [a, b] = [...pointers.values()];
                gesture = { k: 'pinch', d: Math.hypot(a[0] - b[0], a[1] - b[1]), m: toW([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]), z: view.z };
                loupe = null; draw(); return;
            }
            if (pointers.size > 2) return;
            const touch = e.pointerType === 'touch';
            if (tool === 'pan' || e.button === 1) { gesture = { k: 'pan', s, o: [view.ox, view.oy] }; return; }
            if (tool === 'draw' || tool === 'measure' || tool === 'calib') {
                if (touch) { gesture = { k: 'place', s }; loupe = s; hover = snap(s); draw(); }
                else gesture = { k: 'click', s, o: [view.ox, view.oy] };
                return;
            }
            const h = hit(s);
            if (h.k === 'cut') { gesture = { k: 'cut', p: h.p, i: h.i, moved: false }; return; }
            if (h.k === 'vert') { gesture = { k: 'vert', p: h.p, i: h.i, moved: false }; selV = h.i; if (touch) loupe = s; renderSide(); draw(); return; }
            gesture = { k: 'click', s, o: [view.ox, view.oy] };
        });
        stage.addEventListener('pointermove', (e) => {
            const s = pos(e);
            if (pointers.has(e.pointerId)) pointers.set(e.pointerId, s);
            const g = gesture;
            if (g && g.k === 'pinch') {
                if (pointers.size < 2) return;
                const [a, b] = [...pointers.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
                view.z = Math.min(Math.max(g.z * d / Math.max(g.d, 1), 1e-4), 1e4);
                view.ox = m[0] - g.m[0] * view.z; view.oy = m[1] - g.m[1] * view.z;
                draw(); return;
            }
            if (tool === 'draw' || tool === 'measure' || tool === 'calib') { if (!g || g.k !== 'click' || !g.panning) hover = snap(s); }
            if (!g) { if (tool !== 'select' && tool !== 'pan') draw(); return; }
            if (g.k === 'pan' || (g.k === 'click' && (g.panning || Math.hypot(s[0] - g.s[0], s[1] - g.s[1]) > 5))) {
                if (g.k === 'click') g.panning = true;
                view.ox = g.o[0] + s[0] - g.s[0]; view.oy = g.o[1] + s[1] - g.s[1];
                draw(); return;
            }
            if (g.k === 'place') { loupe = s; draw(); return; }
            if (g.k === 'vert') {
                const w = snap(s, g.p.id + ':' + g.i);
                g.p.pts[g.i] = [w[0], w[1]]; g.moved = true;
                if (g.p.div && g.p.div.exact !== false) divide(g.p);
                if (e.pointerType === 'touch') loupe = s;
                updateNumbers(); draw(); return;
            }
            if (g.k === 'cut') {
                const p = g.p, { u } = frame(p), w = toW(s), c = p.div.cuts;
                const pr = p.pts.map((q) => q[0] * u[0] + q[1] * u[1]), lo = Math.min(...pr), hi = Math.max(...pr), gap = (hi - lo) * .002;
                const sv = w[0] * u[0] + w[1] * u[1];
                c[g.i] = Math.min(Math.max(sv, (g.i > 0 ? c[g.i - 1] : lo) + gap), (g.i < c.length - 1 ? c[g.i + 1] : hi) - gap);
                p.div.exact = false; g.moved = true;
                updateNumbers(); draw();
            }
        });
        const end = (e) => {
            const had = pointers.has(e.pointerId);
            pointers.delete(e.pointerId);
            const g = gesture;
            if (g && g.k === 'pinch') { if (pointers.size === 0) gesture = null; return; }
            if (!had) return;
            gesture = null; loupe = null;
            if (!g) return;
            const s = pos(e);
            if (e.type === 'pointercancel') { draw(); return; }
            if (g.k === 'click' && !g.panning) clickAt(s);
            else if (g.k === 'place') { hover = null; clickAt(s); }
            else if ((g.k === 'vert' || g.k === 'cut') && g.moved) commit();
            draw();
        };
        stage.addEventListener('pointerup', end);
        stage.addEventListener('pointercancel', end);
        stage.addEventListener('pointerleave', () => { if (!gesture && hover) { hover = null; draw(); } });
        stage.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(pos(e), Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0015))); }, { passive: false });
        stage.addEventListener('dblclick', (e) => {
            const s = pos(e);
            if (tool === 'draw') {
                if (draft && draft.length > 3) { draft.pop(); finishDraft(); }   // the 2nd click of the double-click added one point
                return;
            }
            if (tool !== 'select' || !sel) return;
            const p = plotById(sel);
            for (let i = 0; i < p.pts.length; i++) {
                const a = p.pts[i], b = p.pts[(i + 1) % p.pts.length];
                if (segDist(s, toS(a), toS(b)) < 9) {
                    p.pts.splice(i + 1, 0, toW(s)); selV = i + 1;
                    if (p.div) divide(p);
                    commit(); return;
                }
            }
        });
        document.addEventListener('keydown', (e) => {
            if (CS.page() !== 'survey' || tab !== 'map') return;
            if (e.target.closest('input, textarea, select')) return;
            const k = e.key;
            if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
            if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
            if (k === 'Escape') { if (draft || mA || calib.length) { draft = null; mA = null; calib = []; syncDrawbar(); renderSide(); draw(); } else if (sel) { sel = null; selV = null; renderSide(); draw(); } }
            if (k === 'Enter' && draft) finishDraft();
            if (k === 'Backspace' && draft && draft.length) { e.preventDefault(); draft.pop(); syncDrawbar(); draw(); }
            if (k === 'Delete' && sel) { const p = plotById(sel); if (selV != null && p.pts.length > 3) delVertex(); else delPlot(); }
        });

        $$('[data-svtool]', ROOT).forEach((b) => b.addEventListener('click', () => setTool(b.dataset.svtool)));
        $$('[data-zoom]', ROOT).forEach((b) => b.addEventListener('click', () => zoomAt([cw / 2, ch / 2], Number(b.dataset.zoom))));
        $('#sv-undo').addEventListener('click', undo);
        $('#sv-redo').addEventListener('click', redo);
        $('#sv-fit').addEventListener('click', () => fit());
        $('#sv-full').addEventListener('click', (e) => {
            const on = $('#sv-work').classList.toggle('full');
            e.currentTarget.setAttribute('aria-pressed', String(on));
            document.body.style.overflow = on ? 'hidden' : '';
            setTimeout(() => { resize(); fit(); }, 30);
        });
        $('#sv-finish').addEventListener('click', finishDraft);
        $('#sv-back').addEventListener('click', () => { if (draft) { draft.pop(); if (!draft.length) draft = null; syncDrawbar(); draw(); } });
        $('#sv-cancel').addEventListener('click', () => { draft = null; syncDrawbar(); draw(); });

        function delPlot() { D.plots = D.plots.filter((p) => p.id !== sel); sel = null; selV = null; commit(); }
        function delVertex() { const p = plotById(sel); if (!p || selV == null || p.pts.length <= 3) return; p.pts.splice(selV, 1); selV = null; if (p.div) divide(p); commit(); }

        /* ---------- side panel ---------- */
        const unitsGrid = (sft) => `<div class="sv-units">${['dec', 'katha', 'bigha', 'acre', 'sft', 'sqm', 'ojut', 'chhatak'].map((u) => `<div><small>${esc(t('sv.u.' + u))}</small><b>${num(sft / AREA_U[u], u === 'acre' || u === 'bigha' ? 4 : 2)}</b></div>`).join('')}</div><div class="sv-mixed">${mixed(sft).map(esc).join('<br>')}</div>`;
        const seg = (name, key, cur, opts) => `<div class="segmented" role="radiogroup">${opts.map(([v, k]) => `<label><input type="radio" name="${name}" value="${v}" data-dv="${key}"${v === cur ? ' checked' : ''}><span>${esc(t(k))}</span></label>`).join('')}</div>`;
        function secSel() {
            const el = $('#sv-sec-sel'), p = sel && plotById(sel);
            el.hidden = !p;
            if (!p) { el.innerHTML = ''; return; }
            const sft = sftOf(p.pts), n = p.pts.length;
            const keep = document.activeElement && el.contains(document.activeElement) ? document.activeElement.dataset.pf : null;
            el.innerHTML = `
                <h3><i class="fa-solid fa-vector-square" style="color:${p.color}"></i><span>${esc(t('sv.sel'))}</span></h3>
                <div class="sv-row">
                    <div class="field"><label for="sv-pf-name">${esc(t('sv.f.name'))}</label><input class="control" id="sv-pf-name" data-pf="name" maxlength="40" autocomplete="off" value="${esc(p.name)}" placeholder="${esc(plotName(p))}"></div>
                    <div class="field"><label for="sv-pf-owner">${esc(t('sv.f.owner'))}</label><input class="control" id="sv-pf-owner" data-pf="owner" maxlength="60" autocomplete="off" value="${esc(p.owner)}"></div>
                </div>
                <div style="margin-top:.75rem" class="sv-big">${esc(fmtArea(sft, 'dec'))}</div>
                <div style="color:var(--muted);font-weight:600;font-size:.85rem">${esc(fmtArea(sft, 'katha'))} · ${esc(fmtArea(sft, 'sft'))}</div>
                ${unitsGrid(sft)}
                <h4>${esc(t('sv.sides'))}</h4>
                <ul class="sv-sides">${p.pts.map((a, i) => `<li><span>${esc(t('sv.side', { n: digits(i + 1) }))}</span><b>${esc(fmtLen(ftOf(a, p.pts[(i + 1) % n])))}</b></li>`).join('')}</ul>
                <p class="sv-note">${esc(t('sv.vHint'))}</p>
                <div class="sv-btns">
                    ${selV != null && n > 3 ? `<button type="button" class="btn btn-ghost btn-sm full" data-act="del-v"><i class="fa-solid fa-circle-minus"></i> ${esc(t('sv.delV'))}</button>` : ''}
                    <button type="button" class="btn btn-danger btn-sm full" data-act="del-plot"><i class="fa-solid fa-trash"></i> ${esc(t('sv.del'))}</button>
                </div>`;
            if (keep) { const k = $(`[data-pf="${keep}"]`, el); if (k) { k.focus(); k.setSelectionRange(k.value.length, k.value.length); } }
        }
        function secDiv() {
            const el = $('#sv-sec-div'), p = sel && plotById(sel);
            el.hidden = !p;
            if (!p) { el.innerHTML = ''; return; }
            const head = `<h3><i class="fa-solid fa-people-arrows"></i><span>${esc(t('sv.p.div'))}</span></h3>`;
            if (!p.div) {
                el.innerHTML = `${head}<p class="sv-note" style="margin:0 0 .6rem">${esc(t('sv.d.hint'))}</p><button type="button" class="btn btn-primary btn-sm btn-block" data-act="div-start"><i class="fa-solid fa-people-arrows"></i> ${esc(t('sv.divide'))}</button>`;
                return;
            }
            const dv = p.div, n = p.pts.length;
            el.innerHTML = `${head}
                <div class="field"><span class="field-label">${esc(t('sv.d.how'))}</span>${seg('svWay', 'way', dv.way, [['front', 'sv.d.front'], ['depth', 'sv.d.depth']])}
                    <p class="sv-note">${esc(t(dv.way === 'depth' ? 'sv.d.depth2' : 'sv.d.front2'))}</p></div>
                <div class="field"><label for="sv-dv-edge">${esc(t('sv.d.edge'))}</label>
                    <select class="control" id="sv-dv-edge" data-dv="edge">${p.pts.map((a, i) => `<option value="${i}"${i === dv.edge ? ' selected' : ''}>${esc(t('sv.side', { n: digits(i + 1) }))} — ${esc(fmtLen(ftOf(a, p.pts[(i + 1) % n])))}</option>`).join('')}</select></div>
                <div class="field"><span class="field-label">${esc(t('sv.d.mode'))}</span>${seg('svMode', 'mode', dv.mode, [['eq', 'sv.d.eq'], ['ratio', 'sv.d.ratio'], ['area', 'sv.d.area']])}</div>
                <div style="margin-top:.7rem" id="sv-shares">${dv.shares.map((s, i) => `
                    <div class="sv-share">
                        <span class="dot" style="background:${PART_COLORS[i % PART_COLORS.length]}"></span>
                        <input data-sh="name" data-i="${i}" maxlength="40" value="${esc(s.name)}" placeholder="${esc(t('sv.d.share', { n: digits(i + 1) }))}" aria-label="${esc(t('sv.d.name'))}">
                        <input data-sh="val" data-i="${i}" inputmode="decimal" value="${esc(s.val)}" placeholder="${esc(dv.mode === 'area' ? t('sv.d.valArea') : dv.mode === 'ratio' ? digits(1) : '—')}" aria-label="${esc(t(dv.mode === 'area' ? 'sv.d.valArea' : 'sv.d.val'))}"${dv.mode === 'eq' ? ' disabled' : ''}>
                        <button type="button" data-act="share-del" data-i="${i}" aria-label="x"${dv.shares.length <= 1 ? ' disabled' : ''}><i class="fa-solid fa-xmark"></i></button>
                    </div>`).join('')}</div>
                <button type="button" class="btn btn-soft btn-sm btn-block" style="margin-top:.55rem" data-act="share-add"><i class="fa-solid fa-user-plus"></i> ${esc(t('sv.d.add'))}</button>
                <div id="sv-divres"></div>
                <p class="sv-note"><i class="fa-solid fa-hand-pointer"></i> ${esc(t('sv.d.drag'))}</p>
                <div class="sv-btns">
                    <button type="button" class="btn btn-ghost btn-sm" data-act="div-exact"${dv.exact !== false ? ' disabled' : ''}><i class="fa-solid fa-bullseye"></i> ${esc(t('sv.d.exact'))}</button>
                    <button type="button" class="btn btn-danger btn-sm" data-act="div-clear"><i class="fa-solid fa-eraser"></i> ${esc(t('sv.d.clear'))}</button>
                </div>`;
            divRes();
        }
        function divRes() {
            const el = $('#sv-divres'), p = sel && plotById(sel);
            if (!el || !p || !p.div) return;
            const tg = targets(p), ps = parts(p), au = D.opt.area, total = tg.total;
            const moved = p.div.exact === false;
            el.innerHTML = `${tg.err ? `<div class="sv-err">${esc(tg.err)}</div>` : ''}
                <table class="sv-parts"><thead><tr><th>${esc(t('sv.e.share'))}</th>${moved ? `<th>${esc(t('sv.d.target'))}</th>` : ''}<th>${esc(t('sv.d.got'))}</th><th>%</th></tr></thead>
                <tbody>${ps.map((q) => `<tr><td><span class="dot" style="background:${q.color}"></span>${esc(q.name)}</td>${moved ? `<td>${esc(num(q.target / AREA_U[au]))}</td>` : ''}<td class="${moved && Math.abs(q.sft - q.target) > total * 1e-4 ? 'off' : ''}">${esc(fmtArea(q.sft, au))}<br><small style="color:var(--muted)">${esc(fmtArea(q.sft, au === 'katha' ? 'dec' : 'katha'))}</small></td><td>${num(q.sft / total * 100, 1)}</td></tr>`).join('')}</tbody>
                <tfoot><tr><td>${esc(t('sv.e.total'))}</td>${moved ? '<td></td>' : ''}<td>${esc(fmtArea(total, au))}</td><td>${num(100, 0)}</td></tr></tfoot></table>
                ${moved ? `<p class="sv-note" style="color:#b45309">${esc(t('sv.d.moved'))}</p>` : ''}`;
            const ex = $('[data-act="div-exact"]', $('#sv-sec-div'));
            if (ex) ex.disabled = !moved;
        }
        function secPlots() {
            const el = $('#sv-sec-plots');
            const tot = D.plots.reduce((s, p) => s + sftOf(p.pts), 0);
            el.innerHTML = `<h3><i class="fa-solid fa-layer-group"></i><span>${esc(t('sv.p.plots'))}</span></h3>
                ${D.plots.length ? D.plots.map((p) => `<button type="button" class="sv-plot" data-plot="${p.id}" aria-current="${p.id === sel}"><i class="dot" style="background:${p.color}"></i><span>${esc(plotName(p))}${p.div ? ' <i class="fa-solid fa-people-arrows" style="color:var(--muted);font-size:.75em"></i>' : ''}</span><small>${esc(fmtArea(sftOf(p.pts), D.opt.area))}</small></button>`).join('')
                    + (D.plots.length > 1 ? `<div class="sv-total"><span>${esc(t('sv.total'))}</span><span>${esc(fmtArea(tot, D.opt.area))}</span></div>` : '')
                    : `<p class="sv-note" style="margin:0">${esc(t('sv.noPlots'))}</p>`}
                ${D.marks.length ? `<h4>${esc(t('sv.m.title'))}</h4><ul class="sv-sides">${D.marks.map((m, i) => `<li><span>${digits(i + 1)}</span><b>${esc(fmtLen(ftOf(m.a, m.b)))}</b></li>`).join('')}</ul>
                    <button type="button" class="btn btn-ghost btn-sm btn-block" style="margin-top:.5rem" data-act="marks-clear"><i class="fa-solid fa-broom"></i> ${esc(t('sv.m.clear'))}</button>` : ''}`;
        }
        function secMap() {
            const el = $('#sv-sec-map'), has = !!(IMG && D.img), sc = D.scale;
            const head = `<h3><i class="fa-solid fa-map"></i><span>${esc(t('sv.p.map'))}</span></h3>`;
            if (!has) {
                el.innerHTML = `${head}<p class="sv-note" style="margin:0 0 .6rem">${esc(t('sv.noImg'))}</p>
                    <button type="button" class="btn btn-primary btn-sm btn-block" data-act="img-choose"><i class="fa-solid fa-file-arrow-up"></i> ${esc(t('sv.choose'))}</button>
                    <h4>${esc(t('sv.p.scale'))}</h4><span class="sv-chip ok"><i class="fa-solid fa-circle-check"></i> ${esc(t('sv.sc.none'))}</span>`;
                return;
            }
            const eff = sc.dpi * (D.img.shrink || 1);                     // pixels per inch of paper in the stored image
            const perInch = sc.f * eff;
            const pages = pdfDoc && D.img.pages > 1;
            const ratioSel = RATIOS[sc.ratio] ? sc.ratio : 'custom';
            el.innerHTML = `${head}
                <div class="sv-note" style="margin:0 0 .5rem;word-break:break-all"><i class="fa-solid fa-file-image"></i> ${esc(D.img.name || '')}</div>
                ${pages ? `<div class="field"><label for="sv-pdfpage">${esc(t('sv.pdfPage'))}</label><select class="control" id="sv-pdfpage">${Array.from({ length: D.img.pages }, (_, i) => `<option value="${i + 1}"${i + 1 === D.img.page ? ' selected' : ''}>${digits(i + 1)}</option>`).join('')}</select></div>` : ''}
                <div class="field"><label for="sv-alpha">${esc(t('sv.alpha'))}</label><input type="range" class="sv-range" id="sv-alpha" min="0.1" max="1" step="0.05" value="${D.opt.alpha}"></div>
                <div class="sv-btns"><button type="button" class="btn btn-ghost btn-sm" data-act="img-choose"><i class="fa-solid fa-arrows-rotate"></i> ${esc(t('sv.replace'))}</button><button type="button" class="btn btn-danger btn-sm" data-act="img-remove"><i class="fa-solid fa-trash"></i> ${esc(t('sv.removeImg'))}</button></div>
                <h4>${esc(t('sv.p.scale'))}</h4>
                <span class="sv-chip ${sc.how === 'known' ? 'ok' : 'warn'}"><i class="fa-solid ${sc.how === 'known' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> ${esc(t(sc.how === 'known' ? 'sv.sc.ok' : 'sv.sc.warn'))}</span>
                <div class="sv-scale-now">${esc(t('sv.sc.now', { v: fmtLen(perInch, 'ft') }))}</div>
                <div class="sv-note" style="margin:0">${esc(t('sv.sc.px', { v: fmtLen(sc.f, D.opt.len === 'ftin' ? 'ft' : D.opt.len) }))}</div>
                <h4><i class="fa-solid fa-ruler-combined"></i> ${esc(t('sv.sc.m1'))}</h4>
                <button type="button" class="btn btn-soft btn-sm btn-block" data-act="pick-calib"><i class="fa-solid fa-crosshairs"></i> ${esc(t(calib.length === 2 ? 'sv.sc.picked' : 'sv.sc.pick'))}</button>
                ${calib.length === 2 ? `<div class="sv-row" style="margin-top:.55rem"><div class="field"><label for="sv-cal-d">${esc(t('sv.sc.dist'))}</label><input class="control" id="sv-cal-d" inputmode="decimal" autocomplete="off"></div>
                    <div class="field"><label for="sv-cal-u">${esc(t('sv.f.unit'))}</label><select class="control" id="sv-cal-u">${LEN_ORDER.map((u) => `<option value="${u}"${u === (sc.calU || 'ft') ? ' selected' : ''}>${esc(t('sv.l.' + u))}</option>`).join('')}</select></div></div>
                    <button type="button" class="btn btn-primary btn-sm btn-block" style="margin-top:.55rem" data-act="cal-apply"><i class="fa-solid fa-check"></i> ${esc(t('sv.sc.apply'))}</button>` : ''}
                <h4><i class="fa-solid fa-print"></i> ${esc(t('sv.sc.m2'))}</h4>
                <div class="field"><label for="sv-sc-r">${esc(t('sv.sc.ratio'))}</label><select class="control" id="sv-sc-r">${['r16', 'r32', 'r64', 'r8', 'custom'].map((r) => `<option value="${r}"${r === ratioSel ? ' selected' : ''}>${esc(t('sv.sc.' + r))}</option>`).join('')}</select></div>
                <div class="sv-row" style="margin-top:.55rem">
                    <div class="field" id="sv-sc-nbox"${ratioSel === 'custom' ? '' : ' hidden'}><label for="sv-sc-n">${esc(t('sv.sc.N'))}</label><input class="control" id="sv-sc-n" inputmode="decimal" autocomplete="off" value="${esc(digits(sc.N || ''))}"></div>
                    <div class="field"><label for="sv-sc-dpi">${esc(t('sv.sc.dpi'))}${D.img.dpiAuto ? ` <small class="opt">(${esc(t('sv.sc.dpiAuto'))})</small>` : ''}</label><input class="control" id="sv-sc-dpi" inputmode="decimal" autocomplete="off" value="${esc(digits(Math.round(sc.dpi * 100) / 100))}"></div>
                </div>
                <button type="button" class="btn btn-ghost btn-sm btn-block" style="margin-top:.55rem" data-act="pre-apply"><i class="fa-solid fa-check"></i> ${esc(t('sv.sc.apply'))}</button>
                <p class="sv-note">${esc(t('sv.sc.help'))}</p>`;
        }
        function renderSide() { secSel(); secDiv(); secPlots(); secMap(); }
        function updateNumbers() { secSel(); divRes(); secPlots(); }
        function syncOpts() {
            $('#sv-len').value = D.opt.len; $('#sv-au').value = D.opt.area;
            $('#sv-x-img').checked = D.opt.xImg !== false; $('#sv-x-only').checked = !!D.opt.xOnly;
            $$('[data-info]', ROOT).forEach((inp) => { inp.value = D.info[inp.dataset.info] || ''; });
        }

        side.addEventListener('click', (e) => {
            const pb = e.target.closest('[data-plot]');
            if (pb) { sel = Number(pb.dataset.plot); selV = null; renderSide(); fitPlot(sel); return; }
            const b = e.target.closest('[data-act]');
            if (!b || b.disabled) return;
            const p = sel && plotById(sel), a = b.dataset.act;
            if (a === 'del-plot') delPlot();
            else if (a === 'del-v') delVertex();
            else if (a === 'div-start' && p) {
                let best = 0, bl = -1;
                p.pts.forEach((q, i) => { const L = dist(q, p.pts[(i + 1) % p.pts.length]); if (L > bl) { bl = L; best = i; } });
                p.div = { way: 'front', edge: best, mode: 'eq', shares: [{ name: '', val: '' }, { name: '', val: '' }], cuts: [], exact: true };
                divide(p); commit(); toast(t('sv.d.done'));
            } else if (a === 'share-add' && p) { p.div.shares.push({ name: '', val: '' }); divide(p); commit(); }
            else if (a === 'share-del' && p) { p.div.shares.splice(Number(b.dataset.i), 1); divide(p); commit(); }
            else if (a === 'div-exact' && p) { divide(p); commit(); }
            else if (a === 'div-clear' && p) { p.div = null; commit(); }
            else if (a === 'marks-clear') { D.marks = []; commit(); }
            else if (a === 'img-choose') $('#sv-file').click();
            else if (a === 'img-remove') removeImage();
            else if (a === 'pick-calib') { calib = []; setTool('calib'); renderSide(); stage.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
            else if (a === 'cal-apply') {
                const d = pnum($('#sv-cal-d').value), u = $('#sv-cal-u').value, px = calib.length === 2 ? dist(calib[0], calib[1]) : 0;
                if (!(px > 0)) { toast(t('sv.sc.need2')); return; }
                if (!(d > 0)) { $('#sv-cal-d').focus(); return; }
                D.scale.f = d * LEN_U[u] / px; D.scale.how = 'known'; D.scale.calU = u;
                calib = []; redivideAll(); commit(); toast(t('sv.sc.done'));
            } else if (a === 'pre-apply') {
                const r = $('#sv-sc-r').value, N = r === 'custom' ? pnum($('#sv-sc-n').value) : RATIOS[r], dpi = pnum($('#sv-sc-dpi').value);
                if (!(N > 0)) { $('#sv-sc-n').focus(); return; }
                if (!(dpi > 0)) { $('#sv-sc-dpi').focus(); return; }
                D.scale = Object.assign(D.scale, { ratio: r, N, dpi, how: 'preset', f: N / (12 * dpi * (D.img.shrink || 1)) });
                redivideAll(); commit(); toast(t('sv.sc.done'));
            }
        });
        side.addEventListener('input', (e) => {
            const el = e.target, p = sel && plotById(sel);
            if (el.dataset.pf && p) { p[el.dataset.pf] = el.value; secPlots(); divRes(); draw(); return; }
            if (el.dataset.sh && p && p.div) {
                const s = p.div.shares[Number(el.dataset.i)]; s[el.dataset.sh] = el.value;
                if (p.div.exact !== false || el.dataset.sh === 'val') divide(p);
                divRes(); draw(); return;
            }
            if (el.id === 'sv-alpha') { D.opt.alpha = Number(el.value); draw(); }
        });
        side.addEventListener('change', (e) => {
            const el = e.target, p = sel && plotById(sel);
            if ((el.dataset.pf || el.dataset.sh) && p) { quiet(); return; }
            if (el.dataset.dv && p && p.div) {
                const k = el.dataset.dv;
                p.div[k] = k === 'edge' ? Number(el.value) : el.value;
                divide(p); commit(); return;
            }
            if (el.id === 'sv-alpha') { save(); return; }
            if (el.id === 'sv-sc-r') { $('#sv-sc-nbox').hidden = el.value !== 'custom'; return; }
            if (el.id === 'sv-pdfpage') { pdfPage(Number(el.value), D.img.name, false); }
        });
        // text edits: keep history without rebuilding the panel (focus stays put)
        function quiet() { hist = hist.slice(0, hi + 1); hist.push(snapshot()); hi = hist.length - 1; save(); syncHist(); }
        function fitPlot(id) {
            const p = plotById(id); if (!p) return;
            const b = bbox(p.pts), s0 = toS([b.x0, b.y0]), s1 = toS([b.x1, b.y1]);
            if (s0[0] < 0 || s0[1] < 0 || s1[0] > cw || s1[1] > ch) fit(id); else draw();
        }

        $('#sv-len').addEventListener('change', (e) => { D.opt.len = e.target.value; save(); renderSide(); draw(); });
        $('#sv-au').addEventListener('change', (e) => { D.opt.area = e.target.value; save(); renderSide(); draw(); });
        $('#sv-x-img').addEventListener('change', (e) => { D.opt.xImg = e.target.checked; save(); });
        $('#sv-x-only').addEventListener('change', (e) => { D.opt.xOnly = e.target.checked; save(); });
        let infoT;
        $$('[data-info]', ROOT).forEach((inp) => inp.addEventListener('input', () => { D.info[inp.dataset.info] = inp.value.trim(); clearTimeout(infoT); infoT = setTimeout(save, 300); }));

        /* ---------- map image (image / PDF) ---------- */
        const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
        function readDpi(b) {
            try {
                if (b[0] === 0x89 && b[1] === 0x50) {                    // PNG → pHYs
                    let i = 8;
                    while (i + 8 < b.length && i < 1e6) {
                        const len = (b[i] << 24 | b[i + 1] << 16 | b[i + 2] << 8 | b[i + 3]) >>> 0, type = String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]);
                        if (type === 'pHYs') { const x = (b[i + 8] << 24 | b[i + 9] << 16 | b[i + 10] << 8 | b[i + 11]) >>> 0; return b[i + 16] === 1 ? Math.round(x * 0.0254) : null; }
                        if (type === 'IDAT') return null;
                        i += 12 + len;
                    }
                }
                if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF && b[3] === 0xE0 && String.fromCharCode(b[6], b[7], b[8], b[9]) === 'JFIF') {
                    const u = b[13], x = b[14] << 8 | b[15];
                    if (u === 1) return x; if (u === 2) return Math.round(x * 2.54);
                }
            } catch (e) { /* unknown */ }
            return null;
        }
        const okDpi = (d) => (d >= 50 && d <= 2400 ? d : null);
        function scaleGeom(k) {
            D.plots.forEach((p) => { p.pts = p.pts.map((q) => [q[0] * k, q[1] * k]); if (p.div && p.div.cuts) p.div.cuts = p.div.cuts.map((c) => c * k); });
            D.marks.forEach((m) => { m.a = [m.a[0] * k, m.a[1] * k]; m.b = [m.b[0] * k, m.b[1] * k]; });
            calib = []; draft = null; mA = null;
        }
        const busy = (on) => { stage.style.opacity = on ? '.55' : ''; stage.style.pointerEvents = on ? 'none' : ''; };
        async function openFile(file) {
            if (!file) return;
            const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
            toast(t('sv.loading')); busy(true);
            try {
                if (isPdf) {
                    if (!window.pdfjsLib) {
                        await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    }
                    pdfDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
                    await pdfPage(1, file.name, true);
                } else {
                    const head = new Uint8Array(await file.slice(0, 65536).arrayBuffer());
                    const dpi = okDpi(readDpi(head));
                    pdfDoc = null;
                    await useImage(file, { name: file.name, dpi: dpi || 300, dpiAuto: !!dpi, pages: 0, page: 0 }, true);
                }
            } catch (err) {
                console.warn('survey map:', err);
                toast(t(isPdf ? 'sv.pdfFail' : 'sv.imgFail'));
            }
            busy(false);
        }
        async function pdfPage(n, name, fresh) {
            if (!pdfDoc) return;
            busy(true);
            try {
                const page = await pdfDoc.getPage(n), v1 = page.getViewport({ scale: 1 });
                const sc = Math.min(300 / 72, 8000 / Math.max(v1.width, v1.height), Math.sqrt(16e6 / (v1.width * v1.height)));
                const vp = page.getViewport({ scale: sc }), c = document.createElement('canvas');
                c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
                const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
                await page.render({ canvasContext: g, viewport: vp }).promise;
                const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92));
                await useImage(blob, { name, dpi: 72 * sc, dpiAuto: true, pages: pdfDoc.numPages, page: n, ready: true }, fresh);
            } catch (err) { console.warn(err); toast(t('sv.pdfFail')); }
            busy(false);
        }
        async function useImage(blob, meta, fresh) {
            let url = URL.createObjectURL(blob), im = await loadImg(url), shrink = 1;
            const w = im.naturalWidth, h = im.naturalHeight;
            const lim = Math.min(1, 8000 / Math.max(w, h), Math.sqrt(16e6 / (w * h)));
            if (lim < 0.999) {
                const c = document.createElement('canvas');
                c.width = Math.round(w * lim); c.height = Math.round(h * lim);
                const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
                blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
                URL.revokeObjectURL(url); url = URL.createObjectURL(blob); im = await loadImg(url); shrink = lim;
                toast(t('sv.bigImg'));
            }
            if (fresh) {
                // a new map: assume the usual mouza scale (16" = 1 mile) and keep any drawing the same size in feet
                const f = 3960 / (12 * meta.dpi * shrink);
                scaleGeom(F() / f);
                D.scale = Object.assign(D.scale, { f, how: 'guess', dpi: meta.dpi, ratio: 'r16', N: 3960 });
            }
            D.img = { w: im.naturalWidth, h: im.naturalHeight, name: meta.name, pages: meta.pages, page: meta.page, shrink, dpiAuto: meta.dpiAuto };
            if (IMG && IMG.src.startsWith('blob:')) URL.revokeObjectURL(IMG.src);
            IMG = im;
            await IDB.set('img', { blob });
            if (fresh) { fitted = false; fit(); }
            commit();
        }
        function removeImage() {
            scaleGeom(F());
            D.scale = Object.assign(D.scale, { f: 1, how: 'none' });
            D.img = null; IMG = null; pdfDoc = null;
            IDB.del('img');
            redivideAll(); commit(); fit();
        }
        $('#sv-up').addEventListener('click', () => $('#sv-file').click());
        $('#sv-file').addEventListener('change', (e) => { const f = e.target.files[0]; e.target.value = ''; openFile(f); });
        stage.addEventListener('dragover', (e) => e.preventDefault());
        stage.addEventListener('drop', (e) => { e.preventDefault(); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) openFile(f); });

        /* ---------- printable sheet (A4, 300 dpi) ---------- */
        async function sheet() {
            const only = D.opt.xOnly && sel ? sel : null;
            const plots = only ? [plotById(only)] : D.plots;
            if (!plots.length) { toast(t('sv.x.empty')); return null; }
            try { await document.fonts.ready; } catch (e) { /* ok */ }
            const W = 2480, H = 3508, k = 2.6, M = 110, pal = palette(true);
            const c = document.createElement('canvas'); c.width = W; c.height = H;
            const g = c.getContext('2d');
            const o0 = { pal, k, v: { z: 1, ox: 0, oy: 0 } };
            const txt = (s, x, y, size, opt) => label(g, s, x, y, o0, size, opt);
            g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
            g.strokeStyle = '#0f172a'; g.lineWidth = 7; g.strokeRect(M / 2, M / 2, W - M, H - M);
            g.lineWidth = 2; g.strokeRect(M / 2 + 16, M / 2 + 16, W - M - 32, H - M - 32);
            // rows of the table
            const rows = [], divided = plots.filter((p) => p.div && p.div.cuts);
            if (divided.length) {
                divided.forEach((p) => parts(p).forEach((q) => rows.push({ dot: q.color, a: divided.length > 1 ? `${plotName(p)} — ${q.name}` : q.name, b: '', sft: q.sft })));
            } else plots.forEach((p) => rows.push({ dot: p.color, a: plotName(p), b: p.owner, sft: sftOf(p.pts) }));
            const rowH = rows.length > 14 ? 56 : 74, tableH = 80 + rowH * (rows.length + 1);
            // title + details
            const title = D.info.title || t(divided.length ? 'sv.e.divTitle' : 'sv.e.plan');
            txt(title, W / 2, 205, 30, { bold: true });
            const I = D.info, det = [['sv.i.mouza', I.mouza], ['sv.i.jl', I.jl], ['sv.i.khatian', I.khatian], ['sv.i.dag', I.dag], ['sv.i.upazila', I.upazila], ['sv.i.district', I.district]]
                .filter(([, v]) => v).map(([kk, v]) => `${t(kk)}: ${v}`);
            if (det.length) {
                g.font = `600 ${14 * k}px ${FONT}`;
                const line = det.join('   •   ');
                if (g.measureText(line).width < W - M * 3) txt(line, W / 2, 290, 14, { color: '#334155' });
                else { const h2 = Math.ceil(det.length / 2); txt(det.slice(0, h2).join('   •   '), W / 2, 275, 14, { color: '#334155' }); txt(det.slice(h2).join('   •   '), W / 2, 330, 14, { color: '#334155' }); }
            }
            // drawing
            const bx = M + 40, by = det.length > 3 ? 380 : 345, bw = W - 2 * bx, bh = Math.max(H - M - 300 - tableH - by, 1300);
            let P = []; plots.forEach((p) => { P = P.concat(p.pts); });
            const fv = fitTo(bbox(P), bw, bh, 170);
            const v = { z: fv.z, ox: fv.ox + bx, oy: fv.oy + by };
            g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
            const selWas = sel; sel = null;
            scene(g, { pal, k, v, W: bw, H: bh, x: bx, y: by, ui: false, img: D.opt.xImg !== false, only });
            sel = selWas;
            g.restore();
            g.strokeStyle = '#94a3b8'; g.lineWidth = 3; g.strokeRect(bx, by, bw, bh);
            const ov = { pal, k, v };
            northArrow(g, bx + bw - 90, by + 120, 48, ov);
            g.save(); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(bx + 20, by + bh - 110, 640, 90); g.restore();
            scaleBar(g, bx + 50, by + bh - 50, 520, ov);
            const perInch = 300 * F() / v.z;                        // printed on A4: 300 px = 1 inch
            txt(t('sv.e.pscale', { v: fmtLen(perInch, 'ft') }), bx, by + bh + 50, 12, { align: 'left', color: '#475569' });
            // table
            let y = by + bh + 120;
            const cols = divided.length
                ? [['sv.e.no', 120, 'left'], ['sv.e.share', 760, 'left'], ['sv.us.dec', 260, 'right'], ['sv.us.katha', 240, 'right'], ['sv.us.sft', 300, 'right'], ['sv.e.sign', 560, 'left']]
                : [['sv.e.no', 120, 'left'], ['sv.e.plot', 520, 'left'], ['sv.e.owner', 560, 'left'], ['sv.us.dec', 260, 'right'], ['sv.us.katha', 240, 'right'], ['sv.us.sft', 340, 'right']];
            const tx0 = bx, tw = cols.reduce((s, cc) => s + cc[1], 0), sx = bw / tw;
            const colX = []; let cx = tx0; cols.forEach((cc) => { colX.push([cx, cx + cc[1] * sx]); cx += cc[1] * sx; });
            const cell = (i, s, yy, opt = {}) => { const [a, b] = colX[i], al = cols[i][2]; txt(s, al === 'right' ? b - 24 : a + 24, yy, opt.size || 12.5, { align: al, bold: opt.bold, color: opt.color }); };
            g.fillStyle = '#0f766e'; g.fillRect(tx0, y, bw, 80);
            cols.forEach((cc, i) => { const [a, b] = colX[i]; g.save(); g.font = `700 ${12.5 * k}px ${FONT}`; g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.textAlign = cc[2]; g.fillText(t(cc[0]), cc[2] === 'right' ? b - 24 : a + 24, y + 40); g.restore(); });
            y += 80;
            let tot = 0;
            rows.forEach((r, i) => {
                if (i % 2) { g.fillStyle = '#f1f5f9'; g.fillRect(tx0, y, bw, rowH); }
                const ym = y + rowH / 2;
                g.fillStyle = r.dot; g.fillRect(colX[0][0] + 24, ym - 14, 28, 28);
                txt(digits(i + 1), colX[0][0] + 70, ym, 12.5, { align: 'left' });
                if (divided.length) { cell(1, r.a, ym, { bold: true }); cell(2, num(r.sft / AREA_U.dec), ym); cell(3, num(r.sft / AREA_U.katha), ym); cell(4, num(r.sft, 0), ym); g.strokeStyle = '#cbd5e1'; g.lineWidth = 2; g.beginPath(); g.moveTo(colX[5][0] + 30, ym + 18); g.lineTo(colX[5][1] - 30, ym + 18); g.stroke(); }
                else { cell(1, r.a, ym, { bold: true }); cell(2, r.b || '—', ym); cell(3, num(r.sft / AREA_U.dec), ym); cell(4, num(r.sft / AREA_U.katha), ym); cell(5, num(r.sft, 0), ym); }
                tot += r.sft; y += rowH;
            });
            g.strokeStyle = '#0f172a'; g.lineWidth = 3; g.beginPath(); g.moveTo(tx0, y); g.lineTo(tx0 + bw, y); g.stroke();
            const ym = y + rowH / 2;
            const ti = divided.length ? [1, 2, 3, 4] : [1, 3, 4, 5];
            cell(ti[0], t('sv.e.total'), ym, { bold: true }); cell(ti[1], num(tot / AREA_U.dec), ym, { bold: true }); cell(ti[2], num(tot / AREA_U.katha), ym, { bold: true }); cell(ti[3], num(tot, 0), ym, { bold: true });
            g.strokeStyle = '#cbd5e1'; g.lineWidth = 2; g.strokeRect(tx0, by + bh + 120, bw, y + rowH - (by + bh + 120));
            // footer
            const fy = H - M / 2 - 150;
            const d = new Date(), date = digits(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
            txt(`${t('sv.e.date')}: ${date}`, bx, fy, 12.5, { align: 'left' });
            if (I.by) txt(`${t('sv.e.by')}: ${I.by}`, bx + bw, fy, 12.5, { align: 'right' });
            txt(t('sv.e.note'), W / 2, fy + 75, 10, { color: '#64748b' });
            return { c, title };
        }
        const slug = (s) => (s || 'survey').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 60) || 'survey';
        $('#sv-png').addEventListener('click', async () => {
            const r = await sheet(); if (!r) return;
            r.c.toBlob((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = slug(r.title) + '.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png');
        });
        $('#sv-print').addEventListener('click', async () => {
            const r = await sheet(); if (!r) return;
            const fr = document.createElement('iframe');
            fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
            document.body.appendChild(fr);
            const doc = fr.contentDocument;
            doc.open(); doc.write(`<!doctype html><html><head><title>${esc(r.title)}</title><style>@page{size:A4;margin:0}html,body{margin:0}img{width:100%;display:block}</style></head><body><img src="${r.c.toDataURL('image/png')}"></body></html>`); doc.close();
            const im = doc.querySelector('img');
            const go = () => { fr.contentWindow.focus(); fr.contentWindow.print(); setTimeout(() => fr.remove(), 60000); };
            if (im.complete) go(); else im.onload = go;
        });

        /* ---------- project file ---------- */
        const toDataUrl = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(blob); });
        $('#sv-save').addEventListener('click', async () => {
            const rec = D.img ? await IDB.get('img') : null;
            const image = rec && rec.blob ? await toDataUrl(rec.blob) : null;
            const blob = new Blob([JSON.stringify({ app: 'construction-solution-survey', v: 1, data: D, image })], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = slug(D.info.title || D.info.mouza || 'survey') + '.json';
            document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        });
        $('#sv-open').addEventListener('click', () => $('#sv-proj').click());
        $('#sv-proj').addEventListener('change', async (e) => {
            const f = e.target.files[0]; e.target.value = '';
            if (!f) return;
            try {
                const j = JSON.parse(await f.text());
                if (!j || j.app !== 'construction-solution-survey' || !j.data) throw new Error('bad');
                D = sanitize(j.data);
                IMG = null; pdfDoc = null;
                if (j.image && D.img) {
                    const blob = await (await fetch(j.image)).blob();
                    IMG = await loadImg(URL.createObjectURL(blob));
                    await IDB.set('img', { blob });
                } else { D.img = null; IDB.del('img'); if (D.scale.how !== 'none') { D.scale.how = 'none'; } }
                sel = null; selV = null; hist = [snapshot()]; hi = 0;
                save(); syncHist(); syncOpts(); renderSide(); fitted = false; fit();
                toast(t('sv.x.opened'));
            } catch (err) { toast(t('sv.x.bad')); }
        });
        $('#sv-new').addEventListener('click', () => {
            if (!window.confirm(t('sv.x.newQ'))) return;
            D = blank(); IMG = null; pdfDoc = null; IDB.del('img');
            sel = null; selV = null; draft = null; calib = []; mA = null;
            syncOpts(); commit(); fitted = false; fit();
        });

        /* ---------- plots coming from the field tab ---------- */
        function addFromFeet(ptsFt, openDiv) {
            const f = F();
            let P = ptsFt.map((q) => [q[0] / f, q[1] / f]);
            const c0 = centroid(P);
            const at = cw ? toW([cw / 2, ch / 2]) : [c0[0], c0[1]];
            P = P.map((q) => [q[0] - c0[0] + at[0], q[1] - c0[1] + at[1]]);
            const id = D.nextId++;
            const p = { id, name: '', owner: '', color: PLOT_COLORS[(id - 1) % PLOT_COLORS.length], pts: P, div: null };
            if (openDiv) {
                let best = 0, bl = -1;
                P.forEach((q, i) => { const L = dist(q, P[(i + 1) % P.length]); if (L > bl) { bl = L; best = i; } });
                p.div = { way: 'front', edge: best, mode: 'eq', shares: [{ name: '', val: '' }, { name: '', val: '' }], cuts: [], exact: true };
                divide(p);
            }
            D.plots.push(p); sel = id; selV = null;
            setTool('select'); commit();
            setTimeout(() => { resize(); fit(id); if (openDiv) { const s = $('#sv-sec-div'); if (s) s.scrollIntoView({ block: 'nearest' }); } }, 60);
        }

        /* ---------- start ---------- */
        D = sanitize(storage.get(STORE, null));
        hist = [snapshot()]; hi = 0;
        syncHist(); syncOpts();
        setTool('select');
        renderSide();
        if (D.img) {
            IDB.get('img').then(async (rec) => {
                if (rec && rec.blob) { try { IMG = await loadImg(URL.createObjectURL(rec.blob)); } catch (e) { IMG = null; } }
                if (!IMG) { D.img = null; }
                fitted = false; renderSide(); fit();
            });
        }
        return {
            resize,
            addFromFeet,
            show() { resize(); draw(); },
            relabel() { if (!D) return; $('#sv-hint').textContent = t('sv.h.' + tool); syncOpts(); renderSide(); draw(); },
            _state: () => ({ D, sel, view, tool, hasImg: !!IMG }),
        };
    })();

    /* =========================================================
       Hook into the site
       ========================================================= */
    window.SURVEY = {
        show() { if (tab === 'map') MAP.show(); },
        relabel() { FIELD.relabel(); CONV.render(); MAP.relabel(); },
        _map: MAP,
    };
    setTab(['map', 'field', 'conv'].includes(tab) ? tab : 'map');
    CS.applyI18n();
    if (CS.page() === 'survey') window.SURVEY.show();
})();