const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const api = require('./config/api.js');
const request = require('request');
const url = require('url');
// maultiParty
const multiparty = require('multiparty');
const util = require('util');
const base64 = require('file-base64');
const jsonfile = require('jsonfile');
//Kairos
const kairo = require('./server/kairos');

app.use(express.static(__dirname + '/client'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(bodyParser.json());

//mongoDB connection
// const Photos = require(path.join(__dirname, '/database/index'));
// var tempArray=[];
// //Get all the details from mongoDB
// Photos.photos.findAsync({})
// .then(function(results) {
//   tempArray = results[0].photoListName.hrsf_76;
//   createAnotherCollection(tempArray);
// })
// .catch(function(err) {
//   console.log(err);
// });

// //create one more collection with photogallery schema
// function createAnotherCollection (tempArray) {
// tempArray.forEach(function(item) {
//   var picgallery = new Photos.photoGallery();
//   picgallery.userName= item.userName;
//   picgallery.filePath= item.filePath;
//   picgallery.galleryName= "hrsf_76";
//   picgallery.saveAsync()
//   .then(function (resul) {
//     console.log(resul);
//   })
//   .catch(function(err) {
//     console.log(err);
//   })
// });
// }

//Receive enncoded image and decode and save as pic.jpg
app.post('/upload/url', function(req, res) {
  // console.log('hello from uploader');
  var form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    if (!err) {
      kairo.recognize(fields.file[0].split(',')[1], (kairoResults) => {
      
        console.log('results from kairos', typeof(kairoResults));
       // res.json(util.inspect(kairoResults));
 
        res.send((kairoResults));
      });
    }

    //decoding back to image file text.jpg
    // base64.decode(fields.file[0].split(',')[1], 'pic.jpg', function(err, output) {
    //   if (!err) {
    //     console.log('success');
    //     //Here we can call the Kairo's recognize function and pass the base64 encoded string as fields.file[0].split(',')[1]
       
    //     //testing(fields.file[0].split(',')[1]);

    //   }

    // });
    

  });

});


//helper function kairo's recognize


var galleryName = 'hrsf76';
app.get('/recognize', (req, res) => {
  console.log ('recognize post route');
  console.log ('gallery name', galleryName);
  var body = {
    image: 'https://www.linkedin.com/mpr/mpr/p/2/000/199/182/18b5425.jpg',
    gallery_name: galleryName,
    threshold: 0.00001,
    max_num_results: 50
  };
  body = JSON.stringify(body);
  var options = {
    method: 'POST',
    url: api.kairos.api_url + '/recognize',
    headers: {
      'app_id': api.kairos.app_id,
      'app_key': api.kairos.app_key
    },
    body: body
  };
  request(options, (error, results, body) => {
    if (error) {
      console.log(error);
    } else {
      //DO NOT DELETE! Kairos ErrCode:3001 "API temporarily unavailable" will be caught here
      if (body.Errors) {
        console.log(body.Errors);
        res.send(body.Errors);
      } else {
        console.log(JSON.parse(body).images[0].candidates);
        res.send(JSON.parse(body));
      }
    }
  });
});

app.get('/classmates', (req, res) => {
  console.log ('classmates get route');
  request({
    method: 'POST',
    url: api.kairos.api_url + '/gallery/view',
    headers: {
      'app_id': api.kairos.app_id,
      'app_key': api.kairos.app_key
    },
    body: JSON.stringify({
      'gallery_name': 'hrsf76'
    })
  }, function (error, response, body) {
    if (error) {
      console.log (err);
    } else {
      console.log('Status:', response.statusCode);
      console.log('Headers:', JSON.stringify(response.headers));
      console.log('Response:', body);
      res.send(body);
      // console.log('Student Count: ', body.subject_ids.length)
    }
  });
});

app.get('/query', (req, res) => {
  var body = {
    gallery_name: 'testGallery'
  };
  body = JSON.stringify(body);
  var options = {
    method: 'POST',
    url: 'https://api.kairos.com/gallery/view',
    headers: {
      'app_id': '077d4b23',
      'app_key': 'd217274b4c07e0acef0e9cec7507d94d'
    },
    body: body
  };
  request(options, (error, results, body) => {
    if (error) {
      console.log('ERROR IN RECOGNIZE-----', error);
    } else {
      console.log('RECOGNIZED-----', body);
      res.send(JSON.parse(body));
    }
  });
});


app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port: ', process.env.PORT || 3000);
});
