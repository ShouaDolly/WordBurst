// WordBurst family-safe vocabulary filter.
// Exact-word blocking only, so innocent words are never rejected because they
// merely contain the same letters as a blocked term.
window.WORDBURST_BLOCKED = new Set(`
anal anus arse arsehole arseholes asshole assholes bastard bastards bdsm bitch bitches blowjob blowjobs boner boners boob boobs boobie boobies brothel brothels buttsex cameltoe clit clitoris cock cocks cocksucker cocksuckers cum cumming cumshot cumshots cunt cunts dick dicks dildo dildos douche douches douchebag douchebags erection erections erotic erotica fetish fetishes fuck fucked fucker fuckers fucking fucks gangbang gangbangs genital genitals handjob handjobs hooker hookers horny incest jackoff jerkoff jizz kink kinky masturbation masturbate masturbating milf naked nude nudes onlyfans orgy orgies orgasm orgasms pedophile pedophiles penis penises porn porno pornography prostitute prostitutes prostitution pussy pussies rape raped rapes raping rapist rapists scrotum semen sex sexed sexy sexting sexual sexually shit shits shitty slut sluts slutty sperm stripper strippers striptease testicle testicles tits titties titty vagina vaginas vibrator vibrators vulva whore whores
`.trim().split(/\s+/));

// Slurs and demeaning identity-based insults are separate so the family game
// never awards them even if an expanded source dictionary contains them.
window.WORDBURST_BLOCKED_SLURS = new Set(`
chink chinks gook gooks kike kikes nigga niggas nigger niggers retard retards tranny trannies wetback wetbacks
`.trim().split(/\s+/));

window.isWordBurstFamilySafe = function(word){
  const normalized = String(word || '').toLowerCase().replace(/[^a-z]/g, '');
  return !window.WORDBURST_BLOCKED.has(normalized)
    && !window.WORDBURST_BLOCKED_SLURS.has(normalized);
};
