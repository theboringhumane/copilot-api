import type { Context } from "hono"

import { streamSSE, type SSEMessage } from "hono/streaming"

import { awaitApproval } from "~/lib/approval"
import { isNullish } from "~/lib/is-nullish"
import { checkRateLimit } from "~/lib/rate-limit"
import { state } from "~/lib/state"
import {
  createChatCompletions,
  type ChatCompletionResponse,
  type ChatCompletionsPayload,
} from "~/services/copilot/create-chat-completions"

export async function handleCompletion(c: Context) {
  await checkRateLimit(state)

  let payload = await c.req.json<ChatCompletionsPayload>()

  if (state.manualApprove) await awaitApproval()

  if (isNullish(payload.max_tokens)) {
    const selectedModel = state.models?.data.find(
      (model) => model.id === payload.model,
    )

    payload = {
      ...payload,
      max_tokens: selectedModel?.capabilities.limits.max_output_tokens,
    }
  }

  const response = await createChatCompletions(payload)

  if (isNonStreaming(response)) {
    return c.json(response)
  }

  return streamSSE(c, async (stream) => {
    for await (const chunk of response) {
      await stream.writeSSE(chunk as SSEMessage)
    }
  })
}

const isNonStreaming = (
  response: Awaited<ReturnType<typeof createChatCompletions>>,
): response is ChatCompletionResponse => Object.hasOwn(response, "choices")
