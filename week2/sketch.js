/**
 * p5_audio_visualizer
 * 這是一個結合 p5.js 與 p5.sound 的程式，載入音樂並循環播放，
 * 畫面上會有多個隨機生成的多邊形在視窗內移動反彈，
 * 且其大小會跟隨音樂的振幅（音量）即時縮放。
 */

// 全域變數
let shapes = [];
let bubbles = [];
let particles = [];
let song;
let amplitude;

// 外部定義的二維陣列，做為多邊形頂點的基礎座標 (六邊形範例)
let points = [[-3, 5], [3, 7], [1, 5],[2,4],[4,3],[5,2],[6,2],[8,4],[8,-1],[6,0],[0,-3],[2,-6],[-2,-3],[-4,-2],[-5,-1],[-6,1],[-6,2]];

function preload() {
  // 在程式開始前預載入外部音樂資源
  // 使用 loadSound() 載入音檔並將其賦值給全域變數 song
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // 初始化畫布、音樂播放狀態與生成多邊形物件
  
  // 使用 createCanvas(windowWidth, windowHeight) 建立符合視窗大小的畫布
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  // 將變數 amplitude 初始化為 new p5.Amplitude()
  amplitude = new p5.Amplitude();

  // 循環播放音樂
  // 注意：許多瀏覽器需要使用者互動（如點擊）後才能開始播放音訊

  // 初始化水泡
  for (let i = 0; i < 50; i++) {
    bubbles.push({
      x: random(width),
      y: random(height),
      size: random(10, 40),
      speed: random(0.5, 2),
      popping: false,
      popTimer: 0
    });
  }

  // 使用 for 迴圈產生 10 個形狀物件，並 push 到 shapes 陣列中
  for (let i = 0; i < 10; i++) {
    let shape = {
      x: random(0, windowWidth),      // 0 到 windowWidth 之間的隨機亂數
      y: random(0, windowHeight),     // 0 到 windowHeight 之間的隨機亂數
      dx: random(-3, 3),              // -3 到 3 之間的隨機亂數
      dy: random(-3, 3),              // -3 到 3 之間的隨機亂數
      scale: random(1, 10),           // 1 到 10 之間的隨機亂數
      
      // 透過 map() 讀取全域陣列 points，將每個頂點的 x 與 y 分別乘上 10 到 30 之間的隨機倍率來產生變形
      points: points.map(p => {
        return {
          x: p[0] * random(10, 30),
          y: p[1] * random(10, 30)
        };
      })
    };
    shapes.push(shape);
  }
}

function draw() {
  // 每幀重複執行，處理背景更新、抓取音量與繪製動態圖形
  
  // 設定背景顏色為 '#ffcdb2'
  background('#ffcdb2');
  
  // 設定邊框粗細 strokeWeight(2)
  strokeWeight(2);

  // 透過 amplitude.getLevel() 取得當前音量大小（數值介於 0 到 1），存入變數 level
  let level = amplitude.getLevel();
  
  // 使用 map() 函式將 level 從 (0, 1) 的範圍映射到 (0.5, 2) 的範圍，並存入變數 sizeFactor
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // 繪製水泡
  for (let b of bubbles) {
    if (b.popping) {
      b.popTimer++;
      noFill();
      stroke(200, 30, 100, 100 - b.popTimer * 10);
      ellipse(b.x, b.y, b.size * sizeFactor + b.popTimer * 2);
      if (b.popTimer > 10) {
        b.popping = false;
        b.y = height + b.size;
        b.x = random(width);
      }
    } else {
      b.y -= b.speed;
      b.x += random(-1, 1); // 輕微左右晃動
      if (b.y < 0 || random(1) < 0.001) {
        b.popping = true;
        b.popTimer = 0;
        // 產生粒子效果
        for (let i = 0; i < 10; i++) {
          particles.push({
            x: b.x,
            y: b.y,
            vx: random(-2, 2),
            vy: random(-2, 2),
            alpha: 100,
            size: random(2, 6)
          });
        }
      }
      noStroke();
      fill(200, 30, 100, 30); // 淡藍色半透明
      ellipse(b.x, b.y, b.size * sizeFactor);
      fill(0, 0, 100, 60); // 高光
      ellipse(b.x + b.size * 0.2, b.y - b.size * 0.2, b.size * 0.2);
    }
  }

  // 更新並繪製粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 3; // 漸漸消失
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    } else {
      noStroke();
      fill(200, 30, 100, p.alpha);
      ellipse(p.x, p.y, p.size);
    }
  }

  // 使用 for...of 迴圈走訪 shapes 陣列中的每個 shape 進行更新與繪製
  for (let shape of shapes) {
    // 位置更新：將 shape.x 加上 shape.dx，shape.y 加上 shape.dy
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    // 設定外觀：計算彩虹顏色（隨時間與位置變化）
    let hue = (frameCount + shape.x * 0.1 + shape.y * 0.1) % 360;
    let c = color(hue, 80, 90);
    fill(c);
    stroke(c);

    // 座標轉換與縮放
    push();
    // translate(shape.x, shape.y) 將原點移動到形狀座標
    translate(shape.x, shape.y);
    // 使用 scale(sizeFactor) 依照音樂音量縮放圖形
    scale(sizeFactor);

    // 繪製多邊形
    beginShape();
    // 利用 for 迴圈走訪 shape.points，使用 vertex(x, y) 畫出所有頂點
    for (let p of shape.points) {
      vertex(p.x, p.y);
    }
    // 最後呼叫 endShape(CLOSE) 封閉圖形
    endShape(CLOSE);

    // 狀態還原
    pop();
  }

  // 如果 AudioContext 未啟動，顯示提示文字
  if (getAudioContext().state !== 'running') {
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(32);
    text('Click to Play', width / 2, height / 2);
  }
}

// 輔助函式：處理視窗大小改變
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 輔助函式：點擊滑鼠以確保音訊環境啟動（解決瀏覽器自動播放限制）
function mousePressed() {
  userStartAudio();
  if (!song.isPlaying()) {
    song.loop();
  }
}
