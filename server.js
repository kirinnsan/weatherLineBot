'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;
let bodyParser = require('body-parser');
let request = require('request');

const config = {
  channelSecret: process.env.SECRET_KEY,
  channelAccessToken: process.env.ACCESS_TOKEN,
  WEATHER_API_KEY: process.env.API_KEY
};


const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
  console.log(req.body.events);

  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result), (error) => {
      console.log('エラー' + error);
    });
});

const client = new line.Client(config);

function handleEvent(event) {

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  var city = 'Itami-shi';
  var url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + city + ',jp&units=metric&APPID=' + config.WEATHER_API_KEY;
  let option = {
    url: url,
    method: 'GET',
    json: true
  }

  // 天気予報取得
  request.get(option, function (error, response, body) {

    let result = body.city.name;
    if (!error && response.statusCode == 200) {

      let Week = new Array("（日）", "（月）", "（火）", "（水）", "（木）", "（金）", "（土）");

      for (let i = 0; i <= 4; i++) {
        let date = new Date(body.list[i].dt_txt);
        date.setHours(date.getHours() + 9);
        let month = date.getMonth() + 1;
        let day = month + "月" + date.getDate() + "日" + Week[date.getDay()] + date.getHours() + "：00";
        let weather = body.list[i].weather[0].main;

        result += '\n' + day + '\n' + weather + '\n';
      }

      console.log(result);
    } else {
      console.log('エラー' + error.message);
    }
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: result // 返信メッセージ
    });
  });
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);