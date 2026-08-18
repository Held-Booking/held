import { finishAuthCallback } from "@/lib/finish-auth";

export async function GET(request: Request) {
  return finishAuthCallback(request, "/auth/update-password");
}
