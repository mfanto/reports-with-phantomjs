using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using App.ViewModels;
using Newtonsoft.Json;

namespace App.Controllers
{
    /// <summary>
    /// Home Controller
    /// </summary>
    public class HomeController : Controller
    {
        /// <summary>
        /// GET: Show the page to generate a report
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Index()
        {
            return View(new ReportOptionsViewModel());
        }


        /// <summary>
        /// POST: Call PhantomJS to generate the PDF and return the result
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<FileResult> Index(ReportOptionsViewModel model)
        {
            // Create the HTTP Client
            HttpClient client = new HttpClient();

            // We send PhantomJS 3 parameters: the URL of the report, the title, and the user's name.
            var request = new
            {
                url = Url.Action("Report", "Home", new { }, Request.Url.Scheme),
                title = "Example Report",
                name = model.Name
            };

            // Call PhantomJS. We get the URL from AppSettings, so that we can use different URL's for different environments 
            var response = await client.PostAsync(ConfigurationManager.AppSettings["PhantomJSUrl"], new StringContent(JsonConvert.SerializeObject(request)));

            // read the response as a byte array
            var data = await response.Content.ReadAsByteArrayAsync();

            // return a FileResult
            return new FileContentResult(data, "application/pdf")
            {
                FileDownloadName = "Example Report.pdf"
            };
        }

        /// <summary>
        /// GET: Action called by PhantomJS that returns the report view
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Report()
        {
            return View();
        }
    }
}