import json
import boto3
from decimal import Decimal
import random

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = "A-1101"  # Adjust if your table is named differently

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    try:
        query_params = event.get("queryStringParameters", {}) or {}
        domain = query_params.get("domain")
        limit_str = query_params.get("limit", "1")

        # Require a domain to filter by
        if not domain:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET,OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": json.dumps({"error": "Missing domain parameter"})
            }

        # Convert limit to integer (default to 1 if invalid)
        try:
            limit = int(limit_str)
        except ValueError:
            limit = 1

        table = dynamodb.Table(TABLE_NAME)

        # Scan the entire table (works for quick demos but can be slow at scale)
        response = table.scan()
        all_items = response.get("Items", [])

        # Filter by domain
        filtered_items = [
            item for item in all_items
            if item.get("domain") == domain
        ]

        # Shuffle to randomize and slice to 'limit'
        random.shuffle(filtered_items)
        result = filtered_items[:limit]

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps(result, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"ERROR: {e}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({"error": str(e)})
        }




