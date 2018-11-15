export declare type MaybeReadingImage = ReadingImage | NoReadingImage;
export declare enum ReadingImageType {
    NONE = "NONE",
    IMAGE = "IMAGE"
}
export declare type ReadingImage = {
    type: ReadingImageType.IMAGE;
    url: string;
};
export declare type NoReadingImage = {
    type: ReadingImageType.NONE;
};
