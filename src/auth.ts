import NextAuth, { type NextAuthConfig } from "next-auth"
import Resend from "next-auth/providers/resend"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { isAdminEmail } from "@/lib/admin"
import { senderAddress } from "@/lib/email"

const isDev = process.env.NODE_ENV !== "production"

export const googleSignInEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
// Email sign-in links need somewhere to store verification tokens, i.e. the database.
export const emailSignInEnabled = !!(process.env.RESEND_API_KEY && prisma)

const providers: NextAuthConfig["providers"] = []

if (googleSignInEnabled) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Google verifies email ownership, so linking to an account first created via email link is safe.
      allowDangerousEmailAccountLinking: true,
    })
  )
}

if (emailSignInEnabled) {
  providers.push(Resend({ apiKey: process.env.RESEND_API_KEY, from: senderAddress() }))
}

if (isDev) {
  providers.push(
    Credentials({
      name: "Admin Test Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials.email !== "admin@test.com" || credentials.password !== "admin") return null
        if (prisma) {
          const user = await prisma.user.upsert({
            where: { email: "admin@test.com" },
            create: { email: "admin@test.com", name: "Admin User", role: "ADMIN" },
            update: {},
          })
          return { id: user.id, name: user.name, email: user.email, role: "ADMIN" }
        }
        return { id: "1", name: "Admin User", email: "admin@test.com", role: "ADMIN" }
      },
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  secret: process.env.AUTH_SECRET || (isDev ? "breathewrite-local-dev-secret" : undefined),
  trustHost: true,
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // @ts-expect-error role comes from the Prisma User model / credentials provider
        token.role = isAdminEmail(user.email) ? "ADMIN" : user.role ?? "CUSTOMER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        // @ts-expect-error custom session field
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
})
