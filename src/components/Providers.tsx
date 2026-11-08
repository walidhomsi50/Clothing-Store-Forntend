"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { bff, session } from "@/lib/bff";
import type { Cart, Me } from "@/lib/types";

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type StoreState = {
  // account
  user: Me | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (input: RegisterInput) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // cart
  cart: Cart | null;
  cartLoading: boolean;
  cartCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productVariantId: number, quantity: number) => Promise<string | null>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<string | null>;
  removeCartItem: (cartItemId: number) => Promise<string | null>;
};

const StoreContext = createContext<StoreState | null>(null);

export function useStore(): StoreState {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside <Providers>.");
  return value;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const result = await bff<Me>("v1/auth/me");
    setUser(result.ok ? result.data : null);
    setAuthLoading(false);
  }, []);

  const refreshCart = useCallback(async () => {
    const result = await bff<Cart>("v1/cart");
    if (result.ok) setCart(result.data);
    setCartLoading(false);
  }, []);

  useEffect(() => {
    // Load the visitor's account and cart once when the site opens
    let cancelled = false;

    void (async () => {
      const [me, cartResult] = await Promise.all([bff<Me>("v1/auth/me"), bff<Cart>("v1/cart")]);

      if (cancelled) return;

      setUser(me.ok ? me.data : null);
      setAuthLoading(false);

      if (cartResult.ok) setCart(cartResult.data);
      setCartLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await session<unknown>("login", { email, password });
      if (!result.ok) return result.message;

      await Promise.all([refreshUser(), refreshCart()]);
      return null;
    },
    [refreshUser, refreshCart],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await session<unknown>("register", input);
      if (!result.ok) return result.message;

      await Promise.all([refreshUser(), refreshCart()]);
      return null;
    },
    [refreshUser, refreshCart],
  );

  const logout = useCallback(async () => {
    await session<unknown>("logout");
    setUser(null);
    await refreshCart();
  }, [refreshCart]);

  const changeCart = useCallback(async (path: string, method: string, body?: unknown) => {
    const result = await bff<Cart>(path, method, body);
    if (!result.ok) return result.message;

    setCart(result.data);
    return null;
  }, []);

  const addToCart = useCallback(
    (productVariantId: number, quantity: number) => changeCart("v1/cart/items", "POST", { productVariantId, quantity }),
    [changeCart],
  );

  const updateCartItem = useCallback(
    (cartItemId: number, quantity: number) => changeCart(`v1/cart/items/${cartItemId}`, "PUT", { quantity }),
    [changeCart],
  );

  const removeCartItem = useCallback(
    (cartItemId: number) => changeCart(`v1/cart/items/${cartItemId}`, "DELETE"),
    [changeCart],
  );

  const value = useMemo<StoreState>(
    () => ({
      user,
      authLoading,
      login,
      register,
      logout,
      refreshUser,
      cart,
      cartLoading,
      cartCount: cart?.totalItems ?? 0,
      refreshCart,
      addToCart,
      updateCartItem,
      removeCartItem,
    }),
    [user, authLoading, login, register, logout, refreshUser, cart, cartLoading, refreshCart, addToCart, updateCartItem, removeCartItem],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
