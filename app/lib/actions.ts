'use server'

import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { SYSTEM_PROMPT } from '../prompt'

export async function getContentFromAnthropic(apiKey: string, messages: any, model: string) {
	const anthropic = createAnthropic({ apiKey })
	const { text, finishReason, usage } = await generateText({
		model: anthropic(model),
		system: SYSTEM_PROMPT,
		messages,
		maxTokens: 4096,
		temperature: 0,
		seed: 42,
	})

	return { text, finishReason, usage }
}

export async function getContentFromOpenAI(apiKey: string, messages: any, model: string) {
	const openai = createOpenAI({ apiKey })
	const { text, finishReason, usage } = await generateText({
		model: openai(model),
		system: SYSTEM_PROMPT,
		messages,
		maxTokens: 4096,
		temperature: 0,
		seed: 42,
	})

	return { text, finishReason, usage }
}

export type ResultType = Awaited<
	ReturnType<typeof getContentFromAnthropic> | ReturnType<typeof getContentFromOpenAI>
>
