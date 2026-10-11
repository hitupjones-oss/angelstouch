#!/usr/bin/env node
/**
 * Media pipeline — turns full-resolution masters in /media-src into web-ready assets in /public/media.
 *
 *   npm run media              → images + videos
 *   npm run media -- images    → images only
 *   npm run media -- videos    → videos only
 *   npm run media -- videos hands garden → just those assets
 *
 * Images → WebP at several widths (name-480.webp, name-960.webp, …).
 * Videos → H.264 MP4 at 1080p + 720p, silent, faststart, plus a poster frame.
 *          Loops get a 1s cross-dissolve from the last second into the first so they repeat seamlessly.
 *
 * Masters are not committed (see .gitignore); originals live in the Higgsfield library — see docs/media.md.
 */
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';

const SRC = 'media-src';
const OUT = 'public/media';
const only = process.argv[2];
const names = process.argv.slice(3); // optional: limit to specific asset names

/* Image widths per asset. Badges and portraits need fewer sizes. */
const IMAGE_SIZES = {
  default: [480, 960, 1600, 2400],
  'memory-album': [480, 960, 1600],
  'award-2020': [160, 320, 480],
  'award-2023': [160, 320, 480],
  'award-2025': [160, 320, 480],
  'residence-sign': [480, 800],
};

/* Videos: which ones loop (cross-dissolved), and trims for film shots. */
const VIDEOS = {
  'film-laugh': { loop: true },
  'film-painting': {},
  'film-crafts': {},
  'film-caregiver': { loop: true },
  'film-sunrise': {},
  'call-family': { loop: true },
  'call-nurse': { loop: true },
  hands: { loop: true },
  'activities-piano': { loop: true },
  'dining-friends': { loop: true },
  'dining-plated': {},
  garden: { loop: true },
  'careers-team': { loop: true },
};

async function images() {
  const dir = join(SRC, 'img');
  mkdirSync(join(OUT, 'img'), { recursive: true });
  for (const file of readdirSync(dir)) {
    const { name } = parse(file);
    if (names.length && !names.includes(name)) continue;
    const sizes = IMAGE_SIZES[name] ?? IMAGE_SIZES.default;
    const trim = name.startsWith('award'); // badges ship with wide transparent margins
    const base = trim ? await sharp(join(dir, file)).trim({ threshold: 12 }).toBuffer() : join(dir, file);
    const { width } = await sharp(base).metadata();
    for (const w of sizes) {
      if (w > width * 1.05 && !trim) continue; // never upscale photos (flat badges may go up to 2×)
      const out = join(OUT, 'img', `${name}-${w}.webp`);
      await sharp(base)
        .resize({ width: w, withoutEnlargement: !trim, kernel: 'lanczos3' })
        .webp({ quality: name.startsWith('award') ? 90 : 76, effort: 5, smartSubsample: true })
        .toFile(out);
    }
    console.log('img  ', name, sizes.join('/'));
  }
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
}

function probeDuration(file) {
  return parseFloat(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString(),
  );
}

function videos() {
  const dir = join(SRC, 'video');
  mkdirSync(join(OUT, 'video'), { recursive: true });
  for (const file of readdirSync(dir)) {
    const { name } = parse(file);
    if (names.length && !names.includes(name)) continue;
    const cfg = VIDEOS[name] ?? {};
    const input = join(dir, file);
    const dur = probeDuration(input);
    // Seamless loop: drop the first second, then dissolve the tail into that first second.
    const loopGraph = `[0:v]trim=1:${dur.toFixed(3)},setpts=PTS-STARTPTS[main];[0:v]trim=0:1,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=1:offset=${(dur - 2).toFixed(3)}`;
    for (const [h, crf] of [
      [1080, 25],
      [720, 27],
    ]) {
      const scale = `scale=-2:${h}:flags=lanczos,format=yuv420p`;
      const vf = cfg.loop ? `${loopGraph},${scale}` : `[0:v]${scale}`;
      ffmpeg([
        '-i', input,
        '-filter_complex', vf,
        '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
        '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
        join(OUT, 'video', `${name}-${h}.mp4`),
      ]);
    }
    // Poster = first frame of the (looped) 1080 output so there is no visual jump on play.
    const poster = join(OUT, 'video', `${name}-poster.webp`);
    ffmpeg(['-i', join(OUT, 'video', `${name}-1080.mp4`), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '74', poster]);
    console.log('video', name, cfg.loop ? '(loop)' : '');
  }
}

if (!existsSync(SRC)) {
  console.error('No media-src/ folder found. Download masters first (see docs/media.md).');
  process.exit(1);
}
if (!only || only === 'images') await images();
if (!only || only === 'videos') videos();
