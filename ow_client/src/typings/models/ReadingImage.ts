export type MaybeReadingImage = ReadingImage | NoReadingImage;

export enum ReadingImageType {
  NONE='NONE',
  IMAGE='IMAGE',
}

export type ReadingImage = {
  type: ReadingImageType.IMAGE,
  url: string,
}

export type NoReadingImage = {
  type: ReadingImageType.NONE,
}