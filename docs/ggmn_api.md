# GGMN Api

These are some notes I've collected about the GGMN api to help make integration go easily

## GET locations

equivalent to get resources:
- returns a list of "Locations", which needs to be formatted to Resources
- Paginated query, so we need to get all pages? There are >100,000 records, so I'm not sure the best way to do this...

- we may need to actually run this on the server and cache it - 

https://ggmn.lizard.net/api/v3/locations

Paged query: /?page=4

example result:

```json
{
    "count": 106962,
    "next": "https://ggmn.lizard.net/api/v3/locations/?page=5",
    "previous": "https://ggmn.lizard.net/api/v3/locations/?page=3",
    "results": [
        {
            "url": "https://ggmn.lizard.net/api/v3/locations/f8d15895-d37d-44fc-8f4f-113f4e7bc3a5/",
            "id": 5377,
            "node": {
                "url": "https://ggmn.lizard.net/api/v3/nodes/6be7b0dd-b65b-4e33-adcc-80ef1e28b4b5/",
                "uuid": "6be7b0dd-b65b-4e33-adcc-80ef1e28b4b5",
                "name": "Lizard",
                "description": "Created from data migration.",
                "base_url": "",
                "master": true
            },
            "uuid": "f8d15895-d37d-44fc-8f4f-113f4e7bc3a5",
            "name": "0-CHIP-523",
            "code": "0-CHIP-523",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    32.384647,
                    -20.554643,
                    0
                ]
            },
            "organisation": {
                "url": "https://ggmn.lizard.net/api/v3/organisations/0a47a622e1f542ac9047a1dde9857f20/",
                "name": "Zimbabwe National Water Authority (ZINWA) (Zimbabwe)",
                "unique_id": "0a47a622e1f542ac9047a1dde9857f20",
                "users_url": "https://ggmn.lizard.net/api/v3/organisations/0a47a622e1f542ac9047a1dde9857f20/users/"
            },
            "access_modifier": "Publiek",
            "ddsc_show_on_map": false,
            "ddsc_icon_url": null,
            "extra_metadata": null
        },
    ]
}
```


## Sign in

From what I can tell, GGMN uses basic auth, and simply adds the auth headers to each request. This means no session tokens, refresh tokens or anything of the like.

ref: https://ggmn.lizard.net/doc/api.html First section, Authentication

nienke.ansems
<PWD>

```
curl -X POST \
  https://ggmn.lizard.net/api-auth/login/ \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=nienke.ansems&password=<PWD>'
```

Got back session id: 444d1asw5i68jhzohbkb37fs0mwem0bk

So it looks like we get a sessionId cookie back, which we can use for all other requests later on. According to the docs, it has a 24 hour expiry, and doesn't have a refresh token, so we will need to hold onto the username and password

## Private resources

Based on the site, the only private resources I can see are in Iran.

format: min Lat, min Lon, max Lat, max Lon
BBox:
38.264440,45.635009,25.924174,61.769277
30.00,36.38591,50.00,56.51367 


## CSV Import docs (for reference)

https://ggmn.lizard.net/doc/import_screen.html?highlight=csv

The referenced units might also be helpful down the line: 
https://ddsc.lizard.net/api/v2/parameterreferencedunits/

## Get Readings

When we load the resource detail page, we need to get the last n readings from GGMN.

https://ggmn.lizard.net/api/v3/timeseries/?end=1304208000000&min_points=320&start=1072915200000&uuid=93c6ff85-1661-4ce4-8671-926517eb797c

One location can have multiple timeseries? Yes. It appears that multiple parameters can be recorded in a single location.

This means that when we submit the reading, the user must select the parameter, and then we can set the timeseries accordingly


Location UUID -> Timeseries -> values?


How do we find the timeseries for the selected resource?



## Save Reading

we should use resources in IGRAC:
org id: a852f2e7bfe94e7c87e22927134ffead

eg. resource at:
52.92266,5.6967


For testing purposes, we will use:
- timeseries uuid: 8cd4eec3-1c76-4ebb-84e6-57681f15424f

```
POST https://ggmn.lizard.net/api/v3/timeseries/8cd4eec3-1c76-4ebb-84e6-57681f15424f/data/
Accept: application/json
Content-Type: application/json

[{
    "datetime": "2018-01-01T00:00:00.000Z",
    "value": 100
}]
```

Now we need to find the Groundwater station this is attached to.


1536227365000
1904208000000