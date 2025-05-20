import requests
import json

# Define the base URL
base_url = "https://3a2ccf66-7b18-4c22-84c9-06710173f4c5.preview.emergentagent.com/api"

# Test user data
test_user = {
    "username": "testuser123",
    "email": "testuser123@example.com",
    "password": "Test@123456"
}

# Step 1: Register a new user
print("\n=== Testing User Registration ===")
register_response = requests.post(
    f"{base_url}/register",
    json=test_user
)

print(f"Registration Status: {register_response.status_code}")
print(f"Registration Response: {register_response.text}")

if register_response.status_code == 200:
    print("✅ User registration successful")
else:
    print("❌ User registration failed")

# Step 2: Login with the registered user
print("\n=== Testing User Login ===")
login_response = requests.post(
    f"{base_url}/login",
    data={
        "username": test_user["email"],
        "password": test_user["password"]
    },
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

print(f"Login Status: {login_response.status_code}")
print(f"Login Response: {login_response.text}")

if login_response.status_code == 200:
    print("✅ User login successful")
    token = login_response.json().get("access_token")
    
    # Step 3: Get user profile
    print("\n=== Testing Get User Profile ===")
    profile_response = requests.get(
        f"{base_url}/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"Profile Status: {profile_response.status_code}")
    print(f"Profile Response: {profile_response.text}")
    
    if profile_response.status_code == 200:
        print("✅ Get user profile successful")
    else:
        print("❌ Get user profile failed")
    
    # Step 4: Get islands
    print("\n=== Testing Get Islands ===")
    islands_response = requests.get(f"{base_url}/islands")
    
    print(f"Islands Status: {islands_response.status_code}")
    
    if islands_response.status_code == 200:
        islands = islands_response.json()
        print(f"✅ Get islands successful - Found {len(islands)} islands")
        
        if islands:
            island_id = islands[0]["id"]
            
            # Step 5: Mark island as visited
            print("\n=== Testing Mark Island as Visited ===")
            visit_data = {
                "island_id": island_id,
                "visit_date": "2025-02-15T00:00:00",
                "notes": "Test visit",
                "photos": []
            }
            
            visit_response = requests.post(
                f"{base_url}/visits",
                json=visit_data,
                headers={"Authorization": f"Bearer {token}"}
            )
            
            print(f"Visit Status: {visit_response.status_code}")
            print(f"Visit Response: {visit_response.text}")
            
            if visit_response.status_code == 200:
                print("✅ Mark island as visited successful")
            else:
                print("❌ Mark island as visited failed")
            
            # Step 6: Get user visits
            print("\n=== Testing Get User Visits ===")
            visits_response = requests.get(
                f"{base_url}/visits/user",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            print(f"Visits Status: {visits_response.status_code}")
            
            if visits_response.status_code == 200:
                visits = visits_response.json()
                print(f"✅ Get user visits successful - Found {len(visits)} visits")
            else:
                print("❌ Get user visits failed")
    else:
        print("❌ Get islands failed")
else:
    print("❌ User login failed")