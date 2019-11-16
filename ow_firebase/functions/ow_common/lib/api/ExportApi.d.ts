import { Reading } from "../model";
export declare enum ExportFormat {
    TSV = "TSV",
    CSV = "CSV"
}
export declare class ExportApi {
    /**
     * exportReadingImages
     *
     * Export a set of images attached to a reading as an array of base64 strings
     */
    static exportReadingImages(readings: Reading[]): Array<{
        id: string;
        base64: string;
    }>;
    /**
     * readingsToExport
     *
     * Format a set of readings for a given export format
     */
    static readingsToExport(readings: Reading[], format: ExportFormat): string;
    static formatReading(reading: Reading, format: ExportFormat): string;
}
