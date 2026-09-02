/* Jewel Creek "See It Gone" - patch-based image inpainting (PatchMatch + multi-scale voting).
   Pure JavaScript, no libraries, no network. Runs as a Web Worker; also callable directly for tests.
   inpaint(rgba, W, H, mask, opts, progress) -> Uint8ClampedArray RGBA with masked pixels filled. */
(function (root) {
  'use strict';

  function dilate(mask, W, H, r) {
    var out = mask, i, x, y;
    for (i = 0; i < r; i++) {
      var next = new Uint8Array(W * H);
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
        var k = y * W + x;
        if (out[k] || (x > 0 && out[k - 1]) || (x < W - 1 && out[k + 1]) || (y > 0 && out[k - W]) || (y < H - 1 && out[k + W])) next[k] = 1;
      }
      out = next;
    }
    return out;
  }

  function downscale(img, mask, W, H) {
    var w = W >> 1, h = H >> 1, o = new Float32Array(w * h * 3), m = new Uint8Array(w * h), x, y, c;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      var a = (2 * y) * W + 2 * x, b = a + 1, cc = a + W, d = cc + 1, k = y * w + x;
      for (c = 0; c < 3; c++) o[k * 3 + c] = 0.25 * (img[a * 3 + c] + img[b * 3 + c] + img[cc * 3 + c] + img[d * 3 + c]);
      m[k] = (mask[a] | mask[b] | mask[cc] | mask[d]);
    }
    return { img: o, mask: m, W: w, H: h };
  }

  // smooth fill of the hole from its border (used to seed the coarsest level)
  function diffuse(img, mask, W, H, iters) {
    var x, y, c, it, k;
    for (it = 0; it < iters; it++) {
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
        k = y * W + x; if (!mask[k]) continue;
        var n = 0, s0 = 0, s1 = 0, s2 = 0;
        if (x > 0) { n++; s0 += img[(k - 1) * 3]; s1 += img[(k - 1) * 3 + 1]; s2 += img[(k - 1) * 3 + 2]; }
        if (x < W - 1) { n++; s0 += img[(k + 1) * 3]; s1 += img[(k + 1) * 3 + 1]; s2 += img[(k + 1) * 3 + 2]; }
        if (y > 0) { n++; s0 += img[(k - W) * 3]; s1 += img[(k - W) * 3 + 1]; s2 += img[(k - W) * 3 + 2]; }
        if (y < H - 1) { n++; s0 += img[(k + W) * 3]; s1 += img[(k + W) * 3 + 1]; s2 += img[(k + W) * 3 + 2]; }
        img[k * 3] = s0 / n; img[k * 3 + 1] = s1 / n; img[k * 3 + 2] = s2 / n;
      }
    }
  }

  // a pixel may be a source-patch centre only if the whole patch is known (no hole pixels)
  function validSources(mask, W, H, R) {
    var valid = new Uint8Array(W * H), list = [], x, y, i, j;
    var integ = new Int32Array((W + 1) * (H + 1));
    for (y = 1; y <= H; y++) { var row = 0; for (x = 1; x <= W; x++) { row += mask[(y - 1) * W + (x - 1)]; integ[y * (W + 1) + x] = integ[(y - 1) * (W + 1) + x] + row; } }
    for (y = R; y < H - R; y++) for (x = R; x < W - R; x++) {
      var x0 = x - R, y0 = y - R, x1 = x + R + 1, y1 = y + R + 1;
      var s = integ[y1 * (W + 1) + x1] - integ[y0 * (W + 1) + x1] - integ[y1 * (W + 1) + x0] + integ[y0 * (W + 1) + x0];
      if (s === 0) { valid[y * W + x] = 1; list.push(y * W + x); }
    }
    return { valid: valid, list: list };
  }

  function patchDist(img, W, tx, ty, sx, sy, R, best) {
    var d = 0, dy, dx;
    for (dy = -R; dy <= R; dy++) {
      var to = ((ty + dy) * W + tx - R) * 3, so = ((sy + dy) * W + sx - R) * 3;
      for (dx = -R; dx <= R; dx++) {
        var e0 = img[to] - img[so], e1 = img[to + 1] - img[so + 1], e2 = img[to + 2] - img[so + 2];
        d += e0 * e0 + e1 * e1 + e2 * e2; to += 3; so += 3;
      }
      if (d >= best) return d;
    }
    return d;
  }

  // nearest valid source centre in the same row (then column), else random: a strong prior for trunks
  function rowInit(k, W, H, valid, srcList) {
    var x = k % W, y = (k / W) | 0, l = -1, r = -1, i;
    for (i = x - 1; i >= 0; i--) if (valid[y * W + i]) { l = i; break; }
    for (i = x + 1; i < W; i++) if (valid[y * W + i]) { r = i; break; }
    if (l >= 0 || r >= 0) { var use = (l < 0) ? r : (r < 0) ? l : (x - l <= r - x ? l : r); return y * W + use; }
    for (i = y - 1; i >= 0; i--) if (valid[i * W + x]) return i * W + x;
    for (i = y + 1; i < H; i++) if (valid[i * W + x]) return i * W + x;
    return srcList[(rnd() * srcList.length) | 0];
  }

  function patchDistKnown(img, mask, W, tx, ty, sx, sy, R) {
    var d = 0, n = 0, dy, dx;
    for (dy = -R; dy <= R; dy++) {
      var t = (ty + dy) * W + tx - R, so = ((sy + dy) * W + sx - R) * 3;
      for (dx = -R; dx <= R; dx++) {
        if (!mask[t]) { var to = t * 3, e0 = img[to] - img[so], e1 = img[to + 1] - img[so + 1], e2 = img[to + 2] - img[so + 2]; d += e0 * e0 + e1 * e1 + e2 * e2; n++; }
        t++; so += 3;
      }
    }
    var full = (2 * R + 1) * (2 * R + 1);
    return n ? d * full / n : Infinity;
  }

  var seed = 12345;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

  function level(img, mask, W, H, R, nnf, dist, iters, valid, srcList, progress, pbase, pspan, knownPasses) {
    var PD = function (tx, ty, sx, sy, best) { return knownOnly ? patchDistKnown(img, mask, W, tx, ty, sx, sy, R) : patchDist(img, W, tx, ty, sx, sy, R, best); };
    var knownOnly = knownPasses > 0;
    var holes = [], x, y, k, i;
    for (y = R; y < H - R; y++) for (x = R; x < W - R; x++) if (mask[y * W + x]) holes.push(y * W + x);
    if (!srcList.length || !holes.length) return;
    var vote0 = new Float32Array(W * H), vote1 = new Float32Array(W * H), vote2 = new Float32Array(W * H), voteN = new Float32Array(W * H);
    for (i = 0; i < holes.length; i++) {
      k = holes[i];
      if (!(nnf[k] >= 0 && valid[nnf[k]])) nnf[k] = rowInit(k, W, H, valid, srcList);
      dist[k] = PD(k % W, (k / W) | 0, nnf[k] % W, (nnf[k] / W) | 0, Infinity);
    }
    var maxR = Math.max(W, H);
    for (var it = 0; it < iters; it++) {
      var forward = (it % 2 === 0);
      for (var hi = 0; hi < holes.length; hi++) {
        k = forward ? holes[hi] : holes[holes.length - 1 - hi];
        x = k % W; y = (k / W) | 0;
        var best = dist[k], bk = nnf[k], cand, cx, cy, d;
        // propagation from already-visited neighbours
        var n1 = forward ? k - 1 : k + 1, n2 = forward ? k - W : k + W, step = forward ? 1 : -1;
        if (mask[n1] && nnf[n1] >= 0) { cand = nnf[n1] + step; if (cand >= 0 && cand < W * H && valid[cand]) { cx = cand % W; cy = (cand / W) | 0; d = PD(x, y, cx, cy, best); if (d < best) { best = d; bk = cand; } } }
        if (mask[n2] && nnf[n2] >= 0) { cand = nnf[n2] + step * W; if (cand >= 0 && cand < W * H && valid[cand]) { cx = cand % W; cy = (cand / W) | 0; d = PD(x, y, cx, cy, best); if (d < best) { best = d; bk = cand; } } }
        // random search around the current best
        var bx = bk % W, by = (bk / W) | 0;
        for (var rad = maxR; rad >= 1; rad = rad >> 1) {
          cx = bx + (((rnd() * 2 - 1) * rad) | 0); cy = by + (((rnd() * 2 - 1) * rad) | 0);
          if (cx < R || cy < R || cx >= W - R || cy >= H - R) continue;
          cand = cy * W + cx; if (!valid[cand]) continue;
          d = PD(x, y, cx, cy, best); if (d < best) { best = d; bk = cand; }
        }
        nnf[k] = bk; dist[k] = best;
      }
      // vote: every patch centred on a hole pixel casts its source colours over its footprint
      vote0.fill(0); vote1.fill(0); vote2.fill(0); voteN.fill(0);
      var meanD = 0; for (i = 0; i < holes.length; i++) meanD += dist[holes[i]]; meanD = meanD / holes.length + 1e-3;
      var lastPass = (it === iters - 1) && (W >= 400 || H >= 400);
      for (i = 0; i < holes.length; i++) {
        k = holes[i]; x = k % W; y = (k / W) | 0; var s = nnf[k], sx = s % W, sy = (s / W) | 0;
        var w = Math.exp(-dist[k] / ((lastPass ? 0.25 : 0.6) * meanD));
        for (var dy = -R; dy <= R; dy++) for (var dx = -R; dx <= R; dx++) {
          var t = (y + dy) * W + x + dx; if (!mask[t]) continue;
          var so = ((sy + dy) * W + sx + dx) * 3;
          vote0[t] += w * img[so]; vote1[t] += w * img[so + 1]; vote2[t] += w * img[so + 2]; voteN[t] += w;
        }
      }
      for (i = 0; i < holes.length; i++) { k = holes[i]; if (voteN[k] > 0) { img[k * 3] = vote0[k] / voteN[k]; img[k * 3 + 1] = vote1[k] / voteN[k]; img[k * 3 + 2] = vote2[k] / voteN[k]; } }
      if (knownOnly && it + 1 >= knownPasses) { knownOnly = false; for (i = 0; i < holes.length; i++) { k = holes[i]; dist[k] = patchDist(img, W, k % W, (k / W) | 0, nnf[k] % W, (nnf[k] / W) | 0, R, Infinity); } }
      if (progress) progress(pbase + pspan * (it + 1) / iters);
    }
  }

  function inpaint(rgba, W, H, mask0, opts, progress) {
    opts = opts || {};
    var R = opts.radius || 3, dil = opts.dilate == null ? 4 : opts.dilate;
    var img = new Float32Array(W * H * 3), i, c;
    for (i = 0; i < W * H; i++) for (c = 0; c < 3; c++) img[i * 3 + c] = rgba[i * 4 + c];
    var mask = dilate(mask0, W, H, dil);
    // pyramid
    var pyr = [{ img: img, mask: mask, W: W, H: H }];
    while (Math.min(pyr[pyr.length - 1].W, pyr[pyr.length - 1].H) > 60 && pyr.length < 7) {
      var p = pyr[pyr.length - 1]; pyr.push(downscale(p.img, p.mask, p.W, p.H));
    }
    var L = pyr.length, lv, nnf = null, dist = null;
    var itersFor = function (l) { return l === L - 1 ? 8 : l >= 2 ? 5 : l === 1 ? 4 : 3; };
    var totalIters = 0; for (lv = 0; lv < L; lv++) totalIters += itersFor(lv);
    var done = 0;
    for (lv = L - 1; lv >= 0; lv--) {
      var P = pyr[lv], vs = validSources(P.mask, P.W, P.H, R);
      if (lv === L - 1) {
        nnf = new Int32Array(P.W * P.H).fill(-1); dist = new Float32Array(P.W * P.H);
        if (vs.list.length) { var kk; for (kk = 0; kk < P.W * P.H; kk++) if (P.mask[kk]) { var sk = rowInit(kk, P.W, P.H, vs.valid, vs.list); P.img[kk * 3] = P.img[sk * 3]; P.img[kk * 3 + 1] = P.img[sk * 3 + 1]; P.img[kk * 3 + 2] = P.img[sk * 3 + 2]; } }
        else diffuse(P.img, P.mask, P.W, P.H, 300);
      } else {
        // seed this level's hole from the coarser result, and upsample the correspondence field
        var C = pyr[lv + 1], nn2 = new Int32Array(P.W * P.H).fill(-1), x, y;
        for (y = 0; y < P.H; y++) for (x = 0; x < P.W; x++) {
          var k = y * P.W + x; if (!P.mask[k]) continue;
          var cx = Math.min(x >> 1, C.W - 1), cy = Math.min(y >> 1, C.H - 1), ck = cy * C.W + cx;
          P.img[k * 3] = C.img[ck * 3]; P.img[k * 3 + 1] = C.img[ck * 3 + 1]; P.img[k * 3 + 2] = C.img[ck * 3 + 2];
          if (nnf[ck] >= 0) { var sx = (nnf[ck] % C.W) * 2 + (x & 1), sy = ((nnf[ck] / C.W) | 0) * 2 + (y & 1); if (sx < P.W && sy < P.H && vs.valid[sy * P.W + sx]) nn2[k] = sy * P.W + sx; }
        }
        nnf = nn2; dist = new Float32Array(P.W * P.H);
      }
      if (!vs.list.length) { diffuse(P.img, P.mask, P.W, P.H, 200); }
      else { var its = itersFor(lv); level(P.img, P.mask, P.W, P.H, R, nnf, dist, its, vs.valid, vs.list, progress, done / totalIters, its / totalIters, lv === L - 1 ? 3 : 1); done += its; }
    }
    // Poisson blend: keep the fill's texture gradients, force its tones to meet the original at the seam
    var f = null;
    for (lv = L - 1; lv >= 0; lv--) {
      var Q = pyr[lv], g = Q.img, n = Q.W * Q.H, fw = new Float32Array(n * 3), xx, yy, kk2;
      for (kk2 = 0; kk2 < n; kk2++) {
        if (!Q.mask[kk2]) { fw[kk2 * 3] = g[kk2 * 3]; fw[kk2 * 3 + 1] = g[kk2 * 3 + 1]; fw[kk2 * 3 + 2] = g[kk2 * 3 + 2]; continue; }
        if (f) { var CW = pyr[lv + 1].W, ck2 = Math.min((kk2 / Q.W) >> 1, pyr[lv + 1].H - 1) * CW + Math.min((kk2 % Q.W) >> 1, CW - 1); fw[kk2 * 3] = f[ck2 * 3]; fw[kk2 * 3 + 1] = f[ck2 * 3 + 1]; fw[kk2 * 3 + 2] = f[ck2 * 3 + 2]; }
        else { fw[kk2 * 3] = g[kk2 * 3]; fw[kk2 * 3 + 1] = g[kk2 * 3 + 1]; fw[kk2 * 3 + 2] = g[kk2 * 3 + 2]; }
      }
      var gsIters = lv === L - 1 ? 300 : lv >= 2 ? 100 : 60;
      for (var gi = 0; gi < gsIters; gi++) {
        for (yy = 1; yy < Q.H - 1; yy++) for (xx = 1; xx < Q.W - 1; xx++) {
          kk2 = yy * Q.W + xx; if (!Q.mask[kk2]) continue;
          // interior neighbours: follow the fill's own gradients; boundary neighbours: meet the original continuously
          var nbs = [kk2 - 1, kk2 + 1, kk2 - Q.W, kk2 + Q.W];
          for (c = 0; c < 3; c++) {
            var acc = 0, gp = g[kk2 * 3 + c];
            for (var q = 0; q < 4; q++) { var nk = nbs[q]; acc += fw[nk * 3 + c] + (Q.mask[nk] ? gp - g[nk * 3 + c] : 0); }
            fw[kk2 * 3 + c] = 0.25 * acc;
          }
        }
      }
      f = fw;
    }
    img = f;
    // composite: filled colours inside the (dilated) mask, with a soft 2px edge
    var out = new Uint8ClampedArray(rgba.length), inner = dilate(mask0, W, H, Math.max(0, dil - 2));
    for (i = 0; i < W * H; i++) {
      var a = mask[i] ? 1 : 0;  // the Poisson blend already meets the original at the seam
      for (c = 0; c < 3; c++) out[i * 4 + c] = a === 0 ? rgba[i * 4 + c] : a * img[i * 3 + c] + (1 - a) * rgba[i * 4 + c];
      out[i * 4 + 3] = 255;
    }
    return out;
  }

  root.jcInpaint = inpaint;
  if (typeof importScripts === 'function') {
    self.onmessage = function (e) {
      var d = e.data;
      var out = inpaint(d.rgba, d.W, d.H, d.mask, d.opts, function (p) { self.postMessage({ progress: p }); });
      self.postMessage({ done: true, rgba: out }, [out.buffer]);
    };
  }
})(typeof self !== 'undefined' ? self : this);
