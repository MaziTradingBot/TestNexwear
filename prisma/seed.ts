/**
 * NexWear database seed.
 * Generates a realistic luxury-fashion catalog:
 *   - 20 brands, full category tree
 *   - 100 men's + 100 women's + 50 shoes products with size/color variants
 *   - homepage banners, coupons, shipping rates for 16 countries
 *   - a demo admin + customer
 *
 * Run: npm run db:seed   (after `prisma migrate dev`)
 */
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ----------------------------- helpers ----------------------------- */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Curated Unsplash fashion photo IDs grouped by theme. We append sizing params.
const PHOTOS: Record<string, string[]> = {
  menTops: [
    "1521572163474-6864f9cf17ab", "1620012253295-c15cc3e65df4", "1602810318383-e386cc2a3ccf",
    "1593030761757-71fae45fa0e7", "1622445275576-721325763afe", "1516257984-b1b4d707412e",
  ],
  menOuter: [
    "1551028719-00167b16eac5", "1544022613-e87ca75a784a", "1591047139829-d91aecb6caea",
    "1539533018447-63fcce2678e3", "1607345366928-199ea26cfe3e",
  ],
  menBottoms: [
    "1473966968600-fa801b869a1a", "1542272604-787c3835535d", "1624378439575-d8705ad7ae80",
    "1565084888279-aca607ecce0c",
  ],
  womenDresses: [
    "1595777457583-95e059d581b8", "1572804013309-59a88b7e92f1", "1539008835657-9e8e9680c956",
    "1566174053879-31528523f8ae", "1515372039744-b8f02a3ae446", "1502716119720-b23a93e5fe1b",
  ],
  womenTops: [
    "1564584217132-2271feaeb3c5", "1551163943-3f6a855d1153", "1485462537746-965f33f7f6a7",
    "1525507119028-ed4c629a60a3", "1485968579580-b6d095142e6e",
  ],
  womenOuter: [
    "1591047139829-d91aecb6caea", "1548624313-0396c75f8f1d", "1434389677669-e08b4cac3105",
    "1483985988355-763728e1935b",
  ],
  bags: [
    "1584917865442-de89df76afd3", "1591561954557-26941169b49e", "1548036328-c9fa89d128fa",
    "1559563458-527698bf5295",
  ],
  sneakers: [
    "1542291026-7eec264c27ff", "1600185365926-3a2ce3cdb9eb", "1595950653106-6c9ebd614d3a",
    "1606107557195-0e29a4b5b4aa", "1608231387042-66d1773070a5",
  ],
  boots: [
    "1520639888713-7851133b1ed0", "1605812860427-4024433a70fd", "1542838132-92c53300491e",
  ],
  formalShoes: [
    "1614252369475-531eba835eb1", "1449505278894-297fdb3edbc1", "1533867617858-e7b97e060509",
  ],
  accessories: [
    "1523275335684-37898b6baf30", "1611085583191-a3b181a88401", "1572635196237-14b3f281503f",
    "1508296695146-257a814070b4",
  ],
};

function img(ids: string[], i: number): string {
  const id = pick(ids, i);
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;
}

/* ----------------------------- data ----------------------------- */

const BRANDS = [
  { name: "Maison Noir", premium: true },
  { name: "Atelier Vance", premium: true },
  { name: "Lumière", premium: true },
  { name: "Vestré", premium: true },
  { name: "Côte Royale", premium: true },
  { name: "Mono Studio", premium: false },
  { name: "Nordström Edit", premium: false },
  { name: "Halcyon", premium: true },
  { name: "Saint Avenue", premium: true },
  { name: "Onyx & Ash", premium: false },
  { name: "Verano", premium: false },
  { name: "Belle Époque", premium: true },
  { name: "Kintsugi", premium: false },
  { name: "Marlowe", premium: false },
  { name: "Aurelia", premium: true },
  { name: "Tessuto", premium: false },
  { name: "Forme & Co", premium: false },
  { name: "Cendre", premium: false },
  { name: "Liv Atelier", premium: true },
  { name: "Northbound", premium: false },
];

// department -> [categoryName, photoKey, [sizes], [productNameWords]]
const MEN_CATEGORIES: [string, keyof typeof PHOTOS, string[]][] = [
  ["T-Shirts", "menTops", ["XS", "S", "M", "L", "XL"]],
  ["Shirts", "menTops", ["S", "M", "L", "XL"]],
  ["Hoodies", "menTops", ["S", "M", "L", "XL"]],
  ["Jackets", "menOuter", ["S", "M", "L", "XL"]],
  ["Jeans", "menBottoms", ["30", "32", "34", "36"]],
  ["Trousers", "menBottoms", ["30", "32", "34", "36"]],
  ["Shorts", "menBottoms", ["S", "M", "L", "XL"]],
];

const WOMEN_CATEGORIES: [string, keyof typeof PHOTOS, string[]][] = [
  ["Dresses", "womenDresses", ["XS", "S", "M", "L"]],
  ["Tops", "womenTops", ["XS", "S", "M", "L"]],
  ["Jackets", "womenOuter", ["XS", "S", "M", "L"]],
  ["Skirts", "womenDresses", ["XS", "S", "M", "L"]],
  ["Jeans", "menBottoms", ["24", "26", "28", "30"]],
  ["Handbags", "bags", ["ONE SIZE"]],
];

const SHOE_CATEGORIES: [string, keyof typeof PHOTOS, string[]][] = [
  ["Sneakers", "sneakers", ["39", "40", "41", "42", "43", "44"]],
  ["Boots", "boots", ["39", "40", "41", "42", "43", "44"]],
  ["Formal Shoes", "formalShoes", ["40", "41", "42", "43", "44"]],
  ["Running Shoes", "sneakers", ["40", "41", "42", "43", "44"]],
  ["Sandals", "formalShoes", ["38", "39", "40", "41", "42"]],
];

const COLORS: [string, string][] = [
  ["Black", "#111111"], ["Ivory", "#F2EFE8"], ["Camel", "#C19A6B"],
  ["Charcoal", "#36454F"], ["Stone", "#A8A29E"], ["Navy", "#1F2A44"],
  ["Olive", "#5B6236"], ["Burgundy", "#5B1A26"], ["Sand", "#D8C3A5"],
  ["Slate", "#5D6770"],
];

const ADJECTIVES = [
  "Tailored", "Relaxed", "Structured", "Heritage", "Essential", "Signature",
  "Modern", "Classic", "Oversized", "Slim", "Pleated", "Cropped", "Draped",
  "Ribbed", "Brushed", "Quilted", "Linen-Blend", "Silk-Touch", "Merino",
];

const NOUNS_BY_CAT: Record<string, string[]> = {
  "T-Shirts": ["Cotton Tee", "Crewneck", "Pocket Tee", "Boxy Tee"],
  Shirts: ["Oxford Shirt", "Linen Shirt", "Camp Collar Shirt", "Poplin Shirt"],
  Hoodies: ["Hoodie", "Zip Hoodie", "Pullover Hoodie"],
  Jackets: ["Bomber Jacket", "Overshirt", "Field Jacket", "Blazer"],
  Jeans: ["Denim", "Selvedge Jeans", "Tapered Jeans"],
  Trousers: ["Trousers", "Chinos", "Wool Trousers"],
  Shorts: ["Shorts", "Tailored Shorts", "Cargo Shorts"],
  Dresses: ["Midi Dress", "Slip Dress", "Wrap Dress", "Maxi Dress"],
  Tops: ["Blouse", "Knit Top", "Cami", "Silk Top"],
  Skirts: ["Pleated Skirt", "Midi Skirt", "Pencil Skirt"],
  Handbags: ["Tote Bag", "Shoulder Bag", "Crossbody Bag", "Mini Bag"],
  Sneakers: ["Low-Top Sneaker", "Runner", "Court Sneaker"],
  Boots: ["Chelsea Boot", "Lace-Up Boot", "Ankle Boot"],
  "Formal Shoes": ["Derby", "Loafer", "Oxford"],
  "Running Shoes": ["Performance Runner", "Trail Runner", "Speed Trainer"],
  Sandals: ["Slide", "Strap Sandal", "Espadrille"],
};

/* ----------------------------- main ----------------------------- */

async function main() {
  console.log("🌱 Seeding NexWear…");

  // Wipe (order matters for FKs)
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productRelation.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.shippingRate.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.address.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Brands
  const brands = await Promise.all(
    BRANDS.map((b) =>
      prisma.brand.create({
        data: {
          name: b.name,
          slug: slugify(b.name),
          isPremium: b.premium,
          logoUrl: null,
          description: `${b.name} crafts considered, enduring pieces with a focus on premium materials and timeless silhouettes.`,
          heroImage: img(PHOTOS.womenDresses, BRANDS.indexOf(b)),
        },
      }),
    ),
  );
  console.log(`  ✓ ${brands.length} brands`);

  // Categories
  async function makeCategories(
    department: string,
    defs: [string, keyof typeof PHOTOS, string[]][],
    extra: [string, keyof typeof PHOTOS][] = [],
  ) {
    const cats = [];
    for (const [name, photoKey] of defs) {
      cats.push(
        await prisma.category.create({
          data: {
            name,
            slug: slugify(`${department}-${name}`),
            department,
            imageUrl: img(PHOTOS[photoKey], cats.length),
          },
        }),
      );
    }
    for (const [name, photoKey] of extra) {
      await prisma.category.create({
        data: {
          name,
          slug: slugify(`${department}-${name}`),
          department,
          imageUrl: img(PHOTOS[photoKey], 0),
        },
      });
    }
    return cats;
  }

  const menCats = await makeCategories("men", MEN_CATEGORIES, [
    ["Shoes", "sneakers"], ["Accessories", "accessories"],
  ]);
  const womenCats = await makeCategories("women", WOMEN_CATEGORIES, [
    ["Shoes", "sneakers"], ["Accessories", "accessories"],
  ]);
  const shoeCats = await makeCategories("shoes", SHOE_CATEGORIES);
  // Accessories department (handbags/jewelry etc.)
  await makeCategories("accessories", [], [
    ["Bags", "bags"], ["Jewelry", "accessories"], ["Sunglasses", "accessories"],
  ]);
  console.log(`  ✓ categories created`);

  // Products
  let productCount = 0;
  const allProductIds: string[] = [];

  async function makeProducts(
    department: string,
    cats: { id: string; name: string }[],
    catDefs: [string, keyof typeof PHOTOS, string[]][],
    count: number,
  ) {
    for (let i = 0; i < count; i++) {
      const catIndex = i % cats.length;
      const cat = cats[catIndex];
      const [catName, photoKey, sizes] = catDefs[catIndex];
      const brand = pick(brands, i + catIndex);
      const adj = pick(ADJECTIVES, i);
      const noun = pick(NOUNS_BY_CAT[catName] ?? ["Piece"], i);
      const title = `${adj} ${noun}`;
      const baseSlug = slugify(`${brand.name}-${title}`);
      const slug = `${baseSlug}-${department}-${i}`;
      const sku = `NX-${department.slice(0, 2).toUpperCase()}-${String(productCount + 1).padStart(4, "0")}`;

      const price = round2(rand(39, 320) + 0.0);
      const onSale = i % 3 === 0; // ~33% on sale
      const discountPrice = onSale ? round2(price * (rand(60, 85) / 100)) : null;
      const popularity = rand(0, 1000);
      const rating = round2(rand(38, 50) / 10);
      const reviewCount = rand(0, 240);

      // images: 3 per product
      const images = [0, 1, 2].map((n) => ({
        url: img(PHOTOS[photoKey], i + n),
        altText: title,
        position: n,
      }));

      // variants: 2-3 colors x sizes
      const colorCount = catName === "Handbags" ? 2 : 3;
      const variants: Prisma.ProductVariantCreateWithoutProductInput[] = [];
      for (let c = 0; c < colorCount; c++) {
        const [colorName, colorHex] = pick(COLORS, i + c);
        for (const size of sizes) {
          variants.push({
            sku: `${sku}-${slugify(colorName)}-${slugify(size)}`,
            size,
            color: colorName,
            colorHex,
            stock: rand(0, 40),
          });
        }
      }

      const product = await prisma.product.create({
        data: {
          slug,
          sku,
          title,
          description: `The ${title.toLowerCase()} from ${brand.name}. Cut from premium ${pick(["organic cotton", "Italian wool", "French linen", "brushed twill", "supple leather"], i)} for a refined drape and lasting comfort. A versatile staple designed to elevate every wardrobe.`,
          brandId: brand.id,
          categoryId: cat.id,
          department,
          material: pick(["Cotton", "Wool", "Linen", "Leather", "Cotton Blend", "Recycled Polyester"], i),
          collection: onSale ? "Summer 2026" : pick(["Premium", "Essentials", "Summer 2026", "Heritage"], i),
          price: new Prisma.Decimal(price),
          discountPrice: discountPrice ? new Prisma.Decimal(discountPrice) : null,
          isFeatured: i % 7 === 0,
          isNewArrival: i % 5 === 0,
          rating: new Prisma.Decimal(rating),
          reviewCount,
          popularity,
          images: { create: images },
          variants: { create: variants },
        },
      });
      allProductIds.push(product.id);
      productCount++;
    }
  }

  await makeProducts("men", menCats, MEN_CATEGORIES, 100);
  await makeProducts("women", womenCats, WOMEN_CATEGORIES, 100);
  await makeProducts("shoes", shoeCats, SHOE_CATEGORIES, 50);
  console.log(`  ✓ ${productCount} products`);

  // Banners
  await prisma.banner.createMany({
    data: [
      {
        eyebrow: "Summer Sale",
        title: "Up To 50% Off",
        subtitle: "The season's most-wanted pieces, now reduced.",
        ctaLabel: "Shop Sale",
        ctaHref: "/sale",
        imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80",
        position: 0,
      },
      {
        eyebrow: "New Season",
        title: "The Summer Edit",
        subtitle: "Effortless dressing, considered tailoring.",
        ctaLabel: "Shop Women",
        ctaHref: "/women",
        imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80",
        position: 1,
      },
      {
        eyebrow: "Menswear",
        title: "Modern Essentials",
        subtitle: "Refined staples built to last.",
        ctaLabel: "Shop Men",
        ctaHref: "/men",
        imageUrl: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=2000&q=80",
        position: 2,
      },
    ],
  });
  console.log("  ✓ banners");

  // Coupons
  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", type: "PERCENT", value: new Prisma.Decimal(10), minSpend: new Prisma.Decimal(0) },
      { code: "SUMMER50", type: "PERCENT", value: new Prisma.Decimal(50), minSpend: new Prisma.Decimal(150) },
      { code: "NEX25", type: "FIXED", value: new Prisma.Decimal(25), minSpend: new Prisma.Decimal(120) },
    ],
  });
  console.log("  ✓ coupons");

  // Shipping rates for 16 supported countries
  const COUNTRIES = [
    "United States", "Canada", "United Kingdom", "Germany", "France", "Italy",
    "Spain", "Netherlands", "Poland", "Ukraine", "Belgium", "Austria",
    "Sweden", "Norway", "Denmark", "Switzerland",
  ];
  for (const country of COUNTRIES) {
    await prisma.shippingRate.create({
      data: { country, method: "STANDARD", price: new Prisma.Decimal(rand(0, 12)), etaDaysMin: 5, etaDaysMax: 10 },
    });
    await prisma.shippingRate.create({
      data: { country, method: "EXPRESS", price: new Prisma.Decimal(rand(15, 30)), etaDaysMin: 1, etaDaysMax: 3 },
    });
  }
  console.log(`  ✓ shipping rates for ${COUNTRIES.length} countries`);

  // Demo users
  const adminPass = await bcrypt.hash("Admin123!", 10);
  const custPass = await bcrypt.hash("Customer123!", 10);
  await prisma.user.create({
    data: { name: "NexWear Admin", email: "admin@nexwear.com", passwordHash: adminPass, role: "ADMIN" },
  });
  await prisma.user.create({
    data: { name: "Ava Customer", email: "customer@nexwear.com", passwordHash: custPass, role: "CUSTOMER", loyaltyPoints: 320 },
  });
  console.log("  ✓ demo users (admin@nexwear.com / Admin123!, customer@nexwear.com / Customer123!)");

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
