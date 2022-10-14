using System.Collections.Generic;
using System.IO;

namespace ReceiptPluginLink
{
  public static class Extensions
  {
    public static void ApplyArxivarToken(this Abletech.WebApi.Client.Arxivar.Client.Configuration conf, string token, string tempPath = null)
    {
      conf.ApiKey.Merge(new Dictionary<string, string>() { { "Authorization", token } });
      conf.ApiKeyPrefix.Merge(new Dictionary<string, string>() { { "Authorization", "Bearer" } });
      conf.TempFolderPath = tempPath ?? Path.GetTempPath();
    }

    public static void ApplyWorkflowToken(this Abletech.WebApi.Client.ArxivarWorkflow.Client.Configuration conf, string token, string tempPath = null)
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
