import { prisma } from "../../db/prisma";
import crypto from "crypto";

export async function createAccount(email: string, password: string) {
  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");

  return prisma.account.create({
    data: {
      email: email,
      Password: {
        create: {
          hash: hash,
          salt: salt,
        },
      },
    },
  });
}
