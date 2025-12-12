/*!
 * Copyright (c) 2021-2024 Digital Bazaar, Inc. All rights reserved.
 */
import undefinedTermsV2Context from './undefined-terms-v2.js';
import v1Context from './v1.js';
import v2Context from './v2.js';

// map of context id to context
export const contexts = new Map();
// map of context id to context metadata
export const metadata = new Map();
// map of short names to context metadata
export const named = new Map();

function setExportsFromMetadata({
  contextsMap, metadataMap, namedMap, metadata
}) {
  contextsMap.set(metadata.id, metadata.context);
  metadataMap.set(metadata.id, metadata);
  namedMap.set(metadata.shortName, metadata);
}

setExportsFromMetadata({
  contextsMap: contexts, metadataMap: metadata, namedMap: named,
  metadata: {
    id: 'https://www.w3.org/ns/credentials/undefined-terms/v2',
    type: 'ContextMetadata',
    shortName: 'undefined-terms-v2',
    url: new URL('../contexts/undefined-terms-v2.jsonld', import.meta.url),
    context: undefinedTermsV2Context
  }
});
setExportsFromMetadata({
  contextsMap: contexts, metadataMap: metadata, namedMap: named,
  metadata: {
    id: 'https://www.w3.org/2018/credentials/v1',
    type: 'ContextMetadata',
    shortName: 'v1',
    url: new URL('../contexts/v1.jsonld', import.meta.url),
    context: v1Context
  }
});
setExportsFromMetadata({
  contextsMap: contexts, metadataMap: metadata, namedMap: named,
  metadata: {
    id: 'https://www.w3.org/ns/credentials/v2',
    type: 'ContextMetadata',
    shortName: 'v2',
    url: new URL('../contexts/v2.jsonld', import.meta.url),
    context: v2Context
  }
});
