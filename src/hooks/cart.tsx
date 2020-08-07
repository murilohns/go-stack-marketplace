import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const index = products.findIndex(
        cartProduct => cartProduct.id === product.id,
      );

      let cartProducts = [...products];

      if (index < 0) {
        product.quantity = 1;
        cartProducts = [...products, product];
      } else {
        cartProducts[index].quantity += 1;
      }

      setProducts([...cartProducts]);

      await AsyncStorage.setItem(
        '@GoMarkeplace:products',
        JSON.stringify(cartProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(product => product.id === id);

      products[index].quantity += 1;

      setProducts([...products]);

      await AsyncStorage.setItem(
        '@GoMarkeplace:products',
        JSON.stringify([...products]),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(product => product.id === id);

      products[index].quantity -= 1;

      if (products[index].quantity <= 0) {
        products.splice(index, 1);
      }

      setProducts([...products]);

      await AsyncStorage.setItem(
        '@GoMarkeplace:products',
        JSON.stringify([...products]),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
