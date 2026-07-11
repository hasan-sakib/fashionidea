"""Curated vocabularies for categorizing designs.

Occasions and dress-type categories power the public site's occasion-first
discovery. Designers pick from these when publishing a design; the same lists
drive the public filters. Values are free-entry tolerant, but these are the
canonical options shown in the UI (mirror in frontend ``src/lib/vocab.ts``).
"""

OCCASIONS: list[str] = [
    "Wedding",
    "Party",
    "Formal",
    "Office",
    "Casual",
    "Festival",
    "Vacation",
    "Everyday",
]

CATEGORIES: list[str] = [
    "Gown",
    "Dress",
    "Suit",
    "Saree",
    "Streetwear",
    "Outerwear",
    "Ethnic",
    "Accessories",
]
