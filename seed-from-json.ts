import jsonfile from 'jsonfile'
import { client } from './db'

async function main() {
  let users = jsonfile.readFileSync('users.json')
  for (let user of users) {
    let result = await client.query(
      /* sql */ `
		select id from "user" where username = $1
		`,
      [user.username],
    )
    let row = result.rows[0]
    if (row) {
      await client.query(
        /* sql */ `
			update "user" set password = $1 where id = $2
			`,
        [user.password, row.id],
      )
    } else {
      await client.query(
        /* sql */ `
			insert into "user" (username, password) values ($1, $2)
		`,
        [user.username, user.password],
      )
    }
  }
}
main()
  .catch(e => console.error(e))
  .finally(() => {
    client.end()
  })
