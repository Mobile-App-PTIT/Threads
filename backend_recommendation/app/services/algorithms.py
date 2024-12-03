import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from typing import List, Tuple
from app.schemas.post import Post

class CollaborativeFiltering:
    def __init__(self, users_data: pd.DataFrame, posts_data: pd.DataFrame, n_neighbors: int):
        self.users_data = users_data
        self.posts = posts_data
        self.n_neighbors = n_neighbors

        # Create user-item matrix
        post_ids = self.posts['post_id'].unique()
        self.user_item_matrix = pd.DataFrame(0, index=self.users_data['user_id'], columns=post_ids)
        for idx, row in self.users_data.iterrows():
            for liked_post in row['liked_posts']:
                if liked_post in post_ids:
                    self.user_item_matrix.at[row['user_id'], liked_post] = 1

    def recommend(self, user_id: str) -> List[Tuple[str, float]]:
        if user_id not in self.user_item_matrix.index:
            return []

        num_users = len(self.user_item_matrix)
        n_neighbors = min(self.n_neighbors, num_users - 1)

        if n_neighbors <= 0:
            return []

        model = NearestNeighbors(n_neighbors=n_neighbors, algorithm='auto')
        model.fit(self.user_item_matrix.values)

        user_index = self.user_item_matrix.index.get_loc(user_id)
        user_data = self.user_item_matrix.iloc[user_index].values.reshape(1, -1)

        # Find the k-neighbors of user data
        distances, indices = model.kneighbors(user_data)

        neighbor_indices = indices.flatten()
        neighbor_distances = distances.flatten()

        recommended_posts = {}
        user_liked_posts = set(self.user_item_matrix.columns[self.user_item_matrix.loc[user_id] > 0])

        for neighbor_index, distance in zip(neighbor_indices, neighbor_distances):
            neighbor_user_id = self.user_item_matrix.index[neighbor_index]
            if neighbor_user_id == user_id:
                continue
            similarity = 1 / (1 + distance)  
            neighbor_liked_posts = set(self.user_item_matrix.columns[self.user_item_matrix.iloc[neighbor_index] > 0])
            # Filter out posts that the user has already liked
            posts_to_recommend = neighbor_liked_posts - user_liked_posts
            for post_id in posts_to_recommend:
                if post_id in recommended_posts:
                    recommended_posts[post_id] += similarity
                else:
                    recommended_posts[post_id] = similarity

        # Convert the post and score to a list of tuples
        recommended_posts_list = [(str(post_id), score) for post_id, score in recommended_posts.items()]
        return recommended_posts_list


class ContentBasedFiltering:
    def __init__(self, posts: pd.DataFrame):
        from sklearn.feature_extraction.text import TfidfVectorizer
        # Vectorize the post titles
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(posts['title'])
        self.posts = posts

    def recommend(self, user_query: str) -> List[Tuple[str, float]]:
        query_tfidf = self.vectorizer.transform([user_query])

        cosine_similarities = np.dot(query_tfidf, self.tfidf_matrix.T).toarray().flatten()

        recommended_posts_list = [(str(self.posts['post_id'].iloc[idx]), cosine_similarities[idx]) for idx in range(len(cosine_similarities))]

        recommended_posts_list.sort(key=lambda x: x[1], reverse=True)

        return recommended_posts_list

