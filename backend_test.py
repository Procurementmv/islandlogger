import requests
import unittest
import json
from datetime import datetime

# Backend API URL
BACKEND_URL = "https://3a2ccf66-7b18-4c22-84c9-06710173f4c5.preview.emergentagent.com/api"

class MaldivesIslandTrackerAPITest(unittest.TestCase):
    """Test suite for the Maldives Island Tracker API"""
    
    def setUp(self):
        """Set up test case - initialize variables and login if needed"""
        self.admin_credentials = {
            "username": "admin@example.com",
            "password": "admin123"
        }
        self.token = None
        self.login_as_admin()
    
    def login_as_admin(self):
        """Login as admin and get token"""
        response = requests.post(
            f"{BACKEND_URL}/login", 
            json=self.admin_credentials
        )
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            print(f"Admin login failed: {response.status_code} - {response.text}")
    
    def test_01_featured_islands(self):
        """Test the featured islands endpoint"""
        print("\n🔍 Testing featured islands API...")
        response = requests.get(f"{BACKEND_URL}/featured/islands")
        
        self.assertEqual(response.status_code, 200, "Featured islands request failed")
        islands = response.json()
        
        # Check if we got a list of islands
        self.assertIsInstance(islands, list, "Response should be a list of islands")
        
        # If there are islands, check their structure
        if islands:
            island = islands[0]
            self.assertIn("id", island, "Island should have an ID")
            self.assertIn("name", island, "Island should have a name")
            self.assertIn("atoll", island, "Island should have an atoll")
            
            print(f"✅ Found {len(islands)} featured islands")
        else:
            print("⚠️ No featured islands found")
    
    def test_02_featured_articles(self):
        """Test the featured articles endpoint"""
        print("\n🔍 Testing featured articles API...")
        response = requests.get(f"{BACKEND_URL}/featured/articles")
        
        self.assertEqual(response.status_code, 200, "Featured articles request failed")
        articles = response.json()
        
        # Check if we got a list of articles
        self.assertIsInstance(articles, list, "Response should be a list of articles")
        
        # If there are articles, check their structure
        if articles:
            article = articles[0]
            self.assertIn("id", article, "Article should have an ID")
            self.assertIn("title", article, "Article should have a title")
            self.assertIn("content", article, "Article should have content")
            
            print(f"✅ Found {len(articles)} featured articles")
        else:
            print("⚠️ No featured articles found")
    
    def test_03_islands_filtering(self):
        """Test the islands filtering functionality"""
        print("\n🔍 Testing islands filtering API...")
        
        # Test all islands
        response = requests.get(f"{BACKEND_URL}/islands")
        self.assertEqual(response.status_code, 200, "Islands request failed")
        all_islands = response.json()
        
        # Test filtering by type
        island_types = ["resort", "inhabited", "uninhabited", "industrial"]
        for island_type in island_types:
            response = requests.get(f"{BACKEND_URL}/islands?type={island_type}")
            self.assertEqual(response.status_code, 200, f"Islands filtering by type {island_type} failed")
            filtered_islands = response.json()
            
            # Check that all returned islands have the correct type
            if filtered_islands:
                for island in filtered_islands:
                    self.assertEqual(island["type"], island_type, 
                                    f"Island {island['name']} has type {island['type']} but should be {island_type}")
                
                print(f"✅ Found {len(filtered_islands)} islands of type '{island_type}'")
            else:
                print(f"⚠️ No islands found of type '{island_type}'")
    
    def test_04_ad_management(self):
        """Test the ad management functionality"""
        print("\n🔍 Testing ad management API...")
        
        if not self.token:
            self.skipTest("Admin login failed, skipping ad management tests")
        
        # Get all ads
        response = requests.get(
            f"{BACKEND_URL}/admin/ads",
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 200, "Admin ads request failed")
        ads = response.json()
        print(f"✅ Found {len(ads)} ads in the system")
        
        # Create a new ad
        new_ad = {
            "name": f"Test Ad {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "description": "Test ad created by automated testing",
            "placement": "header",
            "image_url": "https://via.placeholder.com/728x90",
            "destination_url": "https://example.com",
            "alt_text": "Test ad",
            "size": "728x90",
            "is_active": True
        }
        
        response = requests.post(
            f"{BACKEND_URL}/admin/ads",
            json=new_ad,
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 200, f"Create ad failed: {response.text}")
        created_ad = response.json()
        print(f"✅ Created new ad: {created_ad['name']} (ID: {created_ad['id']})")
        
        # Get the created ad
        ad_id = created_ad["id"]
        response = requests.get(
            f"{BACKEND_URL}/admin/ads/{ad_id}",
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 200, "Get ad request failed")
        retrieved_ad = response.json()
        self.assertEqual(retrieved_ad["name"], new_ad["name"], "Retrieved ad name doesn't match")
        print(f"✅ Retrieved ad: {retrieved_ad['name']}")
        
        # Update the ad
        update_data = {
            "name": f"Updated Test Ad {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "description": "Updated test ad",
            "placement": "footer",
            "image_url": "https://via.placeholder.com/468x60",
            "destination_url": "https://example.org",
            "alt_text": "Updated test ad",
            "size": "468x60",
            "is_active": False
        }
        
        response = requests.put(
            f"{BACKEND_URL}/admin/ads/{ad_id}",
            json=update_data,
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 200, f"Update ad failed: {response.text}")
        updated_ad = response.json()
        self.assertEqual(updated_ad["name"], update_data["name"], "Updated ad name doesn't match")
        print(f"✅ Updated ad: {updated_ad['name']}")
        
        # Delete the ad
        response = requests.delete(
            f"{BACKEND_URL}/admin/ads/{ad_id}",
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 204, f"Delete ad failed: {response.text}")
        print(f"✅ Deleted ad with ID: {ad_id}")

if __name__ == "__main__":
    unittest.main(verbosity=2)