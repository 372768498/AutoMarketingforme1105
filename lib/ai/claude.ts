import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.CLAUDE_API_KEY;

if (!apiKey) {
  throw new Error('Missing CLAUDE_API_KEY environment variable');
}

const client = new Anthropic({
  apiKey,
});

export async function callClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  options?: {
    model?: string;
    maxTokens?: number;
  }
) {
  try {
    const message = await client.messages.create({
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 4096,
      messages,
    });

    if (message.content[0].type === 'text') {
      return message.content[0].text;
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    console.error('❌ Claude API Error:', error);
    throw error;
  }
}

export async function testClaude() {
  try {
    const result = await callClaude([
      {
        role: 'user',
        content: 'Say hello in 5 words or less',
      },
    ]);

    console.log('✅ Claude API 工作正常:');
    console.log(result);
    return true;
  } catch (error) {
    console.error('❌ Claude API 测试失败:', error);
    return false;
  }
}
