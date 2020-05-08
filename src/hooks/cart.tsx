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
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@GoMarketplace-Cart');

      if (data) {
        setProducts(JSON.parse(data as string));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(item => item.id === product.id);

      if (!productExists) {
        const { id, title, image_url, price } = product;

        const quantity = 1;

        const addProduct = {
          id,
          title,
          image_url,
          price,
          quantity,
        };

        const updatedProducts = products;
        updatedProducts.push(addProduct);

        setProducts([...updatedProducts]);

        await AsyncStorage.setItem(
          '@GoMarketplace-Cart',
          JSON.stringify(updatedProducts),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);
      const product = products.find(item => item.id === id);

      if (product) {
        const { title, image_url, quantity, price } = product;

        const updatedProduct = {
          id,
          title,
          image_url,
          price,
          quantity: quantity + 1,
        };

        const updatedProducts = products;
        updatedProducts[productIndex] = updatedProduct;

        setProducts([...updatedProducts]);

        await AsyncStorage.setItem(
          '@GoMarketplace-Cart',
          JSON.stringify(updatedProducts),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);
      const product = products.find(item => item.id === id);

      if (product) {
        const { title, image_url, quantity, price } = product;

        const updatedProduct = {
          id,
          title,
          image_url,
          price,
          quantity: quantity - 1,
        };

        const updatedProducts =
          updatedProduct.quantity > 0
            ? products
            : products.filter(p => p.id !== id);

        if (updatedProduct.quantity > 0) {
          updatedProducts[productIndex] = updatedProduct;
        } else {
          updatedProducts.slice(productIndex, 1);
        }

        setProducts([...updatedProducts]);

        await AsyncStorage.setItem(
          '@GoMarketplace-Cart',
          JSON.stringify(updatedProducts),
        );
      }
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
