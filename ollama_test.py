import ollama

messages=[]

while True:

    message = input("You: ")
    messages.append({
        "role":"user",
        "content":message
    })

    if message.lower() == "bye":
        print("AI: Goodbye! Have a nice day.")
        break

    response = ollama.chat(
        model="llama3.2:3b",
        messages=messages
    )
    messages.append(response["message"])
    print("AI:", response["message"]["content"])