"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="w-full max-w-sm rounded-3xl bg-white/90 p-6 shadow-lg shadow-sky-900/10">
      <h1 className="mb-1 text-center font-serif text-xl font-bold uppercase tracking-wide text-sky-950">
        Адмінка DiAnna Guide
      </h1>
      <p className="mb-6 text-center text-sm text-sky-800/70">
        Введіть пароль, щоб керувати контентом
      </p>

      <label className="mb-4 block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Пароль</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
      </label>

      {state.error && (
        <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sky-700 py-3 text-center text-base font-semibold text-white transition-colors enabled:hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Вхід..." : "Увійти"}
      </button>
    </form>
  );
}
