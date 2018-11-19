# QR Codes


OurWater 2.0 adds the ability to search for a location using a QR Code scanner.

## Format

QR codes should be string formatted json, with the following structure:

```json
{
  "orgId": "string",
  "assetType": "resource",
  "id": "string",
}
```

for example:

```json
{
  "orgId": "mywell",
  "assetType": "resource",
  "id": "12345",
}
```

Currently, only the "resource" asset type is supported.



