import { client } from './db'

async function main() {
  let result = await client.query(/* sql */ `
    select id, images from memo
    where images is not null
      and images <> ''
  `)

  let memos = result.rows

  for (let memo of memos) {
    let images = memo.images.split(',')
    for (let filename of images) {
      await client.query(
        /* sql */ `
		insert into "image" (memo_id, filename)
		values ($1, $2)
		`,
        [memo.id, filename],
      )
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => client.end())
