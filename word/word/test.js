const ACCESS_TOKEN = '__ACCESS_TOKEN__'
const USER_ID = '__USER_ID__'

function deleteTrigger() {
  var allTriggers = ScriptApp.getScriptTriggers();
  for(var i=0; i < allTriggers.length; i++) {
      ScriptApp.deleteTrigger(allTriggers[i]);
  }
}
// function setWordTrigger(timestamp,status,word){
//   console.log(status)
//   // 現在の日付を取得
//   const next = new Date();

//   const year = timestamp.getFullYear()
//   const day = timestamp.getDate()
//   // 翌日の日付に変換
//   next.setFullYear(year)
//   next.setMonth(timestamp.getMonth() + 1);
//   next.setDate(day)

//   // 09:30:00に時刻を設定
//   next.setHours(timestamp.getHours + 1);
//   next.setMinutes(timestamp.getMinutes);
//   next.setMinutes(timestamp.getSeconds);
//   next.setSeconds(0);
//   switch(status) {
//     case 1: 
//      // 一時間後にトリガーを設定
//      //スプレッドシートを更新
//      console.log("一時間後にトリガーを設定")
//      setTrigger(year,mounth, day, 3600 * 10, word)
//      break;
//     case 2: 
//      // 一日後にトリガーを設定
//      console.log("一日後にトリガーを設定")
//      setTrigger(year,mounth, day, 86400 + 7200,word)
//      break;
//     case 3: 
//      // 一週間後にトリガーを設定
//      console.log("一週間後にトリガーを設定")

//      setTrigger(year,mounth, day, 604800 + 7200,word)
//      break;
//     case 4: 
//      // 一ヶ月後にトリガーを設定
//      console.log("一ヶ月後にトリガーを設定")

//      setTrigger(year,mounth, day, 2592000 + 7200,word)
//      break;
//     default :
//      console.log("error")
    
//      break
//   }
// }

function logging(str) {
    var sheet = SpreadsheetApp.openById("__DUBUG_SHEET_ID__").getActiveSheet();
    var ts = new Date().toLocaleString("japanese", {timeZone: "Asia/Osaka"});
    sheet.appendRow([ts, str]);
}

function doPost(e) {
    try {
        handleMessage(e);
      } catch(error) {
        logging("Word bot");
        logging(JSON.stringify(e));
        logging(JSON.stringify(error));
        var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
        reply(replyToken, error.message)
    }    
//   var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
//   var lineType = JSON.parse(e.postData.contents).events[0].type
//   if (typeof replyToken === "undefined" || lineType === "follow") {
//     return;
//   }
//   var userMessage = JSON.parse(e.postData.contents).events[0].message.text;
//   var cache = CacheService.getScriptCache();
//   var type = cache.get("type");
//   reply(replyToken, "hoge");   
}
function handleMessage(e) {
    var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
    var lineType = JSON.parse(e.postData.contents).events[0].type
    if (typeof replyToken === "undefined" || lineType === "follow") {
        return;
    }
    var userMessage = JSON.parse(e.postData.contents).events[0].message.text;
    var cache = CacheService.getScriptCache();
    // reply(replyToken, "hoge");
    replyButtonTemplate(replyToken)
}
// function setTrigger(year, mounth, day, time,content) {
//   var onChangeTrigger = ScriptApp.newTrigger("createMessage")
//   .timeBased()
//   .atDate(year, mounth, day)
//   .after(time * 1000)
//   .at(content)
//   .create();
// }
function createMessages() {
    //メッセージを定義する
    message = "今日のreflactionを行ってください。";
    console.log("start")
    return pushM(message);
  }
  
//実際にメッセージを送信する関数を作成します。
function pushM(text) {
    //メッセージを送信(push)する時に必要なurlでこれは、皆同じなので、修正する必要ありません。
    //この関数は全て基本コピペで大丈夫です。
      var url = "https://api.line.me/v2/bot/message/push";
      var headers = {
        "Content-Type" : "application/json; charset=UTF-8",
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
      };
      var pushMessages = [
        {
          "type": "template",
          "altText": "今日のリフレクションを行ってください。\n__LIFF_URL__",
          "template": {
              "type": "buttons",
              "thumbnailImageUrl": "https://example.com/bot/images/image.jpg",
              "imageAspectRatio": "rectangle",
              "imageSize": "cover",
              "imageBackgroundColor": "#FFFFFF",
              "title": "リフレクション",
              "text": "今日一日のリフレクションを行ってください。",
              "defaultAction": {
                  "type": "uri",
                  "label": "View detail",
                  "uri": "https://example.com"
              },
              "actions": [
                  {
                    "type": "uri",
                    "label": "リフレクション開始",
                    "uri": "__LIFF_URL__"
                  }
              ]
          }
        },
        {
          'type':'text',
          'text':"__LIFF_URL__",
        }]
      //toのところにメッセージを送信したいユーザーのIDを指定します。(toは最初の方で自分のIDを指定したので、linebotから自分に送信されることになります。)
      //textの部分は、送信されるメッセージが入ります。createMessageという関数で定義したメッセージがここに入ります。
      // var postData = {
      //   "to" : USER_ID,
      //   "messages" : [
      //     {
      //       'type':'text',
      //       'text':text,
      //     }
      //   ]
      // };
      
      var postData = {
        "to" : USER_ID,
        "messages" : pushMessages
      };
    
      var options = {
        "method" : "post",
        "headers" : headers,
        "payload" : JSON.stringify(postData)
      };
    
      return UrlFetchApp.fetch(url, options);
    }

function reply(replyToken, message) {
    var url = "https://api.line.me/v2/bot/message/reply";
    UrlFetchApp.fetch(url, {
      "headers": {
        "Content-Type": "application/json; charset=UTF-8",
        "Authorization": "Bearer " + ACCESS_TOKEN,
      },
      "method": "post",
      "payload": JSON.stringify({
        "replyToken": replyToken,
        "messages": [{
          "type": "text",
          "text": message,
        }],
      }),
    });
    return ContentService.createTextOutput(JSON.stringify({"content": "post ok"})).setMimeType(ContentService.MimeType.JSON);
}



function replyButtonTemplate(replayToken) {
  //「単語登録」のリッチメニューをクリックすると、googleフォームにアクセスするためのボタンテンプレートを返す(liffのリンクが埋め込まれたもの)
  var buttonMessage = [{
          "type": "text",
          "text": "message",
        },
        {
            "type": "template",
            "altText": "覚えたい単語を登録する\n__LIFF_URL__",
            "template": {
                "type": "buttons",
                "thumbnailImageUrl": "https://example.com/bot/images/image.jpg",
                "imageAspectRatio": "rectangle",
                "imageSize": "cover",
                "imageBackgroundColor": "#FFFFFF",
                "title": "登録",
                "text": "覚えたい単語を登録する",
                "defaultAction": {
                    "type": "uri",
                    "label": "View detail",
                    "uri": "__LIFF_URL__"
                },
                "actions": [
                    {
                      "type": "uri",
                      "label": "単語登録",
                      "uri": "__LIFF_URL__"
                    }
                ]
            }
        }
    ]
    
  // ]
  reply(replayToken,buttonMessage)
}


function confirmSpreadSheet(){
  /** 
   * 全体の流れ
   * 「単語登録」のリッチメニューをクリックすると、googleフォームにアクセスするためのカルーセル(liffのリンクが埋め込まれたもの)
   * ↓
   * 👆のgoogle フォームを使って、覚えたい単語を登録する
   * ↓
   * googleフォームから送信されたのをトリガーにスプレッドシートを確認。
   * ↓
   * 現在の時刻とスプレッドシートの時間差を算出（それ以外にもトリガーを定期的に実行してスプレッドシートを確認する
   * ↓
   * 1時間、一日、一週間,一ヶ月の差があるやつがあればlineで通知する
  */
  //スプレッドシートのタイムスタンプをみてトリガーをセットする
    // deleteTrigger()
    var SHEET_ID = '1CmrNV7K9yRwtqZzBua4inMrBRk9ccexjcTj_RhBIcOw'
    var spreadSheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadSheet.getSheets()[0];
    // そのシート上の値が存在するセル範囲を取得
    var range = sheet.getDataRange();
    // そのセル範囲にある値の多次元配列を取得
    var values = range.getValues();
    var date = values[1][0]
    // //登録されているスプレッドシートの中身をみる
    // for(let vals of values.slice(1)) {
    //   // タイムスタンプ、用語、ステータス
    //   const timestamp = vals[0]
    //   const word = vals[1]
    //   const status = vals[2]
    //   console.log(timestamp.getFullYear());
    //   // console.log(status)
    // }
    console.log(values.slice(-1)[0])
    const timestamp = values.slice(-1)[0][0]
    const words = values.slice(-1)[0][1]
    const status = values.slice(-1)[0][2]
    setWordTrigger(timestamp,status,words)
    // console.log(values.slice(-1)[0])
    // console.log(date.getHours())
    // const row = values.length + 1
    // const column = 1
    // const numRows = 1
    // const numColumns = 4
    // sheet.getRange(row, column, numRows, numColumns).setValues(message);
}