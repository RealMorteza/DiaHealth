import { supabase } from '../supabaseclient.js';

const ALLOWED_QUESTIONNAIRE_USERS = new Set(['09154184247', '09364323736']);
const SETTING_KEY = 'questionnaire_enabled';

function normalizeUsername(value) {
  return String(value || '')
    .trim()
    .split('@')[0]
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[\s-]/g, '');
}

export function canManageQuestionnaire(...usernames) {
  return usernames.some((username) => ALLOWED_QUESTIONNAIRE_USERS.has(normalizeUsername(username)));
}

export function questionnaireErrorMessage(error, action = 'دریافت') {
  if (error?.code === 'PGRST205' || error?.code === '42P01') {
    return 'تنظیمات پرسشنامه در سرور نصب نشده است. فایل SQL راه‌اندازی را اجرا کنید.';
  }
  if (error?.code === 'PGRST116') {
    return 'تنظیم پرسشنامه در سرور پیدا نشد یا دسترسی به آن وجود ندارد.';
  }
  if (error?.code === '42501' || error?.status === 401 || error?.status === 403) {
    return 'حساب شما مجوز تغییر تنظیم پرسشنامه را ندارد.';
  }
  if (error?.message === 'Failed to fetch' || error instanceof TypeError) {
    return 'ارتباط با سرور برقرار نشد. اینترنت خود را بررسی کنید.';
  }
  return `${action} وضعیت پرسشنامه انجام نشد. دوباره تلاش کنید.`;
}

export function createQuestionnaireService(client) {
  return {
    async getEnabled() {
      const { data, error } = await client
        .from('app_settings')
        .select('enabled')
        .eq('key', SETTING_KEY)
        .single();

      if (error) throw error;
      if (typeof data?.enabled !== 'boolean') {
        throw Object.assign(new Error('Questionnaire setting is missing or invalid.'), { code: 'PGRST116' });
      }
      return data.enabled;
    },

    async setEnabled(enabled) {
      if (typeof enabled !== 'boolean') throw new TypeError('enabled must be a boolean');

      const { data, error } = await client
        .from('app_settings')
        .update({ enabled })
        .eq('key', SETTING_KEY)
        .select('enabled')
        .single();

      if (error) throw error;
      if (data?.enabled !== enabled) {
        throw Object.assign(new Error('Questionnaire setting was not saved.'), { code: 'PGRST116' });
      }
      return data.enabled;
    },
  };
}

const questionnaireService = createQuestionnaireService(supabase);
export const getQuestionnaireEnabled = questionnaireService.getEnabled;
export const setQuestionnaireEnabled = questionnaireService.setEnabled;
