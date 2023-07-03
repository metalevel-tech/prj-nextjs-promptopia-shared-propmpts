import React from "react";

interface Props {
	titleBlack?: string;
	titleGradient?: string;
	desc?: string;
	gradient?: "orange_gradient" | "blue_gradient";
	textStyle?: "text-left" | "text-center" | "text-right";
}

const Header: React.FC<Props> = ({
	titleBlack,
	titleGradient,
	desc,
	gradient = "orange_gradient",
	textStyle = "text-center",
}) => {
	return (
		<header className={textStyle}>
			<h1 className="head_text">
				{titleBlack && titleBlack}
				{titleGradient && (
					<>
						{titleBlack && (
							<>
								<br /*className="max-md:hidden"*/ />{" "}
							</>
						)}
						<span className={gradient}>{titleGradient}</span>
					</>
				)}
			</h1>
			{desc && <p className="desc max-w-md">{desc}</p>}
		</header>
	);
};

export default Header;