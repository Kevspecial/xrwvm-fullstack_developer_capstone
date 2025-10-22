# Uncomment the imports below before you add the function code
import requests
import os
import logging
from dotenv import load_dotenv
from urllib.parse import urljoin

load_dotenv()
logger = logging.getLogger(__name__)

backend_url = os.getenv(
    'backend_url', default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/")

def get_request(endpoint, **kwargs):
    """HTTP GET helper against the Node backend.
    - Uses requests params to properly encode the query string
    - Avoids adding a trailing '?' when no params are provided
    - Adds basic error handling
    """
    base = backend_url.rstrip('/') + '/'
    request_url = urljoin(base, endpoint.lstrip('/'))
    try:
        response = requests.get(request_url, params=kwargs or None, timeout=10)
        logger.info("GET %s", response.url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as err:
        logger.error("Backend request failed: %s", err)
        return []

def analyze_review_sentiments(text):
    request_url = (sentiment_analyzer_url or '').rstrip('/')+"/analyze/"+text
    try:
        response = requests.get(request_url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as err:
        logger.warning("Sentiment service error: %s", err)
        return {"sentiment":"neutral"}

# def post_review(data_dict):
def post_review(data_dict):
    request_url = backend_url+"/insert_review"
    try:
        response = requests.post(request_url,json=data_dict)
        print(response.json())
        return response.json()
    except:
        print("Network exception occurred")

# Add code for posting review
