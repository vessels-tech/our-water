const conditionKeys = ['ggmn_android', 'ggmn_dev_android', 'mywell_android'];
const conditions = [
  {
    "name": "ggmn_android",
    "expression": "app.id == '1:276292750755:android:d585f9c74dcfe925' && device.os == 'android'",
    "tagColor": "BLUE"
  },
  {
    "name": "ggmn_dev_android",
    "expression": "app.id == '1:276292750755:android:b9afcac37667ce3e' && device.os == 'android'",
    "tagColor": "BROWN"
  },
  {
    "name": "mywell_android",
    "expression": "app.id == '1:276292750755:android:360c7a8185712f0f' && device.os == 'android'",
    "tagColor": "GREEN"
  }
];

export {
  conditionKeys,
  conditions,
};