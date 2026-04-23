let seaweeds = [];
let bubbles = [];
let fishes = [];

// 作品資料：連線至本目錄下的 week1 與 week2
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
        let targetHeight = 150 + (i * 100); // 隨週次增加高度
        seaweeds.push(new Seaweed(x, height, targetHeight));
        
        // 產生對應的作品氣泡按鈕
        bubbles.push(new Bubble(x, height - targetHeight - 60, assignments[i]));
    }

    // 產生裝飾性魚群
    for (let i = 0; i < 6; i++) {
        fishes.push(new Fish());
    }
}

function draw() {
    // 深海漸層底色
    background(0, 30, 60);
    
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

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// --- 類別定義 ---

class Seaweed {
    constructor(x, y, h) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.offset = random(100);
    }
    sway() { /* 擺動邏輯 */ }
    display() {
        stroke(46, 139, 87);
        strokeWeight(10);
        noFill();
        beginShape();
        for (let i = 0; i <= 12; i++) {
            let segmentY = map(i, 0, 12, this.y, this.y - this.h);
            let segmentX = this.x + sin(frameCount * 0.02 + i * 0.3 + this.offset) * 20;
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
        this.r = 80;
        this.baseY = y;
    }
    float() { this.y = this.baseY + sin(frameCount * 0.04) * 15; }
    display() {
        fill(255, 255, 255, 100);
        stroke(255);
        strokeWeight(2);
        circle(this.x, this.y, this.r);
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(14);
        text(this.data.title, this.x, this.y);
    }
    isClicked(mx, my) { return dist(mx, my, this.x, this.y) < this.r / 2; }
}

class Fish {
    constructor() { this.reset(); }
    reset() { this.x = random(-100, width); this.y = random(50, height-50); this.speed = random(1, 2.5); this.size = random(0.6, 1.2); }
    update() { this.x += this.speed; if (this.x > width + 100) this.x = -100; }
    display() {
        push();
        translate(this.x, this.y);
        scale(this.size);
        fill(255, 127, 80);
        beginShape();
        vertex(0, 0);
        bezierVertex(15, -20, 45, -20, 60, 0);
        bezierVertex(45, 20, 15, 20, 0, 0);
        endShape(CLOSE);
        triangle(0, 0, -15, -15, -15, 15);
        pop();
    }
}
