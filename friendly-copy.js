// Keep WordBurst playful without sounding sarcastic or passive-aggressive.
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

  const resultTitle=$('resultTitle');
  if(resultTitle){
    const observer=new MutationObserver(()=>{
      if(resultTitle.textContent==='We Pretend This Never Happened') resultTitle.textContent='Good warm-up!';
    });
    observer.observe(resultTitle,{childList:true,subtree:true,characterData:true});
  }
})();
