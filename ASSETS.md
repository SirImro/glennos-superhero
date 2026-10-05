# Artwork and font credits

This is a noncommercial, fan-made educational project. It is not affiliated with or endorsed by Marvel, DC, or the character rights holders. Character artwork remains the property of its respective rights holders; availability in a public repository does not grant rights to commercial reuse.

## Portraits

- Source catalog: https://akabab.github.io/superhero-api/api/all.json
- Image repository: https://github.com/akabab/superhero-api
- Pinned image release: https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/
- Original image provider credited by that project: https://www.superherodb.com/

The 20 featured portraits are stored in `public/images/heroes/` by SuperHero API ID. This keeps all featured artwork available without relying on the original host's hotlink permissions. `src/hero-images.json` contains only ID-to-filename mappings for the source catalog's available portraits, not substitute character data.

Characters absent from the portrait catalog still try the official API image URL. If every source fails, an accessible classified-identity illustration is shown. The project does not invent a photo for missing source artwork.

## Font

Barlow Condensed by Jeremy Tribby, distributed locally by `@fontsource/barlow-condensed` under the SIL Open Font License. The package includes its license. There are no Google Fonts network requests.

## Visual treatment

Original fan-site layout inspired by comic-book covers: red/black colors, condensed headlines, layered portrait panels, clipped card corners, halftone texture, hover zoom, and staggered entrances. No official Marvel logo or site assets are used.

Animations honor `prefers-reduced-motion`. Character information remains on superheroapi.com; the secondary source is artwork only.
