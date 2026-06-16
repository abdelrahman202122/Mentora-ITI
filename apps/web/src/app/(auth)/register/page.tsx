"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, Loader2, Sparkles, UserRound } from "lucide-react";

import { registerAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerAction, undefined);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-slate-950 sm:px-6">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <Card className="w-full rounded-lg border-slate-200 bg-white/90 p-0 shadow-sm ring-slate-200">
          <CardHeader className="gap-2 px-7 pt-7">
            <div className="flex items-center gap-2 text-indigo-600">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <GraduationCap className="size-5" />
              </div>
              <span className="text-lg font-semibold">Mentora</span>
            </div>

            <div className="pt-2">
              <CardTitle className="text-2xl font-semibold tracking-normal">
                Join Mentora
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-slate-600">
                Start your learning journey today.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-7 pb-7">
            <form action={action} className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <label className="relative flex h-14 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-700 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 has-[:checked]:shadow-sm has-[:checked]:ring-2 has-[:checked]:ring-indigo-500/15">
                  <input
                    defaultChecked
                    className="peer sr-only"
                    name="role"
                    type="radio"
                    value="student"
                  />
                  <span className="flex flex-col items-center gap-1 text-xs font-medium">
                    <UserRound className="size-4" />
                    I am a Student
                  </span>
                </label>

                <label className="relative flex h-14 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-700 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 has-[:checked]:shadow-sm has-[:checked]:ring-2 has-[:checked]:ring-indigo-500/15">
                  <input
                    className="peer sr-only"
                    name="role"
                    type="radio"
                    value="teacher"
                  />
                  <span className="flex flex-col items-center gap-1 text-xs font-medium">
                    <BookOpen className="size-4" />
                    I am a Teacher
                  </span>
                </label>
              </div>

              <div className="space-y-4">
                <FieldError message={state?.errors?.name?.[0]}>
                  <label className="text-xs font-semibold text-slate-700" htmlFor="name">
                    Full name
                  </label>
                  <Input
                    className="mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                  />
                </FieldError>

                <FieldError message={state?.errors?.email?.[0]}>
                  <label className="text-xs font-semibold text-slate-700" htmlFor="email">
                    Email address
                  </label>
                  <Input
                    className="mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    type="email"
                  />
                </FieldError>

                <FieldError message={state?.errors?.password?.[0]}>
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Input
                    className="mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                  />
                </FieldError>
              </div>

              <Button
                className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                disabled={isPending}
                type="submit"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating account
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>

              {state?.success && (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  <Sparkles className="size-4" />
                  Account created successfully.
                </div>
              )}

              <p className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link className="font-semibold text-indigo-600 hover:text-indigo-700" href="/login">
                  Log In
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function FieldError({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <div>
      {children}
      {message && <p className="mt-2 text-xs font-medium text-red-600">{message}</p>}
    </div>
  );
}
