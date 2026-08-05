/** Max profile image size (5MB). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** Returns an error message if the file is invalid, otherwise null. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return "Please choose a JPG or PNG image.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

/** Validate and read an image file as a data URL. */
export async function loadImageAsDataUrl(
  file: File,
): Promise<{ ok: true; dataUrl: string } | { ok: false; error: string }> {
  const error = validateImageFile(file);
  if (error) return { ok: false, error };
  try {
    const dataUrl = await readFileAsDataUrl(file);
    return { ok: true, dataUrl };
  } catch {
    return { ok: false, error: "Failed to read image." };
  }
}
