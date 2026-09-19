"use client";

import { useState, type ReactNode } from "react";
import {
  Building2,
  Camera,
  ImageIcon,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  Mail,
  MapPin,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { apiFetch } from "@/lib/api";

import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useOrganizationSettings } from "@/hooks/settings/use-organization-settings";
import { useBranches } from "@/hooks/branches/use-branches";

import { createBranch, removeBranch } from "@/services/branches.service";

import type { BranchSettings, OrganizationSettings } from "@/types/settings";
import { uploadService } from "@/services/upload.service";

export default function SettingsPage() {
  const {
    user,
    activeMembership,
    isLoading: workspaceLoading,
  } = useWorkspace();

  const organizationId = activeMembership?.organizationId;

  const branchId = activeMembership?.branchId ?? undefined;

  const {
    data: organization,
    isLoading: organizationLoading,
    refetch: refetchOrganization,
  } = useOrganizationSettings(organizationId);

  const {
    data: branches = [],
    isLoading: branchesLoading,
    refetch: refetchBranches,
  } = useBranches(organizationId);

  if (workspaceLoading || organizationLoading || branchesLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (!user || !organization || !organizationId) {
    return (
      <div className="pt-6">
        <div className="rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
          <Settings2 className="mx-auto h-7 w-7 text-[#B7A99B]" />

          <p className="mt-3 text-sm font-semibold text-[#5E5248]">
            Settings unavailable
          </p>

          <p className="mt-1 text-sm text-[#94877A]">
            We could not load the current workspace settings.
          </p>
        </div>
      </div>
    );
  }

  const activeBranch =
    branches.find((branch) => branch.id === branchId) ?? null;

  return (
    <SettingsWorkspace
      key={`${organization.id}-${organization.updatedAt ?? ""}-${branches.map((item) => `${item.id}:${item.updatedAt ?? ""}`).join("|")}`}
      organization={organization}
      branches={branches}
      activeBranch={activeBranch}
      organizationId={organizationId}
      canManageOrganization={
        activeMembership?.role === "OWNER" || activeMembership?.role === "ADMIN"
      }
      canManageBranch={
        activeMembership?.role === "OWNER" ||
        activeMembership?.role === "ADMIN" ||
        activeMembership?.role === "MANAGER"
      }
      role={activeMembership?.role ?? ""}
      refetchOrganization={refetchOrganization}
      refetchBranches={refetchBranches}
    />
  );
}

type SettingsWorkspaceProps = {
  organization: OrganizationSettings;
  branches: BranchSettings[];
  activeBranch: BranchSettings | null;

  organizationId: string;

  canManageOrganization: boolean;
  canManageBranch: boolean;

  role: string;

  refetchOrganization: () => Promise<unknown>;
  refetchBranches: () => Promise<unknown>;
};

function SettingsWorkspace({
  organization,
  branches,
  activeBranch,
  organizationId,
  canManageOrganization,
  canManageBranch,
  role,
  refetchOrganization,
  refetchBranches,
}: SettingsWorkspaceProps) {
  const [organizationForm, setOrganizationForm] =
    useState<OrganizationSettings>(organization);

  const [editingBranch, setEditingBranch] = useState<BranchSettings | null>(
    null,
  );

  const [showCreateBranch, setShowCreateBranch] = useState(false);

  const [removingBranch, setRemovingBranch] = useState<BranchSettings | null>(
    null,
  );

  const [creatingBranch, setCreatingBranch] = useState(false);

  const [savingBranch, setSavingBranch] = useState(false);

  const [savingOrganization, setSavingOrganization] = useState(false);

  const [deletingBranch, setDeletingBranch] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [newBranch, setNewBranch] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    timezone: "Asia/Manila",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState(false);

  function showSuccess(message: string) {
    setErrorMessage("");
    setSuccessMessage(message);
  }

  function showError(message: string) {
    setSuccessMessage("");
    setErrorMessage(message);
  }

  function normalizeWebsite(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }

  async function saveOrganization() {
    setSavingOrganization(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const updated = await apiFetch<OrganizationSettings>(
        `/settings/organizations/${organizationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: organizationForm.name.trim(),
            slug: organizationForm.slug.trim().toLowerCase(),
            tagline: organizationForm.tagline?.trim() || null,
            description: organizationForm.description?.trim() || null,
            currency: organizationForm.currency.trim().toUpperCase(),
            primaryColor: organizationForm.primaryColor,
            secondaryColor: organizationForm.secondaryColor,
            email: organizationForm.email?.trim().toLowerCase() || null,
            phone: organizationForm.phone?.trim() || null,
            address: organizationForm.address?.trim() || null,
            website: normalizeWebsite(organizationForm.website ?? ""),
          }),
        },
      );

      setOrganizationForm(updated);

      await refetchOrganization();

      showSuccess("Organization settings updated successfully.");
    } catch (error) {
      console.error("UPDATE ORGANIZATION SETTINGS FAILED:", error);

      showError(
        error instanceof Error
          ? error.message
          : "Unable to update organization settings.",
      );
    } finally {
      setSavingOrganization(false);
    }
  }

  async function saveBranch() {
    if (!editingBranch) {
      return;
    }

    setSavingBranch(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const updated = await apiFetch<BranchSettings>(
        `/settings/organizations/${organizationId}/branches/${editingBranch.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingBranch.name.trim(),
            slug: editingBranch.slug.trim().toLowerCase(),
            description: editingBranch.description?.trim() || null,
            phone: editingBranch.phone?.trim() || null,
            email: editingBranch.email?.trim().toLowerCase() || null,
            address: editingBranch.address?.trim() || null,
            timezone: editingBranch.timezone?.trim() || "Asia/Manila",
          }),
        },
      );

      setEditingBranch(null);

      await refetchBranches();

      showSuccess(`${updated.name} branch settings updated successfully.`);
    } catch (error) {
      console.error("UPDATE BRANCH SETTINGS FAILED:", error);

      showError(
        error instanceof Error
          ? error.message
          : "Unable to update branch settings.",
      );
    } finally {
      setSavingBranch(false);
    }
  }

  async function handleCreateBranch() {
    if (!newBranch.name.trim()) {
      showError("Branch name is required.");
      return;
    }

    setCreatingBranch(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await createBranch(organizationId, {
        name: newBranch.name.trim(),
        description: newBranch.description.trim() || null,
        phone: newBranch.phone.trim() || null,
        email: newBranch.email.trim() || null,
        address: newBranch.address.trim() || null,
        timezone: newBranch.timezone.trim() || "Asia/Manila",
      });

      await refetchBranches();

      setNewBranch({
        name: "",
        description: "",
        phone: "",
        email: "",
        address: "",
        timezone: "Asia/Manila",
      });

      setShowCreateBranch(false);

      showSuccess("Branch created successfully.");
    } catch (error) {
      console.error("CREATE BRANCH FAILED:", error);

      showError(
        error instanceof Error ? error.message : "Unable to create branch.",
      );
    } finally {
      setCreatingBranch(false);
    }
  }

  async function handleRemoveBranch() {
    if (!removingBranch) {
      return;
    }

    setDeletingBranch(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await removeBranch(organizationId, removingBranch.id);

      await refetchBranches();

      setRemovingBranch(null);

      showSuccess("Branch removed successfully.");
    } catch (error) {
      console.error("REMOVE BRANCH FAILED:", error);

      showError(
        error instanceof Error ? error.message : "Unable to remove branch.",
      );

      setRemovingBranch(null);
    } finally {
      setDeletingBranch(false);
    }
  }

  async function changePassword() {
    setSuccessMessage("");
    setErrorMessage("");

    if (!currentPassword) {
      showError("Current password is required.");
      return;
    }

    if (newPassword.length < 8) {
      showError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      await apiFetch("/auth/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showSuccess("Password changed successfully.");
    } catch (error) {
      console.error("CHANGE PASSWORD FAILED:", error);

      showError(
        error instanceof Error ? error.message : "Unable to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setLogoUploadError(null);
    setLogoUploadSuccess(false);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setLogoUploadError("Please upload a JPG, PNG, or WebP image.");

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setLogoUploadError("Logo must not exceed 5 MB.");

      event.target.value = "";
      return;
    }

    if (!organizationId) {
      setLogoUploadError("Organization could not be identified.");

      event.target.value = "";
      return;
    }

    try {
      setIsUploadingLogo(true);

      const result = await uploadService.uploadOrganizationLogo(
        organizationId,
        file,
      );

      setOrganizationForm((current) => ({
        ...current,
        logoUrl: result.url,
      }));

      setLogoUploadSuccess(true);
    } catch (error) {
      console.error("Failed to upload organization logo:", error);

      setLogoUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload organization logo.",
      );
    } finally {
      setIsUploadingLogo(false);

      event.target.value = "";
    }
  }

  console.log("organization::", organization);

  return (
    <>
      <div className="space-y-5 pt-3 pb-8">
        {/* HEADER */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A8C80]">
              Workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2B2118] sm:text-3xl">
              Account Settings
            </h1>

            <p className="mt-1 text-xs text-[#85786C] sm:text-sm">
              Manage your workspace, branches, and account security.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <MiniBadge
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              text={formatRole(role)}
            />

            <MiniBadge
              icon={<Globe2 className="h-3.5 w-3.5" />}
              text={organizationForm.currency}
            />

            <MiniBadge
              icon={<Building2 className="h-3.5 w-3.5" />}
              text={`${branches.length} ${
                branches.length === 1 ? "branch" : "branches"
              }`}
            />
          </div>
        </div>

        {/* FEEDBACK */}
        {(successMessage || errorMessage) && (
          <div
            className={[
              "rounded-2xl border px-4 py-2.5 text-xs",
              successMessage
                ? "border-[#CFE0D1] bg-[#F0F7F1] text-[#41674A]"
                : "border-[#E8CFC8] bg-[#FFF3F0] text-[#8A4B3E]",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              {successMessage ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <X className="h-4 w-4 shrink-0" />
              )}

              <span>{successMessage || errorMessage}</span>
            </div>
          </div>
        )}

        {/* TOP GRID */}
        <div className="grid gap-5 xl:grid-cols-12">
          {/* ORGANIZATION */}
          <section className="xl:col-span-8 rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(70,45,25,0.04)]">
            <div className="border-b border-[#EEE4DC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
                      <Building2 className="h-4 w-4" />
                    </div>

                    <h2 className="text-sm font-semibold text-[#2B2118]">
                      Organization
                    </h2>
                  </div>

                  <p className="mt-1 text-[11px] text-[#8E8074]">
                    Core business and contact details.
                  </p>
                </div>

                {!canManageOrganization && (
                  <span className="hidden rounded-full bg-[#F0E8E2] px-2.5 py-1 text-[10px] font-semibold text-[#7A6D63] sm:inline-flex">
                    View only
                  </span>
                )}
              </div>
            </div>

            <div className="border-b border-[#E7DCCE] px-5 py-5 sm:px-6">
              <div>
                <h3 className="text-sm font-semibold text-[#3E342D]">
                  Organization Logo
                </h3>

                <p className="mt-1 text-xs text-[#8A796B]">
                  Upload your business logo. This will be used throughout
                  Cofflo.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-5">
                {/* Logo preview */}
                <div className="relative shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[#E7DCCE] bg-[#F7F1EA]">
                    {organizationForm.logoUrl ? (
                      <img
                        src={organizationForm.logoUrl}
                        alt={`${organizationForm.name} logo`}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-[#B99D84]" />
                    )}
                  </div>

                  {isUploadingLogo && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>

                {/* Upload details */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#3E342D]">
                    {organizationForm.logoUrl
                      ? "Your organization logo"
                      : "Add your organization logo"}
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#9A8A7C]">
                    Use a square or centered image for the best result. JPG, PNG
                    or WebP · Maximum 5 MB.
                  </p>
                </div>

                {/* Upload button */}
                <div className="shrink-0">
                  <label
                    htmlFor="organization-logo"
                    className={[
                      "inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl",
                      "border border-[#DDD0C5]",
                      "bg-[#FFFCF8]",
                      "px-3 text-xs font-medium text-[#5F5044]",
                      "transition hover:border-[#B99D84] hover:bg-[#F8F1EA]",
                      isUploadingLogo ? "pointer-events-none opacity-50" : "",
                    ].join(" ")}
                  >
                    <Camera className="h-3.5 w-3.5" />

                    {isUploadingLogo
                      ? "Uploading..."
                      : organizationForm.logoUrl
                        ? "Change Logo"
                        : "Upload Logo"}

                    <input
                      id="organization-logo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                    />
                  </label>

                  {logoUploadError && (
                    <p className="mt-2 max-w-[180px] text-right text-xs font-medium text-red-600">
                      {logoUploadError}
                    </p>
                  )}

                  {logoUploadSuccess && !logoUploadError && (
                    <p className="mt-2 flex items-center justify-end gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Updated
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <CompactInput
                  label="Name"
                  value={organizationForm.name}
                  onChange={(value) =>
                    setOrganizationForm({
                      ...organizationForm,
                      name: value,
                    })
                  }
                  disabled={!canManageOrganization}
                />

                <CompactInput
                  label="Slug"
                  value={organizationForm.slug}
                  onChange={(value) =>
                    setOrganizationForm({
                      ...organizationForm,
                      slug: value,
                    })
                  }
                  disabled={!canManageOrganization}
                />

                <CompactInput
                  label="Currency"
                  value={organizationForm.currency}
                  onChange={(value) =>
                    setOrganizationForm({
                      ...organizationForm,
                      currency: value.toUpperCase().slice(0, 10),
                    })
                  }
                  disabled={!canManageOrganization}
                />

                <CompactInput
                  label="Tagline"
                  value={organizationForm.tagline ?? ""}
                  onChange={(value) =>
                    setOrganizationForm({
                      ...organizationForm,
                      tagline: value || null,
                    })
                  }
                  disabled={!canManageOrganization}
                />

                <CompactInput
                  icon={<Globe2 className="h-3.5 w-3.5" />}
                  label="Website"
                  value={organizationForm.website ?? ""}
                  onChange={(value) =>
                    setOrganizationForm({
                      ...organizationForm,
                      website: value || null,
                    })
                  }
                  disabled={!canManageOrganization}
                  placeholder="example.com"
                />

                <CompactInput
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="Email"
                  type="email"
                  value={organizationForm.email ?? ""}
                  onChange={(value) =>
                    setOrganizationForm({
                      ...organizationForm,
                      email: value || null,
                    })
                  }
                  disabled={!canManageOrganization}
                />

                <CompactInput
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="Phone"
                  value={organizationForm.phone ?? ""}
                  onChange={(value) =>
                    setOrganizationForm({
                      ...organizationForm,
                      phone: value || null,
                    })
                  }
                  disabled={!canManageOrganization}
                />

                <div className="md:col-span-2">
                  <CompactTextarea
                    label="Address"
                    value={organizationForm.address ?? ""}
                    onChange={(value) =>
                      setOrganizationForm({
                        ...organizationForm,
                        address: value || null,
                      })
                    }
                    disabled={!canManageOrganization}
                    rows={2}
                  />
                </div>

                <div className="md:col-span-3">
                  <CompactTextarea
                    label="Description"
                    value={organizationForm.description ?? ""}
                    onChange={(value) =>
                      setOrganizationForm({
                        ...organizationForm,
                        description: value || null,
                      })
                    }
                    disabled={!canManageOrganization}
                    rows={2}
                  />
                </div>
              </div>

              {canManageOrganization ? (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={saveOrganization}
                    disabled={savingOrganization}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#6F4E37] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5F402E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />

                    {savingOrganization ? "Saving..." : "Save organization"}
                  </button>
                </div>
              ) : (
                <PermissionNote>
                  Only owners and admins can update organization settings.
                </PermissionNote>
              )}
            </div>
          </section>

          {/* WORKSPACE OVERVIEW */}
          <section className="xl:col-span-4 rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(70,45,25,0.04)]">
            <div className="border-b border-[#EEE4DC] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
                  <Settings2 className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#2B2118]">
                    Workspace overview
                  </h2>

                  <p className="text-[11px] text-[#8E8074]">
                    Current operational context.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-2xl bg-[#F7F0E9] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#907F70]">
                  Current branch
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#6F4E37]" />

                  <p className="text-sm font-semibold text-[#3E342D]">
                    {activeBranch?.name ?? "Organization-wide"}
                  </p>
                </div>

                {activeBranch?.timezone && (
                  <p className="mt-1 text-[11px] text-[#918174]">
                    {activeBranch.timezone}
                  </p>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <SummaryTile label="Branches" value={String(branches.length)} />

                <SummaryTile
                  label="Currency"
                  value={organizationForm.currency}
                />

                <SummaryTile label="Role" value={formatRole(role)} />

                <SummaryTile
                  label="Status"
                  value={
                    organizationForm.status === "ACTIVE"
                      ? "Active"
                      : organizationForm.status
                  }
                />
              </div>

              <div className="mt-4 rounded-2xl border border-[#E8DDD3] bg-[#FFFCF8] p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#918174]">
                      Signed in as
                    </p>

                    <p className="mt-0.5 truncate text-xs font-semibold text-[#3E342D]">
                      {userNameFromWorkspace()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* LOWER GRID */}
        <div className="grid gap-5 xl:grid-cols-12">
          {/* BRANCHES */}
          <section className="xl:col-span-7 rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(70,45,25,0.04)]">
            <div className="border-b border-[#EEE4DC] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
                      <Building2 className="h-4 w-4" />
                    </div>

                    <h2 className="text-sm font-semibold text-[#2B2118]">
                      Branches
                    </h2>
                  </div>

                  <p className="mt-1 text-[11px] text-[#8E8074]">
                    Branches available to this organization.
                  </p>
                </div>

                {canManageOrganization && (
                  <button
                    type="button"
                    onClick={() => setShowCreateBranch(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6F4E37] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#5F402E]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add branch
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {branches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#DED3C9] p-7 text-center">
                  <Building2 className="mx-auto h-6 w-6 text-[#B7A99B]" />

                  <p className="mt-2 text-xs font-semibold text-[#675A50]">
                    No branches found
                  </p>

                  {canManageOrganization && (
                    <button
                      type="button"
                      onClick={() => setShowCreateBranch(true)}
                      className="mt-3 text-xs font-semibold text-[#6F4E37] hover:underline"
                    >
                      Create your first branch
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {branches.map((item) => {
                    const isCurrent = item.id === activeBranch?.id;

                    return (
                      <div
                        key={item.id}
                        className={[
                          "rounded-2xl border px-4 py-3 transition",
                          isCurrent
                            ? "border-[#CDBAA9] bg-[#F8F1EA]"
                            : "border-[#E8DDD3] bg-[#FFFCF8]",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
                              <Building2 className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="truncate text-xs font-semibold text-[#2B2118]">
                                  {item.name}
                                </p>

                                {isCurrent && (
                                  <span className="rounded-full bg-[#E4F0E6] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#41674A]">
                                    Current
                                  </span>
                                )}

                                <span
                                  className={[
                                    "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                                    item.isActive
                                      ? "bg-[#E4F0E6] text-[#41674A]"
                                      : "bg-[#EEE8E3] text-[#74675D]",
                                  ].join(" ")}
                                >
                                  {item.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>

                              <p className="mt-0.5 truncate text-[10px] text-[#8E8074]">
                                {item.slug}
                                {item.timezone ? ` · ${item.timezone}` : ""}
                              </p>
                            </div>
                          </div>

                          {canManageOrganization && (
                            <div className="flex shrink-0 items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingBranch(item)}
                                className="rounded-lg border border-[#DDD0C5] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#6E6258] transition hover:bg-[#F6F0EA]"
                              >
                                Edit
                              </button>

                              {!isCurrent && branches.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setRemovingBranch(item)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5D1CA] bg-[#FFF8F5] text-[#8A4B3E] transition hover:bg-[#FFF0EB]"
                                  aria-label={`Remove ${item.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!canManageOrganization && (
                <PermissionNote>
                  Only owners and admins can add, edit, or remove branches.
                </PermissionNote>
              )}
            </div>
          </section>

          {/* SECURITY */}
          <section className="xl:col-span-5 rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(70,45,25,0.04)]">
            <div className="border-b border-[#EEE4DC] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
                  <LockKeyhole className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#2B2118]">
                    Security
                  </h2>

                  <p className="text-[11px] text-[#8E8074]">
                    Update your account password.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-3">
                <CompactPassword
                  label="Current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                />

                <CompactPassword
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                />

                <CompactPassword
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
              </div>

              <div className="mt-3 rounded-xl bg-[#FAF6F1] px-3.5 py-3">
                <p className="text-[10px] leading-4 text-[#8E8074]">
                  New password must contain at least 8 characters.
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={changePassword}
                  disabled={changingPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6F4E37] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#5F402E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LockKeyhole className="h-3.5 w-3.5" />

                  {changingPassword ? "Changing..." : "Change password"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* CREATE BRANCH MODAL */}
      {showCreateBranch && (
        <CreateBranchModal
          form={newBranch}
          setForm={setNewBranch}
          loading={creatingBranch}
          onClose={() => !creatingBranch && setShowCreateBranch(false)}
          onCreate={handleCreateBranch}
        />
      )}

      {/* EDIT BRANCH MODAL */}
      {editingBranch && (
        <EditBranchModal
          branch={editingBranch}
          setBranch={setEditingBranch}
          loading={savingBranch}
          onClose={() => !savingBranch && setEditingBranch(null)}
          onSave={saveBranch}
        />
      )}

      {/* REMOVE BRANCH MODAL */}
      {removingBranch && (
        <RemoveBranchModal
          branch={removingBranch}
          loading={deletingBranch}
          onClose={() => !deletingBranch && setRemovingBranch(null)}
          onRemove={handleRemoveBranch}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatRole(role: string) {
  switch (role) {
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Admin";
    case "MANAGER":
      return "Manager";
    case "STAFF":
      return "Staff";
    default:
      return role || "Member";
  }
}

function userNameFromWorkspace() {
  /*
   * The actual profile name is already available in the workspace.
   * This helper intentionally returns a compact label.
   *
   * The page itself does not need another auth fetch.
   */
  return "Current account";
}

function MiniBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E3D8CF] bg-[#FFFDF9] px-2.5 py-1.5 text-[10px] font-semibold text-[#6E6258] shadow-[0_3px_10px_rgba(70,45,25,0.03)]">
      {icon}
      {text}
    </span>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E8DDD3] bg-[#FFFCF8] px-3.5 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-[#998B80]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-semibold text-[#3E342D]">
        {value}
      </p>
    </div>
  );
}

function CompactInput({
  icon,
  label,
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#918174]">
        {icon}
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-xl border border-[#DDD0C5] bg-[#FFFCF8] px-3 text-xs text-[#3E342D] outline-none transition placeholder:text-[#B2A59A] focus:border-[#B99D84] focus:ring-2 focus:ring-[#EADFD4] disabled:cursor-not-allowed disabled:bg-[#F5F0EB] disabled:text-[#988C82]"
      />
    </label>
  );
}

function CompactTextarea({
  icon,
  label,
  value,
  onChange,
  disabled,
  rows = 2,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#918174]">
        {icon}
        {label}
      </span>

      <textarea
        rows={rows}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-xl border border-[#DDD0C5] bg-[#FFFCF8] px-3 py-2 text-xs leading-5 text-[#3E342D] outline-none transition placeholder:text-[#B2A59A] focus:border-[#B99D84] focus:ring-2 focus:ring-[#EADFD4] disabled:cursor-not-allowed disabled:bg-[#F5F0EB] disabled:text-[#988C82]"
      />
    </label>
  );
}

function CompactPassword({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#918174]">
        {label}
      </span>

      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-xl border border-[#DDD0C5] bg-[#FFFCF8] px-3 text-xs text-[#3E342D] outline-none transition focus:border-[#B99D84] focus:ring-2 focus:ring-[#EADFD4]"
      />
    </label>
  );
}

function PermissionNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-xl bg-[#FAF6F1] px-3.5 py-2.5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#6F4E37]" />

        <p className="text-[10px] leading-4 text-[#8E8074]">{children}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Create branch modal                                                        */
/* -------------------------------------------------------------------------- */

function CreateBranchModal({
  form,
  setForm,
  loading,
  onClose,
  onCreate,
}: {
  form: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    timezone: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      phone: string;
      email: string;
      address: string;
      timezone: string;
    }>
  >;
  loading: boolean;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <ModalShell
      title="Add branch"
      description="Create another branch for this organization."
      onClose={onClose}
    >
      <div className="grid gap-4">
        <CompactInput
          label="Branch name"
          value={form.name}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              name: value,
            }))
          }
          placeholder="e.g. Downtown Branch"
        />

        <CompactTextarea
          label="Description"
          value={form.description}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              description: value,
            }))
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <CompactInput
            label="Phone"
            value={form.phone}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                phone: value,
              }))
            }
          />

          <CompactInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                email: value,
              }))
            }
          />
        </div>

        <CompactTextarea
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Address"
          value={form.address}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              address: value,
            }))
          }
        />

        <CompactInput
          label="Timezone"
          value={form.timezone}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              timezone: value,
            }))
          }
        />
      </div>

      <ModalActions
        onClose={onClose}
        loading={loading}
        primaryLabel="Create branch"
        onPrimary={onCreate}
        primaryIcon={<Plus className="h-3.5 w-3.5" />}
      />
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Edit branch modal                                                          */
/* -------------------------------------------------------------------------- */

function EditBranchModal({
  branch,
  setBranch,
  loading,
  onClose,
  onSave,
}: {
  branch: BranchSettings;
  setBranch: React.Dispatch<React.SetStateAction<BranchSettings | null>>;
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <ModalShell
      title={`Edit ${branch.name}`}
      description="Update branch information and location details."
      onClose={onClose}
    >
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <CompactInput
            label="Name"
            value={branch.name}
            onChange={(value) =>
              setBranch((current) =>
                current
                  ? {
                      ...current,
                      name: value,
                    }
                  : current,
              )
            }
          />

          <CompactInput
            label="Slug"
            value={branch.slug}
            onChange={(value) =>
              setBranch((current) =>
                current
                  ? {
                      ...current,
                      slug: value,
                    }
                  : current,
              )
            }
          />
        </div>

        <CompactTextarea
          label="Description"
          value={branch.description ?? ""}
          onChange={(value) =>
            setBranch((current) =>
              current
                ? {
                    ...current,
                    description: value,
                  }
                : current,
            )
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <CompactInput
            label="Phone"
            value={branch.phone ?? ""}
            onChange={(value) =>
              setBranch((current) =>
                current
                  ? {
                      ...current,
                      phone: value,
                    }
                  : current,
              )
            }
          />

          <CompactInput
            label="Email"
            type="email"
            value={branch.email ?? ""}
            onChange={(value) =>
              setBranch((current) =>
                current
                  ? {
                      ...current,
                      email: value,
                    }
                  : current,
              )
            }
          />
        </div>

        <CompactTextarea
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Address"
          value={branch.address ?? ""}
          onChange={(value) =>
            setBranch((current) =>
              current
                ? {
                    ...current,
                    address: value,
                  }
                : current,
            )
          }
        />

        <CompactInput
          label="Timezone"
          value={branch.timezone}
          onChange={(value) =>
            setBranch((current) =>
              current
                ? {
                    ...current,
                    timezone: value,
                  }
                : current,
            )
          }
        />
      </div>

      <ModalActions
        onClose={onClose}
        loading={loading}
        primaryLabel="Save branch"
        onPrimary={onSave}
        primaryIcon={<Save className="h-3.5 w-3.5" />}
      />
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Remove branch modal                                                        */
/* -------------------------------------------------------------------------- */

function RemoveBranchModal({
  branch,
  loading,
  onClose,
  onRemove,
}: {
  branch: BranchSettings;
  loading: boolean;
  onClose: () => void;
  onRemove: () => void;
}) {
  return (
    <ModalShell
      title={`Remove ${branch.name}?`}
      description="This permanently removes the branch when it has no associated operational records."
      onClose={onClose}
    >
      <div className="rounded-2xl bg-[#FFF5F1] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8DDD5] text-[#8A4B3E]">
            <Trash2 className="h-4 w-4" />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#6E3931]">
              Please confirm this action
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[#8A5A51]">
              Branches with orders, tables, inventory, reservations, staff
              assignments, or other operational records cannot be removed.
            </p>
          </div>
        </div>
      </div>

      <ModalActions
        onClose={onClose}
        loading={loading}
        primaryLabel="Remove branch"
        onPrimary={onRemove}
        primaryIcon={<Trash2 className="h-3.5 w-3.5" />}
        danger
      />
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal primitives                                                           */
/* -------------------------------------------------------------------------- */

function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2118]/25 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#EEE4DC] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#2B2118]">{title}</h2>

            <p className="mt-1 text-[11px] leading-4 text-[#8E8074]">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#8E8074] transition hover:bg-[#F3ECE6] hover:text-[#5E5147]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({
  onClose,
  loading,
  primaryLabel,
  onPrimary,
  primaryIcon,
  danger = false,
}: {
  onClose: () => void;
  loading: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  primaryIcon: ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="rounded-xl border border-[#DDD0C5] bg-[#FFFDF9] px-3.5 py-2 text-xs font-semibold text-[#6E6258] transition hover:bg-[#F7F1EB] disabled:opacity-60"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={onPrimary}
        disabled={loading}
        className={[
          "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
          danger
            ? "bg-[#8A4B3E] hover:bg-[#743D33]"
            : "bg-[#6F4E37] hover:bg-[#5F402E]",
        ].join(" ")}
      >
        {primaryIcon}

        {loading ? "Processing..." : primaryLabel}
      </button>
    </div>
  );
}
