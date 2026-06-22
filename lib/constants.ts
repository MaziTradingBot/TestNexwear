export const SITE = {
  name: "NexWear",
  tagline: "Modern Luxury Fashion",
  description:
    "NexWear — premium fashion for men and women. Discover elevated essentials, designer brands, shoes and accessories with worldwide shipping.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export const MAIN_NAV = [
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Shoes", href: "/shoes" },
  { label: "Brands", href: "/brands" },
  { label: "Sale", href: "/sale", accent: true },
];

export const MEGA_MENU: Record<
  string,
  { title: string; links: { label: string; href: string }[] }[]
> = {
  Women: [
    {
      title: "Clothing",
      links: [
        { label: "Dresses", href: "/women?category=women-dresses" },
        { label: "Tops", href: "/women?category=women-tops" },
        { label: "Jackets", href: "/women?category=women-jackets" },
        { label: "Skirts", href: "/women?category=women-skirts" },
        { label: "Jeans", href: "/women?category=women-jeans" },
      ],
    },
    {
      title: "Accessories",
      links: [
        { label: "Handbags", href: "/women?category=women-handbags" },
        { label: "Shoes", href: "/shoes" },
        { label: "View All", href: "/women" },
      ],
    },
  ],
  Men: [
    {
      title: "Clothing",
      links: [
        { label: "T-Shirts", href: "/men?category=men-t-shirts" },
        { label: "Shirts", href: "/men?category=men-shirts" },
        { label: "Hoodies", href: "/men?category=men-hoodies" },
        { label: "Jackets", href: "/men?category=men-jackets" },
        { label: "Jeans", href: "/men?category=men-jeans" },
        { label: "Trousers", href: "/men?category=men-trousers" },
      ],
    },
    {
      title: "More",
      links: [
        { label: "Shorts", href: "/men?category=men-shorts" },
        { label: "Shoes", href: "/shoes" },
        { label: "View All", href: "/men" },
      ],
    },
  ],
  Shoes: [
    {
      title: "Footwear",
      links: [
        { label: "Sneakers", href: "/shoes?category=shoes-sneakers" },
        { label: "Boots", href: "/shoes?category=shoes-boots" },
        { label: "Formal Shoes", href: "/shoes?category=shoes-formal-shoes" },
        { label: "Running Shoes", href: "/shoes?category=shoes-running-shoes" },
        { label: "Sandals", href: "/shoes?category=shoes-sandals" },
      ],
    },
  ],
};

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
  { code: "nl", label: "Nederlands" },
];

export const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Italy",
  "Spain", "Netherlands", "Poland", "Ukraine", "Belgium", "Austria",
  "Sweden", "Norway", "Denmark", "Switzerland",
];

export const DELIVERY_PARTNERS = [
  "Amazon Logistics", "AliExpress Shipping", "Meest Express", "DHL", "FedEx", "UPS",
];

export const PAYMENT_METHODS = [
  { id: "CARD", label: "Credit / Debit Card", hint: "Visa, Mastercard" },
  { id: "APPLE_PAY", label: "Apple Pay", hint: "Pay with Apple Pay" },
  { id: "GOOGLE_PAY", label: "Google Pay", hint: "Pay with Google Pay" },
  { id: "BANK_TRANSFER", label: "Bank Transfer", hint: "Manual bank transfer" },
  { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", hint: "Pay upon goods receipt" },
] as const;

export const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
export const FILTER_COLORS: { name: string; hex: string }[] = [
  { name: "Black", hex: "#111111" },
  { name: "Ivory", hex: "#F2EFE8" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Stone", hex: "#A8A29E" },
  { name: "Navy", hex: "#1F2A44" },
  { name: "Olive", hex: "#5B6236" },
  { name: "Burgundy", hex: "#5B1A26" },
  { name: "Sand", hex: "#D8C3A5" },
  { name: "Slate", hex: "#5D6770" },
];
export const FILTER_MATERIALS = [
  "Cotton", "Wool", "Linen", "Leather", "Cotton Blend", "Recycled Polyester",
];
