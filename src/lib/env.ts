import * as dotenv from 'dotenv';
import * as fs from 'fs';

/**
 * 環境變數載入與驗證
 */

// 載入 .env 檔案到 process.env
dotenv.config();

/**
 * 必要的環境變數清單
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GCP_PROJECT_ID',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'GCS_BUCKET_NAME',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'REDIS_URL',
  'JWT_SECRET',
] as const;

/**
 * 可選的環境變數清單
 */
const OPTIONAL_ENV_VARS = [
  'PORT',
  'FRONTEND_URL',
  'MONTHLY_BUDGET',
  'COST_ALERT_THRESHOLD',
] as const;

/**
 * 檢查環境變數是否已設定
 */
export function checkEnvVars(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // 檢查必要變數
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // 檢查可選變數 (只發出警告,不影響 valid)
  for (const varName of OPTIONAL_ENV_VARS) {
    if (!process.env[varName]) {
      warnings.push(`可選變數 ${varName} 未設定,將使用預設值`);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 檢查檔案是否存在
 */
export function checkFileExists(filepath: string): boolean {
  try {
    return fs.existsSync(filepath);
  } catch {
    return false;
  }
}

/**
 * 驗證 GCP Service Account JSON
 */
export function validateGCPCredentials(): {
  valid: boolean;
  error?: string;
} {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credPath) {
    return { valid: false, error: 'GOOGLE_APPLICATION_CREDENTIALS 未設定' };
  }

  if (!checkFileExists(credPath)) {
    return {
      valid: false,
      error: `GCP 金鑰檔案不存在: ${credPath}`,
    };
  }

  try {
    const content = fs.readFileSync(credPath, 'utf-8');
    const json = JSON.parse(content);

    // 檢查 Service Account JSON 的必要欄位
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    for (const field of requiredFields) {
      if (!json[field]) {
        return {
          valid: false,
          error: `GCP 金鑰檔案缺少欄位: ${field}`,
        };
      }
    }

    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: `無法解析 GCP 金鑰檔案: ${error.message}`,
    };
  }
}

/**
 * 驗證 API Key 格式
 */
export function validateAPIKeys(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // OpenAI API Key 應該以 sk- 開頭
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY 格式錯誤 (應該以 sk- 開頭)');
  }

  // Gemini API Key 應該以 AI 開頭
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.startsWith('AI')) {
    errors.push('GEMINI_API_KEY 格式錯誤 (應該以 AI 開頭)');
  }

  // Supabase URL 應該包含 supabase.co
  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    errors.push('SUPABASE_URL 格式錯誤 (應該包含 supabase.co)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 完整的環境驗證
 */
export function validateEnvironment(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // 1. 檢查環境變數是否設定
  const envCheck = checkEnvVars();
  if (!envCheck.valid) {
    allErrors.push(`缺少必要的環境變數: ${envCheck.missing.join(', ')}`);
  }
  allWarnings.push(...envCheck.warnings);

  // 2. 驗證 GCP 金鑰檔案
  const gcpCheck = validateGCPCredentials();
  if (!gcpCheck.valid) {
    allErrors.push(gcpCheck.error!);
  }

  // 3. 驗證 API Key 格式
  const apiKeyCheck = validateAPIKeys();
  if (!apiKeyCheck.valid) {
    allErrors.push(...apiKeyCheck.errors);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
