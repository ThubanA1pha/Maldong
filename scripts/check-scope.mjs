// 내 브랜치가 내 담당 파일만 바꿨는지 검사한다. push 전에 실행한다.
// 사용: npm run scope -- p3     (p1~p5, lead)
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const owner = process.argv[2];
const owners = JSON.parse(readFileSync(new URL("../OWNERS.json", import.meta.url), "utf8"));
if (!owner || !owners[owner]) {
  console.error(`사용: npm run scope -- <${Object.keys(owners).filter((k) => !k.startsWith("_")).join("|")}>`);
  process.exit(2);
}

execSync("git fetch -q origin main", { stdio: "ignore" });
const changed = execSync("git -c core.quotepath=false diff --name-only origin/main...HEAD", { encoding: "utf8" })
  .split("\n").map((s) => s.trim()).filter(Boolean);

const allowed = owners[owner].paths;
const ok = (f) => allowed.some((p) => p === "*" || (p.endsWith("/") ? f.startsWith(p) : f === p));
const bad = changed.filter((f) => !ok(f));

if (bad.length) {
  console.error(`담당(${owner}) 밖의 파일을 바꿨어요. 되돌리거나 통합 담당에게 요청하세요:`);
  for (const f of bad) console.error("  - " + f);
  process.exit(1);
}
console.log(`OK: ${changed.length}개 파일이 모두 ${owner} 담당 범위 안이에요.`);
