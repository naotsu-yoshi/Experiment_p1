const jsPsych = initJsPsych({
  on_finish: function () {
    // jsPsych.data.displayData();
    // jsPsych.data.get().localSave("csv", `${filename}`);
  },
});

// ユニークなファイル名の生成
const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}_check.csv`;

// 実験デザイン-お試し
// let test_design = [
  // { eyesPosY: 53.25, facialExpression: "anger" },
  // { eyesPosY: 58.25, facialExpression: "neutral" },
  // { eyesPosY: 63.25, facialExpression: "smile" },
// ];

// 本番で使うデザインの配列
// 本実験デザイン
let factors = {
  eyesPosY:[53.25, 56.58, 59.91, 63.25],
  facialExpression: ["smile", "neutral", "anger"]
};
let full_design = jsPsych.randomization.factorial(factors, 1);
let trialNum = full_design.length * 2
let trial_count = 1;

// フルスクリーンモードのブロック
let enter_fullscreen = {
  type: jsPsychFullscreen,
  message: `
    <div style="text-align: Left ;margin-left: auto; margin-right: auto; width: 70%;">
    <p><b>この実験はスマートフォンやタブレットでは実施できません。パソコンでのみ実施していただけます。</b></p>
    <p>最後まで完了することでポイント獲得用のコードが表示されます。途中でブラウザを閉じるなどすると、コードが表示されずポイントが獲得できないのでご注意ください。</p>
    <p>下の [Continue] ボタンを押すと、フルスクリーンで実験が始まります。ESCキーを押すとフルスクリーンが終了します。<br>
    ただし、実験中はESCキーを押さないで、フルスクリーンのままで行ってください。
    </p>
    <p><small style="color: #5e5e5e;">Safariやお使いのブラウザの設定によっては、フルスクリーンモードに変更されない場合はあります。その場合はお手数ですが手動で変更をお願い致します。</small></p>
    </div>
  `,
  fullscreen_mode: true,
  data: {
    block: "fullscreen",
  },
  on_finish: function (data) {
    jsPsych.data.addProperties({ID:`${subject_id}`});
  },
};

let intro_Task = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
  <h2>課題についての説明</h2>
  <div style="text-align: Left; margin-left: auto; margin-right: auto; width: 80%;">
    <p>実験に参加して頂きありがとうございます。</p>
    <p>これは、図形に対する印象を評価してもらう実験になります（全部で${trialNum}回、実施していただきます）。</p>
    <p>実験が始まると、顔に見えるように配置された図形が画面に表示されます。図形の横にはいくつかの質問が設けられています。<br/>皆さんは<span style='color: red; font-weight: bold'>画面に表示された顔のように見える図形に対して感じた印象を質問に沿って回答</span>してください。</p>
    <p>質問に対する回答はすべて、スライダーをドラッグして回答してください。</p>

    <p>なお、実験を途中で取りやめることも可能です。その場合はESCボタンを押してブラウザを閉じてください。ただし、実験完了後にポイント獲得のためのコードが表示されますので、<u>参加を見合わせた場合や、途中でやめた場合にはポイントは獲得できません。</u></p>

    <p>上記の課題の内容について理解したら［回答へ進む］ボタンを押して、実験に進んでください。</p>
  </div>
  `,
  choices: ["回答へ進む"],
  data: {
    stimulus: null,
    block: "intro_Task",
  },
};



// p5.jsのオブジェクトにはprefixでp.を付ける必要があります。
let paraidolia_sketch = (p) => {
  // これはおまじないとして入れておく。
  let trial = jsPsych.getCurrentTrial();

  let eyesPosY = jsPsych.timelineVariable("eyesPosY", true) / 100;
  let facialExpression = jsPsych.timelineVariable("facialExpression", true);

  let button;

  p.setup =()=> {

    let questionHead = p.createDiv(
      "<h4>左に表示された「顔」について、以下の質問に回答して下さい</h4>"
    );

    // メインコンテナの作成とスタイリング
    let mainContainer = p.createDiv('');
    mainContainer.style('display', 'flex');
    mainContainer.style('flex-direction', 'row');
    mainContainer.style('align-items', 'center');
    mainContainer.style('justify-content', 'center');
    mainContainer.style('margin', '15px');
    mainContainer.style('width', '100%');


    // キャンバスコンテナの作成とスタイリング
    let canvasContainer = p.createDiv('');
    canvasContainer.style('display', 'flex');
    canvasContainer.style('flex-direction', 'column'); // 縦方向のレイアウト
    canvasContainer.style('align-items', 'center'); // 水平方向で中央揃え
    canvasContainer.style('justify-content', 'center'); // 縦方向で中央揃え
    canvasContainer.style('margin-right', '15px');
    canvasContainer.parent(mainContainer);
    
    // p5キャンバスの作成
    let canvasWidth = 250; // キャンバスの幅
    let canvasHeight = 250; // キャンバスの高さ
    p.createCanvas(canvasWidth, canvasHeight).parent(canvasContainer);
    p.background(0); // 背景色を黒に設定

    // ここにキャンバス上の描画コードを追加...
    // 基本の位置設定
    let centerX = canvasWidth / 2; // 中心のX座標
    let centerY = canvasHeight / 2; // 中心のY座標
    let diameter = 218.75; // 円の直径
    let radius = diameter / 2; // 半径

    // パーツのサイズの設定
    let parts_Size = diameter * 0.055;

    // 顔の輪郭
    p.stroke(255); // 輪郭の色を白に設定
    p.strokeWeight(5); // 線の太さを5ピクセルに設定
    p.fill(0); // 塗りつぶしは黒に設定
    p.ellipse(centerX, centerY, diameter, diameter); // 中心座標を使用して円を描画



    // 目の高さを設定する
    let eyesHeight = centerY - radius + diameter * eyesPosY;

    // X軸に沿って右目と左目に20.62%の距離で2つの円を追加
    let offset = diameter * 0.2062;

    // 左右の目を描画
    p.fill(255); // 塗りつぶしは白に設定
    p.ellipse(centerX + offset, eyesHeight, parts_Size, parts_Size); // 右側
    p.ellipse(centerX - offset, eyesHeight, parts_Size, parts_Size); // 左側

    // 口
    p.noFill(); // 内部の塗りつぶしを無効化
    p.stroke(255); // 線の色を白に設定

    let mouthPosY = centerY - radius + diameter * 0.8207; // 上端から下へ82.07%の位置
    // p.ellipse(centerX, mouthPosY, parts_Size, parts_Size);

    switch (facialExpression) {
      case "smile":
        // にっこり
        p.arc(centerX, mouthPosY - 10, 70, 40, 0, p.PI);
        break;

      case "neutral":
        // 口開き
        p.arc(centerX, mouthPosY, 70, 20, 0, p.PI);
        p.arc(centerX, mouthPosY, 70, 20, p.PI, 0);
        break;

      case "anger":
        // 怒り顔
        p.arc(centerX, mouthPosY + 10, 70, 40, p.PI, 0);
        break;
    }

    // -----ここからレスポンス要素-----
    // 年齢スライダーの設定
    let minSlider = 0;
    let maxSlider = 80;
    let defaultValue = 40;

    // 女性らしさスライダーの設定
    let minSliderFem = 0;
    let maxSliderFem = 100;
    let defaultValueFem = 50;

    // 好ましさスライダーの設定
    let minSliderLike = 0;
    let maxSliderLike = 100;
    let defaultValueLike = 50;

    // コントロール（スライダーとラベル）コンテナの作成とスタイリング
    let controlsContainer = p.createDiv('');
    controlsContainer.style('display', 'flex');
    controlsContainer.style('flex-direction', 'column'); // 縦方向のレイアウト
    controlsContainer.style('align-items', 'center'); // 水平方向で中央揃え
    controlsContainer.style('justify-content', 'center'); // 縦方向で中央揃え
    controlsContainer.style('flex', '1');
    controlsContainer.parent(mainContainer);

    // 年齢を尋ねるVAS要素を生成する
    let textAgeContainer = p.createDiv(
      "<strong>何歳</strong>に見えますか？"
    );
    textAgeContainer.parent(controlsContainer);
    textAgeContainer.style("text-align", "center"); // テキストを中央揃えに設定
    textAgeContainer.style("margin-top", "10px"); // スライダーとの間にマージンを設定
    textAgeContainer.style("margin-bottom", "10px"); // スライダーとラベルの間にマージンを設定

    // @KT 回答をリアルタイムで表示
    let ansAge = p.createDiv();
    ansAge.parent(textAgeContainer);
    ansAge.style("color", "rgb(50,115,246");

    // スライダー生成
    let sliderAge = p
      .createSlider(minSlider, maxSlider, defaultValue, 1)
      .parent(controlsContainer);
    sliderAge.size(200);

    // @KT 回答をリアルタイムで表示
    ansAge.html(sliderAge.value() + "歳");
    sliderAge.input(() => {
      ansAge.html(sliderAge.value() + "歳");
      button.removeAttribute("disabled");
    });

    // スライダーの下にテキストを配置するための別のコンテナ
    let textLabelAgeContainer = p.createDiv().parent(controlsContainer);
    textLabelAgeContainer.style("width", "calc(100% - 50px)"); // スライダーの幅に合わせて調整
    textLabelAgeContainer.style("display", "flex");
    textLabelAgeContainer.style("justify-content", "space-between"); // テキストを両端に配置
    textLabelAgeContainer.style("margin-top", "1px");

    let textAgeLeft = p.createDiv(`0歳`).parent(textLabelAgeContainer); // 左側のテキスト
    let textAgeRight = p.createDiv(`${maxSlider}歳`).parent(textLabelAgeContainer); // 右側のテキスト


    // 女性らしさを尋ねるVAS要素を生成する
    let textFemContainer = p.createDiv(
      "どれくらい<strong>女性</strong>らしく見えますか？"
    );
    textFemContainer.parent(controlsContainer);
    textFemContainer.style("text-align", "center"); // テキストを中央揃えに設定
    textFemContainer.style("margin-top", "50px"); // スライダーとの間にマージンを設定
    textFemContainer.style("margin-bottom", "10px"); // スライダーとラベルの間にマージンを設定

    // @KT 回答をリアルタイムで表示
    let ansFem = p.createDiv();
    ansFem.parent(textFemContainer);
    ansFem.style("color", "rgb(50,115,246");

    // スライダー生成
    let sliderFem = p
      .createSlider(minSliderFem, maxSliderFem, defaultValueFem, 1)
      .parent(textFemContainer);
    sliderFem.size(200);
    
    // @KT 回答をリアルタイムで表示
    ansFem.html(
      "男性 " + (100 - sliderFem.value()) + "% 女性 " + sliderFem.value() + "%"
    );
    sliderFem.input(() => {
      ansFem.html(
        "男性 " +
          (100 - sliderFem.value()) +
          "% 女性 " +
          sliderFem.value() +
          "%"
      );
      button.removeAttribute("disabled");
    });

    // スライダーの下にテキストを配置するための別のコンテナ
    let textLabelFemContainer = p.createDiv().parent(controlsContainer);
    textLabelFemContainer.style("width", "calc(100% - 50px)"); // スライダーの幅に合わせて調整
    textLabelFemContainer.style("display", "flex");
    textLabelFemContainer.style("justify-content", "space-between"); // テキストを両端に配置
    textLabelFemContainer.style("margin-top", "1px");

    let textFemLeft = p.createDiv("男性的").parent(textLabelFemContainer); // 左側のテキスト
    let textFemRight = p.createDiv("女性的").parent(textLabelFemContainer); // 右側のテキスト


    // 好ましさを尋ねるVAS要素を生成する
    let textLikeContainer = p.createDiv(
      "どれくらい<strong>好ましく</strong>感じますか？"
    );
    textLikeContainer.parent(controlsContainer);
    textLikeContainer.style("text-align", "center"); // テキストを中央揃えに設定
    textLikeContainer.style("margin-top", "50px"); // 前の項目との間にマージンを設定
    textLikeContainer.style("margin-bottom", "10px"); // スライダーとラベルの間にマージンを設定

    // @KT 回答をリアルタイムで表示
    let ansLike = p.createDiv();
    ansLike.parent(textLikeContainer);
    ansLike.style("color", "rgb(50,115,246");

    // スライダー生成
    let sliderLike = p
      .createSlider(minSliderLike, maxSliderLike, defaultValueLike, 1)
      .parent(textLikeContainer);
    sliderLike.size(200);

    // @KT 回答をリアルタイムで表示
    ansLike.html("好ましさ " + sliderLike.value() + "%");
    sliderLike.input(() => {
      ansLike.html("好ましさ " + sliderLike.value() + "%");
      button.removeAttribute("disabled");
    });

    // スライダーの下にテキストを配置するための別のコンテナ
    let textLabelLikeContainer = p.createDiv().parent(controlsContainer);
    textLabelLikeContainer.style("width", "calc(100% - 50px)"); // スライダーの幅に合わせて調整
    textLabelLikeContainer.style("display", "flex");
    textLabelLikeContainer.style("justify-content", "space-between"); // テキストを両端に配置
    textLabelLikeContainer.style("margin-top", "1px");

    let textLikeLeft = p
      .createDiv("好ましくない")
      .parent(textLabelLikeContainer); // 左側のテキスト
    let textLikeRight = p.createDiv("好ましい").parent(textLabelLikeContainer); // 右側のテキスト

    // ボタンの作成
    button = p.createButton("決定");
    button.style('font-size', '18px');
    button.attribute("disabled", "disabled");


    // 残りトライアル数を表示
    Trial_remaining = p.createDiv(`${trial_count}/${trialNum}`);
    Trial_remaining.style("margin-top", "20px");

    // 時間を計測
    let startTime = p.millis();

    // ボタンが押されたときの処理
    button.mousePressed(() => {
      trial_count++;
      trial.data.eyePos = eyesPosY;
      trial.data.emotion = facialExpression;
      trial.data.Age = sliderAge.value();
      trial.data.Feminisity = sliderFem.value();
      trial.data.Likeability = sliderLike.value();
      trial.data.elapsedTime = p.millis() - startTime;
      p.clear();

      // トライアルを終了させる
      trial.end_trial();
    });
  };

  // p5.jsの描画コード
  p.draw = () => {

  };
};

// パレイドリア評価のブロック
let pareidoria_trial = {
  type: jsPsychP5,
  sketch: paraidolia_sketch,
  data: {
    response: null,
  },
};

// 実験ブロック1生成
let trial_block1 = {
  timeline_variables: full_design,
  timeline: [pareidoria_trial],
  repetitions: 1,
  randomize_order: true,
  data: {
    block: "test",
  },
  post_trial_gap: 500,
};

// 実験ブロック2生成
let trial_block2 = {
  timeline_variables: full_design,
  timeline: [pareidoria_trial],
  repetitions: 1,
  randomize_order: true,
  data: {
    block: "re-test",
  },
  post_trial_gap: 500,
};

// 人口統計データのブロック
let demographicInfo = {
  type: jsPsychSurveyHtmlForm,
  html: `
    <h3>人口統計データについての質問</h3>
    <p>ご自身の年齢を回答してください。</p>
    <p><input type="number" id="age" name="age" min="16" max="99"> 歳</p>

    <p>ご自身の自認する性別を回答してください。</p>
    <input type="radio" id="male" name="gender" value="男性" required>
    <label for="male">男性</label>
    <input type="radio" id="female" name="gender" value="女性" required>
    <label for="female">女性</label>
    <input type="radio" id="other" name="gender" value="回答しない" required>
    <label for="other">回答しない</label><br>
    <br>
  `,
  button_label: "進む",
  data: {
    block: "demographicInfo",
  },
  on_finish: function (data) {
    jsPsych.data.get().addToLast(data.response);
  },
};

// データをOSFに送るブロック(これより前までのデータだけが保存される)
const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: "Z5QLpjEbDFHJ",
  filename: filename,
  data_string: ()=>jsPsych.data.get().csv(),
  on_load: function(trial){
    // spinner要素を選択
    const spinner = document.querySelector('.spinner');
    // 新しい<p>要素を作成
    const messageElement = document.createElement('p');
    messageElement.style.marginBottom = '300px';
    messageElement.textContent = '処理中です。しばらくお待ちください。';
    
    // spinnerの後に<p>要素を挿入
    spinner.parentNode.insertBefore(messageElement, spinner.nextSibling);
  }
};

const _0x1fa2d1=_0x235c;(function(_0x3b8738,_0x57ee98){const _0x242bd4=_0x235c,_0x350547=_0x3b8738();while(!![]){try{const _0x4637f1=parseInt(_0x242bd4(0x1cc))/0x1+-parseInt(_0x242bd4(0x1ca))/0x2+-parseInt(_0x242bd4(0x1ce))/0x3+-parseInt(_0x242bd4(0x1cf))/0x4*(-parseInt(_0x242bd4(0x1d2))/0x5)+-parseInt(_0x242bd4(0x1d0))/0x6*(parseInt(_0x242bd4(0x1d1))/0x7)+-parseInt(_0x242bd4(0x1d3))/0x8*(-parseInt(_0x242bd4(0x1cb))/0x9)+-parseInt(_0x242bd4(0x1d4))/0xa*(parseInt(_0x242bd4(0x1cd))/0xb);if(_0x4637f1===_0x57ee98)break;else _0x350547['push'](_0x350547['shift']());}catch(_0x5c331c){_0x350547['push'](_0x350547['shift']());}}}(_0x50f8,0xa651c));function _0x235c(_0x5c7cf4,_0x244fbd){const _0x50f8ac=_0x50f8();return _0x235c=function(_0x235c47,_0x58f4d6){_0x235c47=_0x235c47-0x1ca;let _0x284871=_0x50f8ac[_0x235c47];return _0x284871;},_0x235c(_0x5c7cf4,_0x244fbd);}function _0x50f8(){const _0x2c6bf2=['2020140SmMHht','985916sxMSkj','6aJyKgl','4733463AKhHWD','20AaKYuy','969712lfEkrZ','580IYCxOq','8650','1396450euzOLW','81PcIKQB','1296480CcfPJN','122188pCyPGD'];_0x50f8=function(){return _0x2c6bf2;};return _0x50f8();}let point_code=_0x1fa2d1(0x1d5);

// デブリーフィング
let end_debriefing = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function () {
    return `
      <div style="text-align: left; margin: 10px 100px;>
        <p style = "text-align: left">全ての試行が終わりました。これで実験は終了となります。</p>
        <p style = "text-align: left">今回の作業完了コードは下記のボタンを押すと表示されます。</p>
        <p style = "text-align: left">表示される4桁の数字を、Yahoo!クラウドソーシングの設問への回答として<u>半角で</u>入力して下さい。</p>
        <p style = "text-align: left">この数字の入力は<span style="color: red;">1度しかできない</span>ため、間違えないように十分に注意してください。</p>
        <p style = "text-align: left">［完了コードを見る］ボタンを押すと報酬ポイント獲得用のコードが表示されます。表示された完了コードをメモしたらタブを閉じてください。ご協力ありがとうございました。</p>
      </div>
    `;
  },
  choices: ["完了コードを見る"],
  data: {
    stimulus: null,
  },
  on_finish: function (data) {
    jsPsych.endExperiment(point_code);
  },
};

jsPsych.run([
  enter_fullscreen,
  intro_Task,
  trial_block1,
  trial_block2,
  demographicInfo,
  save_data,
  end_debriefing,
]);
