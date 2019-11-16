import { Maybe } from "../utils/Maybe";

export enum ExternalIdsType {
  Any = 'Any',
  MyWell = 'MyWell',
}

export type ExternalIds = MyWellExternalIds;

export type MyWellExternalIds = {
  type: ExternalIdsType.MyWell
  legacyMyWellId: Maybe<string>
  legacyMyWellPincode: Maybe<string>
  legacyMyWellResourceId: Maybe<string>
  legacyMyWellVillageId: Maybe<string>
}