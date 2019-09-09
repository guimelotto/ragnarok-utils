const growl = require('notify-send');
const axios = require('axios');
const numeral = require('numeral');
const fs = require('fs');

const base_url_api = 'https://poring.world/api/search';
const base_url_img = 'https://poring.world/sprites/';
(() => {
  const item = process.argv[2];
  axios
    .get(base_url_api, {
      params: { order: 'popularity', inStock: 1, q: item.toLowerCase() }
    })
    .then(resp => {
      const value = numeral(resp.data[0].lastRecord.price).format('$0,0');
      const img = `${base_url_img}${resp.data[0].icon}.png`;
      const fileName =
        item
          .split(' ')
          .join('_')
          .toLowerCase() + '.png';
      const filePath = `${__dirname}/${fileName}`;

      download_image(img, fileName).then(() => {
        growl.icon(filePath).notify(item, value);
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
