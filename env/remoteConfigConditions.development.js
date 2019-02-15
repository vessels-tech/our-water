const conditionKeys = ['ggmn_debug_android', 'mywell_debug_android', 'mywell_debug2_android'];
const conditions = [
  {
    "name": "ggmn_debug_android",
    "expression": "app.id == '1:329144717293:android:b9afcac37667ce3e'",
    "tagColor": "LIME"
  },
  {
    "name": "mywell_debug_android",
    "expression": "app.id == '1:329144717293:android:e99123f734af0faa'",
    "tagColor": "TEAL"
  },
  {
    "name": "mywell_debug2_android",
    "expression": "app.id == '1:329144717293:android:ae845b0cf90fc63d'",
    "tagColor": "BLUE"
  },
],

export {
  conditionKeys,
  conditions,
};