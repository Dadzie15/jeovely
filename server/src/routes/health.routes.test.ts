import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"

import { disconnectDb } from "../services/database.js"
import { request, startTestServer } from "../test/helpers.js"

describe("existing API routes", () => {
  let api: Awaited<ReturnType<typeof startTestServer>>

  before(async () => {
    api = await startTestServer()
  })
  after(async () => {
    await api.close()
    await disconnectDb()
  })

  it("GET /health reports the API and a connected database", async () => {
    const res = await request<{ success: true; data: { status: string; database: string } }>(`${api.baseUrl}/health`)
    assert.equal(res.status, 200)
    assert.equal(res.body.data.status, "ok")
    assert.equal(res.body.data.database, "connected")
  })

  it("unknown routes return 404 in the standard envelope", async () => {
    const res = await request<{ success: false; error: { code: string } }>(`${api.baseUrl}/nope`)
    assert.equal(res.status, 404)
    assert.equal(res.body.error.code, "NOT_FOUND")
  })

  it("planned modules still return 501", async () => {
    const res = await request<{ success: false; error: { code: string } }>(`${api.baseUrl}/workspaces`)
    assert.equal(res.status, 501)
  })
})
