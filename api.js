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
    const statCheck = function(stat, statHeaders) {
        statHeaders['last-modified'] = stat.mtime.toUTCString();
    }

    const onError = function(err) {
        if (err.code === 'ENOENT') {
            var result404 = route('404');
            stream.respondWithFile('./resources/404.json', {
                'content-type': 'application/problem+json'
            });
        } else {
            stream.respond({
                ':status': 500
            });
        }
        stream.end();
    }

    const path = headers[':path'];
    const result = route(path);
    const file = './resources/' + result.file;

    stream.respondWithFile(file, {
        ':status': result.status,
        'content-type': result.contentType,
    }, { statCheck, onError });

    /*s.readFile(file, (err, data) => {
        if (err) {
            console.log(err);
            return;
        }

        stream.respond({
            ':status': result.status,
            'content-type': result.contentType,
        });
        stream.write(data);
        stream.end();
    });*/
});

server.listen(3000);

const route = function(path) {
    console.log('path', path);

    switch (path) {
        case '/':
            return {
                file: 'index.html',
                status: 200,
                contentType: 'text/html; charset=utf-8'
            };

        case '/heroes':
        case '/heroes/':
            return {
                file: 'heroes.json',
                status: 200,
                contentType: 'application/json'
            };

        case '/heroes/r2-d2':
            return {
                file: 'r2-d2.json',
                status: 200,
                contentType: 'application/json'
            };

        case '/heroes/luke-skywalker':
            return {
                file: 'luke-skywalker.json',
                status: 200,
                contentType: 'application/json'
            };

        case '/heroes/han-solo':
            return {
                file: 'han-solo.json',
                status: 200,
                contentType: 'application/json'
            };

        case '/heroes/leia-organa':
            return {
                file: 'leia-organa.json',
                status: 200,
                contentType: 'application/json'
            };

    }

    return {
        file: '404.json',
        status: 404,
        contentType: 'application/problem+json'
    }
}