"use client";

import { useActionState } from "react";
import Image from "next/image";
import { loginAction, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/Logo.jpeg"
            alt="Skarbarber"
            width={120}
            height={120}
            className="rounded-full"
            priority
          />
          <h1 className="text-2xl font-bold text-white">Skarbarber</h1>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {state?.error && (
            <p className="text-red-400 text-sm text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
