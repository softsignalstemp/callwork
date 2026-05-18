import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Icon SVG — 1024×1024 ────────────────────────────────────────────────────
// Design: dark violet background + radial glow + large shard bianco centrato
// + shard accent small in alto a destra + quad teal piccolo

const ICON_SVG = `<svg width="1024" height="1024" viewBox="0 0 1024 1024"
  xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#1A0A3D"/>
      <stop offset="60%" stop-color="#0D0D1A"/>
      <stop offset="100%" stop-color="#07070F"/>
    </linearGradient>
    <radialGradient id="glow" cx="48%" cy="44%" r="42%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowBR" cx="80%" cy="80%" r="30%">
      <stop offset="0%" stop-color="#6D28D9" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#6D28D9" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>
  <rect width="1024" height="1024" fill="url(#glowBR)"/>

  <!-- Main shard — bianco, centrato, ruotato leggermente -->
  <g transform="translate(152 128) scale(720) rotate(-8 0.5 0.5)">
    <path d="M0.116539 0.187984L0.782476 0.0130417C0.855312 -0.00976168
      0.940747 -0.00595721 0.970812 0.0510676C0.993884 0.0948284 1.00203
      0.135712 0.970812 0.188931L0.771031 0.487477L0.909421 0.564491C0.978095
      0.601593 1.00609 0.643428 0.998905 0.703327C0.991033 0.768954 0.961446
      0.793652 0.871961 0.820274L0.220591 0.987611C0.111335 1.01233 0.047614
      0.998323 0.0249724 0.960967C-0.00540408 0.91085 -0.0133159 0.889933
      0.0312152 0.81552L0.0978094 0.72137L0.240362 0.512197L0.116539
      0.440889C0.0509847 0.405713 0.0352626 0.383845 0.0156077 0.339155
      C-0.00104165 0.301299 0.0228905 0.214605 0.116539 0.187984Z"
      fill="white" opacity="0.95"/>
  </g>

  <!-- Shard accent violet in alto a destra -->
  <g transform="translate(720 60) scale(200) rotate(140 0.5 0.5)">
    <path d="M0.116539 0.187984L0.782476 0.0130417C0.855312 -0.00976168
      0.940747 -0.00595721 0.970812 0.0510676C0.993884 0.0948284 1.00203
      0.135712 0.970812 0.188931L0.771031 0.487477L0.909421 0.564491C0.978095
      0.601593 1.00609 0.643428 0.998905 0.703327C0.991033 0.768954 0.961446
      0.793652 0.871961 0.820274L0.220591 0.987611C0.111335 1.01233 0.047614
      0.998323 0.0249724 0.960967C-0.00540408 0.91085 -0.0133159 0.889933
      0.0312152 0.81552L0.0978094 0.72137L0.240362 0.512197L0.116539
      0.440889C0.0509847 0.405713 0.0352626 0.383845 0.0156077 0.339155
      C-0.00104165 0.301299 0.0228905 0.214605 0.116539 0.187984Z"
      fill="#C084FC" opacity="0.35"/>
  </g>

  <!-- Quad teal in basso a sinistra -->
  <g transform="translate(60 780) scale(120) rotate(22 0.5 0.5)">
    <path d="M1 0.5C0.867392 0.5 0.740215 0.447322 0.646447 0.353553
      C0.552678 0.259785 0.5 0.132608 0.5 0C0.5 0.132608 0.447322 0.259785
      0.353553 0.353553C0.259785 0.447322 0.132608 0.5 0 0.5C0.132608 0.5
      0.259785 0.552678 0.353553 0.646447C0.447322 0.740215 0.5 0.867392 0.5
      1C0.5 0.867392 0.552678 0.740215 0.646447 0.646447C0.740215 0.552678
      0.867392 0.5 1 0.5Z"
      fill="#2DD4BF" opacity="0.5"/>
  </g>

  <!-- Violet accent bar in basso al centro -->
  <rect x="392" y="888" width="240" height="8" rx="4"
    fill="#8B5CF6" opacity="0.7"/>
</svg>`;

// ─── Splash SVG — 1284×2778 (iPhone 14 Pro Max) ──────────────────────────────

const SPLASH_SVG = `<svg width="1284" height="2778" viewBox="0 0 1284 2778"
  xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#1A0A3D"/>
      <stop offset="50%" stop-color="#0D0D1A"/>
      <stop offset="100%" stop-color="#07070F"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1284" height="2778" fill="url(#bg)"/>
  <rect width="1284" height="2778" fill="url(#glow)"/>

  <!-- Shard centrato verticalmente -->
  <g transform="translate(242 1080) scale(800) rotate(-8 0.5 0.5)">
    <path d="M0.116539 0.187984L0.782476 0.0130417C0.855312 -0.00976168
      0.940747 -0.00595721 0.970812 0.0510676C0.993884 0.0948284 1.00203
      0.135712 0.970812 0.188931L0.771031 0.487477L0.909421 0.564491C0.978095
      0.601593 1.00609 0.643428 0.998905 0.703327C0.991033 0.768954 0.961446
      0.793652 0.871961 0.820274L0.220591 0.987611C0.111335 1.01233 0.047614
      0.998323 0.0249724 0.960967C-0.00540408 0.91085 -0.0133159 0.889933
      0.0312152 0.81552L0.0978094 0.72137L0.240362 0.512197L0.116539
      0.440889C0.0509847 0.405713 0.0352626 0.383845 0.0156077 0.339155
      C-0.00104165 0.301299 0.0228905 0.214605 0.116539 0.187984Z"
      fill="white" opacity="0.9"/>
  </g>
</svg>`;

async function generate(svgStr, outPath, size) {
  await sharp(Buffer.from(svgStr))
    .resize(size, size ?? undefined)
    .png()
    .toFile(outPath);
  console.log(`✓ ${outPath}`);
}

async function generateSplash(svgStr, outPath, w, h) {
  await sharp(Buffer.from(svgStr))
    .resize(w, h)
    .png()
    .toFile(outPath);
  console.log(`✓ ${outPath}`);
}

// Icon 1024×1024
await generate(ICON_SVG, resolve(ROOT, 'assets/icon.png'), 1024);

// Adaptive icon Android (1024×1024, solo foreground)
await generate(ICON_SVG, resolve(ROOT, 'assets/adaptive-icon.png'), 1024);

// Splash
await generateSplash(SPLASH_SVG, resolve(ROOT, 'assets/splash-icon.png'), 1284, 2778);

console.log('\nTutti gli asset generati!');
