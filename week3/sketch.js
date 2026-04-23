let gameState = 'HOME'; // HOME, START, READY, PLAYING, FAILED, SUCCESS
let trackPoints = [];
let numPoints = 15;
let trackGap = 70;
let trackAmplitude = 0.25; // 軌道彎曲振幅 (相對於高度的比例)
const trackColor = [0, 204, 255];
const startButtonPos = { x: 50, y: 0 }; // 保留邏輯位置用於生成起點

let startTime = 0;
let finalTime = 0;
let starThresholds = { three: 5, two: 8 }; // 當前難度的星級門檻 (秒)
let currentLevelLabel = ""; // 紀錄目前選擇的難度標籤
let bestTimes = { "簡單": null, "中等": null, "困難": null };
let winParticles = []; // 儲存過關特效粒子
let failParticles = []; // 儲存失敗特效粒子

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 從瀏覽器本地儲存讀取紀錄
  let saved = localStorage.getItem('electric_maze_best');
  if (saved) bestTimes = JSON.parse(saved);
  resetGame();
}

function resetGame() {
  trackPoints = [];
  // 確保起點與終點的高度一致
  let centerY = height / 2;
  startButtonPos.y = centerY;

  for (let i = 0; i < numPoints; i++) {
    let x = map(i, 0, numPoints - 1, 0, width);
    let y = centerY + random(-height * trackAmplitude, height * trackAmplitude);
    
    // 強制起點與終點回到中心，方便遊戲開始與結束
    if (i === 0) y = centerY;
    if (i === numPoints - 1) y = centerY;
    
    trackPoints.push({ x, y });
  }
}

function draw() {
  background(20);

  if (gameState === 'HOME') {
    drawHomeScreen();
  } else if (gameState === 'START') {
    drawLevelSelectScreen();
  } else if (gameState === 'READY') {
    drawTrack();
    drawPointer(); // 讓玩家在準備時就能看到遊戲鼠標
    let bestText = bestTimes[currentLevelLabel] ? " | 最佳: " + bestTimes[currentLevelLabel].toFixed(2) + "s" : "";
    showOverlay("目標：⭐⭐⭐ " + starThresholds.three + "秒 | ⭐⭐ " + starThresholds.two + "秒" + bestText + "\n點擊畫面任何地方開始挑戰！");
  } else if (gameState === 'PLAYING') {
    noCursor(); // 進入遊戲後隱藏系統指標，提升沉浸感
    drawTrack();
    checkCollision();
    checkWin();
    drawTimer();
    drawPointer();
  } else if (gameState === 'FAILED') {
    cursor(); // 失敗後恢復系統指標
    background(50, 0, 0);
    drawTrack();
    updateAndDrawFailParticles();
    drawPointer();
    showOverlay("挑戰失敗！請按 R 鍵返回難度選擇");
  } else if (gameState === 'SUCCESS') {
    cursor(); // 成功後恢復系統指標
    drawTrack();
    updateAndDrawParticles();
    drawPointer();
    drawSuccessUI();
    showOverlay("恭喜通關！請按 R 鍵重新挑戰");
  }
}

function drawDifficultyUI() {
  // 在左側繪製難度選擇按鈕
  drawButton(10, height / 2 - 90, 100, 50, "簡單", color(0, 255, 100));
  drawButton(10, height / 2 - 30, 100, 50, "中等", color(255, 200, 0));
  drawButton(10, height / 2 + 30, 100, 50, "困難", color(255, 50, 50));
}

function drawLevelSelectScreen() {
  push();
  textAlign(CENTER, CENTER);
  fill(trackColor);
  textSize(48);
  textStyle(BOLD);
  text("選擇遊戲難度", width / 2, height / 2 - 120);
  
  // 將難度按鈕置中顯示
  let btnW = 120, btnH = 50, spacing = 70;
  drawButton(width / 2 - btnW / 2, height / 2 - 40, btnW, btnH, "簡單", color(0, 255, 100));
  drawButton(width / 2 - btnW / 2, height / 2 + spacing - 40, btnW, btnH, "中等", color(255, 200, 0));
  drawButton(width / 2 - btnW / 2, height / 2 + spacing * 2 - 40, btnW, btnH, "困難", color(255, 50, 50));
  pop();
}

function drawHomeScreen() {
  push();
  textAlign(CENTER, CENTER);
  // 繪製標題
  fill(trackColor);
  textSize(64);
  textStyle(BOLD);
  text("電流急急棒", width / 2, height / 2 - 60);
  
  // 繪製開始按鈕
  let btnW = 200, btnH = 60;
  drawButton(width / 2 - btnW / 2, height / 2 + 20, btnW, btnH, "開始遊戲", color(0, 255, 100));
  pop();
}

function drawTimer() {
  let currentTime = (millis() - startTime) / 1000;
  push();
  fill(255);
  noStroke();
  textSize(32);
  textAlign(CENTER);
  text(currentTime.toFixed(2) + "s", width / 2, 50);

  // 顯示目標秒數提示
  textSize(16);
  fill(255, 150);
  let bestText = bestTimes[currentLevelLabel] ? " | 最佳: " + bestTimes[currentLevelLabel].toFixed(2) + "s" : "";
  text("目標：⭐⭐⭐ " + starThresholds.three + "秒 | ⭐⭐ " + starThresholds.two + "秒" + bestText, width / 2, 85);
  pop();
}

function drawPointer() {
  push();
  noStroke();
  
  // 繪製外層淡淡的發光暈影
  fill(255, 255, 255, 30); 
  ellipse(mouseX, mouseY, 35, 35);
  
  fill(255, 255, 255, 70);
  ellipse(mouseX, mouseY, 25, 25);
  
  // 繪製核心圓點 (放大至 15)
  fill(255, 255, 255, 230);
  ellipse(mouseX, mouseY, 15, 15);
  pop();
}

function drawButton(x, y, w, h, label, col) {
  push();
  fill(col);
  noStroke();
  rect(x, y, w, h, 5);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(label, x + w / 2, y + h / 2);
  pop();
}

function spawnParticles() {
  winParticles = [];
  for (let i = 0; i < 300; i++) { // 增加粒子數量增加華麗感
    winParticles.push({
      x: width / 2, // 從螢幕中間爆發
      y: height / 2, // 從螢幕中間爆發
      vx: random(-15, 15), // 加大水平擴散範圍
      vy: random(-15, 15), // 加大垂直擴散範圍
      size: random(5, 15),
      color: color(random(100, 255), random(100, 255), random(100, 255)),
      alpha: 255
    });
  }
}

function spawnFailParticles() {
  failParticles = [];
  for (let i = 0; i < 50; i++) {
    failParticles.push({
      x: mouseX,
      y: mouseY,
      vx: random(-7, 7),
      vy: random(-7, 7),
      size: random(4, 10),
      // 使用隨機的紅色與橘色調
      color: color(random(200, 255), random(0, 100), 0),
      alpha: 255
    });
  }
}

function updateAndDrawFailParticles() {
  noStroke();
  for (let i = failParticles.length - 1; i >= 0; i--) {
    let p = failParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95; // 加上空氣阻力
    p.vy *= 0.95;
    p.alpha -= 5;
    
    p.color.setAlpha(p.alpha);
    fill(p.color);
    ellipse(p.x, p.y, p.size);
    
    if (p.alpha <= 0) failParticles.splice(i, 1);
  }
}

function updateAndDrawParticles() {
  noStroke();
  for (let i = winParticles.length - 1; i >= 0; i--) {
    let p = winParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.3; // 重力效果
    p.alpha -= 4; // 逐漸消失
    
    p.color.setAlpha(p.alpha);
    fill(p.color);
    ellipse(p.x, p.y, p.size);
    
    if (p.alpha <= 0) winParticles.splice(i, 1);
  }
}

function drawSuccessUI() {
  let stars = 1;
  if (finalTime <= starThresholds.three) stars = 3;
  else if (finalTime <= starThresholds.two) stars = 2;

  push();
  textAlign(CENTER);
  fill(255);
  textSize(40);
  text("恭喜過關！", width / 2, height / 2 - 100);
  
  textSize(24);
  text("最終時間: " + finalTime.toFixed(2) + " 秒", width / 2, height / 2 - 60);

  // 顯示個人最佳紀錄
  if (bestTimes[currentLevelLabel]) {
    text("個人最佳: " + bestTimes[currentLevelLabel].toFixed(2) + " 秒", width / 2, height / 2 - 30);
  }

  // 繪製星星
  textSize(50);
  let starString = "";
  for (let i = 0; i < 3; i++) {
    if (i < stars) starString += "⭐";
    else starString += "影"; // 這裡可以使用空星符號或灰色字
  }
  // 處理非 Unicode 符號顯示問題，改用簡單顏色圓點代表星星
  for(let i=0; i<3; i++) {
    fill(i < stars ? [255, 215, 0] : [100]);
    ellipse(width/2 - 60 + i*60, height/2 - 10, 40, 40);
  }
  pop();
}

function showOverlay(msg) {
  push();
  fill(255);
  textAlign(CENTER);
  textSize(24);
  text(msg, width / 2, height - 30);
  pop();
}

function mousePressed() {
  // 0. 檢查主介面按鈕
  if (gameState === 'HOME') {
    let btnW = 200, btnH = 60;
    let btnX = width / 2 - btnW / 2;
    let btnY = height / 2 + 20;
    if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
      gameState = 'START';
    }
    return;
  }

  // 1. 檢查難度選擇畫面 (置中按鈕)
  if (gameState === 'START') {
    let btnW = 120, btnH = 50, spacing = 70;
    let btnX = width / 2 - btnW / 2;
    let startY = height / 2 - 40;
    
    if (mouseX > btnX && mouseX < btnX + btnW) {
      if (mouseY > startY && mouseY < startY + btnH) {
        prepareLevel(160, 8, 0.1, 5, 8, "簡單");
      } else if (mouseY > startY + spacing && mouseY < startY + spacing + btnH) {
        prepareLevel(110, 15, 0.2, 8, 12, "中等");
      } else if (mouseY > startY + spacing * 2 && mouseY < startY + spacing * 2 + btnH) {
        prepareLevel(80, 30, 0.35, 12, 18, "困難");
      }
    }
    return;
  }

  // 3. 點擊畫面任何地方開始 (僅在 READY 狀態有效)
  if (gameState === 'READY') {
    gameState = 'PLAYING';
    startTime = millis();
  }
}

function keyPressed() {
  // 當玩家在失敗或成功畫面時，按下 R 鍵回到難度選擇畫面
  if (key === 'r' || key === 'R') {
    if (gameState === 'FAILED' || gameState === 'SUCCESS') {
      gameState = 'START';
      failParticles = [];
      winParticles = [];
      cursor();
    }
  }
}

function prepareLevel(gap, points, amplitude, t3, t2, label) {
  trackGap = gap;
  numPoints = points;
  trackAmplitude = amplitude;
  starThresholds = { three: t3, two: t2 };
  currentLevelLabel = label;
  winParticles = []; // 清除舊的特效粒子
  failParticles = []; // 清除舊的特效粒子
  gameState = 'READY';
  resetGame();
}

function drawTrack() {
  noFill();
  strokeWeight(8);
  stroke(trackColor);

  // 使用 curveVertex 繪製上下邊界
  // 提示：curveVertex 需要在第一點與最後一點重複，以建立正確的曲線張力
  beginShape();
  curveVertex(trackPoints[0].x, trackPoints[0].y - trackGap / 2);
  for (let p of trackPoints) {
    curveVertex(p.x, p.y - trackGap / 2);
  }
  curveVertex(trackPoints[trackPoints.length - 1].x, trackPoints[trackPoints.length - 1].y - trackGap / 2);
  endShape();

  // 繪製下邊界
  beginShape();
  curveVertex(trackPoints[0].x, trackPoints[0].y + trackGap / 2);
  for (let p of trackPoints) {
    curveVertex(p.x, p.y + trackGap / 2);
  }
  curveVertex(trackPoints[trackPoints.length - 1].x, trackPoints[trackPoints.length - 1].y + trackGap / 2);
  endShape();
}

function checkCollision() {
  /**
   * 碰撞偵測說明：
   * 1. 使用 get(mouseX, mouseY) 獲取目前滑鼠位置的像素顏色 [R, G, B, A]。
   * 2. 由於背景是深色 (20, 20, 20)，而軌道是亮藍色 (0, 204, 255)。
   * 3. 我們檢查 Blue 頻道是否大於 150，若是，代表滑鼠碰到了軌道。
   * 4. 同時檢查是否移出畫布範圍。
   */
  let c = get(mouseX, mouseY);
  if (blue(c) > 150 || mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    spawnFailParticles(); // 觸發失敗特效
    gameState = 'FAILED'; // 碰到即判定失敗
  }
}

function checkWin() {
  // 如果滑鼠座標超過畫布最右側，且 Y 座標在終點軌道的範圍內 (height/2 附近)
  let centerY = height / 2;
  if (mouseX > width - 20 && abs(mouseY - centerY) < trackGap / 2) {
    finalTime = (millis() - startTime) / 1000;

    // 更新個人最佳紀錄
    if (bestTimes[currentLevelLabel] === null || finalTime < bestTimes[currentLevelLabel]) {
      bestTimes[currentLevelLabel] = finalTime;
      localStorage.setItem('electric_maze_best', JSON.stringify(bestTimes));
    }

    spawnParticles(); // 觸發特效
    gameState = 'SUCCESS';
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resetGame();
}
