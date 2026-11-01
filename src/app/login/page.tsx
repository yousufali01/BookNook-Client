"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectTo = getSafeRedirect(
    searchParams.get("callbackURL") || searchParams.get("redirect"),
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: redirectTo,
      });

      if (result.error) {
        toast.error(result.error.message || "Login failed. Please try again.");
        return;
      }

      toast.success("Welcome back to BookNook!");

      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 md:grid-cols-2">
        {/* Left Side */}
        <div className="hidden flex-col justify-between bg-emerald-700 p-10 text-white md:flex">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <BookOpen size={27} />
            </span>

            <span className="text-2xl font-extrabold tracking-tight">
              BookNook
            </span>
          </Link>

          <div className="py-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
              Your Reading Corner
            </p>

            <h1 className="text-4xl font-extrabold leading-tight">
              Every book opens a new world.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-emerald-50/85">
              Sign in to manage your collection, discover new reads, and
              continue your reading journey with BookNook.
            </p>
          </div>

          <p className="text-xs text-emerald-100/75">
            Discover. Collect. Read.
          </p>
        </div>

        {/* Right Side */}
        <Card className="rounded-none border-0 bg-white py-8 shadow-none sm:py-10">
          <CardHeader className="px-6 sm:px-10">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 md:hidden"
            >
              <BookOpen size={21} />
              BookNook
            </Link>

            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <BookOpen size={25} />
            </div>

            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome Back
            </CardTitle>

            <CardDescription className="mt-2 text-sm leading-6 text-slate-500">
              Enter your details to access your BookNook account.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-10">
            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-3 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onClick={handleGoogleLogin}
              disabled={googleLoading || isSubmitting}
            >
              {googleLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <FcGoogle className="size-5" />
              )}
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email Address
                </Label>

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  className="h-11 border-slate-200 focus-visible:ring-emerald-600"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-xs font-medium text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={!!errors.password}
                    className="h-11 border-slate-200 pr-11 focus-visible:ring-emerald-600"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-emerald-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs font-medium text-red-600">
                    {errors.password.message}
                  </p>
                )}

                {/* Forgot Password (UI only) */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      toast(
                        "Password reset is not available on BookNook yet. Please try again with the correct password.",
                        { icon: "ℹ️", duration: 4000 },
                      )
                    }
                    className="text-xs font-semibold text-slate-500 transition hover:text-emerald-700"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || googleLoading}
                className="h-11 w-full bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-4 border-t-0 bg-transparent px-6 pt-2 sm:px-10">
            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-emerald-700 hover:text-emerald-800"
              >
                Create an Account
              </Link>
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-emerald-700"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
