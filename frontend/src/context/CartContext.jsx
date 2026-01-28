import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addToCart as addApi, clearCart as clearApi, getCart as getApi, removeFromCart as removeApi, updateCartItem as updateApi } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total_items: 0, total_price: 0 });
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) {
      setCart({ items: [], total_items: 0, total_price: 0 });
      return;
    }
    setLoading(true);
    try {
      const data = await getApi();
      setCart(data.cart || { items: [], total_items: 0, total_price: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]);

  const addItem = async (item) => {
    await addApi(item);
    await refresh();
  };

  const updateItem = async (product_id, quantity) => {
    await updateApi(product_id, quantity);
    await refresh();
  };

  const removeItem = async (product_id) => {
    await removeApi(product_id);
    await refresh();
  };

  const clear = async () => {
    await clearApi();
    await refresh();
  };

  const value = useMemo(() => ({ cart, loading, addItem, updateItem, removeItem, clear, refresh }), [cart, loading]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
