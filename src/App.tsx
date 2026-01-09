import React, { useEffect, useState } from "react";
import ProductList from "./components/ProductList";
import Basket from "./components/Basket";
import type { BasketItem } from "./components/Basket";
import type { Product } from "./components/ProductCard";

import lidlLogo from "./assets/lidl.png";
import barboraLogo from "./assets/barbora.png";

import lidlProductsRaw from "../public/data/lidl-products.json";
import barboraProductsRaw from "../public/data/barbora-products.json";

const STORAGE_KEY = "basket";

const lidlProducts: Product[] = lidlProductsRaw.map((p, i) => ({ ...p, id: `lidl-${i}`, shop: "lidl" }));
const barboraProducts: Product[] = barboraProductsRaw.map((p, i) => ({ ...p, id: `barbora-${i}`, shop: "barbora" }));

const allProducts = [...lidlProducts, ...barboraProducts];
const logos = { lidl: lidlLogo, barbora: barboraLogo };

const App: React.FC = () => {
  const [basket, setBasket] = useState<Record<string, BasketItem[]>>({});
  const [basketOpen, setBasketOpen] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBasket(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
  }, [basket]);

  const addToBasket = (product: Product) => {
    setBasket(prev => ({
      ...prev,
      [product.shop]: prev[product.shop]?.find(p => p.id === product.id)
        ? prev[product.shop]
        : [...(prev[product.shop] || []), { ...product, checked: false }],
    }));
  };

  const removeFromBasket = (shop: string, id: string) => {
    setBasket(prev => {
      const items = prev[shop].filter(i => i.id !== id);
      if (items.length === 0) {
        const { [shop]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [shop]: items };
    });
  };

  const toggleChecked = (shop: string, id: string) => {
    setBasket(prev => ({
      ...prev,
      [shop]: prev[shop].map(i => (i.id === id ? { ...i, checked: !i.checked } : i)),
    }));
  };

  const clearChecked = (shop: string) => {
    setBasket(prev => ({
      ...prev,
      [shop]: prev[shop].filter(i => !i.checked),
    }));
  };

  const basketCount = Object.values(basket).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div style={{ padding: 16, background: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Akcijukės</h1>

      {/* Mobile sticky toggle */}
      {basketCount > 0 && (
        <div style={{ position: "sticky", bottom: 0, background: "#fff", padding: 8, borderTop: "1px solid #ccc", zIndex: 1000 }}>
          <button onClick={() => setBasketOpen(prev => !prev)} style={{ width: "100%", padding: 10, fontSize: 16 }}>
            {basketOpen ? "🛒 Paslėpti pirkinių sąrašą" : `🛒 Atidaryti pirkinių sąrašą (${basketCount})`}
          </button>
          {basketOpen && (
            <Basket
              basket={basket}
              logos={logos}
              onRemove={removeFromBasket}
              onToggle={toggleChecked}
              onClearChecked={clearChecked}
            />
          )}
        </div>
      )}

      <ProductList products={allProducts} logos={logos} onAddToBasket={addToBasket} itemsPerPage={16} />
    </div>
  );
};

export default App;
