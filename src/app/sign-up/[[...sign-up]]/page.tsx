'use client';

import { SignUp } from "@clerk/nextjs";

export default function CatchAllSignUp() {
  return <SignUp routing="hash" signInUrl="/sign-in" />;
}
