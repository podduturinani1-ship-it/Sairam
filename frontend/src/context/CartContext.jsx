import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [offlineCartItems, setOfflineCartItems] = useState(() => {
    const saved = localStorage.getItem('offlineCartItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [onlineCartItems, setOnlineCartItems] = useState(() => {
    const saved = localStorage.getItem('onlineCartItems');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('offlineCartItems', JSON.stringify(offlineCartItems));
  }, [offlineCartItems]);

  useEffect(() => {
    localStorage.setItem('onlineCartItems', JSON.stringify(onlineCartItems));
  }, [onlineCartItems]);

  const addToCart = (item, quantity = 1, isOnline = false) => {
    const setCart = isOnline ? setOnlineCartItems : setOfflineCartItems;
    setCart(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      if (existingItem) {
        return prevItems.map(i => i._id === item._id ? { ...i, qty: i.qty + quantity } : i);
      }
      return [...prevItems, { ...item, qty: quantity }];
    });
  };

  const removeFromCart = (id, isOnline = false) => {
    const setCart = isOnline ? setOnlineCartItems : setOfflineCartItems;
    setCart(prevItems => prevItems.filter(i => i._id !== id));
  };

  const updateQuantity = (id, qty, isOnline = false) => {
    if (qty <= 0) {
      removeFromCart(id, isOnline);
      return;
    }
    const setCart = isOnline ? setOnlineCartItems : setOfflineCartItems;
    setCart(prevItems => prevItems.map(i => i._id === id ? { ...i, qty } : i));
  };

  const clearCart = (isOnline = false) => {
    const setCart = isOnline ? setOnlineCartItems : setOfflineCartItems;
    setCart([]);
  };

  const getCartTotal = (isOnline = false) => {
    const items = isOnline ? onlineCartItems : offlineCartItems;
    return items.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  return (
    <CartContext.Provider value={{ 
      offlineCartItems, 
      onlineCartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};
