'use strict';

// Reviewed family-house words that WordBurst must accept immediately on every
// device, even before the optional expanded dictionary finishes loading.
[
  'neat',
  'neater',
  'neatest',
  'neatly',
  'jem',
].forEach((word) => {
  if (typeof dictionary !== 'undefined' && isFamilySafe(word)) dictionary.add(word);
});
