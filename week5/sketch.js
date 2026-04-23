let time = 0;
let blades = [];
let bubbles = [];
const numBlades = 20; // 減少水草數量，使其分佈更分散
const numBubbles = 15;

function setup() {
  createCanvas(windowWidth, windowHeight).parent('p5-canvas-container'); // 將畫布綁定到指定容器
  // 定義指定的五種顏色，加入透明度特效 (99 代表約 60% 透明度)
  let palette = ['#ffbe0b99', '#fb560799', '#ff006e99', '#8338ec99', '#3a86ff99'];
  
  // 初始化每根水草的獨特屬性
  for (let i = 0; i < numBlades; i++) {
    blades.push({
      color: random(palette),
      offset: random(1000),
      thickness: random(30, 60),
      hScale: random(0.3, 0.66), // 高度比例，最高不超過 2/3
      frequency: random(0.5, 1.5) // 搖晃頻率（速度倍率）
    });
  }

  // 初始化水泡
  for (let i = 0; i < numBubbles; i++) {
    bubbles.push(initBubble());
  }
}

// 水泡初始化與重置函數
function initBubble() {
  return {
    x: random(width),
    y: height + random(20, 500),
    size: random(10, 25),
    speed: random(1, 3),
    burstY: random(height * 0.1, height * 0.6), // 升到視窗 10%~60% 處破掉
    isBursting: false,
    burstFrame: 0
  };
}

function draw() {
  clear(); // 核心修改：先清空畫布，防止透明度疊加導致網頁被遮蔽
  background(227, 242, 253, 153); // 將透明度調成 0.6 (Alpha 值 153)，呈現半透明水色效果
  blendMode(BLEND); // 使用標準透明混合模式
  noFill();
  strokeJoin(ROUND);

  let startY = height;
  let segments = 30;

  // 迴圈產生 50 根水草
  for (let j = 0; j < numBlades; j++) {
    let b = blades[j];
    // 均衡分佈在視窗寬度內
    let startX = map(j, 0, numBlades - 1, 20, width - 20);
    stroke(b.color); // 使用該水草的顏色
    strokeWeight(b.thickness); // 使用該水草的粗細

    let segmentHeight = (height * b.hScale) / segments; // 使用該水草的高度

    beginShape();
    
    // 起始控制點
    curveVertex(startX, startY);

    for (let i = 0; i <= segments; i++) {
      let y = startY - i * segmentHeight;

      // 使用專屬的頻率與偏移量計算 noise
      let noiseVal = noise(i * 0.1, time * b.frequency + b.offset);

      // 映射搖晃幅度
      let swayRange = map(i, 0, segments, 0, 250); 
      let xOffset = map(noiseVal, 0, 1, -swayRange, swayRange);

      curveVertex(startX + xOffset, y);

      // 結束控制點
      if (i === segments) {
        curveVertex(startX + xOffset, y);
      }
    }
    endShape();
  }

  // 繪製與更新水泡
  for (let i = 0; i < bubbles.length; i++) {
    let bbl = bubbles[i];
    if (!bbl.isBursting) {
      // 向上移動與微幅左右晃動
      bbl.y -= bbl.speed;
      bbl.x += sin(time + i) * 0.5;

      // 檢查是否到達破裂高度
      if (bbl.y < bbl.burstY) bbl.isBursting = true;

      // 繪製水泡主體 (白色 0.5 透明度)
      noStroke();
      fill(255, 127);
      circle(bbl.x, bbl.y, bbl.size);
      // 繪製高光圓圈 (白色 0.7 透明度)
      fill(255, 178);
      circle(bbl.x - bbl.size * 0.2, bbl.y - bbl.size * 0.2, bbl.size * 0.3);
    } else {
      // 破裂動畫：擴大的圓環
      bbl.burstFrame++;
      noFill();
      stroke(255, 127 * (1 - bbl.burstFrame / 10)); // 隨時間變淡
      strokeWeight(2);
      circle(bbl.x, bbl.y, bbl.size + bbl.burstFrame * 4);
      if (bbl.burstFrame > 10) bubbles[i] = initBubble(); // 動畫結束後重置
    }
  }

  time += 0.02; // 調整此數值可改變水波晃動速度
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
