import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "glimglee/general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 data URI for Cloudinary uploader
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "image/jpeg";
    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

    if (!isCloudinaryConfigured) {
      // In development if user hasn't added Cloudinary API keys yet,
      // return a base64 data URI so their local development and testing
      // does not throw errors while configuring keys!
      console.warn(
        "Cloudinary is not configured. Serving local base64 preview."
      );
      return NextResponse.json({
        url: base64Data,
        publicId: `local_${Date.now()}`,
        name: file.name,
        size: file.size,
      });
    }

    const result = await uploadToCloudinary(base64Data, folder);

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      name: file.name,
      size: result.bytes,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Image upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { publicId } = await req.json();
    if (!publicId) {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }
    const success = await deleteFromCloudinary(publicId);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}
