import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";

// Lithuanian synonym & category map
const synonyms: Record<string, string[]> = {
  vistiena: ["vištiena", "vištienos", "višta"],
  mesa: ["mėsa", "vištiena", "kiauliena", "jautiena", "dešra", "nugriebta mėsa"],
  pienas: ["pienas", "varškė", "sūris", "grietinė", "sviestas"],
  bulvės: ["bulvės", "bulvytės"],
  duona: ["duona", "batonas", "rauginta duona", "duoniukas"],
  kava: ["kava", "espresso", "cappuccino", "latte"],
  aliejus: ["aliejus", "alyvuogių aliejus", "saulėgrąžų aliejus"],
  uogos: ["braškės", "avietės", "šilauogės", "gervuogės"],
  žuvis: ["žuvis", "lašiša", "tuna", "skumbrė", "upėtakis"],
  daržovės: ["morka", "pomidoras", "agurkas", "paprika", "salotos"],
  vaisiai: ["obuolys", "bananas", "kriaušė", "apelsinas", "mandarinas"]
};

// Remove diacritics
const normalize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// Simple fuzzy match (letters in order)
const fuzzyMatch = (text: string, query: string) => {
  text = normalize(text);
  query = normalize(query);
  let i = 0, j = 0;
  while (i < text.length && j < query.length) {
    if (text[i] === query[j]) j++;
    i++;
  }
  return j === query.length;
};

// Scoring function
const matchScore = (product: Product, query: string) => {
  if (!query) return 1; // all products if empty
  const q = normalize(query);
  const title = normalize(product.title ?? "");
  const shop = normalize(product.shop);
  let score = 0;

  // Exact match in title
  if (title === q) score += 100;

  // Exact match in shop
  if (shop === q) score += 80;

  // Partial match in title
  if (title.includes(q)) score += 60;

  // Partial match in shop
  if (shop.includes(q)) score += 40;

  // Synonym match
  for (const key in synonyms) {
    const syns = synonyms[key].map(s => normalize(s));
    if (syns.includes(q) && syns.some(s => title.includes(s))) score += 70;
  }

  // Fuzzy match
  if (fuzzyMatch(title, q) || fuzzyMatch(shop, q)) score += 20;

  // Category match boost
  if (synonyms[q]?.some(s => title.includes(normalize(s)))) score += 30;

  return score;
};

type Props = {
  products: Product[];
  logos: Record<string, string>;
  itemsPerPage?: number;
  onAddToBasket: (product: Product) => void;
};

const ProductList: React.FC<Props> = ({ products, logos, itemsPerPage = 16, onAddToBasket }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortPrice, setSortPrice] = useState<"asc" | "desc" | null>(null);
  const [columns, setColumns] = useState(4);

  const updateColumns = () => {
    const w = window.innerWidth;
    if (w < 480) setColumns(2);
    else if (w < 768) setColumns(3);
    else setColumns(4);
  };
  useEffect(() => {
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Filter & score
  const scored = products
    .map(p => ({ product: p, score: matchScore(p, search) }))
    .filter(p => p.score > 0) // only relevant matches
    .sort((a, b) => {
      if (sortPrice) {
        const priceA = parseFloat(a.product.price ?? "0") || 0;
        const priceB = parseFloat(b.product.price ?? "0") || 0;
        return sortPrice === "asc" ? priceA - priceB : priceB - priceA;
      }
      return b.score - a.score; // highest match first
    })
    .map(p => p.product);

  const totalPages = Math.ceil(scored.length / itemsPerPage);
  const displayed = scored.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getPaginationNumbers = () => {
    const maxPagesToShow = 4;
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);
    if (end - start + 1 < maxPagesToShow) start = Math.max(1, end - maxPagesToShow + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  const renderPagination = () => (
    <div style={{ margin: "12px 0", textAlign: "center", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 10px", borderRadius: 6, border: "none", backgroundColor: "#eee", cursor: page === 1 ? "default" : "pointer" }}>◀ Atgal</button>
      {getPaginationNumbers().map(n => (
        <button key={n} onClick={() => setPage(n)} style={{ padding: "6px 10px", borderRadius: 6, border: "none", backgroundColor: page === n ? "#007bff" : "#eee", color: page === n ? "#fff" : "#000", cursor: "pointer" }}>{n}</button>
      ))}
      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 10px", borderRadius: 6, border: "none", backgroundColor: "#eee", cursor: page === totalPages ? "default" : "pointer" }}>Kitas ▶</button>
    </div>
  );

  return (
    <div>
      {/* Search & Sort */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Paieška..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, padding: 10, fontSize: 16, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <select value={sortPrice ?? ""} onChange={(e) => setSortPrice(e.target.value === "" ? null : (e.target.value as "asc" | "desc"))} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}>
          <option value="">Rūšiuoti pagal kainą</option>
          <option value="asc">Mažiausia → Didžiausia</option>
          <option value="desc">Didžiausia → Mažiausia</option>
        </select>
      </div>

      {totalPages > 1 && renderPagination()}

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12 }}>
        {displayed.map(p => <ProductCard key={p.id} product={p} logos={logos} onAddToBasket={onAddToBasket} />)}
      </div>

      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default ProductList;
