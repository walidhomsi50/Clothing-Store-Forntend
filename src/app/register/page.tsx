import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Create account" };

async function RegisterContent({ searchParams }: { searchParams: PageProps<"/register">["searchParams"] }) {
  const { next } = await searchParams;

  return <RegisterForm next={typeof next === "string" ? next : "/account"} />;
}

export default function RegisterPage(props: PageProps<"/register">) {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Create account</h1>
      <Suspense fallback={<div className="h-80 animate-pulse rounded bg-zinc-100" />}>
        <RegisterContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
