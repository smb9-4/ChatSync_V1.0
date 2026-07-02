console.log("Content script loaded at:", location.href);
console.log(
  "Messages found:",
  document.querySelectorAll(
    "[data-message-author-role]"
  ).length
);



async function getMessages() {
  
  console.log(
    "Inside getMessages:",
    document.querySelectorAll("[data-message-author-role]").length
  );

  for (let i = 0; i < 20; i++) {
    const nodes = document.querySelectorAll(
      "[data-message-author-role]"
    );

    if (nodes.length > 0) {
      const messages = [];

      nodes.forEach((node) => {
        messages.push({
          role: node.getAttribute(
            "data-message-author-role"
          ),
          text: node.innerText.trim()
        });
      });

      return messages;
    }

    await new Promise(resolve =>
      setTimeout(resolve, 300)
    );
  }

  return [];
}
function generateSummary(messages) {
  const userMessages = messages
    .filter(m => m.role === "user")
    .map(m => m.text);

  const assistantMessages = messages
    .filter(m => m.role === "assistant")
    .map(m => m.text);

  const lastUser =
    userMessages[userMessages.length - 1] || "";

  const lastAssistant =
    assistantMessages[assistantMessages.length - 1] || "";

  return `
AI CHAT SUMMARY

USER'S LAST REQUEST:
${lastUser}

ASSISTANT'S LAST RESPONSE:
${lastAssistant}

TOTAL MESSAGES:
${messages.length}

CONTINUE PROMPT:
Continue from the user's last request while preserving all previous context.
`.trim();
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === "getChat") {
      getMessages().then((messages) => {
        sendResponse({
          chat: generateSummary(messages)
        });
      });

      return true;
    }
  }
);