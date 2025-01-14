import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import { chatCompletionsRoutes } from "./routes/chat-completions/route"
import { modelRoutes } from "./routes/models/route"

export const server = new Hono()

server.use(logger())
server.use(cors())

server.get("/", (c) => c.text("Server running"))
server.route("/", chatCompletionsRoutes)
server.route("/", modelRoutes)
