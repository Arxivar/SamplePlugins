using Abletech.WebApi.Client.ArxivarWorkflow.Api;
using Abletech.WebApi.Client.Arxivar.Api;
using Abletech.Workflow.Plugins.Attributes;
using Abletech.Workflow.Plugins.Link;
using Abletech.Workflow.Plugins.Services;
using System.Threading.Tasks;
using System;
using System.IO;
using System.Net.Http;
using Newtonsoft.Json;
using ReceiptPluginLink.Models;
using Abletech.WebApi.Client.ArxivarWorkflow.Model;
using Abletech.WebApi.Client.Arxivar.Model;
using System.Linq;
using System.ComponentModel.DataAnnotations;

namespace ReceiptPluginLink
{
    [Plugin("99c6039c-d0b0-4d97-a22f-227551f9dbaf", "Receipt plugin link", "1.1.0", Description = "Esegue la lettura dell'immagine dello scontrino", Icon = "far fa-receipt")]
    public class ReceiptPluginLink : WorkflowPluginLink
    {
        /// <summary>
        /// Injected by the Workflow Engine. Gets or sets the Workflow Process documents API client instance
        /// </summary>
        [Injected]
        public IProcessDocumentsApi ProcessDocumentsApi { get; set; }

        /// <summary>
        /// Injected by the Workflow Engine. Gets or sets the Workflow Processes API client instance
        /// </summary>
        [Injected]
        public IProcessesApi ProcessesApi { get; set; }

        /// <summary>
        /// Injected by the Workflow Engine. Gets or sets the ARXivar Profiles API client instance
        /// </summary>
        [Injected]
        public IProfilesApi ProfilesApi { get; set; }

        /// <summary>
        /// Injected by the Workflow Engine. Gets or sets the information of the user which runs the process
        /// </summary>
        [Injected]
        public IAuthProvider AuthProvider { get; set; }

        /// <summary>
        /// Gets or sets whether the plugin ends correctly
        /// </summary>
        [OutputParameter]
        public bool Success { get; set; }

        /// <summary>
        /// Gets ot sets the error message in case of failure
        /// </summary>
        [OutputParameter]
        public string ErrorMessage { get; set; }

        /// <summary>
        /// Gets or sets the API Key value
        /// </summary>
        [InputParameter(Description = "Il valore della chiave API da utilizzare per chiamare gli endpoint per l'analisi delle immagini", DisplayName = "API Key")]
        [Required]
        public string ApiKey { get; set; }

        /// <summary>
        /// Gets or sets the name of the additional field into which will be saved the receipt date
        /// </summary>
        [InputParameter(Description = "Il nome del campo aggiuntivo in cui verrà salvata la data dello scontrino", DisplayName = "Date field name")]
        public string DateFieldName { get; set; }

        /// <summary>
        /// Gets or sets the name of the additional field into which will be saved the receipt amount
        /// </summary>
        [InputParameter(Description = "Il nome del campo aggiuntivo in cui verrà salvato il prezzo dello scontrino", DisplayName = "Price field name")]
        public string PriceFieldName { get; set; }

        /// <summary>
        /// Gets or sets the name of the additional field into which will be saved the receipt currency
        /// </summary>
        [InputParameter(Description = "Il nome del campo aggiuntivo in cui verrà salvata la valuta dello scontrino", DisplayName = "Currency field name")]
        public string CurrencyFieldName { get; set; }

        /// <summary>
        /// Gets or sets the name of the additional field into which will be saved the VAT number on the receipt
        /// </summary>
        [InputParameter(Description = "Il nome del campo aggiuntivo in cui verrà salvata la partita iva", DisplayName = "VAT nr. field name")]
        public string VatNumberFieldName { get; set; }

        /// <summary>
        /// Gets or sets the name of the additional field into which will be saved the company name on the receipt
        /// </summary>
        [InputParameter(Description = "Il nome del campo aggiuntivo in cui verrà salvata la ragione sociale presente nello scontrino", DisplayName = "Company name field name")]
        public string CompanyNameFieldName { get; set; }

        /// <summary>
        /// Gets or sets the name of the additional field into which will be saved the company address on the receipt
        /// </summary>
        [InputParameter(Description = "Il nome del campo aggiuntivo in cui verrà salvato l'indirizzo presente nello scontrino", DisplayName = "Company address field name")]
        public string CompanyAddressFieldName { get; set; }

        /// <summary>
        /// Gets or sets the name of the additional field into which will be saved the merchant on the receipt
        /// </summary>
        [InputParameter(Description = "Il nome del campo aggiuntivo in cui verrà salvato il merchant dello scontrino", DisplayName = "Merchant field name")]
        public string MerchantFieldName { get; set; }

        /// <summary>
        /// Gets or sets the name of the additional field into which will be saved the country code on the receipt
        /// </summary>
        [InputParameter(Description = "Il nome del campo aggiuntivo in cui verrà salvato il codice del paese", DisplayName = "Country code field name")]
        public string CountryCodeFieldName { get; set; }

        /// <summary>
        /// Gets or sets the name of the additional field into which will be saved the document number on the receipt
        /// </summary>
        [InputParameter(Description = "Il nome del campo aggiuntivo in cui verrà salvato il numero del documento", DisplayName = "Document nr. field name")]
        public string DocumentNumberFieldName { get; set; }

        private readonly string _feesScanEndpoint = "https://service.fees.world/API/v1.2/";

        public override async Task ExecuteAsync(WorkflowPluginLinkContext context)
        {
            try
            {
                SetAccessTokenForApis();

                var primaryProcessDocument = await GetPrimaryProcessDocumentAsync(context.Process.Id);
                if (primaryProcessDocument == null)
                {
                    Logger.Warning("Documento principale per il processo {ProcessId} non trovato", context.Process.Id);

                    Success = false;
                    ErrorMessage = $"Documento principale per il processo {context.Process.Id} non trovato";

                    return;
                }
                using var processDocumentStream = await DownloadPrimaryProcessDocumentAsync(primaryProcessDocument);

                using var client = CreateFeesScanHttpClient();

                var croppedFile = await CropDocumentAsync(client, processDocumentStream, primaryProcessDocument.Filename);
                var ocrResponse = await ExecuteOcrAsync(client, croppedFile, primaryProcessDocument.Filename);
                if (!ocrResponse.ResultStatus)
                {
                    Success = false;
                    ErrorMessage = ocrResponse.ErrorMessage;

                    return;
                }

                await UpdateDocumentProfileAsync(primaryProcessDocument, croppedFile, primaryProcessDocument.Filename);
                await UpdateProfileInfoAsync(primaryProcessDocument, ocrResponse);

                Success = true;
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "Errore nell'esecuzione del plugin: {ErrorMessage}", ex.Message);

                Success = false;
                ErrorMessage = $"Errore nell'esecuzione del plugin: {ex.Message}";
            }
        }

        #region Private methods
        /// <summary>
        /// Sets the access token to the API clients
        /// </summary>
        private void SetAccessTokenForApis()
        {
            ProcessDocumentsApi.Configuration.ApplyWorkflowToken(AuthProvider.AccessToken);
            ProcessesApi.Configuration.ApplyWorkflowToken(AuthProvider.AccessToken);
            ProfilesApi.Configuration.ApplyArxivarToken(AuthProvider.AccessToken);
        }

        /// <summary>
        /// Updates the profile's informations
        /// </summary>
        /// <param name="primaryProcessDocument">The primary document of the process</param>
        /// <param name="ocrResponse">The response received by the OCR service</param>
        /// <returns></returns>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        private async Task UpdateProfileInfoAsync(ProcessDocumentForDashboardRm primaryProcessDocument, OcrResponse ocrResponse)
        {
            var docNumber = primaryProcessDocument.ArxDocInfo.Docnumber;
            var profileInfo = await ProfilesApi.ProfilesGetAsync(docNumber);
            if (profileInfo == null)
            {
                throw new ArgumentOutOfRangeException($"[AGGIORNAMENTO INFORMAZIONI PROFILO] Il profilo {docNumber} non è stato trovato!");
            }

            if (profileInfo.Fields.Any())
            {
                ChangeProfileFieldsWithOcrResponse(profileInfo, ocrResponse);
            }

            var profileModel = new Abletech.WebApi.Client.Arxivar.Model.ProfileDTO
            {
                Attachments = profileInfo.Attachments,
                AuthorityData = profileInfo.AuthorityData,
                ConstrainRoleBehaviour = profileInfo.ConstrainRoleBehaviour,
                Fields = profileInfo.Fields,
                Document = profileInfo.Document,
                FileWritingSettings = profileInfo.FileWritingSettings,
                GeneratePaProtocol = profileInfo.GeneratePaProtocol,
                Id = profileInfo.Id,
                Notes = profileInfo.Notes,
                PaNotes = profileInfo.PaNotes,
                PostProfilationActions = profileInfo.PostProfilationActions
            };

            await ProfilesApi.ProfilesPutAsync(docNumber, profileModel);
        }

        /// <summary>
        /// Change the fields values based on the OCR response
        /// </summary>
        /// <param name="profileInfo">The information of the profile to edit</param>
        /// <param name="ocrResponse">The response received by the OCR service</param>
        /// <exception cref="InvalidCastException"></exception>
        private void ChangeProfileFieldsWithOcrResponse(Abletech.WebApi.Client.Arxivar.Model.EditProfileSchemaDTO profileInfo, OcrResponse ocrResponse)
        {
            var dateField = profileInfo.Fields.FirstOrDefault(f => f.Name.Equals(DateFieldName, StringComparison.InvariantCultureIgnoreCase));
            if (dateField != null)
            {
                if (dateField is AdditionalFieldDateTimeDTO dateTimeField)
                {
                    dateTimeField.Value = ocrResponse.Data.Date;
                }
                else if (dateField is DocumentDateFieldDTO documentDateField)
                {
                    documentDateField.Value = ocrResponse.Data.Date;
                }
                else
                {
                    throw new InvalidCastException($"[IMPOSTO I CAMPI DI PROFILO] Il campo {DateFieldName} deve essere di tipo data");
                }
            }

            var priceField = profileInfo.Fields.FirstOrDefault(f => f.Name.Equals(PriceFieldName, StringComparison.InvariantCultureIgnoreCase));
            if (priceField != null)
            {
                if (!(priceField is AdditionalFieldDoubleDTO numericPriceField))
                {
                    throw new InvalidCastException($"[IMPOSTO I CAMPI DI PROFILO] Il campo {PriceFieldName} deve essere di tipo numerico con decimali");
                }

                numericPriceField.Value = ocrResponse.Data.Price;
            }

            var currencyField = profileInfo.Fields.FirstOrDefault(f => f.Name.Equals(CurrencyFieldName, StringComparison.InvariantCultureIgnoreCase));
            if (currencyField != null)
            {
                SetStringFieldValue(currencyField, ocrResponse.Data.Currency, CurrencyFieldName);
            }

            var vatNumberField = profileInfo.Fields.FirstOrDefault(f => f.Name.Equals(VatNumberFieldName, StringComparison.InvariantCultureIgnoreCase));
            if (vatNumberField != null)
            {
                SetStringFieldValue(vatNumberField, ocrResponse.Data.Vat?.VatNumber, VatNumberFieldName);
            }

            var companyNameField = profileInfo.Fields.FirstOrDefault(f => f.Name.Equals(CompanyNameFieldName, StringComparison.InvariantCultureIgnoreCase));
            if (companyNameField != null)
            {
                SetStringFieldValue(companyNameField, ocrResponse.Data.Vat?.CompanyName, CompanyNameFieldName);
            }

            var companyAddressField = profileInfo.Fields.FirstOrDefault(f => f.Name.Equals(CompanyAddressFieldName, StringComparison.InvariantCultureIgnoreCase));
            if (companyAddressField != null)
            {
                SetStringFieldValue(companyAddressField, ocrResponse.Data.Vat?.CompanyAddress, CompanyAddressFieldName);
            }

            if (!string.IsNullOrWhiteSpace(MerchantFieldName))
            {
                var merchantField = profileInfo.Fields.FirstOrDefault(f => f.Name.Equals(MerchantFieldName, StringComparison.InvariantCultureIgnoreCase));
                if (merchantField != null)
                {
                    SetStringFieldValue(merchantField, ocrResponse.Data.Merchant, MerchantFieldName);
                }
            }

            if (!string.IsNullOrWhiteSpace(CountryCodeFieldName))
            {
                var countryCodeField = profileInfo.Fields.FirstOrDefault(f => f.Name.Equals(CountryCodeFieldName, StringComparison.InvariantCultureIgnoreCase));
                if (countryCodeField != null)
                {
                    SetStringFieldValue(countryCodeField, ocrResponse.Data.Vat?.CountryCode, CountryCodeFieldName);
                }
            }

            if (!string.IsNullOrWhiteSpace(DocumentNumberFieldName))
            {
                var documentNumberField = profileInfo.Fields.FirstOrDefault(f => f.Name.Equals(DocumentNumberFieldName, StringComparison.InvariantCultureIgnoreCase));
                if (documentNumberField != null)
                {
                    SetStringFieldValue(documentNumberField, ocrResponse.Data.DocumentNumber, DocumentNumberFieldName);
                }
            }
        }

        private void SetStringFieldValue(Abletech.WebApi.Client.Arxivar.Model.FieldBaseDTO field, string value, string fieldName)
        {
            if (field is AdditionalFieldStringDTO stringField)
            {
                stringField.Value = value;
            }
            else if (field is AdditionalFieldComboDTO comboField)
            {
                comboField.Value = value;
            }
            else if (field is AdditionalFieldTableDTO tableField)
            {
                tableField.Value = value;
            }
            else
            {
                throw new InvalidCastException($"[IMPOSTO I CAMPI DI PROFILO] Il campo {fieldName} deve essere di tipo stringa");
            }
        }

        /// <summary>
        /// Updates the document with the cropped file
        /// </summary>
        /// <param name="primaryProcessDocument">The primary document of the process</param>
        /// <param name="croppedFile">The cropped file</param>
        /// <param name="filename">The file name</param>
        /// <returns></returns>
        private async Task UpdateDocumentProfileAsync(ProcessDocumentForDashboardRm primaryProcessDocument, byte[] croppedFile, string filename)
        {
            var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N").Substring(0, 7));
            Directory.CreateDirectory(tempDir);

            try
            {

                using var fileStream = File.Open(Path.Combine(tempDir, filename), FileMode.OpenOrCreate, FileAccess.ReadWrite);
                fileStream.Write(croppedFile, 0, croppedFile.Length);

                if (fileStream.CanSeek)
                {
                    fileStream.Seek(0, SeekOrigin.Begin);
                }

                await ProcessDocumentsApi.ApiV1ProcessDocumentsCheckInProcessDocIdPostAsync(0, primaryProcessDocument.Id, fileStream);
            }
            finally
            {
                Directory.Delete(tempDir, true);
            }
        }

        /// <summary>
        /// Executes the OCR procedure, calling the external service
        /// </summary>
        /// <param name="client">The <see cref="HttpClient"/> instance</param>
        /// <param name="fileContent">The content of the file to pass to the OCR</param>
        /// <param name="filename">The file name</param>
        /// <returns>The response received by the OCR service</returns>
        private async Task<OcrResponse> ExecuteOcrAsync(HttpClient client, byte[] fileContent, string filename)
        {
            var byteArrayContent = new ByteArrayContent(fileContent);
            byteArrayContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
            byteArrayContent.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("form-data")
            {
                Name = "file",
                FileName = filename
            };

            var content = new MultipartFormDataContent();
            content.Add(byteArrayContent, "file");

            var response = await client.PostAsync("ocr", content);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<OcrResponse>(responseString);
        }

        /// <summary>
        /// Crops the specified process document, calling the external service
        /// </summary>
        /// <param name="client">The <see cref="HttpClient"/> instance</param>
        /// <param name="processDocument">The process document stream</param>
        /// <param name="filename">The file name</param>
        /// <returns>The cropped file as a byte array</returns>
        private async Task<byte[]> CropDocumentAsync(HttpClient client, Stream processDocument, string filename)
        {
            if (processDocument.CanSeek)
            {
                processDocument.Seek(0, SeekOrigin.Begin);
            }

            using var memoryStream = new MemoryStream();
            await processDocument.CopyToAsync(memoryStream);

            var array = memoryStream.ToArray();
            var fileContent = new ByteArrayContent(array);
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
            fileContent.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("form-data")
            {
                Name = "file",
                FileName = filename
            };

            var content = new MultipartFormDataContent();
            content.Add(fileContent, "file");

            var response = await client.PostAsync("crop", content);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsByteArrayAsync();
        }

        /// <summary>
        /// Downloads the stream of the primary document of the process
        /// </summary>
        /// <param name="primaryProcessDocument">The primary document information</param>
        /// <returns>The stream of the primary document file</returns>
        private async Task<Stream> DownloadPrimaryProcessDocumentAsync(ProcessDocumentForDashboardRm primaryProcessDocument)
          => await ProcessDocumentsApi.ApiV1ProcessDocumentsProcessDocIdGetAsync(primaryProcessDocument.Id);

        private async Task<ProcessDocumentForDashboardRm> GetPrimaryProcessDocumentAsync(Guid processId)
        {
            var processDocuments = await ProcessesApi.ApiV1ProcessesProcessIdDocumentsGetAsync(processId);
            return processDocuments.FirstOrDefault(d => d.DocumentKind == 0);
        }

        private HttpClient CreateFeesScanHttpClient()
        {
            var client = new HttpClient { BaseAddress = new Uri(_feesScanEndpoint) };
            client.DefaultRequestHeaders.Add("x-api-key", ApiKey);

            return client;
        }
        #endregion
    }
}
