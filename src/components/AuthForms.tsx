"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useStore } from "./Providers";

const field = "w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black";

/** Only allow redirects to pages of this site. */
function safeNext(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export function LoginForm({ next }: { next: string }) {
  const { login } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const message = await login(email.trim(), password);

    if (message) {
      setError(message);
      setBusy(false);
      return;
    }

    router.push(safeNext(next));
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">
        Email
        <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </label>
      <label className="block text-sm">
        Password
        <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </label>

      {error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-black py-3 font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300"
      >
        {busy ? "Logging in..." : "Log in"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        New here?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-black underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const { register } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const message = await register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });

    if (message) {
      setError(message);
      setBusy(false);
      return;
    }

    router.push(safeNext(next));
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          First name
          <input className={field} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required maxLength={100} autoComplete="given-name" />
        </label>
        <label className="block text-sm">
          Last name
          <input className={field} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required maxLength={100} autoComplete="family-name" />
        </label>
      </div>

      <label className="block text-sm">
        Email
        <input className={field} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required autoComplete="email" />
      </label>
      <label className="block text-sm">
        Phone (optional)
        <input className={field} value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={30} inputMode="tel" autoComplete="tel" />
      </label>
      <label className="block text-sm">
        Password
        <input className={field} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} autoComplete="new-password" />
        <span className="text-xs text-zinc-500">At least 8 characters.</span>
      </label>

      {error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-black py-3 font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300"
      >
        {busy ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-black underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
