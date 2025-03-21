import json
import boto3
import random
from decimal import Decimal
from boto3.dynamodb.conditions import Key

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = 'A-1101'  # Changed table name to match existing table

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    try:
        query_params = event.get("queryStringParameters", {}) or {}
        domains = query_params.get("domains", "").split(',')
        limit_str = query_params.get("limit", "1")

        if not domains or domains[0] == "":
            return {
                "statusCode": 400,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "Missing domains parameter"})
            }

        try:
            limit = int(limit_str)
        except ValueError:
            limit = 1

        table = dynamodb.Table(TABLE_NAME)
        all_items = []

        # Use scan with filter expression instead of query
        for domain in domains:
            response = table.scan(
                FilterExpression="#d = :domain_val",
                ExpressionAttributeNames={
                    "#d": "domain"  # Use expression attribute name to handle reserved keyword
                },
                ExpressionAttributeValues={
                    ":domain_val": domain
                }
            )
            all_items.extend(response.get('Items', []))

            # Handle pagination if necessary
            while 'LastEvaluatedKey' in response:
                response = table.scan(
                    FilterExpression="#d = :domain_val",
                    ExpressionAttributeNames={
                        "#d": "domain"
                    },
                    ExpressionAttributeValues={
                        ":domain_val": domain
                    },
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
                all_items.extend(response.get('Items', []))

        # Shuffle and limit results
        random.shuffle(all_items)
        result = all_items[:limit]

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(result, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"ERROR: {e}")
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)})
        }
