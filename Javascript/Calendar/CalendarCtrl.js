angular.module('arxivar.plugins.controller').controller('CalendarCtrl', [
	'$scope', 'Calendar', 'arxivarResourceService', 'arxivarUserServiceCreator', '_', '$window', '$q', '$uibModal', 'moment', 'arxivarDocumentsService', 'arxivarRouteService',
	function ($scope, Calendar, arxivarResourceService, arxivarUserServiceCreator, _, $window, $q, $uibModal, moment, arxivarDocumentsService, arxivarRouteService) {


		var w = angular.element($window);
		var getHeight = function () {
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

		var executeSearch = function (users) {
			var model = {};
			return $q.all([arxivarResourceService.get('searches'), arxivarResourceService.get('searches/select/' + classe)])
				.then(function (values) {
					model = {
						searchModel: values[0],
						selectModel: {
							fields: values[1].fields,
							maxItems: values[1].maxItems
						}
					};

					//Preparo la search
					var classeField = _.find(model.searchModel.fields, function (field) {
						return (field.className === 'FieldBaseForSearchDocumentTypeDto');
					});


					classeField.operator = 3;
					classeField.valore1 = {
						documentType: classe,
						type2: 0,
						type3: 0
					};

					_.forEach(campiSelect, function (fieldName) {
						var campo = _.find(model.selectModel.fields, {
							'name': fieldName
						});
						if (campo) {
							campo.selected = true;
						}
					});

					return arxivarResourceService.get('searches/Additional/' + classe + '/' + 0 + '/' + 0);
				})
				.then(function (additionals) {
					_.forEach(additionals, function (additional) {
						if (additional.name === nomeCampoUtente) {
							additional.operator = 1;
							additional.multiple = users.join(';');
						}
						model.searchModel.fields.push(additional);
					});
					return arxivarResourceService.getPost('searches', {
						searchFilterDto: model.searchModel,
						selectFilterDto: model.selectModel,
						maxItems: 0,
						daAAndOr: 0
					});
				});
		};


		var getEvents = function (callback) {

			var selectedUsers = _.map(_.filter($scope.users, function (user) {
				if (user.hasOwnProperty('selected') && user.selected) {
					return true;
				} else {
					return false;
				}
			}), 'user');
			executeSearch(selectedUsers).then(function (response) {
				var data = response.data;

				var result = [];

				_.forEach($scope.users, function (user) {
					if (user.hasOwnProperty('selected') && user.selected) {
						var userSource = {
							user: user.user,
							events: []
						};

						_.filter(data, function (row) {
							var colonnaUtente = _.find(row.columns, {
								'id': nomeCampoUtente
							});
							if (colonnaUtente.value === user.user.toString()) {
								var start = moment(_.find(row.columns, {
									'id': nomeCampoDa
								}).value);
								var startTime = _.find(row.columns, {
									'id': nomeCampoDaOra
								}).value.toString();
								startTime = String('0000' + startTime).slice(-4);
								start.hour(parseInt(startTime.substring(0, 2)));
								start.minute(parseInt(startTime.substring(2)));

								var end = moment(_.find(row.columns, {
									'id': nomeCampoA
								}).value);
								var endTime = _.find(row.columns, {
									'id': nomeCampoAOra
								}).value.toString();
								endTime = String('0000' + endTime).slice(-4);
								end.hour(parseInt(endTime.substring(0, 2)));
								end.minute(parseInt(endTime.substring(2)));
								var oggetto = _.find(row.columns, {
									'id': nomeCampoOggetto
								}).value;
								if (_.isNil(oggetto)) {
									oggetto = "";
								}
								var nota = _.find(row.columns, {
									'id': nomeCampoNote
								}).value;
								userSource.events.push({
									title: oggetto + ' - ' + nota,
									start: start.format(),
									end: end.format(),
									resourceId: user.user.toString(),
									notes: _.find(row.columns, {
										'id': nomeCampoNote
									}).value,
									docNumber: _.find(row.columns, {
										'id': nomeCampoNumber
									}).value
								});
							}
						});

						result.push(userSource);
					}
				});

				var sources = _.filter(result, function (source) {

					var user = _.find($scope.users, {
						'user': source.user
					});

					if (!user) {
						return false;
					}


					source.color = user.color;

					_.forEach(source.events, function (event) {
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
		var initCalendar = function () {
			setTimeout(function () {
				$('#calendar').fullCalendar({
					height: getHeight(),
					schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
					// put your options and callbacks here
					header: {
						left: 'title',
						center: 'basicWeek,month,agendaWeek,agendaDay,timelineMonth',
						right: 'today prevYear,prev,next,nextYear'
					},
					locale: moment.locale(),
					events: function (start, end, timezone, callback) {
						getEvents(callback);
					},
					resources: function (callback) {
						var resurces = _.map(_.filter($scope.users, {
							'selected': true
						}), function (user) {
							return {
								id: user.user.toString(),
								title: user.description
							};
						});
						callback(resurces);
					},
					eventClick: function (calEvent) {
						$uibModal.open({
							animation: true,
							template: '<div class="inmodal"><div class="modal-header"><i class="fa fa-chain"></i> <strong>Informazioni sull\'evento</strong></div><div class="modal-body"><br/>' +
								'<strong>Oggetto: </strong><span>{{event.title}}</span><br/>' +
								'<strong>Da: </strong><span>{{event.start}}</span><br/>' +
								'<strong>A: </strong><span>{{event.end}}</span><br/>' +
								'<strong>Url profilo: </strong><a href="{{url}}" target="_blank" ><span>Go to profile</span></a><br/>' +
								'<strong>Note:  </strong><span>{{event.notes}}</span><br/>' +
								'<button class="btn btn-primary" type="button" ng-click="download()"><span translate="Documento" /></button></div>' +
								'<div class="modal-footer"><button class="btn btn-primary" type="button" ng-click="confirm()"><span translate="Ok" /></button></div></div>',
							controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
								$scope.url = arxivarRouteService.getURLProfileReadonly(calEvent.docNumber);
								$scope.event = {
									title: calEvent.title,
									start: calEvent.start.format('L HH:mm'),
									end: calEvent.end.format('L HH:mm'),
									notes: calEvent.notes
								};

								$scope.download = function () {
									arxivarDocumentsService.getDocumentByDocnumber(calEvent.docNumber);
								};

								$scope.confirm = function () {
									$uibModalInstance.close();
								};

							}]
						});
					}
				});

				$scope.$watch('users', function () {
					$('#calendar').fullCalendar('refetchResources');
					$('#calendar').fullCalendar('refetchEvents');
				}, true);

				w.bind('resize', function () {
					$('#calendar').fullCalendar('option', 'height', getHeight());
				});
			}, 0)

		};
		$q.all([arxivarUserServiceCreator.create(),
		arxivarResourceService.get('users')
		])
			.then(function (result) {
				var userService = result[0];
				var users = result[1];

				var currentUser = _.find(users, {
					'user': parseInt(userService.getUserId())
				});
				_.forEach(users, function (user) {
					user.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
				});
				currentUser.selected = true;
				$scope.users = _.reject(_.filter(users, {
					'category': 0
				}), {
					'user': 0
				});
				initCalendar();
			});


	}
]);
