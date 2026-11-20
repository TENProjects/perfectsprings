# Asset provenance

The original logo from `images/logo.png` is losslessly encoded to `assets/brand/logo.webp`. Original packaging artwork is retained in `images/`. Catalogue variants are resized and encoded with cwebp quality 83 to `assets/products/`. Water uses the original transparent `noBackground.png`. Packaging designs and labels have not been regenerated.

Two supporting images were generated with the built-in image generation tool on 19 November 2026. They contain no branded packaging. Source PNGs remain beside optimized WebP versions, but are excluded from deployment. They are campaign illustrations, not real customer or factory photographs.

## Water splash

Files: `campaign/water-splash-original.png`, `campaign/water-splash.webp`.

Prompt: Use case: ads-marketing. Asset type: beverage website hero background, landscape 3:2 composition. Create a premium photorealistic studio campaign background for Perfect Springs, a Nigerian beverage brand whose visual identity is teal #16877f, deep teal #084c46 and soft aqua. A sculptural clear-water splash forms a loose sweeping arc across the center and right, with luminous real water droplets, clear ice cubes resting near the bottom, a pale mint studio backdrop, a soft teal curved pedestal at the bottom. Keep center area relatively open because original branded water bottles will be layered on top in HTML. Crisp sunlight from upper left, gorgeous caustic shadows, high-end beverage photography, refreshing, youthful and elegant. No products, no bottles, no cans, no logos, no text, no lettering, no people, no watermark. Wide horizontal composition, entire scene contained with generous breathing space.

## Gathering

Files: `campaign/gathering-original.png`, `campaign/gathering.webp`, `campaign/gathering-small.webp`.

Prompt: Use case: photorealistic-natural. Asset type: wide lifestyle campaign photograph for a colourful Nigerian beverage website. Editorial sunny afternoon close-up of an outdoor table prepared for a gathering, natural woven mat, a deep teal linen tablecloth draped at one corner, two clear drinking glasses one with mango-orange juice and ice and one with strawberry-red fruit drink and ice, a small clear glass of water, sliced ripe mango and halved fresh strawberries on a simple cream ceramic plate. Human warmth suggested by softly blurred Black adult friends socializing in distant background without recognizable faces. Beautiful warm Nigerian tropical daylight and dappled leaf shadows, joyful tasteful composition, realistic textured fruit, premium commercial photography with soft film grain. Colour palette teal, mango yellow, guava pink and off-white. Drinks and fruit are supporting lifestyle imagery, no packaging, no bottles, no logos, no text or watermark. Landscape 3:2 photograph, strong image composition suitable for a full-width website banner.

## Individual product campaign cards — 19 November 2026

Every catalogue variant has a separate, AI-generated campaign illustration in `campaign/products/<variant>.webp`. These are hover/focus marketing scenes, based on the corresponding original packshot in `assets/products/`; the original packshots and company logo remain unchanged. Generated packaging is a visual interpretation and should be reviewed against the final production artwork before public launch. Flavour props communicate the named flavour and do not establish ingredients or nutritional properties. No sale, pricing, health, origin or certification statements were added.

The generator was instructed to preserve the supplied product shape, cap, label artwork, colours, logo spelling and visible text; feature a large angled product in a portrait 3:4 commercial photograph; include condensation and studio lighting; leave the bottom area quiet for the real HTML exploration link; and avoid additional lettering, sale badges, health claims, people, other brands and arch shapes. Each supplied reference was the matching original catalogue WebP. The source result is retained as `<variant>-original.png` and omitted from deployment. WebPs are 600px wide, quality 80, lazy-loaded and dimensioned 600×800 in the interface.

| Variant | Art direction |
| --- | --- |
| water | Original three-bottle arrangement, aqua/teal, clear water and ice |
| mango | Golden mango halves and cubes, leaves, yellow sunlight |
| strawberry | Pink/red strawberries, white blossoms, ice |
| guava | Pink guava halves, lime-green backdrop and leaves |
| orange | Orange slices and curling peel, orange/cream light |
| apple | Green apples, slices and fresh green lighting |
| grape | Grapes and vine leaves against lavender |
| peach | Peach halves and slices against warm coral |
| pineapple | Pineapple wedges, rings and leaves against golden yellow |
| passion-fruit | Passion fruit halves, tropical leaves, lilac/gold |
| springles-orange | Orange slices, citrus peel and fizzy ice |
| springles-cola | Dark cola splash, ice, caramel/cream backdrop |
| springles-lemon | Lemon slices, peel, lime/yellow backdrop |
| springles-tropical | Golden splash, tropical leaves, gold/pink backdrop |
| dna-original | Yellow/red angular studio props and ice |
| dna-yardie | Green/red/yellow studio shards and ice |
| dna-vanilla | Vanilla flowers, pods and cream/gold ribbons |
| dna-fusion | Electric blue/coral translucent shards and ice |
| row | Teal/gold angular studio shapes and ice |

The collection's real action is “Explore this drink”, leading to its corresponding detail page. It is available by pointer hover and keyboard focus; touch devices retain a visible exploration link.
