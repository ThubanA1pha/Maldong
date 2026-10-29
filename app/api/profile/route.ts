// 담당: ④ 프로필 화면 담당
import { readJson, withUser } from "@/lib/api";
import { getProfile, updateProfile } from "@/lib/service";

export async function GET() {
  return withUser((id) => getProfile(id));
}

export async function PUT(req: Request) {
  return withUser(async (id) => {
    const { usualBedtime = "", sensitivity = "" } = await readJson(req);
    await updateProfile(id, String(usualBedtime), sensitivity);
  });
}
