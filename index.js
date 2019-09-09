const growl = require('notify-send');
const axios = require('axios');
const fs = require('fs');

const base_url_api = 'https://poring.world/api/search';
const base_url_img = 'https://poring.world/sprites/';

(() => {
  const item = process.argv[2];
  axios
    .get(base_url_api, {
      params: { order: 'popularity', inStock: 1, q: item.toLowerCase() }
    })
    .then(({ data }) => {
      data = data[0];
      let value = 'Ƶ ' + Number(data.lastRecord.price).toLocaleString();
      if (data.lastRecord.snapEnd > 0 && new Date(data.lastRecord.snapEnd*1000).getTime() > new Date().getTime()) {
        value += `\n<i>(in snap until ${new Date(data.lastRecord.snapEnd*1000).toLocaleString()})</i>`
      }
      const img = `${base_url_img}${data.icon}.png`;

      const fileName = data.name
        .replace(/\+\d+|\[\d+\]|\(.+\)|\<.+\>/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');

      const filePath = `${__dirname}/images/${fileName}.png`;

      download_image(img, filePath).then(() => {
        growl.icon(filePath).notify(data.name, value);
      });
    });
})();

const download_image = (url, image_path) =>
  axios({
    url,
    responseType: 'stream'
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      })
  );
