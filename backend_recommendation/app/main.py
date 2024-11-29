from fastapi import FastAPI
from app.routers import recommendations

app = FastAPI()

app.include_router(recommendations.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Recommendation Service is running!"}

### uvicorn app.main:app --reload