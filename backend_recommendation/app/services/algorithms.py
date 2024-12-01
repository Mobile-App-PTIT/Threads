import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from typing import List
from app.schemas.post import Post

class CollaborativeFiltering:
    def __init__(self, users_data: pd.DataFrame, n_neighbors: int):
        # Create the user-item matrix (0 for not liked, 1 for liked)
        self.users_data = users_data
        self.posts = pd.DataFrame({
            'post_id': [1, 2, 3, 4, 5],
            'title': ["Tech trends in 2024", "Top 10 football players", "AI in healthcare", "Political changes in 2024", "Quantum computing basics"]
        })
        
        # Create user-item matrix
        self.user_item_matrix = pd.DataFrame(0, index=self.users_data['user_id'], columns=self.posts['post_id'])
        for idx, row in self.users_data.iterrows():
            for liked_post in row['liked_post_id']:
                self.user_item_matrix.loc[row['user_id'], liked_post] = 1
        
        # Initialize the NearestNeighbors model
        self.model = NearestNeighbors(n_neighbors=n_neighbors, algorithm='auto')
        self.model.fit(self.user_item_matrix.values)

    def recommend(self, user_id: int) -> List[Post]:
        # Get the user data
        user_data = self.user_item_matrix.loc[user_id].values.reshape(1, -1)

        # Get nearest neighbors (similar users)
        distances, indices = self.model.kneighbors(user_data)
        
        recommended_posts = []
        for idx in indices[0]:
            post_id = self.user_item_matrix.columns[idx]
            recommended_posts.append(Post(post_id=str(post_id), title=self.posts['title'][idx]))
        
        return recommended_posts


class ContentBasedFiltering:
    def __init__(self, posts: pd.DataFrame):
        from sklearn.feature_extraction.text import TfidfVectorizer
        # Vectorize post titles using TF-IDF
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(posts['title'])
        self.posts = posts

    def recommend(self, user_query: str, posts: pd.DataFrame) -> List[Post]:
        # Transform the user query into a vector using the same vectorizer
        query_tfidf = self.vectorizer.transform([user_query])

        # Compute cosine similarities
        cosine_similarities = np.dot(query_tfidf, self.tfidf_matrix.T).toarray().flatten()

        # Get the indices of the top 5 most similar posts
        recommended_indices = cosine_similarities.argsort()[-5:][::-1]

        recommended_posts = []
        for idx in recommended_indices:
            recommended_posts.append(Post(post_id=str(posts['post_id'][idx]), title=posts['title'][idx]))

        return recommended_posts
