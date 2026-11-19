// Product identities and flavours taken from the original catalogue and packaging.
// Ingredient, nutrition, size and certification claims require business approval.
export const products = [
  { id: 'water', category: 'water', name: 'Perfect Springs', type: 'Bottled water', colour: '#d7efeb', tag: 'Your everyday refresh', description: 'A refreshing companion for the everyday. Meet Perfect Springs bottled water.', flavours: [{ id: 'water', name: 'Bottled water', note: 'Keep a little refreshment close.' }] },
  { id: 'cast', category: 'juices', name: 'Cast Natural', type: 'Fruit juices', colour: '#ffe4a1', tag: 'Find your fruity side', description: 'From familiar favourites to tropical flavours. Explore the colourful world of Cast Natural.', flavours: [
    { id: 'mango', name: 'Mango', note: 'A little sunshine. A whole lot of mango.', colour: '#ffe4a1' },
    { id: 'strawberry', name: 'Strawberry', note: 'Make room for your strawberry moment.', colour: '#f6c2c8' },
    { id: 'guava', name: 'Guava', note: 'Take your taste buds somewhere tropical.', colour: '#e1edbd' },
    { id: 'orange', name: 'Orange', note: 'Bring a brighter flavour to your day.', colour: '#ffd2a0' },
    { id: 'apple', name: 'Apple', note: 'An everyday favourite, your way.', colour: '#dbe7b8' },
    { id: 'grape', name: 'Grape', note: 'A grape escape from the ordinary.', colour: '#e1cbe8' },
    { id: 'peach', name: 'Peach', note: 'Find your peach-perfect moment.', colour: '#ffdbbd' },
    { id: 'pineapple', name: 'Pineapple', note: 'A tropical change of scene.', colour: '#f4e9ad' },
    { id: 'passion-fruit', name: 'Passion Fruit', note: 'Put a little passion in your day.', colour: '#ebd4b5' }
  ] },
  { id: 'springles', category: 'flavoured', name: 'Springles', type: 'Flavoured drinks', colour: '#f9c9a2', tag: 'Good times, great flavour', description: 'Bring some colour to the table with the Springles flavoured drinks collection.', flavours: [
    { id: 'springles-orange', name: 'Orange', note: 'Bring on the orange moments.', colour: '#f9c9a2' },
    { id: 'springles-cola', name: 'Cola', note: 'A familiar favourite for your get-togethers.', colour: '#e6cfc3' },
    { id: 'springles-lemon', name: 'Lemon', note: 'A bright addition to the occasion.', colour: '#e4eab2' },
    { id: 'springles-tropical', name: 'Tropical', note: 'Take the tropical route.', colour: '#f2d99a' }
  ] },
  { id: 'dna', category: 'energy', name: 'DNA Go', type: 'Energy drinks', colour: '#e6e9c2', tag: 'Make your next move', description: 'Meet the DNA Go collection. Discover Original, Yardie, Vanilla Blast and Fusion.', flavours: [
    { id: 'dna-original', name: 'Original', note: 'Discover the original DNA Go.' },
    { id: 'dna-yardie', name: 'Yardie', note: 'A different side of DNA Go.' },
    { id: 'dna-vanilla', name: 'Vanilla Blast', note: 'Explore Vanilla Blast.' },
    { id: 'dna-fusion', name: 'Fusion', note: 'Find your Fusion moment.' }
  ] },
  { id: 'row', category: 'energy', name: 'ROW', type: 'Energy drink', colour: '#c6dfd7', tag: 'Meet your next adventure', description: 'Get to know ROW, part of the Perfect Springs energy drinks range.', flavours: [{ id: 'row', name: 'ROW', note: 'A bold addition to the collection.' }] }
];
export const categories = [{id:'all',name:'All drinks'},{id:'water',name:'Water'},{id:'juices',name:'Juices'},{id:'flavoured',name:'Flavoured drinks'},{id:'energy',name:'Energy drinks'}];
export const imagePath = id => `assets/products/${id}.webp`;
export const getProduct = id => products.find(p => p.id === id);
export const getSelection = value => {
  const [productId, flavourId] = String(value || '').split(':');
  const product = getProduct(productId);
  const flavour = product?.flavours.find(f => f.id === flavourId);
  return product && flavour ? { product, flavour, label: `${product.name} — ${flavour.name}` } : null;
};
