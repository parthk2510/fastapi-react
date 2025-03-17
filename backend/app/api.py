import cv2
from PIL import Image
import numpy as np
import json
from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
import tempfile
import os
import shutil
from skimage.metrics import structural_similarity
from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urlparse
import re
import requests
import logging

app = FastAPI()

# Allow CORS for all origins (adjust as needed for your use case)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOG_FILE = os.path.join(LOG_DIR, "app.log")
logging.basicConfig(filename=LOG_FILE, level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')


def preprocess_ui_element(ui_element_path):
    try:
        img = cv2.imread(ui_element_path)
        if img is None:
            raise FileNotFoundError(
                f"Could not read image at: {ui_element_path}")
        resized_img = cv2.resize(img, (256, 256))
        logging.info(f"Successfully preprocessed image: {ui_element_path}")
        return resized_img
    except FileNotFoundError as e:
        logging.error(f"File not found: {e}")
        return None
    except cv2.error as e:
        logging.error(f"OpenCV Error processing {ui_element_path}: {e}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error processing {ui_element_path}: {e}")
        return None


def extract_visual_similarity(processed_ui_element1, processed_ui_element2):
    if processed_ui_element1 is None or processed_ui_element2 is None:
        logging.warning(
            "One or both images are None, cannot calculate similarity.")
        return 0.0

    try:
        gray_ui1 = cv2.cvtColor(processed_ui_element1, cv2.COLOR_BGR2GRAY)
        gray_ui2 = cv2.cvtColor(processed_ui_element2, cv2.COLOR_BGR2GRAY)

        (score, diff) = structural_similarity(gray_ui1, gray_ui2, full=True)
        logging.info(f"Calculated similarity score: {score}")
        return score
    except cv2.error as e:
        logging.error(f"OpenCV Error during similarity calculation: {e}")
        return 0.0
    except Exception as e:
        logging.error(f"Unexpected error during similarity calculation: {e}")
        return 0.0


def capture_screenshot_from_url(url, filename):
    firefox_options = FirefoxOptions()
    firefox_options.headless = True
    service = FirefoxService()
    driver = webdriver.Firefox(service=service, options=firefox_options)
    try:
        driver.get(url)
        driver.save_screenshot(filename)
        logging.info(f"Screenshot saved to {filename}")
        return filename
    except Exception as e:
        logging.error(f"Error capturing screenshot from {url}: {e}")
        return None
    finally:
        driver.quit()


def compare_ui_elements(ui_element_path1, ui_element_path2):
    processed_ui1 = preprocess_ui_element(ui_element_path1)
    processed_ui2 = preprocess_ui_element(ui_element_path2)

    if processed_ui1 is None or processed_ui2 is None:
        logging.warning(
            "Error during image preprocessing, cannot compare UI elements.")
        return 0.0, "Error during image preprocessing"

    similarity_score = extract_visual_similarity(processed_ui1, processed_ui2)
    similarity_percentage = similarity_score * 100

    logging.info(f"Similarity percentage: {similarity_percentage}")
    return similarity_percentage, "Visual similarity score based on SSIM."


class URLRequest(BaseModel):
    url: str


class PhishingContentAnalyzer:
    def __init__(self, url):
        self.url = url
        self.domain = urlparse(url).netloc
        self.content = None
        self.keywords = ['login', 'verify', 'account',
                         'password', 'banking', 'secure', 'update', 'confirm']
        self.threat_score = 0
        self.ssl_valid = False
        self.suspicious_elements = 0
        self.content_fetched = False

    def fetch_content(self):
        try:
            response = requests.get(self.url, timeout=10, verify=True)
            self.ssl_valid = response.ok
            if response.status_code == 200:
                self.content = response.text
                self.content_fetched = True
                logging.info(f"Successfully fetched content from {self.url}")
                return True
            logging.warning(
                f"Failed to fetch content from {self.url}, status code: {response.status_code}")
            return False
        except (requests.exceptions.SSLError, requests.exceptions.ConnectionError):
            self.ssl_valid = False
            logging.error(
                f"SSL or Connection error fetching content from {self.url}")
            return False
        except requests.exceptions.Timeout:
            logging.error(f"Request timed out for {self.url}")
            raise HTTPException(status_code=408, detail="Request timed out")
        except requests.exceptions.RequestException as e:
            logging.error(
                f"Request exception fetching content from {self.url}: {e}")
            raise HTTPException(
                status_code=500, detail=f"Error fetching content: {str(e)}")
        except Exception as e:
            logging.error(
                f"Unexpected error fetching content from {self.url}: {e}")
            raise HTTPException(
                status_code=500, detail=f"Unexpected error fetching content: {str(e)}")

    def check_ssl(self):
        self.threat_score += 0 if self.ssl_valid else 5
        logging.info(f"SSL check: {'Valid' if self.ssl_valid else 'Invalid'}")

    def analyze_content(self):
        if not self.content:
            logging.warning("No content to analyze")
            return
        try:
            soup = BeautifulSoup(self.content, 'html.parser')
            forms = soup.find_all('form')
            hidden_inputs = soup.find_all('input', {'type': 'hidden'})
            scripts = soup.find_all(
                'script', {'src': re.compile(r'^https?://')})
            iframes = soup.find_all('iframe')

            self.suspicious_elements = len(
                hidden_inputs) + len(scripts) + len(iframes)
            self.threat_score += min(self.suspicious_elements * 0.5, 4)

            for form in forms:
                if form.find_all(['input', 'password']):
                    self.threat_score += 2

            text = soup.get_text().lower()
            for keyword in self.keywords:
                if re.search(rf'\b{keyword}\b', text):
                    self.threat_score += 1.5
            logging.info(f"Content analysis completed for {self.url}")
        except Exception as e:
            logging.error(f"Error analyzing content for {self.url}: {e}")
            raise HTTPException(
                status_code=500, detail=f"Error analyzing content: {str(e)}")

    def check_url_structure(self):
        parsed = urlparse(self.url)
        if re.match(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', parsed.netloc):
            self.threat_score += 4
        if '@' in parsed.path or '//' in parsed.path:
            self.threat_score += 3
        if len(parsed.path.split('/')) > 4:
            self.threat_score += 1.5
        logging.info(f"URL structure check completed for {self.url}")

    def calculate_threat_score(self):
        self.fetch_content()
        if not self.content_fetched:
            logging.warning(
                f"Content not fetched for {self.url}, threat level is 'Not Defined'")
            return "Not Defined"
        self.check_ssl()
        self.analyze_content()
        self.check_url_structure()
        final_score = min(self.threat_score, 20)
        logging.info(f"Calculated threat score for {self.url}: {final_score}")
        return final_score

    def get_threat_level(self):
        score = self.calculate_threat_score()
        if score == "Not Defined":
            return score
        if score <= 7:
            threat_level = "Low"
        elif score <= 14:
            threat_level = "Medium"
        else:
            threat_level = "High"
        logging.info(f"Threat level for {self.url}: {threat_level}")
        return threat_level


@app.post("/analyze/")
def analyze_url(url_request: URLRequest):
    try:
        analyzer = PhishingContentAnalyzer(url_request.url)
        threat_level = analyzer.get_threat_level()
        return {"threat_level": threat_level}
    except Exception as e:
        logging.error(f"Error analyzing URL {url_request.url}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error analyzing URL: {str(e)}")


@app.post("/compare")
async def compare(
    original_url: str = Form(...),
    phishing_url: str = Form(...)
):
    temp_dir = tempfile.mkdtemp()
    original_screenshot_path = os.path.join(
        temp_dir, "original_screenshot.png")
    phishing_screenshot_path = os.path.join(
        temp_dir, "phishing_screenshot.png")

    path1 = capture_screenshot_from_url(original_url, original_screenshot_path)
    path2 = capture_screenshot_from_url(phishing_url, phishing_screenshot_path)

    if path1 and path2:
        similarity_percentage, message = compare_ui_elements(path1, path2)
        shutil.rmtree(temp_dir)
        return {
            "similarity_percentage": similarity_percentage,
            "message": message,
        }
    else:
        shutil.rmtree(temp_dir)
        logging.error("Screenshot capture failed. Cannot perform comparison.")
        raise HTTPException(
            status_code=400, detail="Screenshot capture failed. Cannot perform comparison."
        )

if __name__ == "__main__":
    logging.info("Starting FastAPI application")
    uvicorn.run(app, host="0.0.0.0", port=8000)
