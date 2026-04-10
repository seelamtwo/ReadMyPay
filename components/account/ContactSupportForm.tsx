"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  defaultEmail?: string | null;
};

export function ContactSupportForm({ defaultEmail }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject: subject.trim(),
          message: trimmed,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          typeof data.error === "string" && data.error.trim()
            ? data.error.trim()
            : "Could not send your message. Try again later."
        );
        return;
      }
      setStatus("sent");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Check your connection and try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {defaultEmail?.trim() ? (
        <p className="text-sm text-slate-600">
          We will include your account email{" "}
          <span className="font-medium text-slate-800">{defaultEmail.trim()}</span>{" "}
          on the message so we can reply.
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="support-subject">Subject (optional)</Label>
        <Input
          id="support-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Billing question"
          maxLength={200}
          autoComplete="off"
          disabled={status === "sending"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="support-message">Message</Label>
        <textarea
          id="support-message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your question or issue."
          maxLength={8000}
          disabled={status === "sending"}
          className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>

      {status === "sent" ? (
        <p className="text-sm text-emerald-800" role="status">
          Message sent. We will get back to you as soon as we can.
        </p>
      ) : null}
      {status === "error" && errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
