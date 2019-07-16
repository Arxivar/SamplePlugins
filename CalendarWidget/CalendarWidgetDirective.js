angular.module('arxivar.plugins.directives')
    .directive('calendarwidgetdirective', [
        'CalendarWidget', '_', 'arxivarRouteService', 'arxivarRouteService', '$q', '$interval', 'documentsService', 'moment',
        function(CalendarWidget, _, arxivarRouteService, arxivarRouteService, $q, $interval, documentsService, moment) {
            return {
                restrict: 'E',
                scope: {
                    instanceId: '@',
                    desktopId: '=?'
                },
                templateUrl: './Scripts/plugins/CalendarWidget/CalendarWidget.html',
                link: function(scope) {

                    var classe = CalendarWidget.plugin.customSettings[6].value;
                    var nomeCampoUtente = CalendarWidget.plugin.customSettings[0].value;;
                    var nomeCampoDa = CalendarWidget.plugin.customSettings[1].value;;
                    var nomeCampoA = CalendarWidget.plugin.customSettings[2].value;;
                    var nomeCampoDaOra = CalendarWidget.plugin.customSettings[3].value;;
                    var nomeCampoAOra = CalendarWidget.plugin.customSettings[4].value;;
                    var nomeCampoNote = CalendarWidget.plugin.customSettings[5].value;;
                    var nomeCampoOggetto = 'DOCNAME';
                    var nomeCampoNumber = 'DOCNUMBER';

                    scope.todayString = moment().format('L');
                    scope.nowHoursString = moment().format('H:mm:ss');


                    $interval(function() {
                        scope.nowHoursString = moment().format('H:mm:ss');
                    }, 1000);


                    var campiSelect = [nomeCampoUtente, nomeCampoDa, nomeCampoA, nomeCampoDaOra, nomeCampoAOra, nomeCampoNote, nomeCampoOggetto, nomeCampoNumber];

                    var executeSearch = function(users, start, end) {

                        var deferred = $q.defer();

                        $q.all([arxivarRouteService.get('searches'), arxivarRouteService.get('searches/select/' + classe)])
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
                                    var campo = _.find(model.selectModel.fields, {
                                        'name': fieldName
                                    });
                                    if (campo) {
                                        campo.selected = true;
                                    }
                                });

                                arxivarRouteService.get('searches/Additional/' + classe + '/' + 0 + '/' + 0).then(function(additionals) {
                                    _.forEach(additionals, function(additional) {
                                        if (additional.name === nomeCampoUtente) {
                                            additional.operator = 1;
                                            additional.multiple = users.join(';');
                                        }
                                        if (additional.name === nomeCampoDa) {
                                            additional.operator = 7;
                                            additional.valore1 = start;
                                            additional.valore2 = end;
                                        }
                                        model.searchModel.fields.push(additional);
                                    });
                                    arxivarRouteService.getPost('searches', {
                                            searchFilterDto: model.searchModel,
                                            selectFilterDto: model.selectModel,
                                            maxItems: 0,
                                            daAAndOr: 0
                                        })
                                        .then(function(data) {
                                            deferred.resolve(data);
                                        });
                                });
                            });

                        return deferred.promise;
                    };

                    var init = function() {
                        arxivarRouteService.get('users').then(function(users) {
                            scope.users = users;
                            var end = moment().hours(23).minutes(59).format();
                            executeSearch(_.map(scope.users, function(ut) {
                                return ut.user;
                            }), moment().hours(0).minutes(0).format(), end).then(function(data) {

                                var result = [];

                                _.forEach(data, function(row) {

                                    var start = new moment(_.find(row.columns, {
                                        'id': nomeCampoDa
                                    }).value);

                                    var valueOraInizio = _.find(row.columns, {
                                        'id': nomeCampoDaOra
                                    }).value;
                                    valueOraInizio = String('0000' + valueOraInizio).slice(-4);
                                    start.hour(parseInt(valueOraInizio.substring(0, 2)));
                                    start.minute(parseInt(valueOraInizio.substring(2)));

                                    var end = new moment(_.find(row.columns, {
                                        'id': nomeCampoA
                                    }).value);

                                    var valueOraFine = _.find(row.columns, {
                                        'id': nomeCampoAOra
                                    }).value;
                                    valueOraFine = String('0000' + valueOraFine).slice(-4);
                                    end.hour(parseInt(valueOraFine.substring(0, 2)));
                                    end.minute(parseInt(valueOraFine.substring(2)));

                                    result.push({
                                        title: _.find(row.columns, {
                                            'id': nomeCampoOggetto
                                        }).value,
                                        start: start.format(),
                                        end: end.format(),
                                        notes: _.find(row.columns, {
                                            'id': nomeCampoNote
                                        }).value,
                                        docNumber: _.find(row.columns, {
                                            'id': nomeCampoNumber
                                        }).value,
                                        hoursString: start.format('H:mm'),
                                        hoursAgo: moment().diff(start, 'hours') === 0 ? '' : moment().diff(start, 'hours') + ' ore fa'

                                    });

                                });

                                scope.events = result;
                            });
                        });
                    };

                    scope.downloadDocument = function(calendarEvent) {
                        if (_.has(calendarEvent, 'docNumber') && !_.isNil(calendarEvent.docNumber)) {
                            documentsService.getForProfile(calendarEvent.docNumber).then(documentsService.downloadStream);
                        }
                    };


                    init();


                }
            };
        }
    ]);
