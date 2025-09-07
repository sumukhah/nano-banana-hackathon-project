#!/usr/bin/env python3
import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

def test_elevenlabs():
    """Test ElevenLabs API directly"""
    
    # Test data
    url = "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128"
    headers = {
        "xi-api-key": os.getenv('ELEVENLABS_API_KEY'),
        "Content-Type": "application/json"
    }
    data = {
        "text": "A melancholic piano melody with soft strings",
        "duration_seconds": 15,
        "loop": False
    }
    
    print("Testing ElevenLabs API...")
    print(f"URL: {url}")
    print(f"Headers: {headers}")
    print(f"Data: {json.dumps(data, indent=2)}")
    
    response = requests.post(url, headers=headers, json=data)
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Content Length: {len(response.content)}")
    
    if response.status_code == 200:
        with open("test_music.mp3", "wb") as f:
            f.write(response.content)
        print("✅ Success! Music saved as test_music.mp3")
    else:
        print(f"❌ Error: {response.text}")
        try:
            error_details = response.json()
            print(f"Error details: {json.dumps(error_details, indent=2)}")
        except:
            print("Could not parse error as JSON")

if __name__ == "__main__":
    test_elevenlabs()