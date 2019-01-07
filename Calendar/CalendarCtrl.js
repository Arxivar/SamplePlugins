// cdn fullcalendar
var jQueryScript = document.createElement('script');
jQueryScript.setAttribute('src','https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.8.0/fullcalendar.min.js');
document.head.appendChild(jQueryScript);

angular.module('arxivar.plugins.controller').controller('CalendarCtrl', ['$scope', 'Calendar', 'notify', 'arxivarConfig', 'toaster', 'resourceService', 'userIdentityService', '_', '$window', 'arxivarHttp', '$q', '$uibModal', function($scope, Calendar, notify, arxivarConfig, toaster, resourceService, userIdentityService, _, $window, arxivarHttp, $q, $uibModal) {


	var w = angular.element($window);
    var getHeight = function() {
        return w.height() > 760 ? w.height() - 250 : 520;
    };

    var classe = Calendar.plugin.customSettings[6].value;
    var nomeCampoUtente = Calendar.plugin.customSettings[0].value;;
    var nomeCampoDa = Calendar.plugin.customSettings[1].value;;
    var nomeCampoA = Calendar.plugin.customSettings[2].value;;
    var nomeCampoDaOra = Calendar.plugin.customSettings[3].value;;
    var nomeCampoAOra = Calendar.plugin.customSettings[4].value;;
    var nomeCampoNote = Calendar.plugin.customSettings[5].value;;
    var nomeCampoOggetto = 'DOCNAME';
    var nomeCampoNumber = 'DOCNUMBER';

    var campiSelect = [nomeCampoUtente, nomeCampoDa, nomeCampoA, nomeCampoDaOra, nomeCampoAOra, nomeCampoNote, nomeCampoOggetto, nomeCampoNumber];

    var executeSearch = function(users, start, end) {

        var deferred = $q.defer();

        $q.all([arxivarHttp.get('searches'), arxivarHttp.get('searches/select/' + classe)])
            .then(function(values) {
                return {
                    searchModel: values[0],
                    selectModel: {
                        fields: values[1].fields,
                        maxItems: values[1].maxItems
                    }
                };
            }).then(function(model) {

                //Preparo la search
                var classeField = _.find(model.searchModel.fields, function(field) {
                    return (field.className === 'FieldBaseForSearchDocumentTypeDto');
                });


                classeField.operator = 3;
                classeField.valore1 = {
                    documentType: classe,
                    type2: 0,
                    type3: 0
                };

                _.forEach(campiSelect, function(fieldName) {
                    var campo = _.find(model.selectModel.fields, { 'name': fieldName });
                    if (campo) {
                        campo.selected = true;
                    }
                });

                arxivarHttp.get('searches/Additional/' + classe + '/' + 0 + '/' + 0).then(function(additionals) {
                    _.forEach(additionals, function(additional) {
                        if (additional.name === nomeCampoUtente) {
                            additional.operator = 1;
                            additional.multiple = users.join(';');
                        }
                        model.searchModel.fields.push(additional);
                    });
                    arxivarHttp.getPost('searches', {
                            searchFilterDto: model.searchModel,
                            selectFilterDto: model.selectModel,
                            maxItems: 0,
                            daAAndOr: 0
                        })
                        .success(function(data) {
                            deferred.resolve(data);
                        });
                });
            });

        return deferred.promise;
    };

    var getEvents = function(callback) {

        var selectedUsers = _.map(_.filter($scope.users, function(user) {
            if (user.hasOwnProperty('selected') && user.selected) {
                return true;
            } else {
                return false;
            }
        }), 'user');
        executeSearch(selectedUsers).then(function(data) {

            var result = [];

            _.forEach($scope.users, function(user) {
                if (user.hasOwnProperty('selected') && user.selected) {
                    var userSource = {
                        user: user.user,
                        events: []
                    };

                    _.filter(data, function(row) {
                        var colonnaUtente = _.find(row.columns, { 'id': nomeCampoUtente });
                        if (colonnaUtente.value === user.user.toString()) {
                            var start = new moment(_.find(row.columns, { 'id': nomeCampoDa }).value);
                            var startTime = _.find(row.columns, { 'id': nomeCampoDaOra }).value.toString();
                            startTime = String('0000' + startTime).slice(-4);
                            start.hour(parseInt(startTime.substring(0, 2)));
                            start.minute(parseInt(startTime.substring(2)));

                            var end = new moment(_.find(row.columns, { 'id': nomeCampoA }).value);
                            var endTime = _.find(row.columns, { 'id': nomeCampoAOra }).value.toString();
                            endTime = String('0000' + endTime).slice(-4);
                            end.hour(parseInt(endTime.substring(0, 2)));
                            end.minute(parseInt(endTime.substring(2)));

                            userSource.events.push({
                                title: _.find(row.columns, { 'id': nomeCampoOggetto }).value,
                                start: start.format(),
                                end: end.format(),
                                resourceId: user.user.toString(),
                                notes: _.find(row.columns, { 'id': nomeCampoNote }).value,
                                docNumber: _.find(row.columns, { 'id': nomeCampoNumber }).value
                            });
                        }
                    });

                    result.push(userSource);
                }
            });

            var sources = _.filter(result, function(source) {

                var user = _.find($scope.users, { 'user': source.user });

                if (!user) {
                    return false;
                }


                source.color = user.color;

                _.forEach(source.events, function(event) {
                    event.color = source.color;
                });

                if (user.hasOwnProperty('selected') && user.selected) {
                    return true;
                } else {
                    return false;
                }
            });
            callback([].concat.apply([], _.map(sources, 'events')));
        });

    };
    //'#'+Math.floor(Math.random()*16777215).toString(16);
    var initCalendar = function() {

        $('#calendar').fullCalendar({
            height: getHeight(),
            schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
            // put your options and callbacks here
            header: {
                left: 'title',
                center: 'basicWeek,month,agendaWeek,agendaDay,timelineMonth',
                right: 'today prevYear,prev,next,nextYear'
            },
            events: function(start, end, timezone, callback) {
                getEvents(callback);
            },
            resources: function(callback) {
                var resurces = _.map(_.filter($scope.users, { 'selected': true }), function(user) {
                    return {
                        id: user.user.toString(), title: user.description };
                    });
                callback(resurces);
            },
            eventClick: function(calEvent, jsEvent, view) {
                $uibModal.open({
                    animation: true,
                    template: '<div class="inmodal"><div class="modal-header"><i class="fa fa-chain"></i> <strong>Informazioni sull\'evento</strong></div><div class="modal-body"><br/>' +
                        '<strong>Oggetto: </strong><span>{{event.title}}</span><br/>' +
                        '<strong>Da: </strong><span>{{event.start}}</span><br/>' +
                        '<strong>A: </strong><span>{{event.end}}</span><br/>' +
                        '<strong>Note: </strong><span>{{event.notes}}</span><br/>' +
                        '<button class="btn btn-primary" type="button" ng-click="download()"><span translate="Documento" /></button></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" type="button" ng-click="confirm()"><span translate="Ok" /></button></div></div>',
                    controller: ['$scope', '$uibModalInstance', 'documentsService', 'moment', function($scope, $uibModalInstance, documentsService, moment) {

                        $scope.event = {
                            title: calEvent.title,
                            start: moment(calEvent.start).format('L HH:mm'),
                            end: moment(calEvent.end).format('L HH:mm'),
                            notes: calEvent.notes
                        };

                        $scope.download = function() {
                            documentsService.getForProfile(calEvent.docNumber).then(documentsService.downloadStream);
                        };

                        $scope.confirm = function() {
                            $uibModalInstance.close();
                        };

                    }]
                });
            }
		});


		$scope.$watch('users', function() {
			$('#calendar').fullCalendar('refetchResources');
			$('#calendar').fullCalendar('refetchEvents');
		}, true);
    };

    resourceService.query('users').then(function(users) {
        var currentUser = _.find(users, { 'user': parseInt(userIdentityService.userId) });
        _.forEach(users, function(user) {
            user.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        });
        currentUser.selected = true;
        $scope.users = _.reject(_.filter(users, { 'category': 0 }), { 'user': 0 });
        initCalendar();
        w.bind('resize', function() {
            $('#calendar').fullCalendar('option', 'height', getHeight());
        });
    });



}]);
