'use strict';

// Small, reviewed additions that WordBurst must accept immediately on every device,
// even when the optional expanded dictionary has not finished loading.
[
  'neat',
  'neater',
  'neatest',
  'neatly',
].forEach((word) => {
  if (typeof dictionary !== 'undefined' && isFamilySafe(word)) dictionary.add(word);
});
