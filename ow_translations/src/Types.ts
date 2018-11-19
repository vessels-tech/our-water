export enum TranslationEnum {
  en_AU = 'en_AU',
  en_US = 'en_US',
  guj_IN = 'guj_IN',
  hi_IN = 'hi_IN',
  nl_NL = 'nl_NL',
  test_UPPER = 'test_UPPER',
  fr_FR = 'fr_FR',
  es_ES = 'es_ES',
}


export type Language = 'dutch' | 'english' | 'hindi' | 'gujarati' | 'test' | 'spanish' | 'french';
export type Region = 'australia' | 'india' | 'netherlands' | 'united states' | 'uppercase' | 'france' | 'spain';


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
  'test_UPPER': TranslationFile,
  'fr_FR': TranslationFile,
  'es_ES': TranslationFile,
}

export type TranslationOverrideFile = GGMNTranslationOverrideFile | MyWellTranslationOverrideFile;

export type GGMNTranslationOverrideFile = {
  org: TranslationOrg.ggmn,
  overrides: {
    /* Define the overriden variables here */
    search_hint: string,
    settings_sync_heading: string,
    settings_connect_to_pending_title: string,
    settings_connect_to_connected_title: string,
    settings_connect_to_subtitle_error: string,
    settings_new_resource: string,
    connect_to_service_description: string,
    connect_to_service_connected_test: (fieldName: string, username: string) => string,
    connect_to_service_org_selector: string, 
    sync_login_message: string,
    sync_start_sync_button_loading: string,
    sync_section_resources: string,
    sync_empty_heading: string,
    sync_empty_content: string,
    new_reading_timeseries: string,
    resource_detail_empty_heading: string,
    resource_detail_empty_hint: string,
    new_resource_saved_dialog: string,
    new_resource_saved_dialog_warning: string,
    resource_name: string,
    new_resource_asset_type_label: string,
    new_resource_submit_button: string,
  }
}

export type MyWellTranslationOverrideFile = {
  org: TranslationOrg.mywell,
  overrides: {
    /* Define the overriden variables here */
    settings_sync_heading: string,
  }
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
    connect_to_service_submit_button: string,
    connect_to_service_description: string,
    connect_to_service_error: string,
    connect_to_service_org_selector: string,
    favourite_resource_heading: string,
    favourite_resource_hint_1: string,
    favourite_resource_hint_2: string,
    recent_resource_heading: string,
    recent_resource_none: string,
    resource_detail_latest: string,
    resource_detail_new: string,
    sync_login_message: string,
    sync_start_sync_button: string,
    sync_start_sync_button_loading: string,
    sync_section_resources: string,
    sync_section_readings: string,
    sync_empty_heading: string,
    sync_empty_content: string,
    select_language_heading: string,
    resource_detail_summary_tab: string,
    resource_detail_empty_heading: string,
    resource_detail_empty_hint: string,
    new_resource_saved_dialog: string,
    new_resource_saved_dialog_warning: string,
    resource_name: string,
    new_resource_lat: string,
    new_resource_lng: string,
    new_resource_asset_type_label: string,
    new_resource_owner_name_label: string,
    new_resource_submit_button: string,
  }
}