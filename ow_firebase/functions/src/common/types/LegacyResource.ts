export default interface LegacyResource {
  id: number
  geo: {
    lat: number
    lng: number
  }
  last_value: number
  well_depth: number
  last_date: string
  owner: string
  elevation: number
  type: string
  postcode: number
  mobile: string
  email: string
  clientId: number
  createdAt: string
  updatedAt: string
  villageId: number
  villageIdpostcode: number
}