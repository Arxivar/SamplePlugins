using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;

namespace MongoPlugin.JsonHelper
{
    public class JsonHelper : IJsonHelper
    {
        public static DataResult ParseStructureAndData(string json)
        {
            var jsonHelp = new JsonHelper();
            var jsi = jsonHelp.ParseStructure(json);
            var dataTable = jsonHelp.ExtractDatatable(json, jsi);
            return dataTable.ParseDataSetForWebApiDataSource();
        }

        public JsonStructureInfo ParseStructure(string json)
        {
            var structure = new JsonStructureInfo();
            var jt = JToken.Parse(json);

            switch (jt.Type)
            {
                case JTokenType.Object:
                    ParseJsonObject((JObject)jt, structure, structure.Data, structure.Model);
                    break;

                case JTokenType.Array:
                    ParseJsonArray((JArray)jt, structure, structure.Data, structure.Model);
                    break;

                default:
                    var keyNode = jt.Path;
                    var elementArray = new JsonElement
                    {
                        Key = keyNode,
                        Value = jt.ToString(),
                        Childs = new List<JsonElement>(),
                    };
                    structure.MappedData.Add(keyNode, "result");
                    structure.Data.Childs.Add(elementArray);

                    var epuredKey = EpureKey(keyNode);
                    if (!structure.MappedModel.ContainsKey(epuredKey))
                    {
                        if (string.IsNullOrEmpty(epuredKey))
                        {
                            epuredKey = "result";
                        }
                        var structureElement = new JsonStructure { Key = epuredKey, Description = "result", Childs = new List<JsonStructure>() };
                        structure.MappedModel.Add(epuredKey, structureElement);
                        structure.Model.Childs.Add(structureElement);
                    }
                    break;
            }
            return structure;
        }

        private void ParseJsonArray(JArray ja, JsonStructureInfo structureInfo, JsonElement parent, JsonStructure parentStructure, string optionlDesc = "")
        {
            var keyNodeArray = ja.Path;
            var elementArray = new JsonElement
            {
                Key = keyNodeArray,
                Value = string.Empty,
                Childs = new List<JsonElement>(),
                IsArray = true
            };
            structureInfo.MappedData.Add(keyNodeArray, string.Empty);
            parent.Childs.Add(elementArray);

            var epuredKeyArray = EpureKey(keyNodeArray);
            JsonStructure structureArray;
            if (!structureInfo.MappedModel.ContainsKey(epuredKeyArray))
            {
                structureArray = new JsonStructure { Key = epuredKeyArray, Description = optionlDesc + "[]", Childs = new List<JsonStructure>() };
                structureInfo.MappedModel.Add(epuredKeyArray, structureArray);
                parentStructure.Childs.Add(structureArray);
            }
            else
            {
                structureArray = structureInfo.MappedModel[epuredKeyArray];
            }

            for (int i = 0; i < ja.Count; i++)
            {
                JToken jt = ja[i];

                switch (jt.Type)
                {

                    case JTokenType.Object:
                        ParseJsonObject(((JObject)jt), structureInfo, elementArray, structureArray);
                        break;
                    case JTokenType.Array:
                        ParseJsonArray((JArray)jt, structureInfo, elementArray, structureArray);
                        break;
                    case JTokenType.None:
                    case JTokenType.Constructor:
                    case JTokenType.Comment:
                    case JTokenType.Null:
                    case JTokenType.Undefined:
                        break;
                    case JTokenType.Property:
                    case JTokenType.Integer:
                    case JTokenType.Float:
                    case JTokenType.String:
                    case JTokenType.Boolean:
                    case JTokenType.Date:
                    case JTokenType.Raw:
                    case JTokenType.Bytes:
                    case JTokenType.Guid:
                    case JTokenType.Uri:
                    case JTokenType.TimeSpan:
                        var keyNode = jt.Path;
                        var element = new JsonElement
                        {
                            Key = keyNode,
                            Value = jt.ToString(), //value
                            Childs = new List<JsonElement>()
                        };

                        structureInfo.MappedData.Add(keyNode, jt.ToString());//value
                        elementArray.Childs.Add(element);

                        var epuredKey = EpureKey(keyNode);

                        if (!structureInfo.MappedModel.ContainsKey(epuredKey))
                        {
                            var jse = new JsonStructure { Key = epuredKey, Description = "value", Childs = new List<JsonStructure>() };
                            structureInfo.MappedModel.Add(epuredKey, jse);
                            structureArray.Childs.Add(jse);
                        }
                        break;

                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }
        }

        private void ParseJsonObject(JObject ja, JsonStructureInfo structureInfo, JsonElement parent, JsonStructure structureParent)
        {
            foreach (JProperty prop in ja.Properties())
            {
                if (prop.Value.Type == JTokenType.Array)
                {
                    ParseJsonArray((JArray)prop.Value, structureInfo, parent, structureParent, prop.Name);
                }
                else if (prop.Value.Type == JTokenType.Object)
                {
                    var keyNode = prop.Value.Path;
                    var element = new JsonElement
                    {
                        Key = keyNode,
                        Value = string.Empty,
                        Childs = new List<JsonElement>()
                    };

                    structureInfo.MappedData.Add(keyNode, "");
                    parent.Childs.Add(element);

                    var epuredKey = EpureKey(keyNode);
                    JsonStructure jse;
                    if (!structureInfo.MappedModel.ContainsKey(epuredKey))
                    {
                        jse = new JsonStructure { Key = epuredKey, Description = prop.Name, Childs = new List<JsonStructure>() };
                        structureInfo.MappedModel.Add(epuredKey, jse);
                        structureParent.Childs.Add(jse);
                    }
                    else
                    {
                        jse = structureInfo.MappedModel[epuredKey];
                    }

                    ParseJsonObject((JObject)prop.Value, structureInfo, element, jse);
                }
                else
                {
                    var keyNode = prop.Value.Path;
                    var element = new JsonElement
                    {
                        Key = keyNode,
                        Value = prop.Value.ToString(),
                        Childs = new List<JsonElement>()
                    };

                    structureInfo.MappedData.Add(keyNode, prop.Value.ToString());
                    parent.Childs.Add(element);

                    var epuredKey = EpureKey(keyNode);

                    if (!structureInfo.MappedModel.ContainsKey(epuredKey))
                    {
                        var jse = new JsonStructure { Key = epuredKey, Description = prop.Name, Childs = new List<JsonStructure>() };
                        structureInfo.MappedModel.Add(epuredKey, jse);
                        structureParent.Childs.Add(jse);
                    }
                }
            }
        }

        private string EpureKey(string key)
        {
            string pattern = @"(\[[0-9]+\])";
            var regex = new Regex(pattern);

            string result = new String(key.ToCharArray());

            var match = regex.Matches(key);

            foreach (Match m in match)
            {
                if (m.Success)
                {
                    result = result.Replace(m.Value, "[]");
                }
            }
            return result;
        }

        public DataTable ExtractDatatable(string json, JsonStructureInfo structure)
        {
            var dt = CreateDataTable(json);

            // Rimuovo le colonne non configurate
            //TODO:




            // Recupero i dati parsati
            List<RowParsed> parsedData = ParseValues(json);
            // Recupero le righe più estreme e da quelle recupero il prodotto cartesiano
            foreach (var pd in parsedData)
            {
                var listOuput = new List<RowParsed>();
                FindChildRowRecursive(pd, listOuput);
                LoadDrRecursive(listOuput, dt);
            }

            return dt;
        }

        private void LoadDrRecursive(List<RowParsed> childs, DataTable dt)
        {
            foreach (var oItem in childs)
            {
                var dr = dt.Rows.Add();

                RowParsed currentItem = oItem;

                foreach (var cv in currentItem.Values)
                {
                    if (!dt.Columns.Contains(cv.ColumnName))
                    {
                        continue;
                    }

                    dr[cv.ColumnName] = cv.Value;
                }

                while (currentItem.Parent != null)
                {
                    currentItem = currentItem.Parent;

                    foreach (var cv in currentItem.Values)
                    {
                        if (!dt.Columns.Contains(cv.ColumnName))
                        {
                            continue;
                        }

                        dr[cv.ColumnName] = cv.Value;
                    }
                }
            }
        }

        private void FindChildRowRecursive(RowParsed startRow, List<RowParsed> output)
        {
            if (startRow.SubRow.Any())
            {
                foreach (var sr in startRow.SubRow)
                {
                    FindChildRowRecursive(sr, output);
                }
            }
            else
            {
                output.Add(startRow);
            }
        }

        private List<RowParsed> ParseValues(string json)
        {
            var result = new List<RowParsed>();

            var jt = JToken.Parse(json);

            if (jt.Type == JTokenType.Array)
            {
                foreach (JToken c in jt.Children())
                {
                    var row = new RowParsed(null);
                    result.Add(row);

                    ParseValues(row, c);
                }
            }
            else if (jt.Type == JTokenType.Object)
            {
                var row = new RowParsed(null);
                result.Add(row);

                ParseValues(row, jt);
            }
            else
            {
                var row = new RowParsed(null);
                result.Add(row);

                var colName = EpureKey(jt.Path);
                if (string.IsNullOrEmpty(colName))
                {
                    colName = "result";
                }
                row.Values.Add(new ValueParsed { Path = jt.Path, Value = jt.ToString(), ColumnName = colName });
            }

            return result;
        }

        private void ParseValues(RowParsed row, JToken jt)
        {
            var colName = EpureKey(jt.Path);
            switch (jt.Type)
            {
                case JTokenType.Object:
                    foreach (var p in ((JObject)jt).Properties())
                    {
                        ParseValues(row, p);
                    }
                    break;

                case JTokenType.Array:
                    foreach (JToken c in jt.Children())
                    {
                        RowParsed sr = new RowParsed(row);
                        row.SubRow.Add(sr);

                        ParseValues(sr, c);
                    }
                    break;

                case JTokenType.Property:
                    var jp = (JProperty)jt;
                    foreach (var c in jp.Children())
                    {
                        ParseValues(row, c);
                    }
                    break;

                case JTokenType.None:
                case JTokenType.Constructor:
                case JTokenType.Comment:
                case JTokenType.Null:
                case JTokenType.Undefined:
                case JTokenType.Raw:
                case JTokenType.Bytes:
                    break;

                case JTokenType.Integer:
                case JTokenType.Float:
                    row.Values.Add(new ValueParsed { Value = jt.ToString(), Path = jt.Path, ColumnName = colName, ValueJsonType = JsonTypeValue.Decimal });
                    break;

                case JTokenType.Boolean:
                    row.Values.Add(new ValueParsed { Value = jt.ToString(), Path = jt.Path, ColumnName = colName, ValueJsonType = JsonTypeValue.Boolean });
                    break;

                case JTokenType.Date:
                    row.Values.Add(new ValueParsed { Value = jt.ToString(), Path = jt.Path, ColumnName = colName, ValueJsonType = JsonTypeValue.DateTime });
                    break;

                case JTokenType.String:
                case JTokenType.Guid:
                case JTokenType.Uri:
                case JTokenType.TimeSpan:
                    row.Values.Add(new ValueParsed { Value = jt.ToString(), Path = jt.Path, ColumnName = colName, ValueJsonType = JsonTypeValue.String });
                    break;

                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        private DataTable CreateDataTable(string json)
        {
            var jt = JToken.Parse(json);
            var dt = new DataTable("output");

            if (jt.Type == JTokenType.Array)
            {
                foreach (JToken c in jt.Children())
                {
                    PrepreDataTable(dt, c);
                }
            }
            else if (jt.Type == JTokenType.Object)
            {
                PrepreDataTable(dt, jt);
            }
            else
            {
                var colName = EpureKey(jt.Path);
                if (string.IsNullOrEmpty(colName))
                {
                    colName = "result";
                }
                if (!dt.Columns.Contains(colName))
                {
                    var dc = dt.Columns.Add(colName, typeof(string));
                }
            }

            return dt;
        }

        private void PrepreDataTable(DataTable dt, JToken jt)
        {
            var colName = EpureKey(jt.Path);
            switch (jt.Type)
            {
                case JTokenType.Object:
                    foreach (var p in ((JObject)jt).Properties())
                    {
                        PrepreDataTable(dt, p);
                    }
                    break;
                case JTokenType.Array:
                    foreach (JToken c in jt.Children())
                    {
                        PrepreDataTable(dt, c);
                    }
                    break;
                case JTokenType.Property:
                    var jp = (JProperty)jt;
                    foreach (var c in jp.Children())
                    {
                        PrepreDataTable(dt, c);
                    }

                    break;

                case JTokenType.None:
                case JTokenType.Constructor:
                case JTokenType.Comment:
                case JTokenType.Undefined:
                    break;

                case JTokenType.Integer:
                case JTokenType.Float:
                case JTokenType.String:
                case JTokenType.Boolean:
                case JTokenType.Date:
                case JTokenType.Raw:
                case JTokenType.Bytes:
                case JTokenType.Guid:
                case JTokenType.Uri:
                case JTokenType.TimeSpan:
                case JTokenType.Null:
                    if (!dt.Columns.Contains(colName))
                    {
                        var dc = dt.Columns.Add(colName, typeof(string));
                    }
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        class RowParsed
        {
            public RowParsed(RowParsed parent)
            {
                Values = new List<ValueParsed>();
                SubRow = new List<RowParsed>();
                Parent = parent;
            }
            public RowParsed Parent { get; private set; }

            public List<ValueParsed> Values { get; set; }

            public List<RowParsed> SubRow { get; set; }
        }

        class ValueParsed
        {
            public string Path { get; set; }

            public string ColumnName { get; set; }

            public string Value { get; set; }

            public JsonTypeValue ValueJsonType { get; set; }
        }

        public enum JsonTypeValue
        {
            String,
            Decimal,
            DateTime,
            Boolean
        }
    }

    public interface IJsonHelper
    {
        JsonStructureInfo ParseStructure(string json);
        DataTable ExtractDatatable(string json, JsonStructureInfo structureInfo);
    }

    public class Column
    {
        public string Id { get; set; }
        public string Label { get; set; }
        public int Position { get; set; }
        public string ColumnType { get; set; }
        public bool Visible { get; set; }

        public override string ToString()
        {
            return $"{Id}";
        }
    }

    public class DataResult
    {
        public List<Column> Columns { get; set; }

        public List<List<object>> Data { get; set; }
    }
}
