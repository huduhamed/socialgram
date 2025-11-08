import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Models } from 'appwrite';

// internal imports
import { useUserContext } from '@/context/AuthContext';
import { Button } from '../ui/button';
import {
	useCreateComment,
	useDeleteComment,
	useGetComments,
} from '@/lib/react-query/queriesAndMutations';

type CommentProps = {
	postId: string;
};

// comment comp
const Comment = ({ postId }: CommentProps) => {
	const [newComment, setNewComment] = useState('');
	const { user } = useUserContext();
	const { toast } = useToast();

	const { mutate: createComment, isPending: isCreating } = useCreateComment();
	const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();
	const { data: comments } = useGetComments(postId);

	const handleAddComment = async () => {
		if (!newComment.trim() || !user) return;

		createComment(
			{ postId, userId: user.id, content: newComment },
			{
				onSuccess: () => {
					setNewComment('');
					toast({ title: 'Comment added successfully' });
				},
				onError: () => {
					toast({
						title: 'Error adding comment',
						description: 'Please try again',
						variant: 'destructive',
					});
				},
			}
		);
	};

	// handle delete
	const handleDeleteComment = (commentId: string) => {
		deleteComment(commentId, {
			onSuccess: () => {
				toast({ title: 'Comment deleted successfully' });
			},
			onError: () => {
				toast({
					title: 'Error deleting comment',
					description: 'Please try again',
					variant: 'destructive',
				});
			},
		});
	};

	return (
		<div className="flex flex-col">
			{/* Recent comments preview */}
			{comments?.documents && comments.documents.length > 0 && (
				<div className="flex flex-col gap-1 pb-2">
					{comments.documents.slice(0, 2).map((comment: Models.Document) => (
						<div key={comment.$id} className="flex items-center gap-2">
							<p className="text-light-1 text-small-regular">
								<span className="text-small-semibold mr-1">{comment.user?.name}</span>
								{comment.content}
							</p>
							{user?.id === comment.user_id && (
								<Button
									onClick={() => handleDeleteComment(comment.$id)}
									disabled={isDeleting}
									variant="ghost"
									size="icon"
									className="h-auto w-auto p-0 hover:opacity-75"
								>
									<img src="/assets/icons/delete.svg" alt="delete" width={12} height={12} />
								</Button>
							)}
						</div>
					))}
				</div>
			)}

			<div className="flex items-center gap-2 border-t border-dark-4 pt-3">
				<input
					type="text"
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					placeholder="Add a comment..."
					className="flex-1 bg-transparent text-light-1 text-small-regular outline-none placeholder:text-light-4"
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							handleAddComment();
						}
					}}
				/>
				{newComment.trim() && (
					<Button
						onClick={handleAddComment}
						disabled={isCreating}
						variant="ghost"
						className="text-primary-500 hover:text-primary-600 !p-0 text-small-semibold"
					>
						{isCreating ? '...' : 'Post'}
					</Button>
				)}
			</div>
		</div>
	);
};

export default Comment;
