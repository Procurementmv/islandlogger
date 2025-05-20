from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import json
import passlib.hash as hash
import jwt
from bson import json_util

# Set up root directory and load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get("SECRET_KEY", "maldives_island_tracker_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# Define MongoDB collection names
USERS_COLLECTION = "users"
ISLANDS_COLLECTION = "islands"
VISITS_COLLECTION = "visits"
BADGES_COLLECTION = "badges"
BLOG_POSTS_COLLECTION = "blog_posts"
ADS_COLLECTION = "ads"

# Define Models
class Island(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    atoll: str
    lat: float
    lng: float
    type: str  # "resort", "inhabited", "uninhabited", "industrial"
    population: Optional[int] = None
    description: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class IslandCreate(BaseModel):
    name: str
    atoll: str
    lat: float
    lng: float
    type: str
    population: Optional[int] = None
    description: Optional[str] = None
    tags: List[str] = []

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    visits_count: int = 0
    badges: List[str] = []
    is_admin: bool = False

class UserInDB(User):
    hashed_password: str

class Visit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    island_id: str
    visit_date: datetime
    notes: Optional[str] = None
    photos: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VisitCreate(BaseModel):
    island_id: str
    visit_date: datetime
    notes: Optional[str] = None
    photos: List[str] = []

class Badge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    criteria: Dict[str, Any]
    icon: str

class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author_id: str
    slug: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    tags: List[str] = []
    is_published: bool = True
    published_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BlogPostCreate(BaseModel):
    title: str
    content: str
    slug: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    tags: List[str] = []
    is_published: bool = True
    published_date: Optional[datetime] = None

class Ad(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    placement: str  # "header", "sidebar", "footer", "blog-inline", "island-detail"
    image_url: Optional[str] = None
    destination_url: str
    alt_text: Optional[str] = None
    size: str  # "728x90", "300x250", "160x600", etc.
    is_active: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AdCreate(BaseModel):
    name: str
    description: Optional[str] = None
    placement: str
    image_url: Optional[str] = None
    destination_url: str
    alt_text: Optional[str] = None
    size: str
    is_active: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Helper Functions
def parse_json(data):
    return json.loads(json_util.dumps(data))

def get_password_hash(password: str) -> str:
    return hash.bcrypt.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash.bcrypt.verify(plain_password, hashed_password)

async def get_user_by_email(email: str):
    user = await db[USERS_COLLECTION].find_one({"email": email})
    if user:
        return UserInDB(**user)
    return None

async def get_user_by_id(user_id: str):
    user = await db[USERS_COLLECTION].find_one({"id": user_id})
    if user:
        return UserInDB(**user)
    return None

async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except jwt.PyJWTError:
        raise credentials_exception
    user = await get_user_by_id(token_data.user_id)
    if user is None:
        raise credentials_exception
    return user

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# API Routes - Auth
@api_router.post("/register", response_model=User)
async def register_user(user_data: UserCreate):
    # Check if user exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_in_db = UserInDB(
        **user_data.model_dump(exclude={"password"}),
        hashed_password=hashed_password
    )
    
    await db[USERS_COLLECTION].insert_one(user_in_db.model_dump())
    return User(**user_in_db.model_dump(exclude={"hashed_password"}))

@api_router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# API Routes - Islands
@api_router.get("/islands", response_model=List[Island])
async def get_islands(type: Optional[str] = None):
    query = {}
    if type and type != "all":
        query["type"] = type
    islands = await db[ISLANDS_COLLECTION].find(query).to_list(1000)
    return [Island(**island) for island in islands]

@api_router.get("/islands/{island_id}", response_model=Island)
async def get_island(island_id: str):
    island = await db[ISLANDS_COLLECTION].find_one({"id": island_id})
    if not island:
        raise HTTPException(status_code=404, detail="Island not found")
    return Island(**island)

@api_router.post("/islands", response_model=Island)
async def create_island(island_data: IslandCreate):
    island = Island(**island_data.model_dump())
    await db[ISLANDS_COLLECTION].insert_one(island.model_dump())
    return island

# API Routes - Visits
@api_router.post("/visits", response_model=Visit)
async def create_visit(
    visit_data: VisitCreate,
    current_user: User = Depends(get_current_user)
):
    # Check if island exists
    island = await db[ISLANDS_COLLECTION].find_one({"id": visit_data.island_id})
    if not island:
        raise HTTPException(status_code=404, detail="Island not found")
    
    # Create visit
    visit = Visit(
        **visit_data.model_dump(),
        user_id=current_user.id
    )
    
    await db[VISITS_COLLECTION].insert_one(visit.model_dump())
    
    # Update user visit count
    await db[USERS_COLLECTION].update_one(
        {"id": current_user.id},
        {"$inc": {"visits_count": 1}}
    )
    
    return visit

@api_router.get("/visits/user", response_model=List[Visit])
async def get_user_visits(current_user: User = Depends(get_current_user)):
    visits = await db[VISITS_COLLECTION].find({"user_id": current_user.id}).to_list(1000)
    return [Visit(**visit) for visit in visits]

@api_router.get("/islands/visited", response_model=List[Island])
async def get_visited_islands(current_user: User = Depends(get_current_user)):
    # Get all visit records for the user
    visits = await db[VISITS_COLLECTION].find({"user_id": current_user.id}).to_list(1000)
    island_ids = [visit["island_id"] for visit in visits]
    
    # Get the island details for visited islands
    if island_ids:
        islands = await db[ISLANDS_COLLECTION].find({"id": {"$in": island_ids}}).to_list(1000)
        return [Island(**island) for island in islands]
    return []

# API Routes - Blog
@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts(
    skip: int = 0, 
    limit: int = 10, 
    tag: Optional[str] = None,
    published_only: bool = True
):
    query = {"is_published": True} if published_only else {}
    if tag:
        query["tags"] = tag
    
    blog_posts = await db[BLOG_POSTS_COLLECTION].find(query).skip(skip).limit(limit).to_list(limit)
    return [BlogPost(**post) for post in blog_posts]

@api_router.get("/blog/{slug}", response_model=BlogPost)
async def get_blog_post(slug: str):
    post = await db[BLOG_POSTS_COLLECTION].find_one({"slug": slug})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return BlogPost(**post)

# Admin Routes - Blog Management
@api_router.post("/admin/blog", response_model=BlogPost)
async def create_blog_post(
    post_data: BlogPostCreate,
    current_admin: User = Depends(get_current_admin)
):
    # Check if slug already exists
    existing_post = await db[BLOG_POSTS_COLLECTION].find_one({"slug": post_data.slug})
    if existing_post:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blog post with this slug already exists"
        )
    
    # Create new blog post
    blog_post = BlogPost(
        **post_data.model_dump(),
        author_id=current_admin.id,
        published_date=post_data.published_date or datetime.utcnow() if post_data.is_published else None
    )
    
    await db[BLOG_POSTS_COLLECTION].insert_one(blog_post.model_dump())
    return blog_post

@api_router.put("/admin/blog/{post_id}", response_model=BlogPost)
async def update_blog_post(
    post_id: str,
    post_data: BlogPostCreate,
    current_admin: User = Depends(get_current_admin)
):
    # Check if blog post exists
    existing_post = await db[BLOG_POSTS_COLLECTION].find_one({"id": post_id})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Check for slug collision (but exclude current post)
    if post_data.slug != existing_post["slug"]:
        collision = await db[BLOG_POSTS_COLLECTION].find_one({
            "slug": post_data.slug,
            "id": {"$ne": post_id}
        })
        if collision:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Blog post with this slug already exists"
            )
    
    # Update the blog post
    update_data = post_data.model_dump()
    update_data["updated_at"] = datetime.utcnow()
    
    # Update published date if publishing for the first time
    if post_data.is_published and not existing_post.get("is_published"):
        update_data["published_date"] = post_data.published_date or datetime.utcnow()
    
    await db[BLOG_POSTS_COLLECTION].update_one(
        {"id": post_id},
        {"$set": update_data}
    )
    
    updated_post = await db[BLOG_POSTS_COLLECTION].find_one({"id": post_id})
    return BlogPost(**updated_post)

@api_router.delete("/admin/blog/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_post(
    post_id: str,
    current_admin: User = Depends(get_current_admin)
):
    # Check if blog post exists
    existing_post = await db[BLOG_POSTS_COLLECTION].find_one({"id": post_id})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    await db[BLOG_POSTS_COLLECTION].delete_one({"id": post_id})
    return None

# Admin Routes - User Management
@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin)
):
    users = await db[USERS_COLLECTION].find().skip(skip).limit(limit).to_list(limit)
    return [User(**user) for user in users]

@api_router.put("/admin/users/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    is_admin: bool,
    current_admin: User = Depends(get_current_admin)
):
    # Check if user exists
    user = await db[USERS_COLLECTION].find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user admin status
    await db[USERS_COLLECTION].update_one(
        {"id": user_id},
        {"$set": {"is_admin": is_admin}}
    )
    
    updated_user = await db[USERS_COLLECTION].find_one({"id": user_id})
    return User(**updated_user)

# Admin Routes - Island Management
@api_router.post("/admin/islands", response_model=Island)
async def admin_create_island(
    island_data: IslandCreate,
    current_admin: User = Depends(get_current_admin)
):
    island = Island(**island_data.model_dump())
    await db[ISLANDS_COLLECTION].insert_one(island.model_dump())
    return island

@api_router.put("/admin/islands/{island_id}", response_model=Island)
async def admin_update_island(
    island_id: str,
    island_data: IslandCreate,
    current_admin: User = Depends(get_current_admin)
):
    # Check if island exists
    island = await db[ISLANDS_COLLECTION].find_one({"id": island_id})
    if not island:
        raise HTTPException(status_code=404, detail="Island not found")
    
    # Update the island
    update_data = island_data.model_dump()
    
    await db[ISLANDS_COLLECTION].update_one(
        {"id": island_id},
        {"$set": update_data}
    )
    
    updated_island = await db[ISLANDS_COLLECTION].find_one({"id": island_id})
    return Island(**updated_island)

@api_router.delete("/admin/islands/{island_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_island(
    island_id: str,
    current_admin: User = Depends(get_current_admin)
):
    # Check if island exists
    island = await db[ISLANDS_COLLECTION].find_one({"id": island_id})
    if not island:
        raise HTTPException(status_code=404, detail="Island not found")
    
    # Check if island has visits
    visit_count = await db[VISITS_COLLECTION].count_documents({"island_id": island_id})
    if visit_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete island with {visit_count} visits"
        )
    
    await db[ISLANDS_COLLECTION].delete_one({"id": island_id})
    return None

# Initialize the Maldives islands data if the collection is empty
@app.on_event("startup")
async def initialize_data():
    # Check if islands collection is empty
    island_count = await db[ISLANDS_COLLECTION].count_documents({})
    
    if island_count == 0:
        # Sample islands data for the Maldives
        sample_islands = [
            {
                "name": "Malé",
                "atoll": "Kaafu",
                "lat": 4.1755,
                "lng": 73.5093,
                "type": "inhabited",
                "population": 133412,
                "description": "Capital city of the Maldives",
                "tags": ["capital", "city", "urban"]
            },
            {
                "name": "Hulhumalé",
                "atoll": "Kaafu",
                "lat": 4.2100,
                "lng": 73.5555,
                "type": "inhabited",
                "population": 50000,
                "description": "Artificial island built to meet housing needs",
                "tags": ["artificial", "urban", "housing"]
            },
            {
                "name": "Kuramathi",
                "atoll": "Alifu",
                "lat": 4.2655,
                "lng": 72.9897,
                "type": "resort",
                "description": "Luxury resort island with water villas",
                "tags": ["resort", "luxury", "diving"]
            },
            {
                "name": "Maafushi",
                "atoll": "Kaafu",
                "lat": 3.9432,
                "lng": 73.4881,
                "type": "inhabited",
                "population": 3025,
                "description": "Popular local island for tourism",
                "tags": ["local", "tourism", "budget"]
            },
            {
                "name": "Baros",
                "atoll": "Kaafu",
                "lat": 4.2826,
                "lng": 73.4273,
                "type": "resort",
                "description": "Small luxury resort island",
                "tags": ["resort", "luxury", "romantic"]
            },
            {
                "name": "Fuvahmulah",
                "atoll": "Gnaviyani",
                "lat": -0.2986,
                "lng": 73.4239,
                "type": "inhabited",
                "population": 8055,
                "description": "Unique island with freshwater lakes",
                "tags": ["local", "nature", "lakes"]
            },
            {
                "name": "Addu City",
                "atoll": "Addu",
                "lat": -0.6301,
                "lng": 73.1579,
                "type": "inhabited",
                "population": 18000,
                "description": "Southernmost atoll with connected islands",
                "tags": ["city", "history", "beaches"]
            },
            {
                "name": "Veligandu",
                "atoll": "Alifu",
                "lat": 4.2979,
                "lng": 72.9651,
                "type": "resort",
                "description": "Popular resort with pristine beaches",
                "tags": ["resort", "honeymoon", "beaches"]
            },
            {
                "name": "Thilafushi",
                "atoll": "Kaafu",
                "lat": 4.1824,
                "lng": 73.4320,
                "type": "industrial",
                "description": "Artificial island used for industry and waste management",
                "tags": ["industrial", "artificial"]
            },
            {
                "name": "Thulusdhoo",
                "atoll": "Kaafu",
                "lat": 4.3744,
                "lng": 73.6482,
                "type": "inhabited",
                "population": 1400,
                "description": "Known for surfing and Coca-Cola factory",
                "tags": ["local", "surfing", "coke"]
            }
        ]
        
        # Insert the sample islands
        for island_data in sample_islands:
            island = Island(**island_data)
            await db[ISLANDS_COLLECTION].insert_one(island.model_dump())
        
        logging.info(f"Initialized {len(sample_islands)} sample islands")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
