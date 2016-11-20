'use strict';

const ws281x = require('rpi-ws281x-native');
const osc = require('node-osc');

const NUM_LEDS = 60;
const pixelData = new Uint32Array(NUM_LEDS);

let r_destination = 0;
let g_destination = 0;
let b_destination = 0;

ws281x.init(NUM_LEDS);

setInterval(() => {
  write_lights(r_destination, g_destination, b_destination);
}, 10);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(() => {
    process.exit(0);
  });
});

function rgb2Int(red, green, blue) {
  return ((red & 0xff) << 16) + ((green & 0xff) << 8) + (blue & 0xff);
}

function write_lights(red, green, blue) {
  for (let i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = rgb2Int(red, green, blue);
  }
  ws281x.render(pixelData);
}

const oscServer = new osc.Server(1337, '0.0.0.0');

oscServer.on("message", function (msg, rinfo) {
  if (msg[0] === '/r0') {
    r_destination = parseInt(Number(msg[1]) * 255);
  } else if (msg[0] === '/g0') {
    g_destination = parseInt(Number(msg[1]) * 255);
  } else if (msg[0] === '/b0') {
    b_destination = parseInt(Number(msg[1]) * 255);
  }
});

