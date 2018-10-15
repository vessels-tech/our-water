export enum TranslationEnum {
  en_AU = 'en_AU',
  en_US = 'en_US',
  guj_IN = 'guj_IN',
  hi_IN = 'hi_IN',
  nl_NL = 'nl_NL',
  test_UPPER = 'test_UPPER',
}

export type Language = 'dutch' | 'english' | 'hindi' | 'gujarati' | 'test';
export type Region = 'australia' | 'india' | 'netherlands' | 'united states' | 'uppercase';

export type TranslationMetadata = {
  language: Language
  region: Region
  //TODO: add more
}

export enum TranslationOrg {
  mywell = 'mywell',
  ggmn = 'ggmn',
}

/**
 * If you add a new file, it must be defined in this here file.
 */
export type TranslationFiles = GGMNTranslationFiles | MyWellTranslationFiles;
export type MyWellTranslationFiles = {
  type: TranslationOrg.mywell,
  'en_AU': TranslationFile,
  'test_UPPER': TranslationFile,
  'en_US': TranslationFile,
  'guj_IN': TranslationFile,
  'hi_IN': TranslationFile,
}
export type GGMNTranslationFiles = {
  type: TranslationOrg.ggmn,
  'en_AU': TranslationFile,
  'nl_NL': TranslationFile,
  'test_UPPER': TranslationFile,
}

export type TranslationFile = {
  metadata: TranslationMetadata,
  templates: {
    app_resource_load_error: string,
    app_resource_not_found: string,
    settings_connect_to_pending_title: string,
    settings_connect_to_connected_title: string,
    settings_connect_to_subtitle_error: string,
    settings_login_error: string,
    settings_sync_heading: string,
    settings_new_resource: string,
    search_heading: string,
    search_error: string,
    search_more: string,
    search_no_results: string,
    search_hint: string,
    search_recent_searches: string,
    search_offline_line_1: string,
    search_offline_line_2: string,
    new_reading_invalid_error_heading: string,
    new_reading_invalid_error_description: string,
    new_reading_invalid_error_ok: string,
    new_reading_unknown_error_heading: string,
    new_reading_unknown_error_description: string,
    new_reading_unknown_error_ok: string,
    new_reading_saved_popup_title: string,
    new_reading_saved: string,
    new_reading_warning_login_required: string,
    new_reading_dialog_one_more: string,
    new_reading_dialog_done: string,
    new_reading_date_field: string,
    new_reading_date_field_invalid: string,
    new_reading_value_field: (units: string) => string,
    new_reading_value_field_invalid: string,
    new_reading_timeseries: string,
    new_reading_save_button: string,
    connect_to_service_username_field: string,
    connect_to_service_username_invalid: string,
    connect_to_service_password_field: string,
    connect_to_service_password_invalid: string,
    connect_to_service_mobile_field: string,
    connect_to_service_mobile_invalid: string,
    connect_to_service_verify_field: string,
    connect_to_service_verify_invalid: string,
    connect_to_service_logout_button: string,
    connect_to_service_connected_test: (fieldName: string, username: string) => string,
    connect_to_service_error: string,
    connect_to_service_org_selector: string,
    favourite_resource_heading: string,
    favourite_resource_hint_1: string,
    favourite_resource_hint_2: string,
    recent_resource_heading: string,
    recent_resource_none: string,
    resource_detail_latest: string,
    resource_detail_new: string,
  }
}