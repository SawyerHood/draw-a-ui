'use server'

import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

export async function getContentFromAnthropic(opts: {
	apiKey: string
	messages: any
	model: string
	systemPrompt: string
}) {
	const { apiKey, messages, model, systemPrompt } = opts
	const anthropic = createAnthropic({ apiKey })
	const { text, finishReason, usage } = await generateText({
		model: anthropic(model),
		system: systemPrompt,
		messages,
		maxTokens: 4096,
		temperature: 0,
		seed: 42,
	})

	return { text, finishReason, usage }
}

export async function getContentFromOpenAI(opts: {
	apiKey: string
	messages: any
	model: string
	systemPrompt: string
}) {
	const { apiKey, messages, model, systemPrompt } = opts
	const openai = createOpenAI({ apiKey })
	const { text, finishReason, usage } = await generateText({
		model: openai(model),
		system: systemPrompt,
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
