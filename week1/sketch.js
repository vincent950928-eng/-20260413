/**
 * p5_audio_visualizer
 * 
 * 這是一個結合 p5.js 與 p5.sound 的程式，載入音樂並循環播放，
 * 畫面上會有多個隨機生成的多邊形在視窗內移動反彈，
 * 且其大小會跟隨音樂的振幅（音量）即時縮放。
 */

// 全域變數定義
let shapes = [];
let song;
let amplitude;
// 外部定義的二維陣列，做為多邊形頂點的基礎座標
let points = [[-3, 5], [5, 6], [8, -2], [0, -7], [-6, -3]];

function preload() {
  // 在程式開始前預載入外部音樂資源
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // 初始化畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化振幅分析物件
  amplitude = new p5.Amplitude();

  // 嘗試播放音樂 (注意：部分瀏覽器可能需要使用者互動才能開始播放)
  if (song.isLoaded()) {
    song.loop();
  }

  // 產生 10 個形狀物件
  for (let i = 0; i < 10; i++) {
    // 處理頂點變形：讀取全域 points，將每個頂點 x, y 乘上隨機倍率
    let shapePoints = points.map(p => {
      return {
        x: p[0] * random(10, 30),
        y: p[1] * random(10, 30)
      };
    });

    // 建立形狀物件結構
    let newShape = {
      x: random(width),           // 初始 X 座標
      y: random(height),          // 初始 Y 座標
      dx: random(-3, 3),          // X 軸移動速度
      dy: random(-3, 3),          // Y 軸移動速度
      scale: random(1, 10),       // 基礎縮放比例
      color: color(random(255), random(255), random(255)), // 隨機顏色
      points: shapePoints         // 變形後的頂點
    };

    shapes.push(newShape);
  }
}

function draw() {
  // 設定背景顏色
  background('#ffcdb2');
  
  // 設定邊框粗細
  strokeWeight(2);

  // 取得當前音量大小 (0 ~ 1)
  let level = amplitude.getLevel();
  
  // 將音量映射到縮放倍率 (0.5 ~ 2)
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // 更新並繪製每個形狀
  for (let shape of shapes) {
    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > width) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > height) {
      shape.dy *= -1;
    }

    // 設定外觀
    fill(shape.color);
    stroke(shape.color);

    // 座標轉換與繪製
    push();
    translate(shape.x, shape.y);
    
    // 依照音樂音量與物件本身的基礎比例進行縮放
    scale(sizeFactor * shape.scale);

    // 繪製多邊形
    beginShape();
    for (let p of shape.points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
    
    // 還原狀態
    pop();
  }
}

// 額外加入：點擊滑鼠可切換播放/暫停 (解決瀏覽器自動播放限制)
function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}
