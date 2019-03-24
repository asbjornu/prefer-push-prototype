var fs = require('fs');
const http2 = require('http2');
const options = {
    key: fs.readFileSync('./certs/server-key.pem'),
    cert: fs.readFileSync('./certs/server-crt.pem'),
    ca: fs.readFileSync('./certs/ca-crt.pem')
};

// https is necessary otherwise browsers will not
// be able to connect
const server = http2.createSecureServer(options);

server.on('stream', (stream, headers, flags) => {
    var result = route(headers, stream);

    // TODO: Figure out why fs.readFile() works while stream.respondWithFile() doesn't.
    var file = './resources/' + result.file;
    fs.readFile(file, (err, data) => {
        if (err) {
            throw err;
        }

        stream.respond({
            ':status': result.status,
            'content-type': result.contentType,
        });
        stream.write(data);
        stream.end();
    });
});

server.listen(3000);

const route = function(headers, stream) {
    var path = headers[':path'];

    console.log('path', path);

    switch (path) {
        case '/':
            return {
                file: 'root.json',
                status: 200,
                contentType: 'application/json'
            }
    }

    return {
        file: '404.json',
        status: 404,
        contentType: 'application/problem+json'
    }
}