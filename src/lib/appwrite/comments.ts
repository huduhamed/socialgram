import { ID, Query } from 'appwrite';

// internal imports
import { appwriteConfig, databases } from './config';

// CREATE COMMENT
export async function createComment(postId: string, userId: string, content: string) {
	try {
		const comment = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.commentsCollectionId,
			ID.unique(),
			{
				user_id: userId,
				post_id: postId,
				content,
				created_at: new Date().toISOString(),
			}
		);

		return comment;
	} catch (error) {
		console.error('Error creating comment:', error);
		throw error;
	}
}

// GET COMMENTS BY POST ID
export async function getCommentsByPostId(postId: string) {
	try {
		const comments = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.commentsCollectionId,
			[Query.equal('post_id', postId), Query.orderDesc('created_at')]
		);

		return comments;
	} catch (error) {
		console.error('Error fetching comments:', error);
		throw error;
	}
}

// DELETE COMMENT
export async function deleteComment(commentId: string) {
	try {
		const status = await databases.deleteDocument(
			appwriteConfig.databaseId,
			appwriteConfig.commentsCollectionId,
			commentId
		);

		return status;
	} catch (error) {
		console.error('Error deleting comment:', error);
		throw error;
	}
}
