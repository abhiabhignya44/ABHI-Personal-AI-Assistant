// console.log("SIRI JavaScript connected successfully!");

const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const chatArea = document.getElementById("chat-area");
const voiceButton = document.getElementById("voice-button");

let isListening = false;

// Safely format inline Markdown without inserting raw HTML.
function formatInlineText(container, text) {
    const pattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_)/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        container.appendChild(
            document.createTextNode(text.slice(lastIndex, match.index))
        );

        const token = match[0];
        let element;

        if (token.startsWith("**") || token.startsWith("__")) {
            element = document.createElement("strong");
            element.textContent = token.slice(2, -2);
        } else if (token.startsWith("`")) {
            element = document.createElement("code");
            element.textContent = token.slice(1, -1);
        } else {
            element = document.createElement("em");
            element.textContent = token.slice(1, -1);
        }

        container.appendChild(element);
        lastIndex = pattern.lastIndex;
    }

    container.appendChild(
        document.createTextNode(text.slice(lastIndex))
    );
}

// Convert common Markdown blocks into safe HTML elements.
function formatMessage(container, message) {
    const lines = message.replace(/\r\n?/g, "\n").split("\n");

    let paragraph = [];
    let listElement = null;
    let codeElement = null;

    function flushParagraph() {
        if (!paragraph.length) return;

        const p = document.createElement("p");
        formatInlineText(p, paragraph.join("\n"));
        container.appendChild(p);
        paragraph = [];
    }

    function closeList() {
        listElement = null;
    }

    function flushParagraphAndList() {
        flushParagraph();
        closeList();
    }

    lines.forEach((line) => {
        const trimmed = line.trim();

        // Support fenced code blocks.
        if (trimmed.startsWith("```")) {
            flushParagraphAndList();

            if (codeElement) {
                codeElement = null;
            } else {
                codeElement = document.createElement("code");
                codeElement.className = "formatted-code";
                container.appendChild(codeElement);
            }
            return;
        }

        if (codeElement) {
            codeElement.appendChild(
                document.createTextNode(line + "\n")
            );
            return;
        }

        if (!trimmed) {
            flushParagraphAndList();
            return;
        }

        // Support Markdown headings.
        const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
        if (headingMatch) {
            flushParagraphAndList();

            const heading = document.createElement(
                `h${headingMatch[1].length + 2}`
            );
            formatInlineText(heading, headingMatch[2]);
            container.appendChild(heading);
            return;
        }

        // Support horizontal separators.
        if (/^([-*_]\s*){3,}$/.test(trimmed)) {
            flushParagraphAndList();
            container.appendChild(document.createElement("hr"));
            return;
        }

        // Support bullet and numbered lists.
        const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);
        const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);

        if (unorderedMatch || orderedMatch) {
            flushParagraph();

            const type = unorderedMatch ? "ul" : "ol";

            if (!listElement || listElement.tagName.toLowerCase() !== type) {
                closeList();
                listElement = document.createElement(type);
                container.appendChild(listElement);
            }

            const li = document.createElement("li");
            formatInlineText(
                li,
                (unorderedMatch || orderedMatch)[1]
            );
            listElement.appendChild(li);
            return;
        }

        closeList();
        paragraph.push(line);
    });

    flushParagraphAndList();

    // Gracefully close an unfinished code block.
    if (codeElement) {
        codeElement.className = "formatted-code";
    }
}

// Display a message in the chat.
function addMessage(sender, message, className) {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${className}`;

    const label = document.createElement("strong");
    label.textContent = `${sender}:`;

    const content = document.createElement("div");
    content.className = "message-content";
    formatMessage(content, message);

    messageElement.appendChild(label);
    messageElement.appendChild(content);

    // Add voice controls only to ABHI's answers.
    if (sender === "ABHI") {
        const controls = document.createElement("div");
        controls.className = "voice-controls";

        const speakButton = document.createElement("button");
        speakButton.type = "button";
        speakButton.textContent = "🔊";
        speakButton.title = "Read this answer aloud";
        speakButton.setAttribute("aria-label", "Read answer aloud");

        speakButton.addEventListener("click", function () {
            if (!("speechSynthesis" in window)) {
                addMessage(
                    "ABHI",
                    "Speech output is not supported in this browser.",
                    "assistant-message"
                );
                return;
            }

            window.speechSynthesis.cancel();

            const speech = new SpeechSynthesisUtterance(message);
            speech.lang = "en-IN";
            speech.rate = 1;
            speech.pitch = 1;

            window.speechSynthesis.speak(speech);
        });

        const stopButton = document.createElement("button");
        stopButton.type = "button";
        stopButton.textContent = "⏹️";
        stopButton.title = "Stop speaking";
        stopButton.setAttribute("aria-label", "Stop speaking");

        stopButton.addEventListener("click", function () {
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        });

        controls.appendChild(speakButton);
        controls.appendChild(stopButton);
        messageElement.appendChild(controls);
    }

    chatArea.appendChild(messageElement);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Display the thinking indicator.
function addThinkingIndicator() {
    const thinkingElement = document.createElement("div");
    thinkingElement.className =
        "message assistant-message thinking-message";

    const label = document.createElement("strong");
    label.textContent = "ABHI:";

    const text = document.createElement("p");
    text.textContent = "ABHI is analyzing your question...";

    thinkingElement.appendChild(label);
    thinkingElement.appendChild(text);
    chatArea.appendChild(thinkingElement);

    chatArea.scrollTop = chatArea.scrollHeight;

    return thinkingElement;
}

// Send a message to ABHI.
async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message || sendButton.disabled) {
        return;
    }

    addMessage("You", message, "user-message");
    messageInput.value = "";
    sendButton.disabled = true;

    const thinkingElement = addThinkingIndicator();

    try {
        const csrfToken = document.querySelector(
            "#csrf-form input[name='csrfmiddlewaretoken']"
        )?.value;

        if (!csrfToken) {
            throw new Error("CSRF token not found. Refresh the page.");
        }

        const response = await fetch("/chat/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-CSRFToken": csrfToken
            },
            body: new URLSearchParams({
                message: message
            })
        });

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error("The server returned an invalid response.");
        }

        if (!response.ok) {
            throw new Error(
                data.reply || `Server error (${response.status}).`
            );
        }

        if (typeof data.reply !== "string") {
            throw new Error("ABHI returned an unexpected response.");
        }

        thinkingElement.remove();
        addMessage("ABHI", data.reply, "assistant-message");

    } catch (error) {
        thinkingElement.remove();

        addMessage(
            "ABHI",
            `Sorry, I couldn't process your message. ${error.message}`,
            "assistant-message"
        );

        console.error("Chat error:", error);

    } finally {
        thinkingElement.remove();
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Send using the button.
sendButton.addEventListener("click", sendMessage);

// Send by pressing Enter.
messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// Configure microphone input.
if (
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window
) {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    voiceButton.addEventListener("click", function () {
        if (isListening) {
            recognition.stop();
            return;
        }

        try {
            recognition.start();
            isListening = true;
            voiceButton.textContent = "🎙️ Listening...";
            voiceButton.title = "Listening — click to stop";
        } catch (error) {
            console.error("Could not start voice recognition:", error);
            addMessage(
                "ABHI",
                "Couldn't start the microphone. Please try again.",
                "assistant-message"
            );
        }
    });

    recognition.onresult = function (event) {
        const spokenText = event.results[0][0].transcript;
        messageInput.value = spokenText;
        messageInput.focus();
    };

    recognition.onerror = function (event) {
        console.error("Voice recognition error:", event.error);

        if (event.error === "not-allowed") {
            addMessage(
                "ABHI",
                "Microphone access was denied. Allow microphone access in your browser settings.",
                "assistant-message"
            );
        } else if (
            event.error !== "no-speech" &&
            event.error !== "aborted"
        ) {
            addMessage(
                "ABHI",
                "I couldn't recognize your speech. Please try again.",
                "assistant-message"
            );
        }
    };

    recognition.onend = function () {
        isListening = false;
        voiceButton.disabled = false;
        voiceButton.textContent = "🎤";
        voiceButton.title = "Speak your message";
    };

} else {
    voiceButton.addEventListener("click", function () {
        addMessage(
            "ABHI",
            "Speech recognition isn't supported in this browser. Please try Google Chrome.",
            "assistant-message"
        );
    });
}