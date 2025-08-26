#!/usr/bin/env python3
"""
Test script for the train search API
Run this script to test the API functionality
"""

import requests
import json

def test_api():
    base_url = "http://localhost:8000/api"
    
    print("🚂 Testing Train Search API")
    print("=" * 50)
    
    # Test 1: Search trains with dummy data (ADI to JND)
    print("\n1. Testing search with dummy data (ADI to JND):")
    try:
        response = requests.get(f"{base_url}/search-trains/", params={
            'from_station': 'ADI',
            'to_station': 'JND',
            'date': '2024-01-15'
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {len(data.get('data', []))} trains")
            
            for train in data.get('data', []):
                print(f"  - {train.get('train_number')} {train.get('train_name')}")
                print(f"    Departure: {train.get('departure_time')} | Arrival: {train.get('arrival_time')}")
                print(f"    Runs: {train.get('running_days', [])}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Search trains with non-existent route
    print("\n2. Testing search with non-existent route (XYZ to ABC):")
    try:
        response = requests.get(f"{base_url}/search-trains/", params={
            'from_station': 'XYZ',
            'to_station': 'ABC',
            'date': '2024-01-15'
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {len(data.get('data', []))} trains")
            if len(data.get('data', [])) == 0:
                print("  ✅ Correctly shows no trains for non-existent route")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API Testing Complete!")
    print("\nTo start the Django server, run:")
    print("cd backend && python manage.py runserver")
    print("\nTo start the React frontend, run:")
    print("cd frontend && npm run dev")
    print("\nTo add IRCTC API key:")
    print("1. Get your API key from RapidAPI")
    print("2. Add it to backend/backend_project/settings.py")
    print("3. Set IRCTC_API_KEY = 'your_api_key_here'")

if __name__ == "__main__":
    test_api() 