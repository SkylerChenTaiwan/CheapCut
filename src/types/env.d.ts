/**
 * 環境變數型別定義
 * 提供 TypeScript 型別檢查
 *
 * 為什麼需要這個?
 * - TypeScript 預設不知道 process.env 有哪些變數
 * - 定義型別後,編輯器會自動提示可用的環境變數
 * - 避免打錯變數名稱 (例如 OPENAI_KEY vs OPENAI_API_KEY)
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Node.js
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;

      // Database
      DATABASE_URL: string;
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;

      // Google Cloud
      GCP_PROJECT_ID: string;
      GOOGLE_APPLICATION_CREDENTIALS: string;
      GCS_BUCKET_NAME: string;

      // OpenAI
      OPENAI_API_KEY: string;

      // Gemini
      GEMINI_API_KEY: string;

      // Redis
      REDIS_URL: string;

      // Frontend
      FRONTEND_URL: string;

      // JWT
      JWT_SECRET: string;

      // Cost tracking (可選)
      MONTHLY_BUDGET?: string;
      COST_ALERT_THRESHOLD?: string;
    }
  }
}

export {};
