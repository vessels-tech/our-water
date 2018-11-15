export declare type GGMNLocationResponse = {
    count: number;
    next: string;
    previous: string;
    results: Array<GGMNLocation>;
};
export declare type GGMNTimeseriesResponse = {
    count: number;
    next: string;
    previous: string;
    results: Array<GGMNResponseTimeseries>;
};
export declare type GGMNSearchResponse = {
    count: number;
    next: string;
    previous: string;
    results: GGMNSearchEntity[];
};
export declare type GGMNSearchEntity = {
    id: string;
    title: string;
    description: string;
    entity_name: string;
    entity_id: string;
};
export declare type GGMNUsersResponse = {
    count: number;
    next: string;
    previous: string;
    results: GGMNUser[];
};
export declare type GGMNUser = {
    url: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    organisations_url: string;
};
export declare type GGMNGroundwaterStationResponse = {
    count: number;
    next: string;
    previous: string;
    results: Array<GGMNGroundwaterStation>;
};
export declare type GGMNSaveReadingResponse = GGMNReadingData[];
export declare type GGMNReadingData = {
    datetime: string;
    value: string;
};
export declare type GGMNGroundwaterStation = {
    id: number;
    code: string;
    geometry: GGMNGeometry;
    name: string;
    filters: Array<GGMNFilterResponse>;
};
export declare type GGMNFilterResponse = {
    timeseries: Array<GGMNResponseTimeseries>;
};
export declare type GGMNResponseTimeseries = {
    uuid: string;
    name: string;
    code: string;
    parameter: string;
    unit: string;
    reference_frame: string;
    scale: string;
    value_type: string;
    location: {
        name: string;
        geometry: {
            coordinates: number[];
        };
    };
    last_value: number;
    events: Array<GGMNTimeseriesEvent>;
    start: number;
};
export declare type GGMNTimeseriesEvent = {
    timestamp: number;
    value: number;
};
export declare type GGMNLocation = {
    url: string;
    id: number;
    geometry: GGMNGeometry;
    organisation: GGMNOrganisation;
};
export declare type GGMNGeometry = {
    type: string;
    coordinates: number[];
};
export declare type GGMNOrganisation = {
    name: string;
    unique_id: string;
};
export declare type GGMNOrganisationResponse = {
    count: number;
    next: string;
    prevous: string | null;
    results: GGMNOrganisation[];
};
export declare type KeychainLoginDetails = {
    username: string;
    externalOrg: GGMNOrganisation;
};
