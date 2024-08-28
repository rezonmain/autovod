import { APP_COOKIES } from "../const.js";
import { googleAuth } from "../modules/google-auth.js";
import { empty } from "../utils/utils.js";

export async function withAuth(req, res, next) {
  const authToken = req.cookies?.[APP_COOKIES.CLIENT_AUTH_TOKEN] ?? "";

  if (empty(authToken)) {
    return res.redirect("/dashboard/auth");
  }

  if (await googleAuth.verifyToken(authToken)) {
    return next();
  }

  return res.sendStatus(401);
}
