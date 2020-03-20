angular.module('arxivar.plugins.controller')
    .controller('ShowParamsPluginRouteCtrl', [
        '$scope', 'ShowParamsPluginRoute', '_', 'params',
        function ($scope, ShowParamsPluginRoute, _, params) {
            if (params && !_.isNil(params.queryParams)) {
                $scope.queryParams = params.queryParams;
            } else {
                $scope.queryParams = 'no params';
            }
        }
    ]);