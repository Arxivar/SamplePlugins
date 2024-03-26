using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace MongoPlugin.JsonHelper
{
    public class JsonStructureInfo
    {
        public JsonStructureInfo()
        {
            MappedData = new Dictionary<string, string>();
            Data = new JsonElement { Key = "", Childs = new List<JsonElement>(), Value = "root" };

            MappedModel = new Dictionary<string, JsonStructure>();
            Model = new JsonStructure { Key = "", Description = "Json", Childs = new List<JsonStructure>() };
        }

        public Dictionary<string, string> MappedData { get; set; }

        public JsonElement Data { get; set; }


        public Dictionary<string, JsonStructure> MappedModel { get; set; }
        public JsonStructure Model { get; set; }

        /// <summary>
        /// Lavora sulla struttura della classe stessa MappedModel per sapere cosa deve produrre come risultato
        /// </summary>
        /// <returns></returns>
        public DataTable ExtractDatatable()
        {
            // Creo la tabella in base alla struttura
            var dt = new DataTable("ResultTable");
            CreaTableRecursiveOnModel(dt, Model);

            // popolo la tabella in base ai dati parsati

            return dt;
        }

        private void CreaTableRecursiveOnModel(DataTable dt, JsonStructure jes)
        {
            if (jes.IsSelected && (jes.Childs == null || jes.Childs.Count == 0))
            {
                var dc = dt.Columns.Add(jes.Key, typeof(string));
                dc.AllowDBNull = true;
                dc.Caption = jes.Description;
            }

            if (jes.Childs != null && jes.Childs.Any())
            {
                foreach (var c in jes.Childs)
                {
                    CreaTableRecursiveOnModel(dt, c);
                }
            }
        }
    }

    public class JsonStructure : JsonElementBase
    {
        public string Description { get; set; }
        public List<JsonStructure> Childs { get; set; }
    }

    public class JsonElementBase 
    {
        public string Key { get; set; }
        public bool IsSelected { get; set; }
    }

    public class JsonElement : JsonElementBase
    {
        public string Value { get; set; }
        public List<JsonElement> Childs { get; set; }
        public bool IsArray { get; set; }
    }
}