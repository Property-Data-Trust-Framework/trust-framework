/*!
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
 'use strict';

 const constants = require('./constants');
 const fs = require('fs');
 const path = require('path');

 exports.constants = constants;
 const contexts = exports.contexts = new Map();

 function _read(_path) {
   return JSON.parse(
     fs.readFileSync(
       path.join(__dirname, _path),
       {encoding: 'utf8'}));
 }

 contexts.set(
   constants.VERES_ONE_CONTEXT_V1_URL,
   _read('../contexts/veres-one-v1.jsonld'));
