import { getBrowserCanvasMaxSize } from "./getBrowserCanvasMaxSize";
import { PngHelpers } from "./png";

type TLCopyType = "jpeg" | "json" | "png" | "svg";
type TLExportType = "jpeg" | "json" | "png" | "svg" | "webp";

/**
 * This is all copied from node_modules/@tldraw/tldraw/src/lib/utils/export.ts
 */
export async function getSvgAsImage(
  svg: SVGElement,
  options: {
    type: TLCopyType | TLExportType;
    quality: number;
    scale: number;
  }
) {
  const { type, quality, scale } = options;

  const width = +svg.getAttribute("width")!;
  const height = +svg.getAttribute("height")!;
  let scaledWidth = width * scale;
  let scaledHeight = height * scale;

  const dataUrl = await getSvgAsDataUrl(svg);

  const canvasSizes = await getBrowserCanvasMaxSize();
  if (width > canvasSizes.maxWidth) {
    scaledWidth = canvasSizes.maxWidth;
    scaledHeight = (scaledWidth / width) * height;
  }
  if (height > canvasSizes.maxHeight) {
    scaledHeight = canvasSizes.maxHeight;
    scaledWidth = (scaledHeight / height) * width;
  }
  if (scaledWidth * scaledHeight > canvasSizes.maxArea) {
    const ratio = Math.sqrt(canvasSizes.maxArea / (scaledWidth * scaledHeight));
    scaledWidth *= ratio;
    scaledHeight *= ratio;
  }

  scaledWidth = Math.floor(scaledWidth);
  scaledHeight = Math.floor(scaledHeight);
  const effectiveScale = scaledWidth / width;

  const canvas = await new Promise<HTMLCanvasElement | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = async () => {
      // safari will fire `onLoad` before the fonts in the SVG are
      // actually loaded. just waiting around a while is brittle, but
      // there doesn't seem to be any better solution for now :( see
      // https://bugs.webkit.org/show_bug.cgi?id=219770
      await new Promise((resolve) => setTimeout(resolve, 250));

      const canvas = document.createElement("canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;

      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

      URL.revokeObjectURL(dataUrl);

      resolve(canvas);
    };

    image.onerror = () => {
      resolve(null);
    };

    image.src = dataUrl;
  });

  if (!canvas) return null;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
        }
        resolve(blob);
      },
      "image/" + type,
      quality
    )
  );

  if (!blob) return null;

  const view = new DataView(await blob.arrayBuffer());
  return PngHelpers.setPhysChunk(view, effectiveScale, {
    type: "image/" + type,
  });
}

export async function getSvgAsDataUrl(svg: SVGElement) {
  const clone = svg.cloneNode(true) as SVGGraphicsElement;
  clone.setAttribute("encoding", 'UTF-8"');

  const fileReader = new FileReader();
  const imgs = Array.from(clone.querySelectorAll("image")) as SVGImageElement[];

  for (const img of imgs) {
    const src = img.getAttribute("xlink:href");
    if (src) {
      if (!src.startsWith("data:")) {
        const blob = await (await fetch(src)).blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          fileReader.onload = () => resolve(fileReader.result as string);
          fileReader.onerror = () => reject(fileReader.error);
          fileReader.readAsDataURL(blob);
        });
        img.setAttribute("xlink:href", base64);
      }
    }
  }

  return getSvgAsDataUrlSync(clone);
}

export function getSvgAsDataUrlSync(node: SVGElement) {
  const svgStr = new XMLSerializer().serializeToString(node);
  // NOTE: `unescape` works everywhere although deprecated
  const base64SVG = window.btoa(unescape(encodeURIComponent(svgStr)));
  return `data:image/svg+xml;base64,${base64SVG}`;
}
