var http = require('http');
var qs = require('querystring');
var fs = require('fs');
var path =  require('path');
var data_dir = "data";

if (!fs.existsSync(data_dir)){
    fs.mkdirSync(data_dir);
}

http.createServer(function (req, res) {
  // set up some routes
  switch(req.url) {
    case '/':
      console.log("[501] " + req.method + " to " + req.url);
      res.writeHead(501, "Not implemented", {'Content-Type': 'text/html'});
      res.end('<html><head><title>501 - Not implemented</title></head><body><h1>Not implemented!</h1></body></html>');
      break;
    case '/crawl_handler':

      if (req.method == 'POST') {
        console.log("[200] " + req.method + " to " + req.url);
         var body = "";
        req.on('data', function(chunk) {
            body += chunk.toString();
            //console.log("Received body data:");
            //console.log(chunk.toString());
        });
    
        req.on('end', function() {
            var post = qs.parse(body);
            file_name = post['f']
            file_path = path.join(data_dir,file_name);
            content = post['d']
            //console.log(body)
            fs.writeFile(file_path, content, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file "+file_name+" was saved!");
            }); 
            // empty 200 OK response for now
            res.writeHead(200, "OK", {'Content-Type': 'text/html'});
            res.end();
        });
    
      } else {
        console.log("[405] " + req.method + " to " + req.url);
        res.writeHead(405, "Method not supported", {'Content-Type': 'text/html'});
        res.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
      }
      break;

    default:
      res.writeHead(404, "Not found", {'Content-Type': 'text/html'});
      res.end('<html><head><title>404 - Not found</title></head><body><h1>Not found.</h1></body></html>');
      console.log("[404] " + req.method + " to " + req.url);
  };
}).listen(8080); // listen on tcp port 8080 (all interfaces)
