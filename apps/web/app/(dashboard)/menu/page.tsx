"use client";

import {
  Archive,
  Edit3,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { CategoryFormModal } from "@/components/menu/category-form-modal";
import { ProductFormModal } from "@/components/menu/product-form-modal";

import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useProducts } from "@/hooks/menu/use-products";
import { useProductCategories } from "@/hooks/menu/use-product-categories";

import {
  productService,
  type Product,
  type CreateProductPayload,
} from "@/services/products.service";
import {
  productCategoryService,
  type CreateProductCategoryPayload,
} from "@/services/product-categories.service";

import type { ProductCategory } from "@/services/products.service";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/hooks/settings/use-currency";

type ProductFilter = "ALL" | "ACTIVE" | "ARCHIVED";

type MenuTab = "PRODUCTS" | "CATEGORIES";

export default function MenuPage() {
  const queryClient = useQueryClient();

  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const organizationId = activeMembership?.organization?.id;

  const { formatCurrency } = useCurrency();

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
    isFetching: productsFetching,
  } = useProducts(organizationId);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
    isFetching: categoriesFetching,
  } = useProductCategories(organizationId);

  const [activeTab, setActiveTab] = useState<MenuTab>("PRODUCTS");

  const [productFilter, setProductFilter] = useState<ProductFilter>("ALL");

  const [search, setSearch] = useState("");

  const [productModalOpen, setProductModalOpen] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [editingCategory, setEditingCategory] =
    useState<ProductCategory | null>(null);

  const [archivingProduct, setArchivingProduct] = useState<Product | null>(
    null,
  );

  const [archivingCategory, setArchivingCategory] =
    useState<ProductCategory | null>(null);

  const [openProductMenuId, setOpenProductMenuId] = useState<string | null>(
    null,
  );

  const [openCategoryMenuId, setOpenCategoryMenuId] = useState<string | null>(
    null,
  );

  /*
   * PRODUCTS
   */
  const createProduct = useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      productService.createProduct(organizationId!, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", organizationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard", organizationId, activeMembership?.branch?.id],
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: CreateProductPayload;
    }) => productService.updateProduct(organizationId!, productId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", organizationId],
      });
    },
  });

  const archiveProduct = useMutation({
    mutationFn: (productId: string) =>
      productService.archiveProduct(organizationId!, productId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", organizationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard", organizationId, activeMembership?.branch?.id],
      });
    },
  });

  /*
   * CATEGORIES
   */
  const createCategory = useMutation({
    mutationFn: (payload: CreateProductCategoryPayload) =>
      productCategoryService.createCategory(organizationId!, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-categories", organizationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["products", organizationId],
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: CreateProductCategoryPayload;
    }) =>
      productCategoryService.updateCategory(
        organizationId!,
        categoryId,
        payload,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-categories", organizationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["products", organizationId],
      });
    },
  });

  const archiveCategory = useMutation({
    mutationFn: (categoryId: string) =>
      productCategoryService.archiveCategory(organizationId!, categoryId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-categories", organizationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["products", organizationId],
      });
    },
  });

  /*
   * COUNTS
   */
  const productCounts = useMemo(() => {
    return {
      all: products.length,

      active: products.filter((product) => product.status === "ACTIVE").length,

      archived: products.filter((product) => product.status === "ARCHIVED")
        .length,
    };
  }, [products]);

  const categoryCounts = useMemo(() => {
    return {
      all: categories.length,

      active: categories.filter((category) => category.isActive).length,

      archived: categories.filter((category) => !category.isActive).length,
    };
  }, [categories]);

  /*
   * FILTERED PRODUCTS
   */
  const visibleProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesStatus =
        productFilter === "ALL" || product.status === productFilter;

      const matchesSearch =
        !value ||
        product.name.toLowerCase().includes(value) ||
        product.sku?.toLowerCase().includes(value) ||
        product.category?.name.toLowerCase().includes(value);

      return matchesStatus && matchesSearch;
    });
  }, [products, productFilter, search]);

  /*
   * FILTERED CATEGORIES
   */
  const visibleCategories = useMemo(() => {
    const value = search.trim().toLowerCase();

    return categories.filter((category) => {
      if (!value) {
        return true;
      }

      return (
        category.name.toLowerCase().includes(value) ||
        category.description?.toLowerCase().includes(value)
      );
    });
  }, [categories, search]);

  async function handleProductSubmit(payload: CreateProductPayload) {
    if (editingProduct) {
      await updateProduct.mutateAsync({
        productId: editingProduct.id,
        payload,
      });

      setEditingProduct(null);
      return;
    }

    await createProduct.mutateAsync(payload);

    setProductModalOpen(false);
  }

  async function handleCategorySubmit(payload: CreateProductCategoryPayload) {
    if (editingCategory) {
      await updateCategory.mutateAsync({
        categoryId: editingCategory.id,
        payload,
      });

      setEditingCategory(null);
      return;
    }

    await createCategory.mutateAsync(payload);

    setCategoryModalOpen(false);
  }

  async function handleArchiveProduct() {
    if (!archivingProduct) {
      return;
    }

    try {
      await archiveProduct.mutateAsync(archivingProduct.id);

      setArchivingProduct(null);
    } catch {
      // React Query exposes the error.
    }
  }

  async function handleArchiveCategory() {
    if (!archivingCategory) {
      return;
    }

    try {
      await archiveCategory.mutateAsync(archivingCategory.id);

      setArchivingCategory(null);
    } catch {
      // React Query exposes the error.
    }
  }

  async function handleRefresh() {
    await Promise.all([refetchProducts(), refetchCategories()]);
  }

  const isLoading = workspaceLoading || productsLoading || categoriesLoading;

  const isFetching = productsFetching || categoriesFetching;

  const hasError = productsError || categoriesError;

  if (isLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (!organizationId || hasError) {
    return (
      <div className="pt-6">
        <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
          <p className="text-sm font-semibold text-[#6F4E37]">
            We couldn&apos;t load the menu.
          </p>

          <p className="mt-1 text-sm text-[#94877A]">
            Please refresh and try again.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pt-4 pb-10">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9A8C80]">
              Catalog
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2B2118]">
              Menu
            </h1>

            <p className="mt-1 text-sm text-[#85786C]">
              Manage products and categories for your café.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 text-sm font-medium text-[#6F4E37] hover:bg-[#FAF6F1] disabled:opacity-50"
            >
              <RefreshCw
                className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
              Refresh
            </button>

            {activeTab === "PRODUCTS" ? (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setProductModalOpen(true);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white hover:bg-[#5E402E]"
              >
                <Plus className="h-4 w-4" />
                Add product
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white hover:bg-[#5E402E]"
              >
                <Plus className="h-4 w-4" />
                Add category
              </button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="inline-flex rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("PRODUCTS")}
            className={`
              inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all
              ${
                activeTab === "PRODUCTS"
                  ? "bg-[#6F4E37] text-white shadow-sm"
                  : "text-[#75685D] hover:bg-[#F7F1EB]"
              }
            `}
          >
            <Package className="h-4 w-4" />
            Products
            <span className="text-[10px] opacity-70">{productCounts.all}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CATEGORIES")}
            className={`
              inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all
              ${
                activeTab === "CATEGORIES"
                  ? "bg-[#6F4E37] text-white shadow-sm"
                  : "text-[#75685D] hover:bg-[#F7F1EB]"
              }
            `}
          >
            <Tag className="h-4 w-4" />
            Categories
            <span className="text-[10px] opacity-70">{categoryCounts.all}</span>
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <section className="rounded-[26px] border border-[#E7DCCE] bg-[#FFFDF9] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A39589]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeTab === "PRODUCTS"
                    ? "Search products..."
                    : "Search categories..."
                }
                className="h-11 w-full rounded-xl border border-[#E3D8CD] bg-[#FAF6F1] pl-10 pr-3 text-sm text-[#2B2118] outline-none focus:border-[#B99A80]"
              />
            </div>

            {activeTab === "PRODUCTS" && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  {
                    key: "ALL" as const,
                    label: "All",
                    count: productCounts.all,
                  },
                  {
                    key: "ACTIVE" as const,
                    label: "Active",
                    count: productCounts.active,
                  },
                  {
                    key: "ARCHIVED" as const,
                    label: "Archived",
                    count: productCounts.archived,
                  },
                ].map((item) => {
                  const selected = productFilter === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setProductFilter(item.key)}
                      className={`
                        inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold
                        ${
                          selected
                            ? "bg-[#6F4E37] text-white"
                            : "bg-[#F4ECE4] text-[#75685D] hover:bg-[#EEE3D8]"
                        }
                      `}
                    >
                      {item.label}

                      <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px]">
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* PRODUCTS */}
        {activeTab === "PRODUCTS" && (
          <>
            {visibleProducts.length === 0 ? (
              <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-12 text-center">
                <Package className="mx-auto h-8 w-8 text-[#B5A699]" />

                <p className="mt-4 text-sm font-semibold text-[#5E5248]">
                  No products found
                </p>

                <p className="mt-1 text-sm text-[#94877A]">
                  Add your first menu item to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <article
                    key={product.id}
                    className={`
                        relative rounded-[26px] border bg-[#FFFDF9] p-5 transition-all duration-200
                        ${
                          product.status === "ARCHIVED"
                            ? "border-[#E5DED8] opacity-75"
                            : "border-[#E7DCCE] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(70,45,25,0.07)]"
                        }
                      `}
                  >
                    <div className="mb-4 overflow-hidden rounded-2xl bg-[#F4ECE4]">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center text-sm text-[#A39589]">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-[#2B2118]">
                          {product.name}
                        </h2>

                        <p className="mt-1 text-xs text-[#8F8277]">
                          {product.category?.name ?? "Uncategorized"}
                        </p>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenProductMenuId((current) =>
                              current === product.id ? null : product.id,
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#887B70] hover:bg-[#F4ECE4]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openProductMenuId === product.id && (
                          <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] p-1.5 shadow-[0_15px_40px_rgba(43,33,24,0.12)]">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(product);
                                setOpenProductMenuId(null);
                                setProductModalOpen(true);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#5C5047] hover:bg-[#F6EFE8]"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit product
                            </button>

                            {product.status === "ACTIVE" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setArchivingProduct(product);
                                  setOpenProductMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#9B604F] hover:bg-[#FBF0EB]"
                              >
                                <Archive className="h-3.5 w-3.5" />
                                Archive product
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {product.description && (
                      <p className="mt-4 line-clamp-2 text-xs leading-5 text-[#8D8075]">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#9A8C80]">Price</p>

                        <p className="mt-1 text-xl font-semibold text-[#2B2118]">
                          {formatCurrency(Number(product.price))}
                        </p>
                      </div>

                      <span
                        className={`
                            rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide
                            ${
                              product.status === "ACTIVE"
                                ? "bg-[#ECF3EC] text-[#607560]"
                                : "bg-[#F0ECE9] text-[#887B70]"
                            }
                          `}
                      >
                        {product.status}
                      </span>
                    </div>

                    {product.sku && (
                      <div className="mt-4 border-t border-[#EEE6DD] pt-3">
                        <p className="text-[11px] text-[#9A8C80]">
                          SKU{" "}
                          <span className="font-medium text-[#6C5D52]">
                            {product.sku}
                          </span>
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* CATEGORIES */}
        {activeTab === "CATEGORIES" && (
          <>
            {visibleCategories.length === 0 ? (
              <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-12 text-center">
                <Tag className="mx-auto h-8 w-8 text-[#B5A699]" />

                <p className="mt-4 text-sm font-semibold text-[#5E5248]">
                  No categories found
                </p>

                <p className="mt-1 text-sm text-[#94877A]">
                  Add categories to organize your menu.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCategories.map((category) => (
                  <article
                    key={category.id}
                    className={`
                        relative rounded-[26px] border bg-[#FFFDF9] p-5
                        ${
                          category.isActive
                            ? "border-[#E7DCCE]"
                            : "border-[#E5DED8] opacity-75"
                        }
                      `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4ECE4] text-[#6F4E37]">
                        <Tag className="h-4 w-4" />
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenCategoryMenuId((current) =>
                              current === category.id ? null : category.id,
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#887B70] hover:bg-[#F4ECE4]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openCategoryMenuId === category.id && (
                          <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] p-1.5 shadow-[0_15px_40px_rgba(43,33,24,0.12)]">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(category);
                                setOpenCategoryMenuId(null);
                                setCategoryModalOpen(true);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#5C5047] hover:bg-[#F6EFE8]"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit category
                            </button>

                            {category.isActive && (
                              <button
                                type="button"
                                onClick={() => {
                                  setArchivingCategory(category);
                                  setOpenCategoryMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#9B604F] hover:bg-[#FBF0EB]"
                              >
                                <Archive className="h-3.5 w-3.5" />
                                Archive category
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5">
                      <h2 className="text-lg font-semibold text-[#2B2118]">
                        {category.name}
                      </h2>

                      {category.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#8D8075]">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#EEE6DD] pt-4">
                      <div>
                        <p className="text-xs text-[#9A8C80]">Products</p>

                        <p className="mt-1 text-sm font-semibold text-[#4A3C31]">
                          {category._count?.products ?? 0}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-[#9A8C80]">Sort order</p>

                        <p className="mt-1 text-sm font-semibold text-[#4A3C31]">
                          {category.sortOrder}
                        </p>
                      </div>

                      <span
                        className={`
                            rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide
                            ${
                              category.isActive
                                ? "bg-[#ECF3EC] text-[#607560]"
                                : "bg-[#F0ECE9] text-[#887B70]"
                            }
                          `}
                      >
                        {category.isActive ? "Active" : "Archived"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* PRODUCT MODAL */}
      <ProductFormModal
        key={
          editingProduct?.id ?? (productModalOpen ? "create-product" : "closed")
        }
        organizationId={organizationId}
        open={productModalOpen}
        product={editingProduct}
        categories={categories}
        loading={createProduct.isPending || updateProduct.isPending}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleProductSubmit}
      />

      {/* CATEGORY MODAL */}
      <CategoryFormModal
        key={
          editingCategory?.id ??
          (categoryModalOpen ? "create-category" : "category-closed")
        }
        open={categoryModalOpen}
        category={editingCategory}
        loading={createCategory.isPending || updateCategory.isPending}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleCategorySubmit}
      />

      {/* ARCHIVE PRODUCT */}
      {archivingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2118]/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-6 shadow-[0_25px_70px_rgba(43,33,24,0.18)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8EEE9] text-[#9B604F]">
              <Archive className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[#2B2118]">
              Archive {archivingProduct.name}?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#85786C]">
              This product will no longer be available for new orders. Existing
              historical order records will remain intact.
            </p>

            {archiveProduct.isError && (
              <div className="mt-4 rounded-xl bg-[#8B4A3C] px-3 py-2.5 text-xs text-[#FFE8E1]">
                {archiveProduct.error instanceof Error
                  ? archiveProduct.error.message
                  : "Unable to archive this product."}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setArchivingProduct(null)}
                className="h-10 rounded-xl border border-[#DCCFC1] px-4 text-sm font-medium text-[#6F4E37] hover:bg-[#F7F1EB]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleArchiveProduct}
                disabled={archiveProduct.isPending}
                className="h-10 rounded-xl bg-[#9B604F] px-4 text-sm font-semibold text-white hover:bg-[#875141] disabled:opacity-50"
              >
                {archiveProduct.isPending ? "Archiving..." : "Archive product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ARCHIVE CATEGORY */}
      {archivingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2118]/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-6 shadow-[0_25px_70px_rgba(43,33,24,0.18)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8EEE9] text-[#9B604F]">
              <Archive className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[#2B2118]">
              Archive {archivingCategory.name}?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#85786C]">
              This category will no longer be active. Historical products and
              orders will remain intact.
            </p>

            {archiveCategory.isError && (
              <div className="mt-4 rounded-xl bg-[#8B4A3C] px-3 py-2.5 text-xs text-[#FFE8E1]">
                {archiveCategory.error instanceof Error
                  ? archiveCategory.error.message
                  : "Unable to archive this category."}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setArchivingCategory(null)}
                className="h-10 rounded-xl border border-[#DCCFC1] px-4 text-sm font-medium text-[#6F4E37] hover:bg-[#F7F1EB]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleArchiveCategory}
                disabled={archiveCategory.isPending}
                className="h-10 rounded-xl bg-[#9B604F] px-4 text-sm font-semibold text-white hover:bg-[#875141] disabled:opacity-50"
              >
                {archiveCategory.isPending
                  ? "Archiving..."
                  : "Archive category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
