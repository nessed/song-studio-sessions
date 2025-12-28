import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import { useExportData } from "@/hooks/useExportData";
import { toast } from "sonner";
import { User, Download, Moon, Sun, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { exportAllData } = useExportData();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({ display_name: displayName });
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadAvatar(file);
    if (url) {
      toast.success("Avatar updated");
    } else {
      toast.error("Failed to upload avatar");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAllData();
      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
    setExporting(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Failed to sign out", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[150px]" 
          style={{ background: 'var(--accent-subtle, rgba(124,58,237,0.1))' }} 
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.04]">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        
        <button 
          onClick={toggleTheme} 
          className="p-2.5 text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            className="text-2xl sm:text-3xl font-bold mb-8"
            style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
          >
            Settings
          </h1>

          <div className="space-y-6">
            {/* Profile Section */}
            <section className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-6">
              <h2 className="text-lg font-medium mb-6 text-white/90">Profile</h2>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden hover:border-white/20 transition-colors"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white/30" />
                  )}
                </button>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-white/50 mb-2">
                    {user?.email}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    Change photo
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">
                    Display name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 text-sm bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-white text-black rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </section>

            {/* Data Export Section */}
            <section className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-6">
              <h2 className="text-lg font-medium mb-4 text-white/90">Export Data</h2>
              <p className="text-sm text-white/40 mb-4">
                Download all your data including projects, songs, tasks, notes, and lyrics as a JSON file.
              </p>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Exporting..." : "Export my data"}
              </button>
            </section>

            {/* Sign Out */}
            <section className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-6">
              <h2 className="text-lg font-medium mb-4 text-white/90">Account</h2>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-60"
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
