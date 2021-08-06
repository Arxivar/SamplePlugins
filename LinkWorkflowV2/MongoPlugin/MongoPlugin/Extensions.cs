using Abletech.WebApi.Client.ArxivarWorkflow.Client;
using MongoPlugin.JsonHelper;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace MongoPlugin
{
    public static class Extensions
    {
        public static DataResult ParseDataSetForWebApiDataSource(this DataTable dt)
        {
            var result = new DataResult
            {
                Columns = dt.Columns.Cast<DataColumn>().Select(i =>
                {
                    var rx = new Regex(@"[^[\]'.:;,^?)(&%$£!/=+\-*].*", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                    var x = rx.Match(i.Caption);
                    var label = x?.Value;

                    return new Column
                    {
                        Id = i.ColumnName,
                        Label = label,
                        Position = 0,
                        ColumnType = i.DataType.ToString(),
                        Visible = true
                    };
                }).ToList(), // TORNO LA LISTA
                Data = new List<List<object>>()
            };

            for (var i = 0; i < dt.Rows.Count; i++)
            {
                var riga = new List<object>();
                for (var j = 0; j < dt.Columns.Count; j++)
                {
                    if (dt.Rows[i][j] is DateTime)
                    {
                        riga.Add(((DateTime)dt.Rows[i][j]).ToString("O"));
                    }
                    else if (dt.Columns[j].DataType == typeof(Byte[]))
                    {
                        riga.Add(dt.Rows[i][j] is System.DBNull ? string.Empty : "Dati non visualizzabili");
                    }
                    else
                    {
                        riga.Add(dt.Rows[i][j]);
                    }
                }

                result.Data.Add(riga);
            }

            return result;
        }

        public static void ApplyToken(this Configuration conf, string token, string tempPath = null)
        {
            conf.ApiKey.Merge(new Dictionary<string, string>() { { "Authorization", token } });
            conf.ApiKeyPrefix.Merge(new Dictionary<string, string>() { { "Authorization", "Bearer" } });
            conf.TempFolderPath = tempPath ?? Path.GetTempPath();
        }

        public static void Merge(this IDictionary<string, string> dictionary1, IDictionary<string, string> dictionary2)
        {
            dictionary1 ??= new Dictionary<string, string>();

            if (dictionary2 == null) 
                return;
            
            foreach (var (key, value) in dictionary2)
            {
                dictionary1[key] = value;
            }
        }
    }
}
