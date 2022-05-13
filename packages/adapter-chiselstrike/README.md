# ChiselStrike Adapter -- NextAuth.js

## Getting Started

Install `next-auth` and `@next-auth/chiselstrike-adapter` in your project:
```js
npm install next-auth @next-auth/chiselstrike-adapter
```

Configure NextAuth with the ChiselStrike adapter and a session callback to record the user ID.  In
`pages/api/auth/[...nextauth].js`:
```js
const adapter = new CSAdapter(<url>, <password>)

export default NextAuth({
  adapter,
  /// ...
  callbacks: {
    async session({ session, token, user }) {
      session.userId = user.id
      return session
    }
  }
})

```

When accessing ChiselStrike endpoints, you can provide the user ID value in a `ChiselUID` header.  This is how
ChiselStrike knows which user is logged into the current session.  For example:

```js
await fetch('<url>/<branch>/<endpoint-name>', { headers: { "ChiselUID": session.userId } })
```

## Contributing

Initial setup:
```bash
git clone git@github.com:nextauthjs/next-auth.git
cd next-auth
pnpm i
pnpm build
cd packages/adapter-chiselstrike
pnpm i
```

Before running a build/test cycle, please set up a ChiselStrike backend, either locally or in the cloud.  If locally, please create/edit a `.env` file in the directory where `chiseld` runs and put the following line in it:
```json
{ "CHISELD_AUTH_SECRET" : "1234" }
```
If running a ChiselStrike backend in the cloud, please edit all instances of `new ChiselStrikeAdapter` in the `tests/` directory to reflect your backend's URL and auth secret.

Build and test:
```bash
cd next-auth/packages/adapter-chiselstrike/
pnpm test
```

## License

ISC