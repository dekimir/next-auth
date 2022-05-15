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
                return su?.session
            },
            user: async (id: string) => {
                return await adapter.getUser(id)
            },
            account: async (providerAccountId: { provider: string; providerAccountId: string }) => {
                const providerFilter = providerAccountId.provider ? `.provider=${providerAccountId.provider}` : ''
                const providerAccountIdFilter = providerAccountId.providerAccountId ? `.providerAccountId=${providerAccountId.providerAccountId}` : ''
                const res = await fetch(`http://localhost:8080/__chiselstrike/auth/accounts?${providerFilter}&${providerAccountIdFilter}`)
                if (!res.ok) { throw new Error(`Fetching account ${JSON.stringify(providerAccountId)}: ${res.statusText}`) }
                const jres = await res.json()
                if (!Array.isArray(jres) || jres.length < 1) {
                    throw new Error(`Fetch result for account ${JSON.stringify(providerAccountId)}: ${JSON.stringify(jres)}`)
                }
                return jres[0]
            },
            verificationToken: async (params: { identifier: string; token: string }) => {
                const idFilter = `.identifier=${params.identifier}`
                const tokenFilter = `.token=${params.token}`
                const res = await fetch(`http://localhost:8080/__chiselstrike/auth/tokens?${idFilter}&${tokenFilter}`)
                if (!res.ok) { throw new Error(`Fetching token ${JSON.stringify(params)}: ${res.statusText}`) }
                const jres = await res.json()
                if (!Array.isArray(jres) || jres.length < 1) {
                    throw new Error(`Fetch result for token ${JSON.stringify(params)}: ${JSON.stringify(jres)}`)
                }
                return jres[0]
            }
        }
    }
)
