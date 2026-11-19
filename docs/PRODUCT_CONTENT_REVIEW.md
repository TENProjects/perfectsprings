# Product content research and owner review

Prepared 19 November 2026 for the private redesign preview. This is an implementation provenance note, not the final company profile requested from the owner.

## Scope

19 detail pages cover every variant in the redesign's identified catalogue: Perfect Springs bottled water; nine Cast Natural flavours (Mango, Strawberry, Guava, Orange, Apple, Grape, Peach, Pineapple, Passion Fruit); four Springles variants (Orange, Cola, Lemon artwork, Tropical); four DNA Go variants (Original, Yardie, Vanilla Blast, Fusion); and ROW.

Pages are generated at `products/<family>-<variant>.html`. Original branding and packaging files are retained. Every Explore card and carousel action opens a real page; the older query-string product explorer remains supported for existing links.

## Evidence

- [Company catalogue](https://perfectspringsllc.com/products.html): first-party names, existing descriptions and variant groupings. Its unsubstantiated health, sourcing and composition claims are not treated as verified specifications.
- [Company profile](https://perfectspringsllc.com/about.html): company context and brand positioning. No founding dates, facilities, capacity or certifications inferred.
- Repository `images/` artwork and filenames: identity and packaging shown. Not evidence of current availability, size, ingredients or current labels.
- Searches for the company together with Cast Natural, DNA Go, Springles and ROW did not identify reliable independent specifications for these particular products. Similar product names in unrelated search results were excluded.
- [UF/IFAS guava reference](https://ask.ifas.ufl.edu/publication/MG045): general variation in guava flavour. This supports distinguishing fruit associations from finished drink composition; no nutrient content transferred to the beverage.
- [UF/IFAS tropical fruit overview](https://edis.ifas.ufl.edu/mg373): background flavour context only, not product evidence.
- [FDA caffeine explainer](https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much): caffeine content varies between products; no standard quantity assigned to DNA Go or ROW.
- [FDA nutrition-label explainer](https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label): product-specific label values must not be replaced with generic fruit nutrition. US guidance is background research, not a statement of Nigerian legal requirements or certification.

## Editorial data

`src/product-details.mjs` holds an original introduction, body, headline, flavour/identity cues, occasion and serving inspiration for each variant. This is owner-review draft copy. Culinary associations describe the named fruit or flavour direction, not a tested finished-drink formulation. The site labels these sections as inspiration and routes ingredient/nutrition requests to the label or business team.

The detail pages contain no invented sizes, prices, quantities, availability status, recipes, juice percentages, sugar levels, caffeine amounts, health benefits, certifications, shelf lives or ratings. Structured data includes verified identity fields only, without offers, reviews or nutrient claims.

## Items for the owner

1. Confirm the complete product family and variant list. The old catalogue also contains generic headings such as Premium Collection and Orange Special Edition and suggested water/ROW variants without sufficiently distinct, verified product identities; these were not expanded into invented SKUs.
2. Resolve Lemon versus Lime: the older website uses Lime in some descriptions; repository artwork is named Springles Lemon. Existing naming/artwork is preserved pending confirmation.
3. Confirm spelling of Cast Natural versus Cast Natura in some legacy filenames.
4. Supply current front/back labels or a signed product sheet per variant: ingredients, allergens, serving size, nutrition, caffeine where applicable, exact flavour name, pack sizes, case quantities, shelf life, storage and approved statements.
5. Approve or revise draft introductions, flavour inspiration and serving suggestions.
6. Confirm market availability, distributor terms, permitted trademarks, approved imagery and sales contact ownership.

When the owner's document arrives, update the catalogue/content data and relevant verified fact sections without changing page URLs. The page template and enquiry links already support the full set of variants.
