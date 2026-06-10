import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

/* In-app dialogs in the sessions design language — a single, calm glass
   card that replaces the browser's native confirm()/prompt() chrome.
   Imperative async API so call sites read like the native ones they
   replace: `if (await confirm({...}))` / `const name = await prompt({...})`. */

type ConfirmOpts = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type PromptOpts = {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
};

interface DialogsApi {
  confirm: (o: ConfirmOpts) => Promise<boolean>;
  prompt: (o: PromptOpts) => Promise<string | null>;
}

const DialogsContext = createContext<DialogsApi | null>(null);

export function useDialogs(): DialogsApi {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error("useDialogs must be used within <DialogProvider>");
  return ctx;
}

type Req =
  | ({ kind: "confirm"; resolve: (v: boolean) => void } & ConfirmOpts)
  | ({ kind: "prompt"; resolve: (v: string | null) => void } & PromptOpts);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<Req | null>(null);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const confirm = useCallback(
    (o: ConfirmOpts) =>
      new Promise<boolean>((resolve) => setReq({ kind: "confirm", resolve, ...o })),
    []
  );
  const prompt = useCallback(
    (o: PromptOpts) =>
      new Promise<string | null>((resolve) => {
        setValue(o.defaultValue ?? "");
        setReq({ kind: "prompt", resolve, ...o });
      }),
    []
  );

  const close = useCallback(
    (result: boolean | string | null) => {
      if (!req) return;
      if (req.kind === "confirm") req.resolve(result as boolean);
      else req.resolve(result as string | null);
      setReq(null);
    },
    [req]
  );

  const accept = useCallback(() => {
    if (!req) return;
    if (req.kind === "prompt") {
      const v = value.trim();
      close(v ? v : null);
    } else {
      close(true);
    }
  }, [req, value, close]);

  const cancel = useCallback(() => {
    close(req?.kind === "prompt" ? null : false);
  }, [req, close]);

  // focus the input / autofocus when a prompt opens; key handling while open
  useEffect(() => {
    if (!req) return;
    if (req.kind === "prompt") {
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [req]);

  useEffect(() => {
    if (!req) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      } else if (e.key === "Enter" && req.kind === "confirm") {
        e.preventDefault();
        accept();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [req, cancel, accept]);

  return (
    <DialogsContext.Provider value={{ confirm, prompt }}>
      {children}
      {req && (
        <div className="ss-ov" onMouseDown={cancel}>
          <div className="ss-dlg" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="dlg-kick">{req.kind === "prompt" ? "Input" : "Confirm"}</div>
            <h3>{req.title}</h3>
            {req.message && <p>{req.message}</p>}
            {req.kind === "prompt" && (
              <input
                ref={inputRef}
                className="dlg-inp"
                value={value}
                placeholder={req.placeholder}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    accept();
                  }
                }}
              />
            )}
            <div className="ss-dlg-actions">
              <button className="ss-btn ss-btn-ghost" onClick={cancel}>
                {req.cancelText ?? "Cancel"}
              </button>
              <button
                className={"ss-btn " + (req.kind === "confirm" && req.danger ? "ss-btn-danger" : "ss-btn-primary")}
                onClick={accept}
              >
                {req.confirmText ?? (req.kind === "prompt" ? "Save" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogsContext.Provider>
  );
}
