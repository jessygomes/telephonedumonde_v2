import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

//! VALIDATION DU PANIER
export const POST = async (req: NextRequest) => {
  const { items, promoCode, shippingMethodId } = await req.json();

  console.log(items, promoCode, shippingMethodId);

  try {
    // Validation des articles
    let total = 0;
    for (const item of items) {
      const product = await prisma.phoneVariant.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        return NextResponse.json(
          {
            error: `Le produit ${item.name} n'est plus disponible en quantité suffisante.`,
          },
          { status: 400 }
        );
      }

      // Calculer le total des articles
      total += product.price * item.quantity;
    }

    // Validation du code promo (si fourni)
    let discount = 0;
    let isShippedFree = false;
    let promoCodeId = null;

    if (promoCode) {
      const code = await prisma.promoCode.findUnique({
        where: { code: promoCode },
      });

      if (!code || !code.isActive || new Date(code.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: "Code promo invalide ou expiré." },
          { status: 400 }
        );
      }

      promoCodeId = code.id;
      // Calculer la réduction
      discount = (total * (code.discount ?? 0)) / 100;

      // Vérifier si la livraison est gratuite
      isShippedFree = code.isShippedFree ?? false;
    }

    // Calculer le coût de la livraison
    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: { id: shippingMethodId },
    });

    let shippingCost = shippingMethod ? shippingMethod.cost : 0;
    if (isShippedFree && shippingMethod?.name === "Livraison Standard") {
      shippingCost = 0;
    }

    // Calculer le total après réduction et frais de livraison
    const totalAfterDiscount = total - discount + shippingCost;

    return NextResponse.json({
      message: "Validation réussie",
      total: totalAfterDiscount,
      isShippedFree,
      discount,
      shippingCost,
      promoCodeId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
};
