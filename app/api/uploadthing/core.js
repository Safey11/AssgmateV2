import { createUploadthing } from "uploadthing/next";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const f = createUploadthing();

export const ourFileRouter = {
  receiptUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.email) throw new Error("Unauthorized");
      return { email: session.user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        await connectDB();
        await User.findOneAndUpdate(
          { email: metadata.email },
          {
            pendingPayment: {
              receiptUrl:file.ufsUrl,
              amount: "500",
              submittedAt: new Date(),
              status: "pending",
            },
          }
        );
        console.log("Receipt saved for:", metadata.email);
      } catch (error) {
        console.error("Error saving receipt:", error);
      }
      return { url: file.ufsUrl };
    }),
};