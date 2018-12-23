const iconv = require("iconv-lite");
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const config = require('./config');

function requestPage(url, callback) {
  request(url, {encoding: null}, (err, response, body) => {
    if (err) throw err;
    const html = iconv.decode(Buffer.concat([body]), 'gbk');
    const $html = cheerio.load(html);
    callback($html);
  });
}

function generateCatalog(catalogLink, callback) {
  requestPage(catalogLink, ($html) => {
    const name = $html('#bookname .bigname a').text();
    const volumes = [];
    const len = $html('div.ttname').length;
    for(let i = 0; i < len; i++) {
      volumes.push({
        title: $html('div.ttname h2').eq(i).text(),
        url: $html('div.ttname a').eq(i).attr('href')
      });
    }
    callback({ name, volumes });
  });
}

function getVolumes(volumeSrcList, callback) {
  let counter = 0;
  const volumes = [];
  volumeSrcList.forEach((volumeSrc, index) => {
    requestPage(volumeSrc.url, ($html) => {
      const chapters = [];
      const $title = $html('.chaptertitle');
      const $content = $html('.chaptercontent');
      for(let i = 0, len = $content.length; i < len; i++) {
        const title = $title.eq(i).text();
        const content = $content.eq(i).text();
        chapters.push(`${title}\n\n${content}`);
      }
      const volume = chapters.join('\n\n\n\n');
      volumes.push({
        title: volumeSrc.title,
        content: volume,
        order: index
      });
      counter += 1;
      if (volumeSrcList.length === counter) {
        volumes.sort((prev, next) => prev.order - next.order);
        callback(volumes);
      }
    });
  });
}

function getFilePath(filename) {
  const name = config.name || filename || Date.now();
  const dirName = config.dir || 'src';
  const dir = path.resolve(__dirname, `./${dirName}`);
  const filePath = path.join(dir, `${name}.txt`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return filePath;
}

function saveVolumes(filename, volumes) {
  const filePath = getFilePath(filename);
  volumes.forEach(volume => {
    fs.writeFileSync(filePath, volume.content, { flag: 'a' });
  });
}

(function __main() {
  if (!config.url) {
    console.log('please enter the url in config.json');
    return ;
  }
  console.log('download...')
  generateCatalog(config.url, data => {
    const { volumes: volumeSrcList, name } = data;
    getVolumes(volumeSrcList, (volumes) => {
      saveVolumes(name, volumes);
    });
  });
})();