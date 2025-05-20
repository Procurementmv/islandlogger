import requests
import unittest
import uuid
import json
from datetime import datetime

class MaldivesIslandTrackerAPITest(unittest.TestCase):
    def setUp(self):
        self.base_url = "https://3a2ccf66-7b18-4c22-84c9-06710173f4c5.preview.emergentagent.com/api"
        self.token = None
        self.admin_token = None
        self.test_user = {
            "username": f"testuser_{uuid.uuid4().hex[:8]}",
            "email": f"testuser_{uuid.uuid4().hex[:8]}@example.com",
            "password": "Test@123456"
        }
        self.admin_credentials = {
            "username": "admin@example.com",
            "password": "admin123"
        }
        self.island_id = None
        self.blog_post_id = None
        self.blog_post_slug = None

    def test_01_register_user(self):
        """Test user registration"""
        print(f"\n🔍 Testing user registration with username: {self.test_user['username']}")
        
        response = requests.post(
            f"{self.base_url}/register",
            json=self.test_user
        )
        
        self.assertEqual(response.status_code, 200, f"Registration failed: {response.text}")
        print("✅ User registration successful")

    def test_02_login_user(self):
        """Test user login"""
        print("\n🔍 Testing user login")
        
        # Try to login with the registered user
        print(f"Attempting login with email: {self.test_user['email']}")
        
        response = requests.post(
            f"{self.base_url}/login",
            data={
                "username": self.test_user["email"],
                "password": self.test_user["password"]
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Login response status: {response.status_code}")
        print(f"Login response body: {response.text}")
        
        self.assertEqual(response.status_code, 200, f"Login failed: {response.text}")
        data = response.json()
        self.assertIn("access_token", data, "No access token in response")
        self.token = data["access_token"]
        print("✅ User login successful")

    def test_03_get_user_profile(self):
        """Test getting user profile"""
        print("\n🔍 Testing get user profile")
        
        self.assertIsNotNone(self.token, "No token available")
        
        response = requests.get(
            f"{self.base_url}/users/me",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.assertEqual(response.status_code, 200, f"Get profile failed: {response.text}")
        data = response.json()
        self.assertEqual(data["username"], self.test_user["username"], "Username mismatch")
        print("✅ Get user profile successful")

    def test_04_get_islands(self):
        """Test getting all islands"""
        print("\n🔍 Testing get all islands")
        
        response = requests.get(f"{self.base_url}/islands")
        
        self.assertEqual(response.status_code, 200, f"Get islands failed: {response.text}")
        islands = response.json()
        self.assertIsInstance(islands, list, "Islands response is not a list")
        
        if islands:
            self.island_id = islands[0]["id"]
            print(f"✅ Get islands successful - Found {len(islands)} islands")
        else:
            print("⚠️ Get islands successful but no islands found")

    def test_05_get_island_by_id(self):
        """Test getting island by ID"""
        print("\n🔍 Testing get island by ID")
        
        if not self.island_id:
            self.skipTest("No island ID available")
        
        response = requests.get(f"{self.base_url}/islands/{self.island_id}")
        
        self.assertEqual(response.status_code, 200, f"Get island by ID failed: {response.text}")
        island = response.json()
        self.assertEqual(island["id"], self.island_id, "Island ID mismatch")
        print(f"✅ Get island by ID successful - {island['name']}")

    def test_06_filter_islands_by_type(self):
        """Test filtering islands by type"""
        print("\n🔍 Testing filter islands by type")
        
        island_types = ["resort", "inhabited", "uninhabited", "industrial"]
        
        for island_type in island_types:
            response = requests.get(f"{self.base_url}/islands?type={island_type}")
            
            self.assertEqual(response.status_code, 200, f"Filter islands by {island_type} failed: {response.text}")
            islands = response.json()
            
            # Check if all returned islands match the requested type
            if islands:
                all_match = all(island["type"] == island_type for island in islands)
                self.assertTrue(all_match, f"Not all islands are of type {island_type}")
                print(f"✅ Filter islands by {island_type} successful - Found {len(islands)} islands")
            else:
                print(f"⚠️ Filter islands by {island_type} successful but no islands found")

    def test_07_mark_island_as_visited(self):
        """Test marking an island as visited"""
        print("\n🔍 Testing mark island as visited")
        
        if not self.island_id or not self.token:
            self.skipTest("No island ID or token available")
        
        visit_data = {
            "island_id": self.island_id,
            "visit_date": datetime.now().isoformat(),
            "notes": "Test visit from API test",
            "photos": []
        }
        
        response = requests.post(
            f"{self.base_url}/visits",
            json=visit_data,
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.assertEqual(response.status_code, 200, f"Mark island as visited failed: {response.text}")
        print("✅ Mark island as visited successful")

    def test_08_get_user_visits(self):
        """Test getting user visits"""
        print("\n🔍 Testing get user visits")
        
        if not self.token:
            self.skipTest("No token available")
        
        response = requests.get(
            f"{self.base_url}/visits/user",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.assertEqual(response.status_code, 200, f"Get user visits failed: {response.text}")
        visits = response.json()
        self.assertIsInstance(visits, list, "Visits response is not a list")
        
        if visits:
            self.assertGreaterEqual(len(visits), 1, "No visits found after adding one")
            print(f"✅ Get user visits successful - Found {len(visits)} visits")
        else:
            print("❌ Get user visits successful but no visits found")

    def test_09_get_visited_islands(self):
        """Test getting visited islands"""
        print("\n🔍 Testing get visited islands")
        
        if not self.token:
            self.skipTest("No token available")
        
        response = requests.get(
            f"{self.base_url}/islands/visited",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.assertEqual(response.status_code, 200, f"Get visited islands failed: {response.text}")
        islands = response.json()
        self.assertIsInstance(islands, list, "Visited islands response is not a list")
        
        if islands:
            self.assertGreaterEqual(len(islands), 1, "No visited islands found after adding one")
            print(f"✅ Get visited islands successful - Found {len(islands)} visited islands")
        else:
            print("❌ Get visited islands successful but no visited islands found")

if __name__ == "__main__":
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in order
    suite.addTest(MaldivesIslandTrackerAPITest("test_01_register_user"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_02_login_user"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_03_get_user_profile"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_04_get_islands"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_05_get_island_by_id"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_06_filter_islands_by_type"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_07_mark_island_as_visited"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_08_get_user_visits"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_09_get_visited_islands"))
    
    # Run the tests with more detailed output
    print("\n===== MALDIVES ISLAND TRACKER API TEST =====\n")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n===== TEST SUMMARY =====")
    print(f"Total tests: {result.testsRun}")
    print(f"Passed: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failed: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\n===== FAILURES =====")
        for test, error in result.failures:
            print(f"\n{test}")
            print(error)
    
    if result.errors:
        print("\n===== ERRORS =====")
        for test, error in result.errors:
            print(f"\n{test}")
            print(error)
            
    # Return exit code based on test results
    import sys
    sys.exit(len(result.failures) + len(result.errors))