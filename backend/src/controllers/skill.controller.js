import { getSkillsDocument } from "../utils/skills.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const getExploreSkills = asyncHandler(async (req, res) => {
    const skills = getSkillsDocument();
    
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "User not authenticated");
    }

    const resSkills = skills.map(skill => {
        return {
            ...skill,
            isFollowed: user.interestedSkills.includes(skill.id)
        };
    });

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        resSkills,
        "Skills fetched successfully"
    ));
});

export {
    getExploreSkills
}