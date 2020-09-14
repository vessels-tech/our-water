# Migrate Laos

These are the steps taken to manually copy the readings in Laos from MyWell Legacy to MyWell 2.0


__Postcode/ResourceIds__:
```
postcode        resourceId
12345            1110
12345            1111
12345            1112
12345            1113
12346            1110
1120             1110
1121             1110
1123             1110
1124             1110
1125             1110
1126             1110
1127             1110
1128             1110
1129             1110
1130             1110
1131             1110
1132             1110
1133             1110
```

__where example__:
```json
{"where":{"and":[{"postcode":"12345"},{"resourceId":"1110"}]}}
```

curl -X GET --header "Accept: application/json" "https://mywell-server.vessels.tech/api/readings?filter=%7B%22where%22%3A%7B%22and%22%3A%5B%7B%22postcode%22%3A%2212345%22%7D%2C%7B%22resourceId%22%3A%221110%22%7D%5D%7D%7D&access_token=5yXZbG75dfAqCc4BF92gnYEak3AwXTzvxGkSoOyCAfVvIrsphsKFulkG2CzKzLdz&access_token=5yXZbG75dfAqCc4BF92gnYEak3AwXTzvxGkSoOyCAfVvIrsphsKFulkG2CzKzLdz"
