/// <reference path="./typings/phantomjs/phantomjs.d.ts"/>

/** Report options (sent from the client) */
interface IReportOptions {

     /** URL to render */
     url: string;

     /** Report title */
     title: string;

     /** Users name (for displaying on the report header) */
     name: string;
}

/** Phantom interface to add some properties missing from the typedef file */
interface Phantom {

     /** Callback object for headers/footers */
     callback: any;
}

/** The PhantomJS server */
class Server {

     private server: WebServer = require("webserver").create();
     private system: System = require("system");

     /** @constructor */
     constructor() {

          // read the port from the command line
          let port = this.readCommandLineArguments();

          // set up the error handler
          phantom.onError = this.onError;

          // start the server. each request gets handled by this.requestHandler()
          let result = this.server.listen(port, this.requestHandler);

          if (!result) {
               console.log("Couldn't start web server");
               phantom.exit(1);
          }

          console.log("Listening on port " + port);
     }

     /**
      * Read the command line arguments looking for the port number
      * @returns {number} The port number to listen on
      */
     private readCommandLineArguments = (): number => {

          // validate command line arguments
          if (this.system.args.length !== 2) {
               console.log("usage: phantomjs server.js <port>");
               phantom.exit(1);
          }

          return +this.system.args[1];
     };

     /**
      * Handle an incoming request to generat a PDF
      * @param {any} request - The request object. request.post has the POST body as JSON
      * @param {any} reponse - The response object. 
      **/
     private requestHandler = (request, response) => {

          response.statusCode = 200;
          response.headers = {
               "Cache": "no-cache",
               "Content-Type": "application/pdf"
          };

          response.setEncoding("binary");

          // get the post body
          let data: IReportOptions = JSON.parse(request.post);

          // call render, and write the result to the response stream
          this.render(data, (pdf: any) => {
               response.write(pdf);
               response.close();
          });
     };

     /**
      * Call the URL and render the result as a PDF
      * @param {IRequestOptions} options - The request options
      * @param {any} callback - Success callback 
      */
     private render = (options: IReportOptions, callback: any) => {

          let fs = require("fs");

          // get a random filename to save to
          let tempFile = "pdfs/" + Math.random().toString(36).substr(2, 5) + ".pdf";

          // set up the initial page defaults
          let page = this.initializePdfPageDefaults(options.title, options.name);

          // open the URL to render
          page.open(options.url, (status: any) => {

               if (status === "success") {

                    page.render(tempFile);

                    var pdf = fs.read(tempFile, 'b');

                    callback(pdf);
               }
               else {
                    console.log("Unable to open report page: " + status);
               }
          });
     };

     /**
      * Set up the PDF page with the the right size, margins, and headers and footers
      * @param {string} title - Report title
      * @param {string} name - The user's full name. Just to demonstrate how to set something in the header dynamically
      * @returns {WebPage} - A blank page 
      */
     private initializePdfPageDefaults = (title: string, name: string): any => {

          // create a page
          let page: any = require("webpage").create();

          let header = `<div style="font-family: Helvetica, Arial, sans-serif; border-bottom: 1px solid black;">
                         <span style="font-weight: bold">${title}</span><br/>
                         Created By: ${name}
                         <div style="color: #2E528B; display: block; float: right; font-weight: bold; font-size: 22px; text-decoration: none; margin-top: -20px">Logo<sup>&reg;</sup></div>
                      </div>`;

          page.viewportSize = { width: 1024, height: 1024 };

          page.paperSize = {
               format: "Letter",
               border: "1cm",
               footer: {
                    height: "1cm",
                    contents: phantom.callback((pageNum: number, numPages: number) => {
                         return `<div style="display:block"><span style="font-size:10px; font-style:italic">This is a footer that is appended to the bottom of every page. It's useful for copyrights and legal notices</span></div>`;
                    })
               },
               header: {
                    height: "4cm",
                    contents: phantom.callback((pageNum: number, numPages: number) => {
                         return header;
                    })
               }
          };

          return page;
     };

     /**
      * Called when an error occurs. This exits the script
      * @param {any} msg - The error message
      * @param {any} trace - Error trace
      */
     private onError = (msg: any, trace: any) => {
          console.error(msg);
          phantom.exit(1);
     };
}

// create a new server
let server = new Server();