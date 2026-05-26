from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
import os
import subprocess
import platform

load_dotenv()

app = FastAPI()

api_key = os.getenv("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAFE_COMMANDS = {

    "windows": [
        "ipconfig",
        "whoami",
        "tasklist",
        "ping",
    ],

    "linux": [
        "ls",
        "pwd",
        "whoami",
        "ps",
    ]

}

@app.post("/chat")
async def chat(data: dict):

    try:

        completion = client.chat.completions.create(

            model="nvidia/nemotron-3-super-120b-a12b:free",

            messages=[

                {
                    "role": "system",
                    "content": "You are NexusOS AI assistant."
                },

                {
                    "role": "user",
                    "content": data["message"]
                }

            ]

        )

        return {

            "message":
            completion.choices[0].message.content

        }

    except Exception as e:

        return {

            "message":
            str(e)

        }

@app.post("/terminal")
async def terminal(data: dict):

    command = data["command"]

    system = platform.system().lower()

    if "windows" in system:
        allowed = SAFE_COMMANDS["windows"]
    else:
        allowed = SAFE_COMMANDS["linux"]

    base_command = command.split(" ")[0]

    if base_command not in allowed:

        return {
            "output": "Blocked unsafe command."
        }

    try:

        result = subprocess.check_output(

            command.split(),

            text=True,

            stderr=subprocess.STDOUT

        )

        return {
            "output": result
        }

    except Exception as e:

        return {
            "output": str(e)
        }