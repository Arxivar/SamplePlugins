angular.module('arxivar.plugins').factory('CalendarCommand', ['$q', '$uibModal', 'PluginCommand', function($q, $uibModal, PluginCommand) {

    // MANDATORY settings in order for the plugin to work.
    var requiredSettings = {
        id: '086ef2a8-99de-4360-83b4-8c867a10b340', // Unique plugin identifier (type: string)
        name: 'CalendarCommand', // Plugin name. Spaces and dots not allowed (type: string)
        label: 'ToAppointment', // User Interface label (type: string)
        description: 'Command for convert a profile to a Calendar item', // Plugin description (type: string)
        author: 'Abletech srl', // Plugin author (type: string)
        minVersion: '0.0.1', // Minimun portal version this plugin supports. (type: string, format example: 0.0.1)
        requireRefresh: true, // If this plugin requires grid data refresh (type boolean. Default: false)
        icon: 'fas fa-calendar-day'
    };

    // OPTIONAL settings. These objects require the following properties: name, description, defaultValue and type.
    // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
    var customSettings = [{
            name: 'nomeCampoUtente',
            description: 'Campo aggiuntivo utente appuntamento',
            defaultValue: 'COMBO195_47',
            type: 'string'
        },
        {
            name: 'nomeCampoDa',
            description: 'Campo aggiuntivo data inizio',
            defaultValue: 'DATA196_47',
            type: 'string'
        },
        {
            name: 'nomeCampoA',
            description: 'Campo aggiuntivo data fine',
            defaultValue: 'DATA197_47',
            type: 'string'
        },
        {
            name: 'nomeCampoDaOra',
            description: 'Campo aggiuntivo ora inizio',
            defaultValue: 'NUMERIC198_47',
            type: 'string'
        },
        {
            name: 'nomeCampoAOra',
            description: 'Campo aggiuntivo ora fine',
            defaultValue: 'NUMERIC199_47',
            type: 'string'
        },
        {
            name: 'nomeCampoNote',
            description: 'Campo aggiuntivo note appuntamento',
            defaultValue: 'TESTO200_47',
            type: 'string'
        },
        {
            name: 'classe',
            description: 'Classe calendari',
            defaultValue: '47',
            type: 'string'
        },
        //{name: '', description: '', defaultValue:'', type: 'string'},
    ];

    // OPTIONAL settings for specific users. These objects require the following properties: name, description, defaultValue and type.
    // Allowed types are: string, number, boolean or date (Date type is a string UTC ISO 8601 (https://it.wikipedia.org/wiki/ISO_8601) format
    var userSettings = [
        //{name: '', description: '', defaultValue:'', type: 'string'},
    ];

    var myPlugin = new PluginCommand(requiredSettings, customSettings, userSettings);

    // This function is a promise with asyncronous logic to determine if this plugin can run. Input parameters: array of docnumbers.
    myPlugin.canRun = function(params) {
        return params.hasOwnProperty('docnumbers') ? $q.when(params.docnumbers.length >= 1) : $q.resolve(false);
    };

    // This function is a promise with asyncronous run logic. Input parameters: array of docnumbers.
    myPlugin.run = function(params) {
        var thisPlugin = myPlugin;
        myPlugin.canRun(params).then(function(canRun) {
            if (canRun) {

                var classe = thisPlugin.customSettings[6].value;
                var nomeCampoUtente = thisPlugin.customSettings[0].value;;
                var nomeCampoDa = thisPlugin.customSettings[1].value;;
                var nomeCampoA = thisPlugin.customSettings[2].value;;
                var nomeCampoDaOra = thisPlugin.customSettings[3].value;;
                var nomeCampoAOra = thisPlugin.customSettings[4].value;;
                var nomeCampoNote = thisPlugin.customSettings[5].value;;


                $uibModal.open({
                    animation: true,
                    template: '<div class="inmodal"><div class="modal-header"><i class="fa fa-calendar"></i> <strong>Converti in appuntamento</strong></div><div class="modal-body"><br/>' +
                        '<div class="row" style="margin-top: 5px;"><div class="col-md-2"><strong>Da: </strong><span>{{event.startFormat}}</span></div><div class="col-md-10"><arx-calendar model="da" id=campoda obbligatorio=false errors="errori" showError=false time=true /></div></div>' +
                        '<div class="row" style="margin-top: 5px;"><div class="col-md-2"><strong>A: </strong><span>{{event.endFormat}}</span></div><div class="col-md-10"><arx-calendar model="a" id=campoa obbligatorio=false errors="errori" showError=false time=true /></div></div>' +
                        '<div class="row" style="margin-top: 5px;"><div class="col-md-2"><strong>Note: </strong><span>{{event.notes}}</span></div><div class="col-md-12"><arx-textarea model="notes" id=camponote name=note obbligatorio=false errors="errori" showError=false time=true num-max-char=1000 num-max-row=3 show=true change=null /></div></div>' +
                        '</div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" type="button" ng-click="confirm()"><span translate="Ok" /></button></div></div>',
                    controller: ['$scope', '$uibModalInstance', 'mediatorService', 'moment', 'arxivarResourceService', '_',
                        function($scope, $uibModalInstance, mediatorService, moment, arxivarResourceService, _) {

                            //$scope.event = calEvent;
                            //$scope.event.startFormat = moment($scope.event.start).format('DD/MM/YYYY HH:mm:ss');
                            //$scope.event.endFormat = moment($scope.event.end).format('DD/MM/YYYY HH:mm:ss');
                            $scope.da = moment();
                            $scope.a = moment();
                            $scope.notes = '';
                            $scope.errori = [];

                            $scope.confirm = function() {
                                //[Route("Additional/{tipoUno}/{tipoDue}/{tipoTre}/{aoo?}")]
                                arxivarResourceService.get('profiles/' + params.docnumbers[0] + '/schema/false').then(function(data) {

                                    //Cambio la classe
                                    _.find(data.fields, {
                                        'className': 'DocumentTypeFieldDTO'
                                    }).value = classe;
                                    //Rimuovo i vecchi aggiuntivi
                                    _.remove(data.fields, function(field) {
                                        return field.isAdditional;
                                    });
                                    //Ricevo i nuovi aggiuntivi per la classe dei calendari in modo da valo

                                    arxivarResourceService.get('profiles/Additional/' + classe + '/0/0').then(function(additionals) {

                                        _.forEach(additionals, function(additional) {
                                            if (additional.name === nomeCampoDa) {
                                                additional.value = $scope.da;
                                            }
                                            if (additional.name === nomeCampoA) {
                                                additional.value = $scope.a;
                                            }
                                            if (additional.name === nomeCampoDaOra) {
                                                additional.value = parseInt(moment($scope.da).format('HHmm'));
                                            }
                                            if (additional.name === nomeCampoAOra) {
                                                additional.value = parseInt(moment($scope.a).format('HHmm'));
                                            }
                                            if (additional.name === nomeCampoNote) {
                                                additional.value = $scope.notes;
                                            }
                                            if (additional.name === nomeCampoUtente) {
                                                additional.value = 2;
                                            }

                                            data.fields.push(additional);

                                        });

                                        //Devo fare la put

                                        var profile = {
                                            id: params.docnumbers[0],
                                            fields: data.fields,
                                            authorityData: data.authorityData,
                                            attachments: data.attachments,
                                            notes: data.notes
                                        };

                                        arxivarResourceService.update('profiles/' + params.docnumbers[0], profile)
                                            .then(function() {
                                                mediatorService.publish('updateGridItems', 'CalendarCommand', {
                                                    mode: 'entireRow',
                                                    storedData: {
                                                        data: [{
                                                            DOCNUMBER: profile.id
                                                        }]
                                                    }
                                                });
                                                $uibModalInstance.close();
                                            });
                                    });


                                });
                            };

                        }
                    ]
                });


            }
        });
    };


    return {
        plugin: myPlugin
    };
}]);
