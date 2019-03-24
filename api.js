var fs = require('fs');
const http2 = require('http2');
const options = {
    key: fs.readFileSync('./certs/server-key.pem'),
    cert: fs.readFileSync('./certs/server-crt.pem'),
    ca: fs.readFileSync('./certs/ca-crt.pem'),
    enablePush: true
};

// https is necessary otherwise browsers will not
// be able to connect
const server = http2.createSecureServer(options);

server.on('stream', (stream, headers, flags) => {
    const path = headers[':path'];
    const result = route(path);
    const file = './resources/' + result.file;
    const content = fs.readFileSync(file);

    if (result.contentType.indexOf('json') > 0 && headers['prefer-push'] == 'friends') {
        const json = JSON.parse(content);

        for (const friend of json.hero.friends) {
            const friendResult = route(friend.id);
            const friendFile = './resources/' + friendResult.file;
            const friendContent = fs.readFileSync(friendFile);

            stream.pushStream({ ':path': friend.id }, (err, pushStream) => {
                if (err) {
                    throw err;
                }

                console.log(`Pushing ${friend.id}`, friendResult);

                pushStream.respond({
                    ':status': friendResult.status,
                    'content-type': friendResult.contentType
                });
                pushStream.end(friendContent);
            });
        }
    }

    stream.respond({
        ':status': result.status,
        'content-type': result.contentType,
    });
    stream.end(content);
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