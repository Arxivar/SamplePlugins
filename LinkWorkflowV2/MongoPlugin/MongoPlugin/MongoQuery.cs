using MongoDB.Bson;
using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using System;

namespace MongoPlugin
{
    public interface IMongoQuery
    {
        public Task<string> ExecuteQuery(string query);
    }

    public abstract class MongoBaseQuery : IMongoQuery
    {
        protected readonly IMongoDatabase MongoDatabase;

        private string ConnectionString { get; }

        private string DatabaseName { get; }

        protected MongoBaseQuery(string connectionString, string databaseName)
        {
            ConnectionString = connectionString;
            DatabaseName = databaseName;

            var dbClient = new MongoClient(ConnectionString);

            MongoDatabase = dbClient.GetDatabase(DatabaseName);
            if (MongoDatabase == null)
                throw new ValidationException($"Unable to find {DatabaseName}");
        }

        public abstract Task<string> ExecuteQuery(string query);
    }

    public class MongoQuery : MongoBaseQuery
    {

        public MongoQuery (string connectionString, string databaseName)
            : base(connectionString, databaseName)
        {

        }

        public override async Task<string> ExecuteQuery(string query)
        {
            var result = MongoDatabase.RunCommand<BsonDocument>(query);
            return await Task.FromResult(result.ToJson(new JsonWriterSettings() { OutputMode = JsonOutputMode.Strict }));
        }
    }
}