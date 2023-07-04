"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import slugify from "slugify";

import {
	AiCategories,
	PostErrorsType,
	PostType,
	PostTypeFromDb,
	postFromDbInit,
} from "@/interfaces/Post";
import { FormTypes } from "@/interfaces/Form";
import Form from "@/app/components/Form";
import { Path } from "@/interfaces/Path";
import { fetchPosts } from "@/lib/fetch";

const UpdatePost_Page: React.FC = () => {
	const t = useTranslations("CreatePost");
	const router = useRouter();
	const { data: session } = useSession();
	const [submitting, setSubmitting] = useState(false);
	const [post, setPost] = useState<PostType | PostTypeFromDb>(postFromDbInit);
	const [errors, setErrors] = useState<PostErrorsType>(null!);
	const [formDataToUpload, setFormDataToUpload] = useState<FormData | undefined>(undefined);
	const [postImageFilename, setPostImageFilename] = useState<string | null>(null);

	const searchParams = useSearchParams();
	const postId = searchParams.get("id");

	useEffect(() => {
		if (!session || !session?.user?.id) {
			router.push(Path.HOME);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		(async () => {
			setPost((await fetchPosts(`/api/posts/${postId}`))[0]);
		})();
	}, [postId]);

	useEffect(() => {
		if (post) {
			setPostImageFilename((post as PostTypeFromDb)?.image?.filename || null);
		}
	}, [post]);

	const clearSpecificError_useStateCb = (
		prevErrors: PostErrorsType,
		errorKey: keyof PostErrorsType
	) => {
		if (!prevErrors) {
			return null!;
		}

		// https://stackoverflow.com/q/63702057/6543935
		let prevErrorsCopy = { ...prevErrors } as Partial<PostErrorsType>;

		if (Object.keys(prevErrors)?.length === 0) {
			prevErrorsCopy = null!;
		} else if (Object.keys(prevErrors?.[errorKey])?.length > 0) {
			delete prevErrorsCopy[errorKey];
		}

		return prevErrorsCopy as PostErrorsType;
	};

	const handleChange_FileUpload = async (e: React.FormEvent<HTMLInputElement>) => {
		e.preventDefault();
		if (e.currentTarget.files?.length && e.currentTarget.files?.length > 0) {
			const promptFile: File = e.currentTarget.files[0];

			if (promptFile.size > 131072) {
				setPostImageFilename(promptFile.name);

				setErrors((prevErrors) => ({ ...prevErrors, image: { message: t("imageSizeError") } }));

				return;
			} else if (promptFile.size <= 131072) {
				setErrors((prevErrors) => clearSpecificError_useStateCb(prevErrors, "image"));
			}

			const formData = new FormData();

			formData.append("fileToUpload", promptFile);
			setFormDataToUpload(formData);
			setPostImageFilename(promptFile.name);
		}
	};

	const updatePost = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		setSubmitting(true);
		if (post.aiCategory === AiCategories.IMAGE && !formDataToUpload) {
			setErrors((prevErrors) => ({ ...prevErrors, image: { message: t("imageRequiredError") } }));
			setSubmitting(false);

			return;
		} else if (post.aiCategory === AiCategories.IMAGE && formDataToUpload) {
			setErrors((prevErrors) => clearSpecificError_useStateCb(prevErrors, "image"));
		}

		let image_id: string | null = null;

		if (formDataToUpload) {
			const postImageFnToUpload = slugify(String(postImageFilename), {
				lower: true,
				remove: /[*+~()'"!:@]/g,
				locale: "en",
			});
			const fileToRename = formDataToUpload.get("fileToUpload") as File;

			formDataToUpload.set("fileToUpload", fileToRename, postImageFnToUpload);
			const response = await fetch("/api/files", {
				method: "POST",
				body: formDataToUpload,
			});

			if (response.ok) {
				image_id = (await response.json())[0]._id;

				const old_id = (post as PostTypeFromDb)?.image?._id?.toString();

				if (image_id && old_id && image_id !== old_id) {
					const response = await fetch(`/api/files/${old_id}`, {
						method: "DELETE",
					});

					if (!response.ok) {
						console.error(response);
					}
				}
			}
		}

		try {
			const response = await fetch(`/api/posts/${postId}`, {
				method: "PUT",
				body: JSON.stringify({
					...post,
					tags: String(post.tags)
						.split(",")
						.map((tag) => tag.trim().toLowerCase())
						.filter((value, index, array) => array.indexOf(value) === index)
						.sort((a, b) => a.localeCompare(b)),
					image: image_id,
					creator: session?.user.id,
				}),
			});

			if (response.ok) {
				router.push(Path.HOME);
			} else {
				/**
				 * The error handling here should be a bit
				 * complex in order to apply the translations.
				 * At all it is better to make a complete
				 * check on the FE, before fetch the API.
				 */
				setErrors((await response.json()).errors);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Form
			errors={errors}
			handleChange_FileUpload={handleChange_FileUpload}
			handleSubmit={updatePost}
			post={post}
			postImageFilename={postImageFilename}
			setPost={setPost}
			submitting={submitting}
			type={FormTypes.EDIT}
		/>
	);
};

export default UpdatePost_Page;
