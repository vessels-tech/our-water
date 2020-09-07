export type MaybeReadingImage = ReadingImage | NoReadingImage;

export enum ReadingImageType {
  NONE='NONE',
  IMAGE='IMAGE',
}

export type ReadingImage = {
  type: ReadingImageType.IMAGE,
  url: string, //base64
  fileUrl: string, //local file
}

export type NoReadingImage = {
  type: ReadingImageType.NONE,
}