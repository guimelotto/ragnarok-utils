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
      const value = 'Ƶ '+Number(data[0].lastRecord.price).toLocaleString();
      const img = `${base_url_img}${data[0].icon}.png`;
      const fileName = `${data[0].name}`.replace(/[^0-9a-zA-Z]/g, '_')+'.png';
      const filePath = `${__dirname}/images/${fileName}`;

      download_image(img, filePath).then(() => {
        growl.icon(filePath).notify(data[0].name, value);
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
