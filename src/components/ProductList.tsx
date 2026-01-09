import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";

type Props = {
  products: Product[];
  logos: Record<string, string>;
  itemsPerPage?: number;
  onAddToBasket: (product: Product) => void;
};

const ProductList: React.FC<Props> = ({
  products,
  logos,
  itemsPerPage = 16,
  onAddToBasket,
}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortPrice, setSortPrice] = useState<"asc" | "desc" | null>(null);
  const [columns, setColumns] = useState(4);

  // Adjust columns based on screen width
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

  // Filter & sort
  const filtered = products
    .filter((p) => {
      const text = (p.title ?? "").toLowerCase();
      const shop = p.shop.toLowerCase();
      return text.includes(search.toLowerCase()) || shop.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (!sortPrice) return 0;
      const priceA = parseFloat(a.price ?? "0") || 0;
      const priceB = parseFloat(b.price ?? "0") || 0;
      return sortPrice === "asc" ? priceA - priceB : priceB - priceA;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Pagination display (max 4 page numbers)
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
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        style={{ padding: "6px 10px", borderRadius: 6, border: "none", backgroundColor: "#eee", cursor: page === 1 ? "default" : "pointer" }}
      >
        ◀ Atgal
      </button>

      {getPaginationNumbers().map((n) => (
        <button
          key={n}
          onClick={() => setPage(n)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "none",
            backgroundColor: page === n ? "#007bff" : "#eee",
            color: page === n ? "#fff" : "#000",
            cursor: "pointer",
          }}
        >
          {n}
        </button>
      ))}

      <button
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        style={{ padding: "6px 10px", borderRadius: 6, border: "none", backgroundColor: "#eee", cursor: page === totalPages ? "default" : "pointer" }}
      >
        Kitas ▶
      </button>
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ flex: 1, padding: 10, fontSize: 16, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <select
          value={sortPrice ?? ""}
          onChange={(e) => setSortPrice(e.target.value === "" ? null : (e.target.value as "asc" | "desc"))}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="">Rūšiuoti pagal kainą</option>
          <option value="asc">Mažiausia → Didžiausia</option>
          <option value="desc">Didžiausia → Mažiausia</option>
        </select>
      </div>

      {/* Top Pagination */}
      {totalPages > 1 && renderPagination()}

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 12,
        }}
      >
        {displayed.map((p, idx) => (
          <ProductCard key={p.id} product={p} logos={logos} onAddToBasket={onAddToBasket} />
        ))}
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default ProductList;
