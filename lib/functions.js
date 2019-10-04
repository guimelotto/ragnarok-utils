const axios = require('axios');
const fs = require('fs');

const base_url_api = 'https://poring.world/api/search';
const base_url_img = 'https://poring.world/sprites/';

const fetchItem = (item, inStock = 1, modified = '', order = 'price') => {
  return axios.get(base_url_api, {
    params: { order, inStock, q: item.toLowerCase(), modified }
  });
};

const downloadImage = (img, image_path) => {
  return axios({
    url: `${base_url_img}${img}`,
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
};


module.exports = {
  fetchItem,
  downloadImage
}