export default interface LegacyVillage {
  id: number
  name: string
  postcode: number
  coordinates: {
    lat: number
    lng: number
  }
  createdAt: string
  updatedAt: string
}