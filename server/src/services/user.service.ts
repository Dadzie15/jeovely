import { HttpError } from "../utils/http-error.js"
import { Prisma } from "../generated/prisma/client.js"
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js"
import { getDb } from "./database.js"
import { hashPassword, verifyAgainstDummy, verifyPassword } from "./password.service.js"

/** The only user fields ever sent to clients. Never includes passwordHash. */
export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
} as const satisfies Prisma.UserSelect

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>

const emailTaken = () => new HttpError(409, "EMAIL_TAKEN", "An account with this email already exists")

export async function registerUser(input: RegisterInput): Promise<SafeUser> {
  const passwordHash = await hashPassword(input.password)
  try {
    return await getDb().user.create({
      data: { name: input.name, email: input.email, passwordHash },
      select: safeUserSelect,
    })
  } catch (err) {
    // The unique index on users.email is the source of truth, including for concurrent sign-ups.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") throw emailTaken()
    throw err
  }
}

const invalidCredentials = () => new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password")

/** Same error and similar timing whether the email is unknown or the password is wrong. */
export async function authenticateUser(input: LoginInput): Promise<SafeUser> {
  const user = await getDb().user.findUnique({
    where: { email: input.email },
    select: { ...safeUserSelect, passwordHash: true },
  })

  if (!user?.passwordHash) {
    await verifyAgainstDummy(input.password)
    throw invalidCredentials()
  }
  if (!(await verifyPassword(user.passwordHash, input.password))) throw invalidCredentials()

  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, createdAt: user.createdAt }
}
