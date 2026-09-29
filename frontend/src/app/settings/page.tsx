"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  User,
  Bell,
  Shield,
  Palette,
  LogOut,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ArrowRightLeft,
  Eye,
  EyeOff,
  Lock,
  XCircle,
  Download,
  Upload,
  Check,
  Sparkles,
  Camera,
  ChevronRight,
  FileSpreadsheet,
  KeyRound,
  ShieldCheck,
  QrCode,
  Copy,
  Monitor,
  Fingerprint,
  Activity,
  CheckCheck,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, Button, Field, inputCls, toast, Modal } from "@/components/ui";
import QRCode from "qrcode";
import { useAuth, Session } from "@/contexts/AuthContext";
import { getEstimatedRate, SUPPORTED_CURRENCIES, fetchLiveRates } from "@/lib/currency";

function formatRelativeTime(dateStr: string | Date | undefined) {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatLastActive(dateStr: string | Date | undefined) {
  if (!dateStr) return "Recently";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const PRESET_AVATARS = [
  {
    id: "alex",
    name: "Alex",
    role: "Modern Tech",
    category: "personas",
    url: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=b6e3f4",
  },
  {
    id: "maya",
    name: "Maya",
    role: "Creative Lead",
    category: "personas",
    url: "https://api.dicebear.com/7.x/notionists/svg?seed=Maya&backgroundColor=ffd5dc",
  },
  {
    id: "felix",
    name: "Felix",
    role: "Tech Executive",
    category: "personas",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=c0aede",
  },
  {
    id: "sophia",
    name: "Sophia",
    role: "Financial Analyst",
    category: "personas",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=d1d4f9",
  },
  {
    id: "leo",
    name: "Leo",
    role: "Strategic Investor",
    category: "personas",
    url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Leo&backgroundColor=ffdfbf",
  },
  {
    id: "priya",
    name: "Priya",
    role: "Founder & CEO",
    category: "personas",
    url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Priya&backgroundColor=ffd5dc",
  },
  {
    id: "marcus",
    name: "Marcus",
    role: "Portfolio Manager",
    category: "personas",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus&backgroundColor=b6e3f4",
  },
  {
    id: "elena",
    name: "Elena",
    role: "Venture Partner",
    category: "personas",
    url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Elena&backgroundColor=c0aede",
  },
  {
    id: "finbot",
    name: "FinBot",
    role: "AI Copilot",
    category: "bots",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=FinTrack&backgroundColor=b6e3f4",
  },
  {
    id: "cyber",
    name: "Cyber",
    role: "Crypto Specialist",
    category: "bots",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Cyber&backgroundColor=d1d4f9",
  },
  {
    id: "pulse",
    name: "Pulse",
    role: "Market Radar",
    category: "bots",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Pulse&backgroundColor=ffd5dc",
  },
  {
    id: "sparkle",
    name: "Sparkle",
    role: "Lucky Emoji",
    category: "shapes",
    url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Lucky&backgroundColor=ffdfbf",
  },
  {
    id: "cosmic",
    name: "Cosmic",
    role: "Space Explorer",
    category: "shapes",
    url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cosmic&backgroundColor=b6e3f4",
  },
  {
    id: "geo",
    name: "Geometric",
    role: "Minimal Art",
    category: "shapes",
    url: "https://api.dicebear.com/7.x/shapes/svg?seed=FinWealth&backgroundColor=d1d4f9",
  },
  {
    id: "orbit",
    name: "Orbit",
    role: "Modern Flow",
    category: "shapes",
    url: "https://api.dicebear.com/7.x/shapes/svg?seed=Orbit&backgroundColor=c0aede",
  },
  {
    id: "diamond",
    name: "Diamond",
    role: "Sovereign Tier",
    category: "shapes",
    url: "https://api.dicebear.com/7.x/shapes/svg?seed=Diamond&backgroundColor=ffd5dc",
  },
];

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarCategory, setAvatarCategory] = useState<"all" | "personas" | "bots" | "shapes">("all");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    avatarUrl: "",
  });
  const [prefs, setPrefs] = useState({
    notifyBudget: true,
    notifyRecurring: true,
    notifyGoals: true,
    notifySummary: true,
  });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [saving, setSaving] = useState(false);

  // Active sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  // Inactivity timeout state (default 15 mins)
  const [timeoutMins, setTimeoutMins] = useState("15");

  // Two-Factor Authentication (2FA) state
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [enablingTwoFactor, setEnablingTwoFactor] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const twoFactorSecret = "HXDMVJECJJWSRB3H";
  const otpInputRef = useRef<HTMLInputElement>(null);
  const [isOtpFocused, setIsOtpFocused] = useState(true);

  // Danger Zone: Account & Data Deletion
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purgeInput, setPurgeInput] = useState("");
  const [purging, setPurging] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [exportingBackup, setExportingBackup] = useState(false);

  const handleExportBackup = async () => {
    try {
      setExportingBackup(true);
      const res = await fetch("/api/auth/export-data", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to generate backup archive");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fintrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast("Financial data backup downloaded successfully! 💾");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Error downloading data backup", "error");
    } finally {
      setExportingBackup(false);
    }
  };

  // Import / Restore Backup Archive
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importParsed, setImportParsed] = useState<{
    version?: string;
    app?: string;
    exportedAt?: string;
    counts: {
      accounts: number;
      categories: number;
      transactions: number;
    };
    rawPayload: any;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleSelectImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast("Please select a valid FinTrack JSON backup file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const data = parsed.data || parsed;
        const accountsCount = Array.isArray(data.accounts) ? data.accounts.length : 0;
        const categoriesCount = Array.isArray(data.categories) ? data.categories.length : 0;
        const txCount = Array.isArray(data.transactions) ? data.transactions.length : 0;

        if (accountsCount === 0 && categoriesCount === 0 && txCount === 0) {
          toast("Selected JSON archive contains no financial records", "error");
          return;
        }

        setImportParsed({
          version: parsed.version || "2.0.0",
          app: parsed.app || "FinTrack",
          exportedAt: parsed.exportedAt || new Date().toISOString(),
          counts: {
            accounts: accountsCount,
            categories: categoriesCount,
            transactions: txCount,
          },
          rawPayload: parsed,
        });
        setImportModalOpen(true);
      } catch {
        toast("Failed to parse JSON backup file. Ensure it is a valid backup.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const executeImport = async () => {
    if (!importParsed?.rawPayload) return;
    try {
      setImporting(true);
      const res = await fetch("/api/auth/import-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(importParsed.rawPayload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to restore backup");

      toast(`Backup restored! Imported ${json.data?.imported?.transactions || 0} transactions and ${json.data?.imported?.categories || 0} categories. 🎉`);
      setImportModalOpen(false);
      setImportParsed(null);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Error restoring data", "error");
    } finally {
      setImporting(false);
    }
  };

  const handlePurgeData = async () => {
    if (purgeInput.trim() !== "RESET DATA") {
      toast("Please type RESET DATA to confirm", "error");
      return;
    }
    try {
      setPurging(true);
      const res = await fetch("/api/auth/purge-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ confirmation: purgeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to reset data");
      toast(data.message || "Financial records successfully reset");
      setPurgeOpen(false);
      setPurgeInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error resetting data";
      toast(msg, "error");
    } finally {
      setPurging(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast("Please enter your current password", "error");
      return;
    }
    try {
      setDeleting(true);
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete account");
      toast("Account permanently deleted");
      setDeleteOpen(false);
      logout();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting account";
      toast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchLiveRates().catch(() => {});
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("fintrack_session_timeout_mins");
      const validOptions = ["0", "15", "30", "60", "240"];
      if (stored !== null && validOptions.includes(stored)) {
        setTimeoutMins(stored);
      } else {
        setTimeoutMins("15");
      }

      const stored2FA = localStorage.getItem("fintrack_2fa_enabled");
      if (stored2FA === "true") {
        setTwoFactorEnabled(true);
      }
    }
  }, []);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "bg-slate-300 dark:bg-slate-700", text: "text-slate-400" };
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score <= 25) return { score, label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
    if (score <= 50) return { score, label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
    if (score <= 75) return { score, label: "Good", color: "bg-sky-500", text: "text-sky-500" };
    return { score, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      try {
        const res = await fetch("/api/auth/2fa/disable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setTwoFactorEnabled(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem("fintrack_2fa_enabled");
          }
          toast("Two-Factor Authentication disabled");
          refresh();
        } else {
          toast(json.message || "Unable to disable 2FA", "error");
        }
      } catch {
        setTwoFactorEnabled(false);
        toast("Two-Factor Authentication disabled");
      }
    } else {
      setTwoFactorModalOpen(true);
    }
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.trim().length < 6) {
      toast("Please enter the 6-digit verification code", "error");
      return;
    }
    setEnablingTwoFactor(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: twoFactorCode.trim(), secret: twoFactorSecret }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast(json.message || "Invalid 6-digit code. Please check your authenticator app.", "error");
        setEnablingTwoFactor(false);
        return;
      }
      setTwoFactorEnabled(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("fintrack_2fa_enabled", "true");
      }
      setTwoFactorModalOpen(false);
      setTwoFactorCode("");
      toast("Two-Factor Authentication successfully enabled! 🔐");
      refresh();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Error verifying code", "error");
    } finally {
      setEnablingTwoFactor(false);
    }
  };

  useEffect(() => {
    if (twoFactorModalOpen) {
      const email = user?.email || "user@finovo.app";
      const otpauthUri = `otpauth://totp/Finovo:${encodeURIComponent(email)}?secret=${twoFactorSecret}&issuer=Finovo&algorithm=SHA1&digits=6&period=30`;
      QRCode.toDataURL(otpauthUri, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 260,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [twoFactorModalOpen, user?.email]);

  const handleTimeoutChange = (val: string) => {
    setTimeoutMins(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("fintrack_session_timeout_mins", val);
      const labels: Record<string, string> = {
        "0": "Inactivity sign-out disabled (Never)",
        "15": "Auto sign-out set to 15 minutes",
        "30": "Auto sign-out set to 30 minutes",
        "60": "Auto sign-out set to 1 hour",
        "240": "Auto sign-out set to 4 hours",
      };
      toast(labels[val] || `Auto sign-out set to ${val} minutes`);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        currency: (user as unknown as { currency?: string }).currency || "INR",
        dateFormat: (user as unknown as { dateFormat?: string }).dateFormat || "DD/MM/YYYY",
        avatarUrl: (user as unknown as { avatarUrl?: string }).avatarUrl || "",
      });
      setPrefs({
        notifyBudget: (user as unknown as { notifyBudget?: boolean }).notifyBudget ?? true,
        notifyRecurring: (user as unknown as { notifyRecurring?: boolean }).notifyRecurring ?? true,
        notifyGoals: (user as unknown as { notifyGoals?: boolean }).notifyGoals ?? true,
        notifySummary: (user as unknown as { notifySummary?: boolean }).notifySummary ?? true,
      });
    }
  }, [user]);

  const loadSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const res = await fetch("/api/auth/sessions", { credentials: "include" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.sessions)) {
        setSessions(json.data.sessions);
      }
    } catch {
      // ignore
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const revokeSession = async (sessionId: string) => {
    try {
      setRevokingId(sessionId);
      const res = await fetch(`/api/auth/sessions?id=${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast("Session revoked successfully");
    } catch (e2: unknown) {
      toast(e2 instanceof Error ? e2.message : "Failed to revoke session", "error");
    } finally {
      setRevokingId(null);
    }
  };

  const revokeAllOtherSessions = async () => {
    try {
      setRevokingAll(true);
      const res = await fetch("/api/auth/sessions?all=true", {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast("Logged out of all other devices");
    } catch (e2: unknown) {
      toast(e2 instanceof Error ? e2.message : "Failed to revoke sessions", "error");
    } finally {
      setRevokingAll(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please select an image file (PNG, JPG, SVG, WebP)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast("Image size should be less than 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setProfile((prev) => ({ ...prev, avatarUrl: dataUrl }));
          toast("Photo selected! Click 'Save Changes' to update profile.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...profile, ...prefs }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setUser(json.data.user);
      if (json.data.conversion) {
        toast(`Currency changed to ${json.data.conversion.toCurrency}! All balances, transactions, and budgets converted (rate: ×${json.data.conversion.rate.toFixed(4)}). 💱`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast("Settings saved");
      }
    } catch (e2: unknown) {
      toast(e2 instanceof Error ? e2.message : "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(pw),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to update password");
      toast("Password changed successfully! 🎉");
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e2: unknown) {
      toast(e2 instanceof Error ? e2.message : "Failed to change password", "error");
    } finally {
      setChangingPw(false);
    }
  };

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  const [activeTab, setActiveTab] = useState<"general" | "security" | "notifications" | "data">("general");
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tabId: "general" | "security" | "notifications" | "data") => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const targetBtn = document.getElementById(`tab-btn-${tabId}`);
      if (targetBtn && tabsScrollRef.current) {
        targetBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  };

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your profile, security credentials, active sessions, and account data.</p>
      </div>

      {/* ── Professional Mobile & Desktop Sliding Tabs Bar ── */}
      <div className="mt-4 relative w-full">
        {/* Mobile Edge Gradient / Swipe Hint */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-[#f4f6f8] dark:from-[#0b0e11] to-transparent z-10 sm:hidden flex items-center justify-end pr-1 text-slate-400">
          <ChevronRight className="h-3.5 w-3.5 opacity-60 animate-pulse" />
        </div>

        {/* Sliding Pill Bar Track */}
        <div
          ref={tabsScrollRef}
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#15181d] border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-x-auto no-scrollbar scroll-smooth snap-x"
        >
          {[
            { id: "general", label: "Profile & Preferences", shortLabel: "Profile", icon: User },
            { id: "security", label: "Security & Sessions", shortLabel: "Security", icon: Shield },
            { id: "notifications", label: "Notifications", shortLabel: "Alerts", icon: Bell },
            { id: "data", label: "Account & Data Controls", shortLabel: "Data & Privacy", icon: ShieldAlert },
          ].map((t) => {
            const isCurrent = activeTab === t.id;
            return (
              <button
                id={`tab-btn-${t.id}`}
                key={t.id}
                type="button"
                onClick={() => handleTabChange(t.id as "general" | "security" | "notifications" | "data")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap snap-center shrink-0 ${
                  isCurrent
                    ? "bg-[#0b0e11] text-white shadow-xs dark:bg-white/10 dark:text-white dark:border dark:border-white/10 font-semibold font-black scale-[1.02]"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#1b1f26]/80"
                }`}
              >
                <t.icon className={`h-4 w-4 shrink-0 transition-colors ${isCurrent ? "text-white" : "text-slate-400"}`} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Segmented Progress Slider Bar */}
        <div className="mt-2 flex items-center gap-1.5 px-1">
          {[
            { id: "general", label: "Profile" },
            { id: "security", label: "Security" },
            { id: "notifications", label: "Alerts" },
            { id: "data", label: "Data" },
          ].map((step) => {
            const isCurrent = activeTab === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleTabChange(step.id as "general" | "security" | "notifications" | "data")}
                className="group flex-1 py-1 cursor-pointer focus:outline-none"
                title={step.label}
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    isCurrent
                      ? "bg-emerald-500 shadow-xs shadow-xs"
                      : "bg-slate-200 dark:bg-white/[0.06] group-hover:bg-slate-300 dark:group-hover:bg-white/[0.12]"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Profile & Preferences */}
      {activeTab === "general" && (
        <form onSubmit={saveProfile} className="mt-4 space-y-4 animate-fade-up">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 dark:border-white/[0.08]">
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h3>
                  <p className="text-xs text-slate-500">Your profile details across Finovo.</p>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                {/* Profile Picture Control */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/70 dark:bg-[#1b1f26] dark:border-white/[0.06]">
                  <div className="relative group shrink-0">
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden ring-2 ring-slate-200 dark:ring-white/20 ring-offset-2 ring-offset-white dark:ring-offset-[#15181d] shadow-xs transition-transform group-hover:scale-105">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt="Profile avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xl font-bold">
                          {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                      <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs">
                        <Camera className="h-4 w-4" />
                        <span className="text-[9px] font-bold mt-0.5">Edit</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Profile Avatar
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {profile.avatarUrl
                          ? PRESET_AVATARS.find((a) => a.url === profile.avatarUrl)
                            ? `Preset: ${PRESET_AVATARS.find((a) => a.url === profile.avatarUrl)?.name}`
                            : "Custom Photo"
                          : "Default Initials Badge"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setAvatarModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 shadow-xs transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Choose Avatar
                      </button>

                      <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 dark:bg-[#1f242d] dark:hover:bg-[#262c37] dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] shadow-2xs transition-all cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>

                      {profile.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setProfile({ ...profile, avatarUrl: "" })}
                          className="text-xs font-medium text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 px-1 py-1 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields: Full Name & Email Address */}
                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <Field label="Full Name">
                    <input
                      className={inputCls}
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </Field>
                  <Field label="Email Address">
                    <input
                      className={inputCls}
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </Card>

            {/* Regional & Display */}
            <Card>
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 dark:border-white/[0.08]">
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06]">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Regional & Display</h3>
                  <p className="text-xs text-slate-500">Currency and date formatting preferences.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Currency">
                    <select
                      className={inputCls}
                      value={profile.currency}
                      onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol}) - {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Date format">
                    <select
                      className={inputCls}
                      value={profile.dateFormat}
                      onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD MMM YYYY">DD MMM YYYY</option>
                    </select>
                  </Field>
                </div>

                {/* Currency Conversion Live Preview Info */}
                {profile.currency !== (user?.currency || "INR") && (
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-xs text-slate-700 dark:border-white/[0.08] dark:bg-[#181c23] dark:text-slate-300">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>Automatic Balance & Amount Conversion</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Switching currency from <strong>{user?.currency || "INR"}</strong> to <strong>{profile.currency}</strong> will automatically convert all your existing account balances, transactions, budgets, goals, and bills using the exchange rate (<strong>1 {user?.currency || "INR"} ≈ {getEstimatedRate(user?.currency || "INR", profile.currency).toFixed(4)} {profile.currency}</strong>).
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving}>
              Save Profile Settings
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: Security & Sessions */}
      {activeTab === "security" && (
        <div className="mt-4 space-y-5 animate-fade-up">
          {/* Security Posture & Health Overview Banner */}
          {(() => {
            const healthScore = (twoFactorEnabled ? 30 : 0) + (timeoutMins !== "0" ? 25 : 10) + 45;
            const healthGrade = healthScore >= 95 ? "Optimal" : healthScore >= 75 ? "Strong" : "Standard";
            return (
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-white/[0.08] dark:bg-[#15181d] shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06]">
                      <ShieldCheck className="h-6 w-6 stroke-[2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          Account Security Posture
                        </h2>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {healthGrade} Protection ({healthScore}/100)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                        Your Finovo vault is safeguarded with multi-session tokenization, salted password encryption, and real-time session tracking.
                      </p>
                    </div>
                  </div>

                  {/* Micro KPI stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-white/[0.06] dark:bg-[#181c23]">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                        <span>Protected</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-white/[0.06] dark:bg-[#181c23]">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Auto-Lock Guard</div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                        <Clock className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                        <span>{timeoutMins === "0" ? "Disabled" : `${timeoutMins}m Inactivity`}</span>
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-white/[0.06] dark:bg-[#181c23]">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Two-Factor 2FA</div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                        {twoFactorEnabled ? (
                          <>
                            <CheckCheck className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                            <span>Enabled</span>
                          </>
                        ) : (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <span className="text-slate-500 dark:text-slate-400">Recommended</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Card 1: Change Password */}
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06]">
                  <Shield className="h-4.5 w-4.5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Account Password</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Update your master credentials to prevent unauthorized account access.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <Lock className="h-3.5 w-3.5 text-slate-400" /> End-to-End Encrypted
              </span>
            </div>

            <form onSubmit={changePw} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Current Password">
                  <div className="relative">
                    <input
                      className={`${inputCls} pr-10 pl-3.5`}
                      type={showCurrentPw ? "text" : "password"}
                      required
                      value={pw.currentPassword}
                      onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
                      aria-label="Toggle current password visibility"
                    >
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <Field label="New Password">
                  <div className="relative">
                    <input
                      className={`${inputCls} pr-10 pl-3.5`}
                      type={showNewPw ? "text" : "password"}
                      required
                      value={pw.newPassword}
                      onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
                      aria-label="Toggle new password visibility"
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm New Password">
                  <div className="relative">
                    <input
                      className={`${inputCls} pr-10 pl-3.5`}
                      type={showConfirmPw ? "text" : "password"}
                      required
                      value={pw.confirmPassword}
                      onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </div>

              {/* Real-time Password Strength Meter & Requirements */}
              {pw.newPassword.length > 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/[0.08] dark:bg-[#181c23] space-y-3 max-w-2xl">
                  {/* Strength Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Password Strength</span>
                      <span className={`font-bold text-xs ${getPasswordStrength(pw.newPassword).text}`}>
                        {getPasswordStrength(pw.newPassword).label} ({getPasswordStrength(pw.newPassword).score}%)
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <div className={`h-full rounded-full transition-all duration-300 ${pw.newPassword.length >= 8 ? getPasswordStrength(pw.newPassword).color : "bg-transparent"}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${/[A-Z]/.test(pw.newPassword) ? getPasswordStrength(pw.newPassword).color : "bg-transparent"}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${/[a-z]/.test(pw.newPassword) ? getPasswordStrength(pw.newPassword).color : "bg-transparent"}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${/[0-9]/.test(pw.newPassword) || /[^A-Za-z0-9]/.test(pw.newPassword) ? getPasswordStrength(pw.newPassword).color : "bg-transparent"}`} />
                    </div>
                  </div>

                  {/* Checklist Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl transition ${pw.newPassword.length >= 8 ? "bg-slate-100 text-slate-800 dark:bg-white/[0.08] dark:text-slate-200" : "bg-slate-50 text-slate-400 dark:bg-[#15181d] dark:text-slate-500"}`}>
                      {pw.newPassword.length >= 8 ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                      <span>8+ chars</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl transition ${/[A-Z]/.test(pw.newPassword) ? "bg-slate-100 text-slate-800 dark:bg-white/[0.08] dark:text-slate-200" : "bg-slate-50 text-slate-400 dark:bg-[#15181d] dark:text-slate-500"}`}>
                      {/[A-Z]/.test(pw.newPassword) ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                      <span>Uppercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl transition ${/[a-z]/.test(pw.newPassword) ? "bg-slate-100 text-slate-800 dark:bg-white/[0.08] dark:text-slate-200" : "bg-slate-50 text-slate-400 dark:bg-[#15181d] dark:text-slate-500"}`}>
                      {/[a-z]/.test(pw.newPassword) ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                      <span>Lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl transition ${/[0-9]/.test(pw.newPassword) ? "bg-slate-100 text-slate-800 dark:bg-white/[0.08] dark:text-slate-200" : "bg-slate-50 text-slate-400 dark:bg-[#15181d] dark:text-slate-500"}`}>
                      {/[0-9]/.test(pw.newPassword) ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                      <span>Number/Symbol</span>
                    </div>
                  </div>

                  {pw.confirmPassword.length > 0 && (
                    <div className={`flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs font-medium ${pw.newPassword === pw.confirmPassword ? "text-slate-700 dark:text-slate-200" : "text-rose-500"}`}>
                      {pw.newPassword === pw.confirmPassword ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4" />}
                      <span>{pw.newPassword === pw.confirmPassword ? "Passwords match perfectly" : "Passwords do not match yet"}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={changingPw} className="flex items-center gap-2 font-bold px-5 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                  <KeyRound className="h-4 w-4" />
                  <span>Update Password</span>
                </Button>
              </div>
            </form>
          </Card>

          {/* Card 2: Automatic Inactivity Timeout */}
          <Card>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-3.5 max-w-xl">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06]">
                  <Clock className="h-4.5 w-4.5 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Sign out automatically when inactive
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                      Idle Protection
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Automatically invalidates authentication tokens after inactivity or closing the browser to safeguard financial balances on shared workstations.
                  </p>
                </div>
              </div>

              {/* Segmented Quick-Selection Pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-[#181c23] border border-slate-200/80 dark:border-white/[0.08] shrink-0">
                {[
                  { value: "15", label: "15 min", badge: "Recommended" },
                  { value: "30", label: "30 min" },
                  { value: "60", label: "1 hour" },
                  { value: "240", label: "4 hours" },
                  { value: "0", label: "Never" },
                ].map((opt) => {
                  const isSelected = timeoutMins === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleTimeoutChange(opt.value)}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-950 font-bold"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      <span>{opt.label}</span>
                      {opt.badge && !isSelected && (
                        <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300 font-semibold">
                          Best
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Card 3: Two-Factor Authentication (2FA) */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 max-w-xl">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06]">
                  <Fingerprint className="h-4.5 w-4.5 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Two-Factor Authentication (2FA)
                    </h3>
                    {twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Enabled & Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Require a 6-digit TOTP token generated by Google Authenticator, Microsoft Authenticator, or 1Password during login.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                {twoFactorEnabled ? (
                  <Button
                    variant="outline"
                    onClick={handleToggle2FA}
                    className="h-9 px-3.5 text-xs text-rose-600 hover:text-rose-700 hover:border-rose-300 dark:text-rose-400"
                  >
                    Disable 2FA
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleToggle2FA}
                    className="h-9 px-4 text-xs font-bold flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Setup Authenticator App</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Card 4: Active Sessions & Devices */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06]">
                  <Globe className="h-4.5 w-4.5 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Sessions & Devices</h3>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
                      {sessions.length} Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage web browsers and remote devices currently logged into your vault.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={loadSessions}
                  disabled={loadingSessions}
                  className="h-8 px-3 text-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingSessions ? "animate-spin" : ""}`} /> Refresh
                </Button>
                {otherSessionsCount > 0 && (
                  <button
                    type="button"
                    onClick={revokeAllOtherSessions}
                    disabled={revokingAll}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] transition cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log out other devices ({otherSessionsCount})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sessions Cards Container */}
            <div className="mt-4 space-y-3">
              {loadingSessions && sessions.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">Loading active sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">No active session records found.</div>
              ) : (
                sessions.map((sess) => {
                  const isMobile = sess.device === "Mobile";
                  const isTablet = sess.device === "Tablet";
                  const DeviceIcon = isMobile ? Smartphone : isTablet ? Tablet : Laptop;

                  if (sess.isCurrent) {
                    return (
                      <div
                        key={sess.id}
                        className="relative overflow-hidden rounded-2xl border border-slate-300/80 bg-white p-4 dark:border-white/[0.12] dark:bg-[#181c23] shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-3.5">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06]">
                              <DeviceIcon className="h-5 w-5 stroke-[2]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                  {sess.os || "Desktop Device"}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  This device • Active now
                                </span>
                              </div>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{sess.browser || "Web Browser"}</span>
                                  <span>•</span>
                                  <span>{sess.device || "Desktop"}</span>
                                </div>
                                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                                  <Shield className="h-3 w-3 text-slate-400" />
                                  <span>IP: {sess.ipAddress || "127.0.0.1"}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center self-end sm:self-center">
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-white/[0.06] dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Current Session
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={sess.id}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#181c23] dark:hover:border-white/[0.14]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <DeviceIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {sess.os || sess.device}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                ({sess.device})
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>Last active {formatLastActive(sess.lastActive)}</span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[11px]">
                                <Globe className="h-3 w-3 text-slate-400" />
                                <span>{sess.browser}</span>
                                <span>•</span>
                                <span>IP: {sess.ipAddress || "127.0.0.1"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => revokeSession(sess.id)}
                            disabled={revokingId === sess.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 dark:bg-white/[0.06] dark:hover:bg-rose-950/40 border border-slate-200 dark:border-white/[0.08] active:scale-95 transition cursor-pointer disabled:opacity-50"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>{revokingId === sess.id ? "Revoking..." : "Log out"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800/80 dark:bg-[#14181f]/60 dark:text-slate-400">
              <ShieldAlert className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span>
                If you don&apos;t recognise any device or can&apos;t access it any longer, revoke its session immediately and update your master password to protect your finances.
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Notifications */}
      {activeTab === "notifications" && (
        <form onSubmit={saveProfile} className="mt-4 space-y-4 animate-fade-up">
          <Card>
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06]">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
                <p className="text-xs text-slate-500">Configure real-time alerts and financial updates.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["notifyBudget", "Budget Overrun Alerts", "Receive immediate warnings when category spending reaches 80% or exceeds budget limit"],
                ["notifyRecurring", "Upcoming Bill Reminders", "Alerts for scheduled recurring subscriptions and bills due within 7 days"],
                ["notifyGoals", "Savings Milestones", "Celebrate when you reach 25%, 50%, 75% or 100% of a savings goal"],
                ["notifySummary", "Monthly Financial Summary", "Periodic financial recaps analyzing your income, expenses, and savings"],
              ].map(([k, label, desc]) => {
                const isChecked = Boolean(prefs[k as keyof typeof prefs]);
                return (
                  <div
                    key={k}
                    onClick={() => setPrefs({ ...prefs, [k]: !isChecked })}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-3.5 hover:bg-slate-50/50 dark:border-white/[0.08] dark:bg-[#1b1f26] dark:hover:bg-[#20252e] transition cursor-pointer"
                  >
                    <div className="pr-4 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    {/* Professional Sliding Toggle Switch */}
                    <div
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        isChecked ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-[#282f3a]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isChecked ? "translate-x-5 !bg-white dark:!bg-slate-900" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" loading={saving}>
                Save Preferences
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 4: Account & Data Controls */}
      {activeTab === "data" && (
        <div className="mt-4 space-y-4 animate-fade-up">
          {/* Account Overview Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/[0.08] dark:bg-[#15181d]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-13 w-13 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-xs"
                  />
                ) : (
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-lg shadow-xs">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {profile.name || "Finovo User"}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Finovo Pro
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {profile.email}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => handleTabChange("general")}
                className="shrink-0 text-xs h-9 px-3.5 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Edit Profile Preferences →
              </Button>
            </div>
          </div>

          {/* Financial Data Portability (Export & Import) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Export Data Backup */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/[0.08] dark:bg-[#15181d] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06] font-bold">
                    <Download className="h-5 w-5 stroke-[2]" />
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                    JSON Archive
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Export Financial Backup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Download a complete offline copy of your transactions, accounts, categories, budgets, and savings goals.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportBackup}
                  loading={exportingBackup}
                  className="flex-1 text-xs h-9 font-bold cursor-pointer justify-center"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download Backup
                </Button>
                <Link
                  href="/reports"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
                  <span>CSV Reports →</span>
                </Link>
              </div>
            </div>

            {/* Card 2: Restore / Import Backup */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/[0.08] dark:bg-[#15181d] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200 border border-slate-200/60 dark:border-white/[0.06] font-bold">
                    <Upload className="h-5 w-5 stroke-[2]" />
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                    Data Restore
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Restore & Import Backup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Upload a previously saved FinTrack backup file to restore or merge your financial records into your account.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleSelectImportFile}
                />
                <Button
                  variant="outline"
                  onClick={() => importFileRef.current?.click()}
                  className="w-full text-xs h-9 font-bold cursor-pointer justify-center"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Backup File (.json)
                </Button>
              </div>
            </div>
          </div>

          {/* Active Session & Sign Out */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/[0.08] dark:bg-[#15181d]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                  <LogOut className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sign Out of Finovo</h3>
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/[0.08]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active Session
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Terminate your active authenticated session on this browser device.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="shrink-0 text-xs h-9 px-4 font-bold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white border-slate-200 dark:border-white/[0.08] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" /> Log Out
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-rose-200/80 bg-white dark:border-rose-950/60 dark:bg-[#15181d] shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-rose-100 dark:border-rose-950/50 bg-rose-50/40 dark:bg-rose-950/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-rose-500/25">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Danger Zone
                    </h3>
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20">
                      Irreversible
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Critical operations to reset your records or permanently purge your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {/* Action 1: Reset Financial Data */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 mt-0.5 sm:mt-0">
                    <RefreshCw className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Reset Financial Records
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-xl">
                      Deletes all transactions, custom categories, budgets, and recurring bills, while keeping your account login credentials intact.
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setPurgeInput("");
                    setPurgeOpen(true);
                  }}
                  className="shrink-0 h-9 px-4 text-xs font-semibold border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800/80 dark:text-amber-400 dark:hover:bg-amber-950/40 transition cursor-pointer"
                >
                  Reset Records...
                </Button>
              </div>

              {/* Action 2: Delete Entire Account */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-rose-50/30 dark:hover:bg-rose-950/15 transition">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20 mt-0.5 sm:mt-0">
                    <Trash2 className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                      Delete Finovo Account
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-xl">
                      Permanently destroys your user account, active device sessions, and entire monetary history. This action cannot be reversed.
                    </p>
                  </div>
                </div>

                <Button
                  variant="danger"
                  onClick={() => {
                    setDeletePassword("");
                    setDeleteOpen(true);
                  }}
                  className="shrink-0 h-9 px-4 text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Delete Account...
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purge Data Modal */}
      <Modal open={purgeOpen} onClose={() => setPurgeOpen(false)} title="Reset Financial Data">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <p>
              This will permanently delete all your logged transactions, recurring bills, category budgets, and savings goals. Account login details will be preserved.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Type <span className="font-mono font-bold text-rose-600">RESET DATA</span> to confirm:
            </label>
            <input
              type="text"
              value={purgeInput}
              onChange={(e) => setPurgeInput(e.target.value)}
              placeholder="RESET DATA"
              className={inputCls}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setPurgeOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handlePurgeData}
              loading={purging}
              disabled={purgeInput.trim() !== "RESET DATA"}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Finovo Account">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            <p>
              <strong>Warning:</strong> Your account, profile, all financial data, and active sessions will be permanently purged from the server immediately.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Enter your current password to authorize permanent deletion:
            </label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your current password"
              className={inputCls}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={deleting}
              disabled={!deletePassword}
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import / Restore Backup Modal */}
      <Modal open={importModalOpen} onClose={() => setImportModalOpen(false)} title="Restore Financial Archive">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-cyan-500/10 p-3.5 text-xs text-cyan-800 dark:text-cyan-300 border border-cyan-500/20">
            <Upload className="h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Valid Finovo archive detected ({importParsed?.app} v{importParsed?.version})
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Exported: {formatLastActive(importParsed?.exportedAt)}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] p-3.5 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Discovered Records in File
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]">
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {importParsed?.counts.transactions ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Transactions</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]">
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {importParsed?.counts.categories ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Categories</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]">
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {importParsed?.counts.accounts ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Accounts</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              Existing categories and transactions will not be overwritten. New records will be safely inserted into your active workspace.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={executeImport}
              loading={importing}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold"
            >
              Restore & Ingest Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Avatar Gallery Modal */}
      <Modal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        title="Select Profile Avatar"
        wide
      >
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an avatar preset or upload a custom photo for your Finovo profile.
            </p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white/10 dark:text-white dark:border dark:border-white/10 font-bold hover:bg-slate-800 dark:hover:bg-emerald-400 cursor-pointer transition shadow-xs shrink-0">
              <Camera className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Upload Custom Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFileUpload(e);
                  setAvatarModalOpen(false);
                }}
              />
            </label>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-fit text-xs font-medium">
            {[
              { id: "all", label: "All (16)" },
              { id: "personas", label: "Portraits" },
              { id: "bots", label: "AI & Tech" },
              { id: "shapes", label: "Creative" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAvatarCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-bold ${
                  avatarCategory === tab.id
                    ? "bg-white text-slate-900 shadow-xs dark:bg-[#181c22] dark:text-emerald-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Avatar Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {/* Initials Badge Card */}
            {(avatarCategory === "all" || avatarCategory === "personas") && (
              <button
                type="button"
                onClick={() => {
                  setProfile({ ...profile, avatarUrl: "" });
                  toast("Switched to Initials badge");
                }}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-center group ${
                  !profile.avatarUrl
                    ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 ring-2 ring-emerald-500/30"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40"
                }`}
              >
                <div className="relative mb-2.5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white/[0.08] dark:border dark:border-white/10 dark:text-emerald-400 font-semibold text-xl shadow-xs group-hover:scale-105 transition-transform">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  {!profile.avatarUrl && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white/10 dark:text-white dark:border dark:border-white/10 font-bold shadow-xs">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Initials Badge</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Classic Default</div>
              </button>
            )}

            {/* Presets */}
            {PRESET_AVATARS.filter(
              (a) => avatarCategory === "all" || a.category === avatarCategory
            ).map((a) => {
              const isSelected = profile.avatarUrl === a.url;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setProfile({ ...profile, avatarUrl: a.url });
                    toast(`Avatar set to ${a.name}! ✨`);
                  }}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-center group ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-xs"
                      : "border-slate-200/80 dark:border-slate-800 hover:border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40"
                  }`}
                >
                  <div className="relative mb-2.5">
                    <img
                      src={a.url}
                      alt={a.name}
                      className="h-14 w-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white/10 dark:text-white dark:border dark:border-white/10 font-bold shadow-xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-full">
                    {a.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-full">
                    {a.role}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {profile.avatarUrl ? (
              <button
                type="button"
                onClick={() => {
                  setProfile({ ...profile, avatarUrl: "" });
                  toast("Reset to Initials badge");
                }}
                className="text-xs font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              >
                Reset to Initials
              </button>
            ) : (
              <span />
            )}
            <Button variant="primary" onClick={() => setAvatarModalOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Two-Factor Authentication Setup Modal */}
      <Modal
        open={twoFactorModalOpen}
        onClose={() => setTwoFactorModalOpen(false)}
        title="Setup Two-Factor Authentication (2FA)"
      >
        <form onSubmit={handleConfirm2FA} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Scan this QR code with Google Authenticator, Microsoft Authenticator, or 1Password to link your account.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/[0.08] dark:bg-[#181c23]">
            {/* Real Scannable Authenticator QR Code */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-xs border border-slate-200/90 shrink-0">
              <div className="relative flex h-32 w-32 items-center justify-center bg-white rounded-xl overflow-hidden p-1">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Finovo Authenticator TOTP QR Code"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                    <span className="text-[10px] font-bold">Generating QR...</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-500 mt-1.5 uppercase tracking-wider">
                Scan with App
              </span>
            </div>

            {/* Secret Key & Instructions (Overflow-proof & Neutral) */}
            <div className="space-y-2.5 w-full min-w-0">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Can&apos;t scan? Enter Secret Manually:
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0 rounded-xl border border-slate-200/90 bg-white px-3 py-2 dark:border-white/[0.08] dark:bg-[#15181d]">
                  <div className="font-mono text-xs sm:text-[13px] font-bold tracking-widest text-slate-900 dark:text-slate-200 select-all whitespace-nowrap overflow-x-auto no-scrollbar" title={twoFactorSecret}>
                    {twoFactorSecret.match(/.{1,4}/g)?.join(" ")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(twoFactorSecret);
                    setCopiedSecret(true);
                    toast("Secret key copied to clipboard! 📋");
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:text-slate-900 dark:border-white/[0.08] dark:bg-[#15181d] dark:text-slate-300 dark:hover:text-white cursor-pointer transition shadow-2xs"
                  title="Copy Secret"
                >
                  {copiedSecret ? <Check className="h-4 w-4 text-emerald-500 stroke-[2.5]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                <p>Account: <strong className="text-slate-700 dark:text-slate-300">{user?.email || "user@finovo.app"}</strong></p>
                <p>Issuer: <strong className="text-slate-700 dark:text-slate-300">Finovo</strong> • 6 Digits • 30-sec refresh</p>
              </div>
            </div>
          </div>

          {/* 6-Digit OTP Box Grid (Neutral & Focused) */}
          <div className="space-y-2.5 pt-1">
            <style>{`
              @keyframes otpCaretBlink {
                0%, 49% { opacity: 1; }
                50%, 100% { opacity: 0; }
              }
            `}</style>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center">
              Verification Code
            </label>
            
            <div className="relative cursor-text" onClick={() => otpInputRef.current?.focus()}>
              {/* Invisible native input to capture keyboard & paste */}
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                value={twoFactorCode}
                onFocus={() => setIsOtpFocused(true)}
                onBlur={() => setIsOtpFocused(false)}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer text-transparent selection:bg-transparent"
                autoFocus
              />

              {/* 6 High-Contrast Neutral OTP Digit Cells */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const digit = twoFactorCode[index];
                  const isCurrent = twoFactorCode.length === index;
                  return (
                    <div
                      key={index}
                      className={`relative flex h-12 w-10 sm:h-14 sm:w-12 items-center justify-center rounded-2xl border text-xl font-mono font-bold transition-all ${
                        digit
                          ? "border-slate-400 bg-white text-slate-900 dark:border-white/30 dark:bg-[#1c212a] dark:text-white shadow-xs"
                          : isCurrent && isOtpFocused
                          ? "border-slate-400 bg-white dark:border-white/40 dark:bg-[#181c23] text-slate-900 dark:text-white ring-1 ring-slate-300 dark:ring-white/10"
                          : "border-slate-200/90 bg-slate-50/80 text-slate-400 dark:border-white/[0.08] dark:bg-[#1a1e24]"
                      }`}
                    >
                      {digit ? (
                        <span>{digit}</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-sm font-sans">•</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Enter the 6-digit code shown in your authenticator app to confirm setup.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setTwoFactorModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={enablingTwoFactor}
              disabled={twoFactorCode.length < 6}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Verify & Activate 2FA
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
