// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { renderModuleFactory } from '@angular/platform-server';
import { enableProdMode } from '@angular/core';

import * as express from 'express';
import { join, resolve } from 'path';
import * as fs from 'fs';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = 4000;
// const DIST_FOLDER = join(process.cwd(), 'dist');

// Our index.html we'll use as our template
// const template = fs.readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();


// const serverIndex = fs.readFileSync(resolve(__dirname, './server/index.html'), 'utf8');
const browserIndex = fs.readFileSync(resolve(__dirname, './browser/index.html'), 'utf8');
const files = fs.readdirSync(resolve(__dirname, './server'));
const mainFiles = files.filter(file => file.startsWith('main'));
const hash = mainFiles[0].split('.')[1];
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require(`./server/main.${hash}.bundle`);

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
// const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');

const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

// app.engine('html', (_, options, callback) => {
//   renderModuleFactory(AppServerModuleNgFactory, {
//     Our index.html
    // document: template,
    // url: options.req.url,
    // DI so that we can get lazy-loading to work differently (since we need it to just instantly render it)
    // extraProviders: [
    //   provideModuleMap(LAZY_MODULE_MAP)
    // ]
  // }).then(html => {
  //   callback(null, html);
  // });
// });

app.set('view engine', 'html');
app.get('*', (req, res) => {
  console.log('req.path:', req.path);
  // if(shouldShowPrerenderedPage(req)) {
  console.log('should show prerendered page');
  renderModuleFactory(AppServerModuleNgFactory, {
    document: browserIndex,
    url: req.path,
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  })
    .then(html => {
      res.send(html);
    }).catch(e => {
    console.log('error:', e);
  });
  // }
  // else {
  //   console.log('don\'t show prerendered page');
  //   res.sendFile(path.resolve(__dirname, './dist-browser/index.html'));
  // }
});
app.get('/*.bundle.*', function (req, res) {
  // kinda dirty but it's a god damn test server for chrissakes - Holden
  try {
    res.sendFile(resolve(__dirname, './browser/' + req.path));
  }
  catch (e) {
    res.sendFile(resolve(__dirname, './server/' + req.path));
  }
});
app.get('/*.chunk.*', function (req, res) {
  res.sendFile(resolve(__dirname, './browser/' + req.path));
});
// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// All regular routes use the Universal engine
// app.get('*', (req, res) => {
//   res.render(join(DIST_FOLDER, 'browser', 'index.html'), { req });
// });

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
