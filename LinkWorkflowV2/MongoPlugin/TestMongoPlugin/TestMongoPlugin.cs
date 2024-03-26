using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Abletech.WebApi.Client.ArxivarWorkflow.Api;
using Abletech.WebApi.Client.ArxivarWorkflow.Client;
using Abletech.WebApi.Client.ArxivarWorkflow.Model;
using Abletech.Workflow.Plugins.Configuration;
using Abletech.Workflow.Plugins.Context;
using Abletech.Workflow.Plugins.Link;
using Abletech.Workflow.Plugins.Services;
using FizzWare.NBuilder;
using Microsoft.Extensions.Configuration;
using MongoPlugin;
using MongoPlugin.JsonHelper;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NSubstitute;
using NUnit.Framework;
using TestMongoPlugin.Models;

namespace TestMongoPlugin
{
    public class TestMongoPlugin
    {
        private const string TestCollectionName = "TestCollection";
        private readonly MongoConfiguration _mongoConfiguration;
        
        private MongoPlugin.MongoPlugin _mongoPlugin;
        private MongoQuery _mongoQuery;

        public TestMongoPlugin()
        {
            var configuration = LoadConfiguration();

            _mongoConfiguration = configuration.GetSection("Mongo").Get<MongoConfiguration>();
        }

        private static IConfigurationRoot LoadConfiguration()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            var configuration = builder.Build();
            return configuration;
        }

        [SetUp]
        public void Setup()
        {
            _mongoPlugin = new MongoPlugin.MongoPlugin(_mongoConfiguration.DatabaseName);
            _mongoQuery = new MongoQuery(_mongoConfiguration.ConnectionString, _mongoConfiguration.DatabaseName);

            DropCollections();

            // Sample data setup
            var data = Builder<TestModel>.CreateListOfSize(10)
                .All()
                .With(x => x.Details = Builder<TestModelDetails>.CreateListOfSize(3).Build().ToList())
                .Build();

            var collection = _mongoQuery.MongoDatabase.GetCollection<TestModel>(TestCollectionName);
            collection.InsertMany(data);
        }

        private void DropCollections()
        {
            _mongoQuery.MongoDatabase.DropCollection(TestCollectionName);
        }

        [TearDown]
        public void TearDown()
        {
            DropCollections();
        }

        [Test]
        public async Task TestFind()
        {
            // estraggo oggetti con diagramRevision >= 6
            // sono 5 oggetti, 3 dettagli ciascuno = 15

            _mongoPlugin.QueryText = @$"{{
					'find': '{TestCollectionName}',
					'filter': {{
						diagramRevision: {{ $gte: 6 }}
					}}
				}}";

            await _mongoPlugin.ExecuteAsync(null);
            var jsonResult = _mongoPlugin.Result;

            var parsedData = JsonHelper.ParseStructureAndData(jsonResult);
            Assert.NotNull(parsedData);
            Assert.AreEqual(15, parsedData.Data.Count);
        }
        
        [Test]
        public async Task TestAdvancedConfiguration()
        {
            var diagNameVarName = "diagramName";
            var diagRevisionVarName = "diagramRevision";
            
            var idValue = "00000000-0000-0000-0000-000000000002";
            var diagNameValue = "DiagramName2";
            var diagRevisionValue = 2;

            var outVarName = "OutVarMatrix01";

            // Mock initialization
            var processApiMock = Substitute.For<IProcessesApi>();
            var diagramApiMock = Substitute.For<IDiagramsApi>();
            var processVariablesApiMock = Substitute.For<IProcessVariablesApi>();
            var authProviderMock = Substitute.For<IAuthProvider>();

            // Mock setup
            authProviderMock.AccessToken.Returns("TestAccessToken");
            authProviderMock.User.Returns(new ArxivarUserInfo(2, true, "AbleBS", "Admin", "EN"));

            processApiMock.Configuration.Returns(new Configuration());
            processApiMock.ApiV1ProcessesProcessIdVariablesGetAsync(Arg.Any<Guid?>(), Arg.Any<int?>(), Arg.Any<int?>())
                .Returns(new ProcessVariableRmSearchResponseRm
                {
                    ResultCount = new SearchResultCountRm(),
                    Items =
                    [
                        new ProcessVariableStringRm
                        {
                            Value = diagNameValue,
                            Id = Guid.NewGuid(),
                            VariableType = 1,
                            VariableDefinition = new DiagramVariableRm()
                            {
                                Configuration = new VariableIntConfigurationRm
                                {
                                    Name = diagNameVarName
                                }
                            }
                        },
                        new ProcessVariableIntRm
                        {
                            Value = diagRevisionValue,
                            Id = Guid.NewGuid(),
                            VariableType = 2,
                            VariableDefinition = new DiagramVariableRm()
                            {
                                Configuration = new VariableIntConfigurationRm
                                {
                                    Name = diagRevisionVarName
                                }
                            }
                        },
                        new ProcessVariableMatrixRm
                        {
                            Values = null,
                            Id = Guid.NewGuid(),
                            VariableType = 7,
                            VariableDefinition = new DiagramVariableRm
                            {
                                Configuration = new VariableIntConfigurationRm
                                {
                                    Name = outVarName
                                }
                            }
                        }
                    ]
                });

            diagramApiMock.Configuration.Returns(new Configuration());
            diagramApiMock.ApiV1DiagramsIdVariablesGetAsync(Arg.Any<Guid?>())
                .Returns([
                    new DiagramVariableRm
                    {
                        Id = Guid.NewGuid(),
                        DiagramId = Guid.Empty,
                        Configuration = new VariableMatrixConfigurationRm
                        {
                            Name = outVarName
                        }
                    }
                ]);

            processVariablesApiMock.Configuration.Returns(new Configuration());
            processVariablesApiMock.ApiV1ProcessVariablesSetPostAsync(Arg.Do<List<ProcessSetVariableRm>>(x =>
            {
                Assert.AreEqual(1, x.Count);
                var setMatrixValue = x.First() as ProcessSetMatrixVariableRm;
                Assert.NotNull(setMatrixValue);
                Assert.NotNull(setMatrixValue.Values);
                Assert.AreEqual(1, setMatrixValue.Values.Count);
                var listObject = setMatrixValue.Values[0];
                Assert.NotNull(listObject);
                Assert.AreEqual(2, listObject.Count);
                Assert.AreEqual(idValue, listObject[0]);
                Assert.AreEqual(diagNameValue, listObject[1]);
            })).Returns([]);

            // Mock injection
            _mongoPlugin.ProcessApi = processApiMock;
            _mongoPlugin.DiagramsApi = diagramApiMock;
            _mongoPlugin.ProcessVariablesApi = processVariablesApiMock;
            _mongoPlugin.AuthProvider = authProviderMock;

            var advConfigItems = new List<WorkflowPluginConfigurationItem>
            {
                new WorkflowPluginConfigurationStringItem { Name = "DatabaseName", Value = "Workflow" },
                new WorkflowPluginConfigurationBoolItem { Name = "UseAdvancedConfiguration", Value = true },
                new WorkflowPluginConfigurationStringItem { Name = "OutputVariableName", Value = outVarName },
                new WorkflowPluginConfigurationStringItem { Name = "Columns", Value = "cursor.firstBatch[]._id;cursor.firstBatch[].diagramName" },
                new WorkflowPluginConfigurationStringItem
                {
                    Name = "QueryText",
                    Value = $@"{{
						'find': '{TestCollectionName}',
						'filter': {{
							diagramName: '#@{diagNameVarName}@#', 
							diagramRevision: #@{diagRevisionVarName}@#
						}}
					}}"
                }
            };

            _mongoPlugin.EnableAdvancedConfiguration(advConfigItems);
            await _mongoPlugin.ExecuteAsync(new WorkflowPluginLinkContext(
                new DiagramContext(Guid.NewGuid(), "name", 0),
                new ProcessContext(Guid.NewGuid(), DateTime.Now),
                new OperationContext(Guid.NewGuid(), Guid.NewGuid(), DateTime.Now, 1, null),
                new LinkObjectContext(Guid.NewGuid(), Guid.NewGuid())
            ));
        }

        [Test]
        public void TestRegex()
        {
            var expression = @"{
					'aggregate': '{@collection@}',
					'allowDiskUse': true,
					'pipeline':[
					    {
					        '$match':{ 'Level':'{@level@}'	}
				        }
					],
					'cursor': { 'batchSize': 1000 }
			    }";

            var regex = new Regex(@"{@(\w+)@}");
            var matches = regex.Matches(expression);
            Assert.AreEqual(2, matches.Count);
        }

        [Test]
        public void TestSubstituteNode()
        {
            // Sample JSON
            var json = @"
            {
                'description': 'Bla bla',
                'city': 'New York',
                'children': [
                    {
                        'name': 'Alice',
                        'age': 5
                    },
                    {
                        'name': 'Bob',
                        'age': 8
                    }
                ]
            }";

            // Deserialize JSON to dynamic object
            dynamic obj = JsonConvert.DeserializeObject(json);

            // Traverse JSON tree and substitute nodes
            SubstituteNodes(obj);

            // Serialize back to JSON
            string modifiedJson = JsonConvert.SerializeObject(obj, Formatting.Indented);
            Console.WriteLine(modifiedJson);
        }

        private JToken SubstituteNodes(dynamic obj)
        {
            // Traverse the JSON tree recursively

            switch (obj)
            {
                case JProperty jProperty:
                {
                    var jVal = SubstituteNodes(jProperty.Value);
                    if (jVal != null)
                        jProperty.Value = jVal;
                    return null;
                }
                case JObject jObject:
                {
                    if (jObject.Property("name") == null || jObject.Property("age") == null)
                    {
                        foreach (var jsonProp in jObject.Properties())
                        {
                            SubstituteNodes(jsonProp);
                        }

                        return null;
                    }

                    jObject.Remove("name");
                    jObject.Remove("age");
                    return new JValue("Pippo");
                }
                case JArray jArray:
                {
                    for (var i = jArray.Count - 1; i >= 0; i--)
                    {
                        var jVal = SubstituteNodes(jArray[i]);
                        if (jVal != null)
                        {
                            jArray[i] = jVal;
                        }
                    }

                    return null;
                }

                // else if (property.Name == "age" && property.Value is int && (int)property.Value < 10)
                // {
                //     // Substitute age less than 10 with a string
                //     property.Value = "Child";
                // }
            }


            return null;
        }
    }
}