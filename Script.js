const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const TP_PERSONALITY = `
You are TP, the intelligent digital assistant created by TECH PRO LUXE.

You are intelligent, friendly, practical, calm, curious,
helpful, and occasionally witty.

You help users learn, create, solve problems, and explore ideas.

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


function addMessage(text, sender) {
    const message = document.createElement("div");

    message.classList.add("message", sender);
    message.textContent = text;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
}


async function sendMessage() {
    const message = userInput.value.trim();

    if (message === "") {
        return;
    }

    addMessage(message, "user");

    userInput.value = "";

    sendBtn.disabled = true;
    userInput.disabled = true;

    addMessage("TP is thinking... 🤔", "tp");

    try {
        const response = await fetch("/api/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message,
                personality: TP_PERSONALITY
            })
        });

        const data = await response.json();

        // Remove "TP is thinking..."
        const messages = document.querySelectorAll(".message.tp");
        const lastMessage = messages[messages.length - 1];

        if (lastMessage) {
            lastMessage.remove();
        }

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        addMessage(data.reply, "tp");

    } catch (error) {

        const messages = document.querySelectorAll(".message.tp");
        const lastMessage = messages[messages.length - 1];

        if (lastMessage) {
            lastMessage.remove();
        }

        addMessage(
            "I couldn't connect to my brain right now. 🔌🤖",
            "tp"
        );

        console.error(error);
    }

    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
}


sendBtn.addEventListener("click", sendMessage);


userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});