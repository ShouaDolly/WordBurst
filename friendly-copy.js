// Keep WordBurst playful without sounding sarcastic at the player.
(() => {
  const baseReact=react;
  react=function(text,good){
    const t=String(text||'');
    let friendly=t;
    if(/Already got it/i.test(t)) friendly='Already found ✨';
    else if(/Too tiny/i.test(t)) friendly='Try 3+ letters 😊';
    else if(/Nope/i.test(t)) friendly='Not in this word list';
    else if(/Family filter/i.test(t)) friendly='That word is filtered for family play';
    else if(/ABSOLUTE NERD/i.test(t)) friendly=t.replace(/ABSOLUTE NERD 🤓/i,'Amazing find! 🌟');
    else if(/smarty pants/i.test(t)) friendly='Nice one! ✨';
    else if(/Word goblin/i.test(t)) friendly='Great find! 💥';
    return baseReact(friendly,good);
  };
  // Intentionally keep the low-score result joke: “We Pretend This Never Happened”.
})();
