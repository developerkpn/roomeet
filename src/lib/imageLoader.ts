export default function customImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality: number;
}) {
  // For localhost images, return them as-is to avoid SSL issues
  if (src.includes("localhost")) {
    return src;
  }

  // For other images, use default Next.js optimization
  const params = new URLSearchParams();
  params.set("url", src);
  params.set("w", width.toString());
  params.set("q", (quality || 75).toString());

  return `/_next/image?${params.toString()}`;
}
