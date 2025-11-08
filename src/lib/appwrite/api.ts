import { ID, Query } from 'appwrite';

// internal imports
import { appwriteConfig, account, databases, storage, avatars } from './config';
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from '@/types';

// CREATE USER
export async function createUserAccount(user: INewUser) {
	try {
		const newAccount = await account.create(ID.unique(), user.email, user.password, user.name);

		if (!newAccount) throw Error;

		const avatarUrlString = avatars.getInitials(user.name);
		const avatarUrl = new URL(avatarUrlString);

		const newUser = await saveUserToDB({
			accountId: newAccount.$id,
			name: user.name,
			email: user.email,
			username: user.username,
			imageUrl: avatarUrl,
		});

		return newUser;
	} catch (error) {
		console.log(error);
		return error;
	}
}
// SAVE NEW USER TO DB
export async function saveUserToDB(user: {
	accountId: string;
	name: string;
	email: string;
	username?: string;
	imageUrl: URL;
}) {
	try {
		const newUser = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			ID.unique(),
			user
		);
		return newUser;
	} catch (error) {
		console.log(error);
	}
}

// SIGN IN USER
export async function signInAccount(user: { email: string; password: string }) {
	try {
		const session = await account.createEmailPasswordSession(user.email, user.password);

		return session;
	} catch (error) {
		console.log(error);
	}
}

// GET ACCOUNT
export async function getAccount() {
	try {
		const currentAccount = await account.get();

		return currentAccount;
	} catch (error) {
		console.log('Error getting account:', error);
	}
}

// CHECK AUTH CURRENT USER
export async function getCurrentUser() {
	try {
		const currentAccount = await getAccount();

		if (!currentAccount) throw new Error();

		const currentUser = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			[Query.equal('accountId', currentAccount.$id)]
		);

		if (!currentUser) throw Error;

		return currentUser.documents[0];
	} catch (error) {
		console.log('Failed to get current user');
		return null;
	}
}

// SIGN OUT USER
export async function signOutAccount() {
	try {
		const session = await account.deleteSession('current');

		return session;
	} catch (error) {
		console.log(error);
	}
}

/**** POSTS ****/

// CREATE POST
export async function createPost(post: INewPost) {
	try {
		// Upload file to appwrite storage
		const uploadedFile = await uploadFile(post.file[0]);
		if (!uploadedFile) throw new Error('File upload failed');

		// Get file URL
		const fileUrl = getFilePreview(uploadedFile.$id);
		if (!fileUrl) {
			console.error('Failed to generate file URL');
			await deleteFile(uploadedFile.$id);
			throw new Error('Failed to generate file URL');
		}

		// Convert tags into array
		const tags = post.tags?.replace(/ /g, '').split(',') || [];

		// Create post
		const newPost = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			ID.unique(),
			{
				creator: post.userId,
				caption: post.caption,
				imageId: uploadedFile.$id,
				imageUrl: fileUrl,
				location: post.location,
				tags: tags,
			}
		);

		if (!newPost) {
			console.error('Failed to create post document');
			await deleteFile(uploadedFile.$id);
			throw new Error('Failed to create post');
		}

		console.log('Post created successfully:', {
			postId: newPost.$id,
			imageUrl: fileUrl,
			imageId: uploadedFile.$id,
		});

		return newPost;
	} catch (error) {
		console.log('Error creating post:', error);
	}
}

/***** FILE ****/

// UPLOAD FILE
export async function uploadFile(file: File) {
	try {
		const uploadedFile = await storage.createFile(appwriteConfig.storageId, ID.unique(), file);

		if (!uploadedFile) throw new Error('Failed to upload file');

		// Verify the file exists immediately after upload
		const fileExists = await storage.getFile(appwriteConfig.storageId, uploadedFile.$id);

		if (!fileExists) throw new Error('File upload succeeded but file not found');

		return uploadedFile;
	} catch (error) {
		console.error('File upload failed:', error);
		throw error; // Propagate the error so we can handle it in the UI
	}
}

// GET FILE PREVIEW/URL
export function getFilePreview(fileId: string) {
	try {
		// Construct the direct file URL using the Appwrite endpoint
		const fileUrl = `${appwriteConfig.url}/storage/buckets/${appwriteConfig.storageId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
		return fileUrl;
	} catch (error) {
		console.log('Error creating file URL', error);
	}
}

// DELETE FILE
export async function deleteFile(fileId: string) {
	try {
		await storage.deleteFile(appwriteConfig.storageId, fileId);

		return { status: 'ok' };
	} catch (error) {
		console.log(error);
	}
}

/***** POSTS ****/

// GET POSTS
export async function searchPosts(searchTerm: string) {
	try {
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			[Query.search('caption', searchTerm)]
		);

		if (!posts) throw Error;

		return posts;
	} catch (error) {
		console.log('Post not found:', error);
	}
}

// GET INFINITE POSTS
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
	const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)];

	if (pageParam) {
		queries.push(Query.cursorAfter(pageParam.toString()));
	}

	try {
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			queries
		);

		if (!posts) throw Error;

		return posts;
	} catch (error) {
		console.log(error);
	}
}

// GET POST BY ID
export async function getPostById(postId?: string) {
	if (!postId) throw Error;

	try {
		const post = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId
		);

		if (!post) throw Error;

		return post;
	} catch (error) {
		console.log("can't find post:", error);
	}
}

// UPDATE POST
export async function updatePost(post: IUpdatePost) {
	const hasFileToUpdate = post.file.length > 0;

	try {
		let image = {
			imageUrl: post.imageUrl,
			imageId: post.imageId,
		};

		if (hasFileToUpdate) {
			// upload file to appwrite storage
			const uploadedFile = await uploadFile(post.file[0]);
			if (!uploadedFile) throw Error;

			// get file url
			const fileUrl = getFilePreview(uploadedFile.$id);
			if (!fileUrl) {
				await deleteFile(uploadedFile.$id);
				throw Error;
			}

			image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
		}

		// convert tags into array
		const tags = post.tags?.replace(/ /g, '').split(' , ') || [];

		// update post
		const updatedPost = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			post.postId,
			{
				caption: post.caption,
				imageUrl: image.imageUrl,
				imageId: image.imageId,
				location: post.location,
				tags: tags,
			}
		);

		// failed to update post
		if (!updatedPost) {
			// delete new file that was uploaded
			await deleteFile(image.imageId);
			// if no new file was uploaded, throw error
			throw Error;
		}

		// delete old file if successfully updated
		if (hasFileToUpdate) {
			await deleteFile(post.imageId);
		}

		return updatedPost;
	} catch (error) {
		console.log(error);
	}
}

// DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
	if (!postId || !imageId) return;

	try {
		const statusCode = await databases.deleteDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId
		);

		if (!statusCode) throw Error;

		await deleteFile(imageId);

		return { status: 'ok' };
	} catch (error) {
		console.log('Failed to delete post:', error);
	}
}

// LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
	try {
		const updatedPost = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId,
			{
				likes: likesArray,
			}
		);

		if (!updatedPost) throw Error;

		return updatedPost;
	} catch (error) {
		console.log(error);
	}
}

// SAVE POST
export async function savePost(userId: string, postId: string) {
	try {
		const updatedPost = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.savesCollectionId,
			ID.unique(),
			{
				user: userId,
				post: postId,
			}
		);

		if (!updatePost) throw Error;

		return updatedPost;
	} catch (error) {
		console.log('Error saving post:', error);
	}
}

// DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
	try {
		const statusCode = await databases.deleteDocument(
			appwriteConfig.databaseId,
			appwriteConfig.savesCollectionId,
			savedRecordId
		);

		if (!statusCode) throw Error;

		return { status: 'ok' };
	} catch (error) {
		console.log('Failed to delete saved post:', error);
	}
}

// GET USER'S POSTS

export async function getUserPosts(userId?: string) {
	if (!userId) return;

	try {
		const post = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			[Query.equal('creator', userId), Query.orderDesc('$createdAt')]
		);

		if (!post) throw Error;

		return post;
	} catch (error) {
		console.log("Error fetching user's posts:", error);
	}
}

// GET POPULAR POSTS / HIGHEST LIKE COUNT
export async function getRecentPosts() {
	try {
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			[Query.orderDesc('$createdAt'), Query.limit(15)]
		);

		if (!posts) throw Error;

		return posts;
	} catch (error) {
		console.log('Error fetching recent posts:', error);
	}
}

// CREATE COMMENTS
// export async function createComment(
//   postId: string,
//   newComment: { userId: string; comments: string }
// ) {
//   try {
//     // Fetch the existing post document
//     const post = await databases.getDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.postCollectionId,
//       postId
//     );

//     // Ensure comments array exists; if not, initialize it
//     const existingComments = post.comments || [];

//     // Add the new comment
//     const updatedComments = [
//       ...existingComments,
//       { ...newComment, createdAt: new Date().toISOString() },
//     ];

//     // Update the post with the new comments array
//     const updatedPost = await databases.updateDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.postCollectionId,
//       postId,
//       {
//         comments: updatedComments,
//       }
//     );

//     return updatedPost;
//   } catch (error) {
//     console.error("Error creating comment:", error);
//   }
// }

// GE COMMENTS BY POSTID
// export async function getCommentsByPostId(postId: string) {
//   try {
//     const post = await databases.getDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.postCollectionId,
//       postId
//     );

//     if (!post) throw Error;

//     return post.comments || [];
//   } catch (error) {
//     console.log("Error fetching comments:", error);
//     throw error;
//   }
// }

// // DELETE COMMENTS
// export async function deleteComment(postId: string, updatedComments: string[]) {
//   return await databases.updateDocument(
//     appwriteConfig.databaseId,
//     appwriteConfig.postCollectionId,
//     postId,
//     { comments: updatedComments }
//   );
// }

/***** GET USERS ****/
export async function getUsers(limit?: number) {
	const queries: any[] = [Query.orderDesc('$createdAt')];

	if (limit) {
		queries.push(Query.limit(limit));
	}

	try {
		const users = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			queries
		);

		if (!users) throw Error;

		return users;
	} catch (error) {
		console.log("Can't find users:", error);
	}
}

// GET USER BY ID
export async function getUserById(userId: string) {
	try {
		const user = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			userId
		);

		if (!user) throw Error;

		return user;
	} catch (error) {
		console.log('Error finding user:', error);
	}
}

// UPDATE USER

export async function updateUser(user: IUpdateUser) {
	const hasFileToUpdate = user.file.length > 0;

	try {
		let image = {
			imageUrl: user.imageUrl,
			imageId: user.imageId,
		};

		if (hasFileToUpdate) {
			// upload new file to appwrite storage
			const uploadedFile = await uploadFile(user.file[0]);
			if (!uploadedFile) throw Error;

			// get new file url
			const fileUrl = getFilePreview(uploadedFile.$id);
			if (!fileUrl) {
				await deleteFile(uploadedFile.$id);
				throw Error;
			}

			image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
		}

		// update user
		const updatedUser = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			user.userId,
			{
				name: user.name,
				bio: user.bio,
				imageUrl: image.imageUrl,
				imageId: image.imageId,
			}
		);

		// if failed to update user
		if (!updatedUser) {
			// delete new file that has been uploaded
			if (hasFileToUpdate) {
				await deleteFile(image.imageId);
			}

			// if no new file, throw error
			throw Error;
		}

		// delete old file if successfully updated
		if (user.imageId && hasFileToUpdate) {
			await deleteFile(user.imageId);
		}

		return updatedUser;
	} catch (error) {
		console.log(error);
	}
}

//
