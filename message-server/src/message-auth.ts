import { getSession } from "@auth/express"
import { Request, Response, NextFunction } from "express";

const AuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [],
}

export async function authenticatedUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = res.locals.session ?? (await getSession(req, AuthConfig))
  if (!session?.user) {
    res.redirect("/login")
  } else {
    next()
  }
}