"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
  UserRound,
} from "lucide-react";
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

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .regex(/[A-Z]/, "Add at least one uppercase letter.")
      .regex(/[a-z]/, "Add at least one lowercase letter."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectTo = getSafeRedirect(
    searchParams.get("callbackURL") || searchParams.get("redirect"),
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      const result = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        callbackURL: redirectTo,
      });

      if (result.error) {
        toast.error(
          result.error.message || "Registration failed. Please try again.",
        );
        return;
      }

      toast.success("Your BookNook account has been created!");

      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setGoogleLoading(true);

      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
    } catch (error) {
      console.error("Google registration error:", error);
      toast.error("Google registration failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6">
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
              Start Your Journey
            </p>

            <h1 className="text-4xl font-extrabold leading-tight">
              Make room for your next favorite book.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-emerald-50/85">
              Create your account and bring your reading list, personal
              collection, and borrowed books together.
            </p>
          </div>

          <p className="text-xs text-emerald-100/75">
            Discover. Collect. Read.
          </p>
        </div>

        {/* Right Side */}
        <Card className="rounded-none border-0 bg-white py-7 shadow-none sm:py-9">
          <CardHeader className="px-6 sm:px-10">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 md:hidden"
            >
              <BookOpen size={21} />
              BookNook
            </Link>

            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <UserRound size={25} />
            </div>

            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
              Create Your Account
            </CardTitle>

            <CardDescription className="mt-2 text-sm leading-6 text-slate-500">
              Join BookNook and make your reading experience personal.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-10">
            {/* Google Registration */}
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-3 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onClick={handleGoogleRegister}
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
            <div className="my-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">
                  Full Name
                </Label>

                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  aria-invalid={!!errors.name}
                  className="h-11 border-slate-200 focus-visible:ring-emerald-600"
                  {...register("name")}
                />

                {errors.name && (
                  <p className="text-xs font-medium text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                    autoComplete="new-password"
                    placeholder="Create a password"
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
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">
                  Confirm Password
                </Label>

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    aria-invalid={!!errors.confirmPassword}
                    className="h-11 border-slate-200 pr-11 focus-visible:ring-emerald-600"
                    {...register("confirmPassword")}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-emerald-700"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting || googleLoading}
                className="h-11 w-full bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-4 border-t-0 bg-transparent px-6 pt-2 sm:px-10">
            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-emerald-700 hover:text-emerald-800"
              >
                Sign In
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
