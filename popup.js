document.addEventListener('DOMContentLoaded', () => {
  // --- EXTERNAL CHAT PLATFORM LAUNCH LOGIC ---
  const platformLinks = document.querySelectorAll('.launch-link');
  platformLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const destination = link.getAttribute('href');
      
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url: destination });
      } else {
        window.open(destination, '_blank');
      }
    });
  });

  // --- RAW CHAT COPY UTILITY ---
  document.getElementById("rawBtn").addEventListener("click", async () => {
    const statusEl = document.getElementById("status");
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const nodes = document.querySelectorAll("[data-message-author-role]");
          return Array.from(nodes).map(node => {
            const role = node.getAttribute("data-message-author-role");
            const text = node.innerText?.trim();
            return role && text ? `${role.toUpperCase()}: ${text}` : null;
          }).filter(Boolean).join("\n\n");
        }
      });

      const rawText = result?.[0]?.result || "";
      if (!rawText) {
        statusEl.style.color = "#ef4444"; // Tech Red
        statusEl.textContent = "ERR: NO_CHAT_FOUND";
        return;
      }

      await navigator.clipboard.writeText(rawText);
      statusEl.style.color = "#10b981"; // Cyber Green
      statusEl.textContent = "SUCCESS: RAW_CHAT_COPIED";
    } catch (err) {
      console.error(err);
      statusEl.style.color = "#ef4444";
      statusEl.textContent = "ERR: COPY_FAILED";
    }
  });

  // --- CORE SUMMARY EXTRACTION LOGIC (UNTOUCHED LOGIC) ---
  document.getElementById("summaryBtn").addEventListener("click", async () => {
    const statusEl = document.getElementById("status");
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const nodes = document.querySelectorAll(
            "[data-message-author-role]"
          );

          const messages = [];

          nodes.forEach((node) => {
            const text = node.innerText?.trim();
            const role = node.getAttribute("data-message-author-role");

            if (!text || !role) return;

            messages.push({ role, text });
          });

          return messages;
        },
      });

      const messages = result?.[0]?.result || [];

      if (!messages.length) {
        statusEl.style.color = "#ef4444";
        statusEl.textContent = "ERR: DATA_EMPTY";
        return;
      }

      // =========================
      // HELPERS
      // =========================
      function clean(text = "") {
        return text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
      }

      var shorten = function(text = "", max = 180) {
        text = clean(text);
        return text.length > max ? text.slice(0, max) + "..." : text;
      };

      function isNoise(text = "") {
        text = clean(text).toLowerCase();
        return (
          text.includes("enumerating objects") ||
          text.includes("counting objects") ||
          text.includes("writing objects") ||
          text.includes("delta compression") ||
          text.includes("pack-reused") ||
          text.includes("remote: resolving") ||
          text.includes("show more")
        );
      }

      function importanceScore(text = "") {
        text = clean(text);
        let score = 0;
        if (text.length > 200) score += 2;
        if (/https?:\/\/|www\./i.test(text)) score += 3;
        if (/\d/.test(text)) score += 1;
        if (/[%$₹€£=+\-*/]/.test(text)) score += 1;
        if (/=>|function|class|import|return|def\s/i.test(text)) score += 3;
        if (/^\d+\./m.test(text) || /^[-•*]/m.test(text)) score += 2;
        if (/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/.test(text)) score += 1;
        if (text.includes("?")) score += 1;
        return score;
      }

      // =========================
      // USER MESSAGES
      // =========================
      const userMessages = messages.filter((m) => m.role === "user");
      const lastUser = clean(userMessages.at(-1)?.text || "No user message");

      // =========================
      // TOPIC
      // =========================
      const topic = "Conversation Continuation";

      // =========================
      // CURRENT USER REQUEST
      // =========================
      let currentUserRequest = lastUser;

      if (clean(lastUser).length < 30) {
        const previousMeaningful = [...userMessages]
          .reverse()
          .find((m) => clean(m.text).length > 50);

        if (previousMeaningful) {
          currentUserRequest = `${shorten(previousMeaningful.text, 250)} -> ${lastUser}`;
        }
      }

      // =========================
      // DISCUSSION SUMMARY
      // =========================
      const summaryPoints = [];

      const longUsers = messages
        .filter((m) => m.role === "user" && clean(m.text).length > 100 && !isNoise(m.text))
        .sort((a, b) => importanceScore(b.text) - importanceScore(a.text));

      const longAssistants = messages
        .filter((m) => m.role === "assistant" && clean(m.text).length > 120 && !isNoise(m.text))
        .sort((a, b) => importanceScore(b.text) - importanceScore(a.text));

      if (longUsers.length) {
        summaryPoints.push(`Initial user goal: ${shorten(longUsers[0].text, 180)}`);
      }

      longUsers.slice(1, 4).forEach((m) => {
        summaryPoints.push(`User discussed: ${shorten(m.text, 160)}`);
      });

      longAssistants.slice(-3).forEach((m) => {
        summaryPoints.push(`Assistant explained: ${shorten(m.text, 180)}`);
      });

      summaryPoints.push(`Current user goal: ${shorten(currentUserRequest, 200)}`);

      const wholeSummary = [...new Set(summaryPoints)]
        .map((s) => `- ${s}`)
        .join("\n");

      // =========================
      // CURRENT CONTEXT
      // =========================
      const currentContext = messages
        .slice(-8)
        .map((m) => `- ${m.role.toUpperCase()}: ${shorten(m.text, 200)}`)
        .join("\n");

      // =========================
      // FINAL PACK
      // =========================
      const summary = `
=== AI CONTINUATION PACK ===

TOPIC:
${topic}

DISCUSSION SUMMARY:
${wholeSummary}

CURRENT CONTEXT:
${currentContext}

CURRENT USER REQUEST:
${currentUserRequest}

INSTRUCTION:
Continue naturally from the current user request.
Preserve previous context and assumptions.
Do not repeat previous explanations unless necessary.
`.trim();

      await navigator.clipboard.writeText(summary);

      statusEl.style.color = "#10b981"; // Cyber Green
      statusEl.textContent = "SUCCESS: PACK_COPIED";
    } catch (err) {
      console.error(err);
      statusEl.style.color = "#ef4444"; // Tech Red
      statusEl.textContent = "ERR: EXECUTION_EXCEPTION";
    }
  });
});