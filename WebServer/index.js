var fs = require('fs')
var async = require('async')
var express = require('express')
var app = express()
const enigma = require('enigma.js');
const qixSchema = require('enigma.js/schemas/qix/3.2/schema.json')
const WebSocket = require('ws')

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/phalanx/:area/:file', function (req, res) {
  var area = req.params.area
  var file = req.params.file
  var params = req.query;
  var whereClause = '';

  var obj = JSON.parse(fs.readFileSync('./config/files.json', 'utf8'))
  //console.log(obj.areas[area][file])

  async.forEachOf(Object.keys(params), function (key, value, callback) {
      //console.log(params[key] + ' --> ' + value)
      var localParams = params[key];
      var localWhere = '';

      if(value != 0) {
        localWhere = ' and '
      } 

      localParams = "'" + localParams + "'";
      localParams = localParams.split(',').join("','");
      paramsCount = localParams.split(',').length
      
      if(paramsCount > 1) {
        localWhere += ' ' + key + ' in( ' + localParams + ' ) \r\n';
      } else {
        localWhere += ' ' + key + ' = ' + localParams + ' \r\n';
      }
      
      whereClause += localWhere;

      callback();
  }, function (err) {
    if (err) {
      console.log('A file failed to process');
    } else {
      whereClause = whereClause + ';'
      console.log(whereClause)
      res.send(area + ' --> ' + JSON.stringify(req.query))
    }
  });

  
})

app.get('/create', function (req, res) {
  var config = JSON.parse(fs.readFileSync('./config/qliksense_config.json', 'utf8'))
  config.schema = qixSchema;

  config.createSocket = function (url) {
    return new WebSocket(url);
  };

  var qix;
  enigma.getService('qix', config)
    .then(function (qixLocal) {
      qix = qixLocal;
      return qixLocal.global.openDoc("C:\\Users\\Home\\Documents\\Qlik\\Sense\\Apps\\a.qvf")
    })
    .then(function (templateApp) {
      console.log('app open')
      return templateApp.getScript()
    })
    .then(function (script) {
      res.send(script)
    })
    .catch(function (error) {
      console.log('error --> ' + error)
      res.send(error)
    })
})

function replaceParams(callback) {

  callback()
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})