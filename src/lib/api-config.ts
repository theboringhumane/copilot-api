import type { ChatCompletionsPayload } from "~/services/copilot/create-chat-completions"

import type { State } from "./state"

export const standardHeaders = () => ({
  "content-type": "application/json",
  accept: "application/json",
})

export const copilotBaseUrl = (state: State) =>
  `https://api.${state.accountType}.githubcopilot.com`
export const copilotHeaders = (
  state: State,
  payload?: ChatCompletionsPayload,
) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${state.copilotToken}`,
    "content-type": standardHeaders()["content-type"],
    "copilot-integration-id": "vscode-chat",
    "editor-version": `vscode/${state.vsCodeVersion}`,
    "editor-plugin-version": "copilot-chat/0.24.1",
    "openai-intent": "conversation-panel",
    "x-github-api-version": "2024-12-15",
    "x-request-id": Math.random().toString(36).slice(2),
    "x-vscode-user-agent-library-version": "electron-fetch",
  }

  // Add Copilot-Vision-Request header if any message contains image content
  if (
    payload?.messages.some(
      (message) =>
        Array.isArray(message.content)
        && message.content.some((part) => part.type === "image_url"),
    )
  ) {
    headers["Copilot-Vision-Request"] = "true"
    headers["Copilot-Vision-Request-Id"] = Math.random().toString(36).slice(2)
  }

  return headers
}

export const GITHUB_API_BASE_URL = "https://api.github.com"
export const githubHeaders = (state: State) => ({
  ...standardHeaders(),
  authorization: `token ${state.githubToken}`,
  "editor-version": `vscode/${state.vsCodeVersion}`,
  "editor-plugin-version": "copilot-chat/0.24.1",
  "user-agent": "GitHubCopilotChat/0.24.1",
  "x-github-api-version": "2024-12-15",
  "x-vscode-user-agent-library-version": "electron-fetch",
})

export const GITHUB_BASE_URL = "https://github.com"
export const GITHUB_CLIENT_ID = "Iv1.b507a08c87ecfe98"
export const GITHUB_APP_SCOPES = ["read:user"].join(" ")
