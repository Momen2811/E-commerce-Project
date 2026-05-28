const img = (slug, n) => `https://picsum.photos/seed/${slug}-${n}/600/750`
const images = (slug) => [img(slug, 1), img(slug, 2), img(slug, 3)]

export const products = [
  {
    id: 'p-001', name: 'Boxy Logo Tee', slug: 'boxy-logo-tee', audience: 'unisex', type: 'tops',
    price: 48, compareAtPrice: null, description: 'Heavyweight cotton tee with a boxy fit and a tonal chest logo.',
    material: '100% organic cotton', images: images('boxy-logo-tee'),
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Bone', hex: '#e8e2d6' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.6, reviewCount: 42, isNew: true, isFeatured: true, inStock: true, createdAt: '2026-05-10',
  },
  {
    id: 'p-002', name: 'Heavyweight Hoodie', slug: 'heavyweight-hoodie', audience: 'unisex', type: 'tops',
    price: 95, compareAtPrice: null, description: 'A 450gsm fleece hoodie with a double-lined hood and kangaroo pocket.',
    material: '80% cotton, 20% polyester', images: images('heavyweight-hoodie'),
    colors: [{ name: 'Charcoal', hex: '#3a3a3a' }, { name: 'Orange', hex: '#e8742f' }],
    sizes: ['S', 'M', 'L', 'XL'], rating: 4.8, reviewCount: 67, isNew: false, isFeatured: true, inStock: true, createdAt: '2026-03-02',
  },
  {
    id: 'p-003', name: 'Oversized Denim Jacket', slug: 'oversized-denim-jacket', audience: 'unisex', type: 'outerwear',
    price: 140, compareAtPrice: 180, description: 'Rigid selvedge denim jacket with a dropped shoulder and boxy silhouette.',
    material: '100% cotton denim', images: images('oversized-denim-jacket'),
    colors: [{ name: 'Indigo', hex: '#2b3a55' }], sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.4, reviewCount: 19, isNew: false, isFeatured: true, inStock: true, createdAt: '2026-02-18',
  },
  {
    id: 'p-004', name: 'Tactical Cargo Pants', slug: 'tactical-cargo-pants', audience: 'men', type: 'bottoms',
    price: 110, compareAtPrice: null, description: 'Relaxed cargo pants with bellowed pockets and an adjustable hem.',
    material: '98% cotton, 2% elastane', images: images('tactical-cargo-pants'),
    colors: [{ name: 'Olive', hex: '#5b5d3a' }, { name: 'Black', hex: '#0a0a0a' }],
    sizes: ['28', '30', '32', '34', '36'], rating: 4.3, reviewCount: 28, isNew: true, isFeatured: false, inStock: true, createdAt: '2026-05-05',
  },
  {
    id: 'p-005', name: 'Pleated Midi Skirt', slug: 'pleated-midi-skirt', audience: 'women', type: 'bottoms',
    price: 85, compareAtPrice: null, description: 'A fluid pleated midi skirt with an elasticated waist.',
    material: '100% recycled polyester', images: images('pleated-midi-skirt'),
    colors: [{ name: 'Sand', hex: '#cbb79a' }, { name: 'Black', hex: '#0a0a0a' }],
    sizes: ['XS', 'S', 'M', 'L'], rating: 4.7, reviewCount: 33, isNew: false, isFeatured: false, inStock: true, createdAt: '2026-04-01',
  },
  {
    id: 'p-006', name: 'Bias Slip Dress', slug: 'bias-slip-dress', audience: 'women', type: 'dresses',
    price: 120, compareAtPrice: null, description: 'A bias-cut satin slip dress with adjustable straps.',
    material: '100% satin-finish viscose', images: images('bias-slip-dress'),
    colors: [{ name: 'Champagne', hex: '#e6d3b3' }, { name: 'Black', hex: '#0a0a0a' }],
    sizes: ['XS', 'S', 'M', 'L'], rating: 4.9, reviewCount: 51, isNew: true, isFeatured: true, inStock: true, createdAt: '2026-05-12',
  },
  {
    id: 'p-007', name: 'Ribbed Knit Top', slug: 'ribbed-knit-top', audience: 'women', type: 'tops',
    price: 60, compareAtPrice: null, description: 'A second-skin ribbed knit top with a high neck.',
    material: '92% viscose, 8% elastane', images: images('ribbed-knit-top'),
    colors: [{ name: 'Bone', hex: '#e8e2d6' }, { name: 'Rust', hex: '#a8462a' }],
    sizes: ['XS', 'S', 'M', 'L'], rating: 4.2, reviewCount: 14, isNew: false, isFeatured: false, inStock: true, createdAt: '2026-03-20',
  },
  {
    id: 'p-008', name: 'Nylon Track Jacket', slug: 'nylon-track-jacket', audience: 'men', type: 'outerwear',
    price: 130, compareAtPrice: null, description: 'A glossy nylon track jacket with contrast piping and a stand collar.',
    material: '100% nylon', images: images('nylon-track-jacket'),
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Orange', hex: '#e8742f' }],
    sizes: ['S', 'M', 'L', 'XL'], rating: 4.5, reviewCount: 22, isNew: true, isFeatured: false, inStock: true, createdAt: '2026-05-08',
  },
  {
    id: 'p-009', name: 'Canvas High-Tops', slug: 'canvas-high-tops', audience: 'unisex', type: 'shoes',
    price: 90, compareAtPrice: null, description: 'Vulcanised canvas high-top sneakers with a gum sole.',
    material: 'Canvas upper, rubber sole', images: images('canvas-high-tops'),
    colors: [{ name: 'Off-White', hex: '#f2f2ef' }, { name: 'Black', hex: '#0a0a0a' }],
    sizes: ['7', '8', '9', '10', '11', '12'], rating: 4.6, reviewCount: 38, isNew: false, isFeatured: true, inStock: true, createdAt: '2026-02-25',
  },
  {
    id: 'p-010', name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag', audience: 'women', type: 'accessories',
    price: 75, compareAtPrice: 95, description: 'A compact leather crossbody with an adjustable webbing strap.',
    material: 'Full-grain leather', images: images('leather-crossbody-bag'),
    colors: [{ name: 'Tan', hex: '#b07a47' }, { name: 'Black', hex: '#0a0a0a' }],
    sizes: ['OS'], rating: 4.7, reviewCount: 29, isNew: false, isFeatured: false, inStock: true, createdAt: '2026-04-15',
  },
  {
    id: 'p-011', name: 'Ribbed Beanie', slug: 'ribbed-beanie', audience: 'unisex', type: 'accessories',
    price: 30, compareAtPrice: null, description: 'A chunky ribbed beanie in soft merino wool.',
    material: '100% merino wool', images: images('ribbed-beanie'),
    colors: [{ name: 'Charcoal', hex: '#3a3a3a' }, { name: 'Orange', hex: '#e8742f' }, { name: 'Bone', hex: '#e8e2d6' }],
    sizes: ['OS'], rating: 4.4, reviewCount: 17, isNew: false, isFeatured: false, inStock: false, createdAt: '2026-01-30',
  },
  {
    id: 'p-012', name: 'Wide-Leg Trousers', slug: 'wide-leg-trousers', audience: 'women', type: 'bottoms',
    price: 98, compareAtPrice: null, description: 'High-waisted wide-leg trousers with a pressed crease.',
    material: '64% polyester, 34% viscose, 2% elastane', images: images('wide-leg-trousers'),
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Camel', hex: '#c19a6b' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.5, reviewCount: 24, isNew: true, isFeatured: false, inStock: true, createdAt: '2026-05-14',
  },
]
