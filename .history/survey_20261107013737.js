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
        'sv.p.export': 'ডাউনলোড ও সংরক্ষণ', 'sv.x.withImg': 'পেছনে মৌজা নকশা রাখুন',
        'sv.x.only': 'শুধু বাছাই করা দাগ', 'sv.x.save': 'প্রজেক্ট ফাইল সেভ', 'sv.x.open': 'প্রজেক্ট ফাইল খুলুন', 'sv.x.new': 'নতুন করে শুরু',
        'sv.x.newQ': 'সব দাগ, বণ্টন ও নকশা মুছে নতুন করে শুরু করবেন?', 'sv.x.bad': 'ফাইলটি সঠিক নয়', 'sv.x.opened': 'প্রজেক্ট খোলা হয়েছে',
        'sv.x.auto': 'সব কাজ এই ডিভাইসে নিজে থেকেই সেভ থাকে।', 'sv.x.empty': 'আগে অন্তত একটি দাগ আঁকুন',
        'sv.e.plan': 'জমির নকশা', 'sv.e.divTitle': 'বণ্টন নকশা', 'sv.e.share': 'শরিকের নাম', 'sv.e.no': 'ক্রম', 'sv.e.total': 'মোট',
        'sv.e.date': 'তারিখ', 'sv.e.scale': 'স্কেল', 'sv.e.sign': 'স্বাক্ষর', 'sv.e.by': 'প্রস্তুতকারী', 'sv.e.plot': 'দাগ', 'sv.e.owner': 'মালিক / নোট',
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
        "sv.t.magic": "অটো দাগ",
        "sv.t.erase": "মুছুন",
        "sv.h.magic": "নকশার যে দাগের ভিতরে ট্যাপ করবেন, তার সীমানা নিজে থেকে খুঁজে দাগ তৈরি হবে · পুরো দাগটা পর্দায় রেখে ট্যাপ করুন",
        "sv.h.erase": "যে দাগ, দূরত্ব বা অবস্থান-বিন্দু মুছতে চান তার উপর ট্যাপ করুন",
        "sv.h.rect4": "নকশায় একটি আয়তক্ষেত্রের ৪ কোণে ক্লিক করুন (যেমন শিটের চারকোনা ফ্রেম বা গ্রিডের একটি ঘর)",
        "sv.h.geo": "নকশায় এমন একটি বিন্দুতে ট্যাপ করুন যার অক্ষাংশ-দ্রাঘিমাংশ জানেন (যেমন দাগের একটি কোণ)",
        "sv.erased": "মুছে ফেলা হয়েছে",
        "sv.delAll": "সব দাগ মুছুন",
        "sv.delAllQ": "সব দাগ ও বণ্টন মুছে ফেলবেন?",
        "sv.delOne": "মুছুন",
        "sv.mg.title": "অটো ডিজিটাইজ",
        "sv.mg.need": "আগে মৌজা নকশা দিন",
        "sv.mg.work": "সীমানা খোঁজা হচ্ছে…",
        "sv.mg.leak": "সীমানা কোথাও ভাঙা, বা দাগটা পুরো পর্দায় নেই — একটু জুম আউট করে আবার ট্যাপ করুন, না হলে হাতে আঁকুন",
        "sv.mg.small": "এখানে কোনো বন্ধ দাগ পাওয়া যায়নি",
        "sv.mg.ok": "অটো দাগ তৈরি হয়েছে: {a}",
        "sv.mg.all": "সব দাগ অটো খুঁজুন",
        "sv.mg.allDone": "{n}টি দাগ পাওয়া গেছে — ভুলগুলো \"মুছুন\" দিয়ে মুছে দিন",
        "sv.mg.none": "কোনো দাগ পাওয়া যায়নি",
        "sv.mg.help": "নকশার কালো লাইন দেখে দাগের সীমানা নিজে থেকে বের করে। পরিষ্কার স্ক্যানে সবচেয়ে ভালো কাজ করে। একটি দাগের জন্য উপরের \"অটো দাগ\" টুল দিয়ে দাগের ভিতরে ট্যাপ করুন; পুরো নকশার জন্য নিচের বাটন।",
        "sv.sc.auto": "অটো স্কেল নিশ্চিত: ফাইলের {d} DPI + নকশার স্কেল",
        "sv.sc.autoPdf": "অটো স্কেল: PDF পাতার মাপ + নকশার স্কেল",
        "sv.sc.photo": "এটি ক্যামেরার ছবি বা ফাইলে DPI লেখা নেই — অটো স্কেল নিশ্চিত নয়। নিচের যেকোনো একটি উপায়ে ঠিক করুন।",
        "sv.sc.pin": "কাগজে রুলার — ইঞ্চি",
        "sv.sc.pcm": "কাগজে রুলার — সেমি",
        "sv.sc.rulerHelp": "কাগজের নকশায় রুলার দিয়ে মেপে থাকলে \"কাগজে রুলার\" একক বেছে নিন — নকশার স্কেল অনুযায়ী আসল দূরত্ব হিসাব হবে।",
        "sv.sc.m3": "ছবি বাঁকা? ৪ কোণ দিয়ে সোজা করুন",
        "sv.sc.m3help": "মোবাইলে তোলা ছবিতে কাগজ একটু কাত থাকলেই মাপ ভুল হয়। নকশার একটি আয়তক্ষেত্রের (শিটের ফ্রেম বা গ্রিডের ঘর) ৪ কোণ বেছে তার মাপ দিন — ছবি সোজা হবে এবং স্কেলও নিশ্চিত হবে।",
        "sv.sc.pick4": "নকশায় ৪ কোণ বাছুন",
        "sv.sc.picked4": "৪ কোণ বাছা হয়েছে",
        "sv.sc.rw": "উপরের বাহু (চওড়া)",
        "sv.sc.rh": "পাশের বাহু (উচ্চতা)",
        "sv.sc.straight": "সোজা করুন ও স্কেল সেট",
        "sv.sc.straightDone": "ছবি সোজা হয়েছে, স্কেল নিশ্চিত",
        "sv.sc.working": "ছবি সোজা করা হচ্ছে…",
        "sv.sc.shrink": "পুরনো কাগজ কিছুটা সংকুচিত হয় (১–২%) — শতভাগ নির্ভুলতার জন্য একবার একটি জানা দূরত্ব দিয়ে মিলিয়ে নিন।",
        "sv.x.paper": "কাগজ",
        "sv.x.orient": "দিক",
        "sv.x.oAuto": "অটো",
        "sv.x.oP": "খাড়া",
        "sv.x.oL": "আড়াআড়ি",
        "sv.x.scale": "প্রিন্ট স্কেল",
        "sv.x.sAuto": "অটো — কাগজে যত বড় আঁটে (প্রমিত স্কেল)",
        "sv.x.sMap": "মৌজা নকশার স্কেলে ({v})",
        "sv.x.sIn": "১ ইঞ্চি = {v} ফুট",
        "sv.x.pdf": "PDF ডাউনলোড",
        "sv.x.png": "ছবি (PNG)",
        "sv.x.print": "প্রিন্ট",
        "sv.x.wa": "WhatsApp-এ পাঠান",
        "sv.x.scaleNote": "স্কেল ঠিক রাখতে: প্রিন্টের সময় \"Actual size / 100%\" বাছুন (\"Fit to page\" নয়)। WhatsApp-এ PDF ডকুমেন্ট হিসেবে যায়, তাই স্কেল বদলায় না। প্রতিটি নকশায় ১ ইঞ্চি ও ৫ সেমির যাচাই-দাগ থাকে — রুলার দিয়ে মিলিয়ে নিন।",
        "sv.x.proj": "প্রজেক্ট ফাইল",
        "sv.x.nofit": "এই স্কেলে নকশা কাগজে আঁটছে না — \"অটো\" স্কেল, আড়াআড়ি বা Legal কাগজ নিন",
        "sv.x.waMsg": "{t} — মোট {a}",
        "sv.x.waDl": "PDF ডাউনলোড হয়েছে — WhatsApp-এ 📎 → Document দিয়ে ফাইলটি পাঠান",
        "sv.x.making": "তৈরি হচ্ছে…",
        "sv.e.check": "প্রিন্ট যাচাই (রুলারে মিলিয়ে নিন):",
        "sv.e.in1": "১ ইঞ্চি",
        "sv.e.cm5": "৫ সেমি",
        "sv.e.pscale": "স্কেল: ১ ইঞ্চি = {v}  ·  ১ : {n}{m}",
        "sv.p.geo": "Google Earth (KML / KMZ)",
        "sv.g.help": "নকশাকে আসল মানচিত্রে বসাতে অন্তত ২টি বিন্দুর অবস্থান (অক্ষাংশ, দ্রাঘিমাংশ) দিন — যেমন দাগের দুটি কোণ। Google Maps-এ জায়গাটি চেপে ধরলে সংখ্যা দুটি পাবেন, অথবা ওই কোণে দাঁড়িয়ে GPS বাটন চাপুন।",
        "sv.g.add": "নকশায় বিন্দু বাছুন",
        "sv.g.ll": "অক্ষাংশ, দ্রাঘিমাংশ",
        "sv.g.llPh": "যেমন: 23.810331, 90.412521",
        "sv.g.gps": "আমার অবস্থান (GPS)",
        "sv.g.gpsWait": "GPS খোঁজা হচ্ছে…",
        "sv.g.gpsOk": "GPS পাওয়া গেছে (±{m} মি)",
        "sv.g.gpsFail": "GPS পাওয়া যায়নি — অনুমতি দিন বা হাতে লিখুন",
        "sv.g.save": "বিন্দু যোগ করুন",
        "sv.g.bad": "সঠিক অক্ষাংশ, দ্রাঘিমাংশ লিখুন",
        "sv.g.pt": "বিন্দু {n}",
        "sv.g.fit": "মিল: ±{r} মি · স্কেল পার্থক্য {s}% · ঘোরানো {d}°",
        "sv.g.one": "১টি বিন্দু: নকশার উপরের দিক উত্তর ধরা হয়েছে — নির্ভুলতার জন্য আরেকটি বিন্দু দিন",
        "sv.g.two": "২টি বিন্দু দিয়ে বসানো হয়েছে — ৩টি দিলে ভুল যাচাই করা যায়",
        "sv.g.kml": "KML (দাগ)",
        "sv.g.kmz": "KMZ (দাগ + নকশা)",
        "sv.g.need": "আগে অন্তত ১টি বিন্দু দিন",
        "sv.g.done": "ফাইল তৈরি হয়েছে — Google Earth-এ খুলুন",
        "sv.g.pending": "বাছা বিন্দুর অবস্থান লিখুন",
        "sv.g.scaleWarn": "নকশার স্কেল আর অবস্থানের দূরত্বে {s}% পার্থক্য — স্কেল বা বিন্দুগুলো আবার দেখুন",
        "sv.g.folderPlots": "দাগ",
        "sv.g.folderParts": "বণ্টন",
        "sv.g.map": "মৌজা নকশা",
        "sv.f.v3d": "৩ডি",
        "sv.f.v2d": "২ডি নকশা",
        "sv.f.tip3d": "টেনে ঘোরান · চাকা / দুই আঙুলে ছোট-বড়",
        "svh.kicker": "নতুন PRO · ভূমি জরিপ",
        "svh.title": "জমির মাপ, <span>বণ্টন নকশা</span> ও খতিয়ান — সার্ভেয়রের সব কাজ এক জায়গায়",
        "svh.sub": "মৌজা নকশা আপলোড করে নির্ভুল স্কেলে দাগের পরিমাণ, শরিকদের মধ্যে বণ্টন, খতিয়ান ও ফারায়েজের হিসাব, Google Earth-এ বসানো আর সঠিক স্কেলে প্রিন্ট — অফিসে বা মাঠে, মোবাইল থেকেই।",
        "svh.tick1": "স্ক্যান বা PDF দিলে স্কেল অটো, মোবাইলের বাঁকা ছবিও সোজা হয়",
        "svh.tick2": "দাগে ট্যাপ করলেই সীমানা নিজে থেকে আঁকা হয়",
        "svh.tick3": "A4 / Legal-এ সঠিক স্কেলে প্রিন্ট ও WhatsApp-এ PDF",
        "svh.f1.t": "মৌজা নকশা থেকে মাপ",
        "svh.f1.d": "১৬\" = ১ মাইলসহ যেকোনো স্কেল — দাগের বাহু, পরিমাণ শতাংশ, কাঠা, বিঘা, একরে।",
        "svh.f2.t": "অটো ডিজিটাইজ",
        "svh.f2.d": "নকশার লাইন দেখে দাগের সীমানা নিজে থেকে খুঁজে বের করে — এক ট্যাপে দাগ।",
        "svh.f3.t": "নির্ভুল বণ্টন",
        "svh.f3.d": "সমান, অনুপাতে বা শতাংশে ভাগ — সবাই রাস্তার দিক পাবে এমনভাবেও। রেখা টেনে ঠিক করা যায়।",
        "svh.f4.t": "খতিয়ান ও ফারায়েজ",
        "svh.f4.d": "দাগভিত্তিক খতিয়ানের জমি, মালিকের হিস্যা, আনা-গণ্ডা রূপান্তর ও ওয়ারিশদের অংশ।",
        "svh.f5.t": "Google Earth (KML/KMZ)",
        "svh.f5.d": "GPS বা Google Maps-এর অবস্থান দিয়ে নকশা ও দাগ আসল মানচিত্রে বসান।",
        "svh.f6.t": "স্কেলসহ প্রিন্ট",
        "svh.f6.d": "চৌহদ্দি, শরিকের তালিকা ও স্বাক্ষরের ঘরসহ বণ্টন নকশা — PDF, প্রিন্ট বা WhatsApp।",
        "svh.see": "ভূমি জরিপ দেখুন",
        "svl.title": "ভূমি জরিপ PRO",
        "svl.sub": "নকশা থেকে মাপ, বণ্টন নকশা, খতিয়ান ও ফারায়েজ, Google Earth — Pro সাবস্ক্রিপশনে সব খুলে যাবে। একক রূপান্তর সবার জন্য ফ্রি।",
        "sv.dir.N": "উত্তর",
        "sv.dir.NE": "উত্তর-পূর্ব",
        "sv.dir.E": "পূর্ব",
        "sv.dir.SE": "দক্ষিণ-পূর্ব",
        "sv.dir.S": "দক্ষিণ",
        "sv.dir.SW": "দক্ষিণ-পশ্চিম",
        "sv.dir.W": "পশ্চিম",
        "sv.dir.NW": "উত্তর-পশ্চিম",
        "sv.ds.N": "উ",
        "sv.ds.NE": "উ-পূ",
        "sv.ds.E": "পূ",
        "sv.ds.SE": "দ-পূ",
        "sv.ds.S": "দ",
        "sv.ds.SW": "দ-প",
        "sv.ds.W": "প",
        "sv.ds.NW": "উ-প",
        "sv.dir.auto": "অটো ({d})",
        "sv.n.title": "দিক: উত্তর, দক্ষিণ, পূর্ব, পশ্চিম",
        "sv.n.top": "নকশার উপরের দিক হলো",
        "sv.n.angle": "উত্তর দিক (ডিগ্রি, ঘড়ির কাঁটার দিকে)",
        "sv.n.pick": "দুই বিন্দু দিয়ে উত্তর বাছুন",
        "sv.n.help": "মৌজা নকশায় উত্তর-চিহ্নের তীর থাকলে প্রথমে তীরের গোড়ায়, তারপর তীরের মাথায় (উত্তরে) ক্লিক করুন। প্রতিটি বাহুর দিক নিজে থেকে বের হবে, দরকার হলে বাহুর পাশের তালিকা থেকে বদলাতে পারবেন।",
        "sv.h.north": "উত্তর-চিহ্নের তীরের গোড়ায়, তারপর মাথায় (উত্তরে) ক্লিক করুন",
        "sv.n.done": "উত্তর দিক সেট হয়েছে",
        "sv.n.showDirs": "নকশায় বাহুর দিক দেখাও",
        "sv.side.dir": "{d} বাহু",
        "sv.cb.title": "চৌহদ্দি (চারপাশে কার জমি)",
        "sv.cb.N": "উত্তরে",
        "sv.cb.S": "দক্ষিণে",
        "sv.cb.E": "পূর্বে",
        "sv.cb.W": "পশ্চিমে",
        "sv.cb.ph": "যেমন: আব্দুল করিমের জমি / রাস্তা",
        "sv.e.bound": "চৌহদ্দি",
        "sv.fo.title": "মাঠের মাপ — জমির পরিমাণ",
        "sv.fo.sides": "মাঠে মাপা বাহু",
        "sv.fo.method": "হিসাব পদ্ধতি",
        "sv.fo.exact": "দুই ত্রিভুজ (কর্ণসহ) — নির্ভুল",
        "sv.fo.approx": "গড় পদ্ধতি — আনুমানিক",
        "sv.fo.heron": "ত্রিভুজ (হেরনের সূত্র)",
        "sv.fo.rect": "দৈর্ঘ্য × প্রস্থ",
        "sv.fo.multi": "ত্রিভুজগুলোর যোগফল",
        "sv.fo.area": "জমির পরিমাণ",
        "sv.fo.diag": "কর্ণ",
        "sv.tab.kh": "খতিয়ান ও ওয়ারিশ",
        "sv.kh.title": "খতিয়ানের দাগ ও জমি",
        "sv.kh.no": "খতিয়ান নং",
        "sv.kh.type": "জরিপ",
        "sv.kh.unit": "জমির একক (খতিয়ানে যেমন লেখা)",
        "sv.kh.dag": "দাগ নং",
        "sv.kh.dagArea": "দাগে মোট জমি",
        "sv.kh.share": "খতিয়ানের অংশ",
        "sv.kh.sharePh": "১ / .৫০০ / ৮ আনা",
        "sv.kh.got": "এই খতিয়ানে",
        "sv.kh.addDag": "দাগ যোগ করুন",
        "sv.kh.total": "খতিয়ানে মোট জমি",
        "sv.kh.help": "খতিয়ানের প্রতিটি দাগে মোট জমি আর এই খতিয়ানের অংশ লিখুন। অংশ দশমিকে (.৫০০), ভগ্নাংশে (১/৩), শতকরায় (৫০%) বা আনা-গণ্ডায় (৮ আনা ১০ গণ্ডা) — যেকোনোভাবে লেখা যায়। খালি রাখলে পুরো দাগ (১) ধরা হবে।",
        "sv.kh.owners": "মালিক ও হিস্যা",
        "sv.kh.owner": "মালিকের নাম",
        "sv.kh.hissa": "হিস্যা",
        "sv.kh.addOwner": "মালিক যোগ করুন",
        "sv.kh.equal": "সবাইকে সমান হিস্যা",
        "sv.kh.sumOk": "হিস্যার যোগফল ঠিক আছে (১৬ আনা)",
        "sv.kh.sumBad": "হিস্যার যোগফল {v} — ১ (১৬ আনা) হওয়ার কথা, খতিয়ানটি আবার দেখুন",
        "sv.kh.perDag": "দাগ অনুযায়ী",
        "sv.kh.ownerN": "মালিক {n}",
        "sv.kh.dagN": "দাগ {n}",
        "sv.kh.land": "জমি",
        "sv.fz.title": "ওয়ারিশ বণ্টন (ফারায়েজ)",
        "sv.fz.whose": "কার জমি বণ্টন হবে",
        "sv.fz.custom": "নিজে পরিমাণ লিখুন",
        "sv.fz.khTotal": "পুরো খতিয়ান",
        "sv.fz.amount": "জমির পরিমাণ",
        "sv.fz.gender": "মৃত ব্যক্তি",
        "sv.fz.male": "পুরুষ",
        "sv.fz.female": "মহিলা",
        "sv.fz.wives": "স্ত্রী (জীবিত)",
        "sv.fz.husband": "স্বামী জীবিত",
        "sv.fz.sons": "পুত্র",
        "sv.fz.daus": "কন্যা",
        "sv.fz.father": "পিতা জীবিত",
        "sv.fz.mother": "মাতা জীবিত",
        "sv.fz.heir": "ওয়ারিশ",
        "sv.fz.share": "অংশ",
        "sv.fz.land": "জমি",
        "sv.fz.wife": "স্ত্রী",
        "sv.fz.son": "পুত্র",
        "sv.fz.dau": "কন্যা",
        "sv.fz.hus": "স্বামী",
        "sv.fz.fa": "পিতা",
        "sv.fz.mo": "মাতা",
        "sv.fz.each": "প্রত্যেকে",
        "sv.fz.awl": "আউল: নির্ধারিত অংশগুলোর যোগফল ১-এর বেশি, তাই সবার অংশ আনুপাতিক হারে কমানো হয়েছে।",
        "sv.fz.radd": "রদ্দ: বাকি অংশ স্বামী/স্ত্রী ছাড়া অন্য অংশীদারদের মধ্যে আনুপাতিকভাবে ফেরত দেওয়া হয়েছে।",
        "sv.fz.none": "অন্তত একজন ওয়ারিশ দিন",
        "sv.fz.yes": "হ্যাঁ",
        "sv.fz.no": "না",
        "sv.fz.note": "মুসলিম উত্তরাধিকার আইনের সাধারণ নিয়মে (স্বামী/স্ত্রী, পুত্র, কন্যা, পিতা, মাতা) হিসাব। ভাই-বোন, দাদা-দাদী, নাতি-নাতনি থাকলে বা অন্য ধর্মের ক্ষেত্রে আইনজীবী / মুফতির পরামর্শ নিন।",
        "sv.fz.toMap": "নকশায় এই অনুপাতে বণ্টন করুন",
        "sv.fz.needPlot": "আগে \"নকশা\" ট্যাবে একটি দাগ বাছাই করুন",
        "sv.fz.sent": "বাছাই করা দাগ ওয়ারিশদের অনুপাতে বণ্টন হয়েছে",
        "sv.hc.title": "হিস্যা রূপান্তর (আনা-গণ্ডা ↔ দশমিক)",
        "sv.hc.in": "হিস্যা লিখুন",
        "sv.hc.ph": "যেমন: ৫ আনা ১০ গণ্ডা / .৩৪৩৭৫ / ১/৩",
        "sv.hc.dec": "দশমিক",
        "sv.hc.frac": "ভগ্নাংশ",
        "sv.hc.pct": "শতকরা",
        "sv.hc.ana": "আনা-গণ্ডা-কড়া-ক্রান্তি",
        "sv.hc.note": "১৬ আনা = ১ (পুরো) · ১ আনা = ২০ গণ্ডা · ১ গণ্ডা = ৪ কড়া · ১ কড়া = ৩ ক্রান্তি · ১ ক্রান্তি = ২০ তিল",
        "sv.hc.bad": "হিস্যাটি বোঝা যায়নি",
        "sv.ana.a": "আনা",
        "sv.ana.g": "গণ্ডা",
        "sv.ana.k": "কড়া",
        "sv.ana.kr": "ক্রান্তি",
        "sv.ana.t": "তিল",
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
        'sv.p.export': 'Download & save', 'sv.x.withImg': 'Keep the mouza map behind',
        'sv.x.only': 'Only the selected plot', 'sv.x.save': 'Save project file', 'sv.x.open': 'Open project file', 'sv.x.new': 'Start over',
        'sv.x.newQ': 'Delete every plot, division and the map and start over?', 'sv.x.bad': 'That file is not valid', 'sv.x.opened': 'Project opened',
        'sv.x.auto': 'Everything is saved on this device automatically.', 'sv.x.empty': 'Draw at least one plot first',
        'sv.e.plan': 'Land map', 'sv.e.divTitle': 'Division map', 'sv.e.share': 'Sharer', 'sv.e.no': 'No.', 'sv.e.total': 'Total',
        'sv.e.date': 'Date', 'sv.e.scale': 'Scale', 'sv.e.sign': 'Signature', 'sv.e.by': 'Prepared by', 'sv.e.plot': 'Plot', 'sv.e.owner': 'Owner / note',
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
        "sv.t.magic": "Auto plot",
        "sv.t.erase": "Erase",
        "sv.h.magic": "Tap inside a plot on the map — its boundary is found and a plot is made · keep the whole plot on screen",
        "sv.h.erase": "Tap a plot, distance or location point to delete it",
        "sv.h.rect4": "Click the 4 corners of a rectangle on the map (the sheet frame or a grid square)",
        "sv.h.geo": "Tap a point on the map whose latitude / longitude you know (e.g. a plot corner)",
        "sv.erased": "Deleted",
        "sv.delAll": "Delete all plots",
        "sv.delAllQ": "Delete every plot and division?",
        "sv.delOne": "Delete",
        "sv.mg.title": "Auto digitize",
        "sv.mg.need": "Add a mouza map first",
        "sv.mg.work": "Finding the boundary…",
        "sv.mg.leak": "The boundary is broken somewhere, or the plot is not fully on screen — zoom out a little and tap again, or draw it by hand",
        "sv.mg.small": "No closed plot found here",
        "sv.mg.ok": "Auto plot made: {a}",
        "sv.mg.all": "Find all plots automatically",
        "sv.mg.allDone": "{n} plots found — delete wrong ones with \"Erase\"",
        "sv.mg.none": "No plots found",
        "sv.mg.help": "Reads the ink lines of the map and traces plot boundaries. Works best on a clean scan. For one plot use the \"Auto plot\" tool and tap inside it; for the whole map use the button below.",
        "sv.sc.auto": "Auto scale confirmed: {d} DPI in the file + map scale",
        "sv.sc.autoPdf": "Auto scale: PDF page size + map scale",
        "sv.sc.photo": "This is a camera photo or the file has no DPI — the auto scale is not certain. Fix it with one of the ways below.",
        "sv.sc.pin": "Ruler on paper — inches",
        "sv.sc.pcm": "Ruler on paper — cm",
        "sv.sc.rulerHelp": "If you measured the paper map with a ruler, choose \"Ruler on paper\" — the real distance is worked out from the map scale.",
        "sv.sc.m3": "Photo at an angle? Straighten with 4 corners",
        "sv.sc.m3help": "A phone photo taken even slightly at an angle measures wrong. Pick the 4 corners of a rectangle on the map (sheet frame or grid square) and give its size — the photo is straightened and the scale becomes exact.",
        "sv.sc.pick4": "Pick 4 corners on the map",
        "sv.sc.picked4": "4 corners picked",
        "sv.sc.rw": "Top side (width)",
        "sv.sc.rh": "Side (height)",
        "sv.sc.straight": "Straighten & set scale",
        "sv.sc.straightDone": "Photo straightened, scale confirmed",
        "sv.sc.working": "Straightening the photo…",
        "sv.sc.shrink": "Old paper shrinks a little (1–2%) — for 100% accuracy match one known distance once.",
        "sv.x.paper": "Paper",
        "sv.x.orient": "Orientation",
        "sv.x.oAuto": "Auto",
        "sv.x.oP": "Portrait",
        "sv.x.oL": "Landscape",
        "sv.x.scale": "Print scale",
        "sv.x.sAuto": "Auto — as large as fits (standard scale)",
        "sv.x.sMap": "Mouza map scale ({v})",
        "sv.x.sIn": "1 inch = {v} ft",
        "sv.x.pdf": "Download PDF",
        "sv.x.png": "Image (PNG)",
        "sv.x.print": "Print",
        "sv.x.wa": "Send on WhatsApp",
        "sv.x.scaleNote": "To keep the scale: print at \"Actual size / 100%\" (not \"Fit to page\"). WhatsApp gets a PDF document, so the scale does not change. Every sheet has a 1 inch and 5 cm check line — match it with a ruler.",
        "sv.x.proj": "Project file",
        "sv.x.nofit": "At this scale the drawing does not fit the paper — choose \"Auto\" scale, landscape or Legal paper",
        "sv.x.waMsg": "{t} — total {a}",
        "sv.x.waDl": "PDF downloaded — send it on WhatsApp with 📎 → Document",
        "sv.x.making": "Preparing…",
        "sv.e.check": "Print check (match with a ruler):",
        "sv.e.in1": "1 inch",
        "sv.e.cm5": "5 cm",
        "sv.e.pscale": "Scale: 1 inch = {v}  ·  1 : {n}{m}",
        "sv.p.geo": "Google Earth (KML / KMZ)",
        "sv.g.help": "To place the map on the real globe give the location (latitude, longitude) of at least 2 points — e.g. two plot corners. Long-press the spot in Google Maps to get the numbers, or stand at that corner and press GPS.",
        "sv.g.add": "Pick a point on the map",
        "sv.g.ll": "Latitude, longitude",
        "sv.g.llPh": "e.g. 23.810331, 90.412521",
        "sv.g.gps": "My location (GPS)",
        "sv.g.gpsWait": "Getting GPS…",
        "sv.g.gpsOk": "GPS found (±{m} m)",
        "sv.g.gpsFail": "No GPS — allow location or type it",
        "sv.g.save": "Add point",
        "sv.g.bad": "Enter a valid latitude, longitude",
        "sv.g.pt": "Point {n}",
        "sv.g.fit": "Fit: ±{r} m · scale difference {s}% · rotated {d}°",
        "sv.g.one": "1 point: the top of the map is taken as north — add another point for accuracy",
        "sv.g.two": "Placed with 2 points — a 3rd point lets you check the error",
        "sv.g.kml": "KML (plots)",
        "sv.g.kmz": "KMZ (plots + map)",
        "sv.g.need": "Add at least 1 point first",
        "sv.g.done": "File ready — open it in Google Earth",
        "sv.g.pending": "Enter the location of the picked point",
        "sv.g.scaleWarn": "{s}% difference between the map scale and the locations — check the scale or the points",
        "sv.g.folderPlots": "Plots",
        "sv.g.folderParts": "Division",
        "sv.g.map": "Mouza map",
        "sv.f.v3d": "3D",
        "sv.f.v2d": "2D drawing",
        "sv.f.tip3d": "Drag to turn · wheel / two fingers to zoom",
        "svh.kicker": "New PRO · Land Survey",
        "svh.title": "Land measuring, <span>division maps</span> and khatian — every survey job in one place",
        "svh.sub": "Upload a mouza map for plot areas at the exact scale, divide between sharers, work out khatian and inheritance shares, place it on Google Earth and print to scale — from the office or the field, even on a phone.",
        "svh.tick1": "Scans and PDFs set the scale automatically, angled phone photos are straightened",
        "svh.tick2": "Tap a plot and its boundary is traced for you",
        "svh.tick3": "True-scale A4 / Legal printing and PDF on WhatsApp",
        "svh.f1.t": "Measure from the mouza map",
        "svh.f1.d": "16\" = 1 mile or any scale — sides and area in decimal, katha, bigha, acre.",
        "svh.f2.t": "Auto digitize",
        "svh.f2.d": "Reads the map lines and finds plot boundaries — one tap per plot.",
        "svh.f3.t": "Exact division",
        "svh.f3.d": "Equal, by ratio or in decimals — even with road frontage for everyone. Drag lines to adjust.",
        "svh.f4.t": "Khatian & inheritance",
        "svh.f4.d": "Land per dag in a khatian, owner shares, ana-gonda conversion and heirs' shares.",
        "svh.f5.t": "Google Earth (KML/KMZ)",
        "svh.f5.d": "Place the map and plots on the real globe with GPS or Google Maps points.",
        "svh.f6.t": "Print to scale",
        "svh.f6.d": "Division map with boundaries, sharer list and signature column — PDF, print or WhatsApp.",
        "svh.see": "Open Land Survey",
        "svl.title": "Land Survey PRO",
        "svl.sub": "Map measuring, division maps, khatian & inheritance, Google Earth — a Pro subscription unlocks everything. The unit converter is free for all.",
        "sv.dir.N": "North",
        "sv.dir.NE": "North-east",
        "sv.dir.E": "East",
        "sv.dir.SE": "South-east",
        "sv.dir.S": "South",
        "sv.dir.SW": "South-west",
        "sv.dir.W": "West",
        "sv.dir.NW": "North-west",
        "sv.ds.N": "N",
        "sv.ds.NE": "NE",
        "sv.ds.E": "E",
        "sv.ds.SE": "SE",
        "sv.ds.S": "S",
        "sv.ds.SW": "SW",
        "sv.ds.W": "W",
        "sv.ds.NW": "NW",
        "sv.dir.auto": "Auto ({d})",
        "sv.n.title": "Directions: north, south, east, west",
        "sv.n.top": "The top of the map is",
        "sv.n.angle": "North (degrees, clockwise)",
        "sv.n.pick": "Pick north with two points",
        "sv.n.help": "If the mouza map has a north arrow, click its tail first, then its head (north). Each side's direction is worked out; change any side from the list if needed.",
        "sv.h.north": "Click the tail of the north arrow, then its head (north)",
        "sv.n.done": "North set",
        "sv.n.showDirs": "Show side directions on the map",
        "sv.side.dir": "{d} side",
        "sv.cb.title": "Boundaries (neighbouring land)",
        "sv.cb.N": "North",
        "sv.cb.S": "South",
        "sv.cb.E": "East",
        "sv.cb.W": "West",
        "sv.cb.ph": "e.g. land of Abdul Karim / road",
        "sv.e.bound": "Boundaries",
        "sv.fo.title": "Field measurement — land area",
        "sv.fo.sides": "Sides measured on site",
        "sv.fo.method": "Method",
        "sv.fo.exact": "Two triangles (with diagonal) — exact",
        "sv.fo.approx": "Average method — estimate",
        "sv.fo.heron": "Triangle (Heron's formula)",
        "sv.fo.rect": "Length × width",
        "sv.fo.multi": "Sum of the triangles",
        "sv.fo.area": "Land area",
        "sv.fo.diag": "Diagonal",
        "sv.tab.kh": "Khatian & heirs",
        "sv.kh.title": "Khatian dags and land",
        "sv.kh.no": "Khatian no.",
        "sv.kh.type": "Survey",
        "sv.kh.unit": "Land unit (as written in the khatian)",
        "sv.kh.dag": "Dag no.",
        "sv.kh.dagArea": "Land in the dag",
        "sv.kh.share": "Khatian share",
        "sv.kh.sharePh": "1 / .500 / 8 ana",
        "sv.kh.got": "In this khatian",
        "sv.kh.addDag": "Add dag",
        "sv.kh.total": "Total land in the khatian",
        "sv.kh.help": "For every dag enter its total land and this khatian's share. The share can be a decimal (.500), fraction (1/3), percent (50%) or ana-gonda (8 ana 10 gonda). Empty means the whole dag (1).",
        "sv.kh.owners": "Owners and shares",
        "sv.kh.owner": "Owner",
        "sv.kh.hissa": "Share",
        "sv.kh.addOwner": "Add owner",
        "sv.kh.equal": "Equal shares for all",
        "sv.kh.sumOk": "Shares add up correctly (16 ana)",
        "sv.kh.sumBad": "Shares add up to {v} — should be 1 (16 ana), check the khatian",
        "sv.kh.perDag": "Per dag",
        "sv.kh.ownerN": "Owner {n}",
        "sv.kh.dagN": "Dag {n}",
        "sv.kh.land": "Land",
        "sv.fz.title": "Inheritance (Faraiz)",
        "sv.fz.whose": "Whose land",
        "sv.fz.custom": "Type an amount",
        "sv.fz.khTotal": "Whole khatian",
        "sv.fz.amount": "Land",
        "sv.fz.gender": "Deceased",
        "sv.fz.male": "Male",
        "sv.fz.female": "Female",
        "sv.fz.wives": "Wives (living)",
        "sv.fz.husband": "Husband living",
        "sv.fz.sons": "Sons",
        "sv.fz.daus": "Daughters",
        "sv.fz.father": "Father living",
        "sv.fz.mother": "Mother living",
        "sv.fz.heir": "Heir",
        "sv.fz.share": "Share",
        "sv.fz.land": "Land",
        "sv.fz.wife": "Wife",
        "sv.fz.son": "Son",
        "sv.fz.dau": "Daughter",
        "sv.fz.hus": "Husband",
        "sv.fz.fa": "Father",
        "sv.fz.mo": "Mother",
        "sv.fz.each": "each",
        "sv.fz.awl": "Awl: the fixed shares add up to more than 1, so every share was reduced in proportion.",
        "sv.fz.radd": "Radd: the remainder was returned to the sharers other than the spouse, in proportion.",
        "sv.fz.none": "Add at least one heir",
        "sv.fz.yes": "Yes",
        "sv.fz.no": "No",
        "sv.fz.note": "Common Muslim inheritance rules (spouse, sons, daughters, father, mother). With brothers/sisters, grandparents, grandchildren or other religions, consult a lawyer / mufti.",
        "sv.fz.toMap": "Divide the map plot in these shares",
        "sv.fz.needPlot": "Select a plot on the \"Map\" tab first",
        "sv.fz.sent": "The selected plot is divided in the heirs' shares",
        "sv.hc.title": "Share converter (ana-gonda ↔ decimal)",
        "sv.hc.in": "Enter a share",
        "sv.hc.ph": "e.g. 5 ana 10 gonda / .34375 / 1/3",
        "sv.hc.dec": "Decimal",
        "sv.hc.frac": "Fraction",
        "sv.hc.pct": "Percent",
        "sv.hc.ana": "Ana-gonda-kora-kranti",
        "sv.hc.note": "16 ana = 1 (whole) · 1 ana = 20 gonda · 1 gonda = 4 kora · 1 kora = 3 kranti · 1 kranti = 20 til",
        "sv.hc.bad": "Could not read that share",
        "sv.ana.a": "ana",
        "sv.ana.g": "gonda",
        "sv.ana.k": "kora",
        "sv.ana.kr": "kranti",
        "sv.ana.t": "til",
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

    /* ---------- file names in plain English letters (Bangla names break in WhatsApp & email) ---------- */
    const BN_C = { 'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng', 'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n', 'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n', 'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n', 'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm', 'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h', 'ৎ': 't', '\u09DC': 'r', '\u09DD': 'rh', '\u09DF': 'y' };
    const BN_V = { 'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou' };
    const BN_S = { 'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou' };
    function roman(str) {
        const s = String(str || '').normalize('NFC').replace(/\u09A1\u09BC/g, '\u09DC').replace(/\u09A2\u09BC/g, '\u09DD').replace(/\u09AF\u09BC/g, '\u09DF');
        let out = '';
        const isL = (c) => !!(c && (BN_C[c] || BN_V[c] || BN_S[c] || c === '্' || c === 'ং' || c === 'ঁ'));
        for (let i = 0; i < s.length; i++) {
            const ch = s[i], nx = s[i + 1];
            if (BN_C[ch]) {
                out += ch === 'য' && s[i - 1] === '্' ? 'y' : BN_C[ch];
                const start = !isL(s[i - 1]);
                if (nx && BN_S[nx]) { out += BN_S[nx]; i++; }
                else if (nx === '্') i++;
                else if (nx === 'ং' || nx === 'ঁ') out += 'o';
                else if (nx && BN_C[nx] && (start || !(BN_S[s[i + 2]]))) out += 'o';   // spoken Bangla drops this "o" before a syllable with its own vowel
            } else if (BN_V[ch]) out += BN_V[ch];
            else if (ch === 'ং') out += 'ng';
            else if (ch === 'ঃ') out += 'h';
            else if (ch === 'ঁ' || ch === '্') out += '';
            else if (/[০-৯]/.test(ch)) out += '০১২৩৪৫৬৭৮৯'.indexOf(ch);
            else out += ch;
        }
        return out;
    }
    function fileName(title, ext) {
        const base = roman(title).replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean)
            .map((w) => w[0].toUpperCase() + w.slice(1)).join('-').slice(0, 60) || 'Land-Survey';
        const d = new Date(), date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return `${base}_${date}.${ext}`;
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
    .sv-plot-row { display: flex; gap: .35rem; align-items: stretch; }
    .sv-plot-row + .sv-plot-row { margin-top: .4rem; }
    .sv-plot-row .sv-plot { flex: 1; min-width: 0; }
    .sv-plot-row .sv-plot + .sv-plot { margin-top: 0; }
    .sv-del { flex: none; width: 2.4rem; border: 1px solid var(--line-2); border-radius: .7rem; background: var(--field); color: var(--muted); cursor: pointer; }
    .sv-del:hover { color: var(--err); border-color: rgba(229, 72, 77, .4); background: var(--err-bg); }
    .sv-sides li .sv-del { width: 1.7rem; height: 1.6rem; border-radius: .45rem; font-size: .7rem; }
    .sv-3d { position: relative; height: 17rem; border-radius: .8rem; overflow: hidden; border: 1px solid var(--line); background: linear-gradient(180deg, #dbeafe 0%, #eef6ff 55%, #f1f5f9 100%); margin-bottom: 1rem; }
    html[data-theme="dark"] .sv-3d { background: linear-gradient(180deg, #1e3a5f 0%, #1b2b44 60%, #162032 100%); }
    .sv-3d canvas { display: block; width: 100%; height: 100%; }
    .sv-3d-tip { position: absolute; left: .6rem; bottom: .5rem; z-index: 1; font-size: .7rem; color: var(--muted); background: var(--glass-strong); padding: .15rem .5rem; border-radius: .4rem; pointer-events: none; }
    .sv-3dwrap[hidden] { display: none; }
    .seg-sm { min-height: 2.4rem; }
    .sv-geo-pt { display: flex; align-items: center; gap: .5rem; font-size: .8rem; padding: .35rem 0; border-bottom: 1px dashed var(--line); }
    .sv-geo-pt b { flex: none; width: 1.4rem; height: 1.4rem; border-radius: 50%; background: #7c3aed; color: #fff; display: grid; place-items: center; font-size: .7rem; }
    .sv-geo-pt span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ui-monospace, monospace; font-size: .75rem; }
    .sv-busy { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; background: rgba(255, 255, 255, .55); font-weight: 700; color: var(--brand-ink); }
    html[data-theme="dark"] .sv-busy { background: rgba(15, 23, 42, .55); }
    .sv-body { position: relative; }
    #survey-root.sv-locked .sv-body > .sv-pane { filter: blur(3px) saturate(.8); pointer-events: none; user-select: none; opacity: .7; }
    #survey-root .sv-lock { align-items: flex-start; }
    .sv-tablewrap { overflow-x: auto; margin-top: .6rem; }
    .sv-kt { width: 100%; border-collapse: collapse; min-width: 34rem; font-size: .85rem; }
    .sv-kt th { text-align: left; font-size: .72rem; color: var(--muted); font-weight: 600; padding: .35rem .3rem; border-bottom: 1px solid var(--line-2); }
    .sv-kt td { padding: .3rem; border-bottom: 1px solid var(--line); vertical-align: middle; }
    .sv-kt td.num, .sv-kt th.num { text-align: right; white-space: nowrap; }
    .sv-kt input { width: 100%; min-height: 2.4rem; padding: .35rem .55rem; border: 1px solid var(--line-2); border-radius: .55rem; background: var(--field); color: var(--ink); font: inherit; font-size: .88rem; }
    .sv-kt input:focus { outline: 0; border-color: var(--brand); box-shadow: 0 0 0 3px rgba(var(--brand-rgb), .15); }
    .sv-kt .bad input { border-color: var(--err); }
    .sv-kt td small { display: block; color: var(--muted); font-size: .7rem; }
    .sv-kt .sv-del { height: 2.2rem; }
    .sv-fzt { width: 100%; border-collapse: collapse; font-size: .85rem; }
    .sv-fzt th { text-align: left; font-size: .72rem; color: var(--muted); padding: .35rem .3rem; border-bottom: 1px solid var(--line-2); }
    .sv-fzt td { padding: .45rem .3rem; border-bottom: 1px solid var(--line); }
    .sv-fzt td.num { text-align: right; white-space: nowrap; }
    .sv-fzt td small { display: block; color: var(--muted); font-size: .7rem; }
    .sv-fzt tfoot td { font-weight: 700; }
    .sv-outbtns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .45rem; margin-top: .6rem; }
    .sv-dirsel { min-height: 1.9rem !important; height: 1.9rem !important; padding: 0 .3rem !important; font-size: .72rem !important; width: auto !important; border-radius: .45rem; border: 1px solid var(--line-2); background: var(--field); color: var(--ink); }
    .sv-sides.dirs li { align-items: center; }
    .sv-cb { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .35rem .5rem; align-items: center; font-size: .8rem; }
    .sv-cb input { min-height: 2.3rem; height: 2.3rem; }
    .sv-nbtns { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .3rem; }
    .sv-nbtns button { min-height: 2.3rem; border: 1px solid var(--line-2); border-radius: .55rem; background: var(--field); color: var(--ink-2); font: inherit; font-size: .78rem; cursor: pointer; }
    .sv-nbtns button[aria-pressed="true"] { background: var(--brand-grad); color: var(--on-brand); border-color: transparent; }
    .sv-show .pro-window-body svg { width: 100%; height: auto; display: block; }
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
        <button type="button" role="tab" data-svtab="kh" aria-selected="false">${icon('fa-file-lines')}<span data-i18n="sv.tab.kh"></span></button>
        <button type="button" role="tab" data-svtab="conv" aria-selected="false">${icon('fa-right-left')}<span data-i18n="sv.tab.conv"></span></button>
    </div>

    <div class="sv-body" id="sv-body">
    <!-- Pro lock (everything except the unit converter) -->
    <div class="pro-lock sv-lock" id="sv-lock" hidden>
        <div class="pro-lock-card">
            <span class="pro-pill"><i class="fa-solid fa-crown"></i> PRO</span>
            <h2 data-i18n="svl.title"></h2>
            <p data-i18n="svl.sub"></p>
            <ul class="pro-ticks">
                <li><i class="fa-solid fa-check"></i><span data-i18n="svh.f1.t"></span></li>
                <li><i class="fa-solid fa-check"></i><span data-i18n="svh.f3.t"></span></li>
                <li><i class="fa-solid fa-check"></i><span data-i18n="svh.f4.t"></span></li>
                <li><i class="fa-solid fa-check"></i><span data-i18n="svh.f5.t"></span></li>
            </ul>
            <button type="button" class="btn btn-pro btn-block" data-buy-pro><i class="fa-solid fa-crown"></i> <span data-pro-cta></span></button>
            <small class="pro-from" data-pro-from></small>
            <button type="button" class="link-btn" data-open-account id="sv-lock-login" data-i18n="lock.haveAcct"></button>
            <small class="lock-pending" id="sv-lock-pending" data-i18n="lock.pending" hidden></small>
        </div>
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
                    <button type="button" class="pt" data-svtool="magic">${icon('fa-wand-magic-sparkles')}<span data-i18n="sv.t.magic"></span></button>
                    <button type="button" class="pt" data-svtool="measure">${icon('fa-ruler')}<span data-i18n="sv.t.measure"></span></button>
                    <button type="button" class="pt" data-svtool="calib">${icon('fa-ruler-combined')}<span data-i18n="sv.t.calib"></span></button>
                    <button type="button" class="pt" data-svtool="erase">${icon('fa-eraser')}<span data-i18n="sv.t.erase"></span></button>
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
                    <section class="sv-sec" id="sv-sec-dir"></section>
                    <section class="sv-sec" id="sv-sec-geo"></section>
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
                        <h3><i class="fa-solid fa-print"></i><span data-i18n="sv.p.export"></span></h3>
                        <div class="sv-row">
                            <div class="field"><label for="sv-paper" data-i18n="sv.x.paper"></label>
                                <select class="control" id="sv-paper"><option value="a4">A4 (210 × 297 mm)</option><option value="legal">Legal (8.5 × 14 in)</option><option value="letter">Letter (8.5 × 11 in)</option></select></div>
                            <div class="field"><label for="sv-orient" data-i18n="sv.x.orient"></label>
                                <select class="control" id="sv-orient"><option value="auto" data-i18n="sv.x.oAuto"></option><option value="p" data-i18n="sv.x.oP"></option><option value="l" data-i18n="sv.x.oL"></option></select></div>
                        </div>
                        <div class="field" style="margin-top:.6rem"><label for="sv-pscale" data-i18n="sv.x.scale"></label><select class="control" id="sv-pscale"></select></div>
                        <div class="sv-row" style="margin-top:.6rem">
                            <div class="field"><label for="sv-len" data-i18n="sv.lenUnit"></label>
                                <select class="control" id="sv-len"><option value="ftin" data-i18n="sv.l.ftin"></option><option value="ft" data-i18n="sv.l.ft"></option><option value="m" data-i18n="sv.l.m"></option><option value="hat" data-i18n="sv.l.hat"></option><option value="link" data-i18n="sv.l.chainlink"></option></select></div>
                            <div class="field"><label for="sv-au" data-i18n="sv.areaUnit"></label>
                                <select class="control" id="sv-au"><option value="dec" data-i18n="sv.u.dec"></option><option value="katha" data-i18n="sv.u.katha"></option><option value="sft" data-i18n="sv.u.sft"></option><option value="sqm" data-i18n="sv.u.sqm"></option><option value="acre" data-i18n="sv.u.acre"></option></select></div>
                        </div>
                        <label class="sv-check"><input type="checkbox" id="sv-x-img" checked><span data-i18n="sv.x.withImg"></span></label>
                        <label class="sv-check"><input type="checkbox" id="sv-x-only"><span data-i18n="sv.x.only"></span></label>
                        <div class="sv-btns">
                            <button type="button" class="btn btn-primary btn-sm" id="sv-pdf">${icon('fa-file-pdf')} <span data-i18n="sv.x.pdf"></span></button>
                            <button type="button" class="btn btn-soft btn-sm" id="sv-png">${icon('fa-image')} <span data-i18n="sv.x.png"></span></button>
                            <button type="button" class="btn btn-soft btn-sm" id="sv-print">${icon('fa-print')} <span data-i18n="sv.x.print"></span></button>
                            <button type="button" class="btn btn-wa btn-sm" id="sv-wa"><i class="fa-brands fa-whatsapp"></i> <span data-i18n="sv.x.wa"></span></button>
                        </div>
                        <div class="sv-okbox" style="margin-top:.7rem"><i class="fa-solid fa-ruler"></i> <span data-i18n="sv.x.scaleNote"></span></div>
                        <h4 data-i18n="sv.x.proj"></h4>
                        <div class="sv-btns" style="margin-top:0">
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
                <div class="card-body">
                    <div class="sv-3dwrap" id="sv-f3dwrap" hidden>
                        <div class="segmented seg-sm" role="radiogroup" style="margin-bottom:.6rem">
                            <label><input type="radio" name="svFView" value="3d" checked><span><i class="fa-solid fa-cube"></i> <span data-i18n="sv.f.v3d"></span></span></label>
                            <label><input type="radio" name="svFView" value="2d"><span><i class="fa-solid fa-vector-square"></i> <span data-i18n="sv.f.v2d"></span></span></label>
                        </div>
                        <div class="sv-3d" id="sv-f3d"><span class="sv-3d-tip" data-i18n="sv.f.tip3d"></span></div>
                    </div>
                    <div id="sv-fres"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- ===== khatian & heirs ===== -->
    <div class="sv-pane" data-svpane="kh" hidden>
        <div class="card">
            <div class="card-head"><h2><i class="fa-solid fa-file-lines"></i> <span data-i18n="sv.kh.title"></span></h2></div>
            <div class="card-body">
                <div class="sv-fields3">
                    <div class="field"><label for="sv-kh-no" data-i18n="sv.kh.no"></label><input class="control" id="sv-kh-no" data-kh="no" autocomplete="off"></div>
                    <div class="field"><label for="sv-kh-type" data-i18n="sv.kh.type"></label><select class="control" id="sv-kh-type" data-kh="type"><option>CS</option><option>SA</option><option>RS</option><option>BS / BRS</option><option>পেটি / Peti</option><option>দিয়ারা / Diara</option></select></div>
                    <div class="field"><label for="sv-kh-unit" data-i18n="sv.kh.unit"></label><select class="control" id="sv-kh-unit" data-kh="unit">${areaOptions('dec')}</select></div>
                </div>
                <p class="sv-note" data-i18n="sv.kh.help"></p>
                <div class="sv-tablewrap"><table class="sv-kt" id="sv-kh-dags"></table></div>
                <button type="button" class="btn btn-soft btn-sm" data-khact="add-dag" style="margin-top:.6rem"><i class="fa-solid fa-plus"></i> <span data-i18n="sv.kh.addDag"></span></button>
                <div class="sv-total" id="sv-kh-total"></div>
            </div>
        </div>
        <div class="sv-grid2" style="margin-top:var(--gap)">
            <div class="card">
                <div class="card-head"><h2><i class="fa-solid fa-users"></i> <span data-i18n="sv.kh.owners"></span></h2></div>
                <div class="card-body">
                    <div class="sv-tablewrap"><table class="sv-kt" id="sv-kh-owners"></table></div>
                    <div class="sv-btns">
                        <button type="button" class="btn btn-soft btn-sm" data-khact="add-owner"><i class="fa-solid fa-user-plus"></i> <span data-i18n="sv.kh.addOwner"></span></button>
                        <button type="button" class="btn btn-ghost btn-sm" data-khact="equal"><i class="fa-solid fa-equals"></i> <span data-i18n="sv.kh.equal"></span></button>
                    </div>
                    <div id="sv-kh-sum"></div>
                    <div id="sv-kh-perdag"></div>
                </div>
            </div>
            <div class="card">
                <div class="card-head"><h2><i class="fa-solid fa-scale-balanced"></i> <span data-i18n="sv.hc.title"></span></h2></div>
                <div class="card-body">
                    <div class="field"><label for="sv-hc-in" data-i18n="sv.hc.in"></label><input class="control" id="sv-hc-in" autocomplete="off" data-i18n-ph="sv.hc.ph"></div>
                    <table class="sv-conv-table" id="sv-hc-out" style="margin-top:.8rem"></table>
                    <p class="sv-note" data-i18n="sv.hc.note"></p>
                </div>
            </div>
        </div>
        <div class="card" style="margin-top:var(--gap)">
            <div class="card-head"><h2><i class="fa-solid fa-people-roof"></i> <span data-i18n="sv.fz.title"></span></h2></div>
            <div class="card-body sv-grid2" style="align-items:start">
                <div id="sv-fz-form">
                    <div class="sv-fields2">
                        <div class="field"><label for="sv-fz-whose" data-i18n="sv.fz.whose"></label><select class="control" id="sv-fz-whose" data-fz="whose"></select></div>
                        <div class="field" id="sv-fz-amtbox"><label for="sv-fz-amt"><span data-i18n="sv.fz.amount"></span> (<span data-fz-unit></span>)</label><input class="control" id="sv-fz-amt" data-fz="amt" inputmode="decimal" autocomplete="off"></div>
                    </div>
                    <div class="field" style="margin-top:.75rem"><span class="field-label" data-i18n="sv.fz.gender"></span>
                        <div class="segmented" role="radiogroup"><label><input type="radio" name="svFzG" value="m" data-fz="g" checked><span data-i18n="sv.fz.male"></span></label><label><input type="radio" name="svFzG" value="f" data-fz="g"><span data-i18n="sv.fz.female"></span></label></div></div>
                    <div class="sv-fields2" style="margin-top:.75rem">
                        <div class="field" data-fz-only="m"><label for="sv-fz-wives" data-i18n="sv.fz.wives"></label><select class="control" id="sv-fz-wives" data-fz="wives"><option value="0">০</option><option value="1" selected>১</option><option value="2">২</option><option value="3">৩</option><option value="4">৪</option></select></div>
                        <div class="field" data-fz-only="f" hidden><label for="sv-fz-hus" data-i18n="sv.fz.husband"></label><select class="control" id="sv-fz-hus" data-fz="hus"><option value="1" data-i18n="sv.fz.yes"></option><option value="0" data-i18n="sv.fz.no"></option></select></div>
                        <div class="field"><label for="sv-fz-sons" data-i18n="sv.fz.sons"></label><input class="control" id="sv-fz-sons" data-fz="sons" inputmode="numeric" autocomplete="off" value="0"></div>
                        <div class="field"><label for="sv-fz-daus" data-i18n="sv.fz.daus"></label><input class="control" id="sv-fz-daus" data-fz="daus" inputmode="numeric" autocomplete="off" value="0"></div>
                        <div class="field"><label for="sv-fz-fa" data-i18n="sv.fz.father"></label><select class="control" id="sv-fz-fa" data-fz="fa"><option value="0" data-i18n="sv.fz.no"></option><option value="1" data-i18n="sv.fz.yes"></option></select></div>
                        <div class="field"><label for="sv-fz-mo" data-i18n="sv.fz.mother"></label><select class="control" id="sv-fz-mo" data-fz="mo"><option value="0" data-i18n="sv.fz.no"></option><option value="1" data-i18n="sv.fz.yes"></option></select></div>
                    </div>
                    <p class="sv-note" data-i18n="sv.fz.note"></p>
                </div>
                <div id="sv-fz-out"></div>
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
        syncLock();
    }
    /* ---------- Pro lock (the unit converter stays free) ---------- */
    let locked = false;
    function syncLock() {
        const show = locked && tab !== 'conv';
        $('#sv-lock').hidden = !show;
        ROOT.classList.toggle('sv-locked', show);
    }
    function lock(l, pending, user) {
        locked = !!l;
        $('#sv-lock-pending').hidden = !(locked && pending);
        $('#sv-lock-login').hidden = !!user;
        syncLock();
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
            const tri = [];
            const parts = st.tris.map((tr) => {
                const [a, b, c] = tr.map((x) => pnum(x) * LEN_U[st.unit]);
                if (!(a > 0 && b > 0 && c > 0)) return null;
                any = true;
                const A = heron(a, b, c);
                if (!(A > 0)) { bad = true; return NaN; }
                sum += A;
                tri.push({ pts: [[0, 0], [a, 0], apex([0, 0], [a, 0], c, b, 1)], sides: [a, b, c] });
                return A;
            });
            if (!any) return null;
            return { sft: sum, parts, tri, err: bad ? t('sv.f.bad') : '' };
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
            show3d(last);
            if (st.shape === 'multi') $$('[data-tri]', tris).forEach((row, i) => { const a = r && r.parts && r.parts[i]; $('[data-tri-area]', row).textContent = a > 0 ? fmtArea(a, 'dec') : (Number.isNaN(a) ? '✕' : ''); });
            // only touch the DOM when something changed (a blur → "change" must not replace a button mid-click)
            const put = (html) => { if (html !== lastHtml) { res.innerHTML = html; lastHtml = html; } };
            if (!r) { put(`<div class="sv-res-empty"><i class="fa-solid fa-ruler-combined"></i>${esc(t('sv.f.empty'))}</div>`); return; }
            if (r.err && !(r.sft > 0)) { put(`<div class="sv-err">${esc(r.err)}</div>`); return; }
            put(`${r.pts ? svg(r).replace('<svg ', `<svg style="${v3 && view3 === '3d' ? 'display:none' : ''}" `) : ''}
                <div class="sv-big">${esc(fmtArea(r.sft, 'dec'))}</div>
                <div style="color:var(--muted);font-weight:600">${esc(fmtArea(r.sft, 'katha'))} · ${esc(fmtArea(r.sft, 'sft'))}</div>
                ${unitsGrid(r.sft)}
                ${r.err ? `<div class="sv-err">${esc(r.err)}</div>` : ''}
                ${r.approx ? `<div class="sv-warnbox"><i class="fa-solid fa-triangle-exclamation"></i> ${esc(t('sv.f.approx'))}</div>` : ''}
                ${r.exact ? `<div class="sv-okbox"><i class="fa-solid fa-circle-check"></i> ${esc(t('sv.f.exactQ'))}</div>` : ''}
                ${r.pts ? `<div class="sv-btns"><button type="button" class="btn btn-soft btn-sm" data-fto="map">${icon('fa-map-location-dot')} <span>${esc(t('sv.f.toMap'))}</span></button><button type="button" class="btn btn-primary btn-sm" data-fto="div">${icon('fa-people-arrows')} <span>${esc(t('sv.f.toDiv'))}</span></button></div>` : ''}
                <div class="sv-outbtns">
                    <button type="button" class="btn btn-soft btn-sm" data-fout="pdf">${icon('fa-file-pdf')} <span>PDF</span></button>
                    <button type="button" class="btn btn-soft btn-sm" data-fout="print">${icon('fa-print')} <span>${esc(t('sv.x.print'))}</span></button>
                    <button type="button" class="btn btn-wa btn-sm" data-fout="wa"><i class="fa-brands fa-whatsapp"></i> <span>WhatsApp</span></button>
                </div>`);
        }
        /* ---------- 3D view of the land ---------- */
        const wrap3 = $('#sv-f3dwrap'), host3 = $('#sv-f3d');
        let v3 = null, view3 = '3d', lastSpec = '';
        function show3d(r) {
            const shapes = [];
            if (r && r.pts) shapes.push({ pts: r.pts, color: '#6fbf73', edges: r.pts.map((p, i) => fmtLen(dist(p, r.pts[(i + 1) % r.pts.length]), 'ftin')), label: fmtArea(r.sft, 'dec') });
            else if (r && r.tri && r.tri.length) {
                // triangles side by side, each with its own colour
                let x = 0;
                const gap = Math.max(...r.tri.map((q) => q.sides[0])) * 0.15;
                r.tri.forEach((q, i) => {
                    const b = bbox(q.pts), pts = q.pts.map((p) => [p[0] - b.x0 + x, p[1]]);
                    shapes.push({ pts, color: ['#6fbf73', '#86c5da', '#e2c35a', '#c39bd3', '#f0a07a'][i % 5], edges: q.sides.map((s) => fmtLen(s, 'ftin')), label: `${digits(i + 1)} · ${fmtArea(heron(...q.sides), 'dec')}` });
                    x += b.x1 - b.x0 + gap;
                });
            }
            wrap3.hidden = !shapes.length;
            host3.hidden = view3 !== '3d';
            if (!shapes.length) return;
            if (!v3) { v3 = SVT.Land3D(host3); if (!v3) { wrap3.hidden = true; view3 = '2d'; return; } }
            const spec = { shapes, diag: r.exact ? [r.pts[0], r.pts[2]] : null, north: t('sv.e.n') };
            const key = JSON.stringify(spec);
            if (key !== lastSpec) { lastSpec = key; v3.update(spec); }
        }
        wrap3.addEventListener('change', (e) => {
            if (e.target.name !== 'svFView') return;
            view3 = e.target.value; host3.hidden = view3 !== '3d';
            const svg = $('.sv-svg', res); if (svg) svg.style.display = view3 === '3d' ? 'none' : '';
            if (v3 && view3 === '3d') v3.refresh();
        });
        box.addEventListener('input', render);
        box.addEventListener('change', render);
        tris.addEventListener('click', (e) => {
            const d = e.target.closest('[data-deltri]');
            if (!d) return;
            read(); st.tris.splice(Number(d.dataset.deltri), 1); triRows(); render();
        });
        $('#sv-addtri').addEventListener('click', () => { read(); st.tris.push(['', '', '']); triRows(); render(); const ins = $$('[data-tri-v]', tris); if (ins.length) ins[ins.length - 3].focus(); });
        // what goes on the printed sheet
        function sheetSpec(r) {
            const U = st.unit, L = (id) => fmtLen(val(id), 'ftin') + (U !== 'ft' ? ` (${CS.numPlain(pnum(st.v[id]))} ${t('sv.l.' + U)})` : '');
            const rows = [], sides = (P) => P.map((p0, i) => fmtLen(dist(p0, P[(i + 1) % P.length]), 'ftin'));
            let shapes = [], method = '';
            if (st.shape === 'rect') { rows.push([t('sv.f.len'), L('sv-f-L')], [t('sv.f.wid'), L('sv-f-W')]); method = t('sv.fo.rect'); }
            if (st.shape === 'tri') { rows.push([t('sv.f.a'), L('sv-f-ta')], [t('sv.f.b'), L('sv-f-tb')], [t('sv.f.c'), L('sv-f-tc')]); method = t('sv.fo.heron'); }
            if (st.shape === 'quad') {
                rows.push([t('sv.f.n'), L('sv-f-qn')], [t('sv.f.e'), L('sv-f-qe')], [t('sv.f.s'), L('sv-f-qs')], [t('sv.f.w'), L('sv-f-qw')]);
                if (val('sv-f-qd') > 0) rows.push([t('sv.fo.diag'), L('sv-f-qd')]);
                method = t(r.exact ? 'sv.fo.exact' : 'sv.fo.approx');
            }
            if (r.pts) shapes = [{ pts: r.pts, edges: sides(r.pts), color: '#0d9488' }];
            else if (r.tri) {
                method = t('sv.fo.multi');
                let x = 0;
                const gap = Math.max(...r.tri.map((q) => q.sides[0])) * 0.25;
                r.tri.forEach((q, i) => {
                    const b = bbox(q.pts);
                    shapes.push({ pts: q.pts.map((p0) => [p0[0] - b.x0 + x, p0[1]]), edges: q.sides.map((v0) => fmtLen(v0, 'ftin')), color: ['#0d9488', '#2563eb', '#d97706', '#7c3aed', '#db2777'][i % 5], label: digits(i + 1) });
                    rows.push([t('sv.f.triN', { n: digits(i + 1) }), q.sides.map((v0) => fmtLen(v0, 'ftin')).join(' · ')]);
                    x += b.x1 - b.x0 + gap;
                });
            }
            return { shapes, diag: r.exact ? [r.pts[0], r.pts[2]] : null, rows, method, sft: r.sft, approx: !!r.approx, quad: st.shape === 'quad' };
        }
        res.addEventListener('click', (e) => {
            const fo = e.target.closest('[data-fout]');
            if (fo && last) { MAP.work(fo, () => MAP.fieldOut(fo.dataset.fout, sheetSpec(last))); return; }
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
       Khatian: land per dag, owners' shares, ana-gonda, inheritance
       ========================================================= */
    const KH = (() => {
        const base = () => ({ no: '', type: 'RS', unit: 'dec', dags: [{ dag: '', area: '', share: '' }], owners: [{ name: '', share: '' }],
            fz: { whose: 'all', amt: '', g: 'm', wives: '1', hus: '1', sons: '0', daus: '0', fa: '0', mo: '0' }, hc: '' });
        let st = Object.assign(base(), storage.get('cc.survey.kh', {}) || {});
        st.fz = Object.assign(base().fz, st.fz || {});
        if (!Array.isArray(st.dags) || !st.dags.length) st.dags = base().dags;
        if (!Array.isArray(st.owners) || !st.owners.length) st.owners = base().owners;
        const save = () => storage.set('cc.survey.kh', st);
        const pane = $('[data-svpane="kh"]', ROOT);

        /* ---------- shares: decimal, fraction, percent or ana-gonda ---------- */
        const ANA = [[/(\d+(?:\.\d+)?)\s*(আনা|ana|anna)/gi, 1 / 16], [/(\d+(?:\.\d+)?)\s*(গণ্ডা|গন্ডা|gonda|ganda)/gi, 1 / 320], [/(\d+(?:\.\d+)?)\s*(কড়া|কড়া|kora|kara)/gi, 1 / 1280], [/(\d+(?:\.\d+)?)\s*(ক্রান্তি|kranti)/gi, 1 / 3840], [/(\d+(?:\.\d+)?)\s*(তিল|til)/gi, 1 / 76800]];
        function parseShare(raw) {
            let s = CS.toEn(String(raw || '')).trim().replace(/,/g, '');
            if (!s) return null;
            if (/[a-zA-Zঀ-৿]/.test(s)) {
                let v = 0, any = false;
                ANA.forEach(([re, k]) => { s.replace(re, (m, n) => { v += Number(n) * k; any = true; return ''; }); });
                return any && v <= 1 + 1e-9 ? v : NaN;
            }
            let m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
            if (m) { const v = Number(m[1]) / Number(m[2]); return Number(m[2]) > 0 && v <= 1 + 1e-9 ? v : NaN; }
            m = s.match(/^(\d*\.?\d+)\s*%$/);
            if (m) { const v = Number(m[1]) / 100; return v <= 1 + 1e-9 ? v : NaN; }
            const v = Number(s);
            return Number.isFinite(v) && v >= 0 && v <= 1 + 1e-9 ? v : NaN;
        }
        function fmtAna(x) {
            let tl = Math.round(x * 76800);
            const parts = [[4800, 'a'], [240, 'g'], [60, 'k'], [20, 'kr'], [1, 't']].map(([u, key]) => { const n = Math.floor(tl / u); tl -= n * u; return [n, key]; }).filter(([n]) => n);
            return parts.length ? parts.map(([n, key]) => `${digits(n)} ${t('sv.ana.' + key)}`).join(' ') : digits(0);
        }
        function fracOf(x) {                                       // best simple fraction (exact when it is one)
            if (!(x > 0)) return digits(0);
            let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
            for (let i = 0; i < 20; i++) {
                const a = Math.floor(b), h = a * h1 + h0, k = a * k1 + k0;
                h0 = h1; h1 = h; k0 = k1; k1 = k;
                if (k1 > 100000 || Math.abs(x - h1 / k1) < 1e-9) break;
                b = 1 / (b - a);
            }
            return Math.abs(x - h1 / k1) < 1e-7 ? digits(`${h1}/${k1}`) : '≈ ' + digits(`${h1}/${k1}`);
        }
        const U = () => (AREA_U[st.unit] ? st.unit : 'dec');
        const uName = (u) => (t('sv.us.' + u) !== 'sv.us.' + u ? t('sv.us.' + u) : t('sv.u.' + u));
        const amt = (v) => `${num(v, U() === 'acre' ? 4 : 3)} ${uName(U())}`;
        const alsoDec = (v) => (U() === 'dec' ? `${num(v * AREA_U[U()] / AREA_U.katha)} ${t('sv.us.katha')}` : `${num(v * AREA_U[U()] / AREA_U.dec)} ${t('sv.us.dec')}`);

        /* ---------- inheritance (common Muslim law cases), exact fractions ---------- */
        const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
        const R = (n, d = 1) => { const g = gcd(n, d); return { n: n / g, d: d / g }; };
        const add = (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d), sub = (a, b) => R(a.n * b.d - b.n * a.d, a.d * b.d);
        const mul = (a, b) => R(a.n * b.n, a.d * b.d), dv = (a, b) => R(a.n * b.d, a.d * b.n), val = (a) => a.n / a.d;
        function faraiz(f) {
            const int = (x) => Math.max(0, Math.min(40, parseInt(CS.toEn(x), 10) || 0));
            const male = f.g !== 'f', wives = male ? int(f.wives) : 0, hus = !male && f.hus === '1';
            const sons = int(f.sons), daus = int(f.daus), fa = f.fa === '1', mo = f.mo === '1', kids = sons + daus > 0;
            const out = [], notes = [];
            if (wives) out.push({ k: 'wife', n: wives, s: kids ? R(1, 8) : R(1, 4), spouse: true });
            if (hus) out.push({ k: 'hus', n: 1, s: kids ? R(1, 4) : R(1, 2), spouse: true });
            const mother = mo ? { k: 'mo', n: 1, s: kids ? R(1, 6) : R(1, 3) } : null;
            if (mother) out.push(mother);
            let father = fa && kids ? { k: 'fa', n: 1, s: R(1, 6) } : null;
            if (father) out.push(father);
            if (!sons && daus) out.push({ k: 'dau', n: daus, s: daus === 1 ? R(1, 2) : R(2, 3) });
            if (!kids && fa && mother && (wives || hus)) mother.s = mul(sub(R(1), out.find((x) => x.spouse).s), R(1, 3));   // Umariyyatain
            if (!out.length && !sons && !fa) return { list: [], notes };
            let F = out.reduce((s, x) => add(s, x.s), R(0));
            if (val(F) > 1 + 1e-12) { out.forEach((x) => { x.s = dv(x.s, F); }); F = R(1); notes.push('awl'); }
            const rest = sub(R(1), F);
            if (val(rest) > 1e-12) {
                if (sons) { const u = 2 * sons + daus; out.push({ k: 'son', n: sons, s: mul(rest, R(2 * sons, u)) }); if (daus) out.push({ k: 'dau', n: daus, s: mul(rest, R(daus, u)) }); }
                else if (fa) { if (father) father.s = add(father.s, rest); else { father = { k: 'fa', n: 1, s: rest }; out.push(father); } }
                else {
                    const non = out.filter((x) => !x.spouse), b = non.reduce((s, x) => add(s, x.s), R(0));
                    if (non.length) { non.forEach((x) => { x.s = add(x.s, mul(rest, dv(x.s, b))); }); notes.push('radd'); }
                    else if (out.length) out[0].s = add(out[0].s, rest);
                }
            }
            return { list: out, notes };
        }
        const HEIR = { wife: 'sv.fz.wife', hus: 'sv.fz.hus', mo: 'sv.fz.mo', fa: 'sv.fz.fa', son: 'sv.fz.son', dau: 'sv.fz.dau' };
        let heirs = [];                                            // individual heirs, for "divide on the map"

        /* ---------- building the tables (only when rows change) ---------- */
        function build() {
            const dagRow = (d, i) => `<tr data-row="${i}"><td>${digits(i + 1)}</td>
                <td><input data-dk="dag" value="${esc(d.dag)}" placeholder="${esc(t('sv.kh.dagN', { n: digits(i + 1) }))}" aria-label="${esc(t('sv.kh.dag'))}"></td>
                <td><input data-dk="area" inputmode="decimal" value="${esc(d.area)}" placeholder="${digits(0)}" aria-label="${esc(t('sv.kh.dagArea'))}"></td>
                <td><input data-dk="share" value="${esc(d.share)}" placeholder="${esc(t('sv.kh.sharePh'))}" aria-label="${esc(t('sv.kh.share'))}"><small data-dshare="${i}"></small></td>
                <td class="num" data-dout="${i}"></td>
                <td><button type="button" class="sv-del" data-khact="del-dag" data-i="${i}" aria-label="x"${st.dags.length < 2 ? ' disabled' : ''}><i class="fa-solid fa-xmark"></i></button></td></tr>`;
            $('#sv-kh-dags').innerHTML = `<thead><tr><th>#</th><th>${esc(t('sv.kh.dag'))}</th><th>${esc(t('sv.kh.dagArea'))} (${esc(uName(U()))})</th><th>${esc(t('sv.kh.share'))}</th><th class="num">${esc(t('sv.kh.got'))}</th><th></th></tr></thead><tbody>${st.dags.map(dagRow).join('')}</tbody>`;
            $('#sv-kh-owners').innerHTML = `<thead><tr><th>#</th><th>${esc(t('sv.kh.owner'))}</th><th>${esc(t('sv.kh.hissa'))}</th><th class="num">${esc(t('sv.kh.land'))}</th><th></th></tr></thead><tbody>${st.owners.map((o, i) => `<tr data-orow="${i}"><td>${digits(i + 1)}</td>
                <td><input data-ok="name" value="${esc(o.name)}" placeholder="${esc(t('sv.kh.ownerN', { n: digits(i + 1) }))}" aria-label="${esc(t('sv.kh.owner'))}"></td>
                <td><input data-ok="share" value="${esc(o.share)}" placeholder="${esc(t('sv.kh.sharePh'))}" aria-label="${esc(t('sv.kh.hissa'))}"><small data-oshare="${i}"></small></td>
                <td class="num" data-oout="${i}"></td>
                <td><button type="button" class="sv-del" data-khact="del-owner" data-i="${i}" aria-label="x"${st.owners.length < 2 ? ' disabled' : ''}><i class="fa-solid fa-xmark"></i></button></td></tr>`).join('')}</tbody>`;
            [['no', 'sv-kh-no'], ['type', 'sv-kh-type'], ['unit', 'sv-kh-unit']].forEach(([k, id]) => { $('#' + id).value = st[k]; });
            $('#sv-hc-in').value = st.hc || '';
            $$('[data-fz]', pane).forEach((el) => { const k = el.dataset.fz; if (el.type === 'radio') el.checked = el.value === st.fz[k]; else if (k !== 'whose') el.value = st.fz[k]; });
            refresh();
        }

        /* ---------- numbers (on every keystroke) ---------- */
        function refresh() {
            // dags
            let total = 0;
            const dagLand = st.dags.map((d, i) => {
                const a = pnum(d.area), sh = parseShare(d.share), s = sh === null ? 1 : sh;
                const row = $(`[data-row="${i}"]`, pane);
                if (row) row.classList.toggle('bad', Number.isNaN(sh));
                const info = $(`[data-dshare="${i}"]`, pane); if (info) info.textContent = sh !== null && !Number.isNaN(sh) ? fmtAna(sh) : '';
                const v = a > 0 && s >= 0 ? a * s : 0;
                const out = $(`[data-dout="${i}"]`, pane); if (out) out.innerHTML = v > 0 ? `${esc(amt(v))}<small>${esc(alsoDec(v))}</small>` : '—';
                total += v;
                return v;
            });
            $('#sv-kh-total').innerHTML = `<span>${esc(t('sv.kh.total'))}${st.no ? ` (${esc(t('sv.kh.no'))} ${esc(digits(st.no))})` : ''}</span><span>${esc(amt(total))} · ${esc(alsoDec(total))}</span>`;
            // owners
            let sum = 0, bad = false;
            const ownShare = st.owners.map((o, i) => {
                const sh = parseShare(o.share), s = sh === null ? 0 : sh;
                if (Number.isNaN(sh)) bad = true;
                const row = $(`[data-orow="${i}"]`, pane); if (row) row.classList.toggle('bad', Number.isNaN(sh));
                const info = $(`[data-oshare="${i}"]`, pane); if (info) info.textContent = sh ? fmtAna(sh) : '';
                const out = $(`[data-oout="${i}"]`, pane); if (out) out.innerHTML = s > 0 ? `${esc(amt(total * s))}<small>${esc(alsoDec(total * s))}</small>` : '—';
                sum += Number.isFinite(s) ? s : 0;
                return Number.isFinite(s) ? s : 0;
            });
            const anyShare = st.owners.some((o) => String(o.share || '').trim());
            $('#sv-kh-sum').innerHTML = !anyShare ? '' : Math.abs(sum - 1) < 1e-4 && !bad
                ? `<div class="sv-okbox"><i class="fa-solid fa-circle-check"></i> ${esc(t('sv.kh.sumOk'))}</div>`
                : `<div class="sv-warnbox"><i class="fa-solid fa-triangle-exclamation"></i> ${esc(t('sv.kh.sumBad', { v: `${num(sum, 4)} (${fmtAna(sum)})` }))}</div>`;
            // owners × dags
            const usedDags = st.dags.map((d, i) => ({ d, i })).filter(({ i }) => dagLand[i] > 0);
            $('#sv-kh-perdag').innerHTML = anyShare && usedDags.length > 1 ? `<h4 style="margin:.9rem 0 .4rem;font-size:.82rem">${esc(t('sv.kh.perDag'))}</h4><div class="sv-tablewrap"><table class="sv-kt" style="min-width:${Math.max(20, usedDags.length * 7 + 9)}rem"><thead><tr><th>${esc(t('sv.kh.owner'))}</th>${usedDags.map(({ d, i }) => `<th class="num">${esc(d.dag ? digits(d.dag) : t('sv.kh.dagN', { n: digits(i + 1) }))}</th>`).join('')}</tr></thead><tbody>${st.owners.map((o, oi) => ownShare[oi] > 0 ? `<tr><td>${esc(o.name || t('sv.kh.ownerN', { n: digits(oi + 1) }))}</td>${usedDags.map(({ i }) => `<td class="num">${esc(num(dagLand[i] * ownShare[oi], 3))}</td>`).join('')}</tr>` : '').join('')}</tbody></table></div>` : '';
            // share converter
            const hv = parseShare(st.hc);
            $('#sv-hc-out').innerHTML = hv === null ? '' : Number.isNaN(hv) ? `<tr><td colspan="2" class="sv-err">${esc(t('sv.hc.bad'))}</td></tr>`
                : [['sv.hc.dec', num(hv, 6)], ['sv.hc.frac', fracOf(hv)], ['sv.hc.pct', `${num(hv * 100, 4)}%`], ['sv.hc.ana', fmtAna(hv)]].map(([k, v]) => `<tr><td>${esc(t(k))}</td><td>${esc(v)}</td></tr>`).join('');
            // inheritance
            const sel = $('#sv-fz-whose'), cur = st.fz.whose;
            sel.innerHTML = `<option value="all">${esc(t('sv.fz.khTotal'))} — ${esc(amt(total))}</option>${st.owners.map((o, i) => ownShare[i] > 0 ? `<option value="o${i}">${esc(o.name || t('sv.kh.ownerN', { n: digits(i + 1) }))} — ${esc(amt(total * ownShare[i]))}</option>` : '').join('')}<option value="custom">${esc(t('sv.fz.custom'))}</option>`;
            sel.value = [...sel.options].some((o) => o.value === cur) ? cur : 'all';
            $('#sv-fz-amtbox').hidden = sel.value !== 'custom';
            $$('[data-fz-unit]', pane).forEach((el) => { el.textContent = uName(U()); });
            $$('[data-fz-only]', pane).forEach((el) => { el.hidden = el.dataset.fzOnly !== (st.fz.g === 'f' ? 'f' : 'm'); });
            const land = sel.value === 'custom' ? pnum(st.fz.amt) || 0 : sel.value === 'all' ? total : total * (ownShare[Number(sel.value.slice(1))] || 0);
            const r = faraiz(st.fz);
            heirs = [];
            if (!r.list.length) { $('#sv-fz-out').innerHTML = `<p class="sv-note">${esc(t('sv.fz.none'))}</p>`; return; }
            const rows = r.list.map((x) => {
                const each = R(x.s.n, x.s.d * x.n), v = val(each);
                for (let i = 0; i < x.n; i++) heirs.push({ name: x.n > 1 ? `${t(HEIR[x.k])} ${digits(i + 1)}` : t(HEIR[x.k]), val: v });
                return `<tr><td>${esc(t(HEIR[x.k]))}${x.n > 1 ? ` × ${digits(x.n)}<small>${esc(t('sv.fz.each'))}</small>` : ''}</td>
                    <td class="num">${esc(digits(`${each.n}/${each.d}`))}<small>${esc(fmtAna(v))}</small></td>
                    <td class="num">${land > 0 ? `${esc(amt(land * v))}<small>${esc(alsoDec(land * v))}</small>` : '—'}</td></tr>`;
            }).join('');
            $('#sv-fz-out').innerHTML = `<table class="sv-fzt"><thead><tr><th>${esc(t('sv.fz.heir'))}</th><th class="num" style="text-align:right">${esc(t('sv.fz.share'))}</th><th class="num" style="text-align:right">${esc(t('sv.fz.land'))}</th></tr></thead><tbody>${rows}</tbody>
                <tfoot><tr><td>${esc(t('sv.e.total'))}</td><td class="num">${digits(1)}</td><td class="num">${land > 0 ? esc(amt(land)) : '—'}</td></tr></tfoot></table>
                ${r.notes.map((n) => `<div class="sv-okbox">${esc(t('sv.fz.' + n))}</div>`).join('')}
                <button type="button" class="btn btn-primary btn-sm btn-block" style="margin-top:.8rem" data-khact="to-map"><i class="fa-solid fa-people-arrows"></i> ${esc(t('sv.fz.toMap'))}</button>`;
        }

        pane.addEventListener('input', (e) => {
            const el = e.target, tr = el.closest('[data-row]'), orow = el.closest('[data-orow]');
            if (el.dataset.dk && tr) st.dags[Number(tr.dataset.row)][el.dataset.dk] = el.value;
            else if (el.dataset.ok && orow) st.owners[Number(orow.dataset.orow)][el.dataset.ok] = el.value;
            else if (el.dataset.kh) { st[el.dataset.kh] = el.value; if (el.dataset.kh === 'unit') { save(); build(); return; } }
            else if (el.id === 'sv-hc-in') st.hc = el.value;
            else if (el.dataset.fz) st.fz[el.dataset.fz] = el.value;
            else return;
            save(); refresh();
        });
        pane.addEventListener('click', (e) => {
            const b = e.target.closest('[data-khact]');
            if (!b || b.disabled) return;
            const a = b.dataset.khact, i = Number(b.dataset.i);
            if (a === 'add-dag') st.dags.push({ dag: '', area: '', share: '' });
            else if (a === 'del-dag') st.dags.splice(i, 1);
            else if (a === 'add-owner') st.owners.push({ name: '', share: '' });
            else if (a === 'del-owner') st.owners.splice(i, 1);
            else if (a === 'equal') { const n = st.owners.length; st.owners.forEach((o) => { o.share = `1/${n}`; }); }
            else if (a === 'to-map') {
                if (!heirs.length) return;
                if (!MAP.applyShares(heirs)) { toast(t('sv.fz.needPlot')); return; }
                setTab('map'); toast(t('sv.fz.sent')); return;
            }
            save(); build();
            if (a === 'add-dag' || a === 'add-owner') { const ins = $$(a === 'add-dag' ? '[data-dk="dag"]' : '[data-ok="name"]', pane); if (ins.length) ins[ins.length - 1].focus(); }
        });
        return { relabel: build, parseShare, fmtAna, faraiz: (f) => { const r = faraiz(f); return r.list.map((x) => ({ k: x.k, n: x.n, s: `${x.s.n}/${x.s.d}` })).concat(r.notes); } };
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
        let northPts = [];
        let draft = null, mA = null, calib = [], rect4 = [], geoPick = null, hover = null, loupe = null, gesture = null;
        let analysis = null;                                     // cached ink map for the auto tools
        const pointers = new Map();
        let hist = [], hi = -1;

        /* ---------- data ---------- */
        const blank = () => ({
            v: 1, nextId: 1, img: null,
            scale: { f: 1, how: 'none', dpi: 300, ratio: 'r16', N: 3960 },
            plots: [], marks: [], info: {}, geo: [],
            opt: { len: 'ftin', area: 'dec', alpha: 0.85, xImg: true, xOnly: false, dirs: true },
            print: { paper: 'a4', orient: 'auto', scale: 'auto' },
            north: 0,                                            // where north points on the map, degrees clockwise from "up"
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
                    pts: p.pts.map((q) => [Number(q[0]) || 0, Number(q[1]) || 0]), div: p.div || null,
                    dirs: p.dirs && typeof p.dirs === 'object' ? p.dirs : {}, bound: p.bound && typeof p.bound === 'object' ? p.bound : {} }));
            out.marks = (Array.isArray(d.marks) ? d.marks : []).filter((m) => m && m.a && m.b);
            out.geo = (Array.isArray(d.geo) ? d.geo : []).filter((g) => g && Number.isFinite(g.lat) && Number.isFinite(g.lon) && Number.isFinite(g.x) && Number.isFinite(g.y));
            out.print = Object.assign(blank().print, d.print || {});
            out.north = Number.isFinite(Number(d.north)) ? Number(d.north) : 0;
            if (out.opt.dirs === undefined) out.opt.dirs = true;
            if (!(out.scale.f > 0)) out.scale.f = 1;
            out.nextId = Math.max(out.nextId || 1, ...out.plots.map((p) => p.id + 1), 1);
            return out;
        }
        const F = () => D.scale.f;                               // feet per map unit
        const sftOf = (P) => pArea(P) * F() * F();
        const ftOf = (a, b) => dist(a, b) * F();
        const plotById = (id) => D.plots.find((p) => p.id === id);
        const plotName = (p) => p.name || t('sv.plotN', { n: digits(D.plots.indexOf(p) + 1) });
        // compass direction an edge faces (outward from the shape around `cen`)
        const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        function dirOf(a, b, cen) {
            let nx = -(b[1] - a[1]), ny = b[0] - a[0];
            const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
            if ((mx - cen[0]) * nx + (my - cen[1]) * ny < 0) { nx = -nx; ny = -ny; }
            const th = (D.north || 0) * Math.PI / 180;
            const north = nx * Math.sin(th) - ny * Math.cos(th), east = nx * Math.cos(th) + ny * Math.sin(th);
            const deg = (Math.atan2(east, north) * 180 / Math.PI + 360) % 360;
            return DIRS[Math.round(deg / 45) % 8];
        }
        const sideDir = (p, i) => (p.dirs && DIRS.includes(p.dirs[i]) ? p.dirs[i] : dirOf(p.pts[i], p.pts[(i + 1) % p.pts.length], labelPt(p.pts)));
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
        function edgeLabel(c, a, b, cen, ft, o, color, dir) {
            const A = toS(a, o.v), B = toS(b, o.v);
            const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
            if (L < 46 * o.k) return;
            let ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
            if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
            const C = toS(cen, o.v), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
            let nx = -(B[1] - A[1]) / L, ny = (B[0] - A[0]) / L;
            if ((mx - C[0]) * nx + (my - C[1]) * ny < 0) { nx = -nx; ny = -ny; }
            label(c, (dir && D.opt.dirs ? `${t('sv.ds.' + dir)} · ` : '') + fmtLen(ft), mx + nx * 11 * o.k, my + ny * 11 * o.k, o, 11, { rot: ang, color });
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
                        edgeLabel(c, a, b, cen, ftOf(a, b), o, null, ps.length ? dirOf(a, b, cen) : sideDir(p, i));
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
            if (o.ui) D.geo.forEach((g, i) => {
                const S = toS([g.x, g.y], v);
                c.save(); c.fillStyle = '#7c3aed'; c.strokeStyle = '#fff'; c.lineWidth = 2;
                c.beginPath(); c.moveTo(S[0], S[1]); c.lineTo(S[0] - 7, S[1] - 13); c.arc(S[0], S[1] - 16, 8, Math.PI * .8, Math.PI * 2.2); c.closePath(); c.fill(); c.stroke();
                c.fillStyle = '#fff'; c.font = `700 10px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(digits(i + 1), S[0], S[1] - 16);
                c.restore();
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
            if (rect4.length) {
                const pts = rect4.length < 4 && h && tool === 'rect4' ? rect4.concat([h]) : rect4;
                c.save(); c.strokeStyle = '#7c3aed'; c.lineWidth = 2.5; c.setLineDash([7, 5]);
                c.beginPath(); pts.forEach((p, i) => { const S = toS(p, v); if (i) c.lineTo(S[0], S[1]); else c.moveTo(S[0], S[1]); }); if (pts.length === 4) c.closePath(); c.stroke();
                c.setLineDash([]);
                rect4.forEach((p, i) => { const S = toS(p, v); c.beginPath(); c.arc(S[0], S[1], 9, 0, 7); c.fillStyle = '#7c3aed'; c.fill(); c.fillStyle = '#fff'; c.font = `700 11px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(digits(i + 1), S[0], S[1] + 1); });
                c.restore();
            }
            if (northPts.length) { const A = toS(northPts[0], v), B = h && tool === 'north' ? toS(h, v) : null; c.save(); c.fillStyle = c.strokeStyle = '#e11d48'; c.lineWidth = 3; c.beginPath(); c.arc(A[0], A[1], 6, 0, 7); c.fill(); if (B) { c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); } c.restore(); }
            if (geoPick) { const S = toS(geoPick, v); c.save(); c.strokeStyle = '#7c3aed'; c.lineWidth = 3; c.beginPath(); c.arc(S[0], S[1], 11, 0, 7); c.stroke(); c.restore(); }
            if (h && PLACE.includes(tool)) {
                const s = toS(h, v);
                c.save(); c.strokeStyle = h.snap ? '#f59e0b' : o.pal.brand; c.lineWidth = 1.5;
                c.beginPath(); c.arc(s[0], s[1], h.snap ? 9 : 6, 0, 7); c.stroke();
                c.beginPath(); c.moveTo(s[0] - 14, s[1]); c.lineTo(s[0] - 4, s[1]); c.moveTo(s[0] + 4, s[1]); c.lineTo(s[0] + 14, s[1]); c.moveTo(s[0], s[1] - 14); c.lineTo(s[0], s[1] - 4); c.moveTo(s[0], s[1] + 4); c.lineTo(s[0], s[1] + 14); c.stroke();
                c.restore();
            }
        }
        function northArrow(c, x, y, r, o) {
            const th = (D.north || 0) * Math.PI / 180;
            c.save(); c.translate(x, y); c.rotate(th);
            c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = o.pal.halo; c.fill(); c.lineWidth = 1.2 * o.k; c.strokeStyle = o.pal.grid2; c.stroke();
            c.beginPath(); c.moveTo(0, -r * .78); c.lineTo(r * .32, r * .35); c.lineTo(0, r * .15); c.closePath(); c.fillStyle = '#e11d48'; c.fill();
            c.beginPath(); c.moveTo(0, -r * .78); c.lineTo(-r * .32, r * .35); c.lineTo(0, r * .15); c.closePath(); c.fillStyle = o.pal.ink; c.fill();
            c.restore();
            label(c, t('sv.e.n'), x + Math.sin(th) * (r + 9 * o.k), y - Math.cos(th) * (r + 9 * o.k), o, 12, { bold: true });
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
            else if (tool === 'rect4' && rect4.length) s = `${digits(rect4.length)} / ${digits(4)}`;
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
        function hit(s, objectsOnly) {
            const p = !objectsOnly && sel && plotById(sel);
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
            for (let i = D.geo.length - 1; i >= 0; i--) { const S = toS([D.geo[i].x, D.geo[i].y]); if (Math.hypot(S[0] - s[0], S[1] - 16 - s[1]) < 13 || Math.hypot(S[0] - s[0], S[1] - s[1]) < 9) return { k: 'geo', i }; }
            for (let i = D.marks.length - 1; i >= 0; i--) { const m = D.marks[i]; if (segDist(s, toS(m.a), toS(m.b)) < 8) return { k: 'mark', i }; }
            for (let i = D.plots.length - 1; i >= 0; i--) if (inPoly(w, D.plots[i].pts)) return { k: 'plot', p: D.plots[i] };
            return { k: 'none' };
        }

        /* ---------- tools ---------- */
        function setTool(tl) {
            if (tl !== 'draw') draft = null;
            if (tl !== 'measure') mA = null;
            if (tl !== 'calib' && calib.length < 2) calib = [];
            if (tl !== 'rect4' && rect4.length < 4) rect4 = [];
            if (tl !== 'north') northPts = [];
            if (['calib', 'rect4', 'magic'].includes(tl) && !(IMG && D.img)) { toast(t(tl === 'magic' ? 'sv.mg.need' : 'sv.noImg')); tl = 'select'; }
            tool = tl;
            stage.dataset.tool = tl;
            $$('[data-svtool]', ROOT).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.svtool === tl)));
            $('#sv-hint').textContent = t('sv.h.' + tl);
            syncDrawbar(); draw();
        }
        function syncDrawbar() { $('#sv-drawbar').hidden = !(tool === 'draw' && draft && draft.length); $('#sv-finish').disabled = !(draft && draft.length >= 3); }
        const PLACE = ['draw', 'measure', 'calib', 'rect4', 'geo', 'north'];
        function focusLater(q) { setTimeout(() => { const inp = $(q); if (inp) { inp.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => inp.focus({ preventScroll: true }), 300); } }, 30); }
        // 4 clicked corners → top-left, top-right, bottom-right, bottom-left
        function orderRect(P) {
            const c = P.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]);
            const Q = P.slice().sort((a, b) => Math.atan2(a[1] - c[1], a[0] - c[0]) - Math.atan2(b[1] - c[1], b[0] - c[0]));
            let k = 0; Q.forEach((p, i) => { if (p[0] + p[1] < Q[k][0] + Q[k][1]) k = i; });
            return Q.slice(k).concat(Q.slice(0, k));
        }
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
            if (tool === 'rect4') {
                const w = snap(s);
                if (rect4.length >= 4) rect4 = [];
                rect4.push([w[0], w[1]]);
                if (rect4.length === 4) { rect4 = orderRect(rect4); setTool('select'); renderSide(); focusLater('#sv-r4-w'); }
                draw(); return;
            }
            if (tool === 'geo') {
                const w = snap(s);
                geoPick = [w[0], w[1]];
                setTool('select'); renderSide(); focusLater('#sv-geo-ll');
                draw(); return;
            }
            if (tool === 'magic') { magicAt(s); return; }
            if (tool === 'north') {
                const w = snap(s);
                northPts.push([w[0], w[1]]);
                if (northPts.length === 2) {
                    const [a, b2] = northPts;
                    if (dist(a, b2) > 0) { D.north = Math.round(Math.atan2(b2[0] - a[0], -(b2[1] - a[1])) * 180 / Math.PI * 10) / 10; }
                    northPts = []; setTool('select'); commit(); toast(t('sv.n.done'));
                } else draw();
                return;
            }
            if (tool === 'erase') {
                const h = hit(s, true);
                if (h.k === 'plot') { D.plots = D.plots.filter((p) => p !== h.p); if (sel === h.p.id) { sel = null; selV = null; } }
                else if (h.k === 'mark') D.marks.splice(h.i, 1);
                else if (h.k === 'geo') D.geo.splice(h.i, 1);
                else return;
                commit(); toast(t('sv.erased')); return;
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
            if (PLACE.includes(tool)) {
                if (touch) { gesture = { k: 'place', s }; loupe = s; hover = snap(s); draw(); }
                else gesture = { k: 'click', s, o: [view.ox, view.oy] };
                return;
            }
            const h = tool === 'select' ? hit(s) : { k: 'none' };
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
            if (PLACE.includes(tool)) { if (!g || g.k !== 'click' || !g.panning) hover = snap(s); }
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
                    p.pts.splice(i + 1, 0, toW(s)); selV = i + 1; p.dirs = {};
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
        function delVertex() { const p = plotById(sel); if (!p || selV == null || p.pts.length <= 3) return; p.pts.splice(selV, 1); selV = null; p.dirs = {}; if (p.div) divide(p); commit(); }

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
                <ul class="sv-sides dirs" style="grid-template-columns:1fr">${p.pts.map((a, i) => { const auto = dirOf(a, p.pts[(i + 1) % n], labelPt(p.pts)), cur = p.dirs && DIRS.includes(p.dirs[i]) ? p.dirs[i] : ''; return `<li><span>${esc(t('sv.side', { n: digits(i + 1) }))} · <select class="sv-dirsel" data-pdir="${i}" aria-label="${esc(t('sv.n.title'))}"><option value="">${esc(t('sv.dir.auto', { d: t('sv.dir.' + auto) }))}</option>${DIRS.map((d) => `<option value="${d}"${d === cur ? ' selected' : ''}>${esc(t('sv.dir.' + d))}</option>`).join('')}</select></span><b>${esc(fmtLen(ftOf(a, p.pts[(i + 1) % n])))}</b></li>`; }).join('')}</ul>
                <h4>${esc(t('sv.cb.title'))}</h4>
                <div class="sv-cb">${['N', 'S', 'E', 'W'].map((d) => `<label for="sv-pb-${d}">${esc(t('sv.cb.' + d))}</label><input class="control" id="sv-pb-${d}" data-pb="${d}" maxlength="80" autocomplete="off" value="${esc((p.bound && p.bound[d]) || '')}" placeholder="${esc(t('sv.cb.ph'))}">`).join('')}</div>
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
                    <select class="control" id="sv-dv-edge" data-dv="edge">${p.pts.map((a, i) => `<option value="${i}"${i === dv.edge ? ' selected' : ''}>${esc(t('sv.side.dir', { d: t('sv.dir.' + sideDir(p, i)) }))} (${digits(i + 1)}) — ${esc(fmtLen(ftOf(a, p.pts[(i + 1) % n])))}</option>`).join('')}</select></div>
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
                ${D.plots.length ? D.plots.map((p) => `<div class="sv-plot-row"><button type="button" class="sv-plot" data-plot="${p.id}" aria-current="${p.id === sel}"><i class="dot" style="background:${p.color}"></i><span>${esc(plotName(p))}${p.div ? ' <i class="fa-solid fa-people-arrows" style="color:var(--muted);font-size:.75em"></i>' : ''}</span><small>${esc(fmtArea(sftOf(p.pts), D.opt.area))}</small></button><button type="button" class="sv-del" data-act="plot-del" data-id="${p.id}" title="${esc(t('sv.delOne'))}" aria-label="${esc(t('sv.delOne'))}"><i class="fa-solid fa-trash-can"></i></button></div>`).join('')
                    + (D.plots.length > 1 ? `<div class="sv-total"><span>${esc(t('sv.total'))}</span><span>${esc(fmtArea(tot, D.opt.area))}</span></div>` : '')
                    + `<button type="button" class="btn btn-danger btn-sm btn-block" style="margin-top:.55rem" data-act="plots-clear"><i class="fa-solid fa-trash-can"></i> ${esc(t('sv.delAll'))}</button>`
                    : `<p class="sv-note" style="margin:0">${esc(t('sv.noPlots'))}</p>`}
                ${D.marks.length ? `<h4>${esc(t('sv.m.title'))}</h4><ul class="sv-sides" style="grid-template-columns:1fr">${D.marks.map((m, i) => `<li><span>${digits(i + 1)}</span><b>${esc(fmtLen(ftOf(m.a, m.b)))}</b><button type="button" class="sv-del" data-act="mark-del" data-i="${i}" aria-label="${esc(t('sv.delOne'))}"><i class="fa-solid fa-xmark"></i></button></li>`).join('')}</ul>
                    <button type="button" class="btn btn-ghost btn-sm btn-block" style="margin-top:.5rem" data-act="marks-clear"><i class="fa-solid fa-broom"></i> ${esc(t('sv.m.clear'))}</button>` : ''}`;
        }
        const ratioName = (N) => { const k = Object.keys(RATIOS).find((r) => Math.abs(RATIOS[r] - N) < 1e-6); return k ? t('sv.sc.' + k) : `১ : ${N}`; };
        const lenUnitOpts = (sel0) => LEN_ORDER.map((u) => `<option value="${u}"${u === sel0 ? ' selected' : ''}>${esc(t('sv.l.' + u))}</option>`).join('')
            + `<option value="pin"${sel0 === 'pin' ? ' selected' : ''}>${esc(t('sv.sc.pin'))}</option><option value="pcm"${sel0 === 'pcm' ? ' selected' : ''}>${esc(t('sv.sc.pcm'))}</option>`;
        // a typed length → feet on the ground ("ruler on paper" uses the map scale)
        const groundFt = (v, u) => (u === 'pin' ? v * D.scale.N / 12 : u === 'pcm' ? v / 2.54 * D.scale.N / 12 : v * LEN_U[u]);
        function secMap() {
            const el = $('#sv-sec-map'), has = !!(IMG && D.img), sc = D.scale;
            const head = `<h3><i class="fa-solid fa-map"></i><span>${esc(t('sv.p.map'))}</span></h3>`;
            if (!has) {
                el.innerHTML = `${head}<p class="sv-note" style="margin:0 0 .6rem">${esc(t('sv.noImg'))}</p>
                    <button type="button" class="btn btn-primary btn-sm btn-block" data-act="img-choose"><i class="fa-solid fa-file-arrow-up"></i> ${esc(t('sv.choose'))}</button>
                    <h4>${esc(t('sv.p.scale'))}</h4><span class="sv-chip ok"><i class="fa-solid fa-circle-check"></i> ${esc(t('sv.sc.none'))}</span>`;
                return;
            }
            const eff = sc.dpi * (D.img.shrink || 1);
            const perInch = sc.how === 'known' ? null : sc.f * eff;
            const pages = pdfDoc && D.img.pages > 1;
            const ratioSel = RATIOS[sc.ratio] ? sc.ratio : 'custom';
            const ok = sc.how === 'known' || sc.how === 'auto';
            const chip = sc.how === 'known' ? t('sv.sc.ok') : sc.how === 'auto' ? (D.img.pdf ? t('sv.sc.autoPdf') : t('sv.sc.auto', { d: digits(Math.round(sc.dpi)) })) : sc.how === 'preset' ? t('sv.sc.warn') : t('sv.sc.photo');
            el.innerHTML = `${head}
                <div class="sv-note" style="margin:0 0 .5rem;word-break:break-all"><i class="fa-solid fa-file-image"></i> ${esc(D.img.name || '')}</div>
                ${pages ? `<div class="field"><label for="sv-pdfpage">${esc(t('sv.pdfPage'))}</label><select class="control" id="sv-pdfpage">${Array.from({ length: D.img.pages }, (_, i) => `<option value="${i + 1}"${i + 1 === D.img.page ? ' selected' : ''}>${digits(i + 1)}</option>`).join('')}</select></div>` : ''}
                <div class="field"><label for="sv-alpha">${esc(t('sv.alpha'))}</label><input type="range" class="sv-range" id="sv-alpha" min="0.1" max="1" step="0.05" value="${D.opt.alpha}"></div>
                <div class="sv-btns"><button type="button" class="btn btn-ghost btn-sm" data-act="img-choose"><i class="fa-solid fa-arrows-rotate"></i> ${esc(t('sv.replace'))}</button><button type="button" class="btn btn-danger btn-sm" data-act="img-remove"><i class="fa-solid fa-trash"></i> ${esc(t('sv.removeImg'))}</button></div>

                <h4>${esc(t('sv.p.scale'))}</h4>
                <div class="field"><label for="sv-sc-r">${esc(t('sv.sc.ratio'))}</label><select class="control" id="sv-sc-r">${['r16', 'r32', 'r64', 'r8', 'custom'].map((r) => `<option value="${r}"${r === ratioSel ? ' selected' : ''}>${esc(t('sv.sc.' + r))}</option>`).join('')}</select></div>
                <div class="field" id="sv-sc-nbox"${ratioSel === 'custom' ? '' : ' hidden'} style="margin-top:.5rem"><label for="sv-sc-n">${esc(t('sv.sc.N'))}</label><input class="control" id="sv-sc-n" inputmode="decimal" autocomplete="off" value="${esc(digits(sc.N || ''))}"></div>
                <div style="margin-top:.55rem"><span class="sv-chip ${ok ? 'ok' : 'warn'}"><i class="fa-solid ${ok ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> ${esc(chip)}</span></div>
                <div class="sv-scale-now">${esc(t('sv.sc.px', { v: fmtLen(sc.f, D.opt.len === 'ftin' ? 'ft' : D.opt.len) }))}${perInch ? ` · ${esc(t('sv.sc.now', { v: fmtLen(perInch, 'ft') }))}` : ''}</div>
                ${ok ? `<p class="sv-note" style="margin:0">${esc(t('sv.sc.shrink'))}</p>` : ''}

                <h4><i class="fa-solid fa-ruler-combined"></i> ${esc(t('sv.sc.m1'))}</h4>
                <button type="button" class="btn btn-soft btn-sm btn-block" data-act="pick-calib"><i class="fa-solid fa-crosshairs"></i> ${esc(t(calib.length === 2 ? 'sv.sc.picked' : 'sv.sc.pick'))}</button>
                ${calib.length === 2 ? `<div class="sv-row" style="margin-top:.55rem"><div class="field"><label for="sv-cal-d">${esc(t('sv.sc.dist'))}</label><input class="control" id="sv-cal-d" inputmode="decimal" autocomplete="off"></div>
                    <div class="field"><label for="sv-cal-u">${esc(t('sv.f.unit'))}</label><select class="control" id="sv-cal-u">${lenUnitOpts(sc.calU || 'ft')}</select></div></div>
                    <button type="button" class="btn btn-primary btn-sm btn-block" style="margin-top:.55rem" data-act="cal-apply"><i class="fa-solid fa-check"></i> ${esc(t('sv.sc.apply'))}</button>` : ''}
                <p class="sv-note">${esc(t('sv.sc.rulerHelp'))}</p>

                <h4><i class="fa-solid fa-crop-simple"></i> ${esc(t('sv.sc.m3'))}</h4>
                <p class="sv-note" style="margin:0 0 .5rem">${esc(t('sv.sc.m3help'))}</p>
                <button type="button" class="btn btn-soft btn-sm btn-block" data-act="pick-rect4"><i class="fa-solid fa-vector-square"></i> ${esc(t(rect4.length === 4 ? 'sv.sc.picked4' : 'sv.sc.pick4'))}</button>
                ${rect4.length === 4 ? `<div class="sv-row" style="margin-top:.55rem"><div class="field"><label for="sv-r4-w">${esc(t('sv.sc.rw'))}</label><input class="control" id="sv-r4-w" inputmode="decimal" autocomplete="off"></div>
                    <div class="field"><label for="sv-r4-h">${esc(t('sv.sc.rh'))}</label><input class="control" id="sv-r4-h" inputmode="decimal" autocomplete="off"></div></div>
                    <div class="field" style="margin-top:.5rem"><label for="sv-r4-u">${esc(t('sv.f.unit'))}</label><select class="control" id="sv-r4-u">${lenUnitOpts(sc.r4U || 'pin')}</select></div>
                    <button type="button" class="btn btn-primary btn-sm btn-block" style="margin-top:.55rem" data-act="r4-apply"><i class="fa-solid fa-wand-magic"></i> ${esc(t('sv.sc.straight'))}</button>` : ''}

                <h4><i class="fa-solid fa-print"></i> ${esc(t('sv.sc.m2'))}</h4>
                <div class="sv-row" style="align-items:end"><div class="field"><label for="sv-sc-dpi">${esc(t('sv.sc.dpi'))}${D.img.dpiAuto ? ` <small class="opt">(${esc(t('sv.sc.dpiAuto'))})</small>` : ''}</label><input class="control" id="sv-sc-dpi" inputmode="decimal" autocomplete="off" value="${esc(digits(Math.round(sc.dpi * 100) / 100))}"></div>
                <button type="button" class="btn btn-ghost btn-sm" data-act="pre-apply"><i class="fa-solid fa-check"></i> ${esc(t('sv.sc.apply'))}</button></div>
                <p class="sv-note">${esc(t('sv.sc.help'))}</p>

                <h4><i class="fa-solid fa-wand-magic-sparkles"></i> ${esc(t('sv.mg.title'))}</h4>
                <p class="sv-note" style="margin:0 0 .5rem">${esc(t('sv.mg.help'))}</p>
                <button type="button" class="btn btn-soft btn-sm btn-block" data-act="auto-all"><i class="fa-solid fa-wand-magic-sparkles"></i> ${esc(t('sv.mg.all'))}</button>`;
        }
        function secDir() {
            const el = $('#sv-sec-dir'), n = D.north || 0;
            const tops = [['N', 0], ['E', -90], ['S', 180], ['W', 90]];
            el.innerHTML = `<h3><i class="fa-solid fa-compass"></i><span>${esc(t('sv.n.title'))}</span></h3>
                <span class="field-label">${esc(t('sv.n.top'))}</span>
                <div class="sv-nbtns">${tops.map(([d, a]) => `<button type="button" data-act="north-top" data-a="${a}" aria-pressed="${Math.abs(((n - a) % 360 + 540) % 360 - 180) < 0.01}">${esc(t('sv.dir.' + d))}</button>`).join('')}</div>
                <div class="sv-row" style="margin-top:.55rem;align-items:end"><div class="field"><label for="sv-north">${esc(t('sv.n.angle'))}</label><input class="control" id="sv-north" inputmode="decimal" autocomplete="off" value="${esc(digits(Math.round(n * 10) / 10))}"></div>
                <button type="button" class="btn btn-soft btn-sm" data-act="north-pick"><i class="fa-solid fa-location-arrow"></i> ${esc(t('sv.n.pick'))}</button></div>
                <p class="sv-note">${esc(t('sv.n.help'))}</p>
                <label class="sv-check"><input type="checkbox" id="sv-showdirs"${D.opt.dirs !== false ? ' checked' : ''}><span>${esc(t('sv.n.showDirs'))}</span></label>`;
        }
        function secGeo() {
            const el = $('#sv-sec-geo');
            const fit = geoTransform();
            const sc = fit && fit.n >= 2 ? (fit.scale - 1) * 100 : 0;
            el.innerHTML = `<h3><i class="fa-solid fa-earth-asia"></i><span>${esc(t('sv.p.geo'))}</span></h3>
                <p class="sv-note" style="margin:0 0 .55rem">${esc(t('sv.g.help'))}</p>
                ${D.geo.map((g, i) => `<div class="sv-geo-pt"><b>${digits(i + 1)}</b><span>${g.lat.toFixed(7)}, ${g.lon.toFixed(7)}</span><button type="button" class="sv-del" style="height:1.8rem" data-act="geo-del" data-i="${i}" aria-label="${esc(t('sv.delOne'))}"><i class="fa-solid fa-xmark"></i></button></div>`).join('')}
                <button type="button" class="btn btn-soft btn-sm btn-block" style="margin-top:.55rem" data-act="geo-pick"><i class="fa-solid fa-location-crosshairs"></i> ${esc(t('sv.g.add'))}</button>
                ${geoPick ? `<div class="field" style="margin-top:.55rem"><label for="sv-geo-ll">${esc(t('sv.g.pending'))} — ${esc(t('sv.g.ll'))}</label><input class="control" id="sv-geo-ll" autocomplete="off" placeholder="${esc(t('sv.g.llPh'))}"></div>
                    <div class="sv-btns"><button type="button" class="btn btn-ghost btn-sm" data-act="geo-gps"><i class="fa-solid fa-location-dot"></i> ${esc(t('sv.g.gps'))}</button><button type="button" class="btn btn-primary btn-sm" data-act="geo-save"><i class="fa-solid fa-check"></i> ${esc(t('sv.g.save'))}</button></div>` : ''}
                ${fit ? `<p class="sv-note">${esc(fit.n === 1 ? t('sv.g.one') : t('sv.g.fit', { r: num(fit.rms, 1), s: num(sc, 1), d: num(fit.rot, 1) }) + (fit.n === 2 ? ' · ' + t('sv.g.two') : ''))}</p>` : ''}
                ${fit && fit.n >= 2 && Math.abs(sc) > 3 ? `<div class="sv-warnbox">${esc(t('sv.g.scaleWarn', { s: num(sc, 1) }))}</div>` : ''}
                <div class="sv-btns">
                    <button type="button" class="btn btn-soft btn-sm" data-act="kml"${fit ? '' : ' disabled'}><i class="fa-solid fa-earth-asia"></i> ${esc(t('sv.g.kml'))}</button>
                    <button type="button" class="btn btn-primary btn-sm" data-act="kmz"${fit && IMG && D.img ? '' : ' disabled'}><i class="fa-solid fa-file-zipper"></i> ${esc(t('sv.g.kmz'))}</button>
                </div>`;
        }
        function renderSide() { secSel(); secDiv(); secPlots(); secMap(); secDir(); secGeo(); if (typeof fillScaleSelect === 'function') fillScaleSelect(); }
        function updateNumbers() { secSel(); divRes(); secPlots(); }
        function syncOpts() {
            $('#sv-len').value = D.opt.len; $('#sv-au').value = D.opt.area;
            $('#sv-x-img').checked = D.opt.xImg !== false; $('#sv-x-only').checked = !!D.opt.xOnly;
            $$('[data-info]', ROOT).forEach((inp) => { inp.value = D.info[inp.dataset.info] || ''; });
            $('#sv-paper').value = D.print.paper; $('#sv-orient').value = D.print.orient;
            fillScaleSelect();
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
                D.scale.f = groundFt(d, u) / px; D.scale.how = 'known'; D.scale.calU = u;
                calib = []; redivideAll(); commit(); toast(t('sv.sc.done'));
            } else if (a === 'pre-apply') {
                const dpi = pnum($('#sv-sc-dpi').value);
                if (!(dpi > 0)) { $('#sv-sc-dpi').focus(); return; }
                D.scale = Object.assign(D.scale, { dpi, how: 'preset', f: D.scale.N / (12 * dpi * (D.img.shrink || 1)) });
                redivideAll(); commit(); toast(t('sv.sc.done'));
            } else if (a === 'pick-rect4') { rect4 = []; setTool('rect4'); renderSide(); stage.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
            else if (a === 'r4-apply') straighten();
            else if (a === 'auto-all') autoAll();
            else if (a === 'north-top') { D.north = Number(b.dataset.a); commit(); }
            else if (a === 'north-pick') { northPts = []; setTool('north'); stage.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
            else if (a === 'plot-del') { const id = Number(b.dataset.id); D.plots = D.plots.filter((q) => q.id !== id); if (sel === id) { sel = null; selV = null; } commit(); toast(t('sv.erased')); }
            else if (a === 'plots-clear') { if (window.confirm(t('sv.delAllQ'))) { D.plots = []; sel = null; selV = null; commit(); } }
            else if (a === 'mark-del') { D.marks.splice(Number(b.dataset.i), 1); commit(); }
            else if (a === 'geo-del') { D.geo.splice(Number(b.dataset.i), 1); commit(); }
            else if (a === 'geo-pick') { geoPick = null; setTool('geo'); renderSide(); stage.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
            else if (a === 'geo-gps') {
                if (!navigator.geolocation) { toast(t('sv.g.gpsFail')); return; }
                toast(t('sv.g.gpsWait'));
                navigator.geolocation.getCurrentPosition((pos) => {
                    const inp = $('#sv-geo-ll'); if (inp) inp.value = `${pos.coords.latitude.toFixed(7)}, ${pos.coords.longitude.toFixed(7)}`;
                    toast(t('sv.g.gpsOk', { m: num(pos.coords.accuracy, 0) }));
                }, () => toast(t('sv.g.gpsFail')), { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
            } else if (a === 'geo-save') {
                const ll = SVT.parseLatLon($('#sv-geo-ll').value);
                if (!ll || !geoPick) { toast(t('sv.g.bad')); $('#sv-geo-ll').focus(); return; }
                D.geo.push({ x: geoPick[0], y: geoPick[1], lat: ll[0], lon: ll[1] });
                geoPick = null; commit();
            } else if (a === 'kml' || a === 'kmz') exportKml(a === 'kmz');
        });
        side.addEventListener('input', (e) => {
            const el = e.target, p = sel && plotById(sel);
            if (el.dataset.pf && p) { p[el.dataset.pf] = el.value; secPlots(); divRes(); draw(); return; }
            if (el.dataset.pb && p) { p.bound = p.bound || {}; p.bound[el.dataset.pb] = el.value; return; }
            if (el.id === 'sv-north') { const v = pnum(el.value); if (Number.isFinite(v)) { D.north = ((v % 360) + 540) % 360 - 180; draw(); secSel(); } return; }
            if (el.dataset.sh && p && p.div) {
                const s = p.div.shares[Number(el.dataset.i)]; s[el.dataset.sh] = el.value;
                if (p.div.exact !== false || el.dataset.sh === 'val') divide(p);
                divRes(); draw(); return;
            }
            if (el.id === 'sv-alpha') { D.opt.alpha = Number(el.value); draw(); }
        });
        side.addEventListener('change', (e) => {
            const el = e.target, p = sel && plotById(sel);
            if ((el.dataset.pf || el.dataset.sh || el.dataset.pb) && p) { quiet(); return; }
            if (el.dataset.pdir !== undefined && p) { p.dirs = p.dirs || {}; if (el.value) p.dirs[el.dataset.pdir] = el.value; else delete p.dirs[el.dataset.pdir]; commit(); return; }
            if (el.id === 'sv-north') { commit(); return; }
            if (el.id === 'sv-showdirs') { D.opt.dirs = el.checked; save(); draw(); return; }
            if (el.dataset.dv && p && p.div) {
                const k = el.dataset.dv;
                p.div[k] = k === 'edge' ? Number(el.value) : el.value;
                divide(p); commit(); return;
            }
            if (el.id === 'sv-alpha') { save(); return; }
            if (el.id === 'sv-sc-r' || el.id === 'sv-sc-n') {
                const r = $('#sv-sc-r').value;
                $('#sv-sc-nbox').hidden = r !== 'custom';
                const N = r === 'custom' ? pnum($('#sv-sc-n').value) : RATIOS[r];
                if (!(N > 0)) { if (r === 'custom') $('#sv-sc-n').focus(); return; }
                D.scale.ratio = r; D.scale.N = N;
                // the scale follows the printed map scale unless it was measured from a known distance
                if (D.scale.how !== 'known' && D.img) D.scale.f = N / (12 * D.scale.dpi * (D.img.shrink || 1));
                redivideAll(); commit(); return;
            }
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
        function scaleGeom(k) {
            D.plots.forEach((p) => { p.pts = p.pts.map((q) => [q[0] * k, q[1] * k]); if (p.div && p.div.cuts) p.div.cuts = p.div.cuts.map((c) => c * k); });
            D.marks.forEach((m) => { m.a = [m.a[0] * k, m.a[1] * k]; m.b = [m.b[0] * k, m.b[1] * k]; });
            D.geo.forEach((g) => { g.x *= k; g.y *= k; });
            calib = []; rect4 = []; geoPick = null; draft = null; mA = null;
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
                    const head = new Uint8Array(await file.slice(0, 262144).arrayBuffer());
                    const r = SVT.readDpi(head), trusted = SVT.trustDpi(r);
                    pdfDoc = null;
                    await useImage(file, { name: file.name, dpi: trusted ? r.dpi : 300, dpiAuto: trusted, trusted, pages: 0, page: 0 }, true);
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
                await useImage(blob, { name, dpi: 72 * sc, dpiAuto: true, trusted: true, pdf: true, pages: pdfDoc.numPages, page: n }, fresh);
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
                // a new map: its printed scale (16" = 1 mile unless chosen otherwise) × the dpi in the file.
                // A scan / PDF knows its dpi → exact ("auto"); a camera photo does not → a guess to be checked.
                const N = D.scale.N > 0 ? D.scale.N : 3960;
                const f = N / (12 * meta.dpi * shrink);
                scaleGeom(F() / f);
                D.scale = Object.assign(D.scale, { f, how: meta.trusted ? 'auto' : 'guess', dpi: meta.dpi, N });
            }
            analysis = null;
            D.img = { w: im.naturalWidth, h: im.naturalHeight, name: meta.name, pages: meta.pages, page: meta.page, shrink, dpiAuto: meta.dpiAuto, pdf: !!meta.pdf };
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

        /* ---------- auto tools: straighten, auto plot, find all ---------- */
        function addPlot(P) {
            const id = D.nextId++;
            const p = { id, name: '', owner: '', color: PLOT_COLORS[(id - 1) % PLOT_COLORS.length], pts: P.map((q) => [q[0], q[1]]), div: null };
            D.plots.push(p);
            return p;
        }
        const tick = () => new Promise((r) => setTimeout(r, 40));
        const toBlob = (c, type, q) => new Promise((r) => c.toBlob(r, type, q));
        const bytesOf = async (blob) => new Uint8Array(await blob.arrayBuffer());
        function dl(blob, name) {
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
            document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
        }
        async function straighten() {
            if (rect4.length !== 4 || !IMG || !D.img) return;
            const wv = pnum($('#sv-r4-w').value), hv = pnum($('#sv-r4-h').value), u = $('#sv-r4-u').value;
            if (!(wv > 0)) { $('#sv-r4-w').focus(); return; }
            if (!(hv > 0)) { $('#sv-r4-h').focus(); return; }
            D.scale.r4U = u;
            const wFt = groundFt(wv, u), hFt = groundFt(hv, u);
            busy(true); toast(t('sv.sc.working')); await tick();
            try {
                const [p0, p1, p2, p3] = rect4;
                const sw = (dist(p0, p1) + dist(p3, p2)) / 2, sh = (dist(p0, p3) + dist(p1, p2)) / 2;
                const k = (sw / wFt + sh / hFt) / 2;                    // output pixels per foot (keeps the photo's detail)
                const RW = wFt * k, RH = hFt * k, R = [[0, 0], [RW, 0], [RW, RH], [0, RH]];
                const Hf = SVT.homography(rect4, R);
                if (!Hf) throw new Error('corners');
                const cs = [[0, 0], [D.img.w, 0], [D.img.w, D.img.h], [0, D.img.h]].map((p) => SVT.applyH(Hf, p));
                const x0 = Math.max(Math.min(...cs.map((c) => c[0])), -2 * RW), x1 = Math.min(Math.max(...cs.map((c) => c[0])), 3 * RW);
                const y0 = Math.max(Math.min(...cs.map((c) => c[1])), -2 * RH), y1 = Math.min(Math.max(...cs.map((c) => c[1])), 3 * RH);
                const W = x1 - x0, H = y1 - y0, sc = Math.min(1, 8000 / Math.max(W, H), Math.sqrt(14e6 / (W * H)));
                const OW = Math.max(16, Math.round(W * sc)), OH = Math.max(16, Math.round(H * sc));
                const mv = (p) => { const q = SVT.applyH(Hf, p); return [(q[0] - x0) * sc, (q[1] - y0) * sc]; };
                const Hinv = SVT.homography(rect4.map(mv), rect4);
                const sc0 = document.createElement('canvas'); sc0.width = D.img.w; sc0.height = D.img.h;
                const g0 = sc0.getContext('2d', { willReadFrequently: true }); g0.drawImage(IMG, 0, 0, D.img.w, D.img.h);
                const out = SVT.warp(g0.getImageData(0, 0, D.img.w, D.img.h), Hinv, OW, OH);
                sc0.width = 1; sc0.height = 1;
                const oc = document.createElement('canvas'); oc.width = OW; oc.height = OH; oc.getContext('2d').putImageData(out, 0, 0);
                const blob = await toBlob(oc, 'image/jpeg', 0.92);
                // the drawing moves with the photo
                D.plots.forEach((p) => { p.pts = p.pts.map(mv); });
                D.marks.forEach((m) => { m.a = mv(m.a); m.b = mv(m.b); });
                D.geo.forEach((g) => { const q = mv([g.x, g.y]); g.x = q[0]; g.y = q[1]; });
                D.scale = Object.assign(D.scale, { f: 1 / (k * sc), how: 'known' });
                const im = await loadImg(URL.createObjectURL(blob));
                if (IMG && IMG.src.startsWith('blob:')) URL.revokeObjectURL(IMG.src);
                IMG = im; analysis = null; rect4 = [];
                D.img = Object.assign({}, D.img, { w: OW, h: OH, shrink: 1, straight: true, pdf: false });
                await IDB.set('img', { blob });
                redivideAll(); fitted = false; fit(); commit();
                toast(t('sv.sc.straightDone'));
            } catch (err) { console.warn(err); toast(t('sv.imgFail')); }
            busy(false);
        }
        function visibleRect() {
            const a = toW([0, 0]), b = toW([cw, ch]);
            const x = Math.max(0, Math.floor(a[0])), y = Math.max(0, Math.floor(a[1]));
            const x1 = Math.min(D.img.w, Math.ceil(b[0])), y1 = Math.min(D.img.h, Math.ceil(b[1]));
            return { x, y, w: Math.max(1, x1 - x), h: Math.max(1, y1 - y) };
        }
        async function magicAt(s) {
            if (!IMG || !D.img) { toast(t('sv.mg.need')); return; }
            const w = toW(s);
            if (w[0] < 0 || w[1] < 0 || w[0] > D.img.w || w[1] > D.img.h) { toast(t('sv.mg.small')); return; }
            busy(true); await tick();
            let res;
            try {
                const r = visibleRect(), key = `${r.x},${r.y},${r.w},${r.h},${D.img.w}`;
                if (!analysis || analysis.key !== key) { analysis = SVT.analyse(IMG, r, 4e6); analysis.key = key; }
                res = SVT.regionAt(analysis, w[0], w[1]);
            } catch (err) { console.warn(err); res = { err: 'small' }; }
            busy(false);
            if (res.err) { toast(t(res.err === 'leak' ? 'sv.mg.leak' : 'sv.mg.small')); return; }
            const p = addPlot(res.pts);
            sel = p.id; selV = null;
            commit();
            toast(t('sv.mg.ok', { a: fmtArea(sftOf(p.pts), D.opt.area) }));
        }
        async function autoAll() {
            if (!IMG || !D.img) { toast(t('sv.mg.need')); return; }
            busy(true); toast(t('sv.mg.work')); await tick();
            let n = 0;
            try {
                const an = SVT.analyse(IMG, { x: 0, y: 0, w: D.img.w, h: D.img.h }, 9e6);
                SVT.allRegions(an).forEach((P) => {
                    const c = labelPt(P);
                    if (D.plots.some((p) => inPoly(c, p.pts))) return;   // already there
                    addPlot(P); n++;
                });
            } catch (err) { console.warn(err); }
            busy(false);
            if (n) { sel = null; commit(); fit(); }
            toast(n ? t('sv.mg.allDone', { n: digits(n) }) : t('sv.mg.none'));
        }

        /* ---------- Google Earth ---------- */
        // map units → metres with y = north (turned so the map's north points up)
        function local(p) {
            const m = F() * 0.3048, th = (D.north || 0) * Math.PI / 180, x = p[0] * m, y = -p[1] * m;
            return [x * Math.cos(th) - y * Math.sin(th), x * Math.sin(th) + y * Math.cos(th)];
        }
        function geoTransform() {
            if (!D.geo.length) return null;
            return SVT.geoFit(D.geo.map((g) => { const [x, y] = local([g.x, g.y]); return { x, y, lat: g.lat, lon: g.lon }; }));
        }
        async function exportKml(kmz) {
            const fit = geoTransform();
            if (!fit) { toast(t('sv.g.need')); return; }
            const m = F() * 0.3048, LL = (p) => fit.toLL(...local(p));
            const title = D.info.title || D.info.mouza || t('sv.e.plan');
            const areaTxt = (sft) => `${fmtArea(sft, 'dec')} · ${fmtArea(sft, 'katha')} · ${fmtArea(sft, 'sft')}`;
            const plots = D.plots.map((p) => ({ name: plotName(p), desc: areaTxt(sftOf(p.pts)) + (p.owner ? ` · ${p.owner}` : ''), color: p.color, ring: p.pts.map(LL) }));
            const partsF = [];
            D.plots.forEach((p) => parts(p).forEach((q) => { if (q.pts.length >= 3) partsF.push({ name: `${plotName(p)} — ${q.name}`, desc: areaTxt(q.sft), color: q.color, ring: q.pts.map(LL) }); }));
            const files = [];
            let overlay = null;
            if (kmz && IMG && D.img) {
                const sc = Math.min(1, 4096 / Math.max(D.img.w, D.img.h)), c = document.createElement('canvas');
                c.width = Math.round(D.img.w * sc); c.height = Math.round(D.img.h * sc);
                c.getContext('2d').drawImage(IMG, 0, 0, c.width, c.height);
                files.push({ name: 'files/mouza.jpg', data: await bytesOf(await toBlob(c, 'image/jpeg', 0.85)) });
                const cen = LL([D.img.w / 2, D.img.h / 2]);
                const hn = D.img.h * m * fit.scale / 2 / fit.mLat(cen[0]), he = D.img.w * m * fit.scale / 2 / fit.mLon(cen[0]);
                overlay = { href: 'files/mouza.jpg', name: t('sv.g.map'), n: cen[0] + hn, s: cen[0] - hn, e: cen[1] + he, w: cen[1] - he, rot: fit.rot + (D.north || 0) };
            }
            const text = SVT.kml({ name: title, folders: [{ name: t('sv.g.folderPlots'), items: plots }, { name: t('sv.g.folderParts'), items: partsF }], overlay });
            const data = new TextEncoder().encode(text);
            if (kmz) dl(new Blob([SVT.zip([{ name: 'doc.kml', data }, ...files])], { type: 'application/vnd.google-earth.kmz' }), fileName(title, 'kmz'));
            else dl(new Blob([data], { type: 'application/vnd.google-earth.kml+xml' }), fileName(title, 'kml'));
            toast(t('sv.g.done'));
        }

        /* ---------- printable sheet: true scale on A4 / Legal / Letter at 300 dpi ---------- */
        const PAPERS = { a4: { w: 210 / 25.4, h: 297 / 25.4, pt: [595.276, 841.89], css: 'A4' }, legal: { w: 8.5, h: 14, pt: [612, 1008], css: 'legal' }, letter: { w: 8.5, h: 11, pt: [612, 792], css: 'letter' } };
        const STD = [5, 10, 15, 20, 25, 30, 40, 50, 60, 66, 80, 100, 120, 150, 165, 200, 250, 300, 330, 400, 500, 660, 800, 1000, 1320, 1650, 2000, 2640, 3300, 5280];
        const DPI = 300;
        function fillScaleSelect() {
            const s = $('#sv-pscale'), cur = String(D.print.scale);
            s.innerHTML = `<option value="auto">${esc(t('sv.x.sAuto'))}</option><option value="map">${esc(t('sv.x.sMap', { v: ratioName(D.scale.N) }))}</option>`
                + STD.map((v) => `<option value="${v}">${esc(t('sv.x.sIn', { v: CS.numPlain(v) }))}</option>`).join('');
            s.value = [...s.options].some((o) => o.value === cur) ? cur : 'auto';
        }
        async function sheet() {
            const only = D.opt.xOnly && sel ? sel : null;
            const plots = only ? [plotById(only)] : D.plots;
            if (!plots.length) { toast(t('sv.x.empty')); return null; }
            try { await document.fonts.ready; } catch (e) { /* ok */ }
            const pal = palette(true), k = 2.6, I = D.info, f = F();
            // rows of the table
            const rows = [], divided = plots.filter((p) => p.div && p.div.cuts);
            if (divided.length) divided.forEach((p) => parts(p).forEach((q) => rows.push({ dot: q.color, a: divided.length > 1 ? `${plotName(p)} — ${q.name}` : q.name, b: '', sft: q.sft })));
            else plots.forEach((p) => rows.push({ dot: p.color, a: plotName(p), b: p.owner, sft: sftOf(p.pts) }));
            const rowH = rows.length > 14 ? 56 : 70, tableH = 80 + rowH * (rows.length + 1);
            const CB = ['N', 'S', 'E', 'W'], has = (p, d) => p.bound && String(p.bound[d] || '').trim();
            const bnd = plots.filter((p) => CB.some((d) => has(p, d))).map((p) => (plots.length > 1 ? `${plotName(p)} — ` : '') + CB.filter((d) => has(p, d)).map((d) => `${t('sv.cb.' + d)}: ${String(p.bound[d]).trim()}`).join('   ·   '));
            const bndH = bnd.length ? 80 + bnd.length * 58 : 0;
            const det = [['sv.i.mouza', I.mouza], ['sv.i.jl', I.jl], ['sv.i.khatian', I.khatian], ['sv.i.dag', I.dag], ['sv.i.upazila', I.upazila], ['sv.i.district', I.district]].filter(([, v]) => v).map(([kk, v]) => `${t(kk)}: ${v}`);
            let P = []; plots.forEach((p) => { P = P.concat(p.pts); });
            const bb = bbox(P), cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2;
            const wFt = (bb.x1 - bb.x0) * f, hFt = (bb.y1 - bb.y0) * f;
            const paper = PAPERS[D.print.paper] ? D.print.paper : 'a4', pp = PAPERS[paper];
            // page + drawing box for one orientation
            const layout = (land) => {
                const W = Math.round((land ? pp.h : pp.w) * DPI), H = Math.round((land ? pp.w : pp.h) * DPI), M = 110;
                const bx = M + 40, by = det.length > 3 ? 390 : 350, bw = W - 2 * bx;
                const bh = H - M - by - tableH - bndH - 400;
                return { W, H, M, bx, by, bw, bh, land };
            };
            const fits = (L, fpi) => wFt / fpi * DPI <= L.bw - 160 && hFt / fpi * DPI <= L.bh - 160;
            const pick = (L) => STD.find((v) => fits(L, v)) || STD[STD.length - 1];
            const want = D.print.scale === 'map' ? D.scale.N / 12 : Number(D.print.scale) > 0 ? Number(D.print.scale) : null;
            const cand = D.print.orient === 'p' ? [layout(false)] : D.print.orient === 'l' ? [layout(true)] : [layout(false), layout(true)];
            let L = cand[0];
            if (cand.length > 1) L = want ? (fits(cand[0], want) || !fits(cand[1], want) ? cand[0] : cand[1]) : (pick(cand[1]) < pick(cand[0]) ? cand[1] : cand[0]);
            const fpi = want || pick(L);                                 // feet per printed inch
            const fit = fits(L, fpi);
            const { W, H, M, bx, by, bw, bh } = L;
            const c = document.createElement('canvas'); c.width = W; c.height = H;
            const g = c.getContext('2d');
            const o0 = { pal, k, v: { z: 1, ox: 0, oy: 0 } };
            const txt = (s, x, y, size, opt) => label(g, s, x, y, o0, size, opt);
            g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
            g.strokeStyle = '#0f172a'; g.lineWidth = 7; g.strokeRect(M / 2, M / 2, W - M, H - M);
            g.lineWidth = 2; g.strokeRect(M / 2 + 16, M / 2 + 16, W - M - 32, H - M - 32);
            const title = I.title || t(divided.length ? 'sv.e.divTitle' : 'sv.e.plan');
            txt(title, W / 2, 205, 30, { bold: true });
            if (det.length) {
                g.font = `600 ${14 * k}px ${FONT}`;
                const line = det.join('   •   ');
                if (g.measureText(line).width < W - M * 3) txt(line, W / 2, 290, 14, { color: '#334155' });
                else { const h2 = Math.ceil(det.length / 2); txt(det.slice(0, h2).join('   •   '), W / 2, 275, 14, { color: '#334155' }); txt(det.slice(h2).join('   •   '), W / 2, 330, 14, { color: '#334155' }); }
            }
            // drawing at exactly fpi feet per inch
            const z = DPI * f / fpi;
            const v = { z, ox: bx + bw / 2 - cx * z, oy: by + bh / 2 - cy * z };
            g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
            const selWas = sel; sel = null;
            scene(g, { pal, k, v, W: bw, H: bh, x: bx, y: by, ui: false, img: D.opt.xImg !== false, only });
            sel = selWas;
            g.restore();
            g.strokeStyle = '#94a3b8'; g.lineWidth = 3; g.strokeRect(bx, by, bw, bh);
            const ov = { pal, k, v };
            northArrow(g, bx + bw - 90, by + 120, 48, ov);
            g.save(); g.fillStyle = 'rgba(255,255,255,.88)'; g.fillRect(bx + 20, by + bh - 110, 660, 90); g.restore();
            scaleBar(g, bx + 50, by + bh - 50, 540, ov);
            // scale line + print check ruler (1 inch and 5 cm, exact at 300 dpi)
            const N = Math.round(fpi * 12 * 100) / 100, mapK = Object.keys(RATIOS).find((r) => Math.abs(RATIOS[r] - N) < 0.01);
            let y = by + bh + 55;
            txt(t('sv.e.pscale', { v: `${CS.numPlain(fpi)} ${t('sv.ls.ft')}`, n: CS.numPlain(N), m: mapK ? `  ·  ${t('sv.sc.' + mapK)}` : '' }), bx, y, 13, { align: 'left', bold: true, color: '#0f172a' });
            y += 70;
            txt(t('sv.e.check'), bx, y, 11, { align: 'left', color: '#475569' });
            g.font = `600 ${11 * k}px ${FONT}`;
            let rx = bx + g.measureText(t('sv.e.check')).width + 40;
            const bar = (len, lab) => {
                g.fillStyle = '#0f172a'; g.fillRect(rx, y - 6, len, 12);
                g.fillRect(rx, y - 26, 4, 52); g.fillRect(rx + len - 4, y - 26, 4, 52);
                txt(lab, rx + len / 2, y - 42, 10.5, { bold: true });
                rx += len + 70;
            };
            bar(DPI, t('sv.e.in1'));
            bar(DPI * 5 / 2.54, t('sv.e.cm5'));
            // table
            y += 80;
            const cols = divided.length
                ? [['sv.e.no', 120, 'left'], ['sv.e.share', 760, 'left'], ['sv.us.dec', 260, 'right'], ['sv.us.katha', 240, 'right'], ['sv.us.sft', 300, 'right'], ['sv.e.sign', 560, 'left']]
                : [['sv.e.no', 120, 'left'], ['sv.e.plot', 520, 'left'], ['sv.e.owner', 560, 'left'], ['sv.us.dec', 260, 'right'], ['sv.us.katha', 240, 'right'], ['sv.us.sft', 340, 'right']];
            const tx0 = bx, tw = cols.reduce((s, cc) => s + cc[1], 0), sx = bw / tw, ty0 = y;
            const colX = []; let cxx = tx0; cols.forEach((cc) => { colX.push([cxx, cxx + cc[1] * sx]); cxx += cc[1] * sx; });
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
            const ti = divided.length ? [1, 2, 3, 4] : [1, 3, 4, 5], ym = y + rowH / 2;
            cell(ti[0], t('sv.e.total'), ym, { bold: true }); cell(ti[1], num(tot / AREA_U.dec), ym, { bold: true }); cell(ti[2], num(tot / AREA_U.katha), ym, { bold: true }); cell(ti[3], num(tot, 0), ym, { bold: true });
            g.strokeStyle = '#cbd5e1'; g.lineWidth = 2; g.strokeRect(tx0, ty0, bw, y + rowH - ty0);
            if (bnd.length) {
                y += rowH + 60;
                txt(`${t('sv.e.bound')}:`, bx, y, 12.5, { align: 'left', bold: true });
                bnd.forEach((line) => {
                    y += 58;
                    g.font = `600 ${11.5 * k}px ${FONT}`;
                    const sz = Math.min(11.5, 11.5 * (bw - 40) / Math.max(g.measureText(line).width, 1));
                    txt(line, bx + 30, y, sz, { align: 'left', color: '#334155' });
                });
            }
            // footer
            const fy = H - M / 2 - 150;
            const d = new Date(), date = digits(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
            txt(`${t('sv.e.date')}: ${date}`, bx, fy, 12.5, { align: 'left' });
            if (I.by) txt(`${t('sv.e.by')}: ${I.by}`, bx + bw, fy, 12.5, { align: 'right' });
            txt(t('sv.e.note'), W / 2, fy + 75, 10, { color: '#64748b' });
            if (!fit) toast(t('sv.x.nofit'));
            return { c, title, paper, land: L.land, fpi, total: tot };
        }

        async function pdfOf(r) {
            const jpg = await bytesOf(await toBlob(r.c, 'image/jpeg', 0.95));
            const pp = PAPERS[r.paper], [pw, ph] = r.land ? [pp.pt[1], pp.pt[0]] : pp.pt;
            return { blob: new Blob([SVT.pdf(jpg, r.c.width, r.c.height, pw, ph, r.title)], { type: 'application/pdf' }), name: fileName(r.title, 'pdf') };
        }
        // one sheet → PDF / PNG / print / WhatsApp
        async function deliver(kind, make) {
            const r = await make(); if (!r) return;
            if (kind === 'png') { dl(new Blob([SVT.pngDpi(await bytesOf(await toBlob(r.c, 'image/png')), DPI)], { type: 'image/png' }), fileName(r.title, 'png')); return; }
            if (kind === 'print') {
                const pp = PAPERS[r.paper], wIn = r.land ? pp.h : pp.w;
                const fr = document.createElement('iframe');
                fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
                document.body.appendChild(fr);
                const url = URL.createObjectURL(await toBlob(r.c, 'image/png'));
                const doc = fr.contentDocument;
                doc.open(); doc.write(`<!doctype html><html><head><title>${esc(r.title)}</title><style>@page{size:${pp.css} ${r.land ? 'landscape' : 'portrait'};margin:0}html,body{margin:0;padding:0}img{width:${wIn}in;height:auto;display:block}</style></head><body><img src="${url}"></body></html>`); doc.close();
                const im = doc.querySelector('img');
                const go = () => { fr.contentWindow.focus(); fr.contentWindow.print(); setTimeout(() => { fr.remove(); URL.revokeObjectURL(url); }, 60000); };
                if (im.complete) go(); else im.onload = go;
                return;
            }
            const o = await pdfOf(r);
            if (kind === 'pdf') { dl(o.blob, o.name); return; }
            // WhatsApp: share the PDF as a document so the scale stays exact
            const text = t('sv.x.waMsg', { t: r.title, a: `${fmtArea(r.total, 'dec')} (${fmtArea(r.total, 'katha')})` });
            const file = new File([o.blob], o.name, { type: 'application/pdf' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try { await navigator.share({ files: [file], title: r.title, text }); return; } catch (err) { if (err && err.name === 'AbortError') return; }
            }
            dl(o.blob, o.name);
            window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
            toast(t('sv.x.waDl'));
        }
        const work = async (btn, fn) => { if (btn.classList.contains('loading')) return; btn.classList.add('loading'); try { await fn(); } catch (e) { console.warn(e); } btn.classList.remove('loading'); };
        [['#sv-pdf', 'pdf'], ['#sv-png', 'png'], ['#sv-print', 'print'], ['#sv-wa', 'wa']].forEach(([q, kind]) => $(q).addEventListener('click', (e) => work(e.currentTarget, () => deliver(kind, sheet))));

        /* ---------- printable sheet for the field-measure tab ---------- */
        // spec: { shapes: [{ pts (ft, y = south), edges: [text], color, label }], diag, rows: [[label, value]], method, sft, approx, quad }
        async function fieldSheet(spec) {
            try { await document.fonts.ready; } catch (e) { /* ok */ }
            const pal = palette(true), k = 2.6, I = D.info;
            let P = []; spec.shapes.forEach((sh) => { P = P.concat(sh.pts); });
            const bb = bbox(P), wFt = bb.x1 - bb.x0, hFt = bb.y1 - bb.y0;
            const paper = PAPERS[D.print.paper] ? D.print.paper : 'a4', pp = PAPERS[paper];
            const land = D.print.orient === 'l' || (D.print.orient === 'auto' && wFt > hFt * 1.5);
            const W = Math.round((land ? pp.h : pp.w) * DPI), H = Math.round((land ? pp.w : pp.h) * DPI), M = 110;
            const bx = M + 40, by = 360, bw = W - 2 * bx, bh = Math.round(H * (land ? 0.42 : 0.4));
            const fits = (f) => wFt / f * DPI <= bw - 260 && hFt / f * DPI <= bh - 220;
            const want = D.print.scale === 'map' ? D.scale.N / 12 : Number(D.print.scale) > 0 ? Number(D.print.scale) : null;
            const fpi = want || STD.find(fits) || STD[STD.length - 1];
            const c = document.createElement('canvas'); c.width = W; c.height = H;
            const g = c.getContext('2d'), o0 = { pal, k, v: { z: 1, ox: 0, oy: 0 } };
            const txt = (s0, x, y, size, opt) => label(g, s0, x, y, o0, size, opt);
            g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
            g.strokeStyle = '#0f172a'; g.lineWidth = 7; g.strokeRect(M / 2, M / 2, W - M, H - M);
            g.lineWidth = 2; g.strokeRect(M / 2 + 16, M / 2 + 16, W - M - 32, H - M - 32);
            const title = I.title ? `${I.title} — ${t('sv.fo.title')}` : t('sv.fo.title');
            txt(title, W / 2, 205, 28, { bold: true });
            const det = [['sv.i.mouza', I.mouza], ['sv.i.jl', I.jl], ['sv.i.khatian', I.khatian], ['sv.i.dag', I.dag], ['sv.i.upazila', I.upazila], ['sv.i.district', I.district]].filter(([, v0]) => v0).map(([kk, v0]) => `${t(kk)}: ${v0}`);
            if (det.length) txt(det.join('   •   '), W / 2, 285, 13, { color: '#334155' });
            // drawing
            const z = DPI / fpi, ox = bx + bw / 2 - (bb.x0 + bb.x1) / 2 * z, oy = by + bh / 2 - (bb.y0 + bb.y1) / 2 * z;
            const S = (p0) => [p0[0] * z + ox, p0[1] * z + oy];
            g.fillStyle = '#fbfcfd'; g.fillRect(bx, by, bw, bh);
            g.strokeStyle = '#94a3b8'; g.lineWidth = 3; g.strokeRect(bx, by, bw, bh);
            g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
            spec.shapes.forEach((sh) => {
                g.beginPath(); sh.pts.forEach((p0, i) => { const q = S(p0); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.closePath();
                g.fillStyle = (sh.color || '#0d9488') + '33'; g.fill(); g.lineJoin = 'round'; g.lineWidth = 6; g.strokeStyle = sh.color || '#0d9488';
                if (spec.approx) g.setLineDash([24, 14]); g.stroke(); g.setLineDash([]);
                const cen = centroid(sh.pts), C = S(cen);
                sh.pts.forEach((a, i) => {
                    const b = sh.pts[(i + 1) % sh.pts.length], A = S(a), B = S(b), L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
                    let ang = Math.atan2(B[1] - A[1], B[0] - A[0]); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
                    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2; let nx = -(B[1] - A[1]) / L, ny = (B[0] - A[0]) / L;
                    if ((mx - C[0]) * nx + (my - C[1]) * ny < 0) { nx = -nx; ny = -ny; }
                    if (sh.edges && sh.edges[i]) txt(sh.edges[i], mx + nx * 46, my + ny * 46, 12.5, { rot: ang, bold: true });
                });
                if (sh.label) { const Lp = S(labelPt(sh.pts)); txt(sh.label, Lp[0], Lp[1], 14, { bold: true, color: '#065f46' }); }
            });
            if (spec.diag) { const A = S(spec.diag[0]), B = S(spec.diag[1]); g.strokeStyle = '#0f766e'; g.lineWidth = 3; g.setLineDash([18, 12]); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); g.setLineDash([]); }
            g.restore();
            if (spec.quad) { const nWas = D.north; D.north = 0; northArrow(g, bx + bw - 90, by + 120, 48, { pal, k, v: o0.v }); D.north = nWas; }
            // ground scale bar
            const Lft = niceStep(520 / z * 0.7), Lpx = Lft * z, sx0 = bx + 50, sy0 = by + bh - 50;
            g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(bx + 20, by + bh - 110, Lpx + 180, 90);
            for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#fff' : '#0f172a'; g.fillRect(sx0 + Lpx * i / 4, sy0, Lpx / 4, 16); }
            g.strokeStyle = '#0f172a'; g.lineWidth = 2; g.strokeRect(sx0, sy0, Lpx, 16);
            txt(digits(0), sx0, sy0 - 24, 10.5); txt(`${CS.numPlain(Lft)} ${t('sv.ls.ft')}`, sx0 + Lpx, sy0 - 24, 10.5);
            // scale + print check
            let y = by + bh + 60;
            const N = Math.round(fpi * 12 * 100) / 100, mapK = Object.keys(RATIOS).find((r) => Math.abs(RATIOS[r] - N) < 0.01);
            txt(t('sv.e.pscale', { v: `${CS.numPlain(fpi)} ${t('sv.ls.ft')}`, n: CS.numPlain(N), m: mapK ? `  ·  ${t('sv.sc.' + mapK)}` : '' }), bx, y, 13, { align: 'left', bold: true });
            y += 70;
            txt(t('sv.e.check'), bx, y, 11, { align: 'left', color: '#475569' });
            g.font = `600 ${11 * k}px ${FONT}`;
            let rx = bx + g.measureText(t('sv.e.check')).width + 40;
            [[DPI, t('sv.e.in1')], [DPI * 5 / 2.54, t('sv.e.cm5')]].forEach(([len, lab]) => {
                g.fillStyle = '#0f172a'; g.fillRect(rx, y - 6, len, 12); g.fillRect(rx, y - 26, 4, 52); g.fillRect(rx + len - 4, y - 26, 4, 52);
                txt(lab, rx + len / 2, y - 42, 10.5, { bold: true }); rx += len + 70;
            });
            // results: left = area in every unit, right = measured sides
            y += 110;
            const colW = (bw - 60) / 2, lx = bx, rx2 = bx + colW + 60;
            g.fillStyle = '#ecfdf5'; g.fillRect(lx, y, colW, 150); g.strokeStyle = '#99f6e4'; g.lineWidth = 3; g.strokeRect(lx, y, colW, 150);
            txt(t('sv.fo.area'), lx + 30, y + 42, 11.5, { align: 'left', color: '#0f766e', bold: true });
            txt(`${fmtArea(spec.sft, 'dec')}  ·  ${fmtArea(spec.sft, 'katha')}`, lx + 30, y + 105, 19, { align: 'left', bold: true });
            let ly = y + 210;
            [0, 2].forEach((r0) => { g.fillStyle = '#f1f5f9'; g.fillRect(lx, ly + r0 * 76 - 36, colW, 72); });
            ['dec', 'katha', 'bigha', 'acre', 'sft', 'sqm', 'ojut', 'chhatak'].forEach((u, i) => {
                const cx0 = lx + (i % 2) * (colW / 2), cy0 = ly + Math.floor(i / 2) * 76;
                txt(t('sv.u.' + u), cx0 + 24, cy0, 11, { align: 'left', color: '#475569' });
                txt(num(spec.sft / AREA_U[u], u === 'acre' || u === 'bigha' ? 4 : 2), cx0 + colW / 2 - 24, cy0, 12, { align: 'right', bold: true });
            });
            ly += 4 * 76;
            mixed(spec.sft).forEach((m0) => { txt(m0, lx + 24, ly, 11.5, { align: 'left', color: '#334155' }); ly += 60; });
            let ry = y + 42;
            txt(t('sv.fo.sides'), rx2, ry, 12.5, { align: 'left', bold: true, color: '#0f766e' });
            ry += 30;
            spec.rows.forEach(([a, b], i) => {
                ry += 64;
                if (i % 2 === 0) { g.fillStyle = '#f8fafc'; g.fillRect(rx2, ry - 32, colW, 64); }
                txt(a, rx2 + 24, ry, 11.5, { align: 'left', color: '#334155' });
                txt(b, rx2 + colW - 24, ry, 12, { align: 'right', bold: true });
            });
            ry += 90;
            txt(`${t('sv.fo.method')}: ${spec.method}`, rx2, ry, 11, { align: 'left', color: spec.approx ? '#b45309' : '#0f766e', bold: true });
            const fy = H - M / 2 - 150;
            const d = new Date(), date = digits(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
            txt(`${t('sv.e.date')}: ${date}`, bx, fy, 12.5, { align: 'left' });
            if (I.by) txt(`${t('sv.e.by')}: ${I.by}`, bx + bw, fy, 12.5, { align: 'right' });
            txt(t('sv.e.note'), W / 2, fy + 75, 10, { color: '#64748b' });
            if (!fits(fpi)) toast(t('sv.x.nofit'));
            return { c, title, paper, land, fpi, total: spec.sft };
        }
        ['sv-paper', 'sv-orient', 'sv-pscale'].forEach((id) => $('#' + id).addEventListener('change', (e) => { D.print[{ 'sv-paper': 'paper', 'sv-orient': 'orient', 'sv-pscale': 'scale' }[id]] = e.target.value; save(); }));

        /* ---------- project file ---------- */
        const toDataUrl = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(blob); });
        $('#sv-save').addEventListener('click', async () => {
            const rec = D.img ? await IDB.get('img') : null;
            const image = rec && rec.blob ? await toDataUrl(rec.blob) : null;
            const blob = new Blob([JSON.stringify({ app: 'construction-solution-survey', v: 1, data: D, image })], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = fileName(D.info.title || D.info.mouza || 'survey', 'json');
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
            fieldOut(kind, spec) { return deliver(kind, () => fieldSheet(spec)); },
            work,
            applyShares(list) {
                const p = sel && plotById(sel);
                if (!p) return false;
                let best = 0, bl = -1;
                p.pts.forEach((q, i) => { const L = dist(q, p.pts[(i + 1) % p.pts.length]); if (L > bl) { bl = L; best = i; } });
                p.div = { way: (p.div && p.div.way) || 'front', edge: p.div ? p.div.edge : best, mode: 'ratio', shares: list.map((x) => ({ name: x.name, val: String(Math.round(x.val * 1e8) / 1e8) })), cuts: [], exact: true };
                divide(p); commit();
                return true;
            },
            show() { resize(); draw(); },
            relabel() { if (!D) return; $('#sv-hint').textContent = t('sv.h.' + tool); syncOpts(); renderSide(); draw(); },
            _state: () => ({ D, sel, view, tool, hasImg: !!IMG }),
        };
    })();

    /* =========================================================
       Hook into the site
       ========================================================= */
    /* ---------- home page preview: a divided plot ---------- */
    function renderHome() {
        const box = document.getElementById('sv-home-preview');
        if (!box) return;
        const P = [[60, 70], [520, 40], [560, 330], [40, 360]], cuts = [];
        const u = [1, 0], A = pArea(P), cols = ['#2dd4bf', '#60a5fa', '#fbbf24'];
        const xs = P.map((p) => p[0]), lo = Math.min(...xs), hi = Math.max(...xs);
        [1 / 3, 2 / 3].forEach((f0) => { let a = lo, b = hi; for (let k = 0; k < 50; k++) { const m = (a + b) / 2; if (pArea(clip(P, u, m, true)) < A * f0) a = m; else b = m; } cuts.push((a + b) / 2); });
        const parts = [0, 1, 2].map((i) => { let Q = P; if (i > 0) Q = clip(Q, u, cuts[i - 1], false); if (i < 2) Q = clip(Q, u, cuts[i], true); return Q; });
        const pts = (Q) => Q.map((p) => p.join(',')).join(' ');
        const names = [t('sv.d.share', { n: digits(1) }), t('sv.d.share', { n: digits(2) }), t('sv.d.share', { n: digits(3) })];
        const dec = num(4.25);
        box.innerHTML = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" font-family="Noto Sans Bengali, Poppins, sans-serif">
            <rect width="600" height="400" fill="#fbfcfd"/>
            <g stroke="#e2e8f0" stroke-width="1">${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="400"/>`).join('')}${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="600" y2="${i * 50}"/>`).join('')}</g>
            ${parts.map((Q, i) => `<polygon points="${pts(Q)}" fill="${cols[i]}" fill-opacity=".55"/>`).join('')}
            ${cuts.map((c) => chord(P, u, c).map(([a, b]) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#0f172a" stroke-width="2.5" stroke-dasharray="9 6"/>`).join('')).join('')}
            <polygon points="${pts(P)}" fill="none" stroke="#0d9488" stroke-width="4" stroke-linejoin="round"/>
            ${parts.map((Q, i) => { const c = centroid(Q); return `<text x="${c[0]}" y="${c[1] - 6}" text-anchor="middle" font-size="17" font-weight="700" fill="#0f172a">${esc(names[i])}</text><text x="${c[0]}" y="${c[1] + 16}" text-anchor="middle" font-size="14" font-weight="600" fill="#0f766e">${esc(dec)} ${esc(t('sv.us.dec'))}</text>`; }).join('')}
            <text x="290" y="34" text-anchor="middle" font-size="13" font-weight="600" fill="#334155">${esc(t('sv.ds.N'))} · ${esc(fmtLen(140, 'ftin'))}</text>
            <text x="300" y="382" text-anchor="middle" font-size="13" font-weight="600" fill="#334155">${esc(t('sv.ds.S'))} · ${esc(fmtLen(156, 'ftin'))}</text>
            <g transform="translate(560 50)"><circle r="18" fill="#fff" stroke="#cbd5e1"/><path d="M0 -13 L5 6 L0 3 Z" fill="#e11d48"/><path d="M0 -13 L-5 6 L0 3 Z" fill="#0f172a"/></g>
        </svg>`;
    }

    /* =========================================================
       Hook into the site
       ========================================================= */
    window.SURVEY = {
        show() { if (tab === 'map') MAP.show(); },
        relabel() { FIELD.relabel(); CONV.render(); KH.relabel(); MAP.relabel(); renderHome(); },
        lock,
        _map: MAP, _kh: KH,
    };
    setTab(['map', 'field', 'kh', 'conv'].includes(tab) ? tab : 'map');
    CS.applyI18n();
    try { const pr = CS.pro ? CS.pro() : { canUse: true }; lock(!pr.canUse, false, false); } catch (e) { /* ok */ }
    if (CS.page() === 'survey') window.SURVEY.show();
})();