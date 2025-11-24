"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-slate-50">
      <div className="p-8 rounded-xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">
          My Todo
        </h1>
        <SignIn routing="hash" signUpUrl="/sign-up" redirectUrl="/main"/>
      </div>
    </div>
  );
}