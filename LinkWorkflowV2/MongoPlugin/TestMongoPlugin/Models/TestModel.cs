using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TestMongoPlugin.Models;

public class TestModel
{
    [BsonId]
    [BsonGuidRepresentation(GuidRepresentation.CSharpLegacy)]
    [BsonElement("_id")]
    public Guid Id { get; set; }
    
    [BsonGuidRepresentation(GuidRepresentation.CSharpLegacy)]
    [BsonElement("diagramId")]
    public Guid DiagramId { get; set; } 
    
    [BsonElement("diagramName")]
    public string DiagramName { get; set; }
    
    [BsonElement("diagramRevision")]
    public int DiagramRevision { get; set; }
    
    [BsonElement("enabled")]
    public bool Enabled { get; set; }
    
    [BsonElement("details")]
    public List<TestModelDetails> Details { get; set; } 
}

public class TestModelDetails
{
    [BsonGuidRepresentation(GuidRepresentation.CSharpLegacy)]
    [BsonElement("elementId")]
    public Guid ElementId { get; set; }
    
    [BsonElement("infoText")]
    public string InfoText { get; set; }
}