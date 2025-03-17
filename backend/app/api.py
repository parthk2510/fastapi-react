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

app = FastAPI()

# Allow CORS for all origins (adjust as needed for your use case)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def preprocess_ui_element(ui_element_path):
    try:
        img = cv2.imread(ui_element_path)
        if img is None:
            raise FileNotFoundError(
                f"Could not read image at: {ui_element_path}")
        resized_img = cv2.resize(img, (256, 256))
        return resized_img
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return None


def extract_visual_similarity(processed_ui_element1, processed_ui_element2):
    if processed_ui_element1 is None or processed_ui_element2 is None:
        return 0.0

    gray_ui1 = cv2.cvtColor(processed_ui_element1, cv2.COLOR_BGR2GRAY)
    gray_ui2 = cv2.cvtColor(processed_ui_element2, cv2.COLOR_BGR2GRAY)

    (score, diff) = structural_similarity(gray_ui1, gray_ui2, full=True)
    return score


def capture_screenshot_from_url(url, filename):
    firefox_options = FirefoxOptions()
    firefox_options.headless = True
    # If needed, set the executable_path for your geckodriver or ensure it's in your PATH.
    service = FirefoxService()
    driver = webdriver.Firefox(service=service, options=firefox_options)
    try:
        driver.get(url)
        driver.save_screenshot(filename)
        return filename
    except Exception as e:
        print(f"Error capturing screenshot from {url}: {e}")
        return None
    finally:
        driver.quit()


def compare_ui_elements(ui_element_path1, ui_element_path2):
    processed_ui1 = preprocess_ui_element(ui_element_path1)
    processed_ui2 = preprocess_ui_element(ui_element_path2)

    if processed_ui1 is None or processed_ui2 is None:
        return 0.0, "Error during image preprocessing"

    similarity_score = extract_visual_similarity(processed_ui1, processed_ui2)
    similarity_percentage = similarity_score * 100

    return similarity_percentage, "Visual similarity score based on SSIM."


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
        raise HTTPException(
            status_code=400, detail="Screenshot capture failed. Cannot perform comparison."
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
