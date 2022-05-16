import { runBasicTests } from "@next-auth/adapter-test"
import { ChiselStrikeAdapter } from "../src"
import fetch from "cross-fetch"

const adapter = new ChiselStrikeAdapter('http://localhost:8080', '1234');

runBasicTests(
    {
        adapter,
        db: {
            connect: async () => {
                await adapter.deleteEverything()
            },
            session: async (sessionToken: string) => {
                const su = await adapter.getSessionAndUser(sessionToken);
                return su ? su.session : null
            },
            user: async (id: string) => {
                return await adapter.getUser(id)
            },
            account: async (providerAccountId: { provider: string; providerAccountId: string }) => {
                const providerFilter = providerAccountId.provider ? `.provider=${providerAccountId.provider}` : ''
                const providerAccountIdFilter = providerAccountId.providerAccountId ? `.providerAccountId=${providerAccountId.providerAccountId}` : ''
                const res = await adapter.secFetch(adapter.accounts(`?${providerFilter}&${providerAccountIdFilter}`))
                if (!res.ok) { throw new Error(`Fetching account ${JSON.stringify(providerAccountId)}: ${res.statusText}`) }
                const jres = await res.json()
                if (!Array.isArray(jres)) {
                    throw new Error(`Fetch result for account ${JSON.stringify(providerAccountId)}: ${JSON.stringify(jres)}`)
                }
                return jres.length < 1 ? null : jres[0]
            },
            verificationToken: async (params: { identifier: string; token: string }) => {
                const idFilter = `.identifier=${params.identifier}`
                const tokenFilter = `.token=${params.token}`
                const res = await adapter.secFetch(adapter.tokens(`?${idFilter}&${tokenFilter}`))
                if (!res.ok) { throw new Error(`Fetching token ${JSON.stringify(params)}: ${res.statusText}`) }
                const jres = await res.json()
                if (!Array.isArray(jres)) {
                    throw new Error(`Fetch result for token ${JSON.stringify(params)}: ${JSON.stringify(jres)}`)
                }
                if (jres.length < 1) { return null }
                let token = { ...jres[0], expires: new Date(jres[0].expires) }
                delete token.id
                return token
            }
        }
    }
)
