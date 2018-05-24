/* eslint-disable */

import angular from 'angular';

export default angular.module("statEngineApp.constants", [])
.constant("appConfig", {"contact_email":"contact@statengine.io","support_email":"support@statengine.io","on_premise":false,"env":"dev"})
.constant("segmentConfig", {"key":""})
.constant("mapboxConfig", {"token":"pk.eyJ1IjoiamNob3AwMSIsImEiOiJjamhoenI4MGowYnhpMzBudWtsd2JlM3MwIn0.a-iP_sTTi7TMOhd1x3-REg"})
.name;
