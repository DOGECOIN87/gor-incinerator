/// <reference types="vite/client" />

interface Window {
  Buffer: typeof Buffer;
  backpack?: any;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_LOGO: string;
  readonly VITE_ANALYTICS_ENDPOINT: string;
  readonly VITE_ANALYTICS_WEBSITE_ID: string;
  readonly VITE_FEE_RECIPIENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
