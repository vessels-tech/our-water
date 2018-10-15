import { TranslationOrg, TranslationOverrideFile } from "../Types";

const ggmn_en_AU: TranslationOverrideFile  = {
  org: TranslationOrg.ggmn,
  overrides: {
    settings_sync_heading: "GGMN Sync",
    settings_connect_to_pending_title: 'Connect to GGMN',
    settings_connect_to_connected_title: 'Connected to GGMN',
    settings_connect_to_subtitle_error: 'Error connecting to GGMN',
    connect_to_service_description: "Connect to GGMN to create new wells and save readings from your device.",
    connect_to_service_connected_test: (fieldName: string, username: string) => `You are connected to MyWell with the ${fieldName}: ${username}`,
    connect_to_service_org_selector: "Select an organisation",
  }
}

export { ggmn_en_AU }