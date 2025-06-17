const skills = [
    {
        id: 0,
        name: "Other",
        description: "",
        image: "/images/other.png",
    },
    {
        id: 1,
        name: "Graphic Design",
        description: "Photoshop, Illustrator",
        image: "/images/graphic.png",
    },
    {
        id: 2,
        name: "Photography",
        description: "DSLR, Editing",
        image: "/images/photo.png",
    },
    {
        id: 3,
        name: "Music",
        description: "Instruments, Vocal",
        image: "/images/music.png",
    },
    {
        id: 4,
        name: "Web Development",
        description: "HTML, CSS, React",
        image: "/images/web.png",
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
