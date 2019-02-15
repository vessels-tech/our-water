const conditionKeys = ['ggmn_android', 'ggmn_dev_android', 'mywell_android'];
const conditions = "conditions": [
  {
    "name": "mywell_debug2_android",
    "expression": "app.id == '1:329144717293:android:ae845b0cf90fc63d'",
    "tagColor": "BLUE"
      },
  {
    "name": "mywell_debug_android",
    "expression": "app.id == '1:329144717293:android:e99123f734af0faa'",
    "tagColor": "TEAL"
      },
  {
    "name": "ggmn_debug_android",
    "expression": "app.id == '1:329144717293:android:b9afcac37667ce3e'",
    "tagColor": "LIME"
      }
],

export {
  conditionKeys,
  conditions,
};