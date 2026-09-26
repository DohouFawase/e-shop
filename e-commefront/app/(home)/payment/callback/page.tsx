"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paymentService } from "@/services/orders/paymentService";
import { useAppDispatch } from "@/store/hooks";
import { fetchCart } from "@/store/cartSlice";

type ResultState = "checking" | "paid" | "pending" | "failed";

export default function PaymentCallbackPage() {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<ResultState>("checking");
  const [message, setMessage] = useState("Vérification sécurisée du paiement…");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("cpm_trans_id") ?? params.get("transaction_id") ?? params.get("reference");
    if (!reference) {
      queueMicrotask(() => {
        if (active) {
          setState("failed");
          setMessage("La référence de paiement est absente.");
        }
      });
      return () => { active = false; };
    }

    void paymentService.verify(reference).then(async (result) => {
      if (!active) return;
      setState(result.status);
      setMessage(result.status === "paid" ? "Paiement confirmé. Merci pour votre commande !" : result.status === "pending" ? "Le paiement est encore en cours. Consultez vos commandes dans un instant." : "Le paiement a échoué. Vous pouvez le reprendre depuis vos commandes.");
      if (result.status === "paid") await dispatch(fetchCart());
    }).catch(() => {
      if (active) {
        setState("failed");
        setMessage("Impossible de confirmer le paiement pour le moment. Consultez vos commandes avant de réessayer.");
      }
    });
    return () => { active = false; };
  }, [dispatch]);

  return (
    <section className="mx-auto my-16 max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
      <h1 className="text-2xl font-black">{state === "checking" ? "Vérification du paiement" : state === "paid" ? "Paiement confirmé" : state === "pending" ? "Paiement en cours" : "Paiement à vérifier"}</h1>
      <p role={state === "failed" ? "alert" : undefined} className="mt-3 text-stone-600">{message}</p>
      <Link href="/account/orders" className="mt-6 inline-flex rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white">Voir mes commandes</Link>
    </section>
  );
}
