// Generates app icon, Android adaptive icon, favicon and native splash image
// from assets/brand/mscharan-logo-source.png. Run with: npm run icons
//
// The source logo is blue on transparent, which disappears on our blue/navy
// backgrounds, so every output uses a white-recolored copy (alpha preserved).
// To swap in a higher-resolution logo or an icon-only mark, replace the source
// file and re-run — nothing else needs to change.
import path from 'node:path';

import sharp, { type Sharp } from 'sharp';

import { colors } from '../lib/theme/colors';

const root = path.join(__dirname, '..');
const sourcePath = path.join(root, 'assets/brand/mscharan-logo-source.png');
const outDir = path.join(root, 'assets/images');

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/** Source logo, trimmed to its content and recolored to white. */
async function loadWhiteLogo(): Promise<Sharp> {
  const trimmed = await sharp(sourcePath).trim().ensureAlpha().toBuffer();
  const { data, info } = await sharp(trimmed).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function composite(
  logo: Sharp,
  size: number,
  logoWidthRatio: number,
  background: string | typeof TRANSPARENT,
  outFile: string,
): Promise<void> {
  const logoPng = await logo
    .clone()
    .resize({ width: Math.round(size * logoWidthRatio), kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logoPng, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, outFile));
  console.log(`wrote assets/images/${outFile} (${size}x${size})`);
}

async function main(): Promise<void> {
  const logo = await loadWhiteLogo();

  // iOS / web icon: full lockup at ~70% width on solid primary blue.
  await composite(logo, 1024, 0.7, colors.primary, 'icon.png');

  // Android adaptive foreground: transparent; background color lives in app.config.ts.
  // Launchers mask to a ~61% circle, so the logo is kept at 50% width to stay inside it.
  await composite(logo, 1024, 0.5, TRANSPARENT, 'adaptive-icon.png');

  // Favicon: same composite as the app icon, at browser-tab size.
  await composite(logo, 48, 0.8, colors.primary, 'favicon.png');

  // Native splash: logo on transparent; the navy background is set in app.config.ts.
  await composite(logo, 400, 0.85, TRANSPARENT, 'splash-icon.png');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
