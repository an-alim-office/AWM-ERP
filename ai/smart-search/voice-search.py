import speech_recognition as sr
from search_engine import SearchEngine

class VoiceSearch:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.engine = SearchEngine()

    def listen(self):
        """Capture voice input"""
        with sr.Microphone() as source:
            print("🎤 Listening... Speak now")
            self.recognizer.adjust_for_ambient_noise(source)

            try:
                audio = self.recognizer.listen(source, timeout=5)
                print("🔄 Processing...")

                text = self.recognizer.recognize_google(audio)
                print(f"🗣 You said: {text}")
                return text

            except sr.WaitTimeoutError:
                print("⏱ Timeout! No speech detected")
            except sr.UnknownValueError:
                print("❌ Could not understand audio")
            except sr.RequestError:
                print("❌ API unavailable")

        return None

    def run(self):
        while True:
            print("\n===== VOICE SEARCH =====")
            command = input("Press ENTER to speak or type 'exit': ")

            if command.lower() == "exit":
                break

            query = self.listen()

            if not query:
                continue

            # Default collection
            collection = "employees"

            results = self.engine.search(collection, query)
            self.engine.pretty_print(results)


# 🚀 RUN
if _name_ == "_main_":
    vs = VoiceSearch()
    vs.run()