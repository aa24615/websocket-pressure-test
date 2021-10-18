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
const fs = require('fs');
let count = 0;
let failed = 0;
const error = 0;
let close = 0;

// 增加接收訊息量的計數器
let byteReceived = 0;
let messageReceived = 0;

const url = process.argv[2] || 'ws://127.0.0.1:9502';
const c = process.argv[3] || 10000;

// 新增一個自訂參數，可以讀取json檔案中的訊息，並透過WS發送
var customData = process.argv[4] || false;
var fileContents;
var customJSON;
try {
    fileContents = fs.readFileSync(customData);
    customJSON = JSON.parse(fileContents);
} catch (err) {
    customData = false;
    customJSON = null;
}


for (let i = 1; i <= c; i++) {
    ws(i);
}

function ws(i) {
    const client = new WebSocketClient();
    client.on('connectFailed', function (error) {
        failed++;
        state();
    });
    client.on('connect', function (connection) {
        count++;
        state();
        connection.on('error', function (error) {
            error++;
            state();
        });
        connection.on('close', function () {
            close++;
            state();
        });
        connection.on('message', function (message) {
            // 轉成字串，計算接收到的訊息大小
            let temp_size = JSON.stringify(message).length;
            byteReceived += temp_size;
            messageReceived++;
            state();
        });

        // 檢查，若有自訂訊息，則傳送自訂訊息，若否，則使用原本預定的數字傳送
        if (!customData) {
            function sendNumber() {
                if (connection.connected) {
                    const number = Math.round(Math.random() * 0xFFFFFF);
                    connection.sendUTF(number.toString());
                    setTimeout(sendNumber, 1000);
                }
            }
            sendNumber();
        } else {
            //以字串方式傳送自訂訊息
            function sendMyMessage() {
                // 在有連線的情況下才送出訊息
                if (connection.connected) {
                    connection.send(JSON.stringify(customJSON));
                } else {
                    //若連線尚未建立，等待一秒後再送一次
                    setTimeout(sendMyMessage, 1000);
                }
            }
            sendMyMessage();
        }

    });
    client.connect(url);
}

function state() {
    process.stdout.write(clc.move.top);
    console.debug(
        clc.green('连接成功:') + clc.white(count),
        clc.yellow('连接失败:') + clc.white(failed),
        clc.magenta('连接错误:') + clc.white(error),
        clc.yellow('连接关闭:') + clc.white(close),
        clc.magenta('已接收字节:') + clc.white(byteReceived < 1024 ? byteReceived + 'B' : (byteReceived / 1024).toFixed(2) + 'KB'),
        clc.red('已接收訊息:') + clc.white(messageReceived)
    );
}