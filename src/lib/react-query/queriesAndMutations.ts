import { useQueryClient, useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';

// internal imports
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from '@/types';

import { createComment, deleteComment, getCommentsByPostId } from '@/lib/appwrite/comments';
import {
	createUserAccount,
	signInAccount,
	getCurrentUser,
	signOutAccount,
	getUsers,
	createPost,
	getPostById,
	updatePost,
	getUserPosts,
	deletePost,
	likePost,
	getUserById,
	updateUser,
	getRecentPosts,
	getInfinitePosts,
	searchPosts,
	savePost,
	deleteSavedPost,
} from '../appwrite/api';
import { QUERY_KEYS } from './queryKeys';

// create user account query
export const useCreateUserAccount = () => {
	return useMutation({
		mutationFn: (user: INewUser) => createUserAccount(user),
	});
};

// SIGN IN USER
export const useSignInAccount = () => {
	return useMutation({
		mutationFn: (user: { email: string; password: string }) => signInAccount(user),
	});
};

// SIGN OUT USER
export const useSignOutAccount = () => {
	return useMutation({
		mutationFn: signOutAccount,
	});
};

/*** POST QUERIES ***/

// CREATE POST
export const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (post: INewPost) => createPost(post),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			});
		},
	});
};

// GET POSTS
export const useGetPosts = () => {
	// check useInfiniteQuery
	return useInfiniteQuery({
		queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
		queryFn: getInfinitePosts as any,
		// initialPageParam: null, // specify an initial parameter
		getNextPageParam: (lastPage: any) => {
			// If there's no data, there are no more pages.
			if (lastPage && lastPage.documents.length === 0) {
				return null;
			}

			// Use the $id of the last document as the cursor.
			const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
			return lastId;
		},
	});
};

// SEARCH POSTS
export const useSearchPosts = (searchTerm: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
		queryFn: () => searchPosts(searchTerm),
		enabled: !!searchTerm,
	});
};

// GET RECENT POSTS
export const useGetRecentPosts = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
		queryFn: getRecentPosts,
	});
};

// GET POST BY ID
export const useGetPostById = (postId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
		queryFn: () => getPostById(postId),
		enabled: !!postId,
	});
};

// GET USER POSTS
export const useGetUserPosts = (userId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
		queryFn: () => getUserPosts(userId),
		enabled: !!userId,
	});
};

// COMMENT QUERIES
export const useCreateComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			postId,
			userId,
			content,
		}: {
			postId: string;
			userId: string;
			content: string;
		}) => createComment(postId, userId, content),
		onSuccess: (_, { postId }) => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST_ID, postId],
			});
		},
	});
};

export const useGetComments = (postId: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST_ID, postId],
		queryFn: () => getCommentsByPostId(postId),
		enabled: !!postId,
	});
};

export const useDeleteComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commentId: string) => deleteComment(commentId),
		onSuccess: (_, commentId) => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST_ID],
			});
		},
	});
};

// UPDATE POST
export const useUpdatePost = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (post: IUpdatePost) => updatePost(post),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
			});
		},
	});
};

// DELETE POST
export const useDeletePost = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
			deletePost(postId, imageId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			});
		},
	});
};

// LIKE / UNLIKE POST
export const useLikePost = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ postId, likesArray }: { postId: string; likesArray: string[] }) =>
			likePost(postId, likesArray),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			});
		},
	});
};

// SAVE POST
export const useSavePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
			savePost(userId, postId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			});
		},
	});
};

// DELETE SAVED POST
export const useDeleteSavedPost = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			});
		},
	});
};

/******* USR QUERIES ******/

// GET CURRENT USER
export const useGetCurrentUser = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_CURRENT_USER],
		queryFn: getCurrentUser,
	});
};

// GET USERS
export const useGetUsers = (limit?: number) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_USERS],
		queryFn: () => getUsers(limit),
	});
};

// GET USER BY ID
export const useGetUserById = (userId: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
		queryFn: () => getUserById(userId),
		enabled: !!userId,
	});
};

// UPDATE USER
export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (user: IUpdateUser) => updateUser(user),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
			});
		},
	});
};

// COMMENT SECTION

// export const useCreateComment = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       postId,
//       newComment,
//     }: {
//       postId: string;
//       newComment: { userId: string; comments: string };
//     }) => createComment(postId, newComment),
//     onSuccess: (_, { postId }) => {
//       queryClient.invalidateQueries({
//         queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST_ID, postId],
//       });
//     },
//   });
// };

// export const useGetComments = (postId: string) => {
//   return useQuery({
//     queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST_ID, postId],
//     queryFn: () => getCommentsByPostId(postId),
//   });
// };

// export const useDeleteComment = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       postId,
//       updatedComments,
//     }: {
//       postId: string;
//       updatedComments: string[];
//     }) => deleteComment(postId, updatedComments),
//     onSuccess: (_, { postId }) => {
//       queryClient.invalidateQueries({
//         queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST_ID, postId],
//       });
//     },
//   });
// };
