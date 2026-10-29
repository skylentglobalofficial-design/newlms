/**
 * Static checks for the September fixture utility. This file does not connect
 * to a database and does not read the application database variables.
 */
import { readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { listLocalMigrations, repoRoot } from "../server/src/lib/migration-history.ts"
import {
  DEDICATED_URL_ENV,
  LOCAL_SOCKET_DIR,
  SEPTEMBER_FIXTURE_MIGRATIONS,
  SEPTEMBER_RELEASE_MIGRATIONS,
  SEPTEMBER_SAMPLE_SQL,
  SOCKET_FLAG,
  assertLocalSocketUrl,
  assertNoOctoberMigrations,
  localSocketUrl,
  newSeptemberDatabaseName,
  quotedOctoberObjectsInSql,
  refusalBeforeConnect,
  selectSeptemberMigrations,
  validateSeptemberTestUrl,
  withDatabaseName,
} from "./create-september-schema-fixture.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const secret = "s3cret-value"
const remote = `postgresql://operator:${secret}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`
const local = `postgresql://skylent:${secret}@127.0.0.1:5432/postgres`

const rejectedRemote = validateSeptemberTestUrl(remote)
assert(!rejectedRemote.ok, "a Supabase pooler URL must be rejected")
assert(!rejectedRemote.reason.includes(secret), "a rejection must not include the password")
assert(!rejectedRemote.reason.includes("postgresql://"), "a rejection must not include a URL")
assert(!rejectedRemote.reason.includes("pooler"), "a rejection must not echo the remote host")

for (const raw of [
  "",
  "not a url",
  "https://127.0.0.1:5432/postgres",
  "postgresql://127.0.0.2:5432/postgres",
  "postgresql://db.abcdref.supabase.co:5432/postgres",
  "postgresql://localhost.supabase.co:5432/postgres",
  "postgresql://127.0.0.1:5432",
  "postgresql://127.0.0.1:5432/",
  "postgresql://127.0.0.1:5432/postgres/extra",
  "postgresql://127.0.0.1:5432/production",
  "postgresql://127.0.0.1:5432/prod",
  "postgresql://127.0.0.1:5432/template0",
  "postgresql://127.0.0.1:5432/template1",
  "postgresql://127.0.0.1:5432/skylent_september_0123456789abcdef",
  "postgresql://postgres.projectref:secret@127.0.0.1:5432/postgres",
  "postgresql://127.0.0.1:5432/postgres?host=example.com",
  "postgresql://127.0.0.1:5432/postgres?schema=other",
  "postgresql://127.0.0.1:5432/my-db",
]) {
  const result = validateSeptemberTestUrl(raw)
  assert(!result.ok, `expected rejection for a non-local or ambiguous URL`)
  assert(!result.reason.includes(secret), "rejection leaked a password")
  assert(!result.reason.includes("postgresql://"), "rejection leaked a URL")
}

for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
  const result = validateSeptemberTestUrl(`postgresql://skylent:${secret}@${host}:5432/postgres`)
  assert(result.ok, `${host} must be accepted`)
  assert(result.target.host === (host === "[::1]" ? "::1" : host), "the local host is preserved without brackets")
  assert(result.target.port === "5432", "the default printed port is 5432")
  assert(result.target.database === "postgres", "the maintenance database name is preserved")
  assert(!JSON.stringify(result.target).includes(secret), "the accepted target must not carry the password")
}
const schemaOk = validateSeptemberTestUrl("postgresql://127.0.0.1:5432/skylent_agent_tmp?schema=public")
assert(schemaOk.ok, "schema=public is the only accepted query")

const productionRefusal = refusalBeforeConnect({
  argv: ["--confirm-local-test-db"],
  dedicatedUrl: local,
  nodeEnv: "production",
})
assert(productionRefusal?.includes("NODE_ENV is production"), "production mode must refuse before connecting")
assert(!productionRefusal?.includes(secret), "production refusal leaked a password")

const missingFlag = refusalBeforeConnect({ argv: [], dedicatedUrl: local, nodeEnv: "development" })
assert(missingFlag?.includes("--confirm-local-test-db"), "the confirmation flag is required")
assert(missingFlag?.includes("No database was contacted"), "a missing flag must not imply a connection")

const missingUrl = refusalBeforeConnect({
  argv: ["--confirm-local-test-db"],
  dedicatedUrl: "  ",
  nodeEnv: "development",
})
assert(missingUrl?.includes(DEDICATED_URL_ENV), "a missing dedicated URL must name that variable")
assert(missingUrl?.includes("not used"), "the refusal must say the application database variables are not used")

const ready = refusalBeforeConnect({
  argv: ["--confirm-local-test-db"],
  dedicatedUrl: local,
  nodeEnv: "development",
})
assert(ready === null, "a confirmed local URL is allowed to proceed to the connection step")

const socketReady = refusalBeforeConnect({
  argv: ["--confirm-local-test-db", SOCKET_FLAG],
  dedicatedUrl: undefined,
  nodeEnv: "development",
  osUser: "postgres",
})
assert(socketReady === null, "socket mode with the postgres OS user can proceed")

const socketWrongUser = refusalBeforeConnect({
  argv: ["--confirm-local-test-db", SOCKET_FLAG],
  dedicatedUrl: "  ",
  nodeEnv: "development",
  osUser: "ubuntu",
})
assert(socketWrongUser?.includes("OS user postgres"), "socket mode must require the peer OS user")
assert(socketWrongUser?.includes("No database was contacted"), "a wrong OS user must not imply a connection")

const socketWithUrl = refusalBeforeConnect({
  argv: ["--confirm-local-test-db", SOCKET_FLAG],
  dedicatedUrl: remote,
  nodeEnv: "development",
  osUser: "postgres",
})
assert(socketWithUrl?.includes("does not accept"), "socket mode must reject a dedicated URL")
assert(!socketWithUrl?.includes(secret), "socket refusal leaked a password")
assert(!socketWithUrl?.includes("postgresql://"), "socket refusal leaked a URL")

const maintenanceSocket = localSocketUrl("postgres")
assertLocalSocketUrl(maintenanceSocket, "postgres")
const parsedSocket = new URL(maintenanceSocket)
assert(parsedSocket.hostname === "localhost", "the placeholder host is localhost")
assert(parsedSocket.port === "", "socket mode must not set a TCP port")
assert(parsedSocket.searchParams.get("host") === LOCAL_SOCKET_DIR, "the effective host is the socket directory")
assert(parsedSocket.searchParams.get("host")?.startsWith("/"), "the socket host is a path")
assert(!parsedSocket.password, "socket mode has no password")

const fixtureSocket = localSocketUrl("skylent_september_0123456789abcdef")
assertLocalSocketUrl(fixtureSocket, "skylent_september_0123456789abcdef")

for (const unsafe of [
  "postgresql://postgres@127.0.0.1:5432/postgres?host=/var/run/postgresql&sslmode=disable",
  "postgresql://postgres@localhost:5432/postgres?host=/var/run/postgresql&sslmode=disable",
  `postgresql://postgres@localhost/postgres?host=${LOCAL_SOCKET_DIR}`,
  "postgresql://postgres@aws-0-ap-northeast-1.pooler.supabase.com/postgres?host=/var/run/postgresql&sslmode=disable",
  "postgresql://postgres@localhost/postgres?host=localhost&sslmode=disable",
  "postgresql://postgres@localhost/postgres?host=/tmp&sslmode=disable",
]) {
  let rejected = false
  try {
    assertLocalSocketUrl(unsafe, "postgres")
  } catch {
    rejected = true
  }
  assert(rejected, "socket checks must reject a TCP or remote target")
}

const root = repoRoot()
const release = listLocalMigrations(join(root, "prisma", "migrations"))
const fixtureDir = join(root, "scripts", "fixtures", "production-only-migrations")
const fixtures = readdirSync(fixtureDir).filter((name) => name !== "migration_lock.toml")
const selected = selectSeptemberMigrations(release, fixtures)
assert(selected.length === SEPTEMBER_RELEASE_MIGRATIONS.length + SEPTEMBER_FIXTURE_MIGRATIONS.length, "twelve September migrations are selected")
assert(selected.every((name) => name.startsWith("202609")), "every selected migration is dated September")
assertNoOctoberMigrations(selected)
for (const name of release.filter((item) => item.startsWith("202610"))) {
  assert(!selected.includes(name), `${name} must not be selected`)
}
const withOctoberNoise = selectSeptemberMigrations([...release, "20261004000000_skylent_additions"], fixtures)
assert(!withOctoberNoise.some((name) => name.startsWith("202610")), "an October name in the input is ignored")

let missingThrew = false
try {
  selectSeptemberMigrations(release.filter((name) => name !== "20260905120000_init"), fixtures)
} catch (error) {
  missingThrew = error instanceof Error && error.message.includes("20260905120000_init")
}
assert(missingThrew, "a missing September migration must abort selection")

let extraThrew = false
try {
  selectSeptemberMigrations([...release, "20260930120000_unreviewed"], fixtures)
} catch (error) {
  extraThrew = error instanceof Error && error.message.includes("20260930120000_unreviewed")
}
assert(extraThrew, "an unreviewed pre-October folder must abort selection")

const combined = selected
  .map((name) => {
    const base = SEPTEMBER_RELEASE_MIGRATIONS.includes(name as (typeof SEPTEMBER_RELEASE_MIGRATIONS)[number])
      ? join(root, "prisma", "migrations")
      : fixtureDir
    return readFileSync(join(base, name, "migration.sql"), "utf8")
  })
  .join("\n")
assert(quotedOctoberObjectsInSql(combined).length === 0, "September SQL must not name an October table")
assert(!/202610\d{6}/.test(combined), "September SQL must not contain an October migration id")

for (const sql of SEPTEMBER_SAMPLE_SQL) {
  assert(!/202610|_prisma_migrations|password|DATABASE_URL|DIRECT_URL/i.test(sql), "sample SQL must stay free of secrets and October history")
}

const generated = newSeptemberDatabaseName("0123456789abcdef")
assert(generated === "skylent_september_0123456789abcdef", "fixture names have a fixed local prefix")
const rewritten = new URL(withDatabaseName(local, generated))
assert(rewritten.pathname === `/${generated}`, "Prisma is pointed at the generated database")
assert(rewritten.hostname === "127.0.0.1", "the host is unchanged")
assert(rewritten.password === secret, "the local password is preserved only inside the unprinted URL")
let rejectedName = false
try {
  withDatabaseName(local, "postgres")
} catch {
  rejectedName = true
}
assert(rejectedName, "Prisma must not be pointed at the maintenance database")

const sourcePath = join(dirname(fileURLToPath(import.meta.url)), "create-september-schema-fixture.ts")
const source = readFileSync(sourcePath, "utf8")
assert(!source.includes("process.env.DATABASE_URL"), "the utility must not read DATABASE_URL")
assert(!source.includes("process.env.DIRECT_URL"), "the utility must not read DIRECT_URL")
assert(!source.includes("test-production-migration-replay"), "the utility must not call the full replay")
assert(!source.includes("DROP DATABASE"), "the utility must not drop a database")
assert(!source.includes("migrate resolve"), "the utility must not resolve migration history")
assert(!source.includes('INSERT INTO "_prisma_migrations"'), "the utility must not write migration history by hand")
assert(source.includes('["migrate", "deploy"') || source.includes('"migrate", "deploy"'), "September SQL is applied with migrate deploy")
assert(source.includes(DEDICATED_URL_ENV), "the dedicated variable is the only accepted input")

const replay = readFileSync(join(root, "scripts", "test-production-migration-replay.ts"), "utf8")
assert(replay.includes('run(["migrate", "deploy"])'), "the existing replay script was not rewritten")
assert(!replay.includes("SKYLENT_SEPTEMBER_TEST_DATABASE_URL"), "the existing replay script was not given this variable")

console.log("september-schema-fixture ok")
