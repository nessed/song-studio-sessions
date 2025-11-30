import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import { useExportData } from "@/hooks/useExportData";
import { toast } from "sonner";
import { User, Download, Moon, Sun, ArrowLeft } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { exportAllData } = useExportData();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
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
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          
          <button onClick={toggleTheme} className="btn-icon">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold mb-8 animate-fade-in">Settings</h1>

        <div className="space-y-8 animate-slide-up">
          {/* Profile Section */}
          <section className="glass-panel-subtle p-6">
            <h2 className="text-lg font-medium mb-6">Profile</h2>

            <div className="flex items-start gap-6 mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </button>

              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  {user?.email}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-foreground hover:underline"
                >
                  Change photo
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="input-minimal"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </section>

          {/* Data Export Section */}
          <section className="glass-panel-subtle p-6">
            <h2 className="text-lg font-medium mb-4">Export Data</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Download all your data including projects, songs, tasks, notes, and lyrics as a JSON file.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exporting..." : "Export my data"}
            </button>
          </section>

          {/* Sign Out */}
          <section className="glass-panel-subtle p-6">
            <h2 className="text-lg font-medium mb-4">Account</h2>
            <button
              onClick={handleSignOut}
              className="text-sm text-destructive hover:underline"
            >
              Sign out
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}