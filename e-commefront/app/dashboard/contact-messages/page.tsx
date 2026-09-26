"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Mail, MailOpen, MessageSquareText, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchContactInbox, markContactMessageRead, sendContactReply } from "@/store/contactInboxSlice";
import type { ContactInboxMessage } from "@/services/contact/contactInboxService";

const dateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

export default function ContactMessagesPage() {
  const dispatch = useAppDispatch();
  const { messages, unreadCount, total, status, error } = useAppSelector((state) => state.contactInbox);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => { void dispatch(fetchContactInbox()); }, [dispatch]);

  const filteredMessages = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr-FR");
    if (!term) return messages;
    return messages.filter((item) => `${item.name} ${item.email} ${item.subject} ${item.message}`.toLocaleLowerCase("fr-FR").includes(term));
  }, [messages, search]);

  const activeMessageId = selectedId && filteredMessages.some((item) => item.id === selectedId)
    ? selectedId
    : filteredMessages[0]?.id ?? null;
  const selectedMessage = messages.find((item) => item.id === activeMessageId) ?? null;

  useEffect(() => {
    if (selectedMessage && !selectedMessage.read_at) {
      void dispatch(markContactMessageRead(selectedMessage.id));
    }
  }, [dispatch, selectedMessage]);

  async function refresh() {
    try {
      await dispatch(fetchContactInbox()).unwrap();
    } catch {
      toast.error("Impossible d’actualiser les messages.");
    }
  }

  async function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMessage) return;
    setSending(true);
    try {
      await dispatch(sendContactReply({ messageId: selectedMessage.id, body: replyBody })).unwrap();
      setReplyBody("");
      toast.success("Réponse envoyée par e-mail.");
    } catch (cause) {
      toast.error(typeof cause === "string" ? cause : "La réponse n’a pas pu être envoyée.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-[1500px] space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Service client</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">Messages de contact</h1><p className="mt-1 text-sm text-slate-500">Consultez les demandes reçues et répondez directement par e-mail.</p></div>
        <button type="button" onClick={() => void refresh()} disabled={status === "loading"} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`size-4 ${status === "loading" ? "animate-spin" : ""}`} />Actualiser</button>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.5fr)]">
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Boîte de réception</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{total}</span></div><p className="mt-1 text-xs text-slate-500">{unreadCount} non lu{unreadCount === 1 ? "" : "s"}</p><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un message…" aria-label="Rechercher un message" className="mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700" /></div>
          {error && <p role="alert" className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {status === "loading" && messages.length === 0 ? <div className="space-y-3 p-4">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-slate-100" />)}</div> : filteredMessages.length ? <ul className="max-h-[68vh] divide-y divide-slate-100 overflow-y-auto">{filteredMessages.map((message) => <MessageListItem key={message.id} message={message} selected={message.id === selectedId} onSelect={() => setSelectedId(message.id)} />)}</ul> : <div className="px-5 py-14 text-center"><MailOpen className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-700">{search ? "Aucun résultat" : "Aucun message reçu"}</p><p className="mt-1 text-xs text-slate-500">Les messages envoyés depuis la page Contact apparaîtront ici.</p></div>}
        </aside>

        <section className="min-h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!selectedMessage ? <div className="grid min-h-[500px] place-items-center p-8 text-center"><div><MessageSquareText className="mx-auto size-9 text-slate-300" /><p className="mt-3 text-sm text-slate-500">Sélectionnez un message pour lire la demande.</p></div></div> : <>
            <header className="border-b border-slate-100 px-5 py-5 sm:px-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-slate-500">Message reçu le {dateTime.format(new Date(selectedMessage.created_at))}</p><h2 className="mt-2 text-xl font-semibold text-slate-900">{selectedMessage.subject}</h2><p className="mt-2 text-sm text-slate-600">{selectedMessage.name} · <a href={`mailto:${selectedMessage.email}`} className="text-teal-800 hover:underline">{selectedMessage.email}</a></p></div><a href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"><Mail className="size-4" />Ouvrir dans la messagerie</a></div></header>
            <div className="max-h-[38vh] overflow-y-auto px-5 py-6 sm:px-7"><article className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">{selectedMessage.message}</article>
              {selectedMessage.replies.length > 0 && <div className="mt-6 space-y-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Historique des réponses</h3>{selectedMessage.replies.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${item.status === "sent" ? "border-teal-100 bg-teal-50/50" : item.status === "failed" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-700">{item.admin ? `${item.admin.first_name} ${item.admin.last_name}`.trim() : "Administration"}</p><span className="text-[11px] text-slate-500">{item.sent_at ? dateTime.format(new Date(item.sent_at)) : item.status === "failed" ? "Échec de l’envoi" : "Envoi en cours"}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">{item.body}</p></article>)}</div>}
            </div>
            <form onSubmit={reply} className="border-t border-slate-100 bg-white p-5 sm:px-7 sm:py-6"><label htmlFor="contact-reply" className="text-xs font-semibold text-slate-700">Votre réponse sera envoyée à {selectedMessage.email}</label><textarea id="contact-reply" value={replyBody} onChange={(event) => setReplyBody(event.target.value)} required minLength={1} maxLength={5000} rows={5} placeholder="Rédigez votre réponse…" className="mt-2 block w-full resize-y rounded-lg border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-teal-700" /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">La réponse sera envoyée par e-mail et conservée dans l’historique.</p><button type="submit" disabled={sending || !replyBody.trim()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-800 px-4 text-sm font-medium text-white hover:bg-teal-900 disabled:cursor-wait disabled:opacity-50"><Send className="size-4" />{sending ? "Envoi…" : "Envoyer la réponse"}</button></div></form>
          </>}
        </section>
      </div>
    </section>
  );
}

function MessageListItem({ message, selected, onSelect }: { message: ContactInboxMessage; selected: boolean; onSelect: () => void }) {
  const date = new Date(message.created_at);
  const latestReply = message.replies.at(-1);
  return (
    <li><button type="button" onClick={onSelect} aria-current={selected ? "true" : undefined} className={`w-full px-4 py-4 text-left transition ${selected ? "bg-teal-50/70" : "hover:bg-slate-50"}`}><div className="flex items-start gap-3"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${message.read_at ? "bg-transparent" : "bg-teal-600"}`} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className={`truncate text-sm ${message.read_at ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}>{message.name}</p><time className="shrink-0 text-[10px] text-slate-400">{date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</time></div><p className="mt-1 truncate text-xs font-medium text-slate-700">{message.subject}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{message.message}</p><p className="mt-2 text-[10px] text-slate-400">{latestReply?.status === "sent" ? "Répondu" : "Demande reçue"}</p></div></div></button></li>
  );
}
