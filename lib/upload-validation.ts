/**
 * Verify file contents match a supported image type (not only MIME/extension).
 * Used by POST /api/upload after MIME/size checks.
 */
export async function validateImageMagicBytes(file: File): Promise<boolean> {
  const slice = file.slice(0, 16)
  const buf = new Uint8Array(await slice.arrayBuffer())
  if (buf.length < 3) return false

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return true
  }

  // WebP: RIFF....WEBP at offset 8
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return true
  }

  return false
}
