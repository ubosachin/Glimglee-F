export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

/**
 * Upload any File or Blob to Cloudinary via /api/upload
 */
export async function uploadFileToStorage(
  folder: string,
  file: File | Blob
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }

  const data = await res.json();
  return {
    url: data.url,
    path: data.publicId || data.url,
    name: data.name || (file instanceof File ? file.name : "upload"),
    size: data.size || 0,
  };
}

/**
 * Upload a product image to Cloudinary
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<UploadResult> {
  return uploadFileToStorage(`glimglee/products/${productId}`, file);
}

/**
 * Upload customer personalized gift image (photo frame, engraved mug, greeting card note)
 */
export async function uploadCustomizationPhoto(
  file: File,
  customerIdentifier: string
): Promise<UploadResult> {
  return uploadFileToStorage(`glimglee/customizations/${customerIdentifier}`, file);
}

/**
 * Upload promotional banner image to Cloudinary
 */
export async function uploadBannerImage(file: File): Promise<UploadResult> {
  return uploadFileToStorage("glimglee/banners", file);
}

/**
 * Delete an asset from Cloudinary via /api/upload
 */
export async function deleteStorageAsset(storagePathOrUrl: string): Promise<boolean> {
  try {
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId: storagePathOrUrl }),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (error) {
    console.error("Failed to delete storage asset:", error);
    return false;
  }
}
