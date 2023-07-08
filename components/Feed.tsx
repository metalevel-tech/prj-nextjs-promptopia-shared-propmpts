//Ref.:https://youtu.be/wm5gMKuwSYk?t=8082
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

import { usePromptopiaContext } from "@/contexts/PromptopiaContext";

import { AiCategories } from "@/interfaces/Post";

import PostCardList from "./PostCardList";

import CheckList, { ListItemType } from "./fragments/CheckList";
import PostCardListLoading from "./PostCardListLoading";

const Feed: React.FC = () => {
	const t = useTranslations("Feed");
	const tCommon = useTranslations("Common");
	const { posts } = usePromptopiaContext();
	const [searchText, setSearchText] = useState("");
	const [aiCategories, setAiCategories] = useState<ListItemType[]>(
		Object.values(AiCategories).map((aiCategory) => ({
			label: tCommon(`aiCats.${aiCategory}`),
			checked: true,
			value: aiCategory,
		}))
	);

	// const [data, setData] = useState(posts);
	// useEffect(() => {
	// 	(async () => {
	// 		await new Promise((resolve) => setTimeout(resolve, 300000));
	// 		setData(posts);
	// 	})();
	// }, [posts]);

	return (
		<section className="feed">
			<form className="relative w-full flex justify-center items-center">
				<input
					required
					className="form_input search_input"
					placeholder={t("searchForPlaceholder")}
					type="text"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
			</form>
			<div className="text-mlt-dark-6 font-base w-full pl-0.5">
				<CheckList
					handleAssign={setAiCategories}
					icon={{ size: 22, color: "mlt-orange-secondary" }}
					items={aiCategories}
					type="atLeastOneSelected"
				/>
			</div>

			{posts.length === 0 ? <PostCardListLoading /> : <PostCardList data={posts} />}
		</section>
	);
};

export default Feed;
