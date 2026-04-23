let input;
let slider;
let button;
let dropdown;
let radio;
let isBouncing = false;
let div;

function setup() {
  createCanvas(windowWidth, windowHeight);
  input = createInput('Hello');
  input.position(20, 20);
  input.size(200, 50);
  input.style('font-size', '30px');
  slider = createSlider(15, 80, 30);
  slider.position(240, 35);
  button = createButton('跳動');
  button.position(380, 35);
  button.mousePressed(() => isBouncing = !isBouncing);

  dropdown = createSelect();
  dropdown.position(450, 35);
  dropdown.option('https://www.tku.edu.tw');
  dropdown.option('https://www.et.tku.edu.tw');
  dropdown.option('https://eng.tku.edu.tw');
  dropdown.changed(() => {
    div.html('<iframe src="' + dropdown.value() + '" style="width:100%; height:100%;"></iframe>');
  });

  radio = createRadio();
  radio.position(700, 35);
  radio.option('一般性');
  radio.option('旋轉');
  radio.option('大小');
  radio.style('width', '250px');
  radio.selected('一般性');

  div = createDiv();
  div.position(200, 200);
  div.size(windowWidth - 400, windowHeight - 400);
  div.html('<iframe src="https://www.tku.edu.tw" style="width:100%; height:100%;"></iframe>');
}

function draw() {
  background(220);

  let txt = input.value();
  textSize(slider.value());
  
  let w = textWidth(txt) + 20;
  
  if (textWidth(txt) > 0) {
    for (let y = 100; y < height; y += 50) {
      for (let x = 0; x < width; x += w) {
        let yOffset = 0;
        if (isBouncing) {
          yOffset = sin(frameCount * 0.1 + x * 0.02 + y * 0.05) * 10;
        }
        
        push();
        translate(x, y + yOffset);
        let val = sin(frameCount * 0.1 + x * 0.02 + y * 0.05);
        fill(map(val, -1, 1, 0, 255), map(val, -1, 1, 255, 0), 150);
        if (radio.value() === '旋轉') {
          rotate(map(val, -1, 1, -HALF_PI, HALF_PI));
        } else if (radio.value() === '大小') {
          let scaleFactor = map(val, -1, 1, 1, 1.3);
          scale(scaleFactor);
        }
        text(txt, 0, 0);
        pop();
      }
    }
  }
}
