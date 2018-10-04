import { TranslationFile } from "../Types";

const file: TranslationFile = {
  metadata: {
    language: 'test',
    region: 'uppercase',
  },
  templates: {
    app_resource_load_error: 'ERROR LOADING LOCATIONS. PLEASE TRY AGAIN.',
    app_resource_not_found: 'COULD NOT FIND THE SELECTED LOCATION',
    settings_connect_to_pending_title: 'LOGIN TO MYWELL',
    settings_connect_to_connected_title: 'LOGGED IN TO MYWELL',
    settings_connect_to_subtitle_error: 'ERROR LOGGING IN',
    settings_login_error: 'ERROR LOGGING IN.',
    settings_sync_heading: 'MYWELL SYNC',
    settings_new_resource: 'NEW LOCATION',
    search_heading: 'SEARCH',
    search_error: "COULDN'T PERFORM SEARCH. PLEASE TRY AGAIN.",
    search_more: "MORE...",
    search_no_results: 'NO RESULTS FOUND',
    search_hint: '',
    search_recent_searches: 'RECENT SEARCHES',
    search_offline_line_1: 'YOU ARE CURRENTLY OFFLINE.',
    search_offline_line_2: 'SHOWING LIMITED SEARCH RESULTS.',
    new_reading_invalid_error_heading: 'ERROR',
    new_reading_invalid_error_description: 'INVALID READING. PLEASE CHECK AND TRY AGAIN.',
    new_reading_invalid_error_ok: 'OK',
    new_reading_unknown_error_heading: 'ERROR',
    new_reading_unknown_error_description: 'THERE WAS A PROBLEM SAVING YOUR READING. PLEASE TRY AGAIN.',
    new_reading_unknown_error_ok: 'OK',
    new_reading_saved_popup_title: 'SUCCESS',
    new_reading_saved: 'READING SAVED',
    new_reading_warning_login_required: 'READING SAVED LOCALLY ONLY. LOGIN WITH MYWELL TO SAVE',
    new_reading_dialog_one_more: 'ONE MORE',
    new_reading_dialog_done: 'DONE',
    new_reading_date_field: 'READING DATE',
    new_reading_date_field_invalid: 'INVALID DATE',
    new_reading_value_field: (units: string) => `MEASUREMENT IN ${units}`,
    new_reading_value_field_invalid: 'INVALID MEASUREMENT',
    new_reading_timeseries: 'TIMESERIES', //NOT REQUIRED FOR MYWELL
    new_reading_save_button: 'SAVE',
    connect_to_service_username_field: 'USERNAME',
    connect_to_service_username_invalid: 'USERNAME IS REQUIRED',
    connect_to_service_password_field: 'PASSWORD',
    connect_to_service_password_invalid: 'PASSWORD IS REQUIRED',
    connect_to_service_mobile_field: 'PHONE NUMBER',
    connect_to_service_mobile_invalid: 'PHONE NUMBER IS REQUIRED',
    connect_to_service_logout_button: 'LOG OUT',
    connect_to_service_connected_test: (fieldname: string, username: string) => `YOU ARE CONNECTED TO MYWELL WITH THE ${fieldname}: ${username}`,
    connect_to_service_error: 'ERROR SIGNING IN. PLEASE TRY AGAIN',
    connect_to_service_org_selector: 'SELECT AND ORGANISATION', //NOT NEEDED FOR MYWELL
    favourite_resource_heading: 'FAVOURITES',
    favourite_resource_hint_1: 'PRESS THE',
    favourite_resource_hint_2: 'BUTTON TO ADD A FAVOURITE',
    recent_resource_heading: 'RECENTS',
    recent_resource_none: 'NO RECENT RESOURCES',
    resource_detail_latest: 'LATEST READINGS',
    resource_detail_new: 'NEW READING', //THIS MAY BE REPLACED BY AN ICON
  }
}


export default file;