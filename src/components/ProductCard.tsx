import React from "react";

export type Product = {
  id: string;
  image_url: string | null;
  title: string | null;
  price: string | null;
  price_2: string | null;
  extra_info?: string | null; // new field
  shop: "lidl" | "barbora";
};

type Props = {
  product: Product;
  logos: Record<string, string>;
  onAddToBasket: (product: Product) => void;
};

const ProductCard: React.FC<Props> = ({ product, logos, onAddToBasket }) => {
  // Decide what to show in the secondary price/info
  const secondaryInfo = product.price_2 ?? product.extra_info ?? "";
  const isExtraInfo = !product.price_2 && product.extra_info;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 10,
        padding: 10,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#fff",
        cursor: "pointer",
        transition: "transform 0.1s",
      }}
      onClick={() => onAddToBasket(product)}
    >
      {/* Shop Logo */}
      <img
        src={logos[product.shop]}
        alt={product.shop}
        style={{ position: "absolute", top: 6, left: 6, height: 24, width: "auto" }}
      />

      {/* Product Image */}
      <img
        src={product.image_url ?? ""}
        alt={product.title ?? ""}
        style={{ width: "100%", height: 120, objectFit: "contain", marginBottom: 6 }}
      />

      {/* Title */}
      <div
        style={{
          fontWeight: "bold",
          fontSize: 12,
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        {product.title}
      </div>

      {/* Price / Extra Info */}
      <div style={{ fontSize: 12, color: "#333", textAlign: "center" }}>
        <span style={{ fontWeight: "bold", fontSize: 16, color: "#e60a14" }}>
          {product.price} €
        </span>
        {secondaryInfo && (
          <>
            <br />
            {isExtraInfo ? (
              <span
                style={{
                  backgroundColor: "#e60a14",
                  color: "#fff",
                  padding: "2px 6px",
                  borderRadius: 8,
                  fontSize: 12,
                  display: "inline-block",
                  marginTop: 4,
                }}
              >
                {secondaryInfo}
              </span>
            ) : (
              <span>  {secondaryInfo}</span>
            )}
          </>
        )}
      </div>

      {/* Add to Basket Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToBasket(product);
        }}
        style={{
          marginTop: 6,
          padding: "8px 12px",
          background: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 14,
          width: "auto",
        }}
      >
        Pridėti pirkinį
      </button>
    </div>
  );
};

export default ProductCard;
