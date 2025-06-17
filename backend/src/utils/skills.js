const skills = [
    {
        id: 0,
        name: "Other",
        description: "",
        image: "https://res.cloudinary.com/vtubecloud/image/upload/v1750181963/pexels-anntarazevich-5598301_arihdy.jpg",
    },
    {
        id: 1,
        name: "Graphic Design",
        description: "Photoshop, Illustrator",
        image: "https://res.cloudinary.com/vtubecloud/image/upload/v1750180840/graphic-design_ltmh3b.jpg",
    },
    {
        id: 2,
        name: "Photography",
        description: "DSLR, Editing",
        image: "https://res.cloudinary.com/vtubecloud/image/upload/v1750181242/pexels-alex-andrews-271121-821749_lcqrha.jpg",
    },
    {
        id: 3,
        name: "Music",
        description: "Instruments, Vocal",
        image: "https://res.cloudinary.com/vtubecloud/image/upload/v1750181749/pexels-olly-3775132_hhwmdx.jpg",
    },
    {
        id: 4,
        name: "Web Development",
        description: "HTML, CSS, React",
        image: "https://res.cloudinary.com/vtubecloud/image/upload/v1750181411/pexels-pixabay-276452_fydyst.jpg",
    },
];

function getSkillsDocument() {
    return skills;
}

function normalize(str) {
    return str.toLowerCase().replace(/\s+/g, "").trim();
}

function mapSkill(input) {
    const normalizedInput = normalize(input);

    for (let i = 0; i < skills.length; i++) {
        if (normalize(skills[i].name).includes(normalizedInput)) {
            return i;
        }
    }

    return 0; 
}

const mapSkillArray = (arr) => [
    ...new Set(arr.map(mapSkill).filter((id) => id !== -1)),
];

const getSkillFromId = (id) => {
    if (id < 0 || id >= skills.length) {
        return { ...skills[0] }; // Return "Other" if out of bounds
    }
    return { ...skills[id] };
}

function expandUserSkills(user) {
  const mapIdsToSkills = (ids = []) => {
    return ids
      .filter(id => id >= 0 && id < skills.length)
      .map(id => ({
        id,
        ...skills[id]
      }));
  };
  
  const plainUser = typeof user.toObject === "function" ? user.toObject() : user;

  return {
    ...plainUser,
    knownSkills: mapIdsToSkills(user.knownSkills),
    interestedSkills: mapIdsToSkills(user.interestedSkills),
  };
}

function expandPostSkill(post) {
  // const mapIdsToSkills = (ids = []) => {
  //   return ids
  //     .filter(id => id >= 0 && id < skills.length)
  //     .map(id => ({
  //       id,
  //       ...skills[id]
  //     }));
  // };

  const plainPost = typeof post.toObject === "function" ? post.toObject() : post;

  return {
    ...plainPost,
    skillShowcasing: post.skillShowcasing > 0 ? skills[post.skillShowcasing] : skills[0],
  };
}

export { 
  getSkillsDocument, 
  mapSkill, 
  mapSkillArray,
  expandUserSkills,
  expandPostSkill,
  getSkillFromId
};
