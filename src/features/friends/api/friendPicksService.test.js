import test from 'node:test'
import assert from 'node:assert/strict'
import { createFriendPicksService } from './friendPicksService.js'

const now = Date.parse('2026-10-15T12:00:00Z')
const recentPick = {
  id: 11, is_public: true, caption: 'A good everyday find.',
  created_at: '2026-10-14T12:00:00Z', recommendation_code: 'REC-FRIEND-11',
  product: { id: 4, title: 'Everyday bag', is_recommendation_enabled: true, recommendation_commission: 20 },
}

test('loads every page of confirmed friends, deduplicates and keeps zero pick counts', async () => {
  const requested = []
  const api = createFriendPicksService(async (path) => {
    requested.push(path)
    return path.endsWith('page=1')
      ? { data: [{ id: 2, name: 'Zara', public_picks_count: 0 }, { id: 1, name: 'Asha' }], meta: { last_page: 2 } }
      : { data: [{ id: 2, name: 'Zara', public_picks_count: 0 }, { id: 3, name: 'Nabil', avatar: '/avatar.jpg' }], meta: { last_page: 2 } }
  })
  const friends = await api.getAllFriends()
  assert.equal(requested.length, 2)
  assert.deepEqual(friends.map((friend) => friend.id), [1, 3, 2])
  assert.equal(friends[0].picks_count, null)
  assert.equal(friends[1].avatar_url, '/avatar.jpg')
  assert.equal(friends[2].picks_count, 0)
})

test('uses the total from public picks pagination rather than the number on one page', async () => {
  const api = createFriendPicksService(async (path) => {
    assert.match(path, /friend%2Fone\?page=2&per_page=12$/)
    return { data: { picks: [recentPick, { ...recentPick, id: 12, is_public: false }] }, meta: { current_page: 2, last_page: 4, total: 39 } }
  }, { now: () => now })
  const result = await api.getPublicPicks({ username: 'friend/one' }, { page: 2 })
  assert.equal(result.total, 39)
  assert.equal(result.lastPage, 4)
  assert.equal(result.picks.length, 1)
  assert.equal(result.picks[0].personal_caption, recentPick.caption)
  assert.equal(result.picks[0].recommendation_code, recentPick.recommendation_code)
  assert.equal(result.picks[0].is_support_eligible, true)
})

test('does not suggest rewards for expired, disabled or undated recommendations', async () => {
  const api = createFriendPicksService(async () => ({ data: { picks: [
    { ...recentPick, id: 1, created_at: '2026-10-01T12:00:00Z' },
    { ...recentPick, id: 2, product: { ...recentPick.product, is_recommendation_enabled: false } },
    { ...recentPick, id: 3, created_at: null },
  ] } }), { now: () => now })
  const result = await api.getPublicPicks({ id: 1 })
  assert.deepEqual(result.picks.map((pick) => pick.is_support_eligible), [false, false, false])
})

test('limits count requests to four, skips known totals, and keeps failed counts unknown', async () => {
  let active = 0
  let peak = 0
  let calls = 0
  const api = createFriendPicksService(async (path) => {
    calls += 1
    active += 1
    peak = Math.max(peak, active)
    await Promise.resolve()
    active -= 1
    assert.match(path, /page=1&per_page=1$/)
    if (path.includes('/3?')) throw new Error('Temporary failure')
    return { data: { picks: [] }, meta: { total: 17 } }
  })
  const results = new Map()
  await api.populateCounts([
    { id: 0, picks_count: 0 },
    ...Array.from({ length: 7 }, (_, i) => ({ id: i + 1, picks_count: null })),
  ], (id, count) => results.set(id, count))
  assert.equal(calls, 7)
  assert.equal(peak, 4)
  assert.equal(results.has(0), false)
  assert.equal(results.get(3), null)
  assert.equal(results.get(4), 17)
})

test('aborted count requests cannot update a departed friend page', async () => {
  const controller = new AbortController()
  let updates = 0
  const api = createFriendPicksService(async () => {
    await Promise.resolve()
    return { data: { picks: [] }, meta: { total: 5 } }
  })
  const pending = api.populateCounts([{ id: 1, picks_count: null }], () => { updates += 1 }, { signal: controller.signal })
  controller.abort()
  await pending
  assert.equal(updates, 0)
})

test('request failures remain errors, rather than appearing as an empty friend circle', async () => {
  const api = createFriendPicksService(async () => { throw new Error('Service unavailable') })
  await assert.rejects(api.getAllFriends(), /Service unavailable/)
  await assert.rejects(api.getPublicPicks({ id: 1 }), /Service unavailable/)
})
