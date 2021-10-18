#!/usr/bin/env node

// +-------------------------------------------------------------------------
// | webSocket并发压力测试(测试服务端)
// +-------------------------------------------------------------------------
// | Copyright (c) 2017~2018 http://blog.php127.com All rights reserved.
// +-------------------------------------------------------------------------
// | Author: 读心印 <aa24615@qq.com>
// +-------------------------------------------------------------------------

const WebSocketServer = require('ws').WebSocketServer;

const wss = new WebSocketServer({
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed if context takeover is disabled.
    }
});

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data, isBinary) {
        wss.clients.forEach(function each(client) {
            try {
                client.send(data, { binary: isBinary });
            }catch (e){

            }
        });
    });
});