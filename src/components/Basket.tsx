import React, { useRef, useState } from "react";
import type { Product } from "./ProductCard";

export type BasketItem = Product & {
  checked: boolean;
  quantity: number; // NEW: quantity field
};

type Props = {
  basket: Record<string, BasketItem[]>;
  logos: Record<string, string>;
  onRemove: (shop: string, id: string) => void;
  onToggle: (shop: string, id: string) => void;
  onClearChecked: (shop: string) => void;
  onUpdateQuantity: (shop: string, id: string, quantity: number) => void; // NEW
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
      .reduce((sum, i) => sum + (parseFloat(i.price ?? "0") || 0) * i.quantity, 0)
      .toFixed(2);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ fontSize: 18, margin: 0 }}>Pirkinių sąrašas</h2>
      </div>

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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <img src={logos[shop]} alt={shop} style={{ height: 28, width: "auto" }} />
              <strong style={{ fontSize: 16, textTransform: "capitalize" }}>{shop}</strong>
            </div>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
                    flexWrap: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => onToggle(shop, item.id)}
                  />

                  {/* Small thumbnail */}
                  <img
                    src={item.image_url ?? ""}
                    alt={item.title ?? ""}
                    onClick={() => setModalImage(item.image_url ?? "")}
                    style={{
                      height: 50,
                      width: 50,
                      objectFit: "contain",
                      borderRadius: 6,
                      background: "#fff",
                      border: "1px solid #ddd",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />

                  {/* Title with tooltip */}
                  <span
                    title={item.title ?? ""}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.title}
                  </span>

                  {/* Quantity controls */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                      minWidth: 80,
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => onUpdateQuantity(shop, item.id, Math.max(1, item.quantity - 1))}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        padding: "2px 6px",
                        cursor: "pointer",
                        background: "#f0f0f0",
                      }}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(shop, item.id, item.quantity + 1)}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        padding: "2px 6px",
                        cursor: "pointer",
                        background: "#f0f0f0",
                      }}
                    >
                      +
                    </button>
                  </div>

                  <strong style={{ minWidth: 50, textAlign: "right", flexShrink: 0 }}>
                    {(parseFloat(item.price ?? "0") * item.quantity).toFixed(2)} €
                  </strong>

                  <button
                    onClick={() => onRemove(shop, item.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#555",
                      fontSize: 16,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ fontSize: 14 }}>Iš viso: {calcTotal(basket[shop])} €</strong>

              <button
                onClick={() => onClearChecked(shop)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  background: "#f0f0f0",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Išvalyti nupirktus
              </button>
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
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <img
            src={modalImage}
            alt="preview"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: 12,
              boxShadow: "0 0 12px rgba(0,0,0,0.5)",
              background: "#fff",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Basket;
