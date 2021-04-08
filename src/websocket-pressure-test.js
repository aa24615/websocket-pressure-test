#!/usr/bin/env node

// +-------------------------------------------------------------------------
// | webSocket并发压力测试
// +-------------------------------------------------------------------------
// | Copyright (c) 2017~2018 http://blog.php127.com All rights reserved.
// +-------------------------------------------------------------------------
// | Author: 读心印 <839024615@qq.com>
// +-------------------------------------------------------------------------

const clc = require('cli-color');
const WebSocketClient = require('websocket').client;
let count = 0;
let failed = 0;
const error = 0;
let close = 0;

const url = process.argv[2] || 'ws://127.0.0.1:9502';
const c = process.argv[3] || 10000;
for (let i=1; i<=c; i++) {
    ws(i);
}

function ws(i) {
    const client = new WebSocketClient();
    client.on('connectFailed', function(error) {
        failed++;
        state();
    });
    client.on('connect', function(connection) {
        count++;
        state();
        connection.on('error', function(error) {
            error++;
            state();
        });
        connection.on('close', function() {
            close++;
            state();
        });
        connection.on('message', function(message) {
        });
        function sendNumber() {
            if (connection.connected) {
                const number = Math.round(Math.random() * 0xFFFFFF);
                connection.sendUTF(number.toString());
                setTimeout(sendNumber, 1000);
            }
        }
        sendNumber();
    });
    client.connect(url);
}

function state() {
    process.stdout.write(clc.move.top);
    console.debug(
        clc.green('连接成功:')+clc.white(count),
        clc.yellow('连接失败:')+clc.white(failed),
        clc.magenta('连接错误:')+clc.white(error),
        clc.yellow('连接关闭:')+clc.white(close),
    );
}
