'use strict';

const ws281x = require('rpi-ws281x-native');
const osc = require('node-osc');

const NUM_LEDS = 60;
const pixelData = new Uint32Array(NUM_LEDS);
let r_current = 0;
let g_current = 0;
let b_current = 0;

let r_destination = 0;
let g_destination = 0;
let b_destination = 0;

let r_gradient = 1;
let g_gradient = 1;
let b_gradient = 1;

const mult = 8;

let scalar = 0;

ws281x.init(NUM_LEDS);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(() => {
    process.exit(0);
  });
});

function scale() {
  if (r_current !== r_destination) {
    if (r_current > r_destination) {
      r_current = r_current - r_gradient * mult;
    } else if (r_current < r_destination) {
      r_current = r_current + r_gradient * mult;   
    }
    r_current = r_current < 0 ? 0 : r_current;
    r_current = r_current > 255 ? 255 : r_current;
  }
  if (g_current !== g_destination) {
    if (g_current > g_destination) {
      g_current = g_current - g_gradient * mult;
    } else if (g_current < g_destination) {
      g_current = g_current + g_gradient * mult;
    }
    g_current = g_current < 0 ? 0 : g_current;
    g_current = g_current > 255 ? 255 : g_current;
  }
  if (b_current !== b_destination) {
    if (b_current > b_destination) {
      b_current = b_current - b_gradient * mult;
    } else if (b_current < b_destination) {
      b_current = b_current + b_gradient * mult;
    }
    b_current = b_current < 0 ? 0 : b_current;
    b_current = b_current > 255 ? 255 : b_current
  }
}

setInterval(() => {
  scale();
  write_lights(parseInt(r_current), parseInt(g_current), parseInt(b_current));
}, 2);

function rgb2Int(red, green, blue) {
  return ((red & 0xff) << 16) + ((green & 0xff) << 8) + (blue & 0xff);
}

function write_lights(red, green, blue) {
  //console.log('about to write', red, green, blue);
  for (let i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = rgb2Int(red, green, blue);
  }
  ws281x.render(pixelData);
}


const oscServer = new osc.Server(1337, '0.0.0.0');

oscServer.on("message", function (msg, rinfo) {
  // console.log('message!', msg);
  if (msg[0] === '/note') {
    switch (String(msg[1])) {
      case '60':
        r_destination = parseInt(255 * scalar);
        g_destination = parseInt(0   * scalar);
        b_destination = parseInt(0   * scalar);
        r_gradient = 1;
        g_gradient = 1;
        b_gradient = 1;
        break;
      case '62':
        r_destination = parseInt(0   * scalar);
        g_destination = parseInt(0   * scalar);
        b_destination = parseInt(255 * scalar);
        r_gradient = 1;
        g_gradient = 1;
        b_gradient = 1;
        break;
      case '64':
        r_destination = parseInt(200 * scalar);
        g_destination = parseInt(200 * scalar);
        b_destination = parseInt(0   * scalar);
        r_gradient = 1;
        g_gradient = 1;
        b_gradient = 1;
        break;
      case '65':
        r_destination = parseInt(0   * scalar);
        g_destination = parseInt(200 * scalar);
        b_destination = parseInt(100 * scalar);
        r_gradient = 1;
        g_gradient = 200 / 255;
        b_gradient = 100 / 255;
        break;
      case '67':
        r_destination = parseInt(50  * scalar);
        g_destination = parseInt(255 * scalar);
        b_destination = parseInt(0   * scalar);
        r_gradient = 50 / 255;
        g_gradient = 255 / 255;
        b_gradient = 1;
        break;
      case '69':
        r_destination = parseInt(240 * scalar);
        g_destination = parseInt(150 * scalar);
        b_destination = parseInt(0   * scalar);
        r_gradient = 240 / 255;
        g_gradient = 150 / 255;
        b_gradient = 1;
        break;
      case '71':
        r_destination = parseInt(200 * scalar);
        g_destination = parseInt(0   * scalar);
        b_destination = parseInt(200 * scalar);
        r_gradient = 1;
        g_gradient = 1;
        b_gradient = 1;
        break;
      default:
        break;
    }
  } else if (msg[0] === '/velocity') {
    scalar = Number(msg[1]);
    r_destination = parseInt(r_destination * scalar);
    g_destination = parseInt(g_destination * scalar);
    b_destination = parseInt(b_destination * scalar);
  }
});

