// Apply the family-safe vocabulary policy without changing the core game engine.
const wordBurstBaseSubmit = submitWord;
submitWord = function(){
  const candidate = norm(getSelectedWord());
  if(candidate && window.isWordBurstFamilySafe && !window.isWordBurstFamilySafe(candidate)){
    react('Family filter says nope 🙈', false);
    clearSelection();
    return false;
  }
  return wordBurstBaseSubmit();
};

// Older builds had a submit button. Keep this guard so the safety wrapper works
// whether that control exists or the game auto-submits on release.
const legacySubmitButton = $('submitButton');
if(legacySubmitButton) legacySubmitButton.onclick = submitWord;
