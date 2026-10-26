/**
 * Products on every office's shop page. The buy link is that item's page on
 * the online store. These six are nonsense stand-ins, and the links point at
 * example.com until a real store URL is ready.
 */

export interface Product {
  name: string;
  description: string;
  /** Display price, including the dollar sign. */
  price: string;
  /** Public path under /assets/img/shop/. */
  image: string;
  /** This product on the online store. */
  href: string;
}

export const products: Product[] = [
  {
    name: 'Moonbark Tincture',
    description:
      'A dropper of pale silver and oak bark, for evenings when the chairs have started a committee.',
    price: '$28',
    image: '/assets/img/shop/moonbark-tincture.jpg',
    href: 'https://example.com/store/moonbark-tincture',
  },
  {
    name: 'Glimmer Kelp Capsules',
    description: 'Deep green capsules that claim to remember the tide. One for a day that needs a shoreline.',
    price: '$22',
    image: '/assets/img/shop/glimmer-kelp.jpg',
    href: 'https://example.com/store/glimmer-kelp',
  },
  {
    name: 'Whispered Chamomile Lozenges',
    description: 'Soft gold lozenges that prefer you do not introduce yourself. Chamomile is the only witness.',
    price: '$16',
    image: '/assets/img/shop/whispered-chamomile.jpg',
    href: 'https://example.com/store/whispered-chamomile',
  },
  {
    name: 'Beetroot Comet Powder',
    description: 'Magenta powder with a mica wink, stirred into oatmeal until the bowl looks ambitious.',
    price: '$34',
    image: '/assets/img/shop/beetroot-comet.jpg',
    href: 'https://example.com/store/beetroot-comet',
  },
  {
    name: 'Fern Pollen Gummies',
    description: 'Fern-shaped gummies that taste like a greenhouse after rain and a secret you already knew.',
    price: '$19',
    image: '/assets/img/shop/fern-pollen.jpg',
    href: 'https://example.com/store/fern-pollen',
  },
  {
    name: 'Riverstone Mist',
    description: 'A sage-green spray that smells like stones that have been in the river longer than the river has.',
    price: '$26',
    image: '/assets/img/shop/riverstone-mist.jpg',
    href: 'https://example.com/store/riverstone-mist',
  },
];
