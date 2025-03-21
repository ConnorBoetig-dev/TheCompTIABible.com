import json
import os
import sys
from openai import OpenAI

try:
    from openai import _version
    print("Detected openai version:", _version.__version__)
except Exception:
    pass

# Create your OpenAI client with the new interface
client = OpenAI(api_key=os.environ["OPEN_API_KEY"])

def create_system_prompt(question_context):
    if question_context:
        return f"""You are a CompTIA exam instructor. The user is currently viewing this question:

Question: {question_context['question']}
Options:
A) {question_context['options']['A']}
B) {question_context['options']['B']}
C) {question_context['options']['C']}
D) {question_context['options']['D']}

Domain: {question_context['domain']}

Provide guidance and explanations without directly revealing the answer unless specifically asked.
Use real-world examples and study tips, and help users understand the underlying concepts."""
    else:
        return "You are a CompTIA exam instructor. Answer clearly with real-world examples and study tips, and remind users what and how to remember for the exam."

def lambda_handler(event, context):
    try:
        body = json.loads(event["body"])
        user_message = body.get("message", "")
        question_context = body.get("context", {}).get("currentQuestion")

        if not user_message:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({"error": "No message provided"})
            }

        # Use the client.chat.completions.create method
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": create_system_prompt(question_context)
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            max_tokens=150,  # Increased token limit for more detailed responses
            temperature=0.7
        )

        ai_reply = completion.choices[0].message.content

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"reply": ai_reply})
        }

    except Exception as e:
        print("Error:", e)
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }