'use strict';

const ws281x = require('rpi-ws281x-native');
const osc = require('node-osc');

const NUM_LEDS = 20;
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
      r_current -= r_gradient;
    } else if (r_current < r_destination) {
      r_current += r_gradient;
    }
  }
  if (g_current !== g_destination) {
    if (g_current > g_destination) {
      g_current -= g_gradient;
    } else if (g_current < g_destination) {
      g_current += g_gradient;
    }
  }
  if (b_current !== b_destination) {
    if (b_current > b_destination) {
      b_current -= b_gradient;
    } else if (b_current < b_destination) {
      b_current += b_gradient;
    }
  }
}

setInterval(() => {
  scale();
  write_lights(r_current, g_current, b_current);
}, 1);

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
        break;
      case '62':
        r_destination = parseInt(0   * scalar);
        g_destination = parseInt(0   * scalar);
        b_destination = parseInt(255 * scalar);
        break;
      case '64':
        r_destination = parseInt(200 * scalar);
        g_destination = parseInt(200 * scalar);
        b_destination = parseInt(0   * scalar);
        break;
      case '65':
        r_destination = parseInt(0   * scalar);
        g_destination = parseInt(200 * scalar);
        b_destination = parseInt(100 * scalar);
        break;
      case '67':
        r_destination = parseInt(50  * scalar);
        g_destination = parseInt(255 * scalar);
        b_destination = parseInt(0   * scalar);
        break;
      case '69':
        r_destination = parseInt(240 * scalar);
        g_destination = parseInt(150 * scalar);
        b_destination = parseInt(0   * scalar);
        break;
      case '71':
        r_destination = parseInt(200 * scalar);
        g_destination = parseInt(0   * scalar);
        b_destination = parseInt(200 * scalar);
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
