#!/usr/bin/env python3
"""Build WordBurst's bundled, family-safe English dictionary.

The generated dictionary is served with the game, so phone play never waits for a
third-party dictionary request. We combine a spelling corpus, a modern frequency
list, and common noun/verb inflections so ordinary forms such as toe/toes are not
missed.
"""

from __future__ import annotations

import re
from pathlib import Path

TEXTBLOB_VERSION = "0.19.0"
WORDFREQ_VERSION = "3.1.1"
WORDFREQ_LIMIT = 100_000
MIN_DERIVED_ZIPF = 1.8
ROOT = Path(__file__).resolve().parents[1]
FILTER_FILE = ROOT / "family-filter.js"
OUTPUT_FILE = ROOT / "dictionary-additions.js"

# These are regression locks, not the primary dictionary. If one of these common
# words ever disappears from an upstream source, the WordBurst build still keeps
# it and CI catches the regression.
FORCED_WORDS = {
    "boot", "boots", "cat", "cats", "crisscross", "cue", "diagonal", "diagonals",
    "dire", "due", "hair", "hairs", "jem", "lair", "lairs", "lid", "neat",
    "neater", "neatest", "neatly", "stair", "stairs", "swipe", "swiped",
    "swipes", "swiping", "toe", "toes", "wordburst", "zigzag", "zigzags",
}

PROPER_NOUN_TAGS = {"NNP", "NNPS"}
NOUN_TAGS = {"NN", "NNS"}
VERB_BASE_TAGS = {"VB", "VBP"}


def parse_family_blocklist() -> set[str]:
    source = FILTER_FILE.read_text(encoding="utf-8")
    sections = re.findall(
        r"new Set\(`\s*(.*?)\s*`\.trim\(\)\.split",
        source,
        flags=re.DOTALL,
    )
    blocked: set[str] = set()
    for section in sections:
        blocked.update(re.findall(r"[a-z]+", section.lower()))

    # Block normal suffix variants without unsafe substring matching. Innocent
    # words are not rejected merely because they contain the same letters.
    suffixes = ("s", "es", "ed", "ing", "er", "ers", "y", "ly")
    expanded = set(blocked)
    for word in blocked:
        expanded.update(word + suffix for suffix in suffixes)
    return expanded


def parse_spelling_counts(path: Path) -> dict[str, int]:
    counts: dict[str, int] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith(";"):
            continue
        try:
            word, count = line.rsplit(" ", 1)
            counts[word.lower()] = int(count)
        except ValueError:
            continue
    return counts


def parse_lexicon(path: Path) -> dict[str, list[str]]:
    tags: dict[str, list[str]] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith(";"):
            continue
        parts = line.split()
        if len(parts) >= 2:
            tags[parts[0].lower()] = parts[1:]
    return tags


def is_allowed_word(
    word: str,
    blocked: set[str],
    lexicon: dict[str, list[str]],
) -> bool:
    if not re.fullmatch(r"[a-z]+", word):
        return False
    if not 3 <= len(word) <= 20 or word in blocked:
        return False

    # If the lexicon knows a token only as a proper noun, leave it out. Words not
    # represented there can still enter through the modern frequency list.
    tags = lexicon.get(word, [])
    if tags and all(tag in PROPER_NOUN_TAGS for tag in tags):
        return False
    return True


def regular_s_form(word: str) -> str:
    """Return the usual plural / third-person-s form for a regular English word."""
    if word.endswith("y") and len(word) > 1 and word[-2] not in "aeiou":
        return word[:-1] + "ies"
    if word.endswith(("s", "x", "z", "ch", "sh")):
        return word + "es"
    return word + "s"


def add_common_inflections(
    words: set[str],
    blocked: set[str],
    lexicon: dict[str, list[str]],
    zipf_frequency,
) -> int:
    """Add common -s/-es/-ies forms for known nouns and base-form verbs.

    We do not blindly append S to every dictionary entry. The base must be tagged
    as a noun or verb, and the resulting form must appear in modern English with a
    minimum frequency. This accepts normal forms such as toes, hairs, cats, boxes,
    cities, walks, etc. without inventing junk such as 'thes'.
    """
    added = 0
    base_words = list(words)
    for word in base_words:
        tags = set(lexicon.get(word, []))
        if not (tags & NOUN_TAGS or tags & VERB_BASE_TAGS):
            continue
        candidate = regular_s_form(word)
        if candidate in words:
            continue
        if not is_allowed_word(candidate, blocked, lexicon):
            continue
        if zipf_frequency(candidate, "en") < MIN_DERIVED_ZIPF:
            continue
        words.add(candidate)
        added += 1
    return added


def wrap_words(words: list[str], width: int = 108) -> str:
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and len(candidate) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return "\n".join(lines)


def main() -> None:
    try:
        import textblob  # type: ignore
        from wordfreq import top_n_list, zipf_frequency  # type: ignore
    except ImportError as exc:
        raise SystemExit(
            "Install the pinned dictionary dependencies: "
            f"textblob=={TEXTBLOB_VERSION} and wordfreq=={WORDFREQ_VERSION}"
        ) from exc

    package_root = Path(textblob.__file__).resolve().parent / "en"
    spelling_path = package_root / "en-spelling.txt"
    lexicon_path = package_root / "en-lexicon.txt"
    if not spelling_path.exists() or not lexicon_path.exists():
        raise SystemExit("TextBlob English dictionary source files were not found")

    counts = parse_spelling_counts(spelling_path)
    lexicon = parse_lexicon(lexicon_path)
    blocked = parse_family_blocklist()

    words: set[str] = set()

    # Literary spelling corpus: useful breadth and inflected forms.
    for word, count in counts.items():
        if count >= 1 and is_allowed_word(word, blocked, lexicon):
            words.add(word)

    # Modern frequency corpus: fills common gaps in the older book-derived source.
    for entry in top_n_list("en", WORDFREQ_LIMIT):
        word = entry.lower()
        if is_allowed_word(word, blocked, lexicon):
            words.add(word)

    words.update(word for word in FORCED_WORDS if word not in blocked)
    inflections_added = add_common_inflections(words, blocked, lexicon, zipf_frequency)

    missing_regressions = sorted(FORCED_WORDS - words)
    if missing_regressions:
        raise SystemExit(f"Required regression words are missing: {missing_regressions}")

    ordered_words = sorted(words)
    word_data = wrap_words(ordered_words)

    output = f"""'use strict';

// AUTO-GENERATED by scripts/build_dictionary.py. Do not edit this word data by hand.
// Sources: TextBlob {TEXTBLOB_VERSION} English corpus + wordfreq {WORDFREQ_VERSION}
// top {WORDFREQ_LIMIT:,} English terms + frequency-checked regular inflections.
// Proper-noun and family filters are applied before bundling.
(() => {{
  const bundledWords = `
{word_data}
`.trim().split(/\\s+/);

  let added = 0;
  for (const word of bundledWords) {{
    if (word.length >= 3 && isFamilySafe(word) && !dictionary.has(word)) {{
      dictionary.add(word);
      added += 1;
    }}
  }}

  if (added && typeof markDictionaryUpdated === 'function') markDictionaryUpdated();
  window.WORDBURST_DICTIONARY_SIZE = dictionary.size;
}})();
"""
    OUTPUT_FILE.write_text(output, encoding="utf-8")
    print(
        f"Wrote {len(ordered_words):,} bundled words to {OUTPUT_FILE.name} "
        f"({inflections_added:,} generated common inflections)"
    )


if __name__ == "__main__":
    main()
