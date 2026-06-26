/**
 * components/admin/image-uploader.tsx — Premium Product Image Uploader Component
 *
 * Supports drag-and-drop file upload, reordering via HTML5 drag-and-drop,
 * setting a primary image, deleting, replacing, and showing upload progress.
 */
"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import { 
  UploadCloud, 
  Trash2, 
  Star, 
  RefreshCw, 
  FileImage, 
  Loader2, 
  GripVertical 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/types";

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  productId?: string;
  disabled?: boolean;
}

export function ImageUploader({ images = [], onChange, productId, disabled = false }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 1. Drag & Drop Files to upload handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  // 2. Upload Files Logic
  const processFiles = async (fileList: FileList) => {
    const files = Array.from(fileList);
    setError(null);

    // Validate count
    if (images.length + files.length > 10) {
      setError(`A product cannot have more than 10 images. Current: ${images.length}, Uploading: ${files.length}.`);
      return;
    }

    // Validate size & type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(`File "${file.name}" is not supported. Only JPG, JPEG, PNG, and WEBP are allowed.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 5MB size limit.`);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(10); // Start progress simulation

    // Simulate progress updates for a smoother visual experience
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      // Endpoint determines if we upload directly to a product or generic first
      const url = productId 
        ? `/api/v1/uploads/products/${productId}` 
        : `/api/v1/uploads/images`;

      // Fetch options including headers for CSRF protection
      const headers: Record<string, string> = {};
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("x-csrf-token="))
        ?.split("=")[1];

      if (csrfToken) {
        headers["x-csrf-token"] = csrfToken;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(result.message || "Failed to upload images.");
      }

      // Handle response based on API structure
      if (productId) {
        // Returned product object contains refreshed images
        const updatedImages = result.data.product.images;
        onChange(updatedImages);
      } else {
        // Returned generic images list
        const uploadedImages = result.data.images;
        const newCombined = [...images, ...uploadedImages];
        
        // Ensure at least one primary image exists
        const hasPrimary = newCombined.some((img) => img.isPrimary);
        if (!hasPrimary && newCombined.length > 0) {
          newCombined[0].isPrimary = true;
        }
        
        onChange(newCombined);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || "An error occurred during file upload.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(null);
      }, 500);
    }
  };

  // 3. Delete image logic
  const handleDelete = async (publicId: string) => {
    setError(null);
    try {
      if (productId) {
        // Delete directly on backend
        const headers: Record<string, string> = {};
        const csrfToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("x-csrf-token="))
          ?.split("=")[1];

        if (csrfToken) {
          headers["x-csrf-token"] = csrfToken;
        }

        const response = await fetch(`/api/v1/uploads/products/${productId}/images/${encodeURIComponent(publicId)}`, {
          method: "DELETE",
          headers,
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to delete image.");
        }
        onChange(result.data.product.images);
      } else {
        // Delete from local state
        const targetIndex = images.findIndex((img) => img.publicId === publicId);
        if (targetIndex === -1) return;

        const updatedImages = [...images];
        const wasPrimary = updatedImages[targetIndex].isPrimary;
        updatedImages.splice(targetIndex, 1);

        if (wasPrimary && updatedImages.length > 0) {
          updatedImages[0].isPrimary = true;
        }
        onChange(updatedImages);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the image.");
    }
  };

  // 4. Set primary image logic
  const handleSetPrimary = async (publicId: string) => {
    setError(null);
    try {
      if (productId) {
        // Update directly on backend
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        const csrfToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("x-csrf-token="))
          ?.split("=")[1];

        if (csrfToken) {
          headers["x-csrf-token"] = csrfToken;
        }

        const response = await fetch(`/api/v1/uploads/products/${productId}/primary`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ publicId }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to update primary image.");
        }
        onChange(result.data.product.images);
      } else {
        // Update locally
        const updatedImages = images.map((img) => ({
          ...img,
          isPrimary: img.publicId === publicId,
        }));
        onChange(updatedImages);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while setting primary image.");
    }
  };

  // 5. Replace image handler
  const triggerReplace = (publicId: string) => {
    setReplaceTargetId(publicId);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!replaceTargetId || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setError(null);

    // Validate file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds the 5MB size limit.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("images", file);

      // We upload the new file first generic
      const headers: Record<string, string> = {};
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("x-csrf-token="))
        ?.split("=")[1];

      if (csrfToken) {
        headers["x-csrf-token"] = csrfToken;
      }

      const response = await fetch(`/api/v1/uploads/images`, {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Replacement image upload failed.");
      }

      const newUploadedImage = result.data.images[0];
      const targetIdx = images.findIndex((img) => img.publicId === replaceTargetId);

      if (targetIdx !== -1) {
        // If we are replacement on backend, we should hit delete asset for replaceTargetId too
        // and update local state
        const updatedImages = [...images];
        const oldIsPrimary = updatedImages[targetIdx].isPrimary;
        
        updatedImages[targetIdx] = {
          ...newUploadedImage,
          isPrimary: oldIsPrimary, // preserve primary status
        };

        // If product ID exists, we submit the reordered / replaced list to sync with server
        if (productId) {
          await syncReorderedImages(updatedImages);
          // And evict old image from Cloudinary (clean up orphan)
          await deleteAssetOrphan(replaceTargetId);
        } else {
          onChange(updatedImages);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while replacing the image.");
    } finally {
      setUploading(false);
      setReplaceTargetId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  // Helper to delete an orphaned asset on backend directly (without affecting product doc schema if already updated)
  const deleteAssetOrphan = async (publicId: string) => {
    try {
      const headers: Record<string, string> = {};
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("x-csrf-token="))
        ?.split("=")[1];

      if (csrfToken) {
        headers["x-csrf-token"] = csrfToken;
      }
      
      // Just hit product image delete route which also pulls. Or since product was already updated, we just ignore any fails
      await fetch(`/api/v1/uploads/products/${productId}/images/${encodeURIComponent(publicId)}`, {
        method: "DELETE",
        headers,
      });
    } catch {
      // suppress orphan delete failures
    }
  };

  // Helper to sync reordered images to server
  const syncReorderedImages = async (reorderedList: ProductImage[]) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("x-csrf-token="))
      ?.split("=")[1];

    if (csrfToken) {
      headers["x-csrf-token"] = csrfToken;
    }

    const response = await fetch(`/api/v1/uploads/products/${productId}/reorder`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ images: reorderedList }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to sync reordered gallery with backend.");
    }
    onChange(result.data.product.images);
  };

  // 6. HTML5 Drag and Drop for Reordering Card Gallery
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDragDrop = async (e: DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reordered = [...images];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    // Adjust primary if it was implicitly changed (keep primary designation)
    setDraggedIndex(null);

    if (productId) {
      setUploading(true);
      try {
        await syncReorderedImages(reordered);
      } catch (err: any) {
        setError(err.message || "Failed to save new order.");
      } finally {
        setUploading(false);
      }
    } else {
      onChange(reordered);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center",
          isDragActive 
            ? "border-neutral-950 bg-neutral-50/50 dark:border-white dark:bg-neutral-800/30" 
            : "border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-900/50",
          (disabled || uploading) && "opacity-60 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          disabled={disabled || uploading}
          accept="image/jpeg,image/jpg,image/png,image/webp"
        />
        <input
          type="file"
          ref={replaceInputRef}
          onChange={handleReplaceFileChange}
          className="hidden"
          accept="image/jpeg,image/jpg,image/png,image/webp"
        />

        <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-3 mb-3">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-neutral-900 dark:text-white" />
          ) : (
            <UploadCloud className="h-6 w-6 text-neutral-500" />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-neutral-900 dark:text-white">
            {uploading ? "Uploading files to Cloudinary..." : "Drag and drop or click to upload"}
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
            JPG, JPEG, PNG, WEBP only (Max 10 files, 5MB each)
          </p>
        </div>

        {uploading && uploadProgress !== null && (
          <div className="w-full max-w-xs mt-4">
            <div className="flex justify-between text-[10px] font-semibold text-neutral-500 mb-1">
              <span>Progress</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-neutral-950 dark:bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Image Cards List (Sortable Gallery grid) */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Gallery Images ({images.length} / 10)
            </label>
            <span className="text-[10px] text-neutral-400">Drag items to change order</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, index) => {
              // Ensure we fallback properly if img is not an object or lacks thumbnailUrl
              const thumbUrl = typeof img === "string" ? img : img.thumbnail || img.secure_url || img.url;
              const isPrimary = typeof img === "string" ? index === 0 : img.isPrimary;
              const publicId = typeof img === "string" ? `legacy_${index}` : img.publicId;

              return (
                <div
                  key={publicId}
                  draggable={!disabled && !uploading}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDragDrop(e, index)}
                  className={cn(
                    "group relative aspect-[4/5] rounded-xl border overflow-hidden bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 transition-all select-none",
                    isPrimary && "border-neutral-950 ring-2 ring-neutral-900/10 dark:border-white dark:ring-white/20",
                    draggedIndex === index && "opacity-40 scale-95"
                  )}
                >
                  {/* Thumb image */}
                  <Image
                    src={thumbUrl}
                    alt="Gallery item preview"
                    fill
                    sizes="120px"
                    className="object-cover pointer-events-none"
                  />

                  {/* Drag Handle Overlay */}
                  <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-1 rounded-md bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xs shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-3.5 w-3.5 text-neutral-500" />
                  </div>

                  {/* Primary Badge */}
                  {isPrimary && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-xs">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      <span>Primary</span>
                    </div>
                  )}

                  {/* Action Overlays on hover */}
                  <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1.5">
                    {/* Make primary button if not primary */}
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(publicId)}
                        disabled={disabled || uploading}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-white/90 text-neutral-900 hover:bg-white text-[10px] font-semibold py-1.5 shadow-xs transition-colors"
                      >
                        <Star className="h-3 w-3" />
                        <span>Set Primary</span>
                      </button>
                    )}

                    <div className="flex gap-1.5">
                      {/* Replace button */}
                      <button
                        type="button"
                        onClick={() => triggerReplace(publicId)}
                        disabled={disabled || uploading}
                        title="Replace image"
                        className="flex-1 flex items-center justify-center rounded-lg bg-neutral-900/80 text-white hover:bg-neutral-900 text-[10px] font-semibold py-1.5 transition-colors border border-white/10"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(publicId)}
                        disabled={disabled || uploading}
                        title="Delete image"
                        className="flex-1 flex items-center justify-center rounded-lg bg-red-600/90 text-white hover:bg-red-600 text-[10px] font-semibold py-1.5 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
