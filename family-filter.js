// WordBurst family-safe vocabulary filter.
// Exact-word blocking only: avoids false positives inside innocent words.
window.WORDBURST_BLOCKED = new Set(`
anal anus arse arsehole asshole assholes bastard bastards bitch bitches blowjob blowjobs boner boners boob boobs boobie boobies blowjob buttsex cameltoe clit clitoris cock cocks cocksucker cocksuckers cum cumming cumshot cumshots cunt cunts dick dicks dildo dildos douche douches douchebag douchebags erection erections erotic erotica fuck fucked fucker fuckers fucking fucks gangbang gangbangs genital genitals handjob handjobs horny jackoff jerkoff jizz masturbation masturbate masturbating milf orgy orgies orgasm orgasms penis penises porn porno pornography pussy pussies scrotum semen sexed sexting sexual sexually shit shits shitty slut sluts slutty sperm testicle testicles tits titties titty vagina vaginas vibrator vibrators vulva whore whores
`.trim().split(/\s+/));

// Slurs and demeaning identity-based insults are kept in a separate set so the
// family game never awards them even if the source dictionary contains them.
window.WORDBURST_BLOCKED_SLURS = new Set(`
chink chinks gook gooks kike kikes nigga niggas nigger niggers retard retards tranny trannies wetback wetbacks
`.trim().split(/\s+/));

window.isWordBurstFamilySafe = function(word){
  const w=String(word||'').toLowerCase().replace(/[^a-z]/g,'');
  return !window.WORDBURST_BLOCKED.has(w) && !window.WORDBURST_BLOCKED_SLURS.has(w);
};
