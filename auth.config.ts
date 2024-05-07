import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import type { NextAuthConfig } from "next-auth";
 
export default { providers: [GitHub, Google] } satisfies NextAuthConfig