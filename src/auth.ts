import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/password"

const isDev = process.env.NODE_ENV !== "production"

// Customers don't have accounts (they enter name + email at checkout); only the admin signs in.
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || (isDev ? "breathewrite-local-dev-secret" : undefined),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim().toLowerCase()
        const password = String(credentials?.password ?? "")
        if (!username || !password) return null

        if (prisma) {
          const user = await prisma.user.findUnique({ where: { username } })
          if (!user?.passwordHash || user.role !== "ADMIN") return null
          if (!(await verifyPassword(password, user.passwordHash))) return null
          return { id: user.id, name: user.name ?? "Admin", email: user.email, role: "ADMIN" }
        }

        // Local development without a database.
        if (isDev && username === "admin" && password === "admin") {
          return { id: "1", name: "Admin User", email: "admin@test.com", role: "ADMIN" }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // @ts-expect-error role is returned by authorize()
        token.role = user.role
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
  },
})
