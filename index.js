import dgram from 'dgram';

const socket = dgram.createSocket('udp4');
const PORT = 8000;
const HOST = '127.0.0.1';

const message = JSON.stringify({
  method: "setPilot",
  params: {
    r: 0,
    g: 0,
    b: 255,
    dimming: 100
  }
});

socket.send(message, PORT, HOST, (err) => {
  if (err) {
    console.error('Send error:', err);
  } else {
    console.log(`Message sent to ${HOST}:${PORT}`);
  }
  socket.close();
});

console.clear();
console.log("hi");

const dataSource = "https://global-mind.org/gcpdot/gcpindex.php";

async function getColor() {
  const res = await fetch(
    `${dataSource}?current=1&nonce=${Math.round(Math.random() * 10000000)}`,
    {
      method: "GET",
      headers: { "Content-Type": "text/plain" },
    }
  );

  const data = await res.text();
  // console.log(data);

  const p = /<serverTime>([\d.]+)/im;
  const pi = /<s t='([\d]+)'>([\d.]+)/gim;
  var r;

  const nextData = [];
  const serverTime = p.exec(data)[1];

  const offsetTime = serverTime - Date.now() / 1000 - 60.0;

  do {
    if ((r = pi.exec(data))) {
      nextData[r[1]] = r[2];
    }
  } while (r);

  let value = nextData[serverTime];
  if (value < 0) value = 0;
  if (value > 1) value = 1;

  // Determine color based on value
  let selectedColor = dotElements[0]; // Default color
  // What % is within the color ranges
  let lerpFactor = 0.0;

  for (let i = 0; i < colors.length - 1; i++) {
    if (value >= colors[i].tail && value <= colors[i + 1].tail) {
      selectedColor = colors[i].mc;
      const range = colors[i + 1].tail - colors[i].tail;
      lerpFactor = (value - colors[i].tail) / range;
      break;
    }
  }

  const colorHex = lerpColor(
    selectedColor.color1,
    selectedColor.color2,
    lerpFactor
  );
  const colorRGB = hexToRgb(colorHex);

  console.log("Value:", value);
  console.log("Color Hex:", colorHex);
  console.log("Color RGB:", colorRGB);
}

const dotElements = [
  { id: "gcpdot0", color1: "#CDCDCD", color2: "#505050" },
  { id: "gcpdot1", color1: "#FFA8C0", color2: "#FF0064" },
  { id: "gcpdot2", color1: "#FF1E1E", color2: "#840607" },
  { id: "gcpdot3", color1: "#FFB82E", color2: "#C95E00" },
  { id: "gcpdot4", color1: "#FFD517", color2: "#C69000" },
  { id: "gcpdot5", color1: "#FFFA40", color2: "#C6C300" },
  { id: "gcpdot6", color1: "#F9FA00", color2: "#B0CC00" },
  { id: "gcpdot7", color1: "#AEFA00", color2: "#88C200" },
  { id: "gcpdot8", color1: "#64FA64", color2: "#00A700" },
  { id: "gcpdot9", color1: "#64FAAB", color2: "#00B5C9" },
  { id: "gcpdot10", color1: "#ACF2FF", color2: "#21BCF1" },
  { id: "gcpdot11", color1: "#0EEEFF", color2: "#0786E1" },
  { id: "gcpdot12", color1: "#24CBFD", color2: "#0000FF" },
  { id: "gcpdot13", color1: "#5655CA", color2: "#2400A0" },
];

const colors = [
  { tail: 0.0, mc: dotElements[1] },
  { tail: 0.01, mc: dotElements[2] },
  { tail: 0.05, mc: dotElements[3] },
  { tail: 0.08, mc: dotElements[4] },
  { tail: 0.15, mc: dotElements[5] },
  { tail: 0.23, mc: dotElements[6] },
  { tail: 0.3, mc: dotElements[7] },
  { tail: 0.4, mc: dotElements[8] },
  { tail: 0.9, mc: dotElements[8] },
  { tail: 0.9125, mc: dotElements[9] },
  { tail: 0.93, mc: dotElements[10] },
  { tail: 0.96, mc: dotElements[11] },
  { tail: 0.98, mc: dotElements[12] },
  { tail: 1.0, mc: dotElements[13] },
];

// Lerp between two colors
function lerpColor(color1, color2, factor) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Turn hex color to rgb [int, int, int]
function hexToRgb(hex) {
  const c = parseInt(hex.slice(1), 16);
  const r = (c >> 16) & 0xff;
  const g = (c >> 8) & 0xff;
  const b = c & 0xff;
  return [r, g, b];
}

getColor();

setInterval(async () => {
  // console.clear()
  // getColor();
}, 1000)