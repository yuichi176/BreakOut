//breakout close (core mechanics)
//mouse to control the paddle, click to start

// 画像
let heart1, heart2;
// スプライト
let paddle, ball, wallTop, wallBottom, wallLeft, wallRight, sound;
// ゲームの状態を表す変数("play" or "stay")
let gameState = "start";
// 残りライフ保持する変数
let life_count = 3;
// 固定値
var FIRST_SPEED = 9;
var MAX_SPEED = 12;
var WALL_THICKNESS = 30;
var BRICK_W = 100;
var BRICK_H = 25;
var BRICK_MARGIN = 6;
var ROWS = 7;
var COLUMNS = 6;
var GAME_OVER_COUNT = 3;

// タイマー関連
// 1秒
let oneSec = 1000;
// 開始時間値
let startTime;
// 経過時間値
let elapsedTime = 0;
// 秒数をカウント
let count = 0;

// 画像ファイル、音声ファイルの読み込み
function preload() {
  heart1 = loadImage('../public/images/heart1.png');
  heart2 = loadImage('../public/images/heart2.png');
  sound_on = loadImage('../public/images/sound_on.png');
  sound_off = loadImage('../public/images/sound_off.png');
  effect_sound1 = loadSound('../public/sounds/effect_sound1.mp3');
  // effect_sound2 = loadSound('../public/sounds/effect_sound2.mp3');
  effect_sound3 = loadSound('../public/sounds/effect_sound3.mp3');
}

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('canvas');

  // バーのスプライト
  paddle = createSprite(width/2, height-50, 100, 10);
  paddle.immovable = true;

  // 天井のスプライト
  wallTop = createSprite(width/2, -WALL_THICKNESS/2, width+WALL_THICKNESS*2, WALL_THICKNESS);
  wallTop.immovable = true;

  // 底のスプライト
  wallBottom = createSprite(width/2, height+WALL_THICKNESS/2, width+WALL_THICKNESS*2, WALL_THICKNESS);
  wallBottom.immovable = true;

  // 左壁のスプライト
  wallLeft = createSprite(-WALL_THICKNESS/2, height/2, WALL_THICKNESS, height);
  wallLeft.immovable = true;

  // 右壁のスプライト
  wallRight = createSprite(width+WALL_THICKNESS/2, height/2, WALL_THICKNESS, height);
  wallRight.immovable = true;

  // ブロックのスプライト (グループ)
  bricks = new Group();

  var offsetX = width/2-(COLUMNS-1)*(BRICK_MARGIN+BRICK_W)/2;
  var offsetY = 80;

  for(var r = 0; r<ROWS; r++)
    for(var c = 0; c<COLUMNS; c++) {
      var brick = createSprite(offsetX+c*(BRICK_W+BRICK_MARGIN), offsetY+r*(BRICK_H+BRICK_MARGIN), BRICK_W, BRICK_H);
      brick.shapeColor = color(255, 255, 255);
      bricks.add(brick);
      brick.immovable = true;
    }

  // ボールのスプライト
  ball = createSprite(width/2, height-200, 13, 13);
  ball.maxSpeed = MAX_SPEED;
  paddle.shapeColor = ball.shapeColor = color(255, 255, 255);

  // ライフのスプライト
  lifes = new Group;

  var offsetX_life = 40;

  for (let i = 0; i<3; i++) {
    let life = createSprite((width-25)-offsetX_life*i, 25, heart1.width, heart1.height);
    life.addAnimation("live",heart1);
    life.addAnimation("die",heart2);
    lifes.add(life);
  }

  // サウンド切り替えボタンのスプライト
  sound = createSprite(width-25, height-25, sound_on.width, sound_on.height);
  sound.addAnimation("off",sound_off);
  sound.addAnimation("on",sound_on);
  sound.mouseActivate = true;

  sound.onMousePressed = () => {
    if( sound.getAnimationLabel() == "off"){
      sound.changeAnimation("on");
    } else {
      sound.changeAnimation("off");
    }
  }

}


function draw() {
  background(246, 174, 95);
  update();
  drawSprites();
}


function update() {
  // ゲームクリア判定
  if( bricks.length == 0) { gameFinish(); }

  if (gameState == "start") {  // gameState = start の時
    fill(255);
    textAlign(CENTER);
    textSize(13);
    text("クリックでスタート", width/2, height-18);
    paddle.position.x = (width/2);

  } else if (gameState == "stay") {  // gameState = stay の時

    fill(255);
    textAlign(CENTER);
    textSize(13);
    text("クリックで再開", width/2, height-18);
    paddle.position.x = constrain(mouseX, paddle.width/2, width-paddle.width/2);

    // タイマー処理
    fill(30);
    textAlign(CENTER);
    textSize(18);
    textStyle(BOLD);
    text(count, 25, 30);
    // 現在時間値
    let now = millis();
    // 経過時間値
    elapsedTime = now - startTime;
    // 1秒たったら
    if (elapsedTime >= oneSec) {
      // 秒数を1つ大きくする
      count++;
      // 再びスタート
      startTime = millis();
    }

  } else if (gameState == "play") {  // gameState = play の時

    paddle.position.x = constrain(mouseX, paddle.width/2, width-paddle.width/2);

    // ボールが壁に当たったら跳ね返す
    ball.bounce(wallTop);
    ball.bounce(wallLeft);
    ball.bounce(wallRight);

    // ボールがバーに当たった時の処理
    if(ball.bounce(paddle)) {
      let swing = (ball.position.x-paddle.position.x)/3;
      ball.setSpeed(ball.getSpeed(), ball.getDirection()+swing);
      // サウンドボタンがonの時だけ音をならす
      if( sound.getAnimationLabel() == "on"){
        effect_sound1.play();
      }
    }

    // ボールがブロックに当たって跳ね返った時の処理
    ball.bounce(bricks, brickHit);

    // ボールが落ちた時の処理
    if(ball.overlap(wallBottom)) {
      // ボールを初期位置に戻す
      ball.position.x = width/2;
      ball.position.y = height-200;
      ball.setSpeed(0);
      // ライフを減らす
      life_count -= 1;
      // ライフの画像を変更
      lifes[life_count].changeAnimation("die");
      // ゲームの状態を "stay" に変更
      gameState = "stay";
      // 落ちた回数を評価
      if (life_count == 0) { gameOver(); }
    }

    // タイマー処理
    fill(30);
    textAlign(CENTER);
    textSize(18);
    textStyle(BOLD);
    text(count, 25, 30);
    // 現在時間値
    let now = millis();
    // 経過時間値
    elapsedTime = now - startTime;
    // 1秒たったら
    if (elapsedTime >= oneSec) {
      // 秒数を1つ大きくする
      count++;
      // 再びスタート
      startTime = millis();
    }

  } else if (gameState == "over") {  // gameState = over の時
    // 背景色の変更
    noStroke();
    fill(0, 180, 180);
    rect(0, 0, width, height);
    // 文字列の表示
    fill(0);
    textAlign(CENTER);
    textSize(25);
    text("Game Over", width/2, 43);
    textSize(0);
    text("クリックでもう一度", width/2, height-18);

    paddle.position.x = constrain(mouseX, paddle.width/2, width-paddle.width/2);

  } else if (gameState == "finish") { // gameState = finish の時
    // 文字列の表示
    fill(255);
    textAlign(CENTER);
    textSize(40);
    text("Congratulation!", width/2, height/2);
    textSize(20);
    text("クリックでもう一度", width/2, height/2 + 35);

    paddle.position.x = constrain(mouseX, paddle.width/2, width-paddle.width/2);
  }
}

function mousePressed() {
  if( sound.mouseIsOver == true ) {  //マウスがサウンド切り替えボタン常にある時は何もしない
    ;
  } else {
    // ゲームオーバー、ゲームクリアの状態でクリックされた時の処理
    if ( gameState == "over" || gameState == "finish") { 
      newGame(); 
    } else if( gameState == "start" || gameState == "stay" ) { // ボールが初期位置にある状態でクリックされた時の処理
      ball.setSpeed(FIRST_SPEED, random(90-10, 90+10));
      gameState = "play";
      // 開始時間値を取得
      startTime = millis();
    }
  }

}

function brickHit(ball, brick) {
  // サウンドボタンがonの時だけ音をならす
  if( sound.getAnimationLabel() == "on"){
    effect_sound3.play();
  }
  brick.remove();
}

function gameOver() {
  updateSprites(false);
  gameState = "over";
  // ボールを消す
  ball.remove();
}

function gameFinish() {
  updateSprites(false);
  gameState = "finish";
  // ボールを消す
  ball.remove();
}

function newGame() {

  bricks.removeSprites();
  updateSprites(true);

  // ボールを新たに生成
  ball = createSprite(width/2, height-200, 13, 13);
  ball.maxSpeed = MAX_SPEED;
  paddle.shapeColor = ball.shapeColor = color(255, 255, 255);

  // ブロックのスプライトを再生成
  bricks = new Group();

  var offsetX = width/2-(COLUMNS-1)*(BRICK_MARGIN+BRICK_W)/2;
  var offsetY = 80;
  
  for(var r = 0; r<ROWS; r++) {
    for(var c = 0; c<COLUMNS; c++) {
      var brick = createSprite(offsetX+c*(BRICK_W+BRICK_MARGIN), offsetY+r*(BRICK_H+BRICK_MARGIN), BRICK_W, BRICK_H);
      brick.shapeColor = color(255, 255, 255);
      bricks.add(brick);
      brick.immovable = true;
    }
  }

  // ライフを回復
  life_count = 3;
  for (let i = 0; i<3; i++) { lifes[i].changeAnimation("live"); }

  // タイマーのリセット
  count = 0;

  gameState = "start";
}