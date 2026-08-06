// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, RotateCcw } from "lucide-react";
import supportFlows from "../config/supportFlows";

// Rule-based support assistant widget.
//
// All conversational content lives in ../config/supportFlows.js — this
// component is purely the engine + UI that walks the decision tree. It holds
// no hardcoded answers, so the flows can grow without changing this file.
//
// Behaviour:
//   - Floating launcher button, bottom-right (kept clear of the mobile bottom
//     nav and below the fixed header's z-50 by using z-40).
//   - Opening starts at the "root" node.
//   - Each user tap appends their choice + the assistant's next message to the
//     transcript and advances to the chosen node.
//   - "restart" returns to root; "link" navigates (internal route or external
//     mailto:/tel:) ; "next" walks to another node.

const ASSISTANT = "assistant";
const USER = "user";

const SupportAssistant = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState("root");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  const currentNode = supportFlows[currentId] || supportFlows.root;

  // Seed the conversation with the root message the first time it opens.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: ASSISTANT, text: supportFlows.root.message }]);
    }
  }, [open, messages.length]);

  // Keep the transcript scrolled to the newest message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const restart = () => {
    setCurrentId("root");
    setMessages([{ from: ASSISTANT, text: supportFlows.root.message }]);
  };

  const handleOption = (option) => {
    // Record the user's choice in the transcript.
    const next = [...messages, { from: USER, text: option.label }];

    if (option.action === "restart") {
      setMessages(next);
      // Small reset so the user sees their tap before returning to root.
      setCurrentId("root");
      setMessages([
        ...next,
        { from: ASSISTANT, text: supportFlows.root.message },
      ]);
      return;
    }

    if (option.action === "link" && option.href) {
      setMessages(next);
      if (option.href.startsWith("/")) {
        // Internal route — use the router and close the widget.
        navigate(option.href);
        setOpen(false);
      } else {
        // External (mailto:/tel:) — open via the browser.
        window.open(option.href, "_self");
      }
      return;
    }

    if (option.next && supportFlows[option.next]) {
      const target = supportFlows[option.next];
      setCurrentId(option.next);
      setMessages([...next, { from: ASSISTANT, text: target.message }]);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? "Close support assistant" : "Open support assistant"}
        className="fixed bottom-20 right-5 sm:bottom-24 sm:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Customer support assistant"
            className="fixed bottom-36 right-5 sm:bottom-24 sm:right-6 z-40 flex h-[28rem] max-h-[70vh] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">Support Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={restart}
                  aria-label="Restart conversation"
                  className="rounded-full p-1.5 transition hover:bg-white/20"
                  title="Start over"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-full p-1.5 transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Transcript */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-blue-50/40 px-4 py-4"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.from === USER ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      m.from === USER
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm bg-white text-gray-700 shadow-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="border-t border-gray-100 bg-white px-3 py-3">
              <div className="flex flex-wrap gap-2">
                {(currentNode.options || []).map((opt, i) => (
                  <button
                    key={`${currentId}-${i}`}
                    type="button"
                    onClick={() => handleOption(opt)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-100"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportAssistant;
