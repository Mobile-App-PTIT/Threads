from fastapi import APIRouter
from typing import List
import pandas as pd
from app.schemas.post import Post
from app.schemas.recommendation import RecommendationResponse
from app.services.algorithms import CollaborativeFiltering, ContentBasedFiltering

router = APIRouter()

## Testing data
posts_data = pd.DataFrame({
    'post_id': [1, 2, 3, 4, 5],
    'title': ["Tech trends in 2024", "Top 10 football players", "AI in healthcare", "Political changes in 2024", "Quantum computing basics"],
})

## Note:
## Add the liked_post_id to the user in database
users_data = pd.DataFrame({
    'user_id': [1, 2, 3, 4, 5],
    'liked_post_id': [[1, 3], [2, 4], [1, 5], [2, 3], [1, 2, 4]]
})

cf_model = CollaborativeFiltering(users_data = users_data[['user_id', 'liked_post_id']], n_neighbors=5)
cbf_model = ContentBasedFiltering(posts=posts_data)

@router.get("/recommendations/{user_id}")
def get_recommendations(user_id: int):
    # Collaborative Filtering recommendations
    cf_recommendations = cf_model.recommend(user_id)

    # Content-Based Filtering recommendations
    user_query = "AI"
    cbf_recommendations = cbf_model.recommend(user_query, posts_data)

    # Combine recommendations from both models and remove duplicates
    all_recommended_posts = cf_recommendations + cbf_recommendations
    unique_recommended_posts = {post.post_id: post for post in all_recommended_posts}.values()

    return RecommendationResponse(recommended_posts=list(unique_recommended_posts))