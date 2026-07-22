interface Window {
  electron?: {
    getAppVersion: () => Promise<string>;
    checkForUpdates: () => Promise<{ success: boolean; updateInfo?: unknown; error?: string }>;
    onUpdateAvailable: (callback: (event: Event) => void) => void;
    onUpdateNotAvailable: (callback: (event: Event) => void) => void;
    onUpdateDownloaded: (callback: (event: Event) => void) => void;
    onUpdateError: (callback: (event: Event, message: string) => void) => void;
    removeAllListeners: (channel: string) => void;
  };
}
