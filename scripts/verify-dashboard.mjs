import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { inflateSync } from "node:zlib";

const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "tablet", width: 900, height: 700 },
  { name: "mobile", width: 390, height: 844 },
];

await mkdir("artifacts", { recursive: true });

const browser = await chromium.launch();

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.locator("canvas").filter({ visible: true }).first().waitFor();
  await page.waitForTimeout(700);

  const metrics = await page.evaluate(() => {
    const canvas = [...document.querySelectorAll("canvas")].find((item) => {
      const rect = item.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const buttons = [...document.querySelectorAll("button")];
    const visibleButtons = buttons.filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    return {
      canvasWidth: canvas?.clientWidth ?? 0,
      canvasHeight: canvas?.clientHeight ?? 0,
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      minButtonHeight: Math.min(
        ...visibleButtons.map((button) => button.getBoundingClientRect().height),
      ),
    };
  });

  const canvasShot = await page.locator("canvas").filter({ visible: true }).first().screenshot();
  const litPixels = countLitPixels(canvasShot);
  await page.screenshot({ path: `artifacts/${viewport.name}.png`, fullPage: false });
  await page.close();

  if (metrics.canvasWidth < 240 || metrics.canvasHeight < 240) {
    throw new Error(`${viewport.name}: canvas is too small ${JSON.stringify(metrics)}`);
  }

  if (litPixels < 80) {
    throw new Error(
      `${viewport.name}: canvas screenshot sample appears blank ${JSON.stringify({
        ...metrics,
        litPixels,
      })}`,
    );
  }

  if (metrics.scrollHeight > metrics.viewportHeight + 2) {
    throw new Error(`${viewport.name}: page-level vertical overflow ${JSON.stringify(metrics)}`);
  }

  if (viewport.width < 700 && metrics.minButtonHeight < 40) {
    throw new Error(`${viewport.name}: mobile touch target too small ${JSON.stringify(metrics)}`);
  }

  console.log(`${viewport.name}: ok`, { ...metrics, litPixels });
}

await browser.close();

function countLitPixels(buffer) {
  const png = parsePng(buffer);
  let lit = 0;
  const startX = Math.floor(png.width * 0.25);
  const endX = Math.floor(png.width * 0.75);
  const startY = Math.floor(png.height * 0.2);
  const endY = Math.floor(png.height * 0.8);

  for (let y = startY; y < endY; y += 4) {
    for (let x = startX; x < endX; x += 4) {
      const offset = (y * png.width + x) * 4;
      const sum = png.data[offset] + png.data[offset + 1] + png.data[offset + 2];
      if (sum > 34) {
        lit += 1;
      }
    }
  }

  return lit;
}

function parsePng(buffer) {
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("Screenshot is not a PNG");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    }

    if (type === "IDAT") {
      idat.push(data);
    }

    if (type === "IEND") {
      break;
    }

    offset += length + 12;
  }

  if (colorType !== 6 && colorType !== 2) {
    throw new Error(`Unsupported PNG color type ${colorType}`);
  }

  const inflated = inflateSync(Buffer.concat(idat));
  const sourceBytesPerPixel = colorType === 6 ? 4 : 3;
  const sourceStride = width * sourceBytesPerPixel;
  const output = Buffer.alloc(width * height * 4);
  const recon = Buffer.alloc(width * height * sourceBytesPerPixel);
  let inputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;
    const row = inflated.subarray(inputOffset, inputOffset + sourceStride);
    inputOffset += sourceStride;

    for (let x = 0; x < sourceStride; x += 1) {
      const left = x >= sourceBytesPerPixel ? recon[y * sourceStride + x - sourceBytesPerPixel] : 0;
      const up = y > 0 ? recon[(y - 1) * sourceStride + x] : 0;
      const upLeft =
        y > 0 && x >= sourceBytesPerPixel
          ? recon[(y - 1) * sourceStride + x - sourceBytesPerPixel]
          : 0;
      const raw = row[x];
      let value = raw;

      if (filter === 1) value = raw + left;
      if (filter === 2) value = raw + up;
      if (filter === 3) value = raw + Math.floor((left + up) / 2);
      if (filter === 4) value = raw + paeth(left, up, upLeft);

      recon[y * sourceStride + x] = value & 0xff;
    }

    for (let x = 0; x < width; x += 1) {
      const sourceOffset = y * sourceStride + x * sourceBytesPerPixel;
      const outputOffset = (y * width + x) * 4;
      output[outputOffset] = recon[sourceOffset];
      output[outputOffset + 1] = recon[sourceOffset + 1];
      output[outputOffset + 2] = recon[sourceOffset + 2];
      output[outputOffset + 3] = colorType === 6 ? recon[sourceOffset + 3] : 255;
    }
  }

  return { width, height, data: output };
}

function paeth(left, up, upLeft) {
  const p = left + up - upLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upLeft);

  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return upLeft;
}
