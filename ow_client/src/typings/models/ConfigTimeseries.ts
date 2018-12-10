import { OrgType } from "./OrgType";

export type ConfigTimeseries = {
  name: string,
  parameter: string,
  type: OrgType.NONE,
  unitOfMeasure: 'm' | 'mm' | 'ppm'
}