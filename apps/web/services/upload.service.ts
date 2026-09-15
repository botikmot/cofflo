import { apiFetch } from "@/lib/api";

export type ProductImageUploadResponse = {
  url: string;
  publicId: string;
};

export const uploadService = {
  async uploadProductImage(organizationId: string, file: File) {
    const formData = new FormData();

    formData.append("file", file);

    return apiFetch<ProductImageUploadResponse>(
      `/organizations/${organizationId}/uploads/product-image`,
      {
        method: "POST",
        body: formData,
      },
    );
  },
};
