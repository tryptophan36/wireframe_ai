from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import generate_frame,modify_frame,generate_frame_new
import os
from dotenv import load_dotenv
import uvicorn


# Load environment variables
load_dotenv()

app = FastAPI(
    title="UI Generator API",
    description="API for generating UI wireframes from screenshots",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(generate_frame.router, prefix="/api", tags=["generate"])
app.include_router(modify_frame.router, prefix="/api", tags=["modify"])
app.include_router(generate_frame_new.router, prefix="/api", tags=["generateFrame"])

@app.get("/")
async def root():
    return {"message": "Welcome to UI Generator API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 