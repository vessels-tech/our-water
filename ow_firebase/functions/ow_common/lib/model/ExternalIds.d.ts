import { Maybe } from "../utils/Maybe";
export declare enum ExternalIdsType {
    Any = "Any",
    MyWell = "MyWell"
}
export declare type ExternalIds = MyWellExternalIds;
export declare type MyWellExternalIds = {
    type: ExternalIdsType.MyWell;
    legacyMyWellId: Maybe<string>;
    legacyMyWellPincode: Maybe<string>;
    legacyMyWellResourceId: Maybe<string>;
    legacyMyWellVillageId: Maybe<string>;
};
