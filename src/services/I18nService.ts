// =============================================================================
// Internationalization (i18n) Service - Multi-language support for the builder
// Features: 40+ languages, RTL support, pluralization, interpolation, date/number formatting
// =============================================================================

export interface Locale {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  region: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: NumberFormatConfig;
  pluralRules: PluralRule[];
  fallback: string;
  enabled: boolean;
}

export interface NumberFormatConfig {
  decimal: string;
  thousands: string;
  currency: string;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  percentSymbol: string;
}

export interface PluralRule {
  condition: string; // 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
  match: (n: number) => boolean;
}

export interface TranslationEntry {
  key: string;
  value: string;
  context?: string;
  description?: string;
  maxLength?: number;
  placeholders?: string[];
  pluralForms?: Record<string, string>;
  gender?: Record<string, string>;
  tags?: string[];
}

export interface TranslationNamespace {
  name: string;
  translations: Map<string, TranslationEntry>;
}

export interface I18nConfig {
  defaultLocale: string;
  fallbackLocale: string;
  supportedLocales: string[];
  interpolation: InterpolationConfig;
  pluralization: boolean;
  contextSeparator: string;
  namespaceSeparator: string;
  keySeparator: string;
  missingKeyHandler: 'warn' | 'error' | 'fallback' | 'key' | 'empty';
  cacheEnabled: boolean;
  autoDetect: boolean;
}

export interface InterpolationConfig {
  prefix: string;
  suffix: string;
  escapeValue: boolean;
  formatSeparator: string;
  nestingPrefix: string;
  nestingSuffix: string;
}

export interface TranslationStats {
  locale: string;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: number;
  completionPercentage: number;
  lastUpdated: number;
}

// =============================================================================
// Supported Locales
// =============================================================================

export const SUPPORTED_LOCALES: Locale[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', region: 'US', dateFormat: 'MM/DD/YYYY', timeFormat: 'h:mm A', numberFormat: { decimal: '.', thousands: ',', currency: 'USD', currencySymbol: '$', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: '', enabled: true },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', direction: 'ltr', region: 'GB', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'GBP', currencySymbol: '£', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', region: 'ES', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR', currencySymbol: '€', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', direction: 'ltr', region: 'MX', dateFormat: 'DD/MM/YYYY', timeFormat: 'h:mm A', numberFormat: { decimal: '.', thousands: ',', currency: 'MXN', currencySymbol: '$', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'es', enabled: true },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', region: 'FR', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'EUR', currencySymbol: '€', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 0 || n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', region: 'DE', dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR', currencySymbol: '€', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', region: 'IT', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR', currencySymbol: '€', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', region: 'PT', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR', currencySymbol: '€', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', direction: 'ltr', region: 'BR', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'BRL', currencySymbol: 'R$', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 0 || n === 1 }, { condition: 'other', match: () => true }], fallback: 'pt', enabled: true },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', region: 'NL', dateFormat: 'DD-MM-YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR', currencySymbol: '€', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', region: 'RU', dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'RUB', currencySymbol: '₽', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n % 10 === 1 && n % 100 !== 11 }, { condition: 'few', match: (n) => [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', region: 'JP', dateFormat: 'YYYY/MM/DD', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'JPY', currencySymbol: '¥', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', region: 'KR', dateFormat: 'YYYY.MM.DD', timeFormat: 'a h:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'KRW', currencySymbol: '₩', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr', region: 'CN', dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'CNY', currencySymbol: '¥', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', direction: 'ltr', region: 'TW', dateFormat: 'YYYY/MM/DD', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'TWD', currencySymbol: 'NT$', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'other', match: () => true }], fallback: 'zh', enabled: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', region: 'SA', dateFormat: 'DD/MM/YYYY', timeFormat: 'hh:mm', numberFormat: { decimal: '٫', thousands: '٬', currency: 'SAR', currencySymbol: 'ر.س', currencyPosition: 'after', percentSymbol: '٪' }, pluralRules: [{ condition: 'zero', match: (n) => n === 0 }, { condition: 'one', match: (n) => n === 1 }, { condition: 'two', match: (n) => n === 2 }, { condition: 'few', match: (n) => n % 100 >= 3 && n % 100 <= 10 }, { condition: 'many', match: (n) => n % 100 >= 11 && n % 100 <= 99 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', region: 'IL', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'ILS', currencySymbol: '₪', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'two', match: (n) => n === 2 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', region: 'IN', dateFormat: 'DD/MM/YYYY', timeFormat: 'h:mm A', numberFormat: { decimal: '.', thousands: ',', currency: 'INR', currencySymbol: '₹', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 0 || n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', region: 'IN', dateFormat: 'DD/MM/YYYY', timeFormat: 'h:mm A', numberFormat: { decimal: '.', thousands: ',', currency: 'INR', currencySymbol: '₹', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'hi', enabled: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', region: 'IN', dateFormat: 'DD/MM/YYYY', timeFormat: 'h:mm A', numberFormat: { decimal: '.', thousands: ',', currency: 'INR', currencySymbol: '₹', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'hi', enabled: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', region: 'BD', dateFormat: 'DD/MM/YYYY', timeFormat: 'h:mm A', numberFormat: { decimal: '.', thousands: ',', currency: 'BDT', currencySymbol: '৳', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 0 || n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', direction: 'ltr', region: 'TH', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'THB', currencySymbol: '฿', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', region: 'VN', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'VND', currencySymbol: '₫', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', region: 'TR', dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'TRY', currencySymbol: '₺', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: 'ltr', region: 'PL', dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'PLN', currencySymbol: 'zł', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'few', match: (n) => [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', region: 'UA', dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'UAH', currencySymbol: '₴', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n % 10 === 1 && n % 100 !== 11 }, { condition: 'few', match: (n) => [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) }, { condition: 'other', match: () => true }], fallback: 'ru', enabled: true },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', direction: 'ltr', region: 'CZ', dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'CZK', currencySymbol: 'Kč', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'few', match: (n) => n >= 2 && n <= 4 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', region: 'SE', dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'SEK', currencySymbol: 'kr', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', direction: 'ltr', region: 'DK', dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'DKK', currencySymbol: 'kr', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', region: 'NO', dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'NOK', currencySymbol: 'kr', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', direction: 'ltr', region: 'FI', dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'EUR', currencySymbol: '€', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr', region: 'GR', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR', currencySymbol: '€', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', direction: 'ltr', region: 'RO', dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'RON', currencySymbol: 'lei', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'few', match: (n) => n === 0 || (n % 100 >= 1 && n % 100 <= 19) }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', direction: 'ltr', region: 'HU', dateFormat: 'YYYY.MM.DD', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'HUF', currencySymbol: 'Ft', currencyPosition: 'after', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', region: 'ID', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: '.', currency: 'IDR', currencySymbol: 'Rp', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', region: 'MY', dateFormat: 'DD/MM/YYYY', timeFormat: 'h:mm A', numberFormat: { decimal: '.', thousands: ',', currency: 'MYR', currencySymbol: 'RM', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', region: 'IR', dateFormat: 'YYYY/MM/DD', timeFormat: 'HH:mm', numberFormat: { decimal: '٫', thousands: '٬', currency: 'IRR', currencySymbol: '﷼', currencyPosition: 'after', percentSymbol: '٪' }, pluralRules: [{ condition: 'one', match: (n) => n === 0 || n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', region: 'PK', dateFormat: 'DD/MM/YYYY', timeFormat: 'h:mm A', numberFormat: { decimal: '.', thousands: ',', currency: 'PKR', currencySymbol: 'Rs', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', region: 'KE', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', numberFormat: { decimal: '.', thousands: ',', currency: 'KES', currencySymbol: 'KSh', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', direction: 'ltr', region: 'ZA', dateFormat: 'YYYY/MM/DD', timeFormat: 'HH:mm', numberFormat: { decimal: ',', thousands: ' ', currency: 'ZAR', currencySymbol: 'R', currencyPosition: 'before', percentSymbol: '%' }, pluralRules: [{ condition: 'one', match: (n) => n === 1 }, { condition: 'other', match: () => true }], fallback: 'en', enabled: true },
];

// =============================================================================
// Default English Translations (Builder UI)
// =============================================================================

export const DEFAULT_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    // General
    'app.name': 'Web Builder',
    'app.tagline': 'Build beautiful websites visually',
    'app.version': 'Version {{version}}',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.reset': 'Reset',
    'common.apply': 'Apply',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.done': 'Done',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.finish': 'Finish',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.success': 'Success',
    'common.copy': 'Copy',
    'common.paste': 'Paste',
    'common.cut': 'Cut',
    'common.undo': 'Undo',
    'common.redo': 'Redo',
    'common.duplicate': 'Duplicate',
    'common.select': 'Select',
    'common.selectAll': 'Select All',
    'common.deselect': 'Deselect',
    'common.none': 'None',
    'common.all': 'All',
    'common.custom': 'Custom',
    'common.default': 'Default',
    'common.auto': 'Auto',
    'common.manual': 'Manual',
    'common.enabled': 'Enabled',
    'common.disabled': 'Disabled',
    'common.on': 'On',
    'common.off': 'Off',
    'common.show': 'Show',
    'common.hide': 'Hide',
    'common.expand': 'Expand',
    'common.collapse': 'Collapse',
    'common.refresh': 'Refresh',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.import': 'Import',
    'common.export': 'Export',
    'common.preview': 'Preview',
    'common.publish': 'Publish',
    'common.share': 'Share',
    'common.settings': 'Settings',
    'common.help': 'Help',
    'common.about': 'About',
    'common.logout': 'Logout',
    'common.login': 'Login',
    'common.signup': 'Sign Up',
    'common.profile': 'Profile',
    'common.notifications': 'Notifications',
    'common.required': 'Required',
    'common.optional': 'Optional',
    'common.viewMore': 'View More',
    'common.viewLess': 'View Less',

    // Toolbar
    'toolbar.file': 'File',
    'toolbar.edit': 'Edit',
    'toolbar.view': 'View',
    'toolbar.insert': 'Insert',
    'toolbar.format': 'Format',
    'toolbar.tools': 'Tools',
    'toolbar.window': 'Window',
    'toolbar.help': 'Help',
    'toolbar.new': 'New Project',
    'toolbar.open': 'Open Project',
    'toolbar.save': 'Save Project',
    'toolbar.saveAs': 'Save As...',
    'toolbar.export': 'Export',
    'toolbar.import': 'Import',
    'toolbar.print': 'Print',
    'toolbar.undo': 'Undo',
    'toolbar.redo': 'Redo',
    'toolbar.cut': 'Cut',
    'toolbar.copy': 'Copy',
    'toolbar.paste': 'Paste',
    'toolbar.delete': 'Delete',
    'toolbar.selectAll': 'Select All',
    'toolbar.zoomIn': 'Zoom In',
    'toolbar.zoomOut': 'Zoom Out',
    'toolbar.zoomReset': 'Reset Zoom',
    'toolbar.zoomFit': 'Zoom to Fit',
    'toolbar.grid': 'Toggle Grid',
    'toolbar.rulers': 'Toggle Rulers',
    'toolbar.guides': 'Toggle Guides',
    'toolbar.snap': 'Toggle Snap',
    'toolbar.outlines': 'Toggle Outlines',
    'toolbar.preview': 'Preview',
    'toolbar.build': 'Build',
    'toolbar.deploy': 'Deploy',
    'toolbar.settings': 'Project Settings',
    'toolbar.shortcuts': 'Keyboard Shortcuts',
    'toolbar.fullscreen': 'Fullscreen',

    // Panels
    'panel.components': 'Components',
    'panel.layers': 'Layers',
    'panel.pages': 'Pages',
    'panel.templates': 'Templates',
    'panel.properties': 'Properties',
    'panel.styles': 'Styles',
    'panel.responsive': 'Responsive',
    'panel.animations': 'Animations',
    'panel.interactions': 'Interactions',
    'panel.data': 'Data',
    'panel.seo': 'SEO',
    'panel.accessibility': 'Accessibility',
    'panel.performance': 'Performance',
    'panel.history': 'History',
    'panel.assets': 'Assets',
    'panel.colors': 'Colors',
    'panel.typography': 'Typography',
    'panel.layout': 'Layout',
    'panel.effects': 'Effects',

    // Widget types
    'widget.text': 'Text',
    'widget.heading': 'Heading',
    'widget.paragraph': 'Paragraph',
    'widget.button': 'Button',
    'widget.image': 'Image',
    'widget.video': 'Video',
    'widget.audio': 'Audio',
    'widget.icon': 'Icon',
    'widget.link': 'Link',
    'widget.container': 'Container',
    'widget.section': 'Section',
    'widget.row': 'Row',
    'widget.column': 'Column',
    'widget.grid': 'Grid',
    'widget.flexbox': 'Flexbox',
    'widget.form': 'Form',
    'widget.input': 'Input',
    'widget.textarea': 'Text Area',
    'widget.select': 'Select',
    'widget.checkbox': 'Checkbox',
    'widget.radio': 'Radio',
    'widget.toggle': 'Toggle',
    'widget.slider': 'Slider',
    'widget.datepicker': 'Date Picker',
    'widget.timepicker': 'Time Picker',
    'widget.colorpicker': 'Color Picker',
    'widget.filepicker': 'File Picker',
    'widget.dropdown': 'Dropdown',
    'widget.menu': 'Menu',
    'widget.tabs': 'Tabs',
    'widget.accordion': 'Accordion',
    'widget.modal': 'Modal',
    'widget.drawer': 'Drawer',
    'widget.tooltip': 'Tooltip',
    'widget.popover': 'Popover',
    'widget.card': 'Card',
    'widget.list': 'List',
    'widget.table': 'Table',
    'widget.chart': 'Chart',
    'widget.map': 'Map',
    'widget.calendar': 'Calendar',
    'widget.carousel': 'Carousel',
    'widget.gallery': 'Gallery',
    'widget.breadcrumb': 'Breadcrumb',
    'widget.pagination': 'Pagination',
    'widget.progress': 'Progress',
    'widget.spinner': 'Spinner',
    'widget.skeleton': 'Skeleton',
    'widget.avatar': 'Avatar',
    'widget.badge': 'Badge',
    'widget.tag': 'Tag',
    'widget.alert': 'Alert',
    'widget.toast': 'Toast',
    'widget.divider': 'Divider',
    'widget.spacer': 'Spacer',
    'widget.embed': 'Embed',
    'widget.iframe': 'iFrame',
    'widget.code': 'Code Block',
    'widget.markdown': 'Markdown',
    'widget.richtext': 'Rich Text',
    'widget.html': 'HTML Block',
    'widget.navbar': 'Navigation Bar',
    'widget.sidebar': 'Sidebar',
    'widget.footer': 'Footer',
    'widget.header': 'Header',
    'widget.hero': 'Hero Section',
    'widget.cta': 'Call to Action',
    'widget.testimonial': 'Testimonial',
    'widget.pricing': 'Pricing Table',
    'widget.faq': 'FAQ',
    'widget.timeline': 'Timeline',
    'widget.stepper': 'Stepper',
    'widget.rating': 'Rating',
    'widget.review': 'Review',
    'widget.counter': 'Counter',
    'widget.countdown': 'Countdown',
    'widget.social': 'Social Links',
    'widget.share': 'Share Buttons',
    'widget.newsletter': 'Newsletter',
    'widget.contact': 'Contact Form',
    'widget.login': 'Login Form',
    'widget.signup': 'Signup Form',
    'widget.search': 'Search Bar',
    'widget.filter': 'Filter Bar',
    'widget.sort': 'Sort Control',

    // Properties
    'props.general': 'General',
    'props.layout': 'Layout',
    'props.typography': 'Typography',
    'props.background': 'Background',
    'props.border': 'Border',
    'props.shadow': 'Shadow',
    'props.spacing': 'Spacing',
    'props.size': 'Size',
    'props.position': 'Position',
    'props.display': 'Display',
    'props.overflow': 'Overflow',
    'props.opacity': 'Opacity',
    'props.transform': 'Transform',
    'props.transition': 'Transition',
    'props.animation': 'Animation',
    'props.filter': 'Filter',
    'props.cursor': 'Cursor',
    'props.visibility': 'Visibility',
    'props.zIndex': 'Z-Index',
    'props.id': 'ID',
    'props.class': 'CSS Class',
    'props.name': 'Name',
    'props.label': 'Label',
    'props.placeholder': 'Placeholder',
    'props.value': 'Value',
    'props.defaultValue': 'Default Value',
    'props.required': 'Required',
    'props.disabled': 'Disabled',
    'props.readonly': 'Read Only',
    'props.hidden': 'Hidden',
    'props.locked': 'Locked',
    'props.width': 'Width',
    'props.height': 'Height',
    'props.minWidth': 'Min Width',
    'props.maxWidth': 'Max Width',
    'props.minHeight': 'Min Height',
    'props.maxHeight': 'Max Height',
    'props.margin': 'Margin',
    'props.padding': 'Padding',
    'props.top': 'Top',
    'props.right': 'Right',
    'props.bottom': 'Bottom',
    'props.left': 'Left',
    'props.color': 'Color',
    'props.fontSize': 'Font Size',
    'props.fontWeight': 'Font Weight',
    'props.fontFamily': 'Font Family',
    'props.lineHeight': 'Line Height',
    'props.letterSpacing': 'Letter Spacing',
    'props.textAlign': 'Text Align',
    'props.textDecoration': 'Text Decoration',
    'props.textTransform': 'Text Transform',
    'props.borderRadius': 'Border Radius',
    'props.borderWidth': 'Border Width',
    'props.borderColor': 'Border Color',
    'props.borderStyle': 'Border Style',
    'props.boxShadow': 'Box Shadow',
    'props.backgroundColor': 'Background Color',
    'props.backgroundImage': 'Background Image',
    'props.backgroundSize': 'Background Size',
    'props.backgroundPosition': 'Background Position',
    'props.backgroundRepeat': 'Background Repeat',

    // Actions / Interactions
    'action.onClick': 'On Click',
    'action.onDoubleClick': 'On Double Click',
    'action.onHover': 'On Hover',
    'action.onFocus': 'On Focus',
    'action.onBlur': 'On Blur',
    'action.onChange': 'On Change',
    'action.onSubmit': 'On Submit',
    'action.onLoad': 'On Load',
    'action.onScroll': 'On Scroll',
    'action.onResize': 'On Resize',
    'action.navigate': 'Navigate to',
    'action.openUrl': 'Open URL',
    'action.scrollTo': 'Scroll to',
    'action.showModal': 'Show Modal',
    'action.hideModal': 'Hide Modal',
    'action.toggleModal': 'Toggle Modal',
    'action.showToast': 'Show Toast',
    'action.playAnimation': 'Play Animation',
    'action.stopAnimation': 'Stop Animation',
    'action.setVariable': 'Set Variable',
    'action.callApi': 'Call API',
    'action.runScript': 'Run Script',
    'action.copyToClipboard': 'Copy to Clipboard',
    'action.downloadFile': 'Download File',
    'action.printPage': 'Print Page',
    'action.shareContent': 'Share Content',

    // Responsive
    'responsive.desktop': 'Desktop',
    'responsive.tablet': 'Tablet',
    'responsive.mobile': 'Mobile',
    'responsive.landscape': 'Landscape',
    'responsive.portrait': 'Portrait',
    'responsive.breakpoint': 'Breakpoint',
    'responsive.customSize': 'Custom Size',
    'responsive.fitContent': 'Fit Content',
    'responsive.fullWidth': 'Full Width',
    'responsive.auto': 'Auto',

    // SEO
    'seo.title': 'Page Title',
    'seo.description': 'Meta Description',
    'seo.keywords': 'Keywords',
    'seo.ogTitle': 'OG Title',
    'seo.ogDescription': 'OG Description',
    'seo.ogImage': 'OG Image',
    'seo.twitterCard': 'Twitter Card',
    'seo.canonical': 'Canonical URL',
    'seo.robots': 'Robots',
    'seo.sitemap': 'Sitemap',
    'seo.schema': 'Structured Data',
    'seo.score': 'SEO Score',
    'seo.audit': 'Run SEO Audit',

    // Accessibility
    'a11y.altText': 'Alt Text',
    'a11y.ariaLabel': 'ARIA Label',
    'a11y.ariaRole': 'ARIA Role',
    'a11y.tabIndex': 'Tab Index',
    'a11y.contrast': 'Color Contrast',
    'a11y.wcag': 'WCAG Level',
    'a11y.audit': 'Run Accessibility Audit',
    'a11y.score': 'Accessibility Score',
    'a11y.issues': '{{count}} issue found',
    'a11y.issues_plural': '{{count}} issues found',
    'a11y.noIssues': 'No accessibility issues found',

    // Messages
    'msg.saved': 'Project saved successfully',
    'msg.exported': 'Project exported successfully',
    'msg.imported': 'Project imported successfully',
    'msg.deleted': '{{item}} deleted',
    'msg.duplicated': '{{item}} duplicated',
    'msg.copied': 'Copied to clipboard',
    'msg.pasted': 'Pasted from clipboard',
    'msg.undone': 'Action undone',
    'msg.redone': 'Action redone',
    'msg.published': 'Project published successfully',
    'msg.error.save': 'Failed to save project',
    'msg.error.export': 'Failed to export project',
    'msg.error.import': 'Failed to import project',
    'msg.error.network': 'Network error. Please check your connection.',
    'msg.error.generic': 'An unexpected error occurred',
    'msg.confirm.delete': 'Are you sure you want to delete {{item}}?',
    'msg.confirm.unsaved': 'You have unsaved changes. Are you sure you want to leave?',
    'msg.confirm.reset': 'This will reset all settings to default. Continue?',
    'msg.noResults': 'No results found',
    'msg.empty': 'No items yet',
    'msg.dragHere': 'Drag components here to start building',
    'msg.selectWidget': 'Select a widget to view its properties',

    // Time / Dates
    'time.now': 'Just now',
    'time.seconds': '{{count}} second ago',
    'time.seconds_plural': '{{count}} seconds ago',
    'time.minutes': '{{count}} minute ago',
    'time.minutes_plural': '{{count}} minutes ago',
    'time.hours': '{{count}} hour ago',
    'time.hours_plural': '{{count}} hours ago',
    'time.days': '{{count}} day ago',
    'time.days_plural': '{{count}} days ago',
    'time.weeks': '{{count}} week ago',
    'time.weeks_plural': '{{count}} weeks ago',
    'time.months': '{{count}} month ago',
    'time.months_plural': '{{count}} months ago',
    'time.years': '{{count}} year ago',
    'time.years_plural': '{{count}} years ago',
  },
};

// =============================================================================
// I18n Manager
// =============================================================================

export class I18nManager {
  private currentLocale: string;
  private translations: Map<string, Map<string, TranslationEntry>> = new Map();
  private namespaces: Map<string, TranslationNamespace> = new Map();
  private config: I18nConfig;
  private missingKeys: Set<string> = new Set();
  private listeners: Array<(locale: string) => void> = [];
  private cache: Map<string, string> = new Map();

  constructor(config?: Partial<I18nConfig>) {
    this.config = {
      defaultLocale: 'en',
      fallbackLocale: 'en',
      supportedLocales: SUPPORTED_LOCALES.filter(l => l.enabled).map(l => l.code),
      interpolation: {
        prefix: '{{',
        suffix: '}}',
        escapeValue: true,
        formatSeparator: ',',
        nestingPrefix: '$t(',
        nestingSuffix: ')',
      },
      pluralization: true,
      contextSeparator: '_',
      namespaceSeparator: ':',
      keySeparator: '.',
      missingKeyHandler: 'warn',
      cacheEnabled: true,
      autoDetect: true,
      ...config,
    };

    this.currentLocale = this.config.defaultLocale;

    // Load default translations
    this.loadTranslations('en', DEFAULT_TRANSLATIONS.en);
  }

  // ---------------------------------------------------------------------------
  // Locale Management
  // ---------------------------------------------------------------------------

  setLocale(locale: string): void {
    if (!this.config.supportedLocales.includes(locale)) {
      console.warn(`Locale "${locale}" is not supported. Supported: ${this.config.supportedLocales.join(', ')}`);
      return;
    }

    this.currentLocale = locale;
    this.cache.clear();

    // Update document direction for RTL
    if (typeof document !== 'undefined') {
      const localeConfig = this.getLocaleConfig(locale);
      if (localeConfig) {
        document.documentElement.dir = localeConfig.direction;
        document.documentElement.lang = locale;
      }
    }

    // Notify listeners
    for (const listener of this.listeners) {
      listener(locale);
    }
  }

  getLocale(): string {
    return this.currentLocale;
  }

  getLocaleConfig(code?: string): Locale | undefined {
    return SUPPORTED_LOCALES.find(l => l.code === (code || this.currentLocale));
  }

  getSupportedLocales(): Locale[] {
    return SUPPORTED_LOCALES.filter(l => this.config.supportedLocales.includes(l.code));
  }

  isRTL(locale?: string): boolean {
    const config = this.getLocaleConfig(locale);
    return config?.direction === 'rtl';
  }

  detectLocale(): string {
    if (typeof window === 'undefined') return this.config.defaultLocale;

    // Check localStorage
    const stored = localStorage.getItem('locale');
    if (stored && this.config.supportedLocales.includes(stored)) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language || (navigator as unknown as { userLanguage: string }).userLanguage;
    if (browserLang) {
      // Exact match
      if (this.config.supportedLocales.includes(browserLang)) {
        return browserLang;
      }
      // Base language match (e.g., 'en-US' -> 'en')
      const baseLang = browserLang.split('-')[0];
      if (this.config.supportedLocales.includes(baseLang)) {
        return baseLang;
      }
    }

    return this.config.defaultLocale;
  }

  // ---------------------------------------------------------------------------
  // Translation Loading
  // ---------------------------------------------------------------------------

  loadTranslations(locale: string, translations: Record<string, string>): void {
    if (!this.translations.has(locale)) {
      this.translations.set(locale, new Map());
    }

    const localeMap = this.translations.get(locale)!;
    for (const [key, value] of Object.entries(translations)) {
      localeMap.set(key, {
        key,
        value,
        placeholders: this.extractPlaceholders(value),
      });
    }

    this.cache.clear();
  }

  loadNamespace(namespace: string, locale: string, translations: Record<string, string>): void {
    const prefixedTranslations: Record<string, string> = {};
    for (const [key, value] of Object.entries(translations)) {
      prefixedTranslations[`${namespace}${this.config.namespaceSeparator}${key}`] = value;
    }
    this.loadTranslations(locale, prefixedTranslations);

    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(namespace, {
        name: namespace,
        translations: new Map(),
      });
    }
  }

  hasTranslation(key: string, locale?: string): boolean {
    const loc = locale || this.currentLocale;
    const localeMap = this.translations.get(loc);
    return !!localeMap?.has(key);
  }

  // ---------------------------------------------------------------------------
  // Translation
  // ---------------------------------------------------------------------------

  t(key: string, params?: Record<string, unknown>): string {
    // Check cache
    const cacheKey = `${this.currentLocale}:${key}:${JSON.stringify(params || {})}`;
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let result = this.resolve(key, this.currentLocale, params);

    // Apply interpolation
    if (params) {
      result = this.interpolate(result, params);
    }

    // Apply nesting
    result = this.resolveNesting(result);

    // Cache
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  // Plural-aware translation
  tp(key: string, count: number, params?: Record<string, unknown>): string {
    if (!this.config.pluralization) {
      return this.t(key, { ...params, count });
    }

    const pluralForm = this.getPluralForm(count, this.currentLocale);
    const pluralKey = count === 1 ? key : `${key}_plural`;

    // Try specific plural form first
    const specificKey = `${key}_${pluralForm}`;
    if (this.hasTranslation(specificKey)) {
      return this.t(specificKey, { ...params, count });
    }

    // Try _plural suffix
    if (count !== 1 && this.hasTranslation(pluralKey)) {
      return this.t(pluralKey, { ...params, count });
    }

    return this.t(key, { ...params, count });
  }

  // Context-aware translation
  tc(key: string, context: string, params?: Record<string, unknown>): string {
    const contextKey = `${key}${this.config.contextSeparator}${context}`;
    if (this.hasTranslation(contextKey)) {
      return this.t(contextKey, params);
    }
    return this.t(key, params);
  }

  // ---------------------------------------------------------------------------
  // Number Formatting
  // ---------------------------------------------------------------------------

  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.currentLocale, options).format(value);
    } catch {
      return String(value);
    }
  }

  formatCurrency(value: number, currency?: string): string {
    const localeConfig = this.getLocaleConfig();
    const curr = currency || localeConfig?.numberFormat.currency || 'USD';

    try {
      return new Intl.NumberFormat(this.currentLocale, {
        style: 'currency',
        currency: curr,
      }).format(value);
    } catch {
      return `${curr} ${value.toFixed(2)}`;
    }
  }

  formatPercent(value: number, decimals = 0): string {
    try {
      return new Intl.NumberFormat(this.currentLocale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value / 100);
    } catch {
      return `${value}%`;
    }
  }

  formatCompact(value: number): string {
    try {
      return new Intl.NumberFormat(this.currentLocale, {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value);
    } catch {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return String(value);
    }
  }

  formatOrdinal(value: number): string {
    if (this.currentLocale.startsWith('en')) {
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const v = value % 100;
      return value + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    }
    return String(value);
  }

  // ---------------------------------------------------------------------------
  // Date Formatting
  // ---------------------------------------------------------------------------

  formatDate(date: Date | number | string, format?: 'short' | 'medium' | 'long' | 'full'): string {
    const d = date instanceof Date ? date : new Date(date);
    const style = format || 'medium';

    const styleMap: Record<string, Intl.DateTimeFormatOptions> = {
      short: { year: '2-digit', month: 'numeric', day: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    };

    try {
      return new Intl.DateTimeFormat(this.currentLocale, styleMap[style]).format(d);
    } catch {
      return d.toLocaleDateString();
    }
  }

  formatTime(date: Date | number | string, includeSeconds = false): string {
    const d = date instanceof Date ? date : new Date(date);

    try {
      return new Intl.DateTimeFormat(this.currentLocale, {
        hour: 'numeric',
        minute: 'numeric',
        second: includeSeconds ? 'numeric' : undefined,
      }).format(d);
    } catch {
      return d.toLocaleTimeString();
    }
  }

  formatDateTime(date: Date | number | string, format?: 'short' | 'medium' | 'long' | 'full'): string {
    const d = date instanceof Date ? date : new Date(date);
    const style = format || 'medium';

    const styleMap: Record<string, Intl.DateTimeFormatOptions> = {
      short: { year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'long' },
    };

    try {
      return new Intl.DateTimeFormat(this.currentLocale, styleMap[style]).format(d);
    } catch {
      return d.toLocaleString();
    }
  }

  formatRelativeTime(date: Date | number): string {
    const d = date instanceof Date ? date.getTime() : date;
    const now = Date.now();
    const diff = now - d;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return this.t('time.now');
    if (minutes < 60) return this.tp('time.minutes', minutes);
    if (hours < 24) return this.tp('time.hours', hours);
    if (days < 7) return this.tp('time.days', days);
    if (weeks < 4) return this.tp('time.weeks', weeks);
    if (months < 12) return this.tp('time.months', months);
    return this.tp('time.years', years);
  }

  // ---------------------------------------------------------------------------
  // List Formatting
  // ---------------------------------------------------------------------------

  formatList(items: string[], type: 'conjunction' | 'disjunction' | 'unit' = 'conjunction'): string {
    try {
      return new Intl.ListFormat(this.currentLocale, { type }).format(items);
    } catch {
      if (type === 'disjunction') return items.join(' or ');
      return items.join(', ');
    }
  }

  // ---------------------------------------------------------------------------
  // Listener Management
  // ---------------------------------------------------------------------------

  onLocaleChange(listener: (locale: string) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  // ---------------------------------------------------------------------------
  // Stats & Debugging
  // ---------------------------------------------------------------------------

  getTranslationStats(locale?: string): TranslationStats {
    const loc = locale || this.currentLocale;
    const defaultKeys = this.translations.get(this.config.defaultLocale);
    const localeKeys = this.translations.get(loc);

    const totalKeys = defaultKeys?.size || 0;
    const translatedKeys = localeKeys?.size || 0;
    const missingKeys = totalKeys - translatedKeys;

    return {
      locale: loc,
      totalKeys,
      translatedKeys,
      missingKeys: Math.max(0, missingKeys),
      completionPercentage: totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 0,
      lastUpdated: Date.now(),
    };
  }

  getMissingKeys(locale?: string): string[] {
    const loc = locale || this.currentLocale;
    const defaultKeys = this.translations.get(this.config.defaultLocale);
    const localeKeys = this.translations.get(loc);

    if (!defaultKeys) return [];

    const missing: string[] = [];
    for (const key of defaultKeys.keys()) {
      if (!localeKeys?.has(key)) {
        missing.push(key);
      }
    }
    return missing;
  }

  getAllKeys(locale?: string): string[] {
    const loc = locale || this.currentLocale;
    const localeKeys = this.translations.get(loc);
    return localeKeys ? Array.from(localeKeys.keys()) : [];
  }

  exportTranslations(locale?: string): Record<string, string> {
    const loc = locale || this.currentLocale;
    const localeKeys = this.translations.get(loc);
    if (!localeKeys) return {};

    const result: Record<string, string> = {};
    for (const [key, entry] of localeKeys.entries()) {
      result[key] = entry.value;
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private resolve(key: string, locale: string, params?: Record<string, unknown>): string {
    // Check current locale
    const localeMap = this.translations.get(locale);
    if (localeMap?.has(key)) {
      return localeMap.get(key)!.value;
    }

    // Check fallback chain
    const localeConfig = this.getLocaleConfig(locale);
    if (localeConfig?.fallback && localeConfig.fallback !== locale) {
      const fallbackResult = this.resolve(key, localeConfig.fallback, params);
      if (fallbackResult !== key) return fallbackResult;
    }

    // Check config fallback
    if (locale !== this.config.fallbackLocale) {
      const fallbackMap = this.translations.get(this.config.fallbackLocale);
      if (fallbackMap?.has(key)) {
        return fallbackMap.get(key)!.value;
      }
    }

    // Handle missing key
    this.missingKeys.add(`${locale}:${key}`);

    switch (this.config.missingKeyHandler) {
      case 'warn':
        console.warn(`Missing translation: ${key} (${locale})`);
        return key;
      case 'error':
        console.error(`Missing translation: ${key} (${locale})`);
        return key;
      case 'empty':
        return '';
      case 'key':
      case 'fallback':
      default:
        return key;
    }
  }

  private interpolate(text: string, params: Record<string, unknown>): string {
    const { prefix, suffix } = this.config.interpolation;
    let result = text;

    for (const [key, value] of Object.entries(params)) {
      const placeholder = `${prefix}${key}${suffix}`;
      result = result.split(placeholder).join(String(value ?? ''));
    }

    return result;
  }

  private resolveNesting(text: string): string {
    const { nestingPrefix, nestingSuffix } = this.config.interpolation;
    let result = text;
    let maxDepth = 10;

    while (result.includes(nestingPrefix) && maxDepth > 0) {
      const startIdx = result.indexOf(nestingPrefix);
      const endIdx = result.indexOf(nestingSuffix, startIdx);
      if (endIdx === -1) break;

      const nestedKey = result.substring(startIdx + nestingPrefix.length, endIdx);
      const nestedValue = this.t(nestedKey);
      result = result.substring(0, startIdx) + nestedValue + result.substring(endIdx + nestingSuffix.length);
      maxDepth--;
    }

    return result;
  }

  private getPluralForm(count: number, locale: string): string {
    const localeConfig = this.getLocaleConfig(locale);
    if (!localeConfig) return 'other';

    for (const rule of localeConfig.pluralRules) {
      if (rule.match(count)) {
        return rule.condition;
      }
    }

    return 'other';
  }

  private extractPlaceholders(text: string): string[] {
    const { prefix, suffix } = this.config.interpolation;
    const regex = new RegExp(
      this.escapeRegex(prefix) + '(\\w+)' + this.escapeRegex(suffix),
      'g'
    );
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const i18n = new I18nManager();
