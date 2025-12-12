/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const context = require('../contexts/x25519-key-agreement-2020-v1.json');
const constants = require('./constants');
const {documentLoader} = require('./documentLoader');
const {CONTEXT_URL, CBORLD_VALUE} = constants;

const contexts = new Map();
contexts.set(constants.CONTEXT_URL, context);

const appContextMap = new Map();
appContextMap.set(CONTEXT_URL, CBORLD_VALUE);

module.exports = {
  constants,
  contexts,
  appContextMap,
  documentLoader
};
