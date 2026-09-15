export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const response = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01"
                },

                body: JSON.stringify({
                    model: "claude-sonnet-4-6",
                    max_tokens: 1000,

                    system: `
You are TP, the intelligent digital assistant
created by TECH PRO LUXE.

Be intelligent, friendly, practical, calm,
curious, and occasionally witty.

Help users learn, create, solve problems,
and understand technology.

You specialize in programming, web development,
computer science, cybersecurity, and AI.

Explain difficult concepts from beginner to advanced.

Be honest when you are uncertain.
Never invent information simply to sound confident.

Your identity is TP.
Do not claim to be Claude, ChatGPT, Kimi, or JARVIS.

Core principle:
"Think clearly. Build boldly. Help intelligently."
`,

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
                error: data.error?.message || "AI request failed"
            });
        }

        const reply = data.content
            ?.map(item => item.text || "")
            .join("");

        return res.status(200).json({
            reply: reply || "TP couldn't generate a response."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "TP's brain encountered an error."
        });
    }
}