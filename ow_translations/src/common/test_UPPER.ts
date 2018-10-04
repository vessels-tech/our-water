/**
 * Do not edit this file directly. 
 * Instead, edit the appropriate spreadsheet 
 * https://docs.google.com/spreadsheets/d/102zLqEWj4xlqqNgVUFCiMLqdcvaLY6GntS1xmlHdAE8/edit#gid=0
 * and recompile in order to change these fields
 */

import { TranslationFile } from "../Types";

const file: TranslationFile = {
  metadata: {
    language: 'test',
    region: 'upper',
  },
  templates: {
    app_resource_load_error: "ERROR LOADING LOCATIONS. PLEASE TRY AGAIN.",
    app_resource_not_found: "",
    settings_connect_to_pending_title: "",
    settings_connect_to_connected_title: "",
    settings_connect_to_subtitle_error: "",
    settings_login_error: "",
    settings_sync_heading: "",
    settings_new_resource: "",
    search_heading: "SEARCH",
    search_error: "",
    search_more: "",
    search_no_results: "",
    search_hint: "",
    search_recent_searches: "",
    search_offline_line_1: "",
    search_offline_line_2: "",
    new_reading_invalid_error_heading: "",
    new_reading_invalid_error_description: "",
    new_reading_invalid_error_ok: "",
    new_reading_unknown_error_heading: "",
    new_reading_unknown_error_description: "",
    new_reading_unknown_error_ok: "",
    new_reading_saved_popup_title: "",
    new_reading_saved: "",
    new_reading_warning_login_required: "",
    new_reading_dialog_one_more: "",
    new_reading_dialog_done: "",
    new_reading_date_field: "",
    new_reading_date_field_invalid: "",
    new_reading_value_field: (units: string) => `Measurement in ${units}`,
    new_reading_value_field_invalid: "",
    new_reading_timeseries: "",
    new_reading_save_button: "",
    connect_to_service_username_field: "",
    connect_to_service_username_invalid: "",
    connect_to_service_password_field: "",
    connect_to_service_password_invalid: "",
    connect_to_service_mobile_field: "",
    connect_to_service_mobile_invalid: "",
    connect_to_service_verify_field: "",
    connect_to_service_verify_invalid: "",
    connect_to_service_logout_button: "",
    connect_to_service_connected_test: (fieldName: string, username: string) => `You are connected to MyWell with the ${fieldName}: ${username}`,
    connect_to_service_error: "",
    connect_to_service_org_selector: "",
    favourite_resource_heading: "",
    favourite_resource_hint_1: "",
    favourite_resource_hint_2: "",
    recent_resource_heading: "",
    recent_resource_none: "",
    resource_detail_latest: "",
    resource_detail_new: "",
  }
}

export default file;
