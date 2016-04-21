/**
 Copyright 2016, RadiantBlue Technologies, Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function(){
    'use strict';
    angular
        .module('SAKapp')
        .controller('SearchAdminController', ['$scope', '$http', '$log', '$q', 'toaster', 'discover', SearchAdminController]);

    function SearchAdminController ($scope, $http, $log, $q, toaster, discover) {

        $scope.getStatus = function () {
            $scope.adminData = "";
            $scope.errorMsg = "";

            $http({
                method: "GET",
                url: "/proxy?url=" + discover.searchHost + "/metrics",
            }).then(function successCallback( html ) {
                $scope.adminData = html.data;
            }, function errorCallback(response){
                console.log("Search.admin.controller fail");
                toaster.pop('error', "Error", "There was an issue with your request.");
            });


        };

    }

})();
