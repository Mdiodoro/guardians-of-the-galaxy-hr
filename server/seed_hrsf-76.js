var Promise = require('bluebird');
const database = require('../database');
const kairos = require('./kairos.js');
Promise.promisifyAll(kairos);

var galleryName = 'hrsf-76' // lower resolution images

kairos.removeGalleryAsync(galleryName)
.then(() => {
  return database.photo.findAsync({galleryName: galleryName});
})
.then((results) => {
  console.log (results);
  console.log (results.length);
  return Promise.map(results, function (person) {
    return kairos.enrollAsync(person, galleryName);
  });
})
.then((results) => {
  console.log ('Kairos enroll completed', results);
  process.exit();
})
.catch((error) => {
  throw error;
});
