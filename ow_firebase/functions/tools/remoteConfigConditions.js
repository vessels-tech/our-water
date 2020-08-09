const conditionKeys = ['ggmn_debug_android', 'ourwater_generic', 'mywell_debug_android'];


const conditions =  [
  {
    "name": "ggmn_debug_android",
    "expression": "app.id == '1:329144717293:android:b9afcac37667ce3e'",
    "tagColor": "LIME"
  },
  {
    "name": "ourwater_generic",
    "expression": "app.id == '1:329144717293:android:5d80f97eab15655d'",
    "tagColor": "BLUE"
  },
  {
    "name": "mywell_debug_android",
    "expression": "app.id == '1:329144717293:android:e99123f734af0faa'",
    "tagColor": "TEAL"
  }
];

export {
  conditionKeys,
  conditions,
};