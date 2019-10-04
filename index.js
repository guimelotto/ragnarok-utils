'use strict';

const growl = require('notify-send');
const { fetchItem, downloadImage } = require('./lib/functions.js')

const item = process.argv[2];

if (!item) {
  growl.icon('error').notify('No item received');
  return 1;
}

main(item);

function checkSnap(item) {
  let value = '';

  if ( item.lastRecord.snapEnd > 0 ) {
    if ( item.lastRecord.snapEnd > new Date().getTime() / 1000 ) {
      value += `\n<i>(in snap until ${new Date(
        item.lastRecord.snapEnd * 1000
      ).toLocaleString()})</i>`;

      value += `\n[<b>Stock</b>: ${item.lastRecord.stock} | <b>Buyers</b>: ${item.lastRecord.snapBuyers}]`
    } else {
      return false;
    }
  }

  return value;
}

function main(item, data_index = 0, qtd = 2) {
  fetchItem(item).then(async r => {
    if (!r.data || !r.data[data_index]) {
      growl.icon('error').notify('No data received');
      return 1;
    }

    for (let i = 0; i <= qtd; i++) {
      let data = r.data[data_index + i];
      if (!data) {
        continue;
      }
      let value = 'Ƶ ' + Number(data.lastRecord.price).toLocaleString() + ` (${Math.round(data.priceChange1d)}%)`;

      const snap = checkSnap(data);
      if (snap === false) {
        if (data_index === 0) {
          main(item, data_index += 1);
          return 0;
        } else {
          continue;
        }
      }

      value += snap;

      const fileName = data.name
      .replace(/\+\d+|\[\d+\]|\(.+\)|\<.+\>/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');

      const filePath = `${__dirname}/images/${fileName}.png`;

      await downloadImage(`${data.icon}.png`, filePath);

      console.log(`[${(new Date()).toLocaleString()}] ${data.name}: ${Number(data.lastRecord.price).toLocaleString()}`);
      growl.icon(filePath).notify(data.name, value);
    }

  });
}