import { apiFetch } from "@/lib/api";

export type ProductImageUploadResponse = {
  url: string;
  publicId: string;
};

export type TableImageUploadResponse = {
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

  async uploadTableImage(
    organizationId: string,
    file: File,
  ): Promise<TableImageUploadResponse> {
    const formData = new FormData();

    formData.append("file", file);

    return apiFetch<TableImageUploadResponse>(
      `/organizations/${organizationId}/uploads/table-image`,
      {
        method: "POST",
        body: formData,
      },
    );
  },
};
