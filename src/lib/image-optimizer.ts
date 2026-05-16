import sharp from 'sharp';
import crypto from 'crypto';

export interface OptimizationResult {
  buffer: Buffer;
  hash: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

const MAX_DIMENSION = 1920;

/**
 * Optimizes an uploaded image buffer for web delivery.
 * - Generates a SHA-256 hash for deduplication.
 * - Resizes extremely large images to a maximum dimension of 1920px.
 * - Converts to WebP format.
 * - Applies smart subsampling and high compression effort to aggressively reduce file size 
 *   while preserving visual quality (Q80).
 * - Automatically strips EXIF/metadata for privacy and size.
 */
export async function optimizeImage(originalBuffer: Buffer): Promise<OptimizationResult> {
  // 1. Generate SHA-256 Hash of original file for duplicate detection
  const hash = crypto.createHash('sha256').update(originalBuffer).digest('hex');

  // 2. Initialize Sharp pipeline
  const image = sharp(originalBuffer);

  // 3. Process Image
  const processedBuffer = await image
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true, // Don't upscale images smaller than 1920px
    })
    .webp({ 
      quality: 80, 
      effort: 6, // Max compression effort (trade CPU time for smaller file size)
      smartSubsample: true // Better chroma subsampling for sharper text/edges
    })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: processedBuffer.data,
    hash,
    width: processedBuffer.info.width,
    height: processedBuffer.info.height,
    format: processedBuffer.info.format,
    size: processedBuffer.info.size,
  };
}
