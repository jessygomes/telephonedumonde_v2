"use client";

import { PromoCode } from "@/types";
import { useState } from "react";
import EditPromoCodeBtn from "./EditPromoCodeBtn";

export default function ShowAllPromo() {
  const [showPromoCodes, setShowPromoCodes] = useState(false);

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/promo-codes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching promo codes:", errorData);
        throw new Error("Failed to fetch promo codes");
      }

      const data = await response.json();
      console.log("PROMO CODES", data);
      setPromoCodes(data.promoCodes);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // console.log("PROMO CODES", promoCodes);

  const handleTogglePromoCodes = () => {
    if (!showPromoCodes) {
      fetchPromoCodes();
    }
    setShowPromoCodes(!showPromoCodes);
  };

  console.log("PROMO CODES SET", promoCodes);

  return (
    <div>
      <button
        onClick={handleTogglePromoCodes}
        className="bg-primary-500 text-white px-4 py-2 rounded-md"
      >
        {showPromoCodes ? "Rétracter la liste" : "Voir tous mes codes"}
      </button>

      {isLoading && (
        <p className="bg-noir-800 text-white font-font1 p-1 text-xs text-center rounded-md">
          Chargement...
        </p>
      )}

      {showPromoCodes && (
        <div className="mt-4">
          {promoCodes.length > 0 ? (
            <ul className="bg-noir-800 text-white font-font1 p-1 text-xs text-center rounded-md flex flex-col gap-1">
              {promoCodes.map((promo) => (
                <li
                  key={promo.id}
                  className="bg-noir-700 grid grid-cols-5 p-2 rounded-md"
                >
                  <p>Code: {promo.code}</p>
                  <p>Réduction: {promo.discount}%</p>
                  <p>Statut: {promo.isActive ? "Actif" : "Expiré"}</p>
                  <p>
                    Date d&apos;expiration:{" "}
                    {new Date(promo.expiresAt).toLocaleDateString()}
                  </p>
                  <div>
                    <EditPromoCodeBtn
                      promoCode={promo}
                      promoCodeId={promo.id}
                    />
                    {/* <DeletePromoCodeBtn promoCode={promo.id} /> */}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="bg-noir-800 text-white font-font1 p-1 text-xs text-center rounded-md">
              Aucun code promo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}