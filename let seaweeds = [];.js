let seaweeds = [];
let bubbles = [];
let fishes = [];

// 作品資料
const assignments = [
    { title: "第一週：海草世界", url: "week1/index.html" },
    { title: "第二週：水底生態", url: "week2/index.html" },
    { title: "第三週：互動藝術", url: "week3/index.html" },
    { title: "第四週：進階動畫", url: "week4/index.html" },
    { title: "第五週：多媒體整合", url: "week5/index.html" }
];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');

    // 根據作品數量產生海草 (象徵成長：越後面的週次海草越高)
    for (let i = 0; i < assignments.length; i++) {
        let x = (width / (assignments.length + 1)) * (i + 1);
        let targetHeight = 100 + (i * 80); // 隨週次增加高度
        seaweeds.push(new Seaweed(x, height, targetHeight));
        
        // 產生對應的作品氣泡
        bubbles.push(new Bubble(x, height - targetHeight - 50, assignments[i]));
    }

    // 產生一些裝飾性的魚
    for (let i = 0; i < 5; i++) {
        fishes.push(new Fish());
    }
}

function draw() {
    // 深海漸層背景
    background(0, 20, 50);
    
    // 繪製魚群
    for (let fish of fishes) {
        fish.update();
        fish.display();
    }

    // 繪製海草
    for (let sw of seaweeds) {
        sw.sway();
        sw.display();
    }

    // 繪製氣泡
    for (let b of bubbles) {
        b.float();
        b.display();
    }
}

// 點擊偵測
function mousePressed() {
    for (let b of bubbles) {
        if (b.isClicked(mouseX, mouseY)) {
            showAssignment(b.data.url);
        }
    }
}

function showAssignment(url) {
    const wrapper = document.getElementById('iframe-wrapper');
    const iframe = document.getElementById('assignment-display');
    iframe.src = url;
    wrapper.style.display = 'block';
}

// --- 類別定義 ---

class Seaweed {
    constructor(x, y, h) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.offset = random(100);
    }

    sway() {
        this.xOffset = sin(frameCount * 0.02 + this.offset) * 20;
    }

    display() {
        stroke(34, 139, 34);
        strokeWeight(8);
        noFill();
        beginShape();
        for (let i = 0; i <= 10; i++) {
            let segmentY = map(i, 0, 10, this.y, this.y - this.h);
            let segmentX = this.x + sin(frameCount * 0.02 + i * 0.5 + this.offset) * 15;
            curveVertex(segmentX, segmentY);
        }
        endShape();
    }
}

class Bubble {
    constructor(x, y, data) {
        this.x = x;
        this.y = y;
        this.data = data;
        this.r = 60;
        this.baseY = y;
    }

    float() {
        this.y = this.baseY + sin(frameCount * 0.05) * 10;
    }

    display() {
        fill(255, 255, 255, 150);
        stroke(255);
        circle(this.x, this.y, this.r);
        
        fill(0, 50, 100);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        text(this.data.title, this.x, this.y);
    }

    isClicked(mx, my) {
        let d = dist(mx, my, this.x, this.y);
        return d < this.r / 2;
    }
}

class Fish {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = random(width);
        this.y = random(100, height - 100);
        this.speed = random(1, 3);
        this.size = random(0.5, 1);
    }

    update() {
        this.x += this.speed;
        if (this.x > width + 50) this.x = -50;
    }

    display() {
        push();
        translate(this.x, this.y);
        scale(this.size);
        fill(255, 150, 0);
        noStroke();
        // 使用 Vertex 勾勒魚的身型
        beginShape();
        vertex(0, 0);
        bezierVertex(10, -15, 30, -15, 40, 0);
        bezierVertex(30, 15, 10, 15, 0, 0);
        endShape();
        // 魚尾
        triangle(0, 0, -10, -10, -10, 10);
        pop();
    }
}
