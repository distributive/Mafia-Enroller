"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var fs = require("fs");
var Sockets = require("./sockets");
Sockets.init(io);
// Command line arguments
var args = process.argv.slice(2);
// Set port to listen to
var port;
if (args[0])
    port = parseInt(args[0]);
else
    port = 8080;
// Static path
app.use("/static", express.static("static"));
// Pages/redirects
app.get("/", function (req, res) {
    var html = fs.readFileSync(__dirname + "/index.html", "utf8");
    res.send(html);
});
app.get("/*", function (req, res) {
    res.writeHead(302, { "Location": "/" });
    res.end();
});
// Error catching
app.use(function (err, req, res, next) {
    // Log error
    console.error("Error detected:");
    console.error(err.stack);
    console.error();
    // Send response
    res.writeHead(302, { "Location": "/" });
    res.end();
});
// Run server
http.listen(port, function () {
    console.log("Listening on *:" + port);
});
