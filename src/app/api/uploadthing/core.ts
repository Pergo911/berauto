import { createUploadthing } from "uploadthing/next";
import type { FileRouter } from "uploadthing/next";

import { auth } from "@/lib/auth";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  carImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (session?.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const utapi = new UTApi();
