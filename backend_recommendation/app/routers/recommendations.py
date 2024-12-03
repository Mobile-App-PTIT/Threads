from fastapi import APIRouter
from typing import List
import pandas as pd
from app.schemas.recommendation import RecommendationRequest
from app.services.algorithms import CollaborativeFiltering, ContentBasedFiltering

router = APIRouter()

@router.post("/recommendations")
def get_recommendations(request: RecommendationRequest):
    collaborative_data = request.CollaborativeFilteringData
    content_data = request.ContentBasedFilteringData

    user_id = request.user_id
    user_query = request.user_query

    users_data = pd.DataFrame([{'user_id': item.user_id, 'liked_posts': item.liked_posts} for item in collaborative_data])
    posts_data = pd.DataFrame([{'post_id': item.post_id, 'title': item.title} for item in content_data])

    cf_model = CollaborativeFiltering(users_data=users_data, posts_data=posts_data, n_neighbors=5)
    cbf_model = ContentBasedFiltering(posts=posts_data)

    cf_recommendations = cf_model.recommend(user_id)
    cbf_recommendations = cbf_model.recommend(user_query)

    ## Weighted Hybrid Recommendation
    cf_weight = 0.4
    cbf_weight = 0.6

    combined_scores = {}

    # Combine scores from CF
    for post_id, score in cf_recommendations:
        combined_score = cf_weight * score
        if post_id in combined_scores:
            combined_scores[post_id] += combined_score
        else:
            combined_scores[post_id] = combined_score

    # Combine scores from CBF
    for post_id, score in cbf_recommendations:
        combined_score = cbf_weight * score
        if post_id in combined_scores:
            combined_scores[post_id] += combined_score
        else:
            combined_scores[post_id] = combined_score

    # Sort the combined scores
    sorted_recommendations = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)

    top_recommendations = sorted_recommendations[:100]

    recommended_post_ids = [post_id for post_id, _ in top_recommendations]

    return {'recommendationPostsId': recommended_post_ids}