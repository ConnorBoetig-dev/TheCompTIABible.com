import json
import os
import random
import decimal
import boto3

def decimal_converter(obj):
    if isinstance(obj, decimal.Decimal):
        return float(obj)  # or str(obj) if you prefer
    raise TypeError

def lambda_handler(event, context):
    """
    Fetch and return a random subset of questions from the A-1101 exam.
    Expects query parameter:
      - limit: number of questions to return
    """
    # 1. Parse query parameters
    query_params = event.get('queryStringParameters') or {}
    limit_str = query_params.get('limit')

    # Validate limit parameter
    if not limit_str:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing required query parameter 'limit'."})
        }

    try:
        limit = int(limit_str)
    except ValueError:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"'limit' must be an integer. Received '{limit_str}'."})
        }

    # 2. Connect to DynamoDB
    dynamodb = boto3.resource('dynamodb')
    table_name = "A-1101"
    table = dynamodb.Table(table_name)

    try:
        # 3. Scan the entire table to fetch all questions
        response = table.scan()
        items = response.get('Items', [])

        # If no items, return an error
        if not items:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "No questions found in A-1101."})
            }

        # 4. Randomly select 'limit' questions
        if len(items) < limit:
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "error": f"Requested {limit} questions, but only {len(items)} available."
                })
            }

        selected_questions = random.sample(items, limit)

        # 5. Return the questions as JSON (handle Decimal)
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(selected_questions, default=decimal_converter)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }