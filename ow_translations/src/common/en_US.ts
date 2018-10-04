import { TranslationFile } from "../Types";

const file: TranslationFile = {
  metadata: {
    language: 'english',
    region: 'united states',
  },
  templates: {
app_resource_load_error: 'Error loading locations. Please try again.',
    app_resource_not_found: 'Could not find the selected location',
    settings_connect_to_pending_title: 'Login to MyWell',
    settings_connect_to_connected_title: 'Logged in to MyWell',
    settings_connect_to_subtitle_error: 'Error Logging in',
    settings_login_error: 'Error logging in.',
    settings_sync_heading: 'MyWell Sync',
    settings_new_resource: 'New Location',
    search_heading: 'Search',
    search_error: "Couldn't perform search. Please try again.",
    search_more: "More...",
    search_no_results: 'No Results Found',
    search_hint: '',
    search_recent_searches: 'Recent Searches',
    search_offline_line_1: 'You are currently offline.',
    search_offline_line_2: 'Showing limited search results.',
    new_reading_invalid_error_heading: 'Error',
    new_reading_invalid_error_description: 'Invalid reading. Please check and try again.',
    new_reading_invalid_error_ok: 'OK',
    new_reading_unknown_error_heading: 'Error',
    new_reading_unknown_error_description: 'There was a problem saving your reading. Please try again.',
    new_reading_unknown_error_ok: 'OK',
    new_reading_saved_popup_title: 'Success',
    new_reading_saved: 'Reading Saved',
    new_reading_warning_login_required: 'Reading saved locally only. Login with MyWell to save',
    new_reading_dialog_one_more: 'One More',
    new_reading_dialog_done: 'Done',
    new_reading_date_field: 'Reading Date',
    new_reading_date_field_invalid: 'Invalid Date',
    new_reading_value_field: (units: string) => `Measurement in ${units}`,
    new_reading_value_field_invalid: 'Invalid Measurement',
    new_reading_timeseries: 'Timeseries', //not required for MyWell
    new_reading_save_button: 'Save',
    connect_to_service_username_field: 'Username',
    connect_to_service_username_invalid: 'Username is required',
    connect_to_service_password_field: 'Password',
    connect_to_service_password_invalid: 'Password is required',
    connect_to_service_mobile_field: 'Phone number',
    connect_to_service_mobile_invalid: 'Phone number is required',
    connect_to_service_logout_button: 'Log Out',
    connect_to_service_connected_test: (fieldName: string, username: string) => `You are connected to MyWell with the ${fieldName}: ${username}`,
    connect_to_service_error: 'Error signing in. Please try again',
    connect_to_service_org_selector: 'Select and organisation', //not needed for MyWell
    favourite_resource_heading: 'Favourites',
    favourite_resource_hint_1: 'Press the',
    favourite_resource_hint_2: 'button to add a favourite',
    recent_resource_heading: 'Recents',
    recent_resource_none: 'No recent resources',
    resource_detail_latest: 'Latest readings',
    resource_detail_new: 'New Reading', //this may be replaced by an icon
  }
}


export default file;