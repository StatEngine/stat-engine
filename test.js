const { createCanvas, loadImage } = require('canvas')
const { Image } = require('canvas');

const fs = require('fs');

let width = 1440/4;
let height = 470/4;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d')

fs.readFile(__dirname + '/client/assets/twitter-media/fire-engine-1.png', function(err, squid){
  if (err) throw err;
  img = new Image;
  img.src = squid;
  ctx.drawImage(img, 0, 0, width, height);
  ctx.textAlign = 'center'
  ctx.fillText('Awesome!', width/2, height/2)

  console.dir(canvas.toDataURL())
});
