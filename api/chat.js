export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { message } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        /*
         * TP AI — Provider Flexible Backend
         *
         * The frontend only talks to /api/chat.
         * The provider can be changed using AI_PROVIDER.
         */

        const provider = (
            process.env.AI_PROVIDER || "demo"
        ).toLowerCase();


        // ─────────────────────────────
        // TP PERSONALITY
        // ─────────────────────────────

        const systemPrompt = `
You are TP, the intelligent digital assistant
created by TECH PRO LUXE.

You are intelligent, friendly, practical, calm,
curious, helpful, and occasionally witty.

Help users learn, create, solve problems,
and understand technology.

You specialize in:
- Programming
- Web development
- Computer science
- Cybersecurity
- Artificial intelligence

Explain difficult concepts from beginner to advanced.

Be honest when you are uncertain.
Never invent information simply to sound confident.

Your identity is TP.
Do not claim to be Claude, ChatGPT, Kimi, or JARVIS.

Core principle:
"Think clearly. Build boldly. Help intelligently."
`;


        // ─────────────────────────────
        // DEMO PROVIDER
        // ─────────────────────────────

        if (provider === "demo") {
            return res.status(200).json({
                reply:
                    "I'm TP 🤖. My AI provider isn't connected yet, but my core system is online. Give me a real AI provider and I'll be ready to think."
            });
        }


        // ─────────────────────────────
        // OPENAI PROVIDER
        // ─────────────────────────────

        if (provider === "openai") {

            const apiKey = process.env.OPENAI_API_KEY;

            if (!apiKey) {
                return res.status(500).json({
                    error: "OpenAI API key is not configured."
                });
            }

            const response = await fetch(
                "https://api.openai.com/v1/responses",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },

                    body: JSON.stringify({
                        model:
                            process.env.OPENAI_MODEL || "gpt-5.6-mini",

                        instructions: systemPrompt,

                        input: message
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({
                    error:
                        data.error?.message ||
                        "OpenAI request failed."
                });
            }

            const reply = data.output_text;

            return res.status(200).json({
                reply:
                    reply ||
                    "OpenAI returned an empty response."
            });
        }


        // ─────────────────────────────
        // ANTHROPIC PROVIDER
        // ─────────────────────────────

        if (provider === "anthropic") {

            const apiKey =
                process.env.ANTHROPIC_API_KEY;

            if (!apiKey) {
                return res.status(500).json({
                    error:
                        "Anthropic API key is not configured."
                });
            }

            const response = await fetch(
                "https://api.anthropic.com/v1/messages",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "x-api-key": apiKey,

                        "anthropic-version":
                            "2023-06-01"
                    },

                    body: JSON.stringify({
                        model:
                            process.env.ANTHROPIC_MODEL ||
                            "claude-sonnet-4-6",

                        max_tokens: 1000,

                        system: systemPrompt,

                        messages: [
                            {
                                role: "user",
                                content: message
                            }
                        ]
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({
                    error:
                        data.error?.message ||
                        "Anthropic request failed."
                });
            }

            const reply = data.content
                ?.map(item => item.text || "")
                .join("");

            return res.status(200).json({
                reply:
                    reply ||
                    "Anthropic returned an empty response."
            });
        }


        // ─────────────────────────────
        // UNKNOWN PROVIDER
        // ─────────────────────────────

        return res.status(400).json({
            error:
                `Unsupported AI provider: ${provider}`
        });

    } catch (error) {

        console.error("TP AI error:", error);

        return res.status(500).json({
            error: "TP's AI system encountered an error."
        });
    }
}