import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Log in" };

async function LoginContent({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { next } = await searchParams;

  return <LoginForm next={typeof next === "string" ? next : "/account"} />;
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Log in</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded bg-zinc-100" />}>
        <LoginContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
