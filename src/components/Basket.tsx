import React, { useRef, useState } from "react";
import type { Product } from "./ProductCard";

export type BasketItem = Product & {
  checked: boolean;
  quantity: number;
};

/* =======================
   PROMO PARSER + CALC
======================= */

type Promo =
  | { type: "percent"; percent: number; minQty: number }
  | { type: "bundle"; bundleQty: number; bundlePrice: number }
  | null;

const parsePromo = (extra?: string | null): Promo => {
  if (!extra) return null;

  const text = extra
    .toLowerCase()
    .replace(",", ".")
    .replace("€", "")
    .trim();

  /**
   * Examples:
   * 2 ar daugiau su –40%
   * 3 ar daugiau su -30%
   */
  const percentMatch = text.match(/(\d+)\s*(ar daugiau)?\s*su\s*[-–](\d+)\s*%/);
  if (percentMatch) {
    return {
      type: "percent",
      minQty: parseInt(percentMatch[1], 10),
      percent: parseInt(percentMatch[3], 10),
    };
  }

  /**
   * Examples:
   * 2 už 2.99
   * 3 už 2.39
   * 4 už 0.99
   */
  const bundleMatch = text.match(/(\d+)\s*(uz|už)\s*(\d+(\.\d+)?)/);
  if (bundleMatch) {
    return {
      type: "bundle",
      bundleQty: parseInt(bundleMatch[1], 10),
      bundlePrice: parseFloat(bundleMatch[3]),
    };
  }

  return null;
};

const calcItemTotal = (item: BasketItem): number => {
  const unitPrice = parseFloat(item.price ?? "0") || 0;
  const qty = item.quantity;
  const promo = parsePromo(item.extra_info);

  if (!promo) return unitPrice * qty;

  /* ---- PERCENT PROMO (WITH MIN QTY) ---- */
  if (promo.type === "percent") {
    if (qty < promo.minQty) {
      return unitPrice * qty; // ❗ NO DISCOUNT
    }
    return unitPrice * qty * (1 - promo.percent / 100);
  }

  /* ---- BUNDLE PROMO ---- */
  if (promo.type === "bundle") {
    const bundles = Math.floor(qty / promo.bundleQty);
    const remainder = qty % promo.bundleQty;

    return (
      bundles * promo.bundlePrice +
      remainder * unitPrice
    );
  }

  return unitPrice * qty;
};

/* =======================
   COMPONENT
======================= */

type Props = {
  basket: Record<string, BasketItem[]>;
  logos: Record<string, string>;
  onRemove: (shop: string, id: string) => void;
  onToggle: (shop: string, id: string) => void;
  onClearChecked: (shop: string) => void;
  onUpdateQuantity: (shop: string, id: string, quantity: number) => void;
};

const Basket: React.FC<Props> = ({
  basket,
  logos,
  onRemove,
  onToggle,
  onClearChecked,
  onUpdateQuantity,
}) => {
  const basketRef = useRef<HTMLDivElement>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const shops = Object.keys(basket);

  if (shops.length === 0) return null;

  const calcTotal = (items: BasketItem[]) =>
    items
      .filter(i => !i.checked)
      .reduce((sum, i) => sum + calcItemTotal(i), 0)
      .toFixed(2);

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Pirkinių sąrašas</h2>

      <div ref={basketRef}>
        {shops.map(shop => (
          <div
            key={shop}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Shop header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={logos[shop]} alt={shop} style={{ height: 28 }} />
              <strong style={{ fontSize: 16 }}>{shop}</strong>
            </div>

            {/* Items */}
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {basket[shop].map(item => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: 6,
                    borderRadius: 8,
                    background: item.checked ? "#f5f5f5" : "#fafafa",
                    opacity: item.checked ? 0.5 : 1,
                    textDecoration: item.checked ? "line-through" : "none",
                    fontSize: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => onToggle(shop, item.id)}
                  />

                  <img
                    src={item.image_url ?? ""}
                    alt={item.title ?? ""}
                    onClick={() => setModalImage(item.image_url ?? "")}
                    style={{
                      height: 50,
                      width: 50,
                      objectFit: "contain",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      cursor: "pointer",
                    }}
                  />

                  <span
                    title={item.title ?? ""}
                    style={{
                      flex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.title}
                  </span>

                  {/* Quantity */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={() => onUpdateQuantity(shop, item.id, Math.max(1, item.quantity - 1))}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(shop, item.id, item.quantity + 1)}>+</button>
                  </div>

                  {/* Price */}
                  <strong style={{ minWidth: 60, textAlign: "right" }}>
                    {calcItemTotal(item).toFixed(2)} €
                  </strong>

                  <button
                    onClick={() => onRemove(shop, item.id)}
                    style={{ border: "none", background: "transparent", cursor: "pointer" }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
              <strong>Iš viso: {calcTotal(basket[shop])} €</strong>
              <button onClick={() => onClearChecked(shop)}>Išvalyti nupirktus</button>
            </div>
          </div>
        ))}
      </div>

      {/* Image modal */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <img src={modalImage} style={{ maxWidth: "90%", maxHeight: "90%" }} />
        </div>
      )}
    </div>
  );
};

export default Basket;
