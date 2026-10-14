import speech_recognition as sr

recognizer = sr.Recognizer()

while True:

    with sr.Microphone() as source:

        print("Listening...")
        audio = recognizer.listen(source)

    try:
        text = recognizer.recognize_google(audio)
        print("You said:", text)

        if text.lower()=="bye":
            print("Voice input stopped.")
            break

    except sr.UnknownValueError:
        print("Sorry, I couldn't understand you.")

    except sr.RequestError:
        print("Speech recognition service is unavailable.")