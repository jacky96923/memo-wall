import { Router } from "express";
import { client } from "./db";
import { HttpError } from "./http.error";
import "./session";

export let userRouter = Router();

type User = {
  username: string;
  password: string;
};

userRouter.post("/login", async (req, res, next) => {
  try {
    // console.log('login with:', req.body)

    let username = req.body.username;
    if (!username) throw new HttpError(400, "Missing username");

    let password = req.body.password;
    if (!username) throw new HttpError(400, "Missing password");

    let result = await client.query(
      /* sql */ `
    select "id" from "users"
    where username = $1 and password = $2
  `,
      [username, password]
    );
    let row = result.rows[0];
    if (!row) throw new HttpError(401, "Wrong username or password");

    req.session.username = username;
    res.json({});
  } catch (error) {
    next(error);
  }
});

userRouter.get("/role", (req, res) => {
  if (req.session.username) {
    res.json({ role: "user", username: req.session.username });
  } else {
    res.json({ role: "guest" });
  }
});

userRouter.post("/logout", (req, res) => {
  // req.session.username = undefined
  req.session.destroy((err) => {
    if (err) {
      res.status(502);
      res.json({ error: "Failed to destroy session" });
    } else {
      res.json({});
    }
  });
});
