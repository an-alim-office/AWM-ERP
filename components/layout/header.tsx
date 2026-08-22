"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type HeaderProps = {
  /** Pass the logged-in user's photo URL once you have it (e.g. from
   *  your auth/user context: avatarSrc={user.avatarUrl}). Leave it out
   *  (or null) and a clean initials avatar is shown instead — no broken
   *  image, nothing to configure up front. */
  avatarSrc?: string | null;
  userName?: string;
  /** Called after a new avatar is successfully uploaded, so the parent
   *  can update its own user/session state (e.g. refresh(), setUser()). */
  onAvatarChange?: (newUrl: string | null) => void;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Compact, premium ERP header.
 *
 * IMPORTANT — this component does NOT position itself as `fixed`.
 * It is a normal-flow, `shrink-0` child inside the root layout's flex
 * shell (app/layout.tsx: Sidebar + Header + <main overflow-y-auto>),
 * so it never scrolls and only <main> below it does — by construction,
 * not by a position:fixed hack.
 */
export default function Header({
  avatarSrc = null,
  userName = "Admin",
  onAvatarChange,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(avatarSrc);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = getInitials(userName);

  function handlePickFile() {
    setUploadError(null);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Only JPG, PNG, WEBP or GIF images are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Image must be 5MB or smaller.");
      return;
    }

    // Instant local preview while the real upload happens.
    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
        // TODO: your real auth is probably cookie/session based already;
        // this header is only needed if you're using the placeholder
        // getCurrentUserId() from the API route example.
        // headers: { "x-user-id": currentUser.id },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Upload failed");
      }

      setAvatar(json.data.avatarUrl);
      onAvatarChange?.(json.data.avatarUrl);
    } catch (err) {
      console.error(err);
      setUploadError("Couldn't save your photo. Please try again.");
      setAvatar(avatarSrc); // revert to whatever it was before
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  }

  async function handleRemovePhoto() {
    setUploading(true);
    setUploadError(null);
    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Failed to remove photo");
      }
      setAvatar(null);
      onAvatarChange?.(null);
    } catch (err) {
      console.error(err);
      setUploadError("Couldn't remove your photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const AvatarButton = ({ size }: { size: "sm" | "md" }) => {
    const dimension = size === "md" ? "h-10 w-10" : "h-9 w-9";
    const px = size === "md" ? 40 : 36;
    return (
      <div className="group relative">
        <button
          type="button"
          title={userName}
          aria-label="Change profile photo"
          onClick={handlePickFile}
          disabled={uploading}
          className={`relative flex ${dimension} shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#D4AF37]/70 bg-gradient-to-br from-[#12294f] to-[#0A1830] shadow-[0_2px_10px_rgba(0,0,0,0.4),0_0_0_2px_rgba(212,175,55,0.12)] transition hover:border-[#F9E79F]/90 hover:shadow-[0_2px_14px_rgba(212,175,55,0.35)] disabled:opacity-70`}
        >
          {avatar ? (
            <Image src={avatar} alt={userName} fill sizes={`${px}px`} className="object-cover" />
          ) : (
            <span className="text-sm font-bold text-[#F5D888]">{initials}</span>
          )}

          {/* online status dot */}
          <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1c1206] bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />

          {/* hover / uploading overlay with a camera/pencil hint */}
          <span
            className={`absolute inset-0 flex items-center justify-center bg-black/50 text-[#F5D888] transition-opacity ${
              uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {uploading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7h3l2-2h8l2 2h3v12H3V7z"
                />
                <circle cx="12" cy="13" r="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </button>
      </div>
    );
  };

  return (
    <header className="relative z-30 shrink-0 border-b-2 border-[#D4AF37]/60 shadow-[0_4px_18px_rgba(0,0,0,0.4)]">
      {/* hidden file input shared by desktop + mobile avatar buttons */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Deep bronze / dark-brown metallic gradient background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1c1206] via-[#4a3216] to-[#1c1206]">
        {/* glossy highlight sweep */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#F9E79F]/40" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[#8A6200] via-[#F9E79F] to-[#8A6200]" />

        <div className="relative mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          {/* Profile picture — click to upload a real photo; falls back to initials */}
          <div className="flex min-w-0 items-center gap-3">
            <AvatarButton size="md" />

            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-bold text-[#F5D888]">{userName}</p>
              <p className="truncate text-[11px] font-medium text-slate-400">Super Administrator</p>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  className="mt-0.5 text-[10px] font-medium text-slate-400 underline decoration-dotted hover:text-[#F5D888] disabled:opacity-50"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {/* Welcome text */}
          <div className="hidden flex-1 justify-center lg:flex">
            <span className="text-sm font-semibold text-[#F5D888]">
              Welcome, {userName}
            </span>
          </div>

          {/* Nav / action icons + Admin Panel + Bell */}
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              title="Search"
              aria-label="Search"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-white/[0.04] text-[#F5D888] transition hover:border-[#F9E79F]/70 hover:bg-[#D4AF37]/15"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                />
              </svg>
            </button>

            <Link
              href="/settings/theme"
              title="Theme"
              aria-label="Toggle theme"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-white/[0.04] text-[#F5D888] transition hover:border-[#F9E79F]/70 hover:bg-[#D4AF37]/15"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4.5" />
                <path
                  strokeLinecap="round"
                  strokeWidth="1.6"
                  stroke="currentColor"
                  d="M12 2.5v2M12 19.5v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2.5 12h2M19.5 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4"
                />
              </svg>
            </Link>

            <Link
              href="/settings"
              title="Settings"
              aria-label="Settings"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-white/[0.04] text-[#F5D888] transition hover:border-[#F9E79F]/70 hover:bg-[#D4AF37]/15"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            <div className="mx-1 h-6 w-px bg-[#D4AF37]/25" />

            <Link
              href="/dashboard/admin"
              className="rounded-lg border border-[#8A6200]/60 bg-gradient-to-b from-[#F9E79F] to-[#D4AF37] px-4 py-2 text-xs font-bold text-[#241a05] shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition hover:brightness-105 active:scale-[0.98]"
            >
              Admin Panel
            </Link>

            <Link
              href="/dashboard/notifications"
              title="Notifications"
              aria-label="Notifications"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#F5D888] transition hover:bg-white/[0.06]"
            >
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 01-6 0m6 0H9"
                />
              </svg>
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#241a05]"></span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-[#D4AF37]/40 bg-white/[0.05] p-2 text-[#F5D888] md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-900/80 px-4 py-1.5 text-center text-xs font-medium text-red-100">
          {uploadError}
        </div>
      )}

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="border-t border-[#D4AF37]/30 bg-[#1c1206] px-4 py-4 shadow-md md:hidden">
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-2xl border border-[#D4AF37]/30 bg-[#0F2242]/90 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#F9E79F]/70"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <AvatarButton size="sm" />
              <div>
                <div className="text-sm font-semibold text-[#F5D888]">Welcome, {userName}</div>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="text-[10px] font-medium text-slate-400 underline decoration-dotted hover:text-[#F5D888] disabled:opacity-50"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            <Link
              href="/dashboard/admin"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl border border-[#8A6200]/60 bg-gradient-to-b from-[#F9E79F] to-[#D4AF37] px-4 py-3 text-center text-sm font-bold text-[#241a05] shadow-md"
            >
              Admin Panel
            </Link>

            <Link
              href="/dashboard/notifications"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl border border-[#D4AF37]/30 px-4 py-3 text-left text-sm font-semibold text-[#F5D888] hover:bg-white/5"
            >
              Notifications
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                aria-label="Settings"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/35 text-[#F5D888]"
              >
                ⚙
              </Link>
              <Link
                href="/settings/theme"
                onClick={() => setMenuOpen(false)}
                aria-label="Toggle theme"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/35 text-[#F5D888]"
              >
                ☀
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
