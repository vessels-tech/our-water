# Retool Snippets

Some handy snippets for retool

## Editing a resource:

```json
{
  "id": "zJAW3jfNWxtdxyTfAVDk",
  "orgId": "test_12345",
  "groups": "asdasd",
  "lastReadingDatetime": "12345",
  "lastValue": 100,
  "createdAt": {
    "_seconds": 1533262900,
    "_nanoseconds": 765000000
  },
  "updatedAt": 12345
}
```

```js
{
  "id": "zJAW3jfNWxtdxyTfAVDk",
  "orgId": "test_12345",
  "groups": {},
  "lastReadingDatetime": {
    "_seconds": 1533257867,
    "_nanoseconds": 0
  },
  "lastValue": 100,
  "createdAt": {
    "_seconds": 1533262900,
    "_nanoseconds": 765000000
  },
  "updatedAt": {
    "_seconds": 1533262900,
    "_nanoseconds": 765000000
  },
  "owner": {
    "name": "Bagdi Ram s/o Kajod Ji",
    "createdByUserId": "default"
  },
  "externalIds": {
    "legacyMyWellId": "313603.1111"
  },
  "resourceType": "well",
  "coords": {
    "_latitude": 24.5931130555556,
    "_longitude": 74.1983086111111
  }
}
```



JSON Schema:

//TODO: add back groups - it's a little tricky
```json
{
  "title": "Edit Resource",
  "description": "Edit",
  "type": "object",
  "required": [
    "id"
  ],
  "properties": {
    "id": {
      "type": "string",
      "title": "id"
    },
    "orgId": {
      "type": "string",
      "title": "orgId"
    },
    "lastValue": {
      "type": "number",
      "title": "lastValue"
    },
    "lastReadingDatetime": {
      "type": "object",
      "title": "lastReadingDatetime",
      "properties": {
        "_seconds": {
          "type": "number",
          "title": "seconds"
        },
        "_nanoseconds": {
          "type": "number",
          "title": "nanoseconds"
        }
      }
    },
    "createdAt": {
      "type": "object",
      "title": "createdAt",
      "properties": {
        "_seconds": {
          "type": "number",
          "title": "seconds"
        },
        "_nanoseconds": {
          "type": "number",
          "title": "nanoseconds"
        }
      }
    },
    "updatedAt": {
      "type": "object",
      "title": "updatedAt",
      "properties": {
        "_seconds": {
          "type": "number",
          "title": "seconds"
        },
        "_nanoseconds": {
          "type": "number",
          "title": "nanoseconds"
        }
      }
    },
    "owner": {
      "type": "object",
      "title": "owner",
      "properties": {
        "name": {
          "type": "string",
          "title": "name"
        },
        "createdByUserId": {
          "type": "string",
          "title": "nanoseconds"
        }
      }
    },
    "externalIds": {
      "type": "object",
      "title": "externalIds",
      "properties": {
        "legacyMyWellId": {
          "type": "string",
          "title": "legacyMyWellId"
        }
      }
    },
    "resourceType": {
      "type": "string",
      "title": "resourceType"
    },
    "coords": {
      "type": "object",
      "title": "coords",
      "properties": {
        "_latitude": {
          "type": "number",
          "title": "Lat"
        },
        "_longitude": {
          "type": "number",
          "title": "Long"
        }
      }
    }
  }
}
```

UI Schema:
```json
{
  "id": {
    "ui:disabled": true
  },
  "orgId": {
    "ui:readonly": true
  },
  "groups": {
    "ui:readonly": true
  },
  "lastValue": {
    "ui:readonly": true
  },
  "lastReadingDatetime": {
    "ui:readonly": true
  },
  "createdAt": {
    "ui:readonly": true
  },
  "updatedAt": {
    "ui:readonly": true
  },
  "owner": {},
  "externalIds": {},
  "resourceType": {},
  "coords": {}
}
```


  "firstName": {
    "ui:autofocus": true,
    "ui:emptyValue": ""
  },
  "bio": {
    "ui:widget": "textarea"
  },
  "password": {
    "ui:widget": "password",
    "ui:help": "Hint: Make it strong!"
  },
  "date": {
    "ui:widget": "alt-datetime"
  },
  "telephone": {
    "ui:options": {
      "inputType": "tel"
    }
  }



## Final:

```json
{
  "type": "object",
  "required": [
  ],
  "properties": {
    
    "owner": {
      "type": "object",
      "title": "owner",
      "properties": {
        "name": {
          "type": "string",
          "title": "name"
        },
        "createdByUserId": {
          "type": "string",
          "title": "createdByUserId"
        }
      }
    },
    "externalIds": {
      "type": "object",
      "title": "externalIds",
      "properties": {
        "legacyMyWellId": {
          "type": "string",
          "title": "legacyMyWellId"
        }
      }
    },
    "resourceType": {
      "type": "string",
      "title": "resourceType"
    },
    "coords": {
      "type": "object",
      "title": "coords",
      "properties": {
        "_latitude": {
          "type": "number",
          "title": "Lat"
        },
        "_longitude": {
          "type": "number",
          "title": "Long"
        }
      }
    }
  }
}
```

```json
{
  "id": {
    "ui:disabled": true,
    "ui:readonly": true
  },
  "orgId": {
    "ui:disabled": true
  },
  "groups": {
    "ui:readonly": true
  },
  "lastValue": {
    "ui:readonly": true
  },
  "lastReadingDatetime": {
    "ui:readonly": true
  },
  "createdAt": {
    "ui:readonly": true
  },
  "updatedAt": {
    "ui:readonly": true
  },
  "owner": {},
  "externalIds": {},
  "resourceType": {},
  "coords": {
  }
}
```