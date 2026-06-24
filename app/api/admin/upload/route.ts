import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Vercel Blob client-upload handler. The browser uploads the file straight to
 * Blob storage (bypassing the 4.5MB serverless body limit); this route only
 * issues a short-lived upload token after verifying the caller is an admin.
 * Requires a Blob store on the project (env BLOB_READ_WRITE_TOKEN).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
          throw new Error("Only admins can upload images");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
          maximumSizeInBytes: 8 * 1024 * 1024, // 8MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // no-op; the client receives the URL directly
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Upload failed" },
      { status: 400 },
    );
  }
}
