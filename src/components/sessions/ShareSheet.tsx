import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink, Globe, X } from "lucide-react";
import { toast } from "sonner";

/* The share surface in the sessions design language — a calm glass card
   that replaces the bare "link copied" toast. Publishes a public link,
   shows it, copies it, and offers to open the share view in a new tab. */

interface ShareSheetProps {
  title: string;
  isPublic: boolean;
  shareHash: string | null;
  /* enable/disable the public link; returns the live hash (or null on failure) */
  onSetPublic: (enabled: boolean) => Promise<string | null>;
  onClose: () => void;
}

export function ShareSheet({ title, isPublic: initialPublic, shareHash: initialHash, onSetPublic, onClose }: ShareSheetProps) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [hash, setHash] = useState(initialHash);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const base = typeof window !== "undefined" ? window.location.origin : "";
  const url = hash ? `${base}/s/${hash}` : "";

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const toggle = async () => {
    if (busy) return;
    const next = !isPublic;
    setBusy(true);
    const res = await onSetPublic(next);
    setBusy(false);
    if (next && !res) {
      toast.error("Couldn't publish — try again");
      return;
    }
    setIsPublic(next);
    if (res) setHash(res);
    toast.success(next ? "Public link enabled" : "Public link disabled");
  };

  const copy = () => {
    if (!url) return;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast.success("Link copied");
  };

  return (
    <div className="ss-ov" onMouseDown={onClose}>
      <div className="ss-dlg share-dlg" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <button className="dlg-x" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <div className="dlg-kick">Share</div>
        <h3>{title}</h3>
        <p>Publish a public link so anyone can listen and leave timestamped feedback — no account needed.</p>

        <button className="share-toggle" onClick={toggle} disabled={busy} data-on={isPublic}>
          <span className="st-ic">
            <Globe size={15} />
          </span>
          <span className="st-txt">
            <span className="st-t">{isPublic ? "Public link is on" : "Public link is off"}</span>
            <span className="st-s">
              {isPublic ? "Anyone with the link can listen" : "Only you can see this song"}
            </span>
          </span>
          <span className={"st-sw" + (isPublic ? " on" : "")}>
            <i />
          </span>
        </button>

        {isPublic && url && (
          <div className="share-reveal">
            <div className="share-field">
              <span className="share-url" title={url}>
                {url}
              </span>
              <button className="ss-icbtn" onClick={copy} aria-label="Copy link" title="Copy link">
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
            <a className="share-open" href={url} target="_blank" rel="noreferrer">
              Open share view in new tab <ExternalLink size={13} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
