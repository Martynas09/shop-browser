import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Product } from "./ProductCard";

export type BasketItem = Product & {
  checked: boolean;
};

type Props = {
  basket: Record<string, BasketItem[]>;
  logos: Record<string, string>;
  onRemove: (shop: string, id: string) => void;
  onToggle: (shop: string, id: string) => void;
  onClearChecked: (shop: string) => void;
};

const Basket: React.FC<Props> = ({
  basket,
  logos,
  onRemove,
  onToggle,
  onClearChecked,
}) => {
  const basketRef = useRef<HTMLDivElement>(null);
  const shops = Object.keys(basket);

  if (shops.length === 0) return null;

  const exportImage = async () => {
    if (!basketRef.current) return;
    const canvas = await html2canvas(basketRef.current);
    const link = document.createElement("a");
    link.download = "pirkiniu-sarasas.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const exportPDF = async () => {
    if (!basketRef.current) return;
    const canvas = await html2canvas(basketRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save("pirkiniu-sarasas.pdf");
  };

  const calcTotal = (items: BasketItem[]) =>
    items
      .filter(i => !i.checked)
      .reduce((sum, i) => sum + (parseFloat(i.price ?? "0") || 0), 0)
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
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={exportImage}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#f0f0f0",
              cursor: "pointer",
            }}
          >
            Išsaugoti PNG
          </button>
          <button
            onClick={exportPDF}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#f0f0f0",
              cursor: "pointer",
            }}
          >
            Išsaugoti PDF
          </button>
        </div>
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
              <img
                src={logos[shop]}
                alt={shop}
                style={{ height: 28, width: "auto" }}
              />
              <strong style={{ fontSize: 16, textTransform: "capitalize" }}>
                {shop}
              </strong>
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
                    style={{
                      height: 40,
                      width: 40,
                      objectFit: "contain",
                      borderRadius: 6,
                      background: "#fff",
                      border: "1px solid #ddd",
                    }}
                  />

                  <span style={{ flex: 1, fontSize: 14 }}>{item.title}</span>

                  <strong style={{ minWidth: 50, textAlign: "right" }}>
                    {item.price} €
                  </strong>

                  <button
                    onClick={() => onRemove(shop, item.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#e60a14",
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    ❌
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
              <strong style={{ fontSize: 14 }}>
                Iš viso: {calcTotal(basket[shop])} €
              </strong>

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
    </div>
  );
};

export default Basket;
