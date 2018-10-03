import { TranslationFile } from "../Types";

const file: TranslationFile = {
  metadata: {
    language: 'english',
    region: 'australia',
  },
  templates:{
    client_app: 'MyWell',

    
    app_resource_load_error: 'Error loading locations. Please try again.',
    app_resource_not_found: 'Could not find the selected location',
    
    settings_login_error: 'Error logging in.',
    settings_sync_heading: 'MyWell Sync',
    settings_new_resource: 'New Location',

    search_error: "Couldn't perform search. Please try again.",
    search_more: "More...",
    search_no_results: 'No Results Found',
    search_recent_searches: 'Recent Searches',
    search_offline_line_1: 'You are currently offline.',
    search_offline_line_2: 'Showing limited search results.',

    new_reading_invalid_error_heading: 'Error',
    new_reading_invalid_error_description: 'Invalid reading. Please check and try again.',
    new_reading_invalid_error_ok: 'OK',
    
    new_reading_unknown_error_heading: 'Error',
    new_reading_unknown_error_description: 'There was a problem saving your reading. Please try again.',
    new_reading_unknown_error_ok: 'OK',

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

    connect_to_service





  }
}


export default file;

