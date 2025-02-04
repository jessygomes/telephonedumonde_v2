"use client";
import { useCart } from "@/components/Panier/Context/CartContext";
// import { getCart } from "@/lib/useCart";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  MdMenu,
  MdClose,
  MdOutlineAccountCircle,
  MdOutlineShoppingCart,
} from "react-icons/md";

interface NavItemsProps {
  session: { user: { name: string; email: string; role: string } } | null;
}

export const NavMobile = ({ session }: NavItemsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleClickOutside = (event: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  //! GESTION DU PANIER
  // const [cart, setCart] = useState(() => getCart());
  const { state } = useCart();

  // Calcul du nombre total d'articles
  const totalItemCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <nav className="lg:hidden">
      <div className="flex items-center justify-between text-white">
        <button onClick={handleOpen} className="text-2xl">
          <MdMenu size={40} className="text-white" />
        </button>
      </div>

      <div
        ref={navRef}
        className={`fixed top-0 right-0 w-64 h-full bg-black/90 backdrop-blur-lg text-white transform flex flex-col justify-center ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className=" flex items-center justify-between">
          <div className="absolute top-4 left-4 text-lg font-bold">Menu</div>
          <button
            onClick={handleClose}
            className="text-2xl absolute top-4 right-4"
          >
            <MdClose />
          </button>
        </div>
        <ul className="flex flex-col p-4 space-y-8 font-fontb font-bold uppercase text-2xl tracking-widest">
          <li>
            <Link href="/" onClick={handleClose}>
              Accueil
            </Link>
          </li>
          <div className="h-[1px] bg-white" />
          <li>
            <Link href="/boutique" onClick={handleClose}>
              Boutique
            </Link>
          </li>
          <div className="h-[1px] bg-white" />
          <li>
            <Link href="/concept" onClick={handleClose}>
              Concept
            </Link>
          </li>
          <div className="h-[1px] bg-white" />
          <li className="flex gap-8">
            <Link
              href={session ? "/mon-compte" : "se-connecter"}
              onClick={handleClose}
            >
              <MdOutlineAccountCircle size={40} />
            </Link>
            <Link href="/panier" onClick={handleClose}>
              <div className="relative flex items-center gap-4">
                <MdOutlineShoppingCart
                  size={40}
                  className="cursor-pointer hover:text-white/70"
                />
                {totalItemCount > 0 && (
                  <span className="cursor-pointer absolute -top-2 -right-2 bg-gradient-to-t from-primary-500 to-primary-900 text-white text-sm font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItemCount}
                  </span>
                )}
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
