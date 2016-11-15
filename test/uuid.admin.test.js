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

'use strict';

describe('Controller: UuidAdminController', function () {

    var $httpBackend, statusRequestHandler,
        resetRequestHandler,
        loginHandler;

    // load the controller's module
    beforeEach(module('SAKapp'));

    var UuidAdminController,
        discover,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, $injector) {
        scope = $rootScope.$new();
        $httpBackend = $injector.get('$httpBackend');
        discover = $injector.get('discover');
        statusRequestHandler = $httpBackend.when(
            'GET',
            '/proxy?url=' + discover.uuidHost + '/admin/stats').respond(
            {
                "statusCode": 200,
                "type": "uuidstats",
                "data": {
                    "numUuids": 29610,
                    "numRequests": 29610,
                    "createdOn": "2016-10-07T15:54:16.055538512Z"
                }
            }
        );
        resetRequestHandler = $httpBackend.when(
            'POST',
            '/proxy?url=' + discover.uuidHost + '/admin/shutdown',
            {
                "reason" : "some reason"
            }
        ).respond(
            {
                "statusCode": 502,
                "type": "error",
                "message": "The service is not reachable"
            }
        );
        loginHandler = $httpBackend.when(
            'GET',
            '/login.html').respond({});
        UuidAdminController = $controller('UuidAdminController', {
            $scope: scope
        });
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get the admin stats', function () {
        scope.getStatus();
        $httpBackend.expectGET('/proxy?url=' + discover.uuidHost + '/admin/stats');
        $httpBackend.flush();
        expect(scope.adminData.createdOn).toBe("2016-10-07T15:54:16.055538512Z");
        expect(scope.adminData.numRequests).toBe(29610);
    });

    it('should get the uptime', function () {
        var time = moment.duration("01:00:00");
        var date = moment();
        date.subtract(time);
        var uptime = scope.getUptime(date.format());
        $httpBackend.flush();
        expect(uptime).toBe("an hour ago");
    });

    it('should shut system down', function () {
        scope.shutdownReason = "some reason";
        scope.reset();
        $httpBackend.expectPOST('/proxy?url=' + discover.uuidHost + '/admin/shutdown',
            {
                "reason" : "some reason"
            });
        $httpBackend.flush();
        expect(scope.shutdownResponse.statusCode).toBe(502);
    });

});