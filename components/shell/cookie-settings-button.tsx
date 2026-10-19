"use client";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="text-sm text-muted-foreground hover-fine:hover:text-foreground"
      onClick={() => window.dispatchEvent(new Event("ss-cookie-settings"))}
    >
      Cookie settings
    </button>
  );
}
