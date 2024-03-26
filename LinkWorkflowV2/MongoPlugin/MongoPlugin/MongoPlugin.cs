using Abletech.WebApi.Client.ArxivarWorkflow.Api;
using Abletech.WebApi.Client.ArxivarWorkflow.Model;
using Abletech.Workflow.Plugins;
using Abletech.Workflow.Plugins.Attributes;
using Abletech.Workflow.Plugins.Configuration;
using Abletech.Workflow.Plugins.Link;
using Abletech.Workflow.Plugins.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using MongoPlugin.JsonHelper;

[assembly: InternalsVisibleTo("TestMongoPlugin")]

namespace MongoPlugin
{
    [Plugin("47643477-b5a0-4154-b253-1a3511c7799b", "Mongo Query", "1.0.2", Description = "A plugin to interact with a Mongo database", Icon = "far fa-database", UseAdvancedConfiguration = true)]
    public class MongoPlugin : WorkflowPluginLink, IWorkflowPlugin
    {
        #region Constants

        private const string DatabaseNameParameterName = "DatabaseName";
        private const string QueryTextParameterName = "QueryText";
        private const string ColumnsParameterName = "Columns";
        private const string UseAdvancedConfigurationParameterName = "UseAdvancedConfiguration";
        private const string OutputVariableNameParameterName = "OutputVariableName";

        private const string ProcessVariablesRegex = @"#@([\w\-]+)@#";

        #endregion

        #region Constructors

        public MongoPlugin()
        {
        }

        /// <summary>
        /// Used for tests
        /// </summary>
        /// <param name="databaseName"></param>
        public MongoPlugin(string databaseName)
        {
            DatabaseName = databaseName;
        }

        #endregion

        #region Parameters

        /// <summary>
        /// string type input parameter named DatabaseName
        /// </summary>
        [InputParameter(DisplayName = "Database Name", Description = "The database name", DisplayOrder = 0)]
        public string DatabaseName { get; set; }

        /// <summary>
        /// The query text
        /// </summary>
        [InputParameter(DisplayName = "Query Text", Description = "The query to be executed", DisplayOrder = 3)]
        public string QueryText { get; set; }

        /// <summary>
        /// The success result 
        /// </summary>
        [OutputParameter]
        public bool Success { get; set; }

        /// <summary>
        /// The query result
        /// </summary>
        [OutputParameter]
        public string Result { get; set; }

        /// <summary>
        /// The error message
        /// </summary>
        [OutputParameter]
        public string ErrorMessage { get; set; }

        #endregion

        #region AdvancedParameters

        /// <summary>
        /// The user selected to execute the advanced configuration
        /// </summary>
        private bool AdvancedConfigurationEnabled { get; set; }

        /// <summary>
        /// The list of columns to display [; separator]
        /// </summary>
        private string ColumnSelection { get; set; }

        /// <summary>
        /// The matrix variable name where to store the table result
        /// </summary>
        private string OutputVariableName { get; set; }

        #endregion

        #region Injected

        [Injected] public Abletech.WebApi.Client.Arxivar.Client.Configuration MyConfiguration { get; set; }

        [Injected] public Abletech.WebApi.Client.ArxivarManagement.Client.Configuration MyManagementConfiguration { get; set; }

        [Injected] public Abletech.WebApi.Client.ArxivarWorkflow.Client.Configuration MyWorkFlowConfiguration { get; set; }

        [Injected] public IMongoDbProvider MongoDbProvider { get; set; }

        [Injected] public IDiagramsApi DiagramsApi { get; set; }

        [Injected] public IProcessesApi ProcessApi { get; set; }

        [Injected] public IProcessVariablesApi ProcessVariablesApi { get; set; }

        [Injected] public IAuthProvider AuthProvider { get; set; }

        #endregion

        #region WorkflowPluginLink

        /// <summary>
        /// Validates the Standard configuration 
        /// </summary>
        /// <returns></returns>
        protected override IEnumerable<ValidationResult> OnValidate()
        {
            var validationResults = new List<ValidationResult>();

            if (MongoDbProvider == null)
            {
                validationResults.Add(new ValidationResult("Unable to find a valid mongo provider"));
            }

            if (string.IsNullOrWhiteSpace(DatabaseName))
            {
                validationResults.Add(new ValidationResult("DatabaseName parameter cannot be empty"));
            }

            if (string.IsNullOrWhiteSpace(QueryText))
            {
                validationResults.Add(new ValidationResult("QueryText parameter cannot be empty"));
            }

            return validationResults;
        }

        /// <summary>
        /// Override this method in order to load the advanced configuration
        /// </summary>
        /// <param name="configurationItems"></param>
        public void EnableAdvancedConfiguration(IEnumerable<WorkflowPluginConfigurationItem> configurationItems)
        {
            var pluginConfigItems = configurationItems as WorkflowPluginConfigurationItem[] ?? configurationItems.ToArray();
            if (configurationItems == null || !pluginConfigItems.Any())
            {
                throw new ArgumentException("No parameters provided for the advanced configuration");
            }

            var confDictionary = pluginConfigItems.ToDictionary(x => x.Name, y => y.GetValue(), System.StringComparer.OrdinalIgnoreCase);
            ValidateAdvancedConfiguration(confDictionary);
            LoadAdvancedConfiguration(confDictionary);
        }

        public override async Task ExecuteAsync(WorkflowPluginLinkContext context)
        {
            if (AdvancedConfigurationEnabled)
            {
                await ExecuteAdvancedConfiguration(context);
            }
            else
            {
                ExecuteStandardConfiguration();
            }
        }

        /// <summary>
        /// Execute an action from the Advanced configuration editor and gives a result back to the user.
        /// In this case, it's the same action as defined in the Standard configuration, with some additional operations on the output.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public override async Task<WorkflowAdvancedConfigurationCommandResponse> ExecuteAdvancedConfigurationCommandAsync(WorkflowAdvancedConfigurationCommandRequest request)
        {
            ValidateCommandRequest(request.Content);
            LoadCommandParameters(request.Content);

            await ExecuteAsync(null); // execute the same plugin without a context

            var result = new Dictionary<string, object>
            {
                ["success"] = Success,
                ["errorMessage"] = ErrorMessage,
                ["parsedData"] = JsonHelper.JsonHelper.ParseStructureAndData(Result)
            };

            var response = new WorkflowAdvancedConfigurationCommandResponse { Result = result };
            return response;
        }

        #endregion

        #region Private Methods

        private async Task ExecuteAdvancedConfiguration(WorkflowPluginLinkContext context)
        {
            ApplyTokenToApiConfiguration();

            var mongoQuery = GetMongoClient();
            var actualQuery = await ReplacePlaceholders(context, QueryText);
            var jsonResult = mongoQuery.ExecuteQuery(actualQuery);
            var matrix = ParseOutputParameter(jsonResult);
            await SetOutputVariable(context, matrix);
        }

        private void ExecuteStandardConfiguration()
        {
            try
            {
                var mongoQuery = GetMongoClient();
                Result = mongoQuery.ExecuteQuery(QueryText);
                Success = true;
            }
            catch (Exception ex)
            {
                ErrorMessage = ex.Message;
                Success = false;
            }
        }

        private async Task<List<ProcessVariableRm>> GetProcessVariables(WorkflowPluginLinkContext context, List<string> variableNames)
        {
            var allVariables = new List<ProcessVariableRm>();
            var pageIndex = 0;
            var pageSize = 5;
            long totalCount = 0;

            do
            {
                // We need to be sure to load all the process variables in order to match all the required variables
                var pageVariables = await ProcessApi.ApiV1ProcessesProcessIdVariablesGetAsync(context.Process.Id, pageIndex++ * pageSize, pageSize);
                allVariables.AddRange(pageVariables.Items);
                totalCount = pageVariables.ResultCount.TotalResultCount ?? pageVariables.Items.Count;
            } while (allVariables.Count < totalCount);

            return allVariables.Where(x => variableNames.Contains(x.VariableDefinition.Configuration.Name)).ToList();
        }

        private async Task SetOutputVariable(WorkflowPluginLinkContext context, object[,] matrix)
        {
            var diagramVariables = await DiagramsApi.ApiV1DiagramsIdVariablesGetAsync(context.Diagram.Id);
            var outputVariable = diagramVariables.FirstOrDefault(x => x.Configuration.Name == OutputVariableName);

            if (outputVariable == null)
            {
                throw new ArgumentException($"Unable to find diagram variable {OutputVariableName}");
            }

            var processVariable = (await GetProcessVariables(context, new List<string> { OutputVariableName })).First();

            if (processVariable == null)
            {
                throw new ArgumentException($"Unable to find process variable {OutputVariableName}");
            }

            var variables = new List<ProcessSetVariableRm>
            {
                new ProcessSetMatrixVariableRm
                {
                    Values = ConvertMatrixToList(matrix),
                    Id = processVariable.Id,
                    SrcId = outputVariable.Id,
                    ProcessId = context.Process.Id,
                    VariableType = processVariable.VariableType
                }
            };

            await ProcessVariablesApi.ApiV1ProcessVariablesSetPostAsync(variables);
        }

        private void ApplyTokenToApiConfiguration()
        {
            // Configure required api with the current token
            ProcessApi.Configuration.ApplyToken(AuthProvider.AccessToken);
            DiagramsApi.Configuration.ApplyToken(AuthProvider.AccessToken);
            ProcessVariablesApi.Configuration.ApplyToken(AuthProvider.AccessToken);
        }

        private List<List<object>> ConvertMatrixToList(object[,] matrix)
        {
            var retVal = new List<List<object>>();
            for (var i = 0; i < matrix.GetLength(0); i++)
            {
                var row = new List<object>();
                retVal.Add(row);

                for (var j = 0; j < matrix.GetLength(1); j++)
                {
                    row.Add(matrix[i, j]);
                }
            }

            return retVal;
        }

        private async Task<string> ReplacePlaceholders(WorkflowPluginLinkContext context, string queryText)
        {
            var queryVariables = ExtractPlaceholders(queryText);
            if (!queryVariables.Any())
            {
                return queryText; // query without variables
            }

            var processInputVariables = await GetProcessVariables(context, queryVariables);
            var newQuery = new StringBuilder(queryText).ToString();

            if (queryVariables.Count != processInputVariables.Count)
            {
                throw new ArgumentException($"Unable to find one or more process variable specified into the query");
            }

            foreach (var variable in queryVariables)
            {
                var processVariable = processInputVariables.First(x => x.VariableDefinition.Configuration.Name == variable);
                newQuery = newQuery.Replace($"#@{variable}@#", GetValueFromProcessVariable(processVariable));
            }

            return newQuery;
        }

        private string GetValueFromProcessVariable(ProcessVariableRm processVariable)
        {
            var value = processVariable.VariableType switch
            {
                1 => ((ProcessVariableStringRm)processVariable).Value,
                2 => ((ProcessVariableIntRm)processVariable).Value?.ToString() ?? string.Empty,
                4 => ((ProcessVariableBooleanRm)processVariable).Value?.ToString() ?? "false",
                _ => throw new InvalidEnumArgumentException("Unable to parse the Process Variable value")
            };

            return value;
        }

        private List<string> ExtractPlaceholders(string query)
        {
            var regex = new Regex(ProcessVariablesRegex);
            var matches = regex.Matches(query);
            return matches.Select(x => x.Groups[1].Value).ToList(); // groups[1] contains the varname
        }

        /// <summary>
        /// Tries to parse the Output Json in a flat table
        /// </summary>
        private object[,] ParseOutputParameter(string jsonResult)
        {
            var parsedResult = JsonHelper.JsonHelper.ParseStructureAndData(jsonResult);

            if (parsedResult == null || !parsedResult.Data.Any())
            {
                throw new InvalidDataException("The query returned no results");
            }

            var matrix = BuildMatrixFromResult(parsedResult);
            return matrix;
        }

        private object[,] BuildMatrixFromResult(DataResult parsedResult)
        {
            var columns = ColumnSelection.Split(';', StringSplitOptions.RemoveEmptyEntries);

            if (!columns.Any())
            {
                throw new ArgumentException("No columns to display have been selected");
            }

            var matrix = new object[parsedResult.Data.Count, columns.Length];
            var columnIndexes = new List<int>();

            foreach (var colName in columns)
            {
                var column = parsedResult.Columns.FirstOrDefault(x => x.Id == colName);
                if (column != null)
                {
                    columnIndexes.Add(parsedResult.Columns.IndexOf(column));
                }
            }

            for (var i = 0; i < parsedResult.Data.Count; i++)
            {
                for (var j = 0; j < columnIndexes.Count; j++)
                {
                    // var idTypeColIndex = -1;
                    //
                    // // Se è una colonna binary provo la conversione in Guid leggibile
                    // if (parsedResult.Columns[columnIndexes[j]].Label.EndsWith(".$binary", StringComparison.InvariantCultureIgnoreCase))
                    // {
                    //     try
                    //     {
                    //         var idTypeColName = parsedResult.Columns[columnIndexes[j]].Label.Replace(".$binary", ".$type");
                    //         var idTypeColumn = parsedResult.Columns.FirstOrDefault(x => x.Id == idTypeColName);
                    //         idTypeColIndex = parsedResult.Columns.IndexOf(idTypeColumn);
                    //     }
                    //     catch (Exception)
                    //     {
                    //         // Do nothing, just continue
                    //     }
                    // }

                    var value = parsedResult.Data[i][columnIndexes[j]];
                    // if (idTypeColIndex >= 0)
                    // {
                    //     try
                    //     {
                    //         var idTypeValue = parsedResult.Data[i][idTypeColIndex].ToString();
                    //         value = ConvertBinaryId(value, idTypeValue);
                    //     }
                    //     catch (Exception)
                    //     {
                    //         // Do nothing, just continue
                    //     }
                    // }

                    matrix.SetValue(value, i, j);
                }
            }

            return matrix;
        }

        private void ValidateAdvancedConfiguration(IDictionary<string, object> advancedInput)
        {
            ValidateCommandRequest(advancedInput); // Same parameters as the ExecuteCommand

            if (!advancedInput.ContainsKey(UseAdvancedConfigurationParameterName))
            {
                throw new ArgumentException($"{UseAdvancedConfigurationParameterName} parameter cannot be empty");
            }

            if (!advancedInput.ContainsKey(ColumnsParameterName))
            {
                throw new ArgumentException($"{ColumnsParameterName} parameter cannot be empty");
            }

            if (!advancedInput.ContainsKey(OutputVariableNameParameterName))
            {
                throw new ArgumentException($"{OutputVariableNameParameterName} parameter cannot be empty");
            }
        }

        private void LoadAdvancedConfiguration(IDictionary<string, object> advancedInput)
        {
            LoadCommandParameters(advancedInput);

            AdvancedConfigurationEnabled = Convert.ToBoolean(advancedInput[UseAdvancedConfigurationParameterName]);
            ColumnSelection = advancedInput[ColumnsParameterName].ToString();
            OutputVariableName = advancedInput[OutputVariableNameParameterName].ToString();
        }

        private void ValidateCommandRequest(IDictionary<string, object> advancedInput)
        {
            if (!advancedInput.ContainsKey(DatabaseNameParameterName))
            {
                throw new ArgumentException($"{DatabaseNameParameterName} parameter cannot be empty");
            }

            if (!advancedInput.ContainsKey(QueryTextParameterName))
            {
                throw new ArgumentException($"{QueryTextParameterName} parameter cannot be empty");
            }
        }

        private void LoadCommandParameters(IDictionary<string, object> advancedInput)
        {
            DatabaseName = advancedInput[DatabaseNameParameterName].ToString();
            QueryText = advancedInput[QueryTextParameterName].ToString();
        }

        private IMongoQuery GetMongoClient()
        {
            return new MongoQuery(MongoDbProvider?.ConnectionString ?? "mongodb://localhost:27017", DatabaseName);
        }

        #endregion
    }
}