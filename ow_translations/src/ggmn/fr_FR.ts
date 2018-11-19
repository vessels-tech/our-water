import { TranslationOrg, TranslationOverrideFile } from "../Types";

const ggmn_fr_FR: TranslationOverrideFile = {
  org: TranslationOrg.ggmn,
  overrides: {
    search_hint: 'Search for Groundwater Stations by their ID.',
    settings_sync_heading: "GGMN Sync",
    settings_connect_to_pending_title: 'Connect to GGMN',
    settings_connect_to_connected_title: 'Connected to GGMN',
    settings_connect_to_subtitle_error: 'Error connecting to GGMN',
    settings_new_resource: "New GW Station",
    connect_to_service_description: "Connect to GGMN to create new groundwater stations and save readings from your device.",
    connect_to_service_connected_test: (fieldName: string, username: string) => `You are connected to GGMN with the ${fieldName}: ${username}`,
    connect_to_service_org_selector: "Select an organisation",
    sync_login_message: "Login to sync with GGMN",
    sync_start_sync_button_loading: "Syncing with GGMN",
    sync_section_resources: "Groundwater Stations",
    sync_empty_heading: "Nothing to sync!",
    sync_empty_content: "Start taking readings or creating groundwater stations to get started.",
    new_reading_timeseries: 'Timeseries',
    resource_detail_empty_heading: 'You haven\'t found any groundwater stations yet.',
    resource_detail_empty_hint: 'Press the search button or browse the map to find some.',
    new_resource_saved_dialog: "Successfully Saved Groundwater Station!",
    new_resource_saved_dialog_warning: "Saved Location Locally. Login to GGMN to sync.",
    resource_name: "Groundwater Station",
    new_resource_asset_type_label: "Asset Type",
    new_resource_submit_button: "SUBMIT",
  }
}

export { ggmn_fr_FR }