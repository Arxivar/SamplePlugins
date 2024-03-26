using MongoDB.Bson;
using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using MongoDB.Bson.IO;

namespace MongoPlugin
{
    public interface IMongoQuery
    {
        public string ExecuteQuery(string query);
    }

    public abstract class MongoBaseQuery : IMongoQuery
    {
        public readonly IMongoDatabase MongoDatabase;

        private string ConnectionString { get; }

        private string DatabaseName { get; }
        
        protected MongoClient Client { get; }

        protected MongoBaseQuery(string connectionString, string databaseName)
        {
            ConnectionString = connectionString;
            DatabaseName = databaseName;

            Client = new MongoClient(ConnectionString);

            MongoDatabase = Client.GetDatabase(DatabaseName);
            if (MongoDatabase == null)
                throw new ValidationException($"Unable to find {DatabaseName}");
        }

        public abstract string ExecuteQuery(string query);
    }

    public class MongoQuery : MongoBaseQuery
    {

        public MongoQuery (string connectionString, string databaseName)
            : base(connectionString, databaseName)
        {

        }

        public override string ExecuteQuery(string query)
        {
            var result = MongoDatabase.RunCommand<BsonDocument>(query);
            var jsonResult = result.ToJson(new JsonWriterSettings { OutputMode = JsonOutputMode.Strict });
            jsonResult = JsonHelper.JsonHelper.TryConvertBinaryGuid(jsonResult);
            return jsonResult;
        }
    }
}