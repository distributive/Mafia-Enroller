const express = require ("express");
const app = express ();
const http = require ("http").createServer (app);
const io = require ("socket.io") (http);
const fs = require ("fs");

import * as Sockets from "./sockets";
Sockets.init (io);

import * as Util from "./util";



// Command line arguments
let args: string[] = process.argv.slice (2);



// Set port to listen to
let port: number;
if (args[0])
    port = parseInt (args[0]);
else
    port = 8080;



// Static path
app.use (`/static`, express.static ("static"));



// Pages/redirects
app.get (`/`, (req, res) => {
    let html = fs.readFileSync (`${__dirname}/index.html`, "utf8");
    res.send (html);
});

app.get (`/*`, function (req, res) {
    res.writeHead (302, {"Location": `/`});
    res.end ();
});



// Error catching
app.use (function (err, req, res, next) {
	// Log error
	console.error ("Error detected:");
	console.error (err.stack);
	console.error ();

	// Send response
	res.writeHead (302, {"Location": `/`});
	res.end ();
});



// Run server
http.listen (port, () => {
    console.log (`Listening on *:${port}`);
});
