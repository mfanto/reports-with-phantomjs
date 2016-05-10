# Generating reports with PhantomJS

PhantomJS is a headless web browser built on WebKit. It can render any webpage (including any client-side Javascript), and save the output as HTML, PNG, or even PDF.

This repository is an example of using PhantomJS to create PDF reports with beautiful graphs, regardless of your back end. It doesn't require anything more than HTML, CSS, and Javascript.

## Dependencies

The PhantomJS server is built with Typescript. You must have the Typescript compiler installed to build the server.

The example back end is built with ASP.NET MVC, but any server will work. 
 
## Architecture

There's two services in this example.  

* aspnet/ - An example back end. This could be an ASP.NET MVC project, a Node.js server, etc. It's responsible for showing the download page, as well as 
generating the report. 

* phantomjs/ - The PhantomJS server. This handles rendering the PDF. 

The process looks like:

<div>1. When a user generates a report, a request is made from the back end to PhantomJS with the URL of the report:</div>

    
    { title: "Report Title", name: "Your Name", url: "http://localhost:50267/home/report" }
    
<div>2. PhantomJS renders the URL, saves the result as a PDF, and returns the file to the calling service:</div>

    
    response.statusCode = 200;
    response.headers = {
        "Cache": "no-cache",
        "Content-Type": "application/pdf"
    };
          
    response.write(pdf);
    
<div>3. Your app can then serve the file to the user, save it in cloud storage, etc. </div>

### Back end notes

1. The URL to the PhantomJS instance is read from app settings in Web.config. This allows us to set different urls depending on our enviornment.  
2. [HomeController::Index()](http://localhost:50267/home) - Shows the page where the user can enter their name and download a report
3. [HomeController::Report()](http://localhost:50267/home/report) - Renders the report. Viewing this in a browser will show the Highcharts graph and data table

## Installing and Running

After cloning this repository, install any dependencies: 

    cd phantomjs && npm install 

You can build the PhantomJS server with: 

    gulp typescript
    
Which results in the file `builld/server.js`. 

To run the server:

    gulp run
    
## Limitations and Improvements

1. **There is no authentication or authorization in this demo.**
2. Because the header and footer properties are added by PhantomJS, none of your report stylesheets will affect them. As a result, headers and footers need to be styled inline. 
