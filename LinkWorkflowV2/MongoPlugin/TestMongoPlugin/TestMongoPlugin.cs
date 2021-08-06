using MongoPlugin.JsonHelper;
using NUnit.Framework;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace MongoPluginTest
{
    public class Tests
    {
        private MongoPlugin.MongoPlugin mongoPlugin;
        
        [SetUp]
        public void Setup()
        {
            mongoPlugin = new MongoPlugin.MongoPlugin();
        }

        [Test]
        public async Task TestFind()
        {
            mongoPlugin.DatabaseName = "Workflow";
            //mongoPlugin.CollectionName = "processVars";
            //mongoPlugin.QueryType = "Find";
            mongoPlugin.QueryText = "{priority:1, diagramName:'Fea'}";

            await mongoPlugin.ExecuteAsync(null);
        }

        [Test]
        public async Task TestAggregate()
        {
            mongoPlugin.DatabaseName = "Workflow";
            //mongoPlugin.CollectionName = "processes";
            //mongoPlugin.QueryType = "Aggregate";
            mongoPlugin.QueryText = "[{$match: {status:10}},{$project: {diagramId:0}}]";

            await mongoPlugin.ExecuteAsync(null);
        }

		[Test]
		public async Task TestGeneric()
        {
			mongoPlugin.DatabaseName = "Workflow";
            //mongoPlugin.QueryText = @"{
            //		'aggregate': 'log',
            //		'allowDiskUse': true,
            //		'pipeline':[

            //			{
            //		'$match':{
            //			'Level':'Information'

            //				}
            //	}
            //		],
            //		'cursor': { 'batchSize': 1000 }
            //}";
            mongoPlugin.QueryText = @"{
					'find': 'processes',
					'filter':	{
					'_id' : UUID('521cd66e-311f-412e-8372-29265aefe2a5')
					},
					'allowDiskUse' : true,
				}";
            //mongoPlugin.QueryText = @"{
            //		'find': 'processes',
            //		'allowDiskUse' : true,
            //	}";


            await mongoPlugin.ExecuteAsync(null);
        }

        [Test]
        public void TestConvertJson()
        {
            #region json

            string json = @"[
	{
		'_id': {
			'$binary': 'rapX275T/EaZQ055VYsl5w==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'Primo Workflow',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [
				{
					'_t': '0',
					'kind': 0,
					'docnumber': 1100,
					'revision': 0,
					'filename': '1721956420_SL_14796 - Copy (12).docx',
					'toSend': false,
					'isLocal': false
				},
				{
					'_t': '1',
					'kind': 2,
					'docnumber': 1100,
					'revision': 0,
					'filename': '1721956420_SL_14796 - Copy (12).docx',
					'toSend': false,
					'isLocal': false
				}
			],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1623399353389
		},
		'lastUpdateUtc': {
			'$date': 1623399354146
		},
		'startDateUtc': {
			'$date': 1623399353688
		},
		'endDateUtc': {
			'$date': 1623399354146
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null
	},
	{
		'_id': {
			'$binary': 'btYcUh8xLkGDcikmWu/ipQ==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'Primo Workflow',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '3',
			'eventPriority': null,
			'documents': [
				{
					'_t': '0',
					'kind': 0,
					'docnumber': 1099,
					'revision': 0,
					'filename': '1721956420_SL_14796 - Copy (11).docx',
					'toSend': false,
					'isLocal': false
				}
			],
			'htmlNotes': [],
			'externalParameters': [],
			'eventIdentifier': '13',
			'eventMetadata': [
				{
					'key': 'Event',
					'value': 'Manual'
				}
			],
			'eventConfiguration': [
				{
					'key': 'PaMode',
					'value': '0'
				}
			],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1623399384675
		},
		'lastUpdateUtc': {
			'$date': 1623399386049
		},
		'startDateUtc': {
			'$date': 1623399384786
		},
		'endDateUtc': {
			'$date': 1623399386049
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null
	},
	{
		'_id': {
			'$binary': 'xNEraANogUS+OPhvExOXDQ==',
			'$type': '03'
		},
		'diagramRevision': 1,
		'diagramName': 'Primo Workflow',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '3',
			'eventPriority': null,
			'documents': [
				{
					'_t': '0',
					'kind': 0,
					'docnumber': 1101,
					'revision': 0,
					'filename': '1721956420_SL_14796 - Copy (13).docx',
					'toSend': false,
					'isLocal': false
				}
			],
			'htmlNotes': [],
			'externalParameters': [],
			'eventIdentifier': '13',
			'eventMetadata': [
				{
					'key': 'Event',
					'value': 'Manual'
				}
			],
			'eventConfiguration': [
				{
					'key': 'PaMode',
					'value': '0'
				}
			],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1623399847062
		},
		'lastUpdateUtc': {
			'$date': 1623399847456
		},
		'startDateUtc': {
			'$date': 1623399847119
		},
		'endDateUtc': {
			'$date': 1623399847456
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null
	},
	{
		'_id': {
			'$binary': 'K+y/yizu5EeP6POPHddybg==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'Primo Workflow',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '3',
			'eventPriority': null,
			'documents': [
				{
					'_t': '0',
					'kind': 0,
					'docnumber': 1100,
					'revision': 0,
					'filename': '1721956420_SL_14796 - Copy (12).docx',
					'toSend': false,
					'isLocal': false
				}
			],
			'htmlNotes': [],
			'externalParameters': [],
			'eventIdentifier': '13',
			'eventMetadata': [
				{
					'key': 'Event',
					'value': 'Manual'
				}
			],
			'eventConfiguration': [
				{
					'key': 'PaMode',
					'value': '0'
				}
			],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1623405813944
		},
		'lastUpdateUtc': {
			'$date': 1623405815240
		},
		'startDateUtc': {
			'$date': 1623405813982
		},
		'endDateUtc': {
			'$date': 1623405815240
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null
	},
	{
		'_id': {
			'$binary': 'Hm/YeCZGgEOLGXTOJsla8w==',
			'$type': '03'
		},
		'diagramRevision': 2,
		'diagramName': 'Primo Workflow',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '3',
			'eventPriority': null,
			'documents': [
				{
					'_t': '0',
					'kind': 0,
					'docnumber': 1101,
					'revision': 0,
					'filename': '1721956420_SL_14796 - Copy (13).docx',
					'toSend': false,
					'isLocal': false
				}
			],
			'htmlNotes': [],
			'externalParameters': [],
			'eventIdentifier': '13',
			'eventMetadata': [
				{
					'key': 'Event',
					'value': 'Manual'
				}
			],
			'eventConfiguration': [
				{
					'key': 'PaMode',
					'value': '0'
				}
			],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1623406715965
		},
		'lastUpdateUtc': {
			'$date': 1623406717682
		},
		'startDateUtc': {
			'$date': 1623406716425
		},
		'endDateUtc': {
			'$date': 1623406717682
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null
	},
	{
		'_id': {
			'$binary': 'cBR9gfnWKUe075mT1zG1KQ==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'Fea',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '3',
			'eventPriority': null,
			'documents': [
				{
					'_t': '0',
					'kind': 0,
					'docnumber': 1111,
					'revision': 0,
					'filename': 'InformativaFea.pdf',
					'toSend': false,
					'isLocal': false
				}
			],
			'htmlNotes': [],
			'externalParameters': [],
			'eventIdentifier': '14',
			'eventMetadata': [
				{
					'key': 'Event',
					'value': 'Manual'
				}
			],
			'eventConfiguration': [
				{
					'key': 'PaMode',
					'value': '0'
				}
			],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [
			{
				'lang': 'IT',
				'value': 'Workflow di test per firma digitale'
			}
		],
		'details': [],
		'creationDateUtc': {
			'$date': 1624271066244
		},
		'lastUpdateUtc': {
			'$date': 1624271319203
		},
		'startDateUtc': {
			'$date': 1624271066738
		},
		'endDateUtc': {
			'$date': 1624271319203
		},
		'deleteDateUtc': null,
		'messages': [
			{
				'dateTimeUtc': {
					'$date': 1624271319186
				},
				'messageLevel': 1,
				'message': 'Error executing operation: Error in ESignInsert: Error calling ArxESignInsertArxESign: {\'userMessage\':\'ARXeSigN insert error: Value cannot be null.\\r\\nParameter name: apiToken\',\'exceptionCode\':0}'
			}
		],
		'notes': [],
		'customDeleteOption': null
	},
	{
		'_id': {
			'$binary': 'Rq7lnco1o0WCW6atz7pYbw==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'Fea',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '3',
			'eventPriority': null,
			'documents': [
				{
					'_t': '0',
					'kind': 0,
					'docnumber': 1111,
					'revision': 0,
					'filename': 'InformativaFea.pdf',
					'toSend': false,
					'isLocal': false
				}
			],
			'htmlNotes': [],
			'externalParameters': [],
			'eventIdentifier': '14',
			'eventMetadata': [
				{
					'key': 'Event',
					'value': 'Manual'
				}
			],
			'eventConfiguration': [
				{
					'key': 'PaMode',
					'value': '0'
				}
			],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [
			{
				'lang': 'IT',
				'value': 'Workflow di test per firma digitale'
			}
		],
		'details': [],
		'creationDateUtc': {
			'$date': 1624271550246
		},
		'lastUpdateUtc': {
			'$date': 1624271636683
		},
		'startDateUtc': {
			'$date': 1624271550274
		},
		'endDateUtc': {
			'$date': 1624271636683
		},
		'deleteDateUtc': null,
		'messages': [
			{
				'dateTimeUtc': {
					'$date': 1624271636670
				},
				'messageLevel': 1,
				'message': 'Error executing operation: Error in ESignInsert: Error calling ArxESignInsertArxESign: {\'userMessage\':\'ARXeSigN insert error: Value cannot be null.\\r\\nParameter name: apiToken\',\'exceptionCode\':0}'
			}
		],
		'notes': [],
		'customDeleteOption': null
	},
	{
		'_id': {
			'$binary': '2Pd5UxrgQUih64chxdk5VA==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'AR-4003',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '3',
			'eventPriority': null,
			'documents': [
				{
					'_t': '0',
					'kind': 0,
					'docnumber': 1098,
					'revision': 0,
					'filename': '1721956420_SL_14796 - Copy (10).docx',
					'toSend': false,
					'isLocal': false
				}
			],
			'htmlNotes': [],
			'externalParameters': [],
			'eventIdentifier': '15',
			'eventMetadata': [
				{
					'key': 'Event',
					'value': 'Manual'
				}
			],
			'eventConfiguration': [
				{
					'key': 'PaMode',
					'value': '0'
				}
			],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [
			{
				'lang': 'IT',
				'value': 'Test per AR-4003'
			}
		],
		'details': [],
		'creationDateUtc': {
			'$date': 1624357083557
		},
		'lastUpdateUtc': {
			'$date': 1624357084093
		},
		'startDateUtc': {
			'$date': 1624357083797
		},
		'endDateUtc': {
			'$date': 1624357084093
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null
	},
	{
		'_id': {
			'$binary': 'm3DbK6WMhkKjrw5DYaYpbw==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'AR-4003-SubProcess',
		'hasCustomDiagram': true,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '1',
			'eventPriority': null,
			'documents': [
				{
					'_t': '1',
					'kind': 2,
					'processDocumentId': {
						'$binary': 'lVTJBVuP40mp1SWztGYuag==',
						'$type': '03'
					}
				}
			],
			'htmlNotes': [],
			'externalParameters': [],
			'diagramId': {
				'$binary': 's2a8TVvU/U2bWmfXM05uqA==',
				'$type': '03'
			},
			'parentProcessId': {
				'$binary': 'TaPZoeD0NkOMQ5pIMM2c+w==',
				'$type': '03'
			},
			'parentDiagramId': {
				'$binary': 'tLjt8lzP1kSuTjL2ELdydg==',
				'$type': '03'
			},
			'parentPriority': 1,
			'parentDiagramRevision': 12,
			'parentDiagramName': 'AR-4003',
			'detached': false,
			'srcProcessObjectId': {
				'$binary': 'A6oU4zGRJ0Cb9iCEyt+HSg==',
				'$type': '03'
			}
		},
		'descriptions': [
			{
				'lang': 'IT',
				'value': 'Test per AR-4003'
			}
		],
		'details': [],
		'creationDateUtc': {
			'$date': 1624436772248
		},
		'lastUpdateUtc': {
			'$date': 1624436974742
		},
		'startDateUtc': {
			'$date': 1624436772325
		},
		'endDateUtc': {
			'$date': 1624436974742
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null
	},
	{
		'_id': {
			'$binary': 'onPRlEm8JE6TQvuZt1+mxQ==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'TestMongoFind',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625039338837
		},
		'lastUpdateUtc': {
			'$date': 1625041638918
		},
		'startDateUtc': {
			'$date': 1625039339296
		},
		'endDateUtc': {
			'$date': 1625041638918
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	},
	{
		'_id': {
			'$binary': 'H2Ew/o36iUu0C8rBUvU6WA==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'TestMongoFind',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625041742612
		},
		'lastUpdateUtc': {
			'$date': 1625041757482
		},
		'startDateUtc': {
			'$date': 1625041742724
		},
		'endDateUtc': {
			'$date': 1625041757482
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	},
	{
		'_id': {
			'$binary': 'POASBCwiRk6XubAGXTJu3A==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'TestMongoFind',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625042074637
		},
		'lastUpdateUtc': {
			'$date': 1625042182573
		},
		'startDateUtc': {
			'$date': 1625042074688
		},
		'endDateUtc': {
			'$date': 1625042182573
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	},
	{
		'_id': {
			'$binary': '1PMtREzPSkCUlV+T1F2rkw==',
			'$type': '03'
		},
		'diagramRevision': 1,
		'diagramName': 'TestMongoFind',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625046827970
		},
		'lastUpdateUtc': {
			'$date': 1625046839897
		},
		'startDateUtc': {
			'$date': 1625046828041
		},
		'endDateUtc': {
			'$date': 1625046839897
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	},
	{
		'_id': {
			'$binary': 'ojNitpneNUShWeqmzm0fIg==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'TestMongoAggregate',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625046846556
		},
		'lastUpdateUtc': {
			'$date': 1625046847025
		},
		'startDateUtc': {
			'$date': 1625046846618
		},
		'endDateUtc': {
			'$date': 1625046847025
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	},
	{
		'_id': {
			'$binary': 'zKSMJpSiUU2oMYNZMjitGg==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'TestAdvancedPlugin',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625127874583
		},
		'lastUpdateUtc': {
			'$date': 1625150137685
		},
		'startDateUtc': {
			'$date': 1625127875004
		},
		'endDateUtc': {
			'$date': 1625150137685
		},
		'deleteDateUtc': null,
		'messages': [
			{
				'dateTimeUtc': {
					'$date': 1625127901263
				},
				'messageLevel': 1,
				'message': 'Error executing operation: Error calling ProfilesGetAdditionalAll: {\'userMessage\':\'User not authenticated\',\'exceptionCode\':0}'
			},
			{
				'dateTimeUtc': {
					'$date': 1625145999491
				},
				'messageLevel': 1,
				'message': 'Error executing operation: username is a required property for AuthenticationTokenRequestDTO and cannot be null'
			}
		],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	},
	{
		'_id': {
			'$binary': 'TkfIPExZsUeKw/dZe8cZeA==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'TestAdvancedPlugin',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625127932780
		},
		'lastUpdateUtc': {
			'$date': 1625225852062
		},
		'startDateUtc': {
			'$date': 1625127932817
		},
		'endDateUtc': {
			'$date': 1625225852062
		},
		'deleteDateUtc': null,
		'messages': [
			{
				'dateTimeUtc': {
					'$date': 1625145999499
				},
				'messageLevel': 1,
				'message': 'Error executing operation: username is a required property for AuthenticationTokenRequestDTO and cannot be null'
			},
			{
				'dateTimeUtc': {
					'$date': 1625147033066
				},
				'messageLevel': 1,
				'message': 'Error executing operation: Error calling ProfilesGetAdditionalAll: {\'userMessage\':\'User not authenticated\',\'exceptionCode\':0}'
			}
		],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	},
	{
		'_id': {
			'$binary': '2HL6k+6GMUiY8S8G5FgUAw==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'TestAdvancedPlugin',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625129719469
		},
		'lastUpdateUtc': {
			'$date': 1625225852062
		},
		'startDateUtc': {
			'$date': 1625129720044
		},
		'endDateUtc': {
			'$date': 1625225852062
		},
		'deleteDateUtc': null,
		'messages': [
			{
				'dateTimeUtc': {
					'$date': 1625145999491
				},
				'messageLevel': 1,
				'message': 'Error executing operation: username is a required property for AuthenticationTokenRequestDTO and cannot be null'
			},
			{
				'dateTimeUtc': {
					'$date': 1625147005825
				},
				'messageLevel': 1,
				'message': 'Error executing operation: Error calling ProfilesGetAdditionalAll: {\'userMessage\':\'User not authenticated\',\'exceptionCode\':0}'
			}
		],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	},
	{
		'_id': {
			'$binary': 'qhvCGUbF5EWSDEaN/hPaeQ==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'TestAdvancedPlugin',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': true
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625132883922
		},
		'lastUpdateUtc': {
			'$date': 1625150137685
		},
		'startDateUtc': {
			'$date': 1625132889277
		},
		'endDateUtc': {
			'$date': 1625150137685
		},
		'deleteDateUtc': null,
		'messages': [
			{
				'dateTimeUtc': {
					'$date': 1625146009681
				},
				'messageLevel': 1,
				'message': 'Error executing operation: username is a required property for AuthenticationTokenRequestDTO and cannot be null'
			}
		],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	},
	{
		'_id': {
			'$binary': 'IXMeGt5UrU+nUVtUem8AWQ==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'TestAdvancedPlugin',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': false
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625146039192
		},
		'lastUpdateUtc': {
			'$date': 1625225852426
		},
		'startDateUtc': {
			'$date': 1625146039382
		},
		'endDateUtc': {
			'$date': 1625225852426
		},
		'deleteDateUtc': null,
		'messages': [
			{
				'dateTimeUtc': {
					'$date': 1625147005825
				},
				'messageLevel': 1,
				'message': 'Error executing operation: Error calling ProfilesGetAdditionalAll: {\'userMessage\':\'User not authenticated\',\'exceptionCode\':0}'
			}
		],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	},
	{
		'_id': {
			'$binary': 'k2960n8TNEKeLSkGtMSfCQ==',
			'$type': '03'
		},
		'diagramRevision': 0,
		'diagramName': 'TestAdvancedPlugin',
		'hasCustomDiagram': false,
		'status': 10,
		'priority': 1,
		'activationMode': {
			'_t': '0',
			'eventPriority': null,
			'documents': [],
			'htmlNotes': [],
			'externalParameters': [],
			'userInfo': {
				'dmUtentiId': 2,
				'bu': 'AbleBS',
				'description': 'Admin',
				'isGroup': false,
				'isAdmin': true
			}
		},
		'descriptions': [],
		'details': [],
		'creationDateUtc': {
			'$date': 1625146993916
		},
		'lastUpdateUtc': {
			'$date': 1625150137685
		},
		'startDateUtc': {
			'$date': 1625149744384
		},
		'endDateUtc': {
			'$date': 1625150137685
		},
		'deleteDateUtc': null,
		'messages': [],
		'notes': [],
		'customDeleteOption': null,
		'useExtraGrant': false
	}
]";

			#endregion

			var parsedData = JsonHelper.ParseStructureAndData(json);
		}

		[Test]
		public void TestRegex()
        {
			string expression = @"{
					'aggregate': '{@collection@}',
					'allowDiskUse': true,
					'pipeline':[

						{
					'$match':{
						'Level':'{@level@}'

							}
				}
					],
					'cursor': { 'batchSize': 1000 }
			}";

			var regex = new Regex(@"{@(\w+)@}");
			var matches = regex.Matches(expression);
			
        }
    }
}