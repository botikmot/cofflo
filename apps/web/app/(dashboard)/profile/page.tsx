"use client";

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  Building2,
  Camera,
  CheckCircle2,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { apiFetch } from "@/lib/api";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { MEMBERSHIP_ROLE_LABELS } from "@/types/staff";
import type { AuthUser } from "@/types/auth";

function getInitials(firstName: string, lastName: string | null) {
  const first = firstName?.charAt(0) ?? "";
  const last = lastName?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "?";
}

function getFullName(firstName: string, lastName: string | null) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();

  return name || "Unnamed user";
}

function formatRole(role: string) {
  return (
    MEMBERSHIP_ROLE_LABELS[role as keyof typeof MEMBERSHIP_ROLE_LABELS] ?? role
  );
}

function formatStatus(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "SUSPENDED":
      return "Suspended";

    case "DEACTIVATED":
      return "Deactivated";

    case "INVITED":
      return "Invited";

    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-[#E4F0E6] text-[#41674A]";

    case "SUSPENDED":
      return "bg-[#F8EAD5] text-[#886121]";

    case "DEACTIVATED":
      return "bg-[#EEE8E3] text-[#74675D]";

    default:
      return "bg-[#EEE8E3] text-[#74675D]";
  }
}

export default function ProfilePage() {
  const {
    user,
    activeMembership,
    isLoading: workspaceLoading,
    refetchUser,
  } = useWorkspace();

  if (workspaceLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-5 pt-4">
        <div className="rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
          <UserRound className="mx-auto h-7 w-7 text-[#B7A99B]" />

          <p className="mt-3 text-sm font-semibold text-[#5E5248]">
            Profile unavailable
          </p>

          <p className="mt-1 text-sm text-[#94877A]">
            Please sign in again to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProfileWorkspace
      key={[
        user.id,
        user.firstName,
        user.lastName ?? "",
        user.email,
        user.avatarUrl ?? "",
        activeMembership?.id ?? "",
      ].join("-")}
      user={user}
      activeMembership={activeMembership}
      refetchUser={refetchUser}
    />
  );
}

type ProfileWorkspaceProps = {
  user: AuthUser;
  activeMembership: AuthUser["memberships"][number] | null | undefined;
  refetchUser: () => Promise<unknown>;
};

function ProfileWorkspace({
  user,
  activeMembership,
  refetchUser,
}: ProfileWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editing, setEditing] = useState(false);

  const [firstName, setFirstName] = useState(user.firstName);

  const [lastName, setLastName] = useState(user.lastName ?? "");

  const [email, setEmail] = useState(user.email);

  const [saving, setSaving] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const activeMembershipId = activeMembership?.id ?? null;

  const activeRole = activeMembership?.role ?? null;

  const memberships = user.memberships ?? [];

  const activeOrganization = activeMembership?.organization ?? null;

  const activeBranch = activeMembership?.branch ?? null;

  const initials = getInitials(user.firstName, user.lastName ?? null);

  const displayAvatar = selectedImage ?? user.avatarUrl ?? null;

  function showSuccess(message: string) {
    setErrorMessage("");
    setSuccessMessage(message);
  }

  function showError(message: string) {
    setSuccessMessage("");
    setErrorMessage(message);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showError("Only JPG, PNG, and WEBP images are allowed.");

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Profile image must not exceed 5 MB.");

      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setSelectedImage(previewUrl);
  }

  function clearSelectedImage() {
    setSelectedFile(null);
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleUploadAvatar() {
    if (!selectedFile) {
      return;
    }

    setUploadingAvatar(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      await apiFetch<{ avatarUrl: string }>("/auth/profile/avatar", {
        method: "POST",
        body: formData,
      });

      clearSelectedImage();

      await refetchUser();

      showSuccess("Profile photo updated successfully.");
    } catch (error) {
      console.error("PROFILE AVATAR UPLOAD FAILED:", error);

      showError(
        error instanceof Error
          ? error.message
          : "Unable to upload profile photo.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveProfile() {
    const cleanFirstName = firstName.trim();

    const cleanLastName = lastName.trim();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirstName) {
      showError("First name is required.");
      return;
    }

    if (!cleanEmail) {
      showError("Email is required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiFetch<AuthUser>("/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName || null,
          email: cleanEmail,
        }),
      });

      await refetchUser();

      setEditing(false);

      showSuccess("Profile updated successfully.");
    } catch (error) {
      console.error("PROFILE UPDATE FAILED:", error);

      showError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setFirstName(user.firstName);
    setLastName(user.lastName ?? "");
    setEmail(user.email);

    setEditing(false);
    setErrorMessage("");
  }

  function startEditing() {
    setFirstName(user.firstName);
    setLastName(user.lastName ?? "");
    setEmail(user.email);

    setEditing(true);
    setErrorMessage("");
    setSuccessMessage("");
  }

  return (
    <div className="space-y-5 pt-3 pb-8">
      {/* HEADER */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A8C80]">
            Account
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2B2118] sm:text-3xl">
            Profile
          </h1>

          <p className="mt-1 text-xs text-[#85786C] sm:text-sm">
            Manage your personal details and workspace access.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6F4E37] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5F402E]"
          >
            <UserRound className="h-3.5 w-3.5" />
            Edit profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              className="rounded-xl border border-[#DDD0C5] bg-[#FFFDF9] px-3.5 py-2 text-xs font-semibold text-[#6F6258] transition hover:bg-[#F7F1EB] disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6F4E37] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5F402E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
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
        {/* PROFILE */}
        <section className="xl:col-span-8 overflow-hidden rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(70,45,25,0.04)]">
          <div className="border-b border-[#EEE4DC] bg-[#F8F1EA] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* AVATAR */}
              <div className="relative shrink-0">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] bg-[#6F4E37] text-xl font-semibold text-white shadow-sm">
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt={getFullName(user.firstName, user.lastName ?? null)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />

                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl border-4 border-[#F8F1EA] bg-[#6F4E37] text-white shadow-sm transition hover:bg-[#5F402E] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Change profile photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* IDENTITY */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight text-[#2B2118]">
                    {getFullName(user.firstName, user.lastName ?? null)}
                  </h2>

                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                      getStatusClass(user.status),
                    ].join(" ")}
                  >
                    {formatStatus(user.status)}
                  </span>
                </div>

                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#74665A]">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {activeRole && (
                    <span className="rounded-full bg-[#E9DED3] px-2.5 py-1 text-[10px] font-semibold text-[#6F4E37]">
                      {formatRole(activeRole)}
                    </span>
                  )}

                  {activeBranch && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#7E7065]">
                      <MapPin className="h-3 w-3" />
                      {activeBranch.name}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C9BD] bg-[#FFFDF9] px-2.5 py-1.5 text-[10px] font-semibold text-[#6F4E37] transition hover:bg-white disabled:opacity-60"
                  >
                    <Camera className="h-3 w-3" />
                    {uploadingAvatar ? "Uploading..." : "Change photo"}
                  </button>

                  {selectedFile && (
                    <>
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        disabled={uploadingAvatar}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDD0C5] bg-[#FFFDF9] px-2.5 py-1.5 text-[10px] font-semibold text-[#6E6258] transition hover:bg-white disabled:opacity-60"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleUploadAvatar}
                        disabled={uploadingAvatar}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#6F4E37] px-2.5 py-1.5 text-[10px] font-semibold text-white transition hover:bg-[#5F402E] disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {uploadingAvatar ? "Uploading..." : "Use photo"}
                      </button>
                    </>
                  )}

                  <span className="text-[9px] text-[#96887D]">
                    JPG, PNG, WEBP · 5 MB max
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#2B2118]">
                  Personal information
                </h3>

                <p className="mt-0.5 text-[10px] text-[#8E8074]">
                  Details associated with your account.
                </p>
              </div>

              <UserRound className="h-4 w-4 text-[#6F4E37]" />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {editing ? (
                <>
                  <CompactEditableField
                    icon={<UserRound className="h-3.5 w-3.5" />}
                    label="First name"
                    value={firstName}
                    onChange={setFirstName}
                    placeholder="Enter first name"
                  />

                  <CompactEditableField
                    icon={<UserRound className="h-3.5 w-3.5" />}
                    label="Last name"
                    value={lastName}
                    onChange={setLastName}
                    placeholder="Enter last name"
                  />

                  <CompactEditableField
                    icon={<Mail className="h-3.5 w-3.5" />}
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="Enter email"
                  />
                </>
              ) : (
                <>
                  <CompactInfo
                    icon={<UserRound className="h-3.5 w-3.5" />}
                    label="First name"
                    value={user.firstName}
                  />

                  <CompactInfo
                    icon={<UserRound className="h-3.5 w-3.5" />}
                    label="Last name"
                    value={user.lastName || "Not provided"}
                  />

                  <CompactInfo
                    icon={<Mail className="h-3.5 w-3.5" />}
                    label="Email"
                    value={user.email}
                  />
                </>
              )}

              <CompactInfo
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label="Account status"
                value={formatStatus(user.status)}
              />

              <CompactInfo
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label="Current role"
                value={activeRole ? formatRole(activeRole) : "No role"}
              />

              <CompactInfo
                icon={<Building2 className="h-3.5 w-3.5" />}
                label="Organization"
                value={activeOrganization?.name ?? "No organization"}
              />
            </div>
          </div>
        </section>

        {/* WORKSPACE SNAPSHOT */}
        <section className="xl:col-span-4 rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(70,45,25,0.04)]">
          <div className="border-b border-[#EEE4DC] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
                <Building2 className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#2B2118]">
                  Workspace
                </h2>

                <p className="text-[10px] text-[#8E8074]">
                  Your current working context.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="rounded-2xl bg-[#F7F0E9] p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#907F70]">
                Organization
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-[#3E342D]">
                {activeOrganization?.name ?? "No organization"}
              </p>

              {activeOrganization?.slug && (
                <p className="mt-0.5 truncate text-[10px] text-[#918174]">
                  /{activeOrganization.slug}
                </p>
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-[#E8DDD3] bg-[#FFFCF8] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
                  <MapPin className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#918174]">
                    Current branch
                  </p>

                  <p className="mt-1 truncate text-xs font-semibold text-[#3E342D]">
                    {activeBranch?.name ?? "Organization-wide"}
                  </p>

                  {activeBranch?.slug && (
                    <p className="mt-0.5 truncate text-[10px] text-[#918174]">
                      /{activeBranch.slug}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <MiniSummary
                label="Role"
                value={activeRole ? formatRole(activeRole) : "—"}
              />

              <MiniSummary
                label="Access"
                value={`${memberships.length} ${
                  memberships.length === 1 ? "workspace" : "workspaces"
                }`}
              />
            </div>
          </div>
        </section>
      </div>

      {/* LOWER GRID */}
      <div className="grid gap-5 xl:grid-cols-12">
        {/* ORGANIZATION ACCESS */}
        <section className="xl:col-span-8 rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(70,45,25,0.04)]">
          <div className="border-b border-[#EEE4DC] px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[#2B2118]">
                  Organization access
                </h2>

                <p className="mt-0.5 text-[10px] text-[#8E8074]">
                  Organizations and branches available to your account.
                </p>
              </div>

              <span className="rounded-full bg-[#F0E6DA] px-2.5 py-1 text-[9px] font-semibold text-[#6F4E37]">
                {memberships.length}{" "}
                {memberships.length === 1 ? "access" : "accesses"}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {memberships.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#DED3C9] p-7 text-center">
                <Building2 className="mx-auto h-6 w-6 text-[#B7A99B]" />

                <p className="mt-2 text-xs font-semibold text-[#675A50]">
                  No memberships found
                </p>

                <p className="mt-1 text-[10px] text-[#95887D]">
                  Your account is not currently assigned to any workspace.
                </p>
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {memberships.map((membership) => {
                  const isActive = membership.id === activeMembershipId;

                  return (
                    <div
                      key={membership.id}
                      className={[
                        "rounded-2xl border px-4 py-3",
                        isActive
                          ? "border-[#CDBAA9] bg-[#F8F1EA]"
                          : "border-[#E8DDD3] bg-[#FFFCF8]",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
                            <Building2 className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="truncate text-xs font-semibold text-[#2B2118]">
                                {membership.organization.name}
                              </p>

                              {isActive && (
                                <span className="rounded-full bg-[#E4F0E6] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#41674A]">
                                  Current
                                </span>
                              )}
                            </div>

                            <div className="mt-0.5 flex items-center gap-1.5">
                              <p className="truncate text-[10px] text-[#8A7C71]">
                                {membership.branch?.name ?? "Organization-wide"}
                              </p>

                              <span className="text-[#C7B9AC]">•</span>

                              <p className="truncate text-[10px] text-[#8A7C71]">
                                {formatRole(membership.role)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <span
                          className={[
                            "shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold",
                            isActive
                              ? "bg-[#E9DED3] text-[#6F4E37]"
                              : "bg-[#F0E6DA] text-[#6F6258]",
                          ].join(" ")}
                        >
                          {formatRole(membership.role)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SECURITY */}
        <section className="xl:col-span-4 rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(70,45,25,0.04)]">
          <div className="border-b border-[#EEE4DC] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#2B2118]">
                  Security
                </h2>

                <p className="text-[10px] text-[#8E8074]">
                  Keep your account protected.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="rounded-2xl bg-[#FAF6F1] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E9DED3] text-[#6F4E37]">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#3E342D]">
                    Password & account security
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-[#8E8074]">
                    Password changes and account security controls are available
                    in Account Settings.
                  </p>
                </div>
              </div>
            </div>

            <a
              href="/settings"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8C9BD] bg-[#FFFDF9] px-3 py-2.5 text-xs font-semibold text-[#6F4E37] transition hover:bg-[#F7F0E9]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Open account settings
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function CompactInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8DDD3] bg-[#FFFCF8] px-3.5 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0E6DA] text-[#6F4E37]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#918174]">
            {label}
          </p>

          <p className="mt-0.5 truncate text-xs font-medium text-[#3E342D]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CompactEditableField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#918174]">
        {icon}
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-xl border border-[#DCCFC4] bg-[#FFFCF8] px-3 text-xs text-[#3E342D] outline-none transition placeholder:text-[#B2A59A] focus:border-[#B99D84] focus:ring-2 focus:ring-[#EADFD4]"
      />
    </label>
  );
}

function MiniSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E8DDD3] bg-[#FFFCF8] px-3.5 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#918174]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-semibold text-[#3E342D]">
        {value}
      </p>
    </div>
  );
}
