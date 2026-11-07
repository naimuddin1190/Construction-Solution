/* =========================================================
   Construction Solution — survey-tools.js
   Helpers for the Land Survey section (survey.js):
     · file bits  : CRC-32, ZIP (for KMZ), PDF with one page image,
                    PNG with a real 300-dpi tag, DPI from JPEG/PNG/EXIF
     · geometry   : homography (straighten a photo), polygon simplify
     · digitizer  : find a plot's boundary on a scanned mouza map
     · geo        : control points → lat/lon (Helmert), KML text
     · Land3D     : small three.js viewer for the field-measure tab
   Everything is plain functions on window.SVT.
   ========================================================= */
window.SVT = (() => {
    'use strict';

    /* ---------- CRC-32 ---------- */
    const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
    function crc32(u8, from = 0, to = u8.length) { let c = 0xFFFFFFFF; for (let i = from; i < to; i++) c = CRC[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
    const enc = new TextEncoder();
    function concat(parts) { const n = parts.reduce((s, p) => s + p.length, 0), out = new Uint8Array(n); let o = 0; parts.forEach((p) => { out.set(p, o); o += p.length; }); return out; }

    /* ---------- ZIP (stored, no compression) ---------- */
    function zip(files) {
        const parts = [], central = [];
        let off = 0;
        const d = new Date(), dosT = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), dosD = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
        files.forEach((f) => {
            const name = enc.encode(f.name), data = f.data, crc = crc32(data);
            const L = new Uint8Array(30 + name.length), lv = new DataView(L.buffer);
            lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(8, 0, true);
            lv.setUint16(10, dosT, true); lv.setUint16(12, dosD, true); lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true);
            lv.setUint16(26, name.length, true); lv.setUint16(28, 0, true); L.set(name, 30);
            const C = new Uint8Array(46 + name.length), cv = new DataView(C.buffer);
            cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true);
            cv.setUint16(12, dosT, true); cv.setUint16(14, dosD, true); cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
            cv.setUint16(28, name.length, true); cv.setUint32(42, off, true); C.set(name, 46);
            parts.push(L, data); central.push(C);
            off += L.length + data.length;
        });
        const cd = concat(central), E = new Uint8Array(22), ev = new DataView(E.buffer);
        ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, cd.length, true); ev.setUint32(16, off, true);
        return concat([...parts, cd, E]);
    }

    /* ---------- PDF: one page, one JPEG filling it ---------- */
    function pdf(jpeg, iw, ih, pw, ph, title) {
        const parts = [], offs = [];
        let len = 0;
        const push = (x) => { const u = typeof x === 'string' ? enc.encode(x) : x; parts.push(u); len += u.length; };
        const hex16 = (s) => { let h = 'FEFF'; for (const ch of String(s)) { const c = ch.codePointAt(0); if (c > 0xFFFF) { const v = c - 0x10000; h += ((0xD800 + (v >> 10)).toString(16) + (0xDC00 + (v & 0x3FF)).toString(16)).toUpperCase(); } else h += c.toString(16).padStart(4, '0').toUpperCase(); } return `<${h}>`; };
        const obj = (n, body) => { offs[n] = len; push(`${n} 0 obj\n`); body(); push('\nendobj\n'); };
        const W = pw.toFixed(3), H = ph.toFixed(3);
        push('%PDF-1.4\n%');
        push(new Uint8Array([0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));
        obj(1, () => push('<< /Type /Catalog /Pages 2 0 R /ViewerPreferences << /PrintScaling /None >> >>'));
        obj(2, () => push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
        obj(3, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>`));
        obj(4, () => { push(`<< /Type /XObject /Subtype /Image /Width ${iw} /Height ${ih} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); push(jpeg); push('\nendstream'); });
        const content = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
        obj(5, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
        obj(6, () => push(`<< /Title ${hex16(title || 'Survey')} /Producer (Construction Solution) /Creator (Construction Solution) >>`));
        const x = len;
        push(`xref\n0 7\n0000000000 65535 f \n${offs.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`);
        push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${x}\n%%EOF\n`);
        return concat(parts);
    }

    /* ---------- PNG: add a pHYs chunk so other apps know it is 300 dpi ---------- */
    function pngDpi(png, dpi) {
        if (!(png[0] === 0x89 && png[1] === 0x50)) return png;
        const ppm = Math.round(dpi / 0.0254), ch = new Uint8Array(21), v = new DataView(ch.buffer);
        v.setUint32(0, 9); ch.set(enc.encode('pHYs'), 4); v.setUint32(8, ppm); v.setUint32(12, ppm); ch[16] = 1;
        v.setUint32(17, crc32(ch, 4, 17));
        const at = 8 + 8 + 13 + 4;                                  // after IHDR
        return concat([png.subarray(0, at), ch, png.subarray(at)]);
    }

    /* ---------- DPI written in an image file ---------- */
    // → { dpi, camera, src } — camera photos carry a fake 72 dpi, so they are not trusted
    function readDpi(b) {
        const r = { dpi: null, camera: false, src: '' };
        try {
            if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) {
                let i = 8;
                while (i + 12 <= b.length) {
                    const len = ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
                    const type = String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]);
                    if (type === 'pHYs' && b[i + 16] === 1) { r.dpi = Math.round((((b[i + 8] << 24) | (b[i + 9] << 16) | (b[i + 10] << 8) | b[i + 11]) >>> 0) * 0.0254); r.src = 'png'; }
                    if (type === 'IDAT' || type === 'IEND') break;
                    i += 12 + len;
                }
                return r;
            }
            if (b[0] === 0xFF && b[1] === 0xD8) {
                let i = 2;
                while (i + 4 < b.length && b[i] === 0xFF) {
                    const m = b[i + 1], len = (b[i + 2] << 8) | b[i + 3];
                    if (m === 0xDA || m === 0xD9) break;
                    if (m === 0xE0 && String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]) === 'JFIF') {
                        const u = b[i + 11], x = (b[i + 12] << 8) | b[i + 13];
                        if (!r.dpi && (u === 1 || u === 2) && x > 1) { r.dpi = u === 1 ? x : Math.round(x * 2.54); r.src = 'jfif'; }
                    }
                    if (m === 0xE1 && String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]) === 'Exif') {
                        const t = i + 10, le = b[t] === 0x49;
                        const u16 = (o) => (le ? b[t + o] | (b[t + o + 1] << 8) : (b[t + o] << 8) | b[t + o + 1]);
                        const u32 = (o) => (le ? (b[t + o] | (b[t + o + 1] << 8) | (b[t + o + 2] << 16) | (b[t + o + 3] << 24)) >>> 0 : ((b[t + o] << 24) | (b[t + o + 1] << 16) | (b[t + o + 2] << 8) | b[t + o + 3]) >>> 0);
                        const ifd = u32(4), n = u16(ifd);
                        let xr = null, unit = 2;
                        for (let k = 0; k < n && k < 200; k++) {
                            const e = ifd + 2 + k * 12, tag = u16(e);
                            if (tag === 0x011A) { const o = u32(e + 8), den = u32(o + 4); if (den) xr = u32(o) / den; }
                            if (tag === 0x0128) unit = u16(e + 8);
                            if (tag === 0x010F || tag === 0x0110 || tag === 0x8769) r.camera = true;   // camera make / model / exif block
                        }
                        if (xr && (!r.dpi || r.src !== 'jfif')) { r.dpi = Math.round(unit === 3 ? xr * 2.54 : xr); r.src = 'exif'; }
                    }
                    i += 2 + len;
                }
            }
        } catch (e) { /* unreadable */ }
        return r;
    }
    // can this dpi be trusted for an exact scale?
    const trustDpi = (r) => !!(r && r.dpi && r.dpi >= 100 && r.dpi <= 2400 && !r.camera && r.dpi !== 72 && r.dpi !== 96);

    /* ---------- homography (4 points → 4 points) ---------- */
    function homography(src, dst) {
        const A = [], B = [];
        for (let i = 0; i < 4; i++) {
            const [x, y] = src[i], [u, v] = dst[i];
            A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u);
            A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v);
        }
        for (let c = 0; c < 8; c++) {                              // Gauss-Jordan
            let p = c;
            for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
            [A[c], A[p]] = [A[p], A[c]]; [B[c], B[p]] = [B[p], B[c]];
            const d = A[c][c];
            if (Math.abs(d) < 1e-12) return null;
            for (let k = c; k < 8; k++) A[c][k] /= d;
            B[c] /= d;
            for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c]; if (f) { for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; B[r] -= f * B[c]; } }
        }
        return [...B, 1];
    }
    const applyH = (h, p) => { const w = h[6] * p[0] + h[7] * p[1] + h[8]; return [(h[0] * p[0] + h[1] * p[1] + h[2]) / w, (h[3] * p[0] + h[4] * p[1] + h[5]) / w]; };
    // out(x,y) = src(Hinv(x,y)), bilinear; outside → white
    function warp(src, hinv, outW, outH) {
        const S = src.data, sw = src.width, sh = src.height;
        const out = new ImageData(outW, outH), O = out.data;
        const [a, b, c, d, e, f, g, h, k] = hinv;
        for (let y = 0; y < outH; y++) {
            let X = b * y + c, Y = e * y + f, Wd = h * y + k;
            let o = y * outW * 4;
            for (let x = 0; x < outW; x++, o += 4, X += a, Y += d, Wd += g) {
                const sx = X / Wd - 0.5, sy = Y / Wd - 0.5;
                if (sx < 0 || sy < 0 || sx >= sw - 1 || sy >= sh - 1) { O[o] = O[o + 1] = O[o + 2] = O[o + 3] = 255; continue; }
                const x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0, i = (y0 * sw + x0) * 4, j = i + sw * 4;
                for (let ch = 0; ch < 3; ch++) {
                    const top = S[i + ch] + (S[i + 4 + ch] - S[i + ch]) * fx, bot = S[j + ch] + (S[j + 4 + ch] - S[j + ch]) * fx;
                    O[o + ch] = top + (bot - top) * fy;
                }
                O[o + 3] = 255;
            }
        }
        return out;
    }

    /* ---------- polygon simplify (Ramer–Douglas–Peucker) ---------- */
    function rdp(P, eps) {
        if (P.length < 4) return P.slice();
        const keep = new Uint8Array(P.length); keep[0] = keep[P.length - 1] = 1;
        const st = [[0, P.length - 1]];
        while (st.length) {
            const [i, j] = st.pop(), a = P[i], b = P[j], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-9;
            let md = -1, mi = -1;
            for (let k = i + 1; k < j; k++) { const d = Math.abs((P[k][0] - a[0]) * dy - (P[k][1] - a[1]) * dx) / L; if (d > md) { md = d; mi = k; } }
            if (md > eps) { keep[mi] = 1; st.push([i, mi], [mi, j]); }
        }
        return P.filter((_, i) => keep[i]);
    }
    function simplifyRing(R, eps) {
        if (R.length < 4) return R;
        // split the closed ring at its two farthest points so RDP works on open chains
        let far = 0, fd = -1;
        R.forEach((p, i) => { const d = (p[0] - R[0][0]) ** 2 + (p[1] - R[0][1]) ** 2; if (d > fd) { fd = d; far = i; } });
        const A = rdp(R.slice(0, far + 1), eps), B = rdp(R.slice(far).concat([R[0]]), eps);
        return A.slice(0, -1).concat(B.slice(0, -1));
    }

    // replace tiny bevel edges at corners with the meeting point of the two long sides
    function squareCorners(P, minLen) {
        let changed = true, guard = 0;
        while (changed && P.length > 3 && guard++ < 200) {
            changed = false;
            for (let i = 0; i < P.length && P.length > 3; i++) {
                const n = P.length, a = P[i], b = P[(i + 1) % n];
                if (Math.hypot(b[0] - a[0], b[1] - a[1]) >= minLen) continue;
                const p0 = P[(i - 1 + n) % n], p3 = P[(i + 2) % n];
                const d1 = [a[0] - p0[0], a[1] - p0[1]], d2 = [p3[0] - b[0], p3[1] - b[1]];
                const l1 = Math.hypot(d1[0], d1[1]), l2 = Math.hypot(d2[0], d2[1]);
                if (l1 < minLen * 1.5 || l2 < minLen * 1.5) continue;    // only real corners between two long sides
                const den = d1[0] * d2[1] - d1[1] * d2[0];
                if (Math.abs(den) / (l1 * l2) < 0.42) continue;           // sides nearly in line (< ~25°)
                const tt = ((b[0] - p0[0]) * d2[1] - (b[1] - p0[1]) * d2[0]) / den;
                const X = [p0[0] + d1[0] * tt, p0[1] + d1[1] * tt];
                if (Math.hypot(X[0] - a[0], X[1] - a[1]) > minLen * 3) continue;
                P[i] = X; P.splice((i + 1) % n, 1);
                if ((i + 1) % n === 0) P.push(P.shift());               // keep order sane when we removed index 0
                changed = true; break;
            }
        }
        return P;
    }

    /* =========================================================
       Digitizer — light areas enclosed by dark (ink) lines
       ========================================================= */
    // look at part of the image (rect in image px), at most maxPx pixels
    function analyse(img, rect, maxPx) {
        const a = Math.min(1, Math.sqrt(maxPx / (rect.w * rect.h)));
        const W = Math.max(8, Math.round(rect.w * a)), H = Math.max(8, Math.round(rect.h * a));
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
        g.imageSmoothingQuality = 'high';
        g.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, W, H);
        const px = g.getImageData(0, 0, W, H).data, N = W * H;
        const gray = new Uint8Array(N), hist = new Uint32Array(256);
        for (let i = 0, j = 0; i < N; i++, j += 4) {
            // darkest channel: coloured ink (red/blue lines) still counts as ink
            const v = Math.min(px[j], px[j + 1], px[j + 2]) * 0.6 + (0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2]) * 0.4;
            gray[i] = v; hist[v | 0]++;
        }
        // Otsu threshold between ink and paper
        let sum = 0; for (let t = 0; t < 256; t++) sum += t * hist[t];
        let sB = 0, wB = 0, best = 0, T = 128;
        for (let t = 0; t < 256; t++) {
            wB += hist[t]; if (!wB) continue;
            const wF = N - wB; if (!wF) break;
            sB += t * hist[t];
            const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) ** 2;
            if (v > best) { best = v; T = t; }
        }
        T = Math.max(70, Math.min(T, 215));
        const dark = new Uint8Array(N);
        for (let i = 0; i < N; i++) dark[i] = gray[i] < T ? 1 : 0;
        // typical line width = most common short horizontal ink run
        const runs = new Uint32Array(24);
        for (let y = 0; y < H; y += 3) { let r = 0; for (let x = 0; x < W; x++) { if (dark[y * W + x]) r++; else { if (r && r < 24) runs[r]++; r = 0; } } }
        let lw = 2, rb = 0; for (let k = 1; k < 24; k++) if (runs[k] > rb) { rb = runs[k]; lw = k; }
        return { a, W, H, rect, dark, lw, blocked: {} };
    }
    function blockedOf(an, gap) {
        if (an.blocked[gap]) return an.blocked[gap];
        const { W, H, dark } = an;
        let cur = dark;
        for (let k = 0; k < gap; k++) {                                // grow ink by 1 px per step (closes small breaks)
            const nx = cur.slice();
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
                const i = y * W + x;
                if (cur[i]) continue;
                if ((x > 0 && cur[i - 1]) || (x < W - 1 && cur[i + 1]) || (y > 0 && cur[i - W]) || (y < H - 1 && cur[i + W])) nx[i] = 1;
            }
            cur = nx;
        }
        an.blocked[gap] = cur;
        return cur;
    }
    // flood fill the open (paper) area from one pixel
    function fill(an, block, seed, seen, stack) {
        const { W, H } = an;
        let sp = 0, area = 0, x0 = W, y0 = H, x1 = 0, y1 = 0, border = false;
        stack[sp++] = seed; seen[seed] = 1;
        const pix = [];
        while (sp) {
            const i = stack[--sp], x = i % W, y = (i / W) | 0;
            pix.push(i); area++;
            if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
            if (x === 0 || y === 0 || x === W - 1 || y === H - 1) border = true;
            if (x > 0 && !seen[i - 1] && !block[i - 1]) { seen[i - 1] = 1; stack[sp++] = i - 1; }
            if (x < W - 1 && !seen[i + 1] && !block[i + 1]) { seen[i + 1] = 1; stack[sp++] = i + 1; }
            if (y > 0 && !seen[i - W] && !block[i - W]) { seen[i - W] = 1; stack[sp++] = i - W; }
            if (y < H - 1 && !seen[i + W] && !block[i + W]) { seen[i + W] = 1; stack[sp++] = i + W; }
        }
        return { pix, area, border, x0, y0, x1, y1 };
    }
    // region pixels → outline polygon (image px), pushed out to the middle of the ink line
    function outline(an, reg, block, eps) {
        const { W, H } = an, pad = 26;
        const bx0 = Math.max(0, reg.x0 - pad), by0 = Math.max(0, reg.y0 - pad), bx1 = Math.min(W - 1, reg.x1 + pad), by1 = Math.min(H - 1, reg.y1 + pad);
        const bw = bx1 - bx0 + 1, bh = by1 - by0 + 1, N = bw * bh;
        const m = new Uint8Array(N), step = new Uint8Array(N);
        reg.pix.forEach((i) => { m[(((i / W) | 0) - by0) * bw + (i % W) - bx0] = 1; });
        // walk out through the ink band (layer by layer) to learn how thick the boundary line is
        let front = [];
        for (let i = 0; i < N; i++) {
            if (!m[i]) continue;
            const x = i % bw, y = (i / bw) | 0;
            if ((x > 0 && !m[i - 1]) || (x < bw - 1 && !m[i + 1]) || (y > 0 && !m[i - bw]) || (y < bh - 1 && !m[i + bw])) front.push(i);
        }
        const perim = front.length || 1, cap = Math.min(24, Math.max(4, Math.round(an.lw * 2.5) + 4));
        let claimed = 0;
        for (let k = 1; k <= cap && front.length; k++) {
            const nf = [];
            front.forEach((i) => {
                const x = i % bw, y = (i / bw) | 0;
                const tryp = (j, ok) => { if (!ok || m[j] || step[j]) return; const gx = (j % bw) + bx0, gy = ((j / bw) | 0) + by0; if (!block[gy * W + gx]) return; step[j] = k; claimed++; nf.push(j); };
                tryp(i - 1, x > 0); tryp(i + 1, x < bw - 1); tryp(i - bw, y > 0); tryp(i + bw, y < bh - 1);
            });
            front = nf;
        }
        const half = Math.max(1, Math.round(claimed / perim / 2));       // to the middle of the line
        for (let i = 0; i < N; i++) if (step[i] && step[i] <= half) m[i] = 1;
        const get = (x, y) => (x >= 0 && y >= 0 && x < bw && y < bh ? m[y * bw + x] : 0);
        // marching squares, region kept on the right
        let sx = -1, sy = -1;
        for (let y = 0; y < bh && sx < 0; y++) for (let x = 0; x < bw; x++) if (m[y * bw + x]) { sx = x; sy = y; break; }
        if (sx < 0) return null;
        const pts = [];
        let x = sx, y = sy, dir = 0;                                // 0 E, 1 S, 2 W, 3 N
        const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
        let guard = 0;
        do {
            const code = get(x - 1, y - 1) | (get(x, y - 1) << 1) | (get(x - 1, y) << 2) | (get(x, y) << 3);
            let nd;
            switch (code) {
                case 1: case 3: case 11: nd = 2; break;
                case 2: case 10: case 14: nd = 3; break;
                case 4: case 5: case 7: nd = 1; break;
                case 8: case 12: case 13: nd = 0; break;
                case 6: nd = dir === 0 ? 1 : 3; break;
                case 9: nd = dir === 3 ? 0 : 2; break;
                default: nd = dir;
            }
            if (nd !== dir || !pts.length) pts.push([x, y]);
            dir = nd; x += DX[dir]; y += DY[dir];
        } while ((x !== sx || y !== sy) && ++guard < 4e6);
        if (pts.length < 3) return null;
        // fine simplify → sharpen bevelled corners → coarse simplify (removes the pixel stair-steps)
        const s = simplifyRing(squareCorners(simplifyRing(pts, 0.9), Math.max(6, an.lw * 3)), eps);
        return s.map(([px, py]) => [an.rect.x + (px + bx0) / an.a, an.rect.y + (py + by0) / an.a]);
    }
    // the plot under one point (image px) → { pts } | { err }
    function regionAt(an, ix, iy) {
        const { W, H, a, rect } = an;
        const sx = Math.round((ix - rect.x) * a), sy = Math.round((iy - rect.y) * a);
        if (sx < 0 || sy < 0 || sx >= W || sy >= H) return { err: 'out' };
        for (const gap of [0, 1, 2, 3]) {
            const block = blockedOf(an, gap);
            let seed = -1;                                            // nearest open pixel (the tap may land on a number)
            for (let r = 0; r <= 8 && seed < 0; r++) for (let dy = -r; dy <= r && seed < 0; dy++) for (let dx = -r; dx <= r; dx++) {
                const x = sx + dx, y = sy + dy;
                if (x >= 0 && y >= 0 && x < W && y < H && !block[y * W + x]) { seed = y * W + x; break; }
            }
            if (seed < 0) continue;
            const reg = fill(an, block, seed, new Uint8Array(W * H), new Int32Array(W * H));
            if (reg.border || reg.area > W * H * 0.35) continue;      // leaked through a broken line → close more gaps
            if (reg.area < 12) return { err: 'small' };
            const pts = outline(an, reg, block, Math.max(1.5, an.lw * 0.8));
            return pts && pts.length >= 3 ? { pts, gap } : { err: 'small' };
        }
        return { err: 'leak' };
    }
    // every closed plot in the analysed area
    function allRegions(an, cap = 600) {
        const { W, H } = an, gap = 1, block = blockedOf(an, gap);
        const seen = new Uint8Array(W * H), stack = new Int32Array(W * H), out = [];
        const minA = Math.max(60, an.lw * an.lw * 40), maxA = W * H * 0.2;
        for (let i = 0; i < W * H && out.length < cap; i++) {
            if (seen[i] || block[i]) continue;
            const reg = fill(an, block, i, seen, stack);
            if (reg.border || reg.area < minA || reg.area > maxA) continue;
            // skip ring-like shapes (letters like ০): too little area for their box
            if (reg.area < (reg.x1 - reg.x0 + 1) * (reg.y1 - reg.y0 + 1) * 0.12) continue;
            const pts = outline(an, reg, block, Math.max(1.5, an.lw * 0.8));
            if (pts && pts.length >= 3) out.push(pts);
        }
        return out;
    }

    /* =========================================================
       Geo: control points → latitude / longitude
       ========================================================= */
    const RAD = Math.PI / 180;
    const mLat = (lat) => 111132.92 - 559.82 * Math.cos(2 * lat * RAD) + 1.175 * Math.cos(4 * lat * RAD);
    const mLon = (lat) => 111412.84 * Math.cos(lat * RAD) - 93.5 * Math.cos(3 * lat * RAD);
    // pts: [{x, y (metres on the map, y = north), lat, lon}] → transform
    function geoFit(pts) {
        if (!pts.length) return null;
        const lat0 = pts[0].lat, lon0 = pts[0].lon, kL = mLat(lat0), kO = mLon(lat0);
        const P = pts.map((p) => ({ x: p.x, y: p.y, E: (p.lon - lon0) * kO, N: (p.lat - lat0) * kL }));
        let a = 1, b = 0, tx, ty;
        const n = P.length;
        const xm = P.reduce((s, p) => s + p.x, 0) / n, ym = P.reduce((s, p) => s + p.y, 0) / n;
        const Em = P.reduce((s, p) => s + p.E, 0) / n, Nm = P.reduce((s, p) => s + p.N, 0) / n;
        if (n >= 2) {
            let sxx = 0, sa = 0, sb = 0;
            P.forEach((p) => { const dx = p.x - xm, dy = p.y - ym, dE = p.E - Em, dN = p.N - Nm; sxx += dx * dx + dy * dy; sa += dx * dE + dy * dN; sb += dx * dN - dy * dE; });
            if (sxx > 1e-9) { a = sa / sxx; b = sb / sxx; }
        }
        tx = Em - a * xm + b * ym; ty = Nm - b * xm - a * ym;
        const toEN = (x, y) => [a * x - b * y + tx, b * x + a * y + ty];
        const rms = n >= 3 ? Math.sqrt(P.reduce((s, p) => { const [E, N] = toEN(p.x, p.y); return s + (E - p.E) ** 2 + (N - p.N) ** 2; }, 0) / n) : 0;
        return {
            n, scale: Math.hypot(a, b), rot: Math.atan2(b, a) / RAD, rms,
            toLL(x, y) { const [E, N] = toEN(x, y); return [lat0 + N / kL, lon0 + E / kO]; },
            mLat, mLon,
        };
    }
    // "23.81, 90.41" / "23.81 90.41" / DMS → [lat, lon] | null
    function parseLatLon(s) {
        s = String(s || '').replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d)).trim();
        const dms = s.match(/(\d+)[°\s]+(\d+)['′\s]+([\d.]+)["″]?\s*([NS])[,\s]+(\d+)[°\s]+(\d+)['′\s]+([\d.]+)["″]?\s*([EW])/i);
        if (dms) {
            const v = (d, m, x, h) => (Number(d) + Number(m) / 60 + Number(x) / 3600) * (/[SW]/i.test(h) ? -1 : 1);
            return [v(dms[1], dms[2], dms[3], dms[4]), v(dms[5], dms[6], dms[7], dms[8])];
        }
        const m = s.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([NS])?[,\s;]+\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EW])?/i);
        if (!m) return null;
        let lat = Number(m[1]), lon = Number(m[3]);
        if (m[2] && /s/i.test(m[2])) lat = -lat;
        if (m[4] && /w/i.test(m[4])) lon = -lon;
        if (!(Math.abs(lat) <= 90 && Math.abs(lon) <= 180)) return null;
        return [lat, lon];
    }
    const xml = (s) => String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
    const kcol = (hex, alpha) => { const h = hex.replace('#', ''); return alpha + h.slice(4, 6) + h.slice(2, 4) + h.slice(0, 2); };
    // doc: { name, folders: [{ name, items: [{ name, desc, color, ring: [[lat, lon]…] }] }], overlay: { href, n, s, e, w, rot, name } }
    function kml(doc) {
        const styles = new Set(), body = [];
        doc.folders.forEach((f) => {
            if (!f.items.length) return;
            body.push(`<Folder><name>${xml(f.name)}</name>`);
            f.items.forEach((it) => {
                const id = 's' + it.color.replace('#', '');
                styles.add(it.color);
                const ring = it.ring.concat([it.ring[0]]).map(([la, lo]) => `${lo.toFixed(8)},${la.toFixed(8)},0`).join(' ');
                body.push(`<Placemark><name>${xml(it.name)}</name><description>${xml(it.desc || '')}</description><styleUrl>#${id}</styleUrl><Polygon><tessellate>1</tessellate><outerBoundaryIs><LinearRing><coordinates>${ring}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`);
            });
            body.push('</Folder>');
        });
        const st = [...styles].map((c) => `<Style id="s${c.replace('#', '')}"><LineStyle><color>${kcol(c, 'ff')}</color><width>2.5</width></LineStyle><PolyStyle><color>${kcol(c, '59')}</color></PolyStyle><LabelStyle><scale>0.9</scale></LabelStyle></Style>`).join('');
        const o = doc.overlay;
        const ov = o ? `<GroundOverlay><name>${xml(o.name)}</name><color>c8ffffff</color><drawOrder>0</drawOrder><Icon><href>${xml(o.href)}</href></Icon><LatLonBox><north>${o.n.toFixed(9)}</north><south>${o.s.toFixed(9)}</south><east>${o.e.toFixed(9)}</east><west>${o.w.toFixed(9)}</west><rotation>${o.rot.toFixed(5)}</rotation></LatLonBox></GroundOverlay>` : '';
        return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${xml(doc.name)}</name>${st}${ov}${body.join('')}</Document></kml>\n`;
    }

    /* =========================================================
       Land3D — three.js view of a piece of land
       ========================================================= */
    function Land3D(host) {
        const T = window.THREE;
        if (!T || !host) return null;
        let renderer;
        try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return null; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        host.appendChild(renderer.domElement);
        const scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 1, 0.1, 1e6);
        scene.add(new T.HemisphereLight(0xffffff, 0x5b6b5b, 0.95));
        const sun = new T.DirectionalLight(0xffffff, 0.75); sun.position.set(0.6, 1, 0.35); scene.add(sun);
        let group = null, S = 100, ctr = new T.Vector3(), az = -0.6, el = 0.85, dist = 1.55, auto = true, raf = 0, visible = true, dirty = true;
        const disposeAll = (o) => o.traverse((m) => { if (m.geometry) m.geometry.dispose(); if (m.material) [].concat(m.material).forEach((x) => { if (x.map) x.map.dispose(); x.dispose(); }); });
        function sprite(text, h, color = '#0f172a', bg = 'rgba(255,255,255,.92)') {
            const c = document.createElement('canvas'), g = c.getContext('2d'), fs = 46;
            g.font = `700 ${fs}px 'Noto Sans Bengali', Poppins, sans-serif`;
            const w = Math.ceil(g.measureText(text).width) + 36;
            c.width = w; c.height = fs + 30;
            g.font = `700 ${fs}px 'Noto Sans Bengali', Poppins, sans-serif`;
            g.fillStyle = bg; const r = 18;
            g.beginPath(); g.moveTo(r, 0); g.arcTo(w, 0, w, c.height, r); g.arcTo(w, c.height, 0, c.height, r); g.arcTo(0, c.height, 0, 0, r); g.arcTo(0, 0, w, 0, r); g.fill();
            g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, c.height / 2 + 2);
            const tex = new T.CanvasTexture(c); tex.minFilter = T.LinearFilter;
            const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
            sp.scale.set(h * w / c.height, h, 1); sp.renderOrder = 10;
            return sp;
        }
        // spec: { shapes: [{ pts: [[x, y]…] (ft, y = south), color, edges: ['label'…] }], diag: [a, b] | null, title, north }
        function update(spec) {
            if (group) { scene.remove(group); disposeAll(group); }
            group = new T.Group();
            let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
            spec.shapes.forEach((s) => s.pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
            S = Math.max(x1 - x0, y1 - y0, 1);
            const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, th = S * 0.035;
            // ground
            const gnd = new T.Mesh(new T.PlaneGeometry(S * 5, S * 5), new T.MeshLambertMaterial({ color: 0xe3e8df }));
            gnd.rotation.x = -Math.PI / 2; gnd.position.y = -0.01; group.add(gnd);
            const grid = new T.GridHelper(S * 5, 50, 0xc5cec2, 0xd5dcd2); grid.position.y = 0.002; group.add(grid);
            spec.shapes.forEach((s, si) => {
                const sh = new T.Shape(s.pts.map(([x, y]) => new T.Vector2(x - cx, -(y - cy))));
                const geo = new T.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false });
                geo.rotateX(-Math.PI / 2);
                const top = new T.MeshLambertMaterial({ color: new T.Color(s.color || '#6fbf73') }), side = new T.MeshLambertMaterial({ color: 0x8d6440 });
                group.add(new T.Mesh(geo, [top, side]));
                // boundary line on top
                const lp = s.pts.concat([s.pts[0]]).map(([x, y]) => new T.Vector3(x - cx, th + S * 0.002, y - cy));
                group.add(new T.Line(new T.BufferGeometry().setFromPoints(lp), new T.LineBasicMaterial({ color: 0xffffff })));
                // boundary pillars (সীমানা খুঁটি)
                const pw = S * 0.022, ph = S * 0.1;
                s.pts.forEach(([x, y]) => {
                    const post = new T.Mesh(new T.BoxGeometry(pw, ph, pw), new T.MeshLambertMaterial({ color: 0xd9d4c7 }));
                    post.position.set(x - cx, th + ph / 2, y - cy); group.add(post);
                    const cap = new T.Mesh(new T.BoxGeometry(pw * 1.05, ph * 0.18, pw * 1.05), new T.MeshLambertMaterial({ color: 0xdc2626 }));
                    cap.position.set(x - cx, th + ph * 0.92, y - cy); group.add(cap);
                });
                // side lengths
                const c0 = s.pts.reduce((a, p) => [a[0] + p[0] / s.pts.length, a[1] + p[1] / s.pts.length], [0, 0]);
                s.pts.forEach((p, i) => {
                    const q = s.pts[(i + 1) % s.pts.length], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
                    const dx = mx - c0[0], dy = my - c0[1], L = Math.hypot(dx, dy) || 1;
                    if (!s.edges || !s.edges[i]) return;
                    const sp = sprite(s.edges[i], S * 0.085);
                    sp.position.set(mx - cx + dx / L * S * 0.09, th + S * 0.06, my - cy + dy / L * S * 0.09); group.add(sp);
                });
                if (s.label) { const sp = sprite(s.label, S * 0.1, '#065f46'); sp.position.set(c0[0] - cx, th + S * 0.16, c0[1] - cy); group.add(sp); }
                if (si === 0 && spec.diag) {
                    const [a, b] = spec.diag;
                    const dg = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(a[0] - cx, th + S * 0.004, a[1] - cy), new T.Vector3(b[0] - cx, th + S * 0.004, b[1] - cy)]), new T.LineDashedMaterial({ color: 0x0f766e, dashSize: S * 0.03, gapSize: S * 0.02 }));
                    dg.computeLineDistances(); group.add(dg);
                }
            });
            if (spec.north) { const n = sprite(spec.north, S * 0.08, '#fff', '#e11d48'); n.position.set(0, th + S * 0.05, (y0 - cy) - S * 0.28); group.add(n); }
            scene.add(group);
            ctr.set(0, th, 0);
            dirty = true; loop();
        }
        function size() {
            const w = host.clientWidth, h = host.clientHeight;
            if (!w || !h) return false;
            const cvs = renderer.domElement;
            if (cvs.width !== Math.round(w * renderer.getPixelRatio()) || cvs.height !== Math.round(h * renderer.getPixelRatio())) { renderer.setSize(w, h, false); cvs.style.width = '100%'; cvs.style.height = '100%'; cam.aspect = w / h; cam.updateProjectionMatrix(); }
            return true;
        }
        function frame() {
            raf = 0;
            if (!visible || !group) return;
            if (auto) { az += 0.0035; dirty = true; }
            if (dirty && size()) {
                const r = S * dist;
                cam.position.set(ctr.x + r * Math.cos(el) * Math.sin(az), ctr.y + r * Math.sin(el), ctr.z + r * Math.cos(el) * Math.cos(az));
                cam.near = S * 0.01; cam.far = S * 50; cam.updateProjectionMatrix();
                cam.lookAt(ctr);
                renderer.render(scene, cam);
                dirty = false;
            }
            if (auto) loop();
        }
        const loop = () => { if (!raf) raf = requestAnimationFrame(frame); };
        // orbit by drag / pinch / wheel
        const el$ = renderer.domElement, ptr = new Map();
        el$.style.touchAction = 'none'; el$.style.cursor = 'grab';
        let pinch = 0;
        el$.addEventListener('pointerdown', (e) => { auto = false; ptr.set(e.pointerId, [e.clientX, e.clientY]); try { el$.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
        el$.addEventListener('pointermove', (e) => {
            if (!ptr.has(e.pointerId)) return;
            const p = ptr.get(e.pointerId), dx = e.clientX - p[0], dy = e.clientY - p[1];
            ptr.set(e.pointerId, [e.clientX, e.clientY]);
            if (ptr.size === 2) { const [a, b] = [...ptr.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) dist = Math.min(Math.max(dist * pinch / d, 0.6), 6); pinch = d; }
            else { az -= dx * 0.008; el = Math.min(Math.max(el + dy * 0.006, 0.12), 1.45); }
            dirty = true; loop();
        });
        const up = (e) => { ptr.delete(e.pointerId); if (ptr.size < 2) pinch = 0; };
        el$.addEventListener('pointerup', up); el$.addEventListener('pointercancel', up);
        el$.addEventListener('wheel', (e) => { e.preventDefault(); auto = false; dist = Math.min(Math.max(dist * Math.exp(e.deltaY * 0.001), 0.6), 6); dirty = true; loop(); }, { passive: false });
        new ResizeObserver(() => { dirty = true; loop(); }).observe(host);
        if ('IntersectionObserver' in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) { dirty = true; loop(); } }).observe(host);
        return {
            update,
            reset() { az = -0.6; el = 0.85; dist = 1.55; auto = true; dirty = true; loop(); },
            refresh() { dirty = true; loop(); },
        };
    }

    return { crc32, zip, pdf, pngDpi, readDpi, trustDpi, homography, applyH, warp, rdp, simplifyRing, analyse, regionAt, allRegions, geoFit, parseLatLon, kml, Land3D, mLat, mLon };
})();