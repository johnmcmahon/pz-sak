/*
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
        .controller('JobsController', ['$scope', '$log', '$q', '$http', 'toaster',  JobsController]);

        function JobsController ($scope, $log, $q, $http, toaster) {
            $scope.pageSizeOptions = [10, 50, 100];
            $scope.pageSize = 10;
            $scope.page = 0;

            // If pageSize or Job Status change, move back to the first page
            $scope.$watch("[pageSize,jobStatusQuery]", function(newValue, oldValue) {
                $scope.page = 0;
            });

            $scope.getJobStatus = function() {

                var data = {
                    "apiKey": "my-api-key-kidkeid",
                    "jobType": {
                        "type": "get",
                        "jobId": $scope.jobId
                    }
                };

                var fd = new FormData();
                fd.append( 'body', JSON.stringify(data) );

                $http({
                    method: "POST",
                    url: "/proxy?url=pz-gateway.cf.piazzageo.io/job",
                    data: fd,
                    headers: {
                        "Content-Type": undefined
                    }
                }).then(function successCallback( html ) {
                    $scope.jobStatusResult = html.data;
                }, function errorCallback(response){
                    console.log("search.controller fail");
                    toaster.pop('error', "Error", "There was an issue with your request.");
                });
            };

            $scope.getResourceData = function() {

                var data = {
                    "apiKey": "my-api-key-kidkeid",
                    "jobType": {
                        "type": "get-resource",
                        "resourceId": $scope.resourceId
                    }
                };

                var fd = new FormData();
                fd.append( 'body', JSON.stringify(data) );

                $http({
                    method: "POST",
                    url: "/proxy?url=pz-gateway.cf.piazzageo.io/job",
                    data: fd,
                    headers: {
                        "Content-Type": undefined
                    }
                }).then(function successCallback( html ) {
                    $scope.resourceData = html.data;
                }, function errorCallback(response){
                    console.log("search.controller fail");
                    toaster.pop('error', "Error", "There was an issue with your request.");
                });

            };


            $scope.getAllStatuses = function() {

                    $http({
                        method: "GET",
                        url: "/proxy?url=pz-jobmanager.cf.piazzageo.io/job/status",
                    }).then(function successCallback( html ) {
                        $scope.jobStatuses = [];
                        $scope.jobStatuses.push.apply($scope.jobStatuses, html.data);
                        $scope.jobStatuses.push("All");
                    }, function errorCallback(response){
                        console.log("search.controller fail");
                        toaster.pop('error', "Error", "There was an issue with your request.");
                    });


            };


            $scope.updateFilter = function() {


                    var query = "";
                    if (angular.isDefined($scope.jobStatusQuery) && $scope.jobStatusQuery !== "" && $scope.jobStatusQuery !== "All") {
                        query = "/status/" + $scope.jobStatusQuery;
                    }

                    var params = {
                        page: $scope.page,
                        pageSize: $scope.pageSize
                    };
                    $http({
                        method: "GET",
                        url: "/proxy/pz-jobmanager.cf.piazzageo.io/job" + query,
                        params: params
                    }).then(function successCallback( html ) {
                        $scope.jobsList = html.data;
                    }, function errorCallback(response){
                        console.log("search.controller fail");
                        toaster.pop('error', "Error", "There was an issue with your request.");
                    });

                    $http({
                        method: "GET",
                        url: "/proxy/pz-jobmanager.cf.piazzageo.io/job" + query + "/count",
                        params: params
                    }).then(function successCallback( html ) {
                        $scope.total = html.data;
                        $scope.maxPage = Math.ceil( $scope.total / $scope.pageSize ) - 1;
                    }, function errorCallback(response){
                        console.log("search.controller fail");
                        toaster.pop('error', "Error", "There was an issue with your request.");
                    });

            };

            $scope.prevPage = function() {
                if ($scope.page > 0) {
                    $scope.page--;
                    $scope.updateFilter();
                }
            };

            $scope.nextPage = function() {
                if ($scope.page < $scope.maxPage) {
                    $scope.page++;
                    $scope.updateFilter();
                }
            };

            $scope.firstResultOnPage = function() {
                return ($scope.page * $scope.pageSize) + 1;
            };

            $scope.lastResultOnPage = function() {
                var lastItem = ($scope.page + 1) * $scope.pageSize;
                if (lastItem > $scope.total) {
                    return $scope.total;
                }
                return lastItem;
            };

        }




})();
