// Shapes of the JSON returned by the ASP.NET API (property names are camelCase).

export type Color = { colorId: number; name: string; hexCode: string | null };
export type Size = { sizeId: number; name: string; sortOrder: number };

export type Paged<T> = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

export type Category = {
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  parentCategoryId: number | null;
  productCount: number;
};

export type ProductListItem = {
  productId: number;
  name: string;
  slug: string;
  brand: string | null;
  categoryId: number;
  price: number;
  salePrice: number | null;
  currency: string;
  mainImageUrl: string | null;
  secondImageUrl: string | null;
  inStock: boolean;
  isNew: boolean;
  colors: Color[];
  sizes: Size[];
};

export type ProductImage = { imageUrl: string; sortOrder: number; isMain: boolean };

export type Variant = {
  productVariantId: number;
  colorId: number | null;
  colorName: string | null;
  sizeId: number | null;
  sizeName: string | null;
  sku: string;
  price: number;
  originalPrice: number | null;
  inStock: boolean;
  availableQuantity: number;
};

export type ProductDetails = {
  productId: number;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  categoryId: number;
  categoryName: string | null;
  categorySlug: string | null;
  price: number;
  salePrice: number | null;
  currency: string;
  inStock: boolean;
  images: ProductImage[];
  variants: Variant[];
  colors: Color[];
  sizes: Size[];
};

export type Filters = {
  currency: string;
  minPrice: number | null;
  maxPrice: number | null;
  colors: Color[];
  sizes: Size[];
};

export type CartItem = {
  cartItemId: number;
  productId: number;
  productName: string;
  productVariantId: number;
  colorName: string | null;
  sizeName: string | null;
  sku: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  availableQuantity: number;
  isAvailable: boolean;
};

export type Cart = {
  cartId: number;
  customerId: number | null;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
};

export type PaymentMethod = { code: string; name: string; enabled: boolean; message: string | null };

export type OrderItem = {
  orderItemId: number;
  productId: number;
  productName: string;
  productVariantId: number;
  colorName: string | null;
  sizeName: string | null;
  sku: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

export type OrderDetails = {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  requiresPayment: boolean;
  currency: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  shippingFullName: string | null;
  shippingPhone: string | null;
  contactEmail: string | null;
  shippingAddress: string;
  notes: string | null;
  trackingToken: string;
  items: OrderItem[];
};

export type OrderListItem = {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  shippingAddress: string;
  itemCount: number;
};

export type Address = {
  customerAddressId: number;
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  area: string | null;
  building: string | null;
  floor: string | null;
  apartment: string | null;
  notes: string | null;
  isDefault: boolean;
};

export type AddressInput = {
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  area: string;
  building: string;
  floor: string;
  apartment: string;
  notes: string;
  isDefault: boolean;
};

export type Me = {
  customerId: number;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
};
