"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type {
  CreateProductPayload,
  Product,
  ProductCategory,
} from "@/services/products.service";

import { uploadService } from "@/services/upload.service";

type Props = {
  organizationId: string;
  open: boolean;
  product?: Product | null;
  categories: ProductCategory[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductPayload) => Promise<void>;
};

export function ProductFormModal({
  organizationId,
  open,
  product,
  categories,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [price, setPrice] = useState(product?.price ?? "");
  const [cost, setCost] = useState(product?.cost ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    const parsedPrice = Number(price);
    const parsedCost = cost.trim() ? Number(cost) : undefined;

    if (!normalizedName) {
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return;
    }

    if (
      parsedCost !== undefined &&
      (!Number.isFinite(parsedCost) || parsedCost < 0)
    ) {
      return;
    }

    await onSubmit({
      name: normalizedName,
      description: description.trim() || undefined,
      sku: sku.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      price: parsedPrice,
      cost: parsedCost,
      categoryId: categoryId || undefined,
    });
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setIsUploadingImage(true);

      const result = await uploadService.uploadProductImage(
        organizationId,
        file,
      );

      setImageUrl(result.url);
    } catch (error) {
      console.error("Product image upload failed:", error);
      alert("Failed to upload product image.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2118]/35 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_25px_70px_rgba(43,33,24,0.18)] sm:max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#EEE6DD] px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#9A8C80]">
              Menu
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[#2B2118] sm:text-xl">
              {isEditing ? "Edit product" : "Add product"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading || isUploadingImage}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8E8176] transition hover:bg-[#F4ECE4] hover:text-[#6F4E37] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6"
        >
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="text-xs font-semibold text-[#5C5047]">
                Product name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Latte"
                className="mt-1.5 h-10.5 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none transition focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10"
              />
            </div>

            {/* Category + SKU */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-[#5C5047]">
                  Category
                </label>

                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="mt-1.5 h-10.5 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none transition focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10"
                >
                  <option value="">No category</option>

                  {categories
                    .filter((category) => category.isActive)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* SKU */}
              <div>
                <label className="text-xs font-semibold text-[#5C5047]">
                  SKU
                </label>

                <input
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  placeholder="LATTE-001"
                  className="mt-1.5 h-10.5 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none transition focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-[#5C5047]">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="Smooth espresso with steamed milk..."
                className="mt-1.5 w-full resize-none rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 py-2.5 text-sm text-[#2B2118] outline-none transition focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10"
              />
            </div>

            {/* Price + Cost */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-[#5C5047]">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="120.00"
                  className="mt-1.5 h-10.5 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none transition focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5C5047]">
                  Cost
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(event) => setCost(event.target.value)}
                  placeholder="55.00"
                  className="mt-1.5 h-10.5 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none transition focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10"
                />
              </div>
            </div>

            {/* Product Image */}
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-semibold text-[#5C5047]">
                  Product image
                </label>

                <p className="mt-0.5 text-[11px] text-[#8B7E74]">
                  JPG, PNG, or WEBP · Maximum 5MB
                </p>
              </div>

              {imageUrl ? (
                <div className="relative overflow-hidden rounded-2xl border border-[#E8DED3] bg-[#F7F3ED]">
                  <img
                    src={imageUrl}
                    alt={name || "Product preview"}
                    className="h-36 w-full object-cover sm:h-40"
                  />

                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    disabled={isUploadingImage}
                    className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#7A2E2E] shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8C9BB] bg-[#FCF9F5] transition hover:border-[#6F4E37] hover:bg-[#F7F3ED] sm:h-40">
                  <div className="mb-2 text-2xl">☕</div>

                  <span className="text-sm font-medium text-[#6F4E37]">
                    {isUploadingImage ? "Uploading..." : "Upload product image"}
                  </span>

                  {!isUploadingImage && (
                    <span className="mt-1 text-[11px] text-[#9A8B7D]">
                      Choose an image from your computer
                    </span>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-[#EEE6DD] pt-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || isUploadingImage}
              className="h-10 rounded-xl border border-[#DCCFC1] px-4 text-sm font-medium text-[#6F4E37] transition hover:bg-[#F7F1EB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !name.trim() || !price || isUploadingImage}
              className="h-10 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white transition hover:bg-[#5E402E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploadingImage
                ? "Uploading image..."
                : loading
                  ? "Saving..."
                  : product
                    ? "Save changes"
                    : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
