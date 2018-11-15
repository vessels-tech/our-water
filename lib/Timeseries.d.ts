import { OrgType } from "./OrgType";
import { AnyReading } from "./Reading";
export declare type AnyTimeseries = MyWellTimeseries | GGMNTimeseries;
export declare type MyWellTimeseries = {
    type: OrgType.MYWELL;
    id: string;
    name: string;
    readings: AnyReading[];
    parameter: string;
};
export declare type GGMNTimeseries = {
    type: OrgType.GGMN;
    id: string;
    name: string;
    readings: AnyReading[];
    parameter: string;
    firstReadingDateString: string;
};
