export type ShortId = {
  createdAt: Date,
  id: string, //same as shortId, added automatically
  lastUsed: Date,
  longId: string,
  orgId: string,
  shortId: string,
  updatedAt: Date,
}


export const DefaultShortId: ShortId = {
  createdAt: new Date(),
  id: "000100001",
  lastUsed: new Date(),
  longId: "tclElSFuNwxDoR0nP5Lw",
  orgId: "some_org",
  shortId: "000100001",
  updatedAt: new Date(),
}