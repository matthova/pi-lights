'use strict';

const ws281x = require('rpi-ws281x-native');
const osc = require('node-osc');

const NUM_LEDS = 20;
const pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(() => {
    process.exit(0);
  });
});

function write_lights(r, g, b, scalar) {
  const r_scaled = parseInt(r * scalar / 127);
  const g_scaled = parseInt(g * scalar / 127);
  const b_scaled = parseInt(b * scalar / 127);
  console.log('about to write ', r_scaled, g_scaled, b_scaled);
  for (let i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = rgb2Int(r_scaled, g_scaled, b_scaled);
  }
  ws281x.render(pixelData);
}
var oscServer = new osc.Server(1337, '0.0.0.0');
oscServer.on("message", function (msg, rinfo) {
  if (msg[1] !== 0) {
    switch (msg[0]) {
      case '/C3':
        write_lights(255, 0, 0, msg[1]);
        break;
      case '/D3':
        write_lights(0, 0, 255, msg[1]);
        break;
      case '/E3':
        write_lights(200, 200, 0, msg[1]);
        break;
      case '/F3':
        write_lights(0, 200, 100, msg[1]);
        break;
      case '/G3':
        write_lights(50, 255, 0, msg[1]);
        break;
      case '/A3':
        write_lights(240, 150, 0, msg[1]);
        break;
      case '/B3':
        write_lights(200, 0, 200, msg[1]);
        break;
      default:
        console.log('eyy', msg);
        break;
    }
  }
});


// // ---- animation-loop
// let offset = 0;
// setInterval(() => {
//   for (let i = 0; i < NUM_LEDS; i++) {
//     pixelData[i] = colorwheel((offset + i*2) % 256);
//   }
//
//   offset = (offset + 1) % 256;
//   ws281x.render(pixelData);
// }, 1000 / 30);
//
// function colorwheel(pos) {
//   pos = 255 - pos;
//   if (pos < 85) {
//     return rgb2Int(255 - pos * 3, 0, pos * 3);
//   } else if (pos < 170) {
//     pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3);
//   } else {
//     pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0);
//   }
// }

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}
