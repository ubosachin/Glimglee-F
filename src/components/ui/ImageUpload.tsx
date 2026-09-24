"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { uploadFileToStorage } from "@/lib/storage/upload";
import { UploadCloud, X, Loader2, Image as ImageIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: any) => void;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  hint?: string;
  className?: string;
  aspectRatio?: "square" | "banner" | "video" | "auto";
}

export default function ImageUpload({
  value,
  onChange,
  folder = "glimglee/products",
  multiple = false,
  maxFiles = 5,
  label,
  hint,
  className = "",
  aspectRatio = "square",
}: ImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Normalize values into array
  const images: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : value
    ? [value]
    : [];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesToUpload = Array.from(files);
    if (!multiple && filesToUpload.length > 1) {
      filesToUpload.length = 1;
    }

    if (multiple && images.length + filesToUpload.length > maxFiles) {
      toast(`You can upload a maximum of ${maxFiles} images.`, "error");
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          toast(`"${file.name}" is not a valid image file.`, "error");
          continue;
        }

        // Upload to Cloudinary
        const res = await uploadFileToStorage(folder, file);
        uploadedUrls.push(res.url);
      }

      if (uploadedUrls.length > 0) {
        if (multiple) {
          onChange([...images, ...uploadedUrls]);
        } else {
          onChange(uploadedUrls[0]);
        }
        toast("Image uploaded to Cloudinary successfully!", "success");
      }
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      toast(err?.message || "Failed to upload image to Cloudinary.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (urlToRemove: string) => {
    if (multiple) {
      onChange(images.filter((url) => url !== urlToRemove));
    } else {
      onChange("");
    }
  };

  const emptyDropzoneClass =
    aspectRatio === "banner"
      ? "h-28 sm:h-32"
      : aspectRatio === "video"
      ? "aspect-video"
      : "h-36 sm:h-44";

  const aspectClass =
    aspectRatio === "banner"
      ? "aspect-[21/9] sm:aspect-[3/1]"
      : aspectRatio === "video"
      ? "aspect-video"
      : "aspect-square max-h-56";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-stone-700">{label}</label>
            <span className="text-[10px] text-stone-400 font-medium">Cloudinary CDN</span>
          </div>
          {hint && <p className="text-[10px] text-stone-500 mt-0.5">{hint}</p>}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Upload Zone / Gallery View */}
      {images.length === 0 ? (
        /* Empty State Upload Button */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`w-full ${emptyDropzoneClass} rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-4 sm:p-6 text-center group ${
            dragOver
              ? "border-rose-500 bg-rose-50/50"
              : "border-stone-200 hover:border-rose-400 bg-stone-50/60 hover:bg-stone-50"
          }`}
        >
          {uploading ? (
            <div className="space-y-2 flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              <p className="text-xs font-bold text-stone-700">Uploading to Cloudinary...</p>
              <p className="text-[10px] text-stone-400">Optimizing and storing CDN asset</p>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 text-stone-400 group-hover:text-rose-500 group-hover:border-rose-200 shadow-xs flex items-center justify-center transition-colors">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800 group-hover:text-rose-600 transition-colors">
                  Click to upload image or drag & drop
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  PNG, JPG, WEBP up to 10MB • Auto-optimized on Cloudinary
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Display Uploaded Image(s) */
        <div className="space-y-3">
          <div
            className={
              multiple
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                : "relative"
            }
          >
            {images.map((imgUrl, index) => (
              <div
                key={`${imgUrl}-${index}`}
                className={`relative group rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm bg-stone-100 ${
                  multiple ? "aspect-square" : aspectClass
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`Uploaded asset ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 400px"
                />

                {/* Hover / Active Controls Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Replace image"
                    className="p-2 rounded-xl bg-white/90 hover:bg-white text-stone-800 shadow-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(imgUrl)}
                    title="Remove image"
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Delete</span>
                  </button>
                </div>

                {/* Cloudinary CDN Indicator Badge */}
                <div className="absolute bottom-2 left-2 pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-semibold">
                    <ImageIcon className="w-2.5 h-2.5 text-rose-400" />
                    <span>Cloudinary</span>
                  </span>
                </div>
              </div>
            ))}

            {/* If multiple images allowed and limit not reached, show Add More card */}
            {multiple && images.length < maxFiles && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-stone-200 hover:border-rose-400 bg-stone-50/60 hover:bg-stone-50 transition-all cursor-pointer flex flex-col items-center justify-center p-3 text-center group"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-stone-400 group-hover:text-rose-500 mb-1 transition-colors" />
                    <span className="text-[11px] font-bold text-stone-700 group-hover:text-rose-600">
                      Add Image
                    </span>
                    <span className="text-[9px] text-stone-400">
                      ({images.length}/{maxFiles})
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Action: If single image and not multiple, provide a Replace button */}
          {!multiple && (
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-stone-600 hover:text-stone-900 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${uploading ? "animate-spin text-rose-500" : ""}`} />
                <span>{uploading ? "Uploading..." : "Upload different image"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRemove(images[0])}
                className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
