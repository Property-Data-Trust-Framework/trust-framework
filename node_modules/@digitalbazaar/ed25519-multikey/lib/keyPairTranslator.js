/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {keyPairTranslationMap} from './keyPairTranslationMap.js';

export async function toMultikey({keyPair}) {
  const translationResult = keyPairTranslationMap.get(keyPair.type);
  if(!translationResult) {
    throw new Error(`Unsupported key type "${keyPair.type}".`);
  }

  const {contextUrl, translationFn} = translationResult;
  if(!keyPair['@context']) {
    keyPair['@context'] = contextUrl;
  }
  if(!_includesContext({document: keyPair, contextUrl})) {
    throw new Error(`Context not supported "${keyPair['@context']}".`);
  }

  return translationFn({keyPair});
}

function _includesContext({document, contextUrl}) {
  const context = document['@context'];
  return context === contextUrl ||
    (Array.isArray(context) && context.includes(contextUrl));
}
