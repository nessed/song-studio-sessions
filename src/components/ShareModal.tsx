
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Globe, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { Song } from "@/lib/types";

interface ShareModalProps {
  song: Song;
  onUpdate: () => void;
  trigger?: React.ReactNode;
}

const generateHash = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function ShareModal({ song, onUpdate, trigger }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPublic = song.is_public || false;
  const shareHash = song.share_hash;

  // Construct the public link
  // Use window.location.origin to get the current domain (localhost or production)
  const shareUrl = shareHash 
    ? `${window.location.origin}/s/${shareHash}` 
    : "Link not generated";

  const togglePublic = async (enabled: boolean) => {
    setLoading(true);
    try {
      let updates: any = { is_public: enabled };
      
      // Generate hash if enabling and none exists
      if (enabled && !shareHash) {
        updates.share_hash = generateHash(12);
      }

      const { error } = await supabase
        .from("songs")
        .update(updates)
        .eq("id", song.id);

      if (error) throw error;
      
      onUpdate();
      toast.success(enabled ? "Public link enabled" : "Public link disabled");
    } catch (err: any) {
      toast.error(`Failed to update: ${err.message || "Unknown error"}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareHash) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-white/70 transition-colors">
            <Globe className="w-3 h-3" />
            Share
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#09090b] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold font-syne">
             <Globe className="w-5 h-5 text-emerald-400" />
             Public Sharing
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
           {/* Main Toggle */}
           <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="space-y-1">
                 <Label className="text-base font-medium text-white">Enable Public Link</Label>
                 <p className="text-xs text-white/50">
                    Anyone with the link can view and play this song.
                 </p>
              </div>
              <Switch 
                 checked={isPublic} 
                 onCheckedChange={togglePublic}
                 disabled={loading}
                 className="data-[state=checked]:bg-emerald-500"
              />
           </div>

           {/* Link Display */}
           {isPublic && (
             <div className="space-y-3 animate-fade-in">
                <Label className="text-xs uppercase tracking-widest text-white/40 font-bold">
                   Shareable Link
                </Label>
                <div className="flex items-center gap-2">
                   <div className="flex-1 relative">
                      <Input 
                        value={shareUrl} 
                        readOnly 
                        className="bg-black/50 border-white/10 text-white/70 font-mono text-xs h-10 pr-10"
                      />
                      <div className="absolute inset-0 bg-transparent cursor-text" onClick={(e) => (e.target as any).previousSibling?.select()} />
                   </div>
                   <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={copyToClipboard}
                      className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white shrink-0"
                   >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                   </Button>
                </div>
                <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center">
                   Verified clean link. No login required for visitors.
                </div>
             </div>
           )}

           {!isPublic && (
              <div className="flex flex-col items-center justify-center p-6 text-center text-white/30 space-y-2">
                 <Lock className="w-8 h-8 opacity-50" />
                 <p className="text-sm">This song is currently private.</p>
              </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
