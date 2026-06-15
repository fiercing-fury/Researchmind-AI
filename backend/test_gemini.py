import google.generativeai as genai

genai.configure(
    api_key="AQ.Ab8RN6L8dL5edJ8EBRmOwlzn-zT4tu5OY2UfoGVzzUrySZo-iw"
)

for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)