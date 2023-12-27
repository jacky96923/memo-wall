import jsonfile from 'jsonfile'
import { client } from './db'
import XLSX from 'xlsx'
import { object, optional, string } from 'cast.ts'

async function main() {
  let workbook = XLSX.readFile('WSP009-exercise.xlsx')
  // console.log('workbook:', workbook)

  let userSheet = workbook.Sheets.user
  // console.log('userSheet:', userSheet)

  let userJSONArray = XLSX.utils.sheet_to_json(userSheet)
  // console.log('userJSON:', userJSON)

  let userParser = object({
    username: string(),
    password: string(),
  })

  for (let userJSON of userJSONArray) {
    // console.log('userJSON:', userJSON)

    let user = userParser.parse(userJSON)
    // console.log('user.email:', user.username)

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

  let memoSheet = workbook.Sheets.memo
  let memoJSONArray = XLSX.utils.sheet_to_json(memoSheet)
  let memoParser = object({
    content: string(),
    image: optional(string()),
  })
  await client.query(/* sql */ `
  delete from memo where is_sample = true
  `)
  for (let memoJSON of memoJSONArray) {
    // console.log('memoJSON:', memoJSON)

    let memo = memoParser.parse(memoJSON)
    // console.log('memo:', memo)

    await client.query(
      /* sql */ `
    		insert into "memo" (content, images, is_sample) values ($1, $2, true)
    	`,
      [memo.content, memo.image],
    )
  }
  let result = await client.query(/* sql */ `
  select from memo
  `)
  console.log('number of memos:', result.rowCount)
}
main()
  .catch(e => console.error(e))
  .finally(() => {
    client.end()
  })
