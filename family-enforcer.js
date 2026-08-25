// Apply the family-safe vocabulary policy without changing the core game engine.
const wordBurstBaseSubmit = submitWord;
submitWord = function(){
  const candidate = norm(getSelectedWord());
  if(candidate && window.isWordBurstFamilySafe && !window.isWordBurstFamilySafe(candidate)){
    react('Family filter says nope 🙈', false);
    clearSelection();
    return;
  }
  return wordBurstBaseSubmit();
};

// The original click handler captured the original function, so point it at the
// wrapped version. Keyboard submission resolves the updated binding automatically.
$('submitButton').onclick = submitWord;
