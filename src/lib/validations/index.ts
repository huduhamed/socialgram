import { z } from 'zod';

// SIGNUP VALIDATION
export const SignupValidation = z.object({
	name: z.string().min(2, { message: 'name too short' }),
	username: z.string().min(2, { message: 'username too short' }),
	email: z.string().email(),
	password: z.string().min(8, { message: 'password too short' }),
});

// SIGN IN VALIDATION
export const SigninValidation = z.object({
	email: z.string().email(),
	password: z.string().min(8, { message: 'password too short' }),
});

// POST VALIDATION
export const PostValidation = z.object({
	caption: z.string().min(5).max(2200),
	file: z.custom<File[]>(),
	location: z.string().min(2).max(100),
	tags: z.string(),
});

// COMMENT VALIDATION
export const CommentValidation = z.object({
	content: z
		.string()
		.min(1, { message: 'Comment cannot be empty' })
		.max(200, { message: 'Comment too long' }),
});

// PROFILE VALIDATION
export const ProfileValidation = z.object({
	file: z.custom<File[]>(),
	name: z.string().min(2, { message: 'Name must be 2 characters minimum' }),
	username: z.string().min(2, { message: 'UserName must be  2 characters minimum' }),
	email: z.string().email(),
	bio: z.string(),
});
