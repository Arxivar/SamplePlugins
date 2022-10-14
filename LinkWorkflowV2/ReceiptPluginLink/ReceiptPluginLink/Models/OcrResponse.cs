using Newtonsoft.Json;
using System;

namespace ReceiptPluginLink.Models
{
  public class OcrResponse
  {
    [JsonProperty("Status")]
    public int Status { get; set; }

    [JsonProperty("ResultStatus")]
    public bool ResultStatus { get; set; }

    [JsonProperty("ErrorMsg")]
    public string ErrorMessage { get; set; }

    [JsonProperty("Data")]
    public DataDescriptor Data { get; set; }

    public class DataDescriptor
    {
      [JsonProperty("date")]
      public DateTime? Date { get; set; }

      [JsonProperty("price")]
      public double? Price { get; set; }

      [JsonProperty("currency")]
      public string Currency { get; set; }

      [JsonProperty("merchant")]
      public string Merchant { get; set; }

      [JsonProperty("vat")]
      public VatDescriptor Vat { get; set; }

      [JsonProperty("ndoc")]
      public string DocumentNumber { get; set; }
    }

    public class VatDescriptor
    {
      [JsonProperty("vat_number")]
      public string VatNumber { get; set; }

      [JsonProperty("country_code")]
      public string CountryCode { get; set; }

      [JsonProperty("company_name")]
      public string CompanyName { get; set; }

      [JsonProperty("company_address")]
      public string CompanyAddress { get; set; }
    }
  }
}
