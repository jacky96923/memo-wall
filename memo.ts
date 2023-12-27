import { randomUUID } from "crypto";
import formidable from "formidable";
import { mkdirSync } from "fs";
import { toStringField, toArray } from "./form";
import { Router } from "express";
import { requireUserLogin } from "./guard";
import "./session";
// import { client } from './db'
import { join } from "path";
import { unlink } from "fs/promises";
import Knex from "knex";

const knexConfig = require("./knexfile");
const knex = Knex(knexConfig[process.env.NODE_ENV || "development"]);

export let memoRouter = Router();

let uploadDir = "uploads";
mkdirSync(uploadDir, { recursive: true });

type Memo = {
  id: number;
  content: string;
  images: string[];
};

memoRouter.post("/memos", (req, res, next) => {
  console.log("uploading...");
  let form = new formidable.Formidable({
    uploadDir,
    multiples: true,
    maxFiles: 10,
    maxFileSize: 5 * 1024 * 1024 * 10,
    filter(part) {
      return part.mimetype?.startsWith("image/") || false;
    },
    filename(_name, _ext, part, form) {
      let uuid = randomUUID();
      let extName = part.mimetype?.split("/").pop();
      return `${uuid}.${extName}`;
    },
  });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    try {
      let content = toStringField(fields.content);
      let imageFiles = toArray(files.images);
      let images = imageFiles.map((file) => file.newFilename);

      if (!content) {
        res.status(400);
        res.json({ error: "Missing memo content" });
        // next(new Error('Missing "content" in request.body'))
        return;
      }

      let result = await knex
        .insert({
          content,
          is_sample: "false",
        })
        .into("memo")
        .returning("id");

      // let result = await client.query(
      //   /* sql */ `
      // insert into memo (content, is_sample) values ($1, false)
      // returning id
      // `,
      //   [content]
      // );
      // row is not needed in result.rows[0].id expect when using raw sql in knex
      let memo_id = result[0].id;

      for (let filename of images) {
        await knex
          .insert({
            memo_id,
            filename,
          })
          .into("image");
      }

      // for (let filename of images) {
      //   await client.query(
      //     /* sql */ `
      //   insert into image (memo_id, filename) values ($1, $2)
      //   `,
      //     [memo_id, filename]
      //   );
      // }

      res.status(201);
      res.json({
        id: memo_id,
        images,
      });
      res.end();
    } catch (error) {
      next(error);
    }
  });
});

memoRouter.get("/memos.js", async (req, res, next) => {
  try {
    type Row = {
      id: number;
      content: string;
      filename: string | null;
    };
    let result = await knex
      .select("memo.id", "memo.content", "image.filename")
      .from("memo")
      .leftJoin("image", "image.memo_id", "memo.id")
      .where("memo.is_sample", false)
      .orderBy("memo.id", "asc")
      .orderBy("image.id", "asc");

    // let result = await client.query(/* sql */ `
    // select
    //   memo.id
    // , memo.content
    // , image.filename
    // from memo
    // left join image on image.memo_id = memo.id
    // where memo.is_sample = false
    // order by memo.id asc
    //        , image.id asc
    // `);

    let rows: Row[] = result;
    let memoMap = new Map<number, Memo>();
    for (let row of rows) {
      let memo = memoMap.get(row.id);
      if (!memo) {
        memo = {
          id: row.id,
          content: row.content,
          images: [],
        };
        memoMap.set(row.id, memo);
      }
      if (row.filename) {
        memo.images.push(row.filename);
      }
    }

    let memoArray: Memo[] = Array.from(memoMap.values());
    // console.log('memos:', memoArray)

    res.write("let memos = ");
    res.write(JSON.stringify(memoArray));
    res.end();
  } catch (error) {
    next(error);
  }
});

memoRouter.delete("/memos/:id", requireUserLogin, async (req, res) => {
  try {
    let id = +req.params.id;
    if (!id) {
      res.status(400);
      res.json({ error: "Invalid memo id" });
      return;
    }
    let result = await knex("image")
      .where("memo_id", id)
      .del()
      .returning("filename");

    // let result = await client.query(
    //   /* sql */ `
    // delete from image where memo_id = $1
    // returning filename
    // `,
    //   [id]
    // );

    let rows = result;
    for (let row of rows) {
      let file = join(uploadDir, row.filename);
      await unlink(file);
    }

    result = await knex("memo").where("id", id).del();
    // result = await client.query(
    //   /* sql */ `
    // delete from memo where id = $1
    // `,
    //   [id]
    // ); rowCount

    if (result.length == 0) {
      res.status(404);
      res.json({ error: "Memo not found" });
      return;
    }

    res.json({});
  } catch (error) {
    res.status(500);
    res.json({ error: String(error) });
  }
});
