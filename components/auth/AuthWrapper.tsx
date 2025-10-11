"use client";

import { FC, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

type FormValues = z.infer<typeof schema>;

const authRequest = async (endpoint: string, data: FormValues) => {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Something went wrong");
  }

  return res.json();
};

const AuthWrapper: FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const endpoint = isSignUp
        ? "/api/auth/sign-up/email"
        : "/api/auth/sign-in/email";
      return authRequest(endpoint, data);
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 text-white p-4 rounded-2xl">
            {isSignUp ? <UserPlus size={32} /> : <LogIn size={32} />}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-center text-slate-600 mb-8">
          {isSignUp
            ? "Sign up to manage your invoices"
            : "Sign in to your account"}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={`w-full px-4 py-3 border ${
                errors.email
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-300 focus:ring-slate-900"
              } rounded-lg focus:ring-2 focus:border-transparent transition-all`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className={`w-full px-4 py-3 border ${
                errors.password
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-300 focus:ring-slate-900"
              } rounded-lg focus:ring-2 focus:border-transparent transition-all`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {mutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {mutation.error?.message || "An error occurred."}
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending
              ? "Please wait..."
              : isSignUp
                ? "Sign Up"
                : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-slate-600 hover:text-slate-900 text-sm transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthWrapper;
