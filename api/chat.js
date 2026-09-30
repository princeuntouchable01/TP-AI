export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const body = req.body || {};
        const message = typeof body.message === "string" ? body.message.trim() : "";

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const provider = (process.env.AI_PROVIDER || "demo").toLowerCase();

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

        if (provider === "demo") {
            return res.status(200).json({
                reply: generateDemoReply(message)
            });
        }

        if (provider === "openai") {
            const apiKey = process.env.OPENAI_API_KEY;

            if (!apiKey) {
                return res.status(500).json({
                    error: "OpenAI API key is not configured."
                });
            }

            const response = await fetch("https://api.openai.com/v1/responses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                    instructions: systemPrompt,
                    input: message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({
                    error: data.error?.message || "OpenAI request failed."
                });
            }

            const reply = data.output_text || data.output?.[0]?.content?.[0]?.text;

            return res.status(200).json({
                reply: reply || "OpenAI returned an empty response."
            });
        }

        if (provider === "anthropic") {
            const apiKey = process.env.ANTHROPIC_API_KEY;

            if (!apiKey) {
                return res.status(500).json({
                    error: "Anthropic API key is not configured."
                });
            }

            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
                    max_tokens: 1000,
                    system: systemPrompt,
                    messages: [{
                        role: "user",
                        content: message
                    }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({
                    error: data.error?.message || "Anthropic request failed."
                });
            }

            const reply = data.content?.map(item => item.text || "").join("");

            return res.status(200).json({
                reply: reply || "Anthropic returned an empty response."
            });
        }

        return res.status(400).json({
            error: `Unsupported AI provider: ${provider}`
        });
    } catch (error) {
        console.error("TP AI error:", error);

        return res.status(500).json({
            error: "TP's AI system encountered an error."
        });
    }
}

function generateDemoReply(message) {
    const text = message.trim().toLowerCase();

    if (!text) {
        return "I’m here and ready to help.";
    }

    if (/(hello|hi|hey|good morning|good evening)/.test(text)) {
        return "Hello! I’m TP, your digital assistant. What would you like to build, learn, or troubleshoot today?";
    }

    if (/(who are you|what can you do|your purpose|help)/.test(text)) {
        return "I’m TP 🤖, a practical AI assistant built for programming, web development, computer science, cybersecurity, and AI learning. I can explain concepts, help debug code, brainstorm ideas, and guide projects step by step.";
    }

    if (/(javascript|node|react|html|css|web|frontend|backend|api)/.test(text)) {
        return "I can help with that. A solid approach is to break the problem into: 1) understand the goal, 2) inspect the data flow, 3) build the smallest working prototype, and 4) test it before expanding. If you share the exact issue or code, I can help narrow it down quickly.";
    }

    if (/(debug|bug|error|fix|issue)/.test(text)) {
        return "Let’s debug it systematically. Share the error message, expected behavior, and what actually happens. Then I can suggest the likely cause and a quick fix path.";
    }

    if (/(code|write|generate|example|snippet)/.test(text)) {
        return "Absolutely. I can help draft clean code and explain it clearly. For example, if you need a small JavaScript function, I can provide the logic, a minimal example, and tips for making it robust and readable.";
    }

    if (/(thank you|thanks)/.test(text)) {
        return "You’re welcome! I’m happy to help. What would you like to explore next?";
    }

    return `Thanks for the message. I’m TP, and I can help turn this into something practical. The best next step is to clarify the goal, identify the constraints, and build a focused solution from there. If you want, send the exact task or code and I’ll help you work through it.`;
}
