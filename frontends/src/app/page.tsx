"use client";

import { useEffect, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {

  const [message, setMessage] =
    useState("");

  const [placeholder, setPlaceholder] =
    useState(
      "Message NexusOS..."
    );

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [suggestion, setSuggestion] =
    useState("");

  const [terminalInput, setTerminalInput] =
    useState("");

  const [terminalOutput, setTerminalOutput] =
    useState("");

  const [activePage, setActivePage] =
    useState("chat");

  const [launcherOpen, setLauncherOpen] =
    useState(false);

  const [launcherInput, setLauncherInput] =
    useState("");

  // Load Saved Chats
  useEffect(() => {

    const saved =
      localStorage.getItem(
        "nexus-chat"
      );

    if (saved) {

      setMessages(
        JSON.parse(saved)
      );

    }

  }, []);

  // Save Chats
  useEffect(() => {

    localStorage.setItem(
      "nexus-chat",
      JSON.stringify(messages)
    );

  }, [messages]);

  // Launcher Shortcut
  useEffect(() => {

    const handleKeyDown = (
      e: KeyboardEvent
    ) => {

      if (
        e.ctrlKey &&
        e.code === "Space"
      ) {

        e.preventDefault();

        setLauncherOpen(
          (prev) => !prev
        );

      }

    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, []);

  // AI Placeholder Suggestions
  useEffect(() => {

    if (
      message.startsWith("so")
    ) {

      setPlaceholder(
        "solve bug in React app"
      );

    } else if (
      message.startsWith("bu")
    ) {

      setPlaceholder(
        "build AI terminal assistant"
      );

    } else if (
      message.startsWith("cr")
    ) {

      setPlaceholder(
        "create secure login system"
      );

    } else if (
      message.startsWith("fi")
    ) {

      setPlaceholder(
        "find errors in backend"
      );

    } else {

      setPlaceholder(
        "Message NexusOS..."
      );

    }

  }, [message]);

  // Workspace Suggestions
  useEffect(() => {

    if (
      activePage === "terminal"
    ) {

    } else if (
      activePage === "security"
    ) {

      setSuggestion(
        "Security workspace active. Run diagnostics or inspect system activity."
      );

    } else if (
      activePage === "files"
    ) {

      setSuggestion(
        "Need help organizing files or searching documents?"
      );

    } else if (
      activePage === "chat"
    ) {

      setSuggestion(
        "Ask NexusOS anything about coding, debugging, or system operations."
      );

    } else {

      setSuggestion("");

    }

  }, [activePage]);

  // Send AI Message
  const sendMessage = async () => {

    if (
      !message.trim() ||
      loading
    ) return;

    setLoading(true);

    const userMessage: Message = {

      role: "user",

      content: message,

    };

    setMessages((prev) => [

      ...prev,

      userMessage,

    ]);

    const currentMessage =
      message;

    setMessage("");

    try {

      const response =
        await fetch(
          "http://localhost:8000/chat",
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body: JSON.stringify({

              message:
                currentMessage,

            }),

          }
        );

      const data =
        await response.json();

      setMessages((prev) => [

        ...prev,

        {

          role: "assistant",

          content:
            data.message,

        },

      ]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [

        ...prev,

        {

          role: "assistant",

          content:
            "Failed to connect to NexusOS backend.",

        },

      ]);

    } finally {

      setLoading(false);

    }

  };

  // Terminal Commands
  const runTerminalCommand =
    async () => {

      if (
        !terminalInput.trim()
      ) return;

      try {

        const response =
          await fetch(
            "http://localhost:8000/terminal",
            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

              },

              body: JSON.stringify({

                command:
                  terminalInput,

              }),

            }
          );

        const data =
          await response.json();

        setTerminalOutput(
          data.output
        );

      } catch (error) {

        console.error(error);

        setTerminalOutput(
          "Terminal execution failed."
        );

      }

    };

  // Clear Chat
  const clearChat = () => {

    localStorage.removeItem(
      "nexus-chat"
    );

    setMessages([]);

  };

  // Launcher Commands
  const commands = [

    {

      name: "Open Chat",

      action: () =>
        setActivePage("chat"),

    },

    {

      name: "Open Terminal",

      action: () =>
        setActivePage(
          "terminal"
        ),

    },

    {

      name: "Open Files",

      action: () =>
        setActivePage("files"),

    },

    {

      name:
        "Open Security Dashboard",

      action: () =>
        setActivePage(
          "security"
        ),

    },

    {

      name: "Clear Chat",

      action: clearChat,

    },

  ];

  // Filter Commands
  const filteredCommands =
    commands.filter((cmd) =>

      cmd.name
        .toLowerCase()
        .includes(
          launcherInput.toLowerCase()
        )

    );

  // Execute Launcher Command
  const executeCommand = (
    action: () => void
  ) => {

    action();

    setLauncherOpen(false);

    setLauncherInput("");

  };

  return (

    <main className="h-screen bg-black text-white flex">

      {/* Launcher */}
      {launcherOpen && (

        <div className="absolute inset-0 bg-black/50 flex items-start justify-center pt-32 z-50">

          <div className="w-[700px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">

            <input
              autoFocus
              value={launcherInput}
              onChange={(e) =>

                setLauncherInput(
                  e.target.value
                )

              }
              placeholder="Ask NexusOS or launch app..."
              className="w-full bg-transparent p-5 outline-none text-lg border-b border-zinc-800"
            />

            <div className="p-2 max-h-[400px] overflow-auto">

              {filteredCommands.map(
                (
                  cmd,
                  index
                ) => (

                  <button
                    key={index}
                    onClick={() =>

                      executeCommand(
                        cmd.action
                      )

                    }
                    className="w-full text-left p-4 rounded-xl hover:bg-zinc-800 transition"
                  >

                    {cmd.name}

                  </button>

                )
              )}

            </div>

          </div>

        </div>

      )}

      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 p-4 flex flex-col">

        <h1 className="text-3xl font-bold mb-8">

          NexusOS

        </h1>

        <div className="space-y-2">

          <button
            onClick={() =>
              setActivePage("chat")
            }
            className="w-full text-left p-3 rounded-xl bg-zinc-900"
          >

            Chat

          </button>

          <button
            onClick={() =>
              setActivePage("terminal")
            }
            className="w-full text-left p-3 rounded-xl hover:bg-zinc-900"
          >

            Terminal

          </button>

          <button
            onClick={() =>
              setActivePage("files")
            }
            className="w-full text-left p-3 rounded-xl hover:bg-zinc-900"
          >

            Files

          </button>

          <button
            onClick={() =>
              setActivePage("security")
            }
            className="w-full text-left p-3 rounded-xl hover:bg-zinc-900"
          >

            Security

          </button>

        </div>

        <div className="mt-auto">

          <button
            onClick={clearChat}
            className="w-full bg-red-500 p-3 rounded-xl"
          >

            Delete Chat

          </button>

        </div>

      </div>

      {/* Workspace */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        <div className="p-4 border-b border-zinc-800">

          <h2 className="text-xl font-semibold">

            AI Workspace

          </h2>

        </div>

        {/* Suggestions */}
        {suggestion && (

          <div className="mx-6 mt-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300">

            💡 {suggestion}

          </div>

        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">

          {activePage === "chat" && (

            <div className="space-y-4">

              {messages.map(
                (
                  msg,
                  index
                ) => (

                  <div
                    key={index}
                    className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap ${
                      msg.role ===
                      "user"

                        ? "ml-auto bg-white text-black"

                        : "bg-zinc-900 text-white"
                    }`}
                  >

                    {msg.content}

                  </div>

                )
              )}

              {loading && (

                <div className="text-zinc-500 animate-pulse">

                  AI Generating...

                </div>

              )}

            </div>

          )}

        </div>

        {/* Chat Input */}
        {activePage === "chat" && (

          <div className="p-4 border-t border-zinc-800 flex gap-2">

            <input
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              placeholder={placeholder}
              className="flex-1 bg-zinc-900 p-3 rounded-xl outline-none"
              onKeyDown={(e) => {

                if (
                  e.key === "Enter"
                ) {

                  sendMessage();

                }

              }}
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-white text-black px-6 rounded-xl"
            >

              {loading
                ? "Generating..."
                : "Send"}

            </button>

          </div>

        )}

      </div>

    </main>

  );

}