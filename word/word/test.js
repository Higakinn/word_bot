const ACCESS_TOKEN = '__ACCESS_TOKEN__'
const USER_ID = '__USER_ID__'

function deleteTrigger() {
  var allTriggers = ScriptApp.getScriptTriggers();
  for(var i=0; i < allTriggers.length; i++) {
      ScriptApp.deleteTrigger(allTriggers[i]);
  }
}

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
}

function handleMessage(e) {
    var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
    var lineType = JSON.parse(e.postData.contents).events[0].type
    if (typeof replyToken === "undefined" || lineType === "follow") {
        return;
    }
    replyButtonTemplate(replyToken)
}

function notifyForForgettingCurve(){
  var SHEET_ID = '__SHEET_ID__'
  var spreadSheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet = spreadSheet.getSheets()[0];
  var range = sheet.getDataRange();
  var values = range.getValues();
  for(v of values.slice(1)){
    var timestamp = v[0]
    var timeLag = (new Date() - timestamp)/ 86400000
    console.log(timeLag)
    // 一時間後、一日後、一週間後、一ヶ月後
    if (0.0416 <= timeLag && timeLag <= 0.125 || 1 <= timeLag && timeLag < 2 || 7 <= timeLag && timeLag < 8 || 30 <= timeLag && timeLag < 31) {
      console.log(v[1])
      pushM(v[1]);
    }
  }
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
          'type':'text',
          'text':"復習のタイミングです。\n 単語の復習を行ってください。",
        },
        {
          'type':'text',
          'text': text,
        }]
      
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
        "messages": message
        }),
    });
    return ContentService.createTextOutput(JSON.stringify({"content": "post ok"})).setMimeType(ContentService.MimeType.JSON);
}
function replyMessage(replyToken, message) {
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