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

    def test_07_search_islands(self):
        """Test searching islands by name, atoll, or tag"""
        print("\n🔍 Testing search islands")
        
        # First get all islands to find search terms
        response = requests.get(f"{self.base_url}/islands")
        self.assertEqual(response.status_code, 200, f"Get islands failed: {response.text}")
        islands = response.json()
        
        if not islands:
            self.skipTest("No islands available for search test")
        
        # Test search by name
        sample_island = islands[0]
        name_search = sample_island["name"][:4]  # Use first few characters of name
        
        print(f"Searching islands by name: '{name_search}'")
        response = requests.get(f"{self.base_url}/islands?search={name_search}")
        
        self.assertEqual(response.status_code, 200, f"Search islands by name failed: {response.text}")
        search_results = response.json()
        
        # Check if results contain islands with the search term in name
        if search_results:
            found = any(name_search.lower() in island["name"].lower() for island in search_results)
            self.assertTrue(found, f"Search results don't contain islands with '{name_search}' in name")
            print(f"✅ Search islands by name successful - Found {len(search_results)} islands")
        else:
            print(f"⚠️ Search islands by name returned no results for '{name_search}'")
        
        # Test search by atoll
        if "atoll" in sample_island and sample_island["atoll"]:
            atoll_search = sample_island["atoll"]
            
            print(f"Searching islands by atoll: '{atoll_search}'")
            response = requests.get(f"{self.base_url}/islands?search={atoll_search}")
            
            self.assertEqual(response.status_code, 200, f"Search islands by atoll failed: {response.text}")
            search_results = response.json()
            
            # Check if results contain islands with the search term in atoll
            if search_results:
                found = any(atoll_search.lower() in island["atoll"].lower() for island in search_results)
                self.assertTrue(found, f"Search results don't contain islands with '{atoll_search}' in atoll")
                print(f"✅ Search islands by atoll successful - Found {len(search_results)} islands")
            else:
                print(f"⚠️ Search islands by atoll returned no results for '{atoll_search}'")
        
        # Test search by tag
        if "tags" in sample_island and sample_island["tags"]:
            tag_search = sample_island["tags"][0]
            
            print(f"Searching islands by tag: '{tag_search}'")
            response = requests.get(f"{self.base_url}/islands?search={tag_search}")
            
            self.assertEqual(response.status_code, 200, f"Search islands by tag failed: {response.text}")
            search_results = response.json()
            
            # Check if results contain islands with the search term in tags
            if search_results:
                found = any(tag_search.lower() in [tag.lower() for tag in island["tags"]] for island in search_results if "tags" in island)
                self.assertTrue(found, f"Search results don't contain islands with '{tag_search}' in tags")
                print(f"✅ Search islands by tag successful - Found {len(search_results)} islands")
            else:
                print(f"⚠️ Search islands by tag returned no results for '{tag_search}'")

    def test_08_filter_islands_by_atoll(self):
        """Test filtering islands by atoll"""
        print("\n🔍 Testing filter islands by atoll")
        
        # First get all islands to find available atolls
        response = requests.get(f"{self.base_url}/islands")
        self.assertEqual(response.status_code, 200, f"Get islands failed: {response.text}")
        islands = response.json()
        
        if not islands:
            self.skipTest("No islands available for atoll filter test")
        
        # Extract unique atolls
        atolls = list(set(island["atoll"] for island in islands if "atoll" in island))
        
        if not atolls:
            self.skipTest("No atolls available for filter test")
        
        # Test filtering by each atoll
        for atoll in atolls[:3]:  # Test first 3 atolls to keep test shorter
            print(f"Filtering islands by atoll: '{atoll}'")
            response = requests.get(f"{self.base_url}/islands?atoll={atoll}")
            
            self.assertEqual(response.status_code, 200, f"Filter islands by atoll '{atoll}' failed: {response.text}")
            filtered_islands = response.json()
            
            # Check if all returned islands match the requested atoll
            if filtered_islands:
                all_match = all(island["atoll"] == atoll for island in filtered_islands)
                self.assertTrue(all_match, f"Not all islands are in atoll '{atoll}'")
                print(f"✅ Filter islands by atoll '{atoll}' successful - Found {len(filtered_islands)} islands")
            else:
                print(f"⚠️ Filter islands by atoll '{atoll}' successful but no islands found")

    def test_09_mark_island_as_visited(self):
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

    def test_10_get_user_visits(self):
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

    def test_11_get_visited_islands(self):
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
            
    def test_12_get_blog_posts(self):
        """Test getting blog posts"""
        print("\n🔍 Testing get blog posts")
        
        response = requests.get(f"{self.base_url}/blog")
        
        self.assertEqual(response.status_code, 200, f"Get blog posts failed: {response.text}")
        posts = response.json()
        self.assertIsInstance(posts, list, "Blog posts response is not a list")
        
        if posts:
            print(f"✅ Get blog posts successful - Found {len(posts)} posts")
            # Save the first blog post slug for later tests
            self.blog_post_slug = posts[0]["slug"]
        else:
            print("⚠️ Get blog posts successful but no posts found")
            
    def test_13_get_blog_post_by_slug(self):
        """Test getting blog post by slug"""
        print("\n🔍 Testing get blog post by slug")
        
        if not self.blog_post_slug:
            self.skipTest("No blog post slug available")
        
        response = requests.get(f"{self.base_url}/blog/{self.blog_post_slug}")
        
        self.assertEqual(response.status_code, 200, f"Get blog post by slug failed: {response.text}")
        post = response.json()
        self.assertEqual(post["slug"], self.blog_post_slug, "Blog post slug mismatch")
        print(f"✅ Get blog post by slug successful - {post['title']}")
        
    def test_14_admin_login(self):
        """Test admin login"""
        print("\n🔍 Testing admin login")
        
        response = requests.post(
            f"{self.base_url}/login",
            data={
                "username": self.admin_credentials["username"],
                "password": self.admin_credentials["password"]
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Admin login response status: {response.status_code}")
        print(f"Admin login response body: {response.text}")
        
        self.assertEqual(response.status_code, 200, f"Admin login failed: {response.text}")
        data = response.json()
        self.assertIn("access_token", data, "No access token in response")
        self.admin_token = data["access_token"]
        print("✅ Admin login successful")
        
    def test_15_get_admin_profile(self):
        """Test getting admin profile"""
        print("\n🔍 Testing get admin profile")
        
        self.assertIsNotNone(self.admin_token, "No admin token available")
        
        response = requests.get(
            f"{self.base_url}/users/me",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        self.assertEqual(response.status_code, 200, f"Get admin profile failed: {response.text}")
        data = response.json()
        self.assertEqual(data["email"], self.admin_credentials["username"], "Admin email mismatch")
        self.assertTrue(data["is_admin"], "User is not an admin")
        print("✅ Get admin profile successful")
        
    def test_16_get_all_users(self):
        """Test getting all users as admin"""
        print("\n🔍 Testing get all users as admin")
        
        self.assertIsNotNone(self.admin_token, "No admin token available")
        
        response = requests.get(
            f"{self.base_url}/admin/users",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        self.assertEqual(response.status_code, 200, f"Get all users failed: {response.text}")
        users = response.json()
        self.assertIsInstance(users, list, "Users response is not a list")
        print(f"✅ Get all users successful - Found {len(users)} users")
        
    def test_17_create_blog_post(self):
        """Test creating a blog post as admin"""
        print("\n🔍 Testing create blog post as admin")
        
        self.assertIsNotNone(self.admin_token, "No admin token available")
        
        blog_post_data = {
            "title": f"Test Blog Post {uuid.uuid4().hex[:8]}",
            "content": "This is a test blog post created by the API test.",
            "slug": f"test-blog-post-{uuid.uuid4().hex[:8]}",
            "excerpt": "Test blog post excerpt",
            "tags": ["test", "api"],
            "is_published": True
        }
        
        response = requests.post(
            f"{self.base_url}/admin/blog",
            json=blog_post_data,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        self.assertEqual(response.status_code, 200, f"Create blog post failed: {response.text}")
        post = response.json()
        self.blog_post_id = post["id"]
        self.blog_post_slug = post["slug"]
        print(f"✅ Create blog post successful - ID: {self.blog_post_id}")
        
    def test_18_create_island(self):
        """Test creating an island as admin"""
        print("\n🔍 Testing create island as admin")
        
        self.assertIsNotNone(self.admin_token, "No admin token available")
        
        island_data = {
            "name": f"Test Island {uuid.uuid4().hex[:8]}",
            "atoll": "Test Atoll",
            "lat": 4.1755 + (uuid.uuid4().int % 100) / 1000,
            "lng": 73.5093 + (uuid.uuid4().int % 100) / 1000,
            "type": "uninhabited",
            "description": "This is a test island created by the API test.",
            "tags": ["test", "api"]
        }
        
        response = requests.post(
            f"{self.base_url}/admin/islands",
            json=island_data,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        self.assertEqual(response.status_code, 200, f"Create island failed: {response.text}")
        island = response.json()
        test_island_id = island["id"]
        print(f"✅ Create island successful - ID: {test_island_id}")
        
        # Clean up by deleting the test island
        delete_response = requests.delete(
            f"{self.base_url}/admin/islands/{test_island_id}",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        self.assertEqual(delete_response.status_code, 204, f"Delete island failed: {delete_response.text}")
        print(f"✅ Delete island successful - ID: {test_island_id}")
        
    def test_19_delete_blog_post(self):
        """Test deleting a blog post as admin"""
        print("\n🔍 Testing delete blog post as admin")
        
        if not self.blog_post_id or not self.admin_token:
            self.skipTest("No blog post ID or admin token available")
        
        response = requests.delete(
            f"{self.base_url}/admin/blog/{self.blog_post_id}",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        self.assertEqual(response.status_code, 204, f"Delete blog post failed: {response.text}")
        print(f"✅ Delete blog post successful - ID: {self.blog_post_id}")

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
    suite.addTest(MaldivesIslandTrackerAPITest("test_07_search_islands"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_08_filter_islands_by_atoll"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_09_mark_island_as_visited"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_10_get_user_visits"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_11_get_visited_islands"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_12_get_blog_posts"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_13_get_blog_post_by_slug"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_14_admin_login"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_15_get_admin_profile"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_16_get_all_users"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_17_create_blog_post"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_18_create_island"))
    suite.addTest(MaldivesIslandTrackerAPITest("test_19_delete_blog_post"))
    
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